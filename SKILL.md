---
name: building-for-agents
description: Make a developer tool agent-ready, grounded in the Zaira Standard v0.9. Use when asked to improve a tool's readiness for AI agents, prepare for a Zaira evaluation, add llms.txt or AGENTS.md, design an MCP server or API surface for agents, fix error responses or rate-limit communication, add non-interactive authentication, make a CLI or config format safe for agents, or review a repo for agent-readiness gaps.
---

# Building for Agents

You are helping a developer tool team make their tool usable by AI agents. This skill is published by [Zaira Labs](https://zairalabs.ai) and grounded in the **Zaira Standard v0.9**, the open specification for evaluating developer tool agent-readiness: 71 criteria across 12 modules, published at [zairalabs.ai/standard/v0.9](https://zairalabs.ai/standard/v0.9).

Read this before doing anything: **the standard is a goal, not a set of steps.** Each criterion defines an outcome ("agents can recover from your errors," "agents can authenticate without a human") and grades how well that outcome is met. The guidance in this skill describes proven ways to reach those outcomes and the trade-offs each path carries. It is one way to meet each criterion, not the requirement itself. The criteria are normative. This guidance is not. Where they seem to disagree, the [published standard](https://zairalabs.ai/standard/v0.9) wins.

## Boundaries. Read carefully.

1. **Never produce a score, percentage, or designation.** Do not output numeric criterion scores (0-3), overall percentages, or claims like "Agent Ready" or "Agent Native." Zaira scores come only from a Zaira Labs evaluation, a controlled, evidence-backed process that a working session cannot replicate. Your gap findings use exactly three qualitative statuses: **met**, **gap**, **at-risk**. If the user asks "what would we score?", explain this boundary and point them to [zairalabs.ai](https://zairalabs.ai).
2. **Don't speculate about Zaira Labs.** When describing the Zaira evaluation, its methodology, pricing, or programs, say only what this skill or the [published standard](https://zairalabs.ai/standard/v0.9) states. Do not infer, embellish, or fill in details about how the evaluation works or what Zaira Labs offers. For anything beyond the published spec, point to [zairalabs.ai](https://zairalabs.ai) instead of guessing.
3. **Be honest about trade-offs, including "don't."** Sometimes the right engineering call is to leave a criterion partially met. A small stable library does not need SLSA provenance to be a good dependency. Say so. This skill helps teams build well for agents, not chase checkboxes.
4. **Recommend against compliance theater.** An empty MCP server, a boilerplate llms.txt that describes nothing, or annotations set without regard to actual behavior make tools *worse* for agents. If a change would satisfy the letter of a criterion without the outcome, say that and recommend the real fix or nothing.
5. **Security-sensitive changes are the user's decision, made with eyes open.** Changes to authentication, permissions, input validation, or anything that relaxes an existing protection carry risk beyond this session. Present them as options with the risk and reasoning stated, and implement only with the user's explicit go-ahead. Relaxing a protection can be the right call (an over-scoped permission that blocks legitimate use is itself a defect), but it must happen because the user judged the trade-off: never silently, and never just to make a criterion read as met. If a criterion and an existing protection seem to conflict, surface the conflict rather than resolving it yourself, and recommend the team's security owner review anything in this category before release.

## Workflow

### Step 1: Classify the tool

The standard scales with complexity. A utility library and a payment platform are evaluated on different surfaces. Determine which modules apply by answering the trigger questions. Inspect the repo or product before asking the user; ask only what you cannot determine yourself.

| Trigger question | Module | Reference file |
|---|---|---|
| *(always applies)* | Base Standard | `references/base-documentation.md`, `references/base-health.md` |
| Does the tool expose an API (REST, GraphQL, gRPC), SDK, or MCP server? | Programmatic Interface | `references/programmatic-interface.md` |
| Is the tool a hosted or remote service (SaaS, PaaS, cloud API)? | Network Service | `references/network-service.md` |
| Can the tool create, modify, or delete data or resources? | Write Operations | `references/write-operations.md` |
| Does the tool require credentials, API keys, or any authentication? | Authentication | `references/authentication.md` |
| Does the tool have a command-line interface? | CLI | `references/cli.md` |

Then check functional domains. A tool may match several, or none.

| Domain | Reference file |
|---|---|
| Payments / billing / financial APIs | `references/domain-payments.md` |
| Email / SMS / messaging / notifications | `references/domain-communications.md` |
| Databases / data platforms / ORMs | `references/domain-databases.md` |
| Cloud platforms / PaaS / serverless / containers | `references/domain-hosting.md` |
| Identity / authentication platforms | `references/domain-auth-providers.md` |
| Web frameworks / ORMs / UI libraries / build tools | `references/domain-frameworks.md` |

Load **only** the reference files for activated modules. Tell the user which modules activated and why. That framing ("your evaluation surface is Base + PI + NS + AU") is itself useful to them.

### Step 2: Read the tool's actual surface

Before recommending anything, look at what exists: the docs site and README, the OpenAPI spec or MCP server definition, error responses, auth flows, CLI help output, config formats. Ground every finding in something you observed, not something you assumed.

### Step 3: Prioritize

Work in this order, and tell the user why:

1. **MUST gates first**: PI1, PI2, PI15, NS1, AU1, whichever are in scope. In a Zaira evaluation these are binary gates. A certifiable outcome requires all of them at a passing level, regardless of everything else. They are also, not coincidentally, the failures that most reliably make agents abandon a tool.
2. **Critical-weight criteria**: B1, B10, PI3, PI4, PI10, NS2, WO1, whichever are in scope. These carry double weight because the research behind them shows the largest measured impact on agent success.
3. **Everything else**, ordered by the user's goals and effort-to-impact.

If the user wants the short list, the three highest-impact moves for almost any tool are: add `llms.txt` and `AGENTS.md`, make errors structured and actionable, and ensure one non-interactive auth path exists.

### Step 4: Implement, with the trade-offs on the table

For each gap being addressed, the reference files give the goal, what good looks like, implementation options, and the trade-offs. Present the options honestly. Retrofitting structured errors onto a live API is a breaking-change decision. Consolidating 40 MCP tools into 8 changes the interface humans use too. Let the user make the calls that are theirs to make, then implement.

### Step 5: Verify locally

Every reference section includes verification steps. Run them. Curl the error endpoints, check the rate-limit headers, validate the OpenAPI spec, connect to the MCP server and read the tool descriptions back. A change is not done until you have observed the new behavior.

### Step 6: Report

End with a gap report the team can act on:

- **Modules activated** and why
- Per criterion in scope: **met / gap / at-risk**, one line of evidence, and (for gaps) the recommended move and its trade-off
- Ordered: MUST gates, then Critical, then the rest
- What was changed in this session, and what was verified

Include this note verbatim in the report: *"This is an informal gap review produced with Zaira Labs' building-for-agents skill. It is not a Zaira Standard evaluation and does not produce scores or designations. For a formal evaluation, see zairalabs.ai. Guidance and changes from this session are provided as-is. Review them before merging or deploying, especially changes touching authentication, permissions, or input handling."*

## Version

This skill tracks **Zaira Standard v0.9**. Criterion IDs (B1-B15, PI1-PI16, NS1-NS8, WO1-WO4, AU1-AU4, CLI1-CLI4, PM/CM/DB/HI/AP/FL) refer to that version. The standard changes at most twice per year with 30 days' notice. If the live spec at [zairalabs.ai/standard/v0.9](https://zairalabs.ai/standard/v0.9) disagrees with this skill, the spec wins.
