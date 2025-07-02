# Vocabulary Builder

A web application for managing spaced-repetition vocabulary learning with AI-assisted extraction and study tools.

## Quick Start

1. **Clone & install**
   ```bash
   git clone <repo-url>
   cd project-4
   npm install
   ```
2. **Configure environment** – copy the example env file and fill in your keys.
   ```bash
   cp env.example .env
   # edit .env and add your keys
   ```
3. **Run locally**
   ```bash
   npm run dev
   # app served at http://localhost:5173
   ```
4. **Start Supabase locally (optional)**
   ```bash
   supabase start
   ```

## Deployment (Supabase + Vercel / Netlify)

1. **Link Supabase project**
   ```bash
   supabase link --project-ref <your-project-ref>
   ```
2. **Deploy Edge Functions**
   ```bash
   supabase functions deploy ai-vocabulary-assistant
   supabase functions deploy process-document
   ```
3. **Push database migrations**
   ```bash
   supabase db push
   ```
4. **Set environment variables** in your hosting platform (matching those in `.env`).
5. **Build & deploy frontend**
   ```bash
   npm run build
   # then deploy `dist/` folder with your preferred platform
   ```

## Environment Variables

| Key | Description |
| --- | ----------- |
| `VITE_SUPABASE_URL` | Supabase project URL for the frontend |
| `VITE_SUPABASE_ANON_KEY` | Public anon key for the frontend |
| `SUPABASE_URL` | Supabase project URL for Edge Functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key for server-side database access |
| `CLAUDE_API_KEY` | Anthropic Claude API key used by AI features |

## Repository Structure

```
src/                      # React (Vite) frontend
supabase/functions/       # Edge functions (Deno)
supabase/migrations/      # SQL migrations
supabase/functions/_shared/ types.ts  # Shared types for edge functions
```

## Contributing

1. Create a feature branch.
2. Commit with conventional messages.
3. Open a PR following the checklist in CONTRIBUTING.md (coming soon).

---
Built with React + TypeScript, Supabase, and Tailwind CSS. 