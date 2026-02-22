import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen } from 'lucide-react';
import { useStudy } from '../hooks/useStudy';
import type { Subject } from '../types/study';

const COLORS = [
    'bg-blue-500', 'bg-indigo-500', 'bg-violet-500',
    'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500',
    'bg-rose-500', 'bg-red-500', 'bg-orange-500',
    'bg-amber-500', 'bg-yellow-500', 'bg-lime-500',
    'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
    'bg-cyan-500', 'bg-sky-500', 'bg-slate-500'
];

interface EditSubjectModalProps {
    subject: Subject;
    onClose: () => void;
}

export default function EditSubjectModal({ subject, onClose }: EditSubjectModalProps) {
    const { editSubject } = useStudy();
    const [name, setName] = useState(subject.name);
    const [selectedColor, setSelectedColor] = useState(subject.color);
    const [examDate, setExamDate] = useState(subject.examDate || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            editSubject(subject.id, {
                name: name.trim(),
                color: selectedColor,
                examDate: examDate || undefined
            });
            onClose();
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden"
                >
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Edit Subject</h2>
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Subject Name
                            </label>
                            <div className="relative">
                                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Mathematics"
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Color Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Color Theme
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setSelectedColor(c)}
                                        aria-label={`Select color ${c}`}
                                        className={`w-full h-8 rounded-lg ${c} ${selectedColor === c ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="exam-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Exam Date (Optional)
                            </label>
                            <input
                                type="date"
                                id="exam-date"
                                value={examDate}
                                onChange={(e) => setExamDate(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        {/* Preview */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${selectedColor} flex items-center justify-center text-white shadow-sm`}>
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 dark:text-white">{name || 'Subject Name'}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Preview</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!name.trim()}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
