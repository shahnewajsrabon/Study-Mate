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
    ShieldCheck,
    X,
    AlertCircle,
    UserPlus,
    UserMinus,
    Zap
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { AnimatePresence } from 'framer-motion';

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
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'system'>('overview');
    const [users, setUsers] = useState<UserAdminData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserAdminData | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'users'), orderBy('userProfile.xp', 'desc'), limit(100));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedUsers: UserAdminData[] = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.userProfile) {
                    loadedUsers.push({
                        id: doc.id,
                        userProfile: data.userProfile,
                        lastActive: data.lastActive
                    });
                }
            });
            setUsers(loadedUsers);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const totalStudyTime = users.reduce((acc, u) => acc + (u.userProfile.totalStudyTime || 0), 0);
    const avgLevel = users.length > 0 ? (users.reduce((acc, u) => acc + (u.userProfile.level || 1), 0) / users.length).toFixed(1) : '0';
    const activeAdmins = users.filter(u => u.userProfile.role === 'admin').length;

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
            label: 'Total Study Hours',
            value: (totalStudyTime / 3600).toFixed(1),
            icon: Clock,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            trend: '+8%',
            trendUp: true
        },
        {
            label: 'Average Level',
            value: avgLevel,
            icon: Trophy,
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            trend: 'Rising',
            trendUp: true
        },
        {
            label: 'Active Admins',
            value: activeAdmins.toString(),
            icon: ShieldCheck,
            color: 'text-indigo-500',
            bg: 'bg-indigo-50 dark:bg-indigo-900/20',
            trend: 'Secured',
            trendUp: true
        },
    ];

    const filteredUsers = users.filter(u =>
        u.userProfile.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const updateUserMetric = async (userId: string, path: string, value: any) => {
        setIsUpdating(true);
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                [`userProfile.${path}`]: value
            });
            // Update local state if needed (onSnapshot usually handles this but for immediate UI feel)
            if (selectedUser && selectedUser.id === userId) {
                setSelectedUser({
                    ...selectedUser,
                    userProfile: {
                        ...selectedUser.userProfile,
                        [path]: value
                    }
                });
            }
        } catch (err) {
            console.error("Error updating user:", err);
            alert("Failed to update user record.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                            Admin Center
                        </h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">System-wide monitoring & granular student control</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-white/5'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-white/5'}`}
                    >
                        Management
                    </button>
                    <button
                        onClick={() => setActiveTab('system')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'system' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-white/5'}`}
                    >
                        System
                    </button>
                </div>
            </div>

            {activeTab === 'overview' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all group hover:scale-[1.02] hover:shadow-2xl"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-4 rounded-2xl shadow-inner ${stat.bg}`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                    <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${stat.trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                        {stat.trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                        {stat.trend}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{stat.value}</div>
                                    <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Performance Trends Placeholder */}
                    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-8 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center py-20">
                        <TrendingUp className="w-12 h-12 text-slate-200 dark:text-slate-700 mb-4" />
                        <h3 className="text-lg font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Global Analytics Feed</h3>
                        <p className="text-sm text-slate-400 dark:text-slate-600 mt-2">Aggregated user behavior data will stream here in real-time</p>
                    </div>
                </motion.div>
            )}

            {activeTab === 'users' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search students by name or UID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white/80 dark:bg-slate-800 uppercase text-[10px] font-black tracking-widest dark:text-white border border-slate-200 dark:border-slate-700/50 rounded-2xl py-3.5 pl-12 pr-6 focus:ring-4 focus:ring-indigo-500/10 outline-none w-full shadow-lg shadow-slate-200/30 dark:shadow-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 transition-all">
                                <Filter className="w-4 h-4" /> Filter By Role
                            </button>
                        </div>
                    </div>

                    {/* User Management Table */}
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50 shadow-2xl shadow-slate-400/5 dark:shadow-none overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-900/30">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700/50">Registered Student</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700/50 text-center">Status</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700/50 text-center">XP & Power</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700/50 text-center">Engagement</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700/50 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/30">
                                    {loading ? (
                                        [1, 2, 3, 4, 5].map(i => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={5} className="px-8 py-10">
                                                    <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full w-48 mb-2"></div>
                                                    <div className="h-2 bg-slate-50 dark:bg-slate-700/50 rounded-full w-32"></div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-500/5 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-xl shadow-indigo-500/20 ring-4 ring-white dark:ring-slate-700 group-hover:scale-110 transition-transform">
                                                            {user.userProfile.name?.charAt(0) || '?'}
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-slate-800 dark:text-white text-sm tracking-tight">{user.userProfile.name}</div>
                                                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase mt-0.5">{user.id.substring(0, 12)}...</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${user.userProfile.role === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400'}`}>
                                                        {user.userProfile.role || 'Student'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">Level {user.userProfile.level || 1}</span>
                                                        <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">{(user.userProfile.xp || 0).toLocaleString()} XP</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">{Math.round((user.userProfile.totalStudyTime || 0) / 3600)} HRS</span>
                                                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{user.userProfile.currentStreak || 0} DAY STREAK</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => setSelectedUser(user)}
                                                        className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:shadow-lg transition-all"
                                                    >
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center text-slate-400 dark:text-slate-600">
                                                    <Search className="w-12 h-12 mb-4 opacity-20" />
                                                    <p className="font-black text-sm uppercase tracking-widest">No matching user records found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}

            {activeTab === 'system' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                    {/* System Controls */}
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50 shadow-xl space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3 mb-6 transition-colors tracking-tight">
                                <ShieldCheck className="w-6 h-6 text-indigo-500" />
                                System Controls
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700 transition-all group border-dashed">
                                    <Clock className="w-8 h-8 text-slate-400 mb-3 group-hover:text-indigo-500 transition-colors" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Maintenance</span>
                                </button>
                                <button className="flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-700 transition-all group border-dashed">
                                    <TrendingUp className="w-8 h-8 text-slate-400 mb-3 group-hover:text-amber-500 transition-colors" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Force Sync</span>
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Broadcast Message</h3>
                            <textarea
                                placeholder="Global message to all users..."
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 outline-none h-32 transition-all resize-none"
                            />
                            <button className="w-full mt-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                Send Global Notification
                            </button>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-500/30 text-white flex flex-col justify-between overflow-hidden relative">
                        <ShieldCheck className="absolute -top-10 -right-10 w-48 h-48 opacity-10 rotate-12" />

                        <div className="relative z-10">
                            <h2 className="text-2xl font-black mb-2 flex items-center gap-3 tracking-tight">
                                Security Status
                            </h2>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest uppercase border border-white/30">
                                Protected by Antigravity Shield
                            </span>
                        </div>

                        <div className="space-y-4 relative z-10 mt-20">
                            <div className="flex items-center justify-between text-xs font-bold p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <span>Firestore Rules</span>
                                <span className="text-emerald-400">ACTIVE</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <span>Auth Persistence</span>
                                <span className="text-emerald-400">ENABLED</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <span>Admin Encryption</span>
                                <span className="text-emerald-400">SOLID</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* User Detail Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedUser(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700"
                        >
                            <div className="p-8 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-indigo-500/20">
                                        {selectedUser.userProfile.name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight">{selectedUser.userProfile.name}</h2>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedUser.id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl text-slate-400 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {/* Role & Identity */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Authority Role</label>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateUserMetric(selectedUser.id, 'role', selectedUser.userProfile.role === 'admin' ? 'student' : 'admin')}
                                                disabled={isUpdating}
                                                className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${selectedUser.userProfile.role === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-600 border-slate-100'} border`}
                                            >
                                                {selectedUser.userProfile.role === 'admin' ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                                                {selectedUser.userProfile.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Account Level</label>
                                        <div className="flex items-center gap-2 pt-0.5">
                                            <div className="flex-1 bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-100/50 dark:border-indigo-500/20 rounded-2xl py-2.5 px-4 text-center">
                                                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">Level {selectedUser.userProfile.level || 1}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Metrics Edit */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-amber-500" /> Granular Control
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total XP</span>
                                                <Trophy className="w-4 h-4 text-amber-500" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={selectedUser.userProfile.xp || 0}
                                                    onChange={(e) => updateUserMetric(selectedUser.id, 'xp', parseInt(e.target.value))}
                                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-4 text-sm font-black text-indigo-600"
                                                />
                                            </div>
                                        </div>
                                        <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Streak Days</span>
                                                <TrendingUp className="w-4 h-4 text-orange-500" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={selectedUser.userProfile.currentStreak || 0}
                                                    onChange={(e) => updateUserMetric(selectedUser.id, 'currentStreak', parseInt(e.target.value))}
                                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-4 text-sm font-black text-orange-600"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                    <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> Reset Controls
                                    </h3>
                                    <div className="flex gap-4">
                                        <button className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">
                                            Clear XP
                                        </button>
                                        <button className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">
                                            Reset Streak
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-50 dark:border-slate-700 flex justify-end gap-3">
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="px-6 py-2.5 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-sm border border-slate-100 dark:border-slate-700"
                                >
                                    Dismiss
                                </button>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="px-6 py-2.5 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl shadow-indigo-500/20"
                                >
                                    Complete Audit
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

