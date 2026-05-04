import { useState, useEffect, useCallback } from 'react';
import { db } from '../../../shared/lib/firebase.ts';
import { collection, doc, query, where, onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { Subject, Chapter, Topic } from '../types/study.ts';
import { useAuth } from '../../../shared/context/AuthContext.tsx';
import { useToast } from '../../../shared/context/ToastContext.tsx';

const STORAGE_KEY_SUBJECTS = 'study-tracker-subjects';

export function useSubjectsManager() {
    const { user } = useAuth();
    const toast = useToast();
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

    const updateTopicNotes = useCallback(async (subjectId: string, chapterId: string, topicId: string, notes: string) => {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;

        const updatedChapters = subject.chapters.map(c => {
            if (c.id === chapterId) {
                return {
                    ...c,
                    topics: c.topics.map(t => t.id === topicId ? { ...t, notes } : t)
                };
            }
            return c;
        });
        await editSubject(subjectId, { chapters: updatedChapters });
    }, [subjects, editSubject]);

    const addTopicLink = useCallback(async (subjectId: string, chapterId: string, topicId: string, linkData: Omit<import('../types/study.ts').ExternalLink, 'id'>) => {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;

        const newLink = { ...linkData, id: crypto.randomUUID() };

        const updatedChapters = subject.chapters.map(c => {
            if (c.id === chapterId) {
                return {
                    ...c,
                    topics: c.topics.map(t => t.id === topicId ? { ...t, links: [...(t.links || []), newLink] } : t)
                };
            }
            return c;
        });
        await editSubject(subjectId, { chapters: updatedChapters });
    }, [subjects, editSubject]);

    const deleteTopicLink = useCallback(async (subjectId: string, chapterId: string, topicId: string, linkId: string) => {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;

        const updatedChapters = subject.chapters.map(c => {
            if (c.id === chapterId) {
                return {
                    ...c,
                    topics: c.topics.map(t => {
                        if (t.id === topicId) {
                            return { ...t, links: (t.links || []).filter(l => l.id !== linkId) };
                        }
                        return t;
                    })
                };
            }
            return c;
        });
        await editSubject(subjectId, { chapters: updatedChapters });
    }, [subjects, editSubject]);

    const updateTopicConfidence = useCallback(async (subjectId: string, chapterId: string, topicId: string, confidence: number) => {
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;

        const updatedChapters = subject.chapters.map(c => {
            if (c.id === chapterId) {
                return {
                    ...c,
                    topics: c.topics.map(t => t.id === topicId ? { ...t, confidence: confidence as 1 | 2 | 3 | 4 | 5 } : t)
                };
            }
            return c;
        });
        await editSubject(subjectId, { chapters: updatedChapters });
    }, [subjects, editSubject]);

    return {
        subjects, setSubjects,
        addSubject, editSubject, deleteSubject,
        addChapter, editChapter, toggleChapter, deleteChapter,
        addTopic, editTopic, toggleTopic, deleteTopic,
        updateTopicNotes, addTopicLink, deleteTopicLink, updateTopicConfidence
    };
}
