"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

type Patient = {
  id: number;
  name: string;
  age: number;
  phone: string;
};

type MessageType = "success" | "error" | "info";

type MessageState = {
  type: MessageType;
  text: string;
} | null;

type AgeFilter =
  | "All"
  | "Children"
  | "Young Adults"
  | "Adults"
  | "Seniors";

type SortOption =
  | "name-asc"
  | "name-desc"
  | "age-asc"
  | "age-desc"
  | "newest"
  | "oldest";

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function getInitials(name: string) {
  const words = normalizeText(name)
    .split(" ")
    .filter(Boolean);

  if (words.length === 0) {
    return "PT";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${
    words[words.length - 1][0]
  }`.toUpperCase();
}

function getAgeGroup(age: number) {
  if (age < 13) {
    return "Children";
  }

  if (age < 25) {
    return "Young Adults";
  }

  if (age < 60) {
    return "Adults";
  }

  return "Seniors";
}

function getAgeGroupDescription(age: number) {
  const group = getAgeGroup(age);

  switch (group) {
    case "Children":
      return "Paediatric age group";

    case "Young Adults":
      return "Young adult age group";

    case "Adults":
      return "Adult age group";

    case "Seniors":
      return "Senior care age group";

    default:
      return "Patient age group";
  }
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }

  return phone;
}

function validatePhone(phone: string) {
  return /^\d{10}$/.test(
    phone.replace(/\D/g, ""),
  );
}

function getAgeBadgeClass(age: number) {
  if (age < 13) {
    return "bg-purple-50 text-purple-700";
  }

  if (age < 25) {
    return "bg-cyan-50 text-cyan-700";
  }

  if (age < 60) {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-amber-50 text-amber-700";
}

export default function PatientsPage() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");

  const [patients, setPatients] =
    useState<Patient[]>([]);

  const [search, setSearch] = useState("");

  const [ageFilter, setAgeFilter] =
    useState<AgeFilter>("All");

  const [sortOption, setSortOption] =
    useState<SortOption>("name-asc");

  const [message, setMessage] =
    useState<MessageState>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [deletingPatientId, setDeletingPatientId] =
    useState<number | null>(null);

  const [selectedPatient, setSelectedPatient] =
    useState<Patient | null>(null);

  const [showAddForm, setShowAddForm] =
    useState(true);

  const [showFilters, setShowFilters] =
    useState(true);

  async function fetchPatients(
    showRefreshLoader = false,
  ) {
    if (showRefreshLoader) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(
        `${API_URL}/patients`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch patients",
        );
      }

      const data = await response.json();

      const receivedPatients =
        Array.isArray(data.patients)
          ? data.patients
          : [];

      setPatients(receivedPatients);
    } catch (error) {
      console.error(
        "Patient loading error:",
        error,
      );

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
    fetchPatients();
  }, []);

  function clearForm() {
    setName("");
    setAge("");
    setPhone("");
  }

  function clearFilters() {
    setSearch("");
    setAgeFilter("All");
    setSortOption("name-asc");
  }

  function validatePatientForm() {
    const cleanedName =
      normalizeText(name);

    const cleanedPhone =
      phone.replace(/\D/g, "");

    const numericAge = Number(age);

    if (!cleanedName) {
      setMessage({
        type: "error",
        text: "Please enter the patient's full name.",
      });

      return false;
    }

    if (cleanedName.length < 2) {
      setMessage({
        type: "error",
        text: "Patient name must contain at least 2 characters.",
      });

      return false;
    }

    if (!age) {
      setMessage({
        type: "error",
        text: "Please enter the patient's age.",
      });

      return false;
    }

    if (
      !Number.isInteger(numericAge) ||
      numericAge < 1 ||
      numericAge > 120
    ) {
      setMessage({
        type: "error",
        text: "Age must be a whole number between 1 and 120.",
      });

      return false;
    }

    if (!cleanedPhone) {
      setMessage({
        type: "error",
        text: "Please enter the patient's phone number.",
      });

      return false;
    }

    if (!validatePhone(cleanedPhone)) {
      setMessage({
        type: "error",
        text: "Phone number must contain exactly 10 digits.",
      });

      return false;
    }

    const duplicatePhone =
      patients.some(
        (patient) =>
          patient.phone.replace(
            /\D/g,
            "",
          ) === cleanedPhone,
      );

    if (duplicatePhone) {
      setMessage({
        type: "error",
        text: "A patient with this phone number already exists.",
      });

      return false;
    }

    const duplicateName =
      patients.some(
        (patient) =>
          patient.name
            .trim()
            .toLowerCase() ===
          cleanedName.toLowerCase(),
      );

    if (duplicateName) {
      setMessage({
        type: "error",
        text: "A patient with this name already exists in the current directory.",
      });

      return false;
    }

    return true;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage(null);

    if (!validatePatientForm()) {
      return;
    }

    setSubmitting(true);

    const cleanedName =
      normalizeText(name);

    const numericAge = Number(age);

    const cleanedPhone =
      phone.replace(/\D/g, "");

    try {
      const response = await fetch(
        `${API_URL}/patients`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name: cleanedName,
            age: numericAge,
            phone: cleanedPhone,
          }),
        },
      );

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Failed to create patient.",
        );
      }

      clearForm();

      setMessage({
        type: "success",
        text: `Patient ${cleanedName} has been registered successfully.`,
      });

      await fetchPatients(true);
    } catch (error) {
      console.error(
        "Patient creation error:",
        error,
      );

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to add patient. Please check the backend.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(
    patient: Patient,
  ) {
    const confirmed = window.confirm(
      `Delete ${patient.name} from the patient directory?\n\nPatient ID: PAT-${String(
        patient.id,
      ).padStart(4, "0")}\nAge: ${
        patient.age
      }\nPhone: ${patient.phone}\n\nThis action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingPatientId(patient.id);
    setMessage(null);

    try {
      const response = await fetch(
        `${API_URL}/patients/${patient.id}`,
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
        throw new Error(
          data?.detail ||
            data?.message ||
            "Failed to delete patient.",
        );
      }

      if (
        selectedPatient?.id ===
        patient.id
      ) {
        setSelectedPatient(null);
      }

      setMessage({
        type: "success",
        text: `Patient ${patient.name} has been deleted successfully.`,
      });

      await fetchPatients(true);
    } catch (error) {
      console.error(
        "Patient deletion error:",
        error,
      );

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to delete patient. Please check the backend.",
      });
    } finally {
      setDeletingPatientId(null);
    }
  }

  function handlePhoneChange(
    value: string,
  ) {
    const digits = value.replace(
      /\D/g,
      "",
    );

    setPhone(digits.slice(0, 10));
  }

  const filteredPatients =
    useMemo(() => {
      const searchText =
        search.trim().toLowerCase();

      const filtered = patients.filter(
        (patient) => {
          const matchesSearch =
            !searchText ||
            patient.name
              .toLowerCase()
              .includes(searchText) ||
            patient.phone
              .toLowerCase()
              .includes(searchText) ||
            String(patient.id).includes(
              searchText,
            ) ||
            String(patient.age).includes(
              searchText,
            );

          const matchesAge =
            ageFilter === "All" ||
            getAgeGroup(patient.age) ===
              ageFilter;

          return (
            matchesSearch &&
            matchesAge
          );
        },
      );

      return [...filtered].sort(
        (a, b) => {
          switch (sortOption) {
            case "name-desc":
              return b.name.localeCompare(
                a.name,
              );

            case "age-asc":
              return a.age - b.age;

            case "age-desc":
              return b.age - a.age;

            case "newest":
              return b.id - a.id;

            case "oldest":
              return a.id - b.id;

            case "name-asc":
            default:
              return a.name.localeCompare(
                b.name,
              );
          }
        },
      );
    }, [
      patients,
      search,
      ageFilter,
      sortOption,
    ]);

  const statistics = useMemo(() => {
    const children =
      patients.filter(
        (patient) => patient.age < 13,
      ).length;

    const youngAdults =
      patients.filter(
        (patient) =>
          patient.age >= 13 &&
          patient.age < 25,
      ).length;

    const adults =
      patients.filter(
        (patient) =>
          patient.age >= 25 &&
          patient.age < 60,
      ).length;

    const seniors =
      patients.filter(
        (patient) => patient.age >= 60,
      ).length;

    const averageAge =
      patients.length > 0
        ? patients.reduce(
            (total, patient) =>
              total + patient.age,
            0,
          ) / patients.length
        : 0;

    const validPhones =
      patients.filter((patient) =>
        validatePhone(patient.phone),
      ).length;

    return {
      children,
      youngAdults,
      adults,
      seniors,
      averageAge,
      validPhones,
    };
  }, [patients]);

  const ageGroups = [
    {
      label: "Children",
      value: statistics.children,
      icon: "👶",
      description: "Age 1–12",
      filter:
        "Children" as AgeFilter,
    },
    {
      label: "Young Adults",
      value: statistics.youngAdults,
      icon: "🧑",
      description: "Age 13–24",
      filter:
        "Young Adults" as AgeFilter,
    },
    {
      label: "Adults",
      value: statistics.adults,
      icon: "👨",
      description: "Age 25–59",
      filter:
        "Adults" as AgeFilter,
    },
    {
      label: "Seniors",
      value: statistics.seniors,
      icon: "👴",
      description: "Age 60+",
      filter:
        "Seniors" as AgeFilter,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white shadow-sm">
              🏥
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-950">
                MediCare Clinic
              </h1>

              <p className="text-xs text-slate-500">
                Patient Management Center
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Registered
              </p>

              <p className="text-sm font-bold text-slate-900">
                {patients.length} Patients
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                fetchPatients(true)
              }
              disabled={refreshing}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ===================================================
            BREADCRUMB
        ==================================================== */}
        <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span>MediCare Clinic</span>
          <span>›</span>
          <span>Management</span>
          <span>›</span>
          <span className="font-semibold text-slate-900">
            Patients
          </span>
        </div>

        {/* ===================================================
            HERO
        ==================================================== */}
        <section className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-50">
                Patient Services
              </span>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Patient Management
              </h2>

              <p className="mt-3 text-sm leading-6 text-blue-50 sm:text-base">
                Register patients, maintain the clinic
                directory, search patient records, review
                demographic information, and organize
                patients into useful age groups.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowAddForm(
                  (current) => !current,
                )
              }
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              {showAddForm
                ? "Hide Registration"
                : "＋ Register Patient"}
            </button>
          </div>
        </section>

        {/* ===================================================
            ALERT
        ==================================================== */}
        {message && (
          <div
            className={`mb-6 flex items-start justify-between gap-4 rounded-xl border p-4 ${
              message.type ===
              "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : message.type ===
                    "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-blue-200 bg-blue-50 text-blue-800"
            }`}
            role="alert"
          >
            <div className="flex items-start gap-3">
              <span className="text-lg font-bold">
                {message.type ===
                "success"
                  ? "✓"
                  : message.type ===
                      "error"
                    ? "!"
                    : "i"}
              </span>

              <p className="text-sm font-medium leading-6">
                {message.text}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setMessage(null)
              }
              className="rounded-md px-2 py-1 text-lg opacity-60 transition hover:bg-black/5 hover:opacity-100"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        )}

        {/* ===================================================
            STAT CARDS
        ==================================================== */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Patients
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {patients.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Registered in clinic
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-xl">
                👥
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Average Age
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {statistics.averageAge.toFixed(
                    1,
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Across registered patients
                </p>
              </div>

              <div className="rounded-xl bg-cyan-50 p-3 text-xl">
                📊
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
                  {filteredPatients.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Current search/filter result
                </p>
              </div>

              <div className="rounded-xl bg-violet-50 p-3 text-xl">
                🔎
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Valid Contacts
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {statistics.validPhones}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  10-digit phone records
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-xl">
                📞
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            AGE GROUP CARDS
        ==================================================== */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ageGroups.map(
            (group) => (
              <button
                key={group.label}
                type="button"
                onClick={() =>
                  setAgeFilter(
                    group.filter,
                  )
                }
                className={`rounded-2xl border p-5 text-left shadow-sm transition ${
                  ageFilter ===
                  group.filter
                    ? "border-blue-300 bg-blue-50 ring-2 ring-blue-100"
                    : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl">
                    {group.icon}
                  </span>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                    {group.value}
                  </span>
                </div>

                <p className="mt-4 text-sm font-bold text-slate-900">
                  {group.label}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {group.description}
                </p>
              </button>
            ),
          )}
        </section>

        {/* ===================================================
            MAIN LAYOUT
        ==================================================== */}
        <div className="grid gap-8 xl:grid-cols-[390px_minmax(0,1fr)]">
          {/* =================================================
              LEFT COLUMN
          ================================================== */}
          <aside>
            {/* Registration form */}
            {showAddForm && (
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-950">
                        Register Patient
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Create a new patient record.
                      </p>
                    </div>

                    <div className="rounded-xl bg-blue-50 p-3 text-xl">
                      🧑‍⚕️
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="space-y-5 p-5"
                >
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="patient-name"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Patient Name
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="patient-name"
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Enter patient's full name"
                      autoComplete="name"
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                    <p className="mt-1.5 text-xs text-slate-500">
                      Use the patient's complete name.
                    </p>
                  </div>

                  {/* Age */}
                  <div>
                    <label
                      htmlFor="patient-age"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Age
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="patient-age"
                      type="number"
                      value={age}
                      onChange={(event) =>
                        setAge(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Enter age"
                      min="1"
                      max="120"
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                    <p className="mt-1.5 text-xs text-slate-500">
                      Supported range: 1 to 120 years.
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="patient-phone"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Phone Number
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="patient-phone"
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(event) =>
                        handlePhoneChange(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Enter 10-digit number"
                      autoComplete="tel"
                      maxLength={10}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                    <div className="mt-1.5 flex justify-between text-xs">
                      <span className="text-slate-500">
                        Exactly 10 digits
                      </span>

                      <span
                        className={
                          phone.length ===
                          10
                            ? "font-bold text-emerald-600"
                            : "text-slate-400"
                        }
                      >
                        {phone.length}/10
                      </span>
                    </div>
                  </div>

                  {/* Preview */}
                  {(name ||
                    age ||
                    phone) && (
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-blue-700">
                        Patient Preview
                      </p>

                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                          {getInitials(
                            name ||
                              "Patient",
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {name ||
                              "Patient Name"}
                          </p>

                          <p className="text-xs text-slate-500">
                            {age
                              ? `${age} years`
                              : "Age not entered"}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {phone ||
                              "Phone not entered"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="submit"
                      disabled={
                        submitting
                      }
                      className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting
                        ? "Registering..."
                        : "Register Patient"}
                    </button>

                    <button
                      type="button"
                      onClick={
                        clearForm
                      }
                      disabled={
                        submitting
                      }
                      className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Clear
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* Patient management overview */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Patient Overview
              </h2>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      👶
                    </span>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Children
                      </p>

                      <p className="text-xs text-slate-500">
                        Ages 1–12
                      </p>
                    </div>
                  </div>

                  <span className="font-bold text-slate-900">
                    {statistics.children}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      🧑
                    </span>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Young Adults
                      </p>

                      <p className="text-xs text-slate-500">
                        Ages 13–24
                      </p>
                    </div>
                  </div>

                  <span className="font-bold text-slate-900">
                    {
                      statistics.youngAdults
                    }
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      👨
                    </span>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Adults
                      </p>

                      <p className="text-xs text-slate-500">
                        Ages 25–59
                      </p>
                    </div>
                  </div>

                  <span className="font-bold text-slate-900">
                    {statistics.adults}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      👴
                    </span>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Seniors
                      </p>

                      <p className="text-xs text-slate-500">
                        Ages 60+
                      </p>
                    </div>
                  </div>

                  <span className="font-bold text-slate-900">
                    {statistics.seniors}
                  </span>
                </div>
              </div>
            </section>

            {/* Data quality */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Data Quality
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Basic checks for the current patient directory.
              </p>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-500">
                    Valid phone records
                  </span>

                  <span className="font-bold text-emerald-700">
                    {statistics.validPhones}/
                    {patients.length}
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{
                      width:
                        patients.length >
                        0
                          ? `${Math.round(
                              (statistics.validPhones /
                                patients.length) *
                                100,
                            )}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs leading-5 text-blue-700">
                  Patient records shown here are intended for
                  local development and demonstration. Do not
                  enter real patient-identifying information.
                </p>
              </div>
            </section>
          </aside>

          {/* =================================================
              RIGHT COLUMN
          ================================================== */}
          <section>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Directory header */}
              <div className="border-b border-slate-200 p-5 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-950">
                      Patient Directory
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {loading
                        ? "Loading patient records..."
                        : `Showing ${filteredPatients.length} of ${patients.length} patient records`}
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
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {showFilters
                        ? "Hide Filters"
                        : "Show Filters"}
                    </button>

                    {(search ||
                      ageFilter !==
                        "All" ||
                      sortOption !==
                        "name-asc") && (
                      <button
                        type="button"
                        onClick={
                          clearFilters
                        }
                        className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>

                {/* Filters */}
                {showFilters && (
                  <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_200px]">
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        🔎
                      </span>

                      <input
                        type="search"
                        value={search}
                        onChange={(
                          event,
                        ) =>
                          setSearch(
                            event.target
                              .value,
                          )
                        }
                        placeholder="Search by patient name, ID, phone or age..."
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <select
                      value={ageFilter}
                      onChange={(
                        event,
                      ) =>
                        setAgeFilter(
                          event.target
                            .value as AgeFilter,
                        )
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="All">
                        All Age Groups
                      </option>

                      <option value="Children">
                        Children
                      </option>

                      <option value="Young Adults">
                        Young Adults
                      </option>

                      <option value="Adults">
                        Adults
                      </option>

                      <option value="Seniors">
                        Seniors
                      </option>
                    </select>

                    <select
                      value={sortOption}
                      onChange={(
                        event,
                      ) =>
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

                      <option value="age-asc">
                        Age: Low → High
                      </option>

                      <option value="age-desc">
                        Age: High → Low
                      </option>

                      <option value="newest">
                        Newest Patient ID
                      </option>

                      <option value="oldest">
                        Oldest Patient ID
                      </option>
                    </select>
                  </div>
                )}
              </div>

              {/* Directory */}
              <div className="p-5 sm:p-6">
                {loading ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {Array.from({
                      length: 6,
                    }).map(
                      (_, index) => (
                        <div
                          key={index}
                          className="animate-pulse rounded-2xl border border-slate-200 p-5"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-full bg-slate-200" />

                            <div className="flex-1">
                              <div className="h-4 w-36 rounded bg-slate-200" />

                              <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
                            </div>
                          </div>

                          <div className="mt-5 h-3 w-full rounded bg-slate-100" />

                          <div className="mt-2 h-3 w-3/4 rounded bg-slate-100" />
                        </div>
                      ),
                    )}
                  </div>
                ) : patients.length ===
                  0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
                      👥
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-slate-900">
                      No patients registered
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      The patient directory is currently empty.
                      Register your first patient to begin building
                      the local clinic database.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setShowAddForm(
                          true,
                        )
                      }
                      className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                      Register First Patient
                    </button>
                  </div>
                ) : filteredPatients.length ===
                  0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                    <div className="text-4xl">
                      🔍
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-slate-900">
                      No matching patients
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Try a different search term or age filter.
                    </p>

                    <button
                      type="button"
                      onClick={
                        clearFilters
                      }
                      className="mt-5 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredPatients.map(
                      (patient) => {
                        const isDeleting =
                          deletingPatientId ===
                          patient.id;

                        return (
                          <article
                            key={
                              patient.id
                            }
                            className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                          >
                            {/* Card heading */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex min-w-0 items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 ring-4 ring-blue-50">
                                  {getInitials(
                                    patient.name,
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <h3 className="truncate text-lg font-bold text-slate-950">
                                    {
                                      patient.name
                                    }
                                  </h3>

                                  <p className="mt-1 text-xs font-medium text-slate-500">
                                    Patient ID: PAT-
                                    {String(
                                      patient.id,
                                    ).padStart(
                                      4,
                                      "0",
                                    )}
                                  </p>
                                </div>
                              </div>

                              <span
                                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${getAgeBadgeClass(
                                  patient.age,
                                )}`}
                              >
                                {getAgeGroup(
                                  patient.age,
                                )}
                              </span>
                            </div>

                            {/* Details */}
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                              <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                  Age
                                </p>

                                <p className="mt-1 text-sm font-bold text-slate-800">
                                  {
                                    patient.age
                                  }{" "}
                                  years
                                </p>
                              </div>

                              <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                  Phone
                                </p>

                                <p className="mt-1 truncate text-sm font-bold text-slate-800">
                                  {formatPhone(
                                    patient.phone,
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Age information */}
                            <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
                              <div className="flex items-center gap-3">
                                <span className="text-xl">
                                  {patient.age <
                                  13
                                    ? "👶"
                                    : patient.age <
                                        25
                                      ? "🧑"
                                      : patient.age <
                                          60
                                        ? "👨"
                                        : "👴"}
                                </span>

                                <div>
                                  <p className="text-xs font-bold text-blue-700">
                                    {
                                      getAgeGroup(
                                        patient.age,
                                      )
                                    }
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-500">
                                    {getAgeGroupDescription(
                                      patient.age,
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-5 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedPatient(
                                    patient,
                                  )
                                }
                                className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                              >
                                View Profile
                              </button>

                              <a
                                href={`tel:${patient.phone}`}
                                className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-center text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                              >
                                📞 Call
                              </a>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    patient,
                                  )
                                }
                                disabled={
                                  isDeleting
                                }
                                className="col-span-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isDeleting
                                  ? "Deleting Patient..."
                                  : "Delete Patient Record"}
                              </button>
                            </div>
                          </article>
                        );
                      },
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              {!loading &&
                patients.length >
                  0 && (
                  <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
                    <div className="flex flex-col justify-between gap-2 text-xs text-slate-500 sm:flex-row sm:items-center">
                      <p>
                        Displaying{" "}
                        <span className="font-bold text-slate-800">
                          {
                            filteredPatients.length
                          }
                        </span>{" "}
                        of{" "}
                        <span className="font-bold text-slate-800">
                          {patients.length}
                        </span>{" "}
                        patient records.
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

        {/* ===================================================
            PATIENT ANALYTICS
        ==================================================== */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <h2 className="text-xl font-bold text-slate-950">
              Patient Demographic Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Visual summary of the current patient age distribution.
            </p>
          </div>

          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-4">
            {ageGroups.map(
              (group) => {
                const percentage =
                  patients.length >
                  0
                    ? Math.round(
                        (group.value /
                          patients.length) *
                          100,
                      )
                    : 0;

                return (
                  <div
                    key={group.label}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-800">
                        {group.label}
                      </p>

                      <span className="text-lg">
                        {group.icon}
                      </span>
                    </div>

                    <div className="mt-4 flex items-end justify-between">
                      <p className="text-2xl font-bold text-slate-950">
                        {group.value}
                      </p>

                      <p className="text-xs font-bold text-slate-500">
                        {percentage}%
                      </p>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </section>

        {/* ===================================================
            SYSTEM INFORMATION
        ==================================================== */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Patient Management Information
              </h2>

              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                Patient records are stored in the MediCare Clinic
                local FastAPI and PostgreSQL system. This interface
                currently manages basic demographic information and
                is structured so additional clinical modules can be
                added later.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-center">
                <p className="text-lg font-bold text-slate-900">
                  {patients.length}
                </p>

                <p className="text-[11px] font-medium text-slate-500">
                  Patients
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-3 text-center">
                <p className="text-lg font-bold text-slate-900">
                  {statistics.averageAge.toFixed(
                    0,
                  )}
                </p>

                <p className="text-[11px] font-medium text-slate-500">
                  Avg Age
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-3 text-center">
                <p className="text-lg font-bold text-emerald-700">
                  {statistics.validPhones}
                </p>

                <p className="text-[11px] font-medium text-slate-500">
                  Contacts
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================
          PATIENT PROFILE MODAL
      ====================================================== */}
      {selectedPatient && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedPatient(
                null,
              );
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
                      selectedPatient.name,
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-100">
                      Patient Profile
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      {
                        selectedPatient.name
                      }
                    </h2>

                    <p className="mt-1 text-sm text-blue-100">
                      Patient ID: PAT-
                      {String(
                        selectedPatient.id,
                      ).padStart(
                        4,
                        "0",
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedPatient(
                      null,
                    )
                  }
                  className="rounded-lg bg-white/10 px-3 py-2 text-xl transition hover:bg-white/20"
                  aria-label="Close patient profile"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="space-y-5 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Age
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {
                      selectedPatient.age
                    }
                  </p>

                  <p className="text-xs text-slate-500">
                    years old
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Age Group
                  </p>

                  <p className="mt-2 text-lg font-bold text-blue-700">
                    {getAgeGroup(
                      selectedPatient.age,
                    )}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-emerald-50 p-3 text-xl">
                    📞
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Phone Number
                    </p>

                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {formatPhone(
                        selectedPatient.phone,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-bold text-blue-800">
                  Patient Record
                </p>

                <p className="mt-1 text-sm leading-6 text-blue-700">
                  This profile displays the demographic
                  information currently stored in the local
                  MediCare Clinic patient database.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={`tel:${selectedPatient.phone}`}
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  📞 Call Patient
                </a>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedPatient(
                      null,
                    )
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Close Profile
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  const patient =
                    selectedPatient;

                  setSelectedPatient(
                    null,
                  );

                  void handleDelete(
                    patient,
                  );
                }}
                disabled={
                  deletingPatientId ===
                  selectedPatient.id
                }
                className="w-full rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingPatientId ===
                selectedPatient.id
                  ? "Deleting Patient..."
                  : "Delete Patient Record"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MOBILE REFRESH
      ====================================================== */}
      <button
        type="button"
        onClick={() =>
          fetchPatients(true)
        }
        disabled={refreshing}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:hidden"
        aria-label="Refresh patients"
        title="Refresh patients"
      >
        {refreshing ? "…" : "↻"}
      </button>
    </main>
  );
}