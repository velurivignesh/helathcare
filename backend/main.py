from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Patient, Doctor
from schemas import PatientCreate, DoctorCreate


Base.metadata.create_all(bind=engine)

app = FastAPI()


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


@app.get("/")
def home():
    return {
        "message": "Healthcare Clinic Management System API is running"
    }


@app.get("/patients")
def get_patients(db: Session = Depends(get_db)):
    patients = db.query(Patient).all()

    return {
        "patients": [
            {
                "id": patient.id,
                "name": patient.name,
                "age": patient.age,
                "phone": patient.phone
            }
            for patient in patients
        ]
    }


@app.post("/patients")
def create_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db)
):
    new_patient = Patient(
        name=patient.name,
        age=patient.age,
        phone=patient.phone
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return {
        "message": "Patient created successfully",
        "patient": {
            "id": new_patient.id,
            "name": new_patient.name,
            "age": new_patient.age,
            "phone": new_patient.phone
        }
    }


@app.delete("/patients/{patient_id}")
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    db.delete(patient)
    db.commit()

    return {
        "message": "Patient deleted successfully"
    }


@app.get("/doctors")
def get_doctors(db: Session = Depends(get_db)):
    doctors = db.query(Doctor).all()

    return {
        "doctors": [
            {
                "id": doctor.id,
                "name": doctor.name,
                "specialization": doctor.specialization,
                "phone": doctor.phone
            }
            for doctor in doctors
        ]
    }


@app.post("/doctors")
def create_doctor(
    doctor: DoctorCreate,
    db: Session = Depends(get_db)
):
    new_doctor = Doctor(
        name=doctor.name,
        specialization=doctor.specialization,
        phone=doctor.phone
    )

    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)

    return {
        "message": "Doctor created successfully",
        "doctor": {
            "id": new_doctor.id,
            "name": new_doctor.name,
            "specialization": new_doctor.specialization,
            "phone": new_doctor.phone
        }
    }


@app.delete("/doctors/{doctor_id}")
def delete_doctor(
    doctor_id: int,
    db: Session = Depends(get_db)
):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found"
        )

    db.delete(doctor)
    db.commit()

    return {
        "message": "Doctor deleted successfully"
    }