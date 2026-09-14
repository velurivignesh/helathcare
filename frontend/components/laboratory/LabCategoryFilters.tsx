// frontend/components/laboratory/LabCategoryFilters.tsx
"use client"

import React, { useState, useEffect } from "react"
import { LabTestCategory } from "../../types/lab"

interface Props {
  categories: LabTestCategory[]
  onFilterChange: (filter: FilterState) => void
}

export interface FilterState {
  search: string
  status: "all" | "active" | "inactive"
  department: string
}

export const LabCategoryFilters: React.FC<Props> = ({ categories, onFilterChange }) => {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all")
  const [department, setDepartment] = useState("")

  // Extract unique departments for filter dropdown
  const departments = Array.from(new Set(categories.map((c) => c.department))).filter(Boolean)

  // Debounce search to avoid excessive updates
  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange({ search, status, department })
    }, 300)
    return () => clearTimeout(handler)
  }, [search, status, department, onFilterChange])

  return (
    <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0 mb-4">
      <input
        type="text"
        placeholder="Search categories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded px-2 py-1 w-full md:w-64"
        aria-label="Search categories"
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as any)}
        className="border rounded px-2 py-1"
        aria-label="Filter by status"
      >
        <option value="all">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <select
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        className="border rounded px-2 py-1"
        aria-label="Filter by department"
      >
        <option value="">All departments</option>
        {departments.map((dept) => (
          <option key={dept} value={dept}>
            {dept}
          </option>
        ))}
      </select>
    </div>
  )
}
