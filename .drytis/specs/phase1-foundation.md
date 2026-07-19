# Phase 1: Foundation

## Goal
Scaffold Next.js, set up Prisma + MySQL, NextAuth, health profile, and base UI shell with theme toggle.

## Files to Create
- `prisma/schema.prisma` — full data model
- `prisma/seed.ts` — admin user + demo user + sample food items
- `src/lib/prisma.ts` — Prisma client singleton
- `src/lib/auth.ts` — NextAuth config (Credentials provider)
- `src/lib/nutrition.ts` — BMR/TDEE + macro calc
- `src/app/layout.tsx` — root layout with ThemeProvider
- `src/app/globals.css` — Tailwind + glassmorphism design tokens
- `src/app/(auth)/login/page.tsx` — login form
- `src/app/(auth)/register/page.tsx` — register form
- `src/app/(app)/layout.tsx` — authenticated shell (sidebar + topbar)
- `src/app/(app)/dashboard/page.tsx` — dashboard placeholder
- `src/app/(app)/profile/page.tsx` — health profile form
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth handler
- `src/app/api/profile/route.ts` — GET/PUT health profile
- `src/app/api/auth/register/route.ts` — registration endpoint
- `src/components/theme-provider.tsx` — next-themes wrapper
- `src/components/layout/sidebar.tsx` — navigation sidebar
- `src/components/layout/topbar.tsx` — top bar with theme toggle
- `src/components/ui/*` — glass-card, button, input
- `tailwind.config.ts`, `postcss.config.js`

## Acceptance Criteria
- [ ] `npm run dev` starts without errors
- [ ] Prisma migration runs successfully against MySQL
- [ ] User can register with email/password
- [ ] User can log in and see dashboard
- [ ] Unauthenticated users redirected to /login
- [ ] Health profile form saves BMR + daily calorie target
- [ ] Theme toggle switches dark/light
- [ ] Glassmorphism styling visible on cards
- [ ] Sidebar navigation to all module placeholders
- [ ] Seed creates admin + demo user with known credentials

## Credentials (for tester)
- Demo user: demo@nutrition.app / Demo@1234
- Admin: admin@nutrition.app / Admin@1234

## Test Credentials File
After seeding, write `/workspace/.drytis/cred.json` with verified accounts.
