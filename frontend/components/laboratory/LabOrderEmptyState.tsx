// frontend/components/laboratory/LabOrderEmptyState.tsx

"use client"

import React from "react"

/** Empty state when no lab orders are present */
export const LabOrderEmptyState: React.FC = () => (
  <div className="text-center py-12" role="status">
    <p className="text-gray-600">No laboratory orders found.</p>
  </div>
)
