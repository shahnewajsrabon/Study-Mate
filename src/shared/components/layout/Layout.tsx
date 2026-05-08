import { useState, useEffect } from 'react';
import { Link, useLocation, useOutlet } from 'react-router-dom';
import { Settings as SettingsIcon, LayoutDashboard, TrendingUp, LogOut, Timer, Moon, Sun, Calendar, Users, ShieldCheck, Layers, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { useProfile } from '../../../features/profile/hooks/useProfile.ts';
import { getLevelInfo } from '../../../features/profile/utils/levelUtils.ts';
import { AnimatePresence, motion } from 'framer-motion';
import { cloneElement } from 'react';
import TourOverlay, { type TourStep } from '../ui/TourOverlay.tsx';
import logo from '../../../assets/logo.png';
import InstallPrompt from '../ui/InstallPrompt.tsx';
import type { BeforeInstallPromptEvent } from '../../types/index.ts';
import { useSmartReminders } from '../../hooks/useSmartReminders.ts';

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
    const { userProfile, isAdmin } = useProfile();

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
        <div className="min-h-screen bg-bone dark:bg-[#1a1a1a] text-charcoal dark:text-slate-100 pb-20 md:pb-0 font-sans transition-colors duration-300">

            {showTour && (
                <TourOverlay
                    steps={TOUR_STEPS}
                    onComplete={handleTourComplete}
                    onSkip={handleTourComplete}
                />
            )}

            {/* Mobile Header */}
            <header className="sticky top-0 z-20 px-6 py-4 flex items-center justify-between md:hidden bg-bone/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md transition-colors duration-300">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sage-500 flex items-center justify-center text-white font-serif font-bold text-xs">
                        {level}
                    </div>
                    <h1 className="text-xl font-serif font-bold text-charcoal dark:text-white">
                        TrackEd
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-sage-500 transition-colors"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </button>
                    <Link to="/settings" className="p-2 text-slate-400 dark:text-slate-500 hover:text-sage-500 transition-colors">
                        <SettingsIcon className="w-5 h-5" />
                    </Link>
                </div>
            </header>

            {/* Desktop Sidebar & Content Wrapper */}
            <div className="md:flex max-w-7xl mx-auto md:p-4 lg:p-6">
                {/* Desktop Sidebar (Hidden on Mobile) */}
                <aside className="hidden md:flex flex-col w-72 h-[calc(100vh-3rem)] sticky top-6 m-2 zen-card p-8 transition-all duration-300 z-10">
                    <div className="flex items-center justify-between mb-12 pl-2">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="TrackEd Logo" className="w-8 h-8 object-contain grayscale opacity-70" />
                            <h1 className="text-2xl font-serif font-bold text-charcoal dark:text-white tracking-tight">TrackEd</h1>
                        </div>
                    </div>

                    {/* User Profile & XP (Desktop) - Simplified */}
                    <div className="mb-10 px-2 text-center">
                        <div className="inline-block relative mb-4">
                            <div className="w-16 h-16 rounded-3xl bg-sage-50 dark:bg-sage-900/20 flex items-center justify-center text-sage-600 dark:text-sage-400 font-serif font-bold text-2xl">
                                {level}
                            </div>
                        </div>
                        <h3 className="font-serif font-bold text-xl text-charcoal dark:text-white leading-tight">{userProfile.name}</h3>
                        <p className="text-xs font-bold text-sage-500 uppercase tracking-[0.2em] mt-1">{currentTitle}</p>

                        <div className="mt-6 space-y-2">
                            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-sage-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "circOut" }}
                                />
                            </div>
                            <div className="flex justify-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                <span>{userProfile.xp} / {nextLevelXP || 'MAX'} XP</span>
                            </div>
                        </div>
                    </div>

                    <nav className="space-y-1 flex-1">
                        {[
                            { path: '/', label: 'Dashboard', icon: LayoutDashboard },
                            { path: '/planner', label: 'Planner', icon: Calendar },
                            { path: '/analytics', label: 'Analytics', icon: TrendingUp },
                            { path: '/notes', label: 'Notes', icon: FileText },
                            { path: '/timer', label: 'Timer', icon: Timer },
                            { path: '/chat', label: 'Study Groups', icon: Users },
                            { path: '/flashcards', label: 'Flashcards', icon: Layers },
                            { path: '/settings', label: 'Settings', icon: SettingsIcon },
                        ].map((item) => {
                            const ActiveIcon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive(item.path)
                                        ? 'bg-sage-50 dark:bg-sage-900/20 text-sage-600 dark:text-sage-400 font-bold'
                                        : 'text-slate-400 dark:text-slate-500 hover:text-charcoal dark:hover:text-white hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                                        }`}
                                >
                                    <ActiveIcon className={`w-5 h-5 silky-transition ${isActive(item.path) ? 'text-sage-600 dark:text-sage-400' : 'text-slate-300 dark:text-slate-600 group-hover:text-sage-400'}`} />
                                    <span className="text-sm font-medium tracking-tight">{item.label}</span>
                                </Link>
                            );
                        })}

                        {isAdmin && (
                            <Link
                                to="/admin"
                                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive('/admin')
                                    ? 'bg-charcoal text-white font-bold'
                                    : 'text-slate-400 dark:text-slate-500 hover:text-charcoal dark:hover:text-white hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                                    }`}
                            >
                                <ShieldCheck className="w-5 h-5" />
                                <span className="text-sm font-medium tracking-tight">Admin Panel</span>
                            </Link>
                        )}
                    </nav>

                    <div className="mt-auto pt-6">
                        <button
                            onClick={logout}
                            className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-red-500 transition-colors w-full text-left group"
                        >
                            <LogOut className="w-5 h-5 silky-transition group-hover:-translate-x-1" />
                            <span className="text-sm font-medium">Sign Out</span>
                        </button>
                        <div className="mt-6 flex flex-col items-center gap-4">
                            <button
                                onClick={toggleTheme}
                                className="p-2 text-slate-300 hover:text-sage-500 transition-colors"
                            >
                                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                            </button>
                            <p className="text-[10px] text-slate-300 uppercase tracking-[0.2em]">© 2026 TrackEd</p>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-6 md:p-10 lg:p-12">
                    <AnimatePresence mode="wait">
                        {element && cloneElement(element, { key: location.pathname })}
                    </AnimatePresence>
                </main>
            </div>

            {/* Mobile Bottom Navigation - Minimalist */}
            <nav className="fixed bottom-6 left-6 right-6 bg-white/90 dark:bg-[#242424]/90 backdrop-blur-xl border border-slate-100 dark:border-slate-800 flex justify-around p-2 md:hidden z-20 rounded-3xl shadow-2xl transition-colors duration-300">
                {[
                    { path: '/', icon: LayoutDashboard },
                    { path: '/planner', icon: Calendar },
                    { path: '/timer', icon: Timer },
                    { path: '/chat', icon: Users },
                    { path: '/notes', icon: FileText },
                ].map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`p-3 rounded-2xl transition-all ${isActive(item.path) ? 'bg-sage-500 text-white shadow-lg shadow-sage-500/20' : 'text-slate-300 dark:text-slate-600'
                            }`}
                    >
                        <item.icon className="w-6 h-6" />
                    </Link>
                ))}
            </nav>

            {installPromptEvent && <InstallPrompt deferredPrompt={installPromptEvent} onInstall={handleInstall} />}
        </div>
    );
}
