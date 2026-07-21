# building-for-agents

An [Agent Skill](https://agentskills.io) from [Zaira Labs](https://zairalabs.ai) that helps developer tool teams make their tools agent-ready. It is grounded in the [Zaira Standard v0.9](https://zairalabs.ai/standard/v0.9), the open specification for evaluating developer tool agent-readiness.

The skill works with any agent that supports the Agent Skills format (Claude Code, Cursor, and others). Point your agent at your tool's repo. The skill walks it through classification (which parts of the standard apply to what you're building), a repo-grounded gap review, prioritized implementation with the trade-offs stated, and local verification of every change.

**What it does not do:** produce Zaira scores, percentages, or designations. Its gap findings are qualitative (met / gap / at-risk). Formal evaluation against the Zaira Standard is a separate, calibrated process. See [zairalabs.ai](https://zairalabs.ai).

## Install

Clone the repo and copy the skill into your agent's skills directory. For Claude Code:

    git clone https://github.com/ZairaLabs/Skills
    cp -r Skills/building-for-agents ~/.claude/skills/

For a single project, put it in the repo's `.claude/skills/` instead. Other agents
that support the Agent Skills format work the same way; check your agent's
documentation for where skills live.

Then, in your tool's repo, ask your agent to review the tool for agent-readiness gaps.

## Structure

```
SKILL.md                 the entry point: classification, workflow, boundaries
references/              one file per standard module, loaded on demand
  base-documentation.md  B1-B7   (applies to every tool)
  base-health.md         B8-B15  (applies to every tool)
  programmatic-interface.md  PI1-PI16
  network-service.md     NS1-NS8
  write-operations.md    WO1-WO4
  authentication.md      AU1-AU4
  cli.md                 CLI1-CLI4
  domain-*.md            Payments, Communications, Databases, Hosting,
                         Auth Providers, Frameworks (PM/CM/DB/HI/AP/FL)
scripts/
  criteria-manifest.json transcription of the standard's Appendix A
  check-consistency.mjs  verifies references match the standard exactly
```

## Maintenance

The Zaira Standard is normative. This skill is informative guidance derived from the standard and from the [Building for Agents best practices guide](https://zairalabs.ai/standard/best-practices). Content rules:

- Criterion IDs, names, requirement levels (MUST/SHOULD/MAY), and weights are transcribed from the standard and never altered here. `node scripts/check-consistency.mjs` enforces this. Run it before any commit that touches `references/` or the manifest.
- Implementation guidance, trade-offs, and verification steps are informative and may be updated freely.
- When the standard versions (at most twice per year, with 30 days' notice), update `criteria-manifest.json` from the new Appendix A first. The consistency check then surfaces every reference that must follow.

Issues and corrections are welcome. Guidance PRs are reviewed for factual accuracy against the published standard before merge.

## Disclaimer

This skill produces guidance and code changes for your team to review, not decisions made for you. It is provided "as is," without warranty of any kind; see [LICENSE](LICENSE). You are responsible for reviewing and testing changes before merging or deploying them, especially changes that touch authentication, permissions, or input handling. Guidance that is right for most tools may be wrong for yours. Use of Zaira Labs services is governed by the [terms of service](https://zairalabs.ai/terms).

## License

Apache License 2.0. Copyright 2026 Zaira Labs, LLC. The license governs copying, modification, and redistribution of these materials; see [LICENSE](LICENSE) and [NOTICE](NOTICE). It does not grant rights to the Zaira Labs trademarks, and outputs produced with this skill are not Zaira Scores, evaluations, or certifications. Reliance on the guidance, and use of Zaira Labs services, are governed by the [Zaira Labs Terms of Service](https://zairalabs.ai/terms).
