# Network Service Module (NS1-NS8)

**Trigger:** the tool is a hosted or remote service (SaaS, PaaS, cloud API).

Hosted services add operational concerns a local library never has. Errors arrive over the network, limits are enforced remotely, and the agent can't inspect anything it isn't explicitly told. This module contains one MUST gate (NS1) and one Critical criterion (NS2). Together they are the difference between an agent that recovers from problems and one that gives up, or worse, retries destructively.

Criterion IDs reference the [Zaira Standard v0.9](https://zairalabs.ai/standard/v0.9).

---

## NS1. Error Response Quality & Structure (MUST, Critical ×2)

**Goal:** every error gives the agent enough structured information to diagnose the problem, decide retryability, and attempt recovery without a human.

**What good looks like:** JSON errors with machine-readable codes at minimum. RFC 9457 Problem Details (`type`, `title`, `status`, `detail`) with field-level validation errors and a per-error `doc_url` in the middle. Retryability booleans, `retry_after_seconds`, suggested alternatives, and a hierarchical taxonomy (Stripe's type → code → decline_code) at the strong end.

**How to get there:** when an agent hits an error it picks one of three moves: retry, try something different, or give up. Your error body determines which. Error quality is most of the difference: research on autonomous error recovery showed 89.68% success against a 32.76% baseline, driven almost entirely by the quality of error information available to the agent. The floor items first: no HTML error pages, no bare "Something went wrong," no silent failures. Then one error envelope everywhere, a machine-readable `code` distinct from the HTTP status, and for validation failures, name the field and the constraint and report *all* violations at once. One-at-a-time reporting turns one fix into five round trips. Stripe's hierarchy plus `doc_url` per error type is the reference implementation to study.

**Trade-offs:** restructuring a live API's error bodies is a breaking change for anyone parsing the old shape. Additive enrichment (keep old fields, add structured ones) gets most of the value without the break. Full migration belongs at a version boundary (PI12).

**Verify:** deliberately trigger each error class: bad auth, malformed body, missing field, nonexistent resource, rate limit. Check every response for structure, code, and recovery information. This is one of the most directly testable criteria in the standard.

---

## NS2. Rate Limit Communication (SHOULD, Critical ×2)

**Goal:** limits are visible before they're hit, and machine-actionable when they are.

**What good looks like:** `Retry-After` on 429s at minimum. `X-RateLimit-Remaining`, `-Limit`, and `-Reset` on *every* response, with scope declared (per-key? per-endpoint? global?), in the middle. Batch endpoints and per-operation cost metadata at the strong end.

**How to get there:** limits are fine. Invisible limits are the problem. Agents operate at machine speed and burn allocations in seconds when nothing tells them to pace. Headers on every response, not just 429s, let agents self-throttle before the wall. A specific `Retry-After` turns a 429 from a failure into a scheduling instruction. Security scans consistently find rate limiting absent from the overwhelming majority of MCP servers, so this is a low bar to clear visibly.

**Trade-offs:** essentially none. Headers are additive metadata with no breaking-change surface. The only work is plumbing the limiter's state into the response path.

**Verify:** `curl -si <endpoint> | grep -i ratelimit` on a normal response. Then exceed a limit and confirm the 429 carries `Retry-After` with a real value.

---

## NS3. Health & Status Communication (SHOULD, Standard ×1)

**Goal:** an agent can programmatically answer "is this service up, and should I wait or move on?"

**What good looks like:** a `/health` endpoint returning JSON up/down at minimum. Component-level status and `Retry-After` on 503s in the middle. Per-dependency status and pre-signaled maintenance at the strong end.

**How to get there:** an HTML status page is invisible to an agent mid-workflow. Ship a JSON health endpoint (the IETF `application/health+json` draft is a reasonable shape), return component-level detail as your architecture allows, and put `Retry-After` on 503s so outages become wait instructions rather than dead ends.

**Trade-offs:** health endpoints leak topology information. Coarse public granularity plus fine authenticated granularity is a reasonable split.

**Verify:** `curl -s <base>/health` returns parseable JSON that distinguishes healthy from degraded.

---

## NS4. Audit & Observability (SHOULD, Standard ×1)

**Goal:** interactions are logged with enough detail to answer, after the fact, "what did the agent do, and as whom?"

**What good looks like:** request logging with key identification at minimum. Correlation IDs, sensitive-data redaction, and agent-versus-human distinction in the middle. OpenTelemetry-compatible traces, immutable audit logs, and delegation-chain logging at the strong end.

**How to get there:** the near-term wins are correlation IDs (echo one per request; this also helps agents reference failures when reporting to humans) and audit logs the *customer* can query via API, not just your ops team. Agent-versus-human distinction pairs with AU4's identity work. If agents authenticate distinctly, your logs get this for free.

**Trade-offs:** deep observability is infrastructure spend. For an early-stage service, correlation IDs plus accessible logs is the right scope. OpenTelemetry integration can wait for operational maturity.

**Verify:** make an API call, then locate it in the customer-accessible audit trail. Confirm secrets don't appear in log output.

---

## NS5. Test/Sandbox Environment Support (SHOULD, Standard ×1)

**Goal:** agents can develop and validate against your service without touching anything real.

**What good looks like:** a test mode at minimum. A separate sandbox with behavioral simulation whose responses identify themselves as test-mode in the middle. Structurally distinct keys (`sk_test_` versus `sk_live_`), separate URLs, full simulation, and time control at the strong end.

**How to get there:** the load-bearing design choice is structural distinction. If test and live credentials look alike, agents will mix them, and every such mix is an incident. Prefixed keys (Stripe's pattern) make confusion detectable at the string level. Separate base URLs make it detectable at the network level. Test-mode markers in responses make it detectable at every step. Simulation fidelity comes after distinction: the sandbox should exhibit failures (declines, bounces, quota errors), not just successes, because error handling is what needs testing most.

**Trade-offs:** sandbox fidelity is an ongoing engineering commitment. Every product feature needs a sandbox counterpart or agents discover the difference in production. Budget for it as part of feature work, not as a one-time build.

**Verify:** obtain test credentials, confirm they're structurally distinguishable from live ones, exercise a failure scenario in the sandbox, and check that responses carry a test-mode indicator.

---

## NS6. Environment Separation (SHOULD, Standard ×1)

**Goal:** development, staging, and production are architecturally distinct. Separate credentials, separate URLs, environment identified in responses.

**What good looks like:** distinct credentials per environment with the environment indicated in API responses in the middle. Environment-specific URLs, database branching, and a promotion workflow (dev → staging → prod) at the strong end.

**How to get there:** the documented agent catastrophes (production databases wiped, fabricated data to cover tracks) share one root cause. The agent had production access because no separate environment existed. Credentials that only work in their own environment make cross-environment mistakes structurally impossible rather than procedurally discouraged. Add an environment field to API responses so an agent can always confirm where it's operating before it mutates anything.

**Trade-offs:** none philosophical. This is standard operational hygiene that agents raise the stakes on. The cost is infrastructure work if environments are currently entangled.

**Verify:** attempt a staging-credential call against production. It must fail. Check responses for an environment indicator.

---

## NS7. Asynchronous Operation Support (MAY, Standard ×1)

**Goal:** long-running operations return immediately with a durable handle instead of blocking. A blocked call at timeout becomes a retry, and a retry becomes a duplicate.

**What good looks like:** 202 plus a job ID on some operations at minimum. A consistent async pattern with polling status and `estimated_seconds` in the middle. Full lifecycle states, webhook plus polling, and progress reporting at the strong end.

**How to get there:** identify every operation that can exceed about 5 seconds under real load and give it the 202 pattern: immediate response, durable job ID, status endpoint with defined states (working → completed, failed, or cancelled). Pair with idempotency keys (WO3) so the timeout-retry path is harmless even when it happens.

**Trade-offs:** this is a MAY criterion with an explicit carve-out. If all operations complete in under 5 seconds, fast synchronous responses are the correct design and score adequately as-is. Don't build job infrastructure a fast API doesn't need.

**Verify:** run your slowest operation against realistic data volume. If it can block past timeout windows, it needs the async path.

---

## NS8. Data Portability & Pricing Transparency (MAY, Standard ×1)

**Goal:** an agent can determine what things cost, what's been consumed, and whether data can be extracted. Programmatically, not from marketing pages.

**What good looks like:** published pricing and manual export at minimum. An export API, unit costs, a usage API, and billing alerts in the middle. Machine-readable pricing, real-time usage, spending-limit APIs, and cost estimation before provisioning at the strong end.

**How to get there:** agents can't parse "Contact Sales" and can't click dashboard export buttons. The moves: a structured pricing page (tables with explicit unit costs beat marketing prose), a usage and consumption API, and a bulk export API in standard formats (CSV, JSON, Parquet). The export API does double duty as the continuity evidence B13 wants for commercial tools.

**Trade-offs:** pricing transparency is a business decision before it's an engineering one. Enterprise deal-desk pricing can't always be a static table. Publish what's publishable (self-serve tiers, unit rates) and keep it structured. This is a MAY criterion, and partial coverage honestly presented is fine.

**Verify:** starting from the API docs alone, determine the cost of a concrete operation and export a dataset without touching the dashboard.
