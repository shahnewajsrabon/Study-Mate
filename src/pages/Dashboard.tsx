import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useStudy } from '../context/StudyContext';
import SubjectCard from '../components/SubjectCard';
import AddSubjectModal from '../components/AddSubjectModal';
import Badge from '../components/Badge';
import WelcomeModal from '../components/WelcomeModal';
import DailyGoalCard from '../components/DailyGoalCard';
import QuoteCard from '../components/QuoteCard';
import Leaderboard from '../components/Leaderboard';
import { Plus, Trophy, BookMarked, PieChart } from 'lucide-react';
import UpcomingExams from '../components/UpcomingExams';

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
    const { userProfile, subjects } = useStudy();
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white transition-colors tracking-tight">
                        Hello, <span className="bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-400 bg-clip-text text-transparent">{userProfile.name}</span>
                        <span className="inline-block animate-wave ml-2">👋</span>
                    </h1>
                    <p className="text-base text-slate-500 dark:text-slate-400 mt-2 transition-colors">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md mr-2">{userProfile.grade}</span>
                        Ready to crush your goals today?
                    </p>
                </div>
                <motion.button
                    id="add-subject-btn"
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAddOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition-all text-sm md:text-base w-full md:w-auto"
                >
                    <Plus className="w-5 h-5" />
                    New Subject
                </motion.button>
            </div>
            {/* Bento Grid Layout - Vertical on Mobile / Grid on Desktop */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 md:gap-6 auto-rows-min">

                {/* Left Column: Goal */}
                <div className="lg:col-span-4 flex flex-col gap-4 md:gap-6 order-1">
                    <div>
                        <DailyGoalCard />
                    </div>
                </div>

                {/* Center Column: Leaderboard */}
                <div className="md:col-span-full lg:col-span-4 h-full min-h-[400px] order-3 lg:order-2">
                    <Leaderboard />
                </div>

                {/* Right Column: Progress, Exams & Quotes */}
                <div className="lg:col-span-4 flex flex-col gap-4 md:gap-6 order-2 lg:order-3">
                    {/* Overall Progress Widget */}
                    {/* Overall Progress Widget - Premium Design */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-100 dark:border-slate-700/50 shadow-xl shadow-blue-500/5 relative overflow-hidden group transition-all hover:shadow-blue-500/10"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />

                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
                            <PieChart className="w-24 h-24 text-blue-500" />
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between relative z-10 gap-6">
                            <div className="flex-1 w-full space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl shadow-inner">
                                        <Trophy className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <h3 className="text-slate-800 dark:text-white font-bold text-lg tracking-tight">
                                        Syllabus Status
                                    </h3>
                                </div>

                                <div className="space-y-5">
                                    {/* Chapters Progress */}
                                    <div className="space-y-2">
                                        <div className="flex items-end justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">Chapters</span>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    {completedChapters} <span className="text-slate-400 font-medium">/ {totalChapters}</span>
                                                </span>
                                            </div>
                                            <span className="text-sm font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-800/50">
                                                {Math.round((completedChapters / (totalChapters || 1)) * 100)}%
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden p-0.5 ring-1 ring-slate-200 dark:ring-slate-700">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(completedChapters / (totalChapters || 1)) * 100}%` }}
                                                transition={{ duration: 1.5, ease: "circOut" }}
                                                className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full shadow-lg shadow-blue-500/20"
                                            />
                                        </div>
                                    </div>

                                    {/* Completion Progress */}
                                    <div className="space-y-2">
                                        <div className="flex items-end justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">Total Progress</span>
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Completion Rate</span>
                                            </div>
                                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                                                {overallProgress}%
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden p-0.5 ring-1 ring-slate-200 dark:ring-slate-700">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${overallProgress}%` }}
                                                transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
                                                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-lg shadow-emerald-500/20"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Circular Progress SVG - Premium */}
                            <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 group/circle">
                                <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-2xl group-hover/circle:bg-blue-500/20 transition-all duration-700" />
                                <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 100 100">
                                    <defs>
                                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#60A5FA" />
                                            <stop offset="100%" stopColor="#3B82F6" />
                                        </linearGradient>
                                    </defs>
                                    <circle
                                        className="text-slate-100 dark:text-slate-700/50"
                                        strokeWidth="8"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="38" cx="50" cy="50"
                                    />
                                    <motion.circle
                                        stroke="url(#progressGradient)"
                                        strokeWidth="8"
                                        strokeDasharray={238.76} // 2 * pi * 38
                                        strokeDashoffset={238.76}
                                        strokeLinecap="round"
                                        fill="transparent"
                                        r="38" cx="50" cy="50"
                                        initial={{ strokeDashoffset: 238.76 }}
                                        animate={{ strokeDashoffset: 238.76 - (238.76 * overallProgress) / 100 }}
                                        transition={{ duration: 2, ease: "circOut" }}
                                    />
                                </svg>
                                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center z-20">
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.5 }}
                                        className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white"
                                    >
                                        {overallProgress}<span className="text-sm md:text-lg text-blue-500">%</span>
                                    </motion.span>
                                    <span className="text-[8px] md:text-[10px] uppercase font-black tracking-tighter text-slate-400 dark:text-slate-500">Done</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6 flex-1">
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
                            {userProfile.earnedBadges.map((badge, index) => (
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

            {isAddOpen && <AddSubjectModal onClose={() => setIsAddOpen(false)} />}

            {/* Welcome Modal for New Users */}
            {isNewUser && <WelcomeModal />}
        </motion.div>
    );
}
