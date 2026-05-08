import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext.tsx';
import { useToast } from '../../../shared/context/ToastContext.tsx';
import { supabase } from '../../../shared/lib/supabase.ts';
import { getLevelInfo } from '../utils/levelUtils.ts';
import type { UserProfile } from '../../study/types/study.ts';
import { ProfileContext, type ProfileContextType } from './ProfileContextObject.tsx';

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

    // Sync with Supabase
    useEffect(() => {
        if (!user) {
            queueMicrotask(() => {
                setLoading(prev => prev ? false : prev);
            });
            return;
        }

        const fetchProfile = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('user_profile')
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.error("Error fetching profile:", error);
                }

                if (data && data.user_profile && Object.keys(data.user_profile).length > 0) {
                    setUserProfile(data.user_profile as UserProfile);
                } else if (!data) {
                    // Profile doesn't exist yet, create one
                    const newProfileData = { ...initialProfile, name: user.user_metadata?.full_name || 'Student' };
                    await supabase.from('profiles').insert([
                        { id: user.id, user_profile: newProfileData }
                    ]);
                    setUserProfile(newProfileData);
                }
            } catch (err) {
                console.error("Fetch profile exception:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();

        // Subscribe to real-time updates
        const subscription = supabase
            .channel('profiles-channel')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, payload => {
                if (payload.new && payload.new.user_profile) {
                    setUserProfile(payload.new.user_profile as UserProfile);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user]);

    const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
        setUserProfile((prev: UserProfile) => {
            const newProfile = { ...prev, ...updates };
            if (user) {
                supabase
                    .from('profiles')
                    .update({ user_profile: newProfile })
                    .eq('id', user.id)
                    .then(({ error }) => {
                        if (error) console.error("Error updating profile:", error);
                    });
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
                supabase
                    .from('profiles')
                    .update({ user_profile: newProfile })
                    .eq('id', user.id)
                    .then(({ error }) => {
                        if (error) console.error("Error updating XP:", error);
                    });
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
