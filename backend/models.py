from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    phone = Column(String, nullable=False)


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    specialization = Column(String, nullable=False)
    phone = Column(String, nullable=False)


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, nullable=False)
    doctor_id = Column(Integer, nullable=False)
    appointment_date = Column(String, nullable=False)
    appointment_time = Column(String, nullable=False)
    reason = Column(String, nullable=False)


class MedicalBill(Base):
    __tablename__ = "medical_bills"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False,
        index=True,
    )

    consultation_amount = Column(Float, nullable=False, default=0)
    laboratory_amount = Column(Float, nullable=False, default=0)
    medicine_amount = Column(Float, nullable=False, default=0)
    procedure_amount = Column(Float, nullable=False, default=0)
    other_amount = Column(Float, nullable=False, default=0)

    discount = Column(Float, nullable=False, default=0)
    tax = Column(Float, nullable=False, default=0)

    subtotal = Column(Float, nullable=False, default=0)
    total_amount = Column(Float, nullable=False, default=0)

    payment_status = Column(
        String,
        nullable=False,
        default="Pending",
    )

    transaction_id = Column(
        String,
        nullable=True,
        unique=True,
        index=True,
    )

    bill_date = Column(String, nullable=False)


# ============================================================
# INPATIENT & BED MANAGEMENT (ADT)
# ============================================================

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    department_code = Column(String, nullable=True, unique=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    floor = Column(String, nullable=True)
    building = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    head_doctor_id = Column(Integer, nullable=True)
    status = Column(String, nullable=False, default="Active")


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    room_number = Column(String, nullable=False, unique=True, index=True)
    room_type = Column(String, nullable=False)
    floor = Column(String, nullable=True)
    building = Column(String, nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    capacity = Column(Integer, nullable=False, default=1)
    occupied_count = Column(Integer, nullable=False, default=0)
    daily_rate = Column(Float, nullable=False, default=0.0)
    status = Column(String, nullable=False, default="Available")
    notes = Column(Text, nullable=True)


class Bed(Base):
    __tablename__ = "beds"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False, index=True)
    bed_number = Column(String, nullable=False, unique=True, index=True)
    bed_type = Column(String, nullable=True)
    status = Column(String, nullable=False, default="Available")
    notes = Column(Text, nullable=True)


class Admission(Base):
    __tablename__ = "admissions"

    id = Column(Integer, primary_key=True, index=True)
    admission_number = Column(String, nullable=True, unique=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    admitting_doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=True)
    bed_id = Column(Integer, ForeignKey("beds.id"), nullable=True)
    admission_date = Column(String, nullable=False)
    admission_time = Column(String, nullable=True)
    admission_type = Column(String, nullable=True, default="Elective")
    admission_reason = Column(Text, nullable=True)
    diagnosis_at_admission = Column(Text, nullable=True)
    expected_discharge_date = Column(String, nullable=True)
    actual_discharge_date = Column(String, nullable=True)
    status = Column(String, nullable=False, default="Admitted")
    discharge_reason = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)


class DischargeSummary(Base):
    __tablename__ = "discharge_summaries"

    id = Column(Integer, primary_key=True, index=True)
    admission_id = Column(Integer, ForeignKey("admissions.id"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)
    discharge_date = Column(String, nullable=False)
    final_diagnosis = Column(Text, nullable=True)
    hospital_course = Column(Text, nullable=True)
    procedures_performed = Column(Text, nullable=True)
    medications_at_discharge = Column(Text, nullable=True)
    follow_up_instructions = Column(Text, nullable=True)
    warning_signs = Column(Text, nullable=True)
    doctor_notes = Column(Text, nullable=True)


# ============================================================
# LABORATORY INFORMATION SYSTEM (LIS)
# ============================================================

class LabTestCategory(Base):
    __tablename__ = "lab_test_categories"

    id = Column(Integer, primary_key=True, index=True)
    category_code = Column(String, nullable=False, unique=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    department = Column(String, nullable=True)
    display_order = Column(Integer, nullable=False, default=0)
    status = Column(String, nullable=False, default="Active")
    created_at = Column(String, nullable=True)
    updated_at = Column(String, nullable=True)


class LabTest(Base):
    __tablename__ = "lab_tests"

    id = Column(Integer, primary_key=True, index=True)
    test_code = Column(String, nullable=False, unique=True, index=True)
    test_name = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey("lab_test_categories.id"), nullable=True)
    description = Column(Text, nullable=True)
    specimen_type = Column(String, nullable=True)
    specimen_container = Column(String, nullable=True)
    fasting_required = Column(String, nullable=False, default="No")
    preparation_instructions = Column(Text, nullable=True)
    result_type = Column(String, nullable=False, default="Numeric")
    unit = Column(String, nullable=True)
    reference_range = Column(String, nullable=True)
    male_reference_range = Column(String, nullable=True)
    female_reference_range = Column(String, nullable=True)
    child_reference_range = Column(String, nullable=True)
    critical_low_value = Column(String, nullable=True)
    critical_high_value = Column(String, nullable=True)
    turnaround_time_hours = Column(Integer, nullable=False, default=24)
    price = Column(Float, nullable=False, default=0.0)
    status = Column(String, nullable=False, default="Active")
    created_at = Column(String, nullable=True)
    updated_at = Column(String, nullable=True)


class LabOrder(Base):
    __tablename__ = "lab_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, nullable=False, unique=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)
    appointment_id = Column(Integer, nullable=True)
    order_date = Column(String, nullable=False)
    priority = Column(String, nullable=False, default="Routine")
    clinical_notes = Column(Text, nullable=True)
    diagnosis_notes = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="Ordered")
    collection_status = Column(String, nullable=False, default="Pending")
    billing_status = Column(String, nullable=False, default="Pending")
    total_amount = Column(Float, nullable=False, default=0.0)
    created_at = Column(String, nullable=True)
    updated_at = Column(String, nullable=True)


class LabOrderItem(Base):
    __tablename__ = "lab_order_items"

    id = Column(Integer, primary_key=True, index=True)
    lab_order_id = Column(Integer, ForeignKey("lab_orders.id"), nullable=False, index=True)
    lab_test_id = Column(Integer, ForeignKey("lab_tests.id"), nullable=False, index=True)
    requested_price = Column(Float, nullable=False, default=0.0)
    specimen_type = Column(String, nullable=True)
    specimen_id = Column(String, nullable=True)
    collection_date = Column(String, nullable=True)
    collection_time = Column(String, nullable=True)
    collected_by = Column(String, nullable=True)
    status = Column(String, nullable=False, default="Ordered")
    notes = Column(Text, nullable=True)
    created_at = Column(String, nullable=True)
    updated_at = Column(String, nullable=True)


class LabSample(Base):
    __tablename__ = "lab_samples"

    id = Column(Integer, primary_key=True, index=True)
    sample_number = Column(String, nullable=False, unique=True, index=True)
    lab_order_item_id = Column(Integer, ForeignKey("lab_order_items.id"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    specimen_type = Column(String, nullable=False)
    container_type = Column(String, nullable=True)
    collection_date = Column(String, nullable=False)
    collection_time = Column(String, nullable=False)
    collected_by = Column(String, nullable=True)
    received_date = Column(String, nullable=True)
    received_time = Column(String, nullable=True)
    received_by = Column(String, nullable=True)
    storage_location = Column(String, nullable=True)
    condition = Column(String, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="Collected")
    created_at = Column(String, nullable=True)
    updated_at = Column(String, nullable=True)


class LabResult(Base):
    __tablename__ = "lab_results"

    id = Column(Integer, primary_key=True, index=True)
    lab_order_item_id = Column(Integer, ForeignKey("lab_order_items.id"), nullable=False, index=True)
    lab_test_id = Column(Integer, ForeignKey("lab_tests.id"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    result_value = Column(String, nullable=True)
    result_numeric_value = Column(Float, nullable=True)
    result_text = Column(Text, nullable=True)
    unit = Column(String, nullable=True)
    reference_range = Column(String, nullable=True)
    abnormal_flag = Column(String, nullable=False, default="Normal")
    critical_flag = Column(String, nullable=False, default="Normal")
    interpretation = Column(Text, nullable=True)
    technician_notes = Column(Text, nullable=True)
    performed_by = Column(String, nullable=True)
    result_date = Column(String, nullable=True)
    result_time = Column(String, nullable=True)
    verification_status = Column(String, nullable=False, default="Pending")
    verified_by = Column(String, nullable=True)
    verification_date = Column(String, nullable=True)
    verification_notes = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="Completed")
    created_at = Column(String, nullable=True)
    updated_at = Column(String, nullable=True)


class LabReport(Base):
    __tablename__ = "lab_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_number = Column(String, nullable=False, unique=True, index=True)
    lab_order_id = Column(Integer, ForeignKey("lab_orders.id"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=True)
    report_title = Column(String, nullable=False)
    report_summary = Column(Text, nullable=True)
    clinical_interpretation = Column(Text, nullable=True)
    abnormal_result_count = Column(Integer, nullable=False, default=0)
    critical_result_count = Column(Integer, nullable=False, default=0)
    generated_date = Column(String, nullable=True)
    verified_date = Column(String, nullable=True)
    verified_by = Column(String, nullable=True)
    status = Column(String, nullable=False, default="Final")
    created_at = Column(String, nullable=True)
    updated_at = Column(String, nullable=True)
