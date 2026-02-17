import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, RefreshCw } from 'lucide-react';

const QUOTES = [
    { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "There is no substitute for hard work.", author: "Thomas Edison" },
    { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
    { text: "Your limitation—it's only your imagination.", author: "Unknown" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
    { text: "Great things never come from comfort zones.", author: "Unknown" },
    { text: "Dream it. Wish it. Do it.", author: "Unknown" },
    { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
    { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
    { text: "Dream bigger. Do bigger.", author: "Unknown" },
    { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
    { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
    { text: "Do something today that your future self will thank you for.", author: "Unknown" },
    { text: "Little things make big days.", author: "Unknown" },
    { text: "It's going to be hard, but hard does not mean impossible.", author: "Unknown" },
];

export default function QuoteCard() {
    const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));

    const nextQuote = () => {
        setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    };

    return (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-indigo-500/20 md:h-full flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <Quote className="w-5 h-5 text-white" />
                </div>
                <button
                    onClick={nextQuote}
                    className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    title="Next Quote"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={quoteIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    <p className="text-lg md:text-xl font-medium mb-3 leading-relaxed">
                        "{QUOTES[quoteIndex].text}"
                    </p>
                    <p className="text-indigo-200 text-sm font-medium">
                        — {QUOTES[quoteIndex].author}
                    </p>
                </motion.div>
            </AnimatePresence>

            {/* Decorative background elements */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />
        </div>
    );
}
