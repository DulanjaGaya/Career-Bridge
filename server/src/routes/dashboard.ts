import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { computeReadinessScore } from "../readiness.js";
import {
  emitNotificationToUser,
  emitNotificationsAllRead,
  emitTaskUpdateToUser,
} from "../socketHub.js";

const router = Router();
const MILSTONE_CATEGORIES = ["RESUME", "INTERNSHIP", "INTERVIEW", "GENERAL"] as const;
const NOTIFICATION_KINDS = ["REMINDER", "DEADLINE", "SYSTEM", "MILESTONE"] as const;

type MilestoneCategory = (typeof MILSTONE_CATEGORIES)[number];
type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

const taskBody = z.object({
  userId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(MILSTONE_CATEGORIES).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  completed: z.boolean().optional(),
});

router.get("/tasks", async (req, res) => {
  const userId = z.string().min(1).safeParse(req.query.userId);
  if (!userId.success) return res.status(400).json({ error: "userId required" });
  const tasks = await prisma.task.findMany({
    where: { userId: userId.data },
    orderBy: [{ completed: "asc" }, { dueDate: "asc" }],
  });
  res.json(tasks);
});

router.post("/tasks", async (req, res) => {
  const parsed = taskBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { userId, title, description, category, dueDate, completed } = parsed.data;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const task = await prisma.task.create({
    data: {
      userId,
      title,
      description: description ?? null,
      category: category ?? "GENERAL",
      dueDate: dueDate ? new Date(dueDate) : null,
      completed: completed ?? false,
    },
  });
  emitTaskUpdateToUser(userId, task);

  if (dueDate) {
    const d = new Date(dueDate);
    if (d > new Date()) {
      const n = await prisma.notification.create({
        data: {
          userId,
          message: `Task added: "${title}" — due ${d.toLocaleDateString(undefined, { dateStyle: "medium" })}.`,
          kind: "MILESTONE",
        },
      });
      emitNotificationToUser(userId, n);
    }
  }

  res.status(201).json(task);
});

router.patch("/tasks/:id", async (req, res) => {
  const patch = z
    .object({
      title: z.string().min(1).max(200).optional(),
      description: z.string().max(2000).optional().nullable(),
      category: z.enum(MILSTONE_CATEGORIES).optional(),
      dueDate: z.string().datetime().optional().nullable(),
      completed: z.boolean().optional(),
    })
    .safeParse(req.body);
  if (!patch.success) return res.status(400).json({ error: patch.error.flatten() });

  try {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...patch.data,
        dueDate:
          patch.data.dueDate === undefined
            ? undefined
            : patch.data.dueDate
              ? new Date(patch.data.dueDate)
              : null,
      },
    });
    emitTaskUpdateToUser(task.userId, task);
    res.json(task);
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

router.delete("/tasks/:id", async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

router.get("/readiness", async (req, res) => {
  const userId = z.string().min(1).safeParse(req.query.userId);
  if (!userId.success) return res.status(400).json({ error: "userId required" });
  const tasks = await prisma.task.findMany({ where: { userId: userId.data } });
  const { score, breakdown } = computeReadinessScore(tasks);
  res.json({ score, breakdown, taskCount: tasks.length });
});

router.get("/notifications", async (req, res) => {
  const userId = z.string().min(1).safeParse(req.query.userId);
  if (!userId.success) return res.status(400).json({ error: "userId required" });
  const list = await prisma.notification.findMany({
    where: { userId: userId.data },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json(list);
});

router.patch("/notifications/read-all", async (req, res) => {
  const userId = z.string().min(1).safeParse(req.query.userId);
  if (!userId.success) return res.status(400).json({ error: "userId required" });
  const result = await prisma.notification.updateMany({
    where: { userId: userId.data, read: false },
    data: { read: true },
  });
  emitNotificationsAllRead(userId.data);
  res.json({ count: result.count });
});

router.post("/notifications", async (req, res) => {
  const parsed = z
    .object({
      userId: z.string().min(1),
      message: z.string().min(1).max(2000),
      kind: z.enum(NOTIFICATION_KINDS).optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!user) return res.status(404).json({ error: "User not found" });
  const n = await prisma.notification.create({
    data: {
      userId: parsed.data.userId,
      message: parsed.data.message.trim(),
      kind: parsed.data.kind ?? "REMINDER",
    },
  });
  emitNotificationToUser(parsed.data.userId, n);
  res.status(201).json(n);
});

router.patch("/notifications/:id/read", async (req, res) => {
  try {
    const n = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    emitNotificationToUser(n.userId, n);
    res.json(n);
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

export default router;
