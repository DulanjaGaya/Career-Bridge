import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

router.post("/demo-user", async (_req, res) => {
  const email = "demo.student@university.edu";
  const user = await prisma.user.upsert({
    where: { email },
    update: { name: "Alex Student" },
    create: { email, name: "Alex Student" },
  });
  res.json({ userId: user.id });
});

export default router;
