import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, collection, addDoc } from 'firebase/firestore';

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
};

interface StudyContextType {
    userProfile: UserProfile;
    subjects: Subject[];
    updateProfile: (profile: Partial<UserProfile>) => void;
    addSubject: (subject: Omit<Subject, 'id' | 'chapters'>) => void;
    deleteSubject: (id: string) => void;
    addChapter: (subjectId: string, chapterName: string) => void;
    toggleChapter: (subjectId: string, chapterId: string) => void;
    deleteChapter: (subjectId: string, chapterId: string) => void;
    // Topic Actions
    addTopic: (subjectId: string, chapterId: string, topicName: string) => void;
    toggleTopic: (subjectId: string, chapterId: string, topicId: string) => void;
    deleteTopic: (subjectId: string, chapterId: string, topicId: string) => void;
    resetData: () => void;
    exportData: () => void;
    importData: (jsonData: string) => boolean;
    importSyllabusData: (subjects: any[]) => void; // Using any[] temporarily for TemplateSubject to avoid circular type dependency or duplication
    saveStudySession: (durationInSeconds: number, subjectId?: string) => Promise<void>;
}

// --- Initial Data ---
const initialProfile: UserProfile = {
    name: 'Student',
    grade: 'Class 10',
    language: 'en',
    totalStudyTime: 0,
    earnedBadges: [],
    currentStreak: 0
};

const STORAGE_KEY = 'study-tracker-data';

// --- Context ---
const StudyContext = createContext<StudyContextType | undefined>(undefined);

export function StudyProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

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
                if (parsed.subjects) {
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
            console.error('Failed to load subjects:', e);
        }
        return [];
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
                        subjects: [] as Subject[]
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

                    // Upload to Firestore
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
    }, [user]); // Only re-run if user changes logic

    // Helper: Save to Source of Truth
    const saveData = async (newProfile: UserProfile, newSubjects: Subject[]) => {
        // Always update local state immediately (Optimistic UI)
        setUserProfile(newProfile);
        setSubjects(newSubjects);

        if (user) {
            // Save to Cloud
            try {
                await setDoc(doc(db, 'users', user.uid), {
                    userProfile: newProfile,
                    subjects: newSubjects
                });
            } catch (e) {
                console.error("Failed to save to cloud:", e);
                // Optionally show toast error
            }
        } else {
            // Save to LocalStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                userProfile: newProfile,
                subjects: newSubjects
            }));
        }
    };


    // --- Actions (Updated to use saveData) ---
    const updateProfile = (profile: Partial<UserProfile>) => {
        saveData({ ...userProfile, ...profile }, subjects);
    };

    const addSubject = (newSubject: Omit<Subject, 'id' | 'chapters'>) => {
        const id = crypto.randomUUID();
        const subject: Subject = { ...newSubject, id, chapters: [] };
        saveData(userProfile, [...subjects, subject]);
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
        saveData(userProfile, newSubjects);
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

    const importSyllabusData = (templateSubjects: any[]) => {
        // templateSubjects is Array of { name, icon, color, chapters: [{ name, topics: [{ name }] }] }

        const newSubjectsToAdd: Subject[] = templateSubjects.map(ts => {
            const subjectId = crypto.randomUUID();
            return {
                id: subjectId,
                name: ts.name,
                color: ts.color,
                icon: ts.icon,
                chapters: ts.chapters.map((tc: any) => {
                    const chapterId = crypto.randomUUID();
                    return {
                        id: chapterId,
                        name: tc.name,
                        isCompleted: false,
                        completedAt: null,
                        topics: tc.topics.map((tt: any) => ({
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

    const saveStudySession = async (durationInSeconds: number, subjectId?: string) => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        // Optimistic update for total time
        const newTotalTime = (userProfile.totalStudyTime || 0) + durationInSeconds;

        // Streak Logic
        let newStreak = userProfile.currentStreak || 0;
        let lastDate = userProfile.lastStudyDate;

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
        }

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
            currentStreak: newStreak,
            lastStudyDate: lastDate,
            earnedBadges: [...currentBadges, ...newBadges]
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
                    createdAt: new Date().toISOString()
                });

                // 2. Update user profile totals (already handled by updateProfile -> setDoc, but strictly ensure it)
                // The updateProfile call above triggers saveData which writes to Firestore users/{uid}
            } catch (error) {
                console.error("Error saving study session:", error);
            }
        }
    };

    return (
        <StudyContext.Provider
            value={{
                userProfile,
                subjects,
                updateProfile,
                addSubject,
                deleteSubject,
                addChapter,
                toggleChapter,
                deleteChapter,
                addTopic,
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
