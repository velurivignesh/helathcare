// frontend/hooks/useLabOrders.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchLabOrders,
  fetchLabOrder,
  createLabOrder,
  collectSample,
  enterLabResult,
  generateLabReport,
} from "../services/labApi";
import type { LabOrder, LabOrderCreate, LabSampleCollect, LabResultEntry, LabOrderFilterState } from "../types/labOrders";

/**
 * Hook to manage Lab Orders list, pagination, filters, and actions.
 * All pagination is client‑side because the backend does not expose page/size.
 */
export function useLabOrders(initialPageSize: number = 20) {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<LabOrderFilterState>({
    search: "",
    status: "all",
    priority: "all",
    collectionStatus: "all",
    billingStatus: "all",
    page: 1,
    pageSize: initialPageSize,
  });
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { patient_id?: number; status?: string } = {};
      if (filter.status && filter.status !== "all") params.status = filter.status;
      const data = await fetchLabOrders(params);
      setOrders(data);
      setTotalCount(data.length);
    } catch (e: any) {
      setError(e.message ?? "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [filter.status]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Client‑side pagination and filtering
  const paginatedOrders = orders
    .filter((o) => {
      if (filter.search) {
        const term = filter.search.toLowerCase();
        return (
          o.orderNumber?.toLowerCase().includes(term) ||
          o.clinicalNotes?.toLowerCase().includes(term) ||
          o.diagnosisNotes?.toLowerCase().includes(term)
        );
      }
      return true;
    })
    .filter((o) => (filter.priority !== "all" ? o.priority === filter.priority : true))
    .filter((o) => (filter.collectionStatus !== "all" ? o.collectionStatus === filter.collectionStatus : true))
    .filter((o) => (filter.billingStatus !== "all" ? o.billingStatus === filter.billingStatus : true))
    .slice((filter.page - 1) * filter.pageSize, filter.page * filter.pageSize);

  const setPage = (page: number) => setFilter((prev) => ({ ...prev, page }));
  const setPageSize = (size: number) => setFilter((prev) => ({ ...prev, pageSize: size, page: 1 }));
  const setSearch = (search: string) => setFilter((prev) => ({ ...prev, search, page: 1 }));
  const setStatus = (status: string) => setFilter((prev) => ({ ...prev, status, page: 1 }));
  const setPriority = (priority: string) => setFilter((prev) => ({ ...prev, priority, page: 1 }));
  const setCollectionStatus = (cs: string) => setFilter((prev) => ({ ...prev, collectionStatus: cs, page: 1 }));
  const setBillingStatus = (bs: string) => setFilter((prev) => ({ ...prev, billingStatus: bs, page: 1 }));

  // Mutations
  const addOrder = async (payload: LabOrderCreate) => {
    const created = await createLabOrder(payload);
    setOrders((prev) => [created, ...prev]);
    setTotalCount((c) => c + 1);
  };

  const submitCollectSample = async (orderId: number, payload: LabSampleCollect) => {
    await collectSample(orderId, payload);
    const refreshed = await fetchLabOrder(orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? refreshed : o)));
  };

  const submitResult = async (payload: LabResultEntry) => {
    await enterLabResult(payload);
    // Optionally refresh affected order.
  };

  const submitReport = async (orderId: number) => {
    await generateLabReport(orderId);
    const refreshed = await fetchLabOrder(orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? refreshed : o)));
  };

  return {
    orders: paginatedOrders,
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
    submitCollectSample,
    submitResult,
    submitReport,
  };
}
