# Domain Module: Communications (CM1-CM3)

**Applies to:** email, SMS, messaging, and notification platforms.

Communications occupy the far end of the irreversibility spectrum. You can roll back a database transaction. You cannot unsend 10,000 emails. An agent stuck in a retry loop on a send endpoint is a reputational incident measured in minutes. This module is Write Operations logic specialized for the one domain where there is no undo at all.

Criterion IDs reference the [Zaira Standard v0.9](https://zairalabs.ai/standard/v0.9).

---

## CM1. Irreversibility Safeguards (SHOULD, Standard ×1)

**Goal:** an agent cannot send irreversible communications at volume without something standing between intent and delivery.

**What good looks like:** a sandbox mode and basic outbound rate limiting at minimum. Batch caps (1,000 or fewer per call), draft and preview APIs, or scheduled send with a cancellation window in the middle. Full-request sandbox validation, per-second safety brakes, draft-then-send with human approval, and loop-prevention circuit breakers at the strong end.

**How to get there, in layers:**
- **Sandbox mode** that validates the complete request without delivering (SendGrid's `sandbox_mode.enable: true`). Agents can test the whole pipeline with zero send risk.
- **Batch caps and per-second limits** as safety brakes. Twilio's loop-prevention circuit breaker (30 identical messages per 30 seconds) exists precisely because of the send-the-same-email-47-times failure class. A cap that pauses a runaway agent costs legitimate throughput almost nothing.
- **Draft-then-send.** Composing and delivering as separate calls is auth-capture for messaging. The agent prepares everything, and the irreversible step is distinct and gateable.
- **Scheduled send with cancellation.** A delivery delay window converts "irreversible" into "reversible for the next N minutes," which is the entire game in this domain.

**Trade-offs:** transactional messaging (password resets, alerts) needs immediacy. Human approval gates fit campaign and bulk sends, not one-time codes. Differentiate by send type rather than gating everything. Circuit breakers and sandbox mode apply universally.

**Verify:** confirm sandbox mode validates without delivering. Fire a burst of identical sends at one recipient and confirm something brakes. Check whether a scheduled send can actually be cancelled via API.

---

## CM2. Delivery Verification (SHOULD, Standard ×1)

**Goal:** an agent gets structured, programmatic feedback on whether messages actually arrived. Fire-and-forget is flying blind.

**What good looks like:** basic delivery and bounce webhooks at minimum. Structured receipts (delivered, bounced, complained), hard/soft bounce categorization, and API-accessible suppression lists in the middle. The full event lifecycle (processed → delivered → opened → clicked → unsubscribed → complained) with per-recipient tracking and machine-readable bounce codes at the strong end.

**How to get there:** an agent that can't observe delivery can't distinguish "sent" from "arrived," and its natural response to silence is to send again. That makes delivery feedback an irreversibility safeguard in disguise. The essentials: structured status events per message, and bounce categorization with machine-readable codes. A hard bounce means stop sending to this address. A soft bounce means retry later is legitimate. Opposite actions, so the distinction has to be machine-readable. Suppression lists should be readable *and* writable via API, so agents check before sending and honor unsubscribes programmatically.

**Trade-offs:** minimal. This is mature infrastructure in the email world. The agent-facing gap is usually API accessibility of data that already exists in a dashboard.

**Verify:** send to a known-bouncing test address and confirm a categorized, machine-readable bounce event arrives. Query the suppression list via API.

---

## CM3. Webhook/Event Infrastructure (SHOULD, Standard ×1)

**Goal:** event delivery an agent can configure, verify, and replay, entirely programmatically.

**What good looks like:** API-configurable webhook URLs with structured JSON payloads at minimum. Cryptographic signature verification (HMAC or ECDSA) and standard lifecycle event types in the middle. Full CRUD webhook management, event replay, batched delivery, and inbound processing at the strong end.

**How to get there:** dashboard-only webhook setup is a wall in the middle of an otherwise automated flow. This is PI11's logic applied to eventing. The set that matters: webhook CRUD via API. Signatures on every event, because unsigned webhooks are an injection vector into whatever consumes them, and agents wire consumers fast and trustingly (PI16's concern arriving over the wire). And event replay, which is what makes an agent's webhook handler testable and recoverable. Replay after a fix beats waiting for the next organic event.

**Trade-offs:** standard infrastructure with well-worn patterns. Signature verification and replay are table stakes in mature platforms. The common gap, again, is API coverage of dashboard-only capability.

**Verify:** create a webhook subscription via API only, verify an event's signature against the documented scheme, and replay a historical event.
