# Get launch unit proof in about eight seconds

**Identity:** SEED-413#finish-launch-proof-orthogonal
**Source:** [Get launch unit proof in about eight seconds](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#finish-launch-proof-orthogonal)

Status: awaiting story refinement — not ready for slice-plan refinement or execution

Split on 2026-11-22 from SEED-413#make-launch-proof-orthogonal (plan 768)
at its delivered Slice 6 boundary, by developer decision, because its
Slice 7 did not fit one slice and that plan was at its eight-slice limit.
The slices below are plan 768's Slices 7 and 8 as provisional input; they
resume through story refinement and plan realignment. Plan 768's mappings
and paired timings are recoverable from its history after its wrap-up.

## Carried obligation

### G5. Launch helpers copy the MachineSessions composition (first reported in plan 768 slice 5)
`story-card-launch-page.ts` hand-builds the whole launches composite with
production `launchOffers` and inert `attemptOf`/`storyStartupOf`/
`keptStartOf` stubs; the same spread appears in `follow-up-note-handoff.spec.ts`,
`story-startup-page.ts` and one unattached-startup spec. Story clause:
"tests never copy a production composition".

## Provisional slices

### 1. Unattached start, attachments and note handoff run from typed inputs

Type: Behavior
Status: provisional

Reshape `ad-hoc-start-session`, `ad-hoc-start-session-answer`,
`ad-hoc-creation-entry`, `responsive-unattached-startup`,
`launch-attachments`, `launch-record-details` and
`follow-up-note-handoff`. Note attachment takes its typed notes; startup
takes its typed answer. Keep the distinct no-waiting and unreadable notes
states.

Proof: the seven files pass with paired timing and a mapping; composed E2E
owners named in the source map still pass.

Sizing finding (return at `840788d00`, 2.5 active minutes, no edits): the
seven specs are 1,054 lines, and startup from its typed answer has no typed
owner yet, so it needs production narrowing first. The smallest deliverable
subset is note attachment: export an `AttachStoryNotesChoice` owner with a
required `answer` that the reading wrapper renders, prove waiting, no
waiting and unreadable from typed notes, keep one composed Start session
Follow-up request case, and rerun `e2e/stories/recently-done-follow-up`.
The startup-answer files (`ad-hoc-start-session`,
`ad-hoc-start-session-answer`, `responsive-unattached-startup`, E2E owners
`agent-launch-ad-hoc-terminal` and `agent-launch-ad-hoc-instructed`) plus
`launch-attachments` and `launch-record-details` remain. The plan is at its
eight-slice limit, so the remainder needs a story split. The source map is
at `cb5c6fea2:.planning/slice-plans/762-speed-dashboard-launch-proof/remaining-proof.md`.
The same `launchOffers` spread into hand-built launches also appears in
`follow-up-note-handoff.spec.ts`, `story-startup-page.ts` and one
unattached-startup spec, alongside the story card helper of G5.

### 2. The whole launch selection runs in about eight seconds

Type: Behavior
Status: provisional

Measure per-file overhead and worker balance on the reshaped selection.
Merge files that share one owner and setup where that cuts import and
mount cost; remove spent page helpers and test support. A shared runner
setting changes only with whole frontend group proof. Then run the paired
whole-selection comparison.

Proof: paired whole-selection wall including preparation at two workers,
counts by file, the slow cases that remain, and the complete case map. If
the target is missed without a remaining safe reduction, stop with the
measured remainder for Terry.
