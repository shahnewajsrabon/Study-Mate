import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, BookOpen, AlertCircle, Quote } from 'lucide-react';
import { useStudy } from '../hooks/useStudy.ts';
import { useProfile } from '../../../features/profile/hooks/useProfile.ts';

export default function DailyPathWidget() {
    const { subjects } = useStudy();
    const { userProfile } = useProfile();

    const insight = useMemo(() => {
        if (!subjects || subjects.length === 0) {
            return {
                title: "Starting Fresh",
                message: "Add your subjects to start generating personalized study insights.",
                icon: BookOpen,
                color: "text-blue-500",
                bg: "bg-blue-50 dark:bg-blue-900/20"
            };
        }

        // Calculate some basic metrics
        const totalChapters = subjects.reduce((acc, s) => acc + s.chapters.length, 0);
        const completedChapters = subjects.reduce((acc, s) => acc + s.chapters.filter(c => c.isCompleted).length, 0);
        const completionRate = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;

        // Check for urgent exams
        const now = new Date();
        const urgentSubject = subjects
            .filter(s => s.examDate)
            .map(s => ({ ...s, daysToExam: Math.ceil((new Date(s.examDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) }))
            .filter(s => s.daysToExam > 0 && s.daysToExam <= 7)
            .sort((a, b) => a.daysToExam - b.daysToExam)[0];

        if (urgentSubject) {
            return {
                title: "Urgent Focus: " + urgentSubject.name,
                message: `${urgentSubject.name} exam is in ${urgentSubject.daysToExam} days! Focus on incomplete chapters today to maximize your score.`,
                icon: AlertCircle,
                color: "text-red-500",
                bg: "bg-red-50 dark:bg-red-900/20"
            };
        }

        if (completionRate > 80) {
            return {
                title: "Finishing Strong",
                message: "You've covered over 80% of your syllabus! Focus on revision and practice questions to solidify your knowledge.",
                icon: Target,
                color: "text-emerald-500",
                bg: "bg-emerald-50 dark:bg-emerald-900/20"
            };
        }

        if (userProfile.currentStreak > 3) {
            return {
                title: "Momentum King",
                message: `You're on a ${userProfile.currentStreak}-day streak! Keep the consistency up; small daily gains lead to massive success.`,
                icon: Zap,
                color: "text-amber-500",
                bg: "bg-amber-50 dark:bg-amber-900/20"
            };
        }

        return {
            title: "Strategic Session",
            message: "Analyze your weakest subjects today. Spending just 20 minutes on a difficult topic can improve retention by 40%.",
            icon: Quote,
            color: "text-indigo-500",
            bg: "bg-indigo-50 dark:bg-indigo-900/20"
        };
    }, [subjects, userProfile.currentStreak]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="zen-card p-8 relative overflow-hidden h-full flex flex-col"
        >
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <insight.icon className="w-32 h-32 text-charcoal" />
            </div>

            <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-sage-50 dark:bg-sage-900/20 rounded-xl">
                        <insight.icon className="w-5 h-5 text-sage-500" />
                    </div>
                    <h3 className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">Daily Insight</h3>
                </div>

                <div className="space-y-3">
                    <h4 className="text-2xl font-serif font-bold text-charcoal dark:text-white leading-tight">{insight.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed font-medium">{insight.message}</p>
                </div>

                <div className="pt-4">
                    <div className="h-1 w-12 bg-sage-500 rounded-full" />
                </div>
            </div>
        </motion.div>
    );
}
