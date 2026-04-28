# Flashcard Mastery

A spaced repetition flashcard app built with **Next.js 14**, **Supabase**, and the **SM-2 algorithm** — helping you learn faster and retain longer.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?logo=tailwindcss)

---

## Features

- **Spaced Repetition (SM-2)** — Cards are scheduled based on how well you remembered them, optimizing review intervals automatically
- **Deck Management** — Create, edit, and delete flashcard decks with custom color coding
- **Card CRUD** — Add, edit, and delete cards within each deck
- **Study Sessions** — Interactive 3D flip cards with quality rating buttons (Again / Hard / Good / Easy)
- **Progress Tracking** — Per-card progress stored with ease factor, interval, and next review date
- **Keyboard Shortcuts** — `Space` to flip, `1/2/4/5` to rate, `Esc` to exit
- **Authentication** — Email/password auth with Supabase Auth, protected routes via middleware
- **Responsive UI** — Glassmorphism design with Tailwind CSS and Framer Motion animations

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.3 |
| Styling | Tailwind CSS 3.4 + Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + `@supabase/ssr` |
| Validation | Zod |
| Testing | Jest + React Testing Library |
| Deployment | Vercel |
| CI/CD | GitHub Actions |

---

## Project Structure

```
flash-card/
├── app/                        # Next.js App Router pages
│   ├── (auth)/                 # Public auth routes (login, signup)
│   ├── (protected)/            # Authenticated routes
│   │   ├── dashboard/          # Deck overview
│   │   ├── deck/[deckId]/      # Deck detail & card management
│   │   └── study/[deckId]/     # Study session
│   └── api/study/respond/      # API route for saving study responses
├── src/
│   ├── actions/                # Next.js Server Actions (deck, card, study)
│   ├── components/             # React components
│   │   ├── common/             # Header, Sidebar, Modal, Toast, ErrorBoundary
│   │   ├── dashboard/          # DeckCard, DeckList, CreateDeckModal
│   │   ├── deck/               # CardItem, CardList, Create/EditCardModal
│   │   └── study/              # FlashCard, StudyControls, StudyProgress, CompletionCelebration
│   ├── lib/                    # Utilities (auth, sm2 algorithm, toast, validators)
│   ├── styles/                 # Global CSS
│   └── types/                  # TypeScript types (database, api)
├── supabase/migrations/        # SQL migration files
├── tests/                      # Unit tests (SM-2 algorithm)
└── .github/workflows/          # CI/CD pipelines
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone & install

```bash
git clone https://github.com/hungls-2814/flashcard.git
cd flashcard
npm install
```

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run database migrations

In your Supabase project SQL editor, run the files in order:

```
supabase/migrations/001_init_auth_profiles.sql
supabase/migrations/002_init_decks_cards.sql
supabase/migrations/003_init_card_progress.sql
```

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run type-check   # TypeScript type check
```

---

## SM-2 Algorithm

Cards are scheduled using the [SM-2 spaced repetition algorithm](https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method).

**Quality ratings:**

| Key | Rating | Meaning |
|-----|--------|---------|
| `1` | Again (0) | Completely forgot |
| `2` | Hard (1) | Serious difficulty |
| `4` | Good (4) | Recalled with effort |
| `5` | Easy (5) | Perfect recall |

Cards with quality < 3 are reset; cards with quality ≥ 3 have their interval extended based on the ease factor.

---

## Docker (Local Development)

```bash
# Copy environment template
cp .env.local.example .env.local

# Start PostgreSQL + Next.js
docker-compose -f docker-compose.template.yml up -d
```

---

## CI/CD

Three GitHub Actions workflows are included:

| Workflow | Trigger | Action |
|----------|---------|--------|
| `test-and-lint.yml` | Push / PR to `main`, `develop` | Run tests + lint |
| `deploy-vercel.yml` | Push to `main` | Deploy to Vercel production |
| `preview-deploy.yml` | Pull request | Deploy Vercel preview |

**Required GitHub Secrets:**

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Database Schema

```
profiles        — User profiles (1:1 with auth.users)
decks           — Flashcard decks (user_id, title, description, color_code)
cards           — Cards within decks (front, back, deck_id)
card_progress   — SM-2 progress per user per card (ease_factor, interval_days, next_review_date)
```

All tables have Row Level Security (RLS) enabled — users can only access their own data.

---

## License

MIT
