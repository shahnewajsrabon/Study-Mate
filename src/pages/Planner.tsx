import React, { useState, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Planner() {
    const { subjects, userProfile } = useStudy();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    // --- Calendar Logic ---
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const today = new Date();
    const isToday = (d: number) =>
        d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    const isSelected = (d: number) =>
        selectedDate && d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();

    // --- Smart Suggestions Logic ---
    const suggestions = useMemo(() => {
        // 1. Prioritize subjects with lowest completion (but > 0 to ignore untouched stuff unless enabled)
        // Actually, prioritize subjects that have incomplete chapters.

        let allIncompleteTopics: { subjectName: string; chapterName: string; topicName: string; priority: number }[] = [];

        subjects.forEach(sub => {
            sub.chapters.forEach(ch => {
                if (!ch.isCompleted) {
                    ch.topics.forEach(t => {
                        if (!t.isCompleted) {
                            // Priority Score:
                            // 1. If user hasn't studied today -> High
                            // 2. Random variation
                            allIncompleteTopics.push({
                                subjectName: sub.name,
                                chapterName: ch.name,
                                topicName: t.name,
                                priority: Math.random() // Simple randomization for now
                            });
                        }
                    });
                }
            });
        });

        // Shuffle and take top 3
        return allIncompleteTopics.sort((a, b) => b.priority - a.priority).slice(0, 3);
    }, [subjects]);

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    Study Planner
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Manage your schedule and stay on track.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Calendar Section */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">

                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-blue-500" />
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex gap-2">
                            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            </button>
                            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            </button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                        {DAYS.map(d => (
                            <div key={d} className="text-xs font-semibold text-slate-400 uppercase tracking-wider py-2">
                                {d}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {/* Empty cells for start of month */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}

                        {/* Days */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const todayClass = isToday(day) ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 font-bold" : "";
                            const selectedClass = isSelected(day) && !isToday(day) ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold" : "";
                            const baseClass = "aspect-square rounded-xl flex items-center justify-center text-sm cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300";

                            return (
                                <motion.div
                                    key={day}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedDate(new Date(year, month, day))}
                                    className={`${baseClass} ${todayClass} ${selectedClass}`}
                                >
                                    {day}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar / Suggestions */}
                <div className="space-y-6">

                    {/* Selected Date Info (Placeholder for now) */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-500" />
                            {selectedDate?.toLocaleDateString()}
                        </h3>
                        <div className="text-center py-8 text-slate-400 text-sm">
                            <p>No study sessions scheduled.</p>
                            <button className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-lg text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">
                                + Schedule Session
                            </button>
                        </div>
                    </div>

                    {/* Smart Suggestions */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                        <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Smart Suggestions
                        </h3>
                        <p className="text-indigo-100 text-sm mb-4">Focus on these topics today:</p>

                        <div className="space-y-3">
                            {suggestions.length > 0 ? (
                                suggestions.map((s, i) => (
                                    <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                                        <div className="text-xs font-medium text-indigo-200 uppercase tracking-wider mb-1">{s.subjectName}</div>
                                        <div className="font-semibold text-sm line-clamp-1">{s.topicName}</div>
                                        <div className="text-xs text-indigo-100 opacity-80 mt-0.5 line-clamp-1">{s.chapterName}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-indigo-100">
                                    <p>🎉 All caught up!</p>
                                    <p className="text-xs opacity-70 mt-1">Great job clearing your backlog.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
