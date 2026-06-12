import Link from 'next/link'

type Step = {
  num: string
  title: string
  items: readonly string[]
  important?: boolean
  subtitle?: string
  record?: { type: string; host: string; value: string; ttl: string }
}

const STEPS: Step[] = [
  {
    num: '01',
    title: 'Go to DNS in GoDaddy',
    items: [
      'Log into GoDaddy',
      'Click My Products',
      'Find your domain',
      'Click DNS (or "Manage DNS")',
    ],
  },
  {
    num: '02',
    title: 'Remove Conflicts',
    important: true,
    items: [
      'Look for any existing record with Host: www',
      'If it exists \u2014 DELETE it (or edit it to match the new one below)',
    ],
  },
  {
    num: '03',
    title: 'Add the CNAME Record',
    items: ['Click Add and enter the record below, then click Save'],
    record: { type: 'CNAME', host: 'www', value: 'cname.vercel-dns.com', ttl: '1 Hour' },
  },
  {
    num: '04',
    title: 'Root Domain Setup',
    subtitle: 'Optional but recommended \u2014 makes the naked domain work too',
    items: ['Add this A record so monkeybizpoker.com (no www) also works'],
    record: { type: 'A', host: '@', value: '76.76.21.21', ttl: '1 Hour' },
  },
  {
    num: '05',
    title: 'Back to Vercel',
    items: [
      'Go back to your Vercel project dashboard',
      'Click Verify or Refresh on the domain',
    ],
  },
  {
    num: '06',
    title: 'Wait for Propagation',
    items: [
      'Usually works in 5\u201315 minutes',
      'Sometimes up to 1 hour',
    ],
  },
]

const MISTAKES = [
  'Having BOTH an A and CNAME on www',
  'Typo in cname.vercel-dns.com',
  'Forgetting to delete the old www record',
]

export default function SetupPage() {
  return (
    <main className="relative min-h-screen py-16 px-5 sm:px-10">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-cream/60 font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.25em] hover:text-banana transition mb-8"
        >
          <span>\u2190</span> Back to main page
        </Link>

        {/* Header */}
        <div className="mb-14">
          <span className="text-[0.7rem] uppercase tracking-[0.3em] text-banana font-[family-name:var(--font-mono)]">
            Domain Setup
          </span>
          <h1 className="mt-3 font-[family-name:var(--font-headline)] text-4xl sm:text-5xl text-cream">
            Connect Your <em className="text-banana">Domain</em>
          </h1>
          <p className="mt-4 font-[family-name:var(--font-body)] text-cream/70 italic max-w-xl">
            Point monkeybizpoker.com to Vercel so the site goes live.
            Copy-paste checklist \u2014 takes about 5 minutes.
          </p>
        </div>

        {/* What Vercel needs */}
        <div className="rounded-sm border border-banana/40 bg-banana/10 p-5 sm:p-6 mb-10">
          <h2 className="font-[family-name:var(--font-mono)] text-[0.7rem] uppercase tracking-[0.25em] text-banana mb-3">
            What Vercel is asking for
          </h2>
          <div className="font-[family-name:var(--font-mono)] text-sm text-cream/90 space-y-1">
            <div className="flex gap-4">
              <span className="text-cream/50 w-20 shrink-0">Type:</span>
              <span className="text-banana font-bold">CNAME</span>
            </div>
            <div className="flex gap-4">
              <span className="text-cream/50 w-20 shrink-0">Name:</span>
              <span className="text-banana font-bold">www</span>
            </div>
            <div className="flex gap-4">
              <span className="text-cream/50 w-20 shrink-0">Value:</span>
              <span className="text-banana font-bold">cname.vercel-dns.com</span>
            </div>
            <div className="flex gap-4">
              <span className="text-cream/50 w-20 shrink-0">TTL:</span>
              <span className="text-cream">1 Hour (default)</span>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {STEPS.map((step) => (
            <section
              key={step.num}
              className={`relative rounded-sm border p-5 sm:p-6 ${
                step.important
                  ? 'border-red-500/50 bg-red-500/5'
                  : 'border-gold/30 bg-felt-deep/60'
              }`}
            >
              {/* Step number badge */}
              <div className="absolute -top-3 left-5 bg-felt-deep border border-gold/50 rounded px-3 py-0.5">
                <span className="font-[family-name:var(--font-display)] text-banana text-sm tracking-widest neon">
                  STEP {step.num}
                </span>
              </div>

              <h3 className="mt-2 font-[family-name:var(--font-headline)] text-2xl text-cream">
                {step.title}
                {step.important && (
                  <span className="ml-2 text-red-400 text-sm font-[family-name:var(--font-mono)] uppercase">
                    Important
                  </span>
                )}
              </h3>

              {step.subtitle && (
                <p className="mt-1 text-sm text-cream/60 font-[family-name:var(--font-body)] italic">
                  {step.subtitle}
                </p>
              )}

              <ul className="mt-4 space-y-2">
                {step.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 font-[family-name:var(--font-body)] text-cream/85"
                  >
                    <span className="text-gold mt-1 shrink-0">&#9830;</span>
                    {item}
                  </li>
                ))}
              </ul>

              {step.record && (
                <div className="mt-5 rounded bg-felt-deep border border-gold/20 p-4 font-[family-name:var(--font-mono)] text-sm">
                  <div className="grid grid-cols-[80px_1fr] gap-y-1.5 gap-x-4">
                    <span className="text-cream/50">Type</span>
                    <span className="text-banana font-bold">{step.record.type}</span>
                    <span className="text-cream/50">Host</span>
                    <span className="text-banana font-bold">{step.record.host}</span>
                    <span className="text-cream/50">Points to</span>
                    <span className="text-banana font-bold">{step.record.value}</span>
                    <span className="text-cream/50">TTL</span>
                    <span className="text-cream">{step.record.ttl}</span>
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Final result */}
        <div className="mt-12 rounded-sm border border-gold/40 bg-felt-deep/60 p-5 sm:p-6">
          <h2 className="font-[family-name:var(--font-headline)] text-2xl text-cream mb-4">
            Final Result
          </h2>
          <div className="space-y-2 font-[family-name:var(--font-mono)] text-sm">
            <div className="flex items-center gap-3">
              <span className="text-neon-green">&#10003;</span>
              <span className="text-cream/70">www.monkeybizpoker.com</span>
              <span className="text-cream/40">\u2192</span>
              <span className="text-banana">Vercel (via CNAME)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-neon-green">&#10003;</span>
              <span className="text-cream/70">monkeybizpoker.com</span>
              <span className="text-cream/40">\u2192</span>
              <span className="text-banana">Vercel (via A record)</span>
            </div>
          </div>
        </div>

        {/* Common mistakes */}
        <div className="mt-8 rounded-sm border border-red-500/30 bg-red-500/5 p-5 sm:p-6">
          <h2 className="font-[family-name:var(--font-headline)] text-2xl text-cream mb-4">
            Common Mistakes
          </h2>
          <ul className="space-y-2">
            {MISTAKES.map((m, i) => (
              <li
                key={i}
                className="flex items-start gap-3 font-[family-name:var(--font-body)] text-cream/85"
              >
                <span className="text-red-400 mt-0.5 shrink-0">&#10007;</span>
                {m}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer link */}
        <div className="mt-14 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-banana-bright to-gold text-felt-deep rounded font-[family-name:var(--font-display)] tracking-wider shadow-[0_6px_0_rgba(0,0,0,0.35)] hover:translate-y-[1px] active:translate-y-[4px] active:shadow-[0_2px_0_rgba(0,0,0,0.35)] transition"
          >
            BACK TO THE TABLE
          </Link>
        </div>
      </div>
    </main>
  )
}
