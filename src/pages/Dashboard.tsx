import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useStudy } from '../context/StudyContext';
import SubjectCard from '../components/SubjectCard';
import AddSubjectModal from '../components/AddSubjectModal';
import Badge from '../components/Badge';
import WelcomeModal from '../components/WelcomeModal';
import DailyGoalCard from '../components/DailyGoalCard';
import ContinueLearningCard from '../components/ContinueLearningCard';
import QuoteCard from '../components/QuoteCard';
import Leaderboard from '../components/Leaderboard';
import AdBanner from '../components/AdBanner';
import { Plus, Trophy, BookMarked, PieChart } from 'lucide-react';
// import AnimatedPage from '../components/AnimatedPage'; // Removed direct usage to control staggering explicitly

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

            import AdBanner from '../components/AdBanner';

            // ... (imports)

            // ... inside Dashboard component ...

            {/* Dashboard Widgets - Mobile Carousel / Desktop Grid */}
            <div className="flex overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-4 gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:mx-0 md:px-0 md:pb-0 md:overflow-visible no-scrollbar">
                {/* ... widgets ... */}
            </div>

            {/* Ad Placeholder */}
            <AdBanner dataAdSlot="1234567890" className="max-w-[728px] mx-auto" />

            {/* Badges Section */}
            {userProfile.earnedBadges && userProfile.earnedBadges.length > 0 && (
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
            )}

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
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
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
