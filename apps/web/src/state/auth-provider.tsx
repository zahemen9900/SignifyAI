import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  nickname: string;
  xp: number;
  streak_count: number;
  last_active_at: string | null;
};

type UserSettings = {
  user_id: string;
  app_theme: 'light' | 'dark';
  prefers_assistive_learning: boolean;
  time_zone: string | null;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  settings: UserSettings | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (values: Partial<Pick<UserProfile, 'full_name' | 'nickname'>>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadProfile = useCallback(
    async (userId: string | null) => {
      if (!userId) {
        setProfile(null);
        setSettings(null);
        return;
      }

      setProfileLoading(true);
      try {
        const [{ data: profileData, error: profileError }, { data: settingsData, error: settingsError }] = await Promise.all([
          supabase
            .from('users')
            .select('id,email,full_name,nickname,xp,streak_count,last_active_at')
            .eq('id', userId)
            .maybeSingle(),
          supabase
            .from('user_settings')
            .select('user_id,app_theme,prefers_assistive_learning,time_zone')
            .eq('user_id', userId)
            .maybeSingle()
        ]);

        if (profileError) {
          console.error('Failed to load profile', profileError);
          setProfile(null);
        } else {
          setProfile(profileData ?? null);
        }

        if (settingsError) {
          console.error('Failed to load user settings', settingsError);
          setSettings(null);
        } else {
          setSettings(settingsData ?? null);
        }
      } finally {
        setProfileLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let active = true;

    async function bootstrapSession() {
      try {
        const {
          data: { session: initialSession }
        } = await supabase.auth.getSession();

        if (!active) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        await loadProfile(initialSession?.user?.id ?? null);
      } finally {
        if (active) {
          setInitializing(false);
        }
      }
    }

    bootstrapSession();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      void loadProfile(nextSession?.user?.id ?? null);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    await loadProfile(user?.id ?? null);
  }, [loadProfile, user?.id]);

  const updateProfile = useCallback(
    async (values: Partial<Pick<UserProfile, 'full_name' | 'nickname'>>) => {
      if (!user) return;

      const updates = Object.fromEntries(
        Object.entries(values).filter(([, value]) => value !== undefined)
      );

      if (Object.keys(updates).length === 0) return;

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select('id,email,full_name,nickname,xp,streak_count,last_active_at')
        .maybeSingle();

      if (error) {
        throw error;
      }

      setProfile(data ?? null);
    },
    [user]
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }

    setProfile(null);
    setSettings(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      settings,
      loading: initializing || profileLoading,
      signOut,
      refreshProfile,
      updateProfile
    }),
    [session, user, profile, settings, initializing, profileLoading, signOut, refreshProfile, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
