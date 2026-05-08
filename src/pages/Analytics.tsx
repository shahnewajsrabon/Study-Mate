import { motion } from 'framer-motion';
import { useStudy } from '../features/study/hooks/useStudy.ts';
import StudyHeatmap from '../features/study/components/StudyHeatmap.tsx';
import FocusCharts from '../features/study/components/FocusCharts.tsx';
import { useAnalyticsLogic } from '../features/study/hooks/useAnalyticsLogic.ts';
import { BarChart3, TrendingUp, Target, Award, Clock, Flame, Download, Scale, Sun } from 'lucide-react';

export default function Analytics() {
    const { subjects } = useStudy();
    const analytics = useAnalyticsLogic();

    if (!analytics.userProfile) return null;

    const {
        userProfile, isEditingGoal, setIsEditingGoal, tempGoal, setTempGoal,
        currentTitle, streak, sessions, totalMinutes, saveGoal, balanceScore, mostProductiveHour
    } = analytics;

    const stats = [
        { label: 'Total Focus', value: `${totalMinutes}m`, icon: <Clock className="w-5 h-5" />, color: 'bg-blue-500' },
        { label: 'Sessions', value: sessions.length, icon: <BarChart3 className="w-5 h-5" />, color: 'bg-emerald-500' },
        { label: 'Streak', value: `${streak} Days`, icon: <Flame className="w-5 h-5" />, color: 'bg-orange-500' },
        { label: 'Rank', value: currentTitle, icon: <Award className="w-5 h-5" />, color: 'bg-indigo-600' },
        { label: 'Balance Score', value: `${balanceScore}%`, icon: <Scale className="w-5 h-5" />, color: 'bg-purple-500' },
        { label: 'Best Hour', value: mostProductiveHour, icon: <Sun className="w-5 h-5" />, color: 'bg-amber-400' },
    ];

    const exportCSV = () => {
        const headers = "Date,Subject,Duration(s),Mood\n";
        const rows = sessions.map(s => `${s.startTime},${subjects.find(sub => sub.id === s.subjectId)?.name || s.subjectId},${s.duration},${s.mood}`).join("\n");
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `study_sessions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="space-y-10">
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
                        <button 
                            onClick={exportCSV}
                            className="px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Export CSV</span>
                        </button>

                        <div className="px-6 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3 group">
                            <Target className="w-5 h-5 text-amber-500" />
                            <div>
                                <div className="text-[10px] font-black text-slate-400 uppercase">Daily Goal</div>
                                {isEditingGoal ? (
                                    <div className="flex items-center gap-2 mt-1">
                                        <input
                                            type="number"
                                            value={tempGoal}
                                            onChange={(e) => setTempGoal(Number(e.target.value))}
                                            className="w-16 bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-xs font-bold focus:ring-2 focus:ring-blue-500"
                                            min="1"
                                            max="24"
                                            aria-label="Daily Goal in Hours"
                                            title="Daily Goal in Hours"
                                        />
                                        <button onClick={saveGoal} className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-600">Save</button>
                                        <button onClick={() => setIsEditingGoal(false)} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-500">Cancel</button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="text-sm font-bold text-slate-800 dark:text-white">
                                            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m / {userProfile.dailyGoal / 3600}h
                                        </div>
                                        <button
                                            onClick={() => { setIsEditingGoal(true); setTempGoal(userProfile.dailyGoal / 3600); }}
                                            className="text-[10px] font-black uppercase tracking-widest text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </header>

            <div className="space-y-8">
                {/* Top Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
                    <StudyHeatmap sessions={sessions} />
                </motion.div>

                {/* Charts Area */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <FocusCharts sessions={sessions} subjects={subjects} />
                </motion.div>
            </div>
        </div>
    );
}
