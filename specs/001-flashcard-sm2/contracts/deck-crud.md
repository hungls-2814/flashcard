# API Contract: Deck CRUD Operations

**Purpose**: Create, read, update, and delete flashcard decks  
**Status**: Final

---

## Endpoints

### 1. Create Deck

**Method**: POST  
**Path**: `/api/decks`  
**Authentication**: Required

**Request Body**:
```typescript
{
  title: string                           // Required, 1-200 chars
  description?: string                    // Optional, 0-1000 chars
  color_code?: string                     // Optional, default #3b82f6, format #RRGGBB
}
```

**Response** (201 Created):
```typescript
{
  id: string
  user_id: string
  title: string
  description: string | null
  color_code: string
  created_at: string
  updated_at: string
}
```

**Errors**:
- 400: Invalid input (Zod validation)
- 401: Unauthorized
- 500: Database error

---

### 2. List All Decks

**Method**: GET  
**Path**: `/api/decks`  
**Authentication**: Required

**Response** (200 OK):
```typescript
{
  decks: Array<{
    id: string
    user_id: string
    title: string
    description: string | null
    color_code: string
    created_at: string
    updated_at: string
    card_count: number              // Computed count of cards
    due_today: number               // Computed count of due cards
    new_count: number               // Computed count of new cards (never reviewed)
  }>
  count: number
}
```

**Errors**:
- 401: Unauthorized
- 500: Database error

---

### 3. Get Single Deck

**Method**: GET  
**Path**: `/api/decks/{deckId}`  
**Authentication**: Required

**Response** (200 OK):
```typescript
{
  id: string
  user_id: string
  title: string
  description: string | null
  color_code: string
  created_at: string
  updated_at: string
  card_count: number
  due_today: number
  new_count: number
}
```

**Errors**:
- 401: Unauthorized
- 403: RLS denied
- 404: Deck not found

---

### 4. Update Deck

**Method**: PUT  
**Path**: `/api/decks/{deckId}`  
**Authentication**: Required

**Request Body**:
```typescript
{
  title?: string                  // Update title (optional)
  description?: string            // Update description (optional)
  color_code?: string             // Update color (optional)
}
```

**Response** (200 OK):
```typescript
{
  id: string
  title: string
  description: string | null
  color_code: string
  updated_at: string
}
```

**Errors**:
- 400: Invalid input
- 401: Unauthorized
- 403: RLS denied
- 404: Deck not found

---

### 5. Delete Deck

**Method**: DELETE  
**Path**: `/api/decks/{deckId}`  
**Authentication**: Required

**Response** (204 No Content or 200 with confirmation):
```typescript
{
  success: true
  deck_id: string
  deleted_at: string
  cards_deleted: number           // How many cards cascaded
}
```

**Cascading Delete**:
- Deleting deck deletes all cards
- Deleting cards deletes all card_progress records

**Errors**:
- 401: Unauthorized
- 403: RLS denied
- 404: Deck not found

---

## Implementation Notes

- All operations enforce RLS (`user_id = auth.uid()`)
- Computed fields (card_count, due_today, new_count) calculated server-side
- `updated_at` auto-set by database trigger
- Color validation: must match hex pattern `^#[0-9a-fA-F]{6}$`
- Cascade deletes prevent orphaned records

---

**Status**: ✅ Final | **Date**: 2026-04-16
