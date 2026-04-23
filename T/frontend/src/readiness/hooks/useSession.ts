import { useEffect, useState } from "react";
import { api, type UserRecord } from "../api";

const KEY = "crp_userId";
const EMAIL_KEY = "crp_email";
const DEMO_EMAIL = "demo.student@university.edu";
const DEMO_NAME = "Alex Student";

/**
 * Resolves a user id for API calls. Auth UI is handled elsewhere — we bootstrap a demo user locally if needed.
 */
export function useSession() {
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem(KEY));
  const [user, setUser] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setError(null);
      setLoading(true);
      try {
        if (!localStorage.getItem(KEY)) {
          const { userId: id } = await api.seedDemoUser();
          localStorage.setItem(KEY, id);
          localStorage.setItem(EMAIL_KEY, DEMO_EMAIL);
          if (!cancelled) setUserId(id);
        }

        const id = localStorage.getItem(KEY);
        const email = localStorage.getItem(EMAIL_KEY) ?? DEMO_EMAIL;
        if (!id) {
          if (!cancelled) setLoading(false);
          return;
        }

        try {
          const u = await api.getUserByEmail(email);
          if (!cancelled) setUser(u);
        } catch {
          const u = await api.ensureUser(email, DEMO_NAME);
          if (!cancelled) setUser(u);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not start session");
          setUserId(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { userId, user, loading, error };
}
