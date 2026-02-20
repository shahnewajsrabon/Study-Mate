import { useState } from 'react';
import { useStudy, type Subject } from '../context/StudyContext';
import { CalendarClock, AlertCircle, Pencil, Plus, X, BookOpen, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EditSubjectModal from './EditSubjectModal';

interface UpcomingExamsProps {
    className?: string;
    limit?: number;
}

export default function UpcomingExams({ className = '', limit }: UpcomingExamsProps) {
    const { subjects, editSubject } = useStudy();
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [isSelectingSubject, setIsSelectingSubject] = useState(false);

    // Filter to ensure we have a valid date string before showing in the list
    const examSubjects = (subjects || [])
        .filter(s => {
            if (!s.examDate) return false;
            const date = new Date(s.examDate);
            return !isNaN(date.getTime());
        })
        .sort((a, b) => new Date(a.examDate!).getTime() - new Date(b.examDate!).getTime());

    const subjectsWithoutExams = (subjects || []).filter(s => !s.examDate);
    const displayedExams = limit ? examSubjects.slice(0, limit) : examSubjects;

    const calculateDaysLeft = (dateStr: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const examDate = new Date(dateStr);
        if (isNaN(examDate.getTime())) return null;

        examDate.setHours(0, 0, 0, 0);
        const diffTime = examDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const handleSelectSubject = (subject: Subject) => {
        setEditingSubject(subject);
        setIsSelectingSubject(false);
    };

    const handleDeleteExam = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Remove this exam date?")) {
            editSubject(id, { examDate: undefined });
        }
    };

    const hasNoSubjects = !subjects || subjects.length === 0;

    return (
        <div className={`space-y-4 ${className}`}>
            {examSubjects.length === 0 && !isSelectingSubject ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-dashed border-slate-200 dark:border-slate-700 text-center">
                    <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CalendarClock className="w-5 h-5 text-slate-400" />
                    </div>
                    <h3 className="text-slate-800 dark:text-white font-semibold text-sm mb-1">No Exams</h3>
                    <p className="text-slate-500 text-[10px] leading-tight mb-3">
                        {hasNoSubjects ? "Add a subject first to schedule exams." : "Set dates for subjects to track them here."}
                    </p>
                    {!hasNoSubjects && (
                        <button
                            onClick={() => setIsSelectingSubject(true)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Schedule Exam
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <CalendarClock className="w-5 h-5 text-indigo-500" />
                            Upcoming Exams
                        </h3>
                        <div className="flex items-center gap-2">
                            {!hasNoSubjects && (
                                <button
                                    onClick={() => setIsSelectingSubject(true)}
                                    className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                    title="Add Exam"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            )}
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-2 py-0.5 rounded-full">
                                {examSubjects.length} Total
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        {displayedExams.map((subject) => {
                            const daysLeft = calculateDaysLeft(subject.examDate!);
                            const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;
                            const isPast = daysLeft !== null && daysLeft < 0;

                            const dateDisplay = isNaN(new Date(subject.examDate!).getTime())
                                ? 'Invalid Date'
                                : new Date(subject.examDate!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

                            return (
                                <motion.div
                                    key={subject.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="group relative bg-white dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all flex items-center gap-3 overflow-hidden"
                                >
                                    {/* Proximity Color Bar */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${isPast ? 'bg-slate-400' : isUrgent ? 'bg-red-500' : 'bg-indigo-500'}`} />

                                    <div className={`w-10 h-10 rounded-lg ${subject.color || 'bg-slate-500'} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                                        <CalendarClock className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{subject.name}</h4>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditingSubject(subject)}
                                                    className="p-1 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                                                    title="Edit Date"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteExam(subject.id, e)}
                                                    className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                                                    title="Remove Exam"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                                            {dateDisplay}
                                        </p>
                                    </div>

                                    <div className={`text-right flex-shrink-0 ${isPast ? 'text-slate-400' : isUrgent ? 'text-red-500' : 'text-indigo-500'}`}>
                                        <div className="text-lg font-black leading-none">{isPast || daysLeft === null ? '—' : daysLeft}</div>
                                        <div className="text-[9px] font-bold uppercase tracking-widest">{isPast ? 'Past' : 'Days'}</div>
                                    </div>

                                    {isUrgent && !isPast && (
                                        <div className="absolute top-0 right-0 p-1">
                                            <AlertCircle className="w-3 h-3 text-red-500 animate-pulse" />
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Subject Selection Modal */}
            <AnimatePresence>
                {isSelectingSubject && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700"
                        >
                            <div className="p-4 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                                <h3 className="font-bold text-slate-800 dark:text-white">Schedule Exam</h3>
                                <button
                                    onClick={() => setIsSelectingSubject(false)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 px-1">
                                    Select a subject to set its exam date.
                                </p>
                                <div className="grid gap-2">
                                    {subjectsWithoutExams.length > 0 ? (
                                        subjectsWithoutExams.map(subject => (
                                            <button
                                                key={subject.id}
                                                onClick={() => handleSelectSubject(subject)}
                                                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group text-left border border-transparent hover:border-slate-100 dark:hover:border-slate-600"
                                            >
                                                <div className={`w-10 h-10 rounded-xl ${subject.color || 'bg-slate-500'} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{subject.name}</div>
                                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">{(subject.chapters?.length || 0)} Chapters</div>
                                                </div>
                                                <Plus className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <CalendarClock className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">All subjects have exams!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {editingSubject && (
                <EditSubjectModal
                    subject={editingSubject}
                    onClose={() => setEditingSubject(null)}
                />
            )}
        </div>
    );
}
