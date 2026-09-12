from sqlalchemy import Column, Integer, String, Float, ForeignKey
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