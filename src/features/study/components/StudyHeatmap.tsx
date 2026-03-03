import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, startOfToday, eachDayOfInterval, isSameDay } from 'date-fns';
import type { StudySession } from '../types/study.ts';

interface StudyHeatmapProps {
    sessions: StudySession[];
}

export default function StudyHeatmap({ sessions }: StudyHeatmapProps) {
    const today = startOfToday();
    const daysToShow = 365; // Show a full year
    const startDate = subDays(today, daysToShow - 1);

    const dates = useMemo(() => {
        return eachDayOfInterval({ start: startDate, end: today });
    }, [startDate, today]);

    const studyData = useMemo(() => {
        const data: Record<string, number> = {};
        sessions.forEach(session => {
            const dateStr = format(new Date(session.startTime), 'yyyy-MM-dd');
            data[dateStr] = (data[dateStr] || 0) + session.duration;
        });
        return data;
    }, [sessions]);

    const getColorLevel = (minutes: number) => {
        if (minutes === 0) return 'bg-slate-100 dark:bg-slate-800';
        if (minutes < 30) return 'bg-emerald-200 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100';
        if (minutes < 60) return 'bg-emerald-400 dark:bg-emerald-800 text-white';
        if (minutes < 120) return 'bg-emerald-500 dark:bg-emerald-700 text-white';
        return 'bg-emerald-600 dark:bg-emerald-600 text-white';
    };

    // Grouping into weeks for the grid
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    // Fill leading days if start day is not Sunday
    const firstDay = dates[0].getDay();
    for (let i = 0; i < firstDay; i++) {
        // Just empty slots
    }

    dates.forEach((date, i) => {
        currentWeek.push(date);
        if (date.getDay() === 6 || i === dates.length - 1) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">Consistency</span>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">Study Journey</h3>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800" />
                        <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900/40" />
                        <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-800" />
                        <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-600" />
                    </div>
                    <span>More</span>
                </div>
            </div>

            <div className="flex gap-1 overflow-x-auto pb-4 scrollbar-hide">
                <div className="grid grid-rows-7 grid-flow-col gap-1.5">
                    {dates.map((date) => {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const minutes = Math.round((studyData[dateStr] || 0) / 60);
                        const isToday = isSameDay(date, today);

                        return (
                            <motion.div
                                key={dateStr}
                                whileHover={{ scale: 1.2, zIndex: 10 }}
                                title={`${format(date, 'MMM d, yyyy')}: ${minutes} mins`}
                                className={`w-3.5 h-3.5 rounded-sm transition-colors cursor-pointer relative ${getColorLevel(minutes)} ${isToday ? 'ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-slate-900' : ''}`}
                            />
                        );
                    })}
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-8">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Active Days</span>
                    <span className="text-2xl font-black text-slate-800 dark:text-white">
                        {Object.keys(studyData).length}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Total Focused</span>
                    <span className="text-2xl font-black text-slate-800 dark:text-white">
                        {Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / 3600)}h
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Avg. Session</span>
                    <span className="text-2xl font-black text-slate-800 dark:text-white">
                        {sessions.length > 0 ? Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length / 60) : 0}m
                    </span>
                </div>
            </div>
        </div>
    );
}
