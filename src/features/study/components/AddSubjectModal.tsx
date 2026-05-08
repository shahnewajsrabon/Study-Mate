import React, { useState } from 'react';
import { useStudy } from '../hooks/useStudy.ts';
import { X, Save } from 'lucide-react';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-charcoal/20 backdrop-blur-md animate-in fade-in duration-300">
            <div className="zen-card w-full max-w-lg overflow-hidden p-10 animate-in zoom-in-95 duration-500">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-3xl font-serif font-bold text-charcoal dark:text-white">
                        New Subject
                    </h3>
                    <button onClick={onClose} aria-label="Close" className="p-2 text-slate-300 hover:text-charcoal transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-4">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Subject Name</label>
                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Theoretical Physics"
                            className="w-full px-0 py-4 bg-transparent border-b-2 border-slate-100 dark:border-slate-800 text-2xl font-serif text-charcoal dark:text-white focus:outline-none focus:border-sage-500 transition-all placeholder:text-slate-200 dark:placeholder:text-slate-800"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Visual Identity</label>
                        <div className="flex flex-wrap gap-4">
                            {COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    aria-label={`Select color ${color}`}
                                    className={`w-10 h-10 rounded-2xl ${color} transition-all silky-transition ${selectedColor === color ? 'ring-4 ring-sage-50 dark:ring-sage-900/30 scale-110 shadow-lg shadow-black/5' : 'opacity-40 hover:opacity-100 hover:scale-105'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="w-full bg-sage-600 hover:bg-sage-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-sage-500/10"
                        >
                            <Save className="w-5 h-5" />
                            <span className="uppercase tracking-[0.2em] text-xs">Create Subject</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
