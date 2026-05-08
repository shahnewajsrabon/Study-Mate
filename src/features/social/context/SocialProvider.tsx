import React, { useState, useEffect } from 'react';
import { SocialContext } from './SocialContext.ts';
import { useAuth } from '../../../shared/context/AuthContext.tsx';
import { useToast } from '../../../shared/context/ToastContext.tsx';
import { supabase } from '../../../shared/lib/supabase.ts';

import type { DatabaseGroup, DatabaseChallenge, DatabaseReview } from '../../../shared/types/database.ts';
import type { Group, GroupMember, Challenge, Review } from '../types/social.ts';

// --- Mapping Utilities ---
const mapDatabaseGroup = (d: DatabaseGroup): Group => ({
    id: d.id,
    name: d.name,
    description: d.description || '',
    createdBy: d.created_by || '',
    createdAt: d.created_at,
    members: d.members as GroupMember[],
    memberIds: d.member_ids,
    inviteCode: d.invite_code
});

const mapDatabaseChallenge = (d: DatabaseChallenge): Challenge => ({
    id: d.id,
    groupId: d.group_id || '',
    title: d.title,
    goalXP: d.goal_xp,
    startDate: d.start_date,
    endDate: d.end_date,
    participants: d.participants,
    isCompleted: d.is_completed
});

const mapDatabaseReview = (d: DatabaseReview): Review => ({
    id: d.id,
    userId: d.user_id,
    userName: d.user_name || 'Anonymous',
    rating: d.rating,
    comment: d.comment || '',
    createdAt: d.created_at
});

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
                const { data: globalGroups, error } = await supabase
                    .from('groups')
                    .select('*')
                    .eq('invite_code', 'GLOBAL');

                if (error) throw error;

                if (!globalGroups || globalGroups.length === 0) {
                    // Create it if it doesn't exist
                    const globalGroup = {
                        name: "Global Study Lounge 🌍",
                        description: "The official community space for all TrackEd members. Collaborate, share, and grow together!",
                        created_by: null,
                        members: [{
                            userId: user.id,
                            name: user.user_metadata?.full_name || 'User',
                            joinedAt: new Date().toISOString(),
                            role: 'member'
                        }],
                        member_ids: [user.id],
                        invite_code: 'GLOBAL'
                    };
                    await supabase.from('groups').insert([globalGroup]);
                } else {
                    // Update user's membership if not already there
                    const globalGroupDoc = globalGroups[0] as DatabaseGroup;
                    if (!globalGroupDoc.member_ids.includes(user.id)) {
                        const newMemberIds = [...globalGroupDoc.member_ids, user.id];
                        const newMembers = [...globalGroupDoc.members, {
                            userId: user.id,
                            name: user.user_metadata?.full_name || 'User',
                            joinedAt: new Date().toISOString(),
                            role: 'member'
                        }];
                        await supabase.from('groups').update({
                            member_ids: newMemberIds,
                            members: newMembers
                        }).eq('id', globalGroupDoc.id);
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

        const fetchGroups = async () => {
            const { data, error } = await supabase
                .from('groups')
                .select('*')
                .contains('member_ids', [user.id]);
                
            if (!error && data) {
                setGroups((data as DatabaseGroup[]).map(mapDatabaseGroup));
            }
        };

        const fetchChallenges = async () => {
            const { data, error } = await supabase
                .from('challenges')
                .select('*')
                .contains('participants', [user.id]);
                
            if (!error && data) {
                setChallenges((data as DatabaseChallenge[]).map(mapDatabaseChallenge));
            }
        };

        fetchGroups();
        fetchChallenges();

        const groupSub = supabase.channel('groups-ch').on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, fetchGroups).subscribe();
        const chalSub = supabase.channel('challenges-ch').on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, fetchChallenges).subscribe();

        return () => {
            supabase.removeChannel(groupSub);
            supabase.removeChannel(chalSub);
        };
    }, [user]);

    // Load Public Reviews (Live)
    useEffect(() => {
        const fetchReviews = async () => {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
                
            if (!error && data) {
                setReviews((data as DatabaseReview[]).map(mapDatabaseReview));
            }
        };

        fetchReviews();
        
        const revSub = supabase.channel('reviews-ch').on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, fetchReviews).subscribe();
        return () => {
            supabase.removeChannel(revSub);
        };
    }, []);

    const createGroup = async (name: string, description: string) => {
        if (!user) return;

        try {
            const newGroup = {
                name,
                description,
                created_by: user.id,
                members: [{
                    userId: user.id,
                    name: user.user_metadata?.full_name || 'Unknown',
                    joinedAt: new Date().toISOString(),
                    role: 'admin'
                }],
                member_ids: [user.id],
                invite_code: Math.random().toString(36).substring(2, 8).toUpperCase()
            };

            const { error } = await supabase.from('groups').insert([newGroup]);
            if (error) throw error;
            toast.success("Group created successfully!");
        } catch (error) {
            console.error("Error creating group:", error);
            toast.error("Failed to create group.");
        }
    };

    const joinGroup = async (inviteCode: string) => {
        if (!user) return;

        try {
            const { data: groupDataArr, error } = await supabase
                .from('groups')
                .select('*')
                .eq('invite_code', inviteCode.trim().toUpperCase())
                .limit(1);

            if (error || !groupDataArr || groupDataArr.length === 0) {
                toast.error("Invalid invite code.");
                return;
            }

            const groupData = groupDataArr[0];

            if (groupData.member_ids.includes(user.id)) {
                toast.info("You are already a member of this group.");
                return;
            }

            const newMember: GroupMember = {
                userId: user.id,
                name: user.user_metadata?.full_name || 'Anonymous',
                joinedAt: new Date().toISOString(),
                role: 'member'
            };

            await supabase.from('groups').update({
                members: [...groupData.members, newMember],
                member_ids: [...groupData.member_ids, user.id]
            }).eq('id', groupData.id);

            toast.success(`Joined ${groupData.name}!`);
        } catch (error) {
            console.error("Error joining group:", error);
            toast.error("Failed to join group.");
        }
    };

    const leaveGroup = async (groupId: string) => {
        if (!user) return;
        
        try {
            const group = groups.find(g => g.id === groupId);
            if (!group) return;

            if (group.inviteCode === 'GLOBAL') {
                toast.info("You cannot leave the Global Study Lounge.");
                return;
            }

            const updatedMembers = group.members.filter(m => m.userId !== user.id);
            const updatedMemberIds = group.memberIds.filter(id => id !== user.id);

            const { error } = await supabase.from('groups').update({
                members: updatedMembers,
                member_ids: updatedMemberIds
            }).eq('id', groupId);
            
            if (error) throw error;
            toast.success("Left group successfully.");
        } catch (error) {
            console.error("Error leaving group:", error);
            toast.error("Failed to leave group.");
        }
    };

    const sendMessage = async (groupId: string, text: string) => {
        if (!user) return;

        try {
            const { error } = await supabase.from('group_messages').insert([{
                group_id: groupId,
                sender_id: user.id,
                sender_name: user.user_metadata?.full_name || 'User',
                text,
            }]);
            if (error) throw error;
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
                group_id: groupId,
                title,
                goal_xp: goalXP,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                participants: [user.id],
                is_completed: false,
            };

            const { error } = await supabase.from('challenges').insert([newChallenge]);
            if (error) throw error;
            toast.success("Challenge created! Go go go!");
        } catch (error) {
            console.error("Error creating challenge:", error);
            toast.error("Failed to create challenge.");
        }
    };

    const joinChallenge = async (challengeId: string) => {
        if (!user) return;

        try {
            const challenge = challenges.find(c => c.id === challengeId);
            if (!challenge) return;
            
            if (challenge.participants.includes(user.id)) return;

            const { error } = await supabase.from('challenges').update({
                participants: [...challenge.participants, user.id]
            }).eq('id', challengeId);
            
            if (error) throw error;
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
                user_id: user.id,
                user_name: user.user_metadata?.full_name || 'Anonymous',
                rating,
                comment,
            };

            const { error } = await supabase.from('reviews').insert([newReview]);
            if (error) throw error;
            toast.success("Thank you for your feedback! 🌟");
        } catch (error) {
            console.error("Error adding review:", error);
            toast.error("Failed to submit review.");
        }
    };

    const cleanupUserSocialData = async () => {
        if (!user) return;
        try {
            // Remove from groups
            const userGroups = groups;
            for (const group of userGroups) {
                const updatedMembers = group.members.filter(m => m.userId !== user.id);
                const updatedMemberIds = group.memberIds.filter(id => id !== user.id);
                await supabase.from('groups').update({
                    members: updatedMembers,
                    member_ids: updatedMemberIds
                }).eq('id', group.id);
            }

            // Remove from challenges
            const userChallenges = challenges;
            for (const challenge of userChallenges) {
                const updatedParticipants = challenge.participants.filter(id => id !== user.id);
                await supabase.from('challenges').update({
                    participants: updatedParticipants
                }).eq('id', challenge.id);
            }

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
