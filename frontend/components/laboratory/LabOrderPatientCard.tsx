// frontend/components/laboratory/LabOrderPatientCard.tsx

"use client"

import React from "react"

interface Props {
  patientId: number
}

/** Simple patient info card – displays patient identifier */
export const LabOrderPatientCard: React.FC<Props> = ({ patientId }) => (
  <div className="border rounded p-4">
    <h3 className="text-lg font-medium mb-2">Patient</h3>
    <p className="text-gray-700">ID: {patientId}</p>
  </div>
)

export default LabOrderPatientCard
