// frontend/components/laboratory/LabOrderLoadingState.tsx

"use client"

import React from "react"

/** Loading spinner for Lab Orders */
export const LabOrderLoadingState: React.FC = () => (
  <div className="flex justify-center items-center py-8" role="status">
    <svg
      className="animate-spin h-8 w-8 text-indigo-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8z"
      ></path>
    </svg>
    <span className="ml-2 text-sm text-gray-600">Loading lab orders…</span>
  </div>
)
