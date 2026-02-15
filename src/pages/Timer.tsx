import { useState, useEffect, useRef } from 'react';
import { useStudy } from '../context/StudyContext';
import { useAuth } from '../context/AuthContext';
import { Play, Pause, Square, Save, Trophy, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface LeaderboardEntry {
    userId: string;
    userName: string;
    totalStudyTime: number;
}

export default function Timer() {
    const { saveStudySession, subjects } = useStudy();
    const { user } = useAuth();

    // Timer State
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [sessionSaved, setSessionSaved] = useState(false);

    // Leaderboard State
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

    const intervalRef = useRef<number | null>(null);

    // Timer Logic
    useEffect(() => {
        if (isActive) {
            intervalRef.current = window.setInterval(() => {
                setSeconds((s) => s + 1);
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive]);

    // Fetch Leaderboard
    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (!user) return;
            try {
                const usersRef = collection(db, 'users');
                const q = query(usersRef, orderBy('userProfile.totalStudyTime', 'desc'), limit(10));
                const querySnapshot = await getDocs(q);

                const entries: LeaderboardEntry[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.userProfile) {
                        entries.push({
                            userId: doc.id,
                            userName: data.userProfile.name,
                            totalStudyTime: data.userProfile.totalStudyTime || 0
                        });
                    }
                });
                setLeaderboard(entries);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoadingLeaderboard(false);
            }
        };

        fetchLeaderboard();
    }, [user, sessionSaved]); // Re-fetch when session is saved

    const toggleTimer = () => {
        setIsActive(!isActive);
        setSessionSaved(false);
    };

    const stopTimer = () => {
        setIsActive(false);
    };

    const handleSaveSession = async () => {
        if (seconds < 60) {
            alert("Session must be at least 1 minute to save.");
            return;
        }

        await saveStudySession(seconds, selectedSubject || undefined);
        setSessionSaved(true);
        setSeconds(0);
        alert("Session saved successfully!");
    };

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Study Timer</h1>
                <p className="text-slate-500">Track your focus and compete with others.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Timer Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center space-y-8"
                >
                    <div className="w-full">
                        <label className="block text-sm font-medium text-slate-700 mb-2 text-left">Select Subject (Optional)</label>
                        <select
                            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            disabled={isActive}
                        >
                            <option value="">-- General Study --</option>
                            {subjects.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="text-8xl font-mono font-bold text-slate-800 tracking-wider">
                        {formatTime(seconds)}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTimer}
                            className={`p-4 rounded-full transition-all ${isActive
                                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                                }`}
                        >
                            {isActive ? <Pause className="w-8 h-8 font-fill" /> : <Play className="w-8 h-8 pl-1" />}
                        </button>

                        {(seconds > 0 || sessionSaved) && (
                            <button
                                onClick={stopTimer}
                                className="p-4 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                            >
                                <Square className="w-8 h-8" />
                            </button>
                        )}
                    </div>

                    {!isActive && seconds > 0 && !sessionSaved && (
                        <button
                            onClick={handleSaveSession}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                        >
                            <Save className="w-5 h-5" />
                            Save Session
                        </button>
                    )}
                </motion.div>

                {/* Leaderboard Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
                >
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        <h2 className="text-xl font-bold text-slate-800">Leaderboard</h2>
                    </div>

                    {loadingLeaderboard ? (
                        <div className="text-center py-8 text-slate-400">Loading rankings...</div>
                    ) : (
                        <div className="space-y-4">
                            {leaderboard.map((entry, index) => (
                                <div
                                    key={entry.userId}
                                    className={`flex items-center justify-between p-3 rounded-xl ${entry.userId === user?.uid ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                            ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                index === 1 ? 'bg-slate-200 text-slate-700' :
                                                    index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-500'}
                                        `}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className={`font-medium ${entry.userId === user?.uid ? 'text-blue-700' : 'text-slate-800'}`}>
                                                {entry.userName} {entry.userId === user?.uid && '(You)'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500 text-sm font-medium">
                                        <Clock className="w-4 h-4" />
                                        {formatDuration(entry.totalStudyTime)}
                                    </div>
                                </div>
                            ))}

                            {leaderboard.length === 0 && (
                                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl">
                                    No records yet. Be the first!
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
