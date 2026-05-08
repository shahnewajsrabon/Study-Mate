import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useStudy } from '../features/study/hooks/useStudy.ts';
import { useProfile } from '../features/profile/hooks/useProfile.ts';
import { type BadgeEntry } from '../features/study/types/study.ts';
import SubjectCard from '../features/study/components/SubjectCard.tsx';
import AddSubjectModal from '../features/study/components/AddSubjectModal.tsx';
import DailyPathWidget from '../features/study/components/DailyPathWidget.tsx';
import Badge from '../shared/components/ui/Badge.tsx';
import WelcomeModal from '../features/profile/components/WelcomeModal.tsx';
import DailyGoalCard from '../features/study/components/DailyGoalCard.tsx';
import QuoteCard from '../shared/components/ui/QuoteCard.tsx';
import Leaderboard from '../features/social/components/Leaderboard.tsx';
import { Plus, Trophy, BookMarked, Heart } from 'lucide-react';
import UpcomingExams from '../features/study/components/UpcomingExams.tsx';
import { useSocial } from '../features/social/hooks/useSocial.ts';
import ReviewCard from '../features/social/components/ReviewCard.tsx';
import SRSReviewWidget from '../features/study/components/SRSReviewWidget.tsx';

const container: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            when: "beforeChildren",
            staggerChildren: 0.1
        }
    },
    exit: { opacity: 0, y: -10 }
};

const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 12
        }
    }
};

export default function Dashboard() {
    const { subjects } = useStudy();
    const { userProfile } = useProfile();
    const { reviews } = useSocial();
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Show welcome modal for new users (default name is 'Student')
    const isNewUser = userProfile.name === 'Student';

    // Stats
    const totalChapters = subjects.reduce((acc, sub) => acc + sub.chapters.length, 0);
    const completedChapters = subjects.reduce((acc, sub) => acc + sub.chapters.filter(c => c.isCompleted).length, 0);

    // Calculate Overall Progress as weighted average of all chapters (consistent with Subject Cards)
    let totalProgressSum = 0;
    subjects.forEach(sub => {
        sub.chapters.forEach(ch => {
            if (ch.topics && ch.topics.length > 0) {
                totalProgressSum += (ch.topics.filter(t => t.isCompleted).length / ch.topics.length) * 100;
            } else {
                totalProgressSum += ch.isCompleted ? 100 : 0;
            }
        });
    });

    const overallProgress = totalChapters === 0 ? 0 : Math.round(totalProgressSum / totalChapters);

    return (
        <motion.div
            className="space-y-6 md:space-y-8"
            variants={container}
            initial="hidden"
            animate="show"
            exit="exit"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-charcoal dark:text-white transition-colors tracking-tight">
                        Hello, <span className="text-sage-500">{userProfile.name}</span>
                        <span className="inline-block animate-wave ml-2">👋</span>
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 mt-3 font-medium">
                        <span className="font-bold text-sage-600 px-3 py-1 bg-sage-50 dark:bg-sage-900/20 rounded-full mr-2">{userProfile.grade}</span>
                        Ready to focus on your goals today?
                    </p>
                </div>
                <motion.button
                    id="add-subject-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsAddOpen(true)}
                    className="bg-charcoal dark:bg-white dark:text-charcoal text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all w-full md:w-auto"
                >
                    <Plus className="w-5 h-5" />
                    New Subject
                </motion.button>
            </div>

            {/* Bento Grid Layout - Vertical on Mobile / Grid on Desktop */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12 md:gap-10 auto-rows-min">

                {/* Left Column: Goal & Path */}
                <div className="lg:col-span-4 flex flex-col gap-8 md:gap-10 order-1">
                    <DailyGoalCard />
                    <DailyPathWidget />
                    <SRSReviewWidget />
                </div>

                {/* Center Column: Leaderboard */}
                <div className="md:col-span-full lg:col-span-4 h-full min-h-[400px] order-3 lg:order-2">
                    <Leaderboard />
                </div>

                {/* Right Column: Progress, Exams & Quotes */}
                <div className="lg:col-span-4 flex flex-col gap-8 md:gap-10 order-2 lg:order-3">
                    {/* Overall Progress Widget */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="zen-card p-8 relative overflow-hidden"
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between relative z-10 gap-8">
                            <div className="flex-1 w-full space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-sage-50 dark:bg-sage-900/20 rounded-xl">
                                        <Trophy className="w-5 h-5 text-sage-500" />
                                    </div>
                                    <h3 className="text-charcoal dark:text-white font-serif font-bold text-xl tracking-tight">
                                        Syllabus Status
                                    </h3>
                                </div>

                                <div className="space-y-6">
                                    {/* Chapters Progress */}
                                    <div className="space-y-3">
                                        <div className="flex items-end justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Chapters</span>
                                                <span className="text-base font-bold text-charcoal dark:text-slate-200">
                                                    {completedChapters} <span className="text-slate-400 font-normal">/ {totalChapters}</span>
                                                </span>
                                            </div>
                                            <span className="text-sm font-bold text-sage-600 bg-sage-50 dark:bg-sage-900/20 px-3 py-1 rounded-lg">
                                                {Math.round((completedChapters / (totalChapters || 1)) * 100)}%
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(completedChapters / (totalChapters || 1)) * 100}%` }}
                                                transition={{ duration: 1.5, ease: "circOut" }}
                                                className="h-full bg-sage-500 rounded-full"
                                            />
                                        </div>
                                    </div>

                                    {/* Completion Progress */}
                                    <div className="space-y-3">
                                        <div className="flex items-end justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">Overall Progress</span>
                                                <span className="text-base font-bold text-charcoal dark:text-slate-200">Completion</span>
                                            </div>
                                            <span className="text-sm font-bold text-charcoal dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                                                {overallProgress}%
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${overallProgress}%` }}
                                                transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
                                                className="h-full bg-charcoal dark:bg-slate-300 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Circular Progress SVG - Minimalist */}
                            <div className="relative w-32 h-32 md:w-36 md:h-36 flex-shrink-0">
                                <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 100 100">
                                    <circle
                                        className="text-slate-100 dark:text-slate-800"
                                        strokeWidth="6"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="42" cx="50" cy="50"
                                    />
                                    <motion.circle
                                        stroke="currentColor"
                                        className="text-sage-500"
                                        strokeWidth="6"
                                        strokeDasharray={263.89} // 2 * pi * 42
                                        strokeDashoffset={263.89}
                                        strokeLinecap="round"
                                        fill="transparent"
                                        r="42" cx="50" cy="50"
                                        initial={{ strokeDashoffset: 263.89 }}
                                        animate={{ strokeDashoffset: 263.89 - (263.89 * overallProgress) / 100 }}
                                        transition={{ duration: 2, ease: "circOut" }}
                                    />
                                </svg>
                                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center z-20">
                                    <span className="text-3xl font-serif font-bold text-charcoal dark:text-white">
                                        {overallProgress}<span className="text-sm text-sage-500">%</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8 md:gap-10 flex-1">
                        <UpcomingExams limit={3} className="h-full" />
                        <QuoteCard />
                    </div>
                </div>
            </div>

            {/* Badges Section */}
            {
                userProfile.earnedBadges && userProfile.earnedBadges.length > 0 && (
                    <motion.div
                        variants={item}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm transition-colors"
                    >
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Recent Achievements
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            {userProfile.earnedBadges.map((badge: BadgeEntry, index) => (
                                <Badge
                                    key={`${badge.type}-${index}`}
                                    type={badge.type}
                                    dateEarned={badge.earnedAt}
                                />
                            ))}
                        </div>
                    </motion.div>
                )
            }

            {/* Subjects Grid */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 transition-colors">
                    Your Subjects
                    <span className="text-sm font-normal text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{subjects.length}</span>
                </h2>

                {subjects.length > 0 ? (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
                    >
                        {subjects.map((subject, index) => (
                            <motion.div key={subject.id} variants={item}>
                                <SubjectCard subject={subject} index={index} />
                            </motion.div>
                        ))}

                        {/* Quick Add Card */}
                        <motion.button
                            variants={item}
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(239, 246, 255, 0.5)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsAddOpen(true)}
                            className="group border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer h-full min-h-[180px] w-full"
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 flex items-center justify-center mb-3 transition-colors">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="font-medium">Add Another Subject</span>
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 transition-colors"
                    >
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookMarked className="w-8 h-8 text-slate-300 dark:text-slate-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">No subjects yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                            Start by adding the subjects you want to track to organize your study plan.
                        </p>
                        <button
                            onClick={() => setIsAddOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
                        >
                            Add Your First Subject
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Wall of Love - Live Reviews */}
            {reviews.length > 0 && (
                <motion.div
                    variants={item}
                    className="pt-8 border-t border-slate-100 dark:border-slate-800"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-red-50 dark:bg-red-900/30 rounded-2xl text-red-500">
                                <Heart className="w-5 h-5 fill-current" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Wall of Love</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Live feedback from our amazing community</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        {/* Fade edges for horizontal scroll */}
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-50/50 dark:from-slate-900/50 to-transparent z-10 pointer-events-none md:hidden" />
                        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-50/50 dark:from-slate-900/50 to-transparent z-10 pointer-events-none md:hidden" />

                        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 gap-4 no-scrollbar scroll-smooth snap-x">
                            {reviews.map((review) => (
                                <div key={review.id} className="snap-center">
                                    <ReviewCard review={review} />
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {isAddOpen && <AddSubjectModal onClose={() => setIsAddOpen(false)} />}

            {/* Welcome Modal for New Users */}
            {isNewUser && <WelcomeModal />}
        </motion.div>
    );
}
