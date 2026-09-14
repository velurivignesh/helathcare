// frontend/hooks/useLabTests.ts
import { useState, useEffect } from "react";
import { fetchLabTests, createLabTest } from "../services/labApi";
import type { LabTest, ApiError } from "../types/lab";

export function useLabTests() {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const loadTests = async (params?: any) => {
    setLoading(true);
    try {
      const data = await fetchLabTests(params);
      setTests(data);
    } catch (e: any) {
      setError({ message: e.message || "Failed to load tests" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const addTest = async (test: Partial<LabTest>) => {
    try {
      const created = await createLabTest(test);
      setTests((prev) => [...prev, created]);
      return { success: true as const, test: created };
    } catch (e: any) {
      return { success: false as const, error: e.message };
    }
  };

  return { tests, loading, error, reload: loadTests, addTest };
}
