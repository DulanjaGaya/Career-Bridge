import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Bar, Doughnut } from "react-chartjs-2";
import { io } from "socket.io-client";
import { z } from "zod";
import {
  api,
  type MilestoneCategory,
  type NotificationKind,
  type NotificationRecord,
  type TaskRecord,
} from "../api";
import {
  getNotificationPermission,
  notificationsSupported,
  requestNotificationPermission,
  showDesktopNotification,
} from "../utils/desktopNotify";
import { formatRelativeTime } from "../utils/relativeTime";

const kindMeta: Record<NotificationKind, { label: string; icon: string }> = {
  REMINDER: { label: "Reminder", icon: "🔔" },
  DEADLINE: { label: "Deadline", icon: "⏰" },
  SYSTEM: { label: "System", icon: "✨" },
  MILESTONE: { label: "Task", icon: "🎯" },
};

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const taskFormSchema = z.object({
  title: z.string().min(3, "Title should be at least 3 characters"),
  description: z.string().max(2000).optional(),
  category: z.enum(["RESUME", "INTERNSHIP", "INTERVIEW", "GENERAL"]),
  dueDate: z.string().optional(),
});

type TaskForm = z.infer<typeof taskFormSchema>;

type ReadinessBreakdown = {
  category: string;
  completed: number;
  total: number;
  contribution: number;
};

type Props = { userId: string | null; bootstrapping?: boolean };

const categoryLabel: Record<MilestoneCategory, string> = {
  RESUME: "Résumé",
  INTERNSHIP: "Internship",
  INTERVIEW: "Interview",
  GENERAL: "General",
};

export default function DashboardPage({ userId, bootstrapping }: Props) {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [readiness, setReadiness] = useState<{
    score: number;
    breakdown: ReadinessBreakdown[];
  } | null>(null);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [notifyFilter, setNotifyFilter] = useState<"all" | "unread">("all");
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<"all" | MilestoneCategory>("all");
  const [notifyDraftMessage, setNotifyDraftMessage] = useState("");
  const [notifySaving, setNotifySaving] = useState(false);
  const [alertPermission, setAlertPermission] = useState<NotificationPermission | "unsupported">("default");
  const [status, setStatus] = useState<string | null>(null);

  const form = useForm<TaskForm>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: { title: "", description: "", category: "GENERAL", dueDate: "" },
  });

  const refresh = async () => {
    if (!userId) return;
    const [t, r, n] = await Promise.all([
      api.listTasks(userId),
      api.readiness(userId),
      api.notifications(userId),
    ]);
    setTasks(t);
    setReadiness(r);
    setNotifications(n.map((x) => ({ ...x, kind: x.kind ?? "REMINDER" })));
  };

  useEffect(() => {
    if (!userId) return;
    void refresh().catch(() => setStatus("Could not load dashboard data."));
  }, [userId]);

  useEffect(() => {
    setAlertPermission(getNotificationPermission());
  }, []);

  useEffect(() => {
    if (!userId) return;
    const url = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000";
    const s = io(url, { transports: ["websocket", "polling"] });
    s.emit("join", userId);
    s.on("notification", (raw: NotificationRecord) => {
      const n: NotificationRecord = {
        ...raw,
        kind: raw.kind ?? "REMINDER",
      };
      const kind = (n.kind ?? "REMINDER") as NotificationKind;
      const meta = kindMeta[kind] ?? kindMeta.REMINDER;
      showDesktopNotification(`Career dashboard · ${meta.label}`, n.message, { tag: n.id });
      setNotifications((prev: NotificationRecord[]) => {
        const i = prev.findIndex((p) => p.id === n.id);
        if (i >= 0) {
          const next = [...prev];
          next[i] = n;
          return next;
        }
        return [n, ...prev].slice(0, 50);
      });
    });
    s.on("notificationsAllRead", () => {
      setNotifications((prev) => prev.map((x) => ({ ...x, read: true })));
    });
    s.on("task", (task: TaskRecord) => {
      setTasks((prev) => {
        const i = prev.findIndex((t) => t.id === task.id);
        if (i >= 0) {
          const next = [...prev];
          next[i] = task;
          return next;
        }
        return [task, ...prev];
      });
      void api.readiness(userId).then(setReadiness).catch(() => undefined);
    });
    return () => {
      s.disconnect();
    };
  }, [userId]);

  const doughnutData = useMemo(() => {
    const breakdown = readiness?.breakdown ?? [];
    const labels = breakdown.map(
      (b: ReadinessBreakdown) => categoryLabel[b.category as MilestoneCategory] ?? b.category
    );
    const data = breakdown.map((b: ReadinessBreakdown) =>
      b.total === 0 ? 0 : Math.round((b.completed / b.total) * 100)
    );
    return {
      labels,
      datasets: [
        {
          label: "Completion %",
          data,
          backgroundColor: ["#f48c24", "#38bdf8", "#a78bfa", "#64748b"],
          borderWidth: 0,
        },
      ],
    };
  }, [readiness]);

  const barData = useMemo(() => {
    const breakdown = readiness?.breakdown ?? [];
    return {
      labels: breakdown.map(
        (b: ReadinessBreakdown) => categoryLabel[b.category as MilestoneCategory] ?? b.category
      ),
      datasets: [
        {
          label: "Weighted contribution",
          data: breakdown.map((b: ReadinessBreakdown) => Math.round(b.contribution * 10) / 10),
          backgroundColor: "#f48c24",
          hoverBackgroundColor: "#fb923c",
        },
      ],
    };
  }, [readiness]);

  const chartTick = "#94a3b8";
  const chartGrid = "rgba(148, 163, 184, 0.12)";

  const doughnutOptions = useMemo(
    () => ({
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: { color: chartTick, padding: 14, font: { size: 12 } },
        },
      },
    }),
    []
  );

  const barOptions = useMemo(
    () => ({
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: chartTick }, grid: { color: chartGrid } },
        y: {
          beginAtZero: true,
          ticks: { color: chartTick },
          grid: { color: chartGrid },
        },
      },
    }),
    []
  );

  const milestones = useMemo(() => {
    const cats: MilestoneCategory[] = ["RESUME", "INTERNSHIP", "INTERVIEW", "GENERAL"];
    return cats.map((c) => {
      const subset = tasks.filter((t: TaskRecord) => t.category === c);
      const done = subset.filter((t: TaskRecord) => t.completed).length;
      const total = subset.length;
      const pct = total === 0 ? 0 : Math.round((done / total) * 100);
      return { c, done, total, pct };
    });
  }, [tasks]);

  const toggleTask = async (task: TaskRecord) => {
    const next = await api.patchTask(task.id, { completed: !task.completed });
    setTasks((prev: TaskRecord[]) => prev.map((t: TaskRecord) => (t.id === next.id ? next : t)));
    if (userId) {
      const r = await api.readiness(userId);
      setReadiness(r);
    }
  };

  const onCreate = form.handleSubmit(async (data: TaskForm) => {
    if (!userId) return;
    setStatus(null);
    try {
      await api.createTask({
        userId,
        title: data.title,
        description: data.description || undefined,
        category: data.category,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      });
      form.reset({ title: "", description: "", category: "GENERAL", dueDate: "" });
      await refresh();
      setStatus("Task added.");
    } catch {
      setStatus("Could not create task.");
    }
  });

  const dismissNotification = async (n: NotificationRecord) => {
    const updated = await api.markNotificationRead(n.id);
    setNotifications((prev: NotificationRecord[]) =>
      prev.map((x: NotificationRecord) => (x.id === updated.id ? { ...updated, kind: updated.kind ?? x.kind } : x))
    );
  };

  const markAllNotificationsRead = async () => {
    if (!userId) return;
    try {
      await api.markAllNotificationsRead(userId);
      setNotifications((prev) => prev.map((x) => ({ ...x, read: true })));
    } catch {
      setStatus("Could not mark all as read.");
    }
  };

  const addOwnNotification = async () => {
    if (!userId) return;
    const msg = notifyDraftMessage.trim();
    if (!msg) return;
    setNotifySaving(true);
    setStatus(null);
    try {
      const n = await api.createNotification({ userId, message: msg, kind: "REMINDER" });
      setNotifications((prev) => {
        const i = prev.findIndex((p) => p.id === n.id);
        const row = { ...n, kind: n.kind ?? "REMINDER" };
        if (i >= 0) {
          const next = [...prev];
          next[i] = row;
          return next;
        }
        return [row, ...prev].slice(0, 50);
      });
      setNotifyDraftMessage("");
      setStatus("Notification added.");
    } catch {
      setStatus("Could not add notification.");
    } finally {
      setNotifySaving(false);
    }
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (notifyFilter === "unread") return notifications.filter((n) => !n.read);
    return notifications;
  }, [notifications, notifyFilter]);

  const pendingTasks = useMemo(() => tasks.filter((t: TaskRecord) => !t.completed), [tasks]);
  const taskCategoryValue = form.watch("category");

  const filteredTasks = useMemo(() => {
    if (taskCategoryFilter === "all") return tasks;
    return tasks.filter((t) => t.category === taskCategoryFilter);
  }, [tasks, taskCategoryFilter]);

  if (bootstrapping) {
    return (
      <div className="page-shell">
        <div className="card narrow">
          <h1>Dashboard</h1>
          <p className="muted">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="page-shell">
        <div className="card narrow">
          <h1>Dashboard</h1>
          <p className="muted">Could not start a session — check that the API is running.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="dashboard">
      <div className="card dashboard-header">
        <div>
          <h1>Career readiness dashboard</h1>
          <p className="muted small">Live score, milestones, and reminders.</p>
        </div>
        <div className="score-pill" title="Weighted readiness score">
          <span className="score-label">Readiness score</span>
          <span className="score-value">{readiness?.score ?? "—"}</span>
        </div>
      </div>

      {status && <div className="banner ok">{status}</div>}

      <div className="grid-2">
        <div className="card">
          <div className="section-head">
            <h2>Progress mix</h2>
            <button type="button" className="btn tiny secondary" onClick={() => void refresh()}>
              Refresh
            </button>
          </div>
          <div className="chart-wrap">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
        <div className="card">
          <h2>Contribution by area</h2>
          <div className="chart-wrap">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      <section className="card">
        <div className="section-head">
          <h2>Milestone cards</h2>
        </div>
        <div className="milestone-grid">
          {milestones.map((m) => (
            <article key={m.c} className="milestone">
              <div className="milestone-top">
                <h3>{categoryLabel[m.c]}</h3>
                <span className="muted small">
                  {m.done}/{m.total} done
                </span>
              </div>
              <div className="progress-track" role="progressbar" aria-valuenow={m.pct} aria-valuemin={0} aria-valuemax={100}>
                <div className="progress-fill" style={{ width: `${m.pct}%` }} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card work-hub">
        <div className="work-hub-header">
          <div>
            <h2 className="work-hub-title">Tasks &amp; alerts</h2>
            <p className="muted small work-hub-lead">
              Add tasks on the left. Notes and alerts appear in the inbox. Enable desktop alerts to get real-time
              notifications on your device when new items arrive (even if this tab is in the background).
            </p>
          </div>
          <div className="work-hub-header-actions">
            {unreadCount > 0 && (
              <>
                <span className="notify-badge" aria-label={`${unreadCount} unread`}>
                  {unreadCount}
                </span>
                <button type="button" className="btn tiny ghost" onClick={() => void markAllNotificationsRead()}>
                  Mark all read
                </button>
              </>
            )}
          </div>
        </div>

        {notificationsSupported() && alertPermission === "default" && (
          <div className="alert-enable-banner">
            <p>
              <strong>Get alerts on your device</strong> — allow notifications so new inbox items pop up while you work
              elsewhere.
            </p>
            <button
              type="button"
              className="btn secondary"
              onClick={() =>
                void requestNotificationPermission().then((p) => {
                  setAlertPermission(p);
                  if (p === "granted") setStatus("Desktop alerts enabled.");
                  else if (p === "denied") setStatus("Notifications blocked — you can change this in your browser settings.");
                })
              }
            >
              Enable alerts
            </button>
          </div>
        )}

        {notificationsSupported() && alertPermission === "denied" && (
          <p className="muted small alert-denied-hint">
            Browser notifications are off. Turn them on in your browser&apos;s site settings for this page if you want
            device alerts.
          </p>
        )}

        <div className="work-hub-columns">
          <div className="work-hub-column">
            <h3 className="work-hub-section-title">Add a task</h3>
            <p className="muted tiny work-hub-hint">What do you need to do? Pick an area and an optional due date.</p>
            <form className="stack task-form task-form-simple" onSubmit={(e) => void onCreate(e)}>
              <label className="task-what-label">
                What to do
                <input
                  {...form.register("title")}
                  placeholder="e.g. Finish internship application"
                  autoComplete="off"
                />
                {form.formState.errors.title && (
                  <span className="field-error">{form.formState.errors.title.message}</span>
                )}
              </label>
              <label>
                Extra detail <span className="muted tiny">(optional)</span>
                <textarea {...form.register("description")} rows={2} placeholder="Links, notes…" />
              </label>
              <div className="task-area-block">
                <span className="task-area-label">Area</span>
                <div className="task-area-pills" role="group" aria-label="Task area">
                  {(Object.keys(categoryLabel) as MilestoneCategory[]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      className={`task-area-pill${taskCategoryValue === k ? " active" : ""}`}
                      onClick={() => form.setValue("category", k, { shouldValidate: true })}
                    >
                      {categoryLabel[k]}
                    </button>
                  ))}
                </div>
              </div>
              <label>
                Due date <span className="muted tiny">(optional)</span>
                <input type="date" {...form.register("dueDate")} />
              </label>
              <button className="btn primary" type="submit">
                Add task
              </button>
            </form>

            <div className="section-head task-list-head">
              <h4 className="work-hub-subtitle">Your list</h4>
              <span className="muted tiny">
                {pendingTasks.length} open
                {tasks.length > 0 ? ` · ${filteredTasks.length} shown` : ""}
              </span>
            </div>
            <div className="notify-filters task-category-filters" role="tablist" aria-label="Filter tasks by area">
              <button
                type="button"
                role="tab"
                aria-selected={taskCategoryFilter === "all"}
                className={taskCategoryFilter === "all" ? "notify-chip active" : "notify-chip"}
                onClick={() => setTaskCategoryFilter("all")}
              >
                All areas
              </button>
              {(Object.keys(categoryLabel) as MilestoneCategory[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={taskCategoryFilter === k}
                  className={taskCategoryFilter === k ? "notify-chip active" : "notify-chip"}
                  onClick={() => setTaskCategoryFilter(k)}
                >
                  {categoryLabel[k]}
                </button>
              ))}
            </div>
            <ul className="task-list">
              {filteredTasks.map((t) => (
                <li key={t.id} className={t.completed ? "done" : ""}>
                  <label className="task-row">
                    <input type="checkbox" checked={t.completed} onChange={() => void toggleTask(t)} />
                    <span>
                      <strong>{t.title}</strong>
                      <span className="muted tiny"> · {categoryLabel[t.category]}</span>
                      {t.dueDate && (
                        <span className="muted tiny block">
                          Due {new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </span>
                  </label>
                </li>
              ))}
              {tasks.length === 0 && <li className="muted">Nothing here yet — add your first task above.</li>}
              {tasks.length > 0 && filteredTasks.length === 0 && (
                <li className="muted">No tasks in this area — choose another filter or add a task.</li>
              )}
            </ul>
          </div>

          <div className="work-hub-column work-hub-column--notify">
            <h3 className="work-hub-section-title">Inbox</h3>
            <p className="muted tiny work-hub-hint">
              Write a quick note below. It saves to your inbox; with alerts on, you also get a pop-up on your device when
              new messages arrive.
            </p>
            <div className="notify-add-form stack">
              <label className="notify-add-label">
                Write a note
                <textarea
                  value={notifyDraftMessage}
                  onChange={(e) => setNotifyDraftMessage(e.target.value)}
                  rows={3}
                  placeholder="Remind yourself about something…"
                  maxLength={2000}
                />
              </label>
              <button
                type="button"
                className="btn secondary"
                disabled={notifySaving || !notifyDraftMessage.trim()}
                onClick={() => void addOwnNotification()}
              >
                {notifySaving ? "Adding…" : "Add to inbox"}
              </button>
            </div>

            <div className="section-head task-list-head">
              <h4 className="work-hub-subtitle">Messages</h4>
            </div>
            <div className="notify-filters" role="tablist" aria-label="Filter messages">
              <button
                type="button"
                role="tab"
                aria-selected={notifyFilter === "all"}
                className={notifyFilter === "all" ? "notify-chip active" : "notify-chip"}
                onClick={() => setNotifyFilter("all")}
              >
                All
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={notifyFilter === "unread"}
                className={notifyFilter === "unread" ? "notify-chip active" : "notify-chip"}
                onClick={() => setNotifyFilter("unread")}
              >
                Unread
                {unreadCount > 0 && <span className="notify-chip-count">{unreadCount}</span>}
              </button>
            </div>

            {filteredNotifications.length > 0 ? (
              <ul className="notify-list" aria-live="polite">
                {filteredNotifications.map((n) => {
                  const kind = (n.kind ?? "REMINDER") as NotificationKind;
                  const meta = kindMeta[kind] ?? kindMeta.REMINDER;
                  return (
                    <li key={n.id} className={`notify-item ${n.read ? "read" : "unread"}`}>
                      <span className="notify-icon" title={meta.label} aria-hidden>
                        {meta.icon}
                      </span>
                      <div className="notify-body">
                        <div className="notify-row">
                          <span className="notify-kind">{meta.label}</span>
                          {!n.read && <span className="notify-dot" aria-label="Unread" />}
                        </div>
                        <p className="notify-message">{n.message}</p>
                        <div className="notify-meta">
                          <time className="muted tiny" dateTime={n.createdAt}>
                            {formatRelativeTime(n.createdAt)} · {new Date(n.createdAt).toLocaleString()}
                          </time>
                          {!n.read && (
                            <button type="button" className="btn tiny ghost" onClick={() => void dismissNotification(n)}>
                              Got it
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            {notifications.length === 0 ? (
              <div className="notify-empty">
                <p className="notify-empty-title">No messages yet</p>
                <p className="muted small">Add a note above, or wait for reminders from the app.</p>
              </div>
            ) : null}

            {notifications.length > 0 && filteredNotifications.length === 0 && notifyFilter === "unread" && (
              <p className="muted small notify-empty-hint">You&apos;re all caught up — nothing unread.</p>
            )}
          </div>
        </div>
      </section>
    </div>
    </div>
  );
}
