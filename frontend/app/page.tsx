export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-bold text-slate-900">
            MediCare Clinic
          </h1>

          <nav className="flex gap-6 text-sm text-slate-600">
            <a href="/" className="hover:text-blue-600">
              Dashboard
            </a>

            <a href="/patients" className="hover:text-blue-600">
              Patients
            </a>

            <a href="/doctors" className="hover:text-blue-600">
              Doctors
            </a>

            <a href="/appointments" className="hover:text-blue-600">
              Appointments
            </a>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900">
            Welcome to MediCare Clinic
          </h2>

          <p className="mt-2 text-slate-600">
            Manage patients, doctors, appointments, and medical records.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total Patients</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">120</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Doctors</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">12</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Today's Appointments</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">24</p>
          </div>
        </div>

        {/* Features */}
        <section className="mt-10">
          <h3 className="text-xl font-semibold text-slate-900">
            Clinic Management
          </h3>

          <div className="mt-5 grid gap-6 md:grid-cols-3">
            <a
              href="/patients"
              className="rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h4 className="text-lg font-semibold text-slate-900">
                Patients
              </h4>

              <p className="mt-2 text-sm text-slate-600">
                Register and manage patient information and medical history.
              </p>

              <p className="mt-4 text-sm font-medium text-blue-600">
                Manage Patients →
              </p>
            </a>

            <a
              href="/doctors"
              className="rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h4 className="text-lg font-semibold text-slate-900">
                Doctors
              </h4>

              <p className="mt-2 text-sm text-slate-600">
                Manage doctors, specialties, and clinic schedules.
              </p>

              <p className="mt-4 text-sm font-medium text-blue-600">
                Manage Doctors →
              </p>
            </a>

            <a
              href="/appointments"
              className="rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h4 className="text-lg font-semibold text-slate-900">
                Appointments
              </h4>

              <p className="mt-2 text-sm text-slate-600">
                Schedule and manage patient appointments.
              </p>

              <p className="mt-4 text-sm font-medium text-blue-600">
                Manage Appointments →
              </p>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}