import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PenTool } from 'lucide-react';
import { useStudy } from '../hooks/useStudy';

interface EditTopicModalProps {
    subjectId: string;
    chapterId: string;
    topicId: string;
    currentName: string;
    onClose: () => void;
}

export default function EditTopicModal({ subjectId, chapterId, topicId, currentName, onClose }: EditTopicModalProps) {
    const { editTopic } = useStudy();
    const [name, setName] = useState(currentName);

    useEffect(() => {
        setName(currentName);
    }, [currentName]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            editTopic(subjectId, chapterId, topicId, name.trim());
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
                    className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden"
                >
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Edit Topic</h2>
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Topic Name
                            </label>
                            <div className="relative">
                                <PenTool className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Algebra Basics"
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    autoFocus
                                />
                            </div>
                        </div>

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
