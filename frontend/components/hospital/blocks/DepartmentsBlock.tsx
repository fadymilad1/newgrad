import React from 'react';
import Link from 'next/link';
import { getHospitalDepartments } from '@/lib/hospitalApi';

interface DepartmentsBlockProps {
    settings: {
        title?: string;
        show_count?: number;
    };
    subdomain: string;
}

// Server Component — fetches on server (no CORS issues), renders clickable Link cards
export default async function DepartmentsBlock({ settings, subdomain }: DepartmentsBlockProps) {
    const title = settings.title || 'Our Departments';
    const showCount = settings.show_count || 6;

    let departments: any[] = [];
    try {
        departments = await getHospitalDepartments(subdomain);
    } catch (e) {
        console.error('Failed to fetch departments:', e);
    }

    const displayDepartments = departments.slice(0, showCount);

    if (displayDepartments.length === 0) return null;

    return (
        <section id="departments" className="py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="mb-10 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Services</p>
                        <h2 className="mt-2 text-3xl font-bold text-slate-900">{title}</h2>
                    </div>
                    <Link href="/booking" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
                        View all specialties →
                    </Link>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {displayDepartments.map((dept: any) => (
                        <Link
                            key={dept.id}
                            href={`/booking?department_id=${dept.id}`}
                            className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="flex items-center justify-between">
                                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 font-semibold text-blue-700">
                                    {dept.name?.slice(0, 2).toUpperCase() || 'DP'}
                                </span>
                                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase text-emerald-700">
                                    Always Open
                                </span>
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-slate-900">
                                {dept.name}
                            </h3>
                            {dept.description && (
                                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{dept.description}</p>
                            )}
                            <p className="mt-4 flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                                Book appointment{' '}
                                <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
