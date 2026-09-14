// frontend/hooks/useLabCategories.ts
import { useState, useEffect } from "react";
import { fetchLabCategories, createLabCategory } from "../services/labApi";
import type { LabTestCategory, ApiError } from "../types/lab";

export function useLabCategories() {
  const [categories, setCategories] = useState<LabTestCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchLabCategories();
      setCategories(data);
    } catch (e: any) {
      setError({ message: e.message || "Failed to load categories" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addCategory = async (cat: Partial<LabTestCategory>) => {
    try {
      const created = await createLabCategory(cat);
      setCategories((prev) => [...prev, created]);
      return { success: true as const, category: created };
    } catch (e: any) {
      return { success: false as const, error: e.message };
    }
  };

  return { categories, loading, error, reload: load, addCategory };
}
