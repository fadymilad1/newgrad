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
        <div className="bg-gray-50 py-16 px-6">
            <div className="container mx-auto max-w-4xl text-center">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">Contact Us</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {settings.phone && (
                        <div className="p-6 bg-white rounded-lg shadow-sm">
                            <h3 className="font-semibold text-lg text-gray-700 mb-2">Phone</h3>
                            <p className="text-blue-600">{settings.phone}</p>
                        </div>
                    )}
                    {settings.email && (
                        <div className="p-6 bg-white rounded-lg shadow-sm">
                            <h3 className="font-semibold text-lg text-gray-700 mb-2">Email</h3>
                            <p className="text-blue-600">{settings.email}</p>
                        </div>
                    )}
                    {settings.address && (
                        <div className="p-6 bg-white rounded-lg shadow-sm">
                            <h3 className="font-semibold text-lg text-gray-700 mb-2">Address</h3>
                            <p className="text-gray-600">{settings.address}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
