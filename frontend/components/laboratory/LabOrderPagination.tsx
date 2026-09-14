// frontend/components/laboratory/LabOrderPagination.tsx

"use client"

import React from "react"

interface Props {
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

/** Simple client‑side pagination controls */
export const LabOrderPagination: React.FC<Props> = ({ page, pageSize, totalCount, onPageChange, onPageSizeChange }) => {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const handlePrev = () => {
    if (page > 1) onPageChange(page - 1)
  }
  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1)
  }

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <label className="text-sm" htmlFor="pageSizeSelect">
          Per page:
        </label>
        <select
          id="pageSizeSelect"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="border rounded p-1"
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default LabOrderPagination
