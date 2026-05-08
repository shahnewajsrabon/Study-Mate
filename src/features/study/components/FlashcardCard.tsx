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
        { label: 'Again', value: 1 as const, color: 'bg-slate-700 hover:bg-slate-800', sub: '< 1m' },
        { label: 'Hard', value: 2 as const, color: 'bg-sage-600 hover:bg-sage-700', sub: '2d' },
        { label: 'Good', value: 3 as const, color: 'bg-sage-500 hover:bg-sage-600', sub: '4d' },
        { label: 'Easy', value: 4 as const, color: 'bg-sage-400 hover:bg-sage-500', sub: '7d' },
    ];

    return (
        <div className="perspective-1000 w-full h-96 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
            <motion.div
                className="relative w-full h-full transition-all duration-700 preserve-3d"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden zen-card flex flex-col items-center justify-center p-12 text-center">
                    <div className="absolute top-6 left-6 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">Flashcard</div>
                    <div className="absolute top-6 right-6">
                        {isMastered && (
                            <div className="flex items-center gap-1 text-sage-500 text-[10px] font-bold uppercase tracking-widest bg-sage-50 dark:bg-sage-900/30 px-2 py-0.5 rounded-md">
                                <CheckCircle2 className="w-3 h-3" />
                                Mastered
                            </div>
                        )}
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-charcoal dark:text-white leading-tight">
                        {question}
                    </h3>
                    <div className="mt-12 flex flex-col items-center gap-4">
                        <div className="w-8 h-[1px] bg-sage-500/30" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Tap to reveal</span>
                    </div>
                </div>

                {/* Back Side */}
                <div
                    className="absolute inset-0 backface-hidden bg-charcoal dark:bg-[#121212] rounded-3xl shadow-2xl flex flex-col items-center justify-center p-12 text-center text-white [transform:rotateY(180deg)]"
                >
                    <div className="absolute top-6 left-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Answer</div>
                    
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-xl font-serif leading-relaxed italic">
                            "{answer}"
                        </p>
                    </div>

                    <div className="w-full grid grid-cols-4 gap-3 mt-auto">
                        {ratings.map((r) => (
                            <button
                                key={r.value}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRate(r.value);
                                    setIsFlipped(false);
                                }}
                                className={clsx(
                                    "flex flex-col items-center gap-1 py-4 rounded-xl transition-all active:scale-95 silky-transition",
                                    r.color
                                )}
                            >
                                <span className="text-[10px] font-bold uppercase tracking-widest">{r.label}</span>
                                <span className="text-[8px] font-medium opacity-50 tracking-wider">{r.sub}</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-white/10 font-bold text-[8px] uppercase tracking-[0.3em]">
                        <RotateCcw className="w-3 h-3" />
                        Tap to flip
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
