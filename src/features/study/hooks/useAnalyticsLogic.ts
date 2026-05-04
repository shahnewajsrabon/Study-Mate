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
        saveGoal
    };
}
