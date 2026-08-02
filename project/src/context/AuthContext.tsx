import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  authEmail: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      return;
    }
    setLoading(true);
    (async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
      setProfile(data as Profile | null);
      setLoading(false);
    })();
  }, [session]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data.session) {
      setSession(data.session);
    }
    if (error) setLoading(false);
    return { error: error ? error.message : null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      // Create user via Admin API with email_confirm: true
      // → No confirmation email is sent, so no rate limit, and the user
      //   can sign in immediately after account creation.
      const url = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/admin/users`;
      const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        }),
      });

      const data = await res.json();

      if (res.status >= 400) {
        setLoading(false);
        // Translate common rate-limit / duplicate errors
        const msg = data?.msg || data?.message || 'فشل إنشاء الحساب';
        if (/rate limit/i.test(msg)) return { error: 'تم إرسال عدد كبير من طلبات التسجيل. انتظر قليلاً وحاول مرة أخرى.' };
        if (/already registered|already exists/i.test(msg)) return { error: 'هذا البريد الإلكتروني مسجل بالفعل. سجّل الدخول.' };
        return { error: msg };
      }

      const userId: string | undefined = data?.id;
      if (!userId) {
        setLoading(false);
        return { error: 'تعذر إنشاء الحساب. حاول مرة أخرى.' };
      }

      // Ensure a profile row exists (trigger usually handles it, but be safe)
      await supabaseAdmin
        .from('profiles')
        .upsert({ id: userId, full_name: fullName, is_admin: false }, { onConflict: 'id' });

      // Sign in automatically so the user enters immediately
      const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (sessionData?.session) setSession(sessionData.session);
      if (!loginError) setLoading(false);
      return { error: null };
    } catch (e) {
      setLoading(false);
      return { error: e instanceof Error ? e.message : 'فشل إنشاء الحساب' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, authEmail: session?.user?.email ?? null, signIn, signUp, signOut, isAdmin: profile?.is_admin ?? false }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
