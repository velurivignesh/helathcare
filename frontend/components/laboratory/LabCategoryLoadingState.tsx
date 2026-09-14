// frontend/components/laboratory/LabCategoryLoadingState.tsx
"use client"

import React from "react"

export const LabCategoryLoadingState: React.FC = () => {
  // Simple skeleton rows for table header + 5 rows
  return (
    <div className="space-y-2">
      <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex space-x-2">
          <div className="h-4 bg-gray-200 rounded w-1/5 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/5 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/5 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/5 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/5 animate-pulse" />
        </div>
      ))}
    </div>
  )
}
