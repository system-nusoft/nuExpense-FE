# nuExpense Frontend

AI-powered expense tracking app frontend built with Next.js 16, TypeScript, and Tailwind CSS.

## Local Setup

### Prerequisites

- Node.js 20.9+
- npm 9+
- nuExpense backend running at `http://localhost:3001`

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env.local

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable               | Required | Default                      | Description                            |
|------------------------|----------|------------------------------|----------------------------------------|
| `NEXT_PUBLIC_API_URL`  | Yes      | `http://localhost:3001/api`  | Backend API base URL                   |

## Pages / Routes

| Route              | Description                                              |
|--------------------|----------------------------------------------------------|
| `/`                | Redirects to `/dashboard`                               |
| `/login`           | Login page                                               |
| `/signup`          | Sign-up page                                             |
| `/onboarding`      | Two-step onboarding (currency + default categories)      |
| `/dashboard`       | Overview: scan CTA, recent expenses, monthly stats       |
| `/scan`            | AI receipt scanner — upload/camera → analyze → review    |
| `/expenses`        | Paginated expense list with filters, edit, delete        |
| `/categories`      | Category management with create, edit, delete, reorder   |
| `/settings`        | Profile settings (name, home currency)                   |

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript** (strict mode)
- **Tailwind CSS v4** — utility classes only, no component libraries
- **Axios** — API client with token refresh interceptor

## Project Structure

```
nuExpense-FE/
├── app/
│   ├── (auth)/login/       # Login page
│   ├── (auth)/signup/      # Sign-up page
│   ├── (app)/              # Protected layout with Navbar
│   │   ├── dashboard/
│   │   ├── scan/
│   │   ├── expenses/
│   │   ├── categories/
│   │   ├── settings/
│   │   └── onboarding/
│   ├── layout.tsx          # Root layout (AuthProvider + Inter font)
│   └── page.tsx            # Redirects to /dashboard
├── components/
│   ├── auth/               # LoginForm, SignupForm
│   ├── expenses/           # ExpenseCard, ExpenseReviewForm, ExpenseFilters
│   ├── categories/         # CategoryListItem, CategoryForm
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Spinner.tsx
│   ├── Badge.tsx
│   ├── FileDropzone.tsx
│   └── Navbar.tsx
├── contexts/
│   └── AuthContext.tsx     # Auth state, login/signup/logout
├── lib/
│   ├── api.ts              # Axios instance with token interceptors
│   ├── auth.ts             # localStorage token helpers
│   └── services/
│       ├── auth.service.ts
│       ├── expenses.service.ts
│       └── categories.service.ts
├── types/
│   └── index.ts            # TypeScript interfaces
├── proxy.ts                # Next.js 16 proxy (auth route guard)
├── .env.local
└── .env.example
```

## Deployment on Vercel

1. Push this repo to GitHub
2. Import into [Vercel](https://vercel.com/new)
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` → your Railway/backend URL (e.g. `https://nuexpense-api.railway.app/api`)
4. Deploy

> Note: `NEXT_PUBLIC_API_URL` is embedded at build time, so set it before building.

## Notes

- **Next.js 16 breaking change**: `middleware.ts` is renamed to `proxy.ts` and the export function is named `proxy` (not `middleware`). This project already uses the new convention.
- Authentication uses localStorage tokens with an Axios interceptor for automatic token refresh on 401.
- The proxy (middleware) checks for a `nuexpense_access_token` cookie — you may want to also set a cookie on login for SSR-aware protection.
