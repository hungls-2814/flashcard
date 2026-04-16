# Implementation Plan: Flashcard Mastery - Spaced Repetition System

**Branch**: `001-flashcard-sm2` | **Date**: 2026-04-16 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-flashcard-sm2/spec.md`

---

## Summary

Flashcard Mastery is a web-based spaced repetition learning system built on Next.js, TypeScript, and Supabase. The core value is implementing the SuperMemo-2 (SM-2) algorithm to optimize card review scheduling. Users create decks, add cards with Markdown content, and study with smooth animations and real-time interval calculations. All data is protected by Row Level Security (RLS); SM-2 computations run on Edge Runtime for low latency. The MVP prioritizes the study session experience (card flip animations, quality feedback, confetti celebration) and foundational CRUD operations for deck/card management.

---

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled)  
**Primary Dependencies**: Next.js 14+ (App Router), Supabase (@supabase/ssr), Framer Motion (animations), Zod (validation), react-dom (Markdown rendering - MDXRemote or simple markdown-to-html)  
**Storage**: PostgreSQL via Supabase (5 tables with RLS)  
**Testing**: Jest, React Testing Library (contract & integration tests)  
**Target Platform**: Web browsers (mobile-first); Vercel or Cloudflare Workers deployment  
**Project Type**: Full-stack web application (Next.js frontend + Supabase backend)  
**Performance Goals**: 
  - Dashboard load: < 500ms (5 decks max rendered)
  - Card flip animation: < 300ms, 60 fps (Framer Motion)
  - SM-2 calculation on Edge: < 100ms response time
  - Study session interaction: < 200ms from click to next card display
  
**Constraints**:
  - Edge Runtime: No Node.js APIs; Web APIs only (crypto.subtle, fetch, etc.)
  - RLS: 100% enforcement; no bypass for data access
  - Input validation: Zod schemas for all user inputs before DB operations
  - Mobile-first: All UI initially designed for 375px viewport, then scaled up
  
**Scale/Scope**: MVP for 1 user; decks < 500 cards; 10+ concurrent study sessions expected in production

---

## Constitution Check

**GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.**

| Principle | Status | Justification |
|-----------|--------|---------------|
| I. Tech Stack & Architecture | ✅ PASS | Next.js (App Router), TypeScript strict, Supabase, Tailwind → all mandated in constitution |
| II. Code Quality & TypeScript | ✅ PASS | Strict mode enabled; all types in `@/types`; clean English naming throughout |
| III. Supabase & Database | ✅ PASS | All 5 tables have RLS policies; Database type from Supabase SDK; @supabase/ssr for clients |
| IV. Edge Runtime | ✅ PASS | SM-2 calculation endpoint uses `export const runtime = 'edge'`; no Node.js APIs |
| V. UI/UX & Styling | ✅ PASS | Tailwind only (no inline); Framer Motion for flip/animations; mobile-first workflow |
| VI. Error Handling | ✅ PASS | try/catch on all database operations; Zod validation before processing; descriptive errors |
| **Gate Result** | ✅ PASS | All principles aligned; no violations or exceptions needed |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-flashcard-sm2/
├── plan.md                      # This file
├── spec.md                       # Feature specification
├── research.md                   # Phase 0: Technical research (generated below)
├── data-model.md                 # Phase 1: Database schema & entity design
├── contracts/                    # Phase 1: API contracts
│   ├── study-session.md          # POST /api/study/respond
│   ├── card-crud.md              # POST/PUT/DELETE /api/cards
│   └── deck-crud.md              # POST/PUT/DELETE /api/decks
├── quickstart.md                 # Phase 1: Developer onboarding & setup guide
└── checklists/
    └── requirements.md           # Quality validation
```

### Source Code (repository root)

```text
# Next.js App Router structure
src/
├── app/
│   ├── layout.tsx                # Root layout with auth check
│   ├── page.tsx                  # Landing page (public)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (protected)/
│   │   ├── dashboard/page.tsx
│   │   ├── deck/[deckId]/
│   │   │   └── page.tsx          # Deck view (card management)
│   │   └── study/[deckId]/
│   │       └── page.tsx          # Study session page
│   ├── api/
│   │   ├── auth/
│   │   │   └── callback/route.ts
│   │   ├── decks/
│   │   │   ├── route.ts          # POST /api/decks, GET all
│   │   │   └── [deckId]/route.ts # GET/PUT/DELETE single deck
│   │   ├── cards/
│   │   │   ├── route.ts          # POST /api/cards, GET all
│   │   │   └── [cardId]/route.ts # GET/PUT/DELETE single card
│   │   └── study/
│   │       └── respond/route.ts  # POST /api/study/respond (SM-2 calc)
│   └── middleware.ts             # Session validation & redirects
│
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── dashboard/
│   │   ├── DeckList.tsx
│   │   ├── DeckCard.tsx          # Single deck preview
│   │   └── CreateDeckModal.tsx
│   ├── deck/
│   │   ├── CardList.tsx
│   │   ├── CardItem.tsx
│   │   ├── CreateCardModal.tsx
│   │   └── EditCardModal.tsx
│   └── study/
│       ├── FlashCard.tsx         # Card with flip animation (Framer Motion)
│       ├── StudyControls.tsx     # Again/Hard/Good/Easy buttons
│       ├── StudyProgress.tsx
│       └── CompletionCelebration.tsx # Confetti animation
│
├── lib/
│   ├── sm2.ts                    # SM-2 algorithm logic
│   ├── supabase/
│   │   ├── client.ts             # Supabase client (@supabase/ssr)
│   │   └── server.ts             # Server-side Supabase
│   ├── auth.ts                   # Auth utilities
│   └── validators/
│       ├── decks.schema.ts       # Zod schemas for deck validation
│       └── cards.schema.ts       # Zod schemas for card validation
│
├── types/
│   └── database.ts               # Supabase-generated types + custom interfaces
│
├── actions/                      # Next.js Server Actions
│   ├── deck.actions.ts           # Create/update/delete deck actions
│   ├── card.actions.ts           # Create/update/delete card actions
│   └── study.actions.ts          # Study session response handler
│
└── styles/
    └── globals.css               # Tailwind base + custom utilities

tests/
├── unit/
│   ├── sm2.test.ts
│   ├── validators.test.ts
│   └── auth.test.ts
├── integration/
│   ├── deck.routes.test.ts
│   ├── card.routes.test.ts
│   └── study.routes.test.ts
└── contract/
    └── study-session.contract.ts

.env.local                         # Supabase credentials
middleware.ts                      # Root middleware for auth
tsconfig.json                      # TypeScript strict mode enabled
tailwind.config.ts                 # Tailwind CSS config
next.config.js                     # Next.js config
```

**Structure Decision**: Single Next.js monolithic app with clear separation of concerns (app routes, components, lib utilities, server actions). This is appropriate for MVP scope. Auth routes use Supabase OAuth/email. Protected routes (dashboard, deck, study) verify session in middleware. API routes handle CRUD; Edge Runtime handler for SM-2 calculations.

---

## Complexity Tracking

**No Constitution violations identified.** All aspects align with core principles. No simplification alternatives needed.

---

## Phase 0: Research & Technical Clarification

### Deliverable: `research.md`

**Purpose**: Resolve technical unknowns and document best practices decisions.

**Research Topics**:
1. Supabase @supabase/ssr client initialization for Next.js App Router
   - Decision: Use `createBrowserClient()` in Client Components, `createServerClient()` in Server Components, `createRouteHandlerClient()` in Route Handlers
   - Rationale: Ensures correct context isolation and function availability across runtime boundaries
   - Source: Supabase Next.js official guide

2. SM-2 Algorithm reference implementation validation
   - Decision: Confirm formula precision (ease_factor precision to 1 decimal for database storage)
   - Rationale: Prevents floating-point precision errors in calculations
   - Source: SuperMemo-2 white paper + common implementations (Anki, RemNote)

3. RLS policy strategy for multi-table operations
   - Decision: User owns data; all tables use `user_id = auth.uid()` + foreign key cascades
   - Rationale: Simplest enforcement; prevents accidental cross-user data access
   - Source: Supabase security best practices

4. Framer Motion flipcard implementation
   - Decision: Use `AnimatePresence` + `motion.div` with `rotateY` for 3D flip effect
   - Rationale: Native 3D transforms provide smooth 60 fps animation on mobile
   - Source: Framer Motion docs + React animation patterns

5. Edge Runtime compatibility for SM-2 calculations
   - Decision: Use Web Crypto API (`crypto.subtle`) for any hash operations; avoid Node.js `crypto` module
   - Rationale: Cloudflare Workers and Vercel Edge Functions support Web Crypto; Node.js APIs are unavailable
   - Source: Edge Runtime documentation (Cloudflare, Vercel)

6. Markdown rendering solution
   - Decision: Use `react-markdown` with `remark` + `rehype` plugins for security and flexibility
   - Rationale: Safe HTML sanitization; supports Markdown tables, code, links; lightweight
   - Source: Next.js community recommendations; OWASP sanitization practices

7. Confetti animation library
   - Decision: Use `canvas-confetti` library (lightweight, no dependencies)
   - Rationale: Performant canvas-based animation; works offline; small bundle impact
   - Source: npm ecosystem; GitHub stars/adoption

### Research Output

```markdown
# research.md (Full content created below)
```

---

## Phase 1: Design & API Contracts

### 1a. Deliverable: `data-model.md`

**Purpose**: Document database entities, relationships, validation rules, state transitions.

**Entities**:

#### Profile (Identity)
- Maps to Supabase `auth.users` table (email-based authentication)
- Stores user metadata (full_name, timezone if needed later)
- 1:N relationship with Decks, Cards (user owns many decks and cards)
- Validation: email must be unique; full_name optional

#### Deck (Container)
- Belongs to one Profile (user_id)
- 1:N relationship with Cards
- Fields: title (text, required, < 200 chars), description (optional text, < 1000 chars), color_code (hex, optional, defaults to `#3b82f6`)
- Created_at, updated_at for auditing
- Validation: title non-empty; color_code must match hex pattern

#### Card (Learning Unit)
- Belongs to one Deck (deck_id) and one Profile (user_id, denormalized for RLS)
- Front content (Markdown text, required, < 5000 chars)
- Back content (Markdown text, required, < 5000 chars)
- 1:1 relationship with CardProgress (unique card_id)
- Created_at, updated_at for history
- Validation: front and back non-empty

#### CardProgress (SM-2 State)
- Unique on card_id (one progress record per card)
- Stores SM-2 variables: ease_factor (float, default 2.5), interval (int, default 0), repetitions (int, default 0)
- next_review (timestamp, initially today)
- last_reviewed (timestamp, nullable, set after first review)
- last_quality (int 0-5, nullable, stores previous feedback)
- Validation: ease_factor >= 1.3; interval >= 0; repetitions >= 0

#### StudySession (Transient Context)
- Not persisted in database; constructed at study session start
- Aggregates: cards due today for a deck, tracks user feedback within session
- Used for session state immediatey after response; then updates CardProgress

### State Transitions

**Card Lifecycle**:
```
New Card
  ├─ Initial State: interval=0, repetitions=0, next_review=today, ease_factor=2.5
  ├─ User marks as Good/Easy
  │  └─ CardProgress updated; interval calculated; next_review set to future date
  └─ User marks as Again
     └─ Reset to interval=1, repetitions=0; next_review=tomorrow
```

### Data Model Output

```markdown
# data-model.md (Full design document)
```

### 1b. Deliverable: `contracts/`

**Purpose**: Define API contract specifications for client-backend communication.

**Contract 1: Study Session Response** (`contracts/study-session.md`)
```
Endpoint: POST /api/study/respond
Runtime: Edge
Input: { card_id: string, quality: 0|1|2|4|5, timestamp: ISO8601 }
Output: { 
  updated_progress: CardProgress,
  next_card: Card | null,
  session_complete: boolean,
  stats: { reviewed: number, remaining: number }
}
Error Codes: 400 (invalid quality), 401 (unauthorized), 403 (RLS denied), 500 (SM-2 calc error)
```

**Contract 2: Card CRUD** (`contracts/card-crud.md`)
```
POST /api/cards: Create card in deck
GET /api/cards?deckId=X: Fetch all cards in deck
PUT /api/cards/[cardId]: Update front/back
DELETE /api/cards/[cardId]: Delete and cascade to card_progress
```

**Contract 3: Deck CRUD** (`contracts/deck-crud.md`)
```
POST /api/decks: Create new deck
GET /api/decks: Fetch all user's decks
PUT /api/decks/[deckId]: Update title/description/color
DELETE /api/decks/[deckId]: Delete deck and cascade delete all cards/progress
```

### 1c. Deliverable: `quickstart.md`

**Purpose**: Developer onboarding guide; how to set up, run, and test locally.

**Content Outline**:
1. Prerequisites (Node.js 18+, npm/yarn, Supabase account)
2. Clone & install dependencies
3. Environment setup (.env.local from Supabase project)
4. Database initialization (migrations)
5. Start dev server (`npm run dev`)
6. First test: login → create deck → add card → study
7. Running tests (`npm run test`)
8. Deployment checklist (Edge Runtime config, RLS verification)

---

## Phase 2: Refinement & Agent Context

### 2a. Re-evaluate Constitution Check

Post-design review: All 6 principles remain in compliance. RLS policies are defined; Edge Runtime handlers confirmed; Tailwind styling planned; TypeScript strict mode enabled in tsconfig; Zod schemas prepared.

### 2b. Agent Context Update

Update `.specify/agent.md` (Copilot context) with:
- Next.js 14 App Router patterns
- Supabase @supabase/ssr usage examples
- Framer Motion flipcard patterns
- SM-2 algorithm pseudocode
- Edge Runtime restrictions

---

## Phase 3: Implementation Phases (Detailed)

### Phase 3.1: Foundation & Setup (Blockers: None)

**Goal**: Project structure, dependencies, basic Next.js config ready.

**Tasks**:
- [ ] T001 Initialize Next.js 14 project with `create-next-app@latest` (App Router, TypeScript, Tailwind)
- [ ] T002 Install dependencies: `@supabase/ssr`, `framer-motion`, `zod`, `react-markdown`, `canvas-confetti`, `jest`, `@testing-library/react`
- [ ] T003 [P] Create directory structure: `/components`, `/lib`, `/types`, `/actions`, `/styles`, `/tests`
- [ ] T004 [P] Configure `tsconfig.json` with `strict: true`
- [ ] T005 [P] Configure `tailwind.config.ts` with custom spacing/colors
- [ ] T006 Setup `.env.local` with Supabase credentials (URL, Anon Key, Service Key)
- [ ] T007 Create root `app/layout.tsx` with Tailwind provider
- [ ] T008 Verify build succeeds: `npm run build`

**Deliverable**: Buildable Next.js 14 project with all dev dependencies, TypeScript strict mode enabled.

---

### Phase 3.2: Database Schema & Authentication (Blockers: Foundation complete)

**Goal**: Supabase tables, RLS policies, and auth integration.

**Tasks**:
- [ ] T009 Create Supabase project or connect to existing
- [ ] T010 Write migration: `001_init_auth_profiles.sql` (auth.users integration, profiles table + RLS)
- [ ] T011 Write migration: `002_init_decks_cards.sql` (decks, cards tables + RLS)
- [ ] T012 Write migration: `003_init_card_progress.sql` (card_progress table + RLS + unique constraint on card_id)
- [ ] T013 [P] Create RLS policies for profiles table (SELECT/UPDATE own profile)
- [ ] T014 [P] Create RLS policies for decks table (all ops on user's decks)
- [ ] T015 [P] Create RLS policies for cards table (all ops on user's cards)
- [ ] T016 [P] Create RLS policies for card_progress table (all ops on user's progress)
- [ ] T017 Test RLS: Verify unauthorized user cannot read other user's data
- [ ] T018 Generate Supabase types: `npx supabase gen types postgresql > src/types/database.ts`
- [ ] T019 Create `/src/lib/supabase/client.ts` with `createBrowserClient()`
- [ ] T020 Create `/src/lib/supabase/server.ts` with `createServerClient()` for Server Components
- [ ] T021 [P] Setup Supabase OAuth (if needed) or email/password auth
- [ ] T022 Create auth routes: `/app/(auth)/login/page.tsx` and `/app/(auth)/signup/page.tsx`
- [ ] T023 Implement login form with email/password; calls Supabase `signInWithPassword()`
- [ ] T024 Implement signup form with email/password; calls Supabase `signUp()`

**Deliverable**: 4 tables with RLS, Supabase SDK integration, login/signup working.

---

### Phase 3.3: Core Utilities & Validation (Blockers: Database complete)

**Goal**: SM-2 algorithm, Zod validators, auth helpers.

**Tasks**:
- [ ] T025 Create `/src/lib/sm2.ts` with full SM-2 calculation logic (4 response paths)
- [ ] T026 [Unit Test] Write tests for SM-2: verify quality 0, 2, 4, 5 produce correct state
- [ ] T027 Create `/src/lib/validators/decks.schema.ts` with Zod deck validators (title, description, color_code)
- [ ] T028 Create `/src/lib/validators/cards.schema.ts` with Zod card validators (front, back, markdown)
- [ ] T029 [P] Create `/src/lib/auth.ts` with session check utilities
- [ ] T030 [P] Create `/src/lib/auth.ts` with user/profile retrieval functions
- [ ] T031 Create `/src/middleware.ts` to enforce auth on protected routes
- [ ] T032 [Integration Test] Test middleware: verify `/dashboard` redirects unauthenticated users to `/login`

**Deliverable**: SM-2 logic validated, Zod schemas ready, auth middleware working, all utilities tested.

---

### Phase 3.4: Deck & Card Management UI (Blockers: Core utilities complete, P2)

**Goal**: Dashboard, deck view, card CRUD forms.

**Tasks**:
- [ ] T033 Create `/src/app/(protected)/dashboard/page.tsx` with deck list layout
- [ ] T034 Create `/src/components/dashboard/DeckList.tsx` - renders array of DeckCard components
- [ ] T035 Create `/src/components/dashboard/DeckCard.tsx` - single deck preview with stats and action buttons
- [ ] T036 [P] Create `/src/components/dashboard/CreateDeckModal.tsx` - form for new deck (title, description, color picker)
- [ ] T037 Create `/src/app/(protected)/deck/[deckId]/page.tsx` - deck detail with card list
- [ ] T038 Create `/src/components/deck/CardList.tsx` - renders array of CardItem components
- [ ] T039 Create `/src/components/deck/CardItem.tsx` - single card with edit/delete buttons
- [ ] T040 [P] Create `/src/components/deck/CreateCardModal.tsx` - form for new card (front/back markdown, preview)
- [ ] T041 [P] Create `/src/components/deck/EditCardModal.tsx` - form for editing card
- [ ] T042 Create `/src/actions/deck.actions.ts` - Server Actions for create/update/delete deck
- [ ] T043 Create `/src/actions/card.actions.ts` - Server Actions for create/update/delete card
- [ ] T044 [P] Create `/src/components/common/Header.tsx` and `/src/components/common/Sidebar.tsx` for navigation
- [ ] T045 [Integration Test] Test deck creation flow: form → validation → database insert
- [ ] T046 [Integration Test] Test card CRUD: create → edit → delete, verify persistence

**Deliverable**: Dashboard fully functional, deck and card management working end-to-end.

---

### Phase 3.5: Study Session & Animations (Blockers: Dashboard complete, P1 Core)

**Goal**: Study page, flashcard flip animation, SM-2 integration, confetti celebration.

**Tasks**:
- [ ] T047 Create `/src/app/(protected)/study/[deckId]/page.tsx` - study session layout
- [ ] T048 Create `/src/components/study/FlashCard.tsx` with Framer Motion flip animation
  - Default state: front visible
  - On click: rotate 180° to show back
  - On quality selection: fade out current card, fade in next
- [ ] T049 [P] Implement 3D flip animation in FlashCard: `rotateY` transform, `duration=0.3s`
- [ ] T050 Create `/src/components/study/StudyControls.tsx` - 4 buttons (Again/Hard/Good/Easy)
- [ ] T051 Create `/src/components/study/StudyProgress.tsx` - display "{X}/{Y} cards reviewed today"
- [ ] T052 Create `/src/components/study/CompletionCelebration.tsx` - confetti animation using canvas-confetti
- [ ] T053 Create `/src/api/study/respond/route.ts` (Edge Runtime) - handles POST with card_id, quality
  - Validates input with Zod
  - Calls SM-2 calculation
  - Updates card_progress in database
  - Returns updated progress + next card
- [ ] T054 Create `/src/actions/study.actions.ts` - Client-side study session logic (state management)
- [ ] T055 [P] Implement session state: track cards due today, current card index, responses
- [ ] T056 Fetch due cards at session start; filter by `next_review <= today`
- [ ] T057 On quality button click: call Edge endpoint → update local state → advance to next card
- [ ] T058 On final card completion: trigger confetti, show stats (cards reviewed, new easiest/hardest cards), show "Complete" CTA with "Return to Dashboard" button
- [ ] T059 [Unit Test] Test FlashCard animation: verify card rotates and renders both sides
- [ ] T060 [Integration Test] Test complete study flow: load session → flip card → click Good → next card appears → finish session → confetti plays
- [ ] T061 [Contract Test] Verify `/api/study/respond` returns correct SM-2 state and next card

**Deliverable**: Full study session working end-to-end with animations and SM-2 calculations.

---

### Phase 3.6: Error Handling, Validation & Polish (Blockers: Study session complete)

**Goal**: Comprehensive error handling, input validation, edge cases, accessibility.

**Tasks**:
- [ ] T062 [P] Add try/catch blocks to all database operations
- [ ] T063 [P] Add try/catch blocks to all Server Actions
- [ ] T064 [P] Add error boundaries to React components
- [ ] T065 Create toast notification component for errors/success messages
- [ ] T066 Verify Zod validation on all forms (deck creation, card creation, quality feedback)
- [ ] T067 Test edge cases: empty deck (show CTA to add first card), no due cards (show "All caught up!" message)
- [ ] T068 [P] Add accessibility: keyboard navigation (arrow keys, enter), ARIA labels on buttons
- [ ] T069 [P] Test mobile responsiveness on 375px, 768px, 1024px viewports
- [ ] T070 [P] Verify Tailwind mobile-first classes applied (sm:, md:, lg:)
- [ ] T071 Add loading spinners during async operations (fetching current deck, processing quality response)
- [ ] T072 Add confirmation modals for destructive actions (delete deck, delete card)
- [ ] T073 Test RLS enforcement: attempt to access other user's deck via URL → verify 403 Forbidden

**Deliverable**: Robust error handling, full validation, accessible UI, mobile-responsive design.

---

### Phase 3.7: Testing & Optimization (Blockers: Polish complete)

**Goal**: Test coverage, performance optimization, deployment readiness.

**Tasks**:
- [ ] T074 [P] Write unit tests for SM-2 algorithm (all 4 quality response paths)
- [ ] T075 [P] Write unit tests for Zod validators (valid/invalid inputs)
- [ ] T076 [P] Write unit tests for auth utilities (session validation, user retrieval)
- [ ] T077 Write integration tests for deck CRUD API
- [ ] T078 Write integration tests for card CRUD API
- [ ] T079 Write integration tests for study session (response → SM-2 calc → card_progress update)
- [ ] T080 Write contract tests for `/api/study/respond` (input schema, output schema, error cases)
- [ ] T081 Run tests locally: `npm run test` → verify all tests pass
- [ ] T082 Setup GitHub Actions CI/CD (lint, test, build on push to `001-flashcard-sm2` branch)
- [ ] T083 [P] Verify Edge Runtime compatibility: test `/api/study/respond` locally with `wrangler`
- [ ] T084 [P] Performance audit: measure dashboard load time, card flip fps, response latency
- [ ] T085 [P] Bundle size audit: verify no unnecessary dependencies; optimize imports
- [ ] T086 [P] Lighthouse audit: check accessibility (>90), best practices (>90), SEO (>90)

**Deliverable**: >80% test coverage, all tests passing, Edge Runtime validated, performance benchmarks recorded.

---

### Phase 3.8: Deployment & Launch (Blockers: Testing complete)

**Goal**: Deploy to Vercel/Cloudflare, verify RLS in production, monitor.

**Tasks**:
- [ ] T087 Create Vercel project and connect GitHub repository
- [ ] T088 [P] Configure environment variables in Vercel: Supabase URL, Anon Key, Service Key (backend only)
- [ ] T089 [P] Verify Edge Runtime handler is configured: `export const runtime = 'edge'` in `/api/study/respond/route.ts`
- [ ] T090 Deploy to Vercel staging environment
- [ ] T091 [P] Test auth flow in staging: signup, login, logout
- [ ] T092 [P] Test deck/card operations in staging
- [ ] T093 [P] Test study session in staging: verify SM-2 calculations work on live Edge endpoint
- [ ] T094 [P] Verify RLS policies in production Supabase: attempt cross-user data access → confirm 403
- [ ] T095 Run final Lighthouse audit in production
- [ ] T096 Deploy to production (Vercel main branch)
- [ ] T097 Setup monitoring: error tracking (Sentry), performance monitoring (Vercel Analytics)
- [ ] T098 Create runbook: how to revert deployment, how to scale, on-call procedures

**Deliverable**: Production live at https://flashcard-mastery.vercel.app, all systems monitored, team trained on runbooks.

---

## Implementation Phases Summary

| Phase | Name | Status | Duration (est.) | Blockers |
|-------|------|--------|-----------------|----------|
| 1 | Foundation & Setup | Ready | 1-2 days | None |
| 2 | Database & Auth | Ready | 2-3 days | Phase 1 complete |
| 3 | Core Utilities | Ready | 1-2 days | Phase 2 complete |
| 4 | Dashboard & Management | Ready | 3-4 days | Phase 3 complete |
| 5 | Study Session & Animations | Ready | 4-5 days | Phase 4 complete |
| 6 | Error Handling & Polish | Ready | 2-3 days | Phase 5 complete |
| 7 | Testing & Optimization | Ready | 3-4 days | Phase 6 complete |
| 8 | Deployment & Launch | Ready | 1-2 days | Phase 7 complete |
| **Total** | **MVP Complete** | **On Track** | **17-25 days** | **None** |

---

## Dependency Graph

```
Phase 1 (Foundation)
    ↓
Phase 2 (Database & Auth)
    ↓
Phase 3 (Core Utilities)
    ↓
Phase 4 (Dashboard & Management) ← Parallel with Phase 5
Phase 5 (Study Session)             ← Parallel with Phase 4
    ↓
Phase 6 (Polish)
    ↓
Phase 7 (Testing)
    ↓
Phase 8 (Deployment)
```

**Parallel Opportunities**:
- Phase 4 (Dashboard) and Phase 5 (Study Session) can run in parallel after Phase 3 (Core Utilities) completes
- Within Phase 4: DeckCard, CardList, and modals can be developed in parallel (different components)
- Within Phase 5: FlashCard animation and StudyControls can be developed in parallel
- Testing (Phase 7): Unit, integration, and contract tests can run in parallel

---

## Quality Gates

### Pre-Phase 2 Gate
- [ ] Next.js build succeeds with no warnings
- [ ] TypeScript strict mode enabled and no errors
- [ ] All dependencies installed and compatible

### Pre-Phase 3 Gate
- [ ] All 4 tables created with RLS policies
- [ ] Auth flow (signup/login) tested end-to-end
- [ ] Supabase types generated from schema

### Pre-Phase 4 Gate
- [ ] SM-2 algorithm tests passing (all 4 quality paths)
- [ ] Zod validators passing (valid/invalid inputs)
- [ ] Auth utilities validated with middleware tests

### Pre-Phase 5 Gate
- [ ] Dashboard renders all decks correctly
- [ ] Deck and card CRUD operations fully functional
- [ ] All forms validate with Zod

### Pre-Phase 6 Gate
- [ ] Study session loads due cards
- [ ] FlashCard animation smooth 60 fps
- [ ] SM-2 calculation endpoint responds < 100ms
- [ ] Confetti triggers on session completion

### Pre-Phase 7 Gate
- [ ] Error boundaries catch and display errors
- [ ] RLS verified for cross-user data access
- [ ] Mobile viewport (375px) fully responsive

### Pre-Phase 8 Gate
- [ ] >80% test coverage; all tests passing
- [ ] Edge Runtime validated locally
- [ ] Lighthouse audit >90 on accessibility, best practices

### Launch Gate
- [ ] Production RLS policies verified
- [ ] Error tracking (Sentry) operational
- [ ] Performance monitoring active
- [ ] Team trained on runbooks

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Supabase RLS policy misconfiguration | High | Test policies early (Phase 2); write RLS tests before Phase 4 starts |
| SM-2 calculation precision errors | High | Unit test all 4 quality response paths; compare against Anki/RemNote reference |
| FlashCard animation 60 fps regression on mobile | Medium | Profile animation performance early; test on actual mobile device (iPhone SE) |
| Edge Runtime timeout on SM-2 calculation | Medium | Keep SM-2 logic simple and fast; benchmark with 100+ concurrent users in Phase 7 |
| Cross-browser compatibility | Low | Test on Chrome, Firefox, Safari; use Tailwind's browser compatibility tables |

---

## Success Metrics (Post-Launch)

- ✅ Dashboard loads < 500ms for 5 decks
- ✅ Study session responds < 200ms to quality feedback
- ✅ Card flip animation remains 60 fps on mobile (iPhone SE or equivalent)
- ✅ 100% of unauthorized access attempts blocked by RLS (security audit required)
- ✅ 0 production errors from SM-2 calculations (monitoring alert if > 0.01% failure rate)
- ✅ Mobile users (>60% of target audience) report smooth experience
- ✅ New users can create deck and study first card in < 2 minutes (user testing metric)

---

**Version**: 1.0.0 | **Created**: 2026-04-16 | **Next Action**: Phase 0 Research (document decisions) → Phase 1 Implementation (setup)
