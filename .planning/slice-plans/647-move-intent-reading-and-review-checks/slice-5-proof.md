# Slice 5 Done source, mode and historical reading proof

Uncommitted implementation for coordinator acceptance. Original seven sources
are at `a2692caf9c13edd785f452308381fe708002f5aa`. No product behavior change,
new tier, runner retirement or timing claim. Apply the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written.

## Assertion dispositions and setup

All 134 assertion/observing-helper occurrences are retained in original order:
[mode/source](slice-5-modes-proof.md), [refresh](slice-5-refresh-proof.md) and
[history](slice-5-history-proof.md). Each table names its case and exact expected
expression; fixture-derived revisions/runs remain explicit scenario facts.

- Both refresh cases: actual whole-app Done card selection; explicit immutable
  completion `c…c` has Added `dashboard/tests/boundary/deep/long.spec.ts`, with
  original `lines("historical", 120)` content. `frontendFileDiff` prefixes each
  line with `+`, so the diff remains an added-file patch with 120 meaningful
  lines (historical 0 through historical 119). Project publication starts at
  `b2…b2`; the later planning-only answer is `e5…e5`. Original location order
  `[completion, published, laterRevision]`, exact endpoint text, Purpose/Proof,
  selected file, keyboard focus, 120-line scroll equality and report survive.
- Historical/live modes: retained Done launch has a distinct incidental title,
  and two independent explicit snapshot payloads. Historical responses are
  keyed by identity and `historical=true`; ordinary requests receive live
  workspace input. The browser must clear old file browser/text while held,
  show the status, render the proper diff after release, and restore focus.
- Captured/live: explicit captured baseline/tree/run, with run choice initially
  visible; ordinary request is held over the same panel. Run control, Landed
  run heading and file browser disappear, then All changes and live diff appear.
- Source selection: A's selected `a.spec.ts` is unchanged and has `a 11` at its
  own immutable completion. Both A and B are completed (neither remains queued).
  B's retained session is named Story B because that is the sidebar selection
  contract. B's comparison and locations are separately held; exact absence of
  files/Purpose and loading words remain; B's distinct `d…d` publication has
  only `second/tests/b.spec.ts`, its exact source, and no A source.
- Glance: existing `doneHistoryBuilder` and `mountedDoneTrunk` provide the
  original eight priors (six timed, failed, missing), selected 484000 ms and
  later landings. Existing `serveDoneWallTimeHistory` projects that input at the
  completion. Exact nine marks, average 504000 ms, −20 s (−4%), selected date,
  failed/missing inspection, omitted later mark, table order, dark cue and
  excluded old vocabulary remain through actual whole-app Done entry.
- Lifecycle: same canonical comparison and history inputs; explicit comparison
  failures/unavailable and history failure/restoration remain independent.
  Original exact average, gap, alert, retry, selected identity, table order and
  historyReads===1 checks remain. Actual corrupt local-store refresh/retry and
  exact unchanged Actions counts belong to new Backend `ci-done-history-retry`.

## Boundary ownership and existing proof

Backend `review/story-review-historical-choice` actually creates a completed
story with retained readable workspace and unusable capture; ordinary is a
snapshot without selectedRun, historical is published with completion/no run,
explicit unusable run is refused. Backend `ci-done-wall-reference` actually
reads exact publications, excludes equivalent/future/unrepresented samples,
retains selected measurement and observes zero total extra GitHub calls.

E2E `intent-done-default-answer-selection` actually completes and captures A,
completes B with another location, shallows/restores Git history, then holds B's
real answer: B is published, no selected run, no run request, no A source, and
correct B diff. `intent-done-retained-workspace` proves real published source
despite live edits, then ordinary live Review. Both retained-landing variants
prove real published/captured source choice and original diff/inventory/source;
their final Review is historical. Captured-to-ordinary query clearing is
observed separately by the added Frontend wire checks below, paired with the
real Backend ordinary snapshot/no-selected-run case. `intent-done-project-refresh`
actually publishes a later revision, preserves historical endpoints/report over
all Done tabs and observes exact location requests. Frontend routes are not
GitHub upstream or SSE evidence.

ADR 0002's cohesive whole-product proof, ADR 0008's Purpose/Proof and distinct
published/local evidence, ADR 0010's bounded improvement claims, and North Star
story/file/reading-place continuity constrain this implementation. No conflict.

## Diagnosis and bounded reassessment

Refresh 2 passed first. Modes first failed duplicate Story A headings from the
incidental launch title; corrected only that title. Next failed because a
mutable default live snapshot answered a historical request on perspective
return. The existing answer family now has explicit historical-by-identity
payloads; no service judgment is inferred. Its answer buckets moved cohesively
to `frontendStoryReviewAnswers` to keep all files under 250 formatted lines.
Both modes then passed.

Source selection failed plain a.spec.ts because setup marked it modified;
corrected A to unchanged. Next failed sidebar Select because incidental B title
was renamed; restored Story B. Reassessment retained original actions and
assertions, fixed only contradictory premises and allowed one diagnosed retry.
That exposed B still queued in the published backlog; removing the contradictory
queued B premise yielded a passing case. These are distinct setup failures,
not timeout increases or reruns without changes. All originals stayed present
through that diagnosis.

Backend corruption first received 400 because the draft omitted mandatory
`through`; corrected to the actual Done query shape, including through and
gap-reasons. Single diagnosed retry passed. Initial typechecks exposed unused
imports and a missed moved import; repaired and final proof follows.

## Same-promise scratch break

Original historical/live case passed baseline. In `useReviewRead`, temporarily
replace `reading: enabled && read.of !== of` with false. Original and maintained
case both fail the exact held-mode status assertion: expected
`Reading the story's changes…`, received empty text. The same stale-answer
presentation promise is discriminated at both boundaries. A finally restores
byte-identical production source; restored original and maintained passes are
required below. Logs: `/tmp/647-slice5-{old-baseline,fault-integrated,fault-frontend,old-restored}.log`.

## Host and proof commands

Awake macOS on AC, initial load 2.33/2.91/4.24, 69% free memory, no competing
owned proof. Browser commands use `caffeinate -s -i`, one worker, defaults.
No test.slow, timeout overrides, format/lint, commit, push or plan edits.
The coordinator owns delivery and source-review observations.

Initial strict Frontend records: refresh 2 passed (7.13s), modes 2 passed
(8.32s), glance/lifecycle 3 passed in the mixed remaining run; source completed
premise passed separately. Failures above are retained in their named logs.
Final commands and terminal results are appended after observation.

## Final observed results

- `caffeinate -s -i npm run test:dashboard:integrated -- intent/intent-done-review-modes.spec.ts --workers=1 --reporter=line`: restored **1 passed**, `/tmp/647-slice5-old-restored.log`.
- `caffeinate -s -i npm run test:e2e -- intent/intent-done-default-answer-selection.spec.ts intent/intent-done-project-refresh.spec.ts intent/intent-done-retained-workspace.spec.ts intent/intent-done-retained-landing.spec.ts --workers=1 --reporter=line`: **6 passed / 28.1s**, `/tmp/647-slice5-e2e.log`.
- `caffeinate -s -i npm run test:dashboard:backend -- intent/ci-done-history-retry.spec.ts intent/ci-done-wall-reference.spec.ts review/story-review-historical-choice.spec.ts --workers=1 --reporter=line`: exact reference + historical choice **2 passed**; new retry failed omitted through query. Corrected-query retry `caffeinate -s -i npm run test:dashboard:backend -- intent/ci-done-history-retry.spec.ts --workers=1 --reporter=line`: **1 passed / 2.0s**, `/tmp/647-slice5-backend-retry.log`.
- `npm run typecheck:dashboard`: final **exit 0**, `/tmp/647-slice5-typecheck-passed.log`; explicit published-kind narrowing fixed the final union-spread typing error.
- `npm run test:dashboard:integrated -- --list --reporter=line`: **exit 0, 165 tests / 74 files**, seven retired paths absent, `/tmp/647-slice5-integrated-list.log`.

The first covering Frontend command used bare `review`, which matched the
checkout absolute path and selected 431 cases. It was deliberately cancelled:
terminal interrupted, one current case interrupted, no completed failing case.
`/tmp/647-slice5-final-frontend.json` retains that interrupted result; it is not
claimed as covering proof. No broad retry was run.

Corrected covering command (exact relative file filters):

```sh
OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=/tmp/647-slice5-focused-final.json caffeinate -s -i npm run test:dashboard:frontend -- frontend-tests/intent/intent-done-landed-review-mode.spec.ts frontend-tests/intent/intent-done-project-refresh-proof.spec.ts frontend-tests/intent/intent-done-project-refresh-reading.spec.ts frontend-tests/intent/intent-done-review-modes.spec.ts frontend-tests/intent/intent-done-source-selection.spec.ts frontend-tests/intent/intent-ci-done-glance.spec.ts frontend-tests/intent/intent-ci-done-reference-lifecycle.spec.ts frontend-tests/intent/intent-story-ci-cues.spec.ts frontend-tests/intent/intent-story-coverage.spec.ts frontend-tests/intent/intent-story-dark-appearance.spec.ts frontend-tests/intent/intent-story-review-return.spec.ts frontend-tests/review/story-review-action.spec.ts frontend-tests/review/story-review-diff-syntax-arrival.spec.ts frontend-tests/review/story-review-diff-syntax.spec.ts frontend-tests/review/story-review-diff-syntax-paths.spec.ts frontend-tests/review/story-review-diff-syntax-appearance.spec.ts frontend-tests/review/story-review-uncommitted-check.spec.ts --workers=1
```

Terminal exit 0, completed strict pass, **25 selected and passed attempts**,
46.15s; recorder run `44b615c4-b49a-41a9-94b9-198e5b373e37`. It covers all eight new cases,
existing Done cues/coverage/dark, Review return, action/range/mark, staged text,
syntax/path/appearance and uncommitted state. Log `/tmp/647-slice5-focused-final.log`.
[Consumer dispositions](slice-5-consumers.md). A final explicit-kind guard is
also renewed on its three consuming mode/source journeys below.

Removed exactly seven originals and seven duration rows; two live E2E companion
links now point to Frontend. Historical records retain original identities.
Read-only Prettier projections found every changed/proposed source below 250
lines; no formatter wrote files. `git diff --check` passed. No production scratch
change remains. Coordinator-owned PLAN/execution-context changes are untouched.

Final guard renewal: `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=/tmp/647-slice5-final-guard.json caffeinate -s -i npm run test:dashboard:frontend -- frontend-tests/intent/intent-done-review-modes.spec.ts frontend-tests/intent/intent-done-landed-review-mode.spec.ts frontend-tests/intent/intent-done-source-selection.spec.ts --workers=1`: exit 0, completed strict pass, three selected/passed attempts, run `3f3ca4f7-9e37-4b42-bcc4-643fe227ad8d`.

Implementation charged **14.8 active minutes conservatively**, excluding actual command waits. All commands terminal; no remaining implementation or proof gap. Independent refactoring and delivery remain coordinator-owned.

## Independent refactor proof

Removed only the unused Done Review helper argument/property and its call-site
arguments; explicit source/diff setup and all 134 observations stay equal.
[Refactor consumer dispositions](slice-5-consumers.md#independent-post-change-refactor).
Before launch, this macOS host was awake on AC, load 4.50/3.45/3.49, 69% memory
free; no competing browser/test build was observed, and the coordinator owned
no running proof. Chose the three affected cases with one worker under the
maintained sleep guard, using the retained approximately 11-second duration.
Reconsider only if failure, contention or changed workload invalidates that basis.

`OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=/tmp/647-slice5-refactor-callers.json caffeinate -s -i npm run test:dashboard:frontend -- frontend-tests/intent/intent-done-review-modes.spec.ts frontend-tests/intent/intent-done-landed-review-mode.spec.ts frontend-tests/intent/intent-done-source-selection.spec.ts --workers=1`:
terminal exit 0; inspected completed strict pass, exactly three selected cases
and three first passed attempts, 11.04s; run
`d50e5a9a-9571-41f4-b003-a66cc56ea426`. Setup and assertions remain in the named
mode/source cases; log `/tmp/647-slice5-refactor-callers.log`.
`npm run typecheck:dashboard` and `git diff --check`: exit 0.
Every changed/proposed source stays below 250 project-formatted lines.
No formatter, lint, commit or push was run by the refactor owner.
Extended untracked-file whitespace inspection finds a blank line at EOF in
`frontendStoryReviewAnswers.ts` and coordinator-owned `execution-context.md`;
the coordinator owns their removal in the formatting gate before commit.

Boundary review added two observations in `intent-done-landed-review-mode`:
arm the next story-review request immediately before ordinary Review, await
the actual held ask, then require `historical !== "true"` and absent `run`.
The endpoint-only predicate deliberately accepts incorrect query values so
neither fault can escape observation. These client-wire checks pair with the
real Backend ordinary snapshot/no-selected-run case; all original 134 observing
occurrences remain unchanged. No new helper, data model or product seam.

Renewed host basis: AC, load 3.79/3.51/3.49, 70% free memory, no competing
browser/test build observed; chose only the affected case, one worker, same guard.
`OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=/tmp/647-slice5-refactor-ordinary-query.json caffeinate -s -i npm run test:dashboard:frontend -- frontend-tests/intent/intent-done-landed-review-mode.spec.ts --workers=1`:
exit 0, inspected completed strict pass, exactly one selected case and one first
passed attempt, 4.44s, run `18efba8d-e5d0-4b90-aa5f-1293113c3e78`.
The request's query and existing captured-to-live held status, cleared run
controls/file browser, released live diff, All changes and focus return all pass.
Final `npm run typecheck:dashboard`: exit 0. No further observation is deferred.
