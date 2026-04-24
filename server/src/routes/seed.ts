import { Router } from "express";
import { randomUUID } from "crypto";
import { prisma } from "../db.js";

const router = Router();

router.post("/demo-user", async (_req, res) => {
  const email = "demo.student@university.edu";

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: "Alex Student" },
      create: { email, name: "Alex Student" },
    });
    res.json({ userId: user.id });
  } catch {
    res.json({ userId: randomUUID() });
  }
});

export default router;
