import { useState, useEffect, useCallback } from 'react';
import { db } from '../../../shared/lib/firebase.ts';
import { collection, doc, query, where, onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { FlashcardSet } from '../types/study.ts';
import { useAuth } from '../../../shared/context/AuthContext.tsx';
import { useToast } from '../../../shared/context/ToastContext.tsx';

export function useFlashcardsManager() {
    const { user } = useAuth();
    const toast = useToast();
    const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);

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

    const updateFlashcardSet = useCallback(async (id: string, updates: Partial<FlashcardSet>) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, 'flashcardSets', id), updates);
            toast.success("Flashcard set updated");
        } catch (error) {
            console.error("Error updating flashcard set:", error);
            toast.error("Failed to update set");
        }
    }, [user, toast]);

    return {
        flashcardSets,
        setFlashcardSets,
        addFlashcardSet,
        deleteFlashcardSet,
        toggleFlashcardMastered,
        updateFlashcardSet
    };
}
