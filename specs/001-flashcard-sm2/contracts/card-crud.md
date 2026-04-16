# API Contract: Card CRUD Operations

**Purpose**: Create, read, update, and delete flashcards within a deck  
**Status**: Final

---

## Endpoints

### 1. Create Card

**Method**: POST  
**Path**: `/api/cards`  
**Authentication**: Required

**Request Body**:
```typescript
{
  deck_id: string      // UUID of parent deck
  front: string        // Markdown content, 1-5000 chars
  back: string         // Markdown content, 1-5000 chars
}
```

**Response** (201 Created):
```typescript
{
  id: string
  deck_id: string
  user_id: string
  front: string
  back: string
  created_at: string
  updated_at: string
}
```

**Errors**:
- 400: Invalid input (Zod validation)
- 401: Unauthorized
- 403: RLS denied (deck doesn't belong to user)
- 500: Database error

---

### 2. List Cards in Deck

**Method**: GET  
**Path**: `/api/cards?deckId={deckId}`  
**Authentication**: Required

**Response** (200 OK):
```typescript
{
  cards: Array<{
    id: string
    deck_id: string
    front: string
    back: string
    created_at: string
    updated_at: string
  }>
  count: number
}
```

**Errors**:
- 401: Unauthorized
- 403: RLS denied
- 404: Deck not found

---

### 3. Update Card

**Method**: PUT  
**Path**: `/api/cards/{cardId}`  
**Authentication**: Required

**Request Body**:
```typescript
{
  front?: string    // Update front (optional)
  back?: string     // Update back (optional)
}
```

**Response** (200 OK):
```typescript
{
  id: string
  deck_id: string
  front: string
  back: string
  updated_at: string
}
```

**Errors**:
- 400: Invalid input
- 401: Unauthorized
- 403: RLS denied
- 404: Card not found

---

### 4. Delete Card

**Method**: DELETE  
**Path**: `/api/cards/{cardId}`  
**Authentication**: Required

**Response** (204 No Content or 200 with confirmation):
```typescript
{
  success: true
  card_id: string
  deleted_at: string
}
```

**Errors**:
- 401: Unauthorized
- 403: RLS denied
- 404: Card not found

---

## Implementation Notes

- All operations include `user_id` validation via RLS
- Delete cascades to `card_progress` automatically
- `updated_at` timestamp auto-set by database trigger
- Zod validation enforces front/back length constraints

---

**Status**: ✅ Final | **Date**: 2026-04-16
