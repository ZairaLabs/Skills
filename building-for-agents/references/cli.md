# CLI Module (CLI1-CLI4)

**Trigger:** the tool has a command-line interface.

Coding agents live in the shell. They install, build, test, deploy, and operate through CLI commands constantly. They are also measurably worse at CLIs than at APIs (in Terminal-Bench, the largest evaluation of agent CLI usage to date, the best configuration in the benchmark paper resolved only 62.9% of tasks), and most of the gap comes from design choices that assume a human is watching the terminal: prompts, pagers, colored table output, platform-specific behavior.

Criterion IDs reference the [Zaira Standard v0.9](https://zairalabs.ai/standard/v0.9).

---

## CLI1. Non-Interactive Execution (SHOULD, Standard ×1)

**Goal:** every command can run with no human at the terminal. No prompts, no editors, no TTY-dependent behavior.

**What good looks like:** bypass flags for some prompts at minimum. Flags for most prompts, CI-mode detection, and `--json` in the middle. Auto-detected non-TTY environments, flags for every interactive point, JSON-implies-non-interactive, `NO_COLOR` support, and clean stderr/stdout separation at the strong end.

**How to get there:** interactive prompts are the top hard blocker for agent CLI use, and the traps extend past confirmation dialogs. Pagers (the AWS CLI's default pager broke thousands of CI pipelines), editor invocations, and TTY-dependent output all hang automation. The moves: a bypass flag for every prompt (`--yes`, `--non-interactive`). Auto-detect non-TTY and suppress prompts, pagers, and color automatically. Treat `--json` as implying non-interactive (Terraform's pattern: `--json` implies `--input=false`). And where input is genuinely required without a TTY, fail fast with an error naming the missing flag. Hanging on a hidden prompt is the worst outcome, because the agent waits on a question it cannot see.

**Trade-offs:** auto-confirming destructive commands is not the goal. For those, non-interactive mode should require the explicit flag and fail loudly without it. That's WO1's confirmation logic done right for a CLI.

**Verify:** run every major command with stdin closed and no TTY (`< /dev/null`, or in CI). Nothing may hang, and anything that must fail should name its bypass flag.

---

## CLI2. Structured Output Mode (SHOULD, Standard ×1)

**Goal:** machine-parseable output exists alongside the human-readable kind. Without it, agents parse your formatted text with regexes that break on every cosmetic change.

**What good looks like:** `--json` on primary commands with basic exit codes at minimum. JSON on all major commands, meaningful exit codes, clean stream separation, and `NO_COLOR` in the middle. Stability-guaranteed formats (Git's `--porcelain`), semantic exit codes per failure mode, and structured-implies-non-interactive at the strong end.

**How to get there:** add `--json` to every command that produces output, and hold the schema as stable as an API response. It *is* an API response. Keep stdout pure data and diagnostics on stderr. Stream mixing (npm errors on stdout, Docker's interleaving bugs) silently corrupts JSON parsing downstream. Use distinct exit codes for distinct failure classes so scripts and agents can branch without parsing prose. A documented stability guarantee on the structured format is cheap to write and exactly what agents and their training data can rely on.

**Trade-offs:** committing to a stable output schema constrains future changes. Version the schema (`--format json2` or a version field) rather than mutating it in place.

**Verify:** run `<cmd> --json | jq .` on every major command. Force an error and confirm stdout stayed clean and the exit code is meaningful.

---

## CLI3. Cross-Platform Consistency (SHOULD, Standard ×1)

**Goal:** the CLI behaves identically on Linux, macOS, and Windows. Agents generate Linux-flavored commands by default and fail silently where platforms diverge.

**What good looks like:** availability on all three at minimum. Consistent output and path handling with no platform-specific shell syntax required in the middle. Three-platform CI, byte-identical output, and single-static-binary distribution at the strong end.

**How to get there:** the failure pattern is well documented. Agents trained predominantly on Linux and macOS emit commands that break on Windows (path separators, line endings, shell quoting, temp locations), and none of the major coding agents passed the Windows variant of the standard benchmark. Your job is to keep the divergence out of your tool. Accept both path separators. Avoid requiring platform-specific shell constructs in documented usage. Add Windows to CI, the step most tools skip. Distribute as a static binary if your ecosystem allows, since no runtime dependencies means no platform-dependency drift.

**Trade-offs:** first-class Windows support is a real ongoing cost. If you consciously don't support Windows, document it loudly. An explicit "not supported" is something an agent can respect. A silent difference is something it discovers by corrupting output.

**Verify:** run the CI suite (or the top five commands) on all three platforms and diff the outputs.

---

## CLI4. Configuration Format Safety (MAY, Standard ×1)

**Goal:** the configuration format is safe for agents to generate. No silent structural corruption, and validation available before anything runs.

**What good looks like:** documented format with a JSON alternative to YAML at minimum. JSON or TOML primary with a published JSON Schema and a standalone `validate` command in the middle. Schema-driven autocompletion, validation before destructive actions, and no implicit type coercion at the strong end.

**How to get there:** YAML fails agents in two quiet ways. Whitespace sensitivity, where a single-space indent error restructures data with no parse error. And implicit coercion, the Norway problem, where `NO` becomes `false`. JSON and TOML have neither. If YAML is entrenched, don't force a migration. Accept a JSON alternative, and above all publish a JSON Schema. That single artifact lets agents validate generated config at generation time, and it's why `tsconfig.json` and `package.json` succeed with agents while templated YAML fails. Add a standalone validation command (`<tool> config validate`) so checking doesn't require running.

**Trade-offs:** a MAY criterion. The schema is the highest-value, lowest-disruption move, and it improves the human editor experience (IDE validation) as a side effect. Format migration is rarely worth the ecosystem breakage.

**Verify:** generate a config programmatically and validate it with the published schema. Then introduce a subtle error (bad indent, `country: NO`) and confirm the validator catches what the parser would have swallowed.
