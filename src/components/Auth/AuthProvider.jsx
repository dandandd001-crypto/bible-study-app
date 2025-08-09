import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useQueryClient } from '@tanstack/react-query';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;

    async function init() {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(currentSession);
      if (currentSession?.user) {
        await loadProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        await loadProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      queryClient.clear();
    });

    init();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [queryClient]);

  async function loadProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, display_name')
      .eq('id', userId)
      .single();

    if (!error) setProfile(data);
    else {
      // If profile missing, create a default one
      await supabase.from('profiles').insert({ id: userId, role: 'user' }).select().single().then((res) => {
        if (!res.error) setProfile(res.data);
      });
    }
  }

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      role: profile?.role ?? 'user',
      loading,
      signOut: () => supabase.auth.signOut(),
    }),
    [session, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
