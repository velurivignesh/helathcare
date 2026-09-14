// frontend/components/laboratory/LabOrderBillingCard.tsx

"use client"

import React from "react"

interface Props {
  totalAmount: number
  billingStatus: string
}

/** Billing information display (read‑only) */
export const LabOrderBillingCard: React.FC<Props> = ({ totalAmount, billingStatus }) => (
  <div className="border rounded p-4">
    <h3 className="text-lg font-medium mb-2">Billing</h3>
    <p className="text-gray-700">Total: ${totalAmount.toFixed(2)}</p>
    <p className="text-gray-700">Status: {billingStatus}</p>
  </div>
)

export default LabOrderBillingCard
