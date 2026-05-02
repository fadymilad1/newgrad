import React from 'react';
import HospitalChatWidget from '@/components/hospital/HospitalChatWidget';

interface LayoutProps {
    children: React.ReactNode;
    params: { subdomain: string };
}

export default async function HospitalLayout({ children, params }: LayoutProps) {
    const resolvedParams = await params;
    return (
        <>
            {children}
            {/* Floating AI Chatbot Widget for every hospital page */}
            <HospitalChatWidget subdomain={resolvedParams.subdomain} />
        </>
    );
}
