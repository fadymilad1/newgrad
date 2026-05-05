import React from 'react';

interface ContactBlockProps {
    settings: {
        phone?: string;
        email?: string;
        address?: string;
    };
}

export default function ContactBlock({ settings }: ContactBlockProps) {
    return (
        <section id="contact" className="bg-slate-50 py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">Emergency Hotline</p>
                    <p className="mt-2 text-3xl font-bold text-red-700">{settings.phone || '1-800-MEDIFY'}</p>
                    <p className="mt-1 text-sm text-red-700/80">For urgent cases, call immediately for assistance.</p>
                </div>

                <h2 className="text-center text-3xl font-bold text-slate-900">Contact Us</h2>
                <div className="mt-8 grid gap-5 md:grid-cols-3">
                    {settings.phone && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-2 text-lg font-semibold text-slate-900">Phone</h3>
                            <p className="text-blue-700">{settings.phone}</p>
                        </div>
                    )}
                    {settings.email && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-2 text-lg font-semibold text-slate-900">Email</h3>
                            <p className="text-blue-700">{settings.email}</p>
                        </div>
                    )}
                    {settings.address && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-2 text-lg font-semibold text-slate-900">Address</h3>
                            <p className="text-slate-600">{settings.address}</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
