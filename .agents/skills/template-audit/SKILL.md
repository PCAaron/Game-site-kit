---
name: template-audit
description: >-
  Performs a read-only, evidence-based audit of a website starter template or
  repository before adoption. Maps stack, build, routing, content, SEO,
  deployment, licensing, and agent workflow fit against stated target
  requirements. Use when evaluating a new starter, onboarding a template, or
  when the user asks for a template audit, baseline audit, or adoption
  recommendation.
disable-model-invocation: true
---

# Template Audit (v0.1.0)

Systematically audit an existing website starter or project repository **before** adopting it for a target site (e.g. game portal, wiki, or embedded-game experience). Produce a structured report with evidence-backed statuses and an adoption recommendation.

**Read-only:** Do not modify the audited repository, its dependencies, or its Git history. Do not implement fixes from the report unless the user starts a separate task.

## When to use

- User requests a template / starter / baseline audit before adoption.
- User needs suitability for a **specific** target (purpose, routes, SEO, content, deployment).
- User asks whether to adopt, adopt with conditions, or reject a candidate template.

## When not to use

- Implementing Phase 3+ features, refactors, or dependency upgrades on the audited repo.
- Replacing content pipelines or merging unrelated starters without a separate authorized task.
- Running an audit as an excuse to edit application code.

## Scope and boundaries

| In scope | Out of scope |
|---|---|
| Inspect Git baseline, structure, configs, scripts | Change audited files |
| Run **existing** package scripts when feasible | Add scripts or dependencies to the audited repo |
| Compare verified capabilities to **supplied** target requirements | Universal “best template” ranking |
| One bounded quality review of the report | Endless fix-and-review loops |
| Optional extensions (clearly labeled) | Presenting proposed checks as validated facts |

## Required inputs

Collect from the user or repository context before deep inspection:

1. **Target project** — purpose, required page types / journeys, SEO expectations, content model needs, deployment target, tech constraints, maintenance expectations.
2. **Audit scope** — repository root path; whether the repo is the raw upstream template or a fork (e.g. Site Kit).
3. **Optional** — phase spec or charter for the adopting project (use for constraints, not as substitute for inspecting the audited tree).

If essential target information is missing, ask **focused** questions (not a long questionnaire). Record unanswered items as `Unknown` in the report.

## Preconditions (stop and report if violated)

- You must not need write access to complete a read-only audit.
- If the worktree has unrelated uncommitted changes the user did not authorize you to ignore, stop and ask before proceeding.
- Do not mark capabilities `Validated` from README claims alone.

## Workflow

Copy and track progress:

```text
Template audit progress:
- [ ] Step 1 — Understand the target
- [ ] Step 2 — Establish repository baseline
- [ ] Step 3 — Inspect actual implementation
- [ ] Step 4 — Evaluate audit dimensions
- [ ] Step 5 — Assess suitability
- [ ] Step 6 — Produce the audit report
- [ ] Step 7 — Bounded quality review (one pass)
```

### Step 1 — Understand the target

Document explicit requirements: page types, SEO, content, deployment, constraints. Separate **must-have** vs **nice-to-have**. Note what is inferred vs stated.

### Step 2 — Establish repository baseline

Inspect without modifying:

- `git status`, branch, `HEAD`, remote/origin, tags, merge-base vs upstream if relevant
- License files (`LICENSE`, `COPYING`, etc.)
- Lockfiles and package manager (`package.json`, `yarn.lock`, `pnpm-lock.yaml`, etc.)
- Top-level structure

Record exact commit SHA and reproducibility notes.

### Step 3 — Inspect actual implementation

Prefer source and config over documentation:

- Read `package.json` scripts; **do not assume** `test`, `typecheck`, or `lint` exist.
- Trace routing (App Router vs Pages, static vs dynamic).
- Trace content pipeline (MDX, CMS, data folders, build hooks).
- Trace SEO (`layout`, metadata helpers, `sitemap`, `robots`, JSON-LD).
- Note security headers, CSP, iframe-related policy if relevant to the target.

Run validation commands **only when** they exist and are safe in the environment. Record command, exit code, and outcome exactly. If not run, say so — do not invent results.

### Step 4 — Evaluate audit dimensions

Apply [audit-dimensions.md](references/audit-dimensions.md) with statuses from [evidence-rules.md](references/evidence-rules.md).

For each material finding: status, evidence (path / config / command), and applicability (required / conditional / optional check).

### Step 5 — Assess suitability

Compare **verified** capabilities and **Risk** items to target requirements:

- Reusable as-is
- Missing or partial
- Required adaptations
- Architectural constraints
- Adoption blockers (licensing, security, deployment — may override a numeric score)

If scoring, define dimensions and weights; separate evidence coverage from quality; allow `Not Applicable`; never score unverified items.

**Final recommendation** (exactly one):

- `Adopt`
- `Adopt with Conditions`
- `Do Not Adopt`
- `Insufficient Evidence`

Critical blockers must be stated even if a score is high.

### Step 6 — Produce the audit report

Use [report-template.md](references/report-template.md). Write to the location the user requests, or deliver in chat if no path is given.

### Step 7 — Bounded quality review (one pass)

Verify:

- Material findings have evidence citations
- Status labels are consistent
- Recommendation follows findings
- Unknowns are not stated as facts
- Critical blockers are visible
- No modifications were made to the audited repository

**Stop** after the report and listed follow-up checks. Do not automatically implement recommendations.

## Failure paths

| Situation | Action |
|---|---|
| Command missing or fails | Record `Unknown` or `Partial`; note environment limit |
| Cannot run build (time, OS, secrets) | Document gap; do not claim PASS |
| Contradictory docs vs code | Prefer repository evidence; record contradiction as unresolved |
| License or embed permission unclear | `Risk` + `MANUAL REVIEW`; do not `Adopt` on assumption |

## Reference material

| File | Purpose |
|---|---|
| [references/audit-dimensions.md](references/audit-dimensions.md) | Dimension checklist (required / conditional / optional) |
| [references/evidence-rules.md](references/evidence-rules.md) | Status model and evidence rules |
| [references/report-template.md](references/report-template.md) | Standard report sections |
| [examples/game-site-kit-audit.md](examples/game-site-kit-audit.md) | Worked example grounded in Game Site Kit Phase 0 (not a universal template definition) |

## Optional extensions (proposed — not validated by default)

When the target needs them, add clearly labeled sections:

- Accessibility baseline (a11y lint, semantic HTML spot-check)
- i18n / locale routing
- Monorepo or multi-site layout
- CI matrix beyond default GitHub Actions

Label conclusions from these as **proposed** unless evidence was collected in the audited repo.
