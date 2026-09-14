// frontend/components/laboratory/LabOrderRow.tsx

"use client"

import React from "react"
import { LabOrder } from "@/types/labOrders"
import { LabOrderStatusBadge } from "@/components/laboratory/LabOrderStatusBadge"
import { LabOrderPriorityBadge } from "@/components/laboratory/LabOrderPriorityBadge"

interface Props {
  order: LabOrder
  onSelect: (order: LabOrder) => void
}

/** Single row in the orders table */
export const LabOrderRow: React.FC<Props> = ({ order, onSelect }) => {
  const handleClick = () => onSelect(order)

  return (
    <tr
      className="cursor-pointer hover:bg-gray-50"
      onClick={handleClick}
    >
      <td className="px-4 py-2 text-sm font-medium text-indigo-600">
        {order.orderNumber}
      </td>
      <td className="px-4 py-2 text-sm text-gray-500">
        {new Date(order.orderDate).toLocaleDateString()}
      </td>
      <td className="px-4 py-2 text-sm">
        <LabOrderPriorityBadge priority={order.priority} />
      </td>
      <td className="px-4 py-2 text-sm">
        <LabOrderStatusBadge status={order.laboratoryStatus} />
      </td>
      <td className="px-4 py-2 text-sm font-medium text-gray-700">
        ${order.totalAmount.toFixed(2)}
      </td>
    </tr>
  )
}

export default LabOrderRow
