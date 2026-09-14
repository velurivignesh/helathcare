// frontend/components/laboratory/LabOrderSummaryCard.tsx

"use client"

import React from "react"
import { LabOrder } from "@/types/labOrders"
import { LabOrderPriorityBadge } from "@/components/laboratory/LabOrderPriorityBadge"
import { LabOrderStatusBadge } from "@/components/laboratory/LabOrderStatusBadge"

interface Props {
  order: LabOrder
}

/** Summary information displayed at top of the details modal */
export const LabOrderSummaryCard: React.FC<Props> = ({ order }) => (
  <div className="border rounded p-4">
    <h3 className="text-lg font-medium mb-2">Order Summary</h3>
    <p className="text-gray-700">Order #: {order.orderNumber}</p>
    <p className="text-gray-700">
      Date: {new Date(order.orderDate).toLocaleDateString()}
    </p>
    <div className="flex items-center space-x-2 mt-2">
      <LabOrderPriorityBadge priority={order.priority} />
      <LabOrderStatusBadge status={order.laboratoryStatus} />
    </div>
  </div>
)

export default LabOrderSummaryCard
