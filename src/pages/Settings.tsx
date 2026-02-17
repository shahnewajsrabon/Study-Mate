import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import { useSound } from '../context/SoundContext';
import { useTheme } from '../context/ThemeContext';
import {
    UserCircle, Save, Download, Upload, Trash2, LogOut,
    Volume2, VolumeX, BookOpen, Bug, Edit, Moon, Sun,
    Bell, BellOff, RotateCcw, Monitor, Globe, Shield, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import SyllabusImportModal from '../components/SyllabusImportModal';

export default function Settings() {
    const { user, logout } = useAuth();
    const { userProfile, updateProfile, resetData, exportData, importData } = useStudy();
    const { isMuted, toggleMute } = useSound();
    const { theme, toggleTheme } = useTheme();

    // Use refs for uncontrolled inputs - this prevents React state resets!
    const nameRef = useRef<HTMLInputElement>(null);
    const gradeRef = useRef<HTMLInputElement>(null);
    const [showSyllabusModal, setShowSyllabusModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Notification state
    const [notificationsEnabled, setNotificationsEnabled] = useState(
        'Notification' in window && Notification.permission === 'granted'
    );

    const handleSave = () => {
        const name = nameRef.current?.value.trim() || '';
        const grade = gradeRef.current?.value.trim() || '';

        if (!name) {
            alert('Please enter your name');
            return;
        }
        updateProfile({ name, grade });
        setIsEditing(false);
        alert('✅ Profile updated successfully!\n\nYou can update your profile anytime.');
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const jsonData = event.target?.result as string;
                    if (importData(jsonData)) {
                        alert('Data imported successfully!');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const handleResetTour = () => {
        if (confirm('Do you want to restart the welcome tour?')) {
            localStorage.removeItem('tracked_tour_completed');
            window.location.reload();
        }
    };

    const toggleNotifications = async () => {
        if (!('Notification' in window)) {
            alert('This browser does not support desktop notifications');
            return;
        }

        if (Notification.permission === 'granted') {
            // Technically we can't revoke permission via JS, but we can stop sending them
            // For now, we'll just toggle the UI state as a preference
            setNotificationsEnabled(!notificationsEnabled);
        } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            setNotificationsEnabled(permission === 'granted');
        } else {
            alert('Notifications are blocked. Please enable them in your browser settings.');
        }
    };

    return (
        <AnimatedPage className="max-w-2xl mx-auto space-y-8 pb-10">
            <div className="flex items-center gap-3 mb-2">
                <UserCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">Settings</h1>
            </div>

            {/* Profile Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors"
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        <UserCircle className="w-5 h-5 text-blue-500" />
                        Profile Information
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Student Name</label>
                            <input
                                ref={nameRef}
                                type="text"
                                defaultValue={userProfile?.name || ''}
                                disabled={!isEditing}
                                className={`w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 ${!isEditing ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50' : ''}`}
                                placeholder="Enter your name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Class / Grade</label>
                            <input
                                ref={gradeRef}
                                type="text"
                                defaultValue={userProfile?.grade || ''}
                                disabled={!isEditing}
                                className={`w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 ${!isEditing ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50' : ''}`}
                                placeholder="e.g. HSC 2026"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 text-sm"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Profile
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 text-sm shadow-sm"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </motion.section>

            {/* Appearance & Preferences */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors"
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-purple-500" />
                        Appearance & Preferences
                    </h2>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {/* Theme Toggle */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-orange-100 text-orange-600'}`}>
                                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className="text-slate-800 dark:text-white font-medium">App Theme</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark mode</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-200'}`}
                        >
                            <span className={`${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                        </button>
                    </div>

                    {/* Sound Toggle */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isMuted ? 'bg-slate-100 dark:bg-slate-700 text-slate-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className="text-slate-800 dark:text-white font-medium">Sound Effects</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Play sounds for timer and interactions</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleMute}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${!isMuted ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'}`}
                        >
                            <span className={`${!isMuted ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                        </button>
                    </div>

                    {/* Notifications */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${!notificationsEnabled ? 'bg-slate-100 dark:bg-slate-700 text-slate-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
                                {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className="text-slate-800 dark:text-white font-medium">Notifications</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Get reminders for study sessions</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleNotifications}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${notificationsEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'}`}
                        >
                            <span className={`${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                        </button>
                    </div>

                    {/* Language Placeholder */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                                <Globe className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-slate-800 dark:text-white font-medium">Language</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">App language preference</p>
                            </div>
                        </div>
                        <select className="bg-transparent border border-slate-200 dark:border-slate-600 rounded-lg text-sm px-2 py-1 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none">
                            <option>English</option>
                            <option disabled>Bengali (Coming Soon)</option>
                        </select>
                    </div>
                </div>
            </motion.section>

            {/* Data Management */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors"
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        <Save className="w-5 h-5 text-green-500" />
                        Data & Backup
                    </h2>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {/* Syllabus Import */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer" onClick={() => setShowSyllabusModal(true)}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-slate-800 dark:text-white font-medium">Import Syllabus Template</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Quickly add pre-made subject templates</p>
                            </div>
                        </div>
                        <button className="text-slate-400">
                            <Edit className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Import/Export */}
                    <div className="p-4 grid grid-cols-2 gap-4">
                        <button
                            onClick={exportData}
                            className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                        >
                            <Download className="w-4 h-4" />
                            Export Data
                        </button>
                        <button
                            onClick={handleImport}
                            className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                        >
                            <Upload className="w-4 h-4" />
                            Import Data
                        </button>
                    </div>

                    {/* Reset Data */}
                    <div className="p-4 bg-red-50/50 dark:bg-red-900/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                    <Trash2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-red-700 dark:text-red-400 font-medium">Reset Application</h3>
                                    <p className="text-xs text-red-600/70 dark:text-red-400/70">Permanently delete all study data</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    if (confirm('Are you absolutely sure? This cannot be undone.')) {
                                        resetData();
                                    }
                                }}
                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-xs shadow-sm"
                            >
                                Reset Data
                            </button>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Support & More */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors"
            >
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-gray-500" />
                        Support & Info
                    </h2>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {/* Reset Tour */}
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer" onClick={handleResetTour}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400">
                                <RotateCcw className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-slate-800 dark:text-white font-medium">Restart Welcome Tour</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Show the onboarding guide again</p>
                            </div>
                        </div>
                    </div>

                    {/* Report Bug */}
                    <a
                        href="https://github.com/shahnewajsrabon/Study-Mate/issues/new?title=Bug%3A%20&body=%23%23%20Bug%20Description"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                <Bug className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-slate-800 dark:text-white font-medium">Report a Bug</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Help us improve by reporting issues</p>
                            </div>
                        </div>
                    </a>

                    {/* WhatsApp Group */}
                    <a
                        href="https://chat.whatsapp.com/K9mUpCp6Moo4poVbW5zgfr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-slate-800 dark:text-white font-medium">Join WhatsApp Group</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Get help & discuss with community</p>
                            </div>
                        </div>
                    </a>

                    {/* App Version */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                        <p className="text-xs text-slate-400 font-medium">TrackEd v1.0.0 • Made with ❤️ for Students</p>
                    </div>
                </div>
            </motion.section>

            {/* Logout */}
            {user && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={logout}
                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </motion.button>
            )}

            <AnimatePresence>
                {showSyllabusModal && <SyllabusImportModal onClose={() => setShowSyllabusModal(false)} />}
            </AnimatePresence>
        </AnimatedPage>
    );
}
