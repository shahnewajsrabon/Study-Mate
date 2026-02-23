import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../shared/context/AuthContext.tsx';
import { useToast } from '../../../shared/context/ToastContext.tsx';
import { useProfile } from '../../../features/profile/hooks/useProfile.ts';
import { type TemplateSubject } from '../data/syllabusTemplates.ts';
import { db } from '../../../shared/lib/firebase.ts';
import { doc, onSnapshot, collection, addDoc, updateDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import type { Subject, Chapter, Topic, FlashcardSet } from '../types/study.ts';
import { StudyContext, type StudyContextType } from './StudyContextObject.tsx';

const STORAGE_KEY_SUBJECTS = 'study-tracker-subjects';

export function StudyProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const toast = useToast();
    const { userProfile, updateProfile, addXP } = useProfile();
    const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY_SUBJECTS);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Error parsing saved subjects", e);
            }
        }
        return [];
    });

    // Firebase Sync
    useEffect(() => {
        if (!user) {
            queueMicrotask(() => {
                setSubjects(prev => prev.length > 0 ? [] : prev);
            });
            return;
        }

        const q = query(collection(db, 'subjects'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const subjectsList: Subject[] = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            } as Subject));
            setSubjects(subjectsList);
            localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(subjectsList));
        });

        return () => unsubscribe();
    }, [user]);

    // Flashcards Sync
    useEffect(() => {
        if (!user) {
            queueMicrotask(() => {
                setFlashcardSets(prev => prev.length > 0 ? [] : prev);
            });
            return;
        }

        const q = query(collection(db, 'flashcardSets'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const setsList: FlashcardSet[] = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            } as FlashcardSet));
            setFlashcardSets(setsList);
        });

        return () => unsubscribe();
    }, [user]);

    const addSubject = useCallback(async (subject: Omit<Subject, 'id' | 'chapters'>) => {
        if (!user) return;
        try {
            await addDoc(collection(db, 'subjects'), {
                ...subject,
                userId: user.uid,
                chapters: [],
                createdAt: new Date().toISOString()
            });
            toast.success("Subject added!");
        } catch (error) {
            console.error("Error adding subject:", error);
            toast.error("Failed to add subject");
        }
    }, [user, toast]);

    const editSubject = useCallback(async (id: string, updates: Partial<Subject>) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, 'subjects', id), updates);
            toast.success("Subject updated!");
        } catch (error) {
            console.error("Error updating subject:", error);
            toast.error("Failed to update subject");
        }
    }, [user, toast]);

    const deleteSubject = useCallback(async (id: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, 'subjects', id));
            toast.success("Subject deleted!");
        } catch (error) {
            console.error("Error deleting subject:", error);
            toast.error("Failed to delete subject");
        }
    }, [user, toast]);

    const addChapter = useCallback(async (subjectId: string, chapterName: string) => {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;

        const newChapter: Chapter = {
            id: crypto.randomUUID(),
            name: chapterName,
            isCompleted: false,
            topics: []
        };

        const updatedChapters = [...subject.chapters, newChapter];
        await editSubject(subjectId, { chapters: updatedChapters });
    }, [subjects, editSubject]);

    const editChapter = useCallback(async (subjectId: string, chapterId: string, newName: string) => {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;

        const updatedChapters = subject.chapters.map(c =>
            c.id === chapterId ? { ...c, name: newName } : c
        );
        await editSubject(subjectId, { chapters: updatedChapters });
    }, [subjects, editSubject]);

    const toggleChapter = useCallback(async (subjectId: string, chapterId: string) => {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;

        const updatedChapters = subject.chapters.map(c =>
            c.id === chapterId ? { ...c, isCompleted: !c.isCompleted, completedAt: !c.isCompleted ? new Date().toISOString() : null } : c
        );
        await editSubject(subjectId, { chapters: updatedChapters });
    }, [subjects, editSubject]);

    const deleteChapter = useCallback(async (subjectId: string, chapterId: string) => {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;

        const updatedChapters = subject.chapters.filter(c => c.id !== chapterId);
        await editSubject(subjectId, { chapters: updatedChapters });
    }, [subjects, editSubject]);

    const addTopic = useCallback(async (subjectId: string, chapterId: string, topicName: string) => {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;

        const updatedChapters = subject.chapters.map(c => {
            if (c.id === chapterId) {
                const newTopic: Topic = {
                    id: crypto.randomUUID(),
                    name: topicName,
                    isCompleted: false
                };
                return { ...c, topics: [...c.topics, newTopic] };
            }
            return c;
        });
        await editSubject(subjectId, { chapters: updatedChapters });
    }, [subjects, editSubject]);

    const editTopic = useCallback(async (subjectId: string, chapterId: string, topicId: string, newName: string) => {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;

        const updatedChapters = subject.chapters.map(c => {
            if (c.id === chapterId) {
                return {
                    ...c,
                    topics: c.topics.map(t => t.id === topicId ? { ...t, name: newName } : t)
                };
            }
            return c;
        });
        await editSubject(subjectId, { chapters: updatedChapters });
    }, [subjects, editSubject]);

    const toggleTopic = useCallback(async (subjectId: string, chapterId: string, topicId: string) => {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;

        const updatedChapters = subject.chapters.map(c => {
            if (c.id === chapterId) {
                const updatedTopics = c.topics.map(t =>
                    t.id === topicId ? { ...t, isCompleted: !t.isCompleted, completedAt: !t.isCompleted ? new Date().toISOString() : null } : t
                );
                return { ...c, topics: updatedTopics };
            }
            return c;
        });
        await editSubject(subjectId, { chapters: updatedChapters });
    }, [subjects, editSubject]);

    const deleteTopic = useCallback(async (subjectId: string, chapterId: string, topicId: string) => {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;

        const updatedChapters = subject.chapters.map(c => {
            if (c.id === chapterId) {
                return {
                    ...c,
                    topics: c.topics.filter(t => t.id !== topicId)
                };
            }
            return c;
        });
        await editSubject(subjectId, { chapters: updatedChapters });
    }, [subjects, editSubject]);

    const resetData = useCallback(async () => {
        if (!user) return;
        try {
            const q = query(collection(db, 'subjects'), where('userId', '==', user.uid));
            const snapshot = await getDocs(q);
            const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
            await Promise.all(deletePromises);
            setSubjects([]);
            localStorage.removeItem(STORAGE_KEY_SUBJECTS);
            toast.success("Progress reset successfully!");
        } catch (error) {
            console.error("Error resetting data:", error);
            toast.error("Failed to reset progress");
        }
    }, [user, toast]);

    const exportData = useCallback(() => {
        const data = {
            userProfile,
            subjects,
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tracked-v3-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [userProfile, subjects]);

    const importData = useCallback(async (jsonData: string) => {
        try {
            const data = JSON.parse(jsonData);
            if (data.userProfile) updateProfile(data.userProfile);
            if (data.subjects && user) {
                for (const sub of data.subjects) {
                    await addDoc(collection(db, 'subjects'), {
                        ...sub,
                        userId: user.uid,
                        id: undefined // Let Firebase create a new id
                    });
                }
            }
            return true;
        } catch (error) {
            console.error("Error importing data:", error);
            return false;
        }
    }, [user, updateProfile]);

    const importSyllabusData = useCallback(async (templateSubjects: TemplateSubject[]) => {
        if (!user) return;
        try {
            for (const sub of templateSubjects) {
                await addDoc(collection(db, 'subjects'), {
                    ...sub,
                    userId: user.uid,
                    createdAt: new Date().toISOString()
                });
            }
            toast.success("Syllabus imported!");
        } catch (error) {
            console.error("Error importing syllabus:", error);
            toast.error("Syllabus import failed");
        }
    }, [user, toast]);

    const saveStudySession = useCallback(async (durationInSeconds: number, subjectId?: string) => {
        if (!user) return;
        try {
            const durationMinutes = Math.floor(durationInSeconds / 60);
            const xpGained = durationMinutes * 10;

            await updateProfile({
                totalStudyTime: (userProfile.totalStudyTime || 0) + durationInSeconds,
                todayStudyTime: (userProfile.todayStudyTime || 0) + durationInSeconds,
                weeklyStudyTime: (userProfile.weeklyStudyTime || 0) + durationInSeconds,
                monthlyStudyTime: (userProfile.monthlyStudyTime || 0) + durationInSeconds,
                xp: (userProfile.xp || 0) + xpGained
            });

            if (subjectId) {
                // Potential logic to record subject-specific session
            }

            addXP(xpGained);
            toast.success(`Session saved! Gained ${xpGained} XP!`);
        } catch (error) {
            console.error("Error saving session:", error);
            toast.error("Failed to save session");
        }
    }, [user, userProfile, updateProfile, addXP, toast]);

    const permanentlyDeleteAllUserData = useCallback(async () => {
        if (!user) return;
        try {
            const q = query(collection(db, 'subjects'), where('userId', '==', user.uid));
            const snapshot = await getDocs(q);
            const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
            await Promise.all(deletePromises);

            const flashcardQ = query(collection(db, 'flashcardSets'), where('userId', '==', user.uid));
            const flashcardSnapshot = await getDocs(flashcardQ);
            const flashcardDeletePromises = flashcardSnapshot.docs.map(d => deleteDoc(d.ref));
            await Promise.all(flashcardDeletePromises);

            await deleteDoc(doc(db, 'users', user.uid));
            setSubjects([]);
            setFlashcardSets([]);
            localStorage.removeItem(STORAGE_KEY_SUBJECTS);
        } catch (error) {
            console.error("Error deleting user data:", error);
            throw error;
        }
    }, [user]);

    const addFlashcardSet = useCallback(async (set: Omit<FlashcardSet, 'id' | 'createdAt'>) => {
        if (!user) return;
        try {
            await addDoc(collection(db, 'flashcardSets'), {
                ...set,
                userId: user.uid,
                createdAt: new Date().toISOString()
            });
            toast.success("Flashcard set created!");
        } catch (error) {
            console.error("Error adding flashcard set:", error);
            toast.error("Failed to create flashcard set");
        }
    }, [user, toast]);

    const deleteFlashcardSet = useCallback(async (id: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, 'flashcardSets', id));
            toast.success("Flashcard set deleted");
        } catch (error) {
            console.error("Error deleting flashcard set:", error);
            toast.error("Failed to delete set");
        }
    }, [user, toast]);

    const toggleFlashcardMastered = useCallback(async (setId: string, cardId: string) => {
        if (!user) return;
        const set = flashcardSets.find(s => s.id === setId);
        if (!set) return;

        const updatedCards = set.cards.map(c =>
            c.id === cardId ? { ...c, isMastered: !c.isMastered, lastReviewed: new Date().toISOString() } : c
        );

        try {
            await updateDoc(doc(db, 'flashcardSets', setId), { cards: updatedCards });
        } catch (error) {
            console.error("Error toggling flashcard mastery:", error);
        }
    }, [user, flashcardSets]);

    const value: StudyContextType = {
        subjects, addSubject, editSubject, deleteSubject,
        addChapter, editChapter, toggleChapter, deleteChapter,
        addTopic, editTopic, toggleTopic, deleteTopic,
        resetData, exportData, importData, importSyllabusData, saveStudySession,
        permanentlyDeleteAllUserData,
        flashcardSets, addFlashcardSet, deleteFlashcardSet, toggleFlashcardMastered
    };

    return (
        <StudyContext.Provider value={value}>
            {children}
        </StudyContext.Provider>
    );
}
