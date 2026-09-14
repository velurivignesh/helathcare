// frontend/components/laboratory/LabOrderTable.tsx

"use client"

import React from "react"
import { LabOrder } from "@/types/labOrders"
import { LabOrderRow } from "@/components/laboratory/LabOrderRow"

interface Props {
  orders: LabOrder[]
  onSelect: (order: LabOrder) => void
}

/** Table of lab orders */
export const LabOrderTable: React.FC<Props> = ({ orders, onSelect }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
            Order #
          </th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
            Date
          </th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
            Priority
          </th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
            Status
          </th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
            Total
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {orders.map((order) => (
          <LabOrderRow key={order.id} order={order} onSelect={onSelect} />
        ))}
      </tbody>
    </table>
  </div>
)

export default LabOrderTable
