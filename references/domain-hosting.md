# Domain Module: Hosting & Infrastructure (HI1-HI3)

**Applies to:** cloud platforms, PaaS, serverless, container services.

Hosting is where agent mistakes acquire a billing dimension. An agent that provisions and forgets is a cost incident, and an agent that can deploy but not roll back is an operational one. The module's three criteria target those gaps: money guardrails, lifecycle completeness, and blast-radius-free places to deploy.

Criterion IDs reference the [Zaira Standard v0.9](https://zairalabs.ai/standard/v0.9).

---

## HI1. Cost Guardrails (SHOULD, Standard ×1)

**Goal:** spending is boundable, observable, and estimable through the API, because agents do not reliably model the cost consequences of provisioning decisions.

**What good looks like:** basic spending alerts at minimum. API-configurable spending limits, auto-stop for idle resources, and a usage-tracking API in the middle. Pre-deployment cost estimation, per-project caps, scale-to-zero, real-time tracking, and API defaults no more permissive than console defaults at the strong end.

**How to get there:** the failure mode is provision-and-forget. An agent allocates a large instance for a task, the task ends, the instance doesn't. The mechanisms, in rough order of value: hard spending caps settable via API, so the worst case is a number chosen in advance. Auto-stop and scale-to-zero for idle resources, so forgetting becomes free. Usage APIs, so agents can observe spend as data (NS8's transparency applied to compute). And cost estimation before provisioning, which converts cost from a surprise into an input. One subtle audit: compare your API defaults against your console defaults. Consoles often nudge humans toward conservative choices while the API silently defaults bigger, and agents only ever see the API.

**Trade-offs:** hard caps mean intentional service interruption at the limit. Stop versus bill is a decision about failure modes the platform must make explicitly and document. For agent-driven workloads, stop-by-default with opt-out is usually the defensible choice.

**Verify:** set a spending cap via API and confirm behavior at the threshold is documented, and ideally testable. Provision something idle-able and confirm auto-stop. Compare API and console defaults on one resource class.

---

## HI2. Deployment Lifecycle Completeness (SHOULD, Standard ×1)

**Goal:** the entire lifecycle (build, deploy, logs, scale, environment config, and above all rollback) is available programmatically. Deploy-without-rollback is an operationally unsafe capability gap.

**What good looks like:** deploy plus status via API or CLI with limited log access at minimum. Build, deploy, logs, env-var management, and redeploy-previous rollback in the middle. The full lifecycle via API, CLI, or MCP, including streaming logs and scaling, at the strong end.

**How to get there:** audit as capability *pairs*. Every action an agent can take needs its programmatic inverse and its observability: deploy and rollback, scale-up and scale-down, create and destroy, act and read logs. The two most commonly missing halves are rollback (an agent that deployed a bad build and cannot revert is stuck at the worst moment) and log access (an agent that can't read deploy logs can't diagnose its own failure, so it retries blind, which is worse). Rollback needn't be a dedicated primitive. "Redeploy previous version, atomically," documented as *the* rollback path, is a legitimate middle rung.

**Trade-offs:** minimal conceptually. This is PI11 (workflow coverage) specialized to deployment, and the gaps are usually API surface debt rather than design disputes.

**Verify:** via API or CLI only: deploy, stream the logs, roll back. Time the rollback. It's the number that matters mid-incident.

---

## HI3. Preview/Staging Deployments (MAY, Standard ×1)

**Goal:** agents can deploy somewhere that isn't production first. Isolated, API-creatable, and self-cleaning.

**What good looks like:** a manual staging environment at minimum. API-creatable previews with branch-based deployments and rollback in the middle. Automatic per-branch or per-PR previews, ephemeral environments with auto-cleanup, and progressive rollout (canary, blue-green) at the strong end.

**How to get there:** preview deployments are the hosting domain's sandbox (NS5) and safe-experimentation (DB1) pattern in one: a place where a bad deploy costs nothing. The parts that matter for agents specifically: creation via API, because a dashboard-configured staging slot is invisible to them (the Vercel-style preview-per-branch pattern is the reference). Isolation, because a preview sharing production data is a production deployment wearing a costume (pairs with NS6). And automatic cleanup, since agents create environments faster than anyone remembers to delete them. TTL-based expiry is the difference between a feature and a cost problem (HI1).

**Trade-offs:** a MAY criterion. Ephemeral-environment infrastructure is substantial for platforms not born with it. The honest intermediate is one API-creatable staging environment plus documented promotion. Most of the safety, a fraction of the machinery.

**Verify:** create a preview environment via API from a branch, confirm it's isolated from production data, and confirm it expires or is deletable programmatically.
