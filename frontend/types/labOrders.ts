// frontend/types/labOrders.ts

/**
 * TypeScript interfaces for Laboratory Orders based on the FastAPI OpenAPI schema.
 * These definitions reflect the exact fields accepted by the backend endpoints.
 */

/**
 * Payload for creating a new laboratory order (POST /lab/orders).
 */
export interface LabOrderCreate {
  /** Identifier of the patient for whom the order is created */
  patient_id: number;
  /** Identifier of the attending doctor (optional) */
  doctor_id?: number | null;
  /** Order priority – matches the enum values defined in the backend */
  priority?: "Routine" | "Urgent" | "Stat" | null;
  /** Clinical notes provided by the ordering clinician */
  clinical_notes?: string | null;
  /** Diagnosis notes (optional) */
  diagnosis_notes?: string | null;
  /** List of test IDs to be included in the order */
  test_ids: number[];
}

/**
 * Representation of a laboratory order as returned by GET /lab/orders and GET /lab/orders/{order_id}.
 */
export interface LabOrder {
  id: number;
  orderNumber: string;
  patientId: number;
  doctorId?: number | null;
  orderDate: string; // ISO8601 timestamp
  priority: string;
  clinicalNotes?: string;
  diagnosisNotes?: string;
  collectionStatus: string; // e.g., "Pending", "Collected"
  laboratoryStatus: string; // e.g., "InAnalysis", "Completed"
  billingStatus: string; // e.g., "Unbilled", "Billed"
  totalAmount: number;
  items: LabOrderItem[];
}

/**
 * Individual test item within a laboratory order.
 */
export interface LabOrderItem {
  id: number;
  orderId: number;
  testId: number;
  status: string; // e.g., "pending", "collected", "completed"
}

/**
 * Payload for collecting a sample for a specific order item (POST /lab/orders/{order_id}/collect-sample).
 */
export interface LabSampleCollect {
  /** Type of container used for the specimen (optional) */
  container_type?: string;
  /** Identifier of the staff member who collected the sample (optional) */
  collected_by?: number;
  /** Storage location description (backend default: "Main Lab Specimen Fridge") */
  storage_location?: string;
  /** Additional notes about the collection */
  notes?: string;
}

/**
 * Payload for entering a laboratory result (POST /lab/results).
 */
export interface LabResultEntry {
  /** Reference to the specific order item sample */
  lab_order_item_id: number;
  /** Result value – may be numeric or textual */
  result_value?: string;
  /** Numeric representation of the result (if applicable) */
  result_numeric_value?: number;
  /** Free‑form text result (if applicable) */
  result_text?: string;
  /** Technician notes */
  technician_notes?: string;
  /** Identifier of the staff who performed the test */
  performed_by?: number;
}

/**
 * Payload for generating a report for an order (POST /lab/orders/{order_id}/generate-report).
 * No body is required – the endpoint expects an empty JSON object.
 */
export type LabReportGeneratePayload = Record<string, never>;

/**
 * Representation of a laboratory report as returned by GET /lab/reports.
 */
export interface LabReport {
  id: number;
  orderId: number;
  title: string;
  summary: string;
  clinicalInterpretation: string;
  abnormalCount: number;
  criticalCount: number;
  generatedAt: string; // ISO8601
  verifiedAt?: string;
  verifiedBy?: string;
  status: string;
}

/**
 * Auxiliary statistics returned by GET /lab/stats (subset relevant to orders).
 */
export interface LabStats {
  totalTests: number;
  totalOrders: number;
  pendingSamples: number;
  testsInAnalysis: number;
  completedReports: number;
  criticalAlerts: number;
}

/**
 * Filter state used by the LabOrderManager UI.
 */
export interface LabOrderFilterState {
  search: string;
  status: string; // "all" or specific status
  priority: string; // "all" or specific
  collectionStatus: string; // "all" or specific
  billingStatus: string; // "all" or specific
  dateFrom?: string; // ISO date
  dateTo?: string; // ISO date
  page: number;
  pageSize: number;
}

/**
 * Generic API error shape used across the frontend services.
 */
export interface ApiError {
  message: string;
  status?: number;
}
