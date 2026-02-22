import { useStudy } from '../hooks/useStudy';
import { BarChart3, TrendingUp, BookOpen, Award, Trophy, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import StatCard from '../components/StatCard';
import { calculateOverallStats, calculateActivityData, calculateStreak, type ActivityPoint } from '../lib/calculateAnalytics';

export default function Analytics() {
    const { subjects } = useStudy();

    const { completedChapters, totalTopics, completedTopics } = calculateOverallStats(subjects);
    const { activityData, maxCount } = calculateActivityData(subjects);
    const calcStreak = calculateStreak(subjects);

    const completionPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };



    return (
        <AnimatedPage className="max-w-5xl mx-auto pb-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white flex items-center gap-4 tracking-tight transition-colors">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        Study Analytics
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Track your progress and stay motivated</p>
                </div>
            </div>

            {/* Overview Cards */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
            >
                <div className="sm:col-span-1">
                    <StatCard
                        title="Focus Streak"
                        value={`${calcStreak} days`}
                        icon={Award}
                        colorClass="text-orange-500"
                        bgClass="bg-orange-100/50 dark:bg-orange-500/10"
                        delay={0.1}
                    />
                </div>
                <div className="sm:col-span-1">
                    <StatCard
                        title="Topics Mastered"
                        value={`${completedTopics}`}
                        icon={BookOpen}
                        colorClass="text-blue-500"
                        bgClass="bg-blue-100/50 dark:bg-blue-500/10"
                        delay={0.2}
                    />
                </div>
                <div className="sm:col-span-1">
                    <StatCard
                        title="Chapters Done"
                        value={`${completedChapters}`}
                        icon={Trophy}
                        colorClass="text-amber-500"
                        bgClass="bg-amber-100/50 dark:bg-amber-500/10"
                        delay={0.3}
                    />
                </div>
                <div className="sm:col-span-1">
                    <StatCard
                        title="Efficiency"
                        value={`${completionPercentage}%`}
                        icon={CheckCircle2}
                        colorClass="text-emerald-500"
                        bgClass="bg-emerald-100/50 dark:bg-emerald-500/10"
                        delay={0.4}
                    />
                </div>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Activity Chart - Premium */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all group"
                >
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3 transition-colors">
                            <BarChart3 className="w-6 h-6 text-blue-500" />
                            Activity Trend
                        </h2>
                        <div className="text-xs font-black uppercase tracking-widest text-slate-400">Last 7 Days</div>
                    </div>
                    <div className="flex items-end justify-between gap-3 md:gap-6 h-64 px-2">
                        {activityData.map((data: ActivityPoint, index) => (
                            <div key={data.date} className="flex-1 flex flex-col items-center gap-4 group/bar">
                                <div className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl relative h-full flex items-end overflow-hidden transition-colors border border-slate-100 dark:border-slate-700/30">
                                    {/* Grid Lines Overlay */}
                                    <div className="absolute inset-x-0 h-px bg-slate-200 dark:bg-slate-700/50 top-1/4" />
                                    <div className="absolute inset-x-0 h-px bg-slate-200 dark:bg-slate-700/50 top-2/4" />
                                    <div className="absolute inset-x-0 h-px bg-slate-200 dark:bg-slate-700/50 top-3/4" />

                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(data.count / (maxCount || 1)) * 100}%` }}
                                        transition={{ duration: 1.5, delay: index * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                                        className="w-full bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-xl transition-all duration-300 group-hover/bar:brightness-110 relative shadow-lg shadow-blue-500/20"
                                    >
                                        <div className="absolute inset-x-0 top-0 h-1 bg-white/20 rounded-full mx-1 mt-1" />

                                        {/* Tooltip */}
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black py-1.5 px-3 rounded-xl opacity-0 scale-90 group-hover/bar:opacity-100 group-hover/bar:scale-100 transition-all whitespace-nowrap z-20 shadow-xl pointer-events-none">
                                            {data.count} TOPICS
                                        </div>
                                    </motion.div>
                                </div>
                                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors ${index === activityData.length - 1 ? 'text-blue-500' : 'text-slate-400'}`}>
                                    {new Date(data.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Subject Breakdown - Premium */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3 transition-colors">
                            <BookOpen className="w-6 h-6 text-indigo-500" />
                            Progress
                        </h2>
                    </div>
                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
                        {subjects.map((sub, idx) => {
                            const sTotal = sub.chapters.reduce((acc, c) => acc + (c.topics?.length || 0), 0);
                            const sDone = sub.chapters.reduce((acc, c) => acc + (c.topics?.filter(t => t.isCompleted).length || 0), 0);
                            const sProg = sTotal > 0 ? Math.round((sDone / sTotal) * 100) : 0;

                            return (
                                <motion.div
                                    key={sub.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + (idx * 0.05) }}
                                    className="group"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-700 dark:text-slate-200 group-hover:text-blue-500 transition-colors uppercase tracking-tight">{sub.name}</span>
                                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-500 transition-colors">{sDone} of {sTotal} Topics</span>
                                        </div>
                                        <span className={`text-xs font-black px-2 py-1 rounded-lg border ${sProg === 100 ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800/50' : 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:border-blue-800/50'}`}>
                                            {sProg}%
                                        </span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-900/50 rounded-full overflow-hidden p-0.5 ring-1 ring-slate-200/50 dark:ring-slate-700/30">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${sProg}%` }}
                                            transition={{ duration: 1.5, ease: 'backOut' }}
                                            className={`h-full rounded-full shadow-lg ${sub.color.replace('text-', 'bg-')} bg-gradient-to-r from-transparent to-white/20`}
                                        />
                                    </div>
                                </motion.div>
                            )
                        })}
                        {subjects.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center space-y-3">
                                <BookOpen className="w-10 h-10 opacity-20" />
                                <p className="text-sm font-bold uppercase tracking-widest opacity-50">No subjects tracked yet</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatedPage>
    );
}
