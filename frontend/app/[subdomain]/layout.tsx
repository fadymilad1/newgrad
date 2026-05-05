import React from 'react';
import Link from 'next/link';
import HospitalChatWidget from '@/components/hospital/HospitalChatWidget';

interface LayoutProps {
    children: React.ReactNode;
    params: { subdomain: string };
}

export default async function HospitalLayout({ children, params }: LayoutProps) {
    const resolvedParams = await params;
    return (
        <>
            <div className="min-h-screen bg-slate-50 text-slate-900">
                <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold">
                                +
                            </span>
                            <span className="text-lg font-bold tracking-tight capitalize">{resolvedParams.subdomain}</span>
                        </Link>

                        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
                            <Link href="/" className="hover:text-slate-900">Home</Link>
                            <Link href="/#departments" className="hover:text-slate-900">Departments</Link>
                            <Link href="/#doctors" className="hover:text-slate-900">Doctors</Link>
                            <Link href="/#contact" className="hover:text-slate-900">Contact</Link>
                        </nav>

                        <Link
                            href="/booking"
                            className="rounded-full bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-teal-600"
                        >
                            Book Appointment
                        </Link>
                    </div>
                </header>

                {children}

                <footer className="border-t border-slate-200 bg-slate-900 text-slate-200">
                    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
                        <div>
                            <p className="text-lg font-semibold text-white capitalize">{resolvedParams.subdomain} Hospital</p>
                            <p className="mt-2 text-sm text-slate-400">
                                Compassionate care with modern clinical excellence.
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">Quick Links</p>
                            <div className="mt-3 space-y-2 text-sm text-slate-400">
                                <p><Link href="/">Home</Link></p>
                                <p><Link href="/#departments">Departments</Link></p>
                                <p><Link href="/#doctors">Doctors</Link></p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">Services</p>
                            <div className="mt-3 space-y-2 text-sm text-slate-400">
                                <p>General Checkup</p>
                                <p>Emergency Care</p>
                                <p>Lab Diagnostics</p>
                            </div>
                        </div>
                        <div id="contact">
                            <p className="text-sm font-semibold text-white">Contact</p>
                            <div className="mt-3 space-y-2 text-sm text-slate-400">
                                <p>+1 (800) MEDIFY</p>
                                <p>support@medify.com</p>
                                <p>Medical District</p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            <HospitalChatWidget subdomain={resolvedParams.subdomain} />
        </>
    );
}
