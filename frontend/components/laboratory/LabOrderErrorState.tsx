// frontend/components/laboratory/LabOrderErrorState.tsx

"use client"

import React from "react"

/** Error state for lab orders with a retry button */
export const LabOrderErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="text-center py-12" role="alert">
    <p className="text-red-600 mb-4">{error}</p>
    <button
      type="button"
      onClick={onRetry}
      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
    >
      Retry
    </button>
  </div>
)
