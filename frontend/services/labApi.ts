// frontend/services/labApi.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const AUTH_TOKEN = "demo-token"; // development/demo authentication

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${AUTH_TOKEN}`,
  } as HeadersInit;
}

/** Generic request helper */
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: { ...(options.headers ?? {}), ...getHeaders() },
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API error ${response.status}: ${errorBody}`);
  }
  const data = (await response.json()) as T;
  return data;
}

/** Lab Stats */
export interface LabStatsResponse {
  totalTests: number;
  totalOrders: number;
  pendingSamples: number;
  testsInAnalysis: number;
  completedReports: number;
  criticalAlerts: number;
}
export async function fetchLabStats(): Promise<LabStatsResponse> {
  return request<LabStatsResponse>("/lab/stats");
}

/** Test Catalog */
import type { LabTest } from "../types/lab";
export async function fetchLabTests(params?: { search?: string; categoryId?: number; active?: boolean }): Promise<LabTest[]> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.categoryId) query.append("categoryId", String(params.categoryId));
  if (params?.active !== undefined) query.append("active", String(params.active));
  return request<LabTest[]>("/lab/tests" + (query.toString() ? `?${query}` : ""));
}
export async function createLabTest(test: Partial<LabTest>): Promise<LabTest> {
  return request<LabTest>("/lab/tests", { method: "POST", body: JSON.stringify(test) });
}

/** Test Categories */
import type { LabTestCategory } from "../types/lab";
export async function fetchLabCategories(): Promise<LabTestCategory[]> {
  return request<LabTestCategory[]>("/lab/categories");
}
export async function createLabCategory(cat: Partial<LabTestCategory>): Promise<LabTestCategory> {
  return request<LabTestCategory>("/lab/categories", { method: "POST", body: JSON.stringify(cat) });
}

/** Lab Orders */
import type { LabOrder, LabOrderCreate, LabSampleCollect, LabResultEntry } from "../types/labOrders";

export async function fetchLabOrders(params?: { patient_id?: number; status?: string }): Promise<LabOrder[]> {
  const query = new URLSearchParams();
  if (params?.patient_id !== undefined) query.append("patient_id", String(params.patient_id));
  if (params?.status) query.append("status", params.status);
  const qs = query.toString() ? `?${query}` : "";
  return request<LabOrder[]>(`/lab/orders${qs}`);
}

export async function createLabOrder(payload: LabOrderCreate): Promise<LabOrder> {
  return request<LabOrder>("/lab/orders", { method: "POST", body: JSON.stringify(payload) });
}

export async function fetchLabOrder(orderId: number): Promise<LabOrder> {
  return request<LabOrder>(`/lab/orders/${orderId}`);
}

export async function collectSample(orderId: number, payload: LabSampleCollect): Promise<void> {
  await request<void>(`/lab/orders/${orderId}/collect-sample`, { method: "POST", body: JSON.stringify(payload) });
}

export async function enterLabResult(payload: LabResultEntry): Promise<void> {
  await request<void>("/lab/results", { method: "POST", body: JSON.stringify(payload) });
}

export async function generateLabReport(orderId: number): Promise<void> {
  await request<void>(`/lab/orders/${orderId}/generate-report`, { method: "POST" });
}

/** Samples */
export async function markSampleCollected(sampleId: number): Promise<void> {
  await request<void>(`/lab/samples/${sampleId}/collect`, { method: "POST" });
}

/** Results */
import type { LabResult } from "../types/lab";
export async function submitLabResult(result: Partial<LabResult>): Promise<LabResult> {
  return request<LabResult>("/lab/results", { method: "POST", body: JSON.stringify(result) });
}
export async function verifyLabResult(resultId: number): Promise<void> {
  await request<void>(`/lab/results/${resultId}/verify`, { method: "POST" });
}

/** Reports */
import type { LabReport } from "../types/lab";
export async function fetchLabReports(): Promise<LabReport[]> {
  return request<LabReport[]>("/lab/reports");
}
export async function fetchLabReport(reportId: number): Promise<LabReport> {
  return request<LabReport>(`/lab/reports/${reportId}`);
}

/** Critical Results */
export async function fetchCriticalResults(): Promise<LabResult[]> {
  return request<LabResult[]>("/lab/results/critical");
}
