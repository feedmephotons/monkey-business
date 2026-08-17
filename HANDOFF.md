# Monkey Biz Poker - Handoff

You (Josh's Claude) are taking over this site from another Claude session. The site is live and the goal is to move it onto Josh's own Vercel Hobby (free) account so he owns everything. Winston (the current maintainer) will remove the domain from his team's project on a coordinated cutover.

## What this is

Next.js 16 App Router + Tailwind v4 + Supabase site for the Monkey Biz Poker club. Live at:
- https://monkeybizpoker.com (custom domain, currently attached to Winston's team project)
- https://monkey-business-red.vercel.app (auto Vercel URL)

## Stack

- **Next.js 16.2.3** (Turbopack, App Router) - read `node_modules/next/dist/docs/` before writing Next code, breaking changes vs older versions
- **Tailwind v4** - CSS-first config, palette lives in `app/globals.css`
- **@supabase/supabase-js 2.103.0** - talks to the shared `taskx` Supabase project
- **pnpm** for package management
- **Playwright** (devDep) for QA screenshots

## Files that matter

- `app/page.tsx` - the whole homepage (hero, schedule, budget ledger, slot iframe, club section, contact, wall)
- `app/setup/page.tsx` - DNS setup guide at `/setup`
- `app/actions.ts` - server action for wall posts
- `app/globals.css` - color tokens, animations, custom utilities
- `components/WallForm.tsx` - client, styled post composer with live preview
- `components/WallPost.tsx` - server, renders a single post
- `components/PokerBrosFAB.tsx` - floating "Club Info" pill + modal
- `components/PokerBrosLink.tsx` - device-aware app-store link (currently unused after FAB replaced it, safe to delete)
- `lib/supabase.ts` - client (uses anon key)
- `supabase/schema.sql` - the tables (all prefixed `mb_`). Already applied.
- `scripts/generate-images.mjs` - Gemini 3 Pro image generator (already ran, outputs in `public/img/`)

## Supabase tables (already exist in the `taskx` project)

All prefixed `mb_`:
- `mb_wall_posts` - public wall (RLS: public read + public insert)
- `mb_budget_ledger` - $1,210 budget line items, RLS public read
- `mb_players`, `mb_freeroll_entries`, `mb_satellite_tickets`, `mb_slot_config`, `mb_slot_payouts` - operator-side tables

Josh does NOT need his own Supabase unless he wants to. The plan is to keep pointing at Winston's `taskx` project so the wall data survives the move. Winston will send you the three env-var values via Josh.

## Env vars needed

Set all three in Josh's new Vercel project across Production, Preview, and Development:

- `NEXT_PUBLIC_SUPABASE_URL` - the taskx project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - anon key
- `SUPABASE_SERVICE_ROLE_KEY` - service role (used by the wall-post server action)

Winston will send these values to you via Josh (not committed to the repo). If Vercel CLI 50.44.x rejects `env add ... preview` with a git-branch prompt, use the Vercel REST API instead:

```
POST https://api.vercel.com/v10/projects/<PROJECT_ID>/env
Authorization: Bearer <JOSH_VERCEL_TOKEN>
Body: [{ key, value, target: ["production","preview","development"], type: "encrypted" }, ...]
```

## Deployment steps for Josh's Hobby account

1. `pnpm install`
2. `pnpm exec vercel link` - link to Josh's personal Vercel scope (create a new project named `monkey-business` or `monkey-biz-poker`)
3. Add the three env vars (see above) to Production, Preview, Development
4. `pnpm build` locally to confirm it compiles
5. `pnpm exec vercel deploy --prod --yes`

Verify:
- Hero loads
- Schedule shows all 7 days with dates May 25-31
- Wall posts render (should show existing posts from the shared Supabase)
- FAB opens the club modal
- `/setup` page loads

## Domain cutover (`monkeybizpoker.com` and `www.monkeybizpoker.com`)

The domain is currently on Winston's team project (`dino-killers/monkey-business`). Coordinate with Winston to swap it in this exact order:

1. Josh's project deploys and is confirmed working on its auto `.vercel.app` URL.
2. Winston removes the domain from his project via:
   ```
   vercel domains rm monkeybizpoker.com --token=<WINSTON_TOKEN> --scope=dino-killers --yes
   vercel domains rm www.monkeybizpoker.com --token=<WINSTON_TOKEN> --scope=dino-killers --yes
   ```
3. Immediately after, Josh's Claude adds them to Josh's project:
   ```
   pnpm exec vercel domains add monkeybizpoker.com
   pnpm exec vercel domains add www.monkeybizpoker.com
   ```
4. DNS at GoDaddy stays exactly the same (A @ 76.76.21.21, CNAME www cname.vercel-dns.com). No changes needed at the registrar.

Expected downtime: about 30 seconds while the domain is unclaimed between step 2 and step 3.

## Ongoing operational stuff

- **The slot iframe** points at `https://slotbot-ide.vercel.app/play/monkey-business?mute=1`. Muted by default.
- **PokerBros referral link**: `https://i.pokerbros.net/D1LwWJqsU2b` (in `PokerBrosFAB.tsx` and `app/page.tsx`)
- **Club ID**: 1670819, **Referrer**: 2058251
- **Contact hosts**: Banana Lou (509-666-2743, @Monkeybizpoker), Donkey Diesel (302-784-4793, @BigDiesel22)
- **QR code**: `public/img/pokerbros-qr.png`

## Global rules from Winston

- This is Next.js 16 - APIs differ from older versions. Read the installed docs at `node_modules/next/dist/docs/` before writing Next-specific code.
- Do NOT commit `.env.local` or any secrets.
- Tailwind v4 arbitrary values with commas (like `text-[clamp(1rem,2vw,3rem)]`) do not compile - use inline `style` for those cases.
- Tailwind v4 does not accept `min-h-[100svh]` - inline `style={{ minHeight: '100svh' }}` for svh units.

## Questions to bring back to Winston (via Josh) before deploying

- Confirmed the three env-var values arrived intact? (they're long JWTs)
- Ready to coordinate the ~30-second domain cutover window?
- Josh wants his own fresh Supabase eventually, or is staying on Winston's `taskx` project fine?
