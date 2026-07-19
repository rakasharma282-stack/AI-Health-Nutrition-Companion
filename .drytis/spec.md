# AI Health & Nutrition Companion — Spec

## Overview
Responsive web platform for nutrition tracking, AI food recognition, personalized coaching, fitness planning, and wellness insights. **Lifestyle/educational tool — NOT a medical diagnostic system.** Every AI output carries a medical disclaimer.

## Tech Stack
- Next.js (App Router, full-stack TypeScript)
- Prisma ORM + MySQL (auto-provisioned)
- OpenAI-compatible vision LLM (food recognition, coaching, chat, recipes, insights)
- NextAuth (Credentials + Google providers)
- Tailwind CSS, glassmorphism, dark/light themes
- Recharts for animated charts

## Core Decisions
- Single-deployable Next.js app (frontend + API routes)
- All AI calls server-side via `/app/api/*` routes
- Prisma as data layer; all schema changes via migrations
- Image uploads stored locally in `/public/uploads` (dev) — extensible to S3 later
- Medical disclaimers injected into every AI response automatically
- RBAC roles: USER, PREMIUM, NUTRITIONIST, ADMIN

## Modules
1. User Management (auth, profile, health goals)
2. AI Calorie Counter (search + photo)
3. AI Food Recognition (vision LLM)
4. Nutrition Coach (meal plans)
5. Fitness Planner (workouts + activity logging)
6. Wellness Guidance (articles)
7. Health Insights (trends + AI commentary)
8. AI Chat Assistant
9. Recipe Generator
10. Grocery Planner
11. Admin Dashboard
12. Premium UI (glassmorphism, themes, charts, responsive)
