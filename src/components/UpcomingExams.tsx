import { useState } from 'react';
import { useStudy } from '../hooks/useStudy';
import { usePlanner } from '../hooks/usePlanner';
import type { Subject, MajorExam } from '../types/study';
import { CalendarClock, AlertCircle, Pencil, Plus, X, BookOpen, Trash2, LayoutGrid, CalendarRange } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EditSubjectModal from './EditSubjectModal';

interface UpcomingExamsProps {
    className?: string;
    limit?: number;
}

export default function UpcomingExams({ className = '', limit }: UpcomingExamsProps) {
    const { subjects, editSubject } = useStudy();
    const {
        majorExams, addMajorExam, editMajorExam, deleteMajorExam
    } = usePlanner();

    const [activeTab, setActiveTab] = useState<'subjects' | 'major'>('subjects');
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [editingMajorExam, setEditingMajorExam] = useState<MajorExam | null>(null);
    const [isSelectingSubject, setIsSelectingSubject] = useState(false);
    const [isAddingMajorExam, setIsAddingMajorExam] = useState(false);

    const [majorExamForm, setMajorExamForm] = useState<Omit<MajorExam, 'id'>>({
        name: '',
        date: new Date().toISOString().split('T')[0],
        color: 'bg-indigo-500'
    });

    // Filter subjects with exams
    const examSubjects = (subjects || [])
        .filter(s => {
            if (!s.examDate) return false;
            const date = new Date(s.examDate);
            return !isNaN(date.getTime());
        })
        .sort((a, b) => new Date(a.examDate!).getTime() - new Date(b.examDate!).getTime());

    // Major exams sorted by date
    const sortedMajorExams = [...(majorExams || [])].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const subjectsWithoutExams = (subjects || []).filter(s => !s.examDate);

    const displayedExams = activeTab === 'subjects'
        ? (limit ? examSubjects.slice(0, limit) : examSubjects)
        : (limit ? sortedMajorExams.slice(0, limit) : sortedMajorExams);

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

    const handleDeleteMajorExam = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Delete this major exam schedule?")) {
            deleteMajorExam(id);
        }
    };

    const handleMajorExamSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingMajorExam) {
            editMajorExam(editingMajorExam.id, majorExamForm);
            setEditingMajorExam(null);
        } else {
            addMajorExam(majorExamForm);
        }
        setIsAddingMajorExam(false);
        setMajorExamForm({ name: '', date: new Date().toISOString().split('T')[0], color: 'bg-indigo-500' });
    };


    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header & Tabs */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <CalendarClock className="w-5 h-5 text-indigo-500" />
                        Upcoming Exams
                    </h3>
                    <button
                        onClick={() => {
                            if (activeTab === 'subjects') setIsSelectingSubject(true);
                            else setIsAddingMajorExam(true);
                        }}
                        className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                        title={activeTab === 'subjects' ? "Add Subject Exam" : "Add Major Exam"}
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button
                        onClick={() => setActiveTab('subjects')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'subjects' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500'}`}
                    >
                        <LayoutGrid className="w-3 h-3" />
                        Subject wise
                    </button>
                    <button
                        onClick={() => setActiveTab('major')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'major' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500'}`}
                    >
                        <CalendarRange className="w-3 h-3" />
                        Exam wise
                    </button>
                </div>
            </div>

            {displayedExams.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-dashed border-slate-200 dark:border-slate-700 text-center">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <CalendarClock className="w-6 h-6 text-slate-300" />
                    </div>
                    <h3 className="text-slate-800 dark:text-white font-bold text-sm mb-1">
                        {activeTab === 'subjects' ? 'No Subject Exams' : 'No Major Exams'}
                    </h3>
                    <p className="text-slate-500 text-[10px] leading-tight mb-4 px-4">
                        {activeTab === 'subjects'
                            ? "Set exam dates for individual subjects like Physics or History."
                            : "Track major schedules like Half Yearly, Yearly, or HSC exams."}
                    </p>
                    <button
                        onClick={() => {
                            if (activeTab === 'subjects') setIsSelectingSubject(true);
                            else setIsAddingMajorExam(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add {activeTab === 'subjects' ? 'Subject' : 'Major'} Exam
                    </button>
                </div>
            ) : (
                <div className="grid gap-3">
                    {displayedExams.map((item) => {
                        const dateStr = activeTab === 'subjects' ? (item as Subject).examDate! : (item as MajorExam).date;
                        const daysLeft = calculateDaysLeft(dateStr);
                        const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;
                        const isPast = daysLeft !== null && daysLeft < 0;

                        const dateDisplay = isNaN(new Date(dateStr).getTime())
                            ? 'Invalid Date'
                            : new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

                        return (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group relative bg-white dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all flex items-center gap-4 overflow-hidden"
                            >
                                {/* Proximity Color Bar */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${isPast ? 'bg-slate-400' : isUrgent ? 'bg-red-500' : 'bg-indigo-500'}`} />

                                <div className={`w-12 h-12 rounded-xl ${activeTab === 'subjects' ? 'bg-indigo-500' : (item as MajorExam).color || 'bg-slate-500'} flex items-center justify-center text-white shadow-lg shadow-black/5 flex-shrink-0`}>
                                    {activeTab === 'subjects' ? <BookOpen className="w-5 h-5" /> : <CalendarRange className="w-6 h-6" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base truncate tracking-tight">{item.name}</h4>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    if (activeTab === 'subjects') setEditingSubject(item as Subject);
                                                    else {
                                                        setEditingMajorExam(item as MajorExam);
                                                        setMajorExamForm({ name: item.name, date: (item as MajorExam).date, color: (item as MajorExam).color });
                                                        setIsAddingMajorExam(true);
                                                    }
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors"
                                                title="Edit Exam"
                                                aria-label="Edit Exam"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={(e) => activeTab === 'subjects' ? handleDeleteExam(item.id, e) : handleDeleteMajorExam(item.id, e)}
                                                className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 bg-slate-50 dark:bg-slate-800 rounded-lg transition-colors"
                                                title="Delete Exam"
                                                aria-label="Delete Exam"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                                        {dateDisplay}
                                    </p>
                                </div>

                                <div className={`text-right flex-shrink-0 min-w-[50px] ${isPast ? 'text-slate-400' : isUrgent ? 'text-red-500' : 'text-indigo-500'}`}>
                                    <div className="text-xl font-black leading-none">{isPast || daysLeft === null ? '—' : daysLeft}</div>
                                    <div className="text-[9px] font-black uppercase tracking-widest mt-1">{isPast ? 'Past' : 'Days'}</div>
                                </div>

                                {isUrgent && !isPast && (
                                    <div className="absolute top-2 right-2">
                                        <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
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
                                <h3 className="font-bold text-slate-800 dark:text-white">Schedule Subject Exam</h3>
                                <button
                                    onClick={() => setIsSelectingSubject(false)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    title="Close Selector"
                                    aria-label="Close Selector"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar text-left">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 px-1 font-medium">
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
                                                    <div className="font-bold text-slate-800 dark:text-white text-sm truncate">{subject.name}</div>
                                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest p-0.5">{(subject.chapters?.length || 0)} Chapters</div>
                                                </div>
                                                <Plus className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <CalendarClock className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">All subjects have exams!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add/Edit Major Exam Modal */}
            <AnimatePresence>
                {isAddingMajorExam && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700"
                        >
                            <div className="p-4 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                                <h3 className="font-bold text-slate-800 dark:text-white">
                                    {editingMajorExam ? 'Edit Major Exam' : 'Add Major Exam'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsAddingMajorExam(false);
                                        setEditingMajorExam(null);
                                        setMajorExamForm({ name: '', date: new Date().toISOString().split('T')[0], color: 'bg-indigo-500' });
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    title="Close Modal"
                                    aria-label="Close Modal"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleMajorExamSubmit} className="p-6 space-y-5 text-left">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Exam Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Year Final Exam"
                                        value={majorExamForm.name}
                                        onChange={e => setMajorExamForm({ ...majorExamForm, name: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Event Date</label>
                                    <input
                                        required
                                        type="date"
                                        title="Select Exam Date"
                                        placeholder="Select Date"
                                        value={majorExamForm.date}
                                        onChange={e => setMajorExamForm({ ...majorExamForm, date: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Theme Color</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-blue-500'].map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setMajorExamForm({ ...majorExamForm, color })}
                                                className={`w-8 h-8 rounded-full ${color} transition-all ${majorExamForm.color === color ? 'ring-4 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-800' : 'opacity-60 hover:opacity-100'}`}
                                                title={`Select ${color.split('-')[1]} theme`}
                                                aria-label={`Select ${color.split('-')[1]} theme`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
                                >
                                    {editingMajorExam ? 'Update Schedule' : 'Launch Schedule'}
                                </button>
                            </form>
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
