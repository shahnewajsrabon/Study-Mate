import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../shared/lib/supabase.ts';
import type { FlashcardSet } from '../types/study.ts';
import { useAuth } from '../../../shared/context/AuthContext.tsx';
import { useToast } from '../../../shared/context/ToastContext.tsx';

import type { DatabaseFlashcardSet } from '../../../shared/types/database.ts';

import { computeSM2, type SRSRating } from '../utils/srsUtils.ts';

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

        const fetchFlashcardSets = async () => {
            const { data, error } = await supabase
                .from('flashcard_sets')
                .select('*')
                .eq('user_id', user.id);

            if (error) {
                console.error("Error fetching flashcards:", error);
                return;
            }

            if (data) {
                const mappedSets = (data as DatabaseFlashcardSet[]).map(d => ({
                    ...d,
                    userId: d.user_id,
                    subjectId: d.subject_id,
                    createdAt: d.created_at
                })) as FlashcardSet[];
                setFlashcardSets(mappedSets);
            }
        };

        fetchFlashcardSets();

        const subscription = supabase
            .channel('flashcards-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'flashcard_sets', filter: `user_id=eq.${user.id}` }, () => {
                fetchFlashcardSets();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user]);

    const addFlashcardSet = useCallback(async (set: Omit<FlashcardSet, 'id' | 'createdAt'>) => {
        if (!user) return;
        try {
            // Initialize SRS data for each card if not present
            const cardsWithSRS = set.cards.map(card => ({
                ...card,
                interval: card.interval ?? 0,
                reps: card.reps ?? 0,
                easeFactor: card.easeFactor ?? 2.5,
                nextReview: card.nextReview ?? new Date().toISOString(),
                isMastered: card.isMastered ?? false
            }));

            const insertData: Partial<DatabaseFlashcardSet> = {
                user_id: user.id,
                subject_id: set.subjectId,
                title: set.title,
                description: set.description,
                cards: cardsWithSRS
            };
            
            const { error } = await supabase.from('flashcard_sets').insert([insertData]);
            if (error) throw error;
            toast.success("Flashcard set created!");
        } catch (error) {
            console.error("Error adding flashcard set:", error);
            toast.error("Failed to create flashcard set");
        }
    }, [user, toast]);

    const deleteFlashcardSet = useCallback(async (id: string) => {
        if (!user) return;
        try {
            const { error } = await supabase.from('flashcard_sets').delete().eq('id', id);
            if (error) throw error;
            toast.success("Flashcard set deleted");
        } catch (error) {
            console.error("Error deleting flashcard set:", error);
            toast.error("Failed to delete set");
        }
    }, [user, toast]);

    const rateFlashcard = useCallback(async (setId: string, cardId: string, rating: SRSRating) => {
        if (!user) return;
        const set = flashcardSets.find(s => s.id === setId);
        if (!set) return;

        const updatedCards = set.cards.map(c => {
            if (c.id === cardId) {
                const srsUpdate = computeSM2(
                    rating,
                    c.interval || 0,
                    c.reps || 0,
                    c.easeFactor || 2.5
                );
                return {
                    ...c,
                    ...srsUpdate,
                    lastReviewed: new Date().toISOString(),
                    isMastered: rating === 4 // Mark as mastered if "Easy"
                };
            }
            return c;
        });

        try {
            const { error } = await supabase.from('flashcard_sets').update({ cards: updatedCards }).eq('id', setId);
            if (error) throw error;
        } catch (error) {
            console.error("Error rating flashcard:", error);
        }
    }, [user, flashcardSets]);

    const updateFlashcardSet = useCallback(async (id: string, updates: Partial<FlashcardSet>) => {
        if (!user) return;
        try {
            const dbReadyUpdates: Partial<DatabaseFlashcardSet> = {};
            
            if (updates.title !== undefined) dbReadyUpdates.title = updates.title;
            if (updates.description !== undefined) dbReadyUpdates.description = updates.description;
            if (updates.cards !== undefined) dbReadyUpdates.cards = updates.cards;
            if (updates.subjectId !== undefined) dbReadyUpdates.subject_id = updates.subjectId;
            
            const { error } = await supabase.from('flashcard_sets').update(dbReadyUpdates).eq('id', id);
            if (error) throw error;
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
        rateFlashcard,
        updateFlashcardSet
    };
}
