import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { useStudy, type Chapter } from '../context/StudyContext';
import TopicItem from './TopicItem';

interface ChapterItemProps {
    subjectId: string;
    chapter: Chapter;
    isExpanded: boolean;
    onToggle: () => void;
}

export default function ChapterItem({
    subjectId,
    chapter,
    isExpanded,
    onToggle
}: ChapterItemProps) {
    const { deleteChapter, addTopic } = useStudy();
    const [isAddingTopic, setIsAddingTopic] = useState(false);

    const handleAddTopic = (e: React.FormEvent) => {
        e.preventDefault();
        const input = (e.target as HTMLFormElement).elements.namedItem('topicName') as HTMLInputElement;
        if (input.value.trim()) {
            addTopic(subjectId, chapter.id, input.value.trim());
            input.value = '';
            setIsAddingTopic(false);
        }
    };

    return (
        <div className="group transition-colors">
            {/* Chapter Row */}
            <div
                className={`flex items-center gap-3 p-4 pr-14 relative hover:bg-slate-50/80 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${chapter.isCompleted ? 'bg-slate-50/30 dark:bg-slate-700/30' : ''}`}
                onClick={onToggle}
            >
                <button
                    className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="w-5 h-5" />
                    </motion.div>
                </button>

                <div className="flex-1">
                    <span className={`block font-bold text-lg transition-all ${chapter.isCompleted ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {chapter.name}
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap transition-colors">
                            {chapter.topics?.filter(t => t.isCompleted).length || 0}/{chapter.topics?.length || 0} Topics
                            {chapter.isCompleted && <span className="text-emerald-600 dark:text-emerald-400 ml-2 font-bold inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Done</span>}
                        </span>
                        {/* Mini Progress Bar */}
                        {chapter.topics && chapter.topics.length > 0 && (
                            <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex-shrink-0 transition-colors">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.round((chapter.topics.filter(t => t.isCompleted).length / chapter.topics.length) * 100)}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                    className={`h-full ${chapter.isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 absolute right-4 top-1/2 -translate-y-1/2">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsAddingTopic(true);
                            if (!isExpanded) onToggle();
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 rounded-lg transition-colors"
                        title="Add Topic"
                    >
                        <Plus className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this chapter?')) deleteChapter(subjectId, chapter.id);
                        }}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-lg transition-colors"
                        title="Delete Chapter"
                    >
                        <Trash2 className="w-4 h-4" />
                    </motion.button>
                </div>
            </div>

            {/* Topics List (Expanded) */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden bg-slate-50/50 dark:bg-slate-800/50 transition-colors"
                    >
                        <div className="pb-2">
                            {chapter.topics && chapter.topics.length > 0 ? (
                                chapter.topics.map(topic => (
                                    <TopicItem
                                        key={topic.id}
                                        subjectId={subjectId}
                                        chapterId={chapter.id}
                                        topic={topic}
                                    />
                                ))
                            ) : (
                                <div className="pl-12 py-3 text-sm text-slate-400 italic">
                                    No topics yet. Click + to add one.
                                </div>
                            )}

                            {/* Quick Add Topic Input */}
                            {isAddingTopic && (
                                <motion.form
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onSubmit={handleAddTopic}
                                    className="pl-12 pr-4 py-2 flex items-center gap-2"
                                >
                                    <Circle className="w-4 h-4 text-slate-300 dark:text-slate-500" />
                                    <input
                                        autoFocus
                                        name="topicName"
                                        type="text"
                                        placeholder="Topic name..."
                                        className="flex-1 bg-white dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                        onBlur={() => setTimeout(() => setIsAddingTopic(false), 200)}
                                    />
                                    <button type="submit" className="hidden">Add</button>
                                </motion.form>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
