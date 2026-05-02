import React from 'react';
import { notFound } from 'next/navigation';
import { getHospitalPages } from '@/lib/hospitalApi';
import BlockRenderer from '@/components/hospital/BlockRenderer';

interface PageProps {
    params: {
        subdomain: string;
    };
}

// Ensure dynamic rendering because we rely on API fetching
export const dynamic = 'force-dynamic';

export default async function HospitalHomePage({ params }: PageProps) {
    const resolvedParams = await params;
    const pages = await getHospitalPages(resolvedParams.subdomain);
    
    const homePage = pages.find(p => p.is_home && p.is_published);

    if (!homePage) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white">
            <BlockRenderer blocks={homePage.blocks} subdomain={resolvedParams.subdomain} />
        </main>
    );
}
