import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../shared/lib/supabase.ts';
import type { Note } from '../types/notes.ts';
import { useAuth } from '../../../shared/context/AuthContext.tsx';

import type { DatabaseNote } from '../../../shared/types/database.ts';

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

        const fetchNotes = async () => {
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });

            if (error) {
                console.error("Notes fetch error:", error);
                setLoading(false);
                return;
            }

            if (data) {
                const mappedNotes = (data as DatabaseNote[]).map(d => ({
                    ...d,
                    userId: d.user_id,
                    subjectId: d.subject_id,
                    topicId: d.topic_id,
                    isMarkdown: d.is_markdown,
                    createdAt: d.created_at,
                    updatedAt: d.updated_at
                })) as Note[];
                setNotes(mappedNotes);
            }
            setLoading(false);
        };

        fetchNotes();

        const subscription = supabase
            .channel('notes-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${user.id}` }, () => {
                fetchNotes();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user]);

    const createNote = useCallback(async (noteParam: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
        if (!user) return null;
        try {
            const insertData: Partial<DatabaseNote> = {
                user_id: user.id,
                subject_id: noteParam.subjectId,
                topic_id: noteParam.topicId,
                title: noteParam.title,
                content: noteParam.content,
                is_markdown: noteParam.isMarkdown
            };

            const { data, error } = await supabase
                .from('notes')
                .insert([insertData])
                .select()
                .single();

            if (error) throw error;
            return data.id;
        } catch (error) {
            console.error("Error creating note:", error);
            return null;
        }
    }, [user]);

    const updateNote = useCallback(async (id: string, updates: Partial<Omit<Note, 'id' | 'userId' | 'createdAt'>>) => {
        try {
            const dbReadyUpdates: Partial<DatabaseNote> = {
                updated_at: new Date().toISOString()
            };
            
            if (updates.title !== undefined) dbReadyUpdates.title = updates.title;
            if (updates.content !== undefined) dbReadyUpdates.content = updates.content;
            if (updates.isMarkdown !== undefined) dbReadyUpdates.is_markdown = updates.isMarkdown;
            if (updates.subjectId !== undefined) dbReadyUpdates.subject_id = updates.subjectId;
            if (updates.topicId !== undefined) dbReadyUpdates.topic_id = updates.topicId;

            const { error } = await supabase.from('notes').update(dbReadyUpdates).eq('id', id);
            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Error updating note:", error);
            return false;
        }
    }, []);

    const deleteNote = useCallback(async (id: string) => {
        try {
            const { error } = await supabase.from('notes').delete().eq('id', id);
            if (error) throw error;
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
