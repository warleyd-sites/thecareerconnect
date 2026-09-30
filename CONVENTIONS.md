# Conventions

Project rules aider must always follow. Read at every prompt — keep tight.

## Stack
- React 18 + Vite + TypeScript + Tailwind + shadcn/ui + Supabase
- Edit `.tsx`/`.ts` only — never write `.jsx`/`.js`

## UI
- Use shadcn/ui components — never raw `<button>`, `<input>`, `<select>`
- Tailwind only — no inline `style={{}}`, no CSS modules, no styled-components
- All new routes need a loading state and an error state
- Mobile-first responsive (`sm:`, `md:`, `lg:` — start with no prefix for mobile)

## Data
- Supabase queries live in `src/lib/supabase/` or equivalent — never inline in components
- RLS-protected: assume every table has RLS, write queries that respect it
- Use the typed Supabase client — never `as any` on query results

## Code style
- Functional components only, no class components
- Hooks at the top, then handlers, then JSX
- Named exports for components, default export only for routes
- No `any`. Use `unknown` + narrowing if the type is truly unknown.

## Scope discipline
- Don't refactor surrounding code when fixing a bug
- Don't add error handling for cases that can't happen
- Don't write comments that restate what the code does
- Three similar lines is fine — don't extract a helper for two callers

## Don't
- Don't `git push` (the human handles that)
- Don't edit `.env*` files — surface needed vars in chat instead
- Don't add new dependencies without asking first
- Don't disable lint rules with `// eslint-disable` — fix the underlying issue
