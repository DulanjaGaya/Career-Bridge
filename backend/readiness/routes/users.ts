import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";

const router = Router();

router.post("/", async (req, res) => {
  const parsed = z
    .object({
      email: z.string().email(),
      name: z.string().min(1).max(120),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const user = await prisma.user.upsert({
    where: { email: parsed.data.email },
    update: { name: parsed.data.name },
    create: parsed.data,
  });
  res.status(201).json(user);
});

router.get("/me", async (req, res) => {
  const email = z.string().email().safeParse(req.query.email);
  if (!email.success) return res.status(400).json({ error: "email query required" });
  const user = await prisma.user.findUnique({ where: { email: email.data } });
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

export default router;
