# Phase 1 Design: Data Model & Entity Relationships

**Status**: Complete  
**Date**: 2026-04-16  
**Scope**: Database schema design, entity definitions, validation rules, state transitions

---

## Entity Relationship Diagram (ERD)

```
┌─────────────┐
│ auth.users  │ (Supabase Auth)
│ ├─ id (uuid)│
│ └─ email    │
└──────┬──────┘
       │
       │ 1:1
       ▼
┌─────────────────────────────────────────┐
│ profiles                                 │
│ ├─ id (uuid, PK, FK → auth.users.id)   │
│ ├─ email (text, unique)                 │
│ ├─ full_name (text)                     │
│ ├─ created_at (timestamp)               │
│ └─ updated_at (timestamp)               │
└──────────────┬──────────────────────────┘
               │
         1:N ┌─┴─┐
            │   │
    ┌───────▼─┐ │  ┌────────────────────────────────┐
    │ decks   │ │  │ cards                          │
    │ ├─ id   │ │  │ ├─ id (uuid, PK)              │
    │ ├─ user_id (FK→profiles)  │  ├─ deck_id (FK→decks.id)      │
    │ ├─ title                  │  ├─ user_id (FK→profiles.id)   │
    │ ├─ description            │  ├─ front (text, Markdown)     │
    │ ├─ color_code             │  ├─ back (text, Markdown)      │
    │ ├─ created_at             │  ├─ created_at (timestamp)     │
    │ └─ updated_at             │  └─ updated_at (timestamp)     │
    └───────┬─────────────────────────────────────────┘
            │
            │ 1:1
            ▼
    ┌──────────────────────────────────────┐
    │ card_progress                        │
    │ ├─ id (uuid, PK)                    │
    │ ├─ card_id (uuid, FK→cards.id)      │
    │ ├─ user_id (uuid, FK→profiles.id)   │
    │ ├─ ease_factor (float, default 2.5) │
    │ ├─ interval (int, default 0, ≥ 0)   │
    │ ├─ repetitions (int, default 0, ≥0) │
    │ ├─ next_review (timestamp)          │
    │ ├─ last_reviewed (timestamp, null)  │
    │ └─ last_quality (int 0-5, null)     │
    └──────────────────────────────────────┘
```

---

## Entity Definitions

### 1. Profile (User Identity)

**Purpose**: Store user metadata linked to Supabase Auth. One-to-one with `auth.users`.

**Table Schema**:
```sql
-- profiles table (created after auth.users linked)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy: Users can only SELECT/UPDATE their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own profile" ON profiles
  FOR ALL
  USING (id = auth.uid());

CREATE POLICY "Users can only update their own profile" ON profiles
  FOR UPDATE
  WITH CHECK (id = auth.uid());
```

**Field Definitions**:
- `id` (uuid, PK): Auto-linked to Supabase auth.users.id during signup
- `email` (text, unique): Copy of auth.users.email for easier querying
- `full_name` (text, nullable): Display name (optional onboarding step)
- `created_at` (timestamp): Account creation time (auto-set)
- `updated_at` (timestamp): Last profile update (auto-set on trigger)

**Validation Rules**:
- `email`: Non-null, valid email format (enforced by auth.users)
- `full_name`: ≤ 255 characters, optional
- `created_at`, `updated_at`: Immutable timestamps (set by database triggers)

**Relationships**:
- 1:N with `decks` (user creates many decks)
- 1:N with `cards` (user owns many cards across decks)
- 1:N with `card_progress` (user has progress tracking for each card)

**Access Control**:
- RLS: `id = auth.uid()` (only own profile visible)

---

### 2. Deck (Card Container)

**Purpose**: Organize flashcards into themed collections (e.g., "Spanish Vocab", "Biology 101").

**Table Schema**:
```sql
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  color_code TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT color_hex_format CHECK (color_code ~ '^#[0-9a-fA-F]{6}$')
);

CREATE INDEX idx_decks_user_id ON decks(user_id);

ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own decks" ON decks
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can only update their own decks" ON decks
  FOR UPDATE
  WITH CHECK (user_id = auth.uid());
```

**Field Definitions**:
- `id` (uuid, PK): Unique deck identifier
- `user_id` (uuid, FK): Owner user; used for RLS
- `title` (text, required): ≤ 200 characters, non-empty
- `description` (text, optional): ≤ 1000 characters, deck purpose/notes
- `color_code` (text, default #3b82f6): Hex color for UI theming (e.g., #FF6B6B for red)
- `created_at` (timestamp): Deck creation time
- `updated_at` (timestamp): Last modification time

**Validation Rules**:
- `title`: Non-empty, ≤ 200 characters (Zod schema enforced at API layer)
- `description`: ≤ 1000 characters, optional
- `color_code`: Hex format `#RRGGBB` (PostgreSQL CHECK constraint)

**Relationships**:
- Many-to-one with `profiles` (each deck owned by one user)
- One-to-many with `cards` (deck contains many cards)
- Cascade delete: deleting deck cascades to all cards and card_progress

**Access Control**:
- RLS: `user_id = auth.uid()` (only owner can CRUD)

---

### 3. Card (Flashcard Unit)

**Purpose**: Individual flashcard storing Markdown front/back content.

**Table Schema**:
```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT front_not_empty CHECK (length(front) > 0),
  CONSTRAINT back_not_empty CHECK (length(back) > 0)
);

CREATE INDEX idx_cards_deck_id ON cards(deck_id);
CREATE INDEX idx_cards_user_id ON cards(user_id);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own cards" ON cards
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can only update their own cards" ON cards
  FOR UPDATE
  WITH CHECK (user_id = auth.uid());
```

**Field Definitions**:
- `id` (uuid, PK): Unique card identifier
- `deck_id` (uuid, FK): Parent deck; used for filtering cards by deck
- `user_id` (uuid, FK): Card owner; denormalized for RLS efficiency (avoids JOIN for RLS check)
- `front` (text, required): Markdown content (e.g., "What is the capital of France?"), ≤ 5000 chars
- `back` (text, required): Markdown content (e.g., "Paris"), ≤ 5000 chars
- `created_at` (timestamp): Card creation time
- `updated_at` (timestamp): Last edit time

**Validation Rules**:
- `front`: Non-empty, ≤ 5000 characters (Zod enforced)
- `back`: Non-empty, ≤ 5000 characters (Zod enforced)
- PostgreSQL CHECK constraints enforce non-empty at DB layer

**Relationships**:
- Many-to-one with `decks` (many cards per deck)
- Many-to-one with `profiles` (denormalized user ownership for RLS)
- One-to-one with `card_progress` (each card has exactly one tracking record)
- Cascade delete: deleting card cascades to card_progress

**Access Control**:
- RLS: `user_id = auth.uid()` (only owner can CRUD)

---

### 4. CardProgress (SM-2 Learning State)

**Purpose**: Track SuperMemo-2 algorithm variables for each card (when to review next, how difficult, etc.).

**Table Schema**:
```sql
CREATE TABLE card_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL UNIQUE REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ease_factor FLOAT DEFAULT 2.5,
  interval INT DEFAULT 0,
  repetitions INT DEFAULT 0,
  next_review TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reviewed TIMESTAMP WITH TIME ZONE,
  last_quality INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT ease_factor_valid CHECK (ease_factor >= 1.3),
  CONSTRAINT interval_valid CHECK (interval >= 0),
  CONSTRAINT repetitions_valid CHECK (repetitions >= 0),
  CONSTRAINT quality_valid CHECK (last_quality IS NULL OR (last_quality >= 0 AND last_quality <= 5))
);

CREATE INDEX idx_card_progress_user_id ON card_progress(user_id);
CREATE INDEX idx_card_progress_next_review ON card_progress(next_review);

ALTER TABLE card_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own card progress" ON card_progress
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users can only update their own card progress" ON card_progress
  FOR UPDATE
  WITH CHECK (user_id = auth.uid());
```

**Field Definitions**:
- `id` (uuid, PK): Progress record identifier
- `card_id` (uuid, FK, UNIQUE): One progress record per card
- `user_id` (uuid, FK): Owner; denormalized for RLS
- `ease_factor` (float, default 2.5): SM-2 Ease Factor (difficulty factor), range [1.3, ∞]
  - Represents how easy the card is relative to average (2.5 = average)
  - Decreases with "Again" responses (-0.2), increases with "Easy" responses (+0.1)
- `interval` (int, default 0): Days until next review
  - Initial: 0 (card is new)
  - After Good: 1 (first rep), 3 (second rep), then ease_factor * previous_interval
  - After Again: reset to 1 (retry tomorrow)
- `repetitions` (int, default 0): Count of successful reviews in current sequence
  - Increments on Good/Easy/Hard; resets to 0 on Again
  - Used in SM-2 formula to determine interval multiplier
- `next_review` (timestamp, default now): When card is due for review
  - Calculated as: today + interval days
  - Query: "give me cards WHERE next_review <= current_date" (due today/overdue)
- `last_reviewed` (timestamp, nullable): When user last studied this card (for analytics)
- `last_quality` (int, nullable): Previous quality rating (0-5) for debugging/audit
- `created_at`, `updated_at` (timestamps): Audit trail

**Validation Rules**:
- `ease_factor`: ≥ 1.3 (cannot go below minimum; enforced by CHECK constraint & SM-2 logic)
- `interval`: ≥ 0 (non-negative; cannot review in past)
- `repetitions`: ≥ 0 (non-negative count)
- `last_quality`: NULL or in [0, 1, 2, 4, 5] (valid SM-2 quality values)

**Relationships**:
- One-to-one with `cards` (unique card_id; deletes cascade when card deleted)
- Many-to-one with `profiles` (user owns many progress records)

**Access Control**:
- RLS: `user_id = auth.uid()` (only owner can read/update)

**Performance Considerations**:
- Index on `next_review` for fast "due today" queries: `SELECT * FROM card_progress WHERE next_review <= now() AND user_id = auth.uid()`
- Index on `user_id` for all user-scoped queries

---

## State Transitions

### Card Lifecycle State Machine

```
┌─────────────────────┐
│ New Card            │
│ interval=0          │
│ repetitions=0       │
│ next_review=today   │
│ ease_factor=2.5     │
└──────────┬──────────┘
           │
    User Studies & Responds
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌────────┐  ┌──────────┐
│ Again  │  │ Good/   │
│ (Q=0,1)│  │ Easy    │
│        │  │ (Q=4,5) │
└────┬───┘  └────┬─────┘
     │           │
Reset:          Advance:
- interval=1   - interval=new_interval
- rep=0        - repetitions+1
- EF↓          - EF↑ (if Q=5)
     │           │
     └─────┬─────┘
           ▼
    ┌─────────────────┐
    │ Reviewed Card   │
    │ (next_review    │
    │  in future)     │
    └─────────────────┘
           │
         (Wait until next_review date)
           │
           ▼ (Due for Review)
    ┌──────────────────┐
    │ Cycle repeats    │
    └──────────────────┘
```

### SM-2 State Transitions (Quality Feedback)

| Quality | Meaning | Repetitions Δ | Interval Change | EF Change | Next Action |
|---------|---------|---------------|-----------------|-----------|-------------|
| 0 or 1 | Again | → 0 (reset) | → 1 day | - 0.20 | Retry tomorrow |
| 2 | Hard | + 1 | × 1.2 | - 0.14 | Slight increase |
| 4 | Good | + 1 | × EF (or 1 if rep=0, 3 if rep=1) | no change | Normal progress |
| 5 | Easy | + 1 | × EF × 1.3 (bonus multiplier) | + 0.10 | Accelerated progress |

---

## TypeScript Type Definitions

```typescript
// types/database.ts (auto-generated from Supabase schema + custom)

// Auto-generated from Supabase CLI
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      decks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          color_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          color_code?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          color_code?: string
          created_at?: string
          updated_at?: string
        }
      }
      cards: {
        Row: {
          id: string
          deck_id: string
          user_id: string
          front: string
          back: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          deck_id: string
          user_id: string
          front: string
          back: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          deck_id?: string
          user_id?: string
          front?: string
          back?: string
          created_at?: string
          updated_at?: string
        }
      }
      card_progress: {
        Row: {
          id: string
          card_id: string
          user_id: string
          ease_factor: number
          interval: number
          repetitions: number
          next_review: string
          last_reviewed: string | null
          last_quality: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          card_id: string
          user_id: string
          ease_factor?: number
          interval?: number
          repetitions?: number
          next_review?: string
          last_reviewed?: string | null
          last_quality?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          card_id?: string
          user_id?: string
          ease_factor?: number
          interval?: number
          repetitions?: number
          next_review?: string
          last_reviewed?: string | null
          last_quality?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Custom domain types (in same file or separate)
export interface Profile {
  id: string
  email: string
  full_name: string | null
  created_at: string
}

export interface Deck {
  id: string
  user_id: string
  title: string
  description: string | null
  color_code: string
  created_at: string
  updated_at: string
  card_count?: number // Computed when needed
  due_today?: number  // Computed when needed
  new_count?: number  // Computed when needed
}

export interface Card {
  id: string
  deck_id: string
  user_id: string
  front: string      // Markdown
  back: string       // Markdown
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
  created_at: string
  updated_at: string
}

export interface StudySession {
  deckId: string
  due_cards: Card[]
  current_index: number
  responses: StudyResponse[]
  session_start: Date
}

export interface StudyResponse {
  card_id: string
  quality: 0 | 1 | 2 | 4 | 5
  timestamp: string // ISO 8601
}

export interface CardProgressUpdate {
  ease_factor: number
  interval: number
  repetitions: number
  next_review: string
  last_reviewed: string
  last_quality: number
}
```

---

## Database Indexes

**Performance Optimization**:

1. Primary Key Indexes (automatic):
   - `profiles.id`
   - `decks.id`
   - `cards.id`
   - `card_progress.id`

2. Foreign Key Indexes (recommended):
   - `decks.user_id` → enables fast `SELECT * FROM decks WHERE user_id = ?`
   - `cards.deck_id` → enables fast `SELECT * FROM cards WHERE deck_id = ?`
   - `cards.user_id` → supports RLS WHERE clause
   - `card_progress.user_id` → supports RLS WHERE clause

3. Query-Specific Indexes:
   - `card_progress.next_review` → enables fast "due today" queries: `SELECT * FROM card_progress WHERE next_review <= now()`

**Index Creation**:
```sql
CREATE INDEX idx_decks_user_id ON decks(user_id);
CREATE INDEX idx_cards_deck_id ON cards(deck_id);
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_card_progress_user_id ON card_progress(user_id);
CREATE INDEX idx_card_progress_next_review ON card_progress(next_review);
```

---

## Data Integrity & Constraints

**Foreign Key Cascades**:
- DELETE deck → cascade delete cards
- DELETE cards → cascade delete card_progress
- DELETE profiles → cascade delete decks, cards, card_progress

**Unique Constraints**:
- `profiles.email` (UNIQUE)
- `card_progress.card_id` (UNIQUE, one progress per card)

**Check Constraints**:
- `cards.front`: length > 0
- `cards.back`: length > 0
- `decks.color_code`: matches `^#[0-9a-fA-F]{6}$` (hex color)
- `card_progress.ease_factor`: ≥ 1.3
- `card_progress.interval`: ≥ 0
- `card_progress.repetitions`: ≥ 0
- `card_progress.last_quality`: NULL or in [0, 1, 2, 4, 5]

---

## Data Model Status

✅ **Complete**: All entities defined, relationships mapped, RLS policies specified, TypeScript interfaces defined.

**Next Phase**: API contracts (`contracts/` directory)

---

**Data Model Version**: 1.0.0 | **Date**: 2026-04-16 | **Status**: Ready for implementation
