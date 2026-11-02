# Evidence and status model

Every **material** audit conclusion must be traceable to repository evidence or to an explicitly recorded command execution.

## Status values

Use these consistently in tables and narrative:

| Status | Meaning |
|---|---|
| **Validated** | Direct repo evidence or a command you actually ran confirms the capability or fact. |
| **Partial** | Capability exists but coverage, quality, or environment support is incomplete. |
| **Missing** | A capability required **for the stated target** is confirmed absent (not merely unverified). |
| **Unknown** | Insufficient evidence; check not performed or inconclusive. |
| **Risk** | Concrete adoption, maintenance, compatibility, security, or licensing concern supported by evidence. |

**Risk** may coexist with another status (e.g. `Validated` + `Risk`: build passes but CSP blocks iframe embed).

## Rules

1. **Never** mark `Validated` from README, marketing copy, or comments alone.
2. Distinguish **documentation claims** from **implementation evidence** (file path, config key, script output).
3. For each material conclusion, record at least one of: file path, config snippet location, script name, or command + exit code.
4. Record command results **only when executed** in the audit session; cite historical reports separately (“historical evidence at commit X”).
5. If a check cannot run (missing script, OS, secrets, time), use `Unknown` and explain why.
6. Do not invent versions, URLs, permissions, license terms, or test outcomes.
7. Do not present **proposed** architecture or **optional extension** checks as implemented capabilities.

## Evidence types (preferred order)

1. **Executable verification** — e.g. `yarn build` exit 0 with noted output (same session).
2. **Configuration** — `next.config.js`, `contentlayer.config.ts`, workflow YAML.
3. **Source behavior** — route files, metadata generation, data loaders.
4. **Lockfiles / manifests** — resolved dependency versions.
5. **Third-party docs** — only for upstream template identity or license text copied into the repo; still verify files exist locally.

## Validated vs Partial (examples)

| Finding | Status | Why |
|---|---|---|
| `sitemap.ts` exists and lists blog routes | Validated | File inspection |
| Blog `canonicalUrl` in schema but not wired in `generateMetadata` | Partial | Schema + page metadata inspection |
| README claims “full i18n” but no locale routes | Partial or Missing | Code inspection contradicts README |
| `yarn test` not run this session; no test script in package.json | Missing (test harness) / Unknown (behavior) | Script list evidence |

## Suitability scoring (optional)

If the report includes a score:

- Define dimensions and weights in the report.
- Separate **evidence coverage** (% of checks performed) from **fit score**.
- Allow **Not Applicable** per dimension.
- Do not award points for unverified capabilities.
- State **critical blockers** outside the numeric total.

## Recommendation guardrails

| Blocker type | Typical effect |
|---|---|
| License incompatible with target use | `Do Not Adopt` or `Adopt with Conditions` + legal review |
| Deployment mode incompatible (e.g. SSR required, template export-only) | `Do Not Adopt` unless adaptation plan accepted |
| Security policy blocks target UX (iframe, third-party scripts) | `Adopt with Conditions` or `Do Not Adopt` |
| Insufficient time / access to run build | `Insufficient Evidence` if blockers cannot be ruled out |

A high fit score must **not** override an unresolved critical licensing, security, or deployment blocker.
