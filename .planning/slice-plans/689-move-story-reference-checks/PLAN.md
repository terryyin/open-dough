# Move story reference checks out of Dashboard Integrated UI Test

**Identity:** SEED-334#move-story-reference-checks
**Source:** [Story reference checks](../../seeds/SEED-334-product-wide-end-to-end-tests.md#move-story-reference-checks)

This provisional plan is **awaiting story refinement — not ready for slice-plan refinement or execution**.

## Preserved scope and mapping

Maps the story-reference share of the earlier scope of
SEED-334#retire-integrated-ui-test-and-its-documents at
`87dfb8fbf1f6dc78cbd279e8fb33d1396da9d8a6` (provisional plan 648 slice 6 at
`4eb4f8e594ee003a2894c28c8ab2600e1c42b835`). Six specs, 1,075 lines, 19 tests,
keep every distinct assertion in Frontend, Backend or representative E2E
homes. Conversion conventions, proof rule and gates are those of
plan 688, recoverable at
`7649aea947b870eb8d84da67f0fa63d0a9c6b9bb:.planning/slice-plans/688-move-story-destination-and-card-selection-checks/PLAN.md`.

## Provisional slices

### 1. Follow a reference to an active story
Type: Behavior
Status: provisional
Proof: `story-reference-navigation`: reading top, restarting cue, selection
independent of the cue, popup to the GitHub blob, focus kept across a revision
refresh; a starting story stays protected (Frontend observes the protected
Inspect; the real Take stays with E2E
`launches/agent-launch-start-dependencies.spec.ts`, and a held start answer
may need adding to the Frontend launch substitute); unreadable detail still
opens with its read gap.

### 2. Tell references apart by identity and project
Type: Behavior
Status: provisional
Proof: `story-reference-identity`: two stories in one seed by keyboard and
tap at narrow width with reduced motion; Pygardon's pinned reference opens
Pygardon's own story. The interim setup runs the product-backlog CLI and Git;
Frontend needs pure-data equivalents (`queuedSeedWithDependencies`, a Taken
backlog). E2E `stories/story-dependencies.spec.ts` overlaps the first case.

### 3. Recover an active reference
Type: Behavior
Status: provisional
Proof: `story-reference-recovery`: missing, reading and failed outcomes
distinct in one live region; retry reaches a newly queued story; leaving for
another project or choosing another inspection while pending wins.

### 4. Reveal a Done story from a reference
Type: Behavior
Status: provisional
Proof: `story-reference-done`: near and far Done references, the shown range
growing to 27, held far detail at narrow width, an identified gap with "Retry
done stories", a replaced disclosure. Needs a Frontend done-references
arrangement from `storyReferenceDone.ts` data (35 done records) through
`putFrontendDoneRecords` / `putFrontendDonePublication`. Exact record-read
counts become page-side counts; a count the server's cache decides keeps a
Backend home.

### 5. Cancel a pending Done reference
Type: Behavior
Status: provisional
Proof: `story-reference-done-cancellation` (touch): Inspect or "Show latest
10", a pointer down, or Tab away replaces the pending jump.

### 6. Recover a Done reference
Type: Behavior
Status: provisional
Proof: `story-reference-done-recovery`: expired and unlisted references
without extra reads; loading and failed catalog wording; a later inspection
replacing an unavailable or failed reference once the catalog heals. Timing
through `passTimeToRecovery`; the hardest of the six. Its last deletion
leaves `dashboard-integrated` shard 2 selecting nothing, so this slice reduces
that job's shard declaration in `.github/workflows/ci.yml` to what
`source-navigation` needs.

## Refinement inputs

`storyReferenceDone.ts` (116 lines) becomes unused once slices 4–6 land unless
its data is rehomed into the Frontend arrangement. `destinationCue.ts` and
`storyReference.ts` stay shared. Check each slice against 15 active minutes;
slices 4 and 6 carry new support and may need splitting.
