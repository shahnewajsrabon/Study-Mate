export type BadgeType = 'start_strong' | 'streak_master' | 'subject_conqueror' | 'night_owl';

export type BadgeEntry = {
    type: BadgeType;
    earnedAt: string;
};

export type Topic = {
    id: string;
    name: string;
    isCompleted: boolean;
    completedAt?: string | null;
};

export type Chapter = {
    id: string;
    name: string;
    isCompleted: boolean;
    completedAt?: string | null;
    topics: Topic[];
};

export type ScheduledSession = {
    id: string;
    subjectId: string;
    date: string;
    time?: string;
    durationMinutes: number;
    chapterId?: string;
    topicId?: string;
    notes?: string;
    isCompleted: boolean;
    reminderSent?: boolean;
};

export type MajorExam = {
    id: string;
    name: string;
    date: string;
    color: string;
};

export type Subject = {
    id: string;
    name: string;
    color: string;
    icon?: string;
    chapters: Chapter[];
    examDate?: string;
};

export type UserProfile = {
    name: string;
    grade: string;
    language: 'en' | 'bn';
    totalStudyTime: number;
    earnedBadges: BadgeEntry[];
    lastStudyDate?: string;
    currentStreak: number;
    dailyGoal: number;
    todayStudyTime: number;
    weeklyStudyTime: number;
    monthlyStudyTime: number;
    syllabusCompletionPercentage?: number;
    xp: number;
    level: number;
    role: 'student' | 'admin';
    scheduledSessions?: ScheduledSession[];
    majorExams?: MajorExam[];
};
