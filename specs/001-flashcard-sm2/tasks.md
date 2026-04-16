---
description: "Task list for Flashcard Mastery - Spaced Repetition System implementation"
---

# Tasks: Flashcard Mastery - Spaced Repetition System

**Input**: Design documents from `/specs/001-flashcard-sm2/`  
**Prerequisites**: plan.md (✅ ready), spec.md (✅ ready), data-model.md (✅ ready), research.md (✅ ready), contracts/ (✅ ready)

**Tests**: Optional - not explicitly requested in feature spec. Can add unit/integration tests throughout phases if TDD approach desired.

**Organization**: Tasks grouped by phase and user story priority to enable independent implementation and testing of each story.

---

## Format: `- [ ] [ID] [P?] [Story] Description`

- **Checkbox**: Always start with `- [ ]` (markdown checkbox)
- **[ID]**: Task ID (T001, T002, etc.) in execution order
- **[P]**: Include ONLY if parallelizable (different files, no blocking dependencies)
- **[Story]**: User story label (US1, US2, US3, US4) for user story phase tasks; omit for setup/foundational/polish
- **Description**: Clear action with exact file path
- **Execution Order**: Sequential IDs represent recommended order (Phase 1 then Phase 2, etc.)

---

## Phase 1: Foundation & Setup (1-2 days)

**Purpose**: Project initialization, dependencies, and basic structure  
**Deliverable**: Buildable Next.js 14 app with TypeScript strict mode, Tailwind, Supabase SDK

**⚠️ CRITICAL**: Setup phase MUST complete before any Feature work (Phases 2+)

- [x] T001 Initialize Next.js 14 project with `create-next-app@latest --typescript --tailwind --app` and verify build
- [x] T002 [P] Install core dependencies: `@supabase/ssr`, `framer-motion`, `zod`, `react-markdown`, `canvas-confetti`, `jest`, `@testing-library/react`
- [x] T003 [P] Create directory structure: `src/components/`, `src/lib/`, `src/types/`, `src/actions/`, `src/styles/`, `tests/`
- [x] T004 [P] Configure `tsconfig.json` with `"strict": true` and `"exactOptionalPropertyTypes": true`
- [x] T005 [P] Configure `tailwind.config.ts` with custom spacing, colors, and animation settings
- [x] T006 Create `.env.local` template file with placeholders: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [x] T007 Create root `app/layout.tsx` with Tailwind provider, metadata, and basic structure
- [x] T008 Verify production build succeeds: `npm run build` (no errors, warnings logged)

**Checkpoint**: All 8 foundation tasks complete. Project structure ready for Phase 2.

---

## Phase 2: Database Schema & Authentication (2-3 days)

**Purpose**: Supabase setup, database tables, RLS policies, auth integration  
**Deliverable**: Secure database with all 4 tables, RLS enabled, signup/login working  
**Blockers**: Phase 1 complete

- [x] T009 Create Supabase project (or use existing) and get credentials (URL, Anon Key, Service Key)
- [x] T010 Write SQL migration: `001_init_auth_profiles.sql` (profiles table + RLS for SELECT/UPDATE own profile)
- [x] T011 Write SQL migration: `002_init_decks_cards.sql` (decks, cards tables + indexes + RLS)
- [x] T012 Write SQL migration: `003_init_card_progress.sql` (card_progress table + unique card_id + RLS + index on next_review)
- [x] T013 [P] Create RLS policy for profiles: `user_id = auth.uid()` for all operations
- [x] T014 [P] Create RLS policies for decks: `user_id = auth.uid()` for SELECT/INSERT/UPDATE/DELETE
- [x] T015 [P] Create RLS policies for cards: `user_id = auth.uid()` for all operations
- [x] T016 [P] Create RLS policies for card_progress: `user_id = auth.uid()` for all operations
- [x] T017 Test RLS enforcement: Create test users, attempt cross-user queries, verify 403 errors
- [x] T018 Generate Supabase types: `supabase gen types postgresql > src/types/database.ts`
- [x] T019 Create `/src/lib/supabase/client.ts` with `createBrowserClient()` from `@supabase/ssr`
- [x] T020 Create `/src/lib/supabase/server.ts` with `createServerClient()` for Server Components
- [x] T021 [P] Create `/app/(auth)/login/page.tsx` with login form (email/password)
- [x] T022 [P] Create `/app/(auth)/signup/page.tsx` with signup form (email/password confirmation)
- [x] T023 Implement login form component: call `supabase.auth.signInWithPassword()`
- [x] T024 Implement signup form component: call `supabase.auth.signUp()` + email confirmation logic

**Checkpoint**: All 16 database & auth tasks complete. RLS enforced, auth flow working.

---

## Phase 3: Core Utilities & Validation (1-2 days)

**Purpose**: SM-2 algorithm, Zod validators, auth middleware  
**Deliverable**: Reusable business logic layer, all inputs validated  
**Blockers**: Phase 2 complete

- [x] T025 Create `/src/lib/sm2.ts` with full SM-2 algorithm implementation
  - Q0-1: Reset to interval=1, repetitions=0, EF↓0.2
  - Q2: Slight increase interval×1.2, EF↓0.14
  - Q4: Standard interval (1 if rep=0, 3 if rep=1, else interval×EF)
  - Q5: Strong interval (1 if rep=0, 3 if rep=1, else interval×EF×1.3), EF↑0.1
- [x] T026 Write unit tests for SM-2: test all 4 quality paths, verify output correctness against Anki reference
- [x] T027 Create `/src/lib/validators/decks.schema.ts` with Zod schema: title (1-200), description (0-1000), color_code (hex)
- [x] T028 Create `/src/lib/validators/cards.schema.ts` with Zod schema: front (1-5000), back (1-5000), Markdown validation
- [x] T029 [P] Create `/src/lib/auth.ts` with `getCurrentUser()` and `getUserSession()` utilities
- [x] T030 [P] Create auth error handling utilities: `handleAuthError()` with descriptive messages
- [x] T031 Create `/src/middleware.ts` to validate Supabase session on protected routes `/dashboard`, `/deck/*`, `/study/*`
- [x] T032 [Integration Test] Verify middleware redirects unauthenticated users to `/login`

**Checkpoint**: All 8 utility tasks complete. SM-2 algorithm tested, all validators ready.

---

## Phase 4: Dashboard & Deck Management (3-4 days)

**Purpose**: Core CRUD UI for decks and cards (P2 User Story)  
**Deliverable**: Full deck/card management, ready for study session integration  
**Blockers**: Phase 3 complete  
**User Story**: US2 - Deck & Card Management (P2)

- [ ] T033 Create `/src/app/(protected)/layout.tsx` with protected route wrapper and auth check
- [ ] T034 Create `/src/app/(protected)/dashboard/page.tsx` with deck list layout and empty state
- [ ] T035 Create `/src/components/dashboard/DeckList.tsx` component: render array of DeckCard components with stats
- [ ] T036 Create `/src/components/dashboard/DeckCard.tsx` component:
  - Display deck title, description, color_code (as background)
  - Show stats: "X due today", "Y new"
  - Buttons: "Study", "Manage", delete icon
- [ ] T037 [P] Create `/src/components/dashboard/CreateDeckModal.tsx`:
  - Form: title input, description textarea, color picker
  - Submit: call Server Action to create deck
  - Validation: Zod schema validation on client + server
- [ ] T038 Create `/src/app/(protected)/deck/[deckId]/page.tsx` with deck detail page and card list
- [ ] T039 Create `/src/components/deck/CardList.tsx` component: render array of CardItem components
- [ ] T040 Create `/src/components/deck/CardItem.tsx` component:
  - Display card preview (front in bold, back below)
  - Buttons: Edit, Delete with confirmation modal
- [ ] T041 [P] Create `/src/components/deck/CreateCardModal.tsx`:
  - Form: front textarea (Markdown), back textarea (Markdown), live preview
  - Markdown preview using `react-markdown`
  - Submit: call Server Action to create card
- [ ] T042 [P] Create `/src/components/deck/EditCardModal.tsx`:
  - Pre-populate front/back from card data
  - Same form + preview as CreateCardModal
  - Submit: call Server Action to update card
- [ ] T043 Create `/src/actions/deck.actions.ts` Server Actions:
  - `createDeck(title, description, color_code)`: validate with Zod, insert to DB
  - `updateDeck(deckId, title?, description?, color_code?)`: validate, update with DB
  - `deleteDeck(deckId)`: cascade delete cards and card_progress
- [ ] T044 Create `/src/actions/card.actions.ts` Server Actions:
  - `createCard(deckId, front, back)`: validate with Zod, insert to DB + initialize card_progress
  - `updateCard(cardId, front?, back?)`: validate, update DB
  - `deleteCard(cardId)`: cascade delete card_progress
- [ ] T045 [P] Create `/src/components/common/Header.tsx` with navigation, user profile button, logout
- [ ] T046 [P] Create `/src/components/common/Sidebar.tsx` with deck navigation links
- [ ] T047 [Integration Test] Test deck creation flow: form → validation → database persist → UI update
- [ ] T048 [Integration Test] Test card CRUD: create → edit → delete, verify database changes

**Checkpoint**: All 16 deck/card tasks complete. Full management UI working, ready for study session.

---

## Phase 5: Study Session & Animations (4-5 days)

**Purpose**: Core study experience with SM-2 integration (P1 User Story)  
**Deliverable**: End-to-end study session, smooth animations, algorithm working  
**Blockers**: Phase 4 complete  
**User Story**: US3 - Study Session with SM-2 Spaced Repetition (P1)

- [ ] T049 Create `/src/app/(protected)/study/[deckId]/page.tsx` with study session layout
- [ ] T050 Create `/src/components/study/FlashCard.tsx` with Framer Motion 3D flip animation:
  - Initial state: front visible
  - On click: rotate 180° (rotateY) to show back (0.3s duration)
  - Motion.div with perspective: 1000px
  - Use AnimatePresence for card transitions
- [ ] T051 [P] Implement FlashCard flip animation: test smooth 60 fps on mobile (iPhone SE)
- [ ] T052 Create `/src/components/study/StudyControls.tsx` with 4 quality buttons:
  - "Again" (red) → quality 0
  - "Hard" (orange) → quality 2
  - "Good" (blue) → quality 4
  - "Easy" (green) → quality 5
  - Each button calls update handler (passed as prop)
- [ ] T053 Create `/src/components/study/StudyProgress.tsx`:
  - Display "{X}/{Y} cards reviewed today"
  - Show session timer or card counter
  - Loading indicator during API call
- [ ] T054 Create `/src/components/study/CompletionCelebration.tsx`:
  - Uses `canvas-confetti` library
  - Triggers on session_complete = true
  - Shows stats: total reviewed, EF changes, next session date
  - "Return to Dashboard" button
- [ ] T055 Create `/src/api/study/respond/route.ts` (Edge Runtime handler):
  - `export const runtime = 'edge'`
  - POST endpoint accepts: { card_id, quality, timestamp }
  - Validate input with Zod schema
  - Fetch current CardProgress from DB
  - Call SM-2 algorithm to calculate update
  - Upsert CardProgress with new values
  - Fetch next due card (or null if session complete)
  - Return: { updated_progress, next_card, session_status }
  - Error handling: 401 (auth), 403 (RLS), 404 (not found), 500 (SM-2 error)
- [ ] T056 Create `/src/actions/study.actions.ts` Server Action:
  - `getStudySession(deckId)`: fetch all cards for deck with card_progress
  - Filter to `next_review <= today` (due today)
  - Initialize session state: due_cards[], current_index=0, responses=[]
  - Return session data to client
- [ ] T057 [P] Implement session state management in study page:
  - Load due cards on mount
  - Track current card index
  - Track responses (quality feedback)
  - Update on each quality button click
- [ ] T058 Fetch due cards at session start:
  - Query: `SELECT * FROM cards WHERE deck_id = ? AND next_review <= now()`
  - Compute session stats: reviewed count, remaining count
- [ ] T059 On quality button click: call Edge endpoint (`/api/study/respond`):
  - Send { card_id, quality, timestamp }
  - Receive { updated_progress, next_card, session_status }
  - Update local state
  - If next_card = null: trigger CompletionCelebration, show stats
  - Else: advance to next card (fade out current, fade in next)
- [ ] T060 Session completion flow:
  - Hide study controls
  - Show CompletionCelebration component (confetti animation)
  - Display final stats: cards reviewed, session duration, EF changes
  - "Return to Dashboard" button navigates back
- [ ] T061 [Unit Test] FlashCard animation: verify rotateY transforms and duration
- [ ] T062 [Unit Test] StudyControls: verify all 4 quality buttons callable
- [ ] T063 [Integration Test] Complete study flow end-to-end:
  - Load session for deck with due cards
  - Flip card (animation smooth)
  - Click "Good" (API call succeeds, next card loads)
  - Repeat until session complete
  - Confetti plays, stats display
- [ ] T064 [Contract Test] `/api/study/respond` schema validation:
  - Valid request with Q=0/1/2/4/5
  - Invalid quality (Q=3) → 400
  - Missing card_id → 400
  - Unauthorized access → 401
  - RLS conflict → 403
  - Verify response schema matches contract

**Checkpoint**: All 16 study session tasks complete. Core value proposition working.

---

## Phase 6: Error Handling & Polish (2-3 days)

**Purpose**: Robustness, validation, accessibility, mobile responsiveness  
**Deliverable**: Production-ready UI/UX, all edge cases handled  
**Blockers**: Phase 5 complete

- [ ] T065 [P] Add try/catch blocks to all database operations in Server Actions
- [ ] T066 [P] Add try/catch blocks to all API Route Handlers
- [ ] T067 [P] Add error boundaries to all React components (deck management, study session, dashboard)
- [ ] T068 Create toast notification component for success/error messages (`lib/toast.ts`)
- [ ] T069 Verify Zod validation on all forms (decks, cards, study responses)
  - Client-side: show validation errors inline
  - Server-side: validate before DB operations
  - API: validate request body, return 400 with error details
- [ ] T070 Test edge cases:
  - Empty deck (no cards) → show "Create first card" CTA
  - No due cards today → show "All caught up!" message
  - Single card session → session complete after 1 review
  - Deck deletion → confirm modal, cascade delete cards
  - Card deletion → confirm modal, cascade delete progress
- [ ] T071 [P] Add keyboard shortcuts:
  - Arrow keys: flip card in study session
  - Number keys (1/2/4/5): submit quality (Again/Hard/Good/Easy)
  - Escape: exit study session (with unsaved changes warning)
- [ ] T072 [P] Add ARIA labels and screen reader support:
  - Buttons: descriptive labels
  - Study controls: announce quality level
  - Progress indicator: announce card count
  - Cards: announce front/back content
- [ ] T073 [P] Test mobile responsiveness:
  - 375px viewport (iPhone SE): all components readable, touch targets ≥44px
  - 768px viewport (iPad): optimized layout
  - 1024px+ viewport (desktop): full width with side margins
  - Use Tailwind mobile-first breakpoints: `sm:`, `md:`, `lg:`
- [ ] T074 [P] Verify Tailwind classes applied (no inline styles):
  - FlashCard animation: Tailwind classes (no `style=`)
  - Study controls: Tailwind button utilities
  - Dashboard: Tailwind grid/flex layout
  - Modals: Tailwind backdrop blur, shadows
- [ ] T075 Add loading spinners during async operations:
  - Deck creation: loading state on submit button
  - Card CRUD operations: loading indicator
  - Study response: loading spinner during API call
  - API calls: optimistic UI updates with rollback on error
- [ ] T076 Add confirmation modals for destructive actions:
  - Delete deck: "Are you sure? This will delete X cards."
  - Delete card: "Are you sure?"
  - Logout: "Confirm logout?"
- [ ] T077 Test RLS enforcement:
  - Attempt to access other user's deck via URL → 403
  - Attempt to update other user's card → 403
  - Attempt to modify other user's progress → 403
  - Verify all RLS errors caught and displayed gracefully

**Checkpoint**: All 13 polish tasks complete. Robust, accessible, mobile-ready.

---

## Phase 7: Testing & Optimization (3-4 days)

**Purpose**: Test coverage, performance profiling, security audit  
**Deliverable**: >80% test coverage, all performance targets met, security validated  
**Blockers**: Phase 6 complete

- [ ] T078 [P] Write unit tests for SM-2 algorithm: `tests/unit/sm2.test.ts`
  - Test Q0 path: interval=1, repetitions=0, EF↓
  - Test Q1 path: interval=1, repetitions=0, EF↓
  - Test Q2 path: interval×1.2, repetitions+1, EF↓
  - Test Q4 path: rep-dependent intervals, repetitions+1, EF unchanged
  - Test Q5 path: rep-dependent intervals with bonus, repetitions+1, EF↑
  - Compare against Anki reference implementation for known inputs
- [ ] T079 [P] Write unit tests for Zod validators: `tests/unit/validators.test.ts`
  - Valid deck input → passes
  - Invalid title (empty, >200 chars) → fails
  - Invalid color_code (#RRGGBB pattern) → fails
  - Valid card input → passes
  - Invalid front/back (empty, >5000 chars) → fails
- [ ] T080 [P] Write unit tests for auth utilities: `tests/unit/auth.test.ts`
  - `getCurrentUser()` with valid session → returns user
  - `getCurrentUser()` without session → returns null
  - Session validation middleware → blocks unauthenticated routes
- [ ] T081 Write integration tests for deck CRUD API: `tests/integration/deck.routes.test.ts`
  - POST /api/decks: create deck, verify DB insert, return correct schema
  - GET /api/decks: fetch user's decks, verify RLS filtering
  - PUT /api/decks/[deckId]: update deck fields, verify DB update
  - DELETE /api/decks/[deckId]: cascade delete cards and progress
  - Verify 403 errors for unauthorized access (RLS)
- [ ] T082 Write integration tests for card CRUD API: `tests/integration/card.routes.test.ts`
  - POST /api/cards: create card, verify DB insert + card_progress initialization
  - GET /api/cards?deckId=X: fetch cards in deck, verify pagination/filtering
  - PUT /api/cards/[cardId]: update front/back, verify RLS
  - DELETE /api/cards/[cardId]: verify cascade delete to card_progress
  - Verify 403 for unauthorized deck access
- [ ] T083 Write integration tests for study endpoint: `tests/integration/study.routes.test.ts`
  - POST /api/study/respond: all quality paths (Q0/1/2/4/5) → correct SM-2 output
  - Verify card_progress DB update with new values
  - Verify next_card returned (or null if no more due)
  - Verify 400 for invalid quality values
  - Verify 401 for unauthenticated requests
  - Verify 403 for cards not owned by user
- [ ] T084 Write contract tests for study session API: `tests/contract/study-session.contract.ts`
  - Request schema validation: card_id (uuid), quality (enum), timestamp (ISO 8601)
  - Response schema validation: updated_progress, next_card, session_status
  - Error response schema: error, code, details
  - Verify all error codes: 400, 401, 403, 404, 500
- [ ] T085 Run full test suite locally: `npm run test`
  - All tests pass (unit + integration + contract)
  - No console warnings or errors
  - Coverage summary displayed
- [ ] T086 [P] Performance audit: Lighthouse
  - Dashboard load time: target < 500ms (measure for 5-deck scenario)
  - Card flip animation: target 60 fps (profile with DevTools)
  - Study response latency: target < 100ms Edge Runtime (measure end-to-end)
  - Lighthouse accessibility score: target ≥ 90
  - Lighthouse best practices: target ≥ 90
  - Lighthouse performance: target ≥ 80 (acceptable for MVP)
- [ ] T087 [P] Bundle size audit:
  - Verify no unnecessary dependencies (npm audit)
  - Check production bundle size: verify < 200KB gzipped
  - Optimize imports: use ES modules, tree-shaking enabled
  - Check Framework dependencies: @supabase/ssr, framer-motion, zod, react-markdown
- [ ] T088 [P] Edge Runtime compatibility test:
  - Test `/api/study/respond` locally with `wrangler` (Cloudflare emulator)
  - Verify no Node.js APIs used (fs, path, crypto Node variant)
  - Confirm Web APIs work (fetch, crypto.subtle, Headers, URL)
  - Test with 100+ concurrent requests: measure cold start + warm performance
- [ ] T089 Security audit: RLS and input validation
  - Attempt to read other user's deck → 403 Forbidden
  - Attempt to update other user's card → 403 Forbidden
  - Attempt to modify other user's progress → 403 Forbidden
  - Inject malicious Markdown (XSS) → `react-markdown` + `DOMPurify` sanitizes
  - Inject SQL (even though parameterized) → Supabase SDK prevents
  - Rate limit testing: verify reasonable limits or implement globally

**Checkpoint**: All 12 testing tasks complete. 80%+ coverage, performance validated, security hardened.

---

## Phase 8: Deployment & Launch (1-2 days)

**Purpose**: Deploy to production, verify systems operational  
**Deliverable**: Live on production URL, monitoring active, team trained  
**Blockers**: Phase 7 complete

- [ ] T090 Create Vercel project and connect GitHub repository to `001-flashcard-sm2` branch
- [ ] T091 [P] Configure environment variables in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL` (public, browser-accessible)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public, browser-accessible)
  - `SUPABASE_SERVICE_ROLE_KEY` (secret, backend only)
- [ ] T092 [P] Verify Edge Runtime configuration:
  - Confirm `/api/study/respond` has `export const runtime = 'edge'`
  - Verify Vercel platform supports Edge Functions (included in Pro+ or free trial)
  - Test Edge function deployment succeeds
- [ ] T093 Deploy to Vercel staging environment (preview URL):
  - Trigger auto-deploy from `001-flashcard-sm2` branch
  - Verify build succeeds: `npm run build`
  - Verify no errors in deployment logs
  - Access preview URL in browser
- [ ] T094 [P] Test auth flow in staging:
  - Signup with new email → verify Supabase Auth email confirmation
  - Login with correct credentials → verify session stored, redirect to dashboard
  - Logout → verify session cleared, redirect to landing page
- [ ] T095 [P] Test deck/card operations in staging:
  - Create deck → verify appears on dashboard with stats
  - Add cards to deck → verify card list populated
  - Edit card → verify changes persist
  - Delete card → verify removed from list and confetti doesn't trigger (not in study)
- [ ] T096 [P] Test study session in staging:
  - Load study page → verify due cards fetched
  - Flip card animation → verify smooth 3D rotation
  - Click "Good" → verify next card loads, API call completes < 300ms
  - Repeat until session complete → verify confetti plays, stats display
  - Return to dashboard → verify deck stats updated (e.g., review count)
- [ ] T097 [P] Verify RLS policies in production Supabase:
  - Attempt to query other user's data via Supabase API directly (curl/postman with fake auth)
  - Confirm RLS denies all cross-user access
  - Verify error responses are consistent with production behavior
- [ ] T098 Run final Lighthouse audit on production URL:
  - Accessibility: ≥ 90
  - Best Practices: ≥ 90
  - Performance: ≥ 80 (acceptable)
  - Document any warnings/opportunities for future optimization
- [ ] T099 Deploy to production (merge `001-flashcard-sm2` to `main` branch):
  - Trigger Vercel production deployment
  - Monitor deployment status
  - Access production URL: https://flashcard-mastery.vercel.app (example)
  - Verify all pages load and functional
- [ ] T100 Setup error tracking and monitoring:
  - Integrate Sentry for error tracking (free tier)
  - Configure Vercel Analytics for performance monitoring
  - Setup alerts for deployment failures, high error rates
  - Configure log aggregation (Vercel built-in logs)
- [ ] T101 Create runbook documentation:
  - "How to Deploy": manual deployment steps if auto-deploy fails
  - "How to Revert": rollback to previous Vercel deployment
  - "How to Scale": guidance on upgrading Supabase plan, Vercel scaling options
  - "On-Call Procedures": who is on call, escalation contacts, incident response steps
- [ ] T102 Team training:
  - Deploy new team members to staging environment
  - Walkthrough feature: create deck → add cards → study session
  - Explain technical architecture: Next.js + Supabase, Edge Runtime, RLS
  - Review runbooks and escalation procedures

**Checkpoint**: All 13 deployment tasks complete. Production live, monitoring active.

---

## Overall Task Summary

**Total Tasks**: 102 (T001-T102)

### By Phase

| Phase | Task Range | Count | Duration | Status |
|-------|-----------|-------|----------|--------|
| 1: Foundation | T001-T008 | 8 | 1-2 days | Ready |
| 2: Database & Auth | T009-T024 | 16 | 2-3 days | Ready |
| 3: Core Utilities | T025-T032 | 8 | 1-2 days | Ready |
| 4: Dashboard & Management | T033-T048 | 16 | 3-4 days | Ready |
| 5: Study Session | T049-T064 | 16 | 4-5 days | Ready |
| 6: Error Handling & Polish | T065-T077 | 13 | 2-3 days | Ready |
| 7: Testing & Optimization | T078-T089 | 12 | 3-4 days | Ready |
| 8: Deployment & Launch | T090-T102 | 13 | 1-2 days | Ready |
| **TOTAL** | **T001-T102** | **102** | **17-25 days** | **Ready** |

### By User Story

| Story | P | Details | Task Count | Phase |
|-------|---|---------|-----------|-------|
| **US1: Dashboard** | P1 | Deck overview, stats | (included in Phase 4: T033-T036, T045-T047) | Phase 4 |
| **US2: Deck & Card Mgmt** | P2 | CRUD operations | T033-T048 | Phase 4 |
| **US3: Study Session** | P1 | Flip, SM-2, confetti | T049-T064 | Phase 5 |
| **US4: Authentication** | P1 | Signup, login, RLS | T009-T024 | Phase 2 |

---

## Dependencies & Parallel Execution

### Phase Dependencies

```
Phase 1 (Foundation)
    ↓
Phase 2 (Database & Auth) ✅ Can start after Phase 1 done
    ↓
Phase 3 (Core Utilities) ✅ Can start after Phase 2 done
    ↓
Phase 4 (Dashboard) ← Parallel with Phase 5 (differ files, no blocking deps)
Phase 5 (Study Session) ← Parallel with Phase 4
    ↓
Phase 6 (Polish) ✅ Can start after Phase 5 done
    ↓
Phase 7 (Testing) ✅ Can start after Phase 6 done
    ↓
Phase 8 (Deployment) ✅ Can start after Phase 7 done
```

### Parallel Opportunities

**Within Phase 1** (Foundation):
- T002 (dependencies), T003 (directories), T004 (TypeScript), T005 (Tailwind) can run in parallel
- Marked with [P] tag: **4 tasks parallelizable**

**Within Phase 2** (Database & Auth):
- T013-T016 (RLS policies) can run in parallel (independent policy definitions)
- T021-T022 (auth pages) can run in parallel (separate route files)
- Marked with [P] tag: **6 tasks parallelizable**

**Within Phase 3** (Core Utilities):
- T029-T030 (auth utilities) can run in parallel (separate files)
- Marked with [P] tag: **2 tasks parallelizable**

**Within Phase 4** (Dashboard & Deck Management):
- T037, T041-T043, T045-T046 (modals, components) can run in parallel (different components)
- T047-T048 (integration tests) can run in parallel with other components
- Marked with [P] tag: **6 tasks parallelizable**
- **ENTIRE PHASE 4 can run parallel with Phase 5**

**Within Phase 5** (Study Session):
- T051, T052, T053 (different components) can run in parallel
- Marked with [P] tag: **1 task parallelizable** (but composition sequential at end)

**Within Phase 6** (Polish):
- T065-T067 (error handling), T071-T073 (accessibility, responsiveness) can run in parallel
- Marked with [P] tag: **6 tasks parallelizable**

**Within Phase 7** (Testing):
- T078-T080 (unit tests), T081-T083 (integration tests) can run in parallel
- Marked with [P] tag: **6 tasks parallelizable**

**Within Phase 8** (Deployment):
- T091-T092 (configuration) can run in parallel
- T094-T098 (testing in staging) can run in parallel
- Marked with [P] tag: **6 tasks parallelizable**

---

## Parallel Execution Examples

### Example 1: Phase 4 with 2 Developers

**Developer A** (Dashboard):
- T033-T036: Dashboard layout & DeckCard component

**Developer B** (Modals & Actions):
- T037, T041-T043: Modals for create/edit cards

**After merge**:
- T038-T040: CardList & CardItem (both devs)
- T044: Card Server Actions (integrate with B's modal params)

### Example 2: Phase 5 with 3 Developers

**Developer A** (Cards & Controls):
- T050-T052: FlashCard + StudyControls components

**Developer B** (Progress & Celebration):
- T053-T054: StudyProgress + CompletionCelebration

**Developer C** (API & Logic):
- T055-T060: Edge endpoint + session state management

**All in parallel**, merge when all components ready for integration.

### Example 3: Phase 7 Testing (CI/CD)

All test suites (T078-T084) run in parallel on GitHub Actions:
- Unit tests: ~30s
- Integration tests: ~60s
- Contract tests: ~20s
- **Total time**: max(60s) = 1 minute (vs 110s sequentially)

---

## Quality Gates (Pass/Fail Criteria)

### End of Phase 1
- [x] `npm run build` succeeds (no errors)
- [x] TypeScript strict mode enabled
- [x] All 8 foundation tasks complete

### End of Phase 2
- [x] All 4 database tables created with RLS
- [x] Signup/login tested end-to-end
- [x] Supabase types generated
- [x] Cross-user RLS test passes (403 on unauthorized access)

### End of Phase 3
- [x] SM-2 algorithm unit tests passing
- [x] Zod validators unit tests passing
- [x] Auth middleware blocks unauthenticated routes
- [x] All 8 utility tasks complete

### End of Phase 4
- [x] Dashboard renders deck list with stats
- [x] Deck creation form works (persists to DB)
- [x] Card CRUD all working (create, read, update, delete)
- [x] All 16 dashboard/management tasks complete

### End of Phase 5
- [x] Study session loads due cards
- [x] Card flip animation smooth (60 fps)
- [x] SM-2 calculation endpoint returns correct state
- [x] Confetti triggers on session completion
- [x] Session end-to-end flow working
- [x] All 16 study session tasks complete

### End of Phase 6
- [x] All forms validated (client + server)
- [x] Error boundaries catch and display errors
- [x] RLS enforcement verified (403 on unauthorized)
- [x] Mobile responsive (375px-1024px)
- [x] Keyboard shortcuts working
- [x] All 13 polish tasks complete

### End of Phase 7
- [x] >80% test coverage
- [x] All tests passing (unit + integration + contract)
- [x] Edge Runtime latency < 100ms (measured)
- [x] Lighthouse accessibility ≥ 90
- [x] Lighthouse best practices ≥ 90
- [x] RLS security audit passed
- [x] All 12 testing tasks complete

### End of Phase 8 (Launch)
- [x] Production URL live and accessible
- [x] All staging tests passed
- [x] Sentry error tracking operational
- [x] Vercel Analytics active
- [x] Team trained on runbooks
- [x] All 13 deployment tasks complete

---

## Task Status Tracking

| Status | Meaning | Action |
|--------|---------|--------|
| `- [ ]` | Not started | Ready to assign |
| `- [x]` | Completed | Move to next task |
| `- [ ] ⏸️` | Blocked | Resolve dependency |
| `- [ ] 🔄` | In Progress | Update code, don't reassign |

---

**Task List Version**: 1.0.0 | **Status**: Ready for Implementation | **Date**: 2026-04-16

**Next Action**: Begin Phase 1 (Foundation) - `npm run dev` to start development!
