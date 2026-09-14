// frontend/components/laboratory/LabOrderFilters.tsx

"use client"

import React from "react"
import { LabOrderPriorityBadge } from "@/components/laboratory/LabOrderPriorityBadge"
import { LabOrderStatusBadge } from "@/components/laboratory/LabOrderStatusBadge"

interface Props {
  filter: {
    status: string
    priority: string
    collectionStatus: string
    billingStatus: string
    dateFrom?: string
    dateTo?: string
  }
  onStatusChange: (value: string) => void
  onPriorityChange: (value: string) => void
  onCollectionStatusChange: (value: string) => void
  onBillingStatusChange: (value: string) => void
}

/** Filter controls for the orders list */
export const LabOrderFilters: React.FC<Props> = ({
  filter,
  onStatusChange,
  onPriorityChange,
  onCollectionStatusChange,
  onBillingStatusChange,
}) => {
  const statusOptions = ["all", "Ordered", "InProgress", "Completed", "Cancelled"]
  const priorityOptions = ["all", "Routine", "Urgent", "Stat"]
  const collectionOptions = ["all", "Pending", "Collected"]
  const billingOptions = ["all", "Unbilled", "Billed"]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <select
        value={filter.status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="border rounded p-2"
      >
        {statusOptions.map((opt) => (
          <option key={opt} value={opt.toLowerCase()}>
            {opt}
          </option>
        ))}
      </select>
      <select
        value={filter.priority}
        onChange={(e) => onPriorityChange(e.target.value)}
        className="border rounded p-2"
      >
        {priorityOptions.map((opt) => (
          <option key={opt} value={opt.toLowerCase()}>
            {opt}
          </option>
        ))}
      </select>
      <select
        value={filter.collectionStatus}
        onChange={(e) => onCollectionStatusChange(e.target.value)}
        className="border rounded p-2"
      >
        {collectionOptions.map((opt) => (
          <option key={opt} value={opt.toLowerCase()}>
            {opt}
          </option>
        ))}
      </select>
      <select
        value={filter.billingStatus}
        onChange={(e) => onBillingStatusChange(e.target.value)}
        className="border rounded p-2"
      >
        {billingOptions.map((opt) => (
          <option key={opt} value={opt.toLowerCase()}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}

export default LabOrderFilters
