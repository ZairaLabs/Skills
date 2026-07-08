# Base Standard: Documentation & Usability (B1-B7)

Applies to every tool. An agent encountering a tool for the first time needs machine-readable, structured, self-contained information, and a friction-free path from zero to working usage. More documentation is not better. Irrelevant docs actively harm agent performance. Quality, structure, and machine-readability beat volume.

Criterion IDs reference the [Zaira Standard v0.9](https://zairalabs.ai/standard/v0.9). Each criterion is a goal. The guidance here is one way to reach it.

---

## B1. Machine-Readable Documentation Formats (SHOULD, Critical ×2)

**Goal:** agents can consume your documentation directly, without rendering JavaScript or scraping styled HTML.

**What good looks like:** static Markdown or HTML at minimum. Strong implementations add `llms.txt`, `AGENTS.md`, and content negotiation (`Accept: text/markdown`), with docs versioned to match releases.

**How to get there:**
- **`llms.txt`** (domain root): a structured plaintext overview covering what the tool does, how to authenticate, key endpoints, and links to detail. An afternoon of work, and the best cost-to-impact ratio in this entire skill.
- **`AGENTS.md`** (repo root): context for agents working *inside* the codebase or SDK. Build commands, conventions, gotchas. Keep it agent-facing: what an agent needs to work correctly, not internal team docs.
- **Content negotiation** is the most involved option: serve Markdown from your existing docs infrastructure when the `Accept` header requests it. Worth it for large doc sites. Skip it if `llms.txt` plus Markdown docs already cover consumption.

**Trade-offs:** these files are cheap to create and easy to let rot. A stale `llms.txt` that contradicts your docs is worse than none (see B4). Wire them into your docs build or release checklist before shipping them.

**Verify:** `curl -s https://<domain>/llms.txt` returns structured plaintext. `curl -s -H "Accept: text/markdown" <docs-url>` returns Markdown if negotiation is claimed. `AGENTS.md` exists at repo root and its commands actually run.

---

## B2. Code Example Coverage & Quality (SHOULD, Standard ×1)

**Goal:** examples teach an agent correct usage, including the cases where the type signature alone is ambiguous.

**What good looks like:** realistic data (never `"string"`, `123`, `foo`), success and error scenarios both, progressive complexity from a minimal working case to advanced usage.

**How to get there:** focus on three example types. The minimal working case takes an agent from zero to a successful call. Ambiguous cases show correct usage where the signature doesn't. Error recovery shows what to do when the obvious approach fails. Gains plateau around 5-6 examples per feature; past that you're consuming context without teaching.

**Trade-offs:** examples are a maintenance liability. Every breaking change invalidates them. Tested examples (doctest, snippet CI) cost setup time but are the only examples that stay true.

**Verify:** copy-paste the quickstart example into a clean environment and run it. If it fails, that's the first bug to fix.

---

## B3. Documentation Structure & Self-Containment (SHOULD, Standard ×1)

**Goal:** every section of your docs is independently useful when extracted from its surrounding context. That's how agents read: they retrieve chunks, not pages.

**What good looks like:** answer-first sections of roughly 100-200 words, descriptive headings that work as search queries, tables for structured data, critical information in the first third of each section.

**How to get there:** rewrite headings so they stand alone. "How to authenticate with API keys" beats "Authentication." Open each section with the answer (the config format, the command, the constraint), then follow with context. Convert comparative or enumerable prose into tables. When a section references another, include enough inline context that the section survives extraction.

**Trade-offs:** none of consequence. This restructuring also improves human skimming and SEO. The cost is editorial time.

**Verify:** pick five sections at random. Read each in isolation and ask whether an agent holding only that chunk could act correctly on it.

---

## B4. Documentation Accuracy & Synchronization (SHOULD, Standard ×1)

**Goal:** the docs describe the tool that actually ships. Accuracy beats recency: old but correct outranks fresh but wrong.

**What good looks like:** docs versioned alongside the product (docs-as-code), documented examples tested in CI, docs stating which version they describe.

**How to get there:** move docs into the product repo so they ride the same PRs as the code they describe. Add version labels to docs pages. If you can only afford one automation, test the code examples. Inaccurate examples are the highest-damage form of doc drift because agents execute them verbatim.

**Trade-offs:** CI that blocks deploys on doc updates is strong medicine. It guarantees sync but adds friction to every release. Most teams get most of the value from tested examples plus version labels.

**Verify:** run the documented examples against the current release. Diff documented method signatures against the shipped API surface.

---

## B5. Getting Started Completeness (SHOULD, Standard ×1)

**Goal:** an agent goes from zero to first successful usage using only the documentation. No tribal knowledge, no "you should already have X configured."

**What good looks like:** installation, first usage, and expected output in one guide. A minimal viable example under 20 lines. First success achievable in under 5 minutes. Common pitfalls stated.

**How to get there:** write the quickstart as if the reader has no context beyond the page. State prerequisites explicitly, with install commands. Show the expected output; agents use it to confirm success. Add the three most common failure modes and their fixes. That's the error-recovery example B2 asks for, placed where it's needed.

**Trade-offs:** an agent-specific quickstart (top of the gradient) is worth writing only once the human quickstart is solid. It's a refinement, not a replacement.

**Verify:** execute the getting-started guide literally, in a clean environment, doing nothing the guide doesn't say. Every gap you hit is a gap an agent hits.

---

## B6. Changelog & Migration Guidance (MAY, Standard ×1)

**Goal:** changes are communicated in a structured, parseable form, so an agent deciding whether to upgrade (or diagnosing a break) can find out what changed.

**What good looks like:** a consistently formatted changelog with dated entries, semantic versioning, breaking changes clearly marked. Strong implementations add structured formats (JSON, RSS/Atom) and migration guides.

**How to get there:** adopt a consistent changelog convention (Keep a Changelog is fine), mark breaking changes with a dedicated section, and write migration guides for majors. `deprecated` markers in code or API specs give agents machine-readable advance warning.

**Trade-offs:** this is a MAY criterion, aspirational rather than expected. If your release cadence is low and versions are stable, a plain well-formatted CHANGELOG.md is enough.

**Verify:** the changelog's latest entry matches the latest release. Breaking changes in the last major are findable from the changelog alone.

---

## B7. Installation & Configuration Simplicity (SHOULD, Standard ×1)

**Goal:** an agent can install and configure the tool without a GUI, without multi-step build rituals, and with clear errors when configuration is wrong.

**What good looks like:** single-command install via a standard package manager, environment-variable configuration, actionable misconfiguration errors. The strongest pattern is a single static binary or zero-dependency install with zero-config defaults.

**How to get there:** if install currently requires more than one command, script the rest or eliminate it. Support configuration via environment variables. Agents set these easily; GUI config panels are invisible to them. Make misconfiguration errors say what is wrong and what to set. "MISSING_API_KEY: set ACME_API_KEY (see https://…)" is a recovery instruction. A stack trace is not. Publish a JSON Schema for config files if you have them (see CLI4 and FL3 for the full treatment).

**Trade-offs:** static-binary distribution (the Go and Rust pattern) is the top of this gradient but may be unreachable for your runtime. Don't re-platform for it. Within your ecosystem, minimize post-install steps instead.

**Verify:** install in a clean container from the documented command alone. Then break the config deliberately and read the error as if you knew nothing.
