# Programmatic Interface Module (PI1-PI16)

**Trigger:** the tool exposes an API (REST, GraphQL, gRPC), SDK, or MCP server.

Everything an agent sees from your interface (every tool description, schema, and response) occupies space in a finite context window. The research consensus is unambiguous: less is more. Fewer tools, tighter schemas, smaller outputs, and more precise names each measurably improve agent success. Description quality is, across 13+ independent studies, the single most impactful factor of all.

This module contains three of the standard's five MUST gates: PI1, PI2, and PI15. In a Zaira evaluation those are binary. Failing any one of them blocks a certifiable outcome regardless of total score. Address them first.

Criterion IDs reference the [Zaira Standard v0.9](https://zairalabs.ai/standard/v0.9).

---

## PI1. Interface Reference Completeness (MUST, Critical ×2)

**Goal:** an agent can use every documented method or endpoint without guessing. Parameters, types, constraints, and what comes back.

**What good looks like:** more than 80% of methods with request and response examples and documented parameter constraints. The strong end is 100% coverage including edge cases and error scenarios per endpoint.

**How to get there:** if you have an OpenAPI spec, completeness is auditable. Lint it for missing descriptions, examples, and response schemas. If you don't, writing one is usually the highest-leverage move in this module: it feeds docs, SDK generation (PI13), and schema validation (PI4) at the same time. For MCP servers, the same bar applies to tool definitions.

**Trade-offs:** for tools with both a REST API and an MCP server, the standard evaluates the *primary* interface's coverage for this gate (your documented recommended integration path). A thinner secondary interface hurts PI9, not this gate. So don't withhold an MCP server out of fear its docs lag your API docs. Do state which interface is primary.

**Verify:** count documented versus shipped endpoints. For a sample of endpoints, confirm parameters carry types, constraints, and at least one realistic example.

---

## PI2. Tool/Endpoint Description Quality (MUST, Critical ×2)

**Goal:** descriptions tell an agent what each tool or endpoint does, when to use it, when *not* to use it, and what the output looks like.

**What good looks like:** specific descriptions with when-to-use guidance and typed, exampled parameters. The strong end adds when-NOT-to-use, realistic inline examples, enum values, and documented return formats.

**How to get there:** audit every description against four questions. What does it do? When should an agent pick it? When shouldn't it? What comes back? "Gets data" restates the name and fails all four. The when-NOT-to-use line is the highest-value addition: it's what stops an agent from picking `search_orders` when it needed `search_customers`. Anthropic's engineering team reported spending more time on tool descriptions than on the prompt itself, and 97% of MCP tool descriptions in the wild have at least one defect. The bar for standing out is low.

**Trade-offs:** none. This is prose in a schema file, deployable without a breaking change, and the cheapest MUST gate to fix.

**Verify:** read each description cold and answer the four questions from it alone. For MCP, connect and read the definitions an agent actually receives. They sometimes differ from the docs.

---

## PI3. Tool Count & Surface Area Management (SHOULD, Critical ×2)

**Goal:** the number of tools exposed at once stays within what agents select from reliably.

**What good looks like:** 5-15 focused tools designed around user outcomes. Larger catalogs managed through dynamic discovery or deferred loading rather than exposed flat.

**How to get there:** tool selection accuracy runs above 90% with fewer than 30 tools and deteriorates steadily past 100; in one production catalog of 584 tools, routing accuracy dropped 16 to 23 percentage points across frontier models. The failed pattern is the intuitive one: mirror the REST API, one tool per endpoint. Block's Linear integration did this with more than 30 tools, one per endpoint, and was rebuilt as two outcome-oriented tools. Group by intent. One `manage_subscription` handling create, update, cancel, and status beats four siblings. For genuinely large catalogs, deferred loading (start small, fetch more on demand) improved accuracy from 49% to 74% while cutting context consumption 85%.

**Trade-offs:** consolidation changes the interface for existing consumers, including humans. It's an API design decision, not a rename. If your REST API must stay wide, the MCP layer is where consolidation is cheap, because MCP tools don't have to mirror endpoints.

**Verify:** count the tools an agent sees on connect. Over 30 with no grouping or discovery mechanism is the problem zone.

---

## PI4. Input Schema Design (SHOULD, Critical ×2)

**Goal:** the schema prevents the most common agent failure class, parameter errors, before execution.

**What good looks like:** strict schemas with enums for constrained fields, three or fewer nesting levels, documented properties. The strong end is flat top-level primitives, `additionalProperties: false`, `strict: true` compatibility, and schemas under 500 tokens per tool.

**How to get there:** parameter mistakes (wrong values, wrong types, missing params) are the top agent failure type, and the schema is the defense. Concretely: enums for anything with a finite value set, `additionalProperties: false` everywhere, and flatten. One study measured a 47% improvement from flattening parameter spaces alone. Document formats and defaults per property. Note that OpenAI's `strict` mode only enforces a schema that is already tight. A loose schema can't be rescued by the caller.

**Trade-offs:** tightening a schema on a live API can reject requests that previously slid through. Sequence it with a version boundary (PI12) or a deprecation window.

**Verify:** send a request with a misspelled optional parameter. A strict schema rejects it loudly. A loose one silently ignores it, which is how agents burn twenty minutes on a typo.

---

## PI5. Output Quality & Token Efficiency (SHOULD, Standard ×1)

**Goal:** responses are high-signal and bounded. They inform the agent without flooding its context.

**What good looks like:** pagination with cursor metadata (`has_more`, `next_cursor`), compact summaries, semantic identifiers, filtering. The strong end adds concise modes, a defined `outputSchema`, and response sizes bounded by default.

**How to get there:** context overflow is the most common measured failure mode for agents on real tasks, accounting for 35.6% of Claude Sonnet 4 failures on SWE-bench Pro, and one MCP server in the wild averaged 557K tokens per response. Paginate by default: first page plus cursor, never the whole dataset. Add filtering parameters so agents can ask narrower questions. Offer a concise mode returning computed summaries instead of raw records. The extreme version of that pattern cut 1.17M tokens to about 1K.

**Trade-offs:** default pagination is a behavior change for existing consumers expecting full lists. Version it, or make bounded behavior the default only for new interface versions.

**Verify:** call your list endpoints against a large dataset and measure response tokens. Confirm cursor metadata appears and a bound exists.

---

## PI6. Response Envelope Consistency (SHOULD, Standard ×1)

**Goal:** every endpoint returns the same structural shape, so an agent that learned one response has learned them all.

**What good looks like:** one envelope, one naming convention (snake_case or camelCase, never mixed), null fields present as `null` for scalars or `[]` for collections rather than omitted. The strong end enforces this with linting and guarantees type stability.

**How to get there:** define the envelope once, then lint the OpenAPI spec in CI (Spectral does this well). Hunt for the two agent-killers: fields that vanish when null (agents read absence as "field doesn't exist") and type instability, where a field is sometimes a string and sometimes an array. Agents write code against the first shape they see.

**Trade-offs:** normalizing legacy endpoints is breaking-change work. Batch it into a version boundary. New endpoints should never add inconsistency; that part is free.

**Verify:** diff response shapes across five or six endpoints. Check a null-heavy record for omitted fields.

---

## PI7. Naming & Namespacing (SHOULD, Standard ×1)

**Goal:** names are predictable, distinctive, and collision-resistant in a world where an agent may hold tools from many services at once.

**What good looks like:** service-prefixed snake_case (`stripe_create_charge`, `github_list_issues`), self-descriptive and pattern-consistent across the catalog.

**How to get there:** 775 tools in the MCP ecosystem share identical names across servers. "search" alone appears in 32. An agent holding three tools called `search` guesses. Prefix with your service name, use snake_case consistently, and make the name alone convey the action (verb_noun).

**Trade-offs:** renaming deployed tools breaks existing integrations. Treat it as a versioned change with aliases during the window. New tools cost nothing to name well.

**Verify:** list your tool names stripped of context. Could someone infer each one's function? Would any collide with a generic name another service plausibly uses?

---

## PI8. Behavioral Metadata & Annotations (SHOULD, Standard ×1)

**Goal:** machine-readable declarations of what each tool does to the world (read, write, destroy, retry-safe, external-facing), so runtimes can make safety decisions before the call.

**What good looks like:** all four MCP annotations (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`) set accurately on every tool. The strong end adds output annotations, risk ratings, and HTTP method semantics that match actual behavior.

**How to get there:** set all four on every tool. An unannotated tool is indistinguishable from an unannotated destructive tool, and cautious runtimes treat it accordingly. ChatGPT gates confirmation dialogs on these annotations, and OpenAI's Apps SDK requires them and rejects mislabels. Accuracy is the hard part. Annotations are safety declarations, and a `destructiveHint: false` on a deleting tool is worse than no annotation.

**Trade-offs:** none for honest annotations. This is metadata, not behavior change. The only cost is the audit to make sure they're true.

**Verify:** cross-check each tool's annotations against what its implementation actually does, especially anything that deletes or mutates.

---

## PI9. MCP Implementation Quality (MAY, Standard ×1)

**Goal:** if an MCP server exists, it's a well-designed one. The standard also creates a directional incentive to have one.

**What good looks like:** 5-20 outcome-oriented tools (not API mirroring), accurate annotations, read/write separation, documented auth. The strong end adds deferred loading, safety-tiered tools, a read-only mode, and maintenance in step with product releases.

**How to get there:** an MCP server done well is mostly the disciplines of PI2, PI3, PI4, and PI8 applied to one artifact. Design tools around what agents accomplish, not around your endpoint list. Separate read-only from mutating tools, and consider omitting destructive operations from the MCP surface entirely (interface exclusion; see WO1). Ship it under your verified org and version it with the product.

**Trade-offs:** know the scoring shape. This is a MAY criterion. Tools without an MCP server score 0 on it but can still do well overall; at the standard's top band, that zero has to be absorbed by excellence elsewhere. A *bad* MCP server is worse than none. It fails agents in production and it scores like it. Build it when you can maintain it.

**Verify:** connect with an MCP client. Count tools, read descriptions and annotations, attempt auth from the docs alone.

---

## PI10. Programmatic Setup / Time to First API Call (SHOULD, Critical ×2)

**Goal:** once credentials exist, an agent reaches its first successful API call in minutes, without a dashboard.

**What good looks like:** 2-5 minutes and a single environment variable, sandbox usable immediately, clear misconfiguration errors. The strong end is under 2 minutes with zero-config basic usage and programmatic project setup.

**How to get there:** walk the path from "credentials in hand" to "first 200 response" and remove every dashboard-only step. Project creation, API enablement, and webhook registration should all be possible via API. Make the sandbox work with credentials alone. Credential *acquisition* friction is AU1's territory; this criterion measures everything after.

**Trade-offs:** dashboard-only gates are sometimes deliberate (fraud checks, approval workflows). Where one must exist, make it once per account rather than once per project, and document it so agents know to hand off to a human rather than retry.

**Verify:** time it. Fresh credentials to first successful call, following only the docs, touching nothing but a terminal.

---

## PI11. API Workflow Coverage (SHOULD, Standard ×1)

**Goal:** the workflows people actually do are completable entirely through the API, with no "then go click the dashboard" step in the middle.

**What good looks like:** more than 80% of common workflows API-complete, with any dashboard-only steps documented. The strong end is 100%.

**How to get there:** enumerate your top ten user workflows and walk each one API-only. Every dashboard-only step you find is a wall an agent hits at full speed. Prioritize by workflow frequency, and document the walls you haven't yet removed. A known wall an agent can route around (by asking its human) beats an undocumented one it discovers by failing.

**Trade-offs:** full coverage of admin and config surface can be a long tail of low-traffic endpoints. Cover the workflows that matter and document the rest.

**Verify:** execute the top three workflows end-to-end using only the API.

---

## PI12. Versioning & API Stability (SHOULD, Standard ×1)

**Goal:** the API changes on a schedule consumers can see coming, with machine-readable deprecation signals.

**What good looks like:** explicit versioning, a documented deprecation policy, `deprecated: true` in specs, 6+ month windows. The strong end adds `Sunset` headers and previous versions maintained for 12+ months.

**How to get there:** pick a versioning scheme and state the deprecation policy. Mark deprecated operations in the OpenAPI spec, so agents reading the spec see it, and emit `Sunset` and `Deprecation` headers at runtime, so agents calling the endpoint see it. Both channels matter. An agent's stale training data may not know about the spec change, but the header arrives with every response.

**Trade-offs:** maintaining old versions has real cost. The commitment length should follow your consumers' upgrade reality, not the gradient's top line.

**Verify:** deprecated endpoints emit runtime signals, the policy is published, and the last breaking change followed it.

---

## PI13. SDK Availability & Quality (SHOULD, Standard ×1)

**Goal:** official SDKs exist in the languages agents write most, and they stay in sync with the API.

**What good looks like:** official, typed, idiomatic SDKs in two or more major languages. The strong end is four or more languages, generated from the OpenAPI spec, released in lockstep with the API.

**How to get there:** Python and TypeScript first; they dominate agent-generated code. Generation from your OpenAPI spec (Stainless, Fern, openapi-generator) keeps SDKs current without per-language teams and makes the spec (PI1) the single source of truth. Types matter doubly for agents. They're the compile-time feedback loop that catches generated-code errors in milliseconds.

**Trade-offs:** a generated-but-current SDK usually beats a handcrafted-but-stale one for agent purposes. Idiomatic polish matters more for human adoption. Choose based on who's consuming.

**Verify:** the SDK's latest release covers the current API surface, the types are real (not riddled with `any`), and the SDK quickstart runs.

---

## PI14. Agent Protocol Availability (SHOULD, Standard ×1)

**Goal:** at least one high-quality programmatic path for agent interaction exists. A well-designed REST API, an MCP server, or both.

**What good looks like:** a documented REST API with OpenAPI spec and SDKs, or an official MCP server with documented auth and core coverage. The strong end is both, or one executed exceptionally.

**How to get there:** this criterion rewards quality over channel count. A Stripe-quality REST API with no MCP server can sit at the top of the gradient. If you have a good API, an MCP server is mostly packaging (see PI9). If you have neither, start with the API. It's the foundation the MCP layer and SDKs are generated from.

**Trade-offs:** don't ship a second interface at half quality to check a box. One excellent interface beats two mediocre ones, and the standard is written to agree.

**Verify:** covered by the PI1 and PI9 checks. Spec quality on one side, MCP quality on the other.

---

## PI15. Input Sanitization & Injection Resistance (MUST, Standard ×1)

**Goal:** evidence exists that inputs are sanitized and injection is defended against, through schema design, security infrastructure, documented practices, and architecture.

**What good looks like:** strict schemas with type checking, parameterized queries documented, a WAF or CDN in front of the API. The strong end adds `additionalProperties: false` across all endpoints, allowlist validation, security testing in CI, and third-party assessment.

**How to get there:** 43% of surveyed MCP servers carry command injection vulnerabilities. This gate exists because the baseline is that bad. Your defenses are the classical ones: strict input schemas (PI4 work counts here), parameterized queries everywhere (never string concatenation), and a WAF or CDN in front. Then *document* your input validation practices. Evaluation of this criterion reads passive signals (schemas, infrastructure, documentation, Scorecard), not live attack probes, so undocumented practice is invisible practice.

**Trade-offs:** none. This is table-stakes security that predates agents. The only new part is making the evidence legible.

**Verify:** grep for query string concatenation. Confirm schema strictness on every mutating endpoint. Confirm the security practices page mentions input handling.

---

## PI16. Prompt Injection Resistance (SHOULD, Standard ×1)

**Goal:** the tool's own surface doesn't become an injection vector into the agents that use it.

**What good looks like:** minimal description surface, structured outputs with clear field boundaries, response size limits. The strong end documents explicit mitigations and separates untrusted content from control flow.

**How to get there:** the attack shape, demonstrated at high success rates against major coding agents, is this: untrusted content flows through your tool's output into an agent's context and gets interpreted as instructions. Defenses on your side: keep tool descriptions concise and self-contained, with no narrative and no references to other tools an attacker could exploit. Structure outputs as JSON with clear field boundaries so data can't masquerade as instructions. Bound response sizes. Where your tool relays third-party content (search results, user records, emails), put it in clearly marked data fields and say in the description that its content is untrusted.

**Trade-offs:** you cannot fix the consuming agent's prompt hygiene. The criterion measures your side of the boundary: not amplifying, not becoming the vector.

**Verify:** review descriptions for narrative and cross-references. Confirm relayed untrusted content is structurally fenced in output.
