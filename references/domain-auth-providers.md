# Domain Module: Auth Providers (AP1-AP3)

**Applies to:** identity and authentication platforms (Auth0, Clerk, Firebase Auth, and peers).

Auth providers face the agent shift twice. Agents *configure* them when bootstrapping auth for new projects, where dashboard-only setup is a wall. And increasingly agents are the *end users* authenticating through them, a case the standard browser-redirect model does not handle. The Authentication complexity module (AU1-AU4) covers the tool's own credentials. This module covers what the platform offers to the applications built on it.

Criterion IDs reference the [Zaira Standard v0.9](https://zairalabs.ai/standard/v0.9).

---

## AP1. Agent-as-End-User Support (SHOULD, Standard ×1)

**Goal:** the platform supports auth flows where the end user is an agent, not a human with a browser.

**What good looks like:** Client Credentials for machine-to-machine at minimum. Device Flow or CIBA for async human approval, plus token vaulting or delegation, in the middle. A dedicated agent identity type (not retrofitted service accounts), credential vaults, push-notification async authorization, and scoped, time-bounded agent credentials with full audit trails at the strong end.

**How to get there:** redirects, consent screens, and email verification all presuppose a human at a browser. The capability ladder for the agent-as-user case: Client Credentials for pure machine-to-machine. Device Flow or CIBA for agents acting on a human's behalf, where the human approves once, asynchronously, on their own device, without breaking the agent's flow (CIBA's push-approval model is nearly purpose-built for this). Token vaults and brokered credentials, so agents act via the vault rather than holding raw user tokens. A raw token in an LLM context is an exfiltration risk; brokering removes the token from the context entirely. At the frontier, agent identity as a first-class type with time-bounded, tightly scoped, individually auditable credentials.

**Trade-offs:** this domain's standards are still settling. Agent-to-app authorization protocols are young. Client Credentials plus Device Flow are stable ground any platform can stand on today. The differentiated end is a product-strategy bet on where the market is going, and current adoption curves say it's going there.

**Verify:** from a headless environment, complete a machine-to-machine flow. Then walk the documented path for "agent acts on behalf of user X" and count the browser interactions it assumes.

---

## AP2. Social/External Connection API (SHOULD, Standard ×1)

**Goal:** an agent bootstrapping auth for a new project can complete the entire setup programmatically. Providers, redirect URIs, email templates, session settings.

**What good looks like:** core settings via API with some dashboard-only provider setup at minimum. Social connections, email templates, and redirect URI management via API in the middle. Everything API-driven (60+ providers, branding, custom domains) with dynamic client registration at the strong end.

**How to get there:** "agent scaffolds a full application" is now a primary usage pattern, auth setup included, and a single dashboard-only step (typically social-provider configuration) strands the whole flow at 90%. This is PI11's wall, in the place agents hit it most. Audit the setup path end to end via Management API only. Every dashboard-only stop is the work list. Dynamic client registration (RFC 7591) is the strong-end move: applications registering themselves programmatically removes the last human step entirely.

**Trade-offs:** full API configurability of security-sensitive settings, redirect URIs especially, widens the blast radius of a compromised management credential. The mitigation is AU2 and AU3 discipline on management-API credentials (tight scoping, short lifetimes), not withholding the API.

**Verify:** using only the Management API, configure a new application with one social provider and a custom redirect URI. Note every point where documentation routes you to the dashboard.

---

## AP3. Token Architecture Transparency (MAY, Standard ×1)

**Goal:** the platform's token model (lifetimes, refresh semantics, delegation chains, trust boundaries) is documented well enough for an agent to reason about its own permissions.

**What good looks like:** documented lifetimes, refresh semantics, and scopes at minimum. Delegation-chain documentation, Rich Authorization Requests, fine-grained authorization, and API-driven rotation in the middle. Agent-to-app protocol support, per-action authorization logging, zero-downtime dual-secret rotation, and brokered credentials keeping tokens out of LLM contexts at the strong end.

**How to get there:** an agent holding an opaque token can't answer "can I do X?" without trying X, and trial-and-error against an authorization system is noisy and slow. The base rungs are documentation work. Publish token lifetimes and refresh semantics precisely. Document delegation ("token A obtained via flow B carries permissions C on behalf of D") so an agent can trace what it's allowed to do and as whom. Document scope semantics beyond a name list. The architectural end (brokered credentials so tokens never enter the agent's context, per-action authorization logs) overlaps AP1's strong end and serves compliance regimes that increasingly ask exactly these questions about automated actors.

**Trade-offs:** a MAY criterion whose base rungs are documentation effort, not engineering. Transparency about token internals is occasionally resisted on security-through-obscurity grounds. Lifetimes and semantics are not secrets, and the agents integrating against you need them.

**Verify:** from public docs alone, answer three questions. How long does an access token live? How is it refreshed? What happens to delegated permissions when the delegating user's access changes? If those take support tickets to answer, that's the gap.
