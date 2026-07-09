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

Each skill directory carries its own license; `building-for-agents` is
licensed under the [Apache License 2.0](./building-for-agents/LICENSE).
The Zaira Labs marks are not licensed, and reliance on the guidance and
use of Zaira Labs services are governed by the
[Zaira Labs Terms of Service](https://zairalabs.ai/terms).
