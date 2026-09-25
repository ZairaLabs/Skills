# Question routing

This page maps common questions to Guide calls. Put the constraints in filters and
keep `query` to one or two core words, because every query word must match.
Category slugs are lowercase and hyphenated. `zaira_list_categories` (REST:
`GET /categories`) returns the current list.

Each REST path is relative to `https://zairalabs.ai/guide/api/v1`.

## Choosing a hosted service

| Question | MCP call | REST |
|---|---|---|
| "Which managed Postgres has a free tier and an official MCP server?" | `zaira_search_tools {category: "relational-database", artifactKind: "managed_service", hasFreeTier: true, mcpSupport: "official"}`, then the same filters with `category: "backend-platform"`, where Supabase lives | `GET /tools?category=relational-database&artifactKind=managed_service&hasFreeTier=true&mcpSupport=official`, then the same with `category=backend-platform` |
| "Auth provider with a free tier, SOC 2, and MCP support?" | `zaira_search_tools {category: "auth", hasFreeTier: true, compliance: "SOC2", mcpSupport: "official"}` | `GET /tools?category=auth&hasFreeTier=true&compliance=SOC2&mcpSupport=official` |
| "Transactional email with a free tier?" | `zaira_search_tools {category: "email", hasFreeTier: true}` | `GET /tools?category=email&hasFreeTier=true` |
| "Vector database I can self-host?" | `zaira_search_tools {category: "vector-database", selfHostable: true}` | `GET /tools?category=vector-database&selfHostable=true` |
| "Where can I host a Next.js app at the edge?" | `zaira_search_tools {category: "paas", edgeCompatible: true}`, then `zaira_get_tool {slug: "nextjs"}` and read `worksWith` | `GET /tools?category=paas&edgeCompatible=true` |
| "Clerk or Auth0 for this app?" | `zaira_compare_tools {slugs: ["clerk", "auth0"]}` | `GET /compare?tools=clerk,auth0` |

## Choosing a framework or dev tool

| Question | MCP call | REST |
|---|---|---|
| "Vitest or Jest for a new Vite project?" | `zaira_compare_tools {slugs: ["vitest", "jest"]}` | `GET /compare?tools=vitest,jest` |
| "TypeScript ORM that runs at the edge?" | `zaira_search_tools {category: "orm", language: "TypeScript", edgeCompatible: true}` | `GET /tools?category=orm&language=TypeScript&edgeCompatible=true` |
| "What are the alternatives to X?" | `zaira_get_tool {slug: "x"}` and read `alternatives` | `GET /tools/x/alternatives` |

## Lifecycle and "is it still…" checks

| Question | Where to look in the entry |
|---|---|
| "Is X still free?" | `pricingModel`, `hasFreeTier`, `minFreeTier`, `trialCredits`, and `lastVerified`. Link `pricingUrl`. |
| "Is X still open source? What's the license?" | `license`, and `artifactKind` (`open_source` or `managed_service`) |
| "Is X maintained?" | The Health section (recent commits and releases, bus factor, OpenSSF Scorecard). Also check for deprecated, archived, or end-of-life markers. |
| "Does X have an MCP server?" | `mcpSupport` (`official`, `community`, or `none`) and `mcpServerUrl`. A missing value means it hasn't been verified either way. |
| "Who owns X now?" | `vendor` |
| "What should I use instead of X?" | `alternatives`, which lists each alternative's category and reason |

## Neighboring categories

A product can sit in a broader category than the obvious one. When a filtered search
looks thin, try the neighbor.

| You searched | Also try |
|---|---|
| `relational-database` | `backend-platform`, for hosted backends built on Postgres such as Supabase |
| `paas` | `serverless` and `container` |
| `monitoring` | `analytics` and `security` |
| `key-value-store` | `backend-platform` and `realtime` |
| `ai-framework` | `ai-infra` and `llm-provider` |

## Slug conventions

- **Twin entries:** hosted and self-hosted versions are separate twins. `-cloud` is the
  managed service and `-oss` is self-hosted, for example `supabase-cloud` and
  `supabase-oss`, or `redis-cloud` and `redis-oss`. Pick the one that matches how the
  tool will run.
- **Single entries:** some vendors have only one entry: `stripe`, `auth0`, `firebase`,
  `twilio`, `pinecone`, and `algolia`.
- **Dots become hyphens or disappear:** Next.js is `nextjs` and Vue.js is `vuejs`.
- **Not found:** `zaira_get_tool` returns similar slugs when a slug isn't found. Try
  one of those before concluding the Guide doesn't cover the tool.

## When the Guide has no entry

Say so plainly: "The Zaira Guide doesn't cover X." Then check the vendor's own
pricing, license, and repository pages. Don't present remembered facts as current.
