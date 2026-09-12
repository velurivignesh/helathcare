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