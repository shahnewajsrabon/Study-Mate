import { useState, useEffect, useCallback } from 'react';
import { db } from '../../../shared/lib/firebase.ts';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import type { Note } from '../types/notes.ts';
import { useAuth } from '../../../shared/context/AuthContext.tsx';

export function useNotes() {
    const { user } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            // Use setTimeout to avoid synchronous cascading render warning
            setTimeout(() => {
                setNotes([]);
                setLoading(false);
            }, 0);
            return;
        }

        const q = query(
            collection(db, 'notes'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched: Note[] = [];
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                fetched.push({ id: docSnap.id, ...data } as Note);
            });
            
            // Sort by updatedAt descending
            fetched.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            
            setNotes(fetched);
            setLoading(false);
        }, (err) => {
            console.error("Notes fetch error:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const createNote = useCallback(async (noteParam: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
        if (!user) return null;
        try {
            const newNote = {
                ...noteParam,
                userId: user.uid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            const docRef = await addDoc(collection(db, 'notes'), newNote);
            return docRef.id;
        } catch (error) {
            console.error("Error creating note:", error);
            return null;
        }
    }, [user]);

    const updateNote = useCallback(async (id: string, updates: Partial<Omit<Note, 'id' | 'userId' | 'createdAt'>>) => {
        try {
            const docRef = doc(db, 'notes', id);
            await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
            return true;
        } catch (error) {
            console.error("Error updating note:", error);
            return false;
        }
    }, []);

    const deleteNote = useCallback(async (id: string) => {
        try {
            await deleteDoc(doc(db, 'notes', id));
            return true;
        } catch (error) {
            console.error("Error deleting note:", error);
            return false;
        }
    }, []);

    return {
        notes,
        loading,
        createNote,
        updateNote,
        deleteNote
    };
}
