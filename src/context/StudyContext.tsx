import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { db } from '../lib/firebase';
import { SYLLABUS_TEMPLATES, type TemplateSubject } from '../data/syllabusTemplates';
import { doc, onSnapshot, setDoc, collection, addDoc, updateDoc } from 'firebase/firestore';
import { getLevelInfo } from '../utils/levelUtils';

// --- Types ---
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
};

interface StudyContextType {
    userProfile: UserProfile;
    subjects: Subject[];
    isAdmin: boolean;
    updateProfile: (profile: Partial<UserProfile>) => void;
    addSubject: (subject: Omit<Subject, 'id' | 'chapters'>) => void;
    editSubject: (id: string, updates: Partial<Subject>) => void;
    deleteSubject: (id: string) => void;
    addChapter: (subjectId: string, chapterName: string) => void;
    editChapter: (subjectId: string, chapterId: string, newName: string) => void;
    toggleChapter: (subjectId: string, chapterId: string) => void;
    deleteChapter: (subjectId: string, chapterId: string) => void;
    addTopic: (subjectId: string, chapterId: string, topicName: string) => void;
    editTopic: (subjectId: string, chapterId: string, topicId: string, newName: string) => void;
    toggleTopic: (subjectId: string, chapterId: string, topicId: string) => void;
    deleteTopic: (subjectId: string, chapterId: string, topicId: string) => void;
    resetData: () => void;
    exportData: () => void;
    importData: (jsonData: string) => boolean;
    importSyllabusData: (subjects: TemplateSubject[]) => void;
    saveStudySession: (durationInSeconds: number, subjectId?: string, sessionGoal?: string) => Promise<void>;
    addScheduledSession: (session: Omit<ScheduledSession, 'id' | 'isCompleted'>) => void;
    toggleScheduledSession: (sessionId: string) => void;
    deleteScheduledSession: (sessionId: string) => void;
}

// --- Initial Data ---
const initialProfile: UserProfile = {
    name: 'Student',
    grade: 'Class 10',
    language: 'en',
    totalStudyTime: 0,
    earnedBadges: [],
    currentStreak: 0,
    dailyGoal: 7200,
    todayStudyTime: 0,
    weeklyStudyTime: 0,
    monthlyStudyTime: 0,
    xp: 0,
    level: 1,
    role: 'student',
    scheduledSessions: []
};

const STORAGE_KEY = 'study-tracker-data';

// --- Helpers ---
const generateDefaultSubjects = (): Subject[] => {
    const template = SYLLABUS_TEMPLATES[0];
    if (!template) return [];
    return template.subjects.map(ts => ({
        id: crypto.randomUUID(),
        name: ts.name,
        color: ts.color,
        icon: ts.icon,
        chapters: ts.chapters.map(tc => ({
            id: crypto.randomUUID(),
            name: tc.name,
            isCompleted: false,
            completedAt: null,
            topics: tc.topics.map(tt => ({
                id: crypto.randomUUID(),
                name: tt.name,
                isCompleted: false,
                completedAt: null
            }))
        }))
    }));
};

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export function StudyProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const toast = useToast();

    const [userProfile, setUserProfile] = useState<UserProfile>(() => {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                const parsed = JSON.parse(savedData);
                if (parsed.userProfile) return parsed.userProfile;
            }
        } catch (e) { console.error('Failed to load profile:', e); }
        return initialProfile;
    });

    const [subjects, setSubjects] = useState<Subject[]>(() => {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                const parsed = JSON.parse(savedData);
                if (parsed.subjects && parsed.subjects.length > 0) {
                    return parsed.subjects.map((sub: Subject) => ({
                        ...sub,
                        chapters: (sub.chapters || []).map((chap: Chapter) => ({
                            ...chap,
                            topics: chap.topics || []
                        }))
                    }));
                }
            }
        } catch (e) { console.error('Failed to load subjects:', e); }
        return generateDefaultSubjects();
    });

    // --- Persistence Helper ---
    const saveData = useCallback(async (newProfile: UserProfile, newSubjects: Subject[]) => {
        if (user) {
            try {
                await setDoc(doc(db, 'users', user.uid), {
                    userProfile: newProfile,
                    subjects: newSubjects
                });
            } catch (e) { console.error("Cloud save failed:", e); }
        } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                userProfile: newProfile,
                subjects: newSubjects
            }));
        }
    }, [user]);

    // --- Global Sync Effect ---
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // Calculate Completion %
        const totalChapters = subjects.reduce((acc, sub) => acc + sub.chapters.length, 0);
        let completedChapters = 0;
        subjects.forEach(sub => {
            sub.chapters.forEach(ch => {
                if (ch.topics?.length > 0) {
                    if (ch.topics.every(t => t.isCompleted)) completedChapters++;
                } else if (ch.isCompleted) {
                    completedChapters++;
                }
            });
        });
        const completionPercentage = totalChapters === 0 ? 0 : Math.round((completedChapters / totalChapters) * 100);

        if (userProfile.syllabusCompletionPercentage !== completionPercentage) {
            setUserProfile(prev => ({ ...prev, syllabusCompletionPercentage: completionPercentage }));
        }

        saveData({ ...userProfile, syllabusCompletionPercentage: completionPercentage }, subjects);
    }, [subjects, userProfile, saveData]);

    // --- Sync with Firestore ---
    useEffect(() => {
        if (!user) return;

        const adminEmail = 'channel.data.transfer@gmail.com';
        const isTargetAdmin = user.email === adminEmail;

        const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                let mergedProfile = data.userProfile;

                // Force admin role if email matches, OTHERWISE REVOKE IT
                if (isTargetAdmin) {
                    if (mergedProfile.role !== 'admin') {
                        mergedProfile = { ...mergedProfile, role: 'admin' };
                    }
                } else if (mergedProfile.role === 'admin') {
                    // Unauthorized admin detected - revoke immediately
                    mergedProfile = { ...mergedProfile, role: 'student' };
                    // Persist the revocation to Firestore
                    updateDoc(doc(db, 'users', user.uid), {
                        'userProfile.role': 'student'
                    }).catch((e: any) => console.error("Failed to revoke role:", e));
                }

                if (data.userProfile) setUserProfile(mergedProfile);
                if (data.subjects) setSubjects(data.subjects);
            } else if (isTargetAdmin) {
                // If new user is the target admin, ensure they start with admin role
                setUserProfile(prev => ({ ...prev, role: 'admin' }));
            }
        });
        return () => unsubscribe();
    }, [user]);

    // --- Sync Default Subjects Effect ---
    useEffect(() => {
        const template = SYLLABUS_TEMPLATES[0];
        if (!template) return;

        let hasChanges = false;
        const currentSubjects = [...subjects];

        template.subjects.forEach(ts => {
            const exists = currentSubjects.some(s => s.name === ts.name);
            if (!exists) {
                currentSubjects.push({
                    id: crypto.randomUUID(),
                    name: ts.name,
                    color: ts.color,
                    icon: ts.icon,
                    chapters: ts.chapters.map(tc => ({
                        id: crypto.randomUUID(),
                        name: tc.name,
                        isCompleted: false,
                        completedAt: null,
                        topics: tc.topics.map(tt => ({
                            id: crypto.randomUUID(),
                            name: tt.name,
                            isCompleted: false,
                            completedAt: null
                        }))
                    }))
                });
                hasChanges = true;
            }
        });

        if (hasChanges) setSubjects(currentSubjects);
    }, [subjects]);

    // --- Actions ---
    const updateProfile = useCallback((updates: Partial<UserProfile>) => {
        setUserProfile(prev => ({ ...prev, ...updates }));
    }, []);

    const addXP = useCallback((amount: number, reason?: string) => {
        setUserProfile(prev => {
            const newXP = prev.xp + amount;
            const { currentLevel: oldLevel } = getLevelInfo(prev.xp);
            const { currentLevel: newLevel, currentTitle } = getLevelInfo(newXP);

            if (newLevel > oldLevel) {
                toast.success(`🎉 Level Up! You are now a ${currentTitle}!`);
            } else if (reason) {
                // optional toast
            }
            return { ...prev, xp: newXP, level: newLevel };
        });
    }, [toast]);

    const addSubject = (newSubject: Omit<Subject, 'id' | 'chapters'>) => {
        setSubjects(prev => [...prev, { ...newSubject, id: crypto.randomUUID(), chapters: [] }]);
    };

    const editSubject = (id: string, updates: Partial<Subject>) => {
        setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const deleteSubject = (id: string) => {
        setSubjects(prev => prev.filter(s => s.id !== id));
    };

    const addChapter = (subjectId: string, chapterName: string) => {
        setSubjects(prev => prev.map(sub => sub.id === subjectId ? {
            ...sub,
            chapters: [...sub.chapters, { id: crypto.randomUUID(), name: chapterName, isCompleted: false, topics: [] }]
        } : sub));
    };

    const editChapter = (subjectId: string, chapterId: string, newName: string) => {
        setSubjects(prev => prev.map(sub => sub.id === subjectId ? {
            ...sub,
            chapters: sub.chapters.map(ch => ch.id === chapterId ? { ...ch, name: newName } : ch)
        } : sub));
    };

    const toggleChapter = (subjectId: string, chapterId: string) => {
        setSubjects(prev => prev.map(sub => sub.id === subjectId ? {
            ...sub,
            chapters: sub.chapters.map(ch => ch.id === chapterId ? {
                ...ch,
                isCompleted: !ch.isCompleted,
                completedAt: !ch.isCompleted ? new Date().toISOString() : null
            } : ch)
        } : sub));
    };

    const deleteChapter = (subjectId: string, chapterId: string) => {
        setSubjects(prev => prev.map(sub => sub.id === subjectId ? {
            ...sub,
            chapters: sub.chapters.filter(ch => ch.id !== chapterId)
        } : sub));
    };

    const addTopic = (subjectId: string, chapterId: string, topicName: string) => {
        setSubjects(prev => prev.map(sub => sub.id === subjectId ? {
            ...sub,
            chapters: sub.chapters.map(ch => ch.id === chapterId ? {
                ...ch,
                topics: [...ch.topics, { id: crypto.randomUUID(), name: topicName, isCompleted: false, completedAt: null }]
            } : ch)
        } : sub));
    };

    const editTopic = (subjectId: string, chapterId: string, topicId: string, newName: string) => {
        setSubjects(prev => prev.map(sub => sub.id === subjectId ? {
            ...sub,
            chapters: sub.chapters.map(ch => ch.id === chapterId ? {
                ...ch,
                topics: ch.topics.map(t => t.id === topicId ? { ...t, name: newName } : t)
            } : ch)
        } : sub));
    };

    const toggleTopic = (subjectId: string, chapterId: string, topicId: string) => {
        let earnedXP = 0;
        setSubjects(prev => prev.map(sub => sub.id === subjectId ? {
            ...sub,
            chapters: sub.chapters.map(ch => {
                if (ch.id === chapterId) {
                    const updatedTopics = ch.topics.map(t => {
                        if (t.id === topicId) {
                            if (!t.isCompleted) earnedXP = 50;
                            return { ...t, isCompleted: !t.isCompleted, completedAt: !t.isCompleted ? new Date().toISOString() : null };
                        }
                        return t;
                    });
                    const allDone = updatedTopics.length > 0 && updatedTopics.every(t => t.isCompleted);
                    return { ...ch, topics: updatedTopics, isCompleted: allDone, completedAt: allDone ? new Date().toISOString() : null };
                }
                return ch;
            })
        } : sub));

        if (earnedXP > 0) {
            addXP(earnedXP, "Topic Completed");
            toast.success("+50 XP: Topic Completed!");
        }
    };

    const deleteTopic = (subjectId: string, chapterId: string, topicId: string) => {
        setSubjects(prev => prev.map(sub => sub.id === subjectId ? {
            ...sub,
            chapters: sub.chapters.map(ch => ch.id === chapterId ? {
                ...ch,
                topics: ch.topics.filter(t => t.id !== topicId)
            } : ch)
        } : sub));
    };

    const exportData = () => {
        const data = { userProfile, subjects, timestamp: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `study-tracker-backup.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const importData = (jsonData: string) => {
        try {
            const data = JSON.parse(jsonData);
            if (data.userProfile && Array.isArray(data.subjects)) {
                setUserProfile(data.userProfile);
                setSubjects(data.subjects);
                return true;
            }
        } catch (e) { console.error('Import failed:', e); }
        return false;
    };

    const importSyllabusData = (templateSubjects: TemplateSubject[]) => {
        const newSubjects: Subject[] = templateSubjects.map(ts => ({
            id: crypto.randomUUID(),
            name: ts.name,
            color: ts.color,
            icon: ts.icon,
            chapters: ts.chapters.map(tc => ({
                id: crypto.randomUUID(),
                name: tc.name,
                isCompleted: false,
                completedAt: null,
                topics: tc.topics.map(tt => ({
                    id: crypto.randomUUID(),
                    name: tt.name,
                    isCompleted: false,
                    completedAt: null
                }))
            }))
        }));
        setSubjects(prev => [...prev, ...newSubjects]);
    };

    const resetData = () => {
        if (window.confirm('Reset all progress?')) {
            setUserProfile(initialProfile);
            setSubjects([]);
        }
    };

    const saveStudySession = async (durationInSeconds: number, subjectId?: string, sessionGoal?: string) => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        setUserProfile(prev => {
            const newTotal = prev.totalStudyTime + durationInSeconds;
            let newStreak = prev.currentStreak || 0;
            let newTodayTime = prev.todayStudyTime || 0;

            if (prev.lastStudyDate !== todayStr) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                if (prev.lastStudyDate === yesterday.toISOString().split('T')[0]) {
                    newStreak += 1;
                } else {
                    newStreak = 1;
                }
                newTodayTime = durationInSeconds;
            } else {
                newTodayTime += durationInSeconds;
            }

            return {
                ...prev,
                totalStudyTime: newTotal,
                todayStudyTime: newTodayTime,
                currentStreak: newStreak,
                lastStudyDate: todayStr,
                weeklyStudyTime: (prev.weeklyStudyTime || 0) + durationInSeconds,
                monthlyStudyTime: (prev.monthlyStudyTime || 0) + durationInSeconds
            };
        });

        if (user) {
            try {
                await addDoc(collection(db, 'study_sessions'), {
                    userId: user.uid,
                    userName: user.displayName || userProfile.name,
                    durationInSeconds,
                    subjectId: subjectId || null,
                    sessionGoal: sessionGoal || null,
                    createdAt: now.toISOString()
                });
            } catch (e) { console.error("Session log failed:", e); }
        }

        const xpEarned = Math.floor(durationInSeconds / 300) * 10;
        if (xpEarned > 0) {
            addXP(xpEarned, "Study Session");
            toast.success(`+${xpEarned} XP earned!`);
        }
    };

    const addScheduledSession = (session: Omit<ScheduledSession, 'id' | 'isCompleted'>) => {
        const newSession = { ...session, id: crypto.randomUUID(), isCompleted: false };
        updateProfile({ scheduledSessions: [...(userProfile.scheduledSessions || []), newSession] });
        toast.success("Study session scheduled!");
    };

    const toggleScheduledSession = (sessionId: string) => {
        const updated = (userProfile.scheduledSessions || []).map(s =>
            s.id === sessionId ? { ...s, isCompleted: !s.isCompleted } : s
        );
        updateProfile({ scheduledSessions: updated });
    };

    const deleteScheduledSession = (sessionId: string) => {
        const updated = (userProfile.scheduledSessions || []).filter(s => s.id !== sessionId);
        updateProfile({ scheduledSessions: updated });
    };

    // Reminders
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const interval = setInterval(() => {
            const now = new Date();
            setUserProfile(prev => {
                const updatedSessions = (prev.scheduledSessions || []).map(session => {
                    if (session.isCompleted || session.reminderSent || !session.time) return session;
                    const sessionDate = new Date(`${session.date}T${session.time}`);
                    const diffMins = (sessionDate.getTime() - now.getTime()) / 60000;

                    if (diffMins <= 10 && diffMins > -5) {
                        if (Notification.permission === 'granted') {
                            const sub = subjects.find(s => s.id === session.subjectId);
                            new Notification(`Study Session: ${sub?.name || 'Upcoming'}`, {
                                body: `Starting in ${Math.round(Math.max(0, diffMins))} minutes!`,
                                icon: '/pwa-192x192.png'
                            });
                        }
                        return { ...session, reminderSent: true };
                    }
                    return session;
                });
                return { ...prev, scheduledSessions: updatedSessions };
            });
        }, 60000);

        return () => clearInterval(interval);
    }, [subjects]);

    const isAdmin = userProfile.role === 'admin';

    return (
        <StudyContext.Provider value={{
            userProfile, subjects, isAdmin, updateProfile, addSubject, editSubject, deleteSubject,
            addChapter, editChapter, toggleChapter, deleteChapter,
            addTopic, editTopic, toggleTopic, deleteTopic,
            resetData, exportData, importData, importSyllabusData, saveStudySession,
            addScheduledSession, toggleScheduledSession, deleteScheduledSession
        }}>
            {children}
        </StudyContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStudy() {
    const context = useContext(StudyContext);
    if (!context) throw new Error('useStudy must be used within StudyProvider');
    return context;
}
