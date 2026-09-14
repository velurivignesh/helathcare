// frontend/components/laboratory/LabTestForm.tsx
"use client"

import React, { useState } from "react";
import type { LabTest } from "../../types/lab";
import { LabStatusBadge } from "./LabStatusBadge";

interface Props {
  initial?: Partial<LabTest>;
  onSubmit: (data: Partial<LabTest>) => Promise<{ success: boolean; error?: string }>; // returns success flag
  onCancel: () => void;
}

export const LabTestForm: React.FC<Props> = ({ initial = {}, onSubmit, onCancel }) => {
  const [form, setForm] = useState<Partial<LabTest>>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.code) newErrors.code = "Code is required";
    if (!form.name) newErrors.name = "Name is required";
    if (!form.categoryId) newErrors.categoryId = "Category is required";
    if (!form.specimenType) newErrors.specimenType = "Specimen type is required";
    if (!form.resultType) newErrors.resultType = "Result type is required";
    if (form.price !== undefined && isNaN(Number(form.price)))
      newErrors.price = "Price must be a number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const result = await onSubmit(form);
    if (!result.success) {
      setErrors({ submit: result.error ?? "Submission failed" });
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.submit && <div className="text-red-600">{errors.submit}</div>}
      <div>
        <label className="block text-sm font-medium">Code *</label>
        <input
          name="code"
          className="border rounded w-full p-1"
          value={form.code ?? ""}
          onChange={handleChange}
        />
        {errors.code && <p className="text-red-500 text-sm">{errors.code}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">Name *</label>
        <input
          name="name"
          className="border rounded w-full p-1"
          value={form.name ?? ""}
          onChange={handleChange}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">Category ID *</label>
        <input
          name="categoryId"
          type="number"
          className="border rounded w-full p-1"
          value={form.categoryId ?? ""}
          onChange={handleChange}
        />
        {errors.categoryId && <p className="text-red-500 text-sm">{errors.categoryId}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">Specimen Type *</label>
        <input
          name="specimenType"
          className="border rounded w-full p-1"
          value={form.specimenType ?? ""}
          onChange={handleChange}
        />
        {errors.specimenType && <p className="text-red-500 text-sm">{errors.specimenType}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium">Result Type *</label>
        <select
          name="resultType"
          className="border rounded w-full p-1"
          value={form.resultType ?? ""}
          onChange={handleChange}
        >
          <option value="">Select...</option>
          <option value="numeric">Numeric</option>
          <option value="text">Text</option>
        </select>
        {errors.resultType && <p className="text-red-500 text-sm">{errors.resultType}</p>}
      </div>
      <div className="flex items-center space-x-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={!!form.isActive}
            onChange={handleChange}
          />
          <span className="ml-2">Active</span>
        </label>
      </div>
      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          {submitting ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
