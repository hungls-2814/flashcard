# Feature Specification: Flashcard Mastery - Spaced Repetition System

**Feature Branch**: `001-flashcard-sm2`  
**Created**: 2026-04-16  
**Status**: Draft  
**Input**: Flashcard app with SM-2 algorithm, Next.js, Supabase, Edge Runtime optimization

---

## User Scenarios & Testing

### User Story 1 - Dashboard Overview & Deck Management (Priority: P1)

Users can view their flashcard deck collection on the dashboard. Each deck displays:
- Deck title, description, and visual color coding
- Count of "Due Today" cards (cards ready for review)
- Count of "New" cards (never studied)
- Quick access buttons to study or manage the deck

**Why this priority**: Dashboard is the entry point to the learning system. Users must see at a glance which decks need attention today. This is the foundation for engagement and learning workflow.

**Independent Test**: Dashboard renders correctly with deck summary stats; users can navigate to any deck; "Due Today" and "New" counts accurately reflect card progress.

**Acceptance Scenarios**:

1. **Given** a user has created 2 decks with mixed card states, **When** they visit the dashboard, **Then** they see both decks listed with correct "Due Today" and "New" counts
2. **Given** a user has never created a deck, **When** they visit the dashboard, **Then** they see an empty state with a CTA to create their first deck
3. **Given** a user is viewing the dashboard, **When** they click on a deck, **Then** they navigate to the Deck View page

---

### User Story 2 - Deck & Card Management (Priority: P2)

Users can create new decks and manage cards within each deck. Operations include:
- Create a new deck (title, description, color)
- View all cards in a deck
- Add new cards (front/back content with Markdown support)
- Edit existing cards
- Delete cards with confirmation

**Why this priority**: Card management is essential for building study material. Users must be able to populate decks and maintain them before they can study effectively.

**Independent Test**: All CRUD operations work independently; users can populate a deck with cards and verify changes persist.

**Acceptance Scenarios**:

1. **Given** a user is on the Deck View page, **When** they click "Add Card", **Then** a form opens to enter front/back text
2. **Given** a user submits a new card with valid content, **When** they confirm, **Then** the card appears in the deck list and persists to the database
3. **Given** a user hovers over an existing card, **When** they click the edit button, **Then** they can modify the front/back text
4. **Given** a user attempts to delete a card, **When** they confirm the deletion, **Then** the card is removed and list updates immediately

---

### User Story 3 - Study Session with SM-2 Spaced Repetition (Priority: P1)

Users enter a study session for a deck. The core experience includes:
- Flashcard flip animation (front→back reveal)
- Quality feedback (Again/Hard/Good/Easy buttons corresponding to 0-1/2/4/5)
- SM-2 algorithm processes the response and updates card intervals
- Next review date calculated and persisted
- Session completion with visual celebration (confetti)
- Current stats shown (cards reviewed, remaining today)

**Why this priority**: Study session is the core value proposition. Without this, the spaced repetition system is incomplete. P1 because it directly drives user engagement and learning outcomes.

**Independent Test**: Session flow works end-to-end; cards flip smoothly; feedback is processed; next review dates are calculated correctly per SM-2; session can be completed independently without other stories.

**Acceptance Scenarios**:

1. **Given** a user opens a study session for a deck with due cards, **When** the page loads, **Then** one card is displayed in flipped state (front visible)
2. **Given** a card is showing front content, **When** the user clicks the card, **Then** it animates to show back content
3. **Given** the user has reviewed the back, **When** they click "Good", **Then** SM-2 calculates new interval, updates card_progress, and displays the next card
4. **Given** a user clicks "Again", **When** the system processes it, **Then** interval and repetitions reset per SM-2 rules
5. **Given** the user has reviewed all due cards, **When** the session ends, **Then** a confetti animation plays and stats are displayed

---

### User Story 4 - Authentication & Protected Routes (Priority: P1)

Users must authenticate to access the app. Protected routes include:
- `/dashboard` - personal deck collection
- `/deck/[deckId]` - deck and card management
- `/study/[deckId]` - study session
- Public routes: `/` (landing), `/login`, `/signup`

**Why this priority**: Security and data isolation are mandatory. Users' learning data is personal and must be protected. P1 because it's a foundational security requirement.

**Independent Test**: Auth middleware correctly blocks unauthenticated access; session validation works; logged-in users see only their own data (RLS enforced).

**Acceptance Scenarios**:

1. **Given** an unauthenticated user tries to access `/dashboard`, **When** middleware checks the session, **Then** they are redirected to `/login`
2. **Given** a user logs in with valid credentials, **When** authentication succeeds, **Then** they see their dashboard and a session token is stored
3. **Given** a logged-in user tries to access another user's deck (via URL manipulation), **When** the API is called, **Then** RLS denies the request and returns 403

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST implement the SuperMemo-2 (SM-2) algorithm with Ease Factor, Interval, Repetitions, and Next Review Date tracking
- **FR-002**: System MUST support Markdown rendering on both card front and back
- **FR-003**: Dashboard MUST calculate and display accurate "Due Today" and "New" card counts per deck
- **FR-004**: Study session MUST support flip animation with Framer Motion and smooth transitions
- **FR-005**: System MUST enforce Row Level Security (RLS) on all database tables scoped to authenticated user
- **FR-006**: API endpoints for card progress updates MUST run on Edge Runtime to minimize latency
- **FR-007**: System MUST provide visual feedback (confetti) upon session completion
- **FR-008**: Card creation/editing interface MUST support Markdown preview
- **FR-009**: Study session MUST display session progress (e.g., "3/10 cards reviewed today")
- **FR-010**: System MUST validate all user input via Zod before database operations or SM-2 calculations

### Key Entities

- **Deck**: Container for flashcards; belongs to a user; has title, description, color_code; tracks creation metadata
- **Card**: Individual flashcard; contains front (Markdown), back (Markdown); belongs to a deck and user
- **CardProgress**: Tracking state for an individual card; stores Ease Factor (default 2.5), Interval (days), Repetitions (count), Next Review Date (timestamp)
- **Profile**: User metadata linked to Supabase auth.users; email, full_name
- **StudySession**: Represents an active studying context; tracks cards reviewed in current session, responses given

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Dashboard loads in under 500ms for users with up to 50 decks
- **SC-002**: Card flip animation completes in under 300ms and feels smooth (60 fps)
- **SC-003**: Study session responds to quality feedback within 100ms (Edge Runtime latency)
- **SC-004**: Users can complete a 10-card study session in under 5 minutes
- **SC-005**: SM-2 calculations produce mathematically correct next review intervals (verified by algorithmic tests)
- **SC-006**: 100% of user data is protected by RLS policies; unauthorized access attempts fail completely
- **SC-007**: New user can create a deck and study first card within 2 minutes (onboarding metric)
- **SC-008**: Session completion triggers visual celebration that plays within 500ms of final response

---

## Assumptions

- Users have stable internet connectivity for real-time updates
- Card content is primarily text-based; images/media support is out of scope for v1
- SM-2 quality scale (0-5) maps to button labels: "Again" (0-1), "Hard" (2), "Good" (4), "Easy" (5)
- Desktop and tablet support follows mobile-first development; primary target is mobile/web browsers
- Initial interval for new cards is 1 day; Easy bonus interval is 1.3x multiplier
- "Due Today" cards are those where next_review_date <= current_date at 00:00 UTC
- Timezone handling uses UTC for all stored timestamps; client displays in user's local timezone
- Email/password authentication is sufficient for v1; social login is out of scope
- One user cannot share decks with other users in v1 (personal study only)
- Deck color_code is a hex string (#RRGGBB); used for UI theming only

---

## Database Schema (Supabase/PostgreSQL)

### Required Tables & RLS Policies

All tables mandate Row Level Security with policies enforcing `auth.uid()` for data isolation:

- **profiles**
  - `id` (uuid, PK)
  - `email` (text, unique, from auth.users)
  - `full_name` (text)
  - **RLS**: SELECT/UPDATE only where `id = auth.uid()`

- **decks**
  - `id` (uuid, PK)
  - `user_id` (uuid, FK → profiles.id)
  - `title` (text)
  - `description` (text)
  - `color_code` (text, hex format)
  - `created_at` (timestamp)
  - **RLS**: SELECT/INSERT/UPDATE/DELETE only where `user_id = auth.uid()`

- **cards**
  - `id` (uuid, PK)
  - `deck_id` (uuid, FK → decks.id)
  - `user_id` (uuid, FK → profiles.id, denormalized for RLS)
  - `front` (text, Markdown)
  - `back` (text, Markdown)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
  - **RLS**: SELECT/INSERT/UPDATE/DELETE only where `user_id = auth.uid()`

- **card_progress**
  - `id` (uuid, PK)
  - `card_id` (uuid, FK → cards.id, unique)
  - `user_id` (uuid, FK → profiles.id)
  - `ease_factor` (float, default 2.5)
  - `interval` (int, default 0, unit: days)
  - `repetitions` (int, default 0)
  - `next_review` (timestamp, default current_timestamp)
  - `last_reviewed` (timestamp, nullable)
  - `last_quality` (int, 0-5, nullable)
  - **RLS**: SELECT/INSERT/UPDATE/DELETE only where `user_id = auth.uid()`

---

## TypeScript Interfaces & Types

All types must be generated from Supabase schemas or defined in `@/types`:

```typescript
// types/database.ts
export type Database = {
  // Auto-generated from Supabase
}

export interface Profile {
  id: string
  email: string
  full_name: string
}

export interface Deck {
  id: string
  user_id: string
  title: string
  description: string
  color_code: string
  created_at: string
}

export interface Card {
  id: string
  deck_id: string
  user_id: string
  front: string
  back: string
  created_at: string
  updated_at: string
}

export interface CardProgress {
  id: string
  card_id: string
  user_id: string
  ease_factor: number
  interval: number
  repetitions: number
  next_review: string
  last_reviewed: string | null
  last_quality: number | null
}

export interface StudyResponse {
  card_id: string
  quality: 0 | 1 | 2 | 4 | 5
  timestamp: string
}
```

---

## SM-2 Algorithm Logic

The system MUST implement SuperMemo-2 (SM-2) with the following rules:

### Initial Card State
- `ease_factor = 2.5`
- `interval = 0`
- `repetitions = 0`
- `next_review = today`

### Response Processing (Quality 0-5)

**Quality 0 or 1 (Again → Reset)**
- `repetitions = 0`
- `interval = 1` (reschedule for tomorrow)
- `ease_factor = max(1.3, ease_factor - 0.2)`

**Quality 2 (Hard → Slight Increase)**
- `interval = ceil(interval * 1.2)`
- `ease_factor = max(1.3, ease_factor - 0.14)`

**Quality 4 (Good → Standard Increase)**
- If `repetitions == 0`: `interval = 1`
- If `repetitions == 1`: `interval = 3`
- If `repetitions >= 2`: `interval = ceil(interval * ease_factor)`
- `ease_factor = ease_factor` (unchanged)

**Quality 5 (Easy → Strong Increase)**
- If `repetitions == 0`: `interval = 1`
- If `repetitions == 1`: `interval = 3`
- If `repetitions >= 2`: `interval = ceil(interval * ease_factor * 1.3)`
- `ease_factor = ease_factor + 0.1`

### Next Review Date Calculation
- `next_review = today + interval days`

---

## UI/UX & Component Structure

### Page: `/study/[deckId]`

**Layout**: Full-screen, mobile-first, centered card

**Card Display**:
- Animated flip card using Framer Motion
- Front content (default): Text centered, readable font size
- Back content (after click): Smooth 3D flip animation to back
- Card container: `clsx` for conditional styling based on state

**Quality Buttons** (below card):
- "Again" (red/destructive) → quality 0
- "Hard" (orange/warning) → quality 2
- "Good" (blue/default) → quality 4
- "Easy" (green/success) → quality 5

**Progress Display**:
- Header: "{X}/{Y} cards reviewed today"
- Footer: "Next card loading..." during API call
- Confetti effect plays on final card completion

**Accessibility**:
- Keyboard support: Arrow keys to flip, Number keys (1/2/4/5) to submit quality
- ARIA labels on all buttons
- Color contrast meets WCAG AA

---

## Edge Runtime & Performance Requirements

- **Study actions** (quality feedback → SM-2 calculation → card_progress update) MUST run on Edge Runtime
- Route handlers MUST export `runtime = 'edge'`
- Avoid Node.js APIs; use Web APIs (e.g., `crypto.subtle` instead of Node's `crypto`)
- Edge function max execution time: assume 30s limit; SM-2 calculations must complete within 100ms

---

## Error Handling & Validation

- **Input Validation**: All user inputs validated with Zod before processing
- **Database Errors**: All queries wrapped in try/catch; descriptive errors logged
- **Auth Errors**: 401 Unauthorized if session invalid; 403 Forbidden if RLS denies access
- **API Errors**: Return JSON with `{ error: string; code: string }` format
- **UI Errors**: Toast notifications for user-facing messages; logging for debugging

---

## Deployment & Middleware

- **Middleware** (`middleware.ts`): Check Supabase session; redirect unauthenticated users to `/login`
- **Protected Routes**: `/dashboard`, `/deck/*`, `/study/*`
- **Public Routes**: `/`, `/login`, `/signup`
- **Environment Variables**: Supabase URL, Anon Key, Service Role Key (backend only)
-**Deployment Target**: Vercel or Cloudflare Workers with Edge Runtime support
