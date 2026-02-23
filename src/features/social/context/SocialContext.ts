import { createContext } from 'react';
import type { Group, Challenge, Review } from '../types/social';

export interface SocialContextType {
    groups: Group[];
    challenges: Challenge[];
    createGroup: (name: string, description: string) => Promise<void>;
    joinGroup: (inviteCode: string) => Promise<void>;
    leaveGroup: (groupId: string) => Promise<void>;
    sendMessage: (groupId: string, text: string) => Promise<void>;
    createChallenge: (groupId: string, title: string, goalXP: number, days: number) => Promise<void>;
    joinChallenge: (challengeId: string) => Promise<void>;
    cleanupUserSocialData: () => Promise<void>;
    reviews: Review[];
    addReview: (rating: number, comment: string) => Promise<void>;
}

export const SocialContext = createContext<SocialContextType | undefined>(undefined);
