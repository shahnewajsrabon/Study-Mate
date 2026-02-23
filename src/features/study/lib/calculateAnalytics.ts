import type { Subject, Chapter, Topic } from '../types/study';

export function calculateOverallStats(subjects: Subject[]) {
    let totalChapters = 0;
    let completedChapters = 0;
    let totalTopics = 0;
    let completedTopics = 0;

    subjects.forEach(sub => {
        totalChapters += sub.chapters.length;
        sub.chapters.forEach(ch => {
            if (ch.isCompleted) completedChapters++;

            if (ch.topics) {
                totalTopics += ch.topics.length;
                ch.topics.forEach(t => {
                    if (t.isCompleted) completedTopics++;
                });
            }
        });
    });

    return { totalChapters, completedChapters, totalTopics, completedTopics };
}

export interface ActivityPoint {
    date: string;
    count: number;
}

export function calculateActivityData(subjects: Subject[]): { activityData: ActivityPoint[], maxCount: number } {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });

    const activityData: ActivityPoint[] = last7Days.map(date => {
        let count = 0;
        subjects.forEach(sub => {
            sub.chapters.forEach((ch: Chapter) => {
                if (ch.topics) {
                    ch.topics.forEach((t: Topic) => {
                        if (t.isCompleted && t.completedAt && t.completedAt.startsWith(date)) {
                            count++;
                        }
                    });
                }
            });
        });
        return { date, count };
    });

    const maxCount = Math.max(...activityData.map(d => d.count), 1);
    return { activityData, maxCount };
}

export function calculateStreak(subjects: Subject[]) {
    const activeDates = new Set<string>();
    subjects.forEach(sub => sub.chapters.forEach((ch: Chapter) => ch.topics?.forEach((t: Topic) => {
        if (t.isCompleted && t.completedAt) activeDates.add(t.completedAt.split('T')[0]);
    })));

    const sortedDates = Array.from(activeDates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let streak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yester = new Date();
    yester.setDate(yester.getDate() - 1);
    const yesterStr = yester.toISOString().split('T')[0];

    if (sortedDates.length > 0) {
        const mostRecentStr = sortedDates[0];
        if (mostRecentStr === todayStr || mostRecentStr === yesterStr) {
            streak = 1;
            let prevDate = new Date(mostRecentStr);
            for (let i = 1; i < sortedDates.length; i++) {
                const curr = new Date(sortedDates[i]);
                const dTime = Math.abs(prevDate.getTime() - curr.getTime());
                const dDays = Math.round(dTime / (1000 * 60 * 60 * 24));

                if (dDays === 1) {
                    streak++;
                    prevDate = curr;
                } else {
                    break;
                }
            }
        }
    }
    return streak;
}
