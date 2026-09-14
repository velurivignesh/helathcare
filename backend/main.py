from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Query, Header, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import (
    Patient,
    Doctor,
    Appointment,
    MedicalBill,
    Department,
    Room,
    Bed,
    Admission,
    DischargeSummary,
    LabTestCategory,
    LabTest,
    LabOrder,
    LabOrderItem,
    LabSample,
    LabResult,
    LabReport,
)
from schemas import (
    PatientCreate,
    DoctorCreate,
    AppointmentCreate,
    MedicalBillCreate,
    DepartmentCreate,
    RoomCreate,
    BedCreate,
    BedUpdateStatus,
    AdmissionCreate,
    AdmissionTransfer,
    AdmissionDischarge,
    DischargeSummaryCreate,
    LabTestCategoryCreate,
    LabTestCreate,
    LabOrderCreate,
    LabSampleCollect,
    LabResultEntry,
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
# AUTH DEPENDENCY (placeholder – replace with real JWT in prod)
# ============================================================


def auth_dep(authorization: Optional[str] = Header(None)) -> str:
    """
    Simple placeholder authentication dependency.
    Expects an `Authorization: Bearer <token>` header.
    Raises HTTP 401 if the header is missing or malformed.
    Replace the body with real token validation for production.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized – Bearer token required")
    return authorization.split(" ", 1)[1]


# ============================================================
# APPLICATION CONFIGURATION
# ============================================================

app = FastAPI(
    title="MediCare Clinic Management System",
    description=(
        "FastAPI-only healthcare clinic management backend. "
        "Provides patient management, doctor management, appointment "
        "scheduling, medical billing, inpatient management, and a "
        "full Laboratory Information System (LIS)."
    ),
    version="3.0.0",
    dependencies=[Depends(auth_dep)],
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


def serialize_department(department: Department) -> dict:
    return {
        "id": department.id,
        "department_code": department.department_code,
        "name": department.name,
        "description": department.description,
        "floor": department.floor,
        "building": department.building,
        "phone": department.phone,
        "email": department.email,
        "head_doctor_id": department.head_doctor_id,
        "status": department.status,
    }


def serialize_room(room: Room, db: Optional[Session] = None) -> dict:
    dept_name = None
    if db and room.department_id:
        dept = db.query(Department).filter(Department.id == room.department_id).first()
        if dept:
            dept_name = dept.name

    return {
        "id": room.id,
        "room_number": room.room_number,
        "room_type": room.room_type,
        "department_id": room.department_id,
        "department_name": dept_name,
        "floor": room.floor,
        "building": room.building,
        "capacity": room.capacity,
        "occupied_count": room.occupied_count,
        "daily_rate": round_money(room.daily_rate),
        "status": room.status,
        "notes": room.notes,
    }


def serialize_bed(bed: Bed, db: Optional[Session] = None) -> dict:
    room_number = None
    room_type = None
    daily_rate = 0.0
    dept_name = None
    current_patient_name = None
    admission_id = None

    if db:
        room = db.query(Room).filter(Room.id == bed.room_id).first()
        if room:
            room_number = room.room_number
            room_type = room.room_type
            daily_rate = round_money(room.daily_rate)
            if room.department_id:
                dept = db.query(Department).filter(Department.id == room.department_id).first()
                if dept:
                    dept_name = dept.name

        if bed.status == "Occupied":
            adm = (
                db.query(Admission)
                .filter(Admission.bed_id == bed.id, Admission.status == "Admitted")
                .first()
            )
            if adm:
                admission_id = adm.id
                patient = db.query(Patient).filter(Patient.id == adm.patient_id).first()
                if patient:
                    current_patient_name = patient.name

    return {
        "id": bed.id,
        "room_id": bed.room_id,
        "room_number": room_number,
        "room_type": room_type,
        "daily_rate": daily_rate,
        "department_name": dept_name,
        "bed_number": bed.bed_number,
        "bed_type": bed.bed_type,
        "status": bed.status,
        "notes": bed.notes,
        "current_patient_name": current_patient_name,
        "admission_id": admission_id,
    }


def serialize_admission(admission: Admission, db: Optional[Session] = None) -> dict:
    patient_name = None
    patient_phone = None
    patient_age = None
    doctor_name = None
    doctor_spec = None
    room_number = None
    bed_number = None
    department_name = None

    if db:
        patient = db.query(Patient).filter(Patient.id == admission.patient_id).first()
        if patient:
            patient_name = patient.name
            patient_phone = patient.phone
            patient_age = patient.age

        if admission.admitting_doctor_id:
            doctor = db.query(Doctor).filter(Doctor.id == admission.admitting_doctor_id).first()
            if doctor:
                doctor_name = doctor.name
                doctor_spec = doctor.specialization

        if admission.room_id:
            room = db.query(Room).filter(Room.id == admission.room_id).first()
            if room:
                room_number = room.room_number
                if room.department_id:
                    dept = db.query(Department).filter(Department.id == room.department_id).first()
                    if dept:
                        department_name = dept.name

        if admission.bed_id:
            bed = db.query(Bed).filter(Bed.id == admission.bed_id).first()
            if bed:
                bed_number = bed.bed_number

    return {
        "id": admission.id,
        "admission_number": admission.admission_number,
        "patient_id": admission.patient_id,
        "patient_name": patient_name,
        "patient_phone": patient_phone,
        "patient_age": patient_age,
        "admitting_doctor_id": admission.admitting_doctor_id,
        "doctor_name": doctor_name,
        "doctor_specialization": doctor_spec,
        "room_id": admission.room_id,
        "room_number": room_number,
        "department_name": department_name,
        "bed_id": admission.bed_id,
        "bed_number": bed_number,
        "admission_date": admission.admission_date,
        "admission_time": admission.admission_time,
        "admission_type": admission.admission_type,
        "admission_reason": admission.admission_reason,
        "diagnosis_at_admission": admission.diagnosis_at_admission,
        "expected_discharge_date": admission.expected_discharge_date,
        "actual_discharge_date": admission.actual_discharge_date,
        "status": admission.status,
        "discharge_reason": admission.discharge_reason,
        "notes": admission.notes,
    }


def serialize_discharge_summary(summary: DischargeSummary, db: Optional[Session] = None) -> dict:
    patient_name = None
    doctor_name = None

    if db:
        patient = db.query(Patient).filter(Patient.id == summary.patient_id).first()
        if patient:
            patient_name = patient.name
        if summary.doctor_id:
            doc = db.query(Doctor).filter(Doctor.id == summary.doctor_id).first()
            if doc:
                doctor_name = doc.name

    return {
        "id": summary.id,
        "admission_id": summary.admission_id,
        "patient_id": summary.patient_id,
        "patient_name": patient_name,
        "doctor_id": summary.doctor_id,
        "doctor_name": doctor_name,
        "discharge_date": summary.discharge_date,
        "final_diagnosis": summary.final_diagnosis,
        "hospital_course": summary.hospital_course,
        "procedures_performed": summary.procedures_performed,
        "medications_at_discharge": summary.medications_at_discharge,
        "follow_up_instructions": summary.follow_up_instructions,
        "warning_signs": summary.warning_signs,
        "doctor_notes": summary.doctor_notes,
    }


def serialize_lab_category(cat: LabTestCategory) -> dict:
    return {
        "id": cat.id,
        "category_code": cat.category_code,
        "name": cat.name,
        "description": cat.description,
        "department": cat.department,
        "display_order": cat.display_order,
        "status": cat.status,
    }


def serialize_lab_test(test: LabTest, db: Optional[Session] = None) -> dict:
    category_name = None
    if db and test.category_id:
        c = db.query(LabTestCategory).filter(LabTestCategory.id == test.category_id).first()
        if c:
            category_name = c.name

    return {
        "id": test.id,
        "test_code": test.test_code,
        "test_name": test.test_name,
        "category_id": test.category_id,
        "category_name": category_name,
        "description": test.description,
        "specimen_type": test.specimen_type,
        "specimen_container": test.specimen_container,
        "fasting_required": test.fasting_required,
        "preparation_instructions": test.preparation_instructions,
        "result_type": test.result_type,
        "unit": test.unit,
        "reference_range": test.reference_range,
        "critical_low_value": test.critical_low_value,
        "critical_high_value": test.critical_high_value,
        "turnaround_time_hours": test.turnaround_time_hours,
        "price": round_money(test.price),
        "status": test.status,
    }


def serialize_lab_result(res: LabResult, db: Optional[Session] = None) -> dict:
    test_name = None
    test_code = None
    if db:
        t = db.query(LabTest).filter(LabTest.id == res.lab_test_id).first()
        if t:
            test_name = t.test_name
            test_code = t.test_code

    return {
        "id": res.id,
        "lab_order_item_id": res.lab_order_item_id,
        "lab_test_id": res.lab_test_id,
        "test_code": test_code,
        "test_name": test_name,
        "patient_id": res.patient_id,
        "result_value": res.result_value,
        "result_numeric_value": res.result_numeric_value,
        "result_text": res.result_text,
        "unit": res.unit,
        "reference_range": res.reference_range,
        "abnormal_flag": res.abnormal_flag,
        "critical_flag": res.critical_flag,
        "interpretation": res.interpretation,
        "technician_notes": res.technician_notes,
        "performed_by": res.performed_by,
        "result_date": res.result_date,
        "result_time": res.result_time,
        "verification_status": res.verification_status,
        "verified_by": res.verified_by,
        "status": res.status,
    }


def serialize_lab_order_item(item: LabOrderItem, db: Optional[Session] = None) -> dict:
    test_name = None
    test_code = None
    unit = None
    reference_range = None
    if db:
        t = db.query(LabTest).filter(LabTest.id == item.lab_test_id).first()
        if t:
            test_name = t.test_name
            test_code = t.test_code
            unit = t.unit
            reference_range = t.reference_range

    result_data = None
    if db:
        r = db.query(LabResult).filter(LabResult.lab_order_item_id == item.id).first()
        if r:
            result_data = serialize_lab_result(r, db)

    return {
        "id": item.id,
        "lab_order_id": item.lab_order_id,
        "lab_test_id": item.lab_test_id,
        "test_code": test_code,
        "test_name": test_name,
        "unit": unit,
        "reference_range": reference_range,
        "requested_price": round_money(item.requested_price),
        "specimen_type": item.specimen_type,
        "status": item.status,
        "result": result_data,
    }


def serialize_lab_order(order: LabOrder, db: Optional[Session] = None) -> dict:
    patient_name = None
    patient_age = None
    patient_phone = None
    doctor_name = None
    items = []

    if db:
        p = db.query(Patient).filter(Patient.id == order.patient_id).first()
        if p:
            patient_name = p.name
            patient_age = p.age
            patient_phone = p.phone

        if order.doctor_id:
            d = db.query(Doctor).filter(Doctor.id == order.doctor_id).first()
            if d:
                doctor_name = d.name

        order_items = db.query(LabOrderItem).filter(LabOrderItem.lab_order_id == order.id).all()
        items = [serialize_lab_order_item(it, db) for it in order_items]

    return {
        "id": order.id,
        "order_number": order.order_number,
        "patient_id": order.patient_id,
        "patient_name": patient_name,
        "patient_age": patient_age,
        "patient_phone": patient_phone,
        "doctor_id": order.doctor_id,
        "doctor_name": doctor_name,
        "order_date": order.order_date,
        "priority": order.priority,
        "clinical_notes": order.clinical_notes,
        "diagnosis_notes": order.diagnosis_notes,
        "status": order.status,
        "collection_status": order.collection_status,
        "billing_status": order.billing_status,
        "total_amount": round_money(order.total_amount),
        "items": items,
    }


def serialize_lab_report(report: LabReport, db: Optional[Session] = None) -> dict:
    patient_name = None
    patient_age = None
    patient_phone = None
    doctor_name = None
    order_number = None
    results = []

    if db:
        p = db.query(Patient).filter(Patient.id == report.patient_id).first()
        if p:
            patient_name = p.name
            patient_age = p.age
            patient_phone = p.phone

        if report.doctor_id:
            d = db.query(Doctor).filter(Doctor.id == report.doctor_id).first()
            if d:
                doctor_name = d.name

        ord_obj = db.query(LabOrder).filter(LabOrder.id == report.lab_order_id).first()
        if ord_obj:
            order_number = ord_obj.order_number
            items = db.query(LabOrderItem).filter(LabOrderItem.lab_order_id == ord_obj.id).all()
            for it in items:
                r = db.query(LabResult).filter(LabResult.lab_order_item_id == it.id).first()
                if r:
                    results.append(serialize_lab_result(r, db))

    return {
        "id": report.id,
        "report_number": report.report_number,
        "lab_order_id": report.lab_order_id,
        "order_number": order_number,
        "patient_id": report.patient_id,
        "patient_name": patient_name,
        "patient_age": patient_age,
        "patient_phone": patient_phone,
        "doctor_id": report.doctor_id,
        "doctor_name": doctor_name,
        "report_title": report.report_title,
        "report_summary": report.report_summary,
        "clinical_interpretation": report.clinical_interpretation,
        "abnormal_result_count": report.abnormal_result_count,
        "critical_result_count": report.critical_result_count,
        "generated_date": report.generated_date,
        "verified_date": report.verified_date,
        "verified_by": report.verified_by,
        "status": report.status,
        "results": results,
    }


def evaluate_lab_result(numeric_val: Optional[float], test: LabTest):
    abnormal_flag = "Normal"
    critical_flag = "Normal"

    if numeric_val is not None:
        if test.critical_low_value is not None:
            try:
                if numeric_val <= float(test.critical_low_value):
                    critical_flag = "Critical Low"
                    abnormal_flag = "Low"
            except ValueError:
                pass

        if test.critical_high_value is not None:
            try:
                if numeric_val >= float(test.critical_high_value):
                    critical_flag = "Critical High"
                    abnormal_flag = "High"
            except ValueError:
                pass

        if critical_flag == "Normal" and test.reference_range:
            parts = test.reference_range.replace(" ", "").split("-")
            if len(parts) == 2:
                try:
                    low = float(parts[0])
                    high = float(parts[1])
                    if numeric_val < low:
                        abnormal_flag = "Low"
                    elif numeric_val > high:
                        abnormal_flag = "High"
                except ValueError:
                    pass

    return abnormal_flag, critical_flag


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
# INPATIENT & BED MANAGEMENT (ADT) ENDPOINTS
# ============================================================

@app.get("/departments")
def get_departments(db: Session = Depends(get_db)):
    """Return all hospital departments."""
    departments = db.query(Department).order_by(Department.id.asc()).all()
    return {"departments": [serialize_department(d) for d in departments]}


@app.post("/departments")
def create_department(payload: DepartmentCreate, db: Session = Depends(get_db)):
    """Create a new hospital department."""
    clean_name = clean_text(payload.name)
    if not clean_name:
        raise HTTPException(status_code=400, detail="Department name is required.")

    code = payload.department_code or f"DEPT-{clean_name[:4].upper()}"
    dept = Department(
        name=clean_name,
        department_code=code,
        description=payload.description,
        floor=payload.floor,
        building=payload.building,
        phone=payload.phone,
        email=payload.email,
        head_doctor_id=payload.head_doctor_id,
        status=payload.status or "Active",
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return {"message": "Department created successfully.", "department": serialize_department(dept)}


@app.get("/rooms")
def get_rooms(
    department_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """Return hospital rooms with optional department filter."""
    query = db.query(Room)
    if department_id is not None:
        query = query.filter(Room.department_id == department_id)
    rooms = query.order_by(Room.room_number.asc()).all()
    return {"rooms": [serialize_room(r, db) for r in rooms]}


@app.post("/rooms")
def create_room(payload: RoomCreate, db: Session = Depends(get_db)):
    """Register a new hospital room."""
    clean_number = clean_text(payload.room_number)
    if not clean_number:
        raise HTTPException(status_code=400, detail="Room number is required.")

    existing = db.query(Room).filter(Room.room_number == clean_number).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Room {clean_number} already exists.")

    room = Room(
        room_number=clean_number,
        room_type=clean_text(payload.room_type) or "General",
        department_id=payload.department_id,
        floor=payload.floor,
        building=payload.building,
        capacity=payload.capacity,
        occupied_count=0,
        daily_rate=round_money(payload.daily_rate),
        status=payload.status or "Available",
        notes=payload.notes,
    )
    db.add(room)
    db.commit()
    db.refresh(room)
    return {"message": "Room created successfully.", "room": serialize_room(room, db)}


@app.get("/beds")
def get_beds(
    room_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Return hospital beds with optional room and status filters."""
    query = db.query(Bed)
    if room_id is not None:
        query = query.filter(Bed.room_id == room_id)
    if status is not None and status != "All":
        query = query.filter(Bed.status == status)
    beds = query.order_by(Bed.bed_number.asc()).all()
    return {"beds": [serialize_bed(b, db) for b in beds]}


@app.post("/beds")
def create_bed(payload: BedCreate, db: Session = Depends(get_db)):
    """Add a new bed to a room."""
    clean_number = clean_text(payload.bed_number)
    if not clean_number:
        raise HTTPException(status_code=400, detail="Bed number is required.")

    room = db.query(Room).filter(Room.id == payload.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found.")

    existing = db.query(Bed).filter(Bed.bed_number == clean_number).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Bed {clean_number} already exists.")

    bed = Bed(
        room_id=payload.room_id,
        bed_number=clean_number,
        bed_type=payload.bed_type or "Standard",
        status=payload.status or "Available",
        notes=payload.notes,
    )
    db.add(bed)
    db.commit()
    db.refresh(bed)
    return {"message": "Bed added successfully.", "bed": serialize_bed(bed, db)}


@app.put("/beds/{bed_id}/status")
def update_bed_status(
    bed_id: int,
    payload: BedUpdateStatus,
    db: Session = Depends(get_db),
):
    """Update bed status (e.g. mark Cleaning -> Available)."""
    bed = db.query(Bed).filter(Bed.id == bed_id).first()
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found.")

    allowed = {"Available", "Occupied", "Cleaning", "Maintenance"}
    if payload.status not in allowed:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {', '.join(allowed)}")

    bed.status = payload.status
    if payload.notes:
        bed.notes = payload.notes
    db.commit()
    db.refresh(bed)
    return {"message": f"Bed {bed.bed_number} status updated to {bed.status}.", "bed": serialize_bed(bed, db)}


@app.get("/admissions")
def get_admissions(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Return inpatient admissions with optional status filter."""
    query = db.query(Admission)
    if status and status != "All":
        query = query.filter(Admission.status == status)
    admissions = query.order_by(Admission.id.desc()).all()
    return {"admissions": [serialize_admission(a, db) for a in admissions]}


@app.get("/admissions/{admission_id}")
def get_admission(admission_id: int, db: Session = Depends(get_db)):
    """Return single admission with relational patient, doctor, and bed data."""
    admission = db.query(Admission).filter(Admission.id == admission_id).first()
    if not admission:
        raise HTTPException(status_code=404, detail="Admission record not found.")
    return {"admission": serialize_admission(admission, db)}


@app.post("/admissions")
def admit_patient(payload: AdmissionCreate, db: Session = Depends(get_db)):
    """Admit a patient into the hospital and assign bed."""
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    # Check if patient is already actively admitted
    active_adm = (
        db.query(Admission)
        .filter(Admission.patient_id == payload.patient_id, Admission.status == "Admitted")
        .first()
    )
    if active_adm:
        raise HTTPException(
            status_code=400,
            detail=f"Patient {patient.name} is already actively admitted (Admission #{active_adm.admission_number}).",
        )

    room = None
    bed = None
    if payload.bed_id:
        bed = db.query(Bed).filter(Bed.id == payload.bed_id).first()
        if not bed:
            raise HTTPException(status_code=404, detail="Bed not found.")
        if bed.status != "Available":
            raise HTTPException(
                status_code=400,
                detail=f"Bed {bed.bed_number} is not available (current status: {bed.status}).",
            )
        room = db.query(Room).filter(Room.id == bed.room_id).first()

    adm = Admission(
        patient_id=payload.patient_id,
        admitting_doctor_id=payload.admitting_doctor_id,
        room_id=room.id if room else payload.room_id,
        bed_id=payload.bed_id,
        admission_date=payload.admission_date,
        admission_time=payload.admission_time or datetime.now().strftime("%H:%M"),
        admission_type=payload.admission_type or "Elective",
        admission_reason=payload.admission_reason,
        diagnosis_at_admission=payload.diagnosis_at_admission,
        expected_discharge_date=payload.expected_discharge_date,
        status="Admitted",
        notes=payload.notes,
    )
    db.add(adm)
    db.flush()

    adm.admission_number = f"ADM-{datetime.now().strftime('%Y%m')}-{adm.id:04d}"

    # Update bed and room status
    if bed:
        bed.status = "Occupied"
    if room:
        room.occupied_count = (room.occupied_count or 0) + 1
        if room.occupied_count >= room.capacity:
            room.status = "Occupied"

    db.commit()
    db.refresh(adm)
    return {"message": "Patient admitted successfully.", "admission": serialize_admission(adm, db)}


@app.post("/admissions/{admission_id}/transfer")
def transfer_patient(
    admission_id: int,
    payload: AdmissionTransfer,
    db: Session = Depends(get_db),
):
    """Transfer an admitted patient to another room and bed."""
    adm = db.query(Admission).filter(Admission.id == admission_id).first()
    if not adm:
        raise HTTPException(status_code=404, detail="Admission not found.")
    if adm.status != "Admitted":
        raise HTTPException(status_code=400, detail="Cannot transfer a patient who is not currently admitted.")

    new_bed = db.query(Bed).filter(Bed.id == payload.new_bed_id).first()
    if not new_bed:
        raise HTTPException(status_code=404, detail="New bed not found.")
    if new_bed.status != "Available":
        raise HTTPException(
            status_code=400,
            detail=f"Target bed {new_bed.bed_number} is not available (status: {new_bed.status}).",
        )

    new_room = db.query(Room).filter(Room.id == payload.new_room_id).first()
    if not new_room:
        raise HTTPException(status_code=404, detail="New room not found.")

    # Free previous bed and update previous room
    if adm.bed_id:
        old_bed = db.query(Bed).filter(Bed.id == adm.bed_id).first()
        if old_bed:
            old_bed.status = "Cleaning"
            old_bed.notes = f"Patient transferred on {datetime.now().strftime('%Y-%m-%d %H:%M')}. Needs sanitization."

    if adm.room_id:
        old_room = db.query(Room).filter(Room.id == adm.room_id).first()
        if old_room and old_room.occupied_count > 0:
            old_room.occupied_count -= 1
            if old_room.occupied_count < old_room.capacity:
                old_room.status = "Available"

    # Assign new bed and update new room
    new_bed.status = "Occupied"
    new_room.occupied_count = (new_room.occupied_count or 0) + 1
    if new_room.occupied_count >= new_room.capacity:
        new_room.status = "Occupied"

    adm.room_id = new_room.id
    adm.bed_id = new_bed.id
    transfer_note = f"\n[Transfer on {datetime.now().strftime('%Y-%m-%d %H:%M')}]: Moved to Room {new_room.room_number}, Bed {new_bed.bed_number}. Reason: {payload.transfer_reason or 'None provided'}."
    adm.notes = (adm.notes or "") + transfer_note

    db.commit()
    db.refresh(adm)
    return {"message": "Patient transferred successfully.", "admission": serialize_admission(adm, db)}


@app.post("/admissions/{admission_id}/discharge")
def discharge_patient(
    admission_id: int,
    payload: AdmissionDischarge,
    db: Session = Depends(get_db),
):
    """Process patient discharge and create clinical discharge summary."""
    adm = db.query(Admission).filter(Admission.id == admission_id).first()
    if not adm:
        raise HTTPException(status_code=404, detail="Admission not found.")
    if adm.status != "Admitted":
        raise HTTPException(status_code=400, detail=f"Admission is already {adm.status}.")

    adm.status = "Discharged"
    adm.actual_discharge_date = payload.actual_discharge_date
    adm.discharge_reason = payload.discharge_reason

    # Release bed to Cleaning
    if adm.bed_id:
        bed = db.query(Bed).filter(Bed.id == adm.bed_id).first()
        if bed:
            bed.status = "Cleaning"
            bed.notes = f"Discharged on {payload.actual_discharge_date}. Needs sanitization."

    # Decrement room occupancy
    if adm.room_id:
        room = db.query(Room).filter(Room.id == adm.room_id).first()
        if room and room.occupied_count > 0:
            room.occupied_count -= 1
            if room.occupied_count < room.capacity:
                room.status = "Available"

    # Create Discharge Summary
    summary = DischargeSummary(
        admission_id=adm.id,
        patient_id=adm.patient_id,
        doctor_id=adm.admitting_doctor_id,
        discharge_date=payload.actual_discharge_date,
        final_diagnosis=payload.final_diagnosis or adm.diagnosis_at_admission,
        hospital_course=payload.hospital_course,
        procedures_performed=payload.procedures_performed,
        medications_at_discharge=payload.medications_at_discharge,
        follow_up_instructions=payload.follow_up_instructions,
        warning_signs=payload.warning_signs,
        doctor_notes=payload.doctor_notes,
    )
    db.add(summary)
    db.commit()
    db.refresh(adm)
    db.refresh(summary)

    return {
        "message": "Patient discharged successfully and discharge summary created.",
        "admission": serialize_admission(adm, db),
        "discharge_summary": serialize_discharge_summary(summary, db),
    }


@app.get("/admissions/{admission_id}/discharge-summary")
def get_discharge_summary(admission_id: int, db: Session = Depends(get_db)):
    """Retrieve discharge summary for an admission."""
    summary = (
        db.query(DischargeSummary)
        .filter(DischargeSummary.admission_id == admission_id)
        .first()
    )
    if not summary:
        raise HTTPException(status_code=404, detail="Discharge summary not found for this admission.")
    return {"discharge_summary": serialize_discharge_summary(summary, db)}


@app.get("/inpatient/occupancy-stats")
def get_inpatient_occupancy_stats(db: Session = Depends(get_db)):
    """Calculate real-time hospital bed occupancy and inpatient metrics."""
    beds = db.query(Bed).all()
    total_beds = len(beds)
    available_beds = sum(1 for b in beds if b.status == "Available")
    occupied_beds = sum(1 for b in beds if b.status == "Occupied")
    cleaning_beds = sum(1 for b in beds if b.status == "Cleaning")
    maintenance_beds = sum(1 for b in beds if b.status == "Maintenance")

    rate = (occupied_beds / total_beds * 100) if total_beds > 0 else 0.0

    admitted_count = db.query(Admission).filter(Admission.status == "Admitted").count()
    discharged_count = db.query(Admission).filter(Admission.status == "Discharged").count()

    return {
        "total_beds": total_beds,
        "available_beds": available_beds,
        "occupied_beds": occupied_beds,
        "cleaning_beds": cleaning_beds,
        "maintenance_beds": maintenance_beds,
        "occupancy_rate": round(rate, 1),
        "total_admitted_patients": admitted_count,
        "total_discharged_patients": discharged_count,
    }


@app.post("/inpatient/seed-sample-data")
def seed_inpatient_sample_data(db: Session = Depends(get_db)):
    """Pre-populate sample hospital wards, rooms, and beds if empty."""
    dept_count = db.query(Department).count()
    if dept_count > 0:
        return {
            "message": "Hospital wards already seeded.",
            "departments": db.query(Department).count(),
            "rooms": db.query(Room).count(),
            "beds": db.query(Bed).count(),
        }

    # Create Departments
    departments_data = [
        {"name": "Emergency & Trauma Center", "code": "EMRG", "building": "Main Wing", "floor": "Ground"},
        {"name": "Intensive Care Unit (ICU)", "code": "ICU", "building": "Critical Care Tower", "floor": "2nd Floor"},
        {"name": "General Inpatient Medical Ward", "code": "GMW", "building": "East Pavilion", "floor": "3rd Floor"},
        {"name": "Cardiology Inpatient Ward", "code": "CARD", "building": "Heart Institute", "floor": "4th Floor"},
    ]

    dept_objs = {}
    for d in departments_data:
        dept = Department(
            name=d["name"],
            department_code=d["code"],
            building=d["building"],
            floor=d["floor"],
            status="Active",
        )
        db.add(dept)
        db.flush()
        dept_objs[d["code"]] = dept

    # Create Rooms
    rooms_data = [
        {"room_number": "EMRG-101", "type": "Emergency Bay", "dept": "EMRG", "cap": 2, "rate": 150.0},
        {"room_number": "ICU-201", "type": "ICU Isolation Suite", "dept": "ICU", "cap": 1, "rate": 500.0},
        {"room_number": "ICU-202", "type": "Critical Care Bay", "dept": "ICU", "cap": 2, "rate": 450.0},
        {"room_number": "GMW-301", "type": "Semi-Private Room", "dept": "GMW", "cap": 2, "rate": 120.0},
        {"room_number": "GMW-302", "type": "General Ward", "dept": "GMW", "cap": 4, "rate": 80.0},
        {"room_number": "CARD-401", "type": "Cardiac Care Suite", "dept": "CARD", "cap": 2, "rate": 280.0},
    ]

    room_objs = {}
    for r in rooms_data:
        dept_id = dept_objs[r["dept"]].id
        room = Room(
            room_number=r["room_number"],
            room_type=r["type"],
            department_id=dept_id,
            building=dept_objs[r["dept"]].building,
            floor=dept_objs[r["dept"]].floor,
            capacity=r["cap"],
            occupied_count=0,
            daily_rate=r["rate"],
            status="Available",
        )
        db.add(room)
        db.flush()
        room_objs[r["room_number"]] = room

    # Create Beds
    beds_data = [
        ("EMRG-101", ["EMRG-101-A", "EMRG-101-B"], "Stretcher Bed"),
        ("ICU-201", ["ICU-201-A"], "ICU Cardiac Fowler"),
        ("ICU-202", ["ICU-202-A", "ICU-202-B"], "ICU Fowler Bed"),
        ("GMW-301", ["GMW-301-A", "GMW-301-B"], "Semi-Fowler Bed"),
        ("GMW-302", ["GMW-302-A", "GMW-302-B", "GMW-302-C", "GMW-302-D"], "Standard Ward Bed"),
        ("CARD-401", ["CARD-401-A", "CARD-401-B"], "Telemetry Monitor Bed"),
    ]

    for room_no, bed_list, b_type in beds_data:
        rm = room_objs[room_no]
        for b_no in bed_list:
            bed = Bed(
                room_id=rm.id,
                bed_number=b_no,
                bed_type=b_type,
                status="Available",
            )
            db.add(bed)

    db.commit()
    return {
        "message": "Successfully initialized hospital departments, rooms, and beds!",
        "departments_count": len(departments_data),
        "rooms_count": len(rooms_data),
        "beds_count": sum(len(b[1]) for b in beds_data),
    }


# ============================================================
# LABORATORY INFORMATION SYSTEM (LIS) ENDPOINTS
# ============================================================

@app.get("/lab/categories")
def get_lab_categories(db: Session = Depends(get_db)):
    """Return all laboratory test categories."""
    categories = db.query(LabTestCategory).order_by(LabTestCategory.display_order.asc()).all()
    return {"categories": [serialize_lab_category(c) for c in categories]}


@app.post("/lab/categories")
def create_lab_category(payload: LabTestCategoryCreate, db: Session = Depends(get_db)):
    """Create a new laboratory test category."""
    clean_name = clean_text(payload.name)
    if not clean_name:
        raise HTTPException(status_code=400, detail="Category name is required.")

    code = payload.category_code or f"CAT-{clean_name[:4].upper()}"
    cat = LabTestCategory(
        category_code=code,
        name=clean_name,
        description=payload.description,
        department=payload.department or "Clinical Pathology",
        display_order=payload.display_order,
        status=payload.status or "Active",
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return {"message": "Lab category created successfully.", "category": serialize_lab_category(cat)}


@app.get("/lab/tests")
def get_lab_tests(
    category_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """Return laboratory test catalog with optional category filter."""
    query = db.query(LabTest)
    if category_id is not None:
        query = query.filter(LabTest.category_id == category_id)
    tests = query.order_by(LabTest.test_name.asc()).all()
    return {"tests": [serialize_lab_test(t, db) for t in tests]}


@app.post("/lab/tests")
def create_lab_test(payload: LabTestCreate, db: Session = Depends(get_db)):
    """Add a new diagnostic test to the laboratory catalog."""
    clean_name = clean_text(payload.test_name)
    if not clean_name:
        raise HTTPException(status_code=400, detail="Test name is required.")

    code = payload.test_code or f"TST-{clean_name[:3].upper()}-{len(clean_name):02d}"
    test = LabTest(
        test_code=code,
        test_name=clean_name,
        category_id=payload.category_id,
        description=payload.description,
        specimen_type=payload.specimen_type or "Whole Blood",
        specimen_container=payload.specimen_container or "EDTA Tube",
        fasting_required=payload.fasting_required or "No",
        preparation_instructions=payload.preparation_instructions,
        result_type=payload.result_type or "Numeric",
        unit=payload.unit,
        reference_range=payload.reference_range,
        critical_low_value=payload.critical_low_value,
        critical_high_value=payload.critical_high_value,
        turnaround_time_hours=payload.turnaround_time_hours,
        price=round_money(payload.price),
        status=payload.status or "Active",
    )
    db.add(test)
    db.commit()
    db.refresh(test)
    return {"message": "Lab test added to catalog.", "test": serialize_lab_test(test, db)}


@app.get("/lab/orders")
def get_lab_orders(
    patient_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Return laboratory orders with optional patient and status filters."""
    query = db.query(LabOrder)
    if patient_id is not None:
        query = query.filter(LabOrder.patient_id == patient_id)
    if status and status != "All":
        query = query.filter(LabOrder.status == status)
    orders = query.order_by(LabOrder.id.desc()).all()
    return {"orders": [serialize_lab_order(o, db) for o in orders]}


@app.get("/lab/orders/{order_id}")
def get_lab_order(order_id: int, db: Session = Depends(get_db)):
    """Return a single laboratory order with all test items and results."""
    order = db.query(LabOrder).filter(LabOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Lab order not found.")
    return {"order": serialize_lab_order(order, db)}


@app.post("/lab/orders")
def create_lab_order(payload: LabOrderCreate, db: Session = Depends(get_db)):
    """Physician places a new laboratory order for a patient."""
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    if not payload.test_ids:
        raise HTTPException(status_code=400, detail="At least one test must be selected.")

    tests = db.query(LabTest).filter(LabTest.id.in_(payload.test_ids)).all()
    if not tests:
        raise HTTPException(status_code=400, detail="Invalid test IDs provided.")

    total_amount = sum(t.price for t in tests)

    order = LabOrder(
        order_number="TEMP",
        patient_id=payload.patient_id,
        doctor_id=payload.doctor_id,
        order_date=datetime.now().strftime("%Y-%m-%d"),
        priority=payload.priority or "Routine",
        clinical_notes=payload.clinical_notes,
        diagnosis_notes=payload.diagnosis_notes,
        status="Ordered",
        collection_status="Pending",
        billing_status="Pending",
        total_amount=round_money(total_amount),
    )
    db.add(order)
    db.flush()

    order.order_number = f"LAB-{datetime.now().strftime('%Y%m')}-{order.id:04d}"

    for t in tests:
        item = LabOrderItem(
            lab_order_id=order.id,
            lab_test_id=t.id,
            requested_price=round_money(t.price),
            specimen_type=t.specimen_type,
            status="Ordered",
        )
        db.add(item)

    db.commit()
    db.refresh(order)
    return {"message": "Lab order created successfully.", "order": serialize_lab_order(order, db)}


@app.post("/lab/orders/{order_id}/collect-sample")
def collect_sample(
    order_id: int,
    payload: LabSampleCollect,
    db: Session = Depends(get_db),
):
    """Phlebotomist logs specimen collection and generates barcodes."""
    order = db.query(LabOrder).filter(LabOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Lab order not found.")

    items = db.query(LabOrderItem).filter(LabOrderItem.lab_order_id == order.id).all()
    if not items:
        raise HTTPException(status_code=400, detail="No items found in this order.")

    now_date = datetime.now().strftime("%Y-%m-%d")
    now_time = datetime.now().strftime("%H:%M")

    for item in items:
        item.status = "Collected"
        item.collection_date = now_date
        item.collection_time = now_time
        item.collected_by = payload.collected_by or "Phlebotomy Staff"

        sample = LabSample(
            sample_number=f"SMPL-{datetime.now().strftime('%Y%m')}-{item.id:04d}",
            lab_order_item_id=item.id,
            patient_id=order.patient_id,
            specimen_type=item.specimen_type or "Blood",
            container_type=payload.container_type or "Standard Container",
            collection_date=now_date,
            collection_time=now_time,
            collected_by=payload.collected_by or "Phlebotomy Staff",
            storage_location=payload.storage_location or "Main Lab Specimen Fridge",
            status="Collected",
        )
        db.add(sample)

    order.collection_status = "Collected"
    order.status = "In Analysis"
    db.commit()
    db.refresh(order)
    return {"message": "Samples collected and accessioned successfully.", "order": serialize_lab_order(order, db)}


@app.post("/lab/results")
def enter_lab_result(payload: LabResultEntry, db: Session = Depends(get_db)):
    """Technician enters clinical result with automated abnormal/critical flagging."""
    item = db.query(LabOrderItem).filter(LabOrderItem.id == payload.lab_order_item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Lab order item not found.")

    test = db.query(LabTest).filter(LabTest.id == item.lab_test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Lab test definition not found.")

    order = db.query(LabOrder).filter(LabOrder.id == item.lab_order_id).first()

    # Automated flag evaluation
    abnormal_flag, critical_flag = evaluate_lab_result(payload.result_numeric_value, test)

    existing_result = db.query(LabResult).filter(LabResult.lab_order_item_id == item.id).first()
    if existing_result:
        existing_result.result_value = payload.result_value or str(payload.result_numeric_value)
        existing_result.result_numeric_value = payload.result_numeric_value
        existing_result.result_text = payload.result_text
        existing_result.unit = test.unit
        existing_result.reference_range = test.reference_range
        existing_result.abnormal_flag = abnormal_flag
        existing_result.critical_flag = critical_flag
        existing_result.technician_notes = payload.technician_notes
        existing_result.performed_by = payload.performed_by or "Lab Analyst"
        existing_result.result_date = datetime.now().strftime("%Y-%m-%d")
        existing_result.result_time = datetime.now().strftime("%H:%M")
        res_obj = existing_result
    else:
        res_obj = LabResult(
            lab_order_item_id=item.id,
            lab_test_id=test.id,
            patient_id=order.patient_id,
            result_value=payload.result_value or str(payload.result_numeric_value),
            result_numeric_value=payload.result_numeric_value,
            result_text=payload.result_text,
            unit=test.unit,
            reference_range=test.reference_range,
            abnormal_flag=abnormal_flag,
            critical_flag=critical_flag,
            technician_notes=payload.technician_notes,
            performed_by=payload.performed_by or "Lab Analyst",
            result_date=datetime.now().strftime("%Y-%m-%d"),
            result_time=datetime.now().strftime("%H:%M"),
            verification_status="Verified",
            status="Completed",
        )
        db.add(res_obj)

    item.status = "Completed"
    db.commit()
    db.refresh(res_obj)

    return {"message": "Lab result recorded and evaluated.", "result": serialize_lab_result(res_obj, db)}


@app.post("/lab/orders/{order_id}/generate-report")
def generate_lab_report(order_id: int, db: Session = Depends(get_db)):
    """Pathologist reviews results and generates official diagnostic report."""
    order = db.query(LabOrder).filter(LabOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Lab order not found.")

    items = db.query(LabOrderItem).filter(LabOrderItem.lab_order_id == order.id).all()
    results = []
    abnormal_count = 0
    critical_count = 0

    for it in items:
        r = db.query(LabResult).filter(LabResult.lab_order_item_id == it.id).first()
        if r:
            results.append(r)
            if r.abnormal_flag in {"High", "Low"}:
                abnormal_count += 1
            if r.critical_flag in {"Critical High", "Critical Low"}:
                critical_count += 1

    existing_rep = db.query(LabReport).filter(LabReport.lab_order_id == order.id).first()
    if existing_rep:
        existing_rep.abnormal_result_count = abnormal_count
        existing_rep.critical_result_count = critical_count
        existing_rep.status = "Final"
        rep_obj = existing_rep
    else:
        rep_obj = LabReport(
            report_number=f"REP-{datetime.now().strftime('%Y%m')}-{order.id:04d}",
            lab_order_id=order.id,
            patient_id=order.patient_id,
            doctor_id=order.doctor_id,
            report_title="Comprehensive Laboratory Diagnostic Report",
            report_summary=f"Diagnostic panel completed for {len(results)} parameters.",
            clinical_interpretation=(
                "Critical findings flagged. Urgent physician follow-up required."
                if critical_count > 0
                else "Results verified by clinical laboratory supervisor."
            ),
            abnormal_result_count=abnormal_count,
            critical_result_count=critical_count,
            generated_date=datetime.now().strftime("%Y-%m-%d"),
            verified_date=datetime.now().strftime("%Y-%m-%d"),
            verified_by="Chief Pathologist",
            status="Final",
        )
        db.add(rep_obj)

    order.status = "Completed"
    db.commit()
    db.refresh(rep_obj)

    return {"message": "Diagnostic laboratory report generated.", "report": serialize_lab_report(rep_obj, db)}


@app.get("/lab/reports")
def get_lab_reports(db: Session = Depends(get_db)):
    """Return all finalized laboratory diagnostic reports."""
    reports = db.query(LabReport).order_by(LabReport.id.desc()).all()
    return {"reports": [serialize_lab_report(r, db) for r in reports]}


@app.get("/lab/reports/{report_id}")
def get_lab_report(report_id: int, db: Session = Depends(get_db)):
    """Retrieve full diagnostic report with all test results."""
    report = db.query(LabReport).filter(LabReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Lab report not found.")
    return {"report": serialize_lab_report(report, db)}


@app.get("/lab/stats")
def get_lab_stats(db: Session = Depends(get_db)):
    """Return operational KPIs for laboratory diagnostic department."""
    total_orders = db.query(LabOrder).count()
    pending_collection = db.query(LabOrder).filter(LabOrder.collection_status == "Pending").count()
    in_analysis = db.query(LabOrder).filter(LabOrder.status == "In Analysis").count()
    completed_reports = db.query(LabReport).count()
    total_tests = db.query(LabTest).count()
    critical_alerts = db.query(LabResult).filter(LabResult.critical_flag != "Normal").count()

    return {
        "total_orders": total_orders,
        "pending_collection": pending_collection,
        "in_analysis": in_analysis,
        "completed_reports": completed_reports,
        "total_tests_available": total_tests,
        "critical_alerts_count": critical_alerts,
    }


@app.post("/lab/seed-catalog")
def seed_lab_catalog(db: Session = Depends(get_db)):
    """Seed standard clinical laboratory categories and medical diagnostic tests."""
    existing = db.query(LabTestCategory).count()
    if existing > 0:
        return {
            "message": "Laboratory catalog already populated.",
            "categories": db.query(LabTestCategory).count(),
            "tests": db.query(LabTest).count(),
        }

    categories_data = [
        {"code": "HEM", "name": "Hematology & Coagulation", "dept": "Hematology", "order": 1},
        {"code": "BIO", "name": "Clinical Biochemistry", "dept": "Biochemistry", "order": 2},
        {"code": "IMM", "name": "Immunology & Serology", "dept": "Immunology", "order": 3},
        {"code": "END", "name": "Endocrinology & Diabetes", "dept": "Endocrinology", "order": 4},
        {"code": "URI", "name": "Clinical Microscopy & Urinalysis", "dept": "Microscopy", "order": 5},
    ]

    cat_objs = {}
    for c in categories_data:
        cat = LabTestCategory(
            category_code=c["code"],
            name=c["name"],
            department=c["dept"],
            display_order=c["order"],
            status="Active",
        )
        db.add(cat)
        db.flush()
        cat_objs[c["code"]] = cat

    tests_data = [
        {
            "code": "CBC-01",
            "name": "Complete Blood Count (CBC) with Differential",
            "cat": "HEM",
            "spec": "Whole Blood",
            "cont": "EDTA Lavender Top",
            "fasting": "No",
            "type": "Numeric",
            "unit": "g/dL",
            "ref": "12.0-16.0",
            "crit_low": "7.0",
            "crit_high": "20.0",
            "tat": 4,
            "price": 45.0,
        },
        {
            "code": "GLUC-F",
            "name": "Fasting Blood Glucose (FBG)",
            "cat": "BIO",
            "spec": "Plasma / Serum",
            "cont": "Grey Top Sodium Fluoride",
            "fasting": "Yes (8-10 hrs)",
            "type": "Numeric",
            "unit": "mg/dL",
            "ref": "70-99",
            "crit_low": "50",
            "crit_high": "400",
            "tat": 2,
            "price": 25.0,
        },
        {
            "code": "HBA1C",
            "name": "Glycated Hemoglobin (HbA1c)",
            "cat": "END",
            "spec": "Whole Blood",
            "cont": "EDTA Lavender Top",
            "fasting": "No",
            "type": "Numeric",
            "unit": "%",
            "ref": "4.0-5.6",
            "crit_low": None,
            "crit_high": "12.0",
            "tat": 6,
            "price": 60.0,
        },
        {
            "code": "LIPID-P",
            "name": "Lipid Panel (Total, HDL, LDL, Triglycerides)",
            "cat": "BIO",
            "spec": "Serum",
            "cont": "SST Gold Top",
            "fasting": "Yes (12 hrs)",
            "type": "Numeric",
            "unit": "mg/dL",
            "ref": "125-200",
            "crit_low": None,
            "crit_high": "350",
            "tat": 4,
            "price": 75.0,
        },
        {
            "code": "LFT-01",
            "name": "Liver Function Panel (ALT, AST, Bilirubin, ALP)",
            "cat": "BIO",
            "spec": "Serum",
            "cont": "SST Gold Top",
            "fasting": "No",
            "type": "Numeric",
            "unit": "U/L",
            "ref": "10-40",
            "crit_low": None,
            "crit_high": "300",
            "tat": 6,
            "price": 85.0,
        },
        {
            "code": "KFT-01",
            "name": "Kidney Function Test (BUN, Serum Creatinine, eGFR)",
            "cat": "BIO",
            "spec": "Serum",
            "cont": "SST Gold Top",
            "fasting": "No",
            "type": "Numeric",
            "unit": "mg/dL",
            "ref": "0.6-1.2",
            "crit_low": "0.2",
            "crit_high": "5.0",
            "tat": 4,
            "price": 70.0,
        },
        {
            "code": "TSH-01",
            "name": "Thyroid Stimulating Hormone (TSH)",
            "cat": "END",
            "spec": "Serum",
            "cont": "SST Gold Top",
            "fasting": "No",
            "type": "Numeric",
            "unit": "uIU/mL",
            "ref": "0.4-4.0",
            "crit_low": "0.01",
            "crit_high": "20.0",
            "tat": 12,
            "price": 65.0,
        },
        {
            "code": "ELECT-01",
            "name": "Serum Electrolytes (Sodium, Potassium, Chloride)",
            "cat": "BIO",
            "spec": "Serum",
            "cont": "Green Top Heparin",
            "fasting": "No",
            "type": "Numeric",
            "unit": "mmol/L",
            "ref": "135-145",
            "crit_low": "120",
            "crit_high": "160",
            "tat": 2,
            "price": 55.0,
        },
        {
            "code": "URINE-RT",
            "name": "Urinalysis Routine & Microscopic Examination",
            "cat": "URI",
            "spec": "Clean Catch Urine",
            "cont": "Sterile Urine Cup",
            "fasting": "No",
            "type": "Text",
            "unit": "N/A",
            "ref": "Normal / Clear",
            "crit_low": None,
            "crit_high": None,
            "tat": 2,
            "price": 30.0,
        },
        {
            "code": "CRP-QUANT",
            "name": "C-Reactive Protein (CRP) High Sensitivity",
            "cat": "IMM",
            "spec": "Serum",
            "cont": "SST Gold Top",
            "fasting": "No",
            "type": "Numeric",
            "unit": "mg/L",
            "ref": "0.0-3.0",
            "crit_low": None,
            "crit_high": "50.0",
            "tat": 4,
            "price": 50.0,
        },
    ]

    for t in tests_data:
        cat_id = cat_objs[t["cat"]].id
        test = LabTest(
            test_code=t["code"],
            test_name=t["name"],
            category_id=cat_id,
            specimen_type=t["spec"],
            specimen_container=t["cont"],
            fasting_required=t["fasting"],
            result_type=t["type"],
            unit=t["unit"],
            reference_range=t["ref"],
            critical_low_value=t["crit_low"],
            critical_high_value=t["crit_high"],
            turnaround_time_hours=t["tat"],
            price=round_money(t["price"]),
            status="Active",
        )
        db.add(test)

    db.commit()
    return {
        "message": "Successfully initialized laboratory diagnostic categories and test catalog!",
        "categories_count": len(categories_data),
        "tests_count": len(tests_data),
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
            "Inpatient & Bed Management (ADT)",
            "Ward & Room Allocation",
            "Clinical Discharge Summaries",
            "Laboratory Information System (LIS)",
            "Diagnostic Test Catalog & Phlebotomy",
            "Clinical Result Verification & Automated Flagging",
            "Pathology Diagnostic Reports",
        ],
    }


# ============================================================
# END OF APPLICATION
# ============================================================