// frontend/components/laboratory/LabOrderDoctorCard.tsx

"use client"

import React from "react"

interface Props {
  doctorId?: number | null
}

/** Simple doctor info card – displays doctor identifier if present */
export const LabOrderDoctorCard: React.FC<Props> = ({ doctorId }) => (
  <div className="border rounded p-4">
    <h3 className="text-lg font-medium mb-2">Doctor</h3>
    {doctorId ? (
      <p className="text-gray-700">ID: {doctorId}</p>
    ) : (
      <p className="text-gray-500 italic">No doctor assigned</p>
    )}
  </div>
)

export default LabOrderDoctorCard
