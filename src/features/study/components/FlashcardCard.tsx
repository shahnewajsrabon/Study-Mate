import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';

interface FlashcardCardProps {
    question: string;
    answer: string;
    isMastered: boolean;
    onRate: (rating: 1 | 2 | 3 | 4) => void;
}

export default function FlashcardCard({ question, answer, isMastered, onRate }: FlashcardCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    const ratings = [
        { label: 'Again', value: 1 as const, color: 'bg-red-500 hover:bg-red-600', sub: '< 1m' },
        { label: 'Hard', value: 2 as const, color: 'bg-orange-500 hover:bg-orange-600', sub: '2d' },
        { label: 'Good', value: 3 as const, color: 'bg-blue-500 hover:bg-blue-600', sub: '4d' },
        { label: 'Easy', value: 4 as const, color: 'bg-emerald-500 hover:bg-emerald-600', sub: '7d' },
    ];

    return (
        <div className="perspective-1000 w-full h-96 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
            <motion.div
                className="relative w-full h-full transition-all duration-500 preserve-3d"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 shadow-xl flex flex-col items-center justify-center p-8 text-center">
                    <div className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Question</div>
                    <div className="absolute top-4 right-4">
                        {isMastered && (
                            <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">
                                <CheckCircle2 className="w-3 h-3" />
                                Mastered
                            </div>
                        )}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white leading-tight">
                        {question}
                    </h3>
                    <div className="mt-8 flex items-center gap-2 text-indigo-500 font-bold text-sm">
                        <RotateCcw className="w-4 h-4 animate-spin-slow" />
                        Tap to reveal
                    </div>
                </div>

                {/* Back Side */}
                <div
                    className="absolute inset-0 backface-hidden bg-slate-900 dark:bg-slate-950 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center text-white [transform:rotateY(180deg)]"
                >
                    <div className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Answer</div>
                    
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-lg md:text-xl font-medium leading-relaxed">
                            {answer}
                        </p>
                    </div>

                    <div className="w-full grid grid-cols-4 gap-2 mt-auto">
                        {ratings.map((r) => (
                            <button
                                key={r.value}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRate(r.value);
                                    setIsFlipped(false);
                                }}
                                className={clsx(
                                    "flex flex-col items-center gap-1 py-3 rounded-2xl transition-all active:scale-90",
                                    r.color
                                )}
                            >
                                <span className="text-[10px] font-black uppercase">{r.label}</span>
                                <span className="text-[8px] font-medium opacity-70">{r.sub}</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-white/30 font-bold text-[10px] uppercase tracking-widest">
                        <RotateCcw className="w-3 h-3" />
                        Tap to flip back
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
