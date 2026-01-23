# Backend & Data Architecture Strategy

## Overview

This application will use a **Hybrid Data Approach**:
1.  **Public Data (Recipes)**: Fetched from [TheMealDB API](https://www.themealdb.com/api.php).
2.  **Private Data (User Info, Likes, My Recipes)**: Stored in **Supabase** (PostgreSQL).
3.  **Authentication**: Managed by **Supabase Auth**.

---

## 1. Authentication (Supabase Auth)

We will implement Email/Password authentication first. Social providers (Google, Apple, Facebook) can be enabled later in the Supabase dashboard without major code changes.

### Implementation Steps
1.  Install `@supabase/supabase-js` and `react-native-url-polyfill`.
2.  Create a `lib/supabase.ts` client helper.
3.  Update `(auth)/sign-up.tsx` and `(auth)/sign-in.tsx` to use Supabase API.
4.  Use `Expo Router` to protect the `(tabs)` group (redirect to `(auth)` if no session).

---

## 2. Database Schema (Supabase PostgreSQL)

We need the following tables to manage user-specific data.

### `profiles` (extends auth.users)
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | uuid | References `auth.users.id` (Primary Key) |
| `username` | text | Unique user handle |
| `full_name` | text | Display name |
| `avatar_url` | text | Path to image in Storage |
| `updated_at` | timestamp | |
*(Trigger required to auto-create profile on user signup)*

### `recipes` (User created recipes)
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `user_id` | uuid | References `profiles.id` |
| `title` | text | |
| `instruction` | text | |
| `ingredients` | jsonb | Array of `{name, amount, image}` |
| `image_url` | text | |
| `created_at` | timestamp | |

### `likes` (Bookmarks)
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key |
| `user_id` | uuid | References `profiles.id` |
| `recipe_id` | text | ID from TheMealDB (external) OR our UUID |
| `is_external` | boolean | `true` if TheMealDB, `false` if local `recipes` table |
| `created_at` | timestamp | |

---

## 3. Data Fetching Strategy

### A. TheMealDB (Public Recipes)
Use `fetch` or a lightweight wrapper to hit endpoints:
-   Search: `www.themealdb.com/api/json/v1/1/search.php?s=Arrabiata`
-   Lookup: `www.themealdb.com/api/json/v1/1/lookup.php?i=52772`
-   Filter: `www.themealdb.com/api/json/v1/1/filter.php?c=Seafood`

### B. Supabase (User Data)
Use the Supabase JS client directly or wrap with **TanStack Query (React Query)** for caching and state management (Recommended).

### Unified Recipe Interface
Since we have two sources (API & DB), we should create a TypeScript interface that unifies them for the UI:
```typescript
interface Recipe {
  id: string;
  title: string;
  image: string;
  source: 'themealsdb' | 'user';
  // ... other fields
}
```

---

## 4. Implementation Checklist (File by File)

### Phase 1: Setup
- [ ] **Install Dependencies**: `npm install @supabase/supabase-js @tanstack/react-query`
- [ ] **Configure Client**: Create `lib/supabase.ts` with API URL and Anon Key.
- [ ] **Context**: Create `ctx/AuthContext.tsx` to provide session state.

### Phase 2: Authentication Screens
- [ ] **`app/(auth)/sign-up.tsx`**: Connect form to `supabase.auth.signUp()`.
- [ ] **`app/(auth)/sign-in.tsx`**: Connect form to `supabase.auth.signInWithPassword()`.
- [ ] **`app/_layout.tsx`**: Add an `Auth Check` (useEffect) to redirect users based on session.

### Phase 3: Data Integration
- [ ] **`app/(tabs)/index.tsx`**: Fetch "Trending" from TheMealDB.
- [ ] **`app/(tabs)/recipes.tsx`**: Fetch search results from TheMealDB.
- [ ] **`app/(tabs)/likes.tsx`**: Fetch from Supabase `likes` table -> then fetch details from API if needed.
- [ ] **`app/(tabs)/create.tsx`**: Form to insert into Supabase `recipes` table.
- [ ] **`app/recipe/[id].tsx`**: Logic to check if `id` is UUID (Supabase) or Int (TheMealDB) and fetch accordingly.

---

## 5. Storage (Images)
- Create a Supabase Storage Bucket named `avatars` (public) and `recipe-images` (public).
- Use `expo-image-picker` to select photos.
- Upload to Supabase Storage and save the URL in the DB.
