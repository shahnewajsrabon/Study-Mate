import React, { useState } from 'react';
import { useStudy } from '../hooks/useStudy';
import { X, BookMarked, Plus } from 'lucide-react';

interface AddChapterModalProps {
    subjectId: string;
    onClose: () => void;
}

export default function AddChapterModal({ subjectId, onClose }: AddChapterModalProps) {
    const { addChapter } = useStudy();
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        addChapter(subjectId, name.trim());
        setName(''); // Reset for next entry
        // onClose(); // Keep open to add multiple? User asked for ease. 
        // "User flow warning: Asking users to type all chapters at once is tedious."
        // Mitigation: "make adding chapters very quick (Enter key to add next)."
        // So I will keep it open and show a success toast or just clear input.
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 transition-colors">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 transition-colors">
                        <BookMarked className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        Add Chapters
                    </h3>
                    <button onClick={onClose} aria-label="Close" className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">Chapter Name / Topic</label>
                            <span className="text-xs text-slate-400 dark:text-slate-500 transition-colors">Press Enter to add & continue</span>
                        </div>
                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Newton's Laws"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Done
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            <Plus className="w-5 h-5" />
                            Add
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
