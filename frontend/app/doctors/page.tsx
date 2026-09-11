"use client";

import { useEffect, useState } from "react";

type Doctor = {
  id: number;
  name: string;
  specialization: string;
  phone: string;
};

export default function DoctorsPage() {
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [phone, setPhone] = useState("");

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchDoctors() {
    try {
      const response = await fetch("http://127.0.0.1:8000/doctors");

      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }

      const data = await response.json();
      setDoctors(data.doctors);
    } catch (error) {
      setMessage("Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDoctors();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name || !specialization || !phone) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          specialization,
          phone,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create doctor");
      }

      setMessage(`Doctor ${name} has been added successfully.`);
      setName("");
      setSpecialization("");
      setPhone("");

      await fetchDoctors();
    } catch (error) {
      setMessage("Unable to add doctor. Please check the backend.");
    }
  }

  async function handleDelete(doctorId: number) {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/doctors/${doctorId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete doctor");
      }

      setMessage("Doctor deleted successfully.");
      await fetchDoctors();
    } catch (error) {
      setMessage("Unable to delete doctor. Please check the backend.");
    }
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

      <div className="mx-auto max-w-3xl px-6 py-10">
        <h2 className="text-3xl font-bold text-slate-900">
          Add Doctor
        </h2>

        <p className="mt-2 text-slate-600">
          Enter the doctor's basic information.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-xl bg-white p-6 shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Doctor Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter doctor name"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Specialization
            </label>

            <input
              type="text"
              value={specialization}
              onChange={(event) => setSpecialization(event.target.value)}
              placeholder="e.g. Cardiology"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Phone Number
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Enter phone number"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            Add Doctor
          </button>

          {message && (
            <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700">
              {message}
            </p>
          )}
        </form>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900">
            Doctors
          </h2>

          {loading ? (
            <p className="mt-4 text-slate-600">
              Loading doctors...
            </p>
          ) : doctors.length === 0 ? (
            <p className="mt-4 text-slate-600">
              No doctors found.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="rounded-xl bg-white p-5 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-slate-900">
                    {doctor.name}
                  </h3>

                  <p className="mt-1 text-slate-600">
                    Specialization: {doctor.specialization}
                  </p>

                  <p className="text-slate-600">
                    Phone: {doctor.phone}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleDelete(doctor.id)}
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
