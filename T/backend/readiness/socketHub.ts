import type { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export function setSocketIO(instance: SocketIOServer) {
  io = instance;
}

export function emitNotificationToUser(userId: string, payload: unknown) {
  io?.to(`user:${userId}`).emit("notification", payload);
}

export function emitTaskUpdateToUser(userId: string, task: unknown) {
  io?.to(`user:${userId}`).emit("task", task);
}

export function emitNotificationsAllRead(userId: string) {
  io?.to(`user:${userId}`).emit("notificationsAllRead", { userId });
}
