import React, { createContext, useContext, useState } from 'react';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    deleteUserAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user] = useState<User | null>(null);
    const [loading] = useState(false);

    const signInWithGoogle = async () => {
        console.log("Sign in with Google - To be implemented");
    };

    const logout = async () => {
        console.log("Logout - To be implemented");
    };

    const deleteUserAuth = async () => {
        console.log("Delete User Auth - To be implemented");
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout, deleteUserAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
