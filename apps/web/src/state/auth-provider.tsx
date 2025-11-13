import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/query-client';

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
  notifications: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

type UpdateUserSettingsPayload = Partial<
  Pick<UserSettings, 'app_theme' | 'prefers_assistive_learning' | 'time_zone' | 'notifications'>
>;

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  settings: UserSettings | null;
  loading: boolean;
  streakEvent: { previous: number; current: number } | null;
  acknowledgeStreakEvent: () => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (values: Partial<Pick<UserProfile, 'full_name' | 'nickname'>>) => Promise<void>;
  updateSettings: (values: UpdateUserSettingsPayload) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [streakEvent, setStreakEvent] = useState<{ previous: number; current: number } | null>(null);
  const themeSyncedRef = useRef(false);
  const activitySyncedRef = useRef(false);

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
            .select('user_id,app_theme,prefers_assistive_learning,time_zone,notifications,created_at,updated_at')
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
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview', user.id], exact: false }).catch(() => undefined);
    },
    [user]
  );

  const updateSettings = useCallback(
    async (values: UpdateUserSettingsPayload) => {
      if (!user) return;

      const payload = Object.fromEntries(
        Object.entries(values).filter(([, value]) => value !== undefined)
      );

      if (Object.keys(payload).length === 0) return;

      const { data, error } = await supabase
        .from('user_settings')
        .update(payload)
        .eq('user_id', user.id)
        .select('user_id,app_theme,prefers_assistive_learning,time_zone,notifications,created_at,updated_at')
        .maybeSingle();

      if (error) {
        throw error;
      }

      setSettings((current) => {
        if (data) {
          return data;
        }

        if (current) {
          return { ...current, ...payload } as UserSettings;
        }

        return current;
      });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['dashboard-overview', user.id], exact: false }).catch(() => undefined);
      }
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
    setStreakEvent(null);
    themeSyncedRef.current = false;
    activitySyncedRef.current = false;
  }, []);

  const syncActivity = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('last_active_at,streak_count')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Failed to fetch activity info', error);
        return;
      }

      const now = new Date();
      const lastActive = data?.last_active_at ? new Date(data.last_active_at) : null;
      const previousStreak = data?.streak_count ?? 0;
      let nextStreak = previousStreak;

      if (!lastActive) {
        nextStreak = Math.max(nextStreak, 1);
      } else {
        const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);

        if (diffHours >= 24 && diffHours < 48) {
          nextStreak += 1;
        } else if (diffHours >= 48) {
          nextStreak = nextStreak > 0 ? 1 : 0;
        }
      }

      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({
          last_active_at: now.toISOString(),
          streak_count: nextStreak
        })
        .eq('id', userId)
        .select('id,email,full_name,nickname,xp,streak_count,last_active_at')
        .maybeSingle();

      if (updateError) {
        console.error('Failed to sync activity', updateError);
        return;
      }

      setProfile(updated ?? null);
      if (nextStreak > previousStreak) {
        setStreakEvent({ previous: previousStreak, current: nextStreak });
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard-overview', userId], exact: false }).catch(() => undefined);
    },
    []
  );

  const acknowledgeStreakEvent = useCallback(() => {
    setStreakEvent(null);
  }, []);

  const blockingLoad = initializing || (profileLoading && !profile);
  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      settings,
      loading: blockingLoad,
      streakEvent,
      acknowledgeStreakEvent,
      signOut,
      refreshProfile,
      updateProfile,
      updateSettings
    }),
    [
      session,
      user,
      profile,
      settings,
      blockingLoad,
      streakEvent,
      acknowledgeStreakEvent,
      signOut,
      refreshProfile,
      updateProfile,
      updateSettings
    ]
  );

  useEffect(() => {
    if (!user || !settings?.app_theme || initializing) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    if (themeSyncedRef.current) {
      return;
    }

    themeSyncedRef.current = true;

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const preferredTheme = prefersDark ? 'dark' : 'light';

    if (settings.app_theme !== preferredTheme) {
      void updateSettings({ app_theme: preferredTheme });
    }
  }, [initializing, settings?.app_theme, updateSettings, user]);

  useEffect(() => {
    if (!user || initializing) {
      return;
    }

    if (activitySyncedRef.current) {
      return;
    }

    activitySyncedRef.current = true;
    void syncActivity(user.id);
  }, [initializing, syncActivity, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
