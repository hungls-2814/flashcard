# Quickstart Guide: Flashcard Mastery Development

**Purpose**: Get the Flashcard Mastery app running locally in 15 minutes  
**Target**: Developers new to the project  
**Date**: 2026-04-16

---

## Prerequisites

Before starting, ensure you have:
- **Node.js**: 18.0.0 or higher (check: `node --version`)
- **npm**: 9.0.0 or higher (check: `npm --version`)
- **Git**: Latest version (check: `git --version`)
- **Text Editor**: VS Code, Zed, or similar
- **Supabase Account**: Free tier at https://supabase.com

---

## Part 1: Clone & Setup (5 minutes)

### 1.1 Clone the Repository

```bash
git clone https://github.com/your-org/flashcard-mastery.git
cd flashcard-mastery
```

### 1.2 Install Dependencies

```bash
npm install
```

**Output**: Should see `added XXX packages` without errors.

### 1.3 Verify TypeScript & Build

```bash
npm run build
```

**Expected**: Build succeeds with no errors (warnings are OK).

---

## Part 2: Supabase Setup (5 minutes)

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Name: "flashcard-mastery-dev"
5. Password: Generate strong password (save this)
6. Region: Choose closest to your location
7. Click "Create new project" (wait 2-5 minutes for setup)

### 2.2 Get Credentials

Once project is ready:

1. Navigate to **Settings** → **API**
2. Copy these values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY` (backend only, keep secret)

### 2.3 Create `.env.local` File

In the project root, create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-key-here
```

**⚠️ Important**: Never commit `.env.local` to Git. It's already in `.gitignore`.

### 2.4 Initialize Supabase Locally (Optional)

If you want to run Supabase locally:

```bash
npm install -g supabase
supabase init
supabase start
```

For MVP development, cloud Supabase is simpler.

---

## Part 3: Database Schema (3 minutes)

### 3.1 Run Migrations

Open Supabase dashboard → **SQL Editor** → **Create a new query**

Paste and run the SQL from `/migrations/001_init_auth_profiles.sql`:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own profile" ON profiles
  FOR ALL
  USING (id = auth.uid());

-- Verify
SELECT * FROM profiles;
```

Repeat for `/migrations/002_init_decks_cards.sql` and `/migrations/003_init_card_progress.sql`.

### 3.2 Verify Schema

In Supabase dashboard → **Table Editor**, you should see:
- `auth.users` (auto-created)
- `profiles`
- `decks`
- `cards`
- `card_progress`

All with RLS enabled (lock icon visible).

---

## Part 4: Generate TypeScript Types (2 minutes)

### 4.1 Install Supabase CLI

```bash
npm install -g supabase
```

### 4.2 Generate Types

```bash
supabase gen types postgresql --local > src/types/database.ts
```

Or if using cloud Supabase:

```bash
supabase gen types postgresql --project-id your-project-id > src/types/database.ts
```

### 4.3 Verify

Open `src/types/database.ts` and confirm you see TypeScript interfaces for all 5 tables.

---

## Part 5: Run Dev Server (2 minutes)

### 5.1 Start the Dev Server

```bash
npm run dev
```

**Output**:
```
> flashcard-mastery@0.1.0 dev
> next dev

▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.5s
```

### 5.2 Open in Browser

Navigate to: **http://localhost:3000**

You should see the landing page.

---

## Part 6: Test the Full Flow (2 minutes)

### 6.1 Sign Up

1. Click "Get Started" or navigate to `/signup`
2. Enter email: (anything@example.com)
3. Enter password: (any password, ≥8 chars)
4. Click "Sign Up"

**Expected**: Redirected to `/dashboard` (empty state)

### 6.2 Create First Deck

1. Click "+ Create Deck"
2. Title: "Spanish Vocab"
3. Description: "Learning Spanish words"
4. Color: Pick a color (default blue OK)
5. Click "Create"

**Expected**: Deck appears in dashboard with "0 due today" and "0 new"

### 6.3 Add First Card

1. Click on "Spanish Vocab" deck
2. Click "+ Add Card"
3. Front: "Hello in Spanish"
4. Back: "Hola"
5. Click "Add Card"

**Expected**: Card appears in deck

### 6.4 Start Study Session

1. Navigate back to deck
2. Click "Study" button
3. Card flip animation should show front: "Hello in Spanish"
4. Click card to reveal back: "Hola"
5. Click "Good"

**Expected**: SM-2 calculation runs, next card loads (or "All caught up!" if only one card)

### 6.5 Verify Database

Check Supabase dashboard → **Table Editor**:
- `card_progress` table should have one row with interval > 0 (should be 3 for "Good" on first rep)

---

## Troubleshooting

### Issue: "Error: NEXT_PUBLIC_SUPABASE_URL is not set"

**Solution**: Check `.env.local` exists in project root with correct URLs.

### Issue: RLS Policy Error in Logs

**Solution**: Verify all RLS policies are created for each table (check Part 3.2).

### Issue: Card flip animation choppy/slow

**Solution**: 
- Make sure you're on a modern browser (Chrome 88+, Safari 14+)
- Check DevTools Performance tab for frame drops
- This is normal on first run; production builds are faster

### Issue: TypeScript Errors in `src/types/database.ts`

**Solution**: Re-run Supabase type generation:
```bash
supabase gen types postgresql > src/types/database.ts
```

### Issue: "Session not recognized" during login

**Solution**: 
- Clear browser cookies for localhost:3000
- Check that Supabase Auth is enabled (Settings → Auth → Email)
- Check .env.local has correct `NEXT_PUBLIC_SUPABASE_URL`

---

## Common Commands

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format

# Generate TypeScript types from Supabase
supabase gen types postgresql > src/types/database.ts

# View PostgreSQL logs
supabase logs postgres
```

---

## Project Structure Overview

```
flashcard-mastery/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/login        # Login page
│   │   ├── (protected)/        # Protected routes (require auth)
│   │   ├── dashboard/          # Home page (deck list)
│   │   ├── study/[deckId]/     # Study session page
│   │   └── middleware.ts       # Auth middleware
│   ├── components/             # React components
│   │   ├── study/              # Study session components
│   │   ├── deck/               # Deck management components
│   │   └── common/             # Shared components
│   ├── lib/
│   │   ├── sm2.ts              # SM-2 algorithm logic
│   │   ├── supabase/           # Supabase clients
│   │   └── validators/         # Zod schemas
│   ├── types/
│   │   └── database.ts         # Generated Supabase types
│   ├── actions/                # Next.js Server Actions
│   └── styles/
│       └── globals.css         # Tailwind CSS
├── tests/                      # Test files
├── .env.local                  # Environment variables (local only)
├── package.json
└── tsconfig.json
```

---

## Next Steps After Quickstart

1. **Explore the codebase**: 
   - Start with `src/app/layout.tsx` to understand page structure
   - Check `src/lib/sm2.ts` to understand the algorithm

2. **Write a test**:
   - Open `tests/unit/sm2.test.ts`
   - Run: `npm test -- sm2.test.ts`

3. **Try the study session**:
   - Add 5+ cards to a deck
   - Run multiple study sessions
   - Verify intervals increase with "Good" responses

4. **Read the implementation plan**:
   - See [plan.md](plan.md) for full development roadmap
   - 8 phases, clear deliverables

5. **Ask questions**:
   - Check [research.md](research.md) for technical decisions
   - Review [data-model.md](data-model.md) for schema details
   - See `contracts/` folder for API specifications

---

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **TypeScript Docs**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/
- **SM-2 Algorithm**: https://www.supermemo.com/en/archives1990-2015/english/ol/beginning.html

---

## Development Workflow

**Typical day**:
1. Run `npm run dev` in one terminal
2. Write code in editor
3. Dev server hot-reloads automatically
4. Test in browser (http://localhost:3000)
5. Run `npm test` to verify tests pass
6. Commit code: `git commit -am "feat: description"`

**Before merging**:
1. `npm run lint` - fix any lint errors
2. `npm run build` - ensure production build succeeds
3. `npm test` - all tests passing
4. Create pull request

---

## Tips for Success

✅ **DO**:
- Commit .env.local to .gitignore (already done)
- Use TypeScript strict mode (already enabled)
- Test on mobile (use DevTools device emulation)
- Write tests alongside code

❌ **DON'T**:
- Don't edit `.env.local` credentials in version control
- Don't use `any` type in TypeScript
- Don't modify `src/types/database.ts` by hand; regenerate from Supabase
- Don't bypass RLS policies for testing

---

**Quickstart Status**: ✅ Ready to develop | **Last Updated**: 2026-04-16

**Next**: Run `npm run dev` and start building! 🚀
