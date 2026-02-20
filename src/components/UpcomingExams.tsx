import { useState } from 'react';
import { useStudy, type Subject } from '../context/StudyContext';
import { CalendarClock, AlertCircle, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import EditSubjectModal from './EditSubjectModal';

interface UpcomingExamsProps {
    className?: string;
    limit?: number;
}

export default function UpcomingExams({ className = '', limit }: UpcomingExamsProps) {
    const { subjects } = useStudy();
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

    const examSubjects = subjects
        .filter(s => s.examDate)
        .sort((a, b) => new Date(a.examDate!).getTime() - new Date(b.examDate!).getTime());

    const displayedExams = limit ? examSubjects.slice(0, limit) : examSubjects;

    const calculateDaysLeft = (dateStr: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const examDate = new Date(dateStr);
        examDate.setHours(0, 0, 0, 0);
        const diffTime = examDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    if (examSubjects.length === 0) {
        return (
            <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 border border-dashed border-slate-200 dark:border-slate-700 text-center ${className}`}>
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CalendarClock className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-slate-800 dark:text-white font-semibold mb-1">No Exams Scheduled</h3>
                <p className="text-slate-500 text-xs">Set an exam date for your subjects to track them here.</p>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <CalendarClock className="w-5 h-5 text-indigo-500" />
                    Upcoming Exams
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    Countdown
                </span>
            </div>

            <div className="grid gap-3">
                {displayedExams.map((subject) => {
                    const daysLeft = calculateDaysLeft(subject.examDate!);
                    const isUrgent = daysLeft <= 7 && daysLeft >= 0;
                    const isPast = daysLeft < 0;

                    return (
                        <motion.div
                            key={subject.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group relative bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all flex items-center gap-3 overflow-hidden"
                        >
                            {/* Proximity Color Bar */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${isPast ? 'bg-slate-400' : isUrgent ? 'bg-red-500' : 'bg-indigo-500'}`} />

                            <div className={`w-10 h-10 rounded-lg ${subject.color} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                                <CalendarClock className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{subject.name}</h4>
                                    <button
                                        onClick={() => setEditingSubject(subject)}
                                        className="p-1 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                                    {new Date(subject.examDate!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>

                            <div className={`text-right flex-shrink-0 ${isPast ? 'text-slate-400' : isUrgent ? 'text-red-500' : 'text-indigo-500'}`}>
                                <div className="text-lg font-black leading-none">{isPast ? '—' : daysLeft}</div>
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

            {editingSubject && (
                <EditSubjectModal
                    subject={editingSubject}
                    onClose={() => setEditingSubject(null)}
                />
            )}
        </div>
    );
}
