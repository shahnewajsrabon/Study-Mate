import { useState } from 'react';
import { useProfile } from '../../profile/hooks/useProfile.ts';
import { getLevelInfo } from '../../profile/utils/levelUtils.ts';
import { calculateStreak } from '../../study/utils/streakUtils.ts';
import type { StudySession } from '../../study/types/study.ts';

export function useAnalyticsLogic() {
    const { userProfile, updateProfile } = useProfile();
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [tempGoal, setTempGoal] = useState(userProfile ? userProfile.dailyGoal / 3600 : 4);

    if (!userProfile) return { userProfile: null };

    const { currentTitle } = getLevelInfo(userProfile.xp || 0);
    const history = userProfile.sessionHistory || [];
    const streak = calculateStreak(history);

    const sessions: StudySession[] = history.map((s, idx) => ({
        id: `session-${idx}`,
        startTime: s.date,
        endTime: new Date(new Date(s.date).getTime() + s.duration * 1000).toISOString(),
        duration: s.duration,
        subjectId: s.subjectId,
        topicId: s.topicId,
        goal: s.goal,
        mood: s.mood
    }));

    const totalMinutes = Math.round(history.reduce((acc: number, s: { duration: number }) => acc + s.duration, 0) / 60);

    // Calculate Subject Balance Score
    const subjectTimes: Record<string, number> = {};
    sessions.forEach(s => {
        if (s.subjectId) {
            subjectTimes[s.subjectId] = (subjectTimes[s.subjectId] || 0) + s.duration;
        }
    });
    const times = Object.values(subjectTimes);
    let balanceScore = 100;
    if (times.length > 1) {
        const maxTime = Math.max(...times);
        const minTime = Math.min(...times);
        balanceScore = maxTime > 0 ? Math.round(100 - ((maxTime - minTime) / maxTime * 100)) : 100;
    } else if (times.length === 1) {
        balanceScore = 10; // Poor balance if only 1 subject
    }

    // Study Pattern Insights (Most Productive Hour)
    const hourCounts = new Array(24).fill(0);
    sessions.forEach(s => {
        const hour = new Date(s.startTime).getHours();
        hourCounts[hour] += s.duration;
    });
    const maxDuration = Math.max(...hourCounts);
    const maxHour = hourCounts.indexOf(maxDuration);
    const mostProductiveHour = maxDuration > 0 
        ? `${maxHour.toString().padStart(2, '0')}:00 - ${(maxHour + 1).toString().padStart(2, '0')}:00`
        : 'N/A';

    const saveGoal = () => {
        updateProfile({ dailyGoal: tempGoal * 3600 });
        setIsEditingGoal(false);
    };

    return {
        userProfile,
        isEditingGoal,
        setIsEditingGoal,
        tempGoal,
        setTempGoal,
        currentTitle,
        streak,
        sessions,
        totalMinutes,
        saveGoal,
        balanceScore,
        mostProductiveHour
    };
}
