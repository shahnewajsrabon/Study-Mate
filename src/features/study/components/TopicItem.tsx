import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Trash2, Pencil, Info } from 'lucide-react';
import { useStudy } from '../hooks/useStudy.ts';
import type { Topic } from '../types/study.ts';
import { useSound } from '../../../shared/context/SoundContext.tsx';
import EditTopicModal from './EditTopicModal.tsx';
import TopicDetailsModal from './TopicDetailsModal.tsx';

interface TopicItemProps {
    subjectId: string;
    chapterId: string;
    topic: Topic;
}

export default function TopicItem({
    subjectId,
    chapterId,
    topic
}: TopicItemProps) {
    const { toggleTopic, deleteTopic } = useStudy();
    const { playSound } = useSound();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3 py-2 pl-4 pr-2 group/topic hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors ml-8 border-l border-slate-100 dark:border-slate-700"
            >
                <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => {
                        toggleTopic(subjectId, chapterId, topic.id);
                        if (!topic.isCompleted) playSound('pop');
                    }}
                    className={`flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${topic.isCompleted
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-500 text-transparent hover:border-slate-400 dark:hover:border-slate-400'
                        }`}
                >
                    <CheckCircle2 className="w-3 h-3" />
                </motion.button>

                <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setIsDetailsOpen(true)}
                >
                    <span className={`block text-sm font-google-sans transition-all ${topic.isCompleted ? 'text-slate-400 line-through' : 'text-slate-600 dark:text-slate-300'
                        }`}>
                        {topic.name}
                    </span>
                    {(topic.notes || (topic.links && topic.links.length > 0)) && (
                        <div className="flex gap-2 mt-0.5">
                            {topic.notes && <div className="w-1 h-1 rounded-full bg-blue-400" title="Has Notes" />}
                            {topic.links && topic.links.length > 0 && <div className="w-1 h-1 rounded-full bg-emerald-400" title="Has Links" />}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover/topic:opacity-100 transition-opacity">
                    <button
                        onClick={() => setIsDetailsOpen(true)}
                        className="p-1.5 text-slate-300 hover:text-blue-500 dark:text-slate-600 dark:hover:text-blue-400 transition-all"
                        title="View Details & Notes"
                    >
                        <Info className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => setIsEditOpen(true)}
                        className="p-1.5 text-slate-300 hover:text-amber-500 dark:text-slate-600 dark:hover:text-amber-400 transition-all"
                        title="Edit Topic Name"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => confirm('Delete this topic?') && deleteTopic(subjectId, chapterId, topic.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-all"
                        title="Delete Topic"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </motion.div>

            <AnimatePresence>
                {isDetailsOpen && (
                    <TopicDetailsModal
                        subjectId={subjectId}
                        chapterId={chapterId}
                        topic={topic}
                        onClose={() => setIsDetailsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {isEditOpen && (
                <EditTopicModal
                    subjectId={subjectId}
                    chapterId={chapterId}
                    topicId={topic.id}
                    currentName={topic.name}
                    onClose={() => setIsEditOpen(false)}
                />
            )}
        </>
    );
}
