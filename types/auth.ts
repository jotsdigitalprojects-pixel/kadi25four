import { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
    id: string;
    email?: string;
    username: string;
    avatarUrl?: string;
    isAnonymous: boolean;
}

export interface AuthContextValue {
    user: AuthUser | null;
    session: Session | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInAsGuest: () => Promise<void>;
    signOut: () => Promise<void>;
}
