import { Link, useLocation, useOutlet } from 'react-router-dom';
import { BookOpen, Settings as SettingsIcon, LayoutDashboard, TrendingUp, List, LogOut, Timer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import { cloneElement } from 'react';

export default function Layout() {
    const { logout } = useAuth();
    const location = useLocation();
    const element = useOutlet();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-0 font-sans">
            {/* Mobile Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 flex items-center justify-between md:hidden">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent">
                        TrackEd
                    </h1>
                </div>
                <Link to="/settings" className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                    <SettingsIcon className="w-5 h-5" />
                </Link>
            </header>

            {/* Desktop Sidebar & Content Wrapper */}
            <div className="md:flex max-w-5xl mx-auto">
                {/* Desktop Sidebar (Hidden on Mobile) */}
                <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 p-6 border-r border-slate-200 bg-white">
                    <div className="flex items-center gap-2 mb-10">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">TrackEd</h1>
                    </div>

                    <nav className="space-y-2 flex-1">
                        <Link
                            to="/"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/')
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            Dashboard
                        </Link>
                        <Link
                            to="/analytics"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/analytics')
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <TrendingUp className="w-5 h-5" />
                            Analytics
                        </Link>
                        <Link
                            to="/chapters"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/chapters')
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <List className="w-5 h-5" />
                            Chapters
                        </Link>
                        <Link
                            to="/timer"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/timer'
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <Timer className="w-5 h-5" />
                            Timer
                        </Link>

                        <Link
                            to="/settings"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/settings')
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <SettingsIcon className="w-5 h-5" />
                            Settings
                        </Link>
                    </nav>

                    <div className="mt-auto pt-6 border-t border-slate-100">
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full text-left mb-4"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                        <div className="text-xs text-slate-400">
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
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 md:hidden z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <Link
                    to="/"
                    className={`flex flex-col items-center gap-1 text-xs ${isActive('/') ? 'text-blue-600 font-medium' : 'text-slate-400'
                        }`}
                >
                    <LayoutDashboard className="w-6 h-6" />
                    <span>Home</span>
                </Link>
                <Link
                    to="/analytics"
                    className={`flex flex-col items-center gap-1 text-xs ${isActive('/analytics') ? 'text-blue-600 font-medium' : 'text-slate-400'
                        }`}
                >
                    <TrendingUp className="w-6 h-6" />
                    <span>Stats</span>
                </Link>
                <Link
                    to="/chapters"
                    className={`flex flex-col items-center gap-1 text-xs ${isActive('/chapters') ? 'text-blue-600 font-medium' : 'text-slate-400'
                        }`}
                >
                    <List className="w-6 h-6" />
                    <span>Chapters</span>
                </Link>
                <Link
                    to="/timer"
                    className={`flex flex-col items-center gap-1 text-xs ${isActive('/timer') ? 'text-blue-600 font-medium' : 'text-slate-400'
                        }`}
                >
                    <Timer className="w-6 h-6" />
                    <span>Timer</span>
                </Link>
                <Link
                    to="/settings"
                    className={`flex flex-col items-center gap-1 text-xs ${isActive('/settings') ? 'text-blue-600 font-medium' : 'text-slate-400'
                        }`}
                >
                    <SettingsIcon className="w-6 h-6" />
                    <span>Settings</span>
                </Link>
            </nav>
        </div>
    );
}
