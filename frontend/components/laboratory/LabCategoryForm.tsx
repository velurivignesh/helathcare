// frontend/components/laboratory/LabCategoryForm.tsx
"use client"

import React, { useState } from "react"
import { LabTestCategory } from "../../types/lab"
import { createLabCategory } from "../../services/labApi"
import { LabModal } from "./LabModal"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: (category: LabTestCategory) => void
}

export const LabCategoryForm: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [code, setCode] = useState("")
  const [name, setName] = useState("")
  const [department, setDepartment] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!code.trim()) newErrors.code = "Category code is required."
    if (!name.trim()) newErrors.name = "Category name is required."
    if (code.length > 20) newErrors.code = "Category code must be ≤ 20 characters."
    if (name.length > 100) newErrors.name = "Category name must be ≤ 100 characters."
    if (department && department.length > 50) newErrors.department = "Department must be ≤ 50 characters."
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload = {
        code: code.trim(),
        name: name.trim(),
        department: department.trim(),
        description: description.trim() || undefined,
        isActive,
      }
      const created = await createLabCategory(payload)
      onSuccess(created)
      // reset form
      setCode("")
      setName("")
      setDepartment("")
      setDescription("")
      setIsActive(true)
      setErrors({})
      onClose()
    } catch (err: any) {
      // Simple error handling – show generic message
      setErrors({ form: err.message ?? "Failed to create category" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <LabModal isOpen={isOpen} onClose={onClose} title="Add Laboratory Category">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && <div className="text-red-600">{errors.form}</div>}
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700">
            Category Code<span className="text-red-500">*</span>
          </label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 block w-full border rounded px-2 py-1"
            maxLength={20}
            required
          />
          {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Category Name<span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border rounded px-2 py-1"
            maxLength={100}
            required
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700">
            Department
          </label>
          <input
            id="department"
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="mt-1 block w-full border rounded px-2 py-1"
            maxLength={50}
          />
          {errors.department && <p className="text-sm text-red-600">{errors.department}</p>}
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full border rounded px-2 py-1"
            rows={3}
          />
        </div>
        <div className="flex items-center">
          <input
            id="active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
          <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
            Active
          </label>
        </div>
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </LabModal>
  )
}
