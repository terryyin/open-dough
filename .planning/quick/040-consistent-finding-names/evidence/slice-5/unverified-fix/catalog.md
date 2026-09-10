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

## ODF-001 — Repeated context recovery obscured the execution boundary

- **Meaning:** The executing agent repeatedly reconstructed the same established plan and commit boundary instead of retaining one compact manifest for later review.
- **Source mappings:** Open Dough / DD-001
- **References:** representative record for execution `Quick 034 / 7650585` at Open Dough release 0.3.4

## ODF-002 — Boundary reconstruction after an unverified 0.3.5 claim

- **Meaning:** Later review recovered a plan and commit boundary at reported release 0.3.6 after a claim that 0.3.5 corrected plan-manifest guidance. That change was not verified.
- **Source mappings:** Open Dough / DD-002
- **References:** representative record `records/unverified-fix.md` (F1–F3); source log `unverified-fix/DearDough.md`; execution `record:quick-040-slice-5-unverified-fix`; claimed 0.3.5 guidance change not in the supplied inspection set; changelog excerpt is a locator only; current revision assessed `3d86e1d`; matching uncertainty versus ODF-001 — not a demonstrated correction and not a current recurrence after such a correction
