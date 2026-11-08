# Find the intent assessment in a recently done story

**Identity:** SEED-258#assess-intent-coverage-during-wrap-up

**Source:** [Find the intent assessment in a recently done story](../../seeds/SEED-258-dough-intent-coverage.md#assess-intent-coverage-during-wrap-up)

**Source review:** [Numbered source commitments](source-review.md)

## Execution context

- Mode and location: Story Branch Mode in the established dashboard worktree
  `/Users/terryyin/git/open-dough/.worktrees/find-the-intent-assessment-in-a-recently-done-st`
  on `codex/find-the-intent-assessment-in-a-recently-done-st`. Default checkout
  `/Users/terryyin/git/open-dough`.
- Publisher `dashboard-territory.local-open-dough`, agent `yilv-chan`.
  Starting revision `08a6dcc035e0be54623daacd56f56c2a8b0b3a00`. The
  established Take and story branch were both confirmed at
  `9eeecc159add3cb43a8b0fb5fb53f8a05abdebde` on `origin`. Integration
  target `main`.
- Checkout setup: locked `npm ci` and `npm run lint -- --help` passed
  with Homebrew Bash on PATH. The check-only commit hook checks staged lint
  and dashboard types when scripts are staged.
- CI: GitHub Actions `ci.yml` (CI), observing the authorized story branch.
  Codex coordinator `wrap-up-coverage-ff303147`, cell `g36:9`, session
  `40537`, directory `/tmp/dough-ci-501/watch-wGNgnp`, PID `22525`.
- Replanning follows the existing planning authority. No numeric slice
  budget or additional replanning option was supplied.

## Goal and boundaries

Wrap-up runs one targeted Dough Intent Coverage check for each feature story
it closes and keeps the returned report in that story's done record. A
developer who selects the story from Recently done reads the result and its
four cost entries in Intent. The seed owns scope, exclusions, and key
examples. Bounded corrections and context-only instructions get no check. The
manual skill's outcomes, cost entries, and report finisher stay unchanged.
Test repairs, further findings, and the later decision on continued automatic
use are outside this plan.

The story's recorded dependency waits on a public tagged release that
contains `dough-intent-coverage`. The dependency agreement in the seed records public
release `v0.3.90` and marks the condition satisfied. The dashboard has
already published Take.

## Current decisions

- **Representation.** The done record gains one optional `intentCoverage`
  field: `{ "report": "<returned report text>" }` or
  `{ "unavailable": "<reason>" }`. The report is stored verbatim, so units,
  measured or estimated labels, and unavailable entries remain as the skill
  wrote them. Do not reparse it into structured cost fields. `renderDoneRecord`
  and `parseDoneRecord` in
  [the done-record module](../../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs)
  own the field, its validation, and its read-back. Records without the field
  stay valid. The schema version stays at 1 because the field is optional and
  older readers ignore it.
- **Writer.** `complete` takes `--intent-coverage <file>` (a report) or
  `--intent-coverage-unavailable <reason>`, never both, and only for finished
  work (refused with `--dropped`). It writes the field in the record it already
  writes. A run without either option writes no field. `complete` already
  refuses an identity that left the backlog, so a repeat wrap-up cannot add a
  second result. Wrap-up skips the check when the published done record
  already holds a result. The existing prune removes the field with its record.
- **Catalog.** `done/.catalog.json` keeps identity, completion time, file name,
  and blob only, so the report stays out of it. Readers fetch the record body
  as they already do for its title.
- **Dashboard.** Extend the zod `doneStory` schema in
  [doneStories](../../../dashboard/src/doneStories.ts) with the optional
  field. Carry it through the lens story read by
  [useIntentStoryLens](../../../dashboard/src/useIntentStoryLens.ts). Show it
  in [Intent's story summary](../../../dashboard/src/IntentStorySummary.tsx)
  disclosure for a completed story under an **Intent coverage** heading. Show
  the report text with its line breaks preserved, and render it as text, not
  HTML. An unavailable result shows **Unavailable** and its reason. A story
  without the field shows no Intent coverage heading. The compact line is
  unchanged.
- **Wrap-up.** Add the step to
  [Story wrap-up](../../../src/skills/dough-story-wrap-up/SKILL.md) once
  execution completion is established, before the before-cleanup commit, for
  a completed feature story only. Invoke the installed
  `dough-intent-coverage` skill on the story section, plan when present, and
  the completed work's revision. Prefer a plausible protection gap that the
  retrospective or a review raised for an important promise. Save the
  returned report outside the checkout and pass it to `complete`. When
  nothing is returned, pass the unavailable reason instead. The check never
  holds up cleanup, follow-up, or integration decisions, and it owns its own
  scratch checkout and restoration. Document the option in
  [dough-product-backlog](../../../src/skills/dough-product-backlog/SKILL.md#remove-completed-items).
- Follow [ADR 0008, Durable project state and local operational state](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state):
  the done record is the durable published fact, and the dashboard reads it
  at its published revision. Follow [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  for the wrap-up and backlog guidance wording, and
  [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md):
  both skills are already in the payload, so edit their sources in place.
- At wrap-up of this story, retire the North Star topic
  [Intent assessment results carry their cost](../../NORTH-STAR.md#intent-assessment-results-carry-their-cost)
  once the delivered skill and wrap-up guidance carry it.

## Outside-in proof

| Seed example | Owner | Required observation |
| --- | --- | --- |
| 1. A stored Caught result is readable from Recently done | Slices 1, 2 | `complete --intent-coverage` through the real CLI writes the verbatim report. Selecting the published story in Recently done and expanding Intent's summary shows **Intent coverage**, the outcome, and the four cost entries with their units and labels exactly as recorded. |
| 2. Insufficient evidence is kept and shown | Slices 1, 2 | The same route with an **Insufficient evidence** report and an unavailable cost entry shows both unchanged. |
| 3. No returned report | Slices 1, 2, 3 | `--intent-coverage-unavailable` writes the reason, Intent shows **Unavailable** with it, and wrap-up guidance continues closure. |
| 4. A correction gets no check | Slices 1, 2, 3 | `complete` without the option writes no field, Intent shows no Intent coverage heading, and wrap-up guidance limits the check to feature stories. |
| 5. Repeat leaves one result | Slices 1, 3 | A second `complete` of the identity is refused with the record unchanged. Wrap-up guidance skips the check when the record holds a result. |
| 6. Prune removes the result with its record | Slice 1 | A record with the field completed 31 days earlier is removed by the next `complete`, and the catalog rebuilds without it. |

## Decisive premises

Observed on 2026-11-08 in the established workspace rebased onto
`565ae7c2b` (origin/main), macOS on AC, Node 24.21.0, Homebrew Bash 5 first on
`PATH`, after `npm ci`.

| Consuming operation | Form and observation | Result |
| --- | --- | --- |
| Slice 1 extends the record `complete` writes | `bash scripts/test.sh tests/support/product-backlog-complete-done-record.test.mjs`. Read `closeBesideBacklog` / `writeDoneRecord` in `product-backlog-complete.mjs`: the one finished-work record write goes through `renderDoneRecord`, and an absent backlog entry refuses before writing. | Exit 0. One render path for the record, so one option reaches every finished record. |
| Slice 1 keeps the report out of the catalog | Read `product-backlog-done-catalog.mjs`: catalog entries hold file name, identity, completion time, and blob, and the title is already absent. | The record body is the only home. No catalog change. |
| Slice 2 reads the field where Intent reads the title | `dashboard/src/doneStories.ts` reads bodies through the shared `parseDoneRecordFile` and then the zod `readRecord`, and `useIntentStoryLens` gets the completed story's title from `useDoneDetails`. A field the shared parser drops never reaches the dashboard, so both parsers change together. | Single read path confirmed. |
| Slice 2 proves rendering through the real completion route | `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/playwright.config.ts dashboard/tests/intent/intent-story-completed.spec.ts --reporter=list`. Its fixture (`dashboard/tests/support/intentCompletedStory.ts`) completes the story through the real CLI, publishes it, selects it from Recently done, and opens Intent. | 2 passed (16.7 s). The route reaches the summary disclosure that slice 2 extends. |
| Slice 3 relies on the manual skill returning a report that the caller can save | Plan 503's retained proof, accepted at `360c43923d7470247aeb57d057b85676cb2e1b68`: installed Codex (Playwright) and Cursor (Nix/pytest) invocations each returned a Caught report ending in the finisher's elapsed entry. The skill and finisher have not changed on `main` since then. | Settled by retained evidence. The public-release condition remains the dependency, not a premise. |

## Local gates

Run full local suites from a fully awake macOS machine on AC under
`caffeinate -s -i`. On battery, follow the lid-open `caffeinate -i` and
sleep-log procedure in
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Put Homebrew Bash 5 first on `PATH` for `scripts/test.sh`.

Follow the [test automation rules](../../../AGENTS.md#test-automation) and
the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written. Arrange done records through the shared MakeMe entry
`tests/support/makeMe.mjs`. Reuse a done-record builder if
[plan 508](../508-map-published-work-test-data/PLAN.md) slice 7 has landed.
Otherwise add `makeMe.aDoneRecord` typed against `renderDoneRecord`'s input.
Keep the exact report text, as the input whose form is under test, at the
call site. Run focused tests per slice through `bash scripts/test.sh <paths>`
and `npm run test:dashboard -- <spec>`, plus `npm run typecheck:dashboard`
after dashboard or builder changes. Run the full `npm test` and
`npm run test:dashboard` once before landing, because the shared done-record
module is loaded by both the skill scripts and the dashboard.

## Slices

### 1. Completion keeps one returned Intent Coverage result in the done record

Type: Behavior

Status: done

Proof: Drive the real CLI in
[product-backlog-complete-intent-coverage.test.mjs](../../../tests/support/product-backlog-complete-intent-coverage.test.mjs)
and preserve the existing
[done-record checks](../../../tests/support/product-backlog-complete-done-record.test.mjs):

- a report file stored verbatim and read back by `parseDoneRecordFile`;
- an unavailable reason;
- no option, with no field;
- `--dropped` with the option, and both options together, refused with
  nothing written;
- a repeat `complete`, refused with the record unchanged; and
- a 31-day-old record with a result, pruned with an unchanged catalog shape.

Run the done-catalog and Git done-catalog tests as consumers.

Behavior: a Taken feature story and a saved report → `complete --identity <id>
--intent-coverage <file>` → its done record holds `intentCoverage.report`
equal to the file's text, and the shared parser returns it.

Accepted proof after independent refactoring (Homebrew Bash on PATH):

- `bash scripts/test.sh tests/support/product-backlog-complete-intent-coverage.test.mjs tests/support/product-backlog-complete-done-record.test.mjs tests/support/product-backlog-complete-done-catalog.test.mjs tests/support/product-backlog-done-catalog.test.mjs tests/support/product-backlog-git-done-catalog.test.mjs tests/support/product-backlog-git-done-catalog-agent-credit.test.mjs tests/support/product-backlog-git-done-catalog-replay.test.mjs tests/support/product-backlog-add-identity.test.mjs tests/support/product-backlog-identity-evidence.test.mjs src/skills/dough-execute-plan/scripts/publication-completed-identity.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-admission-refusal.test.mjs` passed. The assessment CLI tests arrange a scratch Taken entry and assert the stored text, interruption reason, refusal before any write, repeat preservation, and pruning with exact catalog rows. The other checks preserve catalog/Git rebuild, attribution, and identity and claim consumers.
- `npm run typecheck:dashboard` and `git diff --check` passed. The existing completed Intent journey and authenticated done catalog specs passed across the shared parser and published record reads. Per-commitment observations are in the source review. The dashboard's assessment rendering is owned by slice 2.

### 2. Intent shows a completed story's stored Intent Coverage result

Type: Behavior

Status: planned

Proof: Extend
[intent-story-completed.spec.ts](../../../dashboard/tests/intent/intent-story-completed.spec.ts)
or a sibling spec using the same completed-story fixture. Pass the result
to its real `complete`, select the story from Recently done, expand the
summary, and assert the **Intent coverage** text for seed examples 1–3. A
completed story without a result shows no such heading. Keep the existing
comparison assertions. Run `npm run typecheck:dashboard` and the Recently
done consumers of `doneRecordOf` (`authenticated-read-done-catalog` and the
done gaps specs).

Behavior: a published done record holding a report → the developer selects
the story in Recently done, opens Intent, and expands the summary → the
report's outcome and four cost entries appear exactly as recorded. A
record holding an unavailable result shows **Unavailable** and its reason.

### 3. Wrap-up runs the check for each closed feature story and keeps its result

Type: Behavior

Status: planned

Proof: The AGENTS.md
[behavior review](../../../AGENTS.md#behavior-review) of the changed
wrap-up and backlog guidance, walking seed examples 1, 3, 4 and 5 through
the edited text: eligibility, invocation inputs and promise preference,
saving the report outside the checkout, the `complete` option, the
unavailable path that does not block closure, and the skip on an existing
result. Record the walk in this plan. Run the existing guidance consistency
checks that cover these skills (`npm test` covers the payload and link checks).
Make no paid native run. Native host runs are
[manually triggered paid runs](../../../tests/README.md#check-environment),
and this slice does not require one.

Behavior: a completed planned feature story at wrap-up → wrap-up invokes
`dough-intent-coverage` before the before-cleanup commit, saves the
returned report, and passes it to `complete` → the done record holds the
result. A bounded correction at wrap-up → no check runs.

## Plan concerns

Slice-plan refinement was not needed. Each slice owns one observable outcome
with its own proof, the slices build in order on one representation, and
no slice spans another subsystem's decisions. This review found no remaining
slice-specific concern.
