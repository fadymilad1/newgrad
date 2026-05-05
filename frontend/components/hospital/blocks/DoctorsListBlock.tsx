import React from 'react';
import { getHospitalDoctors } from '@/lib/hospitalApi';
import Link from 'next/link';

interface DoctorsListBlockProps {
    settings: {
        title?: string;
        show_count?: number;
    };
    subdomain: string;
}

export default async function DoctorsListBlock({ settings, subdomain }: DoctorsListBlockProps) {
    const title = settings.title || 'Our Specialists';
    const showCount = settings.show_count || 4;

    let doctors = [];
    try {
        doctors = await getHospitalDoctors(subdomain);
    } catch (e) {
        console.error('Failed to fetch doctors:', e);
    }

    const displayDoctors = doctors.slice(0, showCount);

    if (displayDoctors.length === 0) return null;

    return (
        <section id="doctors" className="bg-white py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Meet globally recognized specialists focused on patient-first care.
                    </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {displayDoctors.map(doc => (
                        <div
                            key={doc.id}
                            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            {doc.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={doc.image_url}
                                    alt={doc.name}
                                    className="mx-auto mb-4 h-24 w-24 rounded-full object-cover ring-4 ring-blue-50"
                                />
                            ) : (
                                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-2xl font-bold text-blue-700 ring-4 ring-blue-50">
                                    {doc.name.charAt(0)}
                                </div>
                            )}
                            <h3 className="text-lg font-semibold text-slate-900">{doc.name}</h3>
                            <p className="mt-1 text-sm font-medium text-blue-700">{doc.specialty}</p>
                            <p className="mt-2 line-clamp-2 text-sm text-slate-500">{doc.bio}</p>
                            <p className="mt-3 text-xs font-medium text-slate-500">{doc.department_name}</p>
                            <Link 
                                href={`/booking?doctor_id=${doc.id}`}
                                className="mt-5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                            >
                                Book Appointment
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
