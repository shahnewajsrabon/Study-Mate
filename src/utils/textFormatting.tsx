import React from 'react';

/**
 * Parses text and returns a React Node array with formatting.
 * Supports:
 * - **bold**
 * - *italic*
 * - `code`
 * - URLs (auto-linked)
 */
export const formatMessageText = (text: string): React.ReactNode[] => {
    if (!text) return [];

    // Regex explanation:
    // 1. Code: `([^`]+)`
    // 2. Bold: \*\*([^*]+)\*\*
    // 3. Italic: \*([^*]+)\*
    // 4. URL: (https?:\/\/[^\s]+)
    // We split by these patterns using capturing groups to keep the delimiters/content
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|https?:\/\/[^\s]+)/g);

    return parts.map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
            return (
                <code key={index} className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800 dark:text-slate-200">
                    {part.slice(1, -1)}
                </code>
            );
        }
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
            return <em key={index} className="italic">{part.slice(1, -1)}</em>;
        }
        if (part.match(/^https?:\/\//)) {
            return (
                <a
                    key={index}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                    onClick={(e) => e.stopPropagation()} // Prevent bubbling if needed
                >
                    {part}
                </a>
            );
        }
        return part;
    });
};
