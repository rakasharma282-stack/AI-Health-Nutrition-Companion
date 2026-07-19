# Patterns

## Code Style
- TypeScript strict mode
- Functional React components, named exports
- Server Components by default; `"use client"` only where interactivity required
- Early returns, small functions

## Naming
- Files: kebab-case (`food-search.tsx`, `meal-log-form.tsx`)
- Components: PascalCase (`FoodSearch`, `MealLogForm`)
- DB fields: camelCase (Prisma default)
- API routes: RESTful, kebab-case paths

## Error Handling
- API routes return `{ error: string }` with appropriate HTTP status
- Client: toast notifications for errors, never silent failures
- AI failures: graceful fallback message + retry option

## Testing
- Unit tests: `*.test.ts` for pure functions (nutrition calc, BMR/TDEE)
- API integration tests: route handlers with test DB or mocked Prisma
- Browser tests: tester sub-agent via Playwright on preview URL

## AI Integration
- ALL AI calls server-side (never expose API key to client)
- Every AI response appended with medical disclaimer:
  "⚠️ This is educational wellness information, not medical advice. Consult a healthcare professional for diagnosis or treatment."
- Vision requests: image → base64 → vision LLM → structured JSON
- Structured outputs: instruct model to return JSON, parse defensively

## Theme
- CSS variables for colors; `.dark` class on <html>
- Glassmorphism: `bg-white/10 backdrop-blur-md border border-white/20`
- Consistent spacing via Tailwind

## Auth
- Protect API routes with `getServerSession` wrapper
- Admin routes: additional role check
- Never trust client for role/identity

## Database
- Prisma client singleton pattern (avoid multiple instances in dev)
- Migrations for all schema changes
- Seed script for food DB + admin user
