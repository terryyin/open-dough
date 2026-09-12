# Open Dough finding names

Internal maintainer catalog for stable process-finding identities. Namespace:
`ODF-NNN`. This file is Open Dough source-only; it is not part of the released
payload.

Allocate a code only from supported supplied feedback. Empty scaffolding is
not a finding. Do not add occurrence history, recurrence counts, or execution
rows.

## Entry shape

Each allocated finding uses one heading and these fields only:

- **Meaning:** the concrete issue, not a wording or symptom label
- **Source mappings:** `source-project / local-code`, qualified by revision or
  occurrence locator when one source code spans more than one issue
- **References:** compact evidence or change locators used for the naming
  decision

The heading carries the code as `## ODF-NNN — <short title>`.

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
