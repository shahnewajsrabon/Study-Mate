import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Clock,
    Trophy,
    TrendingUp,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    MoreVertical,
    ShieldCheck
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';

interface UserAdminData {
    id: string;
    userProfile: {
        name: string;
        level: number;
        xp: number;
        role: string;
        totalStudyTime: number;
        currentStreak: number;
    };
    lastActive?: string;
}

export default function Admin() {
    const [users, setUsers] = useState<UserAdminData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'users'), orderBy('userProfile.xp', 'desc'), limit(50));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedUsers: UserAdminData[] = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.userProfile) {
                    loadedUsers.push({
                        id: doc.id,
                        userProfile: data.userProfile,
                        lastActive: data.lastActive // assume we might store this
                    });
                }
            });
            setUsers(loadedUsers);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const stats = [
        {
            label: 'Total Students',
            value: users.length.toString(),
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            trend: '+12%',
            trendUp: true
        },
        {
            label: 'Study Hours',
            value: (users.reduce((acc, u) => acc + (u.userProfile.totalStudyTime || 0), 0) / 3600).toFixed(1),
            icon: Clock,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            trend: '+8%',
            trendUp: true
        },
        {
            label: 'Top Level',
            value: Math.max(...users.map(u => u.userProfile.level || 1)).toString(),
            icon: Trophy,
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            trend: 'Stable',
            trendUp: true
        },
        {
            label: 'Engagement',
            value: '84%',
            icon: TrendingUp,
            color: 'text-indigo-500',
            bg: 'bg-indigo-50 dark:bg-indigo-900/20',
            trend: '-2%',
            trendUp: false
        },
    ];

    const filteredUsers = users.filter(u =>
        u.userProfile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-indigo-500" />
                        Admin Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage users and track global performance</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none w-full md:w-64 transition-all"
                        />
                    </div>
                    <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <Filter className="w-4 h-4 text-slate-500" />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${stat.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.trend}
                            </div>
                        </div>
                        <div>
                            <div className="text-2xl font-black text-slate-800 dark:text-white">{stat.value}</div>
                            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* User Management Table */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Active Students</h2>
                    <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full">
                        {filteredUsers.length} Students
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Student</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Level</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">XP</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Study Time</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8">
                                            <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full w-2/3 mx-auto"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white dark:ring-slate-700">
                                                    {user.userProfile.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 dark:text-white text-sm">{user.userProfile.name}</div>
                                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium font-mono">{user.id.substring(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-black text-xs border border-emerald-100 dark:border-emerald-900/50">
                                                {user.userProfile.level || 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                {(user.userProfile.xp || 0).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                {Math.round((user.userProfile.totalStudyTime || 0) / 3600)}h
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-bold text-slate-500 dark:text-slate-400">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest ${user.userProfile.role === 'admin' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400'}`}>
                                                {user.userProfile.role || 'Student'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-1 px-2 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        No students matched your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
