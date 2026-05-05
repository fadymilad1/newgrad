'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { hospitalAdminApi } from '@/lib/hospitalAdminApi';
import type { Appointment, Department, Doctor, HospitalProfile } from '@/types/hospital';

export default function HospitalDashboardHomePage() {
  const [profile, setProfile] = useState<HospitalProfile | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [profileRes, doctorRes, departmentRes, appointmentRes] = await Promise.all([
        hospitalAdminApi.getProfile(),
        hospitalAdminApi.listDoctors(),
        hospitalAdminApi.listDepartments(),
        hospitalAdminApi.listAppointments(),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (doctorRes.data) setDoctors(doctorRes.data);
      if (departmentRes.data) setDepartments(departmentRes.data);
      if (appointmentRes.data) setAppointments(appointmentRes.data);
      setLoading(false);
    };
    void load();
  }, []);

  const pendingCount = useMemo(
    () => appointments.filter((appointment) => appointment.status === 'PENDING').length,
    [appointments],
  );
  const confirmedCount = useMemo(
    () => appointments.filter((appointment) => appointment.status === 'CONFIRMED').length,
    [appointments],
  );

  const upcomingAppointments = useMemo(
    () =>
      [...appointments]
        .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
        .slice(0, 6),
    [appointments],
  );

  if (loading) {
    return <div className="text-sm text-neutral-gray">Loading hospital dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark">Hospital Dashboard</h1>
          <p className="mt-1 text-neutral-gray">
            {profile?.name || 'Your hospital'} operations overview.
          </p>
        </div>
        <Link href="/dashboard/business-info">
          <Button>Publish / Update Website</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-neutral-gray">Total Appointments</p>
          <p className="mt-2 text-3xl font-bold text-neutral-dark">{appointments.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-neutral-gray">Pending</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{pendingCount}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-neutral-gray">Confirmed</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{confirmedCount}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-neutral-gray">Doctors / Departments</p>
          <p className="mt-2 text-3xl font-bold text-neutral-dark">
            {doctors.length} / {departments.length}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-dark">Upcoming Appointments</h2>
          <Link href="/dashboard/hospital/appointments" className="text-sm font-semibold text-primary">
            View all
          </Link>
        </div>
        {upcomingAppointments.length === 0 ? (
          <p className="text-sm text-neutral-gray">No upcoming appointments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-border text-left text-neutral-gray">
                  <th className="px-2 py-2 font-medium">Patient</th>
                  <th className="px-2 py-2 font-medium">Doctor</th>
                  <th className="px-2 py-2 font-medium">Date & Time</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b border-neutral-border/70">
                    <td className="px-2 py-3 font-medium text-neutral-dark">{appointment.patient_name}</td>
                    <td className="px-2 py-3 text-neutral-gray">{appointment.doctor_name}</td>
                    <td className="px-2 py-3 text-neutral-gray">
                      {new Date(appointment.start_datetime).toLocaleString()}
                    </td>
                    <td className="px-2 py-3">
                      <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary">
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
