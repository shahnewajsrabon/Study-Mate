import { useState, useEffect, useRef } from 'react';
import { useStudy } from '../context/StudyContext';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { Play, Pause, Save, Trophy, RotateCcw, Volume2, VolumeX, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface LeaderboardEntry {
    userId: string;
    userName: string;
    displayTime: number;
}

type TimerMode = 'stopwatch' | 'pomodoro' | 'countdown';
type TimeRange = 'today' | 'week' | 'month' | 'all_time';

import { useToast } from '../context/ToastContext';

export default function Timer() {
    const toast = useToast();
    const { saveStudySession, subjects } = useStudy();
    const { user } = useAuth();
    const { playSound, isMuted, toggleMute } = useSound();

    // --- State ---
    const [mode, setMode] = useState<TimerMode>('stopwatch');
    const [isActive, setIsActive] = useState(false);
    const [seconds, setSeconds] = useState(0); // Current display time
    const [initialTime, setInitialTime] = useState(0); // For progress calculation
    const [customMinutes, setCustomMinutes] = useState(30);
    const [activeTab, setActiveTab] = useState<'timer' | 'leaderboard'>('timer');
    const [timeRange, setTimeRange] = useState<TimeRange>('today');
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [sessionGoal, setSessionGoal] = useState('');
    const [sessionSaved, setSessionSaved] = useState(false);

    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

    const intervalRef = useRef<number | null>(null);

    // --- Notifications ---
    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const sendNotification = (title: string, body: string) => {
        if (Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/vite.svg' });
        }
    };

    // --- Timer Logic ---
    useEffect(() => {
        if (isActive) {
            intervalRef.current = window.setInterval(() => {
                setSeconds((prev) => {
                    if (mode === 'stopwatch') {
                        return prev + 1;
                    } else {
                        // Countdown Logic
                        if (prev <= 1) {
                            // Timer Finished
                            setIsActive(false);
                            playSound('complete');
                            sendNotification("Time's Up! ⏰", "Your study session is complete. Take a break!");
                            return 0;
                        }
                        return prev - 1;
                    }
                });
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, mode, playSound]);

    // Initialize Timer based on Mode
    useEffect(() => {
        setIsActive(false);
        setSessionSaved(false);
        if (mode === 'stopwatch') {
            setSeconds(0);
            setInitialTime(0);
        } else if (mode === 'pomodoro' || mode === 'countdown') {
            const sec = customMinutes * 60;
            setSeconds(sec);
            setInitialTime(sec);
        }
    }, [mode, customMinutes]);

    // --- Leaderboard Fetch ---
    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (!user) return;
            setLoadingLeaderboard(true);
            try {
                const usersRef = collection(db, 'users');
                let orderByField = 'userProfile.todayStudyTime';

                if (timeRange === 'week') orderByField = 'userProfile.weeklyStudyTime';
                else if (timeRange === 'month') orderByField = 'userProfile.monthlyStudyTime';
                else if (timeRange === 'all_time') orderByField = 'userProfile.totalStudyTime';

                const q = query(usersRef, orderBy(orderByField, 'desc'), limit(10));
                const querySnapshot = await getDocs(q);

                const entries: LeaderboardEntry[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.userProfile) {
                        let displayTime = 0;
                        if (timeRange === 'today') displayTime = data.userProfile.todayStudyTime || 0;
                        else if (timeRange === 'week') displayTime = data.userProfile.weeklyStudyTime || 0;
                        else if (timeRange === 'month') displayTime = data.userProfile.monthlyStudyTime || 0;
                        else displayTime = data.userProfile.totalStudyTime || 0;

                        entries.push({
                            userId: doc.id,
                            userName: data.userProfile.name || 'Anonymous',
                            displayTime
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
    }, [user, activeTab, timeRange]); // Reload when switching tab or range

    // --- Document Title Update ---
    useEffect(() => {
        if (isActive) {
            document.title = `${formatTime(seconds)} - ${sessionGoal ? sessionGoal : (mode === 'pomodoro' ? 'Focus' : 'Timer')}`;
        } else {
            document.title = 'Study Tracker';
        }
        return () => {
            document.title = 'Study Tracker';
        };
    }, [isActive, seconds, mode, sessionGoal]);

    const toggleTimer = () => {
        if (!isActive && mode !== 'stopwatch' && seconds === 0) {
            // Restart if finished
            setSeconds(initialTime);
        }
        setIsActive(!isActive);
        playSound(isActive ? 'click' : 'click');
    };

    const resetTimer = () => {
        setIsActive(false);
        setSessionSaved(false);
        if (mode === 'stopwatch') {
            setSeconds(0);
        } else {
            setSeconds(initialTime);
        }
        playSound('click');
    };

    const handleSaveSession = async () => {
        if (!selectedSubject) {
            toast.error('Please select a subject to save session.');
            return;
        }

        let duration = 0;
        if (mode === 'stopwatch') {
            duration = seconds;
        } else {
            duration = initialTime - seconds;
        }

        if (duration < 60) {
            toast.error('Session must be at least 1 minute to save.');
            return;
        }

        await saveStudySession(duration, selectedSubject, sessionGoal);
        setSessionSaved(true);
        playSound('success');
        toast.success('Session Saved! Great Job.');
    };

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const formatDuration = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60; // Show seconds too for leaderboards to look cooler
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Calculate Progress for Circular Timer
    // For stopwatch, we can just spin or show full
    // For countdown, we calc percentage
    const progressPercent = mode === 'stopwatch'
        ? 100
        : Math.max(0, (seconds / initialTime) * 100);

    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white transition-colors">Focus Timer</h1>
                </div>
                <button
                    onClick={toggleMute}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    {!isMuted ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                </button>
            </header>

            {/* Mobile Tabs */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 md:hidden">
                <button
                    onClick={() => setActiveTab('timer')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'timer'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400'
                        }`}
                >
                    Timer
                </button>
                <button
                    onClick={() => setActiveTab('leaderboard')}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'leaderboard'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400'
                        }`}
                >
                    Leaderboard
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Timer Section */}
                <div className={`${activeTab === 'timer' ? 'block' : 'hidden'} md:block flex flex-col space-y-6`}>

                    {/* Goal Input */}
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
                        <label className="block text-sm font-medium text-slate-500 mb-2">My Focus Goal</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="What are you working on? (e.g. Physics Chapter 3)"
                                className="flex-1 bg-slate-50 dark:bg-slate-700 border-none rounded-xl px-4 py-3 text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                value={sessionGoal}
                                onChange={(e) => setSessionGoal(e.target.value)}
                                disabled={isActive}
                            />
                            <select
                                className="w-1/3 bg-slate-50 dark:bg-slate-700 border-none rounded-xl px-3 py-3 text-slate-600 dark:text-slate-300 font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm"
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                disabled={isActive}
                            >
                                <option value="">Subject</option>
                                {subjects.map(sub => (
                                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Timer Circle */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center relative overflow-hidden transition-colors min-h-[400px]">

                        {/* Circle SVG */}
                        <div className="relative w-64 h-64 md:w-72 md:h-72 mb-8 flex items-center justify-center">
                            {/* Background Circle */}
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    className="text-slate-100 dark:text-slate-700"
                                />
                                {/* Progress Circle */}
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={mode === 'stopwatch' ? 0 : strokeDashoffset}
                                    strokeLinecap="round"
                                    className={`transition-all duration-1000 ease-linear ${isActive
                                        ? (mode === 'pomodoro' ? 'text-rose-500' : 'text-blue-500')
                                        : 'text-slate-300 dark:text-slate-600'
                                        }`}
                                />
                            </svg>

                            {/* Center Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                <div className={`text-5xl md:text-6xl font-bold tracking-tight tabular-nums mb-2 ${isActive ? (mode === 'pomodoro' ? 'text-rose-500' : 'text-blue-600') : 'text-slate-800 dark:text-white'
                                    }`}>
                                    {formatTime(seconds)}
                                </div>
                                <div className="text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest text-sm">
                                    {isActive ? 'Running' : 'Paused'}
                                </div>
                            </div>
                        </div>

                        {/* Controls Row */}
                        <div className="flex items-center gap-6 z-10">
                            {!isActive && (
                                <button
                                    onClick={resetTimer}
                                    className="p-3 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all hover:scale-110"
                                    title="Reset"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                            )}

                            <button
                                onClick={toggleTimer}
                                className={`p-6 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 ${isActive
                                    ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 ml-1 fill-current" />}
                            </button>

                            {/* Save Button (mini) */}
                            {(!isActive && ((mode === 'stopwatch' && seconds > 60) || (mode !== 'stopwatch' && seconds !== initialTime)) && !sessionSaved) && (
                                <button
                                    onClick={handleSaveSession}
                                    className="p-3 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-all hover:scale-110 animate-pulse"
                                    title="Save Session"
                                >
                                    <Save className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Mode Switcher */}
                        <div className="mt-8 flex gap-2">
                            <button
                                onClick={() => { setMode('stopwatch'); setCustomMinutes(0); }}
                                className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${mode === 'stopwatch' ? 'bg-blue-100 text-blue-700' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                Stopwatch
                            </button>
                            <button
                                onClick={() => { setMode('pomodoro'); setCustomMinutes(25); }}
                                className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${mode === 'pomodoro' ? 'bg-rose-100 text-rose-700' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                Pomodoro
                            </button>
                            <button
                                onClick={() => { setMode('countdown'); setCustomMinutes(30); }}
                                className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${mode === 'countdown' ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                Countdown
                            </button>
                        </div>

                        {/* Duration Slider/Input for Pomodoro/Countdown */}
                        {(!isActive && (mode === 'pomodoro' || mode === 'countdown')) && (
                            <div className="mt-4 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                                <span className="text-slate-400 text-sm">Duration:</span>
                                <input
                                    type="range"
                                    min="5"
                                    max="120"
                                    step="5"
                                    value={customMinutes}
                                    onChange={(e) => setCustomMinutes(Number(e.target.value))}
                                    className="w-32 accent-blue-600 cursor-pointer"
                                />
                                <span className="text-slate-700 dark:text-slate-300 font-bold w-12 text-center">{customMinutes}m</span>
                            </div>
                        )}

                    </div>
                </div>

                {/* Leaderboard Section - REDESIGNED */}
                <div className={`${activeTab === 'leaderboard' ? 'block' : 'hidden'} md:block bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700 h-fit transition-colors sticky top-24`}>

                    {/* Header & Search */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-yellow-500" />
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Leaderboard</h2>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-800 dark:text-white placeholder:text-slate-400 transition-all font-medium"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>

                        {/* Time Range Tabs (Pills) */}
                        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                            {(['today', 'week', 'month', 'all_time'] as TimeRange[]).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all capitalize ${timeRange === range
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/5'
                                        }`}
                                >
                                    {range === 'all_time' ? 'Lifetime' : range === 'today' ? '24 Hours' : range === 'week' ? '7 Days' : '1 Month'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loadingLeaderboard ? (
                        <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                            <p className="text-sm font-medium">Loading rankings...</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {leaderboard
                                .filter(e => e.userName.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map((entry, index) => (
                                    <div
                                        key={entry.userId}
                                        className={`flex items-center justify-between p-3 rounded-2xl transition-all ${entry.userId === user?.uid
                                            ? 'bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/30 border border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">

                                            {/* Rank */}
                                            <div className="font-bold text-slate-400 w-6 text-center text-sm">
                                                {index + 1}.
                                            </div>

                                            {/* Avatar & Info */}
                                            <div className="flex items-center gap-3">
                                                <div className={`
                                                w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm border-2
                                                ${index === 0 ? 'bg-yellow-100 text-yellow-600 border-yellow-200' :
                                                        index === 1 ? 'bg-slate-200 text-slate-600 border-slate-300' :
                                                            index === 2 ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-white dark:border-slate-600'}
                                            `}>
                                                    {entry.userName.charAt(0).toUpperCase()}
                                                </div>

                                                <div>
                                                    <p className={`font-bold text-sm ${entry.userId === user?.uid ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>
                                                        {entry.userName}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className={`w-2 h-2 rounded-full ${entry.displayTime > 3600 ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                                                        <span className="text-xs text-slate-400 font-medium">{entry.displayTime > 3600 ? 'Studying' : 'Offline'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Time */}
                                        <div className="text-right">
                                            <div className="font-bold text-blue-600 dark:text-blue-400 text-base md:text-lg tabular-nums tracking-tight">
                                                {formatDuration(entry.displayTime)}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            {leaderboard.length === 0 && (
                                <div className="text-center py-10 px-6 text-slate-500 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                    <p className="text-sm">No records found for this period.</p>
                                    <p className="text-xs mt-1 text-slate-400">Be the first to start studying!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Success Modal (Toast) replacement for Alert */}
            <AnimatePresence>
                {sessionSaved && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-20 left-1/2 -translate-x-1/2 md:bottom-8 bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 z-50"
                    >
                        <div className="bg-emerald-500 rounded-full p-1"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                        <span className="font-medium">Session Saved! Great Job.</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
