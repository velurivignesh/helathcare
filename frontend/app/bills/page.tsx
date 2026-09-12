"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

/*
|--------------------------------------------------------------------------
| MediCare Clinic
| Medical Billing & Invoice Management
|--------------------------------------------------------------------------
|
| This page is the frontend billing workspace for the MediCare Clinic
| healthcare management system.
|
| Current responsibilities:
|
| 1. Load patients from the local FastAPI backend
| 2. Load medical bills from the local FastAPI backend
| 3. Create new medical bills
| 4. Calculate subtotal
| 5. Calculate discount
| 6. Calculate tax
| 7. Calculate final payable amount
| 8. Search billing records
| 9. Filter billing records
| 10. View detailed billing information
| 11. Print invoices
| 12. Delete billing records
| 13. Display financial summary information
| 14. Handle loading states
| 15. Handle backend errors
| 16. Handle form validation
| 17. Provide responsive desktop/mobile layouts
|
| IMPORTANT:
|
| This application currently uses synthetic/demo healthcare information.
| It does not process real patient information.
|
| The application communicates with the project's own local FastAPI
| backend. No third-party healthcare API is being used here.
|--------------------------------------------------------------------------
*/

const API_URL = "http://127.0.0.1:8000";

/*
|--------------------------------------------------------------------------
| Type definitions
|--------------------------------------------------------------------------
*/

type Patient = {
  id: number;
  name: string;
  age: number;
  phone: string;
};

type MedicalBill = {
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

type BillForm = {
  patient_id: string;

  consultation_amount: string;
  laboratory_amount: string;
  medicine_amount: string;
  procedure_amount: string;
  other_amount: string;

  discount: string;
  tax: string;

  bill_date: string;
};

type MessageType =
  | "success"
  | "error"
  | "info";

type MessageState = {
  type: MessageType;
  text: string;
} | null;

/*
|--------------------------------------------------------------------------
| Helper functions
|--------------------------------------------------------------------------
*/

/**
 * Returns today's date in YYYY-MM-DD format.
 *
 * The HTML date input expects this format.
 */
function getTodayDate(): string {
  const currentDate = new Date();

  const year = currentDate.getFullYear();

  const month = String(
    currentDate.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    currentDate.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Creates a fresh billing form.
 *
 * Keeping this in a function means we can reset the entire form
 * without manually repeating every field in multiple places.
 */
function createInitialForm(): BillForm {
  return {
    patient_id: "",

    consultation_amount: "0",
    laboratory_amount: "0",
    medicine_amount: "0",
    procedure_amount: "0",
    other_amount: "0",

    discount: "0",
    tax: "0",

    bill_date: getTodayDate(),
  };
}

/**
 * Converts a string amount into a safe number.
 */
function parseAmount(value: string): number {
  const numberValue = Number.parseFloat(value);

  if (Number.isNaN(numberValue)) {
    return 0;
  }

  return numberValue;
}

/**
 * Formats Indian Rupee values.
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

/**
 * Returns the CSS classes for payment status.
 */
function getStatusClasses(status: string): string {
  const normalizedStatus =
    status.trim().toLowerCase();

  if (normalizedStatus === "paid") {
    return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  }

  if (normalizedStatus === "partial") {
    return "bg-blue-100 text-blue-700 border border-blue-200";
  }

  if (normalizedStatus === "cancelled") {
    return "bg-red-100 text-red-700 border border-red-200";
  }

  return "bg-amber-100 text-amber-700 border border-amber-200";
}

/*
|--------------------------------------------------------------------------
| Main component
|--------------------------------------------------------------------------
*/

export default function BillsPage() {
  /*
  |--------------------------------------------------------------------------
  | Data state
  |--------------------------------------------------------------------------
  */

  const [patients, setPatients] =
    useState<Patient[]>([]);

  const [bills, setBills] =
    useState<MedicalBill[]>([]);

  /*
  |--------------------------------------------------------------------------
  | Form state
  |--------------------------------------------------------------------------
  */

  const [form, setForm] =
    useState<BillForm>(createInitialForm());

  /*
  |--------------------------------------------------------------------------
  | Search/filter state
  |--------------------------------------------------------------------------
  */

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  /*
  |--------------------------------------------------------------------------
  | UI state
  |--------------------------------------------------------------------------
  */

  const [loadingBills, setLoadingBills] =
    useState(true);

  const [loadingPatients, setLoadingPatients] =
    useState(true);

  const [creatingBill, setCreatingBill] =
    useState(false);

  const [selectedBill, setSelectedBill] =
    useState<MedicalBill | null>(null);

  const [message, setMessage] =
    useState<MessageState>(null);

  /*
  |--------------------------------------------------------------------------
  | Current form amounts
  |--------------------------------------------------------------------------
  */

  const consultationAmount =
    parseAmount(
      form.consultation_amount,
    );

  const laboratoryAmount =
    parseAmount(
      form.laboratory_amount,
    );

  const medicineAmount =
    parseAmount(
      form.medicine_amount,
    );

  const procedureAmount =
    parseAmount(
      form.procedure_amount,
    );

  const otherAmount =
    parseAmount(
      form.other_amount,
    );

  const discountAmount =
    parseAmount(form.discount);

  const taxAmount =
    parseAmount(form.tax);

  /*
  |--------------------------------------------------------------------------
  | Billing calculation
  |--------------------------------------------------------------------------
  */

  const calculatedSubtotal =
    consultationAmount +
    laboratoryAmount +
    medicineAmount +
    procedureAmount +
    otherAmount;

  const calculatedTaxableAmount =
    Math.max(
      calculatedSubtotal -
        discountAmount,
      0,
    );

  const calculatedTotal =
    calculatedTaxableAmount +
    taxAmount;

  /*
  |--------------------------------------------------------------------------
  | Load patients
  |--------------------------------------------------------------------------
  */

  async function loadPatients() {
    try {
      setLoadingPatients(true);

      const response =
        await fetch(
          `${API_URL}/patients`,
        );

      if (!response.ok) {
        throw new Error(
          "Unable to load patients.",
        );
      }

      const data =
        await response.json();

      setPatients(
        Array.isArray(data.patients)
          ? data.patients
          : [],
      );
    } catch (error) {
      console.error(
        "Patient loading error:",
        error,
      );

      setMessage({
        type: "error",
        text:
          "Unable to load patients from the local healthcare backend.",
      });
    } finally {
      setLoadingPatients(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Load bills
  |--------------------------------------------------------------------------
  */

  async function loadBills() {
    try {
      setLoadingBills(true);

      const response =
        await fetch(
          `${API_URL}/bills`,
        );

      if (!response.ok) {
        throw new Error(
          "Unable to load bills.",
        );
      }

      const data =
        await response.json();

      setBills(
        Array.isArray(data.bills)
          ? data.bills
          : [],
      );
    } catch (error) {
      console.error(
        "Billing loading error:",
        error,
      );

      setMessage({
        type: "error",
        text:
          "Unable to connect to the billing system. Make sure the FastAPI backend is running.",
      });
    } finally {
      setLoadingBills(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Initial data loading
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadPatients();
    loadBills();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Generic form updater
  |--------------------------------------------------------------------------
  */

  function updateForm(
    field: keyof BillForm,
    value: string,
  ) {
    setForm(
      (currentForm) => ({
        ...currentForm,
        [field]: value,
      }),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Reset billing form
  |--------------------------------------------------------------------------
  */

  function resetForm() {
    setForm(
      createInitialForm(),
    );

    setMessage({
      type: "info",
      text:
        "The medical billing form has been reset.",
    });
  }

  /*
  |--------------------------------------------------------------------------
  | Validation
  |--------------------------------------------------------------------------
  */

  function validateBillForm(): string | null {
    if (!form.patient_id) {
      return "Please select a patient.";
    }

    if (!form.bill_date) {
      return "Please select the bill date.";
    }

    const amounts = [
      consultationAmount,
      laboratoryAmount,
      medicineAmount,
      procedureAmount,
      otherAmount,
      discountAmount,
      taxAmount,
    ];

    const hasNegativeAmount =
      amounts.some(
        (amount) =>
          amount < 0,
      );

    if (hasNegativeAmount) {
      return "Billing amounts cannot be negative.";
    }

    if (
      discountAmount >
      calculatedSubtotal
    ) {
      return "The discount cannot be greater than the subtotal.";
    }

    if (
      calculatedSubtotal <= 0
    ) {
      return "Please enter at least one medical service charge.";
    }

    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Create medical bill
  |--------------------------------------------------------------------------
  */

  async function handleCreateBill(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage(null);

    const validationError =
      validateBillForm();

    if (validationError) {
      setMessage({
        type: "error",
        text: validationError,
      });

      return;
    }

    try {
      setCreatingBill(true);

      const response =
        await fetch(
          `${API_URL}/bills`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              patient_id:
                Number(form.patient_id),

              consultation_amount:
                consultationAmount,

              laboratory_amount:
                laboratoryAmount,

              medicine_amount:
                medicineAmount,

              procedure_amount:
                procedureAmount,

              other_amount:
                otherAmount,

              discount:
                discountAmount,

              tax:
                taxAmount,

              bill_date:
                form.bill_date,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to create medical bill.",
        );
      }

      setMessage({
        type: "success",
        text:
          `Medical bill #${data.bill.id} was created successfully.`,
      });

      setForm(
        createInitialForm(),
      );

      await loadBills();
    } catch (error) {
      console.error(
        "Bill creation error:",
        error,
      );

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to create medical bill.",
      });
    } finally {
      setCreatingBill(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Find patient by ID
  |--------------------------------------------------------------------------
  */

  function findPatient(
    patientId: number,
  ): Patient | undefined {
    return patients.find(
      (patient) =>
        patient.id === patientId,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Search and filtering
  |--------------------------------------------------------------------------
  */

  const filteredBills =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return bills.filter(
        (bill) => {
          const patient =
            findPatient(
              bill.patient_id,
            );

          const patientName =
            patient?.name
              ?.toLowerCase() || "";

          const patientPhone =
            patient?.phone
              ?.toLowerCase() || "";

          const billId =
            String(bill.id);

          const patientId =
            String(
              bill.patient_id,
            );

          const status =
            bill.payment_status
              ?.toLowerCase() || "";

          const date =
            bill.bill_date
              ?.toLowerCase() || "";

          const matchesSearch =
            !query ||
            billId.includes(query) ||
            patientId.includes(query) ||
            patientName.includes(query) ||
            patientPhone.includes(query) ||
            status.includes(query) ||
            date.includes(query);

          const matchesStatus =
            statusFilter === "All" ||
            bill.payment_status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      bills,
      search,
      statusFilter,
      patients,
    ]);

  /*
  |--------------------------------------------------------------------------
  | Financial summaries
  |--------------------------------------------------------------------------
  */

  const totalBills =
    bills.length;

  const pendingBills =
    bills.filter(
      (bill) =>
        bill.payment_status ===
        "Pending",
    );

  const paidBills =
    bills.filter(
      (bill) =>
        bill.payment_status ===
        "Paid",
    );

  const partialBills =
    bills.filter(
      (bill) =>
        bill.payment_status ===
        "Partial",
    );

  const cancelledBills =
    bills.filter(
      (bill) =>
        bill.payment_status ===
        "Cancelled",
    );

  const totalBilledAmount =
    bills.reduce(
      (total, bill) =>
        total +
        Number(
          bill.total_amount || 0,
        ),
      0,
    );

  const pendingAmount =
    pendingBills.reduce(
      (total, bill) =>
        total +
        Number(
          bill.total_amount || 0,
        ),
      0,
    );

  const paidAmount =
    paidBills.reduce(
      (total, bill) =>
        total +
        Number(
          bill.total_amount || 0,
        ),
      0,
    );

  const partialAmount =
    partialBills.reduce(
      (total, bill) =>
        total +
        Number(
          bill.total_amount || 0,
        ),
      0,
    );

  /*
  |--------------------------------------------------------------------------
  | Delete bill
  |--------------------------------------------------------------------------
  */

  async function deleteBill(
    billId: number,
  ) {
    const confirmed =
      window.confirm(
        `Delete medical bill #${billId}? This action cannot be undone.`,
      );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API_URL}/bills/${billId}`,
          {
            method: "DELETE",
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to delete medical bill.",
        );
      }

      setBills(
        (currentBills) =>
          currentBills.filter(
            (bill) =>
              bill.id !== billId,
          ),
      );

      if (
        selectedBill?.id ===
        billId
      ) {
        setSelectedBill(null);
      }

      setMessage({
        type: "success",
        text:
          `Medical bill #${billId} was deleted successfully.`,
      });
    } catch (error) {
      console.error(
        "Bill deletion error:",
        error,
      );

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to delete the medical bill.",
      });
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Print invoice
  |--------------------------------------------------------------------------
  */

  function printBill(
    bill: MedicalBill,
  ) {
    const patient =
      findPatient(
        bill.patient_id,
      );

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=950,height=800",
      );

    if (!printWindow) {
      setMessage({
        type: "error",
        text:
          "The invoice window was blocked. Please allow pop-ups in your browser.",
      });

      return;
    }

    const patientName =
      patient?.name ||
      `Patient #${bill.patient_id}`;

    const patientPhone =
      patient?.phone ||
      "Not available";

    const invoiceHTML = `
<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<title>
  MediCare Clinic - Invoice #${bill.id}
</title>

<style>

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 40px;
  background: #ffffff;
  color: #172033;
  font-family:
    Arial,
    Helvetica,
    sans-serif;
}

.invoice {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  border: 1px solid #dbe3ef;
  border-radius: 18px;
  overflow: hidden;
}

.header {
  padding: 32px;
  background: #eff6ff;
  border-bottom: 1px solid #dbe3ef;
}

.brand {
  font-size: 30px;
  font-weight: 800;
  color: #1d4ed8;
}

.subtitle {
  margin-top: 6px;
  color: #64748b;
  font-size: 14px;
}

.header-grid {
  margin-top: 25px;
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.header-card {
  background: #ffffff;
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  padding: 16px;
}

.label {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.value {
  margin-top: 6px;
  font-size: 16px;
  font-weight: 700;
}

.content {
  padding: 32px;
}

h2 {
  margin: 0;
  font-size: 20px;
}

table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
}

th {
  background: #f8fafc;
  color: #475569;
  font-size: 12px;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

th,
td {
  padding: 14px;
  border-bottom:
    1px solid #e2e8f0;
}

.amount {
  text-align: right;
  font-weight: 600;
}

.total-section {
  margin-top: 25px;
  margin-left: auto;
  width: 360px;
}

.total-line {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.grand-total {
  margin-top: 10px;
  padding-top: 15px;
  border-top:
    2px solid #172033;
  font-size: 22px;
  font-weight: 800;
}

.footer {
  padding: 25px 32px;
  background: #f8fafc;
  border-top:
    1px solid #e2e8f0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

@media print {

  body {
    padding: 0;
  }

  .invoice {
    border: none;
    border-radius: 0;
  }

}

</style>

</head>

<body>

<div class="invoice">

  <div class="header">

    <div class="brand">
      MediCare Clinic
    </div>

    <div class="subtitle">
      Healthcare Management & Medical Billing System
    </div>

    <div class="header-grid">

      <div class="header-card">

        <div class="label">
          Invoice Number
        </div>

        <div class="value">
          BILL-${bill.id}
        </div>

      </div>

      <div class="header-card">

        <div class="label">
          Bill Date
        </div>

        <div class="value">
          ${bill.bill_date}
        </div>

      </div>

      <div class="header-card">

        <div class="label">
          Patient
        </div>

        <div class="value">
          ${patientName}
        </div>

      </div>

      <div class="header-card">

        <div class="label">
          Patient Phone
        </div>

        <div class="value">
          ${patientPhone}
        </div>

      </div>

    </div>

  </div>

  <div class="content">

    <h2>
      Medical Services
    </h2>

    <table>

      <thead>

        <tr>

          <th>
            Service
          </th>

          <th class="amount">
            Amount
          </th>

        </tr>

      </thead>

      <tbody>

        <tr>
          <td>
            Doctor Consultation
          </td>

          <td class="amount">
            ${formatCurrency(
              bill.consultation_amount,
            )}
          </td>
        </tr>

        <tr>
          <td>
            Laboratory Services
          </td>

          <td class="amount">
            ${formatCurrency(
              bill.laboratory_amount,
            )}
          </td>
        </tr>

        <tr>
          <td>
            Medicines
          </td>

          <td class="amount">
            ${formatCurrency(
              bill.medicine_amount,
            )}
          </td>
        </tr>

        <tr>
          <td>
            Procedures
          </td>

          <td class="amount">
            ${formatCurrency(
              bill.procedure_amount,
            )}
          </td>
        </tr>

        <tr>
          <td>
            Other Services
          </td>

          <td class="amount">
            ${formatCurrency(
              bill.other_amount,
            )}
          </td>
        </tr>

      </tbody>

    </table>

    <div class="total-section">

      <div class="total-line">

        <span>
          Subtotal
        </span>

        <strong>
          ${formatCurrency(
            bill.subtotal,
          )}
        </strong>

      </div>

      <div class="total-line">

        <span>
          Discount
        </span>

        <strong>
          - ${formatCurrency(
            bill.discount,
          )}
        </strong>

      </div>

      <div class="total-line">

        <span>
          Tax
        </span>

        <strong>
          ${formatCurrency(
            bill.tax,
          )}
        </strong>

      </div>

      <div class="total-line grand-total">

        <span>
          Total
        </span>

        <strong>
          ${formatCurrency(
            bill.total_amount,
          )}
        </strong>

      </div>

    </div>

  </div>

  <div class="footer">

    <strong>
      MediCare Clinic
    </strong>

    <br>

    Main Healthcare Campus,
    Hyderabad, Telangana, India

    <br>

    This invoice was generated by
    the MediCare Clinic demonstration
    healthcare management system.

    <br>

    Payment status:
    ${bill.payment_status}

  </div>

</div>

<script>

window.onload = function () {
  window.print();
};

</script>

</body>

</html>
`;

    printWindow.document.write(
      invoiceHTML,
    );

    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 250);
  }

  /*
  |--------------------------------------------------------------------------
  | Render page
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ================================================================ */}
      {/* HEADER                                                           */}
      {/* ================================================================ */}

      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-8">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
                MediCare Clinic
              </p>

              <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
                Medical Billing Center
              </h1>

              <p className="mt-3 max-w-3xl text-slate-600">
                Create and manage medical bills,
                review service charges, monitor payment
                status, search billing records, and
                generate printable patient invoices.
              </p>

            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              <button
                type="button"
                onClick={() => {
                  loadPatients();
                  loadBills();
                }}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Refresh Data
              </button>

            </div>

          </div>

        </div>

      </section>

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-8">

        {/* ============================================================ */}
        {/* MESSAGE                                                       */}
        {/* ============================================================ */}

        {message && (

          <div
            className={[
              "rounded-2xl border p-5 shadow-sm",

              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "",

              message.type === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "",

              message.type === "info"
                ? "border-blue-200 bg-blue-50 text-blue-800"
                : "",
            ].join(" ")}
          >

            <div className="flex items-start justify-between gap-5">

              <div>

                <p className="font-bold">

                  {message.type ===
                    "success"
                    ? "Operation Successful"
                    : message.type ===
                        "error"
                      ? "Billing System Message"
                      : "Information"}

                </p>

                <p className="mt-1 text-sm">
                  {message.text}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setMessage(null)
                }
                className="text-xl font-bold opacity-60 hover:opacity-100"
              >
                ×
              </button>

            </div>

          </div>

        )}

        {/* ============================================================ */}
        {/* FINANCIAL SUMMARY                                             */}
        {/* ============================================================ */}

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm font-semibold text-slate-500">
              Total Bills
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalBills}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              All medical billing records
            </p>

          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">

            <p className="text-sm font-semibold text-amber-700">
              Pending Amount
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-900">
              {formatCurrency(
                pendingAmount,
              )}
            </p>

            <p className="mt-2 text-sm text-amber-700">
              {pendingBills.length} pending bills
            </p>

          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">

            <p className="text-sm font-semibold text-emerald-700">
              Paid Amount
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-900">
              {formatCurrency(
                paidAmount,
              )}
            </p>

            <p className="mt-2 text-sm text-emerald-700">
              {paidBills.length} paid bills
            </p>

          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">

            <p className="text-sm font-semibold text-blue-700">
              Total Billed
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-900">
              {formatCurrency(
                totalBilledAmount,
              )}
            </p>

            <p className="mt-2 text-sm text-blue-700">
              Overall billing value
            </p>

          </div>

        </section>

        {/* ============================================================ */}
        {/* SECONDARY STATISTICS                                          */}
        {/* ============================================================ */}

        <section className="grid gap-4 md:grid-cols-4">

          <div className="rounded-xl border border-slate-200 bg-white p-5">

            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Patients Available
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {patients.length}
            </p>

          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">

            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Partial Bills
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-900">
              {partialBills.length}
            </p>

            <p className="mt-1 text-xs text-blue-700">
              {formatCurrency(
                partialAmount,
              )}
            </p>

          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-5">

            <p className="text-xs font-bold uppercase tracking-wider text-red-600">
              Cancelled Bills
            </p>

            <p className="mt-2 text-2xl font-bold text-red-900">
              {cancelledBills.length}
            </p>

          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">

            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Visible Records
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {filteredBills.length}
            </p>

          </div>

        </section>

        {/* ============================================================ */}
        {/* CREATE BILL                                                   */}
        {/* ============================================================ */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 bg-slate-50 px-6 py-7">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                  Billing Entry
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Create Medical Bill
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Enter medical service charges and
                  review the calculated total before
                  saving the bill.
                </p>

              </div>

              <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">

                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Current Total
                </p>

                <p className="mt-1 text-2xl font-bold text-blue-700">
                  {formatCurrency(
                    calculatedTotal,
                  )}
                </p>

              </div>

            </div>

          </div>

          <form
            onSubmit={
              handleCreateBill
            }
            className="space-y-10 p-6"
          >

            {/* ======================================================== */}
            {/* PATIENT                                                     */}
            {/* ======================================================== */}

            <div>

              <h3 className="text-lg font-bold text-slate-900">
                Patient Information
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Select the patient associated with this
                medical billing record.
              </p>

              <div className="mt-5 grid gap-5 md:grid-cols-2">

                <div>

                  <label
                    htmlFor="patient"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Patient
                  </label>

                  <select
                    id="patient"
                    value={
                      form.patient_id
                    }
                    onChange={(event) =>
                      updateForm(
                        "patient_id",
                        event.target.value,
                      )
                    }
                    disabled={
                      loadingPatients
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  >

                    <option value="">
                      {loadingPatients
                        ? "Loading patients..."
                        : "Select a patient"}
                    </option>

                    {patients.map(
                      (
                        patient,
                      ) => (
                        <option
                          key={
                            patient.id
                          }
                          value={
                            patient.id
                          }
                        >
                          #{patient.id}{" "}
                          —{" "}
                          {patient.name}{" "}
                          — Age{" "}
                          {patient.age}
                        </option>
                      ),
                    )}

                  </select>

                  {!loadingPatients &&
                    patients.length ===
                      0 && (
                      <p className="mt-2 text-sm text-amber-600">
                        No patients are available.
                        Create a demo patient first.
                      </p>
                    )}

                </div>

                <div>

                  <label
                    htmlFor="bill-date"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Bill Date
                  </label>

                  <input
                    id="bill-date"
                    type="date"
                    value={
                      form.bill_date
                    }
                    onChange={(event) =>
                      updateForm(
                        "bill_date",
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

              </div>

            </div>

            {/* ======================================================== */}
            {/* SERVICE CHARGES                                             */}
            {/* ======================================================== */}

            <div>

              <h3 className="text-lg font-bold text-slate-900">
                Medical Services & Charges
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Enter the charges for each service category.
              </p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {[
                  {
                    id: "consultation_amount",
                    label: "Doctor Consultation",
                  },
                  {
                    id: "laboratory_amount",
                    label: "Laboratory Services",
                  },
                  {
                    id: "medicine_amount",
                    label: "Medicines",
                  },
                  {
                    id: "procedure_amount",
                    label: "Procedures",
                  },
                  {
                    id: "other_amount",
                    label: "Other Services",
                  },
                ].map(
                  (field) => (
                    <div
                      key={
                        field.id
                      }
                    >

                      <label
                        htmlFor={
                          field.id
                        }
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        {
                          field.label
                        }
                      </label>

                      <div className="relative">

                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-400">
                          ₹
                        </span>

                        <input
                          id={
                            field.id
                          }
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            form[
                              field.id as keyof BillForm
                            ]
                          }
                          onChange={(
                            event,
                          ) =>
                            updateForm(
                              field.id as keyof BillForm,
                              event.target.value,
                            )
                          }
                          className="w-full rounded-xl border border-slate-300 py-3 pl-9 pr-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />

                      </div>

                    </div>
                  ),
                )}

              </div>

            </div>

            {/* ======================================================== */}
            {/* DISCOUNT AND TAX                                            */}
            {/* ======================================================== */}

            <div>

              <h3 className="text-lg font-bold text-slate-900">
                Discounts & Tax
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Apply billing adjustments before creating
                the medical bill.
              </p>

              <div className="mt-5 grid gap-5 md:grid-cols-2">

                <div>

                  <label
                    htmlFor="discount"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Discount Amount
                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-400">
                      ₹
                    </span>

                    <input
                      id="discount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        form.discount
                      }
                      onChange={(event) =>
                        updateForm(
                          "discount",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 py-3 pl-9 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                  </div>

                </div>

                <div>

                  <label
                    htmlFor="tax"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Tax Amount
                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-400">
                      ₹
                    </span>

                    <input
                      id="tax"
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        form.tax
                      }
                      onChange={(event) =>
                        updateForm(
                          "tax",
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 py-3 pl-9 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                  </div>

                </div>

              </div>

            </div>

            {/* ======================================================== */}
            {/* CALCULATION                                                */}
            {/* ======================================================== */}

            <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6">

              <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">

                <div>

                  <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                    Billing Preview
                  </p>

                  <h3 className="mt-1 text-xl font-bold text-blue-950">
                    Automatic Calculation
                  </h3>

                  <p className="mt-2 max-w-xl text-sm text-blue-700">
                    These values are calculated locally for
                    preview. The backend also calculates the
                    final billing totals when the bill is saved.
                  </p>

                </div>

                <div className="grid w-full gap-4 sm:grid-cols-3 xl:max-w-3xl">

                  <div className="rounded-2xl bg-white p-5 shadow-sm">

                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Subtotal
                    </p>

                    <p className="mt-2 text-xl font-bold text-slate-900">
                      {formatCurrency(
                        calculatedSubtotal,
                      )}
                    </p>

                  </div>

                  <div className="rounded-2xl bg-white p-5 shadow-sm">

                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      After Discount
                    </p>

                    <p className="mt-2 text-xl font-bold text-slate-900">
                      {formatCurrency(
                        calculatedTaxableAmount,
                      )}
                    </p>

                  </div>

                  <div className="rounded-2xl bg-blue-700 p-5 text-white shadow-sm">

                    <p className="text-xs font-bold uppercase tracking-wider text-blue-100">
                      Grand Total
                    </p>

                    <p className="mt-2 text-xl font-bold">
                      {formatCurrency(
                        calculatedTotal,
                      )}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* ======================================================== */}
            {/* FORM ACTIONS                                               */}
            {/* ======================================================== */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={
                  resetForm
                }
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Reset Form
              </button>

              <button
                type="submit"
                disabled={
                  creatingBill
                }
                className="rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {creatingBill
                  ? "Creating Medical Bill..."
                  : "Create Medical Bill"}
              </button>

            </div>

          </form>

        </section>

        {/* ============================================================ */}
        {/* BILL RECORDS                                                  */}
        {/* ============================================================ */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-7">

            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

              <div>

                <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                  Billing Records
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Existing Medical Bills
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Search, filter, view, print, or remove
                  existing billing records.
                </p>

              </div>

              <div className="flex w-full flex-col gap-3 md:flex-row xl:max-w-2xl">

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search bill, patient, phone, date..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <select
                  value={
                    statusFilter
                  }
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value,
                    )
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >

                  <option value="All">
                    All Statuses
                  </option>

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Paid">
                    Paid
                  </option>

                  <option value="Partial">
                    Partial
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>

                </select>

              </div>

            </div>

          </div>

          {/* ========================================================== */}
          {/* LOADING                                                     */}
          {/* ========================================================== */}

          {loadingBills && (

            <div className="px-6 py-16 text-center">

              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-5 font-semibold text-slate-700">
                Loading medical bills...
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Reading billing records from the local database.
              </p>

            </div>

          )}

          {/* ========================================================== */}
          {/* EMPTY                                                       */}
          {/* ========================================================== */}

          {!loadingBills &&
            filteredBills.length ===
              0 && (

              <div className="px-6 py-16 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
                  🧾
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  No medical bills found
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
                  {search ||
                  statusFilter !==
                    "All"
                    ? "No billing records match the current search or filter."
                    : "Create a medical bill using the billing form above."}
                </p>

              </div>

            )}

          {/* ========================================================== */}
          {/* TABLE                                                       */}
          {/* ========================================================== */}

          {!loadingBills &&
            filteredBills.length >
              0 && (

              <div className="overflow-x-auto">

                <table className="min-w-[1100px] w-full">

                  <thead className="bg-slate-50">

                    <tr className="border-b border-slate-200">

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Bill
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Patient
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Date
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                        Subtotal
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                        Total
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredBills.map(
                      (bill) => {

                        const patient =
                          findPatient(
                            bill.patient_id,
                          );

                        return (

                          <tr
                            key={
                              bill.id
                            }
                            className="border-b border-slate-100 transition hover:bg-slate-50"
                          >

                            <td className="px-6 py-5">

                              <p className="font-bold text-slate-900">
                                BILL-
                                {bill.id}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                ID #
                                {
                                  bill.id
                                }
                              </p>

                            </td>

                            <td className="px-6 py-5">

                              <p className="font-semibold text-slate-900">
                                {
                                  patient?.name ||
                                  `Patient #${bill.patient_id}`
                                }
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Patient ID #
                                {
                                  bill.patient_id
                                }
                              </p>

                            </td>

                            <td className="whitespace-nowrap px-6 py-5 text-sm text-slate-600">
                              {
                                bill.bill_date
                              }
                            </td>

                            <td className="whitespace-nowrap px-6 py-5 text-right text-sm font-medium text-slate-700">
                              {formatCurrency(
                                bill.subtotal,
                              )}
                            </td>

                            <td className="whitespace-nowrap px-6 py-5 text-right font-bold text-slate-900">
                              {formatCurrency(
                                bill.total_amount,
                              )}
                            </td>

                            <td className="px-6 py-5">

                              <span
                                className={[
                                  "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                                  getStatusClasses(
                                    bill.payment_status,
                                  ),
                                ].join(
                                  " ",
                                )}
                              >
                                {
                                  bill.payment_status
                                }
                              </span>

                            </td>

                            <td className="px-6 py-5">

                              <div className="flex justify-end gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedBill(
                                      bill,
                                    )
                                  }
                                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                                >
                                  View
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    printBill(
                                      bill,
                                    )
                                  }
                                  className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                                >
                                  Invoice
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteBill(
                                      bill.id,
                                    )
                                  }
                                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                                >
                                  Delete
                                </button>

                              </div>

                            </td>

                          </tr>

                        );
                      },
                    )}

                  </tbody>

                </table>

              </div>

            )}

        </section>

      </div>

      {/* ================================================================ */}
      {/* BILL DETAILS MODAL                                               */}
      {/* ================================================================ */}

      {selectedBill && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedBill(
                null,
              );
            }

          }}
        >

          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* -------------------------------------------------------- */}
            {/* MODAL HEADER                                               */}
            {/* -------------------------------------------------------- */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

              <div>

                <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                  Medical Invoice
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  BILL-
                  {
                    selectedBill.id
                  }
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedBill(
                    null,
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-600 transition hover:bg-slate-200"
                aria-label="Close bill details"
              >
                ×
              </button>

            </div>

            <div className="space-y-8 p-6">

              {/* ------------------------------------------------------ */}
              {/* PATIENT SUMMARY                                          */}
              {/* ------------------------------------------------------ */}

              <div className="grid gap-4 md:grid-cols-4">

                <div className="rounded-2xl bg-slate-50 p-5">

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Patient
                  </p>

                  <p className="mt-2 font-bold text-slate-900">
                    {
                      findPatient(
                        selectedBill.patient_id,
                      )?.name ||
                      `Patient #${selectedBill.patient_id}`
                    }
                  </p>

                </div>

                <div className="rounded-2xl bg-slate-50 p-5">

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Patient ID
                  </p>

                  <p className="mt-2 font-bold text-slate-900">
                    #
                    {
                      selectedBill.patient_id
                    }
                  </p>

                </div>

                <div className="rounded-2xl bg-slate-50 p-5">

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Bill Date
                  </p>

                  <p className="mt-2 font-bold text-slate-900">
                    {
                      selectedBill.bill_date
                    }
                  </p>

                </div>

                <div className="rounded-2xl bg-slate-50 p-5">

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </p>

                  <span
                    className={[
                      "mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold",
                      getStatusClasses(
                        selectedBill.payment_status,
                      ),
                    ].join(
                      " ",
                    )}
                  >
                    {
                      selectedBill.payment_status
                    }
                  </span>

                </div>

              </div>

              {/* ------------------------------------------------------ */}
              {/* SERVICE BREAKDOWN                                        */}
              {/* ------------------------------------------------------ */}

              <div>

                <h3 className="text-xl font-bold text-slate-900">
                  Service Breakdown
                </h3>

                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">

                  <div className="divide-y divide-slate-200">

                    <div className="flex items-center justify-between px-5 py-4">

                      <span className="text-slate-600">
                        Doctor Consultation
                      </span>

                      <span className="font-semibold text-slate-900">
                        {formatCurrency(
                          selectedBill.consultation_amount,
                        )}
                      </span>

                    </div>

                    <div className="flex items-center justify-between px-5 py-4">

                      <span className="text-slate-600">
                        Laboratory Services
                      </span>

                      <span className="font-semibold text-slate-900">
                        {formatCurrency(
                          selectedBill.laboratory_amount,
                        )}
                      </span>

                    </div>

                    <div className="flex items-center justify-between px-5 py-4">

                      <span className="text-slate-600">
                        Medicines
                      </span>

                      <span className="font-semibold text-slate-900">
                        {formatCurrency(
                          selectedBill.medicine_amount,
                        )}
                      </span>

                    </div>

                    <div className="flex items-center justify-between px-5 py-4">

                      <span className="text-slate-600">
                        Procedures
                      </span>

                      <span className="font-semibold text-slate-900">
                        {formatCurrency(
                          selectedBill.procedure_amount,
                        )}
                      </span>

                    </div>

                    <div className="flex items-center justify-between px-5 py-4">

                      <span className="text-slate-600">
                        Other Services
                      </span>

                      <span className="font-semibold text-slate-900">
                        {formatCurrency(
                          selectedBill.other_amount,
                        )}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

              {/* ------------------------------------------------------ */}
              {/* TOTALS                                                   */}
              {/* ------------------------------------------------------ */}

              <div className="rounded-3xl bg-slate-900 p-6 text-white">

                <div className="space-y-4">

                  <div className="flex justify-between gap-5">

                    <span className="text-slate-300">
                      Subtotal
                    </span>

                    <span className="font-semibold">
                      {formatCurrency(
                        selectedBill.subtotal,
                      )}
                    </span>

                  </div>

                  <div className="flex justify-between gap-5">

                    <span className="text-slate-300">
                      Discount
                    </span>

                    <span className="font-semibold text-red-300">
                      -
                      {formatCurrency(
                        selectedBill.discount,
                      )}
                    </span>

                  </div>

                  <div className="flex justify-between gap-5">

                    <span className="text-slate-300">
                      Tax
                    </span>

                    <span className="font-semibold">
                      {formatCurrency(
                        selectedBill.tax,
                      )}
                    </span>

                  </div>

                  <div className="border-t border-slate-700 pt-5">

                    <div className="flex items-center justify-between gap-5">

                      <span className="text-xl font-bold">
                        Grand Total
                      </span>

                      <span className="text-3xl font-bold">
                        {formatCurrency(
                          selectedBill.total_amount,
                        )}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

              {/* ------------------------------------------------------ */}
              {/* PAYMENT INFORMATION                                      */}
              {/* ------------------------------------------------------ */}

              <div className="grid gap-5 md:grid-cols-2">

                <div className="rounded-2xl border border-slate-200 p-5">

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Payment Status
                  </p>

                  <p className="mt-2 font-bold text-slate-900">
                    {
                      selectedBill.payment_status
                    }
                  </p>

                </div>

                <div className="rounded-2xl border border-slate-200 p-5">

                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Transaction ID
                  </p>

                  <p className="mt-2 break-all font-mono text-sm font-semibold text-slate-900">
                    {
                      selectedBill.transaction_id ||
                      "No payment transaction recorded"
                    }
                  </p>

                </div>

              </div>

              {/* ------------------------------------------------------ */}
              {/* MODAL ACTIONS                                            */}
              {/* ------------------------------------------------------ */}

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    setSelectedBill(
                      null,
                    )
                  }
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() =>
                    printBill(
                      selectedBill,
                    )
                  }
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Print Invoice
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}