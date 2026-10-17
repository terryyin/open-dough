# Correct start-eligibility gaps found in review

**Identity:** SEED-138#correct-start-eligibility-gaps
**Source:** [correction story](../../seeds/SEED-138-computed-execution-readiness.md#correct-start-eligibility-gaps)

## Source and provenance

Bounded retrospective correction of the completed execution of
[SEED-138#compute-execution-readiness](https://github.com/terryyin/open-dough/blob/d874104edfad1fb198f05d003d7ef0b0586c6554/.planning/seeds/SEED-138-computed-execution-readiness.md#compute-execution-readiness),
planned in [plan 311](https://github.com/terryyin/open-dough/blob/d874104edfad1fb198f05d003d7ef0b0586c6554/.planning/slice-plans/311-compute-execution-readiness/PLAN.md) (four slices
done). Reviewed commits `7aafbcb1`, `ca9ad3b6`, `2f13a3e0`, `2f56bd2a`
(`13b57efb..2f56bd2a`). The findings below were verified against that
revision. The story and plan 311 were retired at wrap-up; recover them
from before-cleanup commit `d874104e`.

## Current findings

1. **Key example 7 is not met for records assessed before the story.** The
   story's example: "A has assessment `ready`, basis recorded before this
   story. Nothing but B's resolution changed. Card: no 'Changed since readiness
   review'." `asWrittenBasisFor` in
   `src/skills/dough-product-backlog/scripts/product-backlog-story-state.mjs`
   matches a legacy record only while the dependency fence is byte-identical,
   so the record reads `changedSinceReview: true` once its supplier resolves.
   `tests/support/story-dependencies.test.mjs` "a record reviewed over the
   dependency fence as written stays accurate" asserts `true` after
   `satisfied`, encoding plan 311's narrower reading ("a legacy record whose
   dependency state changed since review keeps `true`").
2. **No CLI output exposes start eligibility.** The story's scope says "The
   shared story-state reader exposes whether a story may start". Only
   `execution-source.mjs` (as a refusal) and `dashboard/src/startEligibility.ts`
   call `deriveStartEligibility`; `read-state` prints preparation and the
   assessment but no eligibility, so an agent cannot ask the installed CLI.
3. **"Ready for execution" means two things on one Backlog card.** The card's
   green badge is start eligibility, but the detail's
   `assessmentSummaryText` (`dashboard/src/storyPreparation.ts`, rendered by
   `StoryDetail.tsx` as "Assessment: Ready for execution") and the Start note
   "Not marked Ready for execution" (`launchWorkflow.ts`, described in
   `dashboard/AGENT-LAUNCH.md` and `StartLaunch.tsx`) name the recorded
   assessment. `dashboard/tests/publishedFactsAssertions.ts` asserts the
   contradiction on one card: "Blocked by 1 dependency" with "Assessment: Ready
   for execution". The story requires "The recorded assessment, its reasons,
   and review-change indication remain visible on the card and in the detail
   with shared wording". Plan 311 obligation G1's "no user cost" disposition
   was wrong.
4. **A startup proof relies on the order the guidance forbids.**
   `src/skills/dough-execute-plan/scripts/workspace-publication-startup-dependencies-cases.mjs`
   "all dependencies must be satisfied before a ready story starts" asserts
   `changedSinceReview === true` after resolution only because its fixture
   records Ready before adding agreements, which
   `record-preparation.md` now orders the other way (record the dependency,
   then the assessment).

## Goal and scope

Correction outcome: an agent or developer asking "can this story start?" gets
the selected story's promised answer: legacy ready records stay accurate when
only a resolution changed, `read-state` reports start eligibility from the
shared derivation, and Backlog wording uses "Ready for execution" only for
start eligibility.

Included: a legacy comparison in the shared reader; `startEligibility` in
`read-state` output, its usage text and `dough-product-backlog/SKILL.md`; the
detail's assessment summary and the Start note's wording, with every spec and
document that asserts or describes them; the reordered startup fixture.

Excluded:

- One-shot and canonical admission gates keep their own contracts (plan 311
  G3).
- The duplicate fence scanner in `digestDependencyAgreements` beside
  `blocksOf` (minor; no wrong result).
- The Taken card's green "Ready for execution" badge, which shows the recorded
  assessment for continuation work (plan 311: "Taken cards keep today's
  badges"). Changing it is a developer decision outside this correction.
- A legacy record whose dependency was already `satisfied` or
  `decision-needed` when it was reviewed: reconstruction returns it to
  `waiting`, so it reads changed (conservative; a re-review clears it).

## Preserved promises and constraints

- The green badge text stays "Ready for execution" and means start
  eligibility (plan 311 decision); this correction removes the other meaning.
- The dashboard keeps offering Start, with its note, when only the assessment
  blocks; the start command refuses.
- Start refusal keeps the substrings `execution is blocked by` and
  `published preparation is not-ready`.
- "Readiness" keeps ADR 0002 principle 5's meaning, the recorded assessment;
  start eligibility is derived, never stored, and grants no permission.
- "Changed since readiness review" still shows when story text, plan, or a
  dependency agreement changed since review.
- Guidance edits land in `src/skills`, `docs`, and `dashboard`; installed
  copies under `.claude/skills` and `.agents/skills` follow a release.

## Design and existing solutions

- **Legacy comparison** (change). `digestSource` in
  `product-backlog-story-state-basis.mjs` already has `dependencyFences:
  "as-written"`. Add one more mode that rewrites each well-formed dependency
  fence to the bytes `updateStoryDependency` wrote before any resolution:
  `JSON.stringify({ ...payload, dependencies: entries.map((entry) => ({
  ...dependencyAgreement(entry), state: "waiting" })) })`, then digests as
  written. `readStoryState` passes that basis to `normalizeAssessmentView` as
  one more earlier basis beside `asWrittenBasisFor` (and the whole-document
  `formerBasisFor`, so both legacy shapes share one rule). A goal-text or
  agreement edit still mismatches. Malformed fences are left as written.
- **CLI eligibility** (reuse). `readState` in
  `product-backlog-story-state-command.mjs` adds `startEligibility` from
  `deriveStartEligibility` over the preparation it already reads and
  `readStoryDependencies` on the same home text, turning a dependency reader
  refusal into `{ status: "unavailable", problem }` as `readFact` in
  `execution-source.mjs` does. A preparation reader refusal keeps today's
  non-zero exit. No new module; `product-backlog-start-eligibility.mjs` is
  already in `install.sh` and `tests/product-backlog-payload-update.sh`.
- **Assessment wording** (decision, revisable by the developer). The detail
  line becomes "Assessment: Ready" for a ready assessment (with
  "; Changed since readiness review" as today), symmetric with the existing
  "Not ready (reasons)". The Start note becomes "Not assessed as ready", so the
  dialog reads "This story is not assessed as ready." Both name the recorded
  assessment in the words the card's "Not ready" badge and "Changed since
  readiness review" already use. `assessmentSummaryText` stays the single
  source for the detail; the note stays in `launchWorkflows.execution.note`.

## Preparation observations and decisive premises

Observed 2026-10-17 in this worktree at `2f56bd2a`, Node 24.21.0. Scratch
files lived in `/tmp/od312scratch`; both scratch edits to `src` were reverted
and `git status --short -- src tests` is empty.

| Premise | Consuming observation and result | Consequence |
| --- | --- | --- |
| A legacy ready record reads changed after only its supplier resolves (finding 1). | Scratch test importing `tests/support/story-state-fixture.mjs` and `story-dependencies-fixture.mjs`: record agreement (`waiting`), record Ready, plant the as-written digest as the recorded basis, then `update-dependency` to `satisfied` through the real CLI; `read-state` reports `changedSinceReview: true`. Same with `decision-needed`. | Reproduced; slice 1 owns it. |
| The waiting fence can be reconstructed byte for byte from a resolved fence. | Same scratch: the CLI-written waiting line is `{"schemaVersion":1,"identity":…,"dependencies":[{"supplier":{"identity":…,"href":…},"implementation":…,"rationale":…,"condition":…,"state":"waiting"}]}`; mapping each resolved entry to `{...agreement, state:"waiting"}` and digesting as written equals the planted legacy digest after `satisfied` (with `resolution`) and after `decision-needed` (with `decision`): `true` both. Replacing the first story's goal sentence in the reconstruction: `false`. | True; slice 1 implements it. |
| Adding a field to `read-state` output breaks no consumer (finding 2). | Scratch edit adding `startEligibility` to `readState`'s printed object, then `node --test tests/support/story-state*.test.mjs tests/support/story-dependencies*.test.mjs tests/support/supplier-*.test.mjs` with `preparation-assignment-land`, `preparation-handoff-execution`, `one-shot-queued`, `workspace-publication-admission*` tests: 56 pass, 0 fail. Dashboard helpers `storyReadinessCli.ts` and `preparingJourney.ts` read only `basis`. | True; slice 2 is additive. Native `.sh` consumers are paid and not run; they read named fields. |
| Reordering the startup fixture reads `changedSinceReview: false` at the start command (finding 4). | Scratch edit of "all dependencies must be satisfied before a ready story starts": after both `waiting` agreements, `read-state` then `record-state --assessment ready` with current digests through the real CLI, commit and push, then resolve both; the assertion changed to `false`. `node --test --test-name-pattern="all dependencies must be satisfied" …startup-dependencies-cases.mjs`: 1 pass, including the unchanged story-state byte equality. | True; slice 1 carries the reorder. |
| Specs and documents that observe the wording (finding 3). | `grep -rn "Ready for execution\|Not marked Ready" dashboard/tests dashboard/src dashboard/*.md src docs`: detail text asserted in `publishedFactsAssertions.ts:23` ("Assessment: Ready for execution", through `expectCanonicalFacts` in `published-facts-arrival`, `published-facts-failures`, `transient-detail-recovery`) and `storyReadinessAccessible.ts:151` (Taken detail, substring); the note asserted via `notReadyNote` in `agent-launch-card.spec.ts`, `agent-launch-card-noted-start.spec.ts`, `agent-launch-card-session-states.spec.ts`, and literally in `story-dependencies.spec.ts:121`, `story-dependencies-touch.spec.ts:34`, `agent-launch-start-codex.spec.ts:41`, `support/startProgressPage.ts:63` (used by `agent-launch-start-phases.spec.ts`, `agent-launch-preparation-phases.spec.ts`), and `session-workspace-retirement-claude.spec.ts:59,110` (recorded launch data, no native host); described in `AGENT-LAUNCH.md:14` and the `StartLaunch.tsx` header comment. No `src/skills` or `docs` text uses either literal. Every other "Ready for execution" assertion targets the badge (`exact: true` on a card or the legend). | Slice 3's consumer list. Reading only; slice 3 runs those specs. |
| Playwright journeys run in this checkout (slice 3's route). | `npm run test:dashboard -- preparation-legend.spec.ts --reporter=list` at load average 23: 4 passed (12.1 s). | Route available; plan 311's load note applies to longer journeys. |

## Outside-in proof ownership

| Promise | Owning slice and observable proof |
| --- | --- |
| A record assessed before agreement digests reads no "Changed since readiness review" when only a supplier's resolution or decision changed; a goal edit still reads changed (story key example 7) | 1: "a record reviewed over the dependency fence as written stays accurate" in `tests/support/story-dependencies.test.mjs` asserts `false` after `satisfied` and after `decision-needed`, and `true` after a goal-text edit; it fails with the reconstruction disabled. |
| A story recorded Ready after its dependencies starts with `changedSinceReview: false` once they are satisfied, with no readiness write between (story key example 1) | 1: reordered "all dependencies must be satisfied before a ready story starts" in `workspace-publication-startup-dependencies-cases.mjs`. |
| The installed CLI reports whether a story may start, naming the same blockers the dashboard and start command derive | 2: new cases in `tests/support/story-dependencies.test.mjs` through the real CLI: Ready behind `waiting` reads `blocked` with one dependency blocker naming the supplier; after `satisfied`, `eligible` with no blockers; `not-ready` reads an assessment blocker with its reasons; a malformed dependency fence reads a `dependencies` gap and exits 0; no story-state block reads a `preparation` gap. |
| "Ready for execution" names only start eligibility on a Backlog card; the detail and Start note name the recorded assessment with shared wording | 3: `publishedFactsAssertions.ts` asserts "Assessment: Ready" beside "Blocked by 1 dependency" and no "Ready for execution" in that detail; the noted-Start specs assert "Not assessed as ready" and the dialog's "This story is not assessed as ready."; no spec or document keeps the retired note. |

## Ordered slices

### 1. A legacy ready record stays accurate when only a resolution changed
Type: Behavior
Status: planned
Proof: `node --test tests/support/story-dependencies.test.mjs
tests/support/story-state*.test.mjs tests/support/supplier-*.test.mjs
tests/support/start-eligibility.test.mjs
src/skills/dough-execute-plan/scripts/workspace-publication-startup-dependencies-cases.mjs`;
the legacy case observed failing with the reconstruction disabled;
`tests/product-backlog-payload-update.sh`; `npm run lint`.

Behavior: a consumer's Ready was recorded over its dependency fence as
written (before agreement digests) → the supplier's resolution writes
`satisfied` with evidence, or `decision-needed` with a question → `read-state`,
the start receipt, and the dashboard read `changedSinceReview: false`; an edit
to the story's goal text, the plan, or the agreement still reads `true`. The
legacy test's `true` assertion after `satisfied` inverts and gains the
`decision-needed` and goal-edit cases. The startup case records the
dependencies first, then Ready through `record-state` with current digests,
and asserts `changedSinceReview: false` at the admitted start, keeping its
story-state byte equality.

### 2. `read-state` reports start eligibility
Type: Behavior
Status: planned
Proof: the new cases named under proof ownership in
`tests/support/story-dependencies.test.mjs`, plus `node --test
tests/support/story-state*.test.mjs tests/support/start-eligibility.test.mjs
src/skills/dough-story-refinement/scripts/preparation-assignment-land.test.mjs
src/skills/dough-story-refinement/scripts/preparation-handoff-execution.test.mjs
src/skills/dough-execute-plan/scripts/one-shot-queued.test.mjs`
(read-state consumers); `tests/product-backlog-payload-update.sh`;
`npm run lint`.

Behavior: an agent runs `product-backlog.mjs read-state --link <href>` → the
output keeps every existing field and adds `startEligibility` (`eligible` or
`blocked`, with blockers in the shared derivation's order and shape) computed by
`deriveStartEligibility`; a malformed dependency record is a gap, not a
failure. The `read-state` paragraph in `product-backlog-usage.mjs` and the start
eligibility paragraph in `src/skills/dough-product-backlog/SKILL.md` say
`read-state` reports it and that it grants no permission;
`docs/project-visibility-requirements.md` adds `read-state` beside the
dashboard and the start command. Becoming eligible launches nothing.

### 3. Assessment wording no longer says "Ready for execution"
Type: Behavior
Status: planned
Proof: `npm run test:dashboard -- story-readiness.spec.ts
story-readiness-accessible.spec.ts story-readiness-gaps.spec.ts
start-eligibility.spec.ts story-dependencies.spec.ts
story-dependencies-touch.spec.ts agent-launch-card.spec.ts
agent-launch-card-noted-start.spec.ts agent-launch-card-session-states.spec.ts
agent-launch-start-codex.spec.ts agent-launch-start-phases.spec.ts
agent-launch-preparation-phases.spec.ts agent-launch-start-dependencies.spec.ts
published-facts-reading.spec.ts published-facts-arrival.spec.ts
published-facts-failures.spec.ts transient-detail-recovery.spec.ts
story-review-action.spec.ts session-workspace-retirement-claude.spec.ts
preparation-legend.spec.ts taken-admitted-investigation.spec.ts
--reporter=list` (on a loaded machine, rerun a timed-out test alone with
`--timeout 150000` and compare relatively); `npm run typecheck:dashboard`;
`npm run lint`; `grep -rn "Not marked Ready\|Assessment: Ready for execution"
dashboard src docs` returns nothing.

Behavior: a Backlog card whose recorded assessment is Ready but which a
dependency blocks → the developer opens Inspect story → the card shows
"Blocked by 1 dependency" and the detail shows "Assessment: Ready", and no
"Ready for execution" appears outside an eligible card's badge or the legend.
A Backlog card whose assessment is not Ready or absent → its Start execution
is noted "Not assessed as ready", and its dialog says "This story is not
assessed as ready." The green badge, its legend entry, Start availability, and
refusal text are unchanged. `dashboard/AGENT-LAUNCH.md` and the
`StartLaunch.tsx` and `launchWorkflow.ts` comments use the new wording; every spec listed under preparation observations asserts it
(`storyReadinessAccessible.ts:151` asserts "Assessment: Ready" in the Taken
detail).

## Current decisions

- Legacy records compare against two reconstructions of their fence: as
  written, and returned to `waiting` without resolution or decision.
- `read-state` carries `startEligibility`; no separate command.
- Assessment-level wording: "Assessment: Ready" in the detail and "Not
  assessed as ready" for the Start note; the developer may revise both
  strings before slice 3.
- Plan 311's decisions listed under preserved promises stay in force.
