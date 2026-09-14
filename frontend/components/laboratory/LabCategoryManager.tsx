// frontend/components/laboratory/LabCategoryManager.tsx
"use client"

import React, { useState, useMemo, useCallback } from "react"
import { LabTestCategory } from "../../types/lab"
import { useLabCategories } from "../../hooks/useLabCategories"
import { LabCategoryTable } from "./LabCategoryTable"
import { LabCategoryFilters, FilterState } from "./LabCategoryFilters"
import { LabCategoryLoadingState } from "./LabCategoryLoadingState"
import { LabCategoryErrorState } from "./LabCategoryErrorState"
import { LabCategoryEmptyState } from "./LabCategoryEmptyState"
import { LabCategoryForm } from "./LabCategoryForm"
import { LabCategoryDetails } from "./LabCategoryDetails"

/**
 * Top‑level manager for laboratory test categories.
 * It handles data fetching, client‑side filtering, adding new categories,
 * and displaying details of a selected category.
 */
export const LabCategoryManager: React.FC = () => {
  // Hook provides raw categories from the backend
  const { categories, loading, error, reload, addCategory } = useLabCategories()

  // UI state
  const [filter, setFilter] = useState<FilterState>({ search: "", status: "all", department: "" })
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState<LabTestCategory | null>(null)

  // Apply filters client‑side – kept pure and memoized for performance
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      // Search across code, name, department, description (case‑insensitive)
      const searchMatch = filter.search.trim() === "" ||
        [cat.code, cat.name, cat.department, cat.description].some((field) =>
          field?.toLowerCase().includes(filter.search.trim().toLowerCase()))

      const statusMatch =
        filter.status === "all" ||
        (filter.status === "active" && cat.isActive) ||
        (filter.status === "inactive" && !cat.isActive)

      const departmentMatch = filter.department === "" || cat.department === filter.department

      return searchMatch && statusMatch && departmentMatch
    })
  }, [categories, filter])

  // Handlers
  const handleAddSuccess = useCallback(
    (newCat: LabTestCategory) => {
      // The hook already added it to the list, but we ensure UI consistency
      // and keep filters unchanged.
    },
    []
  )

  const handleRetry = () => {
    reload()
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Laboratory Test Categories</h2>

      {/* Filters */}
      <LabCategoryFilters categories={categories} onFilterChange={setFilter} />

      {/* Action button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Add Category
        </button>
      </div>

      {/* Loading / Error / Empty states */}
      {loading && <LabCategoryLoadingState />}
      {error && <LabCategoryErrorState message={error.message} onRetry={handleRetry} />}

      {/* Main table or empty state */}
      {!loading && !error && (
        filteredCategories.length > 0 ? (
          <LabCategoryTable categories={filteredCategories} onSelect={setSelected} />
        ) : (
          <LabCategoryEmptyState onAdd={() => setShowAdd(true)} />
        )
      )}

      {/* Add Category Modal */}
      {showAdd && (
        <LabCategoryForm
          isOpen={showAdd}
          onClose={() => setShowAdd(false)}
          onSuccess={(cat) => {
            addCategory(cat) // optimistic update – hook already adds
            setShowAdd(false)
          }}
        />
      )}

      {/* Details Modal */}
      {selected && (
        <LabCategoryDetails
          category={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
