import { NotificationKind } from "@prisma/client";
import type { Express } from "express";
import cron from "node-cron";
import type { Server as SocketIOServer } from "socket.io";
import { prisma } from "./db.js";
import { setSocketIO } from "./socketHub.js";
import dashboardRoutes from "./routes/dashboard.js";
import resumesRoutes from "./routes/resumes.js";
import seedRoutes from "./routes/seed.js";
import suggestionsRoutes from "./routes/suggestions.js";
import usersRoutes from "./routes/users.js";

/**
 * Registers Prisma-backed readiness routes and Socket.IO handlers on the shared Express app.
 */
export function mountReadiness(app: Express, io: SocketIOServer) {
  setSocketIO(io);

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
}

/** Cron jobs that emit over Socket.IO (call after server.listen). */
export function startReadinessCrons(io: SocketIOServer) {
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
        data: { userId: t.userId, message: msg, kind: NotificationKind.REMINDER },
      });
      io.to(`user:${t.userId}`).emit("notification", n);
    }
  });

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
          kind: NotificationKind.DEADLINE,
        },
      });
      io.to(`user:${t.userId}`).emit("notification", n);
    }
  });
}
