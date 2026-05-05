import Link from 'next/link';
import { getHospitalDepartments, getHospitalDoctors } from '@/lib/hospitalApi';

interface PublicHospitalHighlightsProps {
  subdomain: string;
}

const testimonials = [
  {
    quote: 'The appointment flow is simple, and the doctors are always on time and supportive.',
    name: 'Elena Richards',
  },
  {
    quote: 'From emergency care to follow-up, the staff handled everything with great care.',
    name: 'David Chen',
  },
  {
    quote: 'Professional team, modern facilities, and a clear communication style.',
    name: 'Sarah Mitchell',
  },
];

export default async function PublicHospitalHighlights({ subdomain }: PublicHospitalHighlightsProps) {
  let doctorsCount = 0;
  let departmentsCount = 0;

  try {
    const [doctors, departments] = await Promise.all([
      getHospitalDoctors(subdomain),
      getHospitalDepartments(subdomain),
    ]);
    doctorsCount = doctors.length;
    departmentsCount = departments.length;
  } catch {
    doctorsCount = 0;
    departmentsCount = 0;
  }

  const metrics = [
    { label: 'Expert Doctors', value: doctorsCount > 0 ? `${doctorsCount}+` : '500+' },
    { label: 'Departments', value: departmentsCount > 0 ? `${departmentsCount}+` : '15+' },
    { label: 'Years of Excellence', value: '25' },
    { label: 'Patients Treated', value: '50k+' },
  ];

  return (
    <>
      <section className="bg-[#0f5ea8] py-10 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 md:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="text-center">
              <p className="text-3xl font-bold">{metric.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-blue-100">{metric.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Patient Stories</p>
          <h2 className="mt-3 text-center text-3xl font-bold text-slate-900">What our patients say</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm text-slate-600">{item.quote}</p>
                <p className="mt-5 text-sm font-semibold text-slate-900">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-teal-500 to-blue-600 py-14">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 text-center sm:px-6 md:flex-row md:text-left">
          <div>
            <h3 className="text-3xl font-bold text-white">Ready to prioritize your health?</h3>
            <p className="mt-2 text-sm text-blue-50">Book online and skip long waiting room queues.</p>
          </div>
          <Link
            href="/booking"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow transition hover:bg-blue-50"
          >
            Book Your Appointment
          </Link>
        </div>
      </section>
    </>
  );
}
