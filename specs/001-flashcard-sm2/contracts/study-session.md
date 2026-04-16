# API Contract: Study Session Response (POST /api/study/respond)

**Runtime**: Edge  
**Purpose**: Process user quality feedback and calculate next review date using SM-2 algorithm  
**Status**: Final

---

## Endpoint Specification

### Request

**Method**: POST  
**Path**: `/api/study/respond`  
**Runtime**: Edge (Vercel Edge Functions / Cloudflare Workers)  
**Authentication**: Required (Supabase Auth session)  

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <session_token> (via Supabase session cookie)
```

**Request Body** (JSON):
```typescript
{
  card_id: string          // UUID of card being reviewed
  quality: 0 | 1 | 2 | 4 | 5  // SM-2 quality feedback (0=Again, 1=Hard, 2=Hard, 4=Good, 5=Easy)
  timestamp: string        // ISO 8601 when response was recorded (client-side)
}
```

**Request Body Schema** (Zod):
```typescript
import { z } from 'zod'

const StudyResponseSchema = z.object({
  card_id: z.string().uuid('Invalid card ID'),
  quality: z.enum(['0', '1', '2', '4', '5'])
    .transform(v => parseInt(v) as 0 | 1 | 2 | 4 | 5)
    .or(z.number().int().refine(v => [0, 1, 2, 4, 5].includes(v), 'Quality must be 0, 1, 2, 4, or 5')),
  timestamp: z.string().datetime('Invalid ISO 8601 timestamp'),
})
```

### Response

**Status Code**: 200 OK  
**Content-Type**: application/json  

**Response Body** (JSON):
```typescript
{
  success: true,
  updated_progress: {
    id: string                  // UUID of CardProgress record
    card_id: string            // UUID of card
    user_id: string            // UUID of user (for verification)
    ease_factor: number        // Updated EF (e.g., 2.5 → 2.6)
    interval: number           // Next interval in days
    repetitions: number        // New repetition count
    next_review: string        // ISO 8601 of next review date
    last_reviewed: string      // ISO 8601 when this update occurred
    last_quality: number       // Quality just submitted (0, 1, 2, 4, or 5)
  },
  next_card: {                 // null if no more due cards today
    id: string
    deck_id: string
    front: string              // Markdown text
    back: string               // Markdown text
    created_at: string
  } | null,
  session_status: {
    reviewed: number           // Cards reviewed in current session
    remaining: number          // Cards still due today
    session_complete: boolean  // true if reviewed all due cards
  },
  timestamp: string            // Server timestamp (for audit)
}
```

### Error Responses

**400 Bad Request** (Invalid input):
```json
{
  "error": "Invalid quality value",
  "code": "VALIDATION_ERROR",
  "details": "Quality must be one of: 0, 1, 2, 4, 5"
}
```

**401 Unauthorized** (Not authenticated):
```json
{
  "error": "Authentication required",
  "code": "AUTH_ERROR",
  "details": "session_token is missing or expired"
}
```

**403 Forbidden** (RLS policy denies access):
```json
{
  "error": "Access denied",
  "code": "RLS_ERROR",
  "details": "User does not have permission to update this card"
}
```

**404 Not Found** (Card doesn't exist):
```json
{
  "error": "Card not found",
  "code": "NOT_FOUND",
  "details": "card_id=<uuid> does not exist in user's decks"
}
```

**500 Internal Server Error** (SM-2 calculation failed):
```json
{
  "error": "Failed to update card progress",
  "code": "SM2_ERROR",
  "details": "Error during SM-2 calculation: <reason>"
}
```

---

## Implementation Flow

### 1. Authentication & Authorization

```typescript
// Edge runtime handler receives request
const request = new Request(...)
const authHeader = request.headers.get('Authorization')

// Supabase session is passed via cookie (managed by @supabase/ssr)
const supabase = createRouteHandlerClient()
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  return Response.json(
    { error: 'Unauthorized', code: 'AUTH_ERROR' },
    { status: 401 }
  )
}
```

### 2. Input Validation (Zod)

```typescript
const body = await request.json()
const parsed = StudyResponseSchema.parse(body)  // throws ZodError if invalid

// ZodError caught and returns 400 Bad Request
```

### 3. Fetch Current CardProgress

```typescript
const { data: card, error: cardError } = await supabase
  .from('cards')
  .select('*')
  .eq('id', parsed.card_id)
  .eq('user_id', user.id)
  .single()

if (!card) {
  return Response.json(
    { error: 'Card not found', code: 'NOT_FOUND' },
    { status: 404 }
  )
}

const { data: progress } = await supabase
  .from('card_progress')
  .select('*')
  .eq('card_id', parsed.card_id)
  .single()

// Progress may not exist yet (first review); initialize if needed
```

### 4. SM-2 Calculation

```typescript
import { updateCardProgress } from '@/lib/sm2'

const updated = updateCardProgress(progress, parsed.quality)

// updated = {
//   ease_factor: number
//   interval: number
//   repetitions: number
//   next_review: new Date(Date.now() + updated.interval * 86400000)
// }
```

### 5. Update Database

```typescript
const { data: updatedProgress, error: updateError } = await supabase
  .from('card_progress')
  .upsert({
    card_id: parsed.card_id,
    user_id: user.id,
    ease_factor: updated.ease_factor,
    interval: updated.interval,
    repetitions: updated.repetitions,
    next_review: updated.next_review,
    last_reviewed: new Date().toISOString(),
    last_quality: parsed.quality,
  })
  .select()
  .single()

if (updateError) {
  return Response.json(
    { error: 'Update failed', code: 'DATABASE_ERROR' },
    { status: 500 }
  )
}
```

### 6. Fetch Next Due Card

```typescript
// Get all remaining due cards for this deck (excluding just-reviewed card)
const { data: nextCard } = await supabase
  .from('cards')
  .select('*, card_progress(*)')
  .eq('deck_id', card.deck_id)
  .eq('user_id', user.id)
  .neq('id', parsed.card_id)
  .in('card_progress.next_review', [
    // PostgreSQL: filter where next_review <= today
    `<= ${new Date().toISOString()}`,
  ])
  .order('card_progress.next_review', { ascending: true })
  .limit(1)
  .single()

// If no remaining cards, nextCard = null → session_complete = true
```

### 7. Return Response

```typescript
return Response.json({
  success: true,
  updated_progress: updatedProgress,
  next_card: nextCard || null,
  session_status: {
    reviewed: session_state.reviewed + 1,
    remaining: remaining_count - 1,
    session_complete: remaining_count === 1,
  },
  timestamp: new Date().toISOString(),
})
```

---

## Performance Targets

- **Latency**: < 100ms (Edge Runtime, 50th percentile)
- **P99 Latency**: < 500ms (Edge Runtime, 99th percentile)
- **SM-2 Calculation**: < 1ms (pure JavaScript)
- **Database Operations**: < 50ms (Supabase, warm connection)

---

## Testing Strategy

### Unit Tests
- SM-2 calculation correctness for all 4 quality paths
- Zod schema validation (valid/invalid inputs)

### Integration Tests
- Full HTTP request → response flow
- Verify database state changes post-update
- Verify RLS blocks unauthorized access

### Contract Tests
- Input schema matches specification
- Output schema matches specification
- Error codes match specification
- HTTP status codes correct (200, 400, 401, 403, 404, 500)

### Performance Tests
- Measure latency locally with `wrangler`
- Load test: 100 concurrent requests
- Monitor Edge Runtime execution time in production

---

## Security Considerations

1. **Authentication**: Supabase session validated before processing
2. **Authorization**: RLS policy enforces user_id = auth.uid()
3. **Input Validation**: Zod schema catches malformed requests
4. **SM-2 Bounds**: Quality value restricted to enum [0, 1, 2, 4, 5]; mathematical bounds enforced in calculation
5. **Database Safety**: No raw SQL; parameterized queries via Supabase SDK
6. **Rate Limiting**: Implement at API gateway layer (Vercel or Cloudflare)

---

## Versioning & Backwards Compatibility

**Current Version**: 1.0.0  
**No prior versions** (first release)

**Future Compatibility**: 
- If adding new fields to request, add as optional with defaults
- If adding new fields to response, ensure client can ignore unknown fields

---

## Examples

### Example Request

```bash
curl -X POST https://localhost:3000/api/study/respond \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{
    "card_id": "550e8400-e29b-41d4-a716-446655440000",
    "quality": 4,
    "timestamp": "2026-04-16T14:30:00Z"
  }'
```

### Example Response (Success)

```json
{
  "success": true,
  "updated_progress": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "card_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "770e8400-e29b-41d4-a716-446655440002",
    "ease_factor": 2.5,
    "interval": 3,
    "repetitions": 2,
    "next_review": "2026-04-19T00:00:00Z",
    "last_reviewed": "2026-04-16T14:30:00Z",
    "last_quality": 4
  },
  "next_card": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "deck_id": "990e8400-e29b-41d4-a716-446655440004",
    "front": "What is the capital of France?",
    "back": "Paris",
    "created_at": "2026-04-15T10:00:00Z"
  },
  "session_status": {
    "reviewed": 3,
    "remaining": 2,
    "session_complete": false
  },
  "timestamp": "2026-04-16T14:30:00Z"
}
```

### Example Response (Last Card)

```json
{
  "success": true,
  "updated_progress": { ... },
  "next_card": null,
  "session_status": {
    "reviewed": 5,
    "remaining": 0,
    "session_complete": true
  },
  "timestamp": "2026-04-16T14:35:00Z"
}
```

### Example Response (Invalid Quality)

```json
{
  "error": "Invalid quality value",
  "code": "VALIDATION_ERROR",
  "details": "Quality must be one of: 0, 1, 2, 4, 5"
}
```

---

**Contract Status**: ✅ Final | **Date**: 2026-04-16 | **Next**: Implement Phase 3.5 (Study Session component)
