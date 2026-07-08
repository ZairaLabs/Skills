# Base Standard: Safety Fundamentals & Lifecycle Health (B8-B15)

Applies to every tool. An agent recommending a tool is betting on its future, not just its present. These criteria measure whether the tool is safe to depend on: supply chain integrity, security posture, and long-term continuity. Most of the signals are already public. The question is whether yours tell a coherent story.

Two things to know before working in this area:

1. **The standard measures health, not activity.** A stable, feature-complete project with no commits in two years, zero unpatched CVEs, and passing CI is *healthy*. Never recommend performative activity (commit padding, cosmetic releases). It doesn't move any criterion and it isn't the point.
2. **Several criteria here split by tool type.** Open-source risk is contributor abandonment. Commercial risk is corporate sunset. B8, B10, B13, B14, and B15 have separate open-source and commercial rubrics, so identify which applies before advising.

Criterion IDs reference the [Zaira Standard v0.9](https://zairalabs.ai/standard/v0.9).

---

## B8. Supply Chain Integrity (SHOULD, Standard ×1)

**Goal:** a consumer can verify that the artifact they install is the artifact you published, published by who they think you are.

**What good looks like (open-source):** verified publisher on npm or PyPI, verified GitHub org, signed tags and releases, lock files. The strong end adds Sigstore/cosign signing, SLSA provenance, reproducible builds, and a published SBOM. **(Commercial):** SDKs published under a verified org through official channels, checksums for downloads, and signed SDKs with provenance at the strong end.

**How to get there, cheapest first:** verify publisher status on your package registry and your GitHub organization. Minutes of work, real signal. Commit lock files. Sign release tags. Then, if your build system supports it, add SLSA provenance attestation; GitHub Actions can emit this with modest configuration.

**Trade-offs:** reproducible builds are the strongest signal and the most expensive. They are worth pursuing for security-critical tools and rarely justified for a small utility library. Be honest with the user about where their tool sits.

**Verify:** check the registry page for the verified-publisher badge. Run `git tag -v` on a release tag. Confirm the domain, repo, and published artifact chain match.

---

## B9. Vulnerability Disclosure & Security Contact (SHOULD, Standard ×1)

**Goal:** someone who finds a vulnerability can figure out how to tell you, and knows what to expect after they do.

**What good looks like:** a machine-readable path, meaning `security.txt` (RFC 9116) at `/.well-known/security.txt`, plus a published disclosure policy with response-time commitments.

**How to get there:** `security.txt` takes minutes: contact, policy URL, expiry. On GitHub, add `SECURITY.md` and enable private vulnerability reporting. Write the policy honestly (acknowledge within X days, assess within Y) and only commit to timelines you can keep.

**Trade-offs:** a bug bounty (top of the gradient) is an operational commitment, not a file. Recommend it only for tools with real attack surface and a team to triage submissions.

**Verify:** `curl -s https://<domain>/.well-known/security.txt`. Confirm the contact address is monitored and the file isn't expired.

---

## B10. Project Sustainability (SHOULD, Critical ×2)

**Goal:** the tool will plausibly still be maintained in two years.

**What good looks like (open-source):** a contributor base where no single person accounts for more than half of the work. Bus factor of 4-10 with organizational backing is strong. A bus factor of 1 is the single most predictive abandonment risk factor. **(Commercial):** an identifiable team, funding or revenue signals, and evidence the product is a core revenue line, with a published sunset and migration policy at the strong end.

**How to get there (open-source):** this is the slowest criterion to move. You cannot rush a contributor base. The realistic moves: make contribution easy (contributor docs, labeled starter issues, fast review) and pursue organizational or foundation backing when the project's scale supports it. **(Commercial):** publish the things that reassure. Team page, roadmap, sunset policy, data export. The Openbase pattern (funded, popular, dead with no migration path) is what agents' selection logic learns to avoid.

**Trade-offs:** for a solo maintainer, the honest advice is often that this criterion reflects real risk that can't be quickly engineered away. Mitigate with continuity signals (B13: a named successor, org backing) and be excellent elsewhere.

**Verify (open-source):** contributor distribution over the last year. What share does the top contributor hold?

---

## B11. Maintenance Health (SHOULD, Standard ×1)

**Goal:** the tool demonstrably still works, and unresolved issues receive maintainer response. Zero open issues plus no commits is healthy. Fifty unanswered issues plus no commits is abandoned. The difference is measurable.

**What good looks like:** issues get responses in days, not quarters. Known vulnerabilities patched within 30 days. Clean installs on current LTS runtimes. Dependencies pinned to non-vulnerable versions, CI passing. The gradient has an explicit mature-stable path: a quiet project qualifies at the top through zero unpatched vulnerabilities, current-runtime CI, and responsiveness on the issues that do arrive.

**How to get there:** triage debt first. Old unanswered issues are the loudest negative signal, and even a "not planned, here's why" close counts as a response. Set up dependency update automation (Renovate, Dependabot). Keep CI running against current LTS runtimes even when the code isn't changing; that's the "prove it still works" signal.

**Trade-offs:** published response-time commitments sit at the top of the gradient but become a liability if unkept. Commit publicly only to what your capacity supports.

**Verify:** install on the current LTS runtime. Check the age of the oldest unanswered issue. Check for open security advisories against current dependencies.

---

## B12. Semver Adherence & Version Stability (SHOULD, Standard ×1)

**Goal:** breaking changes are confined to places a consumer, human or agent, expects them: major versions.

**What good looks like:** semver compliance, breaking changes only in majors, pre-1.0 tools clearly labeled unstable. Documented stability guarantees and LTS versions at the strong end.

**How to get there:** adopt and state a semver policy. If you're perpetually pre-1.0 while people depend on you in production, cutting 1.0 is itself the fix. It converts implicit stability into a contract. Tooling that detects API breaking changes in CI (api-extractor and equivalents) makes the policy enforceable rather than aspirational.

**Trade-offs:** a stability guarantee constrains you. That is the point. Decide what surface you're willing to freeze before you promise it.

**Verify:** scan release history for breaking changes that landed in minor or patch releases. Check whether pre-1.0 status, if applicable, is labeled.

---

## B13. Governance & Continuity (MAY, Standard ×1)

**Goal:** the tool's continuity doesn't hinge on a single entity's continued interest.

**What good looks like (open-source):** documented governance and decision-making, multiple organizational contributors, foundation governance (CNCF, Apache, Linux Foundation) at the strong end. **(Commercial):** data portability, a documented SLA, and a published sunset policy with migration commitments at the strong end.

**How to get there:** write down how decisions get made and who has commit rights. Informal but documented beats formal but fictional. For commercial tools, the sunset policy plus a data export API is the pair that matters (and the export API also serves NS8).

**Trade-offs:** this is a MAY criterion. Foundation governance is a multi-year institutional commitment that reshapes how the project operates. Recommend it only when scale justifies it, never as a scoring move.

**Verify:** GOVERNANCE.md or MAINTAINERS.md exists and matches reality. For commercial tools, the sunset policy is public and the export path works.

---

## B14. Security Track Record (SHOULD, Standard ×1)

**Goal:** when vulnerabilities happen, and they do, you respond fast, and your development practices reduce how often they happen.

**What good looks like (open-source):** vulnerabilities patched within 30 days (14 at the strong end), enforced code review, branch protection, and an OpenSSF Scorecard trending above 5/10. **(Commercial):** a published security practices page, SOC 2 or equivalent, a disclosure policy with timelines, incident post-mortems.

**How to get there (open-source):** run OpenSSF Scorecard now. It's free, automated, and tells you which checks fail. Code-Review is the single most important check. Enable branch protection, add security scanning to CI, and treat advisory response time as an SLO. **(Commercial):** publish what you already do. Many teams have real practices and no public evidence of them, and unevidenced practice scores like absent practice because agents can only read evidence.

**Trade-offs:** SOC 2 is expensive and slow. It's justified by enterprise sales motion, not by this criterion alone.

**Verify:** `npx @ossf/scorecard --repo=<repo>` (or the web viewer). Check the response gap on the last few advisories.

---

## B15. Terms & Licensing Stability (SHOULD, Standard ×1)

**Goal:** the terms under which the tool is available won't change out from under a dependent, or at least carry no known warning signs.

**What good looks like (open-source):** a stable OSI-approved license without the recognized change-risk pattern. The pattern preceding every major relicense (MongoDB, Redis, Terraform) was the same: one company holding more than 80% of commits, a broad CLA, and cloud competition. **(Commercial):** published terms, 90+ days' notice for material changes, grandfathering, and pricing history demonstrating stability.

**How to get there (open-source):** if you match the risk pattern, saying "we'd never relicense" doesn't help. The pattern is structural, and resolving it takes structural moves: foundation-held copyright, an irrevocable license grant, or narrowing the CLA. If you don't intend those, be aware the risk reads as real because it is. **(Commercial):** publish pricing history and commit to notice periods. Cheap to do, directly legible to agents.

**Trade-offs:** structural license commitments are close to irreversible. This is a founders' decision, not an engineering task. Frame it that way to the user.

**Verify:** LICENSE file present and OSI-standard. Commit concentration and CLA breadth checked against the risk pattern. For commercial tools, terms include a notice-period clause.
