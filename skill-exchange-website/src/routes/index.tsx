import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Handshake,
  Library,
  Lightbulb,
  ListPlus,
  MapPin,
  MessageCircle,
  NotebookPen,
  PenLine,
  Search,
  ShieldCheck,
  Star,
  TrendingUp,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkillExchange — Trade Skills, Not Money | Campus Skill Barter" },
      {
        name: "description",
        content:
          "Swap skills with campus peers: teach what you know, learn what you don't. Verified skills, online & offline sessions, built-in chat, progress tracking and the Kitab Bhandar book marketplace. Free for 30 days.",
      },
      { property: "og:title", content: "SkillExchange — Trade Skills, Not Money" },
      {
        property: "og:description",
        content:
          "The campus peer barter platform. Verified skills, online or offline sessions, chat and Kitab Bhandar. Free for 30 days.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

/* ── Shared building blocks ─────────────────────────────────── */

const btn =
  "press inline-flex items-center justify-center gap-2 rounded-lg border-2 border-ink font-bold";

function PrimaryButton({ children, href }: { children: ReactNode; href: string }) {
  return (
    <a href={href} className={`${btn} bg-brand px-6 py-3 text-paper shadow-brutal hover:bg-brand-deep`}>
      {children}
    </a>
  );
}

function OutlineButton({ children, href }: { children: ReactNode; href: string }) {
  return (
    <a href={href} className={`${btn} bg-paper px-6 py-3 text-ink shadow-brutal hover:bg-surface`}>
      {children}
    </a>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-md border-2 border-ink bg-ink px-3 py-1.5 font-mono text-xs font-bold tracking-widest text-paper">
      {children}
    </span>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border-2 border-ink bg-paper shadow-brutal ${className}`}>{children}</div>;
}

function Verified() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-mint-ink bg-mint-soft px-2 py-0.5 font-mono text-[11px] font-bold text-mint-ink">
      <BadgeCheck className="h-3.5 w-3.5" /> VERIFIED
    </span>
  );
}

function ModeChip({ icon: Icon, label, tone }: { icon: LucideIcon; label: string; tone: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border-2 border-ink px-2.5 py-1 font-mono text-xs font-bold ${tone}`}>
      <Icon className="h-3.5 w-3.5" /> {label}
    </span>
  );
}

function SectionHead({ num, title, sub }: { num: string; title: string; sub: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <Chip>{num}</Chip>
      <h2 className="mt-4 text-3xl font-bold uppercase tracking-tight md:text-4xl">{title}</h2>
      <p className="mt-3 text-ink-soft">{sub}</p>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */

function Index() {
  return (
    <div className="min-h-screen bg-surface font-sans text-ink">
      <Nav />
      <Hero />
      <HowItWorks />
      <LearningModes />
      <Verification />
      <Progress />
      <KitabBhandar />
      <Pricing />
      <FinalCta />
      <Footer />
    </div>
  );
}

/* ── Nav ────────────────────────────────────────────────────── */

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-paper">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <a href="#" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-ink bg-ink shadow-brutal-sm">
            <ArrowLeftRight className="h-4.5 w-4.5 text-paper" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            SKILL<span className="text-brand">EXCHANGE</span>
          </span>
        </a>
        <div className="hidden items-center gap-7 font-medium lg:flex">
          <a href="#how-it-works" className="hover:text-brand">How It Works</a>
          <a href="#modes" className="hover:text-brand">Learning Modes</a>
          <a href="#verification" className="hover:text-brand">Verification</a>
          <a href="#kitab-bhandar" className="hover:text-brand">Kitab Bhandar</a>
          <a href="#pricing" className="hover:text-brand">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <a href="#pricing" className="hidden rounded-lg border-2 border-ink bg-paper px-4 py-2 font-bold shadow-brutal-sm press sm:inline-block">
            Sign In
          </a>
          <a href="#pricing" className={`${btn} bg-brand px-4 py-2 text-paper shadow-brutal-sm`}>
            Join Free
          </a>
        </div>
      </nav>
    </header>
  );
}

/* ── Hero ───────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="grid-bg border-b-2 border-ink">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-2">
        <div>
          <Chip>01 / CAMPUS SKILL BARTER</Chip>
          <h1 className="mt-5 text-4xl font-bold uppercase leading-[1.05] tracking-tight md:text-6xl">
            Trade skills,
            <br />
            <span className="text-brand">not money.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-ink-soft">
            Two students. Two different skills. One swap. SkillExchange pairs you with campus
            peers so you teach what you know and learn what you don't — online, in person, or
            right in chat.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <PrimaryButton href="#pricing">
              Start Exchanging — Free <ArrowRight className="h-4.5 w-4.5" />
            </PrimaryButton>
            <OutlineButton href="#how-it-works">See How It Works</OutlineButton>
          </div>
          <p className="mt-6 font-mono text-xs font-bold tracking-widest text-ink-soft">
            FREE FOR 30 DAYS · THEN A SMALL PLATFORM FEE
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold tracking-widest">TRENDING NOW:</span>
            {["JAVA", "PYTHON", "PHOTOSHOP", "PUBLIC SPEAKING", "WEB DEV"].map((s) => (
              <span key={s} className="rounded-md border-2 border-ink bg-paper px-2.5 py-1 font-mono text-xs font-bold underline">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Live exchange preview card */}
        <Card className="p-6 shadow-brutal-lg">
          <div className="flex items-center justify-between">
            <span className="rounded-md border-2 border-ink bg-ink px-2.5 py-1 font-mono text-[11px] font-bold tracking-widest text-paper">
              LIVE EXCHANGE PREVIEW
            </span>
            <span className="rounded-md border-2 border-ink bg-paper px-2.5 py-1 font-mono text-[11px] font-bold">
              99% MATCH
            </span>
          </div>
          <div className="mt-5 rounded-lg border-2 border-ink bg-surface p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-ink bg-blush-soft shadow-brutal-xs">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blush-ink font-mono text-sm font-bold text-paper">H</span>
              </span>
              <div>
                <p className="font-bold">Harsh Vardhan</p>
                <p className="text-sm text-ink-soft">Information Technology · Rating 4.8★</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md border-2 border-ink bg-paper px-2.5 py-1 font-mono text-xs font-bold">
                OFFERS: JAVA
              </span>
              <Verified />
            </div>
          </div>
          <div className="my-4 flex items-center justify-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-ink bg-brand shadow-brutal-sm">
              <ArrowLeftRight className="h-5 w-5 text-paper" />
            </span>
          </div>
          <div className="rounded-lg border-2 border-ink bg-surface p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-ink bg-mint-soft shadow-brutal-xs">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mint-ink font-mono text-sm font-bold text-paper">S</span>
              </span>
              <div>
                <p className="font-bold">Sejal Sharma</p>
                <p className="text-sm text-ink-soft">Information Technology · Rating 4.9★</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md border-2 border-ink bg-blush-soft px-2.5 py-1 font-mono text-xs font-bold text-blush-ink">
                WANTS: PHOTOSHOP · 2-WAY MUTUAL BARTER
              </span>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 border-t-2 border-ink pt-4">
            <ModeChip icon={Video} label="ONLINE" tone="bg-brand-soft" />
            <ModeChip icon={MapPin} label="OFFLINE" tone="bg-amber-soft" />
            <ModeChip icon={MessageCircle} label="CHAT" tone="bg-surface" />
          </div>
        </Card>
      </div>
    </section>
  );
}

/* ── 02 / How it works ──────────────────────────────────────── */

const steps: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ListPlus,
    title: "1. List What You Know",
    body: "Add the skills you can teach and the ones you want to learn — from Java and Python to Photoshop and public speaking.",
  },
  {
    icon: Search,
    title: "2. Get Matched",
    body: "We rank campus peers by mutual skills, department, college and rating — with a transparent match score on every profile.",
  },
  {
    icon: Handshake,
    title: "3. Propose the Swap",
    body: "Send an exchange offer: what you'll teach, what you want back, and how you'll meet. They accept in one click.",
  },
  {
    icon: CalendarCheck,
    title: "4. Learn & Track",
    body: "Schedule sessions, track your learning progress and rate each other when the exchange is complete.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b-2 border-ink bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <SectionHead
          num="02 / HOW IT WORKS"
          title="Four Steps to Your First Swap"
          sub="From listing your skills to a finished exchange — all inside one dashboard."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-ink bg-brand-soft shadow-brutal-sm">
                <Icon className="h-6 w-6 text-brand-deep" />
              </span>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 03 / Learning modes ────────────────────────────────────── */

const modes: { icon: LucideIcon; label: string; tone: string; title: string; body: string }[] = [
  {
    icon: Video,
    label: "ONLINE",
    tone: "bg-brand-soft",
    title: "Online Meets",
    body: "Pick a time, and a Google Meet or Zoom link is shared right in your chat. Learn from the hostel, home or holiday.",
  },
  {
    icon: MapPin,
    label: "OFFLINE",
    tone: "bg-amber-soft",
    title: "On Campus",
    body: "Meet face-to-face at the college library or a campus study room — perfect for hands-on skills.",
  },
  {
    icon: MessageCircle,
    label: "CHAT",
    tone: "bg-surface",
    title: "In-Platform Chat",
    body: "Share notes, files and doubts in built-in messaging. Coordinate timings, ask questions, keep everything in one thread.",
  },
];

function LearningModes() {
  return (
    <section id="modes" className="grid-bg border-b-2 border-ink">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <SectionHead
          num="03 / LEARNING MODES"
          title="You Decide How to Meet"
          sub="Every exchange runs your way — online, offline, or purely over chat."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {modes.map(({ icon: Icon, label, tone, title, body }) => (
            <Card key={label} className="flex flex-col p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-ink bg-paper shadow-brutal-sm">
                  <Icon className="h-6 w-6 text-brand-deep" />
                </span>
                <ModeChip icon={Icon} label={label} tone={tone} />
              </div>
              <h3 className="mt-4 text-lg font-bold uppercase">{title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 04 / Verification ──────────────────────────────────────── */

function Verification() {
  return (
    <section id="verification" className="border-b-2 border-ink bg-paper">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-2">
        <div>
          <Chip>04 / TRUST & VERIFICATION</Chip>
          <h2 className="mt-4 text-3xl font-bold uppercase tracking-tight md:text-4xl">
            Verified Skills, Real Trust
          </h2>
          <p className="mt-4 text-ink-soft">
            Every skill can earn the coveted <strong>Verified</strong> badge through an
            administrative audit — so you always know who you're trading with.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Upload certificates — like Adobe Certified or course completions",
              "Add project proof — repositories, portfolios, live work",
              "Record practical experience — committees, internships, roles",
              "Admin audit approves it, or returns clear resubmission feedback",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-mint-ink" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <Card className="p-6 shadow-brutal-lg">
          <span className="rounded-md border-2 border-ink bg-ink px-2.5 py-1 font-mono text-[11px] font-bold tracking-widest text-paper">
            AUDIT WORKFLOW
          </span>
          <div className="mt-5 space-y-4">
            <div className="rounded-lg border-2 border-ink bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold">Java Backend Architecture</p>
                <Verified />
              </div>
              <p className="mt-1 text-sm text-ink-soft">Spring Boot, Hibernate, MySQL, REST</p>
            </div>
            <div className="rounded-lg border-2 border-ink bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold">Graphic Design</p>
                <span className="inline-flex items-center gap-1 rounded-md border border-blush-ink bg-blush-soft px-2 py-0.5 font-mono text-[11px] font-bold text-blush-ink">
                  NEEDS RESUBMISSION
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-soft">
                Feedback: add a complete design-system link with component variants.
              </p>
            </div>
          </div>
          <p className="mt-5 border-t-2 border-ink pt-4 font-mono text-xs font-bold tracking-widest text-ink-soft">
            REQUIRES PROJECT & EXPERIENCE PROOF
          </p>
        </Card>
      </div>
    </section>
  );
}

/* ── 05 / Progress ──────────────────────────────────────────── */

const progressItems: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: CalendarCheck,
    title: "Session Scheduling",
    body: "Plan every session around your timetable — online or on campus.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    body: "Your learning journey is tracked session by session, exchange by exchange.",
  },
  {
    icon: Star,
    title: "Ratings & Reviews",
    body: "Rate peers after completion to keep the whole network trusted.",
  },
];

function Progress() {
  return (
    <section className="border-b-2 border-ink bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {progressItems.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-start gap-4 rounded-xl border-2 border-ink bg-paper p-6 shadow-brutal">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 border-ink bg-amber-soft shadow-brutal-sm">
                <Icon className="h-6 w-6 text-amber-ink" />
              </span>
              <div>
                <h3 className="font-bold uppercase">{title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 06 / Kitab Bhandar ─────────────────────────────────────── */

const kitabItems: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: PenLine,
    title: "Your Own Books",
    body: "List books you've written and put your work in front of the whole campus.",
  },
  {
    icon: NotebookPen,
    title: "Handwritten Notes",
    body: "Turn your class notes into currency — the best notes always find buyers.",
  },
  {
    icon: Library,
    title: "Reference Exchange",
    body: "Give textbooks you've outgrown a second life with a junior who needs them.",
  },
];

function KitabBhandar() {
  return (
    <section id="kitab-bhandar" className="border-b-2 border-ink bg-brand-soft">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Chip>06 / THE MARKETPLACE</Chip>
            <h2 className="mt-4 text-3xl font-bold uppercase tracking-tight md:text-5xl">
              Kitab Bhandar
            </h2>
            <p className="mt-4 max-w-lg text-ink-soft">
              A student-run book &amp; notes marketplace, built into SkillExchange. List your own
              written books, your notes, or pass on the books you no longer need — all within the
              same campus network you already trust.
            </p>
            <div className="mt-8">
              <PrimaryButton href="#pricing">
                Explore Kitab Bhandar <ArrowRight className="h-4.5 w-4.5" />
              </PrimaryButton>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {kitabItems.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="flex flex-col p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-ink bg-paper shadow-brutal-sm">
                  <Icon className="h-5.5 w-5.5 text-brand-deep" />
                </span>
                <h3 className="mt-3 font-bold">{title}</h3>
                <p className="mt-1.5 text-sm text-ink-soft">{body}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 07 / Pricing ───────────────────────────────────────────── */

function Pricing() {
  return (
    <section id="pricing" className="border-b-2 border-ink bg-paper">
      <div className="mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-24">
        <SectionHead
          num="07 / PRICING"
          title="Free for 30 Days. Seriously."
          sub="Everything included during your trial — matching, chat, sessions, verification and Kitab Bhandar."
        />
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-8">
            <span className="rounded-md border-2 border-ink bg-mint-soft px-2.5 py-1 font-mono text-xs font-bold text-mint-ink">
              YOUR FIRST 30 DAYS
            </span>
            <p className="mt-5 text-5xl font-bold">₹0</p>
            <p className="mt-2 font-mono text-xs font-bold tracking-widest text-ink-soft">
              FULL ACCESS · NO CARD NEEDED
            </p>
            <ul className="mt-6 space-y-2.5 text-sm">
              {[
                "Unlimited skill listings & matches",
                "Online, offline & chat exchanges",
                "Verified skill submissions",
                "Kitab Bhandar marketplace access",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4.5 w-4.5 shrink-0 text-mint-ink" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <PrimaryButton href="#">Create Free Account</PrimaryButton>
            </div>
          </Card>
          <Card className="bg-surface p-8">
            <span className="rounded-md border-2 border-ink bg-amber-soft px-2.5 py-1 font-mono text-xs font-bold text-amber-ink">
              AFTER YOUR TRIAL
            </span>
            <p className="mt-5 text-5xl font-bold">
              Small fee
            </p>
            <p className="mt-2 font-mono text-xs font-bold tracking-widest text-ink-soft">
              PAY ONLY WHEN YOU EXCHANGE
            </p>
            <ul className="mt-6 space-y-2.5 text-sm">
              {[
                "A simple platform fee keeps SkillExchange running",
                "Browsing and chatting stay free",
                "You'll always see the fee before it applies",
                "Cancel your participation anytime",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <Lightbulb className="h-4.5 w-4.5 shrink-0 text-amber-ink" /> {f}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <OutlineButton href="#">Learn About Fees</OutlineButton>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ── Final CTA + footer ─────────────────────────────────────── */

function FinalCta() {
  return (
    <section className="grid-bg">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center md:px-8 md:py-24">
        <Chip>08 / YOUR MOVE</Chip>
        <h2 className="mt-4 text-4xl font-bold uppercase tracking-tight md:text-5xl">
          Ready to trade skills?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-ink-soft">
          Join your campus peers on SkillExchange — teach what you know, learn what you don't.
        </p>
        <div className="mt-8 flex justify-center">
          <PrimaryButton href="#pricing">
            Start Free for 30 Days <ArrowRight className="h-4.5 w-4.5" />
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t-2 border-ink bg-ink text-paper">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 md:flex-row md:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-paper bg-paper shadow-brutal-sm">
            <ArrowLeftRight className="h-4.5 w-4.5 text-ink" />
          </span>
          <div>
            <p className="font-bold tracking-tight">
              SKILL<span className="text-brand-soft">EXCHANGE</span>
            </p>
            <p className="font-mono text-[11px] tracking-widest text-paper/70">
              TRADE SKILLS, NOT MONEY
            </p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-6 font-medium text-paper/80">
          <a href="#how-it-works" className="hover:text-paper">How It Works</a>
          <a href="#verification" className="hover:text-paper">Verification</a>
          <a href="#kitab-bhandar" className="hover:text-paper">Kitab Bhandar</a>
          <a href="#pricing" className="hover:text-paper">Pricing</a>
        </div>
        <p className="font-mono text-xs text-paper/60">© 2026 SkillExchange</p>
      </div>
    </footer>
  );
}
