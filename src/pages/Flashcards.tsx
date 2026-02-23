import { useState, useMemo } from 'react';
import { useStudy } from '../features/study/hooks/useStudy.ts';
import { Plus, Search, Layers, ChevronRight, Brain, BookOpen, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../shared/components/ui/AnimatedPage.tsx';
import FlashcardCard from '../features/study/components/FlashcardCard.tsx';
import { clsx } from 'clsx';

export default function Flashcards() {
    const { subjects, flashcardSets, addFlashcardSet, deleteFlashcardSet, toggleFlashcardMastered } = useStudy();
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | 'all'>('all');
    const [activeSetId, setActiveSetId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSets = useMemo(() => {
        return flashcardSets.filter(set => {
            const matchesSubject = selectedSubjectId === 'all' || set.subjectId === selectedSubjectId;
            const matchesSearch = set.title.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSubject && matchesSearch;
        });
    }, [flashcardSets, selectedSubjectId, searchQuery]);

    const activeSet = useMemo(() => {
        return flashcardSets.find(s => s.id === activeSetId);
    }, [flashcardSets, activeSetId]);

    const handleCreateSet = () => {
        const title = prompt("Enter Flashcard Set Title (e.g., Biology Chapter 1 Concepts):");
        if (!title) return;

        const subId = prompt("Enter Subject ID (or leave for first subject):") || (subjects[0]?.id);
        if (!subId) return;

        addFlashcardSet({
            title,
            subjectId: subId,
            cards: [
                { id: crypto.randomUUID(), question: "Example Question", answer: "Example Answer", isMastered: false }
            ]
        });
    };

    const handleDeleteSet = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Delete this flashcard set?")) {
            deleteFlashcardSet(id);
            if (activeSetId === id) setActiveSetId(null);
        }
    };

    return (
        <AnimatedPage className="max-w-6xl mx-auto pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                        <Layers className="w-10 h-10 text-indigo-600" />
                        Flashcards
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Active recall for better retention</p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreateSet}
                    className="bg-slate-900 dark:bg-slate-50 dark:text-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-slate-900/10 transition-all hover:bg-slate-800"
                >
                    <Plus className="w-5 h-5" />
                    New Set
                </motion.button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar Filter */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search sets..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="space-y-1">
                            <button
                                onClick={() => setSelectedSubjectId('all')}
                                className={clsx(
                                    "w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all",
                                    selectedSubjectId === 'all' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                )}
                            >
                                All Subjects
                            </button>
                            {subjects.map(sub => (
                                <button
                                    key={sub.id}
                                    onClick={() => setSelectedSubjectId(sub.id)}
                                    className={clsx(
                                        "w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                                        selectedSubjectId === sub.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                    )}
                                >
                                    <div className={`w-2 h-2 rounded-full ${sub.color}`} />
                                    {sub.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sets Grid / Active Set */}
                <div className="lg:col-span-9">
                    <AnimatePresence mode="wait">
                        {activeSetId && activeSet ? (
                            <motion.div
                                key="active-set"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setActiveSetId(null)}
                                        className="text-indigo-600 font-bold flex items-center gap-2 hover:underline"
                                    >
                                        <Layers className="w-4 h-4" />
                                        Back to Sets
                                    </button>
                                    <div className="flex items-center gap-4">
                                        <div className="px-4 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-bold flex items-center gap-2">
                                            <Brain className="w-3 h-3" />
                                            {activeSet.cards.filter(c => c.isMastered).length} / {activeSet.cards.length} Mastered
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {activeSet.cards.map(card => (
                                        <FlashcardCard
                                            key={card.id}
                                            {...card}
                                            onToggleMastered={() => toggleFlashcardMastered(activeSet.id, card.id)}
                                        />
                                    ))}
                                    <button
                                        onClick={() => {
                                            const q = prompt("Question:");
                                            const a = prompt("Answer:");
                                            if (q && a) {
                                                // Updated: correctly notify user or implement a proper modal
                                                alert("This feature will allow adding cards to the set in a future update.");
                                            }
                                        }}
                                        className="h-80 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all p-8 gap-4"
                                    >
                                        <Plus className="w-10 h-10" />
                                        <span className="font-bold">Add Note / Card</span>
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="sets-grid"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                            >
                                {filteredSets.length === 0 ? (
                                    <div className="col-span-full py-20 text-center space-y-4">
                                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                                            <Layers className="w-10 h-10 text-slate-300" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-400">No Sets Found</h3>
                                        <p className="text-slate-500">Create your first flashcard set to start studying!</p>
                                    </div>
                                ) : (
                                    filteredSets.map(set => (
                                        <motion.div
                                            key={set.id}
                                            layout
                                            onClick={() => setActiveSetId(set.id)}
                                            className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer group relative overflow-hidden"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                                    <Brain className="w-6 h-6" />
                                                </div>
                                                <button
                                                    onClick={(e) => handleDeleteSet(set.id, e)}
                                                    className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Delete Flashcard Set"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <h3 className="font-black text-lg text-slate-800 dark:text-white mb-2 leading-tight">{set.title}</h3>
                                            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                                                <span className="flex items-center gap-1">
                                                    <BookOpen className="w-3 h-3" />
                                                    {set.cards.length} Cards
                                                </span>
                                                <ChevronRight className="w-3 h-3 text-indigo-500" />
                                            </div>

                                            {/* Progress Bar Mini */}
                                            <div className="mt-6 h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500"
                                                    style={{ width: `${set.cards.length > 0 ? (set.cards.filter(c => c.isMastered).length / set.cards.length) * 100 : 0}%` }}
                                                />
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AnimatedPage>
    );
}
