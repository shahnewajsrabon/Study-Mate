import { useStudy } from '../context/StudyContext';
import { motion } from 'framer-motion';
import { Target, Edit2, Check, Trophy } from 'lucide-react';
import { useState } from 'react';

export default function DailyGoalCard() {
    const { userProfile, updateProfile } = useStudy();
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
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm md:h-full flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-2 z-10">
                <h3 className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4" />
                    Daily Goal
                </h3>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                        Edit <Edit2 className="w-3 h-3" />
                    </button>
                ) : (
                    <button
                        onClick={handleSaveGoal}
                        className="text-xs text-green-600 dark:text-green-400 hover:underline flex items-center gap-1 font-bold"
                    >
                        Save <Check className="w-3 h-3" />
                    </button>
                )}
            </div>

            <div className="flex-1 flex items-center justify-between z-10 mt-2">
                <div className="space-y-1">
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="0.5"
                                max="24"
                                step="0.5"
                                value={editHours}
                                onChange={(e) => setEditHours(parseFloat(e.target.value))}
                                className="w-16 p-1 border rounded text-lg font-bold bg-slate-50 dark:bg-slate-700 dark:text-white"
                                autoFocus
                            />
                            <span className="text-slate-500">hrs</span>
                        </div>
                    ) : (
                        <div className="text-3xl font-bold text-slate-800 dark:text-white">
                            {Math.floor(progressSeconds / 3600)}<span className="text-lg text-slate-400 font-normal">h</span> {Math.floor((progressSeconds % 3600) / 60)}<span className="text-lg text-slate-400 font-normal">m</span>
                        </div>
                    )}
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        of {Math.floor(goalSeconds / 3600)}h goal
                    </div>
                </div>

                {/* Circular Progress */}
                <div className="relative w-20 h-20 flex-shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                        {/* Background Circle */}
                        <circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-slate-100 dark:text-slate-700"
                        />
                        {/* Progress Circle */}
                        <motion.circle
                            initial={{ strokeDashoffset: 226 }}
                            animate={{ strokeDashoffset: 226 - (226 * percentage) / 100 }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            cx="40"
                            cy="40"
                            r="36"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray="226" // 2 * pi * r (approx 2 * 3.14159 * 36)
                            strokeLinecap="round"
                            className={`${percentage >= 100 ? 'text-green-500' : 'text-blue-500'}`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
                        {percentage}%
                    </div>
                </div>
            </div>

            {percentage >= 100 && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 bg-green-50/90 dark:bg-green-900/90 flex items-center justify-center flex-col z-20 backdrop-blur-sm"
                >
                    <Trophy className="w-10 h-10 text-green-600 dark:text-green-400 mb-2" />
                    <span className="text-green-800 dark:text-green-100 font-bold">Goal Reached!</span>
                </motion.div>
            )}
        </div>
    );
}
