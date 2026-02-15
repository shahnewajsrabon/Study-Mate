import { Link, useLocation, useOutlet } from 'react-router-dom';
import { BookOpen, Settings as SettingsIcon, LayoutDashboard, TrendingUp, List, LogOut, Timer, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AnimatePresence } from 'framer-motion';
import { cloneElement } from 'react';

export default function Layout() {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const element = useOutlet();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pb-20 md:pb-0 font-sans transition-colors duration-300">
            {/* Mobile Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 px-4 py-3 flex items-center justify-between md:hidden transition-colors duration-300">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent">
                        TrackEd
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </button>
                    <Link to="/settings" className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <SettingsIcon className="w-5 h-5" />
                    </Link>
                </div>
            </header>

            {/* Desktop Sidebar & Content Wrapper */}
            <div className="md:flex max-w-5xl mx-auto">
                {/* Desktop Sidebar (Hidden on Mobile) */}
                <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 p-6 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">TrackEd</h1>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </button>
                    </div>

                    <nav className="space-y-2 flex-1">
                        <Link
                            to="/"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/')
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                }`}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            Dashboard
                        </Link>
                        <Link
                            to="/analytics"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/analytics')
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                }`}
                        >
                            <TrendingUp className="w-5 h-5" />
                            Analytics
                        </Link>
                        <Link
                            to="/chapters"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/chapters')
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                }`}
                        >
                            <List className="w-5 h-5" />
                            Chapters
                        </Link>
                        <Link
                            to="/timer"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/timer'
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <Timer className="w-5 h-5" />
                            Timer
                        </Link>

                        <Link
                            to="/settings"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/settings')
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                }`}
                        >
                            <SettingsIcon className="w-5 h-5" />
                            Settings
                        </Link>
                    </nav>

                    <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-700">
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 transition-colors w-full text-left mb-4"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                        <div className="text-xs text-slate-400 dark:text-slate-500">
                            <p>Empowering Students</p>
                            <p className="mt-1">© 2026 TrackEd</p>
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
                    to="/analytics"
                    className={`flex flex-col items-center gap-1 text-xs ${isActive('/analytics') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-400 dark:text-slate-500'
                        }`}
                >
                    <TrendingUp className="w-6 h-6" />
                    <span>Stats</span>
                </Link>
                <Link
                    to="/chapters"
                    className={`flex flex-col items-center gap-1 text-xs ${isActive('/chapters') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-400 dark:text-slate-500'
                        }`}
                >
                    <List className="w-6 h-6" />
                    <span>Chapters</span>
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
                    to="/settings"
                    className={`flex flex-col items-center gap-1 text-xs ${isActive('/settings') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-slate-400 dark:text-slate-500'
                        }`}
                >
                    <SettingsIcon className="w-6 h-6" />
                    <span>Settings</span>
                </Link>
            </nav>
        </div>
    );
}
