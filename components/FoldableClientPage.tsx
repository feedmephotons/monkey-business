"use client";

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import WallForm from '@/components/WallForm'
import WallPost from '@/components/WallPost'
import PokerBrosFAB from '@/components/PokerBrosFAB'
import ScratchCard from '@/components/ScratchCard'
import Calendar from '@/components/Calendar'
import type { WallPost as WallPostType, BudgetRow } from '@/lib/supabase'
import type { EnrichedWallPost } from '@/app/page'

const FLYERS = [
  { src: '/img/hero-10-spot-flyer.png', alt: "Monkey's 10 Spot Tournament - Every Saturday at Noon Eastern", scrollTo: '#events' },
  { src: '/img/hero-heads-up-flyer.png', alt: "Heads Up Tournament - 1 Round Elimination All Month Long", href: '/bracket' },
  { src: '/img/hero-august-calendar.png', alt: "August 2026 Club Schedule - Full Month Calendar", scrollTo: '#schedule' },
  { src: '/img/hero-ladies-night.png', alt: "Ladies Night Tournament - Last Saturday of Every Month", scrollTo: '#events' },
  { src: '/img/hero-contest-flyer.png', alt: 'Enter our weekly contest - SPLAT A Bad Beat!', scrollTo: '#wall-tab-section', isContest: true },
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
    { day: 'SUN', date: 'Aug 2', title: 'Freeroll', pool: '250', detail: 'Kick off the month with free money. No better way to end the weekend.', accent: 'var(--color-light-blue)' },
    { day: 'MON', date: 'Aug 10', title: 'Freeroll', pool: '250', detail: 'Your case of the Mondays just got cured. Free chips to start the week.', accent: 'var(--color-red)' },
    { day: 'SAT', date: 'Aug 22', title: 'Freeroll', pool: '250', detail: "Saturday Night Stacks. The weekend's in full swing and so are the cards. Ante up.", accent: 'var(--color-red-bright)' },
    { day: 'MON', date: 'Aug 31', title: 'Freeroll', pool: '250', detail: 'August Heat Finale! End the month on a high note. Nothing beats a winning hand you didn’t have to pay for.', accent: 'var(--color-light-blue)' },
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
  // Force scroll to top on refresh
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    }
  }, []);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    events: true,
    schedule: true,
    club: false,
    promotions: false,
    merch: false,
    contact: false,
    wall: true,
    music: false,
  })

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const [activeFlyerIndex, setActiveFlyerIndex] = useState(0)
  const [rsvpName, setRsvpName] = useState('')
  const [isRsvped, setIsRsvped] = useState(false)
  const [showRsvpInput, setShowRsvpInput] = useState(false)

  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)
  const [shareText, setShareText] = useState("Share Song")
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [spinAngle, setSpinAngle] = useState(0)
  const [isScratching, setIsScratching] = useState(false)
  const scratchStartRef = useRef<number>(0)
  const scratchTimeRef = useRef<number>(0)
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null)

  // Turntable spin loop and auto-scroll lyrics
  useEffect(() => {
    let animId: number;
    const updateLoop = () => {
      if (isMusicPlaying && !isScratching) {
        setSpinAngle(prev => (prev + 1.2) % 360);
      }
      
      // Auto-scroll lyrics based on current track position
      if (audioRef.current && lyricsContainerRef.current && isMusicPlaying) {
        const { currentTime, duration } = audioRef.current;
        if (duration > 0) {
          const pct = currentTime / duration;
          const container = lyricsContainerRef.current;
          const targetScroll = pct * (container.scrollHeight - container.clientHeight);
          container.scrollTop = targetScroll;
        }
      }
      
      animId = requestAnimationFrame(updateLoop);
    };
    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [isMusicPlaying, isScratching]);

  // Handle scratching interaction on the vinyl record
  const handleVinylStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!audioRef.current) return;
    setIsScratching(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    scratchStartRef.current = clientX;
    scratchTimeRef.current = audioRef.current.currentTime;
    audioRef.current.pause();
  };

  const handleVinylMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isScratching || !audioRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - scratchStartRef.current;
    
    // Scale deltaX to seconds (e.g., 100px of drag is 1.5 seconds of scrubbing)
    const timeShift = (deltaX / 100) * 1.5;
    let newTime = scratchTimeRef.current + timeShift;
    
    // Bound the audio scrubbing
    if (audioRef.current.duration) {
      newTime = Math.max(0, Math.min(audioRef.current.duration, newTime));
      audioRef.current.currentTime = newTime;
      
      // Rotate vinyl with the scratch drag
      setSpinAngle(prev => (prev + deltaX * 0.5) % 360);
      
      // Rapid play/pause to generate the scratching audio effect
      if (audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const handleVinylEnd = () => {
    if (!isScratching) return;
    setIsScratching(false);
    if (isMusicPlaying && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "Monkey Biz Poker Anthem",
      text: "Listen to the brand-new Monkey Biz Poker theme song! 🎰🎶",
      url: "https://monkeybizpoker.com"
    };
    
    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText("https://monkeybizpoker.com");
        setShareText("Copied! 📋");
        setTimeout(() => setShareText("Share Song"), 2000);
      }
    } catch (err) {
      try {
        await navigator.clipboard.writeText("https://monkeybizpoker.com");
        setShareText("Copied! 📋");
        setTimeout(() => setShareText("Share Song"), 2000);
      } catch (clipErr) {
        console.log(clipErr);
      }
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause()
        setIsMusicPlaying(false)
      } else {
        audioRef.current.play()
          .then(() => {
            setIsMusicPlaying(true)
          })
          .catch(err => {
            console.log("Audio play blocked on iOS:", err)
            // Fallback for immediate state toggle
            setIsMusicPlaying(true)
          })
      }
    }
  }

  // Pause music on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  // Load RSVP state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mb_rsvp_name_aug3')
      if (saved) {
        setRsvpName(saved)
        setIsRsvped(true)
      }
    }
  }, [])

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
    }, 3900) // Changes every 3.9 seconds

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
            <a href="#wall" onClick={() => setActiveWallTab('general')} className="hover:text-red transition">
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

            {/* Heads Up Bracket Link (Noticeable High-Impact Pulsing Button) */}
            <div className="pt-4 pl-1">
              <a
                href="/bracket"
                className="group relative inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#bd0000] to-[#ff0000] hover:from-[#d00000] hover:to-[#ff2020] border border-red/40 text-white rounded font-mono text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(255,0,0,0.45)] hover:-translate-y-[1px] active:translate-y-[1px] transition-all duration-300 animate-[pulse_2s_infinite]"
              >
                {/* Pulsing Yellow Radar Indicator */}
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow"></span>
                </span>
                
                <span className="font-extrabold tracking-[0.15em]">Heads Up Bracket Standings</span>
                
                <span className="text-sm group-hover:scale-125 transition-transform">🏆</span>
              </a>
            </div>

            {/* Listen to Club Anthem Link (Upgraded High-Impact Attention-Grabbing Wiggle Button with Dynamic Neon Color Shift) */}
            <div className="pt-4 pl-1">
              <a
                href="#music"
                className="group relative inline-flex items-center gap-3 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 border-2 text-white rounded font-mono text-xs uppercase tracking-widest shadow-lg hover:-translate-y-[1px] active:translate-y-[1px] transition-all duration-300 animate-[bounce_3s_infinite,colorShift_8s_linear_infinite]"
              >
                {/* Custom Keyframe Styles injected directly */}
                <style jsx>{`
                  @keyframes colorShift {
                    0%, 100% {
                      border-color: #ffffff;
                      color: #ffffff;
                      box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
                    }
                    25% {
                      border-color: #00d2ff; /* neon electron blue */
                      color: #00d2ff;
                      box-shadow: 0 0 15px rgba(0, 210, 255, 0.4);
                    }
                    50% {
                      border-color: #ffd13b; /* neon yellow */
                      color: #ffd13b;
                      box-shadow: 0 0 15px rgba(255, 209, 59, 0.4);
                    }
                    75% {
                      border-color: #39ff14; /* neon lime green */
                      color: #39ff14;
                      box-shadow: 0 0 15px rgba(57, 255, 20, 0.4);
                    }
                  }
                `}</style>

                {/* Pulsing Neon Radar Indicator */}
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-current"></span>
                </span>
                
                <span className="font-extrabold tracking-[0.15em]">Listen to the Club Anthem</span>
                
                {/* Animated Music Note and Speaker */}
                <span className="inline-flex items-center gap-1 group-hover:animate-bounce">
                  <span className="text-white">🎵</span>
                  <span className="text-red-500 font-bold">🔊</span>
                </span>
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
              onClick={() => {
                const currentFlyer = FLYERS[activeFlyerIndex];
                if ((currentFlyer as any).href) {
                  window.location.href = (currentFlyer as any).href;
                } else if (currentFlyer.scrollTo) {
                  if (currentFlyer.isContest) {
                    setActiveWallTab('bad_beat');
                  }
                  setTimeout(() => {
                    const id = currentFlyer.scrollTo.replace('#', '');
                    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                  }, 50);
                }
              }}
              className={`relative rounded-lg overflow-hidden ring-2 ring-light-blue/50 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] group transition-all ${
                FLYERS[activeFlyerIndex].scrollTo || (FLYERS[activeFlyerIndex] as any).href ? 'cursor-pointer hover:ring-yellow hover:scale-[1.01]' : 'cursor-grab active:cursor-grabbing'
              }`}
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
      <section id="events" className="relative bg-navy border-b border-white/5">
        <div 
          onClick={() => toggleSection('events')}
          className="py-8 px-5 sm:px-10 max-w-5xl mx-auto flex justify-between items-center cursor-pointer select-none group"
        >
          <div>
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-red font-[family-name:var(--font-mono)]">
              Big Games Coming
            </span>
            <h2 className="mt-1 font-[family-name:var(--font-headline)] text-4xl sm:text-5xl text-white">
              Special <em className="text-red">Events</em>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest font-mono text-white/40 group-hover:text-yellow transition-all">
              {openSections.events ? 'COLLAPSE ▲' : 'EXPAND ▼'}
            </span>
            <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all ${openSections.events ? 'bg-red text-black border-red' : 'bg-transparent text-white'}`}>
              {openSections.events ? '✕' : '＋'}
            </div>
          </div>
        </div>

        {openSections.events && (
          <div className="pb-20 px-5 sm:px-10 max-w-5xl mx-auto animate-fade-in">

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Event 1: Ladies Night */}
            <div className="rounded-sm border-2 border-[#ff007f] bg-navy-deep/75 backdrop-blur p-6 sm:p-8 shadow-[0_0_20px_rgba(255,0,127,0.65)]" style={{ boxShadow: '0 0 20px rgba(255,0,127,0.55)' }}>
              <h3 className="font-[family-name:var(--font-headline)] text-3xl sm:text-4xl text-[#bd00ff] mb-3" style={{ textShadow: '0 0 15px rgba(189,0,255,0.95), 0 0 5px rgba(189,0,255,0.6)' }}>
                Ladies Night
              </h3>
              <p className="font-[family-name:var(--font-body)] text-white/80 mb-4">
                Get ready for a night dedicated to the queens of the felt. Enjoy half off for verified ladies as we crown this month's champion!
              </p>
              <div className="font-[family-name:var(--font-mono)] text-sm uppercase tracking-widest text-white/60">
                <span className="font-bold text-white">Date:</span> August 29th @ 9 PM Eastern
              </div>
            </div>

            {/* Event 2: Heads Up Tournament 2 */}
            <div className="rounded-sm border-2 border-[#ff0000]/60 bg-navy-deep/75 backdrop-blur p-6 sm:p-8 shadow-[0_0_20px_rgba(255,0,0,0.35)]">
              <h3 className="font-[family-name:var(--font-scary)] text-3xl sm:text-4xl text-[#ff0000] mb-3 tracking-wider leading-relaxed" style={{ textShadow: '0 0 15px rgba(255,0,0,0.95), 0 0 5px rgba(255,0,0,0.6)' }}>
                The Heads Up Tournament 2
              </h3>
              <p className="font-[family-name:var(--font-body)] text-white/80 mb-4">
                Head 2 Head tournament is back! 1 round elimination. Looking for the 4 players to reach the top of the bracket. The tournament will kick off as soon as we have 16 players locked in.
              </p>
              <div className="font-[family-name:var(--font-mono)] text-sm uppercase tracking-widest text-white/60 mb-5">
                <span className="font-bold text-white">Requirement:</span> 16 Confirmed & Paid Players to Start
              </div>
              <div>
                <a
                  href="/bracket"
                  className="group inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff0000] hover:bg-[#bd0000] text-white text-xs font-mono uppercase tracking-widest rounded transition-all shadow-[0_4px_12px_rgba(255,0,0,0.35)] hover:shadow-[0_4px_20px_rgba(255,0,0,0.55)]"
                >
                  View Live Bracket 🏆
                  <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </div>
            </div>

            {/* Event 3: 1-2 Cash Game RSVP */}
            <div className="rounded-sm border-2 border-[#39ff14] bg-navy-deep/75 backdrop-blur p-6 sm:p-8 shadow-[0_0_20px_rgba(57,255,20,0.45)]" style={{ boxShadow: '0 0 20px rgba(57,255,20,0.35)' }}>
              <h3 className="font-[family-name:var(--font-headline)] text-3xl sm:text-4xl text-[#39ff14] mb-3" style={{ textShadow: '0 0 15px rgba(57,255,20,0.95), 0 0 5px rgba(57,255,20,0.6)' }}>
                1-2 Cash Game
              </h3>
              <p className="font-[family-name:var(--font-body)] text-white/80 mb-4">
                Let's go bananas, dial up the blinds. Secure your seat at the table now!
              </p>
              <div className="font-[family-name:var(--font-mono)] text-sm uppercase tracking-widest text-white/60 mb-6">
                <span className="font-bold text-white">Date:</span> August 3rd @ 8 PM Eastern
              </div>

              {/* RSVP Form */}
              <div className="mt-4">
                {!showRsvpInput && !isRsvped && (
                  <button
                    onClick={() => setShowRsvpInput(true)}
                    className="w-full py-3 px-4 rounded border-2 border-[#39ff14] bg-[#39ff14]/10 text-[#39ff14] font-[family-name:var(--font-mono)] font-bold text-sm tracking-widest uppercase hover:bg-[#39ff14] hover:text-black transition-all duration-300 shadow-[0_0_10px_rgba(57,255,20,0.2)] hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] active:scale-95"
                  >
                    RSVP SEAT 💸
                  </button>
                )}

                {showRsvpInput && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Enter Screen Name..."
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                      className="w-full bg-navy-deep/90 border border-[#39ff14]/40 text-white placeholder-white/30 rounded py-2.5 px-4 font-[family-name:var(--font-body)] text-sm focus:outline-none focus:border-[#39ff14] focus:ring-1 focus:ring-[#39ff14] transition-all"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (rsvpName.trim()) {
                            setIsRsvped(true)
                            setShowRsvpInput(false)
                            localStorage.setItem('mb_rsvp_name_aug3', rsvpName.trim())
                          }
                        }}
                        className="flex-1 py-2 px-3 rounded bg-[#39ff14] text-black font-[family-name:var(--font-mono)] font-bold text-xs tracking-wider uppercase hover:opacity-90 active:scale-95 transition-all"
                      >
                        Confirm RSVP
                      </button>
                      <button
                        onClick={() => setShowRsvpInput(false)}
                        className="py-2 px-3 rounded border border-white/20 text-white/60 font-[family-name:var(--font-mono)] text-xs tracking-wider uppercase hover:text-white transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {isRsvped && (
                  <div className="rounded border border-[#39ff14]/30 bg-[#39ff14]/5 p-4 text-center">
                    <div className="text-[#39ff14] font-[family-name:var(--font-mono)] font-bold text-sm tracking-wider mb-1">
                      ✓ SEAT RESERVED!
                    </div>
                    <div className="text-white/80 font-[family-name:var(--font-body)] text-xs mb-3">
                      Screen Name: <span className="text-[#39ff14] font-semibold">{rsvpName}</span>
                    </div>
                    <button
                      onClick={() => {
                        setIsRsvped(false)
                        setShowRsvpInput(true)
                      }}
                      className="text-[10px] font-[family-name:var(--font-mono)] text-white/40 uppercase tracking-widest hover:text-white underline decoration-dotted transition-all"
                    >
                      Change Name
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        )}
      </section>

      {/* ─────────────────────────── SCHEDULE ─────────────────────────── */}
      <section id="schedule" className="relative border-b border-white/5">
        <div className="absolute inset-0 -z-10">
          <Image src="/img/bg-schedule.png" alt="" fill className="object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-deep via-navy-deep/95 to-navy-deep" />
        </div>

        <div 
          onClick={() => toggleSection('schedule')}
          className="relative z-10 py-8 px-5 sm:px-10 max-w-6xl mx-auto flex justify-between items-center cursor-pointer select-none group"
        >
          <div>
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-red font-[family-name:var(--font-mono)]">
              This Month
            </span>
            <h2 className="mt-1 font-[family-name:var(--font-headline)] text-4xl sm:text-5xl text-white">
              August <em className="text-red">Schedule</em>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest font-mono text-white/40 group-hover:text-yellow transition-all">
              {openSections.schedule ? 'COLLAPSE ▲' : 'EXPAND ▼'}
            </span>
            <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all ${openSections.schedule ? 'bg-red text-black border-red' : 'bg-transparent text-white'}`}>
              {openSections.schedule ? '✕' : '＋'}
            </div>
          </div>
        </div>

        {openSections.schedule && (
          <div className="relative z-10 pb-20 px-5 sm:px-10 max-w-6xl mx-auto animate-fade-in">
            <p className="font-[family-name:var(--font-body)] text-white/70 italic max-w-xl mx-auto mb-10 text-center">
              Interactive Club Calendar. Tap or hover on dates to plan your games.
            </p>
            <Calendar />
          </div>
        )}
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
      <section id="club" className="relative border-b border-white/5">
        <div className="absolute inset-0 -z-10">
          <Image src="/img/bg-jungle.png" alt="" fill className="object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-deep via-navy-deep/95 to-navy-deep" />
        </div>

        <div 
          onClick={() => toggleSection('club')}
          className="relative z-10 py-8 px-5 sm:px-10 max-w-5xl mx-auto flex justify-between items-center cursor-pointer select-none group"
        >
          <div>
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-red font-[family-name:var(--font-mono)]">
              Chapter Four
            </span>
            <h2 className="mt-1 font-[family-name:var(--font-headline)] text-4xl sm:text-5xl text-white">
              Join <em className="text-red">Monkey Biz</em>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest font-mono text-white/40 group-hover:text-yellow transition-all">
              {openSections.club ? 'COLLAPSE ▲' : 'EXPAND ▼'}
            </span>
            <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all ${openSections.club ? 'bg-red text-black border-red' : 'bg-transparent text-white'}`}>
              {openSections.club ? '✕' : '＋'}
            </div>
          </div>
        </div>

        {openSections.club && (
          <div className="relative z-10 pb-20 px-5 sm:px-10 max-w-5xl mx-auto animate-fade-in">
            <p className="font-[family-name:var(--font-body)] italic text-white/70 max-w-xl mx-auto mb-10 text-center">
              Download PokerBros and join the club. Click the referral link below and you&apos;ll be
              added to Monkey Biz Poker automatically.
            </p>

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
                    Open PokerBros, tap the <span className="text-red font-bold">magnifying glass icon</span> on the right, enter Club ID <strong className="text-red">1670819</strong>, and apply.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ─────────────────────────── MERCH ─────────────────────────── */}
      <section id="merch" className="relative border-b border-white/5">
          <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-b from-navy-deep via-navy-deep/95 to-navy-deep" />
          </div>
          <div 
            onClick={() => toggleSection('merch')}
            className="py-8 px-5 sm:px-10 max-w-5xl mx-auto flex justify-between items-center cursor-pointer select-none group"
          >
            <div>
              <span className="text-[0.7rem] uppercase tracking-[0.3em] text-red font-[family-name:var(--font-mono)]">
                Coming Soon
              </span>
              <h2 className="mt-1 font-[family-name:var(--font-headline)] text-4xl sm:text-5xl text-white">
                Monkey <em className="text-red">Merch</em>
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest font-mono text-white/40 group-hover:text-yellow transition-all">
                {openSections.merch ? 'COLLAPSE ▲' : 'EXPAND ▼'}
              </span>
              <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all ${openSections.merch ? 'bg-red text-black border-red' : 'bg-transparent text-white'}`}>
                {openSections.merch ? '✕' : '＋'}
              </div>
            </div>
          </div>

          {openSections.merch && (
            <div className="pb-20 px-5 sm:px-10 max-w-5xl mx-auto animate-fade-in text-center">
              <p className="font-[family-name:var(--font-body)] italic text-white/70 max-w-xl mx-auto">
                  T-shirts, hoodies, card protectors, and more. Stay tuned for the drop.
              </p>
            </div>
          )}
      </section>

      {/* ─────────────────────────── CONTACT ─────────────────────────── */}
      <section id="contact" className="relative border-b border-white/5">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-deep via-navy/60 to-navy-deep" />
        <div 
          onClick={() => toggleSection('contact')}
          className="py-8 px-5 sm:px-10 max-w-4xl mx-auto flex justify-between items-center cursor-pointer select-none group"
        >
          <div>
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-red font-[family-name:var(--font-mono)]">
              Got Questions?
            </span>
            <h2 className="mt-1 font-[family-name:var(--font-headline)] text-4xl sm:text-5xl text-white">
              Talk to a <em className="text-red">Monkey</em>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest font-mono text-white/40 group-hover:text-yellow transition-all">
              {openSections.contact ? 'COLLAPSE ▲' : 'EXPAND ▼'}
            </span>
            <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all ${openSections.contact ? 'bg-red text-black border-red' : 'bg-transparent text-white'}`}>
              {openSections.contact ? '✕' : '＋'}
            </div>
          </div>
        </div>

        {openSections.contact && (
          <div className="pb-20 px-5 sm:px-10 max-w-4xl mx-auto animate-fade-in">
            <p className="font-[family-name:var(--font-body)] italic text-white/70 max-w-xl mx-auto mb-10 text-center">
              Ring the hosts or slide into Telegram. We don&apos;t bite.
            </p>

            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { name: 'Banana Lou', phone: '509-666-2743', phoneHref: 'tel:+15096662743', tg: '@Monkeybizpoker', tgHref: 'https://t.me/Monkeybizpoker' },
                { name: 'Donkey Diesel', phone: '302-784-4793', phoneHref: 'tel:+13027844793', tg: '@BigDiesel22', tgHref: 'https://t.me/BigDiesel22' },
              ].map((c) => (
                <div
                  key={c.name}
                  className="relative rounded-sm border border-light-blue/30 bg-navy-deep/75 backdrop-blur p-6 sm:p-8 overflow-hidden group hover:border-red/70 transition w-full"
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
      )}
      </section>

      {/* ─────────────────────────── THE WALL ─────────────────────────── */}
      <section id="wall" className="relative bg-gradient-to-b from-navy-deep to-[#052112] border-b border-white/5">
        <div className="absolute inset-0 -z-10">
          <Image src="/img/bg-wall.png" alt="" fill className="object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-deep via-navy-deep/90 to-[#052112]" />
        </div>

        <div 
          onClick={() => toggleSection('wall')}
          className="relative z-10 py-8 px-5 sm:px-10 max-w-6xl mx-auto flex justify-between items-center cursor-pointer select-none group"
        >
          <div>
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-red font-[family-name:var(--font-mono)]">
              Contest & Feed
            </span>
            <h2 className="mt-1 font-[family-name:var(--font-headline)] text-4xl sm:text-5xl text-white">
              Splat <em className="text-red">Wall</em>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest font-mono text-white/40 group-hover:text-yellow transition-all">
              {openSections.wall ? 'COLLAPSE ▲' : 'EXPAND ▼'}
            </span>
            <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all ${openSections.wall ? 'bg-red text-black border-red' : 'bg-transparent text-white'}`}>
              {openSections.wall ? '✕' : '＋'}
            </div>
          </div>
        </div>

        {openSections.wall && (
          <div className="relative z-10 pb-20 px-5 sm:px-10 max-w-6xl mx-auto animate-fade-in">
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
                    document.getElementById('wall-tab-section')?.scrollIntoView({ behavior: 'smooth' });
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
          <div id="wall-tab-section" className="flex justify-center mb-12">
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
                    ? 'bg-red text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
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
                👑 LAST WEEK'S SPLAT A BAD BEAT WINNER 👑
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
                    Paste your PokerBros hand link and bad beat story. The weekly bad beat hand with the highest average point score wins!
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                  <span className="text-lg">🗳️</span>
                  <div>
                    <strong className="text-white block font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider mb-0.5">Your Votes:</strong>
                    Cast a direct rating from <strong className="text-yellow">1 to 10</strong> (limit 1 vote per hand). The table reaction stickers (Banana Splats, Suffer, Ice) are infinite and purely for fun!
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                  <span className="text-lg">🏆</span>
                  <div>
                    <strong className="text-white block font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider mb-0.5">Weekly Contest:</strong>
                    The wall resets every week, and the bad beat submission with the highest mathematical 1-10 average is crowned the champion.
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
              <div className="flex flex-wrap justify-center gap-6">
                {filteredPosts.map((p, i) => (
                  <div key={p.id} className="w-full max-w-[340px] shrink-0">
                    <WallPost post={p} index={i} />
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      )}
      </section>


      {/* ─────────────────────────── MONKEY MUSIC ─────────────────────────── */}
      <section id="music" className="relative bg-[#0c0c0c] border-t border-yellow/20 z-10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent opacity-40" />
        
        <div 
          onClick={() => toggleSection('music')}
          className="py-8 px-5 sm:px-10 max-w-4xl mx-auto flex justify-between items-center cursor-pointer select-none group"
        >
          <div>
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-yellow font-[family-name:var(--font-mono)]">
              Club Hits & Anthems
            </span>
            <h2 className="mt-1 font-[family-name:var(--font-headline)] text-4xl sm:text-5xl text-white">
              Monkey <em className="text-yellow">Music</em>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest font-mono text-white/40 group-hover:text-yellow transition-all">
              {openSections.music ? 'COLLAPSE ▲' : 'EXPAND ▼'}
            </span>
            <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all ${openSections.music ? 'bg-yellow text-black border-yellow' : 'bg-transparent text-white'}`}>
              {openSections.music ? '✕' : '＋'}
            </div>
          </div>
        </div>

        {openSections.music && (
          <div className="max-w-4xl mx-auto pb-20 px-5 sm:px-10 animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="mt-3 font-[family-name:var(--font-headline)] text-5xl sm:text-6xl text-white">
                Monkey <em className="text-yellow not-italic">Music</em>
              </h2>
              <p className="mt-4 font-[family-name:var(--font-body)] italic text-white/70 max-w-xl mx-auto">
                Our first official club banger! Crank up the bass, review the lyrics, and let Great Apes set the vibe while you build those stacks.
              </p>
            </div>

          {/* DJ Mandrill Hero Banner */}
          <div className="relative w-full aspect-[16/9] rounded-sm overflow-hidden border border-yellow/30 shadow-[0_0_30px_rgba(255,204,0,0.15)] bg-neutral-900 mb-10">
            <img
              src="/img/mandrill-dj.png"
              alt="Mandrill DJ spinning turntables"
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          </div>

          <div className="grid md:grid-cols-[1fr_1.2fr] gap-8 items-start">
            {/* Player Card (Left) */}
            <div className="relative rounded-sm border-2 border-yellow bg-black shadow-[0_0_40px_rgba(255,209,59,0.15)] p-6 sm:p-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow/5 rounded-full blur-2xl -z-10" />
              
              <div className="flex flex-col items-center text-center">
                {/* Turntable Platter Deck Base (Realistic Square Design) */}
                <div className="relative w-44 h-44 bg-zinc-900 border-2 border-zinc-800 rounded-sm p-3 shadow-2xl flex items-center justify-center mb-6">
                  {/* Glowing Platter Neon Ring */}
                  <div className={`absolute inset-2.5 rounded-full border-2 transition-all duration-300 ${
                    isMusicPlaying ? 'border-yellow/50 shadow-[0_0_15px_rgba(255,209,59,0.3)] animate-pulse' : 'border-neutral-800'
                  }`} />

                  {/* Pitch Control Sliders decorative layout */}
                  <div className="absolute right-2 top-3 bottom-3 w-1.5 bg-neutral-950 rounded-full flex flex-col justify-between py-1 px-[1px] opacity-60">
                    <div className="h-2 w-full bg-zinc-700 rounded-sm" />
                    <div className="h-1.5 w-1.5 bg-yellow rounded-full shadow" style={{ transform: isMusicPlaying ? 'translateY(10px)' : 'translateY(0)' }} />
                    <div className="h-2 w-full bg-zinc-700 rounded-sm" />
                  </div>

                  {/* Spinning Vinyl Record Disk */}
                  <div 
                    onMouseDown={handleVinylStart}
                    onMouseMove={handleVinylMove}
                    onMouseUp={handleVinylEnd}
                    onMouseLeave={handleVinylEnd}
                    onTouchStart={handleVinylStart}
                    onTouchMove={handleVinylMove}
                    onTouchEnd={handleVinylEnd}
                    onClick={(e) => {
                      // Only toggle play/pause if the drag movement was negligible (meaning it's a tap/click)
                      if (!isScratching && Math.abs(scratchStartRef.current - ('touches' in e ? 0 : e.clientX)) < 5) {
                        toggleMusic();
                      }
                    }}
                    style={{ transform: `rotate(${spinAngle}deg)` }}
                    className="relative w-36 h-36 rounded-full bg-black border-4 border-neutral-950 flex items-center justify-center cursor-grab active:cursor-grabbing select-none shadow-[0_0_20px_rgba(0,0,0,0.8)] z-10 animate-none"
                    title="Drag left/right to scratch the track! Tap to Play/Pause."
                  >
                    {/* Vinyl grooves lines */}
                    <div className="absolute inset-1.5 rounded-full border border-neutral-800/40" />
                    <div className="absolute inset-4 rounded-full border border-neutral-800/30" />
                    <div className="absolute inset-7 rounded-full border border-neutral-800/25" />
                    <div className="absolute inset-10 rounded-full border border-neutral-800/15" />
                    <div className="absolute inset-13 rounded-full border border-neutral-800/10" />

                    {/* Central Sticker (Using Circular Club Logo) */}
                    <div className="w-16 h-16 rounded-full bg-black border-2 border-yellow/60 overflow-hidden flex items-center justify-center shadow-inner select-none pointer-events-none">
                      <img 
                        src="/img/logo.png" 
                        alt="Monkey Biz Logo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Tiny Tone Arm Needle Overlay */}
                  <svg 
                    className={`absolute top-2 right-4 w-12 h-20 origin-[30px_5px] transition-transform duration-700 pointer-events-none z-20 ${
                      isMusicPlaying ? 'rotate-[25deg]' : 'rotate-0'
                    }`}
                    viewBox="0 0 40 60"
                  >
                    <circle cx="30" cy="5" r="5" fill="#52525b" />
                    <path d="M30 5 L12 45 L6 45" stroke="#d4d4d8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <rect x="4" y="42" width="4" height="8" fill="#3f3f46" transform="rotate(15, 6, 45)" />
                  </svg>
                </div>

                <div className="inline-block px-3 py-1 bg-yellow/10 border border-yellow/30 rounded-full text-[0.65rem] text-yellow font-mono mb-3">
                  🔥 TOP CLUB HIT
                </div>
                <h3 
                  onClick={toggleMusic}
                  className={`font-[family-name:var(--font-headline)] text-3xl tracking-wide cursor-pointer transition-colors duration-300 ${
                    isMusicPlaying ? 'animate-[musicColorShift_6s_linear_infinite]' : 'text-white hover:text-yellow'
                  }`}
                  title="Click to play/pause"
                >
                  Great Apes

                  {/* Color-shifting styles specifically for "Great Apes" title while music plays */}
                  <style jsx>{`
                    @keyframes musicColorShift {
                      0%, 100% {
                        color: #ffffff; /* white */
                        text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
                      }
                      33% {
                        color: #00d2ff; /* neon electron blue */
                        text-shadow: 0 0 15px rgba(0, 210, 255, 0.6);
                      }
                      66% {
                        color: #ffd13b; /* neon yellow */
                        text-shadow: 0 0 15px rgba(255, 209, 59, 0.6);
                      }
                      85% {
                        color: #39ff14; /* neon lime green */
                        text-shadow: 0 0 15px rgba(57, 255, 20, 0.6);
                      }
                    }
                  `}</style>
                </h3>
                <p className="font-[family-name:var(--font-body)] text-white/50 text-xs mt-1 mb-6">
                  The Official Monkey Biz Poker Anthem
                </p>

                {/* Animated Equalizer Visualizer Bars */}
                <div className="h-10 flex items-end gap-[3px] justify-center mb-6 w-full px-4">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-[5px] bg-yellow rounded-t-sm transition-all duration-300"
                      style={{
                        height: isMusicPlaying ? '100%' : '15%',
                        transform: isMusicPlaying ? 'scaleY(' + (0.2 + Math.random() * 0.8) + ')' : 'scaleY(1)',
                        transformOrigin: 'bottom',
                        animation: isMusicPlaying ? 'bounce 0.8s ease-in-out infinite alternate' : 'none',
                        animationDelay: (0.1 * (i % 6)) + 's',
                        opacity: 0.4 + (i / 16) * 0.6
                      }}
                    />
                  ))}
                </div>

                {/* Play & Share Controls */}
                <div className="flex gap-3 w-full">
                  {/* Play/Pause Button */}
                  <button
                    onClick={toggleMusic}
                    className="flex-[2] flex items-center justify-center gap-2 px-6 py-3.5 bg-yellow hover:bg-yellow/90 text-black font-bold font-mono text-sm tracking-wider uppercase rounded-sm shadow-[0_0_20px_rgba(255,209,59,0.3)] transition"
                  >
                    {isMusicPlaying ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="4" y="4" width="4" height="16" />
                          <rect x="16" y="4" width="4" height="16" />
                        </svg>
                        Pause Song
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                        Play Song
                      </>
                    )}
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-yellow font-bold font-mono text-xs tracking-wider uppercase rounded-sm border border-yellow/20 transition shadow-lg"
                    title="Share this track!"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    <span>{shareText}</span>
                  </button>
                </div>

                {/* Native Browser Player Fallback for iOS/iPadOS */}
                <div className="w-full mt-5 p-3 rounded-md bg-neutral-900/60 border border-yellow/15">
                  <div className="text-[10px] text-yellow/70 font-mono uppercase tracking-wider mb-2 text-left">
                    📱 Direct Mobile Playbar:
                  </div>
                  <audio
                    ref={audioRef}
                    src="/audio/monkey-biz-poker-2.mp3"
                    preload="auto"
                    playsInline
                    controls
                    className="w-full h-8 accent-yellow"
                    onPlay={() => setIsMusicPlaying(true)}
                    onPause={() => setIsMusicPlaying(false)}
                  />
                </div>
              </div>
            </div>

            {/* Lyrics Sheet (Right) */}
            <div ref={lyricsContainerRef} className="scroll-smooth rounded-sm border border-light-blue/20 bg-navy-deep/60 backdrop-blur p-6 sm:p-8 max-h-[500px] overflow-y-auto select-text shadow-xl">
              <h4 className="font-[family-name:var(--font-headline)] text-2xl text-yellow mb-1">
                Lyrics Sheet
              </h4>
              <p className="text-[0.65rem] text-white/50 font-mono mb-6 uppercase tracking-wider">
                RAP ANTHEM · BEAT: GRITTY 808 TRAP
              </p>

              <div className="space-y-6 text-sm leading-relaxed text-white/80 font-[family-name:var(--font-body)]">
                <div>
                  <div className="text-[0.7rem] text-yellow font-mono uppercase tracking-wider font-bold mb-1">[INTRO]</div>
                  <p className="text-white/50 italic mb-2">{"*(Heavy bass drops, sounds of poker chips splashing, a monkey howling)*"}</p>
                  <p>{"Yeah… Welcome to the jungle, baby."}</p>
                  <p>{"Where the stakes are high, and the beasts run the table."}</p>
                  <p>{"Monkey Biz Poker on PokerBros."}</p>
                  <p>{"You know the code: 1670819."}</p>
                  <p>{"Stack 'em up or get felted."}</p>
                  <p>{"Let's get nasty. Uh."}</p>
                </div>

                <div>
                  <div className="text-[0.7rem] text-yellow font-mono uppercase tracking-wider font-bold mb-1">[VERSE 1]</div>
                  <p>{"Poachers in the bushes bringing in their fresh fines,"}</p>
                  <p>{"Great apes on the felt, crossing over red lines."}</p>
                  <p>{"Orangutans with the stacks, building up a mountain,"}</p>
                  <p>{"Splashing in the pot, chips flowing like a fountain."}</p>
                  <p className="text-yellow font-bold">{"Monkey's 10 Spot Tourney, Saturday at noon,"}</p>
                  <p className="text-yellow font-bold">{"Slamming down buy-ins, we gonna felt 'em soon!"}</p>
                  <p className="text-yellow font-bold">{"Splat a Bad Beat, yeah we run the weekly contest,"}</p>
                  <p className="text-yellow font-bold">{"Share your broken hand to the wall, we the strongest."}</p>
                  <p>{"Take a screenshot, post it up, let the poison spill,"}</p>
                  <p>{"Bring a friend, refer 'em, get a free chip refill!"}</p>
                  <p className="text-green-400 font-bold">{"And the brand new 1-2 Cash Game bringing higher stakes,"}</p>
                  <p className="text-green-400 font-bold">{"Pumping up the action, testing what it takes!"}</p>
                </div>

                <div className="p-4 bg-yellow/5 border border-yellow/20 rounded-md">
                  <div className="text-[0.7rem] text-yellow font-mono uppercase tracking-wider font-bold mb-1">[CHORUS]</div>
                  <p className="text-yellow font-bold">{"It's all about the MONKEY BIZ, we running the show!"}</p>
                  <p className="text-yellow font-bold">{"PokerBros table, yeah we ready to go!"}</p>
                  <p className="text-yellow font-bold">{"Great apes stacking, watch the green and the red,"}</p>
                  <p className="text-yellow font-bold">{"Play with the beasts or get felted instead!"}</p>
                  <p className="text-yellow font-bold">{"Monkey Biz *(Biz!)*, yeah we build the pots high,"}</p>
                  <p className="text-yellow font-bold">{"Slamming down the chips, hear the savages cry!"}</p>
                  <p className="text-yellow font-bold">{"Go to "}<a href="#music" className="text-yellow hover:underline font-bold">MONKEYBIZPOKER.COM</a>{" on the double,"}</p>
                  <p className="text-yellow font-bold">{"Welcome to the jungle, you don't want no trouble!"}</p>
                </div>

                <div>
                  <div className="text-[0.7rem] text-yellow font-mono uppercase tracking-wider font-bold mb-1">[VERSE 2]</div>
                  <p>{"Yeah, let's talk about the roster in this wild-ass piece,"}</p>
                  <p>{"We got legends on the felt, and they never gonna cease."}</p>
                  <p>{"LUCIFER is the host, keeping fire in the room,"}</p>
                  <p>{"While DIESEL's the most—showing his ass to your doom!"}</p>
                  <p>{"Diesel too pretty, but he plays like a beast,"}</p>
                  <p>{"He'll felt you at the table, make your stack a feast!"}</p>
                  <p>{"Late-night grind? Yeah, VOODOO is the spark,"}</p>
                  <p>{"Coming in past midnight, slinging spells in the dark!"}</p>
                  <p>{"Where is the CAPTAIN? Everybody looking round,"}</p>
                  <p>{"He's the ghost in the machine, never easily found!"}</p>
                  <p>{"And if you got luck, 9LIVES might appear,"}</p>
                  <p>{"Clawing back from the dead, striking absolute fear!"}</p>
                  <p>{"THE BOXMAN is here, handling business like a boss,"}</p>
                  <p>{"Calculating numbers, counting up your total loss!"}</p>
                  <p>{"HOLSTER in the cut, always slinging a bluff,"}</p>
                  <p>{"Double-barrel on the river when you think you got enough!"}</p>
                  <p>{"TATTOO on the side, slinging ink, slinging chips,"}</p>
                  <p>{"Writing pain on your skin and a sigh on your lips!"}</p>
                </div>

                <div className="p-4 bg-yellow/5 border border-yellow/20 rounded-md">
                  <div className="text-[0.7rem] text-yellow font-mono uppercase tracking-wider font-bold mb-1">[CHORUS]</div>
                  <p className="text-yellow font-bold">{"It's all about the MONKEY BIZ, we running the show!"}</p>
                  <p className="text-yellow font-bold">{"PokerBros table, yeah we ready to go!"}</p>
                  <p className="text-yellow font-bold">{"Great apes stacking, watch the green and the red,"}</p>
                  <p className="text-yellow font-bold">{"Play with the beasts or get felted instead!"}</p>
                  <p className="text-yellow font-bold">{"Monkey Biz *(Biz!)*, yeah we build the pots high,"}</p>
                  <p className="text-yellow font-bold">{"Slamming down the chips, hear the savages cry!"}</p>
                  <p className="text-yellow font-bold">{"Go to "}<a href="#music" className="text-yellow hover:underline font-bold">MONKEYBIZPOKER.COM</a>{" on the double,"}</p>
                  <p className="text-yellow font-bold">{"Welcome to the jungle, you don't want no trouble!"}</p>
                </div>

                <div>
                  <div className="text-[0.7rem] text-yellow font-mono uppercase tracking-wider font-bold mb-1">[VERSE 3]</div>
                  <p>{"MR. ARMY stands his ground, he ain't never gonna run,"}</p>
                  <p>{"Solid as a tank under the tropical sun!"}</p>
                  <p>{"QUEEN DRAGON on the film, keeping eyes on the play,"}</p>
                  <p>{"While AMY MAY is lurking—gotta watch out for her today!"}</p>
                  <p>{"Yeah, Amy May is dangerous, she'll strip you of your pride,"}</p>
                  <p>{"Leaving you empty-handed with nowhere to hide!"}</p>
                  <p>{"VA showing style on the felt, looking sleek,"}</p>
                  <p>{"Dressing like a king, making card players weak!"}</p>
                  <p>{"Always looking for SCAR, he's a shadow in the smoke,"}</p>
                  <p>{"And SINGRAM coming in for LAST CALL, no joke!"}</p>
                  <p>{"Last call, drink up, shove your stack in the middle,"}</p>
                  <p>{"While CHUCKEE is out, solving the card-table riddle!"}</p>
                  <p>{"And CHUNK MISTER, no doubt, holds his place on the felt,"}</p>
                  <p>{"With a heavy-duty stack that is never gonna melt!"}</p>
                </div>

                <div>
                  <div className="text-[0.7rem] text-yellow font-mono uppercase tracking-wider font-bold mb-1">[OUTRO]</div>
                  <p className="text-white/50 italic mb-2">{"*(Beat starts to fade, heavy 808s still echoing, monkey eyes glowing)*"}</p>
                  <p>{"Yeah. No doubt."}</p>
                  <p>{"Chunk holds his place."}</p>
                  <p>{"Chuckee is out."}</p>
                  <p>{"But the Monkey Biz never stops."}</p>
                  <p>{"Get your chips, refer your friends, hit the wall."}</p>
                  <p><a href="#music" className="text-yellow hover:underline font-bold">MONKEYBIZPOKER.COM</a></p>
                  <p>{"Private Club Code: 1670819."}</p>
                  <p>{"Are you an ape or are you bait?"}</p>
                  <p>{"Felted."}</p>
                  <p className="text-white/50 italic">{"*(Sound of a heavy gavel/slam, fading into jungle drums)*"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
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
