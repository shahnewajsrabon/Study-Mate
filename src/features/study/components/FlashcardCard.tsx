import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';

interface FlashcardCardProps {
    question: string;
    answer: string;
    isMastered: boolean;
    onToggleMastered: () => void;
}

export default function FlashcardCard({ question, answer, isMastered, onToggleMastered }: FlashcardCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="perspective-1000 w-full h-80 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
            <motion.div
                className="relative w-full h-full transition-all duration-500 preserve-3d"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 shadow-xl flex flex-col items-center justify-center p-8 text-center">
                    <div className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Question</div>
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
                    className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center text-white [transform:rotateY(180deg)]"
                >
                    <div className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Answer</div>
                    <p className="text-lg md:text-xl font-medium leading-relaxed">
                        {answer}
                    </p>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleMastered();
                        }}
                        className={clsx(
                            "absolute bottom-6 px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 shadow-lg",
                            isMastered
                                ? "bg-emerald-500 text-white"
                                : "bg-white/20 hover:bg-white text-white hover:text-indigo-600 backdrop-blur-md"
                        )}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        {isMastered ? 'Mastered' : 'Mark as Mastered'}
                    </button>

                    <div className="mt-8 flex items-center gap-2 text-white/50 font-bold text-sm group-hover:text-white transition-colors">
                        <RotateCcw className="w-4 h-4" />
                        Tap to flip back
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
