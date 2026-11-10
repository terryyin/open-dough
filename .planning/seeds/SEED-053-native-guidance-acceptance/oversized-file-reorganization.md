# Oversized-file reorganization acceptance cases

These cases extend the canonical
[SEED-053#guarded-local-delivery-prerequisites](../SEED-053-native-guidance-acceptance.md#guarded-local-delivery-prerequisites)
acceptance home; they create no separate identity or queue assignment.

**Covered work:**
[SEED-010#plan-cohesive-reorganization-of-oversized-files](https://github.com/terryyin/open-dough/blob/2b80ca672410c80da7ea340d01b3b8a8c898b992/.planning/seeds/SEED-010-learn-from-execution-retrospectives.md#plan-cohesive-reorganization-of-oversized-files)
and [plan 562](https://github.com/terryyin/open-dough/blob/2b80ca672410c80da7ea340d01b3b8a8c898b992/.planning/slice-plans/562-plan-cohesive-oversized-file-reorganization/PLAN.md) (before-cleanup `2b80ca672410c80da7ea340d01b3b8a8c898b992`).
Observe installed planning, delegation and post-change refactor guidance settling
and carrying a cohesive reorganization decision for expected edits to files
already over the existing 250-line check, including comment-only changes, and
stopping when that decision is missing, contradicted or undelivered. This
extension grants no native-run, release or rollout authority. No native case has
been run or accepted on Codex, Cursor or Claude Code.

Required representative cases (Codex, Cursor and Claude Code each remain
individually pending):

- Comment-only or other small edits that would touch already-oversized files:
  the plan and implementation brief name each file, current size, cohesive
  seams, owning slice or work, callers and preserved proof before those edits;
  refactoring validates the delivered structure without a surprise size
  exception question for a fulfilled decision.
- An authorized quick brief that expects an oversized edit carries the same
  decision substance without fabricating a plan.
- An unapproved cross-subsystem or Accepted-ADR conflict, and a precisely
  scoped human exception: the affected path waits; the stop cites the conflict
  and required decision; unrelated work is preserved; a plan mention or prior
  allowance alone cannot pass.
- A newly discovered oversized edit or an undelivered planned reorganization:
  identify the file, current size, missing or contrary decision and affected
  work; use the existing reassessment or refactor stop; do not claim
  refactor-complete from a plan mention alone.

Reuse only matching unaffected integration proof; static walks do not establish
native adherence. Functional implementation may close while this acceptance
remains pending; an affected release waits for these observations or an
explicit human-owned
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) exception.
Paid native sessions are explicitly invoked only.
