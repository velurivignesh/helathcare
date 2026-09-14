// frontend/types/lab.ts
export interface LabTestCategory {
  id: number;
  code: string;
  name: string;
  department: string;
  description?: string;
  isActive: boolean;
}

export interface LabTest {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  specimenType: string;
  container: string;
  fastingRequired: boolean;
  resultType: string; // "numeric" | "text"
  unit?: string;
  referenceRange?: string;
  criticalLow?: number;
  criticalHigh?: number;
  turnaroundTimeHours?: number;
  price?: number;
  isActive: boolean;
}

export interface LabOrderItem {
  id: number;
  orderId: number;
  testId: number;
  status: string; // pending, collected, completed
}

export interface LabOrder {
  id: number;
  orderNumber: string;
  patientId: number;
  doctorId: number;
  orderDate: string; // ISO8601
  priority: string;
  clinicalNotes?: string;
  diagnosisNotes?: string;
  collectionStatus: string;
  laboratoryStatus: string;
  billingStatus: string;
  totalAmount: number;
  items: LabOrderItem[];
}

export interface LabSample {
  id: number;
  orderItemId: number;
  collectedAt?: string;
  collectorId?: number;
  notes?: string;
}

export interface LabResult {
  id: number;
  sampleId: number;
  value?: string; // numeric as string or text
  unit?: string;
  referenceRange?: string;
  interpretation?: string;
  technicianNotes?: string;
  verified: boolean;
}

export interface LabReport {
  id: number;
  orderId: number;
  title: string;
  summary: string;
  clinicalInterpretation: string;
  abnormalCount: number;
  criticalCount: number;
  generatedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  status: string;
}

export interface LabStats {
  totalTests: number;
  totalOrders: number;
  pendingSamples: number;
  testsInAnalysis: number;
  completedReports: number;
  criticalAlerts: number;
}

export interface ApiError {
  message: string;
  status?: number;
}
