import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, RefreshCw } from 'lucide-react';

const QUOTES = [
    { text: "পড়ুন আপনার রবের নামে, যিনি সৃষ্টি করেছেন।", author: "সূরা আল-আলাক: ১" },
    { text: "বলুন, হে আমার রব! আমার জ্ঞান বৃদ্ধি করে দিন।", author: "সূরা ত্বহা: ১১৪" },
    { text: "বলুন, যারা জানে আর যারা জানে না তারা কি সমান হতে পারে?", author: "সূরা আয-যুমার: ৯" },
    { text: "তিনি যাকে ইচ্ছা প্রজ্ঞা দান করেন।", author: "সূরা আল-বাকারাহ: ২৬৯" },
    { text: "যারা জ্ঞানী কেবল তারাই আল্লাহকে ভয় করে।", author: "সূরা ফাতির: ২৮" },
    { text: "যদি তোমরা না জান তবে জ্ঞানীদের জিজ্ঞাসা কর।", author: "সূরা আল-আম্বিয়া: ৭" },
    { text: "নিশ্চয় কষ্টের সাথেই স্বস্তি রয়েছে।", author: "সূরা আল-ইনশিরাহ: ৫" },
    { text: "মানুষ তাই পায় যা সে করার চেষ্টা করে।", author: "সূরা আন-নাজম: ৩৯" },
    { text: "হে মুমিনগণ! ধৈর্য ও সালাতের মাধ্যমে সাহায্য প্রার্থনা কর।", author: "সূরা আল-বাকারাহ: ১৫৩" },
    { text: "তোমার রবের দয়া হতে নিরাশ হয়ো না।", author: "সূরা আয-যুমার: ৫৩" },
    { text: "আল্লাহ কাউকে তার সাধ্যের অতিরিক্ত দায়িত্ব দেন না।", author: "সূরা আল-বাকারাহ: ২৮৬" },
    { text: "হে আমার রব! আমার বক্ষ প্রশস্ত করে দিন এবং আমার কাজ সহজ করে দিন।", author: "সূরা ত্বহা: ২৫-২৬" },
    { text: "তোমরা কি জ্ঞান অর্জন করবে না?", author: "সূরা আল-আনআম: ৫০" },
    { text: "নিশ্চয় আল্লাহর ওয়াদা সত্য।", author: "সূরা লোকমান: ৩৩" },
    { text: "জ্ঞান অর্জন করা প্রত্যেক মুসলিমের জন্য ফরয।", author: "সুনানে ইবনে মাজাহ: ২২৩" },
    { text: "ভালো কথার উপদেশ দেওয়াও একটি সদকা।", author: "সহিহ বুখারি: ২৯৮৯" },
    { text: "ধৈর্য হলো আলো।", author: "সহিহ মুসলিম: ২২৩" },
    { text: "পরিশ্রমকারীর বন্ধু আল্লাহ।", author: "এটি একটি প্রসিদ্ধ হিকমত" },
    { text: "সব কাজ নিয়তের ওপর নির্ভরশীল।", author: "সহিহ বুখারি: ১" },
    { text: "সময়ের গুরুত্ব দাও।", author: "সহিহ বুখারি: ৬৪১৬" },
    { text: "যে পরিশ্রম করে সে বিফল হয় না।", author: "মুসনাদে আহমাদ" },
    { text: "আল্লাহর ওপর ভরসা কর।", author: "সুনানে তিরমিজি: ২৩৪৪" },
    { text: "আল্লাহর কাছে সাহায্য চাও এবং অলসতা করো না।", author: "সহিহ মুসলিম: ২৬৬৪" },
    { text: "অবসর সময়কে ব্যস্ততার আগে কাজে লাগাও।", author: "সুনানে তিরমিজি" },
    { text: "জীবনকে মৃত্যুর আগে কাজে লাগাও।", author: "সহিহ বুখারি" },
    { text: "উত্তম মানুষ সে-ই যে মানুষের উপকার করে।", author: "তাবারানি" },
    { text: "আল্লাহর রহমত থেকে নিরাশ হওয়া কুফরি।", author: "এটি কুরআনের আয়াতের মর্মার্থ" },
    { text: "ইসলাম হলো একটি পূর্ণাঙ্গ জীবন বিধান।", author: "সহিহ মুসলিম" },
];

export default function QuoteCard() {
    const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));

    const [isRefreshing, setIsRefreshing] = useState(false);

    const getRandomQuote = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * QUOTES.length);
            } while (nextIndex === quoteIndex && QUOTES.length > 1);
            setQuoteIndex(nextIndex);
            setIsRefreshing(false);
        }, 300);
    };

    return (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-indigo-500/20 md:h-full flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <Quote className="w-5 h-5 text-white" />
                </div>
                <button
                    onClick={getRandomQuote}
                    disabled={isRefreshing}
                    className="p-2.5 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-all active:scale-95 disabled:opacity-50"
                    title="Get New Quote"
                >
                    <motion.div
                        animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <RefreshCw className="w-5 h-5" />
                    </motion.div>
                </button>
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={quoteIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <p className="text-xl md:text-2xl font-bold mb-4 leading-relaxed tracking-wide">
                            {QUOTES[quoteIndex].text}
                        </p>
                        <p className="text-indigo-200 text-sm font-medium">
                            — {QUOTES[quoteIndex].author}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Decorative background elements */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />
        </div>
    );
}
