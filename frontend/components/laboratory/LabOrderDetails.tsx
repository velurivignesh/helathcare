// frontend/components/laboratory/LabOrderDetails.tsx

"use client"

import React from "react"
import { LabModal } from "@/components/laboratory/LabModal"
import { LabOrder } from "@/types/labOrders"
import { LabOrderPatientCard } from "@/components/laboratory/LabOrderPatientCard"
import { LabOrderDoctorCard } from "@/components/laboratory/LabOrderDoctorCard"
import { LabOrderBillingCard } from "@/components/laboratory/LabOrderBillingCard"
import { LabOrderSummaryCard } from "@/components/laboratory/LabOrderSummaryCard"
import { LabOrderItems } from "@/components/laboratory/LabOrderItems"
import { LabOrderTimeline } from "@/components/laboratory/LabOrderTimeline"

interface Props {
  order: LabOrder
  onClose: () => void
}

/** Modal showing details of a lab order */
export const LabOrderDetails: React.FC<Props> = ({ order, onClose }) => {
  return (
    <LabModal isOpen={true} onClose={onClose} title={`Order ${order.orderNumber}`}>
      <div className="space-y-4">
        <LabOrderSummaryCard order={order} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LabOrderPatientCard patientId={order.patientId} />
          <LabOrderDoctorCard doctorId={order.doctorId} />
        </div>
        <LabOrderBillingCard totalAmount={order.totalAmount} billingStatus={order.billingStatus} />
        <LabOrderItems items={order.items} />
        <LabOrderTimeline order={order} />
      </div>
    </LabModal>
  )
}

export default LabOrderDetails
