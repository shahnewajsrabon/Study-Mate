import { useState, useMemo } from 'react';
import { useStudy, type ScheduledSession } from '../context/StudyContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import UpcomingExams from '../components/UpcomingExams';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Planner() {
    const { subjects, userProfile, addScheduledSession, toggleScheduledSession, deleteScheduledSession, saveStudySession, generateSmartSchedule } = useStudy();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newSessionData, setNewSessionData] = useState<{
        subjectId: string;
        chapterId: string;
        topicId: string;
        time: string;
        durationMinutes: number;
        notes: string;
    }>({
        subjectId: '',
        chapterId: '',
        topicId: '',
        time: '18:00',
        durationMinutes: 60,
        notes: ''
    });

    // Reset form when modal opens
    const openAddModal = () => {
        if (subjects.length > 0) {
            setNewSessionData(prev => ({ ...prev, subjectId: subjects[0].id }));
        }
        setIsAddModalOpen(true);
    };

    const handleAddSession = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !newSessionData.subjectId) return;

        // Format date as YYYY-MM-DD
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        addScheduledSession({
            subjectId: newSessionData.subjectId,
            date: dateStr,
            time: newSessionData.time,
            durationMinutes: newSessionData.durationMinutes,
            chapterId: newSessionData.chapterId || undefined,
            topicId: newSessionData.topicId || undefined,
            notes: newSessionData.notes
        });
        setIsAddModalOpen(false);
    };

    // Filter sessions for selected date
    const selectedDateSessions = useMemo(() => {
        if (!selectedDate || !userProfile.scheduledSessions) return [];
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        return userProfile.scheduledSessions.filter(s => s.date === dateStr);
    }, [selectedDate, userProfile.scheduledSessions]);

    // Check if a day has sessions (for calendar dots)
    const hasSessionOnDate = (day: number) => {
        if (!userProfile.scheduledSessions) return false;
        const checkYear = currentDate.getFullYear();
        const checkMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
        const checkDay = String(day).padStart(2, '0');
        const dateStr = `${checkYear}-${checkMonth}-${checkDay}`;
        return userProfile.scheduledSessions.some(s => s.date === dateStr && !s.isCompleted);
    };

    // --- Actions ---
    const handleToggleSession = async (session: ScheduledSession) => {
        if (!session.isCompleted) {
            // Completing it
            if (confirm("Mark as done? Do you want to log this time to your stats?")) {
                await saveStudySession(session.durationMinutes * 60, session.subjectId);
            }
        }
        toggleScheduledSession(session.id);
    };

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

        const allIncompleteTopics: { subjectName: string; chapterName: string; topicName: string; priority: number }[] = [];

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
                            const baseClass = "aspect-square rounded-xl flex items-center justify-center text-sm cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 relative";

                            return (
                                <motion.div
                                    key={day}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedDate(new Date(year, month, day))}
                                    className={`${baseClass} ${todayClass} ${selectedClass}`}
                                >
                                    {day}
                                    {hasSessionOnDate(day) && (
                                        <div className="absolute bottom-1 w-1 h-1 bg-indigo-500 rounded-full"></div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar / Suggestions */}
                <div className="space-y-6">

                    {/* Selected Date Info */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-500" />
                                {selectedDate?.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h3>
                            <button
                                onClick={openAddModal}
                                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                + Add
                            </button>
                        </div>

                        <div className="space-y-3 min-h-[100px]">
                            {selectedDateSessions.length > 0 ? (
                                selectedDateSessions.map(session => {
                                    const subject = subjects.find(s => s.id === session.subjectId);
                                    let topicDetails = '';
                                    if (subject && session.chapterId) {
                                        const chapter = subject.chapters.find(c => c.id === session.chapterId);
                                        if (chapter) {
                                            topicDetails = chapter.name;
                                            if (session.topicId) {
                                                const topic = chapter.topics.find(t => t.id === session.topicId);
                                                if (topic) topicDetails += ` > ${topic.name}`;
                                            }
                                        }
                                    }

                                    return (
                                        <div key={session.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={session.isCompleted}
                                                onChange={() => handleToggleSession(session)}
                                                className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                            />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <span className={`font-semibold text-sm ${session.isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                                        {subject?.name || 'Unknown Subject'}
                                                    </span>
                                                    <button onClick={() => deleteScheduledSession(session.id)} className="text-slate-400 hover:text-red-500">
                                                        &times;
                                                    </button>
                                                </div>
                                                {topicDetails && (
                                                    <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                                                        {topicDetails}
                                                    </div>
                                                )}
                                                <div className="text-xs text-slate-500 mt-1 flex gap-2">
                                                    <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                                                        {session.time}
                                                    </span>
                                                    <span>{session.durationMinutes}m</span>
                                                </div>
                                                {session.notes && (
                                                    <p className="text-xs text-slate-500 mt-1 italic">
                                                        "{session.notes}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-slate-400 text-sm">
                                    <p>No study sessions scheduled.</p>
                                    <button
                                        onClick={openAddModal}
                                        className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-lg text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                    >
                                        + Schedule Session
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Exams Center */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
                        <UpcomingExams />
                    </div>

                    {/* Smart Suggestions */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                        {/* Decorative background circle */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                                AI Study Path
                            </h3>
                            <p className="text-indigo-100 text-xs mb-4">Automatically distribute your remaining topics until your exam dates.</p>

                            <button
                                onClick={() => {
                                    if (confirm("This will automatically schedule your incomplete topics across the calendar until your next exam dates. Existing manually scheduled sessions for those subjects on the same days will be skipped. Proceed?")) {
                                        generateSmartSchedule();
                                    }
                                }}
                                className="w-full py-2.5 bg-white text-indigo-600 rounded-xl text-sm font-bold shadow-lg shadow-indigo-900/20 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Zap className="w-4 h-4 fill-indigo-600" />
                                Generate AI Path
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3 mt-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2">Smart Suggestions</p>
                        {suggestions.length > 0 ? (
                            suggestions.map((s, i) => (
                                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors cursor-pointer shadow-sm">
                                    <div className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">{s.subjectName}</div>
                                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm line-clamp-1">{s.topicName}</div>
                                    <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{s.chapterName}</div>
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

            {/* Add Session Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6"
                    >
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Schedule Study Session</h3>
                        <form onSubmit={handleAddSession} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                                <select
                                    value={newSessionData.subjectId}
                                    onChange={e => setNewSessionData({ ...newSessionData, subjectId: e.target.value, chapterId: '', topicId: '' })}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    {subjects.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Chapter & Topic Selection */}
                            {newSessionData.subjectId && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Chapter (Opt)</label>
                                        <select
                                            value={newSessionData.chapterId}
                                            onChange={e => setNewSessionData({ ...newSessionData, chapterId: e.target.value, topicId: '' })}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        >
                                            <option value="">Any Chapter</option>
                                            {subjects.find(s => s.id === newSessionData.subjectId)?.chapters.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Topic (Opt)</label>
                                        <select
                                            value={newSessionData.topicId}
                                            onChange={e => setNewSessionData({ ...newSessionData, topicId: e.target.value })}
                                            className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                            disabled={!newSessionData.chapterId}
                                        >
                                            <option value="">Any Topic</option>
                                            {newSessionData.chapterId && subjects.find(s => s.id === newSessionData.subjectId)?.chapters
                                                .find(c => c.id === newSessionData.chapterId)?.topics.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time</label>
                                    <input
                                        type="time"
                                        value={newSessionData.time}
                                        onChange={e => setNewSessionData({ ...newSessionData, time: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Duration (mins)</label>
                                    <input
                                        type="number"
                                        min="5"
                                        step="5"
                                        value={newSessionData.durationMinutes}
                                        onChange={e => setNewSessionData({ ...newSessionData, durationMinutes: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes (Optional)</label>
                                <textarea
                                    value={newSessionData.notes}
                                    onChange={e => setNewSessionData({ ...newSessionData, notes: e.target.value })}
                                    placeholder="What topics will you cover?"
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium shadow-sm shadow-indigo-200 dark:shadow-none"
                                >
                                    Schedule
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )
            }
        </div >
    );
}
