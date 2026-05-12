import React from 'react';
import Link from 'next/link';
import HospitalChatWidget from '@/components/hospital/HospitalChatWidget';
import { getHospitalProfile } from '@/lib/hospitalApi';
import { normalizeLogoUrl } from '@/lib/storage';

interface LayoutProps {
    children: React.ReactNode;
    params: { subdomain: string };
}

export default async function HospitalLayout({ children, params }: LayoutProps) {
    const resolvedParams = await params;
    const profile = await getHospitalProfile(resolvedParams.subdomain);
    
    const theme = profile?.theme_settings || {};
    const primaryColor = theme.primaryColor || '#2563eb';
    const backgroundColor = theme.backgroundColor || '#f8fafc';
    const borderRadius = theme.borderRadius || '0.5rem';
    const fontFamily = theme.fontFamily || 'Inter';
    
    const chatbotName = theme.chatbotName || `${profile?.name || 'Hospital'} Medical AI`;
    const chatbotColor = theme.chatbotColor || primaryColor;
    const emergencyNumber = theme.emergencyNumber || 'local emergency services';
    const logoUrl = profile?.logo ? normalizeLogoUrl(profile.logo) : null;

    // Load Google Font
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@400;500;600;700&display=swap`;

    return (
        <>
            <link href={fontUrl} rel="stylesheet" />
            <style dangerouslySetInnerHTML={{__html: `
                :root {
                    --hospital-primary: ${primaryColor};
                    --hospital-bg: ${backgroundColor};
                    --hospital-radius: ${borderRadius};
                    --hospital-font: '${fontFamily}', sans-serif;
                }
                
                body {
                    background-color: var(--hospital-bg) !important;
                    font-family: var(--hospital-font) !important;
                }
                
                /* Override default blues in the layout and blocks */
                .from-blue-600.to-teal-500,
                .bg-blue-600 {
                    background: var(--hospital-primary) !important;
                }
                .text-blue-600, .text-blue-700 {
                    color: var(--hospital-primary) !important;
                }
                .bg-blue-50, .bg-blue-100 {
                    background-color: color-mix(in srgb, var(--hospital-primary) 15%, white) !important;
                }
                .border-blue-200 {
                    border-color: color-mix(in srgb, var(--hospital-primary) 30%, white) !important;
                }
                
                /* Override corner styles */
                .rounded-xl, .rounded-lg, .rounded-2xl {
                    border-radius: var(--hospital-radius) !important;
                }
                .rounded-full {
                    /* Only apply to buttons/pills, keep actual circles circular */
                    border-radius: ${borderRadius === '1rem' ? '9999px' : 'var(--hospital-radius)'} !important;
                }
                .h-8.w-8.rounded-full, .h-10.w-10.rounded-full, .h-12.w-12.rounded-full {
                    border-radius: 9999px !important;
                }
            `}} />

            <div className="min-h-screen text-slate-900 flex flex-col">
                <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                        <Link href="/" className="flex items-center gap-3">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="h-8 object-contain" />
                            ) : (
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold">
                                    +
                                </span>
                            )}
                            <span className="text-lg font-bold tracking-tight">{profile?.name || resolvedParams.subdomain}</span>
                        </Link>

                        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
                            <Link href="/" className="hover:text-slate-900">Home</Link>
                            <Link href="/#departments" className="hover:text-slate-900">Departments</Link>
                            <Link href="/#doctors" className="hover:text-slate-900">Doctors</Link>
                            <Link href="/#contact" className="hover:text-slate-900">Contact</Link>
                        </nav>

                        <Link
                            href="/booking"
                            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
                        >
                            Book Appointment
                        </Link>
                    </div>
                </header>

                <main className="flex-1">
                    {children}
                </main>

                <footer className="border-t border-slate-200 bg-slate-900 text-slate-200">
                    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
                        <div>
                            <p className="text-lg font-semibold text-white">{profile?.name || resolvedParams.subdomain}</p>
                            <p className="mt-2 text-sm text-slate-400">
                                {profile?.description || 'Compassionate care with modern clinical excellence.'}
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
                                <p>{emergencyNumber}</p>
                                <p>support@medify.com</p>
                                <p>Medical District</p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            <HospitalChatWidget 
                subdomain={resolvedParams.subdomain} 
                hospitalName={chatbotName} 
                hospitalPhone={emergencyNumber}
            />
        </>
    );
}
