import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import http from "http";
import cron from "node-cron";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { Server as SocketIOServer } from "socket.io";
import { prisma } from "./db.js";
import { setSocketIO } from "./socketHub.js";
import dashboardRoutes from "./routes/dashboard.js";
import resumesRoutes from "./routes/resumes.js";
import seedRoutes from "./routes/seed.js";
import suggestionsRoutes from "./routes/suggestions.js";
import usersRoutes from "./routes/users.js";

dotenv.config();

const backendEnvPath = path.resolve(process.cwd(), "../backend/.env");
if (existsSync(backendEnvPath)) {
  const backendEnv = dotenv.parse(readFileSync(backendEnvPath));
  if (!process.env.MONGODB_URI && backendEnv.MONGODB_URI) {
    process.env.MONGODB_URI = backendEnv.MONGODB_URI;
  }
  if (!process.env.CLIENT_ORIGIN && backendEnv.CLIENT_ORIGIN) {
    process.env.CLIENT_ORIGIN = backendEnv.CLIENT_ORIGIN;
  }
  if (!process.env.CLIENT_ORIGINS && backendEnv.CLIENT_ORIGINS) {
    process.env.CLIENT_ORIGINS = backendEnv.CLIENT_ORIGINS;
  }
}

process.env.PORT = process.env.PORT ?? "4000";

const configuredOrigins = (process.env.CLIENT_ORIGINS ?? process.env.CLIENT_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin: string | undefined) => {
  if (!origin) return true;
  if (configuredOrigins.includes(origin)) return true;

  try {
    const url = new URL(origin);
    return (url.hostname === "localhost" || url.hostname === "127.0.0.1") && url.protocol === "http:";
  } catch {
    return false;
  }
};

const corsOrigin = (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
  if (isAllowedOrigin(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`CORS origin not allowed: ${origin ?? "<missing>"}`));
};

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: corsOrigin, methods: ["GET", "POST"] },
});
setSocketIO(io);

app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: "2mb" }));

/** Root URL — API has no HTML app; use the React dev server on port 5173 for the UI */
app.get("/", (_req, res) => {
  res.type("html").send(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><title>Career readiness API</title>
<style>body{font-family:system-ui,sans-serif;max-width:40rem;margin:2rem;line-height:1.5;color:#1d2951}
a{color:#1d4ed8}</style></head>
<body>
<h1>API is running</h1>
<p>This is the <strong>backend</strong> (Express). The website runs separately.</p>
<ul>
<li><a href="/api/health">Open <code>/api/health</code></a> (JSON status)</li>
<li>Open the app in your browser: <a href="http://localhost:5173">http://localhost:5173</a> (start with <code>npm run dev</code> in the project root)</li>
</ul>
</body></html>`);
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "career-readiness-api" });
});

app.use("/api/users", usersRoutes);
app.use("/api/resumes", resumesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/suggestions", suggestionsRoutes);
app.use("/api/seed", seedRoutes);

io.on("connection", (socket) => {
  socket.on("join", (userId: string) => {
    if (typeof userId === "string" && userId.length > 0) {
      socket.join(`user:${userId}`);
    }
  });
});

export { io };

/** Reminder cron: every day at 09:00 — scan due tasks and notify */
cron.schedule("0 9 * * *", async () => {
  const now = new Date();
  const horizon = new Date(now.getTime() + 48 * 3600000);
  const dueSoon = await prisma.task.findMany({
    where: {
      completed: false,
      dueDate: { gte: now, lte: horizon },
    },
  });
  for (const t of dueSoon) {
    const msg = `Reminder: "${t.title}" is due soon.`;
    const n = await prisma.notification.create({
      data: { userId: t.userId, message: msg, kind: "REMINDER" },
    });
    io.to(`user:${t.userId}`).emit("notification", n);
  }
});

/** Demo-friendly: lightweight check every 5 minutes for overdue tasks */
cron.schedule("*/5 * * * *", async () => {
  const now = new Date();
  const overdue = await prisma.task.findMany({
    where: { completed: false, dueDate: { lt: now } },
  });
  for (const t of overdue) {
    const recent = await prisma.notification.findFirst({
      where: {
        userId: t.userId,
        message: { contains: t.title },
        createdAt: { gte: new Date(now.getTime() - 24 * 3600000) },
      },
    });
    if (recent) continue;
    const n = await prisma.notification.create({
      data: {
        userId: t.userId,
        message: `Overdue task: "${t.title}". Consider rescheduling.`,
        kind: "DEADLINE",
      },
    });
    io.to(`user:${t.userId}`).emit("notification", n);
  }
});

const port = Number(process.env.PORT) || 4000;
server.listen(port, () => {
  console.log(`API + WebSocket listening on http://localhost:${port}`);
});
