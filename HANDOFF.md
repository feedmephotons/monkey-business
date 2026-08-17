# Monkey Biz Poker - Vercel Ownership Handoff

You (Josh's Claude) are picking up ownership of this site. It's live and healthy - the only reason for this handoff is that Winston wants to move Vercel ownership to Josh's own free Hobby account so Josh owns the project end-to-end and Winston isn't the bottleneck.

**Do not treat this as an audit of the code.** The codebase has evolved past the point where a single doc can describe every feature. Read the actual files to understand what's there. This doc is only about the mechanics of taking over the deploy.

## Current state

- Live at https://monkeybizpoker.com (custom domain) and https://monkey-business-red.vercel.app (auto Vercel URL)
- Deployed on Vercel team `dino-killers` (Winston's team) as project `monkey-business`
- Stack: Next.js 16 App Router + Tailwind v4 + Supabase + pnpm
- Supabase project is `taskx` (Winston's), tables prefixed `mb_`
- GitHub: https://github.com/feedmephotons/monkey-business (public, main branch)
- Every deploy so far: `vercel deploy --prod` from the working directory

## The goal

Deploy this same code to Josh's own Vercel Hobby account so Josh owns the project. Attach `monkeybizpoker.com` to Josh's project. DNS at GoDaddy stays exactly the same - Vercel's shared endpoints (`76.76.21.21` and `cname.vercel-dns.com`) don't care which account owns the domain.

## Steps for you (Josh's Claude)

1. `pnpm install`
2. `pnpm build` locally first to catch any env-var issues before deploying
3. Ask Josh to log into Vercel and confirm he has a free Hobby account
4. `pnpm exec vercel login` if not already
5. `pnpm exec vercel link` - create a NEW project under Josh's personal scope (name it `monkey-business` or `monkey-biz-poker`)
6. Add these three env vars to Production, Preview, and Development (values come from Winston via Josh):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   
   If the CLI (`vercel env add`) gets stuck asking for a git branch on Preview, skip the CLI and hit the Vercel REST API directly:
   ```
   POST https://api.vercel.com/v10/projects/<PROJECT_ID>/env
   Authorization: Bearer <TOKEN>
   Body: [
     { "key": "NEXT_PUBLIC_SUPABASE_URL",       "value": "...", "target": ["production","preview","development"], "type": "plain"     },
     { "key": "NEXT_PUBLIC_SUPABASE_ANON_KEY",  "value": "...", "target": ["production","preview","development"], "type": "encrypted" },
     { "key": "SUPABASE_SERVICE_ROLE_KEY",      "value": "...", "target": ["production","preview","development"], "type": "encrypted" }
   ]
   ```
7. `pnpm exec vercel deploy --prod --yes`
8. Verify Josh's `.vercel.app` URL renders the site correctly (hero, schedule, wall posts, FAB modal, `/setup`, `/bracket`, all routes)

## Domain cutover (do this AFTER step 8 works)

Coordinate the exact moment with Winston. The window between removing the domain from his project and adding it to Josh's is ~30 seconds of downtime for `monkeybizpoker.com` visitors.

1. Winston runs:
   ```
   vercel domains rm monkeybizpoker.com --token=<WINSTON_TOKEN> --scope=dino-killers --yes
   vercel domains rm www.monkeybizpoker.com --token=<WINSTON_TOKEN> --scope=dino-killers --yes
   ```
2. Josh's Claude immediately runs in the project dir:
   ```
   pnpm exec vercel domains add monkeybizpoker.com
   pnpm exec vercel domains add www.monkeybizpoker.com
   ```
3. Wait ~30-60 seconds, curl the domain, confirm it's serving Josh's project.

DNS at GoDaddy does not need to change. Both records already point at Vercel's shared endpoints and route by hostname, not by team.

## Env-var values

Winston will send you the three JWT values out-of-band (via Josh, not in the repo). They are long - triple-check they arrive intact with no line breaks. The service role key in particular grants full DB access, so treat it like a password.

## Rules that will bite you

- This is Next.js 16 (not 14, not 15). Read `node_modules/next/dist/docs/` before writing Next-specific code - APIs and conventions have changed.
- Tailwind v4 will silently drop `text-[clamp(1rem,2vw,3rem)]` and similar arbitrary values with commas. Use inline `style` for those.
- Tailwind v4 does not accept `min-h-[100svh]`. Inline `style={{ minHeight: '100svh' }}`.
- Never commit `.env.local`. `.gitignore` already covers `.env*` but double-check.
- Do NOT use em-dashes in commit messages, PR descriptions, or anything that Winston might paste into a Windows client - use hyphens instead. Winston's paste target garbles em-dashes.

## Things NOT in scope for this handoff

- Feature work. If Josh wants new features, he'll ask you separately.
- Supabase migration. The site keeps using Winston's `taskx` Supabase project unless Josh explicitly asks to move to his own instance (which is a whole separate task).
- Redesign. Winston has been iterating on visual details; don't second-guess them.

## If something goes wrong

Ping Winston through Josh. He's been the primary maintainer and has full context on the deploy history, DNS quirks (there was a re-link incident earlier that wiped env vars once - use the REST API workaround preemptively), and the various Vercel CLI 50.44.x edge cases.
