# Template audit report template

Copy this structure into the deliverable. Replace placeholders; delete sections marked optional when not applicable.

```markdown
# Template audit — [Template name or repo]

> **Audit date:** YYYY-MM-DD  
> **Audit type:** Read-only  
> **Audited repository:** [path or URL]  
> **Audited commit:** `[full SHA]`  
> **Auditor context:** [environment: OS, Node, package manager if relevant]

---

## 1. Executive summary

[3–6 sentences: what the template is, overall fit, recommendation, top risks.]

**Recommendation:** `Adopt` | `Adopt with Conditions` | `Do Not Adopt` | `Insufficient Evidence`

---

## 2. Target project requirements

| Requirement | Source | Priority (must / should / nice) |
|---|---|---|
| [e.g. game catalog pages] | [user / charter] | must |

**Gaps in input:** [list assumptions and unanswered questions]

---

## 3. Repository baseline

| Item | Value |
|---|---|
| Remote / origin | |
| Branch | |
| Commit | |
| License | |
| Upstream template (if any) | |
| Reproducibility notes | |

---

## 4. Technology stack

| Component | Version / tool | Evidence |
|---|---|---|
| Framework | | |
| Runtime | | |
| Package manager | | |
| Content | | |

---

## 5. Audit results by dimension

For each dimension: summary paragraph + table.

| Check | Status | Evidence | Notes |
|---|---|---|---|
| [check name] | Validated / Partial / Missing / Unknown / Risk | path or command | |

Dimensions:

1. Repository baseline  
2. Tech stack  
3. Build system  
4. Routing  
5. Content system  
6. SEO foundation  
7. Extensibility  
8. Deployment  
9. Security and license  
10. Agent compatibility  

---

## 6. Evidence and validation commands

| Command | Exit code | Result | Session / historical |
|---|---|---|---|
| | | PASS / FAIL / N/A / not run | |

**Documentation vs implementation conflicts:** [if any]

---

## 7. Reusable capabilities

Bullet list with evidence pointers — capabilities verified without major change.

---

## 8. Missing capabilities

Relative to **target requirements**, not relative to an ideal generic site.

---

## 9. Risks and blockers

| ID | Severity | Status | Description | Evidence |
|---|---|---|---|---|
| | P0–P2 / blocker | Risk (+ other) | | |

---

## 10. Required adaptations

Ordered list of changes needed before or during adoption (do not implement in this audit).

---

## 11. Suitability assessment

### Fit summary

| Dimension | Weight | Score or N/A | Evidence coverage |
|---|---|---|---|
| | | | |

**Critical blockers (independent of score):** [list]

---

## 12. Final recommendation

**Recommendation:** [one of four allowed values]

**Conditions (if Adopt with Conditions):** [numbered list]

**Rationale:** [tie to sections 5, 8, 9]

---

## 13. Unknowns and follow-up checks

| Unknown | Why unknown | Suggested check |
|---|---|---|
| | | |

---

## Appendix (optional)

- File inventory highlights  
- Upstream diff summary  
- Links to ADRs / prior audits  
```

## Table conventions

- Use **Status** column values from [evidence-rules.md](evidence-rules.md) only.
- Prefer one row per material check; merge trivial items in narrative if needed.
- When citing historical validation (not re-run this session), label **Historical** and include commit SHA.
