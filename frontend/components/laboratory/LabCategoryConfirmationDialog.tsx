// frontend/components/laboratory/LabCategoryConfirmationDialog.tsx
"use client"

import React from "react"
import { LabModal } from "./LabModal"

interface Props {
  isOpen: boolean
  title?: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export const LabCategoryConfirmationDialog: React.FC<Props> = ({
  isOpen,
  title = "Confirm",
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <LabModal isOpen={isOpen} onClose={onCancel} title={title}>
      <p className="mb-4">{message}</p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Confirm
        </button>
      </div>
    </LabModal>
  )
}
