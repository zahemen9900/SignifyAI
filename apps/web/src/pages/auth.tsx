import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Shield, Sparkles, UserPlus } from 'lucide-react';

import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/state/auth-provider';

const tabs = [
  { key: 'sign-in', label: 'Sign in', icon: <LogIn size={16} /> },
  { key: 'sign-up', label: 'Create account', icon: <UserPlus size={16} /> }
] as const;

type AuthMode = (typeof tabs)[number]['key'];

export function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const redirectTo = useMemo(() => {
    if (location.state?.from?.pathname) {
      return location.state.from.pathname as string;
    }
    return '/dashboard';
  }, [location.state]);

  useEffect(() => {
    if (user) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo, user]);

  useEffect(() => {
    setError(null);
    setMessage(null);
  }, [mode]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'sign-in') {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          throw signInError;
        }

        if (data.session) {
          navigate(redirectTo, { replace: true });
        }
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || null
            }
          }
        });

        if (signUpError) {
          throw signUpError;
        }

        if (!data.session) {
          setMessage('Check your email to verify your account before signing in.');
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (authError) {
      console.error(authError);
      setError(authError instanceof Error ? authError.message : 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setMessage(null);

    const redirectUrl = `${window.location.origin}/dashboard`;

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });

    if (googleError) {
      setError(googleError.message);
    }
  };

  return (
    <div className="relative min-h-screen bg-background bg-ghana-gradient text-foreground">
      <div className="pointer-events-none absolute inset-0 select-none bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.18),transparent_55%)]" />
      <div className="relative z-10 flex min-h-screen flex-col px-6 pb-20 pt-12 md:px-12">
        <header className="mb-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 rounded-2xl border border-border/40 bg-background/70 px-3 py-2 shadow-md">
            <img
              src="/logos/logo.jpg"
              alt="SignifyAI logo"
              className="h-10 w-10 rounded-xl border border-border/40 bg-background/50 object-cover"
              loading="lazy"
            />
            <div className="text-left">
              <p className="font-display text-xl font-black uppercase tracking-wide">SignifyAI</p>
              <p className="text-xs text-muted-foreground">Ghanaian Sign Language studio</p>
            </div>
          </Link>
          <Link
            to="/"
            className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground transition hover:text-foreground"
          >
            Back home
          </Link>
        </header>

        <div className="mx-auto grid w-full max-w-5xl flex-1 gap-10 pb-10 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.section
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="rounded-[32px] border border-border/60 bg-background/90 p-10 shadow-xl backdrop-blur"
          >
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="brand" className="w-fit">
                  Welcome back to SignifyAI
                </Badge>
                <h1 className="font-display text-4xl uppercase text-foreground sm:text-5xl">
                  Let’s get you signed in.
                </h1>
                <p className="text-base text-muted-foreground">
                  Manual email sign-in or quick Google authentication – either way you’ll be inside the SignTalk studio
                  in seconds.
                </p>
              </div>

              <div className="flex rounded-full border border-border/70 bg-muted/40 p-1 text-sm font-semibold text-muted-foreground">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setMode(tab.key)}
                    className={`flex-1 rounded-full px-4 py-2 transition ${
                      mode === tab.key ? 'bg-brand text-brand-foreground shadow-glow' : 'hover:text-foreground'
                    }`}
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      {tab.icon}
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === 'sign-up' ? (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                      Full name
                    </label>
                    <Input
                      name="fullName"
                      autoComplete="name"
                      placeholder="Ama Mensah"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      required
                    />
                  </div>
                ) : null}

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Email address
                  </label>
                  <Input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Password
                  </label>
                  <Input
                    type="password"
                    name="password"
                    autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Working magic…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border/60" />
                <span className="relative mx-auto block w-fit rounded-full bg-background px-4 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  or continue with
                </span>
              </div>

              <Button type="button" variant="outline" size="lg" className="w-full" onClick={handleGoogleSignIn}>
                <Shield size={18} /> Continue with Google
              </Button>

              {error ? (
                <Alert variant="error" title="We hit a snag">
                  {error}
                </Alert>
              ) : null}

              {message ? (
                <Alert variant="success" title="Check your inbox">
                  {message}
                </Alert>
              ) : null}

              <p className="text-sm text-muted-foreground">
                Need help?{' '}
                <Link to="/" className="font-semibold text-brand underline-offset-4 hover:underline">
                  Return home
                </Link>{' '}
                or{' '}
                <a href="mailto:hello@signify.ai" className="font-semibold text-brand underline-offset-4 hover:underline">
                  contact support
                </a>
                .
              </p>
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="flex flex-col gap-6"
          >
            <Card className="h-full border-brand/20 bg-brand/10 text-brand-foreground">
              <CardHeader>
                <CardTitle className="font-display text-3xl uppercase">Why SignifyAI?</CardTitle>
                <CardDescription className="text-brand-foreground/80">
                  Instant progress tracking, launch-ready dashboards, and Ghanaian-centred lesson design.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-brand-foreground/80">
                <div className="flex items-center gap-3 rounded-2xl border border-brand/40 bg-brand/20 px-4 py-3">
                  <Sparkles size={18} />
                  <p className="text-sm">Adaptive XP system celebrates every win with Accra-inspired sparkles.</p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-brand/40 bg-brand/20 px-4 py-3">
                  <Mail size={18} />
                  <p className="text-sm">Email or Google sign-in from the jump – you choose how to enter the studio.</p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-brand/40 bg-brand/20 px-4 py-3">
                  <Shield size={18} />
                  <p className="text-sm">Secure Supabase auth powered by row-level security you already deployed.</p>
                </div>
              </CardContent>
            </Card>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
