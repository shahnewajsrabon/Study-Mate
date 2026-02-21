import React, { createContext, useContext, useEffect, useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { db } from '../lib/firebase';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    where,
    serverTimestamp,
} from 'firebase/firestore';

// --- Types ---

export type GroupMember = {
    userId: string;
    name: string;
    joinedAt: string;
    role: 'admin' | 'member';
};

export type ChatMessage = {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: Timestamp | null;
};

export type Group = {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    createdAt: string;
    members: GroupMember[];
    inviteCode: string;
};

interface SocialContextType {
    groups: Group[];
    createGroup: (name: string, description: string) => Promise<void>;
    joinGroup: (inviteCode: string) => Promise<void>;
    leaveGroup: (groupId: string) => Promise<void>;
    sendMessage: (groupId: string, text: string) => Promise<void>;
}

// --- Context ---
const SocialContext = createContext<SocialContextType | undefined>(undefined);

export function SocialProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const toast = useToast();
    const [groups, setGroups] = useState<Group[]>([]);

    // Load User's Groups
    useEffect(() => {
        if (!user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setGroups([]);
            return;
        }

        // Query groups where 'members' array contains an object with userId == user.uid?
        // Firestore array-contains-any works on simple values. For objects, it's harder.
        // Alternative: Store 'memberIds' array for querying only.

        // Let's assume we query by memberIds array in the group document.
        // I need to update Group type to include memberIds.

        const q = query(collection(db, 'groups'), where('memberIds', 'array-contains', user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedGroups: Group[] = [];
            snapshot.forEach(doc => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                loadedGroups.push({ id: doc.id, ...(doc.data() as any) } as Group);
            });
            setGroups(loadedGroups);
        }, (error) => {
            console.error("Error loading groups:", error);
        });

        return () => unsubscribe();
    }, [user]);

    const createGroup = async (name: string, description: string) => {
        if (!user) return;

        try {
            const newGroup = {
                name,
                description,
                createdBy: user.uid,
                createdAt: new Date().toISOString(),
                members: [{
                    userId: user.uid,
                    name: user.displayName || 'Unknown',
                    joinedAt: new Date().toISOString(),
                    role: 'admin'
                }],
                memberIds: [user.uid], // For querying
                inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase()
            };

            await addDoc(collection(db, 'groups'), newGroup);
            toast.success("Group created successfully!");
        } catch (error) {
            console.error("Error creating group:", error);
            toast.error("Failed to create group.");
        }
    };

    const joinGroup = async (inviteCode: string) => {
        if (!user) return;

        // 1. Find group by invite code
        // 2. Add user to members and memberIds
        toast.info(`Join functionality for code ${inviteCode} coming soon!`); // Placeholder for implementation
    };

    const leaveGroup = async (groupId: string) => {
        if (!user) return;
        // Remove user from members and memberIds
        toast.info(`Leave functionality for group ${groupId} coming soon!`);
    };

    const sendMessage = async (groupId: string, text: string) => {
        if (!user) return;

        try {
            await addDoc(collection(db, 'groups', groupId, 'messages'), {
                senderId: user.uid,
                senderName: user.displayName || 'User',
                text,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message.");
        }
    };

    return (
        <SocialContext.Provider value={{ groups, createGroup, joinGroup, leaveGroup, sendMessage }}>
            {children}
        </SocialContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSocial() {
    const context = useContext(SocialContext);
    if (context === undefined) {
        throw new Error('useSocial must be used within a SocialProvider');
    }
    return context;
}
