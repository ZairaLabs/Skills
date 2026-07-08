# Domain Module: Databases (DB1-DB4)

**Applies to:** databases, data platforms, ORMs.

Agents provision and operate databases at remarkable scale already (Neon reported over 80% of new databases on their platform created by agents), and agent-generated SQL fails at measurably higher rates than human-written SQL. The design goal across this module: make experimentation cheap and mistakes reversible, so the error rate is survivable.

Criterion IDs reference the [Zaira Standard v0.9](https://zairalabs.ai/standard/v0.9).

---

## DB1. Safe Experimentation (SHOULD, Standard ×1)

**Goal:** an agent can experiment with schema changes, query tuning, and migrations without any path to harming production data.

**What good looks like:** point-in-time recovery at minimum. Read-only replicas and snapshot or clone capability in the middle. Instant copy-on-write branching (under one second) with reset-to-parent and schema-only modes at the strong end.

**How to get there:** the branching pattern (Neon: copy-on-write branches in about 500ms, `reset_from_parent` for do-overs) is the domain's answer to WO1. The branch is disposable, production is not, and an agent that can create a branch in under a second has no reason to touch the real thing. If branching isn't in your architecture's reach, fast snapshots and clones are the intermediate rung, read-only replicas give exploration a safe default connection, and PITR is the floor that turns "permanent" into "recoverable."

**Trade-offs:** copy-on-write branching is an architectural property, not a feature toggle. For engines without it, the honest guidance is fast clones plus PITR plus read-only defaults, which delivers most of the safety at higher latency.

**Verify:** create an isolated environment (branch, clone, or snapshot) via API and time it. Run a destructive statement inside it, then confirm production is untouched and the environment resets cleanly.

---

## DB2. Schema Introspection Quality (SHOULD, Standard ×1)

**Goal:** an agent can discover the schema (tables, types, relationships, constraints) programmatically and token-efficiently.

**What good looks like:** standard discovery (`information_schema`, `SHOW TABLES`) at minimum. Relationship and constraint metadata plus HTTP-accessible schema in the middle. Semantic catalogs with natural-language column descriptions and token-efficient representations at the strong end.

**How to get there:** agents generating SQL against a guessed schema produce the failures you'd expect. Beyond baseline `information_schema`: expose foreign keys and constraints, which are the difference between syntactically valid and semantically correct joins. Make schema reachable over HTTP, not only from inside a SQL session, because agents often plan before connecting. Use `COMMENT ON` for natural-language table and column descriptions. Comments are PI2's description-quality logic applied to data, and they flow into every introspection-based tool downstream. Mind token efficiency: a full dump of a 400-table schema blows the context budget (PI5's concern), so support scoped introspection, one table or one subgraph of relationships at a time.

**Trade-offs:** none structural. This is mostly exposing what the engine already knows. Semantic comments are an editorial investment that pays off across every agent that ever touches the database.

**Verify:** starting from credentials alone, programmatically produce one table's columns, types, and foreign keys. Check whether human-authored descriptions exist anywhere machine-readable.

---

## DB3. Query Interface Safety (SHOULD, Standard ×1)

**Goal:** the query interface is defensive about agent-generated SQL. Parameterized by default, validated before execution, guarded against the classic catastrophes.

**What good looks like:** parameterized query support at minimum. Parameterization enforced by default, row-level security available, and explain-or-validate before execution in the middle. RLS on by default, cost estimation, read-only exploration modes, and guards against `DELETE` or `UPDATE` without `WHERE` at the strong end.

**How to get there:** parameterized queries as the default path, because string-concatenated SQL accepted from an agent is an injection engine (PI15 at the data layer). A validation or EXPLAIN step so agents can check plans and cost before executing (WO2's dry-run pattern; cost estimates catch the accidentally unbounded scan). A read-only query mode for exploration sessions. And the blunt but effective guardrail: reject, or require explicit override for, `DELETE` and `UPDATE` without a `WHERE` clause. Row-level security contains the blast radius of whatever gets through.

**Trade-offs:** RLS-by-default changes the development experience for humans too, and debugging RLS policies has a real learning curve. It's the right default for multi-tenant and agent-heavy platforms. "Available and documented" is the honest middle for others.

**Verify:** attempt a bare `DELETE FROM <table>` without `WHERE` through the agent-facing path and observe what stands in the way. Confirm a query can be explained or validated without executing.

---

## DB4. Connection Management (MAY, Standard ×1)

**Goal:** agents can connect from where they actually run, including serverless and edge environments where raw TCP isn't available.

**What good looks like:** managed pooling at minimum. An HTTP/REST query path alongside TCP with serverless-compatible drivers in the middle. Auto-generated REST APIs (PostgREST-style), WebSocket transaction support, edge drivers, and scale-to-zero with sub-second cold starts at the strong end.

**How to get there:** agent-written applications deploy disproportionately to serverless and edge platforms (Vercel, Cloudflare Workers) where TCP connections don't exist. A TCP-only database is unusable from the most common deployment target of agent-generated code. The pieces: an HTTP query path, drivers built for connection-per-request environments, and managed pooling so a thousand short-lived function invocations don't exhaust connections.

**Trade-offs:** a MAY criterion, and an architectural one. Retrofitting HTTP access onto a TCP-native engine is a proxy-layer project, which is what the ecosystem's pooling proxies are. Recommend proportionally. Essential for platforms courting the serverless world, optional for OLAP warehouses that agents reach through BI layers.

**Verify:** execute a query over HTTP from a serverless-like environment with no persistent socket. Check documented cold-start and pooling behavior under connection churn.
