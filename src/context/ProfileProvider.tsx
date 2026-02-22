import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { db } from '../lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getLevelInfo } from '../utils/levelUtils';
import type { UserProfile } from '../types/study';
import { ProfileContext, type ProfileContextType } from './ProfileContextObject';

const initialProfile: UserProfile = {
    name: 'Student',
    grade: 'Class 10',
    language: 'en',
    totalStudyTime: 0,
    earnedBadges: [],
    currentStreak: 0,
    dailyGoal: 7200,
    todayStudyTime: 0,
    weeklyStudyTime: 0,
    monthlyStudyTime: 0,
    xp: 0,
    level: 1,
    role: 'student',
    scheduledSessions: [],
    majorExams: []
};

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const toast = useToast();
    const [userProfile, setUserProfile] = useState<UserProfile>(initialProfile);
    const [loading, setLoading] = useState(true);

    // Sync with Firestore
    useEffect(() => {
        if (!user) {
            queueMicrotask(() => {
                setLoading(prev => prev ? false : prev);
            });
            return;
        }

        const adminEmail = 'channel.data.transfer@gmail.com';
        const isTargetAdmin = user.email === adminEmail;

        const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data && data.userProfile) {
                    let mergedProfile = data.userProfile as UserProfile;

                    // Admin enforcement logic
                    if (isTargetAdmin && mergedProfile.role !== 'admin') {
                        mergedProfile = { ...mergedProfile, role: 'admin' };
                    } else if (!isTargetAdmin && mergedProfile.role === 'admin') {
                        mergedProfile = { ...mergedProfile, role: 'student' };
                        updateDoc(doc(db, 'users', user.uid), { 'userProfile.role': 'student' });
                    }

                    setUserProfile(mergedProfile);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
        setUserProfile((prev: UserProfile) => {
            const newProfile = { ...prev, ...updates };
            if (user) {
                updateDoc(doc(db, 'users', user.uid), { userProfile: newProfile });
            }
            return newProfile;
        });
    }, [user]);

    const addXP = useCallback((amount: number) => {
        setUserProfile((prev: UserProfile) => {
            const newXP = prev.xp + amount;
            const { currentLevel: oldLevel } = getLevelInfo(prev.xp);
            const { currentLevel: newLevel, currentTitle } = getLevelInfo(newXP);

            const newProfile = { ...prev, xp: newXP, level: newLevel };

            if (newLevel > oldLevel) {
                toast.success(`🎉 Level Up! You are now a ${currentTitle}!`);
            }

            if (user) {
                updateDoc(doc(db, 'users', user.uid), { 'userProfile.xp': newXP, 'userProfile.level': newLevel });
            }

            return newProfile;
        });
    }, [user, toast]);

    const isAdmin = userProfile.role === 'admin';

    const value: ProfileContextType = {
        userProfile,
        updateProfile,
        addXP,
        isAdmin,
        loading
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
}
