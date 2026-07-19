# Library Management System — Frontend Framework

React + Vite frontend for managing books, members, borrowings, and history.

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI | React 19, TypeScript |
| Build | Vite 7 |
| Routing | Wouter |
| Data fetching | TanStack React Query |
| API client | `@workspace/api-client-react` (auto-generated from OpenAPI) |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS 4, shadcn/ui components |
| Theme | next-themes (dark/light) |

## Project Structure

```
artifacts/library-management/
├── src/
│   ├── main.tsx              # App entry point
│   ├── App.tsx               # Router + providers
│   ├── index.css             # Global styles / theme tokens
│   │
│   ├── pages/                # Route-level screens
│   │   ├── Dashboard.tsx     # Overview stats, overdue, recent activity
│   │   ├── Books.tsx         # Book catalog list + add book
│   │   ├── BookDetail.tsx    # Single book + borrowing history
│   │   ├── Members.tsx       # Member list + enroll member
│   │   ├── MemberDetail.tsx  # Single member + loan history
│   │   ├── Borrowings.tsx    # Issue / return / fine management
│   │   └── not-found.tsx     # 404 page
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx # Shell: sidebar + main content
│   │   │   └── Sidebar.tsx   # Navigation links
│   │   ├── shared/
│   │   │   └── StatusBadge.tsx
│   │   └── ui/               # shadcn/ui primitives (Button, Table, Dialog…)
│   │
│   ├── hooks/                # useToast, useMobile
│   └── lib/                  # formatters, utils
│
├── public/                   # Static assets
├── vite.config.ts
└── package.json
```

## Routes (Pages)

| Path | Page | Purpose |
|------|------|---------|
| `/` | Dashboard | Stats, overdue items, recent activity, popular books |
| `/books` | Books | Search/filter catalog, add new books |
| `/books/:id` | BookDetail | View/edit/delete book, see circulation history |
| `/members` | Members | Search/filter patrons, enroll new members |
| `/members/:id` | MemberDetail | View/edit/delete member, see loan history |
| `/borrowings` | Borrowings | Issue loans, return books, waive fines, filter by status |

## Data Flow

```
Page Component
    ↓
useListBooks / useCreateBook / …   (from @workspace/api-client-react)
    ↓
TanStack React Query (cache + invalidation)
    ↓
fetch → /api/books, /api/members, /api/borrowings
    ↓
Express API Server → PostgreSQL
```

Each page uses generated hooks like:
- `useListBooks`, `useCreateBook`, `useUpdateBook`, `useDeleteBook`
- `useListMembers`, `useCreateMember`, `useUpdateMember`, `useDeleteMember`
- `useListBorrowings`, `useIssueBorrowing`, `useReturnBorrowing`, `useWaiveFine`
- `useGetDashboardStats`, `useGetOverdueBorrowings`, `useGetRecentActivity`

After mutations, pages call `queryClient.invalidateQueries()` to refresh lists.

## Sample Data (Backend Seed)

Run once to populate the database:

```bash
pnpm --filter db push    # create tables
pnpm --filter db seed    # insert sample data
```

**10 books** — Fiction, Fantasy, Sci-Fi, Non-Fiction, etc.  
**8 members** — active, suspended, and expired statuses  
**8 borrowings** — active, overdue, and returned records  

## Run the Frontend

```bash
# From project root (requires PORT and BASE_PATH env vars)
PORT=24648 BASE_PATH=/library-management/ pnpm --filter @workspace/library-management run dev
```

On Replit, the artifact config sets these automatically.

## Three Core Objectives

1. **Manage books & members** — CRUD on `/books` and `/members` pages  
2. **Issue & return books** — `/borrowings` page (Issue Loan + Reclaim buttons)  
3. **Borrowing history** — shown on BookDetail, MemberDetail, and Borrowings pages  
