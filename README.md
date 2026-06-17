# BNWEMS Web Frontend

Web application for the **Binh Nguyen Wedding Event Management System (BNWEMS)** for Admin and Manager roles. Built with Next.js 16 (App Router) + TypeScript + TailwindCSS v4 + Axios.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.x |
| Styling | TailwindCSS v4 |
| HTTP Client | Axios (with JWT interceptors) |
| State | React Context (AuthContext) |
| Testing | Jest + React Testing Library + jest-dom |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file and set the backend API URL
cp .env.example .env.local

# 3. Start development server
npm run dev
```

The app will run at `http://localhost:3000`.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run test` | Run all Jest tests |
| `npm run test:coverage` | Run tests with coverage report |

## Project Structure

```
web-frontend/
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── (auth)/login/        # Login page
│   │   ├── (admin)/dashboard/   # Admin dashboard
│   │   └── (manager)/orders/    # Manager order management
│   ├── components/
│   │   └── ui/                  # Reusable UI: Button, Input, Badge
│   ├── services/
│   │   ├── api.ts               # Axios base instance + interceptors
│   │   ├── auth.service.ts      # Auth API calls
│   │   ├── user.service.ts      # User management API calls
│   │   └── order.service.ts     # Order & equipment API calls
│   ├── context/
│   │   └── AuthContext.tsx      # Global JWT & user state
│   └── hooks/
│       ├── useAuth.ts           # Auth context hook
│       └── usePagination.ts     # Pagination state hook
└── __tests__/                   # Jest tests
    ├── components/Button.test.tsx
    ├── services/auth.service.test.ts
    └── hooks/useAuth.test.ts
```

## Running Tests

```bash
npm run test
```
