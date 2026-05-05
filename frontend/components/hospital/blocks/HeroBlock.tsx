import React from 'react';
import Link from 'next/link';

interface HeroBlockProps {
    settings: {
        headline?: string;
        subheadline?: string;
        button_text?: string;
        button_link?: string;
        secondary_button_text?: string;
        secondary_button_link?: string;
        background_image_url?: string;
        badge_text?: string;
    };
    subdomain: string;
}

export default function HeroBlock({ settings }: HeroBlockProps) {
    const {
        headline = 'Welcome to Our Hospital',
        subheadline = 'Providing quality healthcare for you and your family.',
        button_text,
        button_link,
        secondary_button_text = 'Meet Our Doctors',
        secondary_button_link = '/#doctors',
        background_image_url = '/logo.png',
        badge_text = 'Premium Healthcare',
    } = settings;

    // On a subdomain site (e.g. test.localhost:3000), links are relative to the host.
    // The path should be just /booking, NOT /test/booking.
    const linkPath = button_link?.startsWith('/') ? button_link : `/${button_link}`;

    return (
        <section className="relative overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${background_image_url})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f5ea8]/95 via-[#0f5ea8]/75 to-[#0f5ea8]/55" />

            <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
                <div className="max-w-2xl text-white">
                    <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                        {badge_text}
                    </span>
                    <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
                        {headline}
                    </h1>
                    <p className="mt-5 max-w-xl text-base text-blue-50 sm:text-lg">
                        {subheadline}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        {button_text && button_link && (
                            <Link
                                href={linkPath}
                                className="rounded-full bg-gradient-to-r from-teal-400 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow transition hover:from-teal-500 hover:to-teal-600"
                            >
                                {button_text}
                            </Link>
                        )}
                        <Link
                            href={secondary_button_link}
                            className="rounded-full border border-white/50 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                        >
                            {secondary_button_text}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
