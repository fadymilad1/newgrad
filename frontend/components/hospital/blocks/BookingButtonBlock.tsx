import React from 'react';
import Link from 'next/link';

interface BookingButtonBlockProps {
    settings: {
        text?: string;
        doctor_id?: string;
    };
}

export default function BookingButtonBlock({ settings }: BookingButtonBlockProps) {
    const btnText = settings.text || 'Book Now';
    const href = settings.doctor_id 
        ? `/booking?doctor_id=${settings.doctor_id}` 
        : '/booking';

    return (
        <div className="container mx-auto px-6 py-8 flex justify-center">
            <Link
                href={href}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-10 rounded-full shadow-md transition-colors text-lg"
            >
                {btnText}
            </Link>
        </div>
    );
}
