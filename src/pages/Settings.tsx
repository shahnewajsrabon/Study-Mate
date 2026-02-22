import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../hooks/useStudy';
import { useProfile } from '../hooks/useProfile';
import { useSocial } from '../hooks/useSocial';
import { useSound } from '../context/SoundContext';
import { useTheme } from '../context/ThemeContext';
import ReviewBox from '../components/ReviewBox';
import {
    UserCircle, Save, Download, Upload, Trash2, LogOut,
    Volume2, VolumeX, BookOpen, Bug, Edit, Moon, Sun,
    Bell, BellOff, RotateCcw, Monitor, Globe, Shield, MessageCircle, AlertTriangle, Loader2,
    Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import SyllabusImportModal from '../components/SyllabusImportModal';

import { useToast } from '../context/ToastContext';

export default function Settings() {
    const { user, logout } = useAuth();
    const { resetData, exportData, importData } = useStudy();
    const { userProfile, updateProfile } = useProfile();
    const { isMuted, toggleMute } = useSound();
    const { theme, toggleTheme } = useTheme();
    const { deleteUserAuth } = useAuth();
    const { cleanupUserSocialData } = useSocial();

    // Use refs for uncontrolled inputs - this prevents React state resets!
    const nameRef = useRef<HTMLInputElement>(null);
    const gradeRef = useRef<HTMLInputElement>(null);
    const [showSyllabusModal, setShowSyllabusModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeletingUser, setIsDeletingUser] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);

    // Notification state
    const [notificationsEnabled, setNotificationsEnabled] = useState(
        'Notification' in window && Notification.permission === 'granted'
    );

    const toast = useToast();

    const { permanentlyDeleteAllUserData } = useStudy();

    const handleDeleteAccount = async () => {
        if (!confirm('⚠️ WARNING: This will permanently delete your account and all your study data. This cannot be undone.')) return;

        const secondConfirm = prompt('To confirm deletion, please type "DELETE" below:');
        if (secondConfirm !== 'DELETE') {
            toast.error('Deletion cancelled. Confirmation text did not match.');
            return;
        }

        setIsDeletingUser(true);
        try {
            // 1. Cleanup social data (remove from groups/challenges)
            await cleanupUserSocialData();
            // 2. Clear all study data from Firestore
            await permanentlyDeleteAllUserData();
            // 3. Finally delete the auth user
            await deleteUserAuth();

            toast.success('Your account has been deleted. We are sorry to see you go!');
        } catch (error) {
            console.error("Account deletion failed:", error);
            toast.error('Failed to delete account. You might need to sign out and in again to perform this sensitive action.');
            setIsDeletingUser(false);
        }
    };

    const handleSave = () => {
        const name = nameRef.current?.value.trim() || '';
        const grade = gradeRef.current?.value.trim() || '';

        if (!name) {
            toast.error('Please enter your name');
            return;
        }
        updateProfile({ name, grade });
        setIsEditing(false);
        toast.success('Profile updated successfully!');
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
                    importData(jsonData).then(success => {
                        if (success) {
                            alert('Data imported successfully!');
                        }
                    });
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

            {/* Danger Zone Logic */}
            {isDeletingUser && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-200 dark:border-slate-700">
                        <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Deleting Account</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Please wait while we permanently remove your data across all services...</p>
                    </div>
                </div>
            )}

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
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
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
                            title={isMuted ? "Unmute sounds" : "Mute sounds"}
                            aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
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
                            title={notificationsEnabled ? "Disable notifications" : "Enable notifications"}
                            aria-label={notificationsEnabled ? "Disable notifications" : "Enable notifications"}
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
                        <select
                            aria-label="Select app language"
                            title="Select app language"
                            className="bg-transparent border border-slate-200 dark:border-slate-600 rounded-lg text-sm px-2 py-1 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
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
                        <button
                            className="text-slate-400"
                            title="Import Syllabus Template"
                            aria-label="Import Syllabus Template"
                        >
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
                        href="https://chat.whatsapp.com/K9mUpCp6Moo4poVbW5zgfr"
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
                                <p className="text-xs text-slate-500 dark:text-slate-400">Report issues via our WhatsApp group</p>
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
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center rounded-2xl">
                        <p className="text-xs text-slate-400 font-medium">TrackEd v1.0.0 • Made with ❤️ for Students</p>
                    </div>
                </div>
            </motion.section>

            {/* User Review Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-2xl text-amber-600 dark:text-amber-400">
                        <Star className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white transition-colors">Wall of Love</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Help us improve by sharing your feedback</p>
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-100 dark:border-amber-900/30">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1 space-y-2">
                            <h3 className="font-bold text-amber-900 dark:text-amber-400">Enjoying TrackEd?</h3>
                            <p className="text-sm text-amber-800/70 dark:text-amber-400/70">
                                Your reviews help other students find the perfect study companion and keep us motivated to build better features.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowReviewModal(true)}
                            className="w-full md:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            <Star className="w-4 h-4 fill-current" />
                            Leave a Review
                        </button>
                    </div>
                </div>
            </motion.section>

            {/* Logout & Danger Zone */}
            <div className="space-y-4">
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

                {user && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="p-6 rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/5"
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-red-800 dark:text-red-400 font-bold">Danger Zone</h3>
                                <p className="text-sm text-red-700/70 dark:text-red-400/60 mb-4">
                                    Once you delete your account, there is no going back. All your study progress, sessions, and social connections will be wiped clean.
                                </p>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete My Account
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <AnimatePresence>
                {showSyllabusModal && <SyllabusImportModal onClose={() => setShowSyllabusModal(false)} />}
                {showReviewModal && <ReviewBox onClose={() => setShowReviewModal(false)} />}
            </AnimatePresence>
        </AnimatedPage>
    );
}
