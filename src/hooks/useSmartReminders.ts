import { useEffect } from 'react';
import { useStudy } from '../context/StudyContext';

export function useSmartReminders() {
    const { userProfile } = useStudy();

    useEffect(() => {
        // 1. Request Permission on Mount
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // 2. Check for Inactivity (Run once on mount/profile load)
        const checkInactivity = () => {
            if (!('Notification' in window) || Notification.permission !== 'granted') return;

            const lastStudy = userProfile.lastStudyDate ? new Date(userProfile.lastStudyDate) : null;
            if (!lastStudy) return;

            const now = new Date();
            const diffTime = Math.abs(now.getTime() - lastStudy.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // If haven't studied for 3+ days
            if (diffDays >= 3) {
                // Check if we already notified recently to avoid spam (using localStorage)
                const lastNotified = localStorage.getItem('tracked_last_reminder');
                const lastNotifiedDate = lastNotified ? new Date(lastNotified) : null;
                const hoursSinceNotification = lastNotifiedDate
                    ? (now.getTime() - lastNotifiedDate.getTime()) / (1000 * 60 * 60)
                    : 999;

                if (hoursSinceNotification > 24) {
                    new Notification("Miss you! 📚", {
                        body: `It's been ${diffDays} days since your last study session. Keep your streak alive!`,
                        icon: '/pwa-icon.svg', // Assuming we have this, or fallback
                        tag: 'inactivity-reminder'
                    });
                    localStorage.setItem('tracked_last_reminder', now.toISOString());
                }
            }
        };

        // 3. Goal Reminders (Check if close to daily goal)
        const checkGoals = () => {
            if (!('Notification' in window) || Notification.permission !== 'granted') return;

            const goal = userProfile.dailyGoal || 7200; // 2 hours
            const progress = userProfile.todayStudyTime || 0;
            const remaining = goal - progress;

            // If less than 30 mins remaining and not done yet
            if (remaining > 0 && remaining <= 1800) {
                const lastGoalNotified = localStorage.getItem('tracked_goal_reminder');
                // Only notify once per day for this
                const today = new Date().toISOString().split('T')[0];

                if (lastGoalNotified !== today) {
                    new Notification("Almost there! 🎯", {
                        body: "You're less than 30 minutes away from your daily goal. Finish strong!",
                        icon: '/pwa-icon.svg',
                        tag: 'goal-reminder'
                    });
                    localStorage.setItem('tracked_goal_reminder', today);
                }
            }
        };

        const timer = setTimeout(() => {
            checkInactivity();
            checkGoals();
        }, 5000); // Check 5 seconds after mount to not slow down initial render

        return () => clearTimeout(timer);
    }, [userProfile.lastStudyDate, userProfile.todayStudyTime, userProfile.dailyGoal]);
}
