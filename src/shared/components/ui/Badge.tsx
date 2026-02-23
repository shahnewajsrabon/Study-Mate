import { Award, Moon, Flame, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export type BadgeType = 'start_strong' | 'streak_master' | 'subject_conqueror' | 'night_owl';

interface BadgeProps {
    type: BadgeType;
    isLocked?: boolean;
    dateEarned?: string;
}

const BADGE_CONFIG: Record<BadgeType, { icon: React.ElementType, label: string, description: string, color: string }> = {
    start_strong: {
        icon: CheckCircle2,
        label: 'Start Strong',
        description: 'Completed your first topic!',
        color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30'
    },
    streak_master: {
        icon: Flame,
        label: 'Streak Master',
        description: 'Studied for 3 days in a row.',
        color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30'
    },
    subject_conqueror: {
        icon: Award,
        label: 'Subject Conqueror',
        description: 'Completed 100% of a subject.',
        color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30'
    },
    night_owl: {
        icon: Moon,
        label: 'Night Owl',
        description: 'Completed a session late at night (10PM - 4AM).',
        color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30'
    }
};

export default function Badge({ type, isLocked = false, dateEarned }: BadgeProps) {
    const config = BADGE_CONFIG[type];
    const Icon = config.icon;
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div
            className="relative flex flex-col items-center gap-2 group cursor-pointer"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
        >
            <motion.div
                whileHover={{ scale: 1.05 }}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm border-2 transition-colors ${isLocked
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60 grayscale'
                    : `${config.color} border-transparent`
                    }`}
            >
                <Icon className={`w-8 h-8 ${isLocked ? 'text-slate-400' : ''}`} />
            </motion.div>

            <span className={`text-xs font-medium text-center max-w-[5rem] ${isLocked ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                {config.label}
            </span>

            {/* Tooltip */}
            {showTooltip && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full mb-2 bg-slate-800 dark:bg-slate-700 text-white text-xs p-2 rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none"
                >
                    <p className="font-semibold">{config.label}</p>
                    <p className="text-slate-300">{config.description}</p>
                    {!isLocked && dateEarned && (
                        <p className="text-slate-400 mt-1 text-[10px]">Earned: {new Date(dateEarned).toLocaleDateString()}</p>
                    )}
                </motion.div>
            )}
        </div>
    );
}
