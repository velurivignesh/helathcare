from typing import Optional, List
from pydantic import BaseModel


class PatientCreate(BaseModel):
    name: str
    age: int
    phone: str


class PatientResponse(BaseModel):
    id: int
    name: str
    age: int
    phone: str

    class Config:
        from_attributes = True


class DoctorCreate(BaseModel):
    name: str
    specialization: str
    phone: str


class DoctorResponse(BaseModel):
    id: int
    name: str
    specialization: str
    phone: str

    class Config:
        from_attributes = True


class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_date: str
    appointment_time: str
    reason: str


class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    appointment_date: str
    appointment_time: str
    reason: str

    class Config:
        from_attributes = True


class MedicalBillCreate(BaseModel):
    patient_id: int

    consultation_amount: float = 0
    laboratory_amount: float = 0
    medicine_amount: float = 0
    procedure_amount: float = 0
    other_amount: float = 0

    discount: float = 0
    tax: float = 0

    bill_date: str


class MedicalBillResponse(BaseModel):
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

    class Config:
        from_attributes = True


# ============================================================
# INPATIENT & BED MANAGEMENT (ADT) SCHEMAS
# ============================================================

class DepartmentCreate(BaseModel):
    name: str
    department_code: Optional[str] = None
    description: Optional[str] = None
    floor: Optional[str] = None
    building: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    head_doctor_id: Optional[int] = None
    status: str = "Active"


class DepartmentResponse(BaseModel):
    id: int
    department_code: Optional[str] = None
    name: str
    description: Optional[str] = None
    floor: Optional[str] = None
    building: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    head_doctor_id: Optional[int] = None
    status: str

    class Config:
        from_attributes = True


class RoomCreate(BaseModel):
    room_number: str
    room_type: str
    department_id: Optional[int] = None
    floor: Optional[str] = None
    building: Optional[str] = None
    capacity: int = 1
    daily_rate: float = 0.0
    status: str = "Available"
    notes: Optional[str] = None


class RoomResponse(BaseModel):
    id: int
    room_number: str
    room_type: str
    department_id: Optional[int] = None
    floor: Optional[str] = None
    building: Optional[str] = None
    capacity: int
    occupied_count: int
    daily_rate: float
    status: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class BedCreate(BaseModel):
    room_id: int
    bed_number: str
    bed_type: Optional[str] = "Standard"
    status: str = "Available"
    notes: Optional[str] = None


class BedUpdateStatus(BaseModel):
    status: str
    notes: Optional[str] = None


class BedResponse(BaseModel):
    id: int
    room_id: int
    bed_number: str
    bed_type: Optional[str] = None
    status: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class AdmissionCreate(BaseModel):
    patient_id: int
    admitting_doctor_id: Optional[int] = None
    room_id: Optional[int] = None
    bed_id: Optional[int] = None
    admission_date: str
    admission_time: Optional[str] = None
    admission_type: Optional[str] = "Elective"
    admission_reason: Optional[str] = None
    diagnosis_at_admission: Optional[str] = None
    expected_discharge_date: Optional[str] = None
    notes: Optional[str] = None


class AdmissionTransfer(BaseModel):
    new_room_id: int
    new_bed_id: int
    transfer_reason: Optional[str] = None


class AdmissionDischarge(BaseModel):
    actual_discharge_date: str
    discharge_time: Optional[str] = None
    discharge_reason: Optional[str] = None
    final_diagnosis: Optional[str] = None
    hospital_course: Optional[str] = None
    procedures_performed: Optional[str] = None
    medications_at_discharge: Optional[str] = None
    follow_up_instructions: Optional[str] = None
    warning_signs: Optional[str] = None
    doctor_notes: Optional[str] = None


class AdmissionResponse(BaseModel):
    id: int
    admission_number: Optional[str] = None
    patient_id: int
    admitting_doctor_id: Optional[int] = None
    room_id: Optional[int] = None
    bed_id: Optional[int] = None
    admission_date: str
    admission_time: Optional[str] = None
    admission_type: Optional[str] = None
    admission_reason: Optional[str] = None
    diagnosis_at_admission: Optional[str] = None
    expected_discharge_date: Optional[str] = None
    actual_discharge_date: Optional[str] = None
    status: str
    discharge_reason: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class DischargeSummaryCreate(BaseModel):
    admission_id: int
    patient_id: int
    doctor_id: Optional[int] = None
    discharge_date: str
    final_diagnosis: Optional[str] = None
    hospital_course: Optional[str] = None
    procedures_performed: Optional[str] = None
    medications_at_discharge: Optional[str] = None
    follow_up_instructions: Optional[str] = None
    warning_signs: Optional[str] = None
    doctor_notes: Optional[str] = None


class DischargeSummaryResponse(BaseModel):
    id: int
    admission_id: int
    patient_id: int
    doctor_id: Optional[int] = None
    discharge_date: str
    final_diagnosis: Optional[str] = None
    hospital_course: Optional[str] = None
    procedures_performed: Optional[str] = None
    medications_at_discharge: Optional[str] = None
    follow_up_instructions: Optional[str] = None
    warning_signs: Optional[str] = None
    doctor_notes: Optional[str] = None

    class Config:
        from_attributes = True


class InpatientStatsResponse(BaseModel):
    total_beds: int
    available_beds: int
    occupied_beds: int
    cleaning_beds: int
    maintenance_beds: int
    occupancy_rate: float
    total_admitted_patients: int
    total_discharged_patients: int


# ============================================================
# LABORATORY INFORMATION SYSTEM (LIS) SCHEMAS
# ============================================================

class LabTestCategoryCreate(BaseModel):
    name: str
    category_code: Optional[str] = None
    description: Optional[str] = None
    department: Optional[str] = None
    display_order: int = 0
    status: str = "Active"


class LabTestCategoryResponse(BaseModel):
    id: int
    category_code: str
    name: str
    description: Optional[str] = None
    department: Optional[str] = None
    display_order: int
    status: str

    class Config:
        from_attributes = True


class LabTestCreate(BaseModel):
    test_name: str
    test_code: Optional[str] = None
    category_id: Optional[int] = None
    description: Optional[str] = None
    specimen_type: Optional[str] = "Whole Blood"
    specimen_container: Optional[str] = "EDTA Tube"
    fasting_required: str = "No"
    preparation_instructions: Optional[str] = None
    result_type: str = "Numeric"
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    critical_low_value: Optional[str] = None
    critical_high_value: Optional[str] = None
    turnaround_time_hours: int = 24
    price: float = 0.0
    status: str = "Active"


class LabTestResponse(BaseModel):
    id: int
    test_code: str
    test_name: str
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    description: Optional[str] = None
    specimen_type: Optional[str] = None
    specimen_container: Optional[str] = None
    fasting_required: str
    preparation_instructions: Optional[str] = None
    result_type: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    critical_low_value: Optional[str] = None
    critical_high_value: Optional[str] = None
    turnaround_time_hours: int
    price: float
    status: str

    class Config:
        from_attributes = True


class LabOrderCreate(BaseModel):
    patient_id: int
    doctor_id: Optional[int] = None
    priority: Optional[str] = "Routine"
    clinical_notes: Optional[str] = None
    diagnosis_notes: Optional[str] = None
    test_ids: List[int]


class LabOrderItemResponse(BaseModel):
    id: int
    lab_order_id: int
    lab_test_id: int
    test_code: Optional[str] = None
    test_name: Optional[str] = None
    requested_price: float
    specimen_type: Optional[str] = None
    status: str
    result: Optional[dict] = None

    class Config:
        from_attributes = True


class LabOrderResponse(BaseModel):
    id: int
    order_number: str
    patient_id: int
    patient_name: Optional[str] = None
    patient_age: Optional[int] = None
    patient_phone: Optional[str] = None
    doctor_id: Optional[int] = None
    doctor_name: Optional[str] = None
    order_date: str
    priority: str
    clinical_notes: Optional[str] = None
    status: str
    collection_status: str
    billing_status: str
    total_amount: float
    items: List[dict] = []

    class Config:
        from_attributes = True


class LabSampleCollect(BaseModel):
    container_type: Optional[str] = None
    collected_by: Optional[str] = None
    storage_location: Optional[str] = "Main Lab Specimen Fridge"
    notes: Optional[str] = None


class LabResultEntry(BaseModel):
    lab_order_item_id: int
    result_value: Optional[str] = None
    result_numeric_value: Optional[float] = None
    result_text: Optional[str] = None
    technician_notes: Optional[str] = None
    performed_by: Optional[str] = None


class LabResultResponse(BaseModel):
    id: int
    lab_order_item_id: int
    lab_test_id: int
    test_name: Optional[str] = None
    patient_id: int
    result_value: Optional[str] = None
    result_numeric_value: Optional[float] = None
    result_text: Optional[str] = None
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    abnormal_flag: str
    critical_flag: str
    interpretation: Optional[str] = None
    performed_by: Optional[str] = None
    result_date: Optional[str] = None
    verification_status: str
    status: str

    class Config:
        from_attributes = True


class LabReportResponse(BaseModel):
    id: int
    report_number: str
    lab_order_id: int
    order_number: Optional[str] = None
    patient_id: int
    patient_name: Optional[str] = None
    patient_age: Optional[int] = None
    patient_phone: Optional[str] = None
    doctor_id: Optional[int] = None
    doctor_name: Optional[str] = None
    report_title: str
    report_summary: Optional[str] = None
    clinical_interpretation: Optional[str] = None
    abnormal_result_count: int
    critical_result_count: int
    generated_date: Optional[str] = None
    verified_date: Optional[str] = None
    verified_by: Optional[str] = None
    status: str
    results: List[dict] = []

    class Config:
        from_attributes = True


class LabStatsResponse(BaseModel):
    total_orders: int
    pending_collection: int
    in_analysis: int
    completed_reports: int
    total_tests_available: int
    critical_alerts_count: int
