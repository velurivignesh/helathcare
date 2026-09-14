// frontend/__tests__/LabOrderManager.test.tsx

"use client"

import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { LabOrderManager } from "@/components/laboratory/LabOrderManager"
import * as hook from "@/hooks/useLabOrders"

// Mock the hook to provide deterministic data
jest.mock("@/hooks/useLabOrders", () => ({
  useLabOrders: jest.fn()
}))

describe('LabOrderManager', () => {
  it('renders loading state initially', () => {
    ;(hook.useLabOrders as jest.Mock).mockReturnValue({
      orders: [],
      totalCount: 0,
      loading: true,
      error: null,
      filter: { search: '', status: 'all', priority: 'all', collectionStatus: 'all', billingStatus: 'all', page: 1, pageSize: 20 },
      setPage: jest.fn(),
      setPageSize: jest.fn(),
      setSearch: jest.fn(),
      setStatus: jest.fn(),
      setPriority: jest.fn(),
      setCollectionStatus: jest.fn(),
      setBillingStatus: jest.fn(),
      selectedOrder: null,
      setSelectedOrder: jest.fn(),
      addOrder: jest.fn(),
    })

    render(<LabOrderManager />)
    expect(screen.getByText(/Loading lab orders/i)).toBeInTheDocument()
  })
})
