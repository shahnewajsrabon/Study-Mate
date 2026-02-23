import type { Subject, ScheduledSession } from '../types/study';

export interface StudyPriority {
    subjectId: string;
    chapterId: string;
    topicId: string;
    score: number; // 0-100, higher is more urgent
    reason: string;
}

/**
 * AI Study Engine V3
 * Uses a weighted algorithm to prioritize study topics.
 * Weights:
 * - Proximity of Exam: 45%
 * - Chapter Incompletion: 30%
 * - Topic Complexity/Order: 15%
 * - Random Focus: 10%
 */
export function calculateStudyPriorities(subjects: Subject[]): StudyPriority[] {
    const priorities: StudyPriority[] = [];
    const now = new Date();

    subjects.forEach(subject => {
        // 1. Exam Proximity Score (0-45)
        let examScore = 0;
        if (subject.examDate) {
            const examDate = new Date(subject.examDate);
            const diffTime = examDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 0) examScore = 0; // Exam passed or today
            else if (diffDays <= 7) examScore = 45; // Critical (1 week)
            else if (diffDays <= 30) examScore = 30; // High (1 month)
            else if (diffDays <= 90) examScore = 15; // Moderate
            else examScore = 5; // Long term
        } else {
            examScore = 10; // Default weight if no exam date
        }

        subject.chapters.forEach(chapter => {
            if (chapter.isCompleted) return;

            // 2. Chapter Incompletion Score (0-30)
            const incompleteTopics = chapter.topics.filter(t => !t.isCompleted);
            if (incompleteTopics.length === 0) return;

            const chapterProgress = (chapter.topics.length - incompleteTopics.length) / chapter.topics.length;
            const completionScore = (1 - chapterProgress) * 30;

            incompleteTopics.forEach((topic, index) => {
                // 3. Topic Order Score (0-15)
                // Earlier topics in a chapter usually depend on each other
                const orderScore = (1 - (index / incompleteTopics.length)) * 15;

                // 4. Random Variation (0-10) - Keeps it dynamic
                const randomScore = Math.random() * 10;

                const finalScore = examScore + completionScore + orderScore + randomScore;

                // Determine Reason
                let reason = "Routine study";
                if (examScore >= 30) reason = "Exam approaching soon";
                else if (completionScore >= 20) reason = "High chapter workload";
                else if (orderScore >= 10) reason = "Foundational topic";

                priorities.push({
                    subjectId: subject.id,
                    chapterId: chapter.id,
                    topicId: topic.id,
                    score: finalScore,
                    reason
                });
            });
        });
    });

    // Return top 50 priorities sorted by score
    return priorities.sort((a, b) => b.score - a.score).slice(0, 50);
}

/**
 * Generates a smart schedule for a range of dates
 */
export function generateSmartPath(subjects: Subject[], days: number = 7): ScheduledSession[] {
    const priorities = calculateStudyPriorities(subjects);
    const path: ScheduledSession[] = [];
    const today = new Date();

    // Group by high score and distribute over days
    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        // Pick top items not already scheduled (this is simple, can be advanced further)
        const dailyItems = priorities.slice(i * 2, (i * 2) + 2);

        dailyItems.forEach((item, idx) => {
            path.push({
                id: crypto.randomUUID(),
                subjectId: item.subjectId,
                chapterId: item.chapterId,
                topicId: item.topicId,
                date: dateStr,
                time: idx === 0 ? "10:00" : "16:00",
                durationMinutes: 60,
                isCompleted: false,
                notes: `AI Recommended: ${item.reason}`
            });
        });
    }

    return path;
}
