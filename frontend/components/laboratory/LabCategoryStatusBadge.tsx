// frontend/components/laboratory/LabCategoryStatusBadge.tsx
"use client"

import React from "react"

interface Props {
  active: boolean
}

const activeClass = "bg-green-100 text-green-800"
const inactiveClass = "bg-gray-100 text-gray-800"

export const LabCategoryStatusBadge: React.FC<Props> = ({ active }) => {
  const className = active ? activeClass : inactiveClass
  const label = active ? "Active" : "Inactive"
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${className}`}>{label}</span>
  )
}
