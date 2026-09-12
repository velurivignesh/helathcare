"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";

/**
 * MediCare Clinic
 * Medical Records Management
 *
 * This page intentionally keeps the implementation local:
 * - Frontend: Next.js + TypeScript
 * - Backend: local FastAPI server
 * - No external healthcare/payment/AI APIs
 * - Demo/synthetic healthcare data only
 *
 * The module is designed as a substantial foundation for a larger
 * clinical-record workflow. It includes search, filtering, records,
 * encounters, diagnoses, medications, allergies, vital signs, labs,
 * procedures, care plans, follow-ups, timeline activity, validation,
 * pagination, responsive UI, and local backend integration.
 */

const API_BASE = "http://127.0.0.1:8000";

type RecordStatus =
  | "Draft"
  | "Active"
  | "Under Review"
  | "Completed"
  | "Archived";

type Priority = "Low" | "Normal" | "High" | "Urgent";

type Patient = {
  id: number;
  name: string;
  age: number;
  phone: string;
};

type Doctor = {
  id: number;
  name: string;
  specialization: string;
  phone: string;
};

type MedicalRecord = {
  id: number;
  patient_id: number;
  doctor_id: number | null;
  record_number: string;
  title: string;
  visit_date: string;
  record_type: string;
  status: RecordStatus;
  priority: Priority;
  chief_complaint: string;
  symptoms: string;
  diagnosis: string;
  clinical_notes: string;
  treatment_plan: string;
  follow_up_date: string;
  created_at: string;
  updated_at: string;
};

type VitalSign = {
  id: number;
  patient_id: number;
  record_id: number;
  recorded_at: string;
  temperature: string;
  heart_rate: string;
  respiratory_rate: string;
  systolic_bp: string;
  diastolic_bp: string;
  oxygen_saturation: string;
  weight: string;
  height: string;
  notes: string;
};

type Medication = {
  id: number;
  patient_id: number;
  record_id: number;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  duration: string;
  instructions: string;
  status: "Active" | "Stopped" | "Completed";
};

type Allergy = {
  id: number;
  patient_id: number;
  record_id: number;
  allergen: string;
  reaction: string;
  severity: "Mild" | "Moderate" | "Severe";
  notes: string;
};

type LabResult = {
  id: number;
  patient_id: number;
  record_id: number;
  test_name: string;
  result: string;
  unit: string;
  reference_range: string;
  status: "Normal" | "Abnormal" | "Critical" | "Pending";
  tested_at: string;
  notes: string;
};

type ProcedureRecord = {
  id: number;
  patient_id: number;
  record_id: number;
  procedure_name: string;
  procedure_date: string;
  performed_by: string;
  outcome: string;
  notes: string;
};

type CarePlan = {
  id: number;
  patient_id: number;
  record_id: number;
  title: string;
  goals: string;
  interventions: string;
  start_date: string;
  review_date: string;
  status: "Planned" | "Active" | "Completed" | "Cancelled";
};

type FollowUp = {
  id: number;
  patient_id: number;
  record_id: number;
  follow_up_date: string;
  reason: string;
  instructions: string;
  status: "Scheduled" | "Completed" | "Cancelled";
};

type TimelineItem = {
  id: string;
  date: string;
  category: string;
  title: string;
  description: string;
};

type Toast = {
  type: "success" | "error" | "info";
  text: string;
};

const demoRecords: MedicalRecord[] = [
  {
    id: 1,
    patient_id: 1,
    doctor_id: 1,
    record_number: "MR-2026-0001",
    title: "General consultation",
    visit_date: "2026-09-01",
    record_type: "Consultation",
    status: "Active",
    priority: "Normal",
    chief_complaint: "Routine health review",
    symptoms: "Mild fatigue",
    diagnosis: "General health assessment",
    clinical_notes:
      "Synthetic demonstration record for the MediCare Clinic medical records module.",
    treatment_plan: "Hydration, balanced diet, regular sleep, and routine follow-up.",
    follow_up_date: "2026-10-01",
    created_at: "2026-09-01T09:00:00",
    updated_at: "2026-09-01T09:30:00",
  },
  {
    id: 2,
    patient_id: 2,
    doctor_id: 1,
    record_number: "MR-2026-0002",
    title: "Cardiology review",
    visit_date: "2026-09-03",
    record_type: "Specialist Review",
    status: "Under Review",
    priority: "High",
    chief_complaint: "Intermittent chest discomfort",
    symptoms: "Intermittent discomfort during exertion",
    diagnosis: "Evaluation required",
    clinical_notes:
      "Synthetic record. Further clinical assessment and diagnostic review are indicated.",
    treatment_plan: "Clinical review and appropriate diagnostic evaluation.",
    follow_up_date: "2026-09-17",
    created_at: "2026-09-03T10:00:00",
    updated_at: "2026-09-03T10:30:00",
  },
  {
    id: 3,
    patient_id: 3,
    doctor_id: 1,
    record_number: "MR-2026-0003",
    title: "Follow-up consultation",
    visit_date: "2026-09-05",
    record_type: "Follow-up",
    status: "Completed",
    priority: "Normal",
    chief_complaint: "Follow-up visit",
    symptoms: "Symptoms improving",
    diagnosis: "Improving condition",
    clinical_notes: "Synthetic follow-up record.",
    treatment_plan: "Continue previously documented care plan.",
    follow_up_date: "",
    created_at: "2026-09-05T11:00:00",
    updated_at: "2026-09-05T11:20:00",
  },
];

const emptyRecord = (): Omit<
  MedicalRecord,
  "id" | "record_number" | "created_at" | "updated_at"
> => ({
  patient_id: 0,
  doctor_id: null,
  title: "",
  visit_date: new Date().toISOString().slice(0, 10),
  record_type: "Consultation",
  status: "Draft",
  priority: "Normal",
  chief_complaint: "",
  symptoms: "",
  diagnosis: "",
  clinical_notes: "",
  treatment_plan: "",
  follow_up_date: "",
});

const emptyVital = (): Omit<VitalSign, "id"> => ({
  patient_id: 0,
  record_id: 0,
  recorded_at: new Date().toISOString().slice(0, 16),
  temperature: "",
  heart_rate: "",
  respiratory_rate: "",
  systolic_bp: "",
  diastolic_bp: "",
  oxygen_saturation: "",
  weight: "",
  height: "",
  notes: "",
});

const emptyMedication = (): Omit<Medication, "id"> => ({
  patient_id: 0,
  record_id: 0,
  name: "",
  dosage: "",
  frequency: "Once daily",
  route: "Oral",
  duration: "",
  instructions: "",
  status: "Active",
});

const emptyAllergy = (): Omit<Allergy, "id"> => ({
  patient_id: 0,
  record_id: 0,
  allergen: "",
  reaction: "",
  severity: "Moderate",
  notes: "",
});

const emptyLab = (): Omit<LabResult, "id"> => ({
  patient_id: 0,
  record_id: 0,
  test_name: "",
  result: "",
  unit: "",
  reference_range: "",
  status: "Pending",
  tested_at: new Date().toISOString().slice(0, 16),
  notes: "",
});

const emptyProcedure = (): Omit<ProcedureRecord, "id"> => ({
  patient_id: 0,
  record_id: 0,
  procedure_name: "",
  procedure_date: new Date().toISOString().slice(0, 10),
  performed_by: "",
  outcome: "",
  notes: "",
});

const emptyCarePlan = (): Omit<CarePlan, "id"> => ({
  patient_id: 0,
  record_id: 0,
  title: "",
  goals: "",
  interventions: "",
  start_date: new Date().toISOString().slice(0, 10),
  review_date: "",
  status: "Planned",
});

const emptyFollowUp = (): Omit<FollowUp, "id"> => ({
  patient_id: 0,
  record_id: 0,
  follow_up_date: "",
  reason: "",
  instructions: "",
  status: "Scheduled",
});

function formatDate(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Draft: "bg-slate-100 text-slate-700 border-slate-200",
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Under Review": "bg-amber-50 text-amber-700 border-amber-200",
    Completed: "bg-blue-50 text-blue-700 border-blue-200",
    Archived: "bg-zinc-100 text-zinc-600 border-zinc-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Normal: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Abnormal: "bg-amber-50 text-amber-700 border-amber-200",
    Critical: "bg-red-50 text-red-700 border-red-200",
    Scheduled: "bg-blue-50 text-blue-700 border-blue-200",
    Cancelled: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
        styles[status] ?? "bg-slate-100 text-slate-700 border-slate-200",
      )}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const styles: Record<Priority, string> = {
    Low: "bg-slate-50 text-slate-600 border-slate-200",
    Normal: "bg-blue-50 text-blue-700 border-blue-200",
    High: "bg-orange-50 text-orange-700 border-orange-200",
    Urgent: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
        styles[priority],
      )}
    >
      {priority}
    </span>
  );
}

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name:
    | "file"
    | "search"
    | "plus"
    | "close"
    | "patient"
    | "doctor"
    | "calendar"
    | "heart"
    | "pill"
    | "lab"
    | "activity"
    | "check"
    | "edit"
    | "trash"
    | "arrow"
    | "filter"
    | "refresh"
    | "shield"
    | "note"
    | "clipboard";
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const paths: Record<string, React.ReactNode> = {
    file: (
      <>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h5M9 13h6M9 17h6M9 9h2" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    patient: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    doctor: (
      <>
        <circle cx="9" cy="7" r="4" />
        <path d="M2 21a7 7 0 0 1 14 0M19 8v6M16 11h6" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4M16 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </>
    ),
    heart: (
      <path d="M20.8 8.8c0 5.3-8.8 10.2-8.8 10.2S3.2 14.1 3.2 8.8A4.8 4.8 0 0 1 12 6.3a4.8 4.8 0 0 1 8.8 2.5Z" />
    ),
    pill: (
      <>
        <path d="m7 7 10 10" />
        <rect x="5" y="3" width="7" height="18" rx="3.5" transform="rotate(45 8.5 12)" />
      </>
    ),
    lab: (
      <>
        <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3" />
        <path d="M8 15h8" />
      </>
    ),
    activity: (
      <path d="M3 12h4l2-6 4 12 2-6h6" />
    ),
    check: <path d="m5 12 4 4L19 6" />,
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M10 11v6M14 11v6M9 7V4h6v3M6 7l1 14h10l1-14" />
      </>
    ),
    arrow: <path d="m9 18 6-6-6-6" />,
    filter: (
      <path d="M4 5h16M7 12h10M10 19h4" />
    ),
    refresh: (
      <path d="M20 11a8 8 0 0 0-14-5L4 8M4 5v3h3M4 13a8 8 0 0 0 14 5l2-2M20 19v-3h-3" />
    ),
    shield: (
      <path d="M12 3 20 6v5c0 5-3.3 8.4-8 10-4.7-1.6-8-5-8-10V6z" />
    ),
    note: (
      <>
        <path d="M5 3h14v18H5z" />
        <path d="M8 7h8M8 11h8M8 15h5" />
      </>
    ),
    clipboard: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4V2h6v2M8 9h8M8 13h8M8 17h5" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function StatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      />
    </label>
  );
}

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-slate-900">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>(demoRecords);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [labs, setLabs] = useState<LabResult[]>([]);
  const [procedures, setProcedures] = useState<ProcedureRecord[]>([]);
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    RecordStatus | "All Statuses"
  >("All Statuses");
  const [priorityFilter, setPriorityFilter] = useState<
    Priority | "All Priorities"
  >("All Priorities");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [sortOrder, setSortOrder] = useState("Newest First");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showVitals, setShowVitals] = useState(false);
  const [showMedication, setShowMedication] = useState(false);
  const [showAllergy, setShowAllergy] = useState(false);
  const [showLab, setShowLab] = useState(false);
  const [showProcedure, setShowProcedure] = useState(false);
  const [showCarePlan, setShowCarePlan] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);

  const [recordForm, setRecordForm] =
    useState(emptyRecord());
  const [vitalForm, setVitalForm] = useState(emptyVital());
  const [medicationForm, setMedicationForm] =
    useState(emptyMedication());
  const [allergyForm, setAllergyForm] = useState(emptyAllergy());
  const [labForm, setLabForm] = useState(emptyLab());
  const [procedureForm, setProcedureForm] =
    useState(emptyProcedure());
  const [carePlanForm, setCarePlanForm] =
    useState(emptyCarePlan());
  const [followUpForm, setFollowUpForm] =
    useState(emptyFollowUp());

  const [activeTab, setActiveTab] = useState<
    "overview" | "clinical" | "medications" | "labs" | "timeline"
  >("overview");

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [backendConnected, setBackendConnected] = useState(false);

  const selectedRecord = useMemo(
    () => records.find((record) => record.id === selectedRecordId) ?? null,
    [records, selectedRecordId],
  );

  const selectedPatient = useMemo(
    () =>
      selectedRecord
        ? patients.find((patient) => patient.id === selectedRecord.patient_id)
        : undefined,
    [patients, selectedRecord],
  );

  const selectedDoctor = useMemo(
    () =>
      selectedRecord?.doctor_id
        ? doctors.find((doctor) => doctor.id === selectedRecord.doctor_id)
        : undefined,
    [doctors, selectedRecord],
  );

  const filteredRecords = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    const filtered = records.filter((record) => {
      const patient = patients.find((item) => item.id === record.patient_id);
      const doctor = doctors.find((item) => item.id === record.doctor_id);

      const searchMatch =
        !normalized ||
        record.record_number.toLowerCase().includes(normalized) ||
        record.title.toLowerCase().includes(normalized) ||
        record.diagnosis.toLowerCase().includes(normalized) ||
        record.chief_complaint.toLowerCase().includes(normalized) ||
        patient?.name.toLowerCase().includes(normalized) ||
        doctor?.name.toLowerCase().includes(normalized);

      const statusMatch =
        statusFilter === "All Statuses" || record.status === statusFilter;

      const priorityMatch =
        priorityFilter === "All Priorities" ||
        record.priority === priorityFilter;

      const typeMatch =
        typeFilter === "All Types" || record.record_type === typeFilter;

      return searchMatch && statusMatch && priorityMatch && typeMatch;
    });

    return [...filtered].sort((a, b) => {
      if (sortOrder === "Oldest First") {
        return a.visit_date.localeCompare(b.visit_date);
      }
      if (sortOrder === "Priority") {
        const rank: Record<Priority, number> = {
          Urgent: 4,
          High: 3,
          Normal: 2,
          Low: 1,
        };
        return rank[b.priority] - rank[a.priority];
      }
      return b.visit_date.localeCompare(a.visit_date);
    });
  }, [
    records,
    patients,
    doctors,
    search,
    statusFilter,
    priorityFilter,
    typeFilter,
    sortOrder,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));

  const paginatedRecords = useMemo(
    () =>
      filteredRecords.slice((page - 1) * pageSize, page * pageSize),
    [filteredRecords, page],
  );

  const recordVitals = useMemo(
    () =>
      selectedRecord
        ? vitals.filter((item) => item.record_id === selectedRecord.id)
        : [],
    [vitals, selectedRecord],
  );

  const recordMedications = useMemo(
    () =>
      selectedRecord
        ? medications.filter(
            (item) => item.record_id === selectedRecord.id,
          )
        : [],
    [medications, selectedRecord],
  );

  const recordAllergies = useMemo(
    () =>
      selectedRecord
        ? allergies.filter((item) => item.record_id === selectedRecord.id)
        : [],
    [allergies, selectedRecord],
  );

  const recordLabs = useMemo(
    () =>
      selectedRecord
        ? labs.filter((item) => item.record_id === selectedRecord.id)
        : [],
    [labs, selectedRecord],
  );

  const recordProcedures = useMemo(
    () =>
      selectedRecord
        ? procedures.filter(
            (item) => item.record_id === selectedRecord.id,
          )
        : [],
    [procedures, selectedRecord],
  );

  const recordCarePlans = useMemo(
    () =>
      selectedRecord
        ? carePlans.filter(
            (item) => item.record_id === selectedRecord.id,
          )
        : [],
    [carePlans, selectedRecord],
  );

  const recordFollowUps = useMemo(
    () =>
      selectedRecord
        ? followUps.filter(
            (item) => item.record_id === selectedRecord.id,
          )
        : [],
    [followUps, selectedRecord],
  );

  const timeline = useMemo<TimelineItem[]>(() => {
    if (!selectedRecord) return [];

    const items: TimelineItem[] = [
      {
        id: `record-${selectedRecord.id}`,
        date: selectedRecord.updated_at,
        category: "Medical Record",
        title: selectedRecord.title,
        description: `${selectedRecord.record_number} • ${selectedRecord.status}`,
      },
    ];

    recordVitals.forEach((item) =>
      items.push({
        id: `vital-${item.id}`,
        date: item.recorded_at,
        category: "Vitals",
        title: "Vital signs recorded",
        description: `BP ${item.systolic_bp}/${item.diastolic_bp} • HR ${item.heart_rate}`,
      }),
    );

    recordMedications.forEach((item) =>
      items.push({
        id: `med-${item.id}`,
        date: selectedRecord.updated_at,
        category: "Medication",
        title: item.name,
        description: `${item.dosage} • ${item.frequency}`,
      }),
    );

    recordLabs.forEach((item) =>
      items.push({
        id: `lab-${item.id}`,
        date: item.tested_at,
        category: "Laboratory",
        title: item.test_name,
        description: `${item.result} ${item.unit}`.trim(),
      }),
    );

    recordProcedures.forEach((item) =>
      items.push({
        id: `procedure-${item.id}`,
        date: item.procedure_date,
        category: "Procedure",
        title: item.procedure_name,
        description: item.outcome || "Procedure recorded",
      }),
    );

    recordFollowUps.forEach((item) =>
      items.push({
        id: `follow-${item.id}`,
        date: item.follow_up_date,
        category: "Follow-up",
        title: item.reason || "Follow-up",
        description: item.status,
      }),
    );

    return items.sort((a, b) => b.date.localeCompare(a.date));
  }, [
    selectedRecord,
    recordVitals,
    recordMedications,
    recordLabs,
    recordProcedures,
    recordFollowUps,
  ]);

  const statistics = useMemo(() => {
    const active = records.filter((item) => item.status === "Active").length;
    const review = records.filter(
      (item) => item.status === "Under Review",
    ).length;
    const urgent = records.filter((item) => item.priority === "Urgent").length;
    const completed = records.filter(
      (item) => item.status === "Completed",
    ).length;

    return { active, review, urgent, completed };
  }, [records]);

  function notify(type: Toast["type"], text: string) {
    setToast({ type, text });
    window.setTimeout(() => setToast(null), 3500);
  }

  async function loadBackendData() {
    setLoading(true);

    try {
      const [patientResponse, doctorResponse, recordResponse] =
        await Promise.all([
          fetch(`${API_BASE}/patients`),
          fetch(`${API_BASE}/doctors`),
          fetch(`${API_BASE}/medical-records`),
        ]);

      if (!patientResponse.ok || !doctorResponse.ok) {
        throw new Error("Backend data request failed.");
      }

      const patientData = await patientResponse.json();
      const doctorData = await doctorResponse.json();

      if (Array.isArray(patientData)) {
        setPatients(patientData);
      }

      if (Array.isArray(doctorData)) {
        setDoctors(doctorData);
      }

      if (recordResponse.ok) {
        const recordData = await recordResponse.json();
        if (Array.isArray(recordData) && recordData.length > 0) {
          setRecords(recordData);
        }
      }

      setBackendConnected(true);
    } catch {
      setBackendConnected(false);

      if (patients.length === 0) {
        setPatients([
          { id: 1, name: "Demo Patient One", age: 35, phone: "9000000001" },
          { id: 2, name: "Demo Patient Two", age: 48, phone: "9000000002" },
          { id: 3, name: "Demo Patient Three", age: 27, phone: "9000000003" },
        ]);
      }

      if (doctors.length === 0) {
        setDoctors([
          {
            id: 1,
            name: "Dr. Demo Physician",
            specialization: "General Medicine",
            phone: "9000000010",
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBackendData();
  }, []);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function openCreateRecord() {
    setRecordForm({
      ...emptyRecord(),
      patient_id: patients[0]?.id ?? 0,
      doctor_id: doctors[0]?.id ?? null,
    });
    setShowCreate(true);
  }

  function openEditRecord() {
    if (!selectedRecord) return;

    setRecordForm({
      patient_id: selectedRecord.patient_id,
      doctor_id: selectedRecord.doctor_id,
      title: selectedRecord.title,
      visit_date: selectedRecord.visit_date,
      record_type: selectedRecord.record_type,
      status: selectedRecord.status,
      priority: selectedRecord.priority,
      chief_complaint: selectedRecord.chief_complaint,
      symptoms: selectedRecord.symptoms,
      diagnosis: selectedRecord.diagnosis,
      clinical_notes: selectedRecord.clinical_notes,
      treatment_plan: selectedRecord.treatment_plan,
      follow_up_date: selectedRecord.follow_up_date,
    });

    setShowEdit(true);
  }

  function validateRecordForm() {
    if (!recordForm.patient_id) {
      notify("error", "Please select a patient.");
      return false;
    }

    if (!recordForm.title.trim()) {
      notify("error", "Please enter a record title.");
      return false;
    }

    if (!recordForm.visit_date) {
      notify("error", "Please select a visit date.");
      return false;
    }

    return true;
  }

  async function handleCreateRecord(event: FormEvent) {
    event.preventDefault();

    if (!validateRecordForm()) return;

    const nextId =
      Math.max(0, ...records.map((record) => record.id)) + 1;

    const nextRecord: MedicalRecord = {
      ...recordForm,
      id: nextId,
      record_number: `MR-2026-${String(nextId).padStart(4, "0")}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setRecords((current) => [nextRecord, ...current]);
    setSelectedRecordId(nextId);
    setShowCreate(false);
    setActiveTab("overview");
    notify("success", "Medical record created successfully.");

    try {
      await fetch(`${API_BASE}/medical-records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextRecord),
      });
    } catch {
      // Local demo mode remains usable without a backend endpoint.
    }
  }

  async function handleEditRecord(event: FormEvent) {
    event.preventDefault();

    if (!selectedRecord || !validateRecordForm()) return;

    const updatedRecord: MedicalRecord = {
      ...selectedRecord,
      ...recordForm,
      updated_at: new Date().toISOString(),
    };

    setRecords((current) =>
      current.map((record) =>
        record.id === selectedRecord.id ? updatedRecord : record,
      ),
    );

    setShowEdit(false);
    notify("success", "Medical record updated successfully.");

    try {
      await fetch(`${API_BASE}/medical-records/${selectedRecord.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRecord),
      });
    } catch {
      // Local state remains authoritative in demo mode.
    }
  }

  function deleteRecord() {
    if (!selectedRecord) return;

    const deletedId = selectedRecord.id;
    setRecords((current) =>
      current.filter((record) => record.id !== deletedId),
    );

    setSelectedRecordId(records.find((record) => record.id !== deletedId)?.id ?? null);
    setShowDeleteConfirm(false);
    notify("success", "Medical record removed from the local workspace.");

    void fetch(`${API_BASE}/medical-records/${deletedId}`, {
      method: "DELETE",
    }).catch(() => undefined);
  }

  function ensureSelectedRecord(action: string) {
    if (!selectedRecord) {
      notify("info", `Select a medical record before adding ${action}.`);
      return false;
    }
    return true;
  }

  function saveVital(event: FormEvent) {
    event.preventDefault();
    if (!ensureSelectedRecord("vital signs")) return;

    if (!vitalForm.systolic_bp && !vitalForm.heart_rate) {
      notify("error", "Enter at least blood pressure or heart rate.");
      return;
    }

    const nextId = Math.max(0, ...vitals.map((item) => item.id)) + 1;

    setVitals((current) => [
      ...current,
      {
        ...vitalForm,
        id: nextId,
        patient_id: selectedRecord!.patient_id,
        record_id: selectedRecord!.id,
      },
    ]);

    setShowVitals(false);
    setVitalForm(emptyVital());
    notify("success", "Vital signs added to the record.");
  }

  function saveMedication(event: FormEvent) {
    event.preventDefault();
    if (!ensureSelectedRecord("medication")) return;

    if (!medicationForm.name.trim() || !medicationForm.dosage.trim()) {
      notify("error", "Medication name and dosage are required.");
      return;
    }

    const nextId =
      Math.max(0, ...medications.map((item) => item.id)) + 1;

    setMedications((current) => [
      ...current,
      {
        ...medicationForm,
        id: nextId,
        patient_id: selectedRecord!.patient_id,
        record_id: selectedRecord!.id,
      },
    ]);

    setShowMedication(false);
    setMedicationForm(emptyMedication());
    notify("success", "Medication added.");
  }

  function saveAllergy(event: FormEvent) {
    event.preventDefault();
    if (!ensureSelectedRecord("allergy")) return;

    if (!allergyForm.allergen.trim()) {
      notify("error", "Allergen is required.");
      return;
    }

    const nextId = Math.max(0, ...allergies.map((item) => item.id)) + 1;

    setAllergies((current) => [
      ...current,
      {
        ...allergyForm,
        id: nextId,
        patient_id: selectedRecord!.patient_id,
        record_id: selectedRecord!.id,
      },
    ]);

    setShowAllergy(false);
    setAllergyForm(emptyAllergy());
    notify("success", "Allergy information added.");
  }

  function saveLab(event: FormEvent) {
    event.preventDefault();
    if (!ensureSelectedRecord("laboratory result")) return;

    if (!labForm.test_name.trim() || !labForm.result.trim()) {
      notify("error", "Test name and result are required.");
      return;
    }

    const nextId = Math.max(0, ...labs.map((item) => item.id)) + 1;

    setLabs((current) => [
      ...current,
      {
        ...labForm,
        id: nextId,
        patient_id: selectedRecord!.patient_id,
        record_id: selectedRecord!.id,
      },
    ]);

    setShowLab(false);
    setLabForm(emptyLab());
    notify("success", "Laboratory result added.");
  }

  function saveProcedure(event: FormEvent) {
    event.preventDefault();
    if (!ensureSelectedRecord("procedure")) return;

    if (!procedureForm.procedure_name.trim()) {
      notify("error", "Procedure name is required.");
      return;
    }

    const nextId =
      Math.max(0, ...procedures.map((item) => item.id)) + 1;

    setProcedures((current) => [
      ...current,
      {
        ...procedureForm,
        id: nextId,
        patient_id: selectedRecord!.patient_id,
        record_id: selectedRecord!.id,
      },
    ]);

    setShowProcedure(false);
    setProcedureForm(emptyProcedure());
    notify("success", "Procedure added.");
  }

  function saveCarePlan(event: FormEvent) {
    event.preventDefault();
    if (!ensureSelectedRecord("care plan")) return;

    if (!carePlanForm.title.trim()) {
      notify("error", "Care plan title is required.");
      return;
    }

    const nextId =
      Math.max(0, ...carePlans.map((item) => item.id)) + 1;

    setCarePlans((current) => [
      ...current,
      {
        ...carePlanForm,
        id: nextId,
        patient_id: selectedRecord!.patient_id,
        record_id: selectedRecord!.id,
      },
    ]);

    setShowCarePlan(false);
    setCarePlanForm(emptyCarePlan());
    notify("success", "Care plan added.");
  }

  function saveFollowUp(event: FormEvent) {
    event.preventDefault();
    if (!ensureSelectedRecord("follow-up")) return;

    if (!followUpForm.follow_up_date || !followUpForm.reason.trim()) {
      notify("error", "Follow-up date and reason are required.");
      return;
    }

    const nextId =
      Math.max(0, ...followUps.map((item) => item.id)) + 1;

    setFollowUps((current) => [
      ...current,
      {
        ...followUpForm,
        id: nextId,
        patient_id: selectedRecord!.patient_id,
        record_id: selectedRecord!.id,
      },
    ]);

    setShowFollowUp(false);
    setFollowUpForm(emptyFollowUp());
    notify("success", "Follow-up added.");
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("All Statuses");
    setPriorityFilter("All Priorities");
    setTypeFilter("All Types");
    setSortOrder("Newest First");
    setPage(1);
  }

  function removeMedication(id: number) {
    setMedications((current) => current.filter((item) => item.id !== id));
    notify("success", "Medication removed from local record.");
  }

  function removeAllergy(id: number) {
    setAllergies((current) => current.filter((item) => item.id !== id));
    notify("success", "Allergy entry removed from local record.");
  }

  function removeLab(id: number) {
    setLabs((current) => current.filter((item) => item.id !== id));
    notify("success", "Laboratory entry removed from local record.");
  }

  const recordTypes = Array.from(
    new Set(records.map((record) => record.record_type)),
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {toast ? (
        <div className="fixed right-5 top-5 z-[100] w-[min(420px,calc(100vw-40px))]">
          <div
            className={cn(
              "rounded-2xl border bg-white p-4 shadow-2xl",
              toast.type === "success" && "border-emerald-200",
              toast.type === "error" && "border-red-200",
              toast.type === "info" && "border-blue-200",
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  toast.type === "success" && "bg-emerald-50 text-emerald-600",
                  toast.type === "error" && "bg-red-50 text-red-600",
                  toast.type === "info" && "bg-blue-50 text-blue-600",
                )}
              >
                <Icon name={toast.type === "error" ? "close" : "check"} />
              </div>
              <p className="flex-1 text-sm font-medium leading-6 text-slate-700">
                {toast.text}
              </p>
              <button
                onClick={() => setToast(null)}
                className="text-slate-400 transition hover:text-slate-700"
                aria-label="Close notification"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
              <Icon name="heart" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">MediCare Clinic</p>
              <p className="text-xs text-slate-500">
                Medical Records Management
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <span
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold",
                backendConnected
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700",
              )}
            >
              {backendConnected
                ? "Local backend connected"
                : "Local demo workspace"}
            </span>

            <button
              onClick={() => void loadBackendData()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <Icon name="refresh" className="h-4 w-4" />
              Refresh
            </button>

            <button
              onClick={openCreateRecord}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Icon name="plus" className="h-4 w-4" />
              New Record
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] px-5 py-6 lg:px-8">
        <section className="mb-7">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="mb-2 text-sm font-semibold text-blue-600">
                Clinical Workspace
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                Medical Records
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
                Organize patient encounters, diagnoses, vital signs,
                medications, laboratory results, procedures, care plans, and
                follow-up activity in one local clinical workspace.
              </p>
            </div>

            <div className="flex gap-3 md:hidden">
              <button
                onClick={openCreateRecord}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Icon name="plus" className="h-4 w-4" />
                New Record
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Records"
            value={records.length}
            description="Clinical records in workspace"
            icon={<Icon name="file" />}
          />
          <StatCard
            label="Active Records"
            value={statistics.active}
            description="Currently active clinical records"
            icon={<Icon name="activity" />}
          />
          <StatCard
            label="Under Review"
            value={statistics.review}
            description="Records awaiting clinical review"
            icon={<Icon name="clipboard" />}
          />
          <StatCard
            label="Urgent Priority"
            value={statistics.urgent}
            description="Records marked urgent"
            icon={<Icon name="heart" />}
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
          <aside className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Record Directory
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {filteredRecords.length} matching records
                    </p>
                  </div>
                  <button
                    onClick={clearFilters}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Clear filters
                  </button>
                </div>

                <div className="relative mt-4">
                  <Icon
                    name="search"
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search patient, record, diagnosis..."
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <SelectField
                    label="Status"
                    value={statusFilter}
                    options={[
                      "All Statuses",
                      "Draft",
                      "Active",
                      "Under Review",
                      "Completed",
                      "Archived",
                    ]}
                    onChange={(value) => {
                      setStatusFilter(
                        value as RecordStatus | "All Statuses",
                      );
                      setPage(1);
                    }}
                  />

                  <SelectField
                    label="Priority"
                    value={priorityFilter}
                    options={[
                      "All Priorities",
                      "Low",
                      "Normal",
                      "High",
                      "Urgent",
                    ]}
                    onChange={(value) => {
                      setPriorityFilter(
                        value as Priority | "All Priorities",
                      );
                      setPage(1);
                    }}
                  />

                  <SelectField
                    label="Record Type"
                    value={typeFilter}
                    options={["All Types", ...recordTypes]}
                    onChange={(value) => {
                      setTypeFilter(value);
                      setPage(1);
                    }}
                  />

                  <SelectField
                    label="Sort"
                    value={sortOrder}
                    options={["Newest First", "Oldest First", "Priority"]}
                    onChange={setSortOrder}
                  />
                </div>
              </div>

              <div className="max-h-[740px] overflow-y-auto">
                {paginatedRecords.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Icon name="search" />
                    </div>
                    <h3 className="mt-4 font-semibold text-slate-900">
                      No records found
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Try changing your search or filters.
                    </p>
                  </div>
                ) : (
                  paginatedRecords.map((record) => {
                    const patient = patients.find(
                      (item) => item.id === record.patient_id,
                    );

                    return (
                      <button
                        key={record.id}
                        onClick={() => {
                          setSelectedRecordId(record.id);
                          setActiveTab("overview");
                        }}
                        className={cn(
                          "w-full border-b border-slate-100 p-5 text-left transition hover:bg-slate-50",
                          selectedRecordId === record.id &&
                            "bg-blue-50/70 shadow-[inset_3px_0_0_#2563eb]",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {patient?.name ?? `Patient #${record.patient_id}`}
                            </p>
                            <p className="mt-1 text-xs font-medium text-blue-600">
                              {record.record_number}
                            </p>
                          </div>
                          <PriorityBadge priority={record.priority} />
                        </div>

                        <p className="mt-3 truncate text-sm font-semibold text-slate-700">
                          {record.title}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <StatusBadge status={record.status} />
                          <span className="text-xs text-slate-400">
                            {formatDate(record.visit_date)}
                          </span>
                        </div>

                        <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
                          {record.diagnosis || record.chief_complaint || "No diagnosis recorded"}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
                <p className="text-xs text-slate-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            {!selectedRecord ? (
              <div className="flex min-h-[600px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <div>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                    <Icon name="file" className="h-8 w-8" />
                  </div>
                  <h2 className="mt-5 text-xl font-bold text-slate-900">
                    Select a medical record
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Select a record from the directory or create a new record
                    to begin managing clinical information.
                  </p>
                  <button
                    onClick={openCreateRecord}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    <Icon name="plus" className="h-4 w-4" />
                    Create Record
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5 md:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                        <Icon name="file" className="h-7 w-7" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-bold text-slate-950">
                            {selectedRecord.title}
                          </h2>
                          <StatusBadge status={selectedRecord.status} />
                          <PriorityBadge priority={selectedRecord.priority} />
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {selectedRecord.record_number} •{" "}
                          {formatDate(selectedRecord.visit_date)}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                          <span className="inline-flex items-center gap-2 text-slate-600">
                            <Icon name="patient" className="h-4 w-4 text-slate-400" />
                            {selectedPatient?.name ??
                              `Patient #${selectedRecord.patient_id}`}
                          </span>
                          <span className="inline-flex items-center gap-2 text-slate-600">
                            <Icon name="doctor" className="h-4 w-4 text-slate-400" />
                            {selectedDoctor?.name ?? "Doctor not assigned"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={openEditRecord}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Icon name="edit" className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        <Icon name="trash" className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Record Type
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {selectedRecord.record_type}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Created
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formatDateTime(selectedRecord.created_at)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Follow-up
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formatDate(selectedRecord.follow_up_date)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Last Updated
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formatDateTime(selectedRecord.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-b border-slate-200 px-5 md:px-6">
                  <div className="flex gap-1 overflow-x-auto">
                    {[
                      ["overview", "Overview"],
                      ["clinical", "Clinical"],
                      ["medications", "Medications"],
                      ["labs", "Laboratory"],
                      ["timeline", "Timeline"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() =>
                          setActiveTab(
                            value as
                              | "overview"
                              | "clinical"
                              | "medications"
                              | "labs"
                              | "timeline",
                          )
                        }
                        className={cn(
                          "whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition",
                          activeTab === value
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-800",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 md:p-6">
                  {activeTab === "overview" ? (
                    <div className="space-y-8">
                      <section>
                        <SectionTitle
                          icon={<Icon name="note" />}
                          title="Clinical Summary"
                          description="Primary information documented for this encounter."
                        />

                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="rounded-2xl border border-slate-200 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Chief Complaint
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-700">
                              {selectedRecord.chief_complaint || "Not documented"}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-slate-200 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Symptoms
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-700">
                              {selectedRecord.symptoms || "Not documented"}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-slate-200 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Diagnosis
                            </p>
                            <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">
                              {selectedRecord.diagnosis || "Not documented"}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-slate-200 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Treatment Plan
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-700">
                              {selectedRecord.treatment_plan || "Not documented"}
                            </p>
                          </div>
                        </div>
                      </section>

                      <section>
                        <SectionTitle
                          icon={<Icon name="activity" />}
                          title="Vital Signs"
                          description="Recorded measurements associated with this medical record."
                        />

                        {recordVitals.length === 0 ? (
                          <EmptyPanel
                            text="No vital signs have been recorded for this encounter."
                            action="Add Vital Signs"
                            onClick={() => {
                              setVitalForm({
                                ...emptyVital(),
                                patient_id: selectedRecord.patient_id,
                                record_id: selectedRecord.id,
                              });
                              setShowVitals(true);
                            }}
                          />
                        ) : (
                          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {[
                              ["Blood Pressure", `${recordVitals[0].systolic_bp}/${recordVitals[0].diastolic_bp}`, "mmHg"],
                              ["Heart Rate", recordVitals[0].heart_rate, "bpm"],
                              ["Temperature", recordVitals[0].temperature, "°C"],
                              ["SpO₂", recordVitals[0].oxygen_saturation, "%"],
                              ["Respiratory Rate", recordVitals[0].respiratory_rate, "/min"],
                              ["Weight", recordVitals[0].weight, "kg"],
                              ["Height", recordVitals[0].height, "cm"],
                              ["Recorded", formatDateTime(recordVitals[0].recorded_at), ""],
                            ].map(([label, value, unit]) => (
                              <div
                                key={label}
                                className="rounded-xl border border-slate-200 p-4"
                              >
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                  {label}
                                </p>
                                <p className="mt-2 text-lg font-bold text-slate-900">
                                  {value || "—"}{" "}
                                  {unit ? (
                                    <span className="text-xs font-medium text-slate-400">
                                      {unit}
                                    </span>
                                  ) : null}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </section>

                      <section>
                        <SectionTitle
                          icon={<Icon name="shield" />}
                          title="Allergies"
                          description="Known allergies recorded against this encounter."
                        />

                        {recordAllergies.length === 0 ? (
                          <EmptyPanel
                            text="No allergy entries are currently attached."
                            action="Add Allergy"
                            onClick={() => {
                              setAllergyForm({
                                ...emptyAllergy(),
                                patient_id: selectedRecord.patient_id,
                                record_id: selectedRecord.id,
                              });
                              setShowAllergy(true);
                            }}
                          />
                        ) : (
                          <div className="grid gap-3 md:grid-cols-2">
                            {recordAllergies.map((item) => (
                              <div
                                key={item.id}
                                className="rounded-xl border border-red-100 bg-red-50/40 p-4"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-bold text-slate-900">
                                      {item.allergen}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-600">
                                      Reaction: {item.reaction || "Not specified"}
                                    </p>
                                  </div>
                                  <StatusBadge status={item.severity} />
                                </div>
                                {item.notes ? (
                                  <p className="mt-3 text-xs leading-5 text-slate-500">
                                    {item.notes}
                                  </p>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        )}
                      </section>

                      <section>
                        <SectionTitle
                          icon={<Icon name="clipboard" />}
                          title="Care Plan & Follow-up"
                          description="Ongoing actions and planned review activity."
                        />

                        <div className="grid gap-4 lg:grid-cols-2">
                          {recordCarePlans.length > 0 ? (
                            recordCarePlans.map((plan) => (
                              <div
                                key={plan.id}
                                className="rounded-2xl border border-slate-200 p-5"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <h4 className="font-bold text-slate-900">
                                    {plan.title}
                                  </h4>
                                  <StatusBadge status={plan.status} />
                                </div>
                                <p className="mt-3 text-sm leading-6 text-slate-600">
                                  <strong>Goals:</strong> {plan.goals || "—"}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                  <strong>Interventions:</strong>{" "}
                                  {plan.interventions || "—"}
                                </p>
                                <p className="mt-3 text-xs text-slate-400">
                                  Review: {formatDate(plan.review_date)}
                                </p>
                              </div>
                            ))
                          ) : (
                            <EmptyPanel
                              text="No care plan has been attached."
                              action="Add Care Plan"
                              onClick={() => {
                                setCarePlanForm({
                                  ...emptyCarePlan(),
                                  patient_id: selectedRecord.patient_id,
                                  record_id: selectedRecord.id,
                                });
                                setShowCarePlan(true);
                              }}
                            />
                          )}

                          {recordFollowUps.length > 0 ? (
                            recordFollowUps.map((follow) => (
                              <div
                                key={follow.id}
                                className="rounded-2xl border border-slate-200 p-5"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <h4 className="font-bold text-slate-900">
                                    Follow-up
                                  </h4>
                                  <StatusBadge status={follow.status} />
                                </div>
                                <p className="mt-2 text-sm font-semibold text-slate-800">
                                  {follow.reason}
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                  {follow.instructions || "No additional instructions."}
                                </p>
                                <p className="mt-3 text-xs text-slate-400">
                                  Date: {formatDate(follow.follow_up_date)}
                                </p>
                              </div>
                            ))
                          ) : (
                            <EmptyPanel
                              text="No follow-up appointment is recorded."
                              action="Add Follow-up"
                              onClick={() => {
                                setFollowUpForm({
                                  ...emptyFollowUp(),
                                  patient_id: selectedRecord.patient_id,
                                  record_id: selectedRecord.id,
                                });
                                setShowFollowUp(true);
                              }}
                            />
                          )}
                        </div>
                      </section>
                    </div>
                  ) : null}

                  {activeTab === "clinical" ? (
                    <div className="space-y-8">
                      <section>
                        <SectionTitle
                          icon={<Icon name="note" />}
                          title="Clinical Notes"
                          description="Narrative documentation for the encounter."
                        />

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                            {selectedRecord.clinical_notes ||
                              "No clinical notes have been entered."}
                          </p>
                        </div>
                      </section>

                      <section>
                        <SectionTitle
                          icon={<Icon name="activity" />}
                          title="Vital Sign History"
                          description="Measurements captured during the record lifecycle."
                        />

                        {recordVitals.length === 0 ? (
                          <EmptyPanel
                            text="No vital sign history is available."
                            action="Record Vitals"
                            onClick={() => {
                              setVitalForm({
                                ...emptyVital(),
                                patient_id: selectedRecord.patient_id,
                                record_id: selectedRecord.id,
                              });
                              setShowVitals(true);
                            }}
                          />
                        ) : (
                          <div className="overflow-x-auto rounded-2xl border border-slate-200">
                            <table className="min-w-[850px] w-full text-left text-sm">
                              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                  <th className="px-4 py-3">Recorded</th>
                                  <th className="px-4 py-3">BP</th>
                                  <th className="px-4 py-3">HR</th>
                                  <th className="px-4 py-3">Temp</th>
                                  <th className="px-4 py-3">SpO₂</th>
                                  <th className="px-4 py-3">Weight</th>
                                  <th className="px-4 py-3">Notes</th>
                                </tr>
                              </thead>
                              <tbody>
                                {recordVitals.map((item) => (
                                  <tr
                                    key={item.id}
                                    className="border-t border-slate-100"
                                  >
                                    <td className="px-4 py-3 text-slate-600">
                                      {formatDateTime(item.recorded_at)}
                                    </td>
                                    <td className="px-4 py-3 font-semibold">
                                      {item.systolic_bp}/{item.diastolic_bp}
                                    </td>
                                    <td className="px-4 py-3">
                                      {item.heart_rate || "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                      {item.temperature || "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                      {item.oxygen_saturation || "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                      {item.weight || "—"}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">
                                      {item.notes || "—"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </section>

                      <section>
                        <SectionTitle
                          icon={<Icon name="clipboard" />}
                          title="Procedures"
                          description="Procedures documented against this encounter."
                        />

                        {recordProcedures.length === 0 ? (
                          <EmptyPanel
                            text="No procedures are recorded."
                            action="Add Procedure"
                            onClick={() => {
                              setProcedureForm({
                                ...emptyProcedure(),
                                patient_id: selectedRecord.patient_id,
                                record_id: selectedRecord.id,
                              });
                              setShowProcedure(true);
                            }}
                          />
                        ) : (
                          <div className="space-y-3">
                            {recordProcedures.map((item) => (
                              <div
                                key={item.id}
                                className="rounded-2xl border border-slate-200 p-5"
                              >
                                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                                  <div>
                                    <h4 className="font-bold text-slate-900">
                                      {item.procedure_name}
                                    </h4>
                                    <p className="mt-1 text-xs text-slate-500">
                                      {formatDate(item.procedure_date)} •{" "}
                                      {item.performed_by || "Clinician not specified"}
                                    </p>
                                  </div>
                                  <StatusBadge status={item.outcome || "Recorded"} />
                                </div>
                                {item.notes ? (
                                  <p className="mt-3 text-sm leading-6 text-slate-600">
                                    {item.notes}
                                  </p>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                    </div>
                  ) : null}

                  {activeTab === "medications" ? (
                    <div className="space-y-8">
                      <section>
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                          <SectionTitle
                            icon={<Icon name="pill" />}
                            title="Medication List"
                            description="Medication entries associated with this record."
                          />
                          <button
                            onClick={() => {
                              setMedicationForm({
                                ...emptyMedication(),
                                patient_id: selectedRecord.patient_id,
                                record_id: selectedRecord.id,
                              });
                              setShowMedication(true);
                            }}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white"
                          >
                            <Icon name="plus" className="h-4 w-4" />
                            Add Medication
                          </button>
                        </div>

                        {recordMedications.length === 0 ? (
                          <EmptyPanel
                            text="No medication has been recorded for this encounter."
                            action="Add Medication"
                            onClick={() => {
                              setMedicationForm({
                                ...emptyMedication(),
                                patient_id: selectedRecord.patient_id,
                                record_id: selectedRecord.id,
                              });
                              setShowMedication(true);
                            }}
                          />
                        ) : (
                          <div className="grid gap-4 md:grid-cols-2">
                            {recordMedications.map((item) => (
                              <div
                                key={item.id}
                                className="rounded-2xl border border-slate-200 p-5"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <h4 className="font-bold text-slate-900">
                                      {item.name}
                                    </h4>
                                    <p className="mt-1 text-sm text-blue-600">
                                      {item.dosage} • {item.frequency}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => removeMedication(item.id)}
                                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                    aria-label="Remove medication"
                                  >
                                    <Icon name="trash" className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                                  <div>
                                    <p className="text-slate-400">Route</p>
                                    <p className="mt-1 font-semibold text-slate-700">
                                      {item.route}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-slate-400">Duration</p>
                                    <p className="mt-1 font-semibold text-slate-700">
                                      {item.duration || "As directed"}
                                    </p>
                                  </div>
                                </div>
                                {item.instructions ? (
                                  <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                                    {item.instructions}
                                  </p>
                                ) : null}
                                <div className="mt-3">
                                  <StatusBadge status={item.status} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                    </div>
                  ) : null}

                  {activeTab === "labs" ? (
                    <div className="space-y-8">
                      <section>
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                          <SectionTitle
                            icon={<Icon name="lab" />}
                            title="Laboratory Results"
                            description="Test results and interpretation status."
                          />
                          <button
                            onClick={() => {
                              setLabForm({
                                ...emptyLab(),
                                patient_id: selectedRecord.patient_id,
                                record_id: selectedRecord.id,
                              });
                              setShowLab(true);
                            }}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white"
                          >
                            <Icon name="plus" className="h-4 w-4" />
                            Add Result
                          </button>
                        </div>

                        {recordLabs.length === 0 ? (
                          <EmptyPanel
                            text="No laboratory results are recorded."
                            action="Add Laboratory Result"
                            onClick={() => {
                              setLabForm({
                                ...emptyLab(),
                                patient_id: selectedRecord.patient_id,
                                record_id: selectedRecord.id,
                              });
                              setShowLab(true);
                            }}
                          />
                        ) : (
                          <div className="overflow-x-auto rounded-2xl border border-slate-200">
                            <table className="min-w-[800px] w-full text-left text-sm">
                              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                  <th className="px-4 py-3">Test</th>
                                  <th className="px-4 py-3">Result</th>
                                  <th className="px-4 py-3">Reference</th>
                                  <th className="px-4 py-3">Status</th>
                                  <th className="px-4 py-3">Tested</th>
                                  <th className="px-4 py-3">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {recordLabs.map((item) => (
                                  <tr
                                    key={item.id}
                                    className="border-t border-slate-100"
                                  >
                                    <td className="px-4 py-4 font-semibold text-slate-800">
                                      {item.test_name}
                                    </td>
                                    <td className="px-4 py-4">
                                      {item.result} {item.unit}
                                    </td>
                                    <td className="px-4 py-4 text-slate-500">
                                      {item.reference_range || "—"}
                                    </td>
                                    <td className="px-4 py-4">
                                      <StatusBadge status={item.status} />
                                    </td>
                                    <td className="px-4 py-4 text-slate-500">
                                      {formatDateTime(item.tested_at)}
                                    </td>
                                    <td className="px-4 py-4">
                                      <button
                                        onClick={() => removeLab(item.id)}
                                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                      >
                                        <Icon name="trash" className="h-4 w-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </section>
                    </div>
                  ) : null}

                  {activeTab === "timeline" ? (
                    <section>
                      <SectionTitle
                        icon={<Icon name="calendar" />}
                        title="Record Timeline"
                        description="Chronological view of documented activity."
                      />

                      {timeline.length === 0 ? (
                        <EmptyPanel
                          text="No timeline activity is available."
                          action="Add Clinical Data"
                          onClick={() => setActiveTab("overview")}
                        />
                      ) : (
                        <div className="relative ml-3 border-l border-slate-200 pl-7">
                          {timeline.map((item) => (
                            <div key={item.id} className="relative pb-8 last:pb-0">
                              <span className="absolute -left-[35px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-4 border-white bg-blue-600 ring-1 ring-blue-100" />
                              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                {item.category}
                              </p>
                              <h4 className="mt-1 font-bold text-slate-900">
                                {item.title}
                              </h4>
                              <p className="mt-1 text-sm leading-6 text-slate-600">
                                {item.description}
                              </p>
                              <p className="mt-2 text-xs text-slate-400">
                                {formatDateTime(item.date)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  ) : null}
                </div>

                <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-4 md:px-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Icon name="shield" className="h-4 w-4 text-emerald-600" />
                      Local healthcare workspace • Synthetic demonstration data
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setVitalForm({
                            ...emptyVital(),
                            patient_id: selectedRecord.patient_id,
                            record_id: selectedRecord.id,
                          });
                          setShowVitals(true);
                        }}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Add Vitals
                      </button>
                      <button
                        onClick={() => {
                          setMedicationForm({
                            ...emptyMedication(),
                            patient_id: selectedRecord.patient_id,
                            record_id: selectedRecord.id,
                          });
                          setShowMedication(true);
                        }}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Add Medication
                      </button>
                      <button
                        onClick={() => {
                          setLabForm({
                            ...emptyLab(),
                            patient_id: selectedRecord.patient_id,
                            record_id: selectedRecord.id,
                          });
                          setShowLab(true);
                        }}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Add Lab
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </section>
      </div>

      <RecordModal
        open={showCreate}
        title="Create Medical Record"
        description="Create a new clinical record using synthetic demonstration data."
        onClose={() => setShowCreate(false)}
      >
        <form onSubmit={handleCreateRecord} className="space-y-5">
          <RecordFormFields
            form={recordForm}
            setForm={setRecordForm}
            patients={patients}
            doctors={doctors}
          />
          <ModalActions
            cancelLabel="Cancel"
            submitLabel="Create Record"
            onCancel={() => setShowCreate(false)}
          />
        </form>
      </RecordModal>

      <RecordModal
        open={showEdit}
        title="Edit Medical Record"
        description="Update the clinical record details."
        onClose={() => setShowEdit(false)}
      >
        <form onSubmit={handleEditRecord} className="space-y-5">
          <RecordFormFields
            form={recordForm}
            setForm={setRecordForm}
            patients={patients}
            doctors={doctors}
          />
          <ModalActions
            cancelLabel="Cancel"
            submitLabel="Save Changes"
            onCancel={() => setShowEdit(false)}
          />
        </form>
      </RecordModal>

      <RecordModal
        open={showVitals}
        title="Record Vital Signs"
        description="Add measurements to the selected medical record."
        onClose={() => setShowVitals(false)}
      >
        <form onSubmit={saveVital} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Recorded At"
              type="datetime-local"
              value={vitalForm.recorded_at}
              onChange={(value) =>
                setVitalForm((current) => ({
                  ...current,
                  recorded_at: value,
                }))
              }
            />
            <TextInput
              label="Temperature °C"
              value={vitalForm.temperature}
              onChange={(value) =>
                setVitalForm((current) => ({
                  ...current,
                  temperature: value,
                }))
              }
            />
            <TextInput
              label="Heart Rate"
              value={vitalForm.heart_rate}
              onChange={(value) =>
                setVitalForm((current) => ({
                  ...current,
                  heart_rate: value,
                }))
              }
            />
            <TextInput
              label="Respiratory Rate"
              value={vitalForm.respiratory_rate}
              onChange={(value) =>
                setVitalForm((current) => ({
                  ...current,
                  respiratory_rate: value,
                }))
              }
            />
            <TextInput
              label="Systolic BP"
              value={vitalForm.systolic_bp}
              onChange={(value) =>
                setVitalForm((current) => ({
                  ...current,
                  systolic_bp: value,
                }))
              }
            />
            <TextInput
              label="Diastolic BP"
              value={vitalForm.diastolic_bp}
              onChange={(value) =>
                setVitalForm((current) => ({
                  ...current,
                  diastolic_bp: value,
                }))
              }
            />
            <TextInput
              label="Oxygen Saturation %"
              value={vitalForm.oxygen_saturation}
              onChange={(value) =>
                setVitalForm((current) => ({
                  ...current,
                  oxygen_saturation: value,
                }))
              }
            />
            <TextInput
              label="Weight kg"
              value={vitalForm.weight}
              onChange={(value) =>
                setVitalForm((current) => ({
                  ...current,
                  weight: value,
                }))
              }
            />
            <TextInput
              label="Height cm"
              value={vitalForm.height}
              onChange={(value) =>
                setVitalForm((current) => ({
                  ...current,
                  height: value,
                }))
              }
            />
          </div>
          <TextArea
            label="Notes"
            value={vitalForm.notes}
            onChange={(value) =>
              setVitalForm((current) => ({
                ...current,
                notes: value,
              }))
            }
          />
          <ModalActions
            cancelLabel="Cancel"
            submitLabel="Save Vitals"
            onCancel={() => setShowVitals(false)}
          />
        </form>
      </RecordModal>

      <RecordModal
        open={showMedication}
        title="Add Medication"
        description="Add a medication entry to the selected record."
        onClose={() => setShowMedication(false)}
      >
        <form onSubmit={saveMedication} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Medication Name"
              value={medicationForm.name}
              onChange={(value) =>
                setMedicationForm((current) => ({
                  ...current,
                  name: value,
                }))
              }
              placeholder="Example: Demo medicine"
            />
            <TextInput
              label="Dosage"
              value={medicationForm.dosage}
              onChange={(value) =>
                setMedicationForm((current) => ({
                  ...current,
                  dosage: value,
                }))
              }
              placeholder="Example: 500 mg"
            />
            <SelectField
              label="Frequency"
              value={medicationForm.frequency}
              options={[
                "Once daily",
                "Twice daily",
                "Three times daily",
                "Every 6 hours",
                "As needed",
              ]}
              onChange={(value) =>
                setMedicationForm((current) => ({
                  ...current,
                  frequency: value,
                }))
              }
            />
            <SelectField
              label="Route"
              value={medicationForm.route}
              options={["Oral", "Topical", "Inhaled", "Injection", "Other"]}
              onChange={(value) =>
                setMedicationForm((current) => ({
                  ...current,
                  route: value,
                }))
              }
            />
            <TextInput
              label="Duration"
              value={medicationForm.duration}
              onChange={(value) =>
                setMedicationForm((current) => ({
                  ...current,
                  duration: value,
                }))
              }
              placeholder="Example: 5 days"
            />
            <SelectField
              label="Status"
              value={medicationForm.status}
              options={["Active", "Stopped", "Completed"]}
              onChange={(value) =>
                setMedicationForm((current) => ({
                  ...current,
                  status: value as Medication["status"],
                }))
              }
            />
          </div>
          <TextArea
            label="Instructions"
            value={medicationForm.instructions}
            onChange={(value) =>
              setMedicationForm((current) => ({
                ...current,
                instructions: value,
              }))
            }
            placeholder="Administration instructions"
          />
          <ModalActions
            cancelLabel="Cancel"
            submitLabel="Add Medication"
            onCancel={() => setShowMedication(false)}
          />
        </form>
      </RecordModal>

      <RecordModal
        open={showAllergy}
        title="Add Allergy"
        description="Record an allergy or adverse reaction."
        onClose={() => setShowAllergy(false)}
      >
        <form onSubmit={saveAllergy} className="space-y-5">
          <TextInput
            label="Allergen"
            value={allergyForm.allergen}
            onChange={(value) =>
              setAllergyForm((current) => ({
                ...current,
                allergen: value,
              }))
            }
            placeholder="Example: Demo allergen"
          />
          <TextInput
            label="Reaction"
            value={allergyForm.reaction}
            onChange={(value) =>
              setAllergyForm((current) => ({
                ...current,
                reaction: value,
              }))
            }
            placeholder="Example: Skin irritation"
          />
          <SelectField
            label="Severity"
            value={allergyForm.severity}
            options={["Mild", "Moderate", "Severe"]}
            onChange={(value) =>
              setAllergyForm((current) => ({
                ...current,
                severity: value as Allergy["severity"],
              }))
            }
          />
          <TextArea
            label="Notes"
            value={allergyForm.notes}
            onChange={(value) =>
              setAllergyForm((current) => ({
                ...current,
                notes: value,
              }))
            }
          />
          <ModalActions
            cancelLabel="Cancel"
            submitLabel="Add Allergy"
            onCancel={() => setShowAllergy(false)}
          />
        </form>
      </RecordModal>

      <RecordModal
        open={showLab}
        title="Add Laboratory Result"
        description="Record a synthetic laboratory result."
        onClose={() => setShowLab(false)}
      >
        <form onSubmit={saveLab} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Test Name"
              value={labForm.test_name}
              onChange={(value) =>
                setLabForm((current) => ({
                  ...current,
                  test_name: value,
                }))
              }
            />
            <TextInput
              label="Result"
              value={labForm.result}
              onChange={(value) =>
                setLabForm((current) => ({
                  ...current,
                  result: value,
                }))
              }
            />
            <TextInput
              label="Unit"
              value={labForm.unit}
              onChange={(value) =>
                setLabForm((current) => ({
                  ...current,
                  unit: value,
                }))
              }
            />
            <TextInput
              label="Reference Range"
              value={labForm.reference_range}
              onChange={(value) =>
                setLabForm((current) => ({
                  ...current,
                  reference_range: value,
                }))
              }
            />
            <SelectField
              label="Status"
              value={labForm.status}
              options={["Normal", "Abnormal", "Critical", "Pending"]}
              onChange={(value) =>
                setLabForm((current) => ({
                  ...current,
                  status: value as LabResult["status"],
                }))
              }
            />
            <TextInput
              label="Tested At"
              type="datetime-local"
              value={labForm.tested_at}
              onChange={(value) =>
                setLabForm((current) => ({
                  ...current,
                  tested_at: value,
                }))
              }
            />
          </div>
          <TextArea
            label="Notes"
            value={labForm.notes}
            onChange={(value) =>
              setLabForm((current) => ({
                ...current,
                notes: value,
              }))
            }
          />
          <ModalActions
            cancelLabel="Cancel"
            submitLabel="Add Result"
            onCancel={() => setShowLab(false)}
          />
        </form>
      </RecordModal>

      <RecordModal
        open={showProcedure}
        title="Add Procedure"
        description="Document a procedure performed or planned."
        onClose={() => setShowProcedure(false)}
      >
        <form onSubmit={saveProcedure} className="space-y-5">
          <TextInput
            label="Procedure Name"
            value={procedureForm.procedure_name}
            onChange={(value) =>
              setProcedureForm((current) => ({
                ...current,
                procedure_name: value,
              }))
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Procedure Date"
              type="date"
              value={procedureForm.procedure_date}
              onChange={(value) =>
                setProcedureForm((current) => ({
                  ...current,
                  procedure_date: value,
                }))
              }
            />
            <TextInput
              label="Performed By"
              value={procedureForm.performed_by}
              onChange={(value) =>
                setProcedureForm((current) => ({
                  ...current,
                  performed_by: value,
                }))
              }
            />
          </div>
          <TextInput
            label="Outcome"
            value={procedureForm.outcome}
            onChange={(value) =>
              setProcedureForm((current) => ({
                ...current,
                outcome: value,
              }))
            }
          />
          <TextArea
            label="Notes"
            value={procedureForm.notes}
            onChange={(value) =>
              setProcedureForm((current) => ({
                ...current,
                notes: value,
              }))
            }
          />
          <ModalActions
            cancelLabel="Cancel"
            submitLabel="Add Procedure"
            onCancel={() => setShowProcedure(false)}
          />
        </form>
      </RecordModal>

      <RecordModal
        open={showCarePlan}
        title="Add Care Plan"
        description="Create an ongoing care plan for the selected record."
        onClose={() => setShowCarePlan(false)}
      >
        <form onSubmit={saveCarePlan} className="space-y-5">
          <TextInput
            label="Care Plan Title"
            value={carePlanForm.title}
            onChange={(value) =>
              setCarePlanForm((current) => ({
                ...current,
                title: value,
              }))
            }
          />
          <TextArea
            label="Goals"
            value={carePlanForm.goals}
            onChange={(value) =>
              setCarePlanForm((current) => ({
                ...current,
                goals: value,
              }))
            }
          />
          <TextArea
            label="Interventions"
            value={carePlanForm.interventions}
            onChange={(value) =>
              setCarePlanForm((current) => ({
                ...current,
                interventions: value,
              }))
            }
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput
              label="Start Date"
              type="date"
              value={carePlanForm.start_date}
              onChange={(value) =>
                setCarePlanForm((current) => ({
                  ...current,
                  start_date: value,
                }))
              }
            />
            <TextInput
              label="Review Date"
              type="date"
              value={carePlanForm.review_date}
              onChange={(value) =>
                setCarePlanForm((current) => ({
                  ...current,
                  review_date: value,
                }))
              }
            />
            <SelectField
              label="Status"
              value={carePlanForm.status}
              options={["Planned", "Active", "Completed", "Cancelled"]}
              onChange={(value) =>
                setCarePlanForm((current) => ({
                  ...current,
                  status: value as CarePlan["status"],
                }))
              }
            />
          </div>
          <ModalActions
            cancelLabel="Cancel"
            submitLabel="Add Care Plan"
            onCancel={() => setShowCarePlan(false)}
          />
        </form>
      </RecordModal>

      <RecordModal
        open={showFollowUp}
        title="Add Follow-up"
        description="Schedule follow-up activity for this record."
        onClose={() => setShowFollowUp(false)}
      >
        <form onSubmit={saveFollowUp} className="space-y-5">
          <TextInput
            label="Follow-up Date"
            type="date"
            value={followUpForm.follow_up_date}
            onChange={(value) =>
              setFollowUpForm((current) => ({
                ...current,
                follow_up_date: value,
              }))
            }
          />
          <TextInput
            label="Reason"
            value={followUpForm.reason}
            onChange={(value) =>
              setFollowUpForm((current) => ({
                ...current,
                reason: value,
              }))
            }
          />
          <TextArea
            label="Instructions"
            value={followUpForm.instructions}
            onChange={(value) =>
              setFollowUpForm((current) => ({
                ...current,
                instructions: value,
              }))
            }
          />
          <SelectField
            label="Status"
            value={followUpForm.status}
            options={["Scheduled", "Completed", "Cancelled"]}
            onChange={(value) =>
              setFollowUpForm((current) => ({
                ...current,
                status: value as FollowUp["status"],
              }))
            }
          />
          <ModalActions
            cancelLabel="Cancel"
            submitLabel="Add Follow-up"
            onCancel={() => setShowFollowUp(false)}
          />
        </form>
      </RecordModal>

      <RecordModal
        open={showDeleteConfirm}
        title="Delete Medical Record"
        description="This removes the record from the current local workspace."
        onClose={() => setShowDeleteConfirm(false)}
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Icon name="trash" />
              </div>
              <div>
                <p className="font-semibold text-red-900">
                  Remove {selectedRecord?.record_number}?
                </p>
                <p className="mt-1 text-sm leading-6 text-red-800/80">
                  The local workspace will no longer display this medical
                  record. Use this action only with synthetic demonstration
                  records during development.
                </p>
              </div>
            </div>
          </div>

          <ModalActions
            cancelLabel="Keep Record"
            submitLabel="Delete Record"
            danger
            onCancel={() => setShowDeleteConfirm(false)}
            onSubmit={deleteRecord}
          />
        </div>
      </RecordModal>
    </main>
  );
}

function EmptyPanel({
  text,
  action,
  onClick,
}: {
  text: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-7 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
        <Icon name="file" />
      </div>
      <p className="mt-3 text-sm text-slate-500">{text}</p>
      <button
        onClick={onClick}
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        <Icon name="plus" className="h-4 w-4" />
        {action}
      </button>
    </div>
  );
}

function RecordModal({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-5 border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-950">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close modal"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({
  cancelLabel,
  submitLabel,
  onCancel,
  onSubmit,
  danger = false,
}: {
  cancelLabel: string;
  submitLabel: string;
  onCancel: () => void;
  onSubmit?: () => void;
  danger?: boolean;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        {cancelLabel}
      </button>
      <button
        type={onSubmit ? "button" : "submit"}
        onClick={onSubmit}
        className={cn(
          "rounded-xl px-4 py-2.5 text-sm font-semibold text-white",
          danger
            ? "bg-red-600 hover:bg-red-700"
            : "bg-blue-600 hover:bg-blue-700",
        )}
      >
        {submitLabel}
      </button>
    </div>
  );
}

function RecordFormFields({
  form,
  setForm,
  patients,
  doctors,
}: {
  form: Omit<
    MedicalRecord,
    "id" | "record_number" | "created_at" | "updated_at"
  >;
  setForm: React.Dispatch<
    React.SetStateAction<
      Omit<
        MedicalRecord,
        "id" | "record_number" | "created_at" | "updated_at"
      >
    >
  >;
  patients: Patient[];
  doctors: Doctor[];
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Patient
          </span>
          <select
            value={form.patient_id}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                patient_id: Number(event.target.value),
              }))
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          >
            <option value={0}>Select patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name} • #{patient.id}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Doctor
          </span>
          <select
            value={form.doctor_id ?? ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                doctor_id: event.target.value
                  ? Number(event.target.value)
                  : null,
              }))
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          >
            <option value="">Select doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} • {doctor.specialization}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          label="Record Title"
          value={form.title}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              title: value,
            }))
          }
          placeholder="Example: General consultation"
        />

        <TextInput
          label="Visit Date"
          type="date"
          value={form.visit_date}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              visit_date: value,
            }))
          }
        />

        <SelectField
          label="Record Type"
          value={form.record_type}
          options={[
            "Consultation",
            "Specialist Review",
            "Follow-up",
            "Emergency",
            "Diagnostic Review",
            "Procedure",
            "Admission",
            "Discharge",
          ]}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              record_type: value,
            }))
          }
        />

        <SelectField
          label="Status"
          value={form.status}
          options={[
            "Draft",
            "Active",
            "Under Review",
            "Completed",
            "Archived",
          ]}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              status: value as RecordStatus,
            }))
          }
        />

        <SelectField
          label="Priority"
          value={form.priority}
          options={["Low", "Normal", "High", "Urgent"]}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              priority: value as Priority,
            }))
          }
        />

        <TextInput
          label="Follow-up Date"
          type="date"
          value={form.follow_up_date}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              follow_up_date: value,
            }))
          }
        />
      </div>

      <TextInput
        label="Chief Complaint"
        value={form.chief_complaint}
        onChange={(value) =>
          setForm((current) => ({
            ...current,
            chief_complaint: value,
          }))
        }
        placeholder="Primary reason for visit"
      />

      <TextArea
        label="Symptoms"
        value={form.symptoms}
        onChange={(value) =>
          setForm((current) => ({
            ...current,
            symptoms: value,
          }))
        }
      />

      <TextArea
        label="Diagnosis"
        value={form.diagnosis}
        onChange={(value) =>
          setForm((current) => ({
            ...current,
            diagnosis: value,
          }))
        }
      />

      <TextArea
        label="Clinical Notes"
        value={form.clinical_notes}
        onChange={(value) =>
          setForm((current) => ({
            ...current,
            clinical_notes: value,
          }))
        }
        rows={6}
      />

      <TextArea
        label="Treatment Plan"
        value={form.treatment_plan}
        onChange={(value) =>
          setForm((current) => ({
            ...current,
            treatment_plan: value,
          }))
        }
        rows={5}
      />
    </>
  );
}