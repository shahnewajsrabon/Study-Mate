import { useState, useEffect } from 'react';
import { Link, useLocation, useOutlet } from 'react-router-dom';
import { Settings as SettingsIcon, LayoutDashboard, TrendingUp, LogOut, Timer, Moon, Sun, Calendar, Users, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useStudy } from '../context/StudyContext';
import { getLevelInfo } from '../utils/levelUtils';
import { AnimatePresence, motion } from 'framer-motion';
import { cloneElement } from 'react';
import TourOverlay, { type TourStep } from './TourOverlay';
import logo from '../assets/logo.png';
import InstallPrompt from './InstallPrompt';
import type { BeforeInstallPromptEvent } from '../types';
import { useSmartReminders } from '../hooks/useSmartReminders';

const TOUR_STEPS: TourStep[] = [
    {
        title: 'Welcome to TrackEd! 🚀',
        description: 'Your personal companion for academic success. Let\'s take a quick tour to get you started.',
        position: 'center'
    },
    {
        targetId: 'add-subject-btn',
        title: 'Add Your Subjects 📚',
        description: 'Start by adding the subjects you want to track. You can organize them by chapters and topics.',
        position: 'bottom'
    },
    {
        targetId: 'nav-timer',
        title: 'Focus Timer ⏱️',
        description: 'Use the Pomodoro timer or stopwatch to track your study sessions and build streaks.',
        position: 'right'
    },
    {
        targetId: 'nav-settings',
        title: 'Customize Experience ⚙️',
        description: 'Manage your profile, data, and switch between light/dark modes here.',
        position: 'top'
    }
];

export default function Layout() {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { userProfile, isAdmin } = useStudy();

    // Level Info
    const { currentTitle, nextLevelXP, progress } = getLevelInfo(userProfile.xp || 0);
    const level = userProfile.level || 1;
    const location = useLocation();
    const element = useOutlet();

    // Initialize Smart Reminders
    useSmartReminders();

    // Tour State
    const [showTour, setShowTour] = useState(false);

    // Install Prompt State
    const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        // Temporarily disable auto-tour to fix blocking issue
        localStorage.setItem('tracked_tour_completed', 'true');

        const handler = (e: Event) => {
            e.preventDefault();
            setInstallPromptEvent(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleTourComplete = () => {
        setShowTour(false);
        localStorage.setItem('tracked_tour_completed', 'true');
    };

    const handleInstall = async () => {
        if (!installPromptEvent) return;
        installPromptEvent.prompt();
        const { outcome } = await installPromptEvent.userChoice;
        if (outcome === 'accepted') {
            setInstallPromptEvent(null);
        }
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pb-20 md:pb-0 font-sans transition-colors duration-300">

            {showTour && (
                <TourOverlay
                    steps={TOUR_STEPS}
                    onComplete={handleTourComplete}
                    onSkip={handleTourComplete}
                />
            )}

            {/* Mobile Header */}
            <header className="glass sticky top-0 z-20 px-4 py-3 flex items-center justify-between md:hidden transition-colors duration-300">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                        {level}
                    </div>
                    <div>
                        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                            TrackEd
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-full transition-colors backdrop-blur-sm"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </button>
                    <Link to="/settings" className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-full transition-colors backdrop-blur-sm">
                        <SettingsIcon className="w-5 h-5" />
                    </Link>
                </div>
            </header>

            {/* Desktop Sidebar & Content Wrapper */}
            <div className="md:flex max-w-7xl mx-auto">
                {/* Desktop Sidebar (Hidden on Mobile) */}
                <aside className="hidden md:flex flex-col w-72 h-[calc(100vh-2rem)] sticky top-4 m-4 rounded-3xl glass shadow-2xl shadow-slate-200/60 dark:shadow-slate-900/50 p-6 transition-all duration-300 z-10">
                    <div className="flex items-center justify-between mb-10 pl-2">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="TrackEd Logo" className="w-10 h-10 rounded-xl object-contain shadow-md" />
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">TrackEd</h1>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 rounded-xl transition-colors"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* User Profile & XP (Desktop) */}
                    <div className="mb-8 px-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30 ring-2 ring-white dark:ring-slate-700">
                                {level}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white leading-tight">{userProfile.name}</h3>
                                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">{currentTitle}</p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                <span>{userProfile.xp} XP</span>
                                <span>{nextLevelXP ? `${nextLevelXP} XP` : 'MAX'}</span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner ring-1 ring-slate-900/5 dark:ring-white/5">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                    </div>

                    <nav className="space-y-1.5 flex-1">
                        <Link
                            to="/"
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive('/')
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-medium translate-x-1'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            Dashboard
                        </Link>
                        <Link
                            to="/planner"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive('/planner')
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <Calendar className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive('/planner') ? 'text-white' : 'text-slate-500 group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-blue-400'}`} />
                            <span className="font-medium">Planner</span>
                            {isActive('/planner') && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute left-0 w-1 h-8 bg-white rounded-r-full opacity-30"
                                />
                            )}
                        </Link>

                        <Link
                            to="/analytics"
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive('/analytics')
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-medium translate-x-1'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <TrendingUp className="w-5 h-5" />
                            Analytics
                        </Link>

                        <Link
                            to="/timer"
                            id="nav-timer"
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${location.pathname === '/timer'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-medium translate-x-1'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <Timer className="w-5 h-5" />
                            Timer
                        </Link>
                        <Link
                            to="/chat"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive('/chat')
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <Users className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive('/chat') ? 'text-white' : 'text-slate-500 group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-blue-400'}`} />
                            <span className="font-medium">Study Groups</span>
                            {isActive('/chat') && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute left-0 w-1 h-8 bg-white rounded-r-full opacity-30"
                                />
                            )}
                        </Link>
                        <Link
                            to="/settings"
                            id="nav-settings"
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive('/settings')
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-medium translate-x-1'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <SettingsIcon className="w-5 h-5" />
                            Settings
                        </Link>
                        {isAdmin && (
                            <Link
                                to="/admin"
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive('/admin')
                                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30 font-medium translate-x-1'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <ShieldCheck className="w-5 h-5" />
                                Admin Panel
                            </Link>
                        )}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full text-left mb-4 group"
                        >
                            <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                            Sign Out
                        </button>
                        <div className="text-xs text-center text-slate-400 dark:text-slate-500 font-medium">
                            <p>Empowering Students</p>
                            <p className="mt-1 opacity-70">© 2026 TrackEd</p>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8">
                    <AnimatePresence mode="wait">
                        {element && cloneElement(element, { key: location.pathname })}
                    </AnimatePresence>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-around pt-3 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-300">
                <Link
                    to="/"
                    className={`flex flex-col items-center gap-1 text-xs ${isActive('/') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-400 dark:text-slate-500'
                        }`}
                >
                    <LayoutDashboard className="w-6 h-6" />
                    <span>Home</span>
                </Link>

                <Link
                    to="/planner"
                    className={`flex flex-col items-center gap-1 text-xs ${isActive('/planner') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-400 dark:text-slate-500'
                        }`}
                >
                    <Calendar className="w-6 h-6" />
                    <span>Planner</span>
                </Link>

                <Link
                    to="/timer"
                    className={`flex flex-col items-center gap-1 text-xs ${isActive('/timer') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-400 dark:text-slate-500'
                        }`}
                >
                    <Timer className="w-6 h-6" />
                    <span>Timer</span>
                </Link>

                <Link
                    to="/chat"
                    className={`flex flex-col items-center gap-1 text-xs ${isActive('/chat') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-400 dark:text-slate-500'
                        }`}
                >
                    <Users className="w-6 h-6" />
                    <span>Groups</span>
                </Link>

                <Link
                    to="/analytics"
                    className={`flex flex-col items-center gap-1 text-xs ${isActive('/analytics') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-400 dark:text-slate-500'
                        }`}
                >
                    <TrendingUp className="w-6 h-6" />
                    <span>Stats</span>
                </Link>
            </nav>

            {installPromptEvent && <InstallPrompt deferredPrompt={installPromptEvent} onInstall={handleInstall} />}
        </div>
    );
}
