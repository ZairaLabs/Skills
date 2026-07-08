# Write Operations Module (WO1-WO4)

**Trigger:** the tool can create, modify, or delete data or resources.

Agents make destructive mistakes for the same reason humans do. The operation was available and the guardrails were insufficient. The difference is speed, volume, and the absence of the gut-check pause before "Delete All." The documented incidents (production databases wiped, thousands of records fabricated to cover an error, the same email sent 47 times) are not hypotheticals. They are the failure class this module exists to prevent.

The governing principle: structural prevention beats confirmation. "Are you sure? (y/N)" does not work when the user is software. An agent answers `y` because it decided to run the command before it saw the prompt.

Criterion IDs reference the [Zaira Standard v0.9](https://zairalabs.ai/standard/v0.9).

---

## WO1. Destructive Operation Safety (SHOULD, Critical ×2)

**Goal:** agents cannot execute irreversible destructive operations without appropriate safeguards. Ideally because the architecture makes the bad outcome impossible, not because a dialog asked nicely.

**What good looks like:** restricted agent roles and confirmation for some operations at minimum. Layered defenses (read-only modes, lexical blocklists, human gates for high-risk operations, soft delete) in the middle. Structural prevention at the strong end: destructive operations excluded from agent-facing interfaces, and separation patterns that make the harm architecturally unreachable.

**How to get there, using the three proven structural patterns:**
- **Auth-capture separation** (Stripe): creating a payment intent and capturing funds are separate calls. An agent can prepare everything; the irreversible step is a distinct, gateable action. Generalizes to any commit-style operation.
- **Plan-apply separation** (Terraform): the planning step has no side effects. An agent can plan repeatedly, inspect the diff, and apply only when the plan matches intent. Generalizes to any batch mutation.
- **Interface exclusion** (Railway): the MCP server simply does not contain project deletion. The operation exists for humans in the dashboard; the agent-facing surface omits it. The most effective guardrail is the one you never have to enforce.

Layer beneath these for depth: read-only modes as the default, soft delete with recovery windows instead of hard delete, lexical blocklists for dangerous statements, and human confirmation gates above a risk threshold.

**Trade-offs:** interface exclusion trades agent capability for safety. Right for rare, catastrophic operations; wrong for the tool's core verbs. A deploy tool whose agents can't deploy is pointless. Choose per operation by asking how often agents legitimately need it and how bad the worst mistake is. Soft delete carries storage and privacy-compliance implications, since deleted-but-retained data is still data.

**Verify:** enumerate every destructive operation reachable through the agent-facing surface. For each, name the safeguard that stands between an agent's mistaken call and irreversible harm. "None" anywhere is the finding.

---

## WO2. Dry-Run / Validation Capability (MAY, Standard ×1)

**Goal:** an agent can ask "what would happen?" without making it happen.

**What good looks like:** a validation endpoint for some operations at minimum. A dry-run parameter on most mutating operations, returning would-be effects, in the middle. Full-validation-chain dry-run with diff output (Terraform plan, Kubernetes server-side dry-run, Google's `validate_only: true` per AIP-163) at the strong end.

**How to get there:** add a standardized dry-run parameter to mutating endpoints, run the *full* validation chain (auth, quota, referential integrity, not just schema), and return what would have happened. Agents use this the way careful humans use `--dry-run`: to test their understanding before committing. If you built plan-apply separation for WO1, this criterion is already satisfied by the plan step.

**Trade-offs:** dry-run paths must stay behaviorally faithful to real execution or they mislead, which is worse than absence. Wire them through the real validation code path, not a parallel approximation. This is a MAY criterion, so prioritize your highest-consequence operations first.

**Verify:** dry-run a mutation and confirm no side effects occurred. Then execute for real and confirm the dry-run's prediction matched.

---

## WO3. Idempotency & Safe Retry Support (SHOULD, Standard ×1)

**Goal:** an agent retrying a failed request cannot cause a duplicate side effect.

**What good looks like:** idempotency keys accepted on critical mutations at minimum. Enforced with 24-hour-plus persistence, concurrency locking, and documented behavior in the middle. Comprehensive coverage with conflict detection (same key plus different params returns 409, Stripe's model) at the strong end.

**How to get there:** the canonical failure is fully preventable: network timeout on a payment call, agent retries, customer charged twice. Accept an `Idempotency-Key` header on every non-idempotent mutation. Persist keys with results for a documented window (24 hours is the convention). Serialize concurrent same-key requests. Validate parameters on reuse, so a key collision with a *different* payload returns an error instead of silently returning the cached result for the wrong request.

**Trade-offs:** minimal. A persistence store and middleware, with well-established patterns. Agents retry more than humans. This is among the highest-value additions any write-capable API can make.

**Verify:** send the same mutation twice with one key and confirm one side effect, not two. Send the same key with different parameters and expect a conflict error.

---

## WO4. Workflow Error Communication (SHOULD, Standard ×1)

**Goal:** when a multi-step operation fails partway, the agent learns what completed, what failed, and whether it can resume, instead of guessing at a half-mutated state.

**What good looks like:** the failed step identified at minimum. Completed, failed, and pending step enumeration with resume tokens and reversibility indication in the middle. Checkpoint-based recovery and compensating transactions at the strong end.

**How to get there:** the dangerous shape is atomic-looking success-or-fail wrapping a non-atomic reality. The agent can't tell whether to retry everything (duplicating completed steps) or nothing (leaving the operation half-done). On any partial failure, return step-level status. Add a resume token so retry continues rather than restarts. Mark failures by reversibility, because "step 3 failed, reversible" and "step 3 failed, emails already sent" demand different recovery strategies.

**Trade-offs:** full checkpointing is real architecture. An honest middle path: make multi-step operations *report* partial state precisely even if resumption isn't supported. Accurate "here is what happened" is most of the agent-facing value at a fraction of the cost.

**Verify:** force a mid-workflow failure (kill a dependency between steps, use an invalid value at step N) and read the error as the agent would. Can you tell what state the system is in and what to do next?
