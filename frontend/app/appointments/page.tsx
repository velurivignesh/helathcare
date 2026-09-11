"use client";

import { useEffect, useState } from "react";

type Patient = {
  id: number;
  name: string;
};

type Doctor = {
  id: number;
  name: string;
  specialization: string;
};

type Appointment = {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  reason: string;
};

export default function AppointmentsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [reason, setReason] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchPatients() {
    const response = await fetch("http://127.0.0.1:8000/patients");

    if (!response.ok) {
      throw new Error("Failed to fetch patients");
    }

    const data = await response.json();
    setPatients(data.patients);
  }

  async function fetchDoctors() {
    const response = await fetch("http://127.0.0.1:8000/doctors");

    if (!response.ok) {
      throw new Error("Failed to fetch doctors");
    }

    const data = await response.json();
    setDoctors(data.doctors);
  }

  async function fetchAppointments() {
    const response = await fetch("http://127.0.0.1:8000/appointments");

    if (!response.ok) {
      throw new Error("Failed to fetch appointments");
    }

    const data = await response.json();
    setAppointments(data.appointments);
  }

  async function loadData() {
    try {
      await Promise.all([
        fetchPatients(),
        fetchDoctors(),
        fetchAppointments(),
      ]);
    } catch (error) {
      setMessage("Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !patientId ||
      !doctorId ||
      !appointmentDate ||
      !appointmentTime ||
      !reason
    ) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/appointments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patient_id: Number(patientId),
            doctor_id: Number(doctorId),
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            reason: reason,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create appointment");
      }

      setMessage("Appointment created successfully.");

      setPatientId("");
      setDoctorId("");
      setAppointmentDate("");
      setAppointmentTime("");
      setReason("");

      await fetchAppointments();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Unable to create appointment.");
      }
    }
  }

  async function handleDelete(appointmentId: number) {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/appointments/${appointmentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete appointment");
      }

      setMessage("Appointment deleted successfully.");

      await fetchAppointments();
    } catch (error) {
      setMessage("Unable to delete appointment.");
    }
  }

  function getPatientName(patientId: number) {
    const patient = patients.find((item) => item.id === patientId);
    return patient ? patient.name : `Patient #${patientId}`;
  }

  function getDoctorName(doctorId: number) {
    const doctor = doctors.find((item) => item.id === doctorId);
    return doctor ? doctor.name : `Doctor #${doctorId}`;
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <h1 className="text-2xl font-bold text-slate-900">
            MediCare Clinic
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <h2 className="text-3xl font-bold text-slate-900">
          Create Appointment
        </h2>

        <p className="mt-2 text-slate-600">
          Schedule an appointment between a patient and doctor.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-xl bg-white p-6 shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Patient
            </label>

            <select
              value={patientId}
              onChange={(event) => setPatientId(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">Select a patient</option>

              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Doctor
            </label>

            <select
              value={doctorId}
              onChange={(event) => setDoctorId(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">Select a doctor</option>

              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Appointment Date
            </label>

            <input
              type="date"
              value={appointmentDate}
              onChange={(event) =>
                setAppointmentDate(event.target.value)
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Appointment Time
            </label>

            <input
              type="time"
              value={appointmentTime}
              onChange={(event) =>
                setAppointmentTime(event.target.value)
              }
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Reason
            </label>

            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Enter appointment reason"
              rows={4}
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            Create Appointment
          </button>

          {message && (
            <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700">
              {message}
            </p>
          )}
        </form>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900">
            Appointments
          </h2>

          {loading ? (
            <p className="mt-4 text-slate-600">
              Loading appointments...
            </p>
          ) : appointments.length === 0 ? (
            <p className="mt-4 text-slate-600">
              No appointments found.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-xl bg-white p-5 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-slate-900">
                    {getPatientName(appointment.patient_id)}
                  </h3>

                  <p className="mt-1 text-slate-600">
                    Doctor: {getDoctorName(appointment.doctor_id)}
                  </p>

                  <p className="text-slate-600">
                    Date: {appointment.appointment_date}
                  </p>

                  <p className="text-slate-600">
                    Time: {appointment.appointment_time}
                  </p>

                  <p className="text-slate-600">
                    Reason: {appointment.reason}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleDelete(appointment.id)}
                    className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}