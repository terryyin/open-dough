# Open Dough finding names

Internal maintainer catalog for stable process-finding identities. Namespace:
`ODF-NNN`. This file is Open Dough source-only; it is not part of the released
payload.

Allocate a code only from supported supplied feedback. Empty scaffolding is
not a finding. Retain finding-relevant supplied evidence under its identity,
independently of source-project code adoption. Existing naming-only entries
remain valid; do not fabricate or backfill their history.

## Entry shape

Each allocated finding keeps these identity fields:

- **Meaning:** the concrete issue, not a wording or symptom label
- **Source mappings:** `source-project / local-code`, qualified by revision or
  occurrence locator when one source code spans more than one issue
- **References:** compact evidence or change locators used for the naming
  decision

The heading carries the code as `## ODF-NNN — <short title>`.

### Retained evidence

Under the same ODF heading, reuse the process log's occurrence shape, adding
source attribution:

```markdown
### Occurrences

- Execution: <stable execution identity>
  - Source: <source project / supplied code; source occurrence locator>
  - Tool: <executing tool>
  - Model: <when supplied>
  - Open Dough release: <version | unknown | unreleased | modified; supplied revision/base>
  - Evidence: <compact decisive references>
  - Observed effect: <what the supplied record shows>
  - Inference: <qualified cause, cost, confidence, unknowns or counterevidence, when relevant>
```

Preserve supplied execution and revision provenance; unknown stays unknown.
Do not substitute today's checkout, installed version, or reviewing tool. Keep
observations separate from inferences and retain consequential uncertainty.
If execution identity or executing tool is missing, retain the supplied evidence
and limitation as an **Evidence note**, without inventing a countable occurrence.
Naming references alone are not occurrence evidence.

Within an identity, the same source project and execution identify one
occurrence; source-code adoption or another symptom does not add one. A distinct
supported execution adds one row. Identical replay leaves the entry byte-identical;
merge only newly supplied decisive evidence into an existing row or note. When
missing provenance becomes available, complete that evidence rather than duplicate
it. Keep uncertain matches under their separately resolved identity. Rows are
the visible count; add no redundant total or inferred recurrence.

An optional **Follow-up** records an explicitly selected disposition or linked
story under [triage-retrospective-findings](../../.agents/skills/triage-retrospective-findings/SKILL.md).
Ranking alone leaves this catalog unchanged. Preserve identity fields, evidence,
and unrelated notes when recording authorized follow-up.

## Findings

## ODF-001 — Mixed execution changes obscure commit provenance

- **Meaning:** Committing an execution outcome together with separately described cleanup obscures that execution's review scope and attribution.
- **Source mappings:** Open Dough / DD-001
- **References:** `DearDough.md`, DD-001; `519bb4a`.

## ODF-002 — Planless Taken work lacks closure evidence

- **Meaning:** An intentionally planless execution cannot supply the plan-based evidence required by its wrap-up closure contract.
- **Source mappings:** Open Dough / DD-002
- **References:** `DearDough.md`, DD-002; `519bb4a`; historical report with human-authorized one-off closure on 2026-09-10.

## ODF-003 — File-type assumptions skipped affected maintained proof

- **Meaning:** Treating runtime Markdown changes as having no applicable maintained tests misses an affected contract and delays detection until CI.
- **Source mappings:** Open Dough / DD-003
- **References:** `DearDough.md`, DD-003; release `0.3.8`; `8a1be3c`; `ci-supported-host-contract.test.mjs`; repair `2272133`.

## ODF-004 — Exact CI repair recovery preserved in-progress slice work

- **Meaning:** Pausing the active slice and preserving its exact stash allowed isolated CI repair and resumption with in-progress work intact; this is a positive recovery finding.
- **Source mappings:** Open Dough / DD-004
- **References:** `DearDough.md`, DD-004; release `0.3.8`; `8a1be3c`; CI run `34550693158`; repair `2272133`.

## ODF-005 — Installed and unreleased execution guidance competed for authority

- **Meaning:** Installed plan-required execution guidance and unreleased quick-execution guidance impose conflicting entry conditions during maintainer execution.
- **Source mappings:** Open Dough / DD-005
- **References:** `DearDough.md`, DD-005; `30a5026`; assessed source report at unreleased revision `533da34`, base `0.3.8`; installed and source `dough-execute-plan/SKILL.md`.

## ODF-006 — Oversized context reads obscure narrow execution inputs

- **Meaning:** Bundling broad skill references and planning documents into oversized reads can truncate required context and force avoidable rereading during a narrow execution.
- **Source mappings:** Open Dough / DD-006
- **References:** `DearDough.md`, DD-006; `0120ac3`.

### Occurrences

- Execution: `SEED-010#retain-reconciled-findings-in-open-dough @ 0120ac3`
  - Source: Open Dough / DD-006; canonical `DearDough.md` occurrence
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: Combined reads of SEED-010, four `dough-execute-plan` references,
    and later reconciliation, triage, and context material returned truncated
    output; `execution-decisions.md` and bundled retrospective documents were
    subsequently read again.
  - Observed effect: Required guidance was not fully visible in the original
    outputs, so the execution performed additional reads for the same
    single-slice work.
  - Inference: Selecting sections for concrete unresolved questions and sizing
    outputs to fit may reduce avoidable rereading without omitting required
    review or proof; net time and token cost were not measured, and no decisive
    match to an existing local issue was found.
