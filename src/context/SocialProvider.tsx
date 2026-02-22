import React, { useState, useEffect } from 'react';
import { SocialContext } from './SocialContext';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot, limit, orderBy, serverTimestamp } from 'firebase/firestore';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

import type { Group, GroupMember, Challenge, Review } from '../types/social';

// --- Constants ---
const GLOBAL_GROUP_ID = 'global-study-lounge';

export function SocialProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const toast = useToast();
    const [groups, setGroups] = useState<Group[]>([]);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);

    // Load User's Groups and Challenges
    useEffect(() => {
        if (!user) return;

        const syncGlobalGroup = async () => {
            try {
                const snapshot = await getDocs(query(collection(db, 'groups'), where('inviteCode', '==', 'GLOBAL')));

                let globalGroupDoc: QueryDocumentSnapshot<DocumentData>;
                if (snapshot.empty) {
                    // Create it if it doesn't exist
                    const globalGroup = {
                        name: "Global Study Lounge 🌍",
                        description: "The official community space for all TrackEd members. Collaborate, share, and grow together!",
                        createdBy: "system",
                        createdAt: new Date().toISOString(),
                        members: [{
                            userId: user.uid,
                            name: user.displayName || 'User',
                            joinedAt: new Date().toISOString(),
                            role: 'member'
                        }],
                        memberIds: [user.uid],
                        inviteCode: 'GLOBAL'
                    };
                    await setDoc(doc(db, 'groups', GLOBAL_GROUP_ID), globalGroup);
                } else {
                    // Update user's membership if not already there
                    globalGroupDoc = snapshot.docs[0];
                    const data = globalGroupDoc.data() as Group;
                    if (!data.memberIds.includes(user.uid)) {
                        await updateDoc(doc(db, 'groups', globalGroupDoc.id), {
                            members: arrayUnion({
                                userId: user.uid,
                                name: user.displayName || 'User',
                                joinedAt: new Date().toISOString(),
                                role: 'member'
                            }),
                            memberIds: arrayUnion(user.uid)
                        });
                    }
                }
            } catch (error) {
                console.error("Error syncing global group:", error);
            }
        };

        syncGlobalGroup();
    }, [user]);

    // Load User's Groups and Challenges
    useEffect(() => {
        if (!user) {
            // Use setTimeout to avoid synchronous state updates in render cycle
            setTimeout(() => {
                setGroups(prev => prev.length > 0 ? [] : prev);
                setChallenges(prev => prev.length > 0 ? [] : prev);
            }, 0);
            return;
        }

        const qGroups = query(collection(db, 'groups'), where('memberIds', 'array-contains', user.uid));
        const unsubscribeGroups = onSnapshot(qGroups, (snapshot) => {
            const loadedGroups: Group[] = [];
            snapshot.forEach(docSnap => {
                loadedGroups.push({ id: docSnap.id, ...docSnap.data() } as Group);
            });
            setGroups(loadedGroups);
        }, (error) => {
            console.error("Error loading groups:", error);
        });

        const qChallenges = query(collection(db, 'challenges'), where('participants', 'array-contains', user.uid));
        const unsubscribeChallenges = onSnapshot(qChallenges, (snapshot) => {
            const loadedChallenges: Challenge[] = [];
            snapshot.forEach(docSnap => {
                loadedChallenges.push({ id: docSnap.id, ...docSnap.data() } as Challenge);
            });
            setChallenges(loadedChallenges);
        }, (error) => {
            console.error("Error loading challenges:", error);
        });

        return () => {
            unsubscribeGroups();
            unsubscribeChallenges();
        };
    }, [user]);

    // Load Public Reviews (Live)
    useEffect(() => {
        // We load reviews regardless of login for the "Wall of Love"
        const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(50));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loaded: Review[] = [];
            snapshot.forEach(docSnap => {
                loaded.push({ id: docSnap.id, ...docSnap.data() } as Review);
            });
            // Sort by latest
            setReviews(loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        });
        return () => unsubscribe();
    }, []);

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
                memberIds: [user.uid],
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

        try {
            const q = query(collection(db, 'groups'), where('inviteCode', '==', inviteCode.trim().toUpperCase()), limit(1));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                toast.error("Invalid invite code.");
                return;
            }

            const groupDoc = querySnapshot.docs[0];
            const groupData = groupDoc.data() as Omit<Group, 'id'>;

            if (groupData.memberIds.includes(user.uid)) {
                toast.info("You are already a member of this group.");
                return;
            }

            const newMember: GroupMember = {
                userId: user.uid,
                name: user.displayName || 'Anonymous',
                joinedAt: new Date().toISOString(),
                role: 'member'
            };

            await updateDoc(doc(db, 'groups', groupDoc.id), {
                members: arrayUnion(newMember),
                memberIds: arrayUnion(user.uid)
            });

            toast.success(`Joined ${groupData.name}!`);
        } catch (error) {
            console.error("Error joining group:", error);
            toast.error("Failed to join group.");
        }
    };

    const leaveGroup = async (groupId: string) => {
        if (!user) return;
        if (groupId === GLOBAL_GROUP_ID || groupId === 'global-study-lounge') {
            toast.info("You cannot leave the Global Study Lounge.");
            return;
        }

        try {
            const group = groups.find(g => g.id === groupId);
            if (!group) return;

            const memberToRemove = group.members.find(m => m.userId === user.uid);
            if (!memberToRemove) return;

            await updateDoc(doc(db, 'groups', groupId), {
                members: arrayRemove(memberToRemove),
                memberIds: arrayRemove(user.uid)
            });

            toast.success("Left group successfully.");
        } catch (error) {
            console.error("Error leaving group:", error);
            toast.error("Failed to leave group.");
        }
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

    const createChallenge = async (groupId: string, title: string, goalXP: number, days: number) => {
        if (!user) return;

        try {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + days);

            const newChallenge = {
                groupId,
                title,
                goalXP,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                participants: [user.uid],
                isCompleted: false,
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, 'challenges'), newChallenge);
            toast.success("Challenge created! Go go go!");
        } catch (error) {
            console.error("Error creating challenge:", error);
            toast.error("Failed to create challenge.");
        }
    };

    const joinChallenge = async (challengeId: string) => {
        if (!user) return;

        try {
            await updateDoc(doc(db, 'challenges', challengeId), {
                participants: arrayUnion(user.uid)
            });
            toast.success("Joined the challenge!");
        } catch (error) {
            console.error("Error joining challenge:", error);
            toast.error("Failed to join challenge.");
        }
    };

    const addReview = async (rating: number, comment: string) => {
        if (!user) {
            toast.error("Please sign in to leave a review.");
            return;
        }

        try {
            const newReview = {
                userId: user.uid,
                userName: user.displayName || 'Anonymous',
                rating,
                comment,
                createdAt: new Date().toISOString()
            };

            await addDoc(collection(db, 'reviews'), newReview);
            toast.success("Thank you for your feedback! 🌟");
        } catch (error) {
            console.error("Error adding review:", error);
            toast.error("Failed to submit review.");
        }
    };

    const cleanupUserSocialData = async () => {
        if (!user) return;
        try {
            // 1. Remove from all groups
            const userGroups = await getDocs(query(collection(db, 'groups'), where('memberIds', 'array-contains', user.uid)));
            const groupUpdates = userGroups.docs.map(async (groupDoc) => {
                const data = groupDoc.data() as Group;
                const memberObj = data.members.find(m => m.userId === user.uid);
                await updateDoc(doc(db, 'groups', groupDoc.id), {
                    memberIds: arrayRemove(user.uid),
                    ...(memberObj ? { members: arrayRemove(memberObj) } : {})
                });
            });

            // 2. Remove from all challenges
            const userChallenges = await getDocs(query(collection(db, 'challenges'), where('participants', 'array-contains', user.uid)));
            const challengeUpdates = userChallenges.docs.map(async (cDoc) => {
                await updateDoc(doc(db, 'challenges', cDoc.id), {
                    participants: arrayRemove(user.uid)
                });
            });

            await Promise.all([...groupUpdates, ...challengeUpdates]);
        } catch (error) {
            console.error("Error during social data cleanup:", error);
            throw error;
        }
    };

    return (
        <SocialContext.Provider value={{
            groups,
            challenges,
            createGroup,
            joinGroup,
            leaveGroup,
            sendMessage,
            createChallenge,
            joinChallenge,
            cleanupUserSocialData,
            reviews,
            addReview
        }}>
            {children}
        </SocialContext.Provider>
    );
}
