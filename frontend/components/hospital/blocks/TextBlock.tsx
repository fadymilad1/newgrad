import React from 'react';

interface TextBlockProps {
    settings: {
        content?: string;
    };
}

export default function TextBlock({ settings }: TextBlockProps) {
    if (!settings.content) return null;

    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <div 
                className="prose prose-lg max-w-none text-gray-800"
                dangerouslySetInnerHTML={{ __html: settings.content }} 
            />
        </div>
    );
}
