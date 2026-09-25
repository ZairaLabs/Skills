# Question bank (seed)

These are seed questions for a decision-time test of this skill. Each question gets
two answers: one from the model alone, and one from the model with this
skill and the Guide. Each answer is graded against the vendor's current pages:

- **Correct:** are the facts that decide the choice right as of today?
- **Current:** does it name anything that changed since the model's training data?
- **Decision changed:** would a reader choose differently after the Guide-backed
  answer?

Each question has a tier:

- **Tier 3:** a hosted service with terms.
- **Tier 2:** a framework or dev tool with real tradeoffs.
- **Lifecycle:** "is it still…" questions.
- **Control:** a default building block. Expect no gain, and a cost if the skill
  fires.

| # | Tier | Question |
|---|---|---|
| 1 | 3 | Which managed Postgres has a free tier and an official MCP server? |
| 2 | 3 | Auth for a B2B SaaS: we need SSO, SOC 2, and a free tier to start. |
| 3 | 3 | Cheapest way to send about 5,000 transactional emails a month? |
| 4 | 3 | Hosted vector database with a free tier for a prototype? |
| 5 | 3 | Where should we deploy a small FastAPI service with a free tier? |
| 6 | 3 | Error monitoring with a free tier and HIPAA eligibility? |
| 7 | 3 | Data pipeline tool (ELT) with a free tier for a solo developer? |
| 8 | 3 | Feature flags service with a free tier and an MCP server? |
| 9 | 2 | Vitest or Jest for a new Vite + React project? |
| 10 | 2 | Drizzle or Prisma for a Cloudflare Workers app? |
| 11 | 2 | Which Rust CLI framework should a new tool use? |
| 12 | 2 | Biome or ESLint + Prettier for a new TypeScript monorepo? |
| 13 | Lifecycle | Is Airbyte Cloud still free for personal use? |
| 14 | Lifecycle | Can we use MediatR 13 in a commercial product without a license? |
| 15 | Lifecycle | Is the npm `request` package maintained? What replaced it? |
| 16 | Lifecycle | Who owns Neon now, and did anything change for the free plan? |
| 17 | Lifecycle | Does gitleaks-action need a license for organization repos? |
| 18 | Lifecycle | Is Sonatype OSSRH still how we publish to Maven Central? |
| 19 | Control | Which UUID library should I use in Node? |
| 20 | Control | Should I use `requests` for HTTP calls in this Python script? |

Grow this to about 100 questions drawn from real tool-choice moments in agent
sessions.
