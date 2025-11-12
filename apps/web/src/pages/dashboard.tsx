import { motion } from 'framer-motion';
import { Award, LogOut, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/state/auth-provider';

export function DashboardPage() {
  const { profile, signOut } = useAuth();

  const displayName = profile?.full_name || profile?.email || 'Explorer';
  const xpValue = profile ? profile.xp.toLocaleString() : '0';
  const streakValue = profile ? profile.streak_count : 0;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 pb-16">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="rounded-[32px] border border-border/60 bg-background/90 p-10 shadow-xl backdrop-blur"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <Badge variant="brand">Signed in</Badge>
            <h1 className="font-display text-4xl uppercase text-foreground sm:text-5xl">
              Akwaaba, {displayName}!
            </h1>
            <p className="text-base text-muted-foreground">
              Your learning studio is ready. Track your XP, keep the streak alive, and dive into the latest SignTalk
              lessons tailored for Ghanaian Sign Language.
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="w-full gap-2 md:w-auto">
            <LogOut size={18} /> Sign out
          </Button>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
        className="grid gap-6 lg:grid-cols-3"
      >
        <Card className="border-brand/30 bg-brand/10 text-brand-foreground">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles size={18} /> XP Progress
            </CardTitle>
            <CardDescription className="text-brand-foreground/80">
              Celebrate every gesture you master.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{xpValue}</CardContent>
        </Card>

        <Card className="border-highlight/30 bg-highlight/10 text-highlight-foreground">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award size={18} /> Current Streak
            </CardTitle>
            <CardDescription className="text-highlight-foreground/80">
              Keep showing up and the rewards follow.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{streakValue} days</CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles size={18} /> Next Steps
            </CardTitle>
            <CardDescription>
              We will surface your personalised lesson plan right here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>- Complete your profile to unlock adaptive lesson pacing.</p>
            <p>- Tell us your goals so we can tailor every story-driven mission.</p>
            <p>- Invite your learning circle and earn bonus XP charms.</p>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
