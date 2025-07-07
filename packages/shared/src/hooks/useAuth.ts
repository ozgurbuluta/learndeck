import { useState, useEffect } from 'react';
import { User, SupabaseClient, Session, AuthChangeEvent } from '@supabase/supabase-js';

export const useAuth = (supabase: SupabaseClient, initialSession?: Session | null) => {
  const [session, setSession] = useState<Session | null>(initialSession ?? null);
  const [loading, setLoading] = useState(!initialSession);

  useEffect(() => {
    if (!initialSession) {
      // Get initial session only if not provided
      supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
        setSession(session);
        setLoading(false);
      });
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, initialSession]);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  };

  const updatePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    return { data, error };
  };

  return {
    session,
    user: session?.user ?? null,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };
}; 