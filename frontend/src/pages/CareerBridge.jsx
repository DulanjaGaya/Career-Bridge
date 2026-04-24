import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api as readinessApi } from '../readiness/api';
import LandingPage from '../readiness/pages/LandingPage';
import ResumePage from '../readiness/pages/ResumePage';
import DashboardPage from '../readiness/pages/DashboardPage';

function useReadinessAccount() {
  const { user, isLoading } = useAuth();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (isLoading) {
      setLoading(true);
      return () => {
        cancelled = true;
      };
    }

    if (!user) {
      setUserId(null);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const email = user.email || `user-${user._id || user.id || 'guest'}@careerbridge.local`;
    const name = user.name || 'Career Bridge User';

    setLoading(true);
    setError(null);

    (async () => {
      try {
        let account;
        try {
          account = await readinessApi.getUserByEmail(email);
        } catch {
          account = await readinessApi.ensureUser(email, name);
        }

        if (!cancelled) {
          setUserId(account.id);
        }
      } catch (err) {
        if (!cancelled) {
          setUserId(null);
          setError(err instanceof Error ? err.message : 'Could not open career readiness');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoading, user]);

  return { userId, loading: isLoading || loading, error };
}

export function CareerLandingPage() {
  const { loading } = useReadinessAccount();
  return <LandingPage loading={loading} />;
}

export function CareerResumePage() {
  const { userId, loading, error } = useReadinessAccount();

  return (
    <>
      {error && <div className="banner error">{error}</div>}
      <ResumePage userId={userId} bootstrapping={loading} />
    </>
  );
}

export function CareerDashboardPage() {
  const { userId, loading, error } = useReadinessAccount();

  return (
    <>
      {error && <div className="banner error">{error}</div>}
      <DashboardPage userId={userId} bootstrapping={loading} />
    </>
  );
}