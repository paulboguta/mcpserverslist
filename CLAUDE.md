# MCPServersList - Claude Code Memory

## Project Overview
A public, minimal-friction directory that lets AI-curious engineers and CTOs "discover all MCP servers". This is a lean, ad-free MVP focused on performance and SEO.

## Tech Stack
- Next.js 15 (App Router, RSC, Route Handlers)
- T3 OSS boilerplate (TypeScript, tRPC, Tailwind, shadcn/ui)
- Postgres + Drizzle ORM (hosted by Supabase)
- Cloudflare R2 (logo storage); `next/image` for delivery
- Clerk (admin-only auth)
- Vercel hosting (edge + node runtimes)
- Umami + PostHog (analytics)

## Performance Goals
- Time-to-interactive ≤ 1 s on desktop, ≤ 2 s on 4G mobile
- Lighthouse ≥ 95 mobile
- ≤ 85 kB JS shipped on first load

## Key Architecture
- Edge runtime with 86,400s revalidation for static content
- Full-text search using Postgres TSVECTOR
- Admin-only auth with Clerk
- Static generation for server detail pages
- Cloudflare R2 for logo storage

## Database Schema
### servers
- id, name, slug (unique), short_desc, long_desc, homepage_url, repo_url, docs_url
- logo_url, stars, last_commit, license, created_at, updated_at
- tsv (TSVECTOR for full-text search)

### categories
- id, name, slug (unique), sort_order

### servers_to_categories
- server_id FK, category_id FK (many-to-many)

## Current Status
Following the prompt plan in `.claude/prompt_plan.md` - currently on task 01_tooling_bootstrap.

## Development Commands
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run linting
- `pnpm type-check` - TypeScript checking

## Important Notes
- Revalidate cache using `revalidateTag('servers')` after admin mutations
- Logo images should be optimized (AVIF + immutable 1 year cache)
- All public pages use Edge runtime for performance
- Admin pages use Node runtime for database operations