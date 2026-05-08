export type BadgeType = 'start_strong' | 'streak_master' | 'subject_conqueror' | 'night_owl';

export type BadgeEntry = {
    type: BadgeType;
    earnedAt: string;
};

export type ExternalLink = {
    id: string;
    title: string;
    url: string;
    type: 'youtube' | 'article' | 'wikipedia' | 'other';
};

export type MoodType = 'great' | 'good' | 'okay' | 'tired' | 'stressed';

export type Topic = {
    id: string;
    name: string;
    isCompleted: boolean;
    completedAt?: string | null;
    notes?: string;
    links?: ExternalLink[];
    confidence?: 1 | 2 | 3 | 4 | 5;
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
    userId?: string;
    name: string;
    color: string;
    icon?: string;
    chapters: Chapter[];
    stats?: Record<string, number>;
    examDate?: string;
    createdAt?: string;
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
    sessionHistory?: {
        date: string;
        duration: number;
        subjectId?: string;
        topicId?: string;
        goal?: string;
        mood?: MoodType;
    }[];
};

export type Flashcard = {
    id: string;
    question: string;
    answer: string;
    isMastered: boolean;
    lastReviewed?: string;
    // SRS Data (SM-2 Algorithm)
    interval: number;      // Days until next review
    easeFactor: number;    // Multiplier for interval (default 2.5)
    reps: number;          // Number of successful consecutive reviews
    nextReview: string;    // ISO Date string
};

export type FlashcardSet = {
    id: string;
    userId?: string;
    subjectId: string;
    chapterId?: string;
    title: string;
    description?: string;
    cards: Flashcard[];
    createdAt?: string;
};
export type StudySession = {
    id: string;
    startTime: string;
    endTime: string;
    duration: number;
    subjectId?: string;
    topicId?: string;
    goal?: string;
    mood?: MoodType;
};
