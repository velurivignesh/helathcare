"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

type Doctor = {
  id: number;
  name: string;
  specialization: string;
  phone: string;
};

type MessageType = "success" | "error" | "info";

type MessageState = {
  type: MessageType;
  text: string;
} | null;

type SortOption =
  | "name-asc"
  | "name-desc"
  | "specialization-asc"
  | "specialization-desc"
  | "newest"
  | "oldest";

const SPECIALIZATIONS = [
  "Cardiology",
  "Neurology",
  "Orthopaedics",
  "Paediatrics",
  "Gastroenterology",
  "Dermatology",
  "General Medicine",
  "Women's Health",
  "Pulmonology",
  "Nephrology",
  "Urology",
  "Oncology",
  "ENT",
  "Ophthalmology",
  "Psychiatry",
  "Endocrinology",
  "Dentistry",
  "Radiology",
  "General Surgery",
  "Emergency Medicine",
];

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function getInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "DR";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function formatDoctorName(name: string) {
  const cleaned = normalizeText(name);

  if (!cleaned) {
    return "Unknown Doctor";
  }

  if (/^dr\.?\s/i.test(cleaned)) {
    return cleaned;
  }

  return `Dr. ${cleaned}`;
}

function validatePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  return digits.length >= 10 && digits.length <= 15;
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }

  return phone;
}

function getSpecializationIcon(specialization: string) {
  const value = specialization.toLowerCase();

  if (value.includes("cardio")) return "❤️";
  if (value.includes("neuro")) return "🧠";
  if (value.includes("ortho")) return "🦴";
  if (value.includes("paedia") || value.includes("pedi")) return "👶";
  if (value.includes("derma")) return "🩺";
  if (value.includes("gastro")) return "🫀";
  if (value.includes("women")) return "👩‍⚕️";
  if (value.includes("ophthal")) return "👁️";
  if (value.includes("ent")) return "👂";
  if (value.includes("dental")) return "🦷";
  if (value.includes("psychi")) return "🧠";
  if (value.includes("onc")) return "🎗️";
  if (value.includes("pulmo")) return "🫁";
  if (value.includes("nephro")) return "🩻";
  if (value.includes("uro")) return "⚕️";
  if (value.includes("emergency")) return "🚑";
  if (value.includes("radi")) return "🔬";
  if (value.includes("surgery")) return "🏥";

  return "👨‍⚕️";
}

function getSpecializationDescription(specialization: string) {
  const value = specialization.toLowerCase();

  if (value.includes("cardio")) {
    return "Heart and cardiovascular care";
  }

  if (value.includes("neuro")) {
    return "Brain and nervous system care";
  }

  if (value.includes("ortho")) {
    return "Bones, joints and musculoskeletal care";
  }

  if (value.includes("paedia") || value.includes("pedi")) {
    return "Medical care for children";
  }

  if (value.includes("gastro")) {
    return "Digestive system and gastrointestinal care";
  }

  if (value.includes("derma")) {
    return "Skin, hair and nail care";
  }

  if (value.includes("women")) {
    return "Women's health and wellness";
  }

  if (value.includes("general")) {
    return "Primary and comprehensive medical care";
  }

  if (value.includes("emergency")) {
    return "Urgent and emergency medical care";
  }

  return "Specialized healthcare services";
}

export default function DoctorsPage() {
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [phone, setPhone] = useState("");

  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [deletingDoctorId, setDeletingDoctorId] = useState<number | null>(
    null,
  );

  const [refreshing, setRefreshing] = useState(false);

  const [message, setMessage] = useState<MessageState>(null);

  const [search, setSearch] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("All");
  const [sortOption, setSortOption] =
    useState<SortOption>("name-asc");

  const [selectedDoctor, setSelectedDoctor] =
    useState<Doctor | null>(null);

  const [showAddForm, setShowAddForm] = useState(true);
  const [showFilters, setShowFilters] = useState(true);

  async function fetchDoctors(showRefreshLoader = false) {
    if (showRefreshLoader) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(`${API_URL}/doctors`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }

      const data = await response.json();

      const receivedDoctors = Array.isArray(data.doctors)
        ? data.doctors
        : [];

      setDoctors(receivedDoctors);
    } catch (error) {
      console.error("Doctor loading error:", error);

      setMessage({
        type: "error",
        text: "Unable to connect to the backend. Make sure the FastAPI server is running.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchDoctors();
  }, []);

  function resetForm() {
    setName("");
    setSpecialization("");
    setPhone("");
    setMessage(null);
  }

  function validateDoctorForm() {
    const cleanedName = normalizeText(name);
    const cleanedSpecialization = normalizeText(specialization);
    const cleanedPhone = normalizeText(phone);

    if (!cleanedName) {
      setMessage({
        type: "error",
        text: "Please enter the doctor's name.",
      });
      return false;
    }

    if (cleanedName.length < 3) {
      setMessage({
        type: "error",
        text: "Doctor name must contain at least 3 characters.",
      });
      return false;
    }

    if (!cleanedSpecialization) {
      setMessage({
        type: "error",
        text: "Please enter the doctor's specialization.",
      });
      return false;
    }

    if (cleanedSpecialization.length < 3) {
      setMessage({
        type: "error",
        text: "Please enter a valid specialization.",
      });
      return false;
    }

    if (!cleanedPhone) {
      setMessage({
        type: "error",
        text: "Please enter the doctor's phone number.",
      });
      return false;
    }

    if (!validatePhone(cleanedPhone)) {
      setMessage({
        type: "error",
        text: "Please enter a valid phone number containing 10 to 15 digits.",
      });
      return false;
    }

    const duplicateName = doctors.some(
      (doctor) =>
        doctor.name.trim().toLowerCase() ===
        cleanedName.toLowerCase(),
    );

    if (duplicateName) {
      setMessage({
        type: "error",
        text: "A doctor with this name already exists in the current doctor directory.",
      });
      return false;
    }

    const normalizedPhone = cleanedPhone.replace(/\D/g, "");

    const duplicatePhone = doctors.some(
      (doctor) =>
        doctor.phone.replace(/\D/g, "") === normalizedPhone,
    );

    if (duplicatePhone) {
      setMessage({
        type: "error",
        text: "A doctor with this phone number already exists.",
      });
      return false;
    }

    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateDoctorForm()) {
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const cleanedName = normalizeText(name);
    const cleanedSpecialization = normalizeText(specialization);
    const cleanedPhone = normalizeText(phone);

    try {
      const response = await fetch(`${API_URL}/doctors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanedName,
          specialization: cleanedSpecialization,
          phone: cleanedPhone,
        }),
      });

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const backendMessage =
          data?.detail ||
          data?.message ||
          "Unable to create the doctor.";

        throw new Error(backendMessage);
      }

      setMessage({
        type: "success",
        text: `Doctor ${formatDoctorName(
          cleanedName,
        )} has been added successfully.`,
      });

      resetForm();

      setMessage({
        type: "success",
        text: `Doctor ${formatDoctorName(
          cleanedName,
        )} has been added successfully.`,
      });

      await fetchDoctors(true);
    } catch (error) {
      console.error("Doctor creation error:", error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to add doctor. Please check the backend.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(doctor: Doctor) {
    const confirmed = window.confirm(
      `Delete ${formatDoctorName(
        doctor.name,
      )} from the doctor directory?\n\nDoctor ID: ${
        doctor.id
      }\nSpecialization: ${
        doctor.specialization
      }\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingDoctorId(doctor.id);
    setMessage(null);

    try {
      const response = await fetch(
        `${API_URL}/doctors/${doctor.id}`,
        {
          method: "DELETE",
        },
      );

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const backendMessage =
          data?.detail ||
          data?.message ||
          "Failed to delete doctor.";

        throw new Error(backendMessage);
      }

      if (selectedDoctor?.id === doctor.id) {
        setSelectedDoctor(null);
      }

      setMessage({
        type: "success",
        text: `${formatDoctorName(
          doctor.name,
        )} has been deleted successfully.`,
      });

      await fetchDoctors(true);
    } catch (error) {
      console.error("Doctor deletion error:", error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to delete doctor. Please check the backend.",
      });
    } finally {
      setDeletingDoctorId(null);
    }
  }

  const specializationList = useMemo(() => {
    const unique = Array.from(
      new Set(
        doctors
          .map((doctor) => doctor.specialization.trim())
          .filter(Boolean),
      ),
    );

    return unique.sort((a, b) =>
      a.localeCompare(b),
    );
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    const filtered = doctors.filter((doctor) => {
      const matchesSearch =
        !searchValue ||
        doctor.name.toLowerCase().includes(searchValue) ||
        doctor.specialization
          .toLowerCase()
          .includes(searchValue) ||
        doctor.phone
          .toLowerCase()
          .includes(searchValue) ||
        String(doctor.id).includes(searchValue);

      const matchesSpecialization =
        specializationFilter === "All" ||
        doctor.specialization.toLowerCase() ===
          specializationFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesSpecialization
      );
    });

    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "name-desc":
          return b.name.localeCompare(a.name);

        case "specialization-asc":
          return a.specialization.localeCompare(
            b.specialization,
          );

        case "specialization-desc":
          return b.specialization.localeCompare(
            a.specialization,
          );

        case "newest":
          return b.id - a.id;

        case "oldest":
          return a.id - b.id;

        case "name-asc":
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [
    doctors,
    search,
    specializationFilter,
    sortOption,
  ]);

  const specializationStats = useMemo(() => {
    const map = new Map<string, number>();

    doctors.forEach((doctor) => {
      const key =
        doctor.specialization.trim() ||
        "Unknown";

      map.set(
        key,
        (map.get(key) || 0) + 1,
      );
    });

    return Array.from(map.entries())
      .map(([specialization, count]) => ({
        specialization,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [doctors]);

  const totalDoctors = doctors.length;

  const totalSpecializations =
    specializationStats.length;

  const searchResultCount =
    filteredDoctors.length;

  const topSpecialization =
    specializationStats.length > 0
      ? specializationStats[0]
      : null;

  const doctorsWithValidPhone = doctors.filter(
    (doctor) => validatePhone(doctor.phone),
  ).length;

  const doctorsWithMissingPhone =
    doctors.length - doctorsWithValidPhone;

  function clearFilters() {
    setSearch("");
    setSpecializationFilter("All");
    setSortOption("name-asc");
  }

  function handlePhoneChange(value: string) {
    const cleaned = value.replace(
      /[^0-9+\-\s()]/g,
      "",
    );

    setPhone(cleaned);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* =========================================================
          TOP HEADER
      ========================================================== */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-sm">
              🩺
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-slate-950">
                MediCare Clinic
              </p>

              <p className="text-xs text-slate-500">
                Doctor Management Center
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-right">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Medical Staff
              </p>

              <p className="text-sm font-bold text-slate-900">
                {totalDoctors} Doctors
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchDoctors(true)}
              disabled={refreshing}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          PAGE CONTENT
      ========================================================== */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span>MediCare Clinic</span>
          <span>›</span>
          <span>Management</span>
          <span>›</span>
          <span className="font-medium text-slate-900">
            Doctors
          </span>
        </div>

        {/* Page heading */}
        <section className="mb-8 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-50">
                Medical Staff Directory
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Doctor Management
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
                Manage the MediCare Clinic doctor directory,
                organize medical specializations, review
                doctor information, and maintain a structured
                healthcare staff database.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowAddForm((current) => !current)
              }
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              {showAddForm
                ? "Hide Add Doctor"
                : "＋ Add Doctor"}
            </button>
          </div>
        </section>

        {/* =======================================================
            MESSAGE / ALERT
        ======================================================== */}
        {message && (
          <div
            className={`mb-6 flex items-start justify-between gap-4 rounded-xl border p-4 ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : message.type === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-blue-200 bg-blue-50 text-blue-800"
            }`}
            role="alert"
          >
            <div className="flex items-start gap-3">
              <span className="text-lg">
                {message.type === "success"
                  ? "✓"
                  : message.type === "error"
                    ? "!"
                    : "i"}
              </span>

              <p className="text-sm font-medium leading-6">
                {message.text}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMessage(null)}
              className="rounded-md px-2 py-1 text-sm font-bold opacity-70 hover:bg-black/5 hover:opacity-100"
              aria-label="Close message"
            >
              ×
            </button>
          </div>
        )}

        {/* =======================================================
            STATISTICS
        ======================================================== */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Doctors
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {totalDoctors}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Registered medical staff
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-xl">
                👨‍⚕️
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Specializations
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {totalSpecializations}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Medical departments represented
                </p>
              </div>

              <div className="rounded-xl bg-violet-50 p-3 text-xl">
                🏥
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Directory Matches
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {searchResultCount}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Doctors matching current filters
                </p>
              </div>

              <div className="rounded-xl bg-cyan-50 p-3 text-xl">
                🔎
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Contact Records
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {doctorsWithValidPhone}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Valid phone records
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-xl">
                📞
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            MAIN GRID
        ======================================================== */}
        <div className="grid gap-8 xl:grid-cols-[390px_minmax(0,1fr)]">
          {/* =====================================================
              LEFT: ADD DOCTOR
          ====================================================== */}
          <aside>
            {showAddForm && (
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-950">
                        Add Doctor
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Register a new medical professional.
                      </p>
                    </div>

                    <div className="rounded-xl bg-blue-50 p-3 text-xl">
                      👨‍⚕️
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 p-5"
                >
                  {/* Doctor name */}
                  <div>
                    <label
                      htmlFor="doctor-name"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Doctor Name
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="doctor-name"
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      placeholder="e.g. Ramesh Kumar"
                      autoComplete="name"
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                    <p className="mt-1.5 text-xs text-slate-500">
                      Enter the doctor's full name.
                    </p>
                  </div>

                  {/* Specialization */}
                  <div>
                    <label
                      htmlFor="doctor-specialization"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Specialization
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="doctor-specialization"
                      type="text"
                      value={specialization}
                      onChange={(event) =>
                        setSpecialization(
                          event.target.value,
                        )
                      }
                      list="specialization-options"
                      placeholder="e.g. Cardiology"
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                    <datalist id="specialization-options">
                      {SPECIALIZATIONS.map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          />
                        ),
                      )}
                    </datalist>

                    <p className="mt-1.5 text-xs text-slate-500">
                      Choose an existing department or enter
                      a new specialization.
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="doctor-phone"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Phone Number
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="doctor-phone"
                      type="tel"
                      value={phone}
                      onChange={(event) =>
                        handlePhoneChange(
                          event.target.value,
                        )
                      }
                      placeholder="e.g. 9000000000"
                      autoComplete="tel"
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                    <p className="mt-1.5 text-xs text-slate-500">
                      10–15 digits are supported.
                    </p>
                  </div>

                  {/* Form preview */}
                  {(name ||
                    specialization ||
                    phone) && (
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                        Doctor Preview
                      </p>

                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                          {getInitials(
                            name || "Doctor",
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {formatDoctorName(
                              name || "Doctor Name",
                            )}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {specialization ||
                              "Specialization"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting
                        ? "Adding Doctor..."
                        : "Add Doctor"}
                    </button>

                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={submitting}
                      className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Clear
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* ===================================================
                DEPARTMENT SUMMARY
            ==================================================== */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <h2 className="text-lg font-bold text-slate-950">
                  Department Summary
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Current doctor distribution by specialization.
                </p>
              </div>

              <div className="p-4">
                {specializationStats.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-5 text-center">
                    <p className="text-sm font-medium text-slate-500">
                      No department data available.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {specializationStats
                      .slice(0, 8)
                      .map((item) => (
                        <button
                          key={item.specialization}
                          type="button"
                          onClick={() =>
                            setSpecializationFilter(
                              item.specialization,
                            )
                          }
                          className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="text-lg">
                              {getSpecializationIcon(
                                item.specialization,
                              )}
                            </span>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {item.specialization}
                              </p>

                              <p className="truncate text-xs text-slate-500">
                                {getSpecializationDescription(
                                  item.specialization,
                                )}
                              </p>
                            </div>
                          </div>

                          <span className="ml-3 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-blue-700 shadow-sm">
                            {item.count}
                          </span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </section>

            {/* ===================================================
                DATA QUALITY
            ==================================================== */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Directory Quality
              </h2>

              <div className="mt-4 space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-500">
                      Valid phone records
                    </span>

                    <span className="font-bold text-emerald-700">
                      {doctorsWithValidPhone}/
                      {totalDoctors}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{
                        width:
                          totalDoctors > 0
                            ? `${Math.round(
                                (doctorsWithValidPhone /
                                  totalDoctors) *
                                  100,
                              )}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs leading-5 text-slate-600">
                    {doctorsWithMissingPhone === 0
                      ? "All registered doctors currently have valid phone records."
                      : `${doctorsWithMissingPhone} doctor record(s) may require phone-number review.`}
                  </p>
                </div>
              </div>
            </section>
          </aside>

          {/* =====================================================
              RIGHT: DOCTOR DIRECTORY
          ====================================================== */}
          <section>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Directory header */}
              <div className="border-b border-slate-200 p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-950">
                      Doctor Directory
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {loading
                        ? "Loading medical staff..."
                        : `${searchResultCount} doctor${
                            searchResultCount ===
                            1
                              ? ""
                              : "s"
                          } displayed`}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setShowFilters(
                          (current) =>
                            !current,
                        )
                      }
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {showFilters
                        ? "Hide Filters"
                        : "Show Filters"}
                    </button>

                    {(search ||
                      specializationFilter !==
                        "All" ||
                      sortOption !==
                        "name-asc") && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>

                {/* Filters */}
                {showFilters && (
                  <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_220px]">
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        🔎
                      </span>

                      <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                          setSearch(
                            event.target.value,
                          )
                        }
                        placeholder="Search by name, ID, phone or specialization..."
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <select
                      value={specializationFilter}
                      onChange={(event) =>
                        setSpecializationFilter(
                          event.target.value,
                        )
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="All">
                        All Specializations
                      </option>

                      {specializationList.map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        ),
                      )}
                    </select>

                    <select
                      value={sortOption}
                      onChange={(event) =>
                        setSortOption(
                          event.target
                            .value as SortOption,
                        )
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="name-asc">
                        Name: A → Z
                      </option>

                      <option value="name-desc">
                        Name: Z → A
                      </option>

                      <option value="specialization-asc">
                        Specialization: A → Z
                      </option>

                      <option value="specialization-desc">
                        Specialization: Z → A
                      </option>

                      <option value="newest">
                        Newest Doctor ID
                      </option>

                      <option value="oldest">
                        Oldest Doctor ID
                      </option>
                    </select>
                  </div>
                )}
              </div>

              {/* =================================================
                  DOCTOR LIST
              ================================================== */}
              <div className="p-5 sm:p-6">
                {loading ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {Array.from({
                      length: 6,
                    }).map((_, index) => (
                      <div
                        key={index}
                        className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-full bg-slate-200" />

                          <div className="flex-1">
                            <div className="h-4 w-32 rounded bg-slate-200" />

                            <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
                          </div>
                        </div>

                        <div className="mt-5 h-3 w-full rounded bg-slate-100" />

                        <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
                      </div>
                    ))}
                  </div>
                ) : doctors.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
                      👨‍⚕️
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-slate-900">
                      No doctors registered
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      The doctor directory is currently
                      empty. Add your first doctor using
                      the registration form.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setShowAddForm(true)
                      }
                      className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                      Add First Doctor
                    </button>
                  </div>
                ) : filteredDoctors.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                    <div className="text-4xl">
                      🔍
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-slate-900">
                      No matching doctors
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Try changing your search term or
                      specialization filter.
                    </p>

                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-5 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Reset Directory Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredDoctors.map(
                      (doctor) => {
                        const initials =
                          getInitials(
                            doctor.name,
                          );

                        const isDeleting =
                          deletingDoctorId ===
                          doctor.id;

                        return (
                          <article
                            key={doctor.id}
                            className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                          >
                            {/* Card header */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex min-w-0 items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-base font-bold text-blue-700 ring-4 ring-blue-50">
                                  {initials}
                                </div>

                                <div className="min-w-0">
                                  <h3 className="truncate text-lg font-bold text-slate-950">
                                    {formatDoctorName(
                                      doctor.name,
                                    )}
                                  </h3>

                                  <div className="mt-1 flex items-center gap-2">
                                    <span className="text-lg">
                                      {getSpecializationIcon(
                                        doctor.specialization,
                                      )}
                                    </span>

                                    <p className="truncate text-sm font-medium text-blue-700">
                                      {
                                        doctor.specialization
                                      }
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                                Active
                              </span>
                            </div>

                            {/* Doctor metadata */}
                            <div className="mt-5 space-y-3">
                              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                                <span className="text-base">
                                  🆔
                                </span>

                                <div>
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                    Doctor ID
                                  </p>

                                  <p className="text-sm font-bold text-slate-800">
                                    DOC-
                                    {String(
                                      doctor.id,
                                    ).padStart(
                                      4,
                                      "0",
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                                <span className="text-base">
                                  📞
                                </span>

                                <div className="min-w-0">
                                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                    Phone
                                  </p>

                                  <p className="truncate text-sm font-bold text-slate-800">
                                    {formatPhone(
                                      doctor.phone,
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600">
                                  Department
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                  {
                                    doctor.specialization
                                  }
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                  {getSpecializationDescription(
                                    doctor.specialization,
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-5 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedDoctor(
                                    doctor,
                                  )
                                }
                                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                              >
                                View Profile
                              </button>

                              <a
                                href={`tel:${doctor.phone}`}
                                className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-center text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                              >
                                Call Doctor
                              </a>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    doctor,
                                  )
                                }
                                disabled={
                                  isDeleting
                                }
                                className="col-span-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isDeleting
                                  ? "Deleting Doctor..."
                                  : "Delete Doctor"}
                              </button>
                            </div>
                          </article>
                        );
                      },
                    )}
                  </div>
                )}
              </div>

              {/* Directory footer */}
              {!loading &&
                doctors.length > 0 && (
                  <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
                    <div className="flex flex-col justify-between gap-2 text-xs text-slate-500 sm:flex-row sm:items-center">
                      <p>
                        Showing{" "}
                        <span className="font-bold text-slate-800">
                          {filteredDoctors.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-bold text-slate-800">
                          {doctors.length}
                        </span>{" "}
                        registered doctors.
                      </p>

                      <p>
                        Synthetic/demo healthcare data only.
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </section>
        </div>

        {/* =======================================================
            SPECIALIZATION DIRECTORY
        ======================================================== */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Medical Specialization Directory
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Quick access to supported clinical departments.
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                {SPECIALIZATIONS.length} Categories
              </span>
            </div>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SPECIALIZATIONS.map(
              (specialization) => {
                const count =
                  specializationStats.find(
                    (item) =>
                      item.specialization.toLowerCase() ===
                      specialization.toLowerCase(),
                  )?.count || 0;

                return (
                  <button
                    key={specialization}
                    type="button"
                    onClick={() => {
                      if (count > 0) {
                        setSpecializationFilter(
                          specialization,
                        );
                      }
                    }}
                    className={`rounded-xl border p-4 text-left transition ${
                      count > 0
                        ? "border-blue-100 bg-blue-50 hover:border-blue-300 hover:bg-blue-100"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xl">
                        {getSpecializationIcon(
                          specialization,
                        )}
                      </span>

                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-bold ${
                          count > 0
                            ? "bg-white text-blue-700"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {count}{" "}
                        {count === 1
                          ? "doctor"
                          : "doctors"}
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-bold text-slate-900">
                      {specialization}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {getSpecializationDescription(
                        specialization,
                      )}
                    </p>
                  </button>
                );
              },
            )}
          </div>
        </section>

        {/* =======================================================
            SYSTEM INFORMATION
        ======================================================== */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Doctor Management Information
              </h2>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                This page manages doctor records stored by the
                MediCare Clinic local FastAPI and PostgreSQL
                system. The directory is designed for synthetic
                development and demonstration data.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-center">
                <p className="text-lg font-bold text-slate-900">
                  {totalDoctors}
                </p>

                <p className="text-[11px] font-medium text-slate-500">
                  Doctors
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-3 text-center">
                <p className="text-lg font-bold text-slate-900">
                  {totalSpecializations}
                </p>

                <p className="text-[11px] font-medium text-slate-500">
                  Departments
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-3 text-center">
                <p className="text-lg font-bold text-emerald-700">
                  {doctorsWithValidPhone}
                </p>

                <p className="text-[11px] font-medium text-slate-500">
                  Valid Contacts
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* =========================================================
          DOCTOR PROFILE MODAL
      ========================================================== */}
      {selectedDoctor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedDoctor(null);
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="bg-gradient-to-r from-blue-700 to-cyan-600 p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-xl font-bold ring-2 ring-white/30">
                    {getInitials(
                      selectedDoctor.name,
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
                      Doctor Profile
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      {formatDoctorName(
                        selectedDoctor.name,
                      )}
                    </h2>

                    <p className="mt-1 text-sm text-blue-100">
                      {
                        selectedDoctor.specialization
                      }
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedDoctor(null)
                  }
                  className="rounded-lg bg-white/10 px-3 py-2 text-xl text-white transition hover:bg-white/20"
                  aria-label="Close doctor profile"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="space-y-5 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Doctor ID
                  </p>

                  <p className="mt-2 text-lg font-bold text-slate-900">
                    DOC-
                    {String(
                      selectedDoctor.id,
                    ).padStart(4, "0")}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </p>

                  <p className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
                    Active
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-blue-50 p-3 text-xl">
                    🩺
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Medical Specialization
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {
                        selectedDoctor.specialization
                      }
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {getSpecializationDescription(
                        selectedDoctor.specialization,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-emerald-50 p-3 text-xl">
                    📞
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Contact Number
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {formatPhone(
                        selectedDoctor.phone,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-bold text-blue-800">
                  Doctor Directory Note
                </p>

                <p className="mt-1 text-sm leading-6 text-blue-700">
                  This profile currently contains the doctor
                  information available in the clinic's local
                  doctor database.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={`tel:${selectedDoctor.phone}`}
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  📞 Call Doctor
                </a>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedDoctor(null)
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Close Profile
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  const doctor =
                    selectedDoctor;

                  setSelectedDoctor(null);

                  void handleDelete(doctor);
                }}
                disabled={
                  deletingDoctorId ===
                  selectedDoctor.id
                }
                className="w-full rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingDoctorId ===
                selectedDoctor.id
                  ? "Deleting Doctor..."
                  : "Delete Doctor Record"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MOBILE REFRESH BUTTON
      ========================================================== */}
      <button
        type="button"
        onClick={() => fetchDoctors(true)}
        disabled={refreshing}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:hidden"
        aria-label="Refresh doctors"
        title="Refresh doctors"
      >
        {refreshing ? "…" : "↻"}
      </button>
    </main>
  );
}