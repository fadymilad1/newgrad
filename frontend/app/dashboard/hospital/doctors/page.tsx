'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { hospitalAdminApi } from '@/lib/hospitalAdminApi';
import type { Doctor } from '@/types/hospital';

export default function HospitalDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const response = await hospitalAdminApi.listDoctors();
      if (response.data) setDoctors(response.data);
      setLoading(false);
    };
    void load();
  }, []);

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return doctors;
    return doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialty.toLowerCase().includes(query) ||
        doctor.department_name.toLowerCase().includes(query),
    );
  }, [doctors, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark">Doctors Directory</h1>
          <p className="mt-1 text-neutral-gray">Manage medical staff and their specialties.</p>
        </div>
        <Link href="/dashboard/hospital/setup">
          <Button>Add Doctor</Button>
        </Link>
      </div>

      <Card className="p-5">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search doctors by name, specialty, or department..."
          className="input-field w-full md:max-w-lg"
        />
      </Card>

      {loading ? (
        <Card className="p-6 text-sm text-neutral-gray">Loading doctors...</Card>
      ) : filteredDoctors.length === 0 ? (
        <Card className="p-6 text-sm text-neutral-gray">No doctors found.</Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="overflow-hidden border border-neutral-border">
              <div className="h-2 bg-primary" />
              <div className="p-5">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-xl font-bold text-primary">
                  {doctor.name
                    .split(' ')
                    .slice(0, 2)
                    .map((token) => token.charAt(0).toUpperCase())
                    .join('')}
                </div>
                <p className="text-lg font-semibold text-neutral-dark">{doctor.name}</p>
                <p className="text-sm font-medium text-primary">{doctor.specialty}</p>
                <p className="mt-1 text-xs text-neutral-gray">{doctor.department_name}</p>
                <p className="mt-3 line-clamp-3 text-sm text-neutral-gray">{doctor.bio || 'No biography provided.'}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    doctor.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {doctor.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <Link href="/dashboard/hospital/setup" className="text-xs font-semibold text-primary">
                    Edit
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
