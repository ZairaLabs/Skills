# Authentication Module (AU1-AU4)

**Trigger:** the tool requires credentials, API keys, OAuth, or any form of authentication.

Authentication is the most persistent unresolved problem in agent-tool interaction, and it behaves as a binary gate. A tool with perfect docs, a clean API, and structured errors is worth nothing to an agent that cannot authenticate. Most auth flows silently assume a human with a browser: redirects, approve buttons, CAPTCHAs, email links, SMS codes. An agent has none of these.

This module contains the standard's fifth MUST gate, AU1.

Criterion IDs reference the [Zaira Standard v0.9](https://zairalabs.ai/standard/v0.9).

---

## AU1. Non-Interactive Authentication Methods (MUST, Critical ×2)

**Goal:** at least one authentication path an agent can complete without human interaction.

**What good looks like:** documented API keys at minimum. API keys plus OAuth Client Credentials plus Device Flow for delegated access in the middle. Multiple non-interactive methods with programmatic key creation and rotation at the strong end.

**How to get there, in order of reach:**
- **API keys** are the simplest passing path. An environment variable and a header. Most tools have the mechanism; the common gap is documentation. Where to get a key, how to send it, and what scopes exist, written for a reader who cannot see your dashboard.
- **Client Credentials grant** (OAuth 2.0) is the machine-to-machine standard. Client ID plus secret yields a token, with no browser anywhere.
- **Device Flow** (OAuth 2.0) covers acting on behalf of a human. The agent surfaces a URL and code, the human approves once in their own browser, and the agent proceeds. One-time approval, not per-request interaction.

For calibration: a July 2025 network scan found 492 MCP servers exposed to the internet with no authentication at all, and among open-source MCP servers that do implement auth, 53% rely on static secrets with no rotation. Having any documented non-interactive path already clears most of the field.

**Trade-offs:** if your security model currently mandates interactive 2FA for everything, service accounts with non-interactive paths are the answer. That is a deliberate identity-model decision, not a weakening. Scope service credentials tightly (AU2) rather than resisting their existence. Teams that resist end up with humans pasting their personal session tokens into agents, which is strictly worse.

**Verify:** from a clean shell with no browser available, following only public docs, obtain (or use pre-provisioned) credentials and make an authenticated call. Any step requiring a click that the docs don't route around is a gate failure.

---

## AU2. Permission Granularity (SHOULD, Standard ×1)

**Goal:** an agent's credentials can be scoped to exactly what it needs, because over-privileged agents turn small mistakes into large incidents.

**What good looks like:** read/write separation at minimum. Per-resource scoped keys with helpful insufficient-permission errors in the middle. Per-resource, per-operation scoping with deny-by-default for destructive operations at the strong end.

**How to get there:** the stakes, per industry surveys: over-privileged agents show significantly higher security incident rates than properly scoped ones, yet a majority of organizations grant agents more access than the equivalent human. Ship read-only keys first. Most agent workloads are read-heavy, and a read-only key makes WO1's worst cases structurally impossible. Then per-resource scoping. And make the insufficient-permission error state which scope is required. That single detail converts a dead end into a precise "ask your human for X" handoff.

**Trade-offs:** fine-grained permission systems are real product surface with real UX cost for the humans configuring them. Sensible defaults carry most of the value: agent-typed keys default to read-only, and destructive scopes are opt-in by name.

**Verify:** create a minimally scoped key, attempt an out-of-scope operation, and read the error. Does it name the missing scope?

---

## AU3. Credential Lifecycle Management (SHOULD, Standard ×1)

**Goal:** credentials can be created, rotated, refreshed, and revoked programmatically. At agent scale, credential management is infrastructure, not an account-settings chore.

**What good looks like:** an API for key creation and rotation plus refresh tokens at minimum. Automatic rotation with zero-downtime overlap, per-key revocation, and expiry metadata in the middle. Brokered credentials, dual-secret rotation, and per-key audit trails at the strong end.

**How to get there:** machine identities outnumber human ones 109 to 1 in enterprise environments, and nearly three quarters of them are AI agents. "Regenerate key in dashboard" does not survive that ratio. The core set: key creation and rotation via API, overlap windows so rotation doesn't drop traffic (dual-secret: issue new, migrate, retire old), revocation per key rather than per account (one compromised agent shouldn't force rotating everything), and expiry metadata on the credential so agents refresh proactively instead of failing at expiry. Current guidance for agent tokens runs 5-15 minutes with automated refresh, a different world from multi-month human keys, and only livable with programmatic lifecycle support.

**Trade-offs:** short lifetimes without solid refresh mechanics just create outages. Sequence the refresh path before tightening lifetimes.

**Verify:** rotate a key via API while a client uses it, and confirm no dropped requests during the overlap. Revoke one key and confirm others survive. Check that credentials carry expiry metadata.

---

## AU4. Agent Identity Support (MAY, Standard ×1)

**Goal:** the platform can treat an agent as a distinct identity type. Distinguishable from the human it acts for, with its own limits and audit trail.

**What good looks like:** service accounts with scoping at minimum. M2M auth with agent-specific rate limits in the middle. Agent as a first-class identity type with credential vaulting, async human authorization (CIBA), and per-action audit trails at the strong end.

**How to get there:** the accessible first step is distinguishability. An agent-typed credential or a registered `User-Agent` convention, so your logs (NS4) can answer "human or agent?" per action. From there: agent-specific rate limits (agent traffic patterns differ, and NS2's headers apply), and for delegation-heavy products, async authorization flows (CIBA) where the agent requests and a human approves from their phone without breaking the agent's flow.

**Trade-offs:** this is a MAY criterion at the frontier of current practice. Standards for agent-to-app protocols and delegation chains are still settling. Distinguishability plus audit is cheap and durable. Deep agent-identity architecture is best justified for auth-adjacent and high-compliance products. If the tool *is* an auth provider, the domain module (AP1-AP3) covers the full treatment.

**Verify:** can you tell, from the audit log alone, which actions were taken by agents versus humans?
