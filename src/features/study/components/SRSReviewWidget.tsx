import { useStudy } from '../hooks/useStudy.ts';
import { motion } from 'framer-motion';
import { Brain, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { isPast, parseISO } from 'date-fns';

export default function SRSReviewWidget() {
    const { flashcardSets } = useStudy();
    const navigate = useNavigate();

    // Calculate cards due today
    const dueCount = flashcardSets.reduce((acc, set) => {
        const dueInSet = set.cards.filter(card => {
            if (!card.nextReview) return true; // Never reviewed
            return isPast(parseISO(card.nextReview));
        }).length;
        return acc + dueInSet;
    }, 0);

    if (dueCount === 0) {
        return (
            <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 mb-2">
                    <Brain className="w-5 h-5" />
                    <h3 className="font-bold text-sm uppercase tracking-wider">Retention</h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                    You're all caught up! No cards due for review today.
                </p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group cursor-pointer"
            onClick={() => navigate('/flashcards')}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Sparkles className="w-20 h-20" />
            </div>

            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2 text-indigo-100/80 font-black text-[10px] uppercase tracking-[0.2em]">
                    <Brain className="w-4 h-4" />
                    Knowledge Retention
                </div>

                <div>
                    <h3 className="text-3xl font-black">{dueCount}</h3>
                    <p className="text-indigo-100/80 text-xs font-bold uppercase tracking-wide">Cards due for review</p>
                </div>

                <button className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-xl text-xs font-black shadow-lg hover:gap-4 transition-all">
                    REVIEW NOW
                    <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </motion.div>
    );
}
