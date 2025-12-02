import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthContextValue, AuthUser } from '../types/auth';

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                setUser(convertToAuthUser(session.user));
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                setUser(convertToAuthUser(session.user));
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const convertToAuthUser = (supabaseUser: User): AuthUser => {
        const isAnonymous = supabaseUser.is_anonymous || false;
        return {
            id: supabaseUser.id,
            email: supabaseUser.email,
            username: supabaseUser.user_metadata?.username ||
                supabaseUser.email?.split('@')[0] ||
                `Guest_${supabaseUser.id.slice(0, 6)}`,
            avatarUrl: supabaseUser.user_metadata?.avatar_url,
            isAnonymous,
        };
    };

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}`,
            },
        });
        if (error) throw error;
    };

    const signInAsGuest = async () => {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const value: AuthContextValue = {
        user,
        session,
        loading,
        signInWithGoogle,
        signInAsGuest,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
