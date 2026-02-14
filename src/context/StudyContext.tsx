import React, { createContext, useContext, useEffect, useState } from 'react';

// --- Types ---
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
}

// --- Initial Data ---
const initialProfile: UserProfile = {
    name: 'Student',
    grade: 'Class 10',
    language: 'en',
};

const STORAGE_KEY = 'study-tracker-data';

// --- Context ---
const StudyContext = createContext<StudyContextType | undefined>(undefined);

export function StudyProvider({ children }: { children: React.ReactNode }) {
    // Load from LocalStorage (Lazy Initialization)
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
                    // Migration: Ensure chapters have topics array if loading from old data
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

    // const [isLoaded, setIsLoaded] = useState(true); // Removed as lazy init handles it

    // Save to LocalStorage
    useEffect(() => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ userProfile, subjects })
        );
    }, [userProfile, subjects]);

    // --- Actions ---
    const updateProfile = (profile: Partial<UserProfile>) => {
        setUserProfile((prev) => ({ ...prev, ...profile }));
    };

    const addSubject = (newSubject: Omit<Subject, 'id' | 'chapters'>) => {
        const id = crypto.randomUUID();
        const subject: Subject = {
            ...newSubject,
            id,
            chapters: [],
        };
        setSubjects((prev) => [...prev, subject]);
    };

    const deleteSubject = (id: string) => {
        setSubjects((prev) => prev.filter((s) => s.id !== id));
    };

    const addChapter = (subjectId: string, chapterName: string) => {
        setSubjects((prev) =>
            prev.map((sub) => {
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
            })
        );
    };

    const toggleChapter = (subjectId: string, chapterId: string) => {
        setSubjects((prev) =>
            prev.map((sub) => {
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
            })
        );
    };

    const deleteChapter = (subjectId: string, chapterId: string) => {
        setSubjects((prev) =>
            prev.map((sub) => {
                if (sub.id === subjectId) {
                    return {
                        ...sub,
                        chapters: sub.chapters.filter((ch) => ch.id !== chapterId),
                    };
                }
                return sub;
            })
        );
    };

    // --- Topic Actions ---

    const addTopic = (subjectId: string, chapterId: string, topicName: string) => {
        setSubjects((prev) =>
            prev.map((sub) => {
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
            })
        );
    };

    const toggleTopic = (subjectId: string, chapterId: string, topicId: string) => {
        setSubjects((prev) =>
            prev.map((sub) => {
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
            })
        );
    };

    const deleteTopic = (subjectId: string, chapterId: string, topicId: string) => {
        setSubjects((prev) =>
            prev.map((sub) => {
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
            })
        );
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
                setUserProfile(data.userProfile);
                setSubjects(data.subjects);
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

    const resetData = () => {
        if (confirm('Are you sure you want to reset all data?')) {
            setUserProfile(initialProfile);
            setSubjects([]);
            localStorage.removeItem(STORAGE_KEY);
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
