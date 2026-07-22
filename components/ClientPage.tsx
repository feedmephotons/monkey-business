"use client";

import { useState, useEffect } from 'react'
import Image from 'next/image'
import WallForm from '@/components/WallForm'
import WallPost from '@/components/WallPost'
import PokerBrosFAB from '@/components/PokerBrosFAB'
import ScratchCard from '@/components/ScratchCard'
import type { WallPost as WallPostType, BudgetRow } from '@/lib/supabase'
import type { EnrichedWallPost } from '@/app/page'

const FLYERS = [
  { src: '/img/hero-freeroll-flyer-jul25.png', alt: 'Monkey Biz Poker Freeroll Flyer - July 25th' },
  { src: '/img/hero-freeroll-flyer-jul31.png', alt: 'Monkey Biz Poker Freeroll Flyer - July 31st' },
]

type ScheduleNight = {
  day: string
  date: string
  title: string
  pool: string
  detail: string
  accent: string
  headline?: boolean
}

const SCHEDULE: ScheduleNight[] = [
    { day: 'SUN', date: 'July 5', title: 'Freeroll', pool: '250', detail: 'Kick off the month with free money. No better way to end the weekend.', accent: 'var(--color-light-blue)' },
    { day: 'MON', date: 'July 13', title: 'Freeroll', pool: '250', detail: 'Your case of the Mondays just got cured. Free chips to start the week.', accent: 'var(--color-red)' },
    { day: 'SAT', date: 'July 25', title: 'Freeroll', pool: '250', detail: "Saturday Night Stacks. The weekend's in full swing and so are the cards. Ante up.", accent: 'var(--color-red-bright)' },
    { day: 'FRI', date: 'July 31', title: 'Freeroll', pool: '250', detail: 'FREEROLL FRIDAY! End the month on a high note. Nothing beats a winning hand you didn’t have to pay for.', accent: 'var(--color-light-blue)' },
]

const BUDGET_TOTAL_CENTS = 121000 // $1,210

const BUDGET_LABELS: Record<string, string> = {
  freeroll_monday: 'Mon Freeroll',
  freeroll_tuesday: 'Tue Freeroll',
  high_hand_wed_hour: 'Wed Hour',
  high_hand_wed_night: 'Wed Night',
  freeroll_thursday: 'Thu Freeroll',
  splash_pot_friday: 'Fri Splash',
  satellite_tickets: 'Satellites',
  other: 'Other',
}

function dollars(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

interface ClientPageProps {
  posts: EnrichedWallPost[]
  budget: BudgetRow[]
}

export default function ClientPage({ posts, budget }: ClientPageProps) {
  const [activeFlyerIndex, setActiveFlyerIndex] = useState(0)
  const [activeWallTab, setActiveWallTab] = useState<'general' | 'bad_beat'>('general')
  const [weeklyWinner, setWeeklyWinner] = useState<{
    author: string
    message: string
    score: number
    splatCount: number
    sufferCount: number
    iceCount: number
    commentsCount: number
    ratingsCount: number
  } | null>(null)

  useEffect(() => {
    fetch('/data/weekly-winner.json')
      .then((res) => {
        if (res.ok) return res.json()
        return null
      })
      .then((data) => {
        if (data) setWeeklyWinner(data)
      })
      .catch((err) => console.error("Error loading weekly winner:", err))
  }, [])

  // PWA Share Target Detector
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const sharedUrl = params.get('url') || params.get('text') || params.get('title')
      
      if (sharedUrl && (sharedUrl.includes('pokerbros.net') || sharedUrl.includes('http'))) {
        setActiveWallTab('bad_beat')
        localStorage.setItem('mb_shared_pokerbros_url', sharedUrl)
        
        // Clean URL to prevent re-triggering
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl)
      }
    }
  }, [])

  const nextFlyer = () => {
    setActiveFlyerIndex((prev) => (prev + 1) % FLYERS.length)
  }

  const prevFlyer = () => {
    setActiveFlyerIndex((prev) => (prev - 1 + FLYERS.length) % FLYERS.length)
  }

  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    if (isLeftSwipe) {
      nextFlyer()
    } else if (isRightSwipe) {
      prevFlyer()
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFlyerIndex((prev) => (prev + 1) % FLYERS.length)
    }, 3500) // Changes every 3.5 seconds

    return () => clearInterval(timer)
  }, [activeFlyerIndex])

  const spent = budget.reduce((s, r) => s + r.amount_cents, 0)
  const remaining = BUDGET_TOTAL_CENTS - spent
  const pct = Math.min(100, Math.round((spent / BUDGET_TOTAL_CENTS) * 100))

  return (
    <main className="relative overflow-hidden">
          {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="relative flex flex-col" style={{ minHeight: '100svh' }}>
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/70 via-navy-deep/60 to-navy-deep" />
        </div>

        <nav className="relative z-10 flex items-center justify-center px-5 sm:px-10 py-5">
          <div className="flex items-center gap-3 sm:gap-4 text-[0.65rem] uppercase tracking-[0.25em] text-white/60 font-[family-name:var(--font-mono)]">
            <a href="#events" className="hover:text-red transition">
              Events
            </a>
            <a href="#schedule" className="hover:text-red transition">
              Schedule
            </a>
            <a href="#wall" className="hover:text-red transition">
              Wall
            </a>
            <a href="#contact" className="hover:text-red transition">
              Contact
            </a>
            <a href="#club" className="px-4 py-2 text-xs rounded-sm bg-red hover:bg-red-bright text-white transition -my-2">
              Join Now
            </a>
          </div>
        </nav>

        <div className="relative z-10 flex-1 grid lg:grid-cols-[1.05fr_1fr] items-center gap-10 lg:gap-6 px-5 sm:px-10 pb-16">
          <div className="space-y-6 max-w-[640px]">
            <h1
              className="font-[family-name:var(--font-display)] text-white"
              style={{ lineHeight: 1.1 }}
            >
              <span
                className="block text-4xl sm:text-5xl text-light-blue"
              >
                Swing into the action.
              </span>
              <span
                className="block text-red-bright neon"
                style={{ fontSize: 'clamp(2.8rem, 9vw, 6.5rem)'}}
              >
                Private Poker
              </span>
              <span
                className="block"
                style={{ fontSize: 'clamp(2.6rem, 8vw, 5.8rem)' }}
              >
                on PokerBros
              </span>
            </h1>

            <p className="font-[family-name:var(--font-headline)] text-xl sm:text-2xl text-white/90 leading-snug max-w-[520px]">
              Join our private club for daily games, big pots, and tournaments. All the action, none of the nonsense.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="#club"
                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-b from-red-bright to-red text-white rounded font-[family-name:var(--font-display)] tracking-wider text-lg shadow-[0_6px_0_rgba(0,0,0,0.35),0_14px_32px_-10px_rgba(191,10,48,0.55)] hover:translate-y-[1px] active:translate-y-[4px] active:shadow-[0_2px_0_rgba(0,0,0,0.35)] transition"
              >
                JOIN THE CLUB NOW
                <span className="inline-block group-hover:translate-x-1 transition">→</span>
              </a>
              <a
                href="#schedule"
                className="inline-flex items-center gap-2 px-6 py-3 border border-light-blue/60 text-white rounded font-[family-name:var(--font-mono)] text-sm uppercase tracking-widest hover:bg-light-blue/10 hover:border-red transition"
              >
                View Schedule
              </a>
            </div>

            <div className="flex items-center gap-5 pt-6 text-white/50">
              <span className="font-[family-name:var(--font-mono)] text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.3em]">
                Freerolls• High Hands•Tournaments• Bananas• A Monkey In A Suit
              </span>
            </div>
          </div>

          <div className="relative float">
            <div className="absolute -inset-4 bg-red/20 blur-3xl rounded-full" />
            <div 
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              className="relative rounded-lg overflow-hidden ring-2 ring-light-blue/50 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] group cursor-grab active:cursor-grabbing"
            >
              <Image
                src={FLYERS[activeFlyerIndex].src}
                alt={FLYERS[activeFlyerIndex].alt}
                width={1200}
                height={700}
                className="w-full h-auto transition-opacity duration-300 pointer-events-none select-none"
                priority
              />

              {/* Navigation Arrows */}
              <button
                onClick={prevFlyer}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-navy-deep/80 hover:bg-red text-white w-9 h-9 rounded-full border border-light-blue/30 hover:border-red transition flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 shadow-lg text-lg select-none z-10"
                aria-label="Previous Flyer"
              >
                ‹
              </button>
              <button
                onClick={nextFlyer}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-navy-deep/80 hover:bg-red text-white w-9 h-9 rounded-full border border-light-blue/30 hover:border-red transition flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 shadow-lg text-lg select-none z-10"
                aria-label="Next Flyer"
              >
                ›
              </button>

              {/* Dots indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {FLYERS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFlyerIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full transition ${
                      index === activeFlyerIndex
                        ? 'bg-red border border-white'
                        : 'bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Go to flyer ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            {/* <div className="absolute -bottom-6 -right-3 sm:-right-6 bg-navy-deep border-2 border-light-blue rounded-full w-28 h-28 flex flex-col items-center justify-center text-center shadow-lg rotate-[8deg]">
              <span className="font-[family-name:var(--font-mono)] text-[0.55rem] uppercase tracking-widest text-red">
                Total Pool
              </span>
              <span className="font-[family-name:var(--font-display)] text-2xl text-red-bright neon leading-none mt-1">
                $1,210
              </span>
              <span className="font-[family-name:var(--font-hand)] text-xs text-white/70">
                to give away
              </span>
            </div> */}
          </div>
        </div>

        {/*<div className="relative z-10 border-y border-light-blue/30 bg-navy-deep/70 backdrop-blur overflow-hidden">
          <div className="flex gap-10 py-3 whitespace-nowrap animate-[marquee_40s_linear_infinite] font-[family-name:var(--font-display)] text-2xl text-red/80">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="flex items-center gap-10">
                <span>♠ MONKEY MANIA WEEK</span>
                <span className="text-red-bright">✦</span>
                <span>LAST WEEK OF MAY</span>
                <span className="text-red-bright">♣</span>
                <span>NO COVER, ALL MISCHIEF</span>
                <span className="text-red-bright">♦</span>
              </span>
            ))}
          </div>
        </div>*/}
      </section>

      {/* ─────────────────────────── UPCOMING EVENTS ─────────────────────────── */}
      <section id="events" className="relative py-20 px-5 sm:px-10 bg-navy">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-red font-[family-name:var(--font-mono)]">
              Big Games Coming
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-headline)] text-5xl sm:text-6xl text-white">
              Special <em className="text-red">Events</em>
            </h2>
            <div className="deco-divider mt-6 max-w-sm mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Event 1: Ladies Night */}
            <div className="rounded-sm border-2 border-red-bright bg-navy-deep/75 backdrop-blur p-6 sm:p-8 shadow-[0_20px_60px_-20px_rgba(191,10,48,0.5)]">
              <h3 className="font-[family-name:var(--font-headline)] text-3xl sm:text-4xl text-red-bright neon mb-3">
                Ladies Night
              </h3>
              <p className="font-[family-name:var(--font-body)] text-white/80 mb-4">
                Get ready for a night dedicated to the queens of the felt. Date is pending for next week, stay tuned for the final call!
              </p>
              <div className="font-[family-name:var(--font-mono)] text-sm uppercase tracking-widest text-white/60">
                <span className="font-bold text-white">Date:</span> Next Week (TBA)
              </div>
            </div>

            {/* Event 2: Heads Up Tournament 2 */}
            <div className="rounded-sm border border-light-blue/40 bg-navy-deep/75 backdrop-blur p-6 sm:p-8">
              <h3 className="font-[family-name:var(--font-headline)] text-3xl sm:text-4xl text-white mb-3">
                The Heads Up Tournament 2
              </h3>
              <p className="font-[family-name:var(--font-body)] text-white/80 mb-4">
                The ultimate test of skill is back. Go one-on-one for the crown. The tournament kicks off as soon as we have 16 players locked in.
              </p>
              <div className="font-[family-name:var(--font-mono)] text-sm uppercase tracking-widest text-white/60">
                <span className="font-bold text-white">Requirement:</span> 16 Confirmed & Paid Players to Start
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── SCHEDULE ─────────────────────────── */}
      <section id="schedule" className="relative py-24 px-5 sm:px-10">
        <div className="absolute inset-0 -z-10">
          <Image src="/img/bg-schedule.png" alt="" fill className="object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-deep via-navy-deep/95 to-navy-deep" />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-red font-[family-name:var(--font-mono)]">
              This Month
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-headline)] text-5xl sm:text-6xl text-white">
              Jamming in <em className="text-red">July</em>
            </h2>
            <div className="deco-divider mt-6 max-w-sm mx-auto" />
            <p className="mt-4 font-[family-name:var(--font-body)] text-white/70 italic max-w-xl mx-auto">
              4 hot FREEROLLS. Don’t Monkey Around & Miss Out
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {SCHEDULE.map((night, idx) => (
              <article
                key={night.day}
                className={`relative rise group ${night.headline ? 'md:col-span-2' : ''}`}
                style={{ animationDelay: `${0.1 + idx * 0.08}s` }}
              >
                <div
                  className={`relative h-full rounded-sm border border-light-blue/30 bg-navy-deep/80 backdrop-blur p-6 overflow-hidden transition ${
                    night.headline ? 'md:p-10' : ''
                  } group-hover:border-red/80`}
                >
                  <span className="absolute top-2 left-2 text-light-blue/40 text-xs">✦</span>
                  <span className="absolute top-2 right-2 text-light-blue/40 text-xs">✦</span>
                  <span className="absolute bottom-2 left-2 text-light-blue/40 text-xs">✦</span>
                  <span className="absolute bottom-2 right-2 text-light-blue/40 text-xs">✦</span>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span
                          className="font-[family-name:var(--font-display)] text-xl neon"
                          style={{ color: night.accent }}
                        >
                          {night.day}
                        </span>
                        <span className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-widest text-white/50">
                          {night.date}
                        </span>
                      </div>
                      <h3 className="mt-1 font-[family-name:var(--font-headline)] text-3xl md:text-4xl text-white">
                        {night.title}
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-widest text-white/50">
                        Prize Pool
                      </div>
                      <div
                        className="font-[family-name:var(--font-display)] text-3xl md:text-4xl"
                        style={{ color: night.accent }}
                      >
                        {night.pool}
                      </div>
                    </div>
                  </div>

                  <div className="deco-divider my-5" />

                  <p className="font-[family-name:var(--font-body)] text-white/80 leading-relaxed">
                    {night.detail}
                  </p>

                  {night.headline && (
                    <div className="mt-6 flex flex-wrap gap-4 text-xs uppercase tracking-widest text-red/80 font-[family-name:var(--font-mono)]">
                      <span>✦ The Main Event</span>
                      <span>✦ Sat Winner Plays Free</span>
                      <span>✦ Winner Takes All</span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── BUDGET CAGE ─────────────────────────── */}
      {/*<section className="relative py-24 px-5 sm:px-10">
        <div className="absolute inset-0 -z-10">
          <Image src="/img/bg-budget.png" alt="" fill className="object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-deep via-navy to-navy-deep" />
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-red font-[family-name:var(--font-mono)]">
              Chapter Two
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-headline)] text-5xl sm:text-6xl text-white">
              The <em className="text-red">Cashier&#39;s</em> Ledger
            </h2>
            <p className="mt-4 font-[family-name:var(--font-body)] italic text-white/70">
              Every cent of the $1,210 budget, tracked live.
            </p>
          </div>

          <div className="relative rounded-sm border border-light-blue/40 bg-navy-deep/75 backdrop-blur p-6 sm:p-10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
            <span className="absolute -top-1 left-6 w-3 h-3 rounded-full bg-light-blue shadow-inner" />
            <span className="absolute -top-1 right-6 w-3 h-3 rounded-full bg-light-blue shadow-inner" />

            <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
              <div>
                <div className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.3em] text-white/50">
                  Allocated
                </div>
                <div className="font-[family-name:var(--font-display)] text-5xl text-red-bright neon mt-1">
                  {dollars(spent)}
                </div>
              </div>
              <div className="hidden md:block w-px h-16 bg-light-blue/30" />
              <div className="md:text-right">
                <div className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.3em] text-white/50">
                  Remaining
                </div>
                <div className="font-[family-name:var(--font-display)] text-5xl text-light-blue neon-green mt-1">
                  {dollars(remaining)}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="relative h-5 rounded-full bg-navy-deep border border-light-blue/30 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-red via-red-bright to-white shadow-[0_0_20px_rgba(191,10,48,0.5)]"
                  style={{ width: `${pct}%` }}
                />
                <div className="relative h-full flex items-center justify-center font-[family-name:var(--font-mono)] text-[0.65rem] tracking-widest uppercase text-navy-deep font-bold">
                  {pct}% of $1,210
                </div>
              </div>
            </div>

            <div className="mt-8 grid sm:grid-cols-2 gap-x-10 gap-y-2 font-[family-name:var(--font-mono)] text-sm">
              {budget.map((row) => (
                <div
                  key={row.id}
                  className="flex items-baseline justify-between border-b border-dashed border-light-blue/20 py-2"
                >
                  <span className="text-white/70">
                    {BUDGET_LABELS[row.category] ?? row.category}
                  </span>
                  <span className="text-red tabular-nums">{dollars(row.amount_cents)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>*/}

      {/* ─────────────────────────── SLOT ─────────────────────────── */}
      {/* <section id="slot" className="relative py-24 px-5 sm:px-10">
        <div className="absolute inset-0 -z-10">
          <Image src="/img/bg-felt.png" alt="" fill className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-deep via-transparent to-navy-deep" />
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-red font-[family-name:var(--font-mono)]">
              Chapter Three
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-headline)] text-5xl sm:text-6xl text-white">
              Pull the <em className="text-red">Vine</em>
            </h2>
            <p className="mt-4 font-[family-name:var(--font-body)] italic text-white/70 max-w-xl mx-auto">
              The house slot. Weekly payouts capped at $50 — more than enough to make someone scream.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rounded-xl bg-gradient-to-b from-light-blue/60 via-red/40 to-light-blue/60 blur-md" />
            <div className="relative rounded-xl overflow-hidden border-2 border-light-blue shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)]">
              <div className="bg-gradient-to-b from-oak to-navy-deep px-4 py-2 border-b border-light-blue/40 flex items-center justify-between">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="w-2 h-2 rounded-full bg-red" />
                  <span className="w-2 h-2 rounded-full bg-light-blue" />
                </div>
                <span className="font-[family-name:var(--font-display)] text-red text-sm tracking-widest neon">
                  MONKEY SLOT
                </span>
                <span className="w-10" />
              </div>
              <iframe
                src="https://slotbot-ide.vercel.app/play/monkey-business?mute=1"
                width="100%"
                height="600"
                style={{ border: 'none', display: 'block', background: '#001C4A' }}
                allowFullScreen
                title="Monkey Business slot"
              />
            </div>
          </div>
        </div>
      </section> */}

      {/* ─────────────────────────── JOIN THE CLUB ─────────────────────────── */}
      <section id="club" className="relative py-24 px-5 sm:px-10">
        <div className="absolute inset-0 -z-10">
          <Image src="/img/bg-jungle.png" alt="" fill className="object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-deep via-navy-deep/95 to-navy-deep" />
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-red font-[family-name:var(--font-mono)]">
              Chapter Four
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-headline)] text-5xl sm:text-6xl text-white">
              Join <em className="text-red">Monkey Biz</em>
            </h2>
            <p className="mt-4 font-[family-name:var(--font-body)] italic text-white/70 max-w-xl mx-auto">
              Download PokerBros and join the club. Click the referral link below and you&apos;ll be
              added to Monkey Biz Poker automatically.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left — QR code + club info */}
            <div className="rounded-sm border border-light-blue/40 bg-navy-deep/75 backdrop-blur p-6 sm:p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
              <div className="flex flex-col items-center text-center">
                <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white rounded-lg p-2.5 shadow-lg">
                  <Image
                    src="/img/pokerbros-qr-official.png"
                    alt="Scan to join Monkey Biz Poker on PokerBros"
                    width={224}
                    height={224}
                    className="w-full h-full"
                  />
                </div>
                <p className="mt-4 font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.25em] text-white/50">
                  Scan with your phone camera
                </p>

                <div className="mt-6 w-full">
                  <div className="rounded border border-light-blue/30 bg-navy/30 p-4 text-center">
                    <div className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-white/50 mb-1">
                      Club ID
                    </div>
                    <div className="font-[family-name:var(--font-display)] text-2xl text-red-bright neon">
                      1670819
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — steps */}
            <div className="space-y-5">
              <div className="rounded-sm border border-light-blue/30 bg-navy-deep/75 backdrop-blur p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-full bg-red text-white font-bold flex items-center justify-center font-[family-name:var(--font-mono)]">1</span>
                  <span className="font-[family-name:var(--font-headline)] text-xl text-white">Download PokerBros</span>
                </div>
                <p className="font-[family-name:var(--font-body)] text-white/70 mb-4">
                  Free app available on iPhone and Android. Takes 30 seconds.
                </p>
                <div className="flex gap-3">
                  <a
                    href="https://i.pokerbros.net/D1LwWJqsU2b"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-4 py-2.5 bg-gradient-to-b from-red-bright to-red text-white rounded font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest shadow-[0_3px_0_rgba(0,0,0,0.3)] hover:translate-y-[1px] transition"
                  >
                    App Store
                  </a>
                  <a
                    href="https://i.pokerbros.net/D1LwWJqsU2b"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-4 py-2.5 bg-gradient-to-b from-red-bright to-red text-white rounded font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest shadow-[0_3px_0_rgba(0,0,0,0.3)] hover:translate-y-[1px] transition"
                  >
                    Google Play
                  </a>
                </div>
              </div>

              <div className="rounded-sm border border-light-blue/30 bg-navy-deep/75 backdrop-blur p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-full bg-red text-white font-bold flex items-center justify-center font-[family-name:var(--font-mono)]">2</span>
                  <span className="font-[family-name:var(--font-headline)] text-xl text-white">Join the Club</span>
                </div>
                <p className="font-[family-name:var(--font-body)] text-white/70 mb-4">
                  Tap the link below from your phone. It opens PokerBros and auto-adds you to
                  Monkey Biz Poker — no club code needed.
                </p>
                <a
                  href="https://i.pokerbros.net/D1LwWJqsU2b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-6 py-4 border-2 border-red-bright text-red-bright rounded font-[family-name:var(--font-display)] tracking-wider text-2xl hover:bg-red/20 transition"
                >
                  JOIN MONKEY BIZ
                </a>
              </div>

              <div className="rounded-sm border border-light-blue/30 bg-navy-deep/75 backdrop-blur p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-full bg-red text-white font-bold flex items-center justify-center font-[family-name:var(--font-mono)]">3</span>
                  <span className="font-[family-name:var(--font-headline)] text-xl text-white">Or Join Manually</span>
                </div>
                <p className="font-[family-name:var(--font-body)] text-white/70">
                  Open PokerBros, tap &ldquo;Search Club,&rdquo; and enter Club ID <strong className="text-red">1670819</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── PROMOTIONS ─────────────────────────── */}
      <section id="promotions" className="relative py-20 px-5 sm:px-10">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-deep via-navy/60 to-navy-deep" />
          <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
              <span className="text-[0.7rem] uppercase tracking-[0.3em] text-red font-[family-name:var(--font-mono)]">
                  Spread the Word
              </span>
              <h2 className="mt-3 font-[family-name:var(--font-headline)] text-5xl sm:text-6xl text-white">
                  Share the <em className="text-red">Action</em>
              </h2>
              <p className="mt-4 font-[family-name:var(--font-body)] italic text-white/70 max-w-xl mx-auto">
                  Invite your friends, join the community, and get in on the conversation.
              </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                  <a href="https://t.me/Monkeybizpoker" target="_blank" rel="noopener noreferrer" className="block p-6 rounded-sm border border-light-blue/30 bg-navy-deep/75 backdrop-blur hover:border-red/70 transition">
                      <h3 className="font-[family-name:var(--font-headline)] text-2xl text-red">Join on Telegram</h3>
                      <p className="text-white/70">Get updates, chat with players, and never miss a game.</p>
                  </a>
                  <button onClick={() => navigator.clipboard.writeText('https://monkeybizpoker.com')} className="block p-6 rounded-sm border border-light-blue/30 bg-navy-deep/75 backdrop-blur hover:border-red/70 transition text-left">
                      <h3 className="font-[family-name:var(--font-headline)] text-2xl text-red">Share This Page</h3>
                      <p className="text-white/70">Copy a link to the site and send it to your crew.</p>
                  </button>
              </div>
          </div>
      </section>

      {/* ─────────────────────────── MERCH ─────────────────────────── */}
      <section id="merch" className="relative py-24 px-5 sm:px-10">
          <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-b from-navy-deep via-navy-deep/95 to-navy-deep" />
          </div>
          <div className="max-w-5xl mx-auto">
              <div className="text-center">
              <span className="text-[0.7rem] uppercase tracking-[0.3em] text-red font-[family-name:var(--font-mono)]">
                  Coming Soon
              </span>
              <h2 className="mt-3 font-[family-name:var(--font-headline)] text-5xl sm:text-6xl text-white">
                  Monkey <em className="text-red">Merch</em>
              </h2>
              <p className="mt-4 font-[family-name:var(--font-body)] italic text-white/70 max-w-xl mx-auto">
                  T-shirts, hoodies, card protectors, and more. Stay tuned for the drop.
              </p>
              </div>
          </div>
      </section>

      {/* ─────────────────────────── CONTACT ─────────────────────────── */}
      <section id="contact" className="relative py-20 px-5 sm:px-10">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-deep via-navy/60 to-navy-deep" />
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-red font-[family-name:var(--font-mono)]">
              Got Questions?
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-headline)] text-5xl sm:text-6xl text-white">
              Talk to a <em className="text-red">Monkey</em>
            </h2>
            <p className="mt-4 font-[family-name:var(--font-body)] italic text-white/70 max-w-xl mx-auto">
              Ring the hosts or slide into Telegram. We don&apos;t bite.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { name: 'Banana Lou', phone: '509-666-2743', phoneHref: 'tel:+15096662743', tg: '@Monkeybizpoker', tgHref: 'https://t.me/Monkeybizpoker' },
              { name: 'Donkey Diesel', phone: '302-784-4793', phoneHref: 'tel:+13027844793', tg: '@BigDiesel22', tgHref: 'https://t.me/BigDiesel22' },
            ].map((c) => (
              <div
                key={c.name}
                className="relative rounded-sm border border-light-blue/30 bg-navy-deep/75 backdrop-blur p-6 sm:p-8 overflow-hidden group hover:border-red/70 transition"
              >
                <span className="absolute top-2 left-2 text-light-blue/40 text-xs">✦</span>
                <span className="absolute top-2 right-2 text-light-blue/40 text-xs">✦</span>
                <span className="absolute bottom-2 left-2 text-light-blue/40 text-xs">✦</span>
                <span className="absolute bottom-2 right-2 text-light-blue/40 text-xs">✦</span>

                <div className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.25em] text-white/50 mb-1">
                  Host
                </div>
                <h3 className="font-[family-name:var(--font-headline)] text-3xl sm:text-4xl text-red mb-5">
                  {c.name}
                </h3>

                <div className="space-y-3">
                  <a
                    href={c.phoneHref}
                    className="flex items-center gap-3 p-3 rounded bg-navy/30 border border-light-blue/20 hover:border-red/60 hover:bg-navy/50 transition touch-manipulation"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red shrink-0">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <div className="flex-1">
                      <div className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-widest text-white/50">
                        Phone
                      </div>
                      <div className="font-[family-name:var(--font-mono)] text-white">
                        {c.phone}
                      </div>
                    </div>
                  </a>

                  <a
                    href={c.tgHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded bg-navy/30 border border-light-blue/20 hover:border-red/60 hover:bg-navy/50 transition touch-manipulation"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-red shrink-0">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                    <div className="flex-1">
                      <div className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-widest text-white/50">
                        Telegram
                      </div>
                      <div className="font-[family-name:var(--font-mono)] text-white">
                        {c.tg}
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── THE WALL ─────────────────────────── */}
      <section id="wall" className="relative py-24 px-5 sm:px-10 bg-gradient-to-b from-navy-deep to-[#052112]">
        <div className="absolute inset-0 -z-10">
          <Image src="/img/bg-wall.png" alt="" fill className="object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-deep via-navy-deep/90 to-[#052112]" />
        </div>
        <div className="max-w-6xl mx-auto">
          {/* HEADER BAR (FROM PHONE MOCKUP) */}
          <div className="flex justify-between items-center pb-6 mb-8 border-b border-light-blue/20">
            <span className="font-[family-name:var(--font-display)] text-banana text-lg sm:text-xl tracking-wider">
              Monkey Biz Poker
            </span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setActiveWallTab('bad_beat');
                  setTimeout(() => {
                    document.getElementById('wall-form-container')?.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                }}
                className="relative px-5 py-2 rounded-full bg-gradient-to-r from-yellow via-amber-400 to-yellow text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(250,204,21,0.5)] hover:shadow-[0_0_22px_rgba(250,204,21,0.85)] border-2 border-white/20 flex items-center gap-1.5 font-[family-name:var(--font-mono)]"
              >
                <span className="text-sm select-none animate-bounce">🍌</span>
                <span>Splat a Bad Beat</span>
              </button>
              <div className="w-8 h-8 rounded-full bg-yellow/10 border border-yellow/30 flex items-center justify-center font-bold text-sm text-yellow">
                🐒
              </div>
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="font-[family-name:var(--font-headline)] text-5xl sm:text-6xl text-white">
              The <em className="text-red">Wall</em>
            </h2>
            <p className="mt-4 font-[family-name:var(--font-body)] italic text-white/70 max-w-xl mx-auto">
              Brag, rib, propose a prop bet, or leave a love letter to your nut flush. Make it look
              however you want.
            </p>
          </div>

          {/* TAB BAR (FROM PHONE MOCKUP) */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-full bg-navy-deep/80 p-1.5 border border-light-blue/20 shadow-lg">
              <button
                type="button"
                onClick={() => setActiveWallTab('general')}
                className={`px-6 py-2.5 rounded-full font-[family-name:var(--font-display)] text-sm tracking-wider transition-all duration-150 cursor-pointer ${
                  activeWallTab === 'general'
                    ? 'bg-red text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Chat & Brags
              </button>
              <button
                type="button"
                onClick={() => setActiveWallTab('bad_beat')}
                className={`relative px-6 py-2.5 rounded-full font-[family-name:var(--font-display)] text-sm tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  activeWallTab === 'bad_beat'
                    ? 'bg-yellow text-felt-deep font-black shadow-[0_0_15px_rgba(250,204,21,0.6)]'
                    : 'text-yellow/80 hover:text-yellow hover:bg-yellow/10'
                }`}
              >
                <span>Banana Splats</span>
                <span>🍌</span>
                
                {posts.filter(p => p.is_bad_beat).length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-yellow text-felt-deep text-[0.65rem] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-felt-deep shadow">
                    {posts.filter(p => p.is_bad_beat).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* WEEKLY WINNER BANNER */}
          {activeWallTab === 'bad_beat' && weeklyWinner && (
            <div className="w-full max-w-xl mx-auto mb-10 bg-navy-deep/90 border-2 border-yellow rounded-2xl p-6 shadow-[0_0_25px_rgba(250,204,21,0.3)] text-center relative overflow-hidden float">
              {/* Decorative top gold crown glow */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow via-gold to-yellow" />
              
              <span className="text-2xl sm:text-3xl block mb-2 font-[family-name:var(--font-display)] tracking-wider text-yellow neon-green">
                👑 REIGNING BAD BEAT CHAMP 👑
              </span>
              
              <div className="mt-1 bg-yellow/10 border border-yellow/30 rounded-lg py-2 px-4 inline-block mx-auto mb-4">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-cream/70 block">Crowned To:</span>
                <span className="text-lg font-black text-yellow font-mono tracking-wider">{weeklyWinner.author}</span>
              </div>

              <div className="relative my-4 px-4 py-2 border-l-2 border-yellow/50 bg-white/5 rounded-r-lg max-w-md mx-auto text-left">
                <span className="absolute -top-3 left-2 text-3xl text-yellow/20 select-none font-serif">&ldquo;</span>
                <p className="text-xs sm:text-sm text-cream/90 font-[family-name:var(--font-body)] italic line-clamp-3 leading-relaxed">
                  {weeklyWinner.message}
                </p>
                <span className="absolute -bottom-6 right-2 text-3xl text-yellow/20 select-none font-serif">&rdquo;</span>
              </div>

              {/* WATCH HAND REPLAY BUTTON FOR THE CHAMPION */}
              {(() => {
                const linkMatch = weeklyWinner.message.match(/https?:\/\/[^\s]+/);
                if (linkMatch) {
                  const url = linkMatch[0];
                  return (
                    <div className="mt-6 mb-4">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-yellow via-gold to-yellow text-felt-deep font-black rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(250,204,21,0.6)] transition-all duration-200 text-xs sm:text-sm shadow-md cursor-pointer select-none"
                      >
                        <span>🎬 WATCH WINNING REPLAY</span>
                        <span>🃏</span>
                      </a>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="mt-6 pt-4 border-t border-yellow/10">
                <div className="text-[0.6rem] font-black font-mono text-yellow uppercase tracking-widest mb-3">
                  🔥 CHAMPION STATS ({weeklyWinner.score} Total Votes) 🔥
                </div>
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 text-[0.65rem] font-bold font-mono">
                  <span className="px-2.5 py-1 bg-white/5 rounded-full border border-white/5 text-cream/80">🫟 {weeklyWinner.splatCount || 0} Splats</span>
                  <span className="px-2.5 py-1 bg-white/5 rounded-full border border-white/5 text-cream/80">🤢 {weeklyWinner.sufferCount || 0} Suffers</span>
                  <span className="px-2.5 py-1 bg-white/5 rounded-full border border-white/5 text-cream/80">🧊 {weeklyWinner.iceCount || 0} Ice Clicks</span>
                  <span className="px-2.5 py-1 bg-white/5 rounded-full border border-white/5 text-cream/80">💬 {weeklyWinner.commentsCount || 0} Comments</span>
                  <span className="px-2.5 py-1 bg-white/5 rounded-full border border-white/5 text-cream/80">🍌 {weeklyWinner.ratingsCount || 0} Ratings</span>
                </div>
              </div>
            </div>
          )}

          {/* BAD BEAT CONTEST RULES */}
          {activeWallTab === 'bad_beat' && (
            <div className="w-full max-w-xl mx-auto mb-10 bg-navy-deep/80 border border-yellow/30 rounded-xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow/5 to-transparent pointer-events-none" />
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-2xl animate-bounce">🍌</span>
                <h3 className="font-[family-name:var(--font-display)] text-xl text-yellow uppercase tracking-wider">
                  Splat a Bad Beat — Contest Rules
                </h3>
                <span className="text-2xl animate-bounce">🍌</span>
              </div>
              <div className="space-y-3 text-sm text-cream/90 font-[family-name:var(--font-body)]">
                <p className="text-center italic text-xs text-white/60 mb-2">
                  Got coolered? Splatted on the river? Don't suffer in silence—share your pain on the Wall!
                </p>
                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                  <span className="text-lg">🎯</span>
                  <div>
                    <strong className="text-white block font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider mb-0.5">The Goal:</strong>
                    Paste your PokerBros hand link and story. The bad beat hand with the most community support wins!
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                  <span className="text-lg">🗳️</span>
                  <div>
                    <strong className="text-white block font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider mb-0.5">Your Votes:</strong>
                    Everyone gets <strong className="text-yellow">20 votes a day</strong> to spread around. Splat, suffer, or ice the hands you think deserve the weekly crown!
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                  <span className="text-lg">🏆</span>
                  <div>
                    <strong className="text-white block font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider mb-0.5">Weekly Contest:</strong>
                    The wall resets every week, and the top-voted bad beat story is crowned the champion.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FORM CONTAINER */}
          <div id="wall-form-container" className="rounded-sm border border-light-blue/30 bg-navy-deep/70 backdrop-blur p-6 sm:p-10 mb-14">
            <WallForm 
              isBadBeat={activeWallTab === 'bad_beat'} 
              placeholder={
                activeWallTab === 'bad_beat' 
                  ? "Paste your PokerBros hand link here (e.g. https://s.pokerbros.net/?t=...) along with your story!"
                  : "Brag, rib, or leave a love letter..."
              }
            />
          </div>

          {/* CARDS LIST */}
          {(() => {
            const filteredPosts = posts.filter((p) => 
              activeWallTab === 'bad_beat' ? p.is_bad_beat : !p.is_bad_beat
            )

            if (filteredPosts.length === 0) {
              return (
                <div className="text-center py-16">
                  <p className="font-[family-name:var(--font-hand)] text-3xl text-red/70">
                    {activeWallTab === 'bad_beat' 
                      ? 'No bad beats posted yet. Slipped up?'
                      : 'Nothing on the wall yet. Be first.'}
                  </p>
                </div>
              )
            }

            return (
              <div className="columns-1 sm:columns-2 lg:columns-4 gap-6 [column-fill:_balance]">
                {filteredPosts.map((p, i) => (
                  <div key={p.id} className="mb-6 break-inside-avoid">
                    <WallPost post={p} index={i} />
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      </section>

      {/* ─────────────────────────── FOOTER ─────────────────────────── */}
      <footer className="relative py-14 px-5 sm:px-10 border-t border-light-blue/30 bg-navy-deep">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-[auto_1fr_auto] items-center gap-6">
          <div>
            <div className="font-[family-name:var(--font-display)] text-red text-2xl neon">
              MONKEY BIZ POKER
            </div>
            <div className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.3em] text-white/50 mt-1">
              Private poker lounge · Est. 2023
            </div>
          </div>
          <div className="text-center text-white/50 font-[family-name:var(--font-display)] text-xl neon-green">
            The Card Game Is Bananas!!!
          </div>
          <div className="sm:text-right font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.3em] text-white/50">
            © {new Date().getFullYear()} M.B.
          </div>
        </div>
      </footer>

      <PokerBrosFAB />
    </main>
  )
}
