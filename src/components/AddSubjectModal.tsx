import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { X, Book, Save } from 'lucide-react';

const COLORS = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
    'bg-rose-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-orange-500'
];

interface AddSubjectModalProps {
    onClose: () => void;
}

export default function AddSubjectModal({ onClose }: AddSubjectModalProps) {
    const { addSubject } = useStudy();
    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        addSubject({
            name: name.trim(),
            color: selectedColor,
            icon: 'book', // Default icon for now
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 transition-colors">
                <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 transition-colors">
                        <Book className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        Add New Subject
                    </h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Subject Name</label>
                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Physics"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:font-normal placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">Color Tag</label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-8 h-8 rounded-full ${color} transition-all ${selectedColor === color ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            <Save className="w-5 h-5" />
                            Create Subject
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
