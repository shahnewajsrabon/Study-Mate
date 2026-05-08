import { useRef, useState } from 'react';
import { useAuth } from '../shared/context/AuthContext.tsx';
import { useStudy } from '../features/study/hooks/useStudy.ts';
import { useProfile } from '../features/profile/hooks/useProfile.ts';
import { useSocial } from '../features/social/hooks/useSocial.ts';
import { useSound } from '../shared/context/SoundContext.tsx';
import { useTheme } from '../shared/context/ThemeContext.tsx';
import ReviewBox from '../features/social/components/ReviewBox.tsx';
import {
    UserCircle, Save, Download, Upload, LogOut,
    Volume2, VolumeX, Moon, Sun,
    Bell, BellOff, Monitor, Globe, Loader2,
    Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../shared/components/ui/AnimatedPage.tsx';
import SyllabusImportModal from '../features/study/components/SyllabusImportModal.tsx';

import { useToast } from '../shared/context/ToastContext.tsx';

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
        <AnimatedPage className="max-w-3xl mx-auto space-y-12 pb-20">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-sage-50 dark:bg-sage-900/20 flex items-center justify-center text-sage-500">
                    <UserCircle className="w-6 h-6" />
                </div>
                <h1 className="text-4xl font-serif font-bold text-charcoal dark:text-white tracking-tight">Settings</h1>
            </div>

            {/* Danger Zone Logic */}
            {isDeletingUser && (
                <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                    <div className="zen-card p-12 max-w-sm w-full text-center">
                        <Loader2 className="w-12 h-12 text-sage-500 animate-spin mx-auto mb-6" />
                        <h2 className="text-2xl font-serif font-bold text-charcoal dark:text-white mb-4">Deleting Account</h2>
                        <p className="text-slate-400 text-sm font-medium">Please wait while we gently remove your presence from our servers...</p>
                    </div>
                </div>
            )}

            {/* Profile Section */}
            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="zen-card overflow-hidden"
            >
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="text-xl font-serif font-bold text-charcoal dark:text-white flex items-center gap-3">
                        <UserCircle className="w-5 h-5 text-sage-500" />
                        Profile Information
                    </h2>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-xs font-bold text-sage-600 uppercase tracking-widest hover:underline"
                        >
                            Modify
                        </button>
                    )}
                </div>
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Display Name</label>
                            <input
                                ref={nameRef}
                                type="text"
                                defaultValue={userProfile?.name || ''}
                                disabled={!isEditing}
                                className={`w-full bg-transparent border-b-2 border-slate-50 dark:border-slate-800 py-3 text-lg font-serif text-charcoal dark:text-white focus:outline-none focus:border-sage-500 transition-all ${!isEditing ? 'opacity-40' : ''}`}
                                placeholder="Your Name"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Academic Year</label>
                            <input
                                ref={gradeRef}
                                type="text"
                                defaultValue={userProfile?.grade || ''}
                                disabled={!isEditing}
                                className={`w-full bg-transparent border-b-2 border-slate-50 dark:border-slate-800 py-3 text-lg font-serif text-charcoal dark:text-white focus:outline-none focus:border-sage-500 transition-all ${!isEditing ? 'opacity-40' : ''}`}
                                placeholder="e.g. HSC 2026"
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <div className="pt-4 flex gap-4">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex-1 px-6 py-4 bg-slate-50 dark:bg-slate-800 text-slate-400 font-bold rounded-2xl text-xs uppercase tracking-widest hover:text-charcoal transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-2 px-8 py-4 bg-sage-600 hover:bg-sage-700 text-white font-bold rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-sage-500/10"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>
            </motion.section>

            {/* Appearance & Preferences */}
            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="zen-card overflow-hidden"
            >
                <div className="p-8 border-b border-slate-50 dark:border-slate-800">
                    <h2 className="text-xl font-serif font-bold text-charcoal dark:text-white flex items-center gap-3">
                        <Monitor className="w-5 h-5 text-sage-500" />
                        Preferences
                    </h2>
                </div>
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {[
                        { 
                            id: 'theme', 
                            icon: theme === 'dark' ? Moon : Sun, 
                            title: 'Visual Mode', 
                            desc: 'Choose between light and dark atmosphere', 
                            action: toggleTheme, 
                            active: theme === 'dark' 
                        },
                        { 
                            id: 'sound', 
                            icon: isMuted ? VolumeX : Volume2, 
                            title: 'Audio Feedback', 
                            desc: 'Ambient sounds and notification alerts', 
                            action: toggleMute, 
                            active: !isMuted 
                        },
                        { 
                            id: 'notifications', 
                            icon: notificationsEnabled ? Bell : BellOff, 
                            title: 'Deep Focus Alerts', 
                            desc: 'Smart reminders for your study path', 
                            action: toggleNotifications, 
                            active: notificationsEnabled 
                        },
                    ].map((pref) => (
                        <div key={pref.id} className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-bone dark:bg-slate-800 rounded-2xl text-slate-400">
                                    <pref.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-charcoal dark:text-white font-bold text-sm tracking-tight">{pref.title}</h3>
                                    <p className="text-xs text-slate-400 font-medium">{pref.desc}</p>
                                </div>
                            </div>
                            <button
                                onClick={pref.action}
                                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all silky-transition ${pref.active ? 'bg-sage-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                            >
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-all ${pref.active ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    ))}

                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-bone dark:bg-slate-800 rounded-2xl text-slate-400">
                                <Globe className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-charcoal dark:text-white font-bold text-sm tracking-tight">Interface Language</h3>
                                <p className="text-xs text-slate-400 font-medium">Localized experience</p>
                            </div>
                        </div>
                        <select
                            className="bg-transparent text-xs font-bold text-sage-600 uppercase tracking-widest outline-none"
                            aria-label="Language selection"
                        >
                            <option>English</option>
                            <option disabled>Bengali</option>
                        </select>
                    </div>
                </div>
            </motion.section>

            {/* Data Management */}
            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="zen-card overflow-hidden"
            >
                <div className="p-8 border-b border-slate-50 dark:border-slate-800">
                    <h2 className="text-xl font-serif font-bold text-charcoal dark:text-white flex items-center gap-3">
                        <Save className="w-5 h-5 text-sage-500" />
                        Archiving & Import
                    </h2>
                </div>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={exportData}
                            className="flex items-center justify-center gap-3 py-4 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-charcoal dark:hover:text-white transition-all"
                        >
                            <Download className="w-4 h-4" />
                            Export Archive
                        </button>
                        <button
                            onClick={handleImport}
                            className="flex items-center justify-center gap-3 py-4 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-charcoal dark:hover:text-white transition-all"
                        >
                            <Upload className="w-4 h-4" />
                            Import Session
                        </button>
                    </div>
                    
                    <button
                        onClick={() => setShowSyllabusModal(true)}
                        className="w-full py-4 bg-sage-50 dark:bg-sage-900/10 text-sage-600 text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-sage-100 transition-all"
                    >
                        Load Syllabus Template
                    </button>
                </div>
            </motion.section>

            {/* Community & Wall of Love */}
            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="zen-card p-10 flex flex-col items-center text-center space-y-6"
            >
                <div className="w-16 h-16 rounded-3xl bg-sage-50 dark:bg-sage-900/20 flex items-center justify-center text-sage-500 mb-2">
                    <Star className="w-8 h-8 fill-current" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-serif font-bold text-charcoal dark:text-white">Wall of Love</h2>
                    <p className="text-slate-400 text-sm font-medium max-w-sm">
                        Sharing your journey helps other students find their focus. Join our community of mindful learners.
                    </p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full pt-4">
                    <button
                        onClick={() => setShowReviewModal(true)}
                        className="flex-1 py-4 bg-charcoal text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-black/10"
                    >
                        Leave a Review
                    </button>
                    <a
                        href="https://chat.whatsapp.com/K9mUpCp6Moo4poVbW5zgfr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-4 border-2 border-sage-500 text-sage-600 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-sage-50 transition-all text-center"
                    >
                        Join Community
                    </a>
                </div>
            </motion.section>

            {/* Danger Zone */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="pt-12 space-y-8"
            >
                <div className="flex flex-col items-center gap-6">
                    <button
                        onClick={logout}
                        className="text-xs font-bold uppercase tracking-[0.3em] text-slate-300 hover:text-red-500 transition-all flex items-center gap-3"
                    >
                        <LogOut className="w-4 h-4" />
                        Terminate Session
                    </button>
                    
                    <div className="w-full p-10 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-900/30 text-center space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-xl font-serif font-bold text-charcoal dark:text-white">Danger Zone</h3>
                            <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto">
                                Permanent removal of all study metrics, archives, and social ties. This process is irreversible.
                            </p>
                        </div>
                        <button
                            onClick={handleDeleteAccount}
                            className="px-8 py-3 bg-transparent border border-red-200 text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all"
                        >
                            Erase All Data
                        </button>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-200 uppercase tracking-[0.4em]">TrackEd v1.0.0 • Mindful Learning</p>
                </div>
            </motion.div>

            <AnimatePresence>
                {showSyllabusModal && <SyllabusImportModal onClose={() => setShowSyllabusModal(false)} />}
                {showReviewModal && <ReviewBox onClose={() => setShowReviewModal(false)} />}
            </AnimatePresence>
        </AnimatedPage>
    );
}
