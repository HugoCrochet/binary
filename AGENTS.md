# AGENTS.md

Operating guidelines for AI agents working on Binary. Codex reads this file
natively; Claude Code reads `CLAUDE.md`. Both files share the behavioral
guidelines in section 1; this file adds project context and review instructions
that Codex needs as a standalone reference.

**Tradeoff:** these guidelines bias toward caution over speed. For trivial
tasks, use judgment.

---

## 1. Behavioral Guidelines

### 1.1 Think Before Coding

Do not assume. Do not hide confusion. Surface tradeoffs.

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them. Do not pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what is confusing. Ask.

### 1.2 Simplicity First

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No flexibility or configurability that was not requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Test: would a senior engineer say this is overcomplicated? If yes, simplify.

### 1.3 Surgical Changes

Touch only what you must. Clean up only your own mess.

When editing existing code:

- Do not improve adjacent code, comments, or formatting.
- Do not refactor things that are not broken.
- Match existing style, even if you would do it differently.
- If you notice unrelated dead code, mention it. Do not delete it.

When your changes create orphans:

- Remove imports, variables, or functions that your changes made unused.
- Do not remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the user's request.

### 1.4 Goal-Driven Execution

Define success criteria. Loop until verified.

Transform tasks into verifiable goals:

- "Add validation" -> "Write tests for invalid inputs, then make them pass"
- "Fix the bug" -> "Write a test that reproduces it, then make it pass"
- "Refactor X" -> "Ensure tests pass before and after"

For multi-step tasks, state a brief plan with verification per step.

### 1.5 Project Conventions

**Language and style**

- Chat with the user in French unless they ask otherwise.
- Code and comments should follow the existing file language and style.
- Keep prose direct. If a sentence does not add information, delete it.
- Avoid broad rewrites when a targeted edit is enough.

**Data safety**

- Never commit real financial exports, raw bank CSVs, database files, backups,
  secrets, credentials, or screenshots containing personal financial data.
- Do not delete project notes or documentation unless explicitly requested.
- Treat imported financial data as sensitive, even in local development.

**What not to do**

- Do not silently change product assumptions, import semantics, category rules,
  financial calculations, storage format, or security posture.
- Do not make scripts portable by inventing new path logic unless requested.
- Do not touch application code during documentation-only tasks.
- Do not use raw notes as source of truth without checking current code and
  maintained docs.

---

## 2. Project Context

### 2.1 What This Project Is

Binary is a local-first personal finance dashboard for a small group of users.
The goal is to track day-to-day finances, budget, investments, loans and net
worth from manually imported financial files.

The current product direction is intentionally simple:

- manual CSV imports instead of automatic bank synchronization;
- human review before imported transactions become part of the trusted data;
- local-first storage and processing by default;
- no hosted multi-user product until security and authentication are explicitly
  designed.

### 2.2 Repository Map

- `src/app/`: application routes and pages.
- `src/components/`: navigation and reusable UI components.
- `src/lib/`: local utilities and stores.
- `doc/`: maintained project documentation.
- `Todo.md`: working project TODO and planning notes.
- `README.md`: concise GitHub entry point.

### 2.3 Discussion Before Implementation

When the user starts discussing a feature, architecture choice, or product
direction, do not implement immediately. Clarify the goal, ask useful questions
and compare options until a solution is explicitly selected.

Once the solution is selected:

- implement directly if the change is small and obvious;
- propose and follow a short plan if the implementation is larger or risky.

If the user asks for a concrete fix or cleanup, proceed without unnecessary
process.

---

## 3. Review Instructions

These instructions are used when Codex is asked to review changes. They
override generic review heuristics.

### 3.1 Diff Review Priorities

Surface these first:

1. **Behavioral regressions** introduced by the diff: a route, state shape,
   storage schema, parser contract, category rule, environment variable,
   function signature, or UI workflow that changed and could break callers
   elsewhere.
2. **Data safety failures**: code paths that expose real financial data, send it
   to external services, persist it unexpectedly, or destroy raw import context.
3. **CSV and financial correctness**: amount signs, dates, currencies, duplicate
   detection, account mapping, category validation, balances and investment
   calculations.
4. **Frontend correctness**: hydration mismatches, non-deterministic initial
   render, broken responsive layout, inaccessible controls, or charts that hide
   important values.
5. **Local-first architecture**: changes that introduce hosting, auth, network
   sync, server persistence or third-party services without an explicit product
   decision.
6. **New imports or dependencies** that add maintenance, security, bundle size
   or install complexity without a concrete need.

### 3.2 Holistic Review Constraints

A holistic review is wanted, but it must be short and selective.

- Maximum 3 holistic findings per review.
- Prioritize: dependency graph health, modules that cause concrete maintenance
  pain, unvalidated env vars or paths where failure would be silent/confusing.
- Do not raise generic process suggestions unless the user asked for them:
  adding CI, adding pre-commit, adding type checkers, adding packaging metadata,
  or converting standalone tests to pytest.
- Do not raise repository hygiene complaints unless they affect the requested
  task or create a concrete failure.
- Do not raise stylistic refactors when behavior is unchanged.
- Do not use "consider" or "you might want to" findings. Raise concrete,
  demonstrable issues only.

### 3.3 Output Format

For review outputs, use this structure:

1. **Diff findings** ordered by severity: `critical -> high -> medium -> low`.
2. **Open questions / assumptions** when needed.
3. **Summary** with a brief count and overall assessment.

If the diff has no in-scope issues, say so clearly and mention remaining test
gaps or residual risk.

### 3.4 Review Style

- Terse. One or two sentences per finding when possible.
- State what is wrong and what to change.
- Severity definitions:
  - **critical**: data loss, data exposure, silent wrong financial results,
    security.
  - **high**: regression that breaks working code or core user workflows.
  - **medium**: subtle bug, fragile assumption, hidden coupling.
  - **low**: minor but concrete improvement.

---

## 4. Notes For Working On The Codebase

- The repository contains `CLAUDE.md` with the same behavioral guidelines as
  section 1. If you edit one, consider whether the other should follow.
- The repo is developed on macOS. Avoid machine-specific assumptions unless
  they are explicitly documented.
- When updating docs, keep public information in `README.md`, planning in
  `Todo.md`, and durable decisions or implementation notes in `doc/`.
- Do not introduce authentication, hosting, external sync, or durable storage
  choices without an explicit product decision.
