// frontend/components/laboratory/LabOrderManager.tsx

"use client"

import React, { useState } from "react"
import { LabOrderLoadingState } from "@/components/laboratory/LabOrderLoadingState"
import { LabOrderEmptyState } from "@/components/laboratory/LabOrderEmptyState"
import { LabOrderErrorState } from "@/components/laboratory/LabOrderErrorState"
import { LabOrderSearch } from "@/components/laboratory/LabOrderSearch"
import { LabOrderFilters } from "@/components/laboratory/LabOrderFilters"
import { LabOrderTable } from "@/components/laboratory/LabOrderTable"
import { LabOrderPagination } from "@/components/laboratory/LabOrderPagination"
import { LabOrderDetails } from "@/components/laboratory/LabOrderDetails"
import { useLabOrders } from "@/hooks/useLabOrders"

/**
 * Top‑level manager for Laboratory Orders. It wires together the hook,
 * UI controls, table, pagination and the details modal.
 */
export const LabOrderManager: React.FC = () => {
  const {
    orders,
    totalCount,
    loading,
    error,
    filter,
    setPage,
    setPageSize,
    setSearch,
    setStatus,
    setPriority,
    setCollectionStatus,
    setBillingStatus,
    selectedOrder,
    setSelectedOrder,
    addOrder,
  } = useLabOrders()

  const [showCreateForm, setShowCreateForm] = useState(false)

  // Render based on loading / error / empty states
  const renderContent = () => {
    if (loading) return <LabOrderLoadingState />
    if (error)
      return (
        <LabOrderErrorState
          error={error}
          onRetry={() => {
            // Simple retry by re‑loading orders – hook loads on filter change
            setSearch(filter.search)
          }}
        />
      )
    if (orders.length === 0) return <LabOrderEmptyState />
    return (
      <>
        <LabOrderTable orders={orders} onSelect={setSelectedOrder} />
        <LabOrderPagination
          page={filter.page}
          pageSize={filter.pageSize}
          totalCount={totalCount}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
        {selectedOrder && (
          <LabOrderDetails
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        <div className="flex items-center space-x-2">
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={() => setShowCreateForm((c) => !c)}
          >
            {showCreateForm ? "Hide Create Order" : "Create Order"}
          </button>
        </div>
        <LabOrderSearch onSearch={setSearch} />
      </div>
      <LabOrderFilters
        filter={filter}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
        onCollectionStatusChange={setCollectionStatus}
        onBillingStatusChange={setBillingStatus}
      />
      {showCreateForm && <LabOrderForm addOrder={addOrder} />}
      {renderContent()}
    </div>
  )
}

// Simple create order form – uses numerical IDs because selectors are unavailable.
const LabOrderForm: React.FC<{ addOrder: (payload: any) => Promise<void> }> = ({ addOrder }) => {
  const [patientId, setPatientId] = useState("")
  const [doctorId, setDoctorId] = useState("")
  const [priority, setPriority] = useState("Routine")
  const [testIds, setTestIds] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ids = testIds
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n))
    if (!patientId || ids.length === 0) {
      setError("Patient ID and at least one Test ID are required.")
      return
    }
    try {
      await addOrder({
        patient_id: Number(patientId),
        doctor_id: doctorId ? Number(doctorId) : undefined,
        priority: priority as any,
        test_ids: ids,
        clinical_notes: notes || undefined,
      })
      // reset form
      setPatientId("")
      setDoctorId("")
      setPriority("Routine")
      setTestIds("")
      setNotes("")
      setError(null)
    } catch (err: any) {
      setError(err.message ?? "Failed to create order")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border p-4 rounded space-y-3">
      {error && (
        <div className="text-sm text-red-600" role="alert">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-gray-700">Patient ID</span>
          <input
            type="number"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
            className="mt-1 block w-full rounded border-gray-300"
          />
        </label>
        <label className="block">
          <span className="text-gray-700">Doctor ID (optional)</span>
          <input
            type="number"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="mt-1 block w-full rounded border-gray-300"
          />
        </label>
        <label className="block">
          <span className="text-gray-700">Priority</span>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="mt-1 block w-full rounded border-gray-300"
          >
            <option>Routine</option>
            <option>Urgent</option>
            <option>Stat</option>
          </select>
        </label>
        <label className="block">
          <span className="text-gray-700">Test IDs (comma‑separated)</span>
          <input
            type="text"
            placeholder="e.g. 1,2,3"
            value={testIds}
            onChange={(e) => setTestIds(e.target.value)}
            required
            className="mt-1 block w-full rounded border-gray-300"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="text-gray-700">Clinical Notes (optional)</span>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full rounded border-gray-300"
          />
        </label>
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Create Order
      </button>
    </form>
  )
}

export default LabOrderManager
