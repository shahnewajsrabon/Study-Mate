import { createContext } from 'react';
import type { UserProfile } from '../types/study';

export interface ProfileContextType {
    userProfile: UserProfile;
    updateProfile: (updates: Partial<UserProfile>) => void;
    addXP: (amount: number, reason?: string) => void;
    isAdmin: boolean;
    loading: boolean;
}

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);
