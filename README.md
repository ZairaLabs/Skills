# Skills

Agent Skills from [Zaira Labs](https://zairalabs.ai), built on the
[Zaira Guide](https://zairalabs.ai/guide) and the open
[Zaira Standard](https://zairalabs.ai/standard/v0.9).

Each subdirectory is a self-contained skill in the
[Agent Skills](https://agentskills.io) format (a `SKILL.md` plus its reference
files), usable by any agent that supports the format (Claude Code, Cursor, and
others).

## Skills

- [`choosing-developer-tools`](./choosing-developer-tools): choose developer tools
  with current, verified facts. Before your agent picks, compares, or adopts a tool or
  hosted service, it checks the Zaira Guide for pricing, free tiers, licenses, MCP
  support, compliance, and maintenance status. It then runs a lifecycle check on the
  tool you pick. It stays quiet for default libraries, version bumps, and CVE patching.
- [`building-for-agents`](./building-for-agents): make a developer tool
  agent-ready. It classifies which parts of the standard apply to what you are
  building, runs a repo-grounded gap review, implements fixes with the
  trade-offs stated, and verifies every change locally. It does not produce
  Zaira scores or designations; its findings are qualitative (met / gap /
  at-risk).

## Install

**Claude Code plugin marketplace.** Add this repo as a marketplace, then install the
skill you want:

    /plugin marketplace add ZairaLabs/Skills
    /plugin install choosing-developer-tools@zaira-labs
    /plugin install building-for-agents@zaira-labs

The `choosing-developer-tools` plugin also connects the Zaira Guide's MCP server, so
there's nothing else to set up.

**Any agent that supports the Agent Skills format.** Copy the skill directory into
your agent's skills directory. For Claude Code:

    git clone https://github.com/ZairaLabs/Skills
    cp -r Skills/choosing-developer-tools ~/.claude/skills/
    cp -r Skills/building-for-agents ~/.claude/skills/

When you copy `choosing-developer-tools` this way, connect the Zaira Guide over MCP as
well. It needs no account or key:

    claude mcp add --transport http zaira https://zairalabs.ai/guide/mcp

Each skill's README has details:
[`choosing-developer-tools`](./choosing-developer-tools/README.md) and
[`building-for-agents`](./building-for-agents/README.md).

## License

Each skill directory carries its own license. Both `choosing-developer-tools` and
`building-for-agents` are licensed under the Apache License 2.0
([choosing-developer-tools](./choosing-developer-tools/LICENSE),
[building-for-agents](./building-for-agents/LICENSE)).
The Zaira Labs marks are not licensed, and reliance on the guidance and
use of Zaira Labs services are governed by the
[Zaira Labs Terms of Service](https://zairalabs.ai/terms).
