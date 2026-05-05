'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { hospitalAdminApi } from '@/lib/hospitalAdminApi';
import type { Department } from '@/types/hospital';

export default function HospitalEmergencyPage() {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const load = async () => {
      const response = await hospitalAdminApi.listDepartments();
      if (response.data) setDepartments(response.data);
    };
    void load();
  }, []);

  const emergencyDepartments = departments.filter((department) =>
    department.name.toLowerCase().includes('emerg'),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-dark">Emergency</h1>
        <p className="mt-1 text-neutral-gray">Central emergency actions and escalation support.</p>
      </div>

      <Card className="border border-red-200 bg-red-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Emergency Hotline</p>
        <p className="mt-2 text-3xl font-bold text-red-700">1-800-MEDIFY</p>
        <p className="mt-2 text-sm text-red-700/85">
          Trigger critical communication and rapid response workflows.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button className="bg-red-600 hover:bg-red-700">Activate Code Blue</Button>
          <Button variant="secondary" className="border-red-300 text-red-700 hover:bg-red-100">
            Notify On-call Team
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-neutral-dark">Emergency-capable departments</h2>
        <div className="mt-4 space-y-2">
          {(emergencyDepartments.length > 0 ? emergencyDepartments : departments.slice(0, 5)).map((department) => (
            <div key={department.id} className="rounded-lg border border-neutral-border bg-white p-3">
              <p className="font-semibold text-neutral-dark">{department.name}</p>
              {department.description ? <p className="mt-1 text-sm text-neutral-gray">{department.description}</p> : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
