// frontend/components/laboratory/LabCategoryEmptyState.tsx
"use client"

import React from "react"

interface Props {
  onAdd: () => void
}

export const LabCategoryEmptyState: React.FC<Props> = ({ onAdd }) => {
  return (
    <div className="p-8 text-center border rounded bg-gray-50">
      <p className="text-gray-600 mb-4">No laboratory categories have been defined yet.</p>
      <button
        onClick={onAdd}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Add First Category
      </button>
    </div>
  )
}
