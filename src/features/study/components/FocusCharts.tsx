import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XPath, YAxis, Tooltip, Legend } from 'recharts';
import type { StudySession, Subject } from '../types/study.ts';

interface FocusChartsProps {
    sessions: StudySession[];
    subjects: Subject[];
}

export default function FocusCharts({ sessions, subjects }: FocusChartsProps) {
    // Subject Distribution Data
    const pieData = useMemo(() => {
        const distribution: Record<string, number> = {};
        sessions.forEach(session => {
            const subject = subjects.find(s => s.id === session.subjectId);
            const name = subject ? subject.name : 'Unknown';
            distribution[name] = (distribution[name] || 0) + session.duration;
        });

        return Object.entries(distribution).map(([name, value]) => ({
            name,
            value: Math.round(value / 60) // converting to minutes
        })).sort((a, b) => b.value - a.value);
    }, [sessions, subjects]);

    // Trend Data (Last 7 Days)
    const barData = useMemo(() => {
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        return days.map(day => {
            const total = sessions
                .filter(s => s.startTime.startsWith(day))
                .reduce((acc, s) => acc + s.duration, 0);

            return {
                day: new Date(day).toLocaleDateString(undefined, { weekday: 'short' }),
                minutes: Math.round(total / 60)
            };
        });
    }, [sessions]);

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart: Subject Distribution */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl">
                <div className="mb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">Distribution</span>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">Focus Mix</h3>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {pieData.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-[200px] text-slate-400 italic text-sm">
                        No session data yet.
                    </div>
                )}
            </div>

            {/* Bar Chart: Daily Trends */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl">
                <div className="mb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">Performance</span>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">Weekly Momentum</h3>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="minutes" fill="#6366f1" radius={[10, 10, 10, 10]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        Focused for {barData.reduce((acc, d) => acc + d.minutes, 0)} minutes in the last 7 days.
                    </p>
                </div>
            </div>
        </div>
    );
}
