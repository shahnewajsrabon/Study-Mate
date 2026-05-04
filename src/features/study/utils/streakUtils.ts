import { isSameDay, subDays } from 'date-fns';

export function calculateStreak(sessions: { date: string }[]) {
    if (!sessions || sessions.length === 0) return 0;

    // Get unique dates sorted descending
    const uniqueDates = Array.from(new Set(sessions.map(s => new Date(s.date).toDateString())))
        .map(d => new Date(d))
        .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    let checkDate = new Date();

    // If the latest session is not today and not yesterday, streak is 0
    const latestSession = uniqueDates[0];
    const isToday = isSameDay(latestSession, checkDate);
    const isYesterday = isSameDay(latestSession, subDays(checkDate, 1));

    if (!isToday && !isYesterday) {
        return 0;
    }

    // Start checking from the most recent date in history
    checkDate = latestSession;

    for (let i = 0; i < uniqueDates.length; i++) {
        if (isSameDay(uniqueDates[i], checkDate)) {
            streak++;
            checkDate = subDays(checkDate, 1);
        } else {
            break;
        }
    }

    return streak;
}
