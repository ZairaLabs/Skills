# Skills

Agent Skills from [Zaira Labs](https://zairalabs.ai), grounded in the open
[Zaira Standard](https://zairalabs.ai/standard/v0.9).

Each subdirectory is a self-contained skill in the
[Agent Skills](https://agentskills.io) format (a `SKILL.md` plus its reference
files), usable by any agent that supports the format (Claude Code, Cursor, and
others).

## Skills

- [`building-for-agents`](./building-for-agents): make a developer tool
  agent-ready. It classifies which parts of the standard apply to what you are
  building, runs a repo-grounded gap review, implements fixes with the
  trade-offs stated, and verifies every change locally. It does not produce
  Zaira scores or designations; its findings are qualitative (met / gap /
  at-risk).

## License

Proprietary to Zaira Labs, LLC. Use is governed by the
[Zaira Labs Terms of Service](https://zairalabs.ai/terms). See each skill's
`LICENSE`.
