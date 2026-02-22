import { useContext } from 'react';
import { SocialContext } from '../context/SocialContext';

export function useSocial() {
    const context = useContext(SocialContext);
    if (context === undefined) {
        throw new Error('useSocial must be used within a SocialProvider');
    }
    return context;
}
