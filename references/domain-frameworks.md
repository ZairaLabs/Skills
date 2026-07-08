# Domain Module: Frameworks & Libraries (FL1-FL3)

**Applies to:** web frameworks, ORMs, UI libraries, build tools.

Frameworks are where agents *write code*, and the framework's job for an agent user is feedback speed. A type error caught in milliseconds costs nothing. The same mistake surfacing at runtime costs a debugging loop. All three criteria in this module are versions of one idea: move error detection as early as possible in the agent's generate-check-fix cycle.

Criterion IDs reference the [Zaira Standard v0.9](https://zairalabs.ai/standard/v0.9).

---

## FL1. Type System Quality (SHOULD, Standard ×1)

**Goal:** the type system constrains agent-generated code at compile time, thoroughly enough that "it typechecks" means something.

**What good looks like:** type definitions covering the core API at minimum. Types across the full surface, schema-generated types, and strong inference in the middle. Branded or nominal types preventing ID confusion, error-state typing, and typecheck performance that stays fast as projects grow at the strong end.

**How to get there:** types are the tightest feedback loop an agent has, milliseconds instead of a runtime round trip, and agents lean on them harder than humans do because they typecheck constantly as they generate. The build-out: cover the full public surface. An `any` at a boundary silently disables checking for everything that flows through it, so audit for these. Generate types from schemas where a schema exists (the Prisma and GraphQL codegen pattern gives you types that cannot drift from reality). At the strong end, branded types for identifiers, so `CustomerID` and `OrderID` stop being interchangeable strings. ID confusion is one of the most common agent-generated bugs, and nominal typing deletes the whole class.

**Trade-offs:** typecheck *performance* is part of this criterion, not a nicety. Heavily generic type-level programming that makes checks take minutes throttles an agent's entire work loop. Expressiveness that costs feedback speed is a bad trade for agent consumers. Profile before shipping clever types.

**Verify:** grep the public surface for `any`-typed exports. Introduce a wrong-but-plausible usage (swap two ID arguments) and see whether the compiler objects. Time a cold typecheck on a realistic project.

---

## FL2. Scaffolding & Code Generation (MAY, Standard ×1)

**Goal:** generators and templates work non-interactively. Scaffolding that hangs on an arrow-key menu is scaffolding agents cannot use.

**What good looks like:** a scaffolding CLI that can generate with defaults via flags at minimum. Project and component generators with every prompt bypassable in the middle. Full `--yes`/`--defaults` operation, immediately buildable output, and generated agent context (an `AGENTS.md` in the scaffold) at the strong end.

**How to get there:** scaffolding is disproportionately valuable to agents. A generated-correct starting structure beats hand-construction from possibly stale training data. But interactive prompt UIs make it inaccessible; CLI1's rules apply to generators too. Every prompt needs a flag, and non-TTY should auto-select defaults. Two properties matter beyond flag coverage. First, generator output must build and run immediately. Agents trust scaffold output as ground truth, and a scaffold that needs fixes teaches the agent wrong patterns from its first minute in your ecosystem. Second, the strong-end move: emit an `AGENTS.md` into the scaffold. The generator knows exactly what it created. Writing that knowledge down for the next agent is nearly free and pays on every subsequent session in that project (B1's logic, seeded at project birth).

**Trade-offs:** a MAY criterion. If you must choose, non-interactive flags on the existing generator beat building new generator surface. The blocker is the prompt, not the feature count.

**Verify:** run the scaffolder with stdin closed and only flags. Then build and run its output untouched. Both must succeed.

---

## FL3. Configuration Validation (SHOULD, Standard ×1)

**Goal:** configuration errors are caught at generation time with actionable messages, not at runtime, three steps removed from the mistake.

**What good looks like:** runtime validation with clear messages at minimum. A published JSON Schema and validation at startup in the middle. A standalone `validate`, `check`, or `lint` command runnable without starting the app, fix suggestions in errors, and type-safe config at the strong end.

**How to get there:** agents generate configuration constantly, and deferred failure is expensive for them in a specific way. A config mistake surfacing as a runtime crash inside the framework looks like an application bug and sends the agent debugging the wrong layer. Three moves. Publish a JSON Schema for every config file; it's the single highest-leverage item, agents validate at generation time, editors validate for humans, and one artifact serves both (the `tsconfig.json` pattern, CLI4's logic applied to framework config). Provide standalone validation, a command that checks config without booting the application, so validation can run in CI and in an agent's inner loop. And write errors as instructions. "Unknown key `middlewares` at line 12, did you mean `middleware`?" is a fix. "Invalid configuration object" is a shrug.

**Trade-offs:** essentially none. Schema-validated config helps every consumer, human and agent alike. The cost is keeping the schema in sync with config code, and generating one from the other removes even that.

**Verify:** generate a config with a plausible agent mistake (typo'd key, wrong type, misplaced nesting) and run validation. Is it caught before runtime, and does the message contain the fix?
