import React from 'react';
import Link from 'next/link';

interface HeroBlockProps {
    settings: {
        headline?: string;
        subheadline?: string;
        button_text?: string;
        button_link?: string;
    };
    subdomain: string;
}

export default function HeroBlock({ settings, subdomain }: HeroBlockProps) {
    const {
        headline = 'Welcome to Our Hospital',
        subheadline = 'Providing quality healthcare for you and your family.',
        button_text,
        button_link
    } = settings;

    // On a subdomain site (e.g. test.localhost:3000), links are relative to the host.
    // The path should be just /booking, NOT /test/booking.
    const linkPath = button_link?.startsWith('/') ? button_link : `/${button_link}`;

    return (
        <div className="bg-blue-600 text-white py-20 px-6 sm:px-12 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{headline}</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">{subheadline}</p>
            {button_text && button_link && (
                <Link
                    href={linkPath}
                    className="inline-block bg-white text-blue-600 font-semibold text-lg py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                >
                    {button_text}
                </Link>
            )}
        </div>
    );
}
