const base = "";

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type MilestoneCategory = "RESUME" | "INTERNSHIP" | "INTERVIEW" | "GENERAL";

export interface ResumeRecord {
  id: string;
  userId: string;
  title: string;
  contentJson: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRecord {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: MilestoneCategory;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NotificationKind = "REMINDER" | "DEADLINE" | "SYSTEM" | "MILESTONE";

export interface NotificationRecord {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  kind: NotificationKind;
  createdAt: string;
}

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export const api = {
  health: () => json<{ ok: boolean }>("/api/health"),
  ensureUser: (email: string, name: string) =>
    json<UserRecord>("/api/users", { method: "POST", body: JSON.stringify({ email, name }) }),
  getUserByEmail: (email: string) =>
    json<UserRecord>(`/api/users/me?email=${encodeURIComponent(email)}`),
  seedDemoUser: () => json<{ userId: string }>("/api/seed/demo-user", { method: "POST" }),
  listResumes: (userId: string) =>
    json<ResumeRecord[]>(`/api/resumes?userId=${encodeURIComponent(userId)}`),
  getResume: (id: string) => json<ResumeRecord>(`/api/resumes/${id}`),
  saveResume: (body: { userId: string; title: string; content: unknown }) =>
    json<ResumeRecord>("/api/resumes", { method: "POST", body: JSON.stringify(body) }),
  updateResume: (id: string, body: { title?: string; content?: unknown }) =>
    json<ResumeRecord>(`/api/resumes/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  listTasks: (userId: string) =>
    json<TaskRecord[]>(`/api/dashboard/tasks?userId=${encodeURIComponent(userId)}`),
  createTask: (body: {
    userId: string;
    title: string;
    description?: string;
    category?: MilestoneCategory;
    dueDate?: string | null;
    completed?: boolean;
  }) => json<TaskRecord>("/api/dashboard/tasks", { method: "POST", body: JSON.stringify(body) }),
  patchTask: (
    id: string,
    body: Partial<{
      title: string;
      description: string | null;
      category: MilestoneCategory;
      dueDate: string | null;
      completed: boolean;
    }>
  ) => json<TaskRecord>(`/api/dashboard/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  readiness: (userId: string) =>
    json<{
      score: number;
      breakdown: { category: string; completed: number; total: number; contribution: number }[];
      taskCount: number;
    }>(`/api/dashboard/readiness?userId=${encodeURIComponent(userId)}`),
  notifications: (userId: string) =>
    json<NotificationRecord[]>(
      `/api/dashboard/notifications?userId=${encodeURIComponent(userId)}`
    ),
  markNotificationRead: (id: string) =>
    json<NotificationRecord>(`/api/dashboard/notifications/${id}/read`, { method: "PATCH" }),
  markAllNotificationsRead: (userId: string) =>
    json<{ count: number }>(
      `/api/dashboard/notifications/read-all?userId=${encodeURIComponent(userId)}`,
      { method: "PATCH" }
    ),
  createNotification: (body: { userId: string; message: string; kind?: NotificationKind }) =>
    json<NotificationRecord>("/api/dashboard/notifications", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  suggestAchievement: (text: string) =>
    json<{ suggestion: string; model: string }>("/api/suggestions/achievement", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
  suggestProfessionalSummary: (text: string) =>
    json<{ suggestion: string; model: string }>("/api/suggestions/summary", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
};
