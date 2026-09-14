// frontend/components/laboratory/LabOrderTimeline.tsx

"use client"

import React from "react"
import { LabOrder } from "@/types/labOrders"
import { LabOrderStatusBadge } from "@/components/laboratory/LabOrderStatusBadge"
import { LabOrderPriorityBadge } from "@/components/laboratory/LabOrderPriorityBadge"

/**
 * Timeline component that visualises the lifecycle of a laboratory order.
 * It displays a series of steps derived from the fields actually present in
 * the {@link LabOrder} type. Missing or unknown data are safely skipped.
 *
 * Steps shown (when data is available):
 *   1. Order placed – uses `orderDate`.
 *   2. Sample collection – uses `collectionStatus`.
 *   3. Laboratory processing – uses `laboratoryStatus`.
 *   4. Billing – uses `billingStatus`.
 *
 * Each step is rendered with a small icon, a label, and, where appropriate,
 * a badge for the status. The layout follows the existing Tailwind UI
 * conventions of the project and is responsive.
 */
export const LabOrderTimeline: React.FC<{ order: LabOrder }> = ({ order }) => {
  const steps: Array<{
    label: string
    content: React.ReactNode
  }> = []

  // 1. Order placed – always present (orderDate)
  if (order.orderDate) {
    steps.push({
      label: "Order placed",
      content: (
        <span className="text-gray-700">
          {new Date(order.orderDate).toLocaleDateString()}
        </span>
      ),
    })
  }

  // 2. Sample collection status
  if (order.collectionStatus) {
    steps.push({
      label: "Sample collection",
      content: <LabOrderStatusBadge status={order.collectionStatus} />, // reuse status badge styling
    })
  }

  // 3. Laboratory processing status
  if (order.laboratoryStatus) {
    steps.push({
      label: "Laboratory processing",
      content: <LabOrderStatusBadge status={order.laboratoryStatus} />, // reuse status badge
    })
  }

  // 4. Billing status – always present in schema, but guard just in case
  if (order.billingStatus) {
    steps.push({
      label: "Billing",
      content: <span className="text-gray-700">{order.billingStatus}</span>,
    })
  }

  // Include priority as a separate visual cue (optional)
  if (order.priority) {
    steps.unshift({
      label: "Priority",
      content: <LabOrderPriorityBadge priority={order.priority} />, // show priority badge at top
    })
  }

  return (
    <div className="border rounded p-4">
      <h3 className="text-lg font-medium mb-2">Timeline</h3>
      <ul className="space-y-4">
        {steps.map((step, idx) => (
          <li key={idx} className="flex items-start space-x-3">
            {/* Simple step icon */}
            <div className="flex-shrink-0 mt-1 w-2 h-2 rounded-full bg-indigo-600" aria-hidden="true" />
            <div>
              <p className="font-medium text-sm text-gray-800">{step.label}</p>
              <div className="mt-1 text-sm">{step.content}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default LabOrderTimeline
