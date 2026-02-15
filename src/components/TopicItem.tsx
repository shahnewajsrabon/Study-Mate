import { motion } from 'framer-motion';
import { CheckCircle2, Trash2 } from 'lucide-react';
import { useStudy, type Topic } from '../context/StudyContext';

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

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex items-center gap-3 py-2 pl-4 pr-2 group/topic hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors ml-8 border-l border-slate-100 dark:border-slate-700"
        >
            <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => toggleTopic(subjectId, chapterId, topic.id)}
                className={`flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${topic.isCompleted
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-slate-300 dark:border-slate-500 text-transparent hover:border-slate-400 dark:hover:border-slate-400'
                    }`}
            >
                <CheckCircle2 className="w-3 h-3" />
            </motion.button>

            <span className={`flex-1 text-sm font-google-sans transition-all ${topic.isCompleted ? 'text-slate-400 line-through' : 'text-slate-600 dark:text-slate-300'
                }`}>
                {topic.name}
            </span>

            <button
                onClick={() => confirm('Delete this topic?') && deleteTopic(subjectId, chapterId, topic.id)}
                className="opacity-0 group-hover/topic:opacity-100 p-1.5 text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-all"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
        </motion.div>
    );
}
