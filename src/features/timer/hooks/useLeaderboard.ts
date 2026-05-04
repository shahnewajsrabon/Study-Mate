import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../shared/lib/firebase.ts';
import { useAuth } from '../../../shared/context/AuthContext.tsx';

export interface LeaderboardEntry {
    userId: string;
    userName: string;
    displayTime: number;
}

export type TimeRange = 'today' | 'week' | 'month' | 'all_time';

export function useLeaderboard(activeTab: 'timer' | 'leaderboard') {
    const { user } = useAuth();
    const [timeRange, setTimeRange] = useState<TimeRange>('today');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (!user) return;
            setLoadingLeaderboard(true);
            try {
                const usersRef = collection(db, 'users');
                let orderByField = 'userProfile.todayStudyTime';

                if (timeRange === 'week') orderByField = 'userProfile.weeklyStudyTime';
                else if (timeRange === 'month') orderByField = 'userProfile.monthlyStudyTime';
                else if (timeRange === 'all_time') orderByField = 'userProfile.totalStudyTime';

                const q = query(usersRef, orderBy(orderByField, 'desc'), limit(10));
                const querySnapshot = await getDocs(q);

                const entries: LeaderboardEntry[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.userProfile) {
                        let displayTime = 0;
                        if (timeRange === 'today') displayTime = data.userProfile.todayStudyTime || 0;
                        else if (timeRange === 'week') displayTime = data.userProfile.weeklyStudyTime || 0;
                        else if (timeRange === 'month') displayTime = data.userProfile.monthlyStudyTime || 0;
                        else displayTime = data.userProfile.totalStudyTime || 0;

                        entries.push({
                            userId: doc.id,
                            userName: data.userProfile.name || 'Anonymous',
                            displayTime
                        });
                    }
                });
                setLeaderboard(entries);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoadingLeaderboard(false);
            }
        };
        fetchLeaderboard();
    }, [user, activeTab, timeRange]);

    return {
        timeRange,
        setTimeRange,
        leaderboard,
        loadingLeaderboard
    };
}
