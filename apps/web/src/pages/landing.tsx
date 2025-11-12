import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, PlayCircle, Sparkles, Waves } from 'lucide-react';
import { motion } from 'framer-motion';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import heroLogo from '/logos/logo.jpg';

export function LandingPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16 pb-28">
      <HeroSection />
      <ImpactGrid />
      <CultureBanner />
      <ExperienceStrip />
      <CredibilityCallout />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-[3rem] border border-border/60 bg-white/70 p-10 shadow-xl shadow-emerald-900/20 transition dark:bg-black/50 md:p-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 flex flex-col gap-10 md:flex-row md:items-center"
      >
        <div className="flex-1 space-y-6">
          <Badge variant="contrast" className="w-fit shadow-sm shadow-highlight/40">
            Ghanaian-led. Global impact.
          </Badge>
          <h1 className="font-display text-5xl uppercase tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Master Ghanaian Sign Language with adaptive AI guidance.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
            SignifyAI blends culturally-grounded lessons with real-time feedback. Practice with live gesture tracking,
            unlock freestyle creativity, and keep your learning streak blazing across devices.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="px-7 py-3 text-base">
              <Link to="/auth" className="inline-flex items-center gap-2">
                Start learning now
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-7 py-3 text-base">
              <Link to="/demo" className="inline-flex items-center gap-2">
                Watch the demo
                <PlayCircle size={18} />
              </Link>
            </Button>
          </div>
          <motion.ul
            className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.12 }
              }
            }}
          >
            {heroHighlights.map((item) => (
              <motion.li
                key={item.title}
                className="flex items-start gap-2 rounded-2xl border border-border/70 bg-muted/40 p-4"
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <span className="mt-1 h-3 w-3 flex-none rounded-full bg-accent shadow-glow" />
                <div>
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p>{item.body}</p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
          className="relative flex w-full justify-center md:w-[360px]"
        >
          <div className="relative w-full max-w-[320px]">
            <div className="absolute -inset-8 rounded-[36px] bg-[conic-gradient(from_230deg_at_50%_50%,rgba(190,18,60,0.55),rgba(4,120,87,0.6),rgba(234,179,8,0.5),rgba(15,23,42,0.6),rgba(190,18,60,0.55))] blur-2xl opacity-80" />
            <div className="relative overflow-hidden rounded-[28px] border border-border/30 bg-background/90 shadow-glow backdrop-blur-xl">
              <img src={heroLogo} alt="SignifyAI hero" className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Pulse of Accra</p>
                <h2 className="font-display text-2xl uppercase text-foreground">SignTalk Studio</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Real session feedback curated with Ghanaian cultural nuance.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(190,18,60,0.15),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(4,120,87,0.18),transparent_50%)]" />
    </section>
  );
}

function ImpactGrid() {
  return (
    <section className="grid gap-6 md:grid-cols-3">
      {featureCards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: idx * 0.08, duration: 0.45 }}
        >
          <Card className="h-full">
            <CardHeader className="gap-3">
              <Badge variant="brand" className="w-fit">
                {card.pill}
              </Badge>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{card.body}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </section>
  );
}

function CultureBanner() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-[40px] border border-border/50 bg-gradient-to-r from-red-600/80 via-yellow-500/70 to-emerald-600/80 p-10 text-highlight-foreground shadow-ember"
    >
      <div className="absolute inset-0 opacity-25" style={{
        backgroundImage:
          'repeating-linear-gradient(45deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 10px, transparent 10px, transparent 20px)'
      }} />
      <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-4">
          <Badge variant="contrast" className="bg-black/60 text-white shadow-lg shadow-black/40">
            Inspired by Ghana
          </Badge>
          <h2 className="font-display text-4xl uppercase tracking-wide text-highlight-foreground md:text-5xl">
            Every interaction honours culture, community, and celebration.
          </h2>
          <p className="max-w-2xl text-base font-medium text-highlight-foreground/90">
            We infused the SignifyAI interface with hues from the Ghanaian flag, kente-inspired geometry, and Impact
            headlines that carry the strength of our signing community.
          </p>
        </div>
        <div className="grid gap-4 md:w-[340px]">
          {cultureHighlights.map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex items-center gap-3 rounded-2xl bg-black/30 px-4 py-3 backdrop-blur"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white">
                {item.icon}
              </div>
              <div>
                <p className="font-semibold uppercase tracking-[0.18em] text-white/90">{item.title}</p>
                <p className="text-sm text-white/75">{item.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <RegionMarquee />
    </motion.section>
  );
}

function ExperienceStrip() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl border border-border/60 bg-background/80 px-8 py-10 shadow-lg backdrop-blur-xl md:px-14"
    >
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(190,18,60,0.12),rgba(234,179,8,0.08),rgba(5,150,105,0.12))]" />
      <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl space-y-4">
          <p className="font-display text-3xl uppercase leading-tight text-foreground">
            Crafted with Ghanaian soul, built for unstoppable learners.
          </p>
          <p className="text-base text-muted-foreground">
            From the beaches of Labadi to the bustle of Kumasi, our curriculum champions Ghanaian signers and stories.
            Flow seamlessly between practice modes, keep your streak alive, and celebrate every victory with animated XP
            bursts.
          </p>
        </div>
        <div className="grid w-full max-w-sm grid-cols-2 gap-4 rounded-2xl border border-border/50 bg-background/70 p-6 shadow-inner backdrop-blur md:max-w-md">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="font-display text-3xl font-black text-brand">{stat.value}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function CredibilityCallout() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="grid gap-6 rounded-3xl border border-border/60 bg-background/90 p-8 shadow-lg backdrop-blur-md md:grid-cols-[2fr_1fr]"
    >
      <div className="space-y-5">
        <Badge variant="accent" className="w-fit">
          Built for rapid execution
        </Badge>
        <h3 className="font-display text-4xl uppercase text-foreground">Your launch pad is ready.</h3>
        <p className="max-w-2xl text-base text-muted-foreground">
          We primed the stack so you can focus on delivering unforgettable learning. Supabase handles auth and data,
          Vercel deploys this experience in one push, and Render keeps the inference API close to your users without the
          ops headache.
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Sparkles className="text-highlight" size={18} />
          <span>Dark & light modes with Ghanaian-inspired gradients.</span>
          <span className="hidden md:inline">•</span>
          <span>Framer Motion micro-interactions baked in.</span>
          <span className="hidden md:inline">•</span>
          <span>Responsive layout tuned for mobile all the way up.</span>
        </div>
      </div>
      <Card className="border-brand/40 bg-brand/15 text-brand-foreground">
        <CardHeader>
          <CardTitle className="font-display text-3xl uppercase">Coming next</CardTitle>
          <CardDescription className="text-foreground/90">
            Authentication flows with Supabase, shimmering onboarding, and adaptive dashboards.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-foreground/90">
          <ul className="space-y-2 text-sm">
            <li>• Supabase email + Google sign-in with onboarding wizard.</li>
            <li>• Lesson selector with Ghanaian cultural spotlights.</li>
            <li>• Practice session timeline with animated XP bursts.</li>
          </ul>
        </CardContent>
      </Card>
    </motion.section>
  );
}

const heroHighlights = [
  {
    title: 'Live gesture tracking',
    body: 'MediaPipe-ready pipeline primes the browser for accurate skeleton capture.'
  },
  {
    title: 'Adaptive lesson modes',
    body: 'Switch between word, sentence, and freestyle practice with real-time scoring.'
  },
  {
    title: 'Progress that motivates',
    body: 'XP streaks, badges, and Ghanaian-themed celebrations keep learners inspired.'
  }
];

const featureCards = [
  {
    pill: 'Database First',
    title: 'Supabase schema locked in',
    subtitle: 'RLS-ready tables plus automation triggers for instant onboarding.',
    body: 'Every account auto-populates profiles, settings, chat sessions, and practice logs so your analytics come alive from day one.'
  },
  {
    pill: 'Realtime Practice',
    title: 'Media workflows tuned',
    subtitle: 'WebRTC + Web Worker scaffolds stream frames without blocking UI.',
    body: 'Drop in your model on Render and the inference endpoint slots into our React Query hooks with graceful fallbacks.'
  },
  {
    pill: 'Ghanaian Vibes',
    title: 'Vibrant experience layer',
    subtitle: 'Gradients and motifs inspired by kente and the national flag.',
    body: 'Impact headlines meet Geist body copy, crafting a bold-yet-inviting tone rooted in Ghanaian pride.'
  }
];

const stats = [
  { value: '3', label: 'Practice Modes' },
  { value: '90s', label: 'Feedback Loop' },
  { value: '24/7', label: 'Tutor Access' },
  { value: '∞', label: 'Growth Mindset' }
];

const cultureHighlights = [
  {
    title: 'Accra flair',
    caption: 'Floating gradients mirror the city lights and ocean breeze.',
    icon: <Waves size={18} />
  },
  {
    title: 'Kente geometry',
    caption: 'Angular overlays invite celebration in every hover state.',
    icon: <Sparkles size={18} />
  },
  {
    title: 'Nationwide love',
    caption: 'Content curated with interpreters across Ashanti, Volta, and beyond.',
    icon: <MapPin size={18} />
  }
];

const regions = ['Greater Accra', 'Ashanti', 'Northern', 'Volta', 'Central', 'Eastern', 'Upper East', 'Western'];

function RegionMarquee() {
  return (
    <div className="relative mt-8 overflow-hidden rounded-full border border-white/25 bg-white/10 py-3">
      <motion.div
        className="flex min-w-full items-center gap-8 text-sm font-semibold uppercase tracking-[0.35em] text-white/80"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}
      >
        {[...regions, ...regions].map((region, idx) => (
          <span key={`${region}-${idx}`}>{region}</span>
        ))}
      </motion.div>
    </div>
  );
}
