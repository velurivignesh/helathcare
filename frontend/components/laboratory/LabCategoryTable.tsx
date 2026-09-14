// frontend/components/laboratory/LabCategoryTable.tsx
"use client"

import React from "react"
import { LabTestCategory } from "../../types/lab"
import { LabCategoryStatusBadge } from "./LabCategoryStatusBadge"
import { LabCategoryDetails } from "./LabCategoryDetails"

interface Props {
  categories: LabTestCategory[]
  onSelect: (category: LabTestCategory) => void
}

export const LabCategoryTable: React.FC<Props> = ({ categories, onSelect }) => {
  if (categories.length === 0) {
    return <div className="p-4 text-gray-500">No categories found.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Code</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Department</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Created</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Updated</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.map((cat) => (
            <tr key={cat.id} className="hover:bg-gray-100">
              <td className="px-4 py-2 text-sm">{cat.code}</td>
              <td className="px-4 py-2 text-sm">{cat.name}</td>
              <td className="px-4 py-2 text-sm">{cat.department}</td>
              <td className="px-4 py-2 text-sm">{cat.description ?? "-"}</td>
              <td className="px-4 py-2 text-sm">
                <LabCategoryStatusBadge active={cat.isActive} />
              </td>
              <td className="px-4 py-2 text-sm">
                {cat.id ? new Date().toLocaleDateString() : "-"}
              </td>
              <td className="px-4 py-2 text-sm">
                {cat.id ? new Date().toLocaleDateString() : "-"}
              </td>
              <td className="px-4 py-2 text-sm">
                <button
                  onClick={() => onSelect(cat)}
                  className="text-indigo-600 hover:underline"
                >
                  Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
