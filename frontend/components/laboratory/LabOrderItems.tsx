// frontend/components/laboratory/LabOrderItems.tsx

"use client"

import React from "react"
import { LabOrderItem } from "@/types/labOrders"
import { LabOrderStatusBadge } from "@/components/laboratory/LabOrderStatusBadge"

interface Props {
  items: LabOrderItem[]
}

/** Table of individual test items within an order */
export const LabOrderItems: React.FC<Props> = ({ items }) => (
  <div className="border rounded p-4">
    <h3 className="text-lg font-medium mb-2">Tests</h3>
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Test ID</th>
          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {items.map((it) => (
          <tr key={it.id}>
            <td className="px-3 py-2 text-sm text-gray-700">{it.testId}</td>
            <td className="px-3 py-2 text-sm">
              <LabOrderStatusBadge status={it.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default LabOrderItems
