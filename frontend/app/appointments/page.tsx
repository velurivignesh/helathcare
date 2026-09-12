"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

/* ============================================================
   MEDICARE CLINIC
   APPOINTMENT MANAGEMENT SYSTEM
   ============================================================

   This page provides:

   - Appointment creation
   - Patient and doctor loading
   - Appointment search
   - Patient filtering
   - Doctor filtering
   - Date filtering
   - Status filtering
   - Sorting
   - Pagination
   - Appointment statistics
   - Today's schedule
   - Upcoming appointments
   - Past appointments
   - Appointment details
   - Delete confirmation
   - Refresh functionality
   - CSV export
   - Print schedule
   - Copy appointment information
   - Form validation
   - Character counters
   - Loading states
   - Error states
   - Success notifications
   - Responsive interface
   - Accessible controls

   Backend endpoints used:

   GET    /patients
   GET    /doctors
   GET    /appointments
   GET    /appointments/{id}
   POST   /appointments
   DELETE /appointments/{id}

   ============================================================ */

const API_URL = "http://127.0.0.1:8000";

/* ============================================================
   TYPES
   ============================================================ */

type Patient = {
  id: number;
  name: string;
};

type Doctor = {
  id: number;
  name: string;
  specialization: string;
};

type Appointment = {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  reason: string;
};

type AppointmentStatus =
  | "Today"
  | "Upcoming"
  | "Past"
  | "No Date";

type SortField =
  | "date"
  | "time"
  | "patient"
  | "doctor"
  | "id";

type SortDirection = "asc" | "desc";

type MessageType =
  | "success"
  | "error"
  | "info"
  | "warning";

type MessageState = {
  type: MessageType;
  text: string;
};

type FormErrors = {
  patientId?: string;
  doctorId?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  reason?: string;
};

/* ============================================================
   ICON COMPONENTS
   ============================================================ */

function CalendarIcon({
  size = 20,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  );
}

function ClockIcon({
  size = 20,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function UserIcon({
  size = 20,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6" />
    </svg>
  );
}

function DoctorIcon({
  size = 20,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="7" r="4" />
      <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
      <path d="M9 17h6" />
    </svg>
  );
}

function SearchIcon({
  size = 20,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function RefreshIcon({
  size = 20,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 11a8.1 8.1 0 0 0-15.5-3" />
      <path d="M4 4v5h5" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 3" />
      <path d="M20 20v-5h-5" />
    </svg>
  );
}

function TrashIcon({
  size = 18,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 15H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function EyeIcon({
  size = 18,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function CopyIcon({
  size = 18,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function PrintIcon({
  size = 18,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9V2h12v7" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function DownloadIcon({
  size = 18,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function PlusIcon({
  size = 20,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function CheckIcon({
  size = 18,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function AlertIcon({
  size = 18,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.3 3.3 2.4 17a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function FilterIcon({
  size = 18,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  );
}

function HospitalIcon({
  size = 20,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 21h18" />
      <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
      <path d="M9 7h6" />
      <path d="M12 4v6" />
      <path d="M8 14h2" />
      <path d="M14 14h2" />
      <path d="M8 18h2" />
      <path d="M14 18h2" />
    </svg>
  );
}

/* ============================================================
   DATE HELPERS
   ============================================================ */

function getTodayDate(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateString: string): string {
  if (!dateString) {
    return "No date";
  }

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(timeString: string): string {
  if (!timeString) {
    return "No time";
  }

  const [hoursText, minutesText] = timeString.split(":");

  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return timeString;
  }

  const date = new Date();

  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function compareDateTime(
  appointment: Appointment
): number {
  const date = appointment.appointment_date || "";
  const time = appointment.appointment_time || "00:00";

  return new Date(`${date}T${time}`).getTime();
}

function getAppointmentStatus(
  appointment: Appointment
): AppointmentStatus {
  if (!appointment.appointment_date) {
    return "No Date";
  }

  const today = getTodayDate();

  if (appointment.appointment_date === today) {
    return "Today";
  }

  if (appointment.appointment_date > today) {
    return "Upcoming";
  }

  return "Past";
}

/* ============================================================
   FORM HELPERS
   ============================================================ */

function createEmptyForm() {
  return {
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
  };
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function AppointmentsPage() {
  /* ==========================================================
     DATA STATE
     ========================================================== */

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  /* ==========================================================
     FORM STATE
     ========================================================== */

  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] =
    useState("");
  const [appointmentTime, setAppointmentTime] =
    useState("");
  const [reason, setReason] = useState("");

  const [formErrors, setFormErrors] =
    useState<FormErrors>({});

  /* ==========================================================
     UI STATE
     ========================================================== */

  const [message, setMessage] =
    useState<MessageState | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<Appointment | null>(null);

  /* ==========================================================
     FILTER STATE
     ========================================================== */

  const [search, setSearch] = useState("");
  const [patientFilter, setPatientFilter] =
    useState("");
  const [doctorFilter, setDoctorFilter] =
    useState("");
  const [dateFilter, setDateFilter] =
    useState("");
  const [statusFilter, setStatusFilter] =
    useState<"All" | AppointmentStatus>("All");

  /* ==========================================================
     SORT STATE
     ========================================================== */

  const [sortField, setSortField] =
    useState<SortField>("date");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("asc");

  /* ==========================================================
     PAGINATION
     ========================================================== */

  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 8;

  /* ==========================================================
     BASIC DATA FETCHING
     ========================================================== */

  async function fetchPatients() {
    const response = await fetch(
      `${API_URL}/patients`
    );

    if (!response.ok) {
      throw new Error(
        "Failed to fetch patients."
      );
    }

    const data = await response.json();

    setPatients(
      Array.isArray(data.patients)
        ? data.patients
        : []
    );
  }

  async function fetchDoctors() {
    const response = await fetch(
      `${API_URL}/doctors`
    );

    if (!response.ok) {
      throw new Error(
        "Failed to fetch doctors."
      );
    }

    const data = await response.json();

    setDoctors(
      Array.isArray(data.doctors)
        ? data.doctors
        : []
    );
  }

  async function fetchAppointments() {
    const response = await fetch(
      `${API_URL}/appointments`
    );

    if (!response.ok) {
      throw new Error(
        "Failed to fetch appointments."
      );
    }

    const data = await response.json();

    setAppointments(
      Array.isArray(data.appointments)
        ? data.appointments
        : []
    );
  }

  async function loadData(
    showRefreshState = false
  ) {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      await Promise.all([
        fetchPatients(),
        fetchDoctors(),
        fetchAppointments(),
      ]);

      if (showRefreshState) {
        setMessage({
          type: "success",
          text: "Appointment data refreshed successfully.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to connect to the backend.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  /* ==========================================================
     LOOKUP HELPERS
     ========================================================== */

  function getPatientName(
    id: number
  ): string {
    const patient = patients.find(
      (item) => item.id === id
    );

    return patient
      ? patient.name
      : `Patient #${id}`;
  }

  function getDoctorName(
    id: number
  ): string {
    const doctor = doctors.find(
      (item) => item.id === id
    );

    return doctor
      ? doctor.name
      : `Doctor #${id}`;
  }

  function getDoctorSpecialization(
    id: number
  ): string {
    const doctor = doctors.find(
      (item) => item.id === id
    );

    return doctor
      ? doctor.specialization
      : "Medical Department";
  }

  /* ==========================================================
     FORM VALIDATION
     ========================================================== */

  function validateForm(): boolean {
    const errors: FormErrors = {};

    if (!patientId) {
      errors.patientId =
        "Please select a patient.";
    }

    if (!doctorId) {
      errors.doctorId =
        "Please select a doctor.";
    }

    if (!appointmentDate) {
      errors.appointmentDate =
        "Please select an appointment date.";
    }

    if (!appointmentTime) {
      errors.appointmentTime =
        "Please select an appointment time.";
    }

    if (!reason.trim()) {
      errors.reason =
        "Please enter the appointment reason.";
    } else if (reason.trim().length < 3) {
      errors.reason =
        "Reason should contain at least 3 characters.";
    } else if (reason.trim().length > 500) {
      errors.reason =
        "Reason cannot exceed 500 characters.";
    }

    if (
      appointmentDate &&
      appointmentDate < getTodayDate()
    ) {
      errors.appointmentDate =
        "Please select today or a future date.";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  }

  /* ==========================================================
     DUPLICATE APPOINTMENT CHECK
     ========================================================== */

  function findPossibleDuplicate() {
    if (
      !patientId ||
      !doctorId ||
      !appointmentDate ||
      !appointmentTime
    ) {
      return null;
    }

    return appointments.find(
      (appointment) =>
        appointment.patient_id ===
          Number(patientId) &&
        appointment.doctor_id ===
          Number(doctorId) &&
        appointment.appointment_date ===
          appointmentDate &&
        appointment.appointment_time ===
          appointmentTime
    );
  }

  /* ==========================================================
     CREATE APPOINTMENT
     ========================================================== */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage(null);

    if (!validateForm()) {
      setMessage({
        type: "warning",
        text: "Please correct the highlighted fields.",
      });

      return;
    }

    const duplicate =
      findPossibleDuplicate();

    if (duplicate) {
      setMessage({
        type: "warning",
        text:
          "A matching appointment already exists for this patient, doctor, date, and time.",
      });

      return;
    }

    setCreating(true);

    try {
      const response = await fetch(
        `${API_URL}/appointments`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            patient_id: Number(patientId),
            doctor_id: Number(doctorId),
            appointment_date:
              appointmentDate,
            appointment_time:
              appointmentTime,
            reason: reason.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to create appointment."
        );
      }

      setMessage({
        type: "success",
        text:
          data.message ||
          "Appointment created successfully.",
      });

      resetForm();

      await fetchAppointments();

      setCurrentPage(1);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to create appointment.",
      });
    } finally {
      setCreating(false);
    }
  }

  /* ==========================================================
     RESET FORM
     ========================================================== */

  function resetForm() {
    const empty = createEmptyForm();

    setPatientId(empty.patientId);
    setDoctorId(empty.doctorId);
    setAppointmentDate(
      empty.appointmentDate
    );
    setAppointmentTime(
      empty.appointmentTime
    );
    setReason(empty.reason);

    setFormErrors({});
  }

  /* ==========================================================
     DELETE APPOINTMENT
     ========================================================== */

  async function handleDelete(
    appointment: Appointment
  ) {
    setDeletingId(appointment.id);

    try {
      const response = await fetch(
        `${API_URL}/appointments/${appointment.id}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to delete appointment."
        );
      }

      setMessage({
        type: "success",
        text:
          data.message ||
          "Appointment deleted successfully.",
      });

      if (
        selectedAppointment?.id ===
        appointment.id
      ) {
        setSelectedAppointment(null);
      }

      setDeleteTarget(null);

      await fetchAppointments();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to delete appointment.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  /* ==========================================================
     SEARCH / FILTER / SORT
     ========================================================== */

  const filteredAppointments =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      const result =
        appointments.filter(
          (appointment) => {
            const patientName =
              getPatientName(
                appointment.patient_id
              ).toLowerCase();

            const doctorName =
              getDoctorName(
                appointment.doctor_id
              ).toLowerCase();

            const specialization =
              getDoctorSpecialization(
                appointment.doctor_id
              ).toLowerCase();

            const reason =
              appointment.reason.toLowerCase();

            const idText =
              String(appointment.id);

            const matchesSearch =
              !normalizedSearch ||
              patientName.includes(
                normalizedSearch
              ) ||
              doctorName.includes(
                normalizedSearch
              ) ||
              specialization.includes(
                normalizedSearch
              ) ||
              reason.includes(
                normalizedSearch
              ) ||
              idText.includes(
                normalizedSearch
              );

            const matchesPatient =
              !patientFilter ||
              appointment.patient_id ===
                Number(patientFilter);

            const matchesDoctor =
              !doctorFilter ||
              appointment.doctor_id ===
                Number(doctorFilter);

            const matchesDate =
              !dateFilter ||
              appointment.appointment_date ===
                dateFilter;

            const status =
              getAppointmentStatus(
                appointment
              );

            const matchesStatus =
              statusFilter === "All" ||
              status === statusFilter;

            return (
              matchesSearch &&
              matchesPatient &&
              matchesDoctor &&
              matchesDate &&
              matchesStatus
            );
          }
        );

      return [...result].sort(
        (a, b) => {
          let comparison = 0;

          if (sortField === "date") {
            comparison =
              compareDateTime(a) -
              compareDateTime(b);
          }

          if (sortField === "time") {
            const aTime =
              a.appointment_time || "";

            const bTime =
              b.appointment_time || "";

            comparison =
              aTime.localeCompare(
                bTime
              );
          }

          if (
            sortField === "patient"
          ) {
            comparison =
              getPatientName(
                a.patient_id
              ).localeCompare(
                getPatientName(
                  b.patient_id
                )
              );
          }

          if (
            sortField === "doctor"
          ) {
            comparison =
              getDoctorName(
                a.doctor_id
              ).localeCompare(
                getDoctorName(
                  b.doctor_id
                )
              );
          }

          if (sortField === "id") {
            comparison =
              a.id - b.id;
          }

          return sortDirection ===
            "asc"
            ? comparison
            : -comparison;
        }
      );
    }, [
      appointments,
      search,
      patientFilter,
      doctorFilter,
      dateFilter,
      statusFilter,
      sortField,
      sortDirection,
      patients,
      doctors,
    ]);

  /* ==========================================================
     PAGINATION DATA
     ========================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredAppointments.length /
        pageSize
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedAppointments =
    filteredAppointments.slice(
      (safeCurrentPage - 1) *
        pageSize,
      safeCurrentPage *
        pageSize
    );

  const startResult =
    filteredAppointments.length === 0
      ? 0
      : (safeCurrentPage - 1) *
          pageSize +
        1;

  const endResult = Math.min(
    safeCurrentPage * pageSize,
    filteredAppointments.length
  );

  /* ==========================================================
     STATISTICS
     ========================================================== */

  const todayAppointments =
    appointments.filter(
      (appointment) =>
        getAppointmentStatus(
          appointment
        ) === "Today"
    );

  const upcomingAppointments =
    appointments.filter(
      (appointment) =>
        getAppointmentStatus(
          appointment
        ) === "Upcoming"
    );

  const pastAppointments =
    appointments.filter(
      (appointment) =>
        getAppointmentStatus(
          appointment
        ) === "Past"
    );

  const totalAppointments =
    appointments.length;

  const activeAppointments =
    todayAppointments.length +
    upcomingAppointments.length;

  /* ==========================================================
     DOCTOR WORKLOAD
     ========================================================== */

  const doctorWorkload =
    useMemo(() => {
      return doctors
        .map((doctor) => {
          const count =
            appointments.filter(
              (appointment) =>
                appointment.doctor_id ===
                doctor.id
            ).length;

          return {
            ...doctor,
            count,
          };
        })
        .sort(
          (a, b) => b.count - a.count
        );
    }, [doctors, appointments]);

  /* ==========================================================
     TODAY SORTED SCHEDULE
     ========================================================== */

  const todaySchedule =
    useMemo(() => {
      return [...todayAppointments].sort(
        (a, b) =>
          compareDateTime(a) -
          compareDateTime(b)
      );
    }, [appointments]);

  /* ==========================================================
     SELECTED PATIENT / DOCTOR
     ========================================================== */

  const selectedPatient =
    selectedAppointment
      ? patients.find(
          (patient) =>
            patient.id ===
            selectedAppointment.patient_id
        )
      : null;

  const selectedDoctor =
    selectedAppointment
      ? doctors.find(
          (doctor) =>
            doctor.id ===
            selectedAppointment.doctor_id
        )
      : null;

  /* ==========================================================
     FILTER RESET
     ========================================================== */

  function clearFilters() {
    setSearch("");
    setPatientFilter("");
    setDoctorFilter("");
    setDateFilter("");
    setStatusFilter("All");
    setCurrentPage(1);
  }

  /* ==========================================================
     SORT HANDLER
     ========================================================== */

  function changeSort(
    field: SortField
  ) {
    if (sortField === field) {
      setSortDirection(
        sortDirection === "asc"
          ? "desc"
          : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }

    setCurrentPage(1);
  }

  /* ==========================================================
     COPY APPOINTMENT
     ========================================================== */

  async function copyAppointment(
    appointment: Appointment
  ) {
    const patientName =
      getPatientName(
        appointment.patient_id
      );

    const doctorName =
      getDoctorName(
        appointment.doctor_id
      );

    const text = [
      "MediCare Clinic Appointment",
      `Appointment ID: #${appointment.id}`,
      `Patient: ${patientName}`,
      `Doctor: ${doctorName}`,
      `Specialization: ${getDoctorSpecialization(
        appointment.doctor_id
      )}`,
      `Date: ${formatDate(
        appointment.appointment_date
      )}`,
      `Time: ${formatTime(
        appointment.appointment_time
      )}`,
      `Reason: ${appointment.reason}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(
        text
      );

      setMessage({
        type: "success",
        text: "Appointment information copied.",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Unable to copy appointment information.",
      });
    }
  }

  /* ==========================================================
     CSV EXPORT
     ========================================================== */

  function escapeCsvValue(
    value: string
  ) {
    return `"${value.replace(
      /"/g,
      '""'
    )}"`;
  }

  function exportCsv() {
    if (
      filteredAppointments.length ===
      0
    ) {
      setMessage({
        type: "warning",
        text: "There are no appointments to export.",
      });

      return;
    }

    const header = [
      "Appointment ID",
      "Patient",
      "Doctor",
      "Specialization",
      "Date",
      "Time",
      "Status",
      "Reason",
    ];

    const rows =
      filteredAppointments.map(
        (appointment) => [
          String(appointment.id),
          getPatientName(
            appointment.patient_id
          ),
          getDoctorName(
            appointment.doctor_id
          ),
          getDoctorSpecialization(
            appointment.doctor_id
          ),
          appointment.appointment_date,
          appointment.appointment_time,
          getAppointmentStatus(
            appointment
          ),
          appointment.reason,
        ]
      );

    const csv = [
      header.map(
        escapeCsvValue
      ).join(","),
      ...rows.map((row) =>
        row
          .map(escapeCsvValue)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      `medicare-appointments-${getTodayDate()}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setMessage({
      type: "success",
      text: `${filteredAppointments.length} appointment records exported.`,
    });
  }

  /* ==========================================================
     PRINT SINGLE APPOINTMENT
     ========================================================== */

  function printAppointment(
    appointment: Appointment
  ) {
    const patientName =
      getPatientName(
        appointment.patient_id
      );

    const doctorName =
      getDoctorName(
        appointment.doctor_id
      );

    const specialization =
      getDoctorSpecialization(
        appointment.doctor_id
      );

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=800,height=900"
      );

    if (!printWindow) {
      setMessage({
        type: "error",
        text: "Please allow pop-ups to print the appointment.",
      });

      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Appointment #${appointment.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #172033;
            }

            .header {
              border-bottom: 2px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }

            h1 {
              margin: 0;
              color: #1d4ed8;
            }

            h2 {
              margin-top: 30px;
            }

            .row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
            }

            .label {
              font-weight: bold;
              color: #64748b;
            }

            .reason {
              margin-top: 20px;
              padding: 18px;
              background: #f8fafc;
              border-radius: 8px;
            }

            .footer {
              margin-top: 50px;
              color: #64748b;
              font-size: 12px;
            }
          </style>
        </head>

        <body>
          <div class="header">
            <h1>MediCare Clinic</h1>
            <p>Appointment Confirmation</p>
          </div>

          <div class="row">
            <span class="label">Appointment ID</span>
            <span>#${appointment.id}</span>
          </div>

          <div class="row">
            <span class="label">Patient</span>
            <span>${patientName}</span>
          </div>

          <div class="row">
            <span class="label">Doctor</span>
            <span>${doctorName}</span>
          </div>

          <div class="row">
            <span class="label">Specialization</span>
            <span>${specialization}</span>
          </div>

          <div class="row">
            <span class="label">Date</span>
            <span>${formatDate(
              appointment.appointment_date
            )}</span>
          </div>

          <div class="row">
            <span class="label">Time</span>
            <span>${formatTime(
              appointment.appointment_time
            )}</span>
          </div>

          <h2>Appointment Reason</h2>

          <div class="reason">
            ${appointment.reason}
          </div>

          <div class="footer">
            MediCare Clinic — Synthetic demonstration data only.
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 300);
  }

  /* ==========================================================
     PRINT TODAY'S SCHEDULE
     ========================================================== */

  function printTodaySchedule() {
    if (todaySchedule.length === 0) {
      setMessage({
        type: "warning",
        text: "There are no appointments scheduled for today.",
      });

      return;
    }

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=900,height=900"
      );

    if (!printWindow) {
      setMessage({
        type: "error",
        text: "Please allow pop-ups to print the schedule.",
      });

      return;
    }

    const rows =
      todaySchedule
        .map(
          (appointment) => `
            <tr>
              <td>#${appointment.id}</td>
              <td>${getPatientName(
                appointment.patient_id
              )}</td>
              <td>${getDoctorName(
                appointment.doctor_id
              )}</td>
              <td>${formatTime(
                appointment.appointment_time
              )}</td>
              <td>${appointment.reason}</td>
            </tr>
          `
        )
        .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MediCare Today's Schedule</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #172033;
            }

            h1 {
              color: #1d4ed8;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 25px;
            }

            th,
            td {
              border: 1px solid #dbe3ef;
              padding: 10px;
              text-align: left;
            }

            th {
              background: #eff6ff;
            }

            .footer {
              margin-top: 30px;
              font-size: 12px;
              color: #64748b;
            }
          </style>
        </head>

        <body>
          <h1>MediCare Clinic</h1>
          <h2>Today's Appointment Schedule</h2>
          <p>${formatDate(
            getTodayDate()
          )}</p>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Time</th>
                <th>Reason</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="footer">
            MediCare Clinic — Synthetic demonstration data only.
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 300);
  }

  /* ==========================================================
     MESSAGE STYLE
     ========================================================== */

  function getMessageClasses(
    type: MessageType
  ) {
    if (type === "success") {
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    }

    if (type === "error") {
      return "border-red-200 bg-red-50 text-red-800";
    }

    if (type === "warning") {
      return "border-amber-200 bg-amber-50 text-amber-800";
    }

    return "border-blue-200 bg-blue-50 text-blue-800";
  }

  /* ==========================================================
     STATUS STYLE
     ========================================================== */

  function getStatusClasses(
    status: AppointmentStatus
  ) {
    if (status === "Today") {
      return "bg-emerald-100 text-emerald-700";
    }

    if (status === "Upcoming") {
      return "bg-blue-100 text-blue-700";
    }

    if (status === "Past") {
      return "bg-slate-100 text-slate-600";
    }

    return "bg-amber-100 text-amber-700";
  }

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* ======================================================
          HEADER
          ====================================================== */}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <HospitalIcon size={23} />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-slate-950">
                MediCare Clinic
              </p>

              <p className="text-xs text-slate-500">
                Appointment Management
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Local Clinic System
            </div>

            <button
              type="button"
              onClick={() =>
                loadData(true)
              }
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshIcon
                size={17}
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================
          PAGE CONTENT
          ====================================================== */}

      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
        {/* ====================================================
            PAGE TITLE
            ==================================================== */}

        <section className="mb-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <CalendarIcon size={14} />
                Scheduling Center
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Appointment Management
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                Create, search, review, print, and manage
                clinic appointments from one centralized
                scheduling workspace.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Current Date
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                {formatDate(
                  getTodayDate()
                )}
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================
            MESSAGE
            ==================================================== */}

        {message && (
          <div
            className={`mb-6 flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm ${getMessageClasses(
              message.type
            )}`}
            role="alert"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {message.type ===
                  "success" ? (
                  <CheckIcon />
                ) : (
                  <AlertIcon />
                )}
              </div>

              <p className="font-medium">
                {message.text}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setMessage(null)
              }
              className="text-xs font-bold opacity-70 hover:opacity-100"
              aria-label="Dismiss message"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ====================================================
            STATISTICS
            ==================================================== */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Appointments
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {totalAppointments}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  All recorded appointments
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <CalendarIcon />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Today's Appointments
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {todayAppointments.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Scheduled for today
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <ClockIcon />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Upcoming
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {upcomingAppointments.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Future scheduled appointments
                </p>
              </div>

              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <CalendarIcon />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Schedule
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {activeAppointments}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Today + upcoming
                </p>
              </div>

              <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                <CheckIcon />
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            MAIN GRID
            ==================================================== */}

        <div className="mt-8 grid gap-8 xl:grid-cols-[390px_minmax(0,1fr)]">
          {/* ==================================================
              CREATE APPOINTMENT
              ================================================== */}

          <section className="h-fit rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <PlusIcon />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Create Appointment
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Schedule a patient visit with an available
                    doctor.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5"
            >
              {/* Patient */}

              <div>
                <label
                  htmlFor="appointment-patient"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Patient
                </label>

                <select
                  id="appointment-patient"
                  value={patientId}
                  onChange={(event) => {
                    setPatientId(
                      event.target.value
                    );

                    setFormErrors(
                      (previous) => ({
                        ...previous,
                        patientId:
                          undefined,
                      })
                    );
                  }}
                  className={`w-full rounded-xl border bg-white px-3 py-3 text-sm font-medium text-slate-900 outline-none transition focus:ring-2 ${
                    formErrors.patientId
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                >
                  <option value="">
                    Select a patient
                  </option>

                  {patients.map(
                    (patient) => (
                      <option
                        key={patient.id}
                        value={patient.id}
                      >
                        {patient.name} — #
                        {patient.id}
                      </option>
                    )
                  )}
                </select>

                {formErrors.patientId && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {formErrors.patientId}
                  </p>
                )}

                {patients.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    No patients are currently available.
                    Create a patient first.
                  </p>
                )}
              </div>

              {/* Doctor */}

              <div>
                <label
                  htmlFor="appointment-doctor"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Doctor
                </label>

                <select
                  id="appointment-doctor"
                  value={doctorId}
                  onChange={(event) => {
                    setDoctorId(
                      event.target.value
                    );

                    setFormErrors(
                      (previous) => ({
                        ...previous,
                        doctorId:
                          undefined,
                      })
                    );
                  }}
                  className={`w-full rounded-xl border bg-white px-3 py-3 text-sm font-medium text-slate-900 outline-none transition focus:ring-2 ${
                    formErrors.doctorId
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                >
                  <option value="">
                    Select a doctor
                  </option>

                  {doctors.map(
                    (doctor) => (
                      <option
                        key={doctor.id}
                        value={doctor.id}
                      >
                        {doctor.name} —{" "}
                        {
                          doctor.specialization
                        }
                      </option>
                    )
                  )}
                </select>

                {formErrors.doctorId && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {formErrors.doctorId}
                  </p>
                )}

                {doctors.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    No doctors are currently available.
                  </p>
                )}
              </div>

              {/* Date */}

              <div>
                <label
                  htmlFor="appointment-date"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Appointment Date
                </label>

                <input
                  id="appointment-date"
                  type="date"
                  min={getTodayDate()}
                  value={appointmentDate}
                  onChange={(event) => {
                    setAppointmentDate(
                      event.target.value
                    );

                    setFormErrors(
                      (previous) => ({
                        ...previous,
                        appointmentDate:
                          undefined,
                      })
                    );
                  }}
                  className={`w-full rounded-xl border bg-white px-3 py-3 text-sm font-medium text-slate-900 outline-none transition focus:ring-2 ${
                    formErrors.appointmentDate
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                />

                {formErrors.appointmentDate && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {
                      formErrors.appointmentDate
                    }
                  </p>
                )}
              </div>

              {/* Time */}

              <div>
                <label
                  htmlFor="appointment-time"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Appointment Time
                </label>

                <input
                  id="appointment-time"
                  type="time"
                  value={appointmentTime}
                  onChange={(event) => {
                    setAppointmentTime(
                      event.target.value
                    );

                    setFormErrors(
                      (previous) => ({
                        ...previous,
                        appointmentTime:
                          undefined,
                      })
                    );
                  }}
                  className={`w-full rounded-xl border bg-white px-3 py-3 text-sm font-medium text-slate-900 outline-none transition focus:ring-2 ${
                    formErrors.appointmentTime
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                />

                {formErrors.appointmentTime && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {
                      formErrors.appointmentTime
                    }
                  </p>
                )}
              </div>

              {/* Reason */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="appointment-reason"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Appointment Reason
                  </label>

                  <span className="text-xs text-slate-400">
                    {reason.length}/500
                  </span>
                </div>

                <textarea
                  id="appointment-reason"
                  rows={5}
                  maxLength={500}
                  value={reason}
                  onChange={(event) => {
                    setReason(
                      event.target.value
                    );

                    setFormErrors(
                      (previous) => ({
                        ...previous,
                        reason:
                          undefined,
                      })
                    );
                  }}
                  placeholder="Example: Follow-up consultation, fever evaluation, routine check-up..."
                  className={`w-full resize-none rounded-xl border bg-white px-3 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 ${
                    formErrors.reason
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                />

                {formErrors.reason && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {formErrors.reason}
                  </p>
                )}
              </div>

              {/* Duplicate warning */}

              {findPossibleDuplicate() && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                  <div className="flex gap-2">
                    <AlertIcon size={16} />

                    <p>
                      A matching appointment already
                      exists. Please verify the selected
                      patient, doctor, date, and time.
                    </p>
                  </div>
                </div>
              )}

              {/* Form actions */}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={creating}
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Clear
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <PlusIcon size={17} />

                  {creating
                    ? "Creating..."
                    : "Create Appointment"}
                </button>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
                <strong className="text-slate-700">
                  Scheduling note:
                </strong>{" "}
                This local demonstration system prevents
                duplicate appointments using the same
                patient, doctor, date, and time.
              </div>
            </form>
          </section>

          {/* ==================================================
              APPOINTMENT MANAGEMENT AREA
              ================================================== */}

          <section className="min-w-0">
            {/* =================================================
                SEARCH AND FILTER
                ================================================= */}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">
                      Appointment Records
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Search and filter the clinic appointment
                      database.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={exportCsv}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      <DownloadIcon
                        size={16}
                      />
                      Export CSV
                    </button>

                    <button
                      type="button"
                      onClick={
                        printTodaySchedule
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      <PrintIcon
                        size={16}
                      />
                      Print Today
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        loadData(true)
                      }
                      disabled={refreshing}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
                    >
                      <RefreshIcon
                        size={16}
                      />
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Search */}

                <div className="relative mt-5">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <SearchIcon
                      size={18}
                    />
                  </div>

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => {
                      setSearch(
                        event.target.value
                      );
                      setCurrentPage(1);
                    }}
                    placeholder="Search by patient, doctor, specialization, appointment ID, or reason..."
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Filters */}

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  <div>
                    <label
                      htmlFor="patient-filter"
                      className="mb-1.5 block text-xs font-bold text-slate-500"
                    >
                      Patient
                    </label>

                    <select
                      id="patient-filter"
                      value={patientFilter}
                      onChange={(event) => {
                        setPatientFilter(
                          event.target.value
                        );
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
                    >
                      <option value="">
                        All Patients
                      </option>

                      {patients.map(
                        (patient) => (
                          <option
                            key={patient.id}
                            value={patient.id}
                          >
                            {patient.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="doctor-filter"
                      className="mb-1.5 block text-xs font-bold text-slate-500"
                    >
                      Doctor
                    </label>

                    <select
                      id="doctor-filter"
                      value={doctorFilter}
                      onChange={(event) => {
                        setDoctorFilter(
                          event.target.value
                        );
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
                    >
                      <option value="">
                        All Doctors
                      </option>

                      {doctors.map(
                        (doctor) => (
                          <option
                            key={doctor.id}
                            value={doctor.id}
                          >
                            {doctor.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="date-filter"
                      className="mb-1.5 block text-xs font-bold text-slate-500"
                    >
                      Exact Date
                    </label>

                    <input
                      id="date-filter"
                      type="date"
                      value={dateFilter}
                      onChange={(event) => {
                        setDateFilter(
                          event.target.value
                        );
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="status-filter"
                      className="mb-1.5 block text-xs font-bold text-slate-500"
                    >
                      Status
                    </label>

                    <select
                      id="status-filter"
                      value={statusFilter}
                      onChange={(event) => {
                        setStatusFilter(
                          event.target
                            .value as
                            | "All"
                            | AppointmentStatus
                        );
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
                    >
                      <option value="All">
                        All Statuses
                      </option>
                      <option value="Today">
                        Today
                      </option>
                      <option value="Upcoming">
                        Upcoming
                      </option>
                      <option value="Past">
                        Past
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="sort-filter"
                      className="mb-1.5 block text-xs font-bold text-slate-500"
                    >
                      Sort By
                    </label>

                    <select
                      id="sort-filter"
                      value={sortField}
                      onChange={(event) => {
                        setSortField(
                          event.target
                            .value as SortField
                        );
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500"
                    >
                      <option value="date">
                        Date & Time
                      </option>
                      <option value="time">
                        Time
                      </option>
                      <option value="patient">
                        Patient
                      </option>
                      <option value="doctor">
                        Doctor
                      </option>
                      <option value="id">
                        Appointment ID
                      </option>
                    </select>
                  </div>
                </div>

                {/* Filter controls */}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <FilterIcon
                      size={15}
                    />

                    <span>
                      {filteredAppointments.length}{" "}
                      matching records
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        changeSort(
                          sortField
                        )
                      }
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Sort{" "}
                      {sortDirection ===
                      "asc"
                        ? "↑"
                        : "↓"}
                    </button>

                    <button
                      type="button"
                      onClick={
                        clearFilters
                      }
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* =================================================
                  TABLE
                  ================================================= */}

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="p-10 text-center">
                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                    <p className="mt-4 text-sm font-medium text-slate-600">
                      Loading appointment records...
                    </p>
                  </div>
                ) : paginatedAppointments.length ===
                  0 ? (
                  <div className="px-6 py-14 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <CalendarIcon
                        size={26}
                      />
                    </div>

                    <h3 className="mt-4 text-base font-bold text-slate-900">
                      No appointments found
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      There are no appointments matching
                      the current search and filter settings.
                    </p>

                    <button
                      type="button"
                      onClick={
                        clearFilters
                      }
                      className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <table className="min-w-[1050px] w-full">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200 text-left">
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Appointment
                        </th>

                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Patient
                        </th>

                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Doctor
                        </th>

                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Schedule
                        </th>

                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Status
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {paginatedAppointments.map(
                        (
                          appointment
                        ) => {
                          const status =
                            getAppointmentStatus(
                              appointment
                            );

                          return (
                            <tr
                              key={
                                appointment.id
                              }
                              className="transition hover:bg-slate-50"
                            >
                              <td className="px-5 py-4">
                                <div>
                                  <p className="font-bold text-slate-900">
                                    #
                                    {
                                      appointment.id
                                    }
                                  </p>

                                  <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                                    {
                                      appointment.reason
                                    }
                                  </p>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                    <UserIcon
                                      size={
                                        17
                                      }
                                    />
                                  </div>

                                  <div>
                                    <p className="font-semibold text-slate-900">
                                      {getPatientName(
                                        appointment.patient_id
                                      )}
                                    </p>

                                    <p className="text-xs text-slate-500">
                                      Patient #
                                      {
                                        appointment.patient_id
                                      }
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                                    <DoctorIcon
                                      size={
                                        17
                                      }
                                    />
                                  </div>

                                  <div>
                                    <p className="font-semibold text-slate-900">
                                      {getDoctorName(
                                        appointment.doctor_id
                                      )}
                                    </p>

                                    <p className="text-xs text-slate-500">
                                      {getDoctorSpecialization(
                                        appointment.doctor_id
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <div className="space-y-1">
                                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                                    <CalendarIcon
                                      size={
                                        15
                                      }
                                    />

                                    {formatDate(
                                      appointment.appointment_date
                                    )}
                                  </p>

                                  <p className="flex items-center gap-2 text-xs text-slate-500">
                                    <ClockIcon
                                      size={
                                        14
                                      }
                                    />

                                    {formatTime(
                                      appointment.appointment_time
                                    )}
                                  </p>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${getStatusClasses(
                                    status
                                  )}`}
                                >
                                  {status}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedAppointment(
                                        appointment
                                      )
                                    }
                                    title="View appointment"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                                  >
                                    <EyeIcon />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyAppointment(
                                        appointment
                                      )
                                    }
                                    title="Copy appointment"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                                  >
                                    <CopyIcon />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      printAppointment(
                                        appointment
                                      )
                                    }
                                    title="Print appointment"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                                  >
                                    <PrintIcon />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDeleteTarget(
                                        appointment
                                      )
                                    }
                                    title="Delete appointment"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                                  >
                                    <TrashIcon />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* =================================================
                  PAGINATION
                  ================================================= */}

              {!loading &&
                filteredAppointments.length >
                  0 && (
                  <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-500">
                      Showing{" "}
                      <strong className="text-slate-700">
                        {startResult}
                      </strong>{" "}
                      to{" "}
                      <strong className="text-slate-700">
                        {endResult}
                      </strong>{" "}
                      of{" "}
                      <strong className="text-slate-700">
                        {
                          filteredAppointments.length
                        }
                      </strong>
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={
                          safeCurrentPage ===
                          1
                        }
                        onClick={() =>
                          setCurrentPage(
                            (page) =>
                              Math.max(
                                1,
                                page - 1
                              )
                          )
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Previous
                      </button>

                      <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
                        Page{" "}
                        {
                          safeCurrentPage
                        }{" "}
                        / {totalPages}
                      </span>

                      <button
                        type="button"
                        disabled={
                          safeCurrentPage ===
                          totalPages
                        }
                        onClick={() =>
                          setCurrentPage(
                            (page) =>
                              Math.min(
                                totalPages,
                                page + 1
                              )
                          )
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
            </div>

            {/* =================================================
                SECONDARY DASHBOARD
                ================================================= */}

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {/* Today's schedule */}

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <div>
                    <h3 className="font-bold text-slate-950">
                      Today's Schedule
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Appointments scheduled today.
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    {
                      todaySchedule.length
                    }
                  </span>
                </div>

                <div className="max-h-[400px] overflow-y-auto p-4">
                  {todaySchedule.length ===
                  0 ? (
                    <div className="rounded-xl bg-slate-50 px-4 py-8 text-center">
                      <ClockIcon
                        size={25}
                      />

                      <p className="mt-3 text-sm font-bold text-slate-800">
                        No appointments today
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Today's schedule is currently clear.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {todaySchedule.map(
                        (
                          appointment
                        ) => (
                          <button
                            key={
                              appointment.id
                            }
                            type="button"
                            onClick={() =>
                              setSelectedAppointment(
                                appointment
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/40"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-bold text-slate-900">
                                  {formatTime(
                                    appointment.appointment_time
                                  )}
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-700">
                                  {getPatientName(
                                    appointment.patient_id
                                  )}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {getDoctorName(
                                    appointment.doctor_id
                                  )}
                                </p>
                              </div>

                              <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">
                                TODAY
                              </span>
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>

                {todaySchedule.length >
                  0 && (
                  <div className="border-t border-slate-200 p-4">
                    <button
                      type="button"
                      onClick={
                        printTodaySchedule
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      <PrintIcon
                        size={15}
                      />
                      Print Today's Schedule
                    </button>
                  </div>
                )}
              </div>

              {/* Doctor workload */}

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h3 className="font-bold text-slate-950">
                    Doctor Workload
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Appointment distribution across doctors.
                  </p>
                </div>

                <div className="max-h-[450px] overflow-y-auto p-4">
                  {doctorWorkload.length ===
                  0 ? (
                    <div className="rounded-xl bg-slate-50 px-4 py-8 text-center">
                      <DoctorIcon
                        size={25}
                      />

                      <p className="mt-3 text-sm font-bold text-slate-800">
                        No doctors available
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {doctorWorkload.map(
                        (doctor) => {
                          const maximum =
                            doctorWorkload[0]
                              ?.count || 1;

                          const width =
                            doctor.count ===
                            0
                              ? 0
                              : Math.max(
                                  8,
                                  Math.round(
                                    (doctor.count /
                                      maximum) *
                                      100
                                  )
                                );

                          return (
                            <div
                              key={
                                doctor.id
                              }
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-800">
                                    {
                                      doctor.name
                                    }
                                  </p>

                                  <p className="truncate text-xs text-slate-500">
                                    {
                                      doctor.specialization
                                    }
                                  </p>
                                </div>

                                <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                                  {
                                    doctor.count
                                  }
                                </span>
                              </div>

                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-blue-600 transition-all"
                                  style={{
                                    width: `${width}%`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                INFORMATION PANEL
                ================================================= */}

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex gap-3">
                <div className="rounded-xl bg-white p-2.5 text-blue-600 shadow-sm">
                  <HospitalIcon />
                </div>

                <div>
                  <h3 className="font-bold text-blue-950">
                    Appointment Management Overview
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-blue-900/70">
                    Use this workspace to coordinate patient visits,
                    review the daily schedule, monitor doctor workload,
                    search historical records, and maintain the clinic's
                    local appointment database.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ======================================================
          APPOINTMENT DETAILS MODAL
          ====================================================== */}

      {selectedAppointment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="appointment-details-title"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedAppointment(
                null
              );
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                  Appointment Details
                </p>

                <h2
                  id="appointment-details-title"
                  className="mt-1 text-2xl font-bold text-slate-950"
                >
                  Appointment #
                  {
                    selectedAppointment.id
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedAppointment(
                    null
                  )
                }
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <UserIcon
                      size={15}
                    />
                    Patient
                  </div>

                  <p className="mt-2 text-base font-bold text-slate-900">
                    {selectedPatient
                      ?.name ||
                      `Patient #${selectedAppointment.patient_id}`}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Patient ID #
                    {
                      selectedAppointment.patient_id
                    }
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <DoctorIcon
                      size={15}
                    />
                    Doctor
                  </div>

                  <p className="mt-2 text-base font-bold text-slate-900">
                    {selectedDoctor
                      ?.name ||
                      `Doctor #${selectedAppointment.doctor_id}`}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {selectedDoctor
                      ?.specialization ||
                      "Medical Department"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Date
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {formatDate(
                      selectedAppointment.appointment_date
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Time
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {formatTime(
                      selectedAppointment.appointment_time
                    )}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Current Status
                  </p>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClasses(
                      getAppointmentStatus(
                        selectedAppointment
                      )
                    )}`}
                  >
                    {getAppointmentStatus(
                      selectedAppointment
                    )}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Appointment Reason
                </p>

                <div className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {
                    selectedAppointment.reason
                  }
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() =>
                    copyAppointment(
                      selectedAppointment
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <CopyIcon />
                  Copy
                </button>

                <button
                  type="button"
                  onClick={() =>
                    printAppointment(
                      selectedAppointment
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <PrintIcon />
                  Print
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget(
                      selectedAppointment
                    );

                    setSelectedAppointment(
                      null
                    );
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
                >
                  <TrashIcon />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          DELETE CONFIRMATION MODAL
          ====================================================== */}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-appointment-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <TrashIcon
                size={23}
              />
            </div>

            <h2
              id="delete-appointment-title"
              className="mt-5 text-xl font-bold text-slate-950"
            >
              Delete Appointment?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              You are about to delete appointment{" "}
              <strong>
                #{deleteTarget.id}
              </strong>{" "}
              for{" "}
              <strong>
                {getPatientName(
                  deleteTarget.patient_id
                )}
              </strong>
              . This action cannot be undone from this
              page.
            </p>

            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">
                  Doctor
                </span>

                <span className="font-semibold text-slate-800">
                  {getDoctorName(
                    deleteTarget.doctor_id
                  )}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">
                  Date
                </span>

                <span className="font-semibold text-slate-800">
                  {formatDate(
                    deleteTarget.appointment_date
                  )}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">
                  Time
                </span>

                <span className="font-semibold text-slate-800">
                  {formatTime(
                    deleteTarget.appointment_time
                  )}
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={
                  deletingId !== null
                }
                onClick={() =>
                  setDeleteTarget(
                    null
                  )
                }
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Keep Appointment
              </button>

              <button
                type="button"
                disabled={
                  deletingId !== null
                }
                onClick={() =>
                  handleDelete(
                    deleteTarget
                  )
                }
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId ===
                deleteTarget.id
                  ? "Deleting..."
                  : "Delete Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          FOOTER
          ====================================================== */}

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            MediCare Clinic Appointment Management
            System
          </p>

          <p>
            Local demonstration system • Synthetic data only
          </p>
        </div>
      </footer>
    </main>
  );
}