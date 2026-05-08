import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Subject } from '../types/study.ts';
import { ArrowRight, BookOpen, CheckCircle2, Pencil, CalendarClock } from 'lucide-react';
import { motion } from 'framer-motion';
import EditSubjectModal from './EditSubjectModal.tsx';

const MotionLink = motion(Link);

interface SubjectCardProps {
    subject: Subject;
    index?: number; // Optional index for staggering delay internal elements if needed
}

export default function SubjectCard({ subject }: SubjectCardProps) {
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

    // Exam Countdown
    const daysToExam = subject.examDate ? Math.ceil((new Date(subject.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
    const isExamNear = daysToExam !== null && daysToExam <= 7 && daysToExam >= 0;

    return (
        <>
            <MotionLink
                to={`/subject/${subject.id}`}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="group relative block zen-card p-6 md:p-8 overflow-hidden h-full flex flex-col"
            >
                {/* Edit Button */}
                <motion.button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsEditOpen(true);
                    }}
                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-sage-500 rounded-xl transition-colors z-10"
                    title="Edit Subject"
                >
                    <Pencil className="w-4 h-4" />
                </motion.button>

                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className={`w-12 h-12 rounded-2xl bg-sage-50 dark:bg-sage-900/20 flex items-center justify-center text-sage-500`}>
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        {progress}% Completed
                    </div>
                </div>

                {subject.examDate && daysToExam !== null && daysToExam >= 0 && (
                    <div className={`mb-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${isExamNear ? 'text-charcoal dark:text-white' : 'text-slate-400'}`}>
                        <CalendarClock className="w-3 h-3" />
                        <span>Exam in {daysToExam} days</span>
                    </div>
                )}

                <h3 className="text-2xl font-serif font-bold text-charcoal dark:text-white mb-4 group-hover:text-sage-600 transition-colors line-clamp-1">
                    {subject.name}
                </h3>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 mt-auto">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{totalChapters} Chapters</span>
                    </div>
                    {completedChapters > 0 && (
                        <div className="flex items-center gap-2 text-sage-500">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{completedChapters} Done</span>
                        </div>
                    )}
                </div>

                {/* Progress Bar - Minimalist */}
                <div className="space-y-3">
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: 0.2, ease: 'circOut' }}
                            className="h-full bg-sage-500 rounded-full"
                        />
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-[0.2em] group-hover:text-charcoal transition-colors">View Path</span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-sage-500 group-hover:text-white silky-transition">
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
