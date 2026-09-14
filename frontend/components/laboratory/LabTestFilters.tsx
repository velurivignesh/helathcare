// frontend/components/laboratory/LabTestFilters.tsx
"use client"

import React, { useState, useEffect } from "react";
import { useLabCategories } from "../../hooks/useLabCategories";
import type { LabTestCategory } from "../../types/lab";

interface Props {
  onChange: (filters: { search: string; categoryId?: number; active?: boolean }) => void;
}

export const LabTestFilters: React.FC<Props> = ({ onChange }) => {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [active, setActive] = useState<string>("");

  const { categories, loading } = useLabCategories();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      onChange({
        search,
        categoryId: categoryId ? Number(categoryId) : undefined,
        active: active ? active === "true" : undefined,
      });
    }, 300);
    return () => clearTimeout(handler);
  }, [search, categoryId, active]);

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <input
        type="text"
        placeholder="Search tests..."
        className="border rounded px-2 py-1"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select
        className="border rounded px-2 py-1"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        disabled={loading}
      >
        <option value="">All Categories</option>
        {categories.map((cat: LabTestCategory) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      <select
        className="border rounded px-2 py-1"
        value={active}
        onChange={(e) => setActive(e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
    </div>
  );
};
