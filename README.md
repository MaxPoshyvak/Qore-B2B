<div align="center">

# Qore

### Next-Generation Restaurant Operating System & B2B SaaS Platform

<p align="center">
  <b>A comprehensive, high-throughput operating system for HoReCa featuring real-time collaborative QR dining, concurrency-safe split billing, kitchen display systems (KDS), and cost-optimized culinary AI.</b>
</p>

[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)](https://turbo.build)
[![Bun](https://img.shields.io/badge/Bun-1.3.14-FBF0DF?style=for-the-badge&logo=bun&logoColor=black)](https://bun.sh)
[![Next.js](https://img.shields.io/badge/Next.js-15_App_Router-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![NestJS](https://img.shields.io/badge/NestJS-Backend_API-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_Zod-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4_Modern-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-7_PostgreSQL-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io)
[![Stripe](https://img.shields.io/badge/Stripe-Billing_&_Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com)

<br/>

[Overview](#overview) • [Architecture](#system-architecture) • [Core Capabilities](#core-capabilities) • [Tech Stack](#tech-stack) • [Monorepo Structure](#monorepo-structure) • [Getting Started](#getting-started) • [Engineering Highlights](#engineering-highlights)

<br/>

<a href="docs/assets/banner.svg">
  <img src="docs/assets/banner.svg" alt="Qore Platform Banner" width="100%" style="border-radius: 12px; border: 1px solid #1E293B;" />
</a>

</div>

---

## Overview

**Qore** is an enterprise-grade B2B SaaS platform engineered specifically for modern restaurants, bistros, bars, and multi-unit hospitality operators. Traditional Point-of-Sale (POS) systems are monolithic, expensive, and introduce unnecessary friction during ordering and bill settlement. 

Qore eliminates hospitality bottlenecks by providing:
1. **Zero-App Guest Onboarding:** Diners scan a dynamic table QR code to view menus, customize dishes with modifiers, collaborate on a shared cart, and settle payments immediately.
2. **Interactive Split-Bill Engine:** Guests choose how they want to pay—full amount, split equally, or item-by-item—with built-in concurrency controls preventing double charges.
3. **Low-Latency Kitchen Operations:** Digital KDS (Kitchen Display System) tracks ticket lifecycles in real time with audio cues and tokenized access.
4. **Sub-Cent AI Workflows:** Automated dish generation and real-time cart upselling powered by OpenRouter models with an in-memory SHA-256 cache that keeps LLM compute costs below **~$0.00015 per query**.
5. **Subscription Infrastructure:** Self-serve Stripe billing (Free, Pro, Business) with customer portal integrations, automated lifecycle webhooks, and proration handling.

---

## Visual Showcase

<div align="center">
  <table>
    <tr>
      <td width="50%" align="center">
        <b>Real-Time Guest Menu &amp; Collaborative Cart</b><br/><br/>
        <a href="docs/assets/guest-menu-preview.svg">
          <img src="docs/assets/guest-menu-preview.svg" alt="Guest Menu Preview" width="100%" />
        </a>
        <p align="left"><sub>Dynamic table QR resolution, live multi-guest cart synchronization, modifier customization, and instant split-bill triggers.</sub></p>
      </td>
      <td width="50%" align="center">
        <b>Subscription Tiers &amp; Billing Management</b><br/><br/>
        <a href="docs/assets/billing-dashboard.svg">
          <img src="docs/assets/billing-dashboard.svg" alt="Billing Dashboard Preview" width="100%" />
        </a>
        <p align="left"><sub>Multi-tier Stripe subscription management, one-click upgrade checkouts, billing portal sessions, and proration protection.</sub></p>
      </td>
    </tr>
  </table>
</div>

---

## System Architecture

The following diagram illustrates the unidirectional data flow and modular boundary separation between Qore client applications, API gateways, external service providers, and persistent storage:

```mermaid
flowchart TD
    subgraph Clients["Frontend Clients (Next.js 15 App Router)"]
        GuestApp["Guest Experience<br/>• Dynamic Table QR (/t/:token)<br/>• Collaborative Cart<br/>• Split-Bill Modal"]
        OwnerApp["Owner Dashboard<br/>• Menu & Modifiers<br/>• Analytics & Feedbacks<br/>• Stripe Billing Tab"]
        KitchenApp["Kitchen Display (KDS)<br/>• Tokenized Access (/kds/:token)<br/>• Real-Time Ticket Board"]
    end

    subgraph API["Backend Gateway (NestJS Monolith)"]
        Router["HTTP / REST Controller Layer<br/>(Global Prefix: /api)"]
        Guards["Security & Guards<br/>• JwtAuthGuard<br/>• ThrottlerGuard (Rate Limiting)<br/>• ZodValidationPipe"]
        
        subgraph Modules["Domain Modules"]
            OrdersMod["Orders & Cart Module<br/>(Live Table Sessions)"]
            PaymentsMod["Payments & Split-Bill Module<br/>(Concurrency Locks)"]
            BillingMod["Billing Module<br/>(Stripe Subscriptions)"]
            AiMod["AI Culinary Module<br/>(Prompt Templates & Parser)"]
            CacheService["UpsellCacheService<br/>(In-Memory SHA-256 Key Cache, 12h TTL)"]
        end
    end

    subgraph Storage["Persistent Storage & ORM"]
        Prisma["Prisma ORM Client"]
        Postgres[(PostgreSQL Database)]
    end

    subgraph External["External Cloud Integrations"]
        StripeAPI["Stripe API<br/>• Checkout Sessions<br/>• Billing Portal<br/>• Webhooks (rawBody verified)"]
        OpenRouter["OpenRouter / OpenAI<br/>• gpt-4o-mini Model"]
    end

    GuestApp -->|"REST Requests"| Router
    OwnerApp -->|"Authenticated REST"| Router
    KitchenApp -->|"Polling / SSE"| Router

    Router --> Guards
    Guards --> Modules

    OrdersMod --> Prisma
    PaymentsMod --> Prisma
    BillingMod --> Prisma

    PaymentsMod -->|"Create Checkout / PaymentIntent"| StripeAPI
    BillingMod -->|"Create Subscription / Portal"| StripeAPI
    StripeAPI -->|"Webhooks (stripe-signature)"| Router

    AiMod -->|"Cache Miss"| OpenRouter
    AiMod <-->|"Check / Store (12h TTL)"| CacheService

    Prisma <--> Postgres
```

---

## Core Capabilities

### 1. Frictionless Guest Experience
- **Contactless Dine-In (`/t/:qrToken`):** Tables have cryptographically signed QR tokens that immediately resolve the table number, venue theme, and active menu without requiring app store downloads or user registrations.
- **Collaborative Table Cart:** Multiple guests sitting at the same table can add items simultaneously. Each item preserves the guest's name and browser identifier (`guestSessionId`), enabling clear attribution.
- **Modifier Engine:** Deeply customizable dish configurations (e.g., choice of milk, temperature, add-ons) with strict min/max selection bounds and signed price deltas stored at order snapshot time.
- **Takeaway & Order-Ahead:** Built-in scheduling for customer pickups with automated preparation time windows.

### 2. Concurrency-Safe Split-Bill Engine
- **Three Settlement Modalities:**
  - **Pay in Full:** Traditional single-payer checkout for the entire table.
  - **Split Equally:** Splits the outstanding balance evenly among $N$ diners (2–8+) with automatic decimal rounding correction.
  - **Split by Item:** Diners selectively claim individual dishes from the table's active order.
- **Race Condition Prevention:** When a diner selects dishes to pay for in `Split by Item` mode, row-level reservation flags (`isLockedForPayment`, `lockedBySessionId`, `lockedAt`) lock those dishes. Other diners see them as "Being paid by another guest". If a payment session expires or is abandoned, an automatic TTL cleaner or `unlockItems` endpoint releases the items back to the pool.
- **Dynamic Tipping & Electronic Receipts:** Diners choose standard (0%, 10%, 15%, 20%) or custom tips before paying via Apple Pay, Google Pay, or Credit Card through Stripe Checkout, immediately receiving a downloadable branded digital receipt.

### 3. Cost-Optimized AI Engine
- **AI Dish Generator:** Generates production-ready menu items (title, description, category, allergens, and culinary notes) from simple natural language prompts in the exact language requested by the operator.
- **Smart Cart Upsell:** High-conversion recommendation engine that analyzes the items currently in a guest's cart and recommends complementary high-margin pairings (e.g., espresso with tiramisu, craft beer with truffle fries).
- **Sub-Cent Unit Economics:** Through structured prompts, JSON mode enforcement, and an in-memory SHA-256 key cache with a 12-hour TTL (`UpsellCacheService`), average prompt processing cost is reduced to **~$0.00015 per query**, with zero external API calls for repeated cart configurations.
- **Operator Review Digest:** Periodically summarizes customer sentiment and flags toxic feedback using natural language review auditing (`leo-profanity` + LLM analysis).

### 4. Enterprise Billing & Subscriptions
- **Three Service Tiers:**
  - **Free ($0/month):** Up to 10 tables, digital QR menu, live order dashboard.
  - **Pro ($29/month):** Unlimited tables, Interactive Split-Bill engine, Kitchen Display System (KDS), AI Smart Upsell.
  - **Business ($79/month):** Multi-venue hub, AI Chef Generator, custom themes, priority support.
- **Stripe Customer Portal:** In-app management for upgrading, downgrading, updating credit cards, or downloading VAT-compliant receipts.
- **Raw-Body Webhook Verification:** NestJS captures unparsed raw HTTP request buffers (`RawBodyRequest`) to verify cryptographic Stripe signatures, gracefully handling `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted`.

---

## Tech Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Monorepo** | [Turborepo](https://turbo.build/) | Latest | Multi-package pipeline caching & orchestration |
| **Runtime & PM** | [Bun](https://bun.sh/) | `1.3.14` | Fast package installation & script execution |
| **Frontend Framework** | [Next.js (App Router)](https://nextjs.org/) | `15+` | Server components, streaming UI, image optimization |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `v4` | Native spacing scale, zero arbitrary CSS, fluid typography |
| **UI & Motion** | [Framer Motion](https://www.framer.com/motion/) | `13.x` | Smooth drawer, modal, and state transitions |
| **Client State** | [Zustand](https://zustand.docs.pmnd.rs/) + [TanStack Query](https://tanstack.com/query) | `v5` | Local persistent cart sessions + optimistic server state |
| **Backend Framework** | [NestJS](https://nestjs.com/) | `11.x` | Structured modular enterprise API gateway |
| **Database ORM** | [Prisma](https://www.prisma.io/) | `7.10.x` | Type-safe queries, migrations, PostgreSQL adapter |
| **Validation** | [Zod](https://zod.dev/) + [nestjs-zod](https://github.com/StefanTerdell/nestjs-zod) | `v3 / v4` | Single source of truth for DTOs and client validation |
| **Payments** | [Stripe SDK](https://stripe.com/) | `22.x` | Subscriptions, PaymentIntents, Webhook handling |
| **AI Intelligence** | [OpenRouter](https://openrouter.ai/) / [OpenAI](https://openai.com/) | `gpt-4o-mini` | Cost-effective dish creation & contextual recommendations |

---

## Monorepo Structure

Qore is organized as an enterprise Turborepo monorepo with strict isolation between client applications, server domains, and shared packages:

```
qore-b2b/
├── apps/
│   ├── frontend/                 # Next.js 15 App Router client application
│   │   ├── src/
│   │   │   ├── app/              # App Router routes & layouts (public, auth, dashboard, kds)
│   │   │   ├── features/         # Feature-Sliced Design (FSD) domain modules
│   │   │   │   ├── public-menu/  # Guest QR menu, collaborative cart, split-bill modal
│   │   │   │   ├── dashboard/    # Owner administration, live orders, statistics
│   │   │   │   ├── dashboard-settings/ # Stripe billing, venue profile, KDS configuration
│   │   │   │   ├── landing/      # High-conversion public marketing pages
│   │   │   │   └── auth/         # NextAuth credentials authentication & registration
│   │   │   └── shared/           # Design system tokens, buttons, inputs, icons, typography
│   │   └── package.json
│   │
│   └── backend/                  # NestJS modular API server
│       ├── src/
│       │   ├── common/           # Guards (JWT, Public), decorators, interceptors, filters
│       │   ├── config/           # Validated environment schemas
│       │   ├── modules/
│       │   │   ├── ai/           # OpenRouter LLM service & UpsellCacheService
│       │   │   ├── billing/      # Stripe subscriptions, customer portal, webhooks
│       │   │   ├── payments/     # Split-bill orchestration & concurrency lock engine
│       │   │   ├── orders/       # Order creation, live status transitions, takeaway
│       │   │   ├── cart/         # Real-time multi-guest table cart sessions
│       │   │   ├── menu/         # Categories, items, modifiers, happy hours
│       │   │   ├── auth/         # JWT generation, email verification, password resets
│       │   │   └── prisma/       # Global Prisma database service
│       │   └── main.ts           # Bootstrapper with rawBody parsing & rate limiting
│       └── package.json
│
├── packages/
│   ├── types/                    # SINGLE SOURCE OF TRUTH: Shared TypeScript types & Zod schemas
│   │   ├── src/
│   │   │   ├── api/              # Standardized API response contracts (SuccessResponse<T>)
│   │   │   ├── billing/          # Stripe DTOs, plan definitions, pricing constants
│   │   │   ├── payments/         # Split bill payloads, payment verification contracts
│   │   │   ├── ai/               # Dish generator & upsell input/output Zod schemas
│   │   │   └── menu/             # Menu, modifiers, cart, and order models
│   │   └── package.json
│   │
│   └── database/                 # Prisma schema, migrations, and database client
│       ├── prisma/
│       │   └── schema.prisma     # Multi-tenant HoReCa relational data model
│       └── package.json
│
├── docs/                         # Documentation assets & architectural specifications
│   └── assets/                   # Vector banners, interface diagrams, and previews
│
├── turbo.json                    # Monorepo build and pipeline execution cache definitions
├── package.json                  # Root workspace configuration
└── bun.lock                      # Deterministic lockfile
```

---

## Getting Started

### Prerequisites
- **Runtime:** [Bun](https://bun.sh/) `v1.3.0` or higher
- **Node.js:** `v20.x` or higher (for Next.js / NestJS build steps)
- **Database:** PostgreSQL `v15+` instance (local or hosted via Supabase / Neon / Render)
- **External Accounts:** Stripe (test keys) & OpenRouter (optional, for AI features)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/MaxPoshyvak/Qore-B2B.git
cd Qore-B2B

# Install workspace dependencies with Bun
bun install
```

### 2. Configure Environment Variables

Copy the provided environment templates:

```bash
cp .env.example .env
cp apps/frontend/.env.example apps/frontend/.env.local
cp apps/backend/.env.example apps/backend/.env
```

Ensure the following minimal variables are set in `apps/backend/.env`:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/qore_db?schema=public"
JWT_SECRET="your-32-character-secret-signing-key"

# Stripe (Keys from dashboard.stripe.com/test)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_BUSINESS_PRICE_ID="price_..."

# AI (Optional)
OPENROUTER_API_KEY="sk-or-v1-..."
```

### 3. Synchronize Database Schema

Generate the Prisma Client and push the schema directly to your PostgreSQL database:

```bash
cd packages/database
bunx prisma db push
bun run generate
cd ../..
```

### 4. Run Development Environment

Start all applications (Next.js frontend + NestJS backend) concurrently with Turborepo:

```bash
bun run dev
```

The services will become available at:
- **Frontend Web Application:** [http://localhost:3000](http://localhost:3000)
- **Backend API Gateway:** [http://localhost:3001/api](http://localhost:3001/api)
- **Prisma Studio (Data GUI):** `cd packages/database && bunx prisma studio` (at [http://localhost:5555](http://localhost:5555))

### 5. Static Analysis & Production Build

```bash
# Typecheck all packages & apps
bun run --filter=frontend tsc --noEmit
bun run --filter=backend tsc --noEmit

# Production build
bun run build
```

---

## Engineering Highlights

### 1. Strict Feature-Sliced Design (FSD)
The frontend strictly adheres to FSD principles:
- **Cross-Feature Imports are Disallowed:** Features (such as `features/public-menu` and `features/dashboard`) can never import from each other. Shared utilities, UI tokens, and base components reside strictly within `shared/`.
- **Predictable State Colocation:** Each feature encapsulates its own API clients, React Query mutations, custom hooks, and presentation components.

### 2. Zod as Single Source of Truth
To eliminate duplicate types and runtime discrepancies between frontend and backend:
- All schema models are declared in `packages/types` using Zod.
- The **Frontend** consumes schemas with `@hookform/resolvers/zod` for zero-overhead form validation.
- The **Backend** consumes the identical schemas using `nestjs-zod` (`createZodDto`), guaranteeing identical validation rules across API boundaries without redundant decorators.

### 3. Touch Device & Mobile Optimization
- **Hover Isolation:** Mobile devices do not possess a true cursor hover state. All heavy hover animations (3D tilts, transforms, scales) are guarded behind desktop breakpoints (`md:hover:...`) and `@media (hover: hover)` rules to eliminate sticky UI states on smartphones.
- **Spacing Scale Discipline:** Arbitrary Tailwind brackets (e.g., `w-[140px]`) are prohibited in favor of native spacing tokens (e.g., `w-35`), minimizing bundle size and preserving typographic rhythm.

---

## License

This project is licensed under the [MIT License](LICENSE).

<div align="center">
  <sub>Built with care for the hospitality industry. Crafted by the Qore Engineering Team.</sub>
</div>
