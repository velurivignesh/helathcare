// frontend/components/laboratory/LabCategoryDetails.tsx
"use client"

import React from "react"
import { LabTestCategory } from "../../types/lab"

interface Props {
  category: LabTestCategory
  onClose: () => void
}

export const LabCategoryDetails: React.FC<Props> = ({ category, onClose }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Category Details</h2>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <dt className="font-medium text-gray-600">Code</dt>
          <dd className="text-gray-800">{category.code}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-600">Name</dt>
          <dd className="text-gray-800">{category.name}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-600">Department</dt>
          <dd className="text-gray-800">{category.department}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-600">Description</dt>
          <dd className="text-gray-800">{category.description ?? "-"}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-600">Status</dt>
          <dd className="text-gray-800">{category.isActive ? "Active" : "Inactive"}</dd>
        </div>
        {/* Placeholder dates – backend currently does not return them */}
        <div>
          <dt className="font-medium text-gray-600">Created</dt>
          <dd className="text-gray-800">-</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-600">Updated</dt>
          <dd className="text-gray-800">-</dd>
        </div>
      </dl>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  )
}
