import { motion } from 'framer-motion';
import { useStudy } from '../features/study/hooks/useStudy.ts';
import StudyHeatmap from '../features/study/components/StudyHeatmap.tsx';
import FocusCharts from '../features/study/components/FocusCharts.tsx';
import Sidebar from '../shared/components/Sidebar.tsx';
import { BarChart3, TrendingUp, Calendar, Target, Award, Clock } from 'lucide-react';

export default function Analytics() {
    const { userProfile, subjects } = useStudy();

    if (!userProfile) return null;

    const totalMinutes = Math.round(userProfile.sessionHistory.reduce((acc, s) => acc + s.duration, 0) / 60);
    const sessionsToday = userProfile.sessionHistory.filter(s =>
        new Date(s.startTime).toDateString() === new Date().toDateString()
    ).length;

    const stats = [
        { label: 'Total Focus', value: `${totalMinutes}m`, icon: <Clock className="w-5 h-5" />, color: 'bg-blue-500' },
        { label: 'Sessions', value: userProfile.sessionHistory.length, icon: <BarChart3 className="w-5 h-5" />, color: 'bg-emerald-500' },
        { label: 'Today', value: sessionsToday, icon: <Calendar className="w-5 h-5" />, color: 'bg-indigo-500' },
        { label: 'Rank', value: 'Pro', icon: <Award className="w-5 h-5" />, color: 'bg-amber-500' },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
            <Sidebar />

            <main className="flex-1 p-4 md:p-8 lg:p-12 ml-0 lg:ml-64 transition-all">
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Insights & Growth</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                                Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Analytics</span>
                            </h1>
                        </div>

                        <div className="flex gap-4">
                            <div className="px-6 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
                                <Target className="w-5 h-5 text-amber-500" />
                                <div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase">Daily Goal</div>
                                    <div className="text-sm font-bold text-slate-800 dark:text-white">2h / 4h</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </header>

                <div className="space-y-8">
                    {/* Top Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl group hover:border-blue-500 transition-all cursor-default"
                            >
                                <div className={`w-12 h-12 ${stat.color} text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:rotate-6 transition-transform`}>
                                    {stat.icon}
                                </div>
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-tighter">{stat.label}</div>
                                <div className="text-2xl font-black text-slate-800 dark:text-white">{stat.value}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Heatmap Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <StudyHeatmap sessions={userProfile.sessionHistory} />
                    </motion.div>

                    {/* Charts Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <FocusCharts sessions={userProfile.sessionHistory} subjects={subjects} />
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
