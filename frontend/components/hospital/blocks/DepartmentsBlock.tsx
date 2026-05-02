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

const DEPT_ICONS: Record<string, string> = {
    cardiology: '❤️',
    neurology: '🧠',
    orthopedics: '🦴',
    pediatrics: '👶',
    dermatology: '🧴',
    ophthalmology: '👁️',
    oncology: '🎗️',
    radiology: '🩻',
    emergency: '🚨',
    surgery: '🔬',
    gynecology: '👩‍⚕️',
    dentistry: '🦷',
};

function getDeptIcon(name: string): string {
    const lower = name.toLowerCase();
    for (const [key, icon] of Object.entries(DEPT_ICONS)) {
        if (lower.includes(key)) return icon;
    }
    return '🏥';
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
        <div className="py-16 px-6 bg-gray-50">
            <div className="container mx-auto max-w-6xl">
                <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">{title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayDepartments.map((dept: any) => (
                        <Link
                            key={dept.id}
                            href={`/booking?department_id=${dept.id}`}
                            className="group block border border-gray-100 bg-white rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-200"
                        >
                            <div className="text-4xl mb-3">{getDeptIcon(dept.name)}</div>
                            <h3 className="text-xl font-semibold mb-2 text-blue-700 group-hover:text-blue-800">
                                {dept.name}
                            </h3>
                            {dept.description && (
                                <p className="text-gray-600 text-sm line-clamp-2">{dept.description}</p>
                            )}
                            <p className="mt-3 text-sm text-blue-500 font-medium group-hover:text-blue-700 flex items-center gap-1">
                                Book appointment{' '}
                                <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
