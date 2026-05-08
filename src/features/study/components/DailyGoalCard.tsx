import { useProfile } from '../../../features/profile/hooks/useProfile.ts';
import { motion } from 'framer-motion';
import { Target, Trophy } from 'lucide-react';
import { useState } from 'react';

export default function DailyGoalCard() {
    const { userProfile, updateProfile } = useProfile();
    const [isEditing, setIsEditing] = useState(false);
    const [editHours, setEditHours] = useState(userProfile.dailyGoal ? userProfile.dailyGoal / 3600 : 2);

    const goalSeconds = userProfile.dailyGoal || 7200; // Default 2 hours
    const progressSeconds = userProfile.todayStudyTime || 0;

    const percentage = Math.min(100, Math.round((progressSeconds / goalSeconds) * 100));

    const handleSaveGoal = () => {
        updateProfile({ dailyGoal: editHours * 3600 });
        setIsEditing(false);
    };

    return (
        <div className="zen-card p-8 flex flex-col relative overflow-hidden h-full">
            <div className="flex items-center justify-between mb-8 z-10">
                <h3 className="text-slate-400 dark:text-slate-500 font-bold flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
                    <Target className="w-4 h-4" />
                    Daily Goal
                </h3>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs text-sage-600 dark:text-sage-400 hover:underline flex items-center gap-1 font-medium"
                    >
                        Edit
                    </button>
                ) : (
                    <button
                        onClick={handleSaveGoal}
                        className="text-xs text-charcoal dark:text-white hover:underline flex items-center gap-1 font-bold"
                    >
                        Save
                    </button>
                )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center z-10 gap-6">
                {/* Circular Progress */}
                <div className="relative w-32 h-32 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            className="text-slate-100 dark:text-slate-800"
                        />
                        <motion.circle
                            initial={{ strokeDashoffset: 264 }}
                            animate={{ strokeDashoffset: 264 - (264 * percentage) / 100 }}
                            transition={{ duration: 1.5, ease: 'circOut' }}
                            cx="50"
                            cy="50"
                            r="42"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="transparent"
                            strokeDasharray="264"
                            strokeLinecap="round"
                            className="text-sage-500"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-serif font-bold text-charcoal dark:text-white">
                            {percentage}<span className="text-sm text-sage-500">%</span>
                        </span>
                    </div>
                </div>

                <div className="text-center space-y-1">
                    {isEditing ? (
                        <div className="flex items-center justify-center gap-2">
                            <input
                                type="number"
                                min="0.5"
                                max="24"
                                step="0.5"
                                value={editHours}
                                onChange={(e) => setEditHours(parseFloat(e.target.value))}
                                aria-label="Daily goal hours"
                                className="w-16 p-2 border-b-2 border-sage-500 text-2xl font-serif font-bold bg-transparent text-charcoal dark:text-white outline-none text-center"
                                autoFocus
                            />
                            <span className="text-slate-400 font-serif">hrs</span>
                        </div>
                    ) : (
                        <div className="text-3xl font-serif font-bold text-charcoal dark:text-white tracking-tight">
                            {Math.floor(progressSeconds / 3600)}h {Math.floor((progressSeconds % 3600) / 60)}m
                        </div>
                    )}
                    <div className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        Target: {Math.floor(goalSeconds / 3600)} hours
                    </div>
                </div>
            </div>

            {percentage >= 100 && !isEditing && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-sage-50/80 dark:bg-sage-900/80 flex items-center justify-center flex-col z-20 backdrop-blur-sm"
                >
                    <Trophy className="w-10 h-10 text-sage-600 dark:text-sage-400 mb-2" />
                    <span className="text-charcoal dark:text-white font-serif font-bold text-xl">Daily Goal Reached</span>
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="mt-4 text-xs font-bold text-sage-600 dark:text-sage-400 uppercase tracking-widest"
                    >
                        Adjust Goal
                    </button>
                </motion.div>
            )}
        </div>
    );
}
