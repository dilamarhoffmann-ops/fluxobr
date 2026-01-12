import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, auth } from '../lib/supabase';

interface UseAuthReturn {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        const initializeAuth = async () => {
            try {
                const { session: currentSession } = await auth.getSession();
                setSession(currentSession);
                setUser(currentSession?.user ?? null);
            } catch (error) {
                console.error('Error getting session:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {
                console.log('Auth state changed:', event);
                setSession(currentSession);
                setUser(currentSession?.user ?? null);
                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        setLoading(true);
        try {
            const { error } = await auth.signIn(email, password);
            return { error };
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
        setLoading(true);
        try {
            const { error } = await auth.signUp(email, password, metadata);
            return { error };
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        setLoading(true);
        try {
            await auth.signOut();
            setUser(null);
            setSession(null);
        } finally {
            setLoading(false);
        }
    };

    return {
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
    };
};
