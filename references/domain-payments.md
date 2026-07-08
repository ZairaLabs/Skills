# Domain Module: Payments & Financial (PM1-PM4)

**Applies to:** payment processors, billing platforms, financial APIs.

Payments sit near the irreversible end of the consequence spectrum. A wrong charge is slow to reverse, and a compliance mistake is worse. Everything in the Write Operations module applies with the stakes raised. These four criteria add the payments-specific surface. Stripe's developer platform is the reference implementation for most of this module. Study it even if you compete with it.

Criterion IDs reference the [Zaira Standard v0.9](https://zairalabs.ai/standard/v0.9).

---

## PM1. Idempotency Depth (SHOULD, Standard ×1)

**Goal:** retried payment requests cannot double-charge, with idempotency deep enough to handle concurrency and parameter drift, not just header acceptance.

**What good looks like:** key acceptance with cached responses at minimum. Documented persistence windows and concurrent-request serialization in the middle. Parameter validation on key reuse (same key plus different params returns 409) across all write endpoints at the strong end.

**How to get there:** this is WO3 with the consequence dial turned up. Agents retry, and in payments a duplicate side effect is money. The depth items beyond basic acceptance: persist keys with results for a documented window (24 hours is the convention), serialize concurrent same-key requests with locking, and validate parameters on reuse so a reused key with a *different* amount errors instead of silently returning the cached result. Make keys mandatory or strongly defaulted on charge creation. OpenAI's agentic checkout spec already requires idempotency on all payment operations, which is where the ecosystem is heading.

**Verify:** fire the same charge request twice concurrently with one key and confirm exactly one charge. Reuse the key with a different amount and expect a conflict error, not a charge.

---

## PM2. Test Simulation Fidelity (SHOULD, Standard ×1)

**Goal:** an agent can learn and validate the entire payment integration, including the failure modes, without touching real money.

**What good looks like:** a sandbox with basic success and decline cards at minimum. Specific decline codes, card brands, and webhook simulation in the middle. Thirty-plus scenario cards, time simulation for subscription and trial flows, dispute and refund simulation, and CLI event triggering at the strong end.

**How to get there:** agents cannot safely learn payments on live rails, and the part that needs testing most is exactly what a thin sandbox omits: declines, disputes, expirations. Build out in this order. Test cards mapped to *specific* decline codes, not one generic failure. Webhook event simulation and replay so agents can test their handlers. Then time control (Stripe's Test Clocks). Without it, subscription and trial logic is untestable except by waiting.

**Trade-offs:** simulation fidelity is a permanent tax. Every new payment feature needs its sandbox twin. Budget it into the feature's definition of done. A sandbox that lags the product teaches agents wrong behavior.

**Verify:** in test mode, produce three specific decline codes, simulate a dispute, and advance a subscription past a trial boundary, all from the API or CLI.

---

## PM3. Compliance Automation (MAY, Standard ×1)

**Goal:** the platform absorbs regulatory burden (tax, PCI scope, 3DS/SCA) so an agent doesn't need jurisdiction-specific knowledge it doesn't have.

**What good looks like:** hosted checkout or tokenization reducing PCI scope at minimum. A built-in tax engine and automatic 3DS with machine-readable `requires_action` states in the middle. Merchant of Record or 200-plus-market tax coverage at the strong end.

**How to get there:** an agent building a payment flow should not be deriving VAT rules, and it *will* build something wrong if forced to. The machine-readable part matters most for agents. When SCA needs a human, the API must say so structurally (`requires_action` plus what kind), because that signal is what routes the flow to a human instead of a retry loop.

**Trade-offs:** this is a MAY criterion describing product strategy (Merchant of Record versus tax engine versus tokenization-only), not a retrofit. Advise honestly at the level the platform occupies. The agent-facing floor is that whatever compliance steps remain are explicit, structured API states rather than prose in the docs.

**Verify:** trigger a 3DS-required test scenario and confirm the response carries a machine-readable action-required state an agent could route on.

---

## PM4. Currency & Amount Safety (SHOULD, Standard ×1)

**Goal:** the API makes currency-unit mistakes structurally hard. A silent cents-versus-dollars confusion is a 100x error.

**What good looks like:** documented smallest-unit amounts and minimum-charge enforcement at minimum. Explicit units in responses and documented zero- and three-decimal currency handling in the middle. Currency-aware validation that rejects ambiguous amounts, per-currency decimal metadata, and auth-capture support for human review at the strong end.

**How to get there:** pick smallest-unit integers (cents, not decimal dollars), state it everywhere amounts appear, and validate. Reject amounts that look unit-confused rather than processing them. Handle the exceptions explicitly: zero-decimal currencies (JPY) and three-decimal ones (BHD) are where correct-looking integer math silently goes wrong. Expose per-currency decimal counts as API metadata so agents can compute rather than assume. Auth-capture (the WO1 structural pattern) is the final backstop: a human reviews the amount before money moves.

**Verify:** send a plausibly unit-confused amount and a sub-minimum amount. Both should fail with errors that name the unit. Check JPY handling in the docs and in the API's actual behavior.
