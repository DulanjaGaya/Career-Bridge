import { Router } from "express";
import { randomUUID } from "crypto";
import { z } from "zod";
import { prisma } from "../db.js";

const router = Router();

const backendBaseUrl = (process.env.READINESS_BACKEND_URL ?? "http://127.0.0.1:5000").replace(/\/$/, "");

type MongoUserRecord = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

function toReadinessUser(mongoUser: MongoUserRecord) {
  return {
    id: mongoUser.id,
    email: mongoUser.email.toLowerCase(),
    name: mongoUser.name.trim(),
    createdAt: mongoUser.createdAt,
  };
}

async function fetchMongoUserByEmail(email: string): Promise<MongoUserRecord | null> {
  try {
    const response = await fetch(`${backendBaseUrl}/api/readiness/users/me?email=${encodeURIComponent(email)}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as MongoUserRecord;
  } catch {
    return null;
  }
}

async function syncPrismaUserFromMongo(mongoUser: MongoUserRecord) {
  const fallback = toReadinessUser(mongoUser);

  try {
    const existing = await prisma.user.findUnique({ where: { email: fallback.email } });

    if (existing) {
      if (existing.name !== fallback.name) {
        return await prisma.user.update({ where: { email: fallback.email }, data: { name: fallback.name } });
      }

      return existing;
    }

    return await prisma.user.create({
      data: {
        id: fallback.id,
        email: fallback.email,
        name: fallback.name,
      },
    });
  } catch {
    return fallback;
  }
}

router.post("/", async (req, res) => {
  try {
    const parsed = z
      .object({
        email: z.string().email(),
        name: z.string().min(1).max(120),
      })
      .safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const mongoUser = await fetchMongoUserByEmail(parsed.data.email);
    if (mongoUser) {
      return res.status(201).json(await syncPrismaUserFromMongo(mongoUser));
    }

    try {
      const user = await prisma.user.upsert({
        where: { email: parsed.data.email },
        update: { name: parsed.data.name },
        create: parsed.data,
      });

      res.status(201).json(user);
      return;
    } catch {
      res.status(201).json({
        id: randomUUID(),
        email: parsed.data.email.toLowerCase(),
        name: parsed.data.name.trim(),
        createdAt: new Date().toISOString(),
      });
      return;
    }
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to create user" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const email = z.string().email().safeParse(req.query.email);
    if (!email.success) return res.status(400).json({ error: "email query required" });

    const mongoUser = await fetchMongoUserByEmail(email.data);
    if (mongoUser) {
      return res.json(await syncPrismaUserFromMongo(mongoUser));
    }

    try {
      const existing = await prisma.user.findUnique({ where: { email: email.data } });
      if (existing) {
        return res.json(existing);
      }
    } catch {
      // Prisma is best-effort here; a missing SQLite table should not crash the API.
    }

    return res.status(404).json({ error: "Not found" });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Failed to resolve user" });
  }
});

export default router;
