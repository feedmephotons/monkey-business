import Image from 'next/image'
import { supabase, type WallPost as WallPostType, type BudgetRow } from '@/lib/supabase'
import WallForm from '@/components/WallForm'
import WallPost from '@/components/WallPost'
import PokerBrosFAB from '@/components/PokerBrosFAB'

export const revalidate = 0

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
  {
    day: 'MON',
    date: 'May 25',
    title: 'Freeroll',
    pool: '$305',
    detail: 'Kick the week off with a taste of free money. Top finishers take home the pool.',
    accent: '#7eb8ff',
  },
  {
    day: 'TUE',
    date: 'May 26',
    title: 'Freeroll',
    pool: '$190',
    detail: 'Round two. Tighter pool, looser lineup. Bring your A-game and B-jokes.',
    accent: '#f4c430',
  },
  {
    day: 'WED',
    date: 'May 27',
    title: 'High Hands',
    pool: '$200',
    detail:
      'Hour 1 (6:30p): $100 for the hour\u2019s highest hand. Night Shift (8:00p \u2192 close): another $100 running all night.',
    accent: '#ffdd33',
  },
  {
    day: 'THU',
    date: 'May 28',
    title: 'Freeroll',
    pool: '$200',
    detail:
      'Play hard tonight \u2014 Thursday\u2019s finish unlocks EXTRA-EXTRA CHIPS for Friday\u2019s splash pot.',
    accent: '#7eb8ff',
  },
  {
    day: 'FRI',
    date: 'May 29',
    title: 'Splash Pot Night',
    pool: '$200 + $110',
    detail:
      'Splash Pot budget: $200. Plus $110 allocated to 11 free satellite seats. Chaos, in a good way.',
    accent: '#f4c430',
  },
  {
    day: 'SAT',
    date: 'May 30',
    title: 'Satellite Tournament',
    pool: '$10 Buy-in',
    detail:
      '$10 satellite tournament (7-man). First place wins a FREE seat into Sunday\u2019s Deep Stack tournament. Your shot at the big game starts here.',
    accent: '#ffdd33',
  },
  {
    day: 'SUN',
    date: 'May 31',
    title: 'Deep Stack Tournament',
    pool: 'THE MAIN EVENT',
    detail:
      'The week\u2019s finale. Saturday\u2019s satellite winner plays for free \u2014 everyone else, buy in and bring your best. Winner takes the stack.',
    accent: '#f4c430',
    headline: true,
  },
]

const BUDGET_TOTAL_CENTS = 121000 // $1,210

async function getWallPosts(): Promise<WallPostType[]> {
  const { data, error } = await supabase
    .from('mb_wall_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(40)
  if (error) {
    console.error(error)
    return []
  }
  return (data ?? []) as WallPostType[]
}

async function getBudget(): Promise<BudgetRow[]> {
  const { data, error } = await supabase
    .from('mb_budget_ledger')
    .select('*')
    .order('occurred_at', { ascending: true })
  if (error) {
    console.error(error)
    return []
  }
  return (data ?? []) as BudgetRow[]
}

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

export default async function Home() {
  const [posts, budget] = await Promise.all([getWallPosts(), getBudget()])
  const spent = budget.reduce((s, r) => s + r.amount_cents, 0)
  const remaining = BUDGET_TOTAL_CENTS - spent
  const pct = Math.min(100, Math.round((spent / BUDGET_TOTAL_CENTS) * 100))

  return (
    <main className="relative overflow-hidden">
      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="relative flex flex-col" style={{ minHeight: '100svh' }}>
        <div className="absolute inset-0 -z-10">
          <Image
            src="/img/bg-jungle.png"
            alt=""
            fill
            priority
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-felt-deep/70 via-felt-deep/60 to-felt-deep" />
        </div>

        <nav className="relative z-10 flex items-center justify-between px-5 sm:px-10 py-5">
          <div className="flex items-center gap-3">
            <span className="font-[family-name:var(--font-display)] text-banana text-lg tracking-widest neon">
              M.B.
            </span>
            <span className="hidden sm:block h-px w-16 bg-gold/50" />
            <span className="hidden sm:inline-block text-[0.65rem] uppercase tracking-[0.3em] text-cream/60 font-[family-name:var(--font-mono)]">
              Est. 1974 · Members Only
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-[0.65rem] uppercase tracking-[0.25em] text-cream/60 font-[family-name:var(--font-mono)]">
            <a href="#schedule" className="hover:text-banana transition">
              Schedule
            </a>
            <a href="#club" className="hover:text-banana transition">
              Club
            </a>
            <a href="#slot" className="hover:text-banana transition">
              Slot
            </a>
            <a href="#contact" className="hover:text-banana transition">
              Contact
            </a>
            <a href="#wall" className="hover:text-banana transition">
              Wall
            </a>
          </div>
        </nav>

        <div className="relative z-10 flex-1 grid lg:grid-cols-[1.05fr_1fr] items-center gap-10 lg:gap-6 px-5 sm:px-10 pb-16">
          <div className="space-y-6 max-w-[640px]">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-gold/40 rounded-full text-[0.65rem] uppercase tracking-[0.25em] text-banana/90 font-[family-name:var(--font-mono)]">
              <span className="w-1.5 h-1.5 rounded-full bg-banana animate-pulse" />
              Last week of May · Monkey Mania
            </div>

            <h1
              className="font-[family-name:var(--font-display)] text-banana neon"
              style={{ lineHeight: 0.82 }}
            >
              <span
                className="block"
                style={{ fontSize: 'clamp(2.6rem, 8vw, 5.8rem)' }}
              >
                MONKEY BIZ
              </span>
              <span
                className="block text-banana-bright"
                style={{ fontSize: 'clamp(2.8rem, 9vw, 6.5rem)', paddingLeft: '0.06em' }}
              >
                POKER
              </span>
            </h1>

            <p className="font-[family-name:var(--font-headline)] text-xl sm:text-2xl text-cream/90 leading-snug max-w-[520px]">
              Seven days. Seven stacks. One week of the most ridiculous freerolls, splash pots,
              satellites and a deep stack finale.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="#schedule"
                className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-banana-bright to-gold text-felt-deep rounded font-[family-name:var(--font-display)] tracking-wider shadow-[0_6px_0_rgba(0,0,0,0.35),0_14px_32px_-10px_rgba(244,196,48,0.55)] hover:translate-y-[1px] active:translate-y-[4px] active:shadow-[0_2px_0_rgba(0,0,0,0.35)] transition"
              >
                SEE THE WEEK
                <span className="inline-block group-hover:translate-x-1 transition">→</span>
              </a>
              <a
                href="#wall"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gold/60 text-cream rounded font-[family-name:var(--font-mono)] text-sm uppercase tracking-widest hover:bg-gold/10 hover:border-banana transition"
              >
                Write on the Wall
              </a>
            </div>

            <div className="flex items-center gap-5 pt-6 text-cream/50">
              <span className="font-[family-name:var(--font-mono)] text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.3em]">
                Freerolls · High Hands · Splash Pots · Satellites · A Monkey in a Suit
              </span>
            </div>
          </div>

          <div className="relative float">
            <div className="absolute -inset-4 bg-banana/20 blur-3xl rounded-full" />
            <div className="relative rounded-lg overflow-hidden ring-2 ring-gold/50 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)]">
              <Image
                src="/img/hero-monkey.png"
                alt="A capuchin in a velvet green tux at the poker table"
                width={1200}
                height={700}
                className="w-full h-auto"
                priority
              />
            </div>
            <div className="absolute -bottom-6 -right-3 sm:-right-6 bg-felt-deep border-2 border-gold rounded-full w-28 h-28 flex flex-col items-center justify-center text-center shadow-lg rotate-[8deg]">
              <span className="font-[family-name:var(--font-mono)] text-[0.55rem] uppercase tracking-widest text-banana">
                Total Pool
              </span>
              <span className="font-[family-name:var(--font-display)] text-2xl text-banana-bright neon leading-none mt-1">
                $1,210
              </span>
              <span className="font-[family-name:var(--font-hand)] text-xs text-cream/70">
                to give away
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 border-y border-gold/30 bg-felt-deep/70 backdrop-blur overflow-hidden">
          <div className="flex gap-10 py-3 whitespace-nowrap animate-[marquee_40s_linear_infinite] font-[family-name:var(--font-display)] text-2xl text-banana/80">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="flex items-center gap-10">
                <span>♠ MONKEY MANIA WEEK</span>
                <span className="text-banana-bright">✦</span>
                <span>LAST WEEK OF MAY</span>
                <span className="text-banana-bright">♣</span>
                <span>NO COVER, ALL MISCHIEF</span>
                <span className="text-banana-bright">♦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── SCHEDULE ─────────────────────────── */}
      <section id="schedule" className="relative py-24 px-5 sm:px-10">
        <div className="absolute inset-0 -z-10">
          <Image src="/img/bg-schedule.png" alt="" fill className="object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-felt-deep via-felt-deep/95 to-felt-deep" />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-banana font-[family-name:var(--font-mono)]">
              Chapter One
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-headline)] text-5xl sm:text-6xl text-cream">
              The Week, <em className="text-banana">Unspooled</em>
            </h2>
            <div className="deco-divider mt-6 max-w-sm mx-auto" />
            <p className="mt-4 font-[family-name:var(--font-body)] text-cream/70 italic max-w-xl mx-auto">
              Five nights. Budget capped at ${(BUDGET_TOTAL_CENTS / 100).toLocaleString()}. Every
              dollar accounted for.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SCHEDULE.map((night, idx) => (
              <article
                key={night.day}
                className={`relative rise group ${night.headline ? 'md:col-span-2' : ''}`}
                style={{ animationDelay: `${0.1 + idx * 0.08}s` }}
              >
                <div
                  className={`relative h-full rounded-sm border border-gold/30 bg-felt-deep/80 backdrop-blur p-6 overflow-hidden transition ${
                    night.headline ? 'md:p-10' : ''
                  } group-hover:border-banana/80`}
                >
                  <span className="absolute top-2 left-2 text-gold/40 text-xs">✦</span>
                  <span className="absolute top-2 right-2 text-gold/40 text-xs">✦</span>
                  <span className="absolute bottom-2 left-2 text-gold/40 text-xs">✦</span>
                  <span className="absolute bottom-2 right-2 text-gold/40 text-xs">✦</span>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span
                          className="font-[family-name:var(--font-display)] text-xl neon"
                          style={{ color: night.accent }}
                        >
                          {night.day}
                        </span>
                        <span className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-widest text-cream/50">
                          {night.date}
                        </span>
                      </div>
                      <h3 className="mt-1 font-[family-name:var(--font-headline)] text-3xl md:text-4xl text-cream">
                        {night.title}
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-widest text-cream/50">
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

                  <p className="font-[family-name:var(--font-body)] text-cream/80 leading-relaxed">
                    {night.detail}
                  </p>

                  {night.headline && (
                    <div className="mt-6 flex flex-wrap gap-4 text-xs uppercase tracking-widest text-banana/80 font-[family-name:var(--font-mono)]">
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
      <section className="relative py-24 px-5 sm:px-10">
        <div className="absolute inset-0 -z-10">
          <Image src="/img/bg-budget.png" alt="" fill className="object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-felt-deep via-felt to-felt-deep" />
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-banana font-[family-name:var(--font-mono)]">
              Chapter Two
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-headline)] text-5xl sm:text-6xl text-cream">
              The <em className="text-banana">Cashier&#39;s</em> Ledger
            </h2>
            <p className="mt-4 font-[family-name:var(--font-body)] italic text-cream/70">
              Every cent of the $1,210 budget, tracked live.
            </p>
          </div>

          <div className="relative rounded-sm border border-gold/40 bg-felt-deep/75 backdrop-blur p-6 sm:p-10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
            <span className="absolute -top-1 left-6 w-3 h-3 rounded-full bg-gold shadow-inner" />
            <span className="absolute -top-1 right-6 w-3 h-3 rounded-full bg-gold shadow-inner" />

            <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
              <div>
                <div className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.3em] text-cream/50">
                  Allocated
                </div>
                <div className="font-[family-name:var(--font-display)] text-5xl text-banana-bright neon mt-1">
                  {dollars(spent)}
                </div>
              </div>
              <div className="hidden md:block w-px h-16 bg-gold/30" />
              <div className="md:text-right">
                <div className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.3em] text-cream/50">
                  Remaining
                </div>
                <div className="font-[family-name:var(--font-display)] text-5xl text-neon-green neon-green mt-1">
                  {dollars(remaining)}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="relative h-5 rounded-full bg-felt-deep border border-gold/30 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold via-banana to-banana-bright shadow-[0_0_20px_rgba(244,196,48,0.5)]"
                  style={{ width: `${pct}%` }}
                />
                <div className="relative h-full flex items-center justify-center font-[family-name:var(--font-mono)] text-[0.65rem] tracking-widest uppercase text-felt-deep font-bold">
                  {pct}% of $1,210
                </div>
              </div>
            </div>

            <div className="mt-8 grid sm:grid-cols-2 gap-x-10 gap-y-2 font-[family-name:var(--font-mono)] text-sm">
              {budget.map((row) => (
                <div
                  key={row.id}
                  className="flex items-baseline justify-between border-b border-dashed border-gold/20 py-2"
                >
                  <span className="text-cream/70">
                    {BUDGET_LABELS[row.category] ?? row.category}
                  </span>
                  <span className="text-banana tabular-nums">{dollars(row.amount_cents)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── SLOT ─────────────────────────── */}
      <section id="slot" className="relative py-24 px-5 sm:px-10">
        <div className="absolute inset-0 -z-10">
          <Image src="/img/bg-felt.png" alt="" fill className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-felt-deep via-transparent to-felt-deep" />
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-banana font-[family-name:var(--font-mono)]">
              Chapter Three
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-headline)] text-5xl sm:text-6xl text-cream">
              Pull the <em className="text-banana">Vine</em>
            </h2>
            <p className="mt-4 font-[family-name:var(--font-body)] italic text-cream/70 max-w-xl mx-auto">
              The house slot. Weekly payouts capped at $50 — more than enough to make someone scream.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rounded-xl bg-gradient-to-b from-gold/60 via-banana/40 to-gold/60 blur-md" />
            <div className="relative rounded-xl overflow-hidden border-2 border-gold shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)]">
              <div className="bg-gradient-to-b from-oak to-felt-deep px-4 py-2 border-b border-gold/40 flex items-center justify-between">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="w-2 h-2 rounded-full bg-banana" />
                  <span className="w-2 h-2 rounded-full bg-neon-green" />
                </div>
                <span className="font-[family-name:var(--font-display)] text-banana text-sm tracking-widest neon">
                  MONKEY SLOT
                </span>
                <span className="w-10" />
              </div>
              <iframe
                src="https://slotbot-ide.vercel.app/play/monkey-business?mute=1"
                width="100%"
                height="600"
                style={{ border: 'none', display: 'block', background: '#0a1f3d' }}
                allowFullScreen
                title="Monkey Business slot"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── JOIN THE CLUB ─────────────────────────── */}
      <section id="club" className="relative py-24 px-5 sm:px-10">
        <div className="absolute inset-0 -z-10">
          <Image src="/img/bg-jungle.png" alt="" fill className="object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-felt-deep via-felt-deep/95 to-felt-deep" />
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-banana font-[family-name:var(--font-mono)]">
              Chapter Four
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-headline)] text-5xl sm:text-6xl text-cream">
              Join <em className="text-banana">Monkey Biz</em>
            </h2>
            <p className="mt-4 font-[family-name:var(--font-body)] italic text-cream/70 max-w-xl mx-auto">
              Download PokerBros and join the club. Click the referral link below and you&apos;ll be
              added to Monkey Biz Poker automatically.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left — QR code + club info */}
            <div className="rounded-sm border border-gold/40 bg-felt-deep/75 backdrop-blur p-6 sm:p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
              <div className="flex flex-col items-center text-center">
                <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white rounded-lg p-2.5 shadow-lg">
                  <Image
                    src="/img/pokerbros-qr.png"
                    alt="Scan to join Monkey Biz Poker on PokerBros"
                    width={224}
                    height={224}
                    className="w-full h-full"
                  />
                </div>
                <p className="mt-4 font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.25em] text-cream/50">
                  Scan with your phone camera
                </p>

                <div className="mt-6 w-full grid grid-cols-2 gap-4">
                  <div className="rounded border border-gold/30 bg-felt-light/30 p-4 text-center">
                    <div className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-cream/50 mb-1">
                      Club ID
                    </div>
                    <div className="font-[family-name:var(--font-display)] text-2xl text-banana-bright neon">
                      1670819
                    </div>
                  </div>
                  <div className="rounded border border-gold/30 bg-felt-light/30 p-4 text-center">
                    <div className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-[0.2em] text-cream/50 mb-1">
                      Referrer
                    </div>
                    <div className="font-[family-name:var(--font-display)] text-2xl text-cream">
                      2058251
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — steps */}
            <div className="space-y-5">
              <div className="rounded-sm border border-gold/30 bg-felt-deep/75 backdrop-blur p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-full bg-banana text-felt-deep font-bold flex items-center justify-center font-[family-name:var(--font-mono)]">1</span>
                  <span className="font-[family-name:var(--font-headline)] text-xl text-cream">Download PokerBros</span>
                </div>
                <p className="font-[family-name:var(--font-body)] text-cream/70 mb-4">
                  Free app available on iPhone and Android. Takes 30 seconds.
                </p>
                <div className="flex gap-3">
                  <a
                    href="https://apps.apple.com/us/app/pokerbros/id1465194546"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-4 py-2.5 bg-gradient-to-b from-banana-bright to-gold text-felt-deep rounded font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest shadow-[0_3px_0_rgba(0,0,0,0.3)] hover:translate-y-[1px] transition"
                  >
                    App Store
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.kpgame.PokerBros"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-4 py-2.5 bg-gradient-to-b from-banana-bright to-gold text-felt-deep rounded font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest shadow-[0_3px_0_rgba(0,0,0,0.3)] hover:translate-y-[1px] transition"
                  >
                    Google Play
                  </a>
                </div>
              </div>

              <div className="rounded-sm border border-gold/30 bg-felt-deep/75 backdrop-blur p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-full bg-banana text-felt-deep font-bold flex items-center justify-center font-[family-name:var(--font-mono)]">2</span>
                  <span className="font-[family-name:var(--font-headline)] text-xl text-cream">Join the Club</span>
                </div>
                <p className="font-[family-name:var(--font-body)] text-cream/70 mb-4">
                  Tap the link below from your phone. It opens PokerBros and auto-adds you to
                  Monkey Biz Poker — no club code needed.
                </p>
                <a
                  href="https://i.pokerbros.net/D1LwWJqsU2b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-5 py-3 border-2 border-banana text-banana rounded font-[family-name:var(--font-display)] tracking-wider text-xl hover:bg-banana/10 transition"
                >
                  JOIN MONKEY BIZ
                </a>
              </div>

              <div className="rounded-sm border border-gold/30 bg-felt-deep/75 backdrop-blur p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-full bg-banana text-felt-deep font-bold flex items-center justify-center font-[family-name:var(--font-mono)]">3</span>
                  <span className="font-[family-name:var(--font-headline)] text-xl text-cream">Or Join Manually</span>
                </div>
                <p className="font-[family-name:var(--font-body)] text-cream/70">
                  Open PokerBros, tap &ldquo;Search Club,&rdquo; enter Club ID <strong className="text-banana">1670819</strong> and
                  Referrer <strong className="text-banana">2058251</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────── CONTACT ─────────────────────────── */}
      <section id="contact" className="relative py-20 px-5 sm:px-10">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-felt-deep via-felt/60 to-felt-deep" />
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-banana font-[family-name:var(--font-mono)]">
              Got Questions?
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-headline)] text-5xl sm:text-6xl text-cream">
              Talk to a <em className="text-banana">Monkey</em>
            </h2>
            <p className="mt-4 font-[family-name:var(--font-body)] italic text-cream/70 max-w-xl mx-auto">
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
                className="relative rounded-sm border border-gold/30 bg-felt-deep/75 backdrop-blur p-6 sm:p-8 overflow-hidden group hover:border-banana/70 transition"
              >
                <span className="absolute top-2 left-2 text-gold/40 text-xs">✦</span>
                <span className="absolute top-2 right-2 text-gold/40 text-xs">✦</span>
                <span className="absolute bottom-2 left-2 text-gold/40 text-xs">✦</span>
                <span className="absolute bottom-2 right-2 text-gold/40 text-xs">✦</span>

                <div className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.25em] text-cream/50 mb-1">
                  Host
                </div>
                <h3 className="font-[family-name:var(--font-headline)] text-3xl sm:text-4xl text-banana mb-5">
                  {c.name}
                </h3>

                <div className="space-y-3">
                  <a
                    href={c.phoneHref}
                    className="flex items-center gap-3 p-3 rounded bg-felt-light/30 border border-gold/20 hover:border-banana/60 hover:bg-felt-light/50 transition touch-manipulation"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-banana shrink-0">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <div className="flex-1">
                      <div className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-widest text-cream/50">
                        Phone
                      </div>
                      <div className="font-[family-name:var(--font-mono)] text-cream">
                        {c.phone}
                      </div>
                    </div>
                  </a>

                  <a
                    href={c.tgHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded bg-felt-light/30 border border-gold/20 hover:border-banana/60 hover:bg-felt-light/50 transition touch-manipulation"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-banana shrink-0">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                    <div className="flex-1">
                      <div className="font-[family-name:var(--font-mono)] text-[0.6rem] uppercase tracking-widest text-cream/50">
                        Telegram
                      </div>
                      <div className="font-[family-name:var(--font-mono)] text-cream">
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
      <section id="wall" className="relative py-24 px-5 sm:px-10">
        <div className="absolute inset-0 -z-10">
          <Image src="/img/bg-wall.png" alt="" fill className="object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-felt-deep via-felt-deep/90 to-felt-deep" />
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-banana font-[family-name:var(--font-mono)]">
              Chapter Five
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-headline)] text-5xl sm:text-6xl text-cream">
              The <em className="text-banana">Wall</em>
            </h2>
            <p className="mt-4 font-[family-name:var(--font-body)] italic text-cream/70 max-w-xl mx-auto">
              Brag, rib, propose a prop bet, or leave a love letter to your nut flush. Make it look
              however you want.
            </p>
          </div>

          <div className="rounded-sm border border-gold/30 bg-felt-deep/70 backdrop-blur p-6 sm:p-10 mb-14">
            <WallForm />
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-[family-name:var(--font-hand)] text-3xl text-banana/70">
                Nothing on the wall yet. Be first.
              </p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
              {posts.map((p, i) => (
                <div key={p.id} className="mb-6 break-inside-avoid">
                  <WallPost post={p} index={i} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────── FOOTER ─────────────────────────── */}
      <footer className="relative py-14 px-5 sm:px-10 border-t border-gold/30 bg-felt-deep">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-[auto_1fr_auto] items-center gap-6">
          <div>
            <div className="font-[family-name:var(--font-display)] text-banana text-2xl neon">
              MONKEY BIZ POKER
            </div>
            <div className="font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.3em] text-cream/50 mt-1">
              Private poker lounge · Est. 1974
            </div>
          </div>
          <div className="text-center text-cream/50 font-[family-name:var(--font-body)] italic">
            “If you can&apos;t spot the sucker in your first half hour at the table, then you
            <em className="text-banana"> are</em> the sucker.” — Rounders
          </div>
          <div className="sm:text-right font-[family-name:var(--font-mono)] text-[0.65rem] uppercase tracking-[0.3em] text-cream/50">
            © {new Date().getFullYear()} M.B.
          </div>
        </div>
      </footer>

      <PokerBrosFAB />
    </main>
  )
}
