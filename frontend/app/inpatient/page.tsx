"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

const API_URL = "http://127.0.0.1:8000";

/* =========================================================
   TYPES
   ========================================================= */

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

type Department = {
  id: number;
  department_code?: string;
  name: string;
  description?: string;
  floor?: string;
  building?: string;
  status: string;
};

type Room = {
  id: number;
  room_number: string;
  room_type: string;
  department_id?: number;
  department_name?: string;
  floor?: string;
  building?: string;
  capacity: number;
  occupied_count: number;
  daily_rate: number;
  status: string;
  notes?: string;
};

type Bed = {
  id: number;
  room_id: number;
  room_number?: string;
  room_type?: string;
  daily_rate: number;
  department_name?: string;
  bed_number: string;
  bed_type?: string;
  status: "Available" | "Occupied" | "Cleaning" | "Maintenance";
  notes?: string;
  current_patient_name?: string;
  admission_id?: number;
};

type Admission = {
  id: number;
  admission_number?: string;
  patient_id: number;
  patient_name?: string;
  patient_phone?: string;
  patient_age?: number;
  admitting_doctor_id?: number;
  doctor_name?: string;
  doctor_specialization?: string;
  room_id?: number;
  room_number?: string;
  department_name?: string;
  bed_id?: number;
  bed_number?: string;
  admission_date: string;
  admission_time?: string;
  admission_type?: string;
  admission_reason?: string;
  diagnosis_at_admission?: string;
  expected_discharge_date?: string;
  actual_discharge_date?: string;
  status: "Admitted" | "Discharged" | "Transferred" | "Cancelled";
  discharge_reason?: string;
  notes?: string;
};

type DischargeSummary = {
  id: number;
  admission_id: number;
  patient_id: number;
  patient_name?: string;
  doctor_id?: number;
  doctor_name?: string;
  discharge_date: string;
  final_diagnosis?: string;
  hospital_course?: string;
  procedures_performed?: string;
  medications_at_discharge?: string;
  follow_up_instructions?: string;
  warning_signs?: string;
  doctor_notes?: string;
};

type OccupancyStats = {
  total_beds: number;
  available_beds: number;
  occupied_beds: number;
  cleaning_beds: number;
  maintenance_beds: number;
  occupancy_rate: number;
  total_admitted_patients: number;
  total_discharged_patients: number;
};

type AlertMessage = {
  type: "success" | "error" | "info";
  text: string;
} | null;

export default function InpatientManagementPage() {
  /* =========================================================
     STATE
     ========================================================= */

  const [activeTab, setActiveTab] = useState<"floorplan" | "admissions" | "discharges">("floorplan");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<AlertMessage>(null);

  // Entities
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [stats, setStats] = useState<OccupancyStats>({
    total_beds: 0,
    available_beds: 0,
    occupied_beds: 0,
    cleaning_beds: 0,
    maintenance_beds: 0,
    occupancy_rate: 0,
    total_admitted_patients: 0,
    total_discharged_patients: 0,
  });

  // Filters
  const [deptFilter, setDeptFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  // Selected for Actions
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [selectedDischargeSummary, setSelectedDischargeSummary] = useState<DischargeSummary | null>(null);
  const [preselectedBedId, setPreselectedBedId] = useState<number | null>(null);

  // Form States - Admission
  const [admitPatientId, setAdmitPatientId] = useState<string>("");
  const [admitDoctorId, setAdmitDoctorId] = useState<string>("");
  const [admitBedId, setAdmitBedId] = useState<string>("");
  const [admitDate, setAdmitDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [admitTime, setAdmitTime] = useState<string>("10:00");
  const [admitType, setAdmitType] = useState<string>("Elective");
  const [admitReason, setAdmitReason] = useState<string>("");
  const [admitDiagnosis, setAdmitDiagnosis] = useState<string>("");
  const [admitExpDischarge, setAdmitExpDischarge] = useState<string>("");

  // Form States - Transfer
  const [transferRoomId, setTransferRoomId] = useState<string>("");
  const [transferBedId, setTransferBedId] = useState<string>("");
  const [transferReason, setTransferReason] = useState<string>("");

  // Form States - Discharge
  const [dischargeDate, setDischargeDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [dischargeReason, setDischargeReason] = useState<string>("Condition improved; discharged home.");
  const [finalDiagnosis, setFinalDiagnosis] = useState<string>("");
  const [hospitalCourse, setHospitalCourse] = useState<string>("");
  const [medicationsAtDischarge, setMedicationsAtDischarge] = useState<string>("");
  const [followUpInstructions, setFollowUpInstructions] = useState<string>("");
  const [warningSigns, setWarningSigns] = useState<string>("");

  /* =========================================================
     DATA LOADING
     ========================================================= */

  async function fetchAllData(isManualRefresh = false) {
    if (isManualRefresh) setRefreshing(true);
    try {
      const [pRes, dRes, deptRes, rRes, bRes, aRes, sRes] = await Promise.all([
        fetch(`${API_URL}/patients`),
        fetch(`${API_URL}/doctors`),
        fetch(`${API_URL}/departments`),
        fetch(`${API_URL}/rooms`),
        fetch(`${API_URL}/beds`),
        fetch(`${API_URL}/admissions`),
        fetch(`${API_URL}/inpatient/occupancy-stats`),
      ]);

      if (pRes.ok) {
        const pData = await pRes.json();
        setPatients(pData.patients || []);
      }
      if (dRes.ok) {
        const dData = await dRes.json();
        setDoctors(dData.doctors || []);
      }
      if (deptRes.ok) {
        const deptData = await deptRes.json();
        setDepartments(deptData.departments || []);
      }
      if (rRes.ok) {
        const rData = await rRes.json();
        setRooms(rData.rooms || []);
      }
      if (bRes.ok) {
        const bData = await bRes.json();
        setBeds(bData.beds || []);
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        setAdmissions(aData.admissions || []);
      }
      if (sRes.ok) {
        const sData = await sRes.json();
        setStats(sData);
      }

      if (isManualRefresh) {
        setMessage({ type: "success", text: "Inpatient and bed data refreshed successfully." });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Could not connect to FastAPI server at http://127.0.0.1:8000. Please ensure it is running.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchAllData();
  }, []);

  async function handleSeedSampleData() {
    try {
      const res = await fetch(`${API_URL}/inpatient/seed-sample-data`, { method: "POST" });
      const data = await res.json();
      setMessage({ type: "success", text: data.message });
      await fetchAllData();
    } catch {
      setMessage({ type: "error", text: "Failed to initialize sample ward data." });
    }
  }

  /* =========================================================
     BED STATUS ACTIONS
     ========================================================= */

  async function handleMarkBedClean(bedId: number) {
    try {
      const res = await fetch(`${API_URL}/beds/${bedId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Available", notes: "Sanitized and ready for admission." }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Bed sanitized and marked Available!" });
        await fetchAllData();
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.detail || "Failed to update bed status." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error updating bed status." });
    }
  }

  /* =========================================================
     ADMISSION WORKFLOW
     ========================================================= */

  function openAdmitModalForBed(bedId?: number) {
    if (bedId) {
      setPreselectedBedId(bedId);
      setAdmitBedId(String(bedId));
    } else {
      setPreselectedBedId(null);
      setAdmitBedId("");
    }
    setAdmitPatientId("");
    setAdmitDoctorId("");
    setAdmitReason("");
    setAdmitDiagnosis("");
    setIsAdmitModalOpen(true);
  }

  async function handleAdmitSubmit(e: FormEvent) {
    e.preventDefault();
    if (!admitPatientId) {
      setMessage({ type: "error", text: "Please select a patient." });
      return;
    }
    if (!admitBedId) {
      setMessage({ type: "error", text: "Please select an available bed." });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: Number(admitPatientId),
          admitting_doctor_id: admitDoctorId ? Number(admitDoctorId) : null,
          bed_id: Number(admitBedId),
          admission_date: admitDate,
          admission_time: admitTime,
          admission_type: admitType,
          admission_reason: admitReason,
          diagnosis_at_admission: admitDiagnosis,
          expected_discharge_date: admitExpDischarge || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `Patient admitted successfully! (Admission #${data.admission.admission_number})` });
        setIsAdmitModalOpen(false);
        await fetchAllData();
      } else {
        setMessage({ type: "error", text: data.detail || "Admission failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error processing admission." });
    }
  }

  /* =========================================================
     TRANSFER WORKFLOW
     ========================================================= */

  function openTransferModal(admission: Admission) {
    setSelectedAdmission(admission);
    setTransferRoomId("");
    setTransferBedId("");
    setTransferReason("");
    setIsTransferModalOpen(true);
  }

  async function handleTransferSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedAdmission) return;
    if (!transferRoomId || !transferBedId) {
      setMessage({ type: "error", text: "Please choose target room and available bed." });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admissions/${selectedAdmission.id}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          new_room_id: Number(transferRoomId),
          new_bed_id: Number(transferBedId),
          transfer_reason: transferReason,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Patient transferred successfully!" });
        setIsTransferModalOpen(false);
        await fetchAllData();
      } else {
        setMessage({ type: "error", text: data.detail || "Transfer failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error processing transfer." });
    }
  }

  /* =========================================================
     DISCHARGE WORKFLOW
     ========================================================= */

  function openDischargeModal(admission: Admission) {
    setSelectedAdmission(admission);
    setDischargeDate(new Date().toISOString().split("T")[0]);
    setDischargeReason("Patient clinically stable and discharged home.");
    setFinalDiagnosis(admission.diagnosis_at_admission || "");
    setHospitalCourse("Admitted under observation, responded well to conservative medical management. Vitals stable upon discharge.");
    setMedicationsAtDischarge("Discharge prescription as per doctor notes.");
    setFollowUpInstructions("OPD review in 7 days or SOS if any distress.");
    setWarningSigns("Return immediately to Emergency if high fever, severe pain, or shortness of breath develops.");
    setIsDischargeModalOpen(true);
  }

  async function handleDischargeSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedAdmission) return;

    try {
      const res = await fetch(`${API_URL}/admissions/${selectedAdmission.id}/discharge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actual_discharge_date: dischargeDate,
          discharge_reason: dischargeReason,
          final_diagnosis: finalDiagnosis,
          hospital_course: hospitalCourse,
          medications_at_discharge: medicationsAtDischarge,
          follow_up_instructions: followUpInstructions,
          warning_signs: warningSigns,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Patient successfully discharged and discharge summary created!" });
        setIsDischargeModalOpen(false);
        await fetchAllData();
        if (data.discharge_summary) {
          setSelectedDischargeSummary(data.discharge_summary);
          setIsSummaryModalOpen(true);
        }
      } else {
        setMessage({ type: "error", text: data.detail || "Discharge failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error processing discharge." });
    }
  }

  async function viewSummaryForAdmission(admissionId: number) {
    try {
      const res = await fetch(`${API_URL}/admissions/${admissionId}/discharge-summary`);
      if (res.ok) {
        const data = await res.json();
        setSelectedDischargeSummary(data.discharge_summary);
        setIsSummaryModalOpen(true);
      } else {
        setMessage({ type: "info", text: "No discharge summary on file for this admission." });
      }
    } catch {
      setMessage({ type: "error", text: "Unable to retrieve discharge summary." });
    }
  }

  /* =========================================================
     COMPUTED DATA & FILTERS
     ========================================================= */

  const groupedRooms = useMemo(() => {
    return rooms
      .filter((r) => {
        if (deptFilter === "All") return true;
        return r.department_name?.toLowerCase().includes(deptFilter.toLowerCase());
      })
      .map((r) => {
        const roomBeds = beds.filter((b) => b.room_id === r.id);
        return {
          ...r,
          beds: roomBeds.filter((b) => {
            if (statusFilter === "All") return true;
            return b.status === statusFilter;
          }),
        };
      });
  }, [rooms, beds, deptFilter, statusFilter]);

  const availableBeds = useMemo(() => {
    return beds.filter((b) => b.status === "Available");
  }, [beds]);

  const filteredAdmissions = useMemo(() => {
    return admissions.filter((a) => {
      const matchesSearch =
        searchQuery === "" ||
        a.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.admission_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.diagnosis_at_admission?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [admissions, searchQuery]);

  const dischargedAdmissions = useMemo(() => {
    return admissions.filter((a) => a.status === "Discharged");
  }, [admissions]);

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white shadow-sm hover:bg-blue-700 transition"
            >
              🏥
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                  MediCare Clinic
                </h1>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
                  ADT & Inpatient
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Hospital Ward & Bed Management Center
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
            <Link
              href="/"
              className="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/patients"
              className="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100 transition"
            >
              Patients
            </Link>
            <Link
              href="/doctors"
              className="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100 transition"
            >
              Doctors
            </Link>
            <Link
              href="/appointments"
              className="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100 transition"
            >
              Appointments
            </Link>
            <span className="rounded-lg bg-blue-600 px-3 py-1.5 text-white font-bold shadow-sm">
              Inpatient (ADT)
            </span>
            <Link
              href="/bills"
              className="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100 transition"
            >
              Billing
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAllData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50 transition disabled:opacity-50"
              title="Refresh all data"
            >
              <span className={refreshing ? "animate-spin" : ""}>↻</span>
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => openAdmitModalForBed()}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <span>+</span>
              <span>Admit Patient</span>
            </button>
          </div>
        </div>
      </header>

      {/* ALERT MESSAGE */}
      {message && (
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between rounded-xl p-4 text-sm font-medium shadow-sm transition ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                : message.type === "error"
                ? "bg-rose-50 text-rose-900 border border-rose-200"
                : "bg-blue-50 text-blue-900 border border-blue-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span>{message.type === "success" ? "✓" : message.type === "error" ? "⚠" : "ℹ"}</span>
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-xs font-bold opacity-60 hover:opacity-100"
            >
              ✕ Dismiss
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* KPI METRICS */}
        <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Beds
            </p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {stats.total_beds}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">Across 6 Wards</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Available
              </p>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
            </div>
            <p className="mt-1 text-2xl font-extrabold text-emerald-900">
              {stats.available_beds}
            </p>
            <p className="mt-0.5 text-xs text-emerald-700">Ready for Intake</p>
          </div>

          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                Occupied
              </p>
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 ring-4 ring-rose-100" />
            </div>
            <p className="mt-1 text-2xl font-extrabold text-rose-900">
              {stats.occupied_beds}
            </p>
            <p className="mt-0.5 text-xs text-rose-700">Active Inpatients</p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Sanitizing
              </p>
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100" />
            </div>
            <p className="mt-1 text-2xl font-extrabold text-amber-900">
              {stats.cleaning_beds}
            </p>
            <p className="mt-0.5 text-xs text-amber-700">Needs Cleaning</p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
              Occupancy Rate
            </p>
            <p className="mt-1 text-2xl font-extrabold text-blue-900">
              {stats.occupancy_rate}%
            </p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-blue-200 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(stats.occupancy_rate, 100)}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Discharges
            </p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {stats.total_discharged_patients}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">Summaries On File</p>
          </div>
        </section>

        {/* TABS HEADER */}
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("floorplan")}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                activeTab === "floorplan"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              🗺️ Visual Ward Bed Matrix
            </button>
            <button
              onClick={() => setActiveTab("admissions")}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                activeTab === "admissions"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              📋 Active Inpatients ({stats.total_admitted_patients})
            </button>
            <button
              onClick={() => setActiveTab("discharges")}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                activeTab === "discharges"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              📄 Discharge Summaries ({dischargedAdmissions.length})
            </button>
          </div>

          {beds.length === 0 && (
            <button
              onClick={handleSeedSampleData}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-indigo-700 hover:to-blue-700 transition"
            >
              ✨ Initialize Default Hospital Wards
            </button>
          )}
        </div>

        {/* TAB 1: VISUAL FLOORPLAN */}
        {activeTab === "floorplan" && (
          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                <span className="text-slate-500">Department:</span>
                {["All", "Emergency", "ICU", "Medical", "Cardiology"].map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setDeptFilter(dept)}
                    className={`rounded-lg px-3 py-1.5 transition ${
                      deptFilter === dept
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                <span className="text-slate-500">Bed Status:</span>
                {["All", "Available", "Occupied", "Cleaning"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`rounded-lg px-3 py-1.5 transition ${
                      statusFilter === st
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
                Loading hospital floorplan...
              </div>
            ) : groupedRooms.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <p className="text-base font-bold text-slate-800">No rooms match your filter criteria.</p>
                <p className="mt-1 text-xs text-slate-500">
                  Try clearing your department or status filters, or initialize default wards.
                </p>
                <button
                  onClick={handleSeedSampleData}
                  className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
                >
                  Load Standard Wards & Beds
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedRooms.map((room) => (
                  <div
                    key={room.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-xs font-extrabold text-blue-700">
                          🚪
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-sm">
                              Room {room.room_number}
                            </h3>
                            <span className="rounded-md bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                              {room.room_type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {room.department_name || "General Ward"} • {room.building || "Main Wing"}, {room.floor || "1st Floor"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-slate-500">
                          Rate: <strong className="text-slate-900">${room.daily_rate}</strong>/day
                        </span>
                        <span className="rounded-full bg-slate-200/80 px-2.5 py-1 font-bold text-slate-700">
                          Capacity: {room.beds.length} beds
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      {room.beds.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No beds match filter in this room.</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {room.beds.map((bed) => {
                            const isAvail = bed.status === "Available";
                            const isOcc = bed.status === "Occupied";
                            const isClean = bed.status === "Cleaning";

                            return (
                              <div
                                key={bed.id}
                                className={`flex flex-col justify-between rounded-xl border p-4 transition ${
                                  isAvail
                                    ? "border-emerald-200 bg-emerald-50/30 hover:border-emerald-300"
                                    : isOcc
                                    ? "border-rose-200 bg-rose-50/30 hover:border-rose-300"
                                    : "border-amber-200 bg-amber-50/30 hover:border-amber-300"
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">🛏️</span>
                                      <span className="font-extrabold text-slate-900 text-sm">
                                        {bed.bed_number}
                                      </span>
                                    </div>
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                        isAvail
                                          ? "bg-emerald-100 text-emerald-800"
                                          : isOcc
                                          ? "bg-rose-100 text-rose-800"
                                          : "bg-amber-100 text-amber-800"
                                      }`}
                                    >
                                      {bed.status}
                                    </span>
                                  </div>

                                  <p className="mt-1 text-[11px] text-slate-500">
                                    Type: {bed.bed_type || "Standard Ward"}
                                  </p>

                                  {isOcc && (
                                    <div className="mt-3 rounded-lg border border-rose-100 bg-white/80 p-2.5 text-xs">
                                      <p className="font-bold text-slate-900">
                                        👤 {bed.current_patient_name || "Admitted Patient"}
                                      </p>
                                      <p className="mt-0.5 text-[11px] text-slate-500">
                                        Admission Active
                                      </p>
                                    </div>
                                  )}

                                  {isClean && (
                                    <p className="mt-2 text-[11px] text-amber-800 italic">
                                      Requires housekeeping sanitization before next admission.
                                    </p>
                                  )}
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                                  {isAvail && (
                                    <button
                                      onClick={() => openAdmitModalForBed(bed.id)}
                                      className="w-full rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                                    >
                                      + Admit Here
                                    </button>
                                  )}

                                  {isOcc && bed.admission_id && (
                                    <div className="flex w-full gap-2">
                                      <button
                                        onClick={() => {
                                          const adm = admissions.find((a) => a.id === bed.admission_id);
                                          if (adm) openTransferModal(adm);
                                        }}
                                        className="flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                                      >
                                        Transfer
                                      </button>
                                      <button
                                        onClick={() => {
                                          const adm = admissions.find((a) => a.id === bed.admission_id);
                                          if (adm) openDischargeModal(adm);
                                        }}
                                        className="flex-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition"
                                      >
                                        Discharge
                                      </button>
                                    </div>
                                  )}

                                  {isClean && (
                                    <button
                                      onClick={() => handleMarkBedClean(bed.id)}
                                      className="w-full rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition"
                                    >
                                      ✓ Mark Sanitized
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ACTIVE INPATIENTS ROSTER */}
        {activeTab === "admissions" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Hospital Inpatient Roster</h2>
                <p className="text-xs text-slate-500">
                  Currently admitted patients, bed locations, and clinical diagnoses
                </p>
              </div>

              <input
                type="text"
                placeholder="Search patient, doctor, or admission #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none sm:w-72"
              />
            </div>

            {filteredAdmissions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No active inpatient admissions found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-3 px-4">Admission #</th>
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Ward & Bed</th>
                      <th className="py-3 px-4">Admitting Doctor</th>
                      <th className="py-3 px-4">Admitted On</th>
                      <th className="py-3 px-4">Diagnosis</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAdmissions.map((adm) => (
                      <tr key={adm.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                          {adm.admission_number || `#${adm.id}`}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{adm.patient_name || "Unknown"}</p>
                          <p className="text-[11px] text-slate-500">
                            Age: {adm.patient_age || "N/A"} • Phone: {adm.patient_phone || "N/A"}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-800">
                            Room {adm.room_number || "N/A"} • Bed {adm.bed_number || "N/A"}
                          </span>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {adm.department_name || "General Ward"}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-900">{adm.doctor_name || "Unassigned"}</p>
                          <p className="text-[10px] text-slate-400">{adm.doctor_specialization || ""}</p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {adm.admission_date} {adm.admission_time ? `at ${adm.admission_time}` : ""}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-slate-700" title={adm.diagnosis_at_admission || ""}>
                          {adm.diagnosis_at_admission || "Observation"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              adm.status === "Admitted"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {adm.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {adm.status === "Admitted" ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openTransferModal(adm)}
                                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                Transfer
                              </button>
                              <button
                                onClick={() => openDischargeModal(adm)}
                                className="rounded-lg bg-rose-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-rose-700"
                              >
                                Discharge
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => viewSummaryForAdmission(adm.id)}
                              className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                            >
                              View Summary
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DISCHARGE SUMMARIES */}
        {activeTab === "discharges" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">Hospital Discharge Summaries</h2>
            <p className="text-xs text-slate-500 mb-6">
              Clinical departure records, treatments administered, medications, and follow-up notes
            </p>

            {dischargedAdmissions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No patient discharges on record yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dischargedAdmissions.map((adm) => (
                  <div
                    key={adm.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 shadow-sm hover:border-blue-300 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-blue-700">
                          {adm.admission_number || `#${adm.id}`}
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Discharged
                        </span>
                      </div>

                      <h4 className="mt-2 font-bold text-slate-900 text-sm">
                        {adm.patient_name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Discharged on: <strong>{adm.actual_discharge_date || adm.admission_date}</strong>
                      </p>

                      <div className="mt-3 rounded-lg bg-white p-3 border border-slate-200/80 text-xs">
                        <p className="font-semibold text-slate-700">Discharge Reason:</p>
                        <p className="text-slate-600 mt-0.5">{adm.discharge_reason || "Course completed."}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => viewSummaryForAdmission(adm.id)}
                      className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
                    >
                      📄 Open Clinical Discharge Summary
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL 1: ADMIT */}
      {isAdmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Hospital Patient Admission</h3>
                <p className="text-xs text-slate-500">Allocate patient to an available inpatient bed</p>
              </div>
              <button
                onClick={() => setIsAdmitModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdmitSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Patient *</label>
                <select
                  required
                  value={admitPatientId}
                  onChange={(e) => setAdmitPatientId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Registered Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Age: {p.age}, Phone: {p.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Admitting Physician</label>
                <select
                  value={admitDoctorId}
                  onChange={(e) => setAdmitDoctorId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Doctor (Optional) --</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign Inpatient Bed *</label>
                <select
                  required
                  value={admitBedId}
                  onChange={(e) => setAdmitBedId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Available Bed --</option>
                  {availableBeds.map((b) => (
                    <option key={b.id} value={b.id}>
                      Room {b.room_number} • Bed {b.bed_number} ({b.department_name} - ${b.daily_rate}/day)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Admission Date</label>
                  <input
                    type="date"
                    required
                    value={admitDate}
                    onChange={(e) => setAdmitDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Admission Time</label>
                  <input
                    type="time"
                    value={admitTime}
                    onChange={(e) => setAdmitTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Admission Type</label>
                <select
                  value={admitType}
                  onChange={(e) => setAdmitType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                >
                  <option value="Elective">Elective / Scheduled</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Urgent">Urgent Admission</option>
                  <option value="Transfer">Inter-hospital Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Admission Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Acute abdominal pain, post-surgical monitoring"
                  value={admitReason}
                  onChange={(e) => setAdmitReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Provisional Diagnosis</label>
                <textarea
                  rows={2}
                  placeholder="Clinical assessment upon admission..."
                  value={admitDiagnosis}
                  onChange={(e) => setAdmitDiagnosis(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdmitModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 shadow-sm"
                >
                  Confirm Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TRANSFER */}
      {isTransferModalOpen && selectedAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Patient Ward / Bed Transfer</h3>
                <p className="text-xs text-slate-500">Move patient to another room or specialized bed</p>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <p className="font-bold text-slate-900">{selectedAdmission.patient_name}</p>
                <p className="text-[11px] text-slate-500">
                  Current: Room {selectedAdmission.room_number || "N/A"} • Bed {selectedAdmission.bed_number || "N/A"}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Room *</label>
                <select
                  required
                  value={transferRoomId}
                  onChange={(e) => {
                    setTransferRoomId(e.target.value);
                    setTransferBedId("");
                  }}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose New Room --</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.room_number} ({r.room_type} - {r.department_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Available Bed *</label>
                <select
                  required
                  value={transferBedId}
                  onChange={(e) => setTransferBedId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Available Bed --</option>
                  {beds
                    .filter(
                      (b) =>
                        b.status === "Available" &&
                        (!transferRoomId || b.room_id === Number(transferRoomId))
                    )
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        Bed {b.bed_number} ({b.bed_type})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Transfer Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Stepped down to ward, ICU escalation"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 shadow-sm"
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DISCHARGE */}
      {isDischargeModalOpen && selectedAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Hospital Discharge & Clinical Summary</h3>
                <p className="text-xs text-slate-500">Finalize inpatient stay and generate discharge documentation</p>
              </div>
              <button
                onClick={() => setIsDischargeModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDischargeSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{selectedAdmission.patient_name}</p>
                    <p className="text-[11px] text-slate-500">
                      Admission #{selectedAdmission.admission_number} • Bed {selectedAdmission.bed_number}
                    </p>
                  </div>
                  <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                    Admitted: {selectedAdmission.admission_date}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Discharge Date *</label>
                <input
                  type="date"
                  required
                  value={dischargeDate}
                  onChange={(e) => setDischargeDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Final Clinical Diagnosis</label>
                <input
                  type="text"
                  required
                  value={finalDiagnosis}
                  onChange={(e) => setFinalDiagnosis(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hospital Course & Summary</label>
                <textarea
                  rows={2}
                  value={hospitalCourse}
                  onChange={(e) => setHospitalCourse(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Discharge Medications</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Tab Amoxicillin 500mg TDS x 5 days..."
                  value={medicationsAtDischarge}
                  onChange={(e) => setMedicationsAtDischarge(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Follow-up Instructions</label>
                <input
                  type="text"
                  value={followUpInstructions}
                  onChange={(e) => setFollowUpInstructions(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Warning Signs (When to return to ER)</label>
                <input
                  type="text"
                  value={warningSigns}
                  onChange={(e) => setWarningSigns(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDischargeModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-5 py-2 font-bold text-white hover:bg-rose-700 shadow-sm"
                >
                  Complete Discharge & Free Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CLINICAL DISCHARGE SUMMARY (PRINTABLE) */}
      {isSummaryModalOpen && selectedDischargeSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏥</span>
                  <h2 className="text-xl font-extrabold text-slate-900">MediCare Clinic & Hospital</h2>
                </div>
                <p className="text-xs text-slate-500">Inpatient Clinical Discharge Summary</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-bold text-slate-900">Summary #{selectedDischargeSummary.id}</p>
                <p className="text-slate-500">Date: {selectedDischargeSummary.discharge_date}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
              <div>
                <p className="text-slate-500 uppercase text-[10px] font-bold">Patient Name</p>
                <p className="font-extrabold text-slate-900 text-sm">{selectedDischargeSummary.patient_name || "Patient"}</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase text-[10px] font-bold">Attending Physician</p>
                <p className="font-extrabold text-slate-900 text-sm">{selectedDischargeSummary.doctor_name || "Medical Officer"}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                  1. Final Diagnosis
                </h4>
                <p className="mt-1 text-slate-800 leading-relaxed">
                  {selectedDischargeSummary.final_diagnosis || "Not specified."}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                  2. Hospital Course & Treatment Summary
                </h4>
                <p className="mt-1 text-slate-800 leading-relaxed">
                  {selectedDischargeSummary.hospital_course || "Patient completed hospital course."}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                  3. Medications at Discharge
                </h4>
                <p className="mt-1 text-slate-800 leading-relaxed font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {selectedDischargeSummary.medications_at_discharge || "None specified."}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
                  4. Follow-Up Instructions
                </h4>
                <p className="mt-1 text-slate-800 leading-relaxed">
                  {selectedDischargeSummary.follow_up_instructions || "Follow up at outpatient clinic."}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-rose-800 uppercase tracking-wider text-[11px] border-b border-rose-200 pb-1">
                  5. Warning Signs & Red Flags
                </h4>
                <p className="mt-1 text-rose-900 leading-relaxed bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  {selectedDischargeSummary.warning_signs || "Seek immediate emergency attention if condition worsens."}
                </p>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                <div className="h-0.5 w-40 bg-slate-300 mb-1" />
                <p>Medical Officer Signature</p>
              </div>
              <div className="text-right">
                <div className="h-0.5 w-40 bg-slate-300 mb-1" />
                <p>Patient / Relative Acknowledgement</p>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 print:hidden">
              <button
                onClick={() => setIsSummaryModalOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm flex items-center gap-1.5"
              >
                <span>🖨️</span>
                <span>Print Discharge Summary</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
