import { Timestamp } from 'firebase/firestore';

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
    memberIds: string[];
    inviteCode: string;
};

export type Challenge = {
    id: string;
    groupId: string;
    title: string;
    goalXP: number;
    startDate: string;
    endDate: string;
    participants: string[]; // userIds
    isCompleted: boolean;
};

export type Review = {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
};
