import { useState, useEffect, useRef } from 'react';
import { useStudy } from '../context/StudyContext';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { Play, Pause, Save, Trophy, Clock, Timer as TimerIcon, RotateCcw, Volume2, VolumeX, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface LeaderboardEntry {
    userId: string;
    userName: string;
    totalStudyTime: number;
}

type TimerMode = 'stopwatch' | 'pomodoro' | 'countdown';

const POMODORO_TIME = 25 * 60;

export default function Timer() {
    const { saveStudySession, subjects } = useStudy();
    const { user } = useAuth();

    // --- State ---
    const [mode, setMode] = useState<TimerMode>('stopwatch');
    const [isActive, setIsActive] = useState(false);
    const [seconds, setSeconds] = useState(0); // Current display time (elapsed for stopwatch, remaining for others)
    const [initialTime, setInitialTime] = useState(0); // For progress calculation
    const [customMinutes, setCustomMinutes] = useState(30);

    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [sessionSaved, setSessionSaved] = useState(false);
    // const [soundEnabled, setSoundEnabled] = useState(true); // Replaced by global SoundContext

    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

    const intervalRef = useRef<number | null>(null);
    const { playSound, isMuted, toggleMute } = useSound();

    // --- Timer Logic ---

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
        } else if (mode === 'pomodoro') {
            setSeconds(POMODORO_TIME);
            setInitialTime(POMODORO_TIME);
        } else if (mode === 'countdown') {
            const sec = customMinutes * 60;
            setSeconds(sec);
            setInitialTime(sec);
        }
    }, [mode, customMinutes]);

    // --- Leaderboard Fetch ---
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
    }, [user, sessionSaved]);

    // --- Actions ---
    const toggleTimer = () => {
        setIsActive(!isActive);
        setSessionSaved(false);
    };

    const resetTimer = () => {
        setIsActive(false);
        setSessionSaved(false);
        if (mode === 'stopwatch') {
            setSeconds(0);
        } else if (mode === 'pomodoro') {
            setSeconds(POMODORO_TIME);
        } else if (mode === 'countdown') {
            setSeconds(customMinutes * 60);
        }
    };

    const handleSaveSession = async () => {
        let durationToSave = 0;
        if (mode === 'stopwatch') {
            durationToSave = seconds;
        } else {
            // For countdowns, save the *elapsed* time (Initial - Current)
            // If timer finished (0), it's Initial.
            durationToSave = initialTime - seconds;
        }

        if (durationToSave < 60) {
            alert("Session must be at least 1 minute to save.");
            return;
        }

        await saveStudySession(durationToSave, selectedSubject || undefined);
        setSessionSaved(true);
        // Do not reset seconds here for countdown modes so user can see they finished
        if (mode === 'stopwatch') setSeconds(0);
        alert("Session saved successfully!");
    };

    // --- Formatters ---
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

    // --- Circular Progress ---
    const progress = mode === 'stopwatch'
        ? 100 // Stopwatch always full or indeterminate
        : ((initialTime - seconds) / initialTime) * 100;

    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors">Study Timer</h1>
                    <p className="text-slate-500 dark:text-slate-400 transition-colors">Focus, track, and compete.</p>
                </div>
                <button
                    onClick={toggleMute}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    {!isMuted ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Timer Section */}
                <div className="flex flex-col space-y-6">
                    {/* Mode Selector */}
                    <div className="bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex transition-colors">
                        <button
                            onClick={() => setMode('stopwatch')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'stopwatch' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            <TimerIcon className="w-4 h-4" />
                            Stopwatch
                        </button>
                        <button
                            onClick={() => setMode('pomodoro')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'pomodoro' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            <Target className="w-4 h-4" />
                            Pomodoro
                        </button>
                        <button
                            onClick={() => setMode('countdown')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'countdown' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            <Zap className="w-4 h-4" />
                            Countdown
                        </button>
                    </div>

                    <motion.div
                        layout
                        className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center relative overflow-hidden transition-colors"
                    >
                        {/* Subject Select */}
                        <div className="w-full absolute top-6 left-0 px-8 z-10">
                            <select
                                className="w-full p-2 bg-transparent text-center font-medium text-slate-600 dark:text-slate-300 border-none focus:ring-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                disabled={isActive}
                            >
                                <option value="" className="dark:bg-slate-800">Select Subject (Optional)</option>
                                {subjects.map(sub => (
                                    <option key={sub.id} value={sub.id} className="dark:bg-slate-800">{sub.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Circular Progress & Time Display */}
                        <div className="relative mt-12 mb-8">
                            {/* SVG Ring */}
                            <svg
                                className="w-full max-w-[18rem] aspect-square transform -rotate-90"
                                viewBox="0 0 288 288"
                            >
                                <circle
                                    cx="144"
                                    cy="144"
                                    r={radius}
                                    strokeWidth="12"
                                    fill="transparent"
                                    className="stroke-slate-100 dark:stroke-slate-700 transition-colors"
                                />
                                <circle
                                    cx="144"
                                    cy="144"
                                    r={radius}
                                    stroke={mode === 'pomodoro' ? '#f43f5e' : '#3b82f6'} // Red for Pomodoro, Blue for others
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={mode === 'stopwatch' ? 0 : strokeDashoffset}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-linear"
                                />
                            </svg>

                            {/* Time Text Overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                                <div className={`text-6xl font-mono font-bold tracking-wider ${isActive ? (mode === 'pomodoro' ? 'text-rose-500' : 'text-blue-600') : 'text-slate-800 dark:text-white'
                                    }`}>
                                    {formatTime(seconds)}
                                </div>
                                <div className="text-slate-400 dark:text-slate-500 font-medium mt-2 capitalize">{mode}</div>
                            </div>
                        </div>

                        {/* Countdown Input */}
                        {mode === 'countdown' && !isActive && seconds === 0 && (
                            <div className="mb-6 flex items-center gap-2">
                                <span className="text-slate-600 dark:text-slate-400">Minutes:</span>
                                <input
                                    type="number"
                                    min="1"
                                    max="180"
                                    value={customMinutes}
                                    onChange={(e) => setCustomMinutes(Number(e.target.value))}
                                    className="w-20 p-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-lg text-center"
                                />
                            </div>
                        )}

                        {/* Controls */}
                        <div className="flex items-center gap-4 z-10">
                            <button
                                onClick={toggleTimer}
                                className={`p-4 rounded-full transition-all shadow-lg transform active:scale-95 ${isActive
                                    ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {isActive ? <Pause className="w-8 h-8 font-fill" /> : <Play className="w-8 h-8 pl-1" />}
                            </button>

                            {(seconds > 0 || (mode !== 'stopwatch' && seconds !== initialTime)) && (
                                <button
                                    onClick={resetTimer}
                                    className="p-4 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-95"
                                >
                                    <RotateCcw className="w-6 h-6" />
                                </button>
                            )}
                        </div>

                        {/* Save Button (Conditional) */}
                        {(!isActive && ((mode === 'stopwatch' && seconds > 0) || (mode !== 'stopwatch' && seconds !== initialTime)) && !sessionSaved) && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={handleSaveSession}
                                className="absolute bottom-6 flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors shadow-md"
                            >
                                <Save className="w-4 h-4" />
                                Save Session
                            </motion.button>
                        )}
                    </motion.div>
                </div>

                {/* Leaderboard Section - Kept same but slightly styled */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 h-fit transition-colors"
                >
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Leaderboard</h2>
                    </div>

                    {loadingLeaderboard ? (
                        <div className="text-center py-8 text-slate-400">Loading rankings...</div>
                    ) : (
                        <div className="space-y-4">
                            {leaderboard.map((entry, index) => (
                                <div
                                    key={entry.userId}
                                    className={`flex items-center justify-between p-3 rounded-xl ${entry.userId === user?.uid ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                            ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                index === 1 ? 'bg-slate-200 text-slate-700' :
                                                    index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}
                                        `}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className={`font-medium ${entry.userId === user?.uid ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                                {entry.userName} {entry.userId === user?.uid && '(You)'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                        <Clock className="w-4 h-4" />
                                        {formatDuration(entry.totalStudyTime)}
                                    </div>
                                </div>
                            ))}

                            {leaderboard.length === 0 && (
                                <div className="text-center py-8 text-slate-500 bg-slate-50 dark:bg-slate-700 rounded-xl">
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
