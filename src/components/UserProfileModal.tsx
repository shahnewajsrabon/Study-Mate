import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { X, Trophy, Flame, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserProfile, BadgeType } from '../context/StudyContext';

interface UserProfileModalProps {
    uid: string;
    isOpen: boolean;
    onClose: () => void;
}

// Badge Icons Map (reusing logic or icons)
const BADGE_ICONS: Record<BadgeType, string> = {
    'start_strong': '🚀',
    'streak_master': '🔥',
    'subject_conqueror': '📚',
    'night_owl': '🦉'
};

const BADGE_NAMES: Record<BadgeType, string> = {
    'start_strong': 'Fast Starter',
    'streak_master': 'Streak Master',
    'subject_conqueror': 'Subject Conqueror',
    'night_owl': 'Night Owl'
};

export default function UserProfileModal({ uid, isOpen, onClose }: UserProfileModalProps) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && uid) {
            const fetchProfile = async () => {
                setLoading(true);
                try {
                    const docRef = doc(db, 'users', uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setProfile(docSnap.data().userProfile as UserProfile);
                    } else {
                        // Handle user not found or no profile
                        setProfile(null);
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchProfile();
        } else {
            setProfile(null);
        }
    }, [isOpen, uid]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700"
                        >
                            {/* Header */}
                            <div className="relative h-24 bg-gradient-to-r from-indigo-500 to-purple-600">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-1 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                <div className="absolute -bottom-10 left-6">
                                    <div className="w-20 h-20 rounded-full bg-white dark:bg-slate-800 p-1 shadow-lg">
                                        <div className="w-full h-full rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                                            {profile?.name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="pt-12 pb-6 px-6">
                                {loading ? (
                                    <div className="flex justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : profile ? (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                {profile.name}
                                                <span className="text-xs font-normal px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-full">
                                                    {profile.grade}
                                                </span>
                                            </h2>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl border border-orange-100 dark:border-orange-800/50">
                                                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1">
                                                    <Flame className="w-4 h-4" />
                                                    <span className="text-xs font-bold uppercase">Streak</span>
                                                </div>
                                                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                                    {profile.currentStreak} Days
                                                </p>
                                            </div>

                                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800/50">
                                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="text-xs font-bold uppercase">Total Study</span>
                                                </div>
                                                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                                    {Math.floor(profile.totalStudyTime / 3600)}h {Math.floor((profile.totalStudyTime % 3600) / 60)}m
                                                </p>
                                            </div>
                                        </div>

                                        {/* Badges */}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-2">
                                                <Trophy className="w-4 h-4" />
                                                Badges Earned ({profile.earnedBadges?.length || 0})
                                            </h3>

                                            {profile.earnedBadges && profile.earnedBadges.length > 0 ? (
                                                <div className="grid grid-cols-4 gap-2">
                                                    {profile.earnedBadges.map((badge, idx) => (
                                                        <div key={idx} className="flex flex-col items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700" title={BADGE_NAMES[badge.type]}>
                                                            <span className="text-2xl">{BADGE_ICONS[badge.type]}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">No badges earned yet.</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-500">
                                        User profile not found.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
