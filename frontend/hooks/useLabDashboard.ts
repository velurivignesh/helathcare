// frontend/hooks/useLabDashboard.ts
import { useState, useEffect } from "react";
import { fetchLabStats } from "../services/labApi";
import type { LabStats } from "../types/lab";
import type { ApiError } from "../types/lab";

export function useLabDashboard() {
  const [stats, setStats] = useState<LabStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await fetchLabStats();
        if (isMounted) setStats(data);
      } catch (e: any) {
        if (isMounted) setError({ message: e.message || "Failed to load stats" });
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return { stats, loading, error };
}
