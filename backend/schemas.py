# ============================================================
# MEDICARE CLINIC MANAGEMENT SYSTEM
# PYDANTIC API SCHEMAS
# ============================================================
#
# This module contains request and response schemas used by
# the FastAPI application.
#
# Design goals:
#   - Clear separation between API input and database models
#   - Strong validation for healthcare-related values
#   - Reusable response models
#   - Support for medical records and clinical workflows
#   - Support for billing, pharmacy, laboratory and operations
#   - Synthetic/demo healthcare data only
#
# ============================================================

from datetime import date, datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ============================================================
# COMMON BASE SCHEMAS
# ============================================================


class APIBaseSchema(BaseModel):
    """
    Common configuration for API schemas.

    from_attributes allows Pydantic to construct response
    objects directly from SQLAlchemy model instances.
    """

    model_config = ConfigDict(from_attributes=True)


class TimestampResponse(APIBaseSchema):
    """
    Generic timestamp response.
    """

    created_at: datetime
    updated_at: datetime | None = None


class MessageResponse(BaseModel):
    """
    Generic API message response.
    """

    message: str
    success: bool = True


class DeleteResponse(BaseModel):
    """
    Standard delete response.
    """

    id: int
    deleted: bool
    message: str


class PaginationRequest(BaseModel):
    """
    Generic pagination parameters.

    These fields can later be used by list/search endpoints.
    """

    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=25, ge=1, le=250)


class PaginationResponse(BaseModel):
    """
    Generic pagination metadata.
    """

    page: int
    page_size: int
    total: int
    total_pages: int


# ============================================================
# PATIENT MANAGEMENT
# ============================================================


class PatientCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    age: int = Field(ge=0, le=150)
    phone: str = Field(min_length=3, max_length=30)


class PatientUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    age: int | None = Field(default=None, ge=0, le=150)
    phone: str | None = Field(default=None, min_length=3, max_length=30)


class PatientResponse(APIBaseSchema):
    id: int
    name: str
    age: int
    phone: str


class PatientSummary(APIBaseSchema):
    id: int
    name: str
    age: int
    phone: str


class PatientSearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=150)


class PatientListResponse(BaseModel):
    patients: list[PatientResponse]
    total: int


class PatientDashboardResponse(BaseModel):
    patient: PatientResponse
    appointment_count: int = 0
    medical_record_count: int = 0
    prescription_count: int = 0
    laboratory_order_count: int = 0
    bill_count: int = 0
    outstanding_balance: float = 0


# ============================================================
# DOCTOR MANAGEMENT
# ============================================================


class DoctorCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    specialization: str = Field(min_length=1, max_length=150)
    phone: str = Field(min_length=3, max_length=30)


class DoctorUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    specialization: str | None = Field(
        default=None,
        min_length=1,
        max_length=150,
    )
    phone: str | None = Field(default=None, min_length=3, max_length=30)


class DoctorResponse(APIBaseSchema):
    id: int
    name: str
    specialization: str
    phone: str


class DoctorSummary(APIBaseSchema):
    id: int
    name: str
    specialization: str


class DoctorSearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=150)


class DoctorListResponse(BaseModel):
    doctors: list[DoctorResponse]
    total: int


# ============================================================
# APPOINTMENT MANAGEMENT
# ============================================================


class AppointmentCreate(BaseModel):
    patient_id: int = Field(gt=0)
    doctor_id: int = Field(gt=0)
    appointment_date: str
    appointment_time: str
    reason: str = Field(min_length=1, max_length=1000)


class AppointmentUpdate(BaseModel):
    patient_id: int | None = Field(default=None, gt=0)
    doctor_id: int | None = Field(default=None, gt=0)
    appointment_date: str | None = None
    appointment_time: str | None = None
    reason: str | None = Field(default=None, max_length=1000)


class AppointmentResponse(APIBaseSchema):
    id: int
    patient_id: int
    doctor_id: int
    appointment_date: str
    appointment_time: str
    reason: str


class AppointmentSummary(APIBaseSchema):
    id: int
    patient_id: int
    doctor_id: int
    appointment_date: str
    appointment_time: str


class AppointmentStatusUpdate(BaseModel):
    status: str = Field(min_length=1, max_length=50)


class AppointmentSearchRequest(BaseModel):
    patient_id: int | None = Field(default=None, gt=0)
    doctor_id: int | None = Field(default=None, gt=0)
    appointment_date: str | None = None
    status: str | None = None


class AppointmentListResponse(BaseModel):
    appointments: list[AppointmentResponse]
    total: int


# ============================================================
# MEDICAL BILLING
# ============================================================


class MedicalBillCreate(BaseModel):
    patient_id: int = Field(gt=0)

    consultation_amount: float = Field(default=0, ge=0)
    laboratory_amount: float = Field(default=0, ge=0)
    medicine_amount: float = Field(default=0, ge=0)
    procedure_amount: float = Field(default=0, ge=0)
    other_amount: float = Field(default=0, ge=0)

    discount: float = Field(default=0, ge=0)
    tax: float = Field(default=0, ge=0)

    bill_date: str


class MedicalBillUpdate(BaseModel):
    consultation_amount: float | None = Field(default=None, ge=0)
    laboratory_amount: float | None = Field(default=None, ge=0)
    medicine_amount: float | None = Field(default=None, ge=0)
    procedure_amount: float | None = Field(default=None, ge=0)
    other_amount: float | None = Field(default=None, ge=0)
    discount: float | None = Field(default=None, ge=0)
    tax: float | None = Field(default=None, ge=0)
    payment_status: str | None = None


class MedicalBillResponse(APIBaseSchema):
    id: int
    patient_id: int

    consultation_amount: float
    laboratory_amount: float
    medicine_amount: float
    procedure_amount: float
    other_amount: float

    discount: float
    tax: float

    subtotal: float
    total_amount: float

    payment_status: str
    transaction_id: str | None
    bill_date: str


class MedicalBillSummary(BaseModel):
    total_bills: int
    total_billed_amount: float
    total_paid_amount: float
    total_pending_amount: float
    total_cancelled_amount: float


class PaymentStatusUpdate(BaseModel):
    payment_status: str = Field(min_length=1, max_length=50)


class InvoiceResponse(BaseModel):
    bill_id: int
    patient_id: int
    invoice_number: str
    subtotal: float
    discount: float
    tax: float
    total_amount: float
    payment_status: str
    bill_date: str


# ============================================================
# MEDICAL RECORDS
# ============================================================


class MedicalRecordCreate(BaseModel):
    patient_id: int = Field(gt=0)
    doctor_id: int | None = Field(default=None, gt=0)
    appointment_id: int | None = Field(default=None, gt=0)

    record_number: str = Field(min_length=1, max_length=100)
    visit_date: datetime

    record_type: str = Field(
        default="Consultation",
        max_length=100,
    )

    chief_complaint: str | None = Field(
        default=None,
        max_length=2000,
    )

    history_of_present_illness: str | None = None
    examination_notes: str | None = None
    assessment: str | None = None
    plan: str | None = None

    status: str = Field(
        default="Active",
        max_length=50,
    )

    confidentiality_level: str = Field(
        default="Standard",
        max_length=50,
    )


class MedicalRecordUpdate(BaseModel):
    doctor_id: int | None = Field(default=None, gt=0)
    appointment_id: int | None = Field(default=None, gt=0)
    record_type: str | None = None
    chief_complaint: str | None = None
    history_of_present_illness: str | None = None
    examination_notes: str | None = None
    assessment: str | None = None
    plan: str | None = None
    status: str | None = None
    confidentiality_level: str | None = None


class MedicalRecordResponse(APIBaseSchema):
    id: int
    patient_id: int
    doctor_id: int | None
    appointment_id: int | None
    record_number: str
    visit_date: datetime
    record_type: str
    chief_complaint: str | None
    history_of_present_illness: str | None
    examination_notes: str | None
    assessment: str | None
    plan: str | None
    status: str
    confidentiality_level: str
    created_at: datetime
    updated_at: datetime


class MedicalRecordSummary(APIBaseSchema):
    id: int
    patient_id: int
    doctor_id: int | None
    record_number: str
    visit_date: datetime
    record_type: str
    status: str


class MedicalRecordSearchRequest(BaseModel):
    patient_id: int | None = Field(default=None, gt=0)
    doctor_id: int | None = Field(default=None, gt=0)
    record_type: str | None = None
    status: str | None = None
    query: str | None = None


# ============================================================
# DIAGNOSIS
# ============================================================


class DiagnosisCreate(BaseModel):
    code: str = Field(min_length=1, max_length=50)
    name: str = Field(min_length=1, max_length=200)
    description: str | None = None
    category: str | None = Field(default=None, max_length=100)
    severity: str | None = Field(default=None, max_length=50)
    active: bool = True


class DiagnosisUpdate(BaseModel):
    code: str | None = None
    name: str | None = None
    description: str | None = None
    category: str | None = None
    severity: str | None = None
    active: bool | None = None


class DiagnosisResponse(APIBaseSchema):
    id: int
    code: str
    name: str
    description: str | None
    category: str | None
    severity: str | None
    active: bool


class MedicalRecordDiagnosisCreate(BaseModel):
    record_id: int = Field(gt=0)
    diagnosis_id: int = Field(gt=0)
    diagnosis_status: str = "Active"
    onset_date: date | None = None
    notes: str | None = None
    primary_diagnosis: bool = False


class MedicalRecordDiagnosisResponse(APIBaseSchema):
    id: int
    record_id: int
    diagnosis_id: int
    diagnosis_status: str
    onset_date: date | None
    notes: str | None
    primary_diagnosis: bool
    created_at: datetime


class DiagnosisAssignmentRequest(BaseModel):
    diagnosis_id: int = Field(gt=0)
    primary_diagnosis: bool = False
    notes: str | None = None


# ============================================================
# VITAL SIGNS
# ============================================================


class VitalSignCreate(BaseModel):
    patient_id: int = Field(gt=0)
    record_id: int | None = Field(default=None, gt=0)

    measured_at: datetime

    temperature: float | None = None
    heart_rate: int | None = Field(default=None, ge=0, le=300)
    respiratory_rate: int | None = Field(default=None, ge=0, le=100)

    systolic_bp: int | None = Field(default=None, ge=0, le=300)
    diastolic_bp: int | None = Field(default=None, ge=0, le=250)

    oxygen_saturation: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    weight: float | None = Field(default=None, ge=0)
    height: float | None = Field(default=None, ge=0)
    bmi: float | None = Field(default=None, ge=0)

    pain_score: int | None = Field(
        default=None,
        ge=0,
        le=10,
    )

    blood_glucose: float | None = Field(
        default=None,
        ge=0,
    )

    notes: str | None = None


class VitalSignUpdate(BaseModel):
    temperature: float | None = None
    heart_rate: int | None = Field(default=None, ge=0, le=300)
    respiratory_rate: int | None = Field(default=None, ge=0, le=100)
    systolic_bp: int | None = Field(default=None, ge=0, le=300)
    diastolic_bp: int | None = Field(default=None, ge=0, le=250)
    oxygen_saturation: float | None = Field(default=None, ge=0, le=100)
    weight: float | None = Field(default=None, ge=0)
    height: float | None = Field(default=None, ge=0)
    bmi: float | None = Field(default=None, ge=0)
    pain_score: int | None = Field(default=None, ge=0, le=10)
    blood_glucose: float | None = Field(default=None, ge=0)
    notes: str | None = None


class VitalSignResponse(APIBaseSchema):
    id: int
    patient_id: int
    record_id: int | None
    measured_at: datetime
    temperature: float | None
    heart_rate: int | None
    respiratory_rate: int | None
    systolic_bp: int | None
    diastolic_bp: int | None
    oxygen_saturation: float | None
    weight: float | None
    height: float | None
    bmi: float | None
    pain_score: int | None
    blood_glucose: float | None
    notes: str | None


class VitalSignsHistoryResponse(BaseModel):
    patient_id: int
    measurements: list[VitalSignResponse]
    total: int


# ============================================================
# CLINICAL NOTES
# ============================================================


class ClinicalNoteCreate(BaseModel):
    patient_id: int = Field(gt=0)
    doctor_id: int | None = Field(default=None, gt=0)
    record_id: int | None = Field(default=None, gt=0)

    note_type: str = Field(
        default="Clinical",
        max_length=100,
    )

    title: str = Field(min_length=1, max_length=250)
    content: str = Field(min_length=1)

    status: str = Field(
        default="Draft",
        max_length=50,
    )


class ClinicalNoteUpdate(BaseModel):
    note_type: str | None = None
    title: str | None = None
    content: str | None = None
    status: str | None = None


class ClinicalNoteResponse(APIBaseSchema):
    id: int
    patient_id: int
    doctor_id: int | None
    record_id: int | None
    note_type: str
    title: str
    content: str
    status: str
    signed_at: datetime | None
    created_at: datetime
    updated_at: datetime


class ClinicalNoteSignRequest(BaseModel):
    signed_by: int = Field(gt=0)


# ============================================================
# MEDICATION CATALOG
# ============================================================


class MedicationCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    generic_name: str | None = None
    brand_name: str | None = None
    category: str | None = None
    dosage_form: str | None = None
    strength: str | None = None
    manufacturer: str | None = None
    active: bool = True
    prescription_required: bool = True


class MedicationUpdate(BaseModel):
    name: str | None = None
    generic_name: str | None = None
    brand_name: str | None = None
    category: str | None = None
    dosage_form: str | None = None
    strength: str | None = None
    manufacturer: str | None = None
    active: bool | None = None
    prescription_required: bool | None = None


class MedicationResponse(APIBaseSchema):
    id: int
    name: str
    generic_name: str | None
    brand_name: str | None
    category: str | None
    dosage_form: str | None
    strength: str | None
    manufacturer: str | None
    active: bool
    prescription_required: bool


class MedicationSearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=200)


# ============================================================
# PRESCRIPTIONS
# ============================================================


class PrescriptionCreate(BaseModel):
    patient_id: int = Field(gt=0)
    doctor_id: int = Field(gt=0)
    record_id: int | None = Field(default=None, gt=0)
    appointment_id: int | None = Field(default=None, gt=0)

    prescription_number: str = Field(
        min_length=1,
        max_length=100,
    )

    prescribed_at: datetime

    start_date: date | None = None
    end_date: date | None = None

    diagnosis_summary: str | None = None
    instructions: str | None = None

    status: str = "Active"
    notes: str | None = None


class PrescriptionUpdate(BaseModel):
    start_date: date | None = None
    end_date: date | None = None
    diagnosis_summary: str | None = None
    instructions: str | None = None
    status: str | None = None
    notes: str | None = None


class PrescriptionResponse(APIBaseSchema):
    id: int
    patient_id: int
    doctor_id: int
    record_id: int | None
    appointment_id: int | None
    prescription_number: str
    prescribed_at: datetime
    start_date: date | None
    end_date: date | None
    diagnosis_summary: str | None
    instructions: str | None
    status: str
    notes: str | None


class PrescriptionItemCreate(BaseModel):
    prescription_id: int = Field(gt=0)
    medication_id: int = Field(gt=0)

    medication_name_snapshot: str = Field(
        min_length=1,
        max_length=250,
    )

    dosage: str = Field(min_length=1, max_length=100)
    frequency: str = Field(min_length=1, max_length=100)

    route: str | None = None

    duration_value: int | None = Field(
        default=None,
        ge=0,
    )

    duration_unit: str | None = None

    quantity: int | None = Field(
        default=None,
        ge=0,
    )

    refills: int = Field(
        default=0,
        ge=0,
        le=100,
    )

    instructions: str | None = None

    before_meal: bool = False
    substitution_allowed: bool = True


class PrescriptionItemUpdate(BaseModel):
    dosage: str | None = None
    frequency: str | None = None
    route: str | None = None
    duration_value: int | None = Field(default=None, ge=0)
    duration_unit: str | None = None
    quantity: int | None = Field(default=None, ge=0)
    refills: int | None = Field(default=None, ge=0)
    instructions: str | None = None
    before_meal: bool | None = None
    substitution_allowed: bool | None = None


class PrescriptionItemResponse(APIBaseSchema):
    id: int
    prescription_id: int
    medication_id: int
    medication_name_snapshot: str
    dosage: str
    frequency: str
    route: str | None
    duration_value: int | None
    duration_unit: str | None
    quantity: int | None
    refills: int
    instructions: str | None
    before_meal: bool
    substitution_allowed: bool


class PrescriptionWithItemsResponse(PrescriptionResponse):
    items: list[PrescriptionItemResponse] = []


# ============================================================
# LABORATORY ORDERS
# ============================================================


class LabOrderCreate(BaseModel):
    patient_id: int = Field(gt=0)
    doctor_id: int = Field(gt=0)
    record_id: int | None = Field(default=None, gt=0)

    order_number: str = Field(
        min_length=1,
        max_length=100,
    )

    ordered_at: datetime

    priority: str = Field(
        default="Routine",
        max_length=50,
    )

    clinical_indication: str | None = None

    status: str = Field(
        default="Ordered",
        max_length=50,
    )

    specimen_type: str | None = None
    notes: str | None = None


class LabOrderUpdate(BaseModel):
    priority: str | None = None
    clinical_indication: str | None = None
    status: str | None = None
    specimen_type: str | None = None
    notes: str | None = None


class LabOrderResponse(APIBaseSchema):
    id: int
    patient_id: int
    doctor_id: int
    record_id: int | None
    order_number: str
    ordered_at: datetime
    priority: str
    clinical_indication: str | None
    status: str
    specimen_type: str | None
    notes: str | None


class LabResultCreate(BaseModel):
    lab_order_id: int = Field(gt=0)
    test_name: str = Field(min_length=1, max_length=250)
    test_code: str | None = None

    result_value: str = Field(
        min_length=1,
        max_length=1000,
    )

    result_unit: str | None = None
    reference_range: str | None = None
    abnormal_flag: str | None = None

    result_status: str = "Preliminary"

    observed_at: datetime
    verified_at: datetime | None = None

    comments: str | None = None


class LabResultUpdate(BaseModel):
    result_value: str | None = None
    result_unit: str | None = None
    reference_range: str | None = None
    abnormal_flag: str | None = None
    result_status: str | None = None
    verified_at: datetime | None = None
    comments: str | None = None


class LabResultResponse(APIBaseSchema):
    id: int
    lab_order_id: int
    test_name: str
    test_code: str | None
    result_value: str
    result_unit: str | None
    reference_range: str | None
    abnormal_flag: str | None
    result_status: str
    observed_at: datetime
    verified_at: datetime | None
    comments: str | None


class LabOrderWithResultsResponse(LabOrderResponse):
    results: list[LabResultResponse] = []


# ============================================================
# ALLERGIES
# ============================================================


class AllergyCreate(BaseModel):
    allergen_name: str = Field(min_length=1, max_length=200)
    allergen_type: str | None = None
    description: str | None = None
    active: bool = True


class AllergyUpdate(BaseModel):
    allergen_name: str | None = None
    allergen_type: str | None = None
    description: str | None = None
    active: bool | None = None


class AllergyResponse(APIBaseSchema):
    id: int
    allergen_name: str
    allergen_type: str | None
    description: str | None
    active: bool


class PatientAllergyCreate(BaseModel):
    patient_id: int = Field(gt=0)
    allergy_id: int = Field(gt=0)
    reaction: str | None = None
    severity: str | None = None
    onset_date: date | None = None
    verified: bool = False
    notes: str | None = None
    active: bool = True


class PatientAllergyUpdate(BaseModel):
    reaction: str | None = None
    severity: str | None = None
    onset_date: date | None = None
    verified: bool | None = None
    notes: str | None = None
    active: bool | None = None


class PatientAllergyResponse(APIBaseSchema):
    id: int
    patient_id: int
    allergy_id: int
    reaction: str | None
    severity: str | None
    onset_date: date | None
    verified: bool
    notes: str | None
    active: bool


# ============================================================
# CHRONIC CONDITIONS
# ============================================================


class ChronicConditionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    code: str | None = None
    description: str | None = None
    active: bool = True


class ChronicConditionUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    description: str | None = None
    active: bool | None = None


class ChronicConditionResponse(APIBaseSchema):
    id: int
    name: str
    code: str | None
    description: str | None
    active: bool


class PatientConditionCreate(BaseModel):
    patient_id: int = Field(gt=0)
    condition_id: int = Field(gt=0)
    diagnosed_date: date | None = None
    resolved_date: date | None = None
    status: str = "Active"
    severity: str | None = None
    notes: str | None = None


class PatientConditionUpdate(BaseModel):
    diagnosed_date: date | None = None
    resolved_date: date | None = None
    status: str | None = None
    severity: str | None = None
    notes: str | None = None


class PatientConditionResponse(APIBaseSchema):
    id: int
    patient_id: int
    condition_id: int
    diagnosed_date: date | None
    resolved_date: date | None
    status: str
    severity: str | None
    notes: str | None


# ============================================================
# IMMUNIZATION
# ============================================================


class ImmunizationCreate(BaseModel):
    patient_id: int = Field(gt=0)

    vaccine_name: str = Field(
        min_length=1,
        max_length=250,
    )

    dose_number: int | None = Field(
        default=None,
        ge=1,
    )

    administration_date: date

    lot_number: str | None = None
    manufacturer: str | None = None
    route: str | None = None
    site: str | None = None

    provider_doctor_id: int | None = Field(
        default=None,
        gt=0,
    )

    next_due_date: date | None = None

    status: str = "Completed"
    notes: str | None = None


class ImmunizationUpdate(BaseModel):
    vaccine_name: str | None = None
    dose_number: int | None = Field(default=None, ge=1)
    administration_date: date | None = None
    lot_number: str | None = None
    manufacturer: str | None = None
    route: str | None = None
    site: str | None = None
    provider_doctor_id: int | None = Field(default=None, gt=0)
    next_due_date: date | None = None
    status: str | None = None
    notes: str | None = None


class ImmunizationResponse(APIBaseSchema):
    id: int
    patient_id: int
    vaccine_name: str
    dose_number: int | None
    administration_date: date
    lot_number: str | None
    manufacturer: str | None
    route: str | None
    site: str | None
    provider_doctor_id: int | None
    next_due_date: date | None
    status: str
    notes: str | None


# ============================================================
# EMERGENCY CONTACTS
# ============================================================


class EmergencyContactCreate(BaseModel):
    patient_id: int = Field(gt=0)
    name: str = Field(min_length=1, max_length=150)
    relationship_to_patient: str = Field(
        min_length=1,
        max_length=100,
    )
    phone: str = Field(min_length=3, max_length=30)

    alternate_phone: str | None = None
    email: str | None = None
    address: str | None = None

    primary_contact: bool = False

    notes: str | None = None


class EmergencyContactUpdate(BaseModel):
    name: str | None = None
    relationship_to_patient: str | None = None
    phone: str | None = None
    alternate_phone: str | None = None
    email: str | None = None
    address: str | None = None
    primary_contact: bool | None = None
    notes: str | None = None


class EmergencyContactResponse(APIBaseSchema):
    id: int
    patient_id: int
    name: str
    relationship_to_patient: str
    phone: str
    alternate_phone: str | None
    email: str | None
    address: str | None
    primary_contact: bool
    notes: str | None


# ============================================================
# PATIENT INSURANCE
# ============================================================


class PatientInsuranceCreate(BaseModel):
    patient_id: int = Field(gt=0)

    provider_name: str = Field(
        min_length=1,
        max_length=200,
    )

    policy_number: str = Field(
        min_length=1,
        max_length=150,
    )

    member_id: str | None = None
    plan_name: str | None = None
    group_number: str | None = None

    coverage_start: date | None = None
    coverage_end: date | None = None

    policy_holder_name: str | None = None
    relationship_to_holder: str | None = None

    active: bool = True
    notes: str | None = None


class PatientInsuranceUpdate(BaseModel):
    provider_name: str | None = None
    policy_number: str | None = None
    member_id: str | None = None
    plan_name: str | None = None
    group_number: str | None = None
    coverage_start: date | None = None
    coverage_end: date | None = None
    policy_holder_name: str | None = None
    relationship_to_holder: str | None = None
    active: bool | None = None
    notes: str | None = None


class PatientInsuranceResponse(APIBaseSchema):
    id: int
    patient_id: int
    provider_name: str
    policy_number: str
    member_id: str | None
    plan_name: str | None
    group_number: str | None
    coverage_start: date | None
    coverage_end: date | None
    policy_holder_name: str | None
    relationship_to_holder: str | None
    active: bool
    notes: str | None


# ============================================================
# REFERRALS
# ============================================================


class ReferralCreate(BaseModel):
    patient_id: int = Field(gt=0)
    referring_doctor_id: int = Field(gt=0)
    referred_to_doctor_id: int | None = Field(default=None, gt=0)

    referral_number: str = Field(
        min_length=1,
        max_length=100,
    )

    referral_date: date

    specialty: str = Field(
        min_length=1,
        max_length=150,
    )

    reason: str = Field(
        min_length=1,
        max_length=2000,
    )

    urgency: str = "Routine"
    status: str = "Pending"

    clinical_summary: str | None = None
    instructions: str | None = None


class ReferralUpdate(BaseModel):
    referred_to_doctor_id: int | None = Field(default=None, gt=0)
    specialty: str | None = None
    reason: str | None = None
    urgency: str | None = None
    status: str | None = None
    clinical_summary: str | None = None
    instructions: str | None = None


class ReferralResponse(APIBaseSchema):
    id: int
    patient_id: int
    referring_doctor_id: int
    referred_to_doctor_id: int | None
    referral_number: str
    referral_date: date
    specialty: str
    reason: str
    urgency: str
    status: str
    clinical_summary: str | None
    instructions: str | None
    completed_date: date | None


# ============================================================
# CARE PLANS
# ============================================================


class CarePlanCreate(BaseModel):
    patient_id: int = Field(gt=0)
    doctor_id: int = Field(gt=0)
    record_id: int | None = Field(default=None, gt=0)

    title: str = Field(
        min_length=1,
        max_length=250,
    )

    description: str | None = None

    start_date: date
    target_date: date | None = None

    status: str = "Active"
    priority: str = "Normal"

    review_frequency: str | None = None
    next_review_date: date | None = None

    notes: str | None = None


class CarePlanUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    target_date: date | None = None
    status: str | None = None
    priority: str | None = None
    review_frequency: str | None = None
    next_review_date: date | None = None
    notes: str | None = None


class CarePlanResponse(APIBaseSchema):
    id: int
    patient_id: int
    doctor_id: int
    record_id: int | None
    title: str
    description: str | None
    start_date: date
    target_date: date | None
    status: str
    priority: str
    review_frequency: str | None
    next_review_date: date | None
    notes: str | None


class CarePlanGoalCreate(BaseModel):
    care_plan_id: int = Field(gt=0)

    title: str = Field(
        min_length=1,
        max_length=250,
    )

    description: str | None = None

    target_value: float | None = None
    unit: str | None = None
    current_value: float | None = None

    target_date: date | None = None

    status: str = "Active"

    progress_percent: float = Field(
        default=0,
        ge=0,
        le=100,
    )

    notes: str | None = None


class CarePlanGoalUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    target_value: float | None = None
    unit: str | None = None
    current_value: float | None = None
    target_date: date | None = None
    status: str | None = None
    progress_percent: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )
    notes: str | None = None


class CarePlanGoalResponse(APIBaseSchema):
    id: int
    care_plan_id: int
    title: str
    description: str | None
    target_value: float | None
    unit: str | None
    current_value: float | None
    target_date: date | None
    status: str
    progress_percent: float
    notes: str | None


# ============================================================
# FOLLOW-UP MANAGEMENT
# ============================================================


class FollowUpCreate(BaseModel):
    patient_id: int = Field(gt=0)
    doctor_id: int = Field(gt=0)
    record_id: int | None = Field(default=None, gt=0)
    appointment_id: int | None = Field(default=None, gt=0)

    scheduled_date: datetime

    follow_up_type: str = Field(
        min_length=1,
        max_length=100,
    )

    reason: str | None = None

    status: str = "Scheduled"

    instructions: str | None = None
    notes: str | None = None


class FollowUpUpdate(BaseModel):
    scheduled_date: datetime | None = None
    follow_up_type: str | None = None
    reason: str | None = None
    status: str | None = None
    instructions: str | None = None
    notes: str | None = None


class FollowUpResponse(APIBaseSchema):
    id: int
    patient_id: int
    doctor_id: int
    record_id: int | None
    appointment_id: int | None
    scheduled_date: datetime
    follow_up_type: str
    reason: str | None
    status: str
    instructions: str | None
    completed_date: datetime | None
    notes: str | None


# ============================================================
# PROCEDURE RECORDS
# ============================================================


class ProcedureRecordCreate(BaseModel):
    patient_id: int = Field(gt=0)
    doctor_id: int = Field(gt=0)
    record_id: int | None = Field(default=None, gt=0)

    procedure_code: str | None = None

    procedure_name: str = Field(
        min_length=1,
        max_length=250,
    )

    performed_at: datetime

    indication: str | None = None
    findings: str | None = None
    outcome: str | None = None
    complications: str | None = None
    anesthesia_type: str | None = None

    status: str = "Completed"

    notes: str | None = None


class ProcedureRecordUpdate(BaseModel):
    procedure_code: str | None = None
    procedure_name: str | None = None
    indication: str | None = None
    findings: str | None = None
    outcome: str | None = None
    complications: str | None = None
    anesthesia_type: str | None = None
    status: str | None = None
    notes: str | None = None


class ProcedureRecordResponse(APIBaseSchema):
    id: int
    patient_id: int
    doctor_id: int
    record_id: int | None
    procedure_code: str | None
    procedure_name: str
    performed_at: datetime
    indication: str | None
    findings: str | None
    outcome: str | None
    complications: str | None
    anesthesia_type: str | None
    status: str
    notes: str | None


# ============================================================
# ADMISSIONS
# ============================================================


class AdmissionCreate(BaseModel):
    patient_id: int = Field(gt=0)
    attending_doctor_id: int = Field(gt=0)

    admission_number: str = Field(
        min_length=1,
        max_length=100,
    )

    admitted_at: datetime

    admission_type: str = "Routine"

    reason: str = Field(
        min_length=1,
        max_length=2000,
    )

    diagnosis_on_admission: str | None = None

    status: str = "Admitted"

    ward_name: str | None = None
    room_number: str | None = None
    bed_number: str | None = None

    notes: str | None = None


class AdmissionUpdate(BaseModel):
    attending_doctor_id: int | None = Field(default=None, gt=0)
    admission_type: str | None = None
    reason: str | None = None
    diagnosis_on_admission: str | None = None
    status: str | None = None
    ward_name: str | None = None
    room_number: str | None = None
    bed_number: str | None = None
    notes: str | None = None


class AdmissionResponse(APIBaseSchema):
    id: int
    patient_id: int
    attending_doctor_id: int
    admission_number: str
    admitted_at: datetime
    discharge_at: datetime | None
    admission_type: str
    reason: str
    diagnosis_on_admission: str | None
    status: str
    ward_name: str | None
    room_number: str | None
    bed_number: str | None
    notes: str | None


# ============================================================
# DISCHARGE SUMMARIES
# ============================================================


class DischargeSummaryCreate(BaseModel):
    admission_id: int = Field(gt=0)
    patient_id: int = Field(gt=0)
    doctor_id: int = Field(gt=0)

    summary_number: str = Field(
        min_length=1,
        max_length=100,
    )

    discharge_date: date

    final_diagnosis: str | None = None
    hospital_course: str | None = None
    procedures_summary: str | None = None
    medications_on_discharge: str | None = None
    follow_up_instructions: str | None = None
    condition_at_discharge: str | None = None
    restrictions: str | None = None
    notes: str | None = None


class DischargeSummaryUpdate(BaseModel):
    final_diagnosis: str | None = None
    hospital_course: str | None = None
    procedures_summary: str | None = None
    medications_on_discharge: str | None = None
    follow_up_instructions: str | None = None
    condition_at_discharge: str | None = None
    restrictions: str | None = None
    notes: str | None = None


class DischargeSummaryResponse(APIBaseSchema):
    id: int
    admission_id: int
    patient_id: int
    doctor_id: int
    summary_number: str
    discharge_date: date
    final_diagnosis: str | None
    hospital_course: str | None
    procedures_summary: str | None
    medications_on_discharge: str | None
    follow_up_instructions: str | None
    condition_at_discharge: str | None
    restrictions: str | None
    notes: str | None


# ============================================================
# APPOINTMENT REMINDERS
# ============================================================


class AppointmentReminderCreate(BaseModel):
    appointment_id: int = Field(gt=0)
    patient_id: int = Field(gt=0)

    reminder_type: str = Field(
        min_length=1,
        max_length=50,
    )

    scheduled_for: datetime

    message: str = Field(
        min_length=1,
        max_length=2000,
    )

    status: str = "Scheduled"
    attempt_count: int = Field(default=0, ge=0)


class AppointmentReminderUpdate(BaseModel):
    scheduled_for: datetime | None = None
    reminder_type: str | None = None
    message: str | None = None
    status: str | None = None
    attempt_count: int | None = Field(default=None, ge=0)
    error_message: str | None = None


class AppointmentReminderResponse(APIBaseSchema):
    id: int
    appointment_id: int
    patient_id: int
    reminder_type: str
    scheduled_for: datetime
    sent_at: datetime | None
    status: str
    message: str
    attempt_count: int
    error_message: str | None


# ============================================================
# NOTIFICATIONS
# ============================================================


class NotificationCreate(BaseModel):
    patient_id: int | None = Field(default=None, gt=0)
    doctor_id: int | None = Field(default=None, gt=0)

    title: str = Field(
        min_length=1,
        max_length=250,
    )

    message: str = Field(
        min_length=1,
        max_length=5000,
    )

    notification_type: str = "General"
    priority: str = "Normal"
    status: str = "Unread"

    scheduled_for: datetime | None = None
    expires_at: datetime | None = None


class NotificationUpdate(BaseModel):
    title: str | None = None
    message: str | None = None
    notification_type: str | None = None
    priority: str | None = None
    status: str | None = None
    scheduled_for: datetime | None = None
    expires_at: datetime | None = None


class NotificationResponse(APIBaseSchema):
    id: int
    patient_id: int | None
    doctor_id: int | None
    title: str
    message: str
    notification_type: str
    priority: str
    status: str
    created_at: datetime
    read_at: datetime | None
    scheduled_for: datetime | None
    expires_at: datetime | None


class NotificationReadRequest(BaseModel):
    notification_id: int = Field(gt=0)


# ============================================================
# AUDIT LOGGING
# ============================================================


class AuditLogCreate(BaseModel):
    actor_type: str = Field(
        min_length=1,
        max_length=50,
    )

    actor_id: int | None = Field(
        default=None,
        gt=0,
    )

    action: str = Field(
        min_length=1,
        max_length=100,
    )

    entity_type: str = Field(
        min_length=1,
        max_length=100,
    )

    entity_id: int | None = Field(
        default=None,
        gt=0,
    )

    description: str | None = None

    ip_address: str | None = None
    user_agent: str | None = None

    success: bool = True

    metadata_json: str | None = None


class AuditLogResponse(APIBaseSchema):
    id: int
    actor_type: str
    actor_id: int | None
    action: str
    entity_type: str
    entity_id: int | None
    description: str | None
    ip_address: str | None
    user_agent: str | None
    created_at: datetime
    success: bool
    metadata_json: str | None


class AuditLogSearchRequest(BaseModel):
    actor_type: str | None = None
    actor_id: int | None = Field(default=None, gt=0)
    action: str | None = None
    entity_type: str | None = None
    entity_id: int | None = Field(default=None, gt=0)
    success: bool | None = None


# ============================================================
# DEPARTMENTS
# ============================================================


class DepartmentCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    code: str = Field(min_length=1, max_length=50)
    description: str | None = None
    phone: str | None = None
    email: str | None = None
    location: str | None = None
    active: bool = True


class DepartmentUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    description: str | None = None
    phone: str | None = None
    email: str | None = None
    location: str | None = None
    active: bool | None = None


class DepartmentResponse(APIBaseSchema):
    id: int
    name: str
    code: str
    description: str | None
    phone: str | None
    email: str | None
    location: str | None
    active: bool


# ============================================================
# DOCTOR AVAILABILITY
# ============================================================


class DoctorAvailabilityCreate(BaseModel):
    doctor_id: int = Field(gt=0)
    department_id: int | None = Field(default=None, gt=0)

    day_of_week: int = Field(
        ge=0,
        le=6,
    )

    start_time: str
    end_time: str

    slot_duration_minutes: int = Field(
        default=30,
        ge=5,
        le=480,
    )

    max_patients: int = Field(
        default=20,
        ge=1,
        le=500,
    )

    active: bool = True


class DoctorAvailabilityUpdate(BaseModel):
    department_id: int | None = Field(default=None, gt=0)
    day_of_week: int | None = Field(default=None, ge=0, le=6)
    start_time: str | None = None
    end_time: str | None = None
    slot_duration_minutes: int | None = Field(default=None, ge=5, le=480)
    max_patients: int | None = Field(default=None, ge=1, le=500)
    active: bool | None = None


class DoctorAvailabilityResponse(APIBaseSchema):
    id: int
    doctor_id: int
    department_id: int | None
    day_of_week: int
    start_time: str
    end_time: str
    slot_duration_minutes: int
    max_patients: int
    active: bool


# ============================================================
# ROOMS
# ============================================================


class RoomCreate(BaseModel):
    room_number: str = Field(min_length=1, max_length=50)
    ward_name: str = Field(min_length=1, max_length=150)
    room_type: str = "General"
    floor: int | None = None
    capacity: int = Field(default=1, ge=1, le=100)
    status: str = "Available"
    notes: str | None = None


class RoomUpdate(BaseModel):
    room_number: str | None = None
    ward_name: str | None = None
    room_type: str | None = None
    floor: int | None = None
    capacity: int | None = Field(default=None, ge=1, le=100)
    status: str | None = None
    notes: str | None = None


class RoomResponse(APIBaseSchema):
    id: int
    room_number: str
    ward_name: str
    room_type: str
    floor: int | None
    capacity: int
    status: str
    notes: str | None


# ============================================================
# BEDS
# ============================================================


class BedCreate(BaseModel):
    room_id: int = Field(gt=0)
    bed_number: str = Field(min_length=1, max_length=50)
    bed_type: str = "Standard"
    status: str = "Available"

    patient_id: int | None = Field(
        default=None,
        gt=0,
    )

    assigned_at: datetime | None = None
    notes: str | None = None


class BedUpdate(BaseModel):
    bed_number: str | None = None
    bed_type: str | None = None
    status: str | None = None
    patient_id: int | None = Field(default=None, gt=0)
    assigned_at: datetime | None = None
    notes: str | None = None


class BedResponse(APIBaseSchema):
    id: int
    room_id: int
    bed_number: str
    bed_type: str
    status: str
    patient_id: int | None
    assigned_at: datetime | None
    notes: str | None


# ============================================================
# PATIENT ENCOUNTERS
# ============================================================


class PatientEncounterCreate(BaseModel):
    patient_id: int = Field(gt=0)
    doctor_id: int | None = Field(default=None, gt=0)
    appointment_id: int | None = Field(default=None, gt=0)

    encounter_number: str = Field(
        min_length=1,
        max_length=100,
    )

    encounter_type: str = "Outpatient"

    started_at: datetime
    ended_at: datetime | None = None

    location: str | None = None

    status: str = "Open"

    reason: str | None = None
    summary: str | None = None
    notes: str | None = None


class PatientEncounterUpdate(BaseModel):
    doctor_id: int | None = Field(default=None, gt=0)
    encounter_type: str | None = None
    ended_at: datetime | None = None
    location: str | None = None
    status: str | None = None
    reason: str | None = None
    summary: str | None = None
    notes: str | None = None


class PatientEncounterResponse(APIBaseSchema):
    id: int
    patient_id: int
    doctor_id: int | None
    appointment_id: int | None
    encounter_number: str
    encounter_type: str
    started_at: datetime
    ended_at: datetime | None
    location: str | None
    status: str
    reason: str | None
    summary: str | None
    notes: str | None


# ============================================================
# MEDICATION ADMINISTRATION
# ============================================================


class MedicationAdministrationCreate(BaseModel):
    patient_id: int = Field(gt=0)
    medication_id: int = Field(gt=0)
    doctor_id: int | None = Field(default=None, gt=0)
    encounter_id: int | None = Field(default=None, gt=0)

    administration_time: datetime

    dose: str = Field(
        min_length=1,
        max_length=100,
    )

    unit: str | None = None
    route: str | None = None
    site: str | None = None

    status: str = "Administered"

    administered_by: str = Field(
        min_length=1,
        max_length=150,
    )

    notes: str | None = None


class MedicationAdministrationUpdate(BaseModel):
    dose: str | None = None
    unit: str | None = None
    route: str | None = None
    site: str | None = None
    status: str | None = None
    administered_by: str | None = None
    notes: str | None = None


class MedicationAdministrationResponse(APIBaseSchema):
    id: int
    patient_id: int
    medication_id: int
    doctor_id: int | None
    encounter_id: int | None
    administration_time: datetime
    dose: str
    unit: str | None
    route: str | None
    site: str | None
    status: str
    administered_by: str
    notes: str | None


# ============================================================
# MEDICAL DOCUMENTS
# ============================================================


class MedicalDocumentCreate(BaseModel):
    patient_id: int = Field(gt=0)
    record_id: int | None = Field(default=None, gt=0)

    document_type: str = Field(
        min_length=1,
        max_length=100,
    )

    title: str = Field(
        min_length=1,
        max_length=250,
    )

    description: str | None = None

    file_name: str = Field(
        min_length=1,
        max_length=500,
    )

    file_path: str = Field(
        min_length=1,
        max_length=1000,
    )

    mime_type: str | None = None

    file_size: int | None = Field(
        default=None,
        ge=0,
    )

    document_date: date | None = None

    uploaded_by: str | None = None
    checksum: str | None = None

    status: str = "Active"

    notes: str | None = None


class MedicalDocumentUpdate(BaseModel):
    document_type: str | None = None
    title: str | None = None
    description: str | None = None
    document_date: date | None = None
    status: str | None = None
    notes: str | None = None


class MedicalDocumentResponse(APIBaseSchema):
    id: int
    patient_id: int
    record_id: int | None
    document_type: str
    title: str
    description: str | None
    file_name: str
    file_path: str
    mime_type: str | None
    file_size: int | None
    document_date: date | None
    uploaded_at: datetime
    uploaded_by: str | None
    checksum: str | None
    status: str
    notes: str | None


# ============================================================
# MEDICAL RECORD ACCESS
# ============================================================


class MedicalRecordAccessCreate(BaseModel):
    patient_id: int = Field(gt=0)
    record_id: int | None = Field(default=None, gt=0)

    actor_type: str = Field(
        min_length=1,
        max_length=50,
    )

    actor_id: int = Field(gt=0)

    access_type: str = Field(
        min_length=1,
        max_length=50,
    )

    expires_at: datetime | None = None

    reason: str | None = None
    notes: str | None = None


class MedicalRecordAccessUpdate(BaseModel):
    access_type: str | None = None
    expires_at: datetime | None = None
    active: bool | None = None
    reason: str | None = None
    notes: str | None = None


class MedicalRecordAccessResponse(APIBaseSchema):
    id: int
    patient_id: int
    record_id: int | None
    actor_type: str
    actor_id: int
    access_type: str
    granted_at: datetime
    expires_at: datetime | None
    active: bool
    reason: str | None
    notes: str | None


# ============================================================
# CONSENT RECORDS
# ============================================================


class ConsentRecordCreate(BaseModel):
    patient_id: int = Field(gt=0)

    consent_type: str = Field(
        min_length=1,
        max_length=100,
    )

    title: str = Field(
        min_length=1,
        max_length=250,
    )

    description: str | None = None

    status: str = "Granted"

    granted_at: datetime | None = None
    revoked_at: datetime | None = None
    expires_at: datetime | None = None

    signed_by: str | None = None

    notes: str | None = None


class ConsentRecordUpdate(BaseModel):
    consent_type: str | None = None
    title: str | None = None
    description: str | None = None
    status: str | None = None
    revoked_at: datetime | None = None
    expires_at: datetime | None = None
    signed_by: str | None = None
    notes: str | None = None


class ConsentRecordResponse(APIBaseSchema):
    id: int
    patient_id: int
    consent_type: str
    title: str
    description: str | None
    status: str
    granted_at: datetime | None
    revoked_at: datetime | None
    expires_at: datetime | None
    signed_by: str | None
    notes: str | None


# ============================================================
# HEALTH METRICS
# ============================================================


class HealthMetricCreate(BaseModel):
    patient_id: int = Field(gt=0)

    metric_type: str = Field(
        min_length=1,
        max_length=100,
    )

    value: float
    unit: str | None = None

    measured_at: datetime

    source: str | None = None
    notes: str | None = None


class HealthMetricUpdate(BaseModel):
    metric_type: str | None = None
    value: float | None = None
    unit: str | None = None
    measured_at: datetime | None = None
    source: str | None = None
    notes: str | None = None


class HealthMetricResponse(APIBaseSchema):
    id: int
    patient_id: int
    metric_type: str
    value: float
    unit: str | None
    measured_at: datetime
    source: str | None
    notes: str | None


# ============================================================
# DIET PLANS
# ============================================================


class DietPlanCreate(BaseModel):
    patient_id: int = Field(gt=0)
    doctor_id: int | None = Field(default=None, gt=0)

    plan_name: str = Field(
        min_length=1,
        max_length=250,
    )

    goal: str | None = None

    calories_per_day: float | None = Field(
        default=None,
        ge=0,
    )

    start_date: date
    end_date: date | None = None

    restrictions: str | None = None
    instructions: str | None = None

    status: str = "Active"

    notes: str | None = None


class DietPlanUpdate(BaseModel):
    plan_name: str | None = None
    goal: str | None = None
    calories_per_day: float | None = Field(default=None, ge=0)
    start_date: date | None = None
    end_date: date | None = None
    restrictions: str | None = None
    instructions: str | None = None
    status: str | None = None
    notes: str | None = None


class DietPlanResponse(APIBaseSchema):
    id: int
    patient_id: int
    doctor_id: int | None
    plan_name: str
    goal: str | None
    calories_per_day: float | None
    start_date: date
    end_date: date | None
    restrictions: str | None
    instructions: str | None
    status: str
    notes: str | None


class DietPlanItemCreate(BaseModel):
    diet_plan_id: int = Field(gt=0)

    meal_type: str = Field(
        min_length=1,
        max_length=100,
    )

    food_name: str = Field(
        min_length=1,
        max_length=250,
    )

    portion: str | None = None

    calories: float | None = Field(
        default=None,
        ge=0,
    )

    protein_grams: float | None = Field(
        default=None,
        ge=0,
    )

    carbs_grams: float | None = Field(
        default=None,
        ge=0,
    )

    fat_grams: float | None = Field(
        default=None,
        ge=0,
    )

    instructions: str | None = None


class DietPlanItemResponse(APIBaseSchema):
    id: int
    diet_plan_id: int
    meal_type: str
    food_name: str
    portion: str | None
    calories: float | None
    protein_grams: float | None
    carbs_grams: float | None
    fat_grams: float | None
    instructions: str | None


# ============================================================
# PHYSIOTHERAPY
# ============================================================


class PhysiotherapyPlanCreate(BaseModel):
    patient_id: int = Field(gt=0)
    doctor_id: int | None = Field(default=None, gt=0)
    record_id: int | None = Field(default=None, gt=0)

    plan_name: str = Field(
        min_length=1,
        max_length=250,
    )

    diagnosis: str | None = None

    start_date: date
    end_date: date | None = None

    frequency: str | None = None
    goals: str | None = None
    precautions: str | None = None

    status: str = "Active"

    notes: str | None = None


class PhysiotherapyPlanUpdate(BaseModel):
    plan_name: str | None = None
    diagnosis: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    frequency: str | None = None
    goals: str | None = None
    precautions: str | None = None
    status: str | None = None
    notes: str | None = None


class PhysiotherapyPlanResponse(APIBaseSchema):
    id: int
    patient_id: int
    doctor_id: int | None
    record_id: int | None
    plan_name: str
    diagnosis: str | None
    start_date: date
    end_date: date | None
    frequency: str | None
    goals: str | None
    precautions: str | None
    status: str
    notes: str | None


class PhysiotherapySessionCreate(BaseModel):
    plan_id: int = Field(gt=0)
    patient_id: int = Field(gt=0)

    therapist_name: str = Field(
        min_length=1,
        max_length=150,
    )

    session_date: datetime

    duration_minutes: int | None = Field(
        default=None,
        ge=0,
        le=1440,
    )

    exercises: str | None = None

    pain_before: int | None = Field(
        default=None,
        ge=0,
        le=10,
    )

    pain_after: int | None = Field(
        default=None,
        ge=0,
        le=10,
    )

    progress_notes: str | None = None
    home_exercises: str | None = None

    status: str = "Completed"


class PhysiotherapySessionUpdate(BaseModel):
    therapist_name: str | None = None
    session_date: datetime | None = None
    duration_minutes: int | None = Field(default=None, ge=0, le=1440)
    exercises: str | None = None
    pain_before: int | None = Field(default=None, ge=0, le=10)
    pain_after: int | None = Field(default=None, ge=0, le=10)
    progress_notes: str | None = None
    home_exercises: str | None = None
    status: str | None = None


class PhysiotherapySessionResponse(APIBaseSchema):
    id: int
    plan_id: int
    patient_id: int
    therapist_name: str
    session_date: datetime
    duration_minutes: int | None
    exercises: str | None
    pain_before: int | None
    pain_after: int | None
    progress_notes: str | None
    home_exercises: str | None
    status: str


# ============================================================
# PATIENT FEEDBACK
# ============================================================


class PatientFeedbackCreate(BaseModel):
    patient_id: int = Field(gt=0)
    appointment_id: int | None = Field(default=None, gt=0)

    rating: int = Field(
        ge=1,
        le=5,
    )

    category: str | None = None
    comments: str | None = None


class PatientFeedbackUpdate(BaseModel):
    rating: int | None = Field(default=None, ge=1, le=5)
    category: str | None = None
    comments: str | None = None
    status: str | None = None
    response: str | None = None


class PatientFeedbackResponse(APIBaseSchema):
    id: int
    patient_id: int
    appointment_id: int | None
    rating: int
    category: str | None
    comments: str | None
    submitted_at: datetime
    status: str
    response: str | None
    responded_at: datetime | None


# ============================================================
# SUPPORT TICKETS
# ============================================================


class SupportTicketCreate(BaseModel):
    patient_id: int | None = Field(default=None, gt=0)

    subject: str = Field(
        min_length=1,
        max_length=250,
    )

    description: str = Field(
        min_length=1,
        max_length=5000,
    )

    category: str = "General"
    priority: str = "Normal"
    status: str = "Open"

    assigned_to: str | None = None


class SupportTicketUpdate(BaseModel):
    subject: str | None = None
    description: str | None = None
    category: str | None = None
    priority: str | None = None
    status: str | None = None
    assigned_to: str | None = None
    resolution_notes: str | None = None


class SupportTicketResponse(APIBaseSchema):
    id: int
    patient_id: int | None
    subject: str
    description: str
    category: str
    priority: str
    status: str
    assigned_to: str | None
    created_at: datetime
    updated_at: datetime
    resolved_at: datetime | None
    resolution_notes: str | None


# ============================================================
# INVENTORY
# ============================================================


class InventoryItemCreate(BaseModel):
    item_code: str = Field(
        min_length=1,
        max_length=100,
    )

    name: str = Field(
        min_length=1,
        max_length=250,
    )

    category: str = "Medical Supply"

    unit: str = Field(
        min_length=1,
        max_length=50,
    )

    quantity_on_hand: float = Field(
        default=0,
        ge=0,
    )

    reorder_level: float = Field(
        default=0,
        ge=0,
    )

    unit_cost: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
    )

    selling_price: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
    )

    batch_number: str | None = None
    expiry_date: date | None = None
    supplier_name: str | None = None

    active: bool = True

    notes: str | None = None


class InventoryItemUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    unit: str | None = None
    quantity_on_hand: float | None = Field(default=None, ge=0)
    reorder_level: float | None = Field(default=None, ge=0)
    unit_cost: Decimal | None = Field(default=None, ge=0)
    selling_price: Decimal | None = Field(default=None, ge=0)
    batch_number: str | None = None
    expiry_date: date | None = None
    supplier_name: str | None = None
    active: bool | None = None
    notes: str | None = None


class InventoryItemResponse(APIBaseSchema):
    id: int
    item_code: str
    name: str
    category: str
    unit: str
    quantity_on_hand: float
    reorder_level: float
    unit_cost: Decimal
    selling_price: Decimal
    batch_number: str | None
    expiry_date: date | None
    supplier_name: str | None
    active: bool
    notes: str | None


class InventoryTransactionCreate(BaseModel):
    inventory_item_id: int = Field(gt=0)

    transaction_type: str = Field(
        min_length=1,
        max_length=50,
    )

    quantity: float = Field(
        gt=0,
    )

    reference_type: str | None = None
    reference_id: int | None = Field(default=None, gt=0)

    transaction_date: datetime

    performed_by: str | None = None
    notes: str | None = None


class InventoryTransactionResponse(APIBaseSchema):
    id: int
    inventory_item_id: int
    transaction_type: str
    quantity: float
    reference_type: str | None
    reference_id: int | None
    transaction_date: datetime
    performed_by: str | None
    notes: str | None


# ============================================================
# PRESCRIPTION DISPENSING
# ============================================================


class PrescriptionDispenseCreate(BaseModel):
    prescription_id: int = Field(gt=0)
    patient_id: int = Field(gt=0)

    dispensed_at: datetime

    dispensed_by: str = Field(
        min_length=1,
        max_length=150,
    )

    status: str = "Dispensed"

    total_items: int = Field(
        default=0,
        ge=0,
    )

    notes: str | None = None


class PrescriptionDispenseUpdate(BaseModel):
    dispensed_by: str | None = None
    status: str | None = None
    total_items: int | None = Field(default=None, ge=0)
    notes: str | None = None


class PrescriptionDispenseResponse(APIBaseSchema):
    id: int
    prescription_id: int
    patient_id: int
    dispensed_at: datetime
    dispensed_by: str
    status: str
    total_items: int
    notes: str | None


class PrescriptionDispenseItemCreate(BaseModel):
    dispense_id: int = Field(gt=0)
    prescription_item_id: int = Field(gt=0)

    quantity_dispensed: int = Field(
        gt=0,
    )

    batch_number: str | None = None
    expiry_date: date | None = None
    notes: str | None = None


class PrescriptionDispenseItemResponse(APIBaseSchema):
    id: int
    dispense_id: int
    prescription_item_id: int
    quantity_dispensed: int
    batch_number: str | None
    expiry_date: date | None
    notes: str | None


# ============================================================
# PAYMENT RECORDS
# ============================================================
#
# These schemas represent local application payment records.
# They do NOT implement or call an external payment provider.
# ============================================================


class PaymentRecordCreate(BaseModel):
    patient_id: int = Field(gt=0)
    bill_id: int = Field(gt=0)

    amount: Decimal = Field(
        gt=0,
    )

    payment_method: str = Field(
        min_length=1,
        max_length=50,
    )

    payment_status: str = "Pending"

    reference_number: str | None = None

    payment_date: datetime

    notes: str | None = None


class PaymentRecordUpdate(BaseModel):
    amount: Decimal | None = Field(default=None, gt=0)
    payment_method: str | None = None
    payment_status: str | None = None
    reference_number: str | None = None
    notes: str | None = None


class PaymentRecordResponse(APIBaseSchema):
    id: int
    patient_id: int
    bill_id: int
    amount: Decimal
    payment_method: str
    payment_status: str
    reference_number: str | None
    payment_date: datetime
    notes: str | None


# ============================================================
# REFUNDS
# ============================================================


class RefundRecordCreate(BaseModel):
    bill_id: int = Field(gt=0)
    payment_id: int | None = Field(default=None, gt=0)

    amount: Decimal = Field(
        gt=0,
    )

    reason: str = Field(
        min_length=1,
        max_length=2000,
    )

    status: str = "Requested"

    requested_at: datetime

    reference_number: str | None = None
    notes: str | None = None


class RefundRecordUpdate(BaseModel):
    amount: Decimal | None = Field(default=None, gt=0)
    reason: str | None = None
    status: str | None = None
    processed_at: datetime | None = None
    reference_number: str | None = None
    notes: str | None = None


class RefundRecordResponse(APIBaseSchema):
    id: int
    bill_id: int
    payment_id: int | None
    amount: Decimal
    reason: str
    status: str
    requested_at: datetime
    processed_at: datetime | None
    reference_number: str | None
    notes: str | None


# ============================================================
# SYSTEM SETTINGS
# ============================================================


class SystemSettingCreate(BaseModel):
    setting_key: str = Field(
        min_length=1,
        max_length=200,
    )

    setting_value: str

    category: str = "General"

    description: str | None = None

    is_secret: bool = False


class SystemSettingUpdate(BaseModel):
    setting_value: str | None = None
    category: str | None = None
    description: str | None = None
    is_secret: bool | None = None


class SystemSettingResponse(APIBaseSchema):
    id: int
    setting_key: str
    setting_value: str
    category: str
    description: str | None
    is_secret: bool
    updated_at: datetime


# ============================================================
# DASHBOARD / ANALYTICS RESPONSE SCHEMAS
# ============================================================


class DashboardStatisticsResponse(BaseModel):
    total_patients: int
    total_doctors: int
    total_appointments: int
    total_medical_records: int
    total_prescriptions: int
    total_lab_orders: int
    total_bills: int

    pending_appointments: int = 0
    completed_appointments: int = 0

    pending_bills: int = 0
    paid_bills: int = 0

    active_medical_records: int = 0
    active_prescriptions: int = 0


class AppointmentStatisticsResponse(BaseModel):
    total: int
    scheduled: int
    confirmed: int
    completed: int
    cancelled: int
    no_show: int


class BillingStatisticsResponse(BaseModel):
    total_bills: int
    subtotal: float
    discounts: float
    taxes: float
    billed_amount: float
    paid_amount: float
    pending_amount: float


class MedicalRecordStatisticsResponse(BaseModel):
    total_records: int
    active_records: int
    completed_records: int
    archived_records: int
    consultation_records: int
    emergency_records: int
    follow_up_records: int


# ============================================================
# PATIENT MEDICAL PROFILE
# ============================================================


class PatientMedicalProfileResponse(BaseModel):
    patient: PatientResponse

    medical_records: list[MedicalRecordSummary] = []
    diagnoses: list[MedicalRecordDiagnosisResponse] = []
    vital_signs: list[VitalSignResponse] = []
    clinical_notes: list[ClinicalNoteResponse] = []

    allergies: list[PatientAllergyResponse] = []
    conditions: list[PatientConditionResponse] = []
    immunizations: list[ImmunizationResponse] = []

    prescriptions: list[PrescriptionResponse] = []
    laboratory_orders: list[LabOrderResponse] = []
    procedures: list[ProcedureRecordResponse] = []

    referrals: list[ReferralResponse] = []
    follow_ups: list[FollowUpResponse] = []

    insurance: list[PatientInsuranceResponse] = []
    emergency_contacts: list[EmergencyContactResponse] = []


# ============================================================
# COMPLETE MEDICAL RECORD VIEW
# ============================================================


class CompleteMedicalRecordResponse(BaseModel):
    record: MedicalRecordResponse

    diagnoses: list[MedicalRecordDiagnosisResponse] = []
    vital_signs: list[VitalSignResponse] = []
    clinical_notes: list[ClinicalNoteResponse] = []

    prescriptions: list[PrescriptionWithItemsResponse] = []
    laboratory_orders: list[LabOrderWithResultsResponse] = []

    procedures: list[ProcedureRecordResponse] = []
    follow_ups: list[FollowUpResponse] = []

    documents: list[MedicalDocumentResponse] = []


# ============================================================
# BULK OPERATION SCHEMAS
# ============================================================


class BulkPatientIdRequest(BaseModel):
    patient_ids: list[int] = Field(
        min_length=1,
        max_length=500,
    )


class BulkMedicalRecordRequest(BaseModel):
    record_ids: list[int] = Field(
        min_length=1,
        max_length=500,
    )


class BulkAppointmentRequest(BaseModel):
    appointment_ids: list[int] = Field(
        min_length=1,
        max_length=500,
    )


class BulkDeleteResponse(BaseModel):
    requested: int
    deleted: int
    failed: int
    errors: list[str] = []


# ============================================================
# SEARCH RESPONSE SCHEMAS
# ============================================================


class MedicalRecordSearchResponse(BaseModel):
    records: list[MedicalRecordSummary]
    total: int


class DiagnosisSearchResponse(BaseModel):
    diagnoses: list[DiagnosisResponse]
    total: int


class MedicationSearchResponse(BaseModel):
    medications: list[MedicationResponse]
    total: int


class LabOrderSearchResponse(BaseModel):
    orders: list[LabOrderResponse]
    total: int


class PrescriptionSearchResponse(BaseModel):
    prescriptions: list[PrescriptionResponse]
    total: int


# ============================================================
# HEALTHCARE STATUS RESPONSE
# ============================================================


class HealthCheckResponse(BaseModel):
    status: str
    service: str
    database: str
    version: str
    timestamp: datetime


# ============================================================
# ERROR RESPONSE
# ============================================================


class APIErrorResponse(BaseModel):
    success: bool = False
    error_code: str
    message: str
    details: dict[str, Any] | None = None
    timestamp: datetime | None = None


# ============================================================
# END OF SCHEMAS
# ============================================================