'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { hospitalAdminApi } from '@/lib/hospitalAdminApi';
import type { Appointment } from '@/types/hospital';

type PatientSummary = {
  name: string;
  email: string;
  phone: string;
  visits: number;
  lastVisit: string;
};

export default function HospitalPatientsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const response = await hospitalAdminApi.listAppointments();
      if (response.data) setAppointments(response.data);
      setLoading(false);
    };
    void load();
  }, []);

  const patients = useMemo<PatientSummary[]>(() => {
    const map = new Map<string, PatientSummary>();
    for (const appointment of appointments) {
      const key = `${appointment.patient_name}|${appointment.patient_email}|${appointment.patient_phone}`;
      const existing = map.get(key);
      const visitDate = new Date(appointment.start_datetime).toISOString();
      if (!existing) {
        map.set(key, {
          name: appointment.patient_name,
          email: appointment.patient_email,
          phone: appointment.patient_phone,
          visits: 1,
          lastVisit: visitDate,
        });
        continue;
      }
      existing.visits += 1;
      if (visitDate > existing.lastVisit) {
        existing.lastVisit = visitDate;
      }
    }
    return [...map.values()].sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));
  }, [appointments]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-dark">Patients</h1>
        <p className="mt-1 text-neutral-gray">Patient records based on appointment history.</p>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-neutral-gray">Loading patients...</div>
        ) : patients.length === 0 ? (
          <div className="p-6 text-sm text-neutral-gray">No patients yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-light">
                <tr className="text-left text-neutral-gray">
                  <th className="px-4 py-3 font-medium">Patient</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Visits</th>
                  <th className="px-4 py-3 font-medium">Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={`${patient.email}-${patient.phone}`} className="border-t border-neutral-border">
                    <td className="px-4 py-3 font-semibold text-neutral-dark">{patient.name}</td>
                    <td className="px-4 py-3 text-neutral-gray">{patient.email}</td>
                    <td className="px-4 py-3 text-neutral-gray">{patient.phone}</td>
                    <td className="px-4 py-3 text-neutral-dark">{patient.visits}</td>
                    <td className="px-4 py-3 text-neutral-gray">{new Date(patient.lastVisit).toLocaleString()}</td>
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
