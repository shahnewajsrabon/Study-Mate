import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, BookOpen, AlertCircle, Quote } from 'lucide-react';
import { useStudy } from '../hooks/useStudy';
import { useProfile } from '../hooks/useProfile';

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm ${insight.bg} transition-colors relative overflow-hidden group`}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <insight.icon className={`w-20 h-20 ${insight.color}`} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm ${insight.color}`}>
                        <insight.icon className="w-5 h-5" />
                    </div>
                    <h3 className={`font-bold text-sm uppercase tracking-wider ${insight.color}`}>Daily AI Insight</h3>
                </div>

                <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{insight.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{insight.message}</p>
            </div>
        </motion.div>
    );
}
