# Architecture

## Directory Structure
```
/workspace
├── prisma/
│   ├── schema.prisma          # all models
│   ├── migrations/            # generated
│   └── seed.ts                # food DB + admin + demo user
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # login, register
│   │   ├── (app)/             # authenticated app
│   │   │   ├── dashboard/
│   │   │   ├── meals/         # log + search + photo
│   │   │   ├── coach/         # meal plans + recipes
│   │   │   ├── fitness/       # exercise planner + logs
│   │   │   ├── progress/      # weight/hydration/sleep/mood
│   │   │   ├── grocery/       # grocery planner
│   │   │   ├── chat/          # AI assistant
│   │   │   └── wellness/      # articles
│   │   ├── (admin)/           # admin dashboard
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   ├── meals/
│   │   │   ├── ai/            # food-recognition, coach, chat, recipe, insights
│   │   │   ├── fitness/
│   │   │   ├── progress/
│   │   │   └── admin/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                # glass card, button, input, modal, chart
│   │   ├── layout/            # sidebar, topbar, theme-toggle
│   │   ├── meals/             # food-search, meal-log-form, photo-uploader
│   │   ├── coach/             # meal-plan-card, recipe-card
│   │   ├── charts/            # calorie-chart, macro-ring, trend-chart
│   │   └── ...
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── auth.ts            # NextAuth config
│   │   ├── ai.ts              # LLM client wrapper + disclaimer injector
│   │   ├── nutrition.ts       # BMR/TDEE calc, macro splits
│   │   └── utils.ts
│   ├── stores/                # zustand stores
│   └── types/
├── public/uploads/            # meal photos (dev)
├── .env                       # via add_environment_key ONLY
└── package.json
```

## Data Flow
- Client → Next.js API route → Prisma → MySQL
- AI requests: Client → API route → server-side fetch to LLM (key never leaves server)
- Image flow: Client uploads → API route saves to /public/uploads → passes URL to vision model
- Auth: NextAuth JWT session, role in session token

## Routing
- `/` → redirect to `/dashboard` if authed, else `/login`
- `/login`, `/register` (public)
- `/dashboard`, `/meals`, `/coach`, `/fitness`, `/progress`, `/chat`, `/wellness`, `/grocery` (authed)
- `/admin/*` (admin role only)
