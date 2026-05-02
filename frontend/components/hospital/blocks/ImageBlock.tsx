import React from 'react';

interface ImageBlockProps {
    settings: {
        url?: string;
        alt_text?: string;
    };
}

export default function ImageBlock({ settings }: ImageBlockProps) {
    if (!settings.url) return null;

    return (
        <div className="container mx-auto px-6 py-12 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
                src={settings.url} 
                alt={settings.alt_text || 'Hospital Image'} 
                className="rounded-xl shadow-md max-w-full h-auto object-cover max-h-[600px]"
            />
        </div>
    );
}
