"use client";

import { useEffect, useMemo, useState } from "react";

/* =========================================================
   MEDICARE CLINIC
   Main Healthcare Management Homepage
   ========================================================= */

const API_BASE_URL = "http://127.0.0.1:8000";

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

type Appointment = {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  reason: string;
};

type Bill = {
  id: number;
  patient_id: number;
  consultation_amount: number;
  laboratory_amount: number;
  medicine_amount: number;
  procedure_amount: number;
  other_amount: number;
  discount: number;
  tax: number;
  subtotal: number;
  total_amount: number;
  payment_status: string;
  transaction_id: string | null;
  bill_date: string;
};

type BillingSummary = {
  total_bills?: number;
  pending_bills?: number;
  paid_bills?: number;
  partial_bills?: number;
  cancelled_bills?: number;
  total_amount?: number;
  paid_amount?: number;
  pending_amount?: number;
};

type SystemInfo = {
  application?: string;
  version?: string;
  environment?: string;
  status?: string;
};

/* =========================================================
   ICON PROPS
   ========================================================= */

type IconProps = {
  className?: string;
};

/* =========================================================
   ICONS
   ========================================================= */

function HeartLogo({ className = "h-8 w-8" }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M24 40.5S6.5 30.8 6.5 18.8C6.5 12.7 11 8.5 16.6 8.5c3.4 0 6.2 1.7 7.4 4.3 1.2-2.6 4-4.3 7.4-4.3 5.6 0 10.1 4.2 10.1 10.3C41.5 30.8 24 40.5 24 40.5Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M14 23h6l2.2-5.2L26 30l2.6-7H34"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function MenuIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function UserIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 4.2-6 8-6s6.5 2 8 6" />
    </svg>
  );
}

function CalendarIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function StethoscopeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M6 3v6a6 6 0 0 0 12 0V3" />
      <path d="M3 3h6M15 3h6" />
      <path d="M18 15a3 3 0 1 0 3 3v-1" />
      <circle cx="21" cy="17" r="1" />
    </svg>
  );
}

function HospitalIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
      <path d="M2 21h20" />
      <path d="M10 7h4M12 5v4M8 12h2M14 12h2M8 16h2M14 16h2" />
    </svg>
  );
}

function ShieldIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </svg>
  );
}

function LabIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M9 3v7l-5 8a2 2 0 0 0 1.7 3h12.6A2 2 0 0 0 20 18l-5-8V3" />
      <path d="M7 14h10M8 3h8" />
    </svg>
  );
}

function MedicineIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M7 3h10v5a5 5 0 0 1 0 10H7a5 5 0 0 1 0-10V3Z" />
      <path d="M12 8v10M8 13h8" />
    </svg>
  );
}

function BillIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </svg>
  );
}

function LocationIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function PhoneIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M5 3h3l2 5-2 2a15 15 0 0 0 6 6l2-2 5 2v3c0 1-1 2-2 2C10 21 3 14 3 5c0-1 1-2 2-2Z" />
    </svg>
  );
}

function ChatIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H9l-5 4v-4.8A3 3 0 0 1 4 13V5Z" />
      <path d="M8 8h8M8 11h5" />
    </svg>
  );
}

function ArrowIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function CheckIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ClockIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function StarIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    </svg>
  );
}

function ChevronDownIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function RefreshIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M20 11a8 8 0 0 0-14.8-4L3 10" />
      <path d="M3 5v5h5" />
      <path d="M4 13a8 8 0 0 0 14.8 4L21 14" />
      <path d="M21 19v-5h-5" />
    </svg>
  );
}

/* =========================================================
   DATA
   ========================================================= */

const specialties = [
  {
    title: "Cardiology",
    description: "Heart health, diagnostics and preventive cardiac care.",
    icon: "♥",
  },
  {
    title: "Neurology",
    description: "Specialized evaluation and treatment for neurological conditions.",
    icon: "◉",
  },
  {
    title: "Orthopaedics",
    description: "Bone, joint, muscle and mobility-focused healthcare.",
    icon: "◆",
  },
  {
    title: "Paediatrics",
    description: "Compassionate healthcare for infants, children and teenagers.",
    icon: "✚",
  },
  {
    title: "Gastroenterology",
    description: "Digestive system consultation and diagnostic support.",
    icon: "◌",
  },
  {
    title: "Dermatology",
    description: "Skin, hair and nail evaluation and treatment.",
    icon: "◇",
  },
  {
    title: "General Medicine",
    description: "Comprehensive primary care for everyday health needs.",
    icon: "+",
  },
  {
    title: "Women's Health",
    description: "Dedicated healthcare services for women's wellness.",
    icon: "♀",
  },
];

const services = [
  {
    title: "Doctor Management",
    description:
      "Browse doctors, specialties, profiles and availability through the clinic management system.",
    icon: StethoscopeIcon,
  },
  {
    title: "Appointment Management",
    description:
      "Create, review and manage patient appointments with a streamlined workflow.",
    icon: CalendarIcon,
  },
  {
    title: "Laboratory Services",
    description:
      "Organize laboratory-related healthcare workflows and diagnostic records.",
    icon: LabIcon,
  },
  {
    title: "Pharmacy & Medicines",
    description:
      "Manage medicine information and connect treatment workflows with patient care.",
    icon: MedicineIcon,
  },
  {
    title: "Medical Records",
    description:
      "Maintain structured patient information and healthcare history for authorized workflows.",
    icon: HospitalIcon,
  },
  {
    title: "Medical Billing",
    description:
      "Create bills, calculate totals, track payment status and manage invoices.",
    icon: BillIcon,
  },
  {
    title: "Secure Healthcare",
    description:
      "Build healthcare workflows around privacy, validation and controlled access.",
    icon: ShieldIcon,
  },
  {
    title: "MediCare Assistant",
    description:
      "Use the local healthcare assistant for navigation, FAQs and clinic information.",
    icon: ChatIcon,
  },
];

const departments = [
  "Cardiology",
  "Neurology",
  "Orthopaedics",
  "Paediatrics",
  "Gastroenterology",
  "Dermatology",
  "General Medicine",
  "Women's Health",
  "Emergency Care",
  "Laboratory Medicine",
  "Pharmacy",
  "Preventive Healthcare",
];

const healthTips = [
  {
    category: "Heart Health",
    title: "Build simple daily habits for a healthier heart",
    description:
      "Regular movement, balanced nutrition, adequate sleep and routine checkups can support long-term cardiovascular wellness.",
  },
  {
    category: "Wellness",
    title: "Keep your healthcare information organized",
    description:
      "Maintaining accurate contact details, appointment information and medical records can make clinic visits easier.",
  },
  {
    category: "Prevention",
    title: "Don't ignore routine health checks",
    description:
      "Preventive consultations can help identify potential concerns early and support informed healthcare decisions.",
  },
];

const faqs = [
  {
    question: "How can I book an appointment?",
    answer:
      "Use the Book Appointment button or the Appointments section. The current application uses the local clinic backend for appointment management.",
  },
  {
    question: "Can I view my medical bills?",
    answer:
      "Yes. The billing section is connected to the local healthcare backend and can display bill information and payment status.",
  },
  {
    question: "Does the payment system process real payments?",
    answer:
      "The current project uses a local demonstration payment workflow. It does not process real financial transactions.",
  },
  {
    question: "Is real patient data required?",
    answer:
      "No. Development and testing should use synthetic or demonstration healthcare data only.",
  },
  {
    question: "Can the MediCare Assistant answer questions?",
    answer:
      "The homepage assistant provides local clinic navigation and general informational responses. It is not a substitute for professional medical advice.",
  },
];

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [billingSummary, setBillingSummary] =
    useState<BillingSummary | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  const [assistantMessage, setAssistantMessage] = useState(
    "Hello! I'm the MediCare Assistant. How can I help you today?",
  );
  const [assistantInput, setAssistantInput] = useState("");

  /* =======================================================
     LOAD BACKEND DATA
     ======================================================= */

  async function loadDashboardData() {
    setLoading(true);
    setBackendError(false);

    try {
      const [
        patientsResponse,
        doctorsResponse,
        appointmentsResponse,
        billsResponse,
        summaryResponse,
        systemResponse,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/patients`),
        fetch(`${API_BASE_URL}/doctors`),
        fetch(`${API_BASE_URL}/appointments`),
        fetch(`${API_BASE_URL}/bills`),
        fetch(`${API_BASE_URL}/billing/summary`),
        fetch(`${API_BASE_URL}/system/info`),
      ]);

      if (!patientsResponse.ok || !doctorsResponse.ok) {
        throw new Error("Backend request failed");
      }

      const patientsData = await patientsResponse.json();
      const doctorsData = await doctorsResponse.json();
      const appointmentsData = await appointmentsResponse.json();

      setPatients(
        Array.isArray(patientsData)
          ? patientsData
          : patientsData.patients ?? [],
      );

      setDoctors(
        Array.isArray(doctorsData) ? doctorsData : doctorsData.doctors ?? [],
      );

      setAppointments(
        Array.isArray(appointmentsData)
          ? appointmentsData
          : appointmentsData.appointments ?? [],
      );

      if (billsResponse.ok) {
        const billsData = await billsResponse.json();

        setBills(
          Array.isArray(billsData) ? billsData : billsData.bills ?? [],
        );
      }

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setBillingSummary(summaryData);
      }

      if (systemResponse.ok) {
        const systemData = await systemResponse.json();
        setSystemInfo(systemData);
      }

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Dashboard loading error:", error);
      setBackendError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  /* =======================================================
     DERIVED DATA
     ======================================================= */

  const filteredSpecialties = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    return specialties.filter((specialty) => {
      const matchesSearch =
        !normalized ||
        specialty.title.toLowerCase().includes(normalized) ||
        specialty.description.toLowerCase().includes(normalized);

      const matchesSpecialty =
        selectedSpecialty === "All" ||
        specialty.title === selectedSpecialty;

      return matchesSearch && matchesSpecialty;
    });
  }, [searchTerm, selectedSpecialty]);

  const upcomingAppointments = useMemo(() => {
    return appointments.slice(0, 5);
  }, [appointments]);

  const recentBills = useMemo(() => {
    return bills.slice(0, 5);
  }, [bills]);

  const paidBills = bills.filter(
    (bill) => bill.payment_status.toLowerCase() === "paid",
  ).length;

  const pendingBills = bills.filter(
    (bill) => bill.payment_status.toLowerCase() === "pending",
  ).length;

  const totalBillingAmount = bills.reduce(
    (sum, bill) => sum + Number(bill.total_amount || 0),
    0,
  );

  /* =======================================================
     NAVIGATION
     ======================================================= */

  function scrollToSection(id: string) {
    setMobileMenuOpen(false);

    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (searchTerm.trim()) {
      scrollToSection("specialties");
    }
  }

  /* =======================================================
     ASSISTANT
     ======================================================= */

  function handleAssistantSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = assistantInput.trim();

    if (!message) {
      return;
    }

    const lowerMessage = message.toLowerCase();

    let response =
      "I can help with appointments, doctors, specialties, billing, clinic services and general MediCare information.";

    if (
      lowerMessage.includes("appointment") ||
      lowerMessage.includes("book")
    ) {
      response =
        "You can use the Appointments section to manage appointment workflows. For urgent medical situations, please contact emergency services.";
    } else if (
      lowerMessage.includes("doctor") ||
      lowerMessage.includes("specialist")
    ) {
      response =
        "You can explore our Doctors section and use the specialty directory to find the appropriate department.";
    } else if (
      lowerMessage.includes("bill") ||
      lowerMessage.includes("payment")
    ) {
      response =
        "The Medical Billing section provides local billing information and payment status. The current payment workflow is for demonstration and does not process real transactions.";
    } else if (
      lowerMessage.includes("emergency") ||
      lowerMessage.includes("urgent")
    ) {
      response =
        "For a genuine medical emergency, seek immediate professional emergency care or contact your local emergency service. The MediCare Assistant is not an emergency response service.";
    } else if (
      lowerMessage.includes("hello") ||
      lowerMessage.includes("hi")
    ) {
      response =
        "Hello! Welcome to MediCare Clinic. I can help you navigate our healthcare services.";
    }

    setAssistantMessage(response);
    setAssistantInput("");
  }

  /* =======================================================
     QUICK ACTIONS
     ======================================================= */

  const quickActions = [
    {
      title: "Find a Doctor",
      description: "Explore our medical specialists",
      icon: StethoscopeIcon,
      action: () => scrollToSection("doctors"),
    },
    {
      title: "Appointments",
      description: "Manage your clinic appointments",
      icon: CalendarIcon,
      action: () => scrollToSection("appointments"),
    },
    {
      title: "Hospital Location",
      description: "Find MediCare Clinic information",
      icon: LocationIcon,
      action: () => scrollToSection("contact"),
    },
    {
      title: "Medical Bills",
      description: "Review billing information",
      icon: BillIcon,
      action: () => scrollToSection("billing"),
    },
  ];

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* ===================================================
          TOP UTILITY BAR
          =================================================== */}

      <div className="bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-2 text-xs sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4" />
              Demo Support: +91 90000 00000
            </span>

            <span className="hidden text-slate-400 sm:inline">|</span>

            <span className="hidden sm:inline">
              Healthcare Management System
            </span>
          </div>

          <div className="flex items-center gap-2 text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Local clinic system online
          </div>
        </div>
      </div>

      {/* ===================================================
          NAVIGATION
          =================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => scrollToSection("home")}
            className="flex items-center gap-3"
            aria-label="MediCare Clinic home"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <HeartLogo className="h-7 w-7" />
            </span>

            <span className="text-left">
              <span className="block text-xl font-black tracking-tight text-slate-900">
                MediCare
              </span>
              <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                Clinic
              </span>
            </span>
          </button>

          <nav className="hidden items-center gap-7 lg:flex">
            {[
              ["Home", "home"],
              ["Specialties", "specialties"],
              ["Services", "services"],
              ["Doctors", "doctors"],
              ["Appointments", "appointments"],
              ["Billing", "billing"],
              ["Contact", "contact"],
            ].map(([label, id]) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollToSection(id)}
                className="text-sm font-semibold text-slate-600 transition hover:text-blue-600"
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              href="/inpatient"
              className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition shadow-sm"
            >
              <span>🛏️</span>
              <span>Inpatient & Wards</span>
            </a>

            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <ChatIcon className="h-4 w-4" />
              Assistant
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("appointments")}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Book Appointment
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="rounded-xl border border-slate-200 p-2 lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? (
              <CloseIcon />
            ) : (
              <MenuIcon />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-5 lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-2">
              {[
                ["Home", "home"],
                ["Specialties", "specialties"],
                ["Services", "services"],
                ["Doctors", "doctors"],
                ["Appointments", "appointments"],
                ["Billing", "billing"],
                ["Contact", "contact"],
              ].map(([label, id]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToSection(id)}
                  className="rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  {label}
                </button>
              ))}

              <a
                href="/inpatient"
                className="mt-1 flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm font-bold text-blue-700"
              >
                <span>🛏️</span>
                <span>Inpatient & Bed Management (ADT)</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setChatOpen(true);
                }}
                className="mt-2 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white"
              >
                <ChatIcon className="h-4 w-4" />
                Open MediCare Assistant
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* ===================================================
          HERO
          =================================================== */}

      <section
        id="home"
        className="relative overflow-hidden bg-white"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.08),transparent_30%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Modern Healthcare Management
            </div>

            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Healthcare designed around{" "}
              <span className="text-blue-600">better patient care.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              MediCare Clinic brings appointments, doctors, patients,
              medical services, billing and healthcare workflows together in
              one modern clinic management experience.
            </p>

            <form
              onSubmit={handleSearchSubmit}
              className="mt-8 flex max-w-2xl flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/5 sm:flex-row"
            >
              <div className="flex flex-1 items-center gap-3 px-3">
                <SearchIcon className="h-5 w-5 text-slate-400" />

                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search specialties, services or healthcare..."
                  className="w-full bg-transparent py-2 text-sm font-medium outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white transition hover:bg-blue-700"
              >
                Search
              </button>
            </form>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => scrollToSection("appointments")}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                <CalendarIcon className="h-5 w-5" />
                Book Appointment
                <ArrowIcon className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("services")}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-black text-slate-800 transition hover:border-blue-300 hover:text-blue-700"
              >
                Explore Services
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-slate-500">
              <span className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-emerald-600" />
                Patient-focused workflows
              </span>

              <span className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-emerald-600" />
                Local backend
              </span>

              <span className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-emerald-600" />
                Demo-safe healthcare data
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 rounded-[2rem] bg-blue-100/50 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1200&q=85"
                alt="Healthcare professional"
                className="h-[520px] w-full object-cover"
              />

              <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/40 bg-white/90 p-5 shadow-xl backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                      MediCare Care Team
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-900">
                      Compassionate care, organized digitally.
                    </p>
                  </div>

                  <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Online
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-7 -left-5 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldIcon className="h-6 w-6" />
                </span>

                <div>
                  <p className="text-xs font-bold text-slate-400">
                    Platform
                  </p>
                  <p className="text-sm font-black text-slate-900">
                    Secure by design
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -right-5 -top-5 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <HeartLogo className="h-6 w-6" />
                </span>

                <div>
                  <p className="text-xs font-bold text-slate-400">
                    Care first
                  </p>
                  <p className="text-sm font-black text-slate-900">
                    Patient centered
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          QUICK ACTIONS
          =================================================== */}

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.title}
                type="button"
                onClick={action.action}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </span>

                <span className="min-w-0">
                  <span className="block text-sm font-black text-slate-900">
                    {action.title}
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {action.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ===================================================
          LIVE PLATFORM STATUS
          =================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Live Clinic Dashboard
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                Healthcare system overview
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Information below is loaded from your local FastAPI backend.
              </p>
            </div>

            <button
              type="button"
              onClick={loadDashboardData}
              className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
            >
              <RefreshIcon className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {backendError && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-black">Backend connection unavailable.</p>
              <p className="mt-1">
                Make sure the FastAPI server is running at{" "}
                <span className="font-mono">
                  http://127.0.0.1:8000
                </span>
                .
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Registered Patients",
                value: patients.length,
                icon: UserIcon,
              },
              {
                label: "Available Doctors",
                value: doctors.length,
                icon: StethoscopeIcon,
              },
              {
                label: "Appointments",
                value: appointments.length,
                icon: CalendarIcon,
              },
              {
                label: "Medical Bills",
                value: bills.length,
                icon: BillIcon,
              },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <Icon className="h-5 w-5" />
                    </span>

                    {loading && (
                      <span className="text-xs font-bold text-slate-400">
                        Loading...
                      </span>
                    )}
                  </div>

                  <p className="mt-5 text-3xl font-black text-slate-950">
                    {loading ? "—" : stat.value}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
            <span>
              System:{" "}
              <strong className="text-slate-800">
                {systemInfo?.status ?? "Local"}
              </strong>
            </span>

            <span>•</span>

            <span>
              Version:{" "}
              <strong className="text-slate-800">
                {systemInfo?.version ?? "Development"}
              </strong>
            </span>

            <span>•</span>

            <span>
              Updated:{" "}
              <strong className="text-slate-800">
                {lastUpdated || "Waiting"}
              </strong>
            </span>
          </div>
        </div>
      </section>

      {/* ===================================================
          SPECIALTIES
          =================================================== */}

      <section
        id="specialties"
        className="scroll-mt-24 bg-slate-50"
      >
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Medical Specialties
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Care across essential medical specialties
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Explore the clinical departments supported by the MediCare
                healthcare management platform.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {["All", ...specialties.map((item) => item.title)].map(
                (specialty) => (
                  <button
                    key={specialty}
                    type="button"
                    onClick={() => setSelectedSpecialty(specialty)}
                    className={`rounded-full px-4 py-2 text-xs font-black transition ${
                      selectedSpecialty === specialty
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
                    }`}
                  >
                    {specialty}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredSpecialties.map((specialty) => (
              <button
                key={specialty.title}
                type="button"
                onClick={() => {
                  setSearchTerm(specialty.title);
                }}
                className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl font-black text-blue-600">
                    {specialty.icon}
                  </span>

                  <ArrowIcon className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600" />
                </div>

                <h3 className="mt-6 text-lg font-black text-slate-950">
                  {specialty.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {specialty.description}
                </p>
              </button>
            ))}
          </div>

          {filteredSpecialties.length === 0 && (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <SearchIcon className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-4 font-black text-slate-900">
                No specialty found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Try another search term.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ===================================================
          SERVICES
          =================================================== */}

      <section
        id="services"
        className="scroll-mt-24 bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
              Healthcare Services
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              One platform for connected clinic operations
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              MediCare combines clinical workflows and administrative
              functions into a single healthcare management experience.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <div
                  key={service.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-white transition group-hover:bg-blue-600">
                    <Icon className="h-6 w-6" />
                  </span>

                  <h3 className="mt-6 text-lg font-black text-slate-950">
                    {service.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {service.description}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      if (service.title === "Medical Billing") {
                        scrollToSection("billing");
                      } else if (
                        service.title === "Appointment Management"
                      ) {
                        scrollToSection("appointments");
                      } else if (
                        service.title === "Doctor Management"
                      ) {
                        scrollToSection("doctors");
                      } else if (
                        service.title === "MediCare Assistant"
                      ) {
                        setChatOpen(true);
                      }
                    }}
                    className="mt-5 flex items-center gap-2 text-sm font-black text-blue-600"
                  >
                    Explore
                    <ArrowIcon className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================
          CARE JOURNEY
          =================================================== */}

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
              Patient Care Journey
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              A clear path from appointment to follow-up
            </h2>

            <p className="mt-4 leading-7 text-slate-400">
              The system is designed around practical healthcare workflows
              that connect patients, clinicians and administrative teams.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                number: "01",
                title: "Register",
                text: "Create and maintain structured patient information.",
              },
              {
                number: "02",
                title: "Consult",
                text: "Connect patients with doctors and appointment workflows.",
              },
              {
                number: "03",
                title: "Care",
                text: "Coordinate laboratory, medicine and healthcare services.",
              },
              {
                number: "04",
                title: "Complete",
                text: "Manage billing, payment status and follow-up information.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <span className="text-sm font-black text-blue-400">
                  {step.number}
                </span>

                <h3 className="mt-5 text-xl font-black">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================
          DOCTORS
          =================================================== */}

      <section
        id="doctors"
        className="scroll-mt-24 bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Medical Team
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Doctors connected to your local system
              </h2>

              <p className="mt-4 max-w-2xl text-slate-600">
                These records are loaded from the local doctor management
                module.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-blue-700">
              {doctors.length} doctor{doctors.length === 1 ? "" : "s"} loaded
            </span>
          </div>

          {doctors.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <StethoscopeIcon className="mx-auto h-10 w-10 text-slate-300" />

              <h3 className="mt-5 text-lg font-black text-slate-900">
                No doctors registered yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Add doctors through the Doctor Management module and they
                will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {doctors.slice(0, 6).map((doctor) => (
                <div
                  key={doctor.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white">
                      {doctor.name
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-black text-slate-950">
                        {doctor.name}
                      </h3>

                      <p className="mt-1 text-sm font-bold text-blue-600">
                        {doctor.specialization}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <PhoneIcon className="h-4 w-4" />
                      {doctor.phone}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===================================================
          APPOINTMENTS
          =================================================== */}

      <section
        id="appointments"
        className="scroll-mt-24 bg-slate-50"
      >
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Appointment Management
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Upcoming clinic appointments
              </h2>

              <p className="mt-4 max-w-2xl text-slate-600">
                Appointment records are retrieved from your local healthcare
                backend.
              </p>
            </div>

            <button
              type="button"
              onClick={loadDashboardData}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700"
            >
              <RefreshIcon className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <CalendarIcon className="mx-auto h-10 w-10 text-slate-300" />

              <h3 className="mt-5 text-lg font-black text-slate-900">
                No appointments available
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Appointments created through the appointment management
                module will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                        ID
                      </th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                        Patient
                      </th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                        Doctor
                      </th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                        Date
                      </th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                        Time
                      </th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
                        Reason
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {upcomingAppointments.map((appointment) => {
                      const patient = patients.find(
                        (item) => item.id === appointment.patient_id,
                      );

                      const doctor = doctors.find(
                        (item) => item.id === appointment.doctor_id,
                      );

                      return (
                        <tr
                          key={appointment.id}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="px-6 py-5 text-sm font-black text-slate-900">
                            #{appointment.id}
                          </td>

                          <td className="px-6 py-5 text-sm font-bold text-slate-700">
                            {patient?.name ?? `Patient #${appointment.patient_id}`}
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {doctor?.name ?? `Doctor #${appointment.doctor_id}`}
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {appointment.appointment_date}
                          </td>

                          <td className="px-6 py-5 text-sm font-bold text-blue-600">
                            {appointment.appointment_time}
                          </td>

                          <td className="max-w-xs px-6 py-5 text-sm text-slate-500">
                            {appointment.reason}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===================================================
          BILLING
          =================================================== */}

      <section
        id="billing"
        className="scroll-mt-24 bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Medical Billing
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Transparent billing information
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                The MediCare billing module supports consultation,
                laboratory, medicine, procedure and other healthcare
                charges while tracking discounts, tax and payment status.
              </p>

              <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">
                <div className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <BillIcon className="h-6 w-6" />
                  </span>

                  <div>
                    <h3 className="font-black text-slate-950">
                      Local payment workflow
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      The current project supports local/demo payment status
                      management. It does not process real financial
                      transactions or store payment credentials.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-2xl font-black text-emerald-600">
                    {paidBills}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Paid Bills
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-2xl font-black text-amber-600">
                    {pendingBills}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Pending Bills
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-950 p-6 text-white">
                  <p className="text-xs font-bold text-slate-400">
                    Total Bills
                  </p>
                  <p className="mt-3 text-3xl font-black">
                    {billingSummary?.total_bills ?? bills.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-600 p-6 text-white">
                  <p className="text-xs font-bold text-blue-100">
                    Paid Amount
                  </p>
                  <p className="mt-3 text-3xl font-black">
                    ₹
                    {Number(
                      billingSummary?.paid_amount ?? 0,
                    ).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-2xl bg-amber-500 p-6 text-white">
                  <p className="text-xs font-bold text-amber-100">
                    Pending Amount
                  </p>
                  <p className="mt-3 text-3xl font-black">
                    ₹
                    {Number(
                      billingSummary?.pending_amount ?? 0,
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {recentBills.length === 0 ? (
                  <div className="p-10 text-center">
                    <BillIcon className="mx-auto h-8 w-8 text-slate-300" />

                    <p className="mt-4 font-black text-slate-900">
                      No billing records yet
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Medical bills created in the backend will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentBills.map((bill) => (
                      <div
                        key={bill.id}
                        className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
                      >
                        <div>
                          <p className="text-sm font-black text-slate-900">
                            Bill #{bill.id}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Patient #{bill.patient_id} • {bill.bill_date}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-sm font-black text-slate-900">
                            ₹
                            {Number(
                              bill.total_amount,
                            ).toLocaleString("en-IN")}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-black ${
                              bill.payment_status === "Paid"
                                ? "bg-emerald-50 text-emerald-700"
                                : bill.payment_status === "Cancelled"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {bill.payment_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 text-right text-xs font-semibold text-slate-400">
                Total billing value in loaded records: ₹
                {totalBillingAmount.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          DEPARTMENTS
          =================================================== */}

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                Departments
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Organized care across the clinic
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                A scalable department structure allows the platform to
                grow with additional medical specialties and operational
                services.
              </p>

              <button
                type="button"
                onClick={() => scrollToSection("specialties")}
                className="mt-7 flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white"
              >
                View Specialties
                <ArrowIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {departments.map((department) => (
                <div
                  key={department}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <CheckIcon className="h-4 w-4" />
                  </span>

                  <span className="text-sm font-bold text-slate-700">
                    {department}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          TECHNOLOGY + SECURITY
          =================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ShieldIcon className="h-6 w-6" />
              </span>

              <h3 className="mt-6 text-xl font-black">
                Privacy by design
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                The development workflow is designed around synthetic
                healthcare data and avoids exposing secrets or credentials.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <HospitalIcon className="h-6 w-6" />
              </span>

              <h3 className="mt-6 text-xl font-black">
                Connected clinic modules
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Patients, doctors, appointments and billing can communicate
                through the local healthcare backend.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <HeartLogo className="h-6 w-6" />
              </span>

              <h3 className="mt-6 text-xl font-black">
                Patient-first experience
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                The interface focuses on clear navigation, accessible
                information and practical healthcare workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          HEALTH TIPS
          =================================================== */}

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
              Health & Wellness
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Everyday healthcare information
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              General educational information to encourage healthy habits
              and better healthcare organization.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {healthTips.map((tip) => (
              <article
                key={tip.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                  {tip.category}
                </span>

                <h3 className="mt-5 text-xl font-black text-slate-950">
                  {tip.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {tip.description}
                </p>

                <div className="mt-6 flex items-center gap-1 text-amber-500">
                  <StarIcon className="h-4 w-4" />
                  <StarIcon className="h-4 w-4" />
                  <StarIcon className="h-4 w-4" />
                  <StarIcon className="h-4 w-4" />
                  <StarIcon className="h-4 w-4" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================
          EMERGENCY CARE
          =================================================== */}

      <section className="bg-red-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 rounded-3xl border border-red-200 bg-white p-7 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <PhoneIcon className="h-7 w-7" />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
                  Emergency Information
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Need urgent medical attention?
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Do not rely on this website or chatbot for emergency
                  response. Seek immediate professional medical attention
                  and contact your local emergency service when appropriate.
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-xl bg-red-600 px-5 py-3 text-center text-sm font-black text-white">
              24/7 Emergency Support
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          FAQ
          =================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
              Frequently Asked Questions
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Common questions
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq(isOpen ? null : index)
                    }
                    className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left"
                  >
                    <span className="text-sm font-black text-slate-900">
                      {faq.question}
                    </span>

                    <ChevronDownIcon
                      className={`h-5 w-5 shrink-0 text-slate-400 transition ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 px-5 py-5">
                      <p className="text-sm leading-7 text-slate-600">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================
          ASSISTANT CTA
          =================================================== */}

      <section className="bg-blue-600">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl text-white">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <ChatIcon className="h-6 w-6" />
                </span>

                <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                  MediCare Assistant
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Need help finding something?
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-blue-100">
                Ask the local MediCare Assistant about appointments,
                doctors, services, billing or navigating the clinic website.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="flex w-fit items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-blue-700 shadow-xl"
            >
              Open Assistant
              <ArrowIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ===================================================
          CONTACT
          =================================================== */}

      <section
        id="contact"
        className="scroll-mt-24 bg-slate-950 text-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
                  <HeartLogo className="h-7 w-7" />
                </span>

                <div>
                  <p className="text-xl font-black">MediCare Clinic</p>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
                    Healthcare Management
                  </p>
                </div>
              </div>

              <h2 className="mt-8 max-w-xl text-3xl font-black tracking-tight sm:text-4xl">
                Better organized healthcare starts here.
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-slate-400">
                MediCare is a local healthcare management project designed
                to bring clinic operations, patient workflows and
                administrative services together.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <LocationIcon className="h-6 w-6 text-blue-400" />

                <h3 className="mt-5 font-black">
                  Hospital Location
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  MediCare Clinic
                  <br />
                  Main Healthcare Campus
                  <br />
                  Hyderabad, Telangana, India
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <PhoneIcon className="h-6 w-6 text-blue-400" />

                <h3 className="mt-5 font-black">
                  Contact
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  +91 90000 00000
                  <br />
                  24/7 Support
                  <br />
                  Hours configurable
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <ClockIcon className="h-6 w-6 text-blue-400" />

                <h3 className="mt-5 font-black">
                  Clinic Hours
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  General consultations
                  <br />
                  Monday – Saturday
                  <br />
                  Emergency support: 24/7
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <ShieldIcon className="h-6 w-6 text-blue-400" />

                <h3 className="mt-5 font-black">
                  Development Safety
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Demo data only
                  <br />
                  No exposed credentials
                  <br />
                  Local backend architecture
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          FOOTER
          =================================================== */}

      <footer className="border-t border-white/10 bg-slate-950 text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-7 text-xs sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()} MediCare Clinic. Development
            healthcare management system.
          </p>

          <div className="flex flex-wrap gap-5">
            <button
              type="button"
              onClick={() => scrollToSection("home")}
              className="transition hover:text-white"
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("services")}
              className="transition hover:text-white"
            >
              Services
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("contact")}
              className="transition hover:text-white"
            >
              Contact
            </button>

            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="transition hover:text-white"
            >
              Assistant
            </button>
          </div>
        </div>
      </footer>

      {/* ===================================================
          FLOATING ASSISTANT BUTTON
          =================================================== */}

      <button
        type="button"
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl shadow-blue-900/30 transition hover:scale-105 hover:bg-blue-700"
        aria-label="Open MediCare Assistant"
      >
        <ChatIcon className="h-6 w-6" />
      </button>

      {/* ===================================================
          ASSISTANT MODAL
          =================================================== */}

      {chatOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-end bg-slate-950/30 p-4 backdrop-blur-sm sm:p-6">
          <div className="flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-slate-950 px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                  <HeartLogo className="h-6 w-6" />
                </span>

                <div>
                  <p className="text-sm font-black">
                    MediCare Assistant
                  </p>

                  <p className="text-xs text-slate-400">
                    Local clinic assistant
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Close assistant"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-5">
              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="text-sm leading-6 text-slate-700">
                  {assistantMessage}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                {[
                  "Book appointment",
                  "Find a doctor",
                  "Medical bills",
                  "Emergency help",
                ].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => {
                      setAssistantInput(quick);
                    }}
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-left text-xs font-bold text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {quick}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleAssistantSubmit}
              className="border-t border-slate-200 bg-white p-4"
            >
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-2 focus-within:border-blue-400">
                <input
                  value={assistantInput}
                  onChange={(event) =>
                    setAssistantInput(event.target.value)
                  }
                  placeholder="Ask MediCare..."
                  className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"
                />

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-black text-white"
                >
                  Send
                </button>
              </div>

              <p className="mt-2 text-[10px] leading-4 text-slate-400">
                The assistant provides general navigation and informational
                support. It is not a medical diagnosis or emergency service.
              </p>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}