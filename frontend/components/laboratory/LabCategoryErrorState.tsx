// frontend/components/laboratory/LabCategoryErrorState.tsx
"use client"

import React from "react"

interface Props {
  message: string
  onRetry: () => void
}

export const LabCategoryErrorState: React.FC<Props> = ({ message, onRetry }) => {
  return (
    <div className="p-4 border rounded bg-red-50">
      <p className="text-red-700 mb-2">Error: {message}</p>
      <button
        onClick={onRetry}
        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
      >
        Retry
      </button>
    </div>
  )
}
