from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Patient, Doctor, Appointment, MedicalBill
from schemas import (
    PatientCreate,
    DoctorCreate,
    AppointmentCreate,
    MedicalBillCreate,
)


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

# Create all database tables that are defined in models.py.
#
# This is intentionally local and self-contained.
# The application does not connect to an external healthcare API.
#
# Existing tables are not removed when the application starts.
# SQLAlchemy creates only tables that do not already exist.
#
# Current application tables include:
#
#   patients
#   doctors
#   appointments
#   medical_bills
#
Base.metadata.create_all(bind=engine)


# ============================================================
# APPLICATION CONFIGURATION
# ============================================================

app = FastAPI(
    title="MediCare Clinic Management System",
    description=(
        "Local healthcare clinic management backend providing "
        "patient management, doctor management, appointment "
        "management, medical billing, invoice data, and local "
        "payment-status workflows."
    ),
    version="2.0.0",
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

# The frontend currently runs locally on port 3000.
#
# No external frontend domain is required for this project.
#
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# GENERAL APPLICATION HELPERS
# ============================================================


ALLOWED_PAYMENT_STATUSES = {
    "Pending",
    "Paid",
    "Partial",
    "Cancelled",
}


def clean_text(value: Optional[str]) -> str:
    """
    Normalize optional text values before using them.

    This helper prevents accidental leading/trailing whitespace
    from being stored in fields such as names, phone numbers,
    appointment reasons, and status values.
    """

    if value is None:
        return ""

    return value.strip()


def round_money(value: float) -> float:
    """
    Normalize a monetary value to two decimal places.

    The current database model uses Float fields. This helper
    keeps the values presented by the API consistent for the
    clinic's demo billing workflow.

    A future production version can migrate these fields to
    Decimal/Numeric database columns for stronger financial
    precision.
    """

    return round(float(value), 2)


def calculate_bill_totals(
    consultation_amount: float,
    laboratory_amount: float,
    medicine_amount: float,
    procedure_amount: float,
    other_amount: float,
    discount: float,
    tax: float,
):
    """
    Calculate all medical billing totals in one place.

    Calculation sequence:

        service charges
                |
                v
             subtotal
                |
                v
             discount
                |
                v
          taxable amount
                |
                v
               tax
                |
                v
           grand total

    This same calculation structure can be reused by future
    billing features.
    """

    consultation = max(round_money(consultation_amount), 0)
    laboratory = max(round_money(laboratory_amount), 0)
    medicine = max(round_money(medicine_amount), 0)
    procedure = max(round_money(procedure_amount), 0)
    other = max(round_money(other_amount), 0)

    discount_value = max(round_money(discount), 0)
    tax_value = max(round_money(tax), 0)

    subtotal = round_money(
        consultation
        + laboratory
        + medicine
        + procedure
        + other
    )

    taxable_amount = round_money(
        max(subtotal - discount_value, 0)
    )

    total_amount = round_money(
        taxable_amount + tax_value
    )

    return {
        "consultation_amount": consultation,
        "laboratory_amount": laboratory,
        "medicine_amount": medicine,
        "procedure_amount": procedure,
        "other_amount": other,
        "discount": discount_value,
        "tax": tax_value,
        "subtotal": subtotal,
        "taxable_amount": taxable_amount,
        "total_amount": total_amount,
    }


def serialize_patient(patient: Patient) -> dict:
    """
    Convert a Patient database object into a predictable API object.
    """

    return {
        "id": patient.id,
        "name": patient.name,
        "age": patient.age,
        "phone": patient.phone,
    }


def serialize_doctor(doctor: Doctor) -> dict:
    """
    Convert a Doctor database object into a predictable API object.
    """

    return {
        "id": doctor.id,
        "name": doctor.name,
        "specialization": doctor.specialization,
        "phone": doctor.phone,
    }


def serialize_appointment(appointment: Appointment) -> dict:
    """
    Convert an Appointment database object into a predictable API
    object.
    """

    return {
        "id": appointment.id,
        "patient_id": appointment.patient_id,
        "doctor_id": appointment.doctor_id,
        "appointment_date": appointment.appointment_date,
        "appointment_time": appointment.appointment_time,
        "reason": appointment.reason,
    }


def serialize_bill(bill: MedicalBill) -> dict:
    """
    Convert a MedicalBill database object into a complete API object.
    """

    return {
        "id": bill.id,
        "patient_id": bill.patient_id,

        "consultation_amount": round_money(
            bill.consultation_amount
        ),
        "laboratory_amount": round_money(
            bill.laboratory_amount
        ),
        "medicine_amount": round_money(
            bill.medicine_amount
        ),
        "procedure_amount": round_money(
            bill.procedure_amount
        ),
        "other_amount": round_money(
            bill.other_amount
        ),

        "discount": round_money(
            bill.discount
        ),
        "tax": round_money(
            bill.tax
        ),

        "subtotal": round_money(
            bill.subtotal
        ),
        "total_amount": round_money(
            bill.total_amount
        ),

        "payment_status": bill.payment_status,
        "transaction_id": bill.transaction_id,
        "bill_date": bill.bill_date,
    }


# ============================================================
# HOME / HEALTH CHECK
# ============================================================


@app.get("/")
def home():
    """
    Basic API health endpoint.

    This is useful when starting the backend and confirming that
    FastAPI is responding correctly.
    """

    return {
        "message": "Healthcare Clinic Management System API is running",
        "application": "MediCare Clinic Management System",
        "version": "2.0.0",
        "environment": "local",
        "external_apis": False,
    }


@app.get("/health")
def health_check():
    """
    Dedicated backend health-check endpoint.
    """

    return {
        "status": "healthy",
        "service": "MediCare Clinic Backend",
        "database": "configured",
        "timestamp": datetime.now().isoformat(),
    }


# ============================================================
# PATIENT MANAGEMENT
# ============================================================


@app.get("/patients")
def get_patients(
    db: Session = Depends(get_db),
):
    """
    Return all registered clinic patients.
    """

    patients = (
        db.query(Patient)
        .order_by(Patient.id.asc())
        .all()
    )

    return {
        "patients": [
            serialize_patient(patient)
            for patient in patients
        ]
    }


@app.get("/patients/{patient_id}")
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
):
    """
    Return one patient by database ID.
    """

    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    return {
        "patient": serialize_patient(patient)
    }


@app.post("/patients")
def create_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new patient.
    """

    patient_name = clean_text(patient.name)
    patient_phone = clean_text(patient.phone)

    if not patient_name:
        raise HTTPException(
            status_code=400,
            detail="Patient name cannot be empty",
        )

    if patient.age < 0:
        raise HTTPException(
            status_code=400,
            detail="Patient age cannot be negative",
        )

    if not patient_phone:
        raise HTTPException(
            status_code=400,
            detail="Patient phone cannot be empty",
        )

    new_patient = Patient(
        name=patient_name,
        age=patient.age,
        phone=patient_phone,
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return {
        "message": "Patient created successfully",
        "patient": serialize_patient(new_patient),
    }


@app.delete("/patients/{patient_id}")
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
):
    """
    Delete a patient.

    The application currently uses explicit deletion rather than
    automatic cascading deletion of historical billing records.
    """

    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    linked_bill = (
        db.query(MedicalBill)
        .filter(MedicalBill.patient_id == patient_id)
        .first()
    )

    if linked_bill:
        raise HTTPException(
            status_code=409,
            detail=(
                "Patient cannot be deleted because medical billing "
                "records are linked to this patient."
            ),
        )

    db.delete(patient)
    db.commit()

    return {
        "message": "Patient deleted successfully",
        "patient_id": patient_id,
    }


# ============================================================
# DOCTOR MANAGEMENT
# ============================================================


@app.get("/doctors")
def get_doctors(
    db: Session = Depends(get_db),
):
    """
    Return all doctors.
    """

    doctors = (
        db.query(Doctor)
        .order_by(Doctor.id.asc())
        .all()
    )

    return {
        "doctors": [
            serialize_doctor(doctor)
            for doctor in doctors
        ]
    }


@app.get("/doctors/{doctor_id}")
def get_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
):
    """
    Return one doctor by ID.
    """

    doctor = (
        db.query(Doctor)
        .filter(Doctor.id == doctor_id)
        .first()
    )

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found",
        )

    return {
        "doctor": serialize_doctor(doctor)
    }


@app.post("/doctors")
def create_doctor(
    doctor: DoctorCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new doctor record.
    """

    doctor_name = clean_text(doctor.name)
    specialization = clean_text(doctor.specialization)
    doctor_phone = clean_text(doctor.phone)

    if not doctor_name:
        raise HTTPException(
            status_code=400,
            detail="Doctor name cannot be empty",
        )

    if not specialization:
        raise HTTPException(
            status_code=400,
            detail="Doctor specialization cannot be empty",
        )

    if not doctor_phone:
        raise HTTPException(
            status_code=400,
            detail="Doctor phone cannot be empty",
        )

    new_doctor = Doctor(
        name=doctor_name,
        specialization=specialization,
        phone=doctor_phone,
    )

    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)

    return {
        "message": "Doctor created successfully",
        "doctor": serialize_doctor(new_doctor),
    }


@app.delete("/doctors/{doctor_id}")
def delete_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
):
    """
    Delete a doctor if no appointment is currently linked to them.
    """

    doctor = (
        db.query(Doctor)
        .filter(Doctor.id == doctor_id)
        .first()
    )

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found",
        )

    linked_appointment = (
        db.query(Appointment)
        .filter(Appointment.doctor_id == doctor_id)
        .first()
    )

    if linked_appointment:
        raise HTTPException(
            status_code=409,
            detail=(
                "Doctor cannot be deleted because appointments "
                "are linked to this doctor."
            ),
        )

    db.delete(doctor)
    db.commit()

    return {
        "message": "Doctor deleted successfully",
        "doctor_id": doctor_id,
    }


# ============================================================
# APPOINTMENT MANAGEMENT
# ============================================================


@app.get("/appointments")
def get_appointments(
    db: Session = Depends(get_db),
):
    """
    Return all appointments.
    """

    appointments = (
        db.query(Appointment)
        .order_by(
            Appointment.appointment_date.asc(),
            Appointment.appointment_time.asc(),
            Appointment.id.asc(),
        )
        .all()
    )

    return {
        "appointments": [
            serialize_appointment(appointment)
            for appointment in appointments
        ]
    }


@app.get("/appointments/{appointment_id}")
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
):
    """
    Return a single appointment.
    """

    appointment = (
        db.query(Appointment)
        .filter(Appointment.id == appointment_id)
        .first()
    )

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found",
        )

    return {
        "appointment": serialize_appointment(
            appointment
        )
    }


@app.post("/appointments")
def create_appointment(
    appointment: AppointmentCreate,
    db: Session = Depends(get_db),
):
    """
    Create an appointment after verifying that both the patient
    and doctor exist.
    """

    patient = (
        db.query(Patient)
        .filter(Patient.id == appointment.patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    doctor = (
        db.query(Doctor)
        .filter(Doctor.id == appointment.doctor_id)
        .first()
    )

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found",
        )

    appointment_date = clean_text(
        appointment.appointment_date
    )

    appointment_time = clean_text(
        appointment.appointment_time
    )

    reason = clean_text(
        appointment.reason
    )

    if not appointment_date:
        raise HTTPException(
            status_code=400,
            detail="Appointment date cannot be empty",
        )

    if not appointment_time:
        raise HTTPException(
            status_code=400,
            detail="Appointment time cannot be empty",
        )

    if not reason:
        raise HTTPException(
            status_code=400,
            detail="Appointment reason cannot be empty",
        )

    new_appointment = Appointment(
        patient_id=appointment.patient_id,
        doctor_id=appointment.doctor_id,
        appointment_date=appointment_date,
        appointment_time=appointment_time,
        reason=reason,
    )

    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)

    return {
        "message": "Appointment created successfully",
        "appointment": serialize_appointment(
            new_appointment
        ),
    }


@app.delete("/appointments/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
):
    """
    Delete an appointment.
    """

    appointment = (
        db.query(Appointment)
        .filter(Appointment.id == appointment_id)
        .first()
    )

    if not appointment:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found",
        )

    db.delete(appointment)
    db.commit()

    return {
        "message": "Appointment deleted successfully",
        "appointment_id": appointment_id,
    }


# ============================================================
# MEDICAL BILLING
# ============================================================


@app.get("/bills")
def get_bills(
    status: Optional[str] = Query(
        default=None,
        description=(
            "Optional payment status filter: "
            "Pending, Paid, Partial, or Cancelled"
        ),
    ),
    patient_id: Optional[int] = Query(
        default=None,
        description="Optional patient ID filter",
    ),
    db: Session = Depends(get_db),
):
    """
    Return medical bills.

    Optional filters make this endpoint useful for the billing
    dashboard, patient billing history, and future reporting
    features.
    """

    query = db.query(MedicalBill)

    if status:
        normalized_status = clean_text(status)

        if normalized_status not in ALLOWED_PAYMENT_STATUSES:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid payment status. Allowed values are: "
                    "Pending, Paid, Partial, Cancelled."
                ),
            )

        query = query.filter(
            MedicalBill.payment_status == normalized_status
        )

    if patient_id is not None:
        query = query.filter(
            MedicalBill.patient_id == patient_id
        )

    bills = (
        query
        .order_by(MedicalBill.id.asc())
        .all()
    )

    return {
        "bills": [
            serialize_bill(bill)
            for bill in bills
        ]
    }


@app.post("/bills")
def create_bill(
    bill: MedicalBillCreate,
    db: Session = Depends(get_db),
):
    """
    Create a medical bill.

    The backend independently calculates:

        subtotal
        discount
        taxable amount
        tax
        total amount

    This prevents the frontend preview from being the sole source
    of financial calculations.
    """

    patient = (
        db.query(Patient)
        .filter(Patient.id == bill.patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    bill_date = clean_text(bill.bill_date)

    if not bill_date:
        raise HTTPException(
            status_code=400,
            detail="Bill date cannot be empty",
        )

    calculated = calculate_bill_totals(
        consultation_amount=bill.consultation_amount,
        laboratory_amount=bill.laboratory_amount,
        medicine_amount=bill.medicine_amount,
        procedure_amount=bill.procedure_amount,
        other_amount=bill.other_amount,
        discount=bill.discount,
        tax=bill.tax,
    )

    new_bill = MedicalBill(
        patient_id=bill.patient_id,

        consultation_amount=calculated[
            "consultation_amount"
        ],
        laboratory_amount=calculated[
            "laboratory_amount"
        ],
        medicine_amount=calculated[
            "medicine_amount"
        ],
        procedure_amount=calculated[
            "procedure_amount"
        ],
        other_amount=calculated[
            "other_amount"
        ],

        discount=calculated["discount"],
        tax=calculated["tax"],

        subtotal=calculated["subtotal"],
        total_amount=calculated["total_amount"],

        payment_status="Pending",
        transaction_id=None,

        bill_date=bill_date,
    )

    db.add(new_bill)
    db.commit()
    db.refresh(new_bill)

    return {
        "message": "Medical bill created successfully",
        "bill": serialize_bill(new_bill),
    }


@app.get("/bills/{bill_id}")
def get_bill(
    bill_id: int,
    db: Session = Depends(get_db),
):
    """
    Return one complete medical bill.
    """

    bill = (
        db.query(MedicalBill)
        .filter(MedicalBill.id == bill_id)
        .first()
    )

    if not bill:
        raise HTTPException(
            status_code=404,
            detail="Medical bill not found",
        )

    return {
        "bill": serialize_bill(bill)
    }


# ============================================================
# BILL PAYMENT STATUS MANAGEMENT
# ============================================================


@app.put("/bills/{bill_id}/payment-status")
def update_bill_payment_status(
    bill_id: int,
    payment_status: str = Query(
        ...,
        description=(
            "New status: Pending, Paid, Partial, or Cancelled"
        ),
    ),
    db: Session = Depends(get_db),
):
    """
    Update the payment status of an existing medical bill.

    This is a local payment-management workflow.

    It does NOT connect to PhonePe, Stripe, Razorpay, banks,
    or another external payment provider.

    That keeps the current project within the local/no-external-
    API architecture.
    """

    normalized_status = clean_text(
        payment_status
    )

    if normalized_status not in ALLOWED_PAYMENT_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid payment status. Allowed values are: "
                "Pending, Paid, Partial, Cancelled."
            ),
        )

    bill = (
        db.query(MedicalBill)
        .filter(MedicalBill.id == bill_id)
        .first()
    )

    if not bill:
        raise HTTPException(
            status_code=404,
            detail="Medical bill not found",
        )

    # A cancelled bill cannot be marked as paid without first
    # returning it to an active status.
    if (
        bill.payment_status == "Cancelled"
        and normalized_status == "Paid"
    ):
        raise HTTPException(
            status_code=409,
            detail=(
                "A cancelled bill cannot be directly marked as Paid."
            ),
        )

    bill.payment_status = normalized_status

    # This demo system does not generate external transaction IDs.
    # Existing transaction information is preserved if present.
    if normalized_status == "Pending":
        bill.transaction_id = None

    db.commit()
    db.refresh(bill)

    return {
        "message": "Payment status updated successfully",
        "bill": serialize_bill(bill),
    }


# ============================================================
# BILL PAYMENT ACTIONS
# ============================================================


@app.put("/bills/{bill_id}/mark-paid")
def mark_bill_as_paid(
    bill_id: int,
    db: Session = Depends(get_db),
):
    """
    Convenience endpoint for marking a bill as paid.

    This is a local/demo action and does not process an actual
    financial transaction.
    """

    bill = (
        db.query(MedicalBill)
        .filter(MedicalBill.id == bill_id)
        .first()
    )

    if not bill:
        raise HTTPException(
            status_code=404,
            detail="Medical bill not found",
        )

    if bill.payment_status == "Cancelled":
        raise HTTPException(
            status_code=409,
            detail=(
                "Cancelled bills cannot be marked as Paid."
            ),
        )

    bill.payment_status = "Paid"

    db.commit()
    db.refresh(bill)

    return {
        "message": "Medical bill marked as paid",
        "payment_processed": False,
        "payment_mode": "local_demo",
        "bill": serialize_bill(bill),
    }


@app.put("/bills/{bill_id}/mark-partial")
def mark_bill_as_partial(
    bill_id: int,
    db: Session = Depends(get_db),
):
    """
    Mark a bill as partially paid.

    The current database schema does not contain a separate
    paid_amount column, so this endpoint records the status only.
    A future billing enhancement can add detailed payment
    allocation records.
    """

    bill = (
        db.query(MedicalBill)
        .filter(MedicalBill.id == bill_id)
        .first()
    )

    if not bill:
        raise HTTPException(
            status_code=404,
            detail="Medical bill not found",
        )

    if bill.payment_status == "Cancelled":
        raise HTTPException(
            status_code=409,
            detail=(
                "Cancelled bills cannot be marked as Partial."
            ),
        )

    bill.payment_status = "Partial"

    db.commit()
    db.refresh(bill)

    return {
        "message": "Medical bill marked as partially paid",
        "payment_processed": False,
        "payment_mode": "local_demo",
        "bill": serialize_bill(bill),
    }


@app.put("/bills/{bill_id}/cancel")
def cancel_bill(
    bill_id: int,
    db: Session = Depends(get_db),
):
    """
    Cancel an existing bill.

    Cancellation is represented through the payment_status field
    in the current schema.
    """

    bill = (
        db.query(MedicalBill)
        .filter(MedicalBill.id == bill_id)
        .first()
    )

    if not bill:
        raise HTTPException(
            status_code=404,
            detail="Medical bill not found",
        )

    if bill.payment_status == "Paid":
        raise HTTPException(
            status_code=409,
            detail=(
                "A paid bill cannot be cancelled through this "
                "simple status workflow."
            ),
        )

    bill.payment_status = "Cancelled"

    db.commit()
    db.refresh(bill)

    return {
        "message": "Medical bill cancelled successfully",
        "bill": serialize_bill(bill),
    }


# ============================================================
# BILL SEARCH
# ============================================================


@app.get("/billing/search")
def search_bills(
    query: str = Query(
        ...,
        min_length=1,
        description=(
            "Search by patient ID, bill ID, status, or transaction ID"
        ),
    ),
    db: Session = Depends(get_db),
):
    """
    Search billing records.

    The search is intentionally local and works directly against
    the application's PostgreSQL database.
    """

    search_text = clean_text(query)

    if not search_text:
        raise HTTPException(
            status_code=400,
            detail="Search query cannot be empty",
        )

    bills = (
        db.query(MedicalBill)
        .order_by(MedicalBill.id.asc())
        .all()
    )

    matched_bills = []

    for bill in bills:
        bill_id_text = str(bill.id)
        patient_id_text = str(bill.patient_id)
        status_text = bill.payment_status or ""
        transaction_text = bill.transaction_id or ""

        if (
            search_text.lower() in bill_id_text.lower()
            or search_text.lower() in patient_id_text.lower()
            or search_text.lower() in status_text.lower()
            or search_text.lower() in transaction_text.lower()
        ):
            matched_bills.append(
                serialize_bill(bill)
            )

    return {
        "query": search_text,
        "count": len(matched_bills),
        "bills": matched_bills,
    }


# ============================================================
# BILLING SUMMARY
# ============================================================


@app.get("/billing/summary")
def get_billing_summary(
    db: Session = Depends(get_db),
):
    """
    Return billing dashboard statistics.

    These values are calculated from current database records,
    allowing the frontend to build dashboard cards without
    duplicating billing aggregation logic.
    """

    bills = (
        db.query(MedicalBill)
        .order_by(MedicalBill.id.asc())
        .all()
    )

    total_bills = len(bills)

    pending_amount = 0.0
    paid_amount = 0.0
    partial_amount = 0.0
    cancelled_amount = 0.0
    total_billed = 0.0

    pending_count = 0
    paid_count = 0
    partial_count = 0
    cancelled_count = 0

    for bill in bills:
        amount = round_money(
            bill.total_amount
        )

        status = bill.payment_status

        if status == "Pending":
            pending_amount += amount
            pending_count += 1

        elif status == "Paid":
            paid_amount += amount
            paid_count += 1

        elif status == "Partial":
            partial_amount += amount
            partial_count += 1

        elif status == "Cancelled":
            cancelled_amount += amount
            cancelled_count += 1

        total_billed += amount

    return {
        "total_bills": total_bills,

        "pending_amount": round_money(
            pending_amount
        ),
        "paid_amount": round_money(
            paid_amount
        ),
        "partial_amount": round_money(
            partial_amount
        ),
        "cancelled_amount": round_money(
            cancelled_amount
        ),

        "total_billed": round_money(
            total_billed
        ),

        "pending_count": pending_count,
        "paid_count": paid_count,
        "partial_count": partial_count,
        "cancelled_count": cancelled_count,
    }


# ============================================================
# PATIENT BILLING HISTORY
# ============================================================


@app.get("/patients/{patient_id}/bills")
def get_patient_billing_history(
    patient_id: int,
    db: Session = Depends(get_db),
):
    """
    Return all billing records associated with a patient.
    """

    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    bills = (
        db.query(MedicalBill)
        .filter(MedicalBill.patient_id == patient_id)
        .order_by(MedicalBill.id.desc())
        .all()
    )

    total_value = 0.0

    for bill in bills:
        total_value += round_money(
            bill.total_amount
        )

    return {
        "patient": serialize_patient(patient),
        "count": len(bills),
        "total_billed": round_money(
            total_value
        ),
        "bills": [
            serialize_bill(bill)
            for bill in bills
        ],
    }


# ============================================================
# BILL INVOICE DATA
# ============================================================


@app.get("/bills/{bill_id}/invoice")
def get_bill_invoice(
    bill_id: int,
    db: Session = Depends(get_db),
):
    """
    Return structured invoice information.

    The frontend can use this response to create a printable
    invoice without requiring an external invoice service.
    """

    bill = (
        db.query(MedicalBill)
        .filter(MedicalBill.id == bill_id)
        .first()
    )

    if not bill:
        raise HTTPException(
            status_code=404,
            detail="Medical bill not found",
        )

    patient = (
        db.query(Patient)
        .filter(Patient.id == bill.patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient associated with this bill was not found",
        )

    return {
        "invoice": {
            "invoice_number": f"BILL-{bill.id}",
            "bill_id": bill.id,
            "bill_date": bill.bill_date,

            "clinic": {
                "name": "MediCare Clinic",
                "type": "Healthcare Clinic",
                "environment": "Demo / Local",
            },

            "patient": serialize_patient(
                patient
            ),

            "services": {
                "doctor_consultation": round_money(
                    bill.consultation_amount
                ),
                "laboratory_services": round_money(
                    bill.laboratory_amount
                ),
                "medicines": round_money(
                    bill.medicine_amount
                ),
                "procedures": round_money(
                    bill.procedure_amount
                ),
                "other_services": round_money(
                    bill.other_amount
                ),
            },

            "billing": {
                "subtotal": round_money(
                    bill.subtotal
                ),
                "discount": round_money(
                    bill.discount
                ),
                "tax": round_money(
                    bill.tax
                ),
                "total_amount": round_money(
                    bill.total_amount
                ),
            },

            "payment": {
                "status": bill.payment_status,
                "transaction_id": bill.transaction_id,
                "external_payment_processed": False,
            },
        }
    }


# ============================================================
# BILL DELETE
# ============================================================


@app.delete("/bills/{bill_id}")
def delete_bill(
    bill_id: int,
    db: Session = Depends(get_db),
):
    """
    Delete a medical bill.

    This endpoint remains available for demo/test data cleanup.

    A future production billing system should generally use
    controlled cancellation/voiding instead of physically
    deleting financial records.
    """

    bill = (
        db.query(MedicalBill)
        .filter(MedicalBill.id == bill_id)
        .first()
    )

    if not bill:
        raise HTTPException(
            status_code=404,
            detail="Medical bill not found",
        )

    deleted_bill_id = bill.id

    db.delete(bill)
    db.commit()

    return {
        "message": "Medical bill deleted successfully",
        "bill_id": deleted_bill_id,
    }


# ============================================================
# APPLICATION INFORMATION
# ============================================================


@app.get("/system/info")
def system_information():
    """
    Return basic information about the backend architecture.

    This endpoint does not expose credentials, database passwords,
    environment variables, or other sensitive configuration.
    """

    return {
        "application": "MediCare Clinic Management System",
        "backend": "FastAPI",
        "database": "PostgreSQL",
        "deployment": "Local development",
        "external_healthcare_apis": False,
        "external_payment_apis": False,
        "supported_modules": [
            "Patient Management",
            "Doctor Management",
            "Appointment Management",
            "Medical Billing",
            "Payment Status Management",
            "Billing Search",
            "Billing Summary",
            "Patient Billing History",
            "Printable Invoice Data",
        ],
    }


# ============================================================
# END OF APPLICATION
# ============================================================