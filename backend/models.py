from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    Text,
    Boolean,
    DateTime,
    Date,
    Time,
    UniqueConstraint,
    Index,
)
from database import Base


# ============================================================
# PATIENT MANAGEMENT
# ============================================================


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)

    patient_number = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    name = Column(String, nullable=False, index=True)

    first_name = Column(
        String,
        nullable=True,
        index=True,
    )

    middle_name = Column(
        String,
        nullable=True,
    )

    last_name = Column(
        String,
        nullable=True,
        index=True,
    )

    date_of_birth = Column(
        String,
        nullable=True,
    )

    age = Column(
        Integer,
        nullable=False,
    )

    gender = Column(
        String,
        nullable=True,
    )

    blood_group = Column(
        String,
        nullable=True,
    )

    phone = Column(
        String,
        nullable=False,
        index=True,
    )

    alternate_phone = Column(
        String,
        nullable=True,
    )

    email = Column(
        String,
        nullable=True,
        index=True,
    )

    address = Column(
        Text,
        nullable=True,
    )

    city = Column(
        String,
        nullable=True,
    )

    state = Column(
        String,
        nullable=True,
    )

    postal_code = Column(
        String,
        nullable=True,
    )

    emergency_contact_name = Column(
        String,
        nullable=True,
    )

    emergency_contact_phone = Column(
        String,
        nullable=True,
    )

    emergency_contact_relation = Column(
        String,
        nullable=True,
    )

    occupation = Column(
        String,
        nullable=True,
    )

    marital_status = Column(
        String,
        nullable=True,
    )

    preferred_language = Column(
        String,
        nullable=True,
    )

    registration_date = Column(
        String,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Active",
        index=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=True,
    )

    updated_at = Column(
        DateTime,
        nullable=True,
    )


# ============================================================
# DOCTOR MANAGEMENT
# ============================================================


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)

    doctor_code = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    name = Column(
        String,
        nullable=False,
        index=True,
    )

    first_name = Column(
        String,
        nullable=True,
    )

    last_name = Column(
        String,
        nullable=True,
    )

    specialization = Column(
        String,
        nullable=False,
        index=True,
    )

    sub_specialization = Column(
        String,
        nullable=True,
    )

    qualification = Column(
        String,
        nullable=True,
    )

    registration_number = Column(
        String,
        nullable=True,
        index=True,
    )

    experience_years = Column(
        Integer,
        nullable=True,
    )

    phone = Column(
        String,
        nullable=False,
    )

    alternate_phone = Column(
        String,
        nullable=True,
    )

    email = Column(
        String,
        nullable=True,
        index=True,
    )

    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=True,
        index=True,
    )

    consultation_fee = Column(
        Float,
        nullable=True,
        default=0,
    )

    room_number = Column(
        String,
        nullable=True,
    )

    available_days = Column(
        String,
        nullable=True,
    )

    available_start_time = Column(
        String,
        nullable=True,
    )

    available_end_time = Column(
        String,
        nullable=True,
    )

    joining_date = Column(
        String,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Active",
        index=True,
    )

    bio = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=True,
    )

    updated_at = Column(
        DateTime,
        nullable=True,
    )


# ============================================================
# DEPARTMENTS
# ============================================================


class Department(Base):
    __tablename__ = "departments"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    department_code = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    name = Column(
        String,
        nullable=False,
        unique=True,
        index=True,
    )

    description = Column(
        Text,
        nullable=True,
    )

    floor = Column(
        String,
        nullable=True,
    )

    building = Column(
        String,
        nullable=True,
    )

    phone = Column(
        String,
        nullable=True,
    )

    email = Column(
        String,
        nullable=True,
    )

    head_doctor_id = Column(
        Integer,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Active",
        index=True,
    )


# ============================================================
# APPOINTMENTS
# ============================================================


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    appointment_number = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    doctor_id = Column(
        Integer,
        ForeignKey("doctors.id"),
        nullable=False,
        index=True,
    )

    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=True,
        index=True,
    )

    appointment_date = Column(
        String,
        nullable=False,
        index=True,
    )

    appointment_time = Column(
        String,
        nullable=False,
    )

    duration_minutes = Column(
        Integer,
        nullable=True,
        default=30,
    )

    appointment_type = Column(
        String,
        nullable=True,
        default="Consultation",
    )

    reason = Column(
        Text,
        nullable=False,
    )

    symptoms = Column(
        Text,
        nullable=True,
    )

    priority = Column(
        String,
        nullable=False,
        default="Normal",
    )

    status = Column(
        String,
        nullable=False,
        default="Scheduled",
        index=True,
    )

    booking_source = Column(
        String,
        nullable=True,
        default="Clinic",
    )

    room_number = Column(
        String,
        nullable=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )

    cancellation_reason = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=True,
    )

    updated_at = Column(
        DateTime,
        nullable=True,
    )


# ============================================================
# MEDICAL RECORDS
# ============================================================


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    record_number = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    doctor_id = Column(
        Integer,
        ForeignKey("doctors.id"),
        nullable=True,
        index=True,
    )

    appointment_id = Column(
        Integer,
        ForeignKey("appointments.id"),
        nullable=True,
        index=True,
    )

    record_date = Column(
        String,
        nullable=False,
        index=True,
    )

    visit_type = Column(
        String,
        nullable=False,
        default="Consultation",
    )

    chief_complaint = Column(
        Text,
        nullable=False,
        default="",
    )

    symptoms = Column(
        Text,
        nullable=False,
        default="",
    )

    diagnosis = Column(
        Text,
        nullable=False,
        default="",
    )

    treatment_plan = Column(
        Text,
        nullable=False,
        default="",
    )

    medications = Column(
        Text,
        nullable=False,
        default="",
    )

    allergies = Column(
        Text,
        nullable=False,
        default="",
    )

    medical_history = Column(
        Text,
        nullable=True,
    )

    surgical_history = Column(
        Text,
        nullable=True,
    )

    family_history = Column(
        Text,
        nullable=True,
    )

    social_history = Column(
        Text,
        nullable=True,
    )

    vital_temperature = Column(
        String,
        nullable=True,
    )

    vital_blood_pressure = Column(
        String,
        nullable=True,
    )

    vital_heart_rate = Column(
        String,
        nullable=True,
    )

    vital_respiratory_rate = Column(
        String,
        nullable=True,
    )

    vital_oxygen_saturation = Column(
        String,
        nullable=True,
    )

    vital_weight = Column(
        String,
        nullable=True,
    )

    vital_height = Column(
        String,
        nullable=True,
    )

    vital_bmi = Column(
        String,
        nullable=True,
    )

    laboratory_notes = Column(
        Text,
        nullable=True,
    )

    imaging_notes = Column(
        Text,
        nullable=True,
    )

    clinical_notes = Column(
        Text,
        nullable=True,
    )

    follow_up_date = Column(
        String,
        nullable=True,
    )

    record_status = Column(
        String,
        nullable=False,
        default="Active",
        index=True,
    )

    created_at = Column(
        DateTime,
        nullable=True,
    )

    updated_at = Column(
        DateTime,
        nullable=True,
    )


# ============================================================
# DIAGNOSES
# ============================================================


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    doctor_id = Column(
        Integer,
        ForeignKey("doctors.id"),
        nullable=True,
        index=True,
    )

    medical_record_id = Column(
        Integer,
        ForeignKey("medical_records.id"),
        nullable=True,
        index=True,
    )

    diagnosis_code = Column(
        String,
        nullable=True,
        index=True,
    )

    diagnosis_name = Column(
        String,
        nullable=False,
        index=True,
    )

    diagnosis_type = Column(
        String,
        nullable=True,
        default="Primary",
    )

    severity = Column(
        String,
        nullable=True,
    )

    onset_date = Column(
        String,
        nullable=True,
    )

    diagnosis_date = Column(
        String,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Active",
        index=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )


# ============================================================
# ALLERGIES
# ============================================================


class Allergy(Base):
    __tablename__ = "allergies"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    allergen = Column(
        String,
        nullable=False,
        index=True,
    )

    allergy_type = Column(
        String,
        nullable=True,
    )

    reaction = Column(
        Text,
        nullable=True,
    )

    severity = Column(
        String,
        nullable=True,
    )

    onset_date = Column(
        String,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Active",
    )

    notes = Column(
        Text,
        nullable=True,
    )


# ============================================================
# PRESCRIPTIONS
# ============================================================


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    prescription_number = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    doctor_id = Column(
        Integer,
        ForeignKey("doctors.id"),
        nullable=False,
        index=True,
    )

    medical_record_id = Column(
        Integer,
        ForeignKey("medical_records.id"),
        nullable=True,
        index=True,
    )

    prescription_date = Column(
        String,
        nullable=False,
    )

    diagnosis = Column(
        Text,
        nullable=True,
    )

    instructions = Column(
        Text,
        nullable=True,
    )

    duration_days = Column(
        Integer,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Active",
        index=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )


class PrescriptionItem(Base):
    __tablename__ = "prescription_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    prescription_id = Column(
        Integer,
        ForeignKey("prescriptions.id"),
        nullable=False,
        index=True,
    )

    medicine_id = Column(
        Integer,
        ForeignKey("medicines.id"),
        nullable=True,
        index=True,
    )

    medicine_name = Column(
        String,
        nullable=False,
    )

    dosage = Column(
        String,
        nullable=False,
    )

    frequency = Column(
        String,
        nullable=False,
    )

    route = Column(
        String,
        nullable=True,
    )

    timing = Column(
        String,
        nullable=True,
    )

    duration = Column(
        String,
        nullable=True,
    )

    quantity = Column(
        Integer,
        nullable=True,
    )

    instructions = Column(
        Text,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Active",
    )


# ============================================================
# PHARMACY / MEDICINES
# ============================================================


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    medicine_code = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    name = Column(
        String,
        nullable=False,
        index=True,
    )

    generic_name = Column(
        String,
        nullable=True,
        index=True,
    )

    brand_name = Column(
        String,
        nullable=True,
    )

    category = Column(
        String,
        nullable=True,
        index=True,
    )

    dosage_form = Column(
        String,
        nullable=True,
    )

    strength = Column(
        String,
        nullable=True,
    )

    manufacturer = Column(
        String,
        nullable=True,
    )

    batch_number = Column(
        String,
        nullable=True,
        index=True,
    )

    expiry_date = Column(
        String,
        nullable=True,
    )

    stock_quantity = Column(
        Integer,
        nullable=False,
        default=0,
    )

    reorder_level = Column(
        Integer,
        nullable=False,
        default=10,
    )

    unit_price = Column(
        Float,
        nullable=False,
        default=0,
    )

    prescription_required = Column(
        Boolean,
        nullable=False,
        default=False,
    )

    storage_instructions = Column(
        Text,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Active",
        index=True,
    )


class PharmacyTransaction(Base):
    __tablename__ = "pharmacy_transactions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    transaction_number = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=True,
        index=True,
    )

    prescription_id = Column(
        Integer,
        ForeignKey("prescriptions.id"),
        nullable=True,
        index=True,
    )

    transaction_date = Column(
        String,
        nullable=False,
    )

    transaction_type = Column(
        String,
        nullable=False,
        default="Sale",
    )

    subtotal = Column(
        Float,
        nullable=False,
        default=0,
    )

    discount = Column(
        Float,
        nullable=False,
        default=0,
    )

    tax = Column(
        Float,
        nullable=False,
        default=0,
    )

    total_amount = Column(
        Float,
        nullable=False,
        default=0,
    )

    payment_status = Column(
        String,
        nullable=False,
        default="Pending",
    )

    notes = Column(
        Text,
        nullable=True,
    )


class PharmacyTransactionItem(Base):
    __tablename__ = "pharmacy_transaction_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    transaction_id = Column(
        Integer,
        ForeignKey("pharmacy_transactions.id"),
        nullable=False,
        index=True,
    )

    medicine_id = Column(
        Integer,
        ForeignKey("medicines.id"),
        nullable=False,
        index=True,
    )

    quantity = Column(
        Integer,
        nullable=False,
        default=1,
    )

    unit_price = Column(
        Float,
        nullable=False,
        default=0,
    )

    discount = Column(
        Float,
        nullable=False,
        default=0,
    )

    tax = Column(
        Float,
        nullable=False,
        default=0,
    )

    total_amount = Column(
        Float,
        nullable=False,
        default=0,
    )


# ============================================================
# LABORATORY
# ============================================================


class LaboratoryTest(Base):
    __tablename__ = "laboratory_tests"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    test_code = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    test_name = Column(
        String,
        nullable=False,
        index=True,
    )

    category = Column(
        String,
        nullable=True,
        index=True,
    )

    description = Column(
        Text,
        nullable=True,
    )

    sample_type = Column(
        String,
        nullable=True,
    )

    preparation_instructions = Column(
        Text,
        nullable=True,
    )

    reference_range = Column(
        Text,
        nullable=True,
    )

    unit = Column(
        String,
        nullable=True,
    )

    price = Column(
        Float,
        nullable=False,
        default=0,
    )

    turnaround_time = Column(
        String,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Active",
    )


class LaboratoryOrder(Base):
    __tablename__ = "laboratory_orders"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    order_number = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    doctor_id = Column(
        Integer,
        ForeignKey("doctors.id"),
        nullable=True,
        index=True,
    )

    appointment_id = Column(
        Integer,
        ForeignKey("appointments.id"),
        nullable=True,
        index=True,
    )

    order_date = Column(
        String,
        nullable=False,
    )

    priority = Column(
        String,
        nullable=False,
        default="Normal",
    )

    clinical_notes = Column(
        Text,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Ordered",
        index=True,
    )


class LaboratoryOrderItem(Base):
    __tablename__ = "laboratory_order_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    order_id = Column(
        Integer,
        ForeignKey("laboratory_orders.id"),
        nullable=False,
        index=True,
    )

    test_id = Column(
        Integer,
        ForeignKey("laboratory_tests.id"),
        nullable=False,
        index=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Pending",
    )

    sample_collected_at = Column(
        DateTime,
        nullable=True,
    )

    result_value = Column(
        String,
        nullable=True,
    )

    result_unit = Column(
        String,
        nullable=True,
    )

    reference_range = Column(
        String,
        nullable=True,
    )

    abnormal_flag = Column(
        String,
        nullable=True,
    )

    result_notes = Column(
        Text,
        nullable=True,
    )

    verified_by = Column(
        String,
        nullable=True,
    )

    verified_at = Column(
        DateTime,
        nullable=True,
    )


# ============================================================
# IMAGING
# ============================================================


class ImagingStudy(Base):
    __tablename__ = "imaging_studies"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    study_number = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    doctor_id = Column(
        Integer,
        ForeignKey("doctors.id"),
        nullable=True,
        index=True,
    )

    study_type = Column(
        String,
        nullable=False,
        index=True,
    )

    body_part = Column(
        String,
        nullable=True,
    )

    study_date = Column(
        String,
        nullable=False,
    )

    clinical_indication = Column(
        Text,
        nullable=True,
    )

    findings = Column(
        Text,
        nullable=True,
    )

    impression = Column(
        Text,
        nullable=True,
    )

    radiologist_notes = Column(
        Text,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Ordered",
        index=True,
    )


# ============================================================
# PROCEDURES
# ============================================================


class Procedure(Base):
    __tablename__ = "procedures"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    procedure_code = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    procedure_name = Column(
        String,
        nullable=False,
        index=True,
    )

    category = Column(
        String,
        nullable=True,
    )

    description = Column(
        Text,
        nullable=True,
    )

    standard_fee = Column(
        Float,
        nullable=False,
        default=0,
    )

    duration_minutes = Column(
        Integer,
        nullable=True,
    )

    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Active",
    )


class PatientProcedure(Base):
    __tablename__ = "patient_procedures"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    procedure_id = Column(
        Integer,
        ForeignKey("procedures.id"),
        nullable=False,
        index=True,
    )

    doctor_id = Column(
        Integer,
        ForeignKey("doctors.id"),
        nullable=True,
        index=True,
    )

    procedure_date = Column(
        String,
        nullable=False,
    )

    indication = Column(
        Text,
        nullable=True,
    )

    findings = Column(
        Text,
        nullable=True,
    )

    outcome = Column(
        Text,
        nullable=True,
    )

    complications = Column(
        Text,
        nullable=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Planned",
    )


# ============================================================
# VACCINATIONS
# ============================================================


class Vaccination(Base):
    __tablename__ = "vaccinations"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    vaccine_name = Column(
        String,
        nullable=False,
    )

    vaccine_type = Column(
        String,
        nullable=True,
    )

    dose_number = Column(
        Integer,
        nullable=True,
    )

    administration_date = Column(
        String,
        nullable=False,
    )

    next_due_date = Column(
        String,
        nullable=True,
    )

    batch_number = Column(
        String,
        nullable=True,
    )

    administered_by = Column(
        String,
        nullable=True,
    )

    site = Column(
        String,
        nullable=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )


# ============================================================
# INSURANCE
# ============================================================


class InsuranceProvider(Base):
    __tablename__ = "insurance_providers"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    provider_code = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    name = Column(
        String,
        nullable=False,
        unique=True,
    )

    phone = Column(
        String,
        nullable=True,
    )

    email = Column(
        String,
        nullable=True,
    )

    website = Column(
        String,
        nullable=True,
    )

    address = Column(
        Text,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Active",
    )


class PatientInsurance(Base):
    __tablename__ = "patient_insurance"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    provider_id = Column(
        Integer,
        ForeignKey("insurance_providers.id"),
        nullable=False,
        index=True,
    )

    policy_number = Column(
        String,
        nullable=False,
        index=True,
    )

    member_number = Column(
        String,
        nullable=True,
    )

    plan_name = Column(
        String,
        nullable=True,
    )

    relationship_to_holder = Column(
        String,
        nullable=True,
    )

    policy_holder_name = Column(
        String,
        nullable=True,
    )

    valid_from = Column(
        String,
        nullable=True,
    )

    valid_until = Column(
        String,
        nullable=True,
    )

    coverage_limit = Column(
        Float,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Active",
    )

    notes = Column(
        Text,
        nullable=True,
    )


# ============================================================
# MEDICAL BILLING
# ============================================================


class MedicalBill(Base):
    __tablename__ = "medical_bills"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    bill_number = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    appointment_id = Column(
        Integer,
        ForeignKey("appointments.id"),
        nullable=True,
        index=True,
    )

    consultation_amount = Column(
        Float,
        nullable=False,
        default=0,
    )

    laboratory_amount = Column(
        Float,
        nullable=False,
        default=0,
    )

    medicine_amount = Column(
        Float,
        nullable=False,
        default=0,
    )

    procedure_amount = Column(
        Float,
        nullable=False,
        default=0,
    )

    imaging_amount = Column(
        Float,
        nullable=False,
        default=0,
    )

    room_amount = Column(
        Float,
        nullable=False,
        default=0,
    )

    other_amount = Column(
        Float,
        nullable=False,
        default=0,
    )

    discount = Column(
        Float,
        nullable=False,
        default=0,
    )

    tax = Column(
        Float,
        nullable=False,
        default=0,
    )

    insurance_amount = Column(
        Float,
        nullable=False,
        default=0,
    )

    subtotal = Column(
        Float,
        nullable=False,
        default=0,
    )

    total_amount = Column(
        Float,
        nullable=False,
        default=0,
    )

    amount_paid = Column(
        Float,
        nullable=False,
        default=0,
    )

    amount_due = Column(
        Float,
        nullable=False,
        default=0,
    )

    payment_status = Column(
        String,
        nullable=False,
        default="Pending",
        index=True,
    )

    transaction_id = Column(
        String,
        nullable=True,
        unique=True,
        index=True,
    )

    payment_method = Column(
        String,
        nullable=True,
    )

    bill_date = Column(
        String,
        nullable=False,
        index=True,
    )

    due_date = Column(
        String,
        nullable=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=True,
    )

    updated_at = Column(
        DateTime,
        nullable=True,
    )


class BillItem(Base):
    __tablename__ = "bill_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    bill_id = Column(
        Integer,
        ForeignKey("medical_bills.id"),
        nullable=False,
        index=True,
    )

    item_type = Column(
        String,
        nullable=False,
    )

    item_name = Column(
        String,
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    quantity = Column(
        Integer,
        nullable=False,
        default=1,
    )

    unit_price = Column(
        Float,
        nullable=False,
        default=0,
    )

    discount = Column(
        Float,
        nullable=False,
        default=0,
    )

    tax = Column(
        Float,
        nullable=False,
        default=0,
    )

    total_amount = Column(
        Float,
        nullable=False,
        default=0,
    )


class PaymentRecord(Base):
    __tablename__ = "payment_records"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    payment_number = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    bill_id = Column(
        Integer,
        ForeignKey("medical_bills.id"),
        nullable=False,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    amount = Column(
        Float,
        nullable=False,
        default=0,
    )

    payment_date = Column(
        String,
        nullable=False,
    )

    payment_method = Column(
        String,
        nullable=False,
        default="Cash",
    )

    payment_reference = Column(
        String,
        nullable=True,
        index=True,
    )

    payment_status = Column(
        String,
        nullable=False,
        default="Completed",
    )

    notes = Column(
        Text,
        nullable=True,
    )


# ============================================================
# ROOMS / BEDS
# ============================================================


class Room(Base):
    __tablename__ = "rooms"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    room_number = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    room_type = Column(
        String,
        nullable=False,
    )

    floor = Column(
        String,
        nullable=True,
    )

    building = Column(
        String,
        nullable=True,
    )

    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=True,
    )

    capacity = Column(
        Integer,
        nullable=False,
        default=1,
    )

    occupied_count = Column(
        Integer,
        nullable=False,
        default=0,
    )

    daily_rate = Column(
        Float,
        nullable=False,
        default=0,
    )

    status = Column(
        String,
        nullable=False,
        default="Available",
        index=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )


class Bed(Base):
    __tablename__ = "beds"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    room_id = Column(
        Integer,
        ForeignKey("rooms.id"),
        nullable=False,
        index=True,
    )

    bed_number = Column(
        String,
        nullable=False,
        index=True,
    )

    bed_type = Column(
        String,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Available",
        index=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )


# ============================================================
# ADMISSIONS
# ============================================================


class Admission(Base):
    __tablename__ = "admissions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    admission_number = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    admitting_doctor_id = Column(
        Integer,
        ForeignKey("doctors.id"),
        nullable=True,
        index=True,
    )

    room_id = Column(
        Integer,
        ForeignKey("rooms.id"),
        nullable=True,
        index=True,
    )

    bed_id = Column(
        Integer,
        ForeignKey("beds.id"),
        nullable=True,
        index=True,
    )

    admission_date = Column(
        String,
        nullable=False,
    )

    admission_time = Column(
        String,
        nullable=True,
    )

    admission_type = Column(
        String,
        nullable=True,
        default="Elective",
    )

    admission_reason = Column(
        Text,
        nullable=True,
    )

    diagnosis_at_admission = Column(
        Text,
        nullable=True,
    )

    expected_discharge_date = Column(
        String,
        nullable=True,
    )

    actual_discharge_date = Column(
        String,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Admitted",
        index=True,
    )

    discharge_reason = Column(
        Text,
        nullable=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )


class DischargeSummary(Base):
    __tablename__ = "discharge_summaries"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    admission_id = Column(
        Integer,
        ForeignKey("admissions.id"),
        nullable=False,
        unique=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    doctor_id = Column(
        Integer,
        ForeignKey("doctors.id"),
        nullable=True,
    )

    discharge_date = Column(
        String,
        nullable=False,
    )

    final_diagnosis = Column(
        Text,
        nullable=True,
    )

    hospital_course = Column(
        Text,
        nullable=True,
    )

    procedures_performed = Column(
        Text,
        nullable=True,
    )

    medications_at_discharge = Column(
        Text,
        nullable=True,
    )

    follow_up_instructions = Column(
        Text,
        nullable=True,
    )

    warning_signs = Column(
        Text,
        nullable=True,
    )

    doctor_notes = Column(
        Text,
        nullable=True,
    )


# ============================================================
# CARE PLANS
# ============================================================


class CarePlan(Base):
    __tablename__ = "care_plans"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    plan_number = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    doctor_id = Column(
        Integer,
        ForeignKey("doctors.id"),
        nullable=True,
        index=True,
    )

    diagnosis = Column(
        Text,
        nullable=True,
    )

    goals = Column(
        Text,
        nullable=True,
    )

    interventions = Column(
        Text,
        nullable=True,
    )

    monitoring_plan = Column(
        Text,
        nullable=True,
    )

    start_date = Column(
        String,
        nullable=False,
    )

    target_date = Column(
        String,
        nullable=True,
    )

    review_date = Column(
        String,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Active",
        index=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )


# ============================================================
# REFERRALS
# ============================================================


class Referral(Base):
    __tablename__ = "referrals"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    referral_number = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    referring_doctor_id = Column(
        Integer,
        ForeignKey("doctors.id"),
        nullable=True,
    )

    referred_department = Column(
        String,
        nullable=True,
    )

    referred_doctor_name = Column(
        String,
        nullable=True,
    )

    referral_date = Column(
        String,
        nullable=False,
    )

    reason = Column(
        Text,
        nullable=False,
    )

    clinical_summary = Column(
        Text,
        nullable=True,
    )

    urgency = Column(
        String,
        nullable=False,
        default="Routine",
    )

    status = Column(
        String,
        nullable=False,
        default="Pending",
        index=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )


# ============================================================
# DOCUMENT MANAGEMENT
# ============================================================


class MedicalDocument(Base):
    __tablename__ = "medical_documents"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    document_number = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    medical_record_id = Column(
        Integer,
        ForeignKey("medical_records.id"),
        nullable=True,
        index=True,
    )

    document_type = Column(
        String,
        nullable=False,
        index=True,
    )

    title = Column(
        String,
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    file_name = Column(
        String,
        nullable=True,
    )

    file_path = Column(
        String,
        nullable=True,
    )

    file_type = Column(
        String,
        nullable=True,
    )

    file_size = Column(
        Integer,
        nullable=True,
    )

    uploaded_by = Column(
        String,
        nullable=True,
    )

    uploaded_at = Column(
        DateTime,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Active",
    )


# ============================================================
# STAFF
# ============================================================


class StaffMember(Base):
    __tablename__ = "staff_members"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    employee_code = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    name = Column(
        String,
        nullable=False,
        index=True,
    )

    role = Column(
        String,
        nullable=False,
        index=True,
    )

    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=True,
    )

    phone = Column(
        String,
        nullable=True,
    )

    email = Column(
        String,
        nullable=True,
    )

    qualification = Column(
        String,
        nullable=True,
    )

    joining_date = Column(
        String,
        nullable=True,
    )

    shift = Column(
        String,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Active",
        index=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )


# ============================================================
# USER ROLES / ACCESS
# ============================================================


class SystemUser(Base):
    __tablename__ = "system_users"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    username = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    display_name = Column(
        String,
        nullable=False,
    )

    role = Column(
        String,
        nullable=False,
        index=True,
    )

    staff_id = Column(
        Integer,
        ForeignKey("staff_members.id"),
        nullable=True,
    )

    doctor_id = Column(
        Integer,
        ForeignKey("doctors.id"),
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Active",
    )

    last_login_at = Column(
        DateTime,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=True,
    )


# ============================================================
# AUDIT / SYSTEM EVENTS
# ============================================================


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    event_type = Column(
        String,
        nullable=False,
        index=True,
    )

    entity_type = Column(
        String,
        nullable=False,
        index=True,
    )

    entity_id = Column(
        Integer,
        nullable=True,
        index=True,
    )

    username = Column(
        String,
        nullable=True,
        index=True,
    )

    action = Column(
        String,
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    event_time = Column(
        DateTime,
        nullable=True,
        index=True,
    )

    ip_address = Column(
        String,
        nullable=True,
    )

    success = Column(
        Boolean,
        nullable=False,
        default=True,
    )


# ============================================================
# NOTIFICATIONS
# ============================================================


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=True,
        index=True,
    )

    doctor_id = Column(
        Integer,
        ForeignKey("doctors.id"),
        nullable=True,
        index=True,
    )

    notification_type = Column(
        String,
        nullable=False,
    )

    title = Column(
        String,
        nullable=False,
    )

    message = Column(
        Text,
        nullable=False,
    )

    scheduled_for = Column(
        DateTime,
        nullable=True,
    )

    sent_at = Column(
        DateTime,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Pending",
        index=True,
    )

    priority = Column(
        String,
        nullable=False,
        default="Normal",
    )


# ============================================================
# FOLLOW-UP MANAGEMENT
# ============================================================


class FollowUp(Base):
    __tablename__ = "follow_ups"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    doctor_id = Column(
        Integer,
        ForeignKey("doctors.id"),
        nullable=True,
    )

    medical_record_id = Column(
        Integer,
        ForeignKey("medical_records.id"),
        nullable=True,
    )

    follow_up_date = Column(
        String,
        nullable=False,
        index=True,
    )

    follow_up_time = Column(
        String,
        nullable=True,
    )

    purpose = Column(
        Text,
        nullable=True,
    )

    instructions = Column(
        Text,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Pending",
        index=True,
    )

    completed_at = Column(
        DateTime,
        nullable=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )


# ============================================================
# EMERGENCY CONTACT / TRIAGE
# ============================================================


class EmergencyVisit(Base):
    __tablename__ = "emergency_visits"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    emergency_number = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=True,
        index=True,
    )

    arrival_date = Column(
        String,
        nullable=False,
    )

    arrival_time = Column(
        String,
        nullable=True,
    )

    arrival_mode = Column(
        String,
        nullable=True,
    )

    chief_complaint = Column(
        Text,
        nullable=True,
    )

    triage_level = Column(
        String,
        nullable=True,
        index=True,
    )

    initial_vitals = Column(
        Text,
        nullable=True,
    )

    attending_doctor_id = Column(
        Integer,
        ForeignKey("doctors.id"),
        nullable=True,
    )

    disposition = Column(
        String,
        nullable=True,
    )

    discharge_time = Column(
        String,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Open",
        index=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )


# ============================================================
# HEALTHCARE SERVICE CATALOG
# ============================================================


class HealthcareService(Base):
    __tablename__ = "healthcare_services"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    service_code = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    service_name = Column(
        String,
        nullable=False,
        index=True,
    )

    category = Column(
        String,
        nullable=True,
        index=True,
    )

    description = Column(
        Text,
        nullable=True,
    )

    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=True,
    )

    standard_price = Column(
        Float,
        nullable=False,
        default=0,
    )

    duration_minutes = Column(
        Integer,
        nullable=True,
    )

    requires_appointment = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Active",
        index=True,
    )


# ============================================================
# SERVICE BOOKINGS
# ============================================================


class ServiceBooking(Base):
    __tablename__ = "service_bookings"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    booking_number = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    service_id = Column(
        Integer,
        ForeignKey("healthcare_services.id"),
        nullable=False,
        index=True,
    )

    doctor_id = Column(
        Integer,
        ForeignKey("doctors.id"),
        nullable=True,
    )

    booking_date = Column(
        String,
        nullable=False,
    )

    booking_time = Column(
        String,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Scheduled",
        index=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )


# ============================================================
# HEALTH EDUCATION / CARE RESOURCES
# ============================================================


class HealthResource(Base):
    __tablename__ = "health_resources"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    title = Column(
        String,
        nullable=False,
        index=True,
    )

    category = Column(
        String,
        nullable=True,
        index=True,
    )

    summary = Column(
        Text,
        nullable=True,
    )

    content = Column(
        Text,
        nullable=True,
    )

    author = Column(
        String,
        nullable=True,
    )

    published_date = Column(
        String,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Published",
        index=True,
    )


# ============================================================
# SYSTEM SETTINGS
# ============================================================


class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    setting_key = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    setting_value = Column(
        Text,
        nullable=True,
    )

    category = Column(
        String,
        nullable=True,
        index=True,
    )

    description = Column(
        Text,
        nullable=True,
    )

    editable = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    updated_at = Column(
        DateTime,
        nullable=True,
    )


# ============================================================
# CLINIC INVENTORY
# ============================================================


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    item_code = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    item_name = Column(
        String,
        nullable=False,
        index=True,
    )

    category = Column(
        String,
        nullable=True,
        index=True,
    )

    description = Column(
        Text,
        nullable=True,
    )

    unit = Column(
        String,
        nullable=True,
    )

    quantity = Column(
        Integer,
        nullable=False,
        default=0,
    )

    reorder_level = Column(
        Integer,
        nullable=False,
        default=10,
    )

    unit_cost = Column(
        Float,
        nullable=False,
        default=0,
    )

    supplier_name = Column(
        String,
        nullable=True,
    )

    batch_number = Column(
        String,
        nullable=True,
    )

    expiry_date = Column(
        String,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Available",
        index=True,
    )


# ============================================================
# INVENTORY MOVEMENTS
# ============================================================


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    inventory_item_id = Column(
        Integer,
        ForeignKey("inventory_items.id"),
        nullable=False,
        index=True,
    )

    movement_type = Column(
        String,
        nullable=False,
        index=True,
    )

    quantity = Column(
        Integer,
        nullable=False,
    )

    reference_number = Column(
        String,
        nullable=True,
    )

    movement_date = Column(
        String,
        nullable=False,
    )

    performed_by = Column(
        String,
        nullable=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )


# ============================================================
# APPOINTMENT WAITING QUEUE
# ============================================================


class WaitingQueueEntry(Base):
    __tablename__ = "waiting_queue"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    appointment_id = Column(
        Integer,
        ForeignKey("appointments.id"),
        nullable=True,
        index=True,
    )

    doctor_id = Column(
        Integer,
        ForeignKey("doctors.id"),
        nullable=True,
        index=True,
    )

    queue_date = Column(
        String,
        nullable=False,
        index=True,
    )

    queue_number = Column(
        Integer,
        nullable=False,
    )

    priority = Column(
        String,
        nullable=False,
        default="Normal",
    )

    check_in_time = Column(
        String,
        nullable=True,
    )

    called_time = Column(
        String,
        nullable=True,
    )

    completed_time = Column(
        String,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Waiting",
        index=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )


# ============================================================
# CLINIC FEEDBACK
# ============================================================


class PatientFeedback(Base):
    __tablename__ = "patient_feedback"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=True,
        index=True,
    )

    appointment_id = Column(
        Integer,
        ForeignKey("appointments.id"),
        nullable=True,
    )

    rating = Column(
        Integer,
        nullable=True,
    )

    category = Column(
        String,
        nullable=True,
    )

    comments = Column(
        Text,
        nullable=True,
    )

    submitted_date = Column(
        String,
        nullable=False,
    )

    status = Column(
        String,
        nullable=False,
        default="Submitted",
    )


# ============================================================
# COMPLAINT / INCIDENT MANAGEMENT
# ============================================================


class PatientComplaint(Base):
    __tablename__ = "patient_complaints"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    complaint_number = Column(
        String,
        unique=True,
        nullable=True,
        index=True,
    )

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=True,
        index=True,
    )

    complaint_type = Column(
        String,
        nullable=False,
        index=True,
    )

    subject = Column(
        String,
        nullable=False,
    )

    description = Column(
        Text,
        nullable=False,
    )

    priority = Column(
        String,
        nullable=False,
        default="Normal",
    )

    assigned_to = Column(
        String,
        nullable=True,
    )

    submitted_date = Column(
        String,
        nullable=False,
    )

    resolved_date = Column(
        String,
        nullable=True,
    )

    resolution = Column(
        Text,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,
        default="Open",
        index=True,
    )


# ============================================================
# REPORT DEFINITIONS
# ============================================================


class ReportDefinition(Base):
    __tablename__ = "report_definitions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    report_code = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    report_name = Column(
        String,
        nullable=False,
    )

    category = Column(
        String,
        nullable=True,
    )

    description = Column(
        Text,
        nullable=True,
    )

    query_type = Column(
        String,
        nullable=True,
    )

    enabled = Column(
        Boolean,
        nullable=False,
        default=True,
    )


# ============================================================
# IMPORTANT DATABASE INDEXES
# ============================================================


Index(
    "ix_medical_records_patient_date",
    MedicalRecord.patient_id,
    MedicalRecord.record_date,
)

Index(
    "ix_appointments_doctor_date",
    Appointment.doctor_id,
    Appointment.appointment_date,
)

Index(
    "ix_bills_patient_status",
    MedicalBill.patient_id,
    MedicalBill.payment_status,
)

Index(
    "ix_lab_orders_patient_status",
    LaboratoryOrder.patient_id,
    LaboratoryOrder.status,
)

Index(
    "ix_prescriptions_patient_date",
    Prescription.patient_id,
    Prescription.prescription_date,
)

Index(
    "ix_waiting_queue_date_status",
    WaitingQueueEntry.queue_date,
    WaitingQueueEntry.status,
)