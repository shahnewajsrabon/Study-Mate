import { useState, useEffect } from 'react';
import { supabase } from '../../../shared/lib/supabase.ts';
import { useAuth } from '../../../shared/context/AuthContext.tsx';
import type { DatabaseProfile } from '../../../shared/types/database.ts';
import type { UserProfile } from '../../study/types/study.ts';

export interface LeaderboardEntry {
    userId: string;
    userName: string;
    displayTime: number;
}

export type TimeRange = 'today' | 'week' | 'month' | 'all_time';

export function useLeaderboard(activeTab: 'timer' | 'leaderboard', filterMemberIds?: string[]) {
    const { user } = useAuth();
    const [timeRange, setTimeRange] = useState<TimeRange>('today');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

    // Deep compare filterMemberIds to avoid unnecessary refetches
    const filterMemberIdsStr = filterMemberIds?.join(',');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (!user) return;
            setLoadingLeaderboard(true);
            try {
                const entries: LeaderboardEntry[] = [];
                
                if (filterMemberIdsStr !== undefined) {
                    const memberIds = filterMemberIdsStr ? filterMemberIdsStr.split(',') : [];
                    if (memberIds.length === 0) {
                        setLeaderboard([]);
                        setLoadingLeaderboard(false);
                        return;
                    }
                    
                    // Fetch specific members
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('id, user_profile')
                        .in('id', memberIds);

                    if (error) throw error;
                    
                    (data as DatabaseProfile[] | null)?.forEach((docSnap) => {
                        if (docSnap.user_profile) {
                            let displayTime = 0;
                            const profile = docSnap.user_profile as UserProfile;
                            if (timeRange === 'today') displayTime = profile.todayStudyTime || 0;
                            else if (timeRange === 'week') displayTime = profile.weeklyStudyTime || 0;
                            else if (timeRange === 'month') displayTime = profile.monthlyStudyTime || 0;
                            else displayTime = profile.totalStudyTime || 0;
    
                            entries.push({
                                userId: docSnap.id,
                                userName: profile.name || 'Anonymous',
                                displayTime
                            });
                        }
                    });
                    
                    // Sort descending
                    entries.sort((a, b) => b.displayTime - a.displayTime);
                    setLeaderboard(entries);
                } else {
                    // Fetch global top 10
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('id, user_profile')
                        .limit(100);

                    if (error) throw error;

                    (data as DatabaseProfile[] | null)?.forEach((docSnap) => {
                        if (docSnap.user_profile) {
                            let displayTime = 0;
                            const profile = docSnap.user_profile as UserProfile;
                            if (timeRange === 'today') displayTime = profile.todayStudyTime || 0;
                            else if (timeRange === 'week') displayTime = profile.weeklyStudyTime || 0;
                            else if (timeRange === 'month') displayTime = profile.monthlyStudyTime || 0;
                            else displayTime = profile.totalStudyTime || 0;
    
                            entries.push({
                                userId: docSnap.id,
                                userName: profile.name || 'Anonymous',
                                displayTime
                            });
                        }
                    });

                    // Sort descending
                    entries.sort((a, b) => b.displayTime - a.displayTime);
                    setLeaderboard(entries.slice(0, 10)); // Take top 10
                }
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoadingLeaderboard(false);
            }
        };
        fetchLeaderboard();
    }, [user, activeTab, timeRange, filterMemberIdsStr]);

    return {
        timeRange,
        setTimeRange,
        leaderboard,
        loadingLeaderboard
    };
}
