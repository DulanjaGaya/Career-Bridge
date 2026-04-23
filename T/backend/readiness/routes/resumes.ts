import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";

const router = Router();

const contentSchema = z.object({
  fullName: z.string().min(1),
  headline: z.string().optional(),
  summary: z.string().optional(),
  contact: z
    .object({
      email: z.string().email().optional().or(z.literal("")),
      phone: z
        .string()
        .optional()
        .refine((v) => v === undefined || v === "" || /^\d+$/.test(v), {
          message: "Phone must contain only numbers",
        }),
      location: z.string().optional(),
      linkedin: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
  education: z
    .array(
      z.object({
        school: z.string().min(1),
        degree: z.string().min(1),
        field: z.string().optional(),
        start: z.string().optional(),
        end: z.string().optional(),
        details: z.string().optional(),
      })
    )
    .optional(),
  skills: z.array(z.string()).optional(),
  projects: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        tech: z.string().optional(),
        link: z.string().url().optional().or(z.literal("")),
      })
    )
    .optional(),
  experience: z
    .array(
      z.object({
        role: z.string().min(1),
        company: z.string().min(1),
        start: z.string().optional(),
        end: z.string().optional(),
        bullets: z.array(z.string()).optional(),
      })
    )
    .optional(),
});

const createBody = z.object({
  userId: z.string().min(1),
  title: z.string().min(1).max(120),
  content: contentSchema,
});

router.get("/", async (req, res) => {
  const userId = z.string().min(1).safeParse(req.query.userId);
  if (!userId.success) return res.status(400).json({ error: "userId required" });
  const list = await prisma.resume.findMany({
    where: { userId: userId.data },
    orderBy: { updatedAt: "desc" },
  });
  res.json(list);
});

router.get("/:id", async (req, res) => {
  const r = await prisma.resume.findUnique({ where: { id: req.params.id } });
  if (!r) return res.status(404).json({ error: "Not found" });
  res.json(r);
});

router.post("/", async (req, res) => {
  const parsed = createBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { userId, title, content } = parsed.data;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const count = await prisma.resume.count({ where: { userId } });
  const resume = await prisma.resume.create({
    data: {
      userId,
      title,
      contentJson: JSON.stringify(content),
      version: count + 1,
    },
  });
  res.status(201).json(resume);
});

router.put("/:id", async (req, res) => {
  const parsed = z
    .object({
      title: z.string().min(1).max(120).optional(),
      content: contentSchema.optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await prisma.resume.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Not found" });

  const nextContent =
    parsed.data.content !== undefined
      ? JSON.stringify(parsed.data.content)
      : existing.contentJson;

  const updated = await prisma.resume.update({
    where: { id: req.params.id },
    data: {
      title: parsed.data.title ?? existing.title,
      contentJson: nextContent,
      version: existing.version + 1,
    },
  });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.resume.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Not found" });
  }
});

export default router;
