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
        <div className="py-16 px-6 bg-gray-50">
            <div className="container mx-auto max-w-6xl">
                <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">{title}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {displayDoctors.map(doc => (
                        <div key={doc.id} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col items-center p-6 text-center">
                            <div className="w-24 h-24 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                                {doc.name.charAt(0)}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{doc.name}</h3>
                            <p className="text-sm font-medium text-teal-600 mb-3">{doc.specialty}</p>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{doc.bio}</p>
                            <Link 
                                href={`/booking?doctor_id=${doc.id}`}
                                className="mt-auto border border-teal-600 text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                            >
                                Book Appointment
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
