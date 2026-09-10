# Slice 4 behavior walkthrough

Candidate: internal `triage-retrospective-findings` after rereview of existing
queued or Taken follow-up was added to the same skill. Reviewer: executing-
maintainer walk of `.agents/skills/triage-retrospective-findings/SKILL.md`
against isolated fixtures. Date: 2026-09-10. These are local representative
records, not native cross-tool acceptance. Exact prose is not a pass condition.

Authority: ranking remains recommendation-only until a developer selects a
proposal for queued follow-up on a finding that does **not** already record
queued or Taken follow-up. These walks used the linked slice-2 accepted state
(copies) and a Taken variant. Real `DearDough.md` and
`docs/maintainer/finding-names.md` were checksummed only; they were not used as
evidence or write targets. Fictional `ODF-901` / `ODF-902` were not allocated
in the naming catalog.

## Invocation context

The skill frontmatter and body apply when a maintainer asks to triage findings,
prioritize process findings, recommend finding follow-up, rereview already-linked
findings, queue a selected finding response, or turn a selected retrospective
finding into backlog work. They do not apply to identity allocation, catalog
writes, occurrence collection into the findings file, or non-queue dispositions
(defer / evidence request / no-change). Ranking may still recommend those
non-queue dispositions. Real `DearDough.md` is not a default path.

## Required inputs

Each walk named an explicit accumulated-evidence path and used the isolated
fixture backlog as established direction. No walk guessed repository-root
`DearDough.md`, `docs/maintainer/finding-names.md`, `.planning/seeds/`, or the
skill directory. Write destinations were named only for the attempted
re-selection stops; those stops made no edits.

## Starting snapshots

Byte-identical copies of slice-2 accepted linked state under
[`queued-starting/`](queued-starting/):

- [`queued-starting/findings.md`](queued-starting/findings.md) — `ODF-901`
  with one occurrence, unrelated maintainer note, and
  `Follow-up: queued, not resolved` plus the story link; unrelated sibling
  `ODF-902` with two distinct executions and no follow-up
- [`queued-starting/seeds/SEED-901-process-follow-up.md`](queued-starting/seeds/SEED-901-process-follow-up.md)
  — story 4 `prevent-wrap-up-from-overwriting-reviewed-commits`
- [`queued-starting/PRODUCT-BACKLOG.md`](queued-starting/PRODUCT-BACKLOG.md) —
  that story first on **Backlog list**; unrelated Taken sibling retained

Checksums match slice-2 `accepted/` (`findings.md`
`ba582bf65329da92a4aef83a0bfaff8abd2617b3ca27ac30a63435bc8dd04d46`,
`PRODUCT-BACKLOG.md`
`04a6ab9ffb229a9dfb210f86984da57c24b87f9a793f3ed48c1ab6ffb52110b9`,
seed
`39b7a47257c6c1b74098ec6127ffaae5c1d3a16e7caa99ba5d7f0b65a71ff541`).
`queued-starting/` was not edited.

Working copies: [`identical-rereview/`](identical-rereview/) and
[`new-evidence/`](new-evidence/) (plus invocation-supplied
[`new-evidence/extra-impact.md`](new-evidence/extra-impact.md)).

Taken variant starting under [`taken-starting/`](taken-starting/); working
copy [`taken-rereview/`](taken-rereview/).

## Identical rereview (same evidence)

**Inputs.** Accumulated evidence and writable finding location:
[`identical-rereview/findings.md`](identical-rereview/findings.md). Direction
and canonical backlog:
[`identical-rereview/PRODUCT-BACKLOG.md`](identical-rereview/PRODUCT-BACKLOG.md).
Existing seed:
[`identical-rereview/seeds/SEED-901-process-follow-up.md`](identical-rereview/seeds/SEED-901-process-follow-up.md).
Same evidence as the linked slice-2 result.

**Checksum before ranking.**
`ba582bf6…` findings, `04a6ab9f…` backlog, `39b7a472…` seed (full hashes in
Checksum proof).

**Read.** `ODF-901`: one distinct execution `fict-aaa111`; observed lost
Taken-work patches; Follow-up already queued with story link
`seeds/SEED-901-process-follow-up.md#prevent-wrap-up-from-overwriting-reviewed-commits`.
Matching **Backlog list** line present (not under Taken). `ODF-902`: two
distinct executions, no Follow-up.

**Proposal (actual).** Later triage of the linked `ODF-901` result.
Recommendation-only ranking first; then an attempted re-selection (below).

1. **ODF-901 — Wrap-up overwrote the reviewed execution commit** (first).
   Observed impact: the reviewed patches disappeared and had to be reconstructed
   from an uncommitted backup before later review could proceed. Distinct
   supported occurrences from the file: one execution,
   `fixture:slice-2-starting / wrap-up-overwrite @ fict-aaa111`. Confidence in
   that observation is high; the inferred wrap-up cause is not proven beyond
   this execution. Direction alignment: responding would address lost work and
   contaminated provenance, which the fixture direction prefers. Judgment: a
   severe one-off still outranks repeated minor cost for the same observed-harm
   reason as earlier slices.
   **Existing Follow-up (queued, not resolved):**
   [Prevent wrap-up from overwriting a reviewed execution commit](identical-rereview/seeds/SEED-901-process-follow-up.md#prevent-wrap-up-from-overwriting-reviewed-commits)
   — SEED-901. Queue line (Backlog list, not Taken): the same title and
   anchor on
   [`identical-rereview/PRODUCT-BACKLOG.md`](identical-rereview/PRODUCT-BACKLOG.md).
   Recommended next step: retain that existing queued follow-up. Another queued
   fix is not authorized.

2. **ODF-902 — Extra confirmation prompt before opening a short plan**
   (second). Observed impact: a few seconds of delay; both slices still
   completed. Distinct supported occurrences: two executions
   (`extra-prompt-a @ fict-bbb222`, `extra-prompt-b @ fict-ccc333`). No
   existing Follow-up. Direction alignment: low-cost recurring inconvenience
   ranked below high-severity harm. Advice only: optional later queued
   follow-up if a developer selects this finding; this walk did not select it.
   The selected-queue path for findings without follow-up remains available
   (unchanged from slices 2–3).

This ranking does not authorize queueing, seed creation, disposition
recording, or finding edits.

**Attempted re-selection.** Developer selected `ODF-901` again for queued
follow-up, naming the same writable finding, seed, and backlog copies.
Validate: the finding already records queued follow-up. **Pre-edit stop.**
Surface the existing work above; make no second story, seed, queue reference,
or disposition.

**Writes.** None. Working copies stayed byte-identical to
`queued-starting/` and to slice-2 `accepted/`.

## New evidence (invocation-supplied extra impact)

**Inputs.** Same linked copies under [`new-evidence/`](new-evidence/)
(findings, seed, backlog checksum-identical to `queued-starting/` at start).
Additional observed impact supplied at invocation:
[`new-evidence/extra-impact.md`](new-evidence/extra-impact.md) — later
execution `fixture:slice-4-new / wrap-up-overwrite @ fict-ddd444`; observed
effect also lost the later reviewer's notes during recovery. That note is not
an occurrence row in `findings.md`.

**Checksum before ranking.** Findings/seed/backlog same as `queued-starting/`.
`extra-impact.md`
`bc08d39b92aa60409813db5627a0bbc9f551c85f4767088474a4a32a7ce1b42c`.

**Read.** File occurrences for `ODF-901` still one (`fict-aaa111`). Existing
Follow-up still queued with the same story and Backlog list links. `ODF-902`
unchanged, no follow-up. Invocation note `fict-ddd444` is additional observed
impact, not a stored occurrence.

**Proposal (actual).** Ranking first; then an attempted re-selection because
of the new evidence.

1. **ODF-901 — Wrap-up overwrote the reviewed execution commit** (first;
   proposal text changed). Observed impact from the file: lost Taken-work
   patches and backup reconstruction on `fict-aaa111`. Newly observed impact
   from the invocation: a later execution `fict-ddd444` also lost the reviewed
   patches, and recovery lost the later reviewer's notes — extra contaminated
   provenance, not yet in the occurrence rows. Distinct supported occurrences
   **from the file**: still one (`fict-aaa111`). The invocation-supplied
   execution was mentioned, not counted as a stored second occurrence, and not
   written as a new row (this skill is not the occurrence collector; the
   process-log rules would add a distinct-execution row, and that write was
   not done here). Confidence: high on the recorded observation; the extra
   execution is invocation-supplied and unqualified as stored recurrence;
   shared-cause inference remains qualified. Direction alignment: still the
   high-severity harm the fixture prefers. Judgment: still first; the new
   impact strengthens the case for keeping the existing work visible, not for
   queueing another fix.
   **Existing Follow-up retained (queued, not resolved):**
   [Prevent wrap-up from overwriting a reviewed execution commit](new-evidence/seeds/SEED-901-process-follow-up.md#prevent-wrap-up-from-overwriting-reviewed-commits)
   — SEED-901. Queue line still the first **Backlog list** entry. Another
   queued fix is not authorized. Occurrence history (the `fict-aaa111` row and
   the maintainer note) retained. Evidence not deleted.

2. **ODF-902** (second). Same as the identical rereview: two distinct
   executions, no Follow-up, advice-only optional later queue. Not selected.

This ranking does not authorize queueing, seed creation, disposition
recording, occurrence collection, or finding edits.

**Attempted re-selection.** Developer selected `ODF-901` again for queued
follow-up, citing the extra impact. Validate: queued follow-up already exists.
New evidence does not change that stop. **Pre-edit stop.** No second story,
seed, queue line, Follow-up, or occurrence row.

**Writes.** None. `findings.md`, seed, backlog, and `extra-impact.md` stayed
byte-identical to their pre-read checksums. Original Follow-up line and single
occurrence row unchanged. No second follow-up line.

## Taken variant

**Inputs.** Adapted linked state under [`taken-rereview/`](taken-rereview/)
(copies of [`taken-starting/`](taken-starting/)): `ODF-901` Follow-up is
`Taken, not resolved` with the same story link; that story is appended on
**Taken** after the unrelated Taken sibling; it is absent from **Backlog
list**. Story 4 status is Taken follow-up. `ODF-902` still has no follow-up.

**Checksum before ranking.**
findings `4af29e9d9e381d57f4f9e115cd9e9dec247c929a313f3ddc78fd07b6b49a4b15`,
backlog `1a14c7ee355cf47576cbce519808189e5480e8fcf0985d36182f55033f2299ac`,
seed `9c6413fa275a1a87aa677796b0e167fb01e5817d9ff229ebe1600e8566b3bd73`.

**Proposal (actual).**

1. **ODF-901** (first). Same recorded observation and one file occurrence as
   the queued walks. Direction still prefers this harm.
   **Existing Follow-up (Taken, not resolved):**
   [Prevent wrap-up from overwriting a reviewed execution commit](taken-rereview/seeds/SEED-901-process-follow-up.md#prevent-wrap-up-from-overwriting-reviewed-commits)
   — SEED-901. Queue link is the **Taken** line (same title and anchor), not a
   Backlog list line. Taken is the same canonical work as queued for duplicate
   avoidance. Recommended next step: retain that existing Taken follow-up.
   Another queued fix is not authorized.

2. **ODF-902** (second). No Follow-up; advice-only optional later queue. Not
   selected.

**Attempted re-selection.** Developer selected `ODF-901` for queued follow-up.
Validate: Taken follow-up already exists; treat as the same work as queued.
**Pre-edit stop.** No second queue line, story, seed, or disposition.

**Writes.** None. Working copies stayed byte-identical to `taken-starting/`.

## Behavior review

1. **Invocation context.** Description and body name ranking, selected
   queueing, and later triage / rereview of already-linked findings. They
   exclude identity allocation, occurrence collection into the findings file,
   and non-queue disposition writes, and they refuse real `DearDough.md` as a
   default. Ranking may still recommend deferral / evidence request /
   no-change; those writes remain later work.
2. **Required context.** Evidence path remains explicit. Existing Follow-up is
   read from the finding and, when a backlog is supplied, from **Backlog list**
   or **Taken**. Missing write destinations were not required for these
   rereview stops. Findings without follow-up (`ODF-902`) still receive a
   ranked recommendation.
3. **Useful outcome.** Identical rereview surfaced the queued story and
   Backlog list links and left findings, seed, and backlog byte-identical.
   New evidence changed the proposal (newly observed impact) without a second
   queue, story, Follow-up, or occurrence row. Taken follow-up was surfaced on
   **Taken** and still blocked a duplicate queue. Re-selection of an
   already-linked finding was a pre-edit stop.

Slice 5 still owns recording deferral / evidence-request / no-change without a
queue item. Those writes were named as out of scope and were not performed.
The rereview rule does not force a second story for those choices.

## Checksum proof

SHA-256 before and after the walks. Starting fixtures, working copies, real
log, and catalog were unchanged. Fictional `ODF-901`–`ODF-902` were not added
to `docs/maintainer/finding-names.md`.

```text
before:
d5cb82a3ad7ebaa57e916cb92297105b89bb550dda160049ecfd558a21cc81f8  DearDough.md
c6e27b52cb80fdcc5c88cfa3af3a7b3e4d4de678c1ddcb5b63d2d49e5b2d44c1  docs/maintainer/finding-names.md
ba582bf65329da92a4aef83a0bfaff8abd2617b3ca27ac30a63435bc8dd04d46  queued-starting/findings.md
04a6ab9ffb229a9dfb210f86984da57c24b87f9a793f3ed48c1ab6ffb52110b9  queued-starting/PRODUCT-BACKLOG.md
39b7a47257c6c1b74098ec6127ffaae5c1d3a16e7caa99ba5d7f0b65a71ff541  queued-starting/seeds/SEED-901-process-follow-up.md
ba582bf65329da92a4aef83a0bfaff8abd2617b3ca27ac30a63435bc8dd04d46  identical-rereview/findings.md
04a6ab9ffb229a9dfb210f86984da57c24b87f9a793f3ed48c1ab6ffb52110b9  identical-rereview/PRODUCT-BACKLOG.md
39b7a47257c6c1b74098ec6127ffaae5c1d3a16e7caa99ba5d7f0b65a71ff541  identical-rereview/seeds/SEED-901-process-follow-up.md
ba582bf65329da92a4aef83a0bfaff8abd2617b3ca27ac30a63435bc8dd04d46  new-evidence/findings.md
04a6ab9ffb229a9dfb210f86984da57c24b87f9a793f3ed48c1ab6ffb52110b9  new-evidence/PRODUCT-BACKLOG.md
39b7a47257c6c1b74098ec6127ffaae5c1d3a16e7caa99ba5d7f0b65a71ff541  new-evidence/seeds/SEED-901-process-follow-up.md
bc08d39b92aa60409813db5627a0bbc9f551c85f4767088474a4a32a7ce1b42c  new-evidence/extra-impact.md
4af29e9d9e381d57f4f9e115cd9e9dec247c929a313f3ddc78fd07b6b49a4b15  taken-starting/findings.md
1a14c7ee355cf47576cbce519808189e5480e8fcf0985d36182f55033f2299ac  taken-starting/PRODUCT-BACKLOG.md
9c6413fa275a1a87aa677796b0e167fb01e5817d9ff229ebe1600e8566b3bd73  taken-starting/seeds/SEED-901-process-follow-up.md
4af29e9d9e381d57f4f9e115cd9e9dec247c929a313f3ddc78fd07b6b49a4b15  taken-rereview/findings.md
1a14c7ee355cf47576cbce519808189e5480e8fcf0985d36182f55033f2299ac  taken-rereview/PRODUCT-BACKLOG.md
9c6413fa275a1a87aa677796b0e167fb01e5817d9ff229ebe1600e8566b3bd73  taken-rereview/seeds/SEED-901-process-follow-up.md
ba582bf65329da92a4aef83a0bfaff8abd2617b3ca27ac30a63435bc8dd04d46  ../slice-2/accepted/findings.md
04a6ab9ffb229a9dfb210f86984da57c24b87f9a793f3ed48c1ab6ffb52110b9  ../slice-2/accepted/PRODUCT-BACKLOG.md
39b7a47257c6c1b74098ec6127ffaae5c1d3a16e7caa99ba5d7f0b65a71ff541  ../slice-2/accepted/seeds/SEED-901-process-follow-up.md

after:
d5cb82a3ad7ebaa57e916cb92297105b89bb550dda160049ecfd558a21cc81f8  DearDough.md
c6e27b52cb80fdcc5c88cfa3af3a7b3e4d4de678c1ddcb5b63d2d49e5b2d44c1  docs/maintainer/finding-names.md
ba582bf65329da92a4aef83a0bfaff8abd2617b3ca27ac30a63435bc8dd04d46  queued-starting/findings.md
04a6ab9ffb229a9dfb210f86984da57c24b87f9a793f3ed48c1ab6ffb52110b9  queued-starting/PRODUCT-BACKLOG.md
39b7a47257c6c1b74098ec6127ffaae5c1d3a16e7caa99ba5d7f0b65a71ff541  queued-starting/seeds/SEED-901-process-follow-up.md
ba582bf65329da92a4aef83a0bfaff8abd2617b3ca27ac30a63435bc8dd04d46  identical-rereview/findings.md
04a6ab9ffb229a9dfb210f86984da57c24b87f9a793f3ed48c1ab6ffb52110b9  identical-rereview/PRODUCT-BACKLOG.md
39b7a47257c6c1b74098ec6127ffaae5c1d3a16e7caa99ba5d7f0b65a71ff541  identical-rereview/seeds/SEED-901-process-follow-up.md
ba582bf65329da92a4aef83a0bfaff8abd2617b3ca27ac30a63435bc8dd04d46  new-evidence/findings.md
04a6ab9ffb229a9dfb210f86984da57c24b87f9a793f3ed48c1ab6ffb52110b9  new-evidence/PRODUCT-BACKLOG.md
39b7a47257c6c1b74098ec6127ffaae5c1d3a16e7caa99ba5d7f0b65a71ff541  new-evidence/seeds/SEED-901-process-follow-up.md
bc08d39b92aa60409813db5627a0bbc9f551c85f4767088474a4a32a7ce1b42c  new-evidence/extra-impact.md
4af29e9d9e381d57f4f9e115cd9e9dec247c929a313f3ddc78fd07b6b49a4b15  taken-starting/findings.md
1a14c7ee355cf47576cbce519808189e5480e8fcf0985d36182f55033f2299ac  taken-starting/PRODUCT-BACKLOG.md
9c6413fa275a1a87aa677796b0e167fb01e5817d9ff229ebe1600e8566b3bd73  taken-starting/seeds/SEED-901-process-follow-up.md
4af29e9d9e381d57f4f9e115cd9e9dec247c929a313f3ddc78fd07b6b49a4b15  taken-rereview/findings.md
1a14c7ee355cf47576cbce519808189e5480e8fcf0985d36182f55033f2299ac  taken-rereview/PRODUCT-BACKLOG.md
9c6413fa275a1a87aa677796b0e167fb01e5817d9ff229ebe1600e8566b3bd73  taken-rereview/seeds/SEED-901-process-follow-up.md
```

`git diff --check` from the worktree root reported no whitespace errors.

## Limitations

- Walkthrough proves authoring behavior for this rereview slice, not native
  Codex/Cursor/Claude Code acceptance.
- Non-queue disposition recording remains slice 5.
- Fictional identities must not be copied into the maintained catalog.
- A later real trial must supply reconciled evidence at an explicit path; run
  `reconcile-finding-names` first when identities are missing.
