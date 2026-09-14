// frontend/components/laboratory/LabOrderStatusBadge.tsx
"use client"

import React from "react"

interface Props {
  status: string
}

/**
 * Maps order status to a colored badge.
 * Unknown statuses fall back to a neutral style.
 */
export const LabOrderStatusBadge: React.FC<Props> = ({ status }) => {
  const normalized = status?.toLowerCase() ?? "unknown"
  let className = "bg-gray-100 text-gray-800"
  let label = status

  switch (normalized) {
    case "ordered":
      className = "bg-blue-100 text-blue-800"
      label = "Ordered"
      break
    case "inprogress":
    case "in progress":
      className = "bg-yellow-100 text-yellow-800"
      label = "In Progress"
      break
    case "completed":
      className = "bg-green-100 text-green-800"
      label = "Completed"
      break
    case "cancelled":
    case "canceled":
      className = "bg-red-100 text-red-800"
      label = "Cancelled"
      break
    default:
      // keep neutral
      break
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${className}`} aria-label={`Order status: ${label}`}> 
      {label}
    </span>
  )
}
