# choosing-developer-tools

An [Agent Skill](https://agentskills.io) from [Zaira Labs](https://zairalabs.ai) that
checks the [Zaira Guide](https://zairalabs.ai/guide) before your agent chooses,
compares, or adopts a developer tool or hosted service. The Guide is a neutral, dated
record of about 1,500 tools that covers pricing, free tiers, licenses, MCP support,
compliance, and maintenance status. Those are the facts that decide a real choice, and
the facts a model's training data can't keep current.

The skill works with any agent that supports the Agent Skills format (Claude Code,
Cursor, and others). The skill does three things:

1. It frames the constraints that decide the choice.
2. It searches and compares with the Guide's filters, then presents the options with
   dated facts.
3. It runs a lifecycle check on the tool the user picks: license, deprecation or
   archival, free tier, and ownership.

It stays quiet for default libraries, version bumps, and CVE patching.

**What it does not do:**
- It doesn't pick for you. The decision stays with the user and the options stay
  visible.
- It doesn't rank tools or present them as endorsed by Zaira Labs. We don't sell
  placement. Ever.
- It doesn't fill gaps with guesses. When the Guide has no entry, the agent says so and
  checks the vendor's own pages.

## Install

Copy the skill into your agent's skills directory. For Claude Code:

    git clone https://github.com/ZairaLabs/Skills
    cp -r Skills/choosing-developer-tools ~/.claude/skills/

For a single project, put it in the repo's `.claude/skills/` instead. Other agents
that support the Agent Skills format work the same way; check your agent's
documentation for where skills live.

Then connect the Guide. It needs no account or key. MCP is recommended:

    claude mcp add --transport http zaira https://zairalabs.ai/guide/mcp

Without MCP, the skill uses the public REST API at `https://zairalabs.ai/guide/api/v1`.

## Structure

```
SKILL.md                        the entry point: when to look something up, workflow, boundaries
references/
  question-routing.md           common questions mapped to Guide calls, with REST equivalents
evals/
  trigger-evals.json            prompts that should and should not activate the skill
  question-bank.md              seed questions for the with/without-Guide decision test
```

## Maintenance

- Every REST example in `references/question-routing.md` must return results from the
  live Guide. Recheck them when the Guide's filters or category slugs change.
- Run `evals/trigger-evals.json` after any change to the `description` field, which is
  the skill's entire activation surface. The description has a 1,024-character limit.
- The guidance in this skill is informative. The Guide's own reference
  (`zaira_get_docs`) is authoritative for tool names, parameters, and limits.

## Disclaimer

This skill helps your agent gather and present information. The choice of tool, and
any purchase, license, or compliance decision that follows, is yours. Guide entries
are dated, and vendors change terms. Confirm anything decisive on the vendor's own
pages. The skill is provided "as is," without warranty of any kind; see
[LICENSE](LICENSE). Use of Zaira Labs services is governed by the
[terms of service](https://zairalabs.ai/terms).

## License

Apache License 2.0. Copyright 2026 Zaira Labs, LLC. The license governs copying,
modification, and redistribution of these materials; see [LICENSE](LICENSE) and
[NOTICE](NOTICE). It does not grant rights to the Zaira Labs trademarks. Use of Zaira
Labs services is governed by the [Zaira Labs Terms of Service](https://zairalabs.ai/terms).
