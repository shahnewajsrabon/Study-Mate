import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { db } from '../lib/firebase';
import { SYLLABUS_TEMPLATES, type TemplateSubject } from '../data/syllabusTemplates';
import { doc, onSnapshot, setDoc, collection, addDoc } from 'firebase/firestore';

// --- Types ---
export type BadgeType = 'start_strong' | 'streak_master' | 'subject_conqueror' | 'night_owl';

export type BadgeEntry = {
    type: BadgeType;
    earnedAt: string;
};

// --- Leveling System ---
export const LEVELS = [
    { level: 1, minXP: 0, title: 'Novice' },
    { level: 2, minXP: 500, title: 'Apprentice' },
    { level: 3, minXP: 1200, title: 'Scholar' },
    { level: 4, minXP: 2500, title: 'Sage' },
    { level: 5, minXP: 5000, title: 'Master' },
    { level: 6, minXP: 10000, title: 'Grandmaster' },
    { level: 7, minXP: 20000, title: 'Legend' },
];

export const getLevelInfo = (xp: number) => {
    // Find the highest level where xp >= minXP
    const current = [...LEVELS].reverse().find(l => xp >= l.minXP) || LEVELS[0];
    const next = LEVELS.find(l => l.level === current.level + 1);

    return {
        currentLevel: current.level,
        currentTitle: current.title,
        nextLevelXP: next ? next.minXP : null,
        progress: next
            ? ((xp - current.minXP) / (next.minXP - current.minXP)) * 100
            : 100
    };
};

export type Topic = {
    id: string;
    name: string;
    isCompleted: boolean;
    completedAt?: string | null; // ISO Date string
};

export type Chapter = {
    id: string;
    name: string;
    isCompleted: boolean;
    completedAt?: string | null; // ISO Date string
    topics: Topic[];
};

export type Subject = {
    id: string;
    name: string;
    color: string; // Hex code or Tailwind class
    icon?: string; // Icon name from Lucide
    chapters: Chapter[];
};

export type UserProfile = {
    name: string;
    grade: string; // e.g., "HSC 2026"
    language: 'en' | 'bn';
    totalStudyTime: number; // in seconds
    earnedBadges: BadgeEntry[];
    lastStudyDate?: string; // ISO Date string (YYYY-MM-DD)
    currentStreak: number;
    dailyGoal: number; // in seconds (default 7200 = 2 hours)
    todayStudyTime: number; // in seconds
    weeklyStudyTime: number;
    monthlyStudyTime: number;
    syllabusCompletionPercentage?: number;
    xp: number;
    level: number;
};

interface StudyContextType {
    userProfile: UserProfile;
    subjects: Subject[];
    updateProfile: (profile: Partial<UserProfile>) => void;
    addSubject: (subject: Omit<Subject, 'id' | 'chapters'>) => void;
    editSubject: (id: string, updates: Partial<Subject>) => void;
    deleteSubject: (id: string) => void;
    addChapter: (subjectId: string, chapterName: string) => void;
    editChapter: (subjectId: string, chapterId: string, newName: string) => void;
    toggleChapter: (subjectId: string, chapterId: string) => void;
    deleteChapter: (subjectId: string, chapterId: string) => void;
    // Topic Actions
    addTopic: (subjectId: string, chapterId: string, topicName: string) => void;
    editTopic: (subjectId: string, chapterId: string, topicId: string, newName: string) => void;
    toggleTopic: (subjectId: string, chapterId: string, topicId: string) => void;
    deleteTopic: (subjectId: string, chapterId: string, topicId: string) => void;
    resetData: () => void;
    exportData: () => void;
    importData: (jsonData: string) => boolean;
    importSyllabusData: (subjects: TemplateSubject[]) => void;
    saveStudySession: (durationInSeconds: number, subjectId?: string, sessionGoal?: string) => Promise<void>;
}

// --- Initial Data ---
const initialProfile: UserProfile = {
    name: 'Student',
    grade: 'Class 10',
    language: 'en',
    totalStudyTime: 0,
    earnedBadges: [],
    currentStreak: 0,
    dailyGoal: 7200, // 2 hours default
    todayStudyTime: 0,
    weeklyStudyTime: 0,
    monthlyStudyTime: 0,
    xp: 0,
    level: 1
};

const STORAGE_KEY = 'study-tracker-data';

// --- Helpers ---
const generateDefaultSubjects = (): Subject[] => {
    // Default to HSC Science (index 0)
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

// --- Context ---
const StudyContext = createContext<StudyContextType | undefined>(undefined);

export function StudyProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const toast = useToast();

    // Lazy init for Guest Mode (LocalStorage) to allow immediate rendering
    // For Authenticated User, this will be overwritten by Firestore data
    const [userProfile, setUserProfile] = useState<UserProfile>(() => {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                const parsed = JSON.parse(savedData);
                if (parsed.userProfile) return parsed.userProfile;
            }
        } catch (e) {
            console.error('Failed to load user profile:', e);
        }
        return initialProfile;
    });

    const [subjects, setSubjects] = useState<Subject[]>(() => {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                const parsed = JSON.parse(savedData);
                if (parsed.subjects && parsed.subjects.length > 0) {
                    // Migration logic for old data format if present
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return parsed.subjects.map((sub: any) => ({
                        ...sub,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        chapters: sub.chapters.map((chap: any) => ({
                            ...chap,
                            topics: chap.topics || []
                        }))
                    }));
                }
            }
        } catch (e) {
            console.error('Failed to load subjects, falling back to default:', e);
        }
        // Fallback to default syllabus if no data found
        return generateDefaultSubjects();
    });

    // Effect: Load/Sync data
    useEffect(() => {
        if (user) {
            // --- Authenticated Mode: Sync with Firestore ---
            const userDocRef = doc(db, 'users', user.uid);

            const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    // Data exists in cloud, sync state
                    const data = docSnap.data();
                    if (data.userProfile) setUserProfile(data.userProfile);
                    if (data.subjects) setSubjects(data.subjects);
                } else {
                    // No data in cloud (New user or first login) -> Migrate LocalStorage

                    // We can use the current state values which are lazy-loaded from localStorage
                    const dataToUpload = {
                        userProfile: initialProfile,
                        subjects: subjects.length > 0 ? subjects : generateDefaultSubjects()
                    };

                    try {
                        const savedData = localStorage.getItem(STORAGE_KEY);
                        if (savedData) {
                            const parsed = JSON.parse(savedData);
                            if (parsed.userProfile) dataToUpload.userProfile = parsed.userProfile;
                            if (parsed.subjects) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                dataToUpload.subjects = parsed.subjects.map((sub: any) => ({
                                    ...sub,
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    chapters: sub.chapters.map((chap: any) => ({
                                        ...chap,
                                        topics: chap.topics || []
                                    }))
                                }));
                            }
                        }
                    } catch (e) {
                        console.error("Error reading local storage for migration:", e);
                    }

                    setDoc(userDocRef, dataToUpload)
                        .catch(err => console.error("Migration failed", err));
                }
            }, (error) => {
                console.error("Firestore sync error:", error);
            });

            return () => unsubscribe();
        } else {
            // --- Guest Mode ---
            // LocalStorage loading is already done via lazy initialization
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]); // Only re-run if user changes logic (re-subscribing on subjects change would be bad)


    // Helper: Save to Source of Truth
    const saveData = React.useCallback(async (newProfile: UserProfile, newSubjects: Subject[]) => {

        // Calculate Syllabus Completion Percentage
        const totalChapters = newSubjects.reduce((acc, sub) => acc + sub.chapters.length, 0);
        let totalProgressSum = 0;
        newSubjects.forEach(sub => {
            sub.chapters.forEach(ch => {
                if (ch.topics && ch.topics.length > 0) {
                    totalProgressSum += (ch.topics.filter(t => t.isCompleted).length / ch.topics.length) * 100;
                } else {
                    totalProgressSum += ch.isCompleted ? 100 : 0;
                }
            });
        });
        const completionPercentage = totalChapters === 0 ? 0 : Math.round(totalProgressSum / totalChapters);

        const updatedProfile = { ...newProfile, syllabusCompletionPercentage: completionPercentage };

        // Always update local state immediately (Optimistic UI)
        setUserProfile(updatedProfile);
        setSubjects(newSubjects);

        if (user) {
            // Save to Cloud
            try {
                await setDoc(doc(db, 'users', user.uid), {
                    userProfile: updatedProfile,
                    subjects: newSubjects
                });
            } catch (e) {
                console.error("Failed to save to cloud:", e);
                // Optionally show toast error
            }
        } else {
            // Save to LocalStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                userProfile: updatedProfile,
                subjects: newSubjects
            }));
        }
    }, [user]);

    // --- XP & Leveling Logic ---
    const addXP = (amount: number, reason?: string) => {
        const currentXP = userProfile.xp || 0;
        const newXP = currentXP + amount;

        const { currentLevel: oldLevel } = getLevelInfo(currentXP);
        const { currentLevel: newLevel, currentTitle } = getLevelInfo(newXP);

        // Update Profile
        // We use updateProfile which calls saveData
        const updatedProfile = {
            ...userProfile,
            xp: newXP,
            level: newLevel
        };

        updateProfile(updatedProfile);

        // Notifications
        if (newLevel > oldLevel) {
            toast.success(`🎉 Level Up! You are now a ${currentTitle}!`);
            // Play level up sound if available (future)
        } else if (reason) {
            // Optional: toast small XP gains? heavy toast usage might be annoying.
            // keeping it silent for small gains, descriptive for big ones.
        }
    };


    // --- Sync Default Subjects Effect ---
    useEffect(() => {
        // Ensure all subjects from the default template (HSC Science) are present
        // and have their topics populated if they are currently empty.
        const template = SYLLABUS_TEMPLATES[0]; // Currently targeting HSC Science
        if (!template) return;

        let hasChanges = false;
        // Create a copy to modify
        const currentSubjects = [...subjects];

        // 1. Check for missing or incomplete subjects
        template.subjects.forEach(templateSubject => {
            const existingSubjectIndex = currentSubjects.findIndex(s => s.name === templateSubject.name);

            if (existingSubjectIndex === -1) {
                // Subject missing from user's list -> Add it
                // console.log(`Adding missing default subject: ${templateSubject.name}`);
                const newSubject: Subject = {
                    id: crypto.randomUUID(),
                    name: templateSubject.name,
                    color: templateSubject.color,
                    icon: templateSubject.icon,
                    chapters: templateSubject.chapters.map(tc => ({
                        id: crypto.randomUUID(),
                        name: tc.name, // e.g. "অধ্যায় ১ - ভৌতজগত ও পরিমাপ"
                        isCompleted: false,
                        completedAt: null,
                        topics: tc.topics.map(tt => ({
                            id: crypto.randomUUID(),
                            name: tt.name,
                            isCompleted: false,
                            completedAt: null
                        }))
                    }))
                };
                currentSubjects.push(newSubject);
                hasChanges = true;
            } else {
                // Subject exists -> Check for empty topics (legacy data fix) & Color fix
                const existingSubject = currentSubjects[existingSubjectIndex];
                let subjectChanged = false;

                // Fix: Migrate legacy text- colors to bg- colors
                let newColor = existingSubject.color;
                if (newColor.startsWith('text-')) {
                    newColor = newColor.replace('text-', 'bg-');
                    subjectChanged = true;
                }

                const updatedChapters = existingSubject.chapters.map(ch => {
                    const templateCh = templateSubject.chapters.find(tc => tc.name === ch.name);

                    // Logic: If chapter exists in template AND current chapter has 0 topics BUT template has topics
                    // Then we populate the topics from the template.
                    if (templateCh && ch.topics.length === 0 && templateCh.topics.length > 0) {
                        subjectChanged = true;
                        return {
                            ...ch,
                            topics: templateCh.topics.map(tt => ({
                                id: crypto.randomUUID(),
                                name: tt.name,
                                isCompleted: false,
                                completedAt: null
                            }))
                        };
                    }
                    return ch;
                });

                if (subjectChanged) {
                    // console.log(`Updating subject (topics/color): ${existingSubject.name}`);
                    currentSubjects[existingSubjectIndex] = {
                        ...existingSubject,
                        color: newColor,
                        chapters: updatedChapters
                    };
                    hasChanges = true;
                }
            }
        });

        if (hasChanges) {
            console.log("Syncing default subjects...");
            saveData(userProfile, currentSubjects);
        }

    }, [subjects, userProfile, saveData]); // Safe dependency: hasChanges ensures we only save (and trigger re-run) when needed.


    // --- Actions (Updated to use saveData) ---
    const updateProfile = (profile: Partial<UserProfile>) => {
        saveData({ ...userProfile, ...profile }, subjects);
    };

    const addSubject = (newSubject: Omit<Subject, 'id' | 'chapters'>) => {
        const id = crypto.randomUUID();
        const subject: Subject = { ...newSubject, id, chapters: [] };
        saveData(userProfile, [...subjects, subject]);
    };

    const editSubject = (id: string, updates: Partial<Subject>) => {
        const newSubjects = subjects.map((sub) => {
            if (sub.id === id) {
                return { ...sub, ...updates };
            }
            return sub;
        });
        saveData(userProfile, newSubjects);
    };

    const deleteSubject = (id: string) => {
        saveData(userProfile, subjects.filter((s) => s.id !== id));
    };

    const addChapter = (subjectId: string, chapterName: string) => {
        const newSubjects = subjects.map((sub) => {
            if (sub.id === subjectId) {
                return {
                    ...sub,
                    chapters: [
                        ...sub.chapters,
                        {
                            id: crypto.randomUUID(),
                            name: chapterName,
                            isCompleted: false,
                            topics: [],
                        },
                    ],
                };
            }
            return sub;
        });
        saveData(userProfile, newSubjects);
    };

    const editChapter = (subjectId: string, chapterId: string, newName: string) => {
        const newSubjects = subjects.map((sub) => {
            if (sub.id === subjectId) {
                return {
                    ...sub,
                    chapters: sub.chapters.map((ch) => {
                        if (ch.id === chapterId) {
                            return { ...ch, name: newName };
                        }
                        return ch;
                    }),
                };
            }
            return sub;
        });
        saveData(userProfile, newSubjects);
    };

    const toggleChapter = (subjectId: string, chapterId: string) => {
        const newSubjects = subjects.map((sub) => {
            if (sub.id === subjectId) {
                return {
                    ...sub,
                    chapters: sub.chapters.map((ch) => {
                        if (ch.id === chapterId) {
                            return {
                                ...ch,
                                isCompleted: !ch.isCompleted,
                                completedAt: !ch.isCompleted ? new Date().toISOString() : null,
                            };
                        }
                        return ch;
                    }),
                };
            }
            return sub;
        });
        saveData(userProfile, newSubjects);
    };

    const deleteChapter = (subjectId: string, chapterId: string) => {
        const newSubjects = subjects.map((sub) => {
            if (sub.id === subjectId) {
                return {
                    ...sub,
                    chapters: sub.chapters.filter((ch) => ch.id !== chapterId),
                };
            }
            return sub;
        });
        saveData(userProfile, newSubjects);
    };

    // --- Topic Actions ---
    const addTopic = (subjectId: string, chapterId: string, topicName: string) => {
        const newSubjects = subjects.map((sub) => {
            if (sub.id === subjectId) {
                return {
                    ...sub,
                    chapters: sub.chapters.map((ch) => {
                        if (ch.id === chapterId) {
                            return {
                                ...ch,
                                topics: [
                                    ...ch.topics,
                                    {
                                        id: crypto.randomUUID(),
                                        name: topicName,
                                        isCompleted: false,
                                        completedAt: null,
                                    }
                                ]
                            };
                        }
                        return ch;
                    }),
                };
            }
            return sub;
        });
        saveData(userProfile, newSubjects);
    };

    const editTopic = (subjectId: string, chapterId: string, topicId: string, newName: string) => {
        const newSubjects = subjects.map((sub) => {
            if (sub.id === subjectId) {
                return {
                    ...sub,
                    chapters: sub.chapters.map((ch) => {
                        if (ch.id === chapterId) {
                            return {
                                ...ch,
                                topics: ch.topics.map((t) => {
                                    if (t.id === topicId) {
                                        return { ...t, name: newName };
                                    }
                                    return t;
                                }),
                            };
                        }
                        return ch;
                    }),
                };
            }
            return sub;
        });
        saveData(userProfile, newSubjects);
    };

    const toggleTopic = (subjectId: string, chapterId: string, topicId: string) => {
        const newSubjects = subjects.map((sub) => {
            if (sub.id === subjectId) {
                return {
                    ...sub,
                    chapters: sub.chapters.map((ch) => {
                        if (ch.id === chapterId) {
                            const updatedTopics = ch.topics.map((t) =>
                                t.id === topicId ? {
                                    ...t,
                                    isCompleted: !t.isCompleted,
                                    completedAt: !t.isCompleted ? new Date().toISOString() : null
                                } : t
                            );

                            // If all topics are marked done, mark the chapter as done too
                            const allDone = updatedTopics.length > 0 && updatedTopics.every(t => t.isCompleted);

                            return {
                                ...ch,
                                topics: updatedTopics,
                                isCompleted: allDone,
                                completedAt: allDone ? new Date().toISOString() : null
                            };
                        }
                        return ch;
                    }),
                };
            }
            return sub;
        });

        // Find if topic was just completed to award XP
        // This is a bit expensive to re-search, but safe.
        const subject = subjects.find(s => s.id === subjectId);
        const chapter = subject?.chapters.find(c => c.id === chapterId);
        const topic = chapter?.topics.find(t => t.id === topicId);

        let xpBonus = 0;
        if (topic && !topic.isCompleted) {
            // It is being marked as complete (since logic above flips it)
            xpBonus = 50;
        }

        const currentXP = userProfile.xp || 0;
        const newXP = currentXP + xpBonus;
        const { currentLevel: newLevel, currentTitle } = getLevelInfo(newXP);
        const { currentLevel: oldLevel } = getLevelInfo(currentXP);

        const finalProfile = {
            ...userProfile,
            xp: newXP,
            level: newLevel
        };

        if (newLevel > oldLevel) {
            toast.success(`🎉 Level Up! You are now a ${currentTitle}!`);
        } else if (xpBonus > 0) {
            toast.success("+50 XP: Topic Completed!");
        }

        saveData(finalProfile, newSubjects);
    };

    const deleteTopic = (subjectId: string, chapterId: string, topicId: string) => {
        const newSubjects = subjects.map((sub) => {
            if (sub.id === subjectId) {
                return {
                    ...sub,
                    chapters: sub.chapters.map((ch) => {
                        if (ch.id === chapterId) {
                            return {
                                ...ch,
                                topics: ch.topics.filter((t) => t.id !== topicId)
                            };
                        }
                        return ch;
                    }),
                };
            }
            return sub;
        });
        saveData(userProfile, newSubjects);
    };

    const exportData = () => {
        const data = {
            userProfile,
            subjects,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `study-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const importData = (jsonData: string) => {
        try {
            const data = JSON.parse(jsonData);
            if (data.userProfile && Array.isArray(data.subjects)) {
                saveData(data.userProfile, data.subjects);
                return true;
            } else {
                alert('Invalid backup file format.');
                return false;
            }
        } catch (error) {
            console.error('Import error:', error);
            alert('Failed to parse backup file.');
            return false;
        }
    };

    const importSyllabusData = (templateSubjects: TemplateSubject[]) => {
        // templateSubjects is Array of { name, icon, color, chapters: [{ name, topics: [{ name }] }] }

        const newSubjectsToAdd: Subject[] = templateSubjects.map(ts => {
            const subjectId = crypto.randomUUID();
            return {
                id: subjectId,
                name: ts.name,
                color: ts.color,
                icon: ts.icon,
                chapters: ts.chapters.map((tc) => { // Removed :any, inferred from TemplateSubject
                    const chapterId = crypto.randomUUID();
                    return {
                        id: chapterId,
                        name: tc.name,
                        isCompleted: false,
                        completedAt: null,
                        topics: tc.topics.map((tt) => ({ // Removed :any
                            id: crypto.randomUUID(),
                            name: tt.name,
                            isCompleted: false,
                            completedAt: null
                        }))
                    };
                })
            };
        });

        // Append to existing subjects
        saveData(userProfile, [...subjects, ...newSubjectsToAdd]);
    };

    const resetData = () => {
        if (confirm('Are you sure you want to reset all data?')) {
            saveData(initialProfile, []);
        }
    };

    const saveStudySession = async (durationInSeconds: number, subjectId?: string, sessionGoal?: string) => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        // Optimistic update for total time
        const newTotalTime = (userProfile.totalStudyTime || 0) + durationInSeconds;

        // Streak Logic & Daily Time
        let newStreak = userProfile.currentStreak || 0;
        let lastDate = userProfile.lastStudyDate;
        let newTodayStudyTime = userProfile.todayStudyTime || 0;

        if (lastDate !== todayStr) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastDate === yesterdayStr) {
                newStreak += 1;
            } else {
                newStreak = 1; // Reset or start new
            }
            lastDate = todayStr;
            newTodayStudyTime = durationInSeconds; // Reset for new day
        } else {
            newTodayStudyTime += durationInSeconds; // Add to today's total
        }

        // --- Weekly & Monthly Logic ---
        let newWeeklyTime = userProfile.weeklyStudyTime || 0;
        let newMonthlyTime = userProfile.monthlyStudyTime || 0;

        // Use lastStudyDate from profile to check relative to last session
        const originalLastDateObj = userProfile.lastStudyDate ? new Date(userProfile.lastStudyDate) : new Date(0);

        // Helper to get Monday of the week
        const getMondayStr = (d: Date) => {
            const date = new Date(d);
            const day = date.getDay(),
                diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
            return new Date(date.setDate(diff)).toDateString();
        }

        // Check if Week Changed
        if (getMondayStr(originalLastDateObj) !== getMondayStr(now)) {
            newWeeklyTime = 0;
        }

        // Check if Month Changed
        if (originalLastDateObj.getMonth() !== now.getMonth() || originalLastDateObj.getFullYear() !== now.getFullYear()) {
            newMonthlyTime = 0;
        }

        newWeeklyTime += durationInSeconds;
        newMonthlyTime += durationInSeconds;

        // Badge Logic
        const currentBadges = [...(userProfile.earnedBadges || [])];
        const newBadges: BadgeEntry[] = [];

        // 3. Night Owl: Study between 10PM (22) and 4AM (4)
        const hour = now.getHours();
        const isNight = hour >= 22 || hour < 4;
        const hasNightOwl = currentBadges.some(b => b.type === 'night_owl');

        if (isNight && !hasNightOwl) {
            newBadges.push({ type: 'night_owl', earnedAt: now.toISOString() });
        }

        // 4. Streak Master: 3 days streak
        const hasStreakMaster = currentBadges.some(b => b.type === 'streak_master');
        if (newStreak >= 3 && !hasStreakMaster) {
            newBadges.push({ type: 'streak_master', earnedAt: now.toISOString() });
        }

        const newProfile: UserProfile = {
            ...userProfile,
            totalStudyTime: newTotalTime,
            todayStudyTime: newTodayStudyTime,
            currentStreak: newStreak,
            lastStudyDate: lastDate,
            earnedBadges: [...currentBadges, ...newBadges],
            dailyGoal: userProfile.dailyGoal || 7200, // Ensure valid default
            weeklyStudyTime: newWeeklyTime,
            monthlyStudyTime: newMonthlyTime
        };

        updateProfile(newProfile);

        if (user) {
            try {
                // 1. Add session record
                await addDoc(collection(db, 'study_sessions'), {
                    userId: user.uid,
                    userName: user.displayName || userProfile.name,
                    startTime: new Date(Date.now() - durationInSeconds * 1000).toISOString(),
                    endTime: new Date().toISOString(),
                    durationInSeconds,
                    subjectId: subjectId || null,
                    sessionGoal: sessionGoal || null,
                    createdAt: new Date().toISOString()
                });

                // 2. Update user profile totals (already handled by updateProfile -> setDoc, but strictly ensure it)
                // The updateProfile call above triggers saveData which writes to Firestore users/{uid}
            } catch (error) {
                console.error("Error saving study session:", error);
            }
        }

        // Award XP for study time (e.g., 10 XP per 5 mins = 300s)
        const xpEarned = Math.floor(durationInSeconds / 300) * 10;
        if (xpEarned > 0) {
            addXP(xpEarned, "Study Session");
            toast.success(`+${xpEarned} XP: Study Session!`);
        }
    };

    return (
        <StudyContext.Provider
            value={{
                userProfile,
                subjects,
                updateProfile,
                addSubject,
                editSubject,
                deleteSubject,
                addChapter,
                editChapter,
                toggleChapter,
                deleteChapter,
                addTopic,
                editTopic,
                toggleTopic,
                deleteTopic,
                resetData,
                exportData,
                importData,
                importSyllabusData,
                saveStudySession,
            }}
        >
            {children}
        </StudyContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStudy() {
    const context = useContext(StudyContext);
    if (context === undefined) {
        throw new Error('useStudy must be used within a StudyProvider');
    }
    return context;
}
