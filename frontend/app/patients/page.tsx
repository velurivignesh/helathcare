"use client";

import { useEffect, useState } from "react";

type Patient = {
  id: number;
  name: string;
  age: number;
  phone: string;
};

export default function PatientsPage() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");

  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchPatients() {
    try {
      const response = await fetch("http://127.0.0.1:8000/patients");

      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }

      const data = await response.json();
      setPatients(data.patients);
    } catch (error) {
      setMessage("Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPatients();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name || !age || !phone) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          age: Number(age),
          phone: phone,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create patient");
      }

      setMessage(`Patient ${name} has been added successfully.`);

      setName("");
      setAge("");
      setPhone("");

      await fetchPatients();
    } catch (error) {
      setMessage("Unable to add patient. Please check the backend.");
    }
  }

  async function handleDelete(patientId: number) {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/patients/${patientId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete patient");
      }

      setMessage("Patient deleted successfully.");

      await fetchPatients();
    } catch (error) {
      setMessage("Unable to delete patient. Please check the backend.");
    }
  }

  const filteredPatients = patients.filter((patient) => {
    const searchText = search.toLowerCase();

    return (
      patient.name.toLowerCase().includes(searchText) ||
      patient.phone.toLowerCase().includes(searchText)
    );
  });

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
          Add Patient
        </h2>

        <p className="mt-2 text-slate-600">
          Enter the patient's basic information.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-xl bg-white p-6 shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Patient Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter patient name"
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Age
            </label>

            <input
              type="number"
              value={age}
              onChange={(event) => setAge(event.target.value)}
              placeholder="Enter age"
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
            Add Patient
          </button>

          {message && (
            <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-700">
              {message}
            </p>
          )}
        </form>

        <section className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-900">
              Patients
            </h2>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search patients..."
              className="w-64 rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-blue-500"
            />
          </div>

          {loading ? (
            <p className="mt-4 text-slate-600">
              Loading patients...
            </p>
          ) : filteredPatients.length === 0 ? (
            <p className="mt-4 text-slate-600">
              No patients found.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="rounded-xl bg-white p-5 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-slate-900">
                    {patient.name}
                  </h3>

                  <p className="mt-1 text-slate-600">
                    Age: {patient.age}
                  </p>

                  <p className="text-slate-600">
                    Phone: {patient.phone}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleDelete(patient.id)}
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