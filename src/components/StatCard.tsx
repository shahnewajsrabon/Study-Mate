import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    colorClass: string; // e.g., "text-amber-500"
    bgClass: string; // e.g., "bg-amber-50"
    delay?: number;
}

export default function StatCard({
    title,
    value,
    icon: Icon,
    colorClass,
    bgClass,
    delay = 0
}: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: 'spring', damping: 15, stiffness: 100 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-100 dark:border-slate-700/50 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center justify-between transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] group"
        >
            <div className="space-y-1">
                <h3 className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 group-hover:text-slate-500 transition-colors">
                    <Icon className={`w-3.5 h-3.5 ${colorClass}`} /> {title}
                </h3>
                <div className="text-3xl font-black text-slate-800 dark:text-white transition-colors tracking-tight">
                    {value}
                </div>
            </div>
            <div className={`w-14 h-14 ${bgClass} rounded-2xl flex items-center justify-center transition-all group-hover:rotate-6 shadow-inner ring-1 ring-white/20 dark:ring-white/5`}>
                <Icon className={`w-7 h-7 ${colorClass}`} />
            </div>
        </motion.div>
    );
}
