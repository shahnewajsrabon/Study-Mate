import { useState } from 'react';
import { Link } from 'react-router-dom';
import { type Subject } from '../context/StudyContext';
import { ArrowRight, BookOpen, CheckCircle2, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import EditSubjectModal from './EditSubjectModal';

const MotionLink = motion(Link);

interface SubjectCardProps {
    subject: Subject;
    index?: number; // Optional index for staggering delay internal elements if needed
}

export default function SubjectCard({ subject, index = 0 }: SubjectCardProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const totalChapters = subject.chapters.length;
    const completedChapters = subject.chapters.filter(c => c.isCompleted).length;

    // Calculate progress as average of all chapter progresses
    let totalProgressSum = 0;
    subject.chapters.forEach(chapter => {
        if (chapter.topics && chapter.topics.length > 0) {
            totalProgressSum += (chapter.topics.filter(t => t.isCompleted).length / chapter.topics.length) * 100;
        } else {
            totalProgressSum += chapter.isCompleted ? 100 : 0;
        }
    });

    const progress = totalChapters === 0 ? 0 : Math.round(totalProgressSum / totalChapters);

    return (
        <>
            <MotionLink
                to={`/subject/${subject.id}`}
                whileHover={{ y: -8, transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] } }}
                whileTap={{ scale: 0.98 }}
                className="group relative block bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:shadow-blue-500/15 dark:hover:shadow-blue-900/20 transition-all overflow-hidden"
            >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${subject.color.replace('bg-', 'from-').replace('-500', '-500/10')} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full pointer-events-none`} />

                {/* Edit Button - Absolute Positioned */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsEditOpen(true);
                    }}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 rounded-xl transition-colors opacity-0 group-hover:opacity-100 z-10"
                    title="Edit Subject"
                >
                    <Pencil className="w-4 h-4" />
                </motion.button>

                <div className="flex items-start justify-between mb-6 relative z-10">
                    <motion.div
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        className={`w-14 h-14 rounded-2xl ${subject.color} flex items-center justify-center text-white shadow-lg shadow-blue-500/20`}
                    >
                        <BookOpen className="w-7 h-7" />
                    </motion.div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-600">
                        {progress}%
                    </div>
                </div>

                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {subject.name}
                </h3>

                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-6">
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded-lg">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{totalChapters}</span>
                    </div>
                    {completedChapters > 0 && (
                        <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{completedChapters}</span>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 font-medium">
                        <span>Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: 0.5 + (index * 0.1), ease: 'easeOut' }}
                            className={`h-full ${subject.color} rounded-full`}
                        />
                    </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-sm">
                    <span className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">View Details</span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </MotionLink>

            {isEditOpen && (
                <EditSubjectModal
                    subject={subject}
                    onClose={() => setIsEditOpen(false)}
                />
            )}
        </>
    );
}
