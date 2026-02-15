import { Link } from 'react-router-dom';
import { type Subject } from '../context/StudyContext';
import { ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionLink = motion(Link);

interface SubjectCardProps {
    subject: Subject;
    index?: number; // Optional index for staggering delay internal elements if needed
}

export default function SubjectCard({ subject, index = 0 }: SubjectCardProps) {
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
        <MotionLink
            to={`/subject/${subject.id}`}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className="group block bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-blue-100 dark:hover:border-blue-900 transition-all"
        >
            <div className="flex items-start justify-between mb-4">
                <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className={`w-12 h-12 rounded-xl ${subject.color} flex items-center justify-center text-white shadow-sm`}
                >
                    <BookOpen className="w-6 h-6" />
                </motion.div>
                <div className="bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors">
                    {progress}%
                </div>
            </div>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                {subject.name}
            </h3>

            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4 transition-colors">
                <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {totalChapters} {totalChapters === 1 ? 'Chapter' : 'Chapters'}
                </span>
                {completedChapters > 0 && (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {completedChapters} Done
                    </span>
                )}
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden transition-colors">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: 0.5 + (index * 0.1), ease: 'easeOut' }}
                    className={`h-full ${subject.color}`}
                />
            </div>

            <div className="mt-4 flex items-center text-sm font-medium text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                View Details <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
        </MotionLink>
    );
}
