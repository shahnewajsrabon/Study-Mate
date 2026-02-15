import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useStudy } from '../context/StudyContext';
import SubjectCard from '../components/SubjectCard';
import StatCard from '../components/StatCard';
import AddSubjectModal from '../components/AddSubjectModal';
import Badge from '../components/Badge';
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
            className="space-y-8"
            variants={container}
            initial="hidden"
            animate="show"
            exit="exit"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white transition-colors">
                        Welcome back, <span className="bg-gradient-to-r from-blue-700 to-teal-600 dark:from-blue-400 dark:to-teal-400 bg-clip-text text-transparent">{userProfile.name}</span>!
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                        You're currently in <span className="font-semibold text-slate-700 dark:text-slate-300">{userProfile.grade}</span>. Let's make progress!
                    </p>
                </div>
                <motion.button
                    id="add-subject-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAddOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Subject
                </motion.button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Overall Progress */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                    className="md:col-span-1 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-2xl p-6 text-white text-center md:text-left relative overflow-hidden shadow-lg shadow-blue-500/20"
                >
                    <div className="relative z-10">
                        <h3 className="text-blue-100 font-medium mb-1 flex items-center justify-center md:justify-start gap-2">
                            <PieChart className="w-4 h-4" /> Overall Syllabus
                        </h3>
                        <div className="text-4xl font-bold mb-2">{overallProgress}%</div>
                        <p className="text-blue-100 text-sm">Completed across {subjects.length} subjects</p>
                    </div>
                    {/* Decorative Circle */}
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                </motion.div>

                {/* Chapters Done */}
                <StatCard
                    title="Chapters Completed"
                    value={completedChapters}
                    icon={Trophy}
                    colorClass="text-amber-500"
                    bgClass="bg-amber-50 dark:bg-amber-900/20"
                    delay={0.1}
                />

                {/* Pending Chapters */}
                <StatCard
                    title="Chapters Pending"
                    value={totalChapters - completedChapters}
                    icon={BookMarked}
                    colorClass="text-violet-500"
                    bgClass="bg-violet-50 dark:bg-violet-900/20"
                    delay={0.2}
                />
            </div>

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
        </motion.div>
    );
}
