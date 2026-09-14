// frontend/components/laboratory/LabTestTable.tsx
"use client"

import React from "react"
import { LabTest } from "../../types/lab"
import { LabStatusBadge } from "./LabStatusBadge"

interface Props {
  tests: LabTest[]
}

export const LabTestTable: React.FC<Props> = ({ tests }) => {
  if (tests.length === 0) {
    return <div className="p-4 text-gray-500">No tests found.</div>
  }
  return (
    <table className="min-w-full border divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Code</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Category</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Specimen</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Result Type</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Price</th>
          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {tests.map((test) => (
          <tr key={test.id}>
            <td className="px-4 py-2 text-sm">{test.code}</td>
            <td className="px-4 py-2 text-sm">{test.name}</td>
            <td className="px-4 py-2 text-sm">{test.categoryId}</td>
            <td className="px-4 py-2 text-sm">{test.specimenType}</td>
            <td className="px-4 py-2 text-sm">{test.resultType}</td>
            <td className="px-4 py-2 text-sm">{test.price?.toFixed(2) ?? "-"}</td>
            <td className="px-4 py-2 text-sm">
              <LabStatusBadge status={test.isActive ? "active" : "inactive"} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
