# Speed up touch review checks

**Identity:** SEED-312#speed-up-touch-review-checks
**Source:** [Story](../../seeds/SEED-312-touch-review-checks.md#speed-up-touch-review-checks)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Maintainers get faster feedback from the four cases of
[story-review-touch.spec.ts](../../../dashboard/tests/review/story-review-touch.spec.ts).
Real finger input still proves that each review pane scrolls on its own and
that the chosen file and both reading places survive rotation and panel
controls. The whole one-worker command takes at least a quarter less wall time
than the execution base and sends at most two thirds of its finger strokes.

Included: a comparison sized to the touch assertions, stroke distances the
reading promises need, one owner for each viewport-independent observation,
and setup that only serves a journey's own assertions.

Excluded: first-in-worker preparation and the reading case's default-timeout
fit, which SEED-287 owns; the desktop review checks' own assertions; other
touch specs; `scrollByTouch` in `dashboard/tests/touchGestures.ts`; product
code. The recorded 63.0 s weight in `dashboard/longest-first-journeys` waits
for the next ordinary refresh under
[dashboard shards](../../../dashboard/tests/shards.md): an overstated weight
only leaves its shard lighter than predicted.

[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
requires the comparison and the result worth keeping to be set before the
measured run. The story's success measure sets both.

## Architecture and reuse

PFE, comparison data: the responsibility is "the changed files a review
comparison holds, sized to what its consumers assert". Its existing owner is
`largeWorktree` in `dashboard/tests/support/storyReviewWorktree.ts`, which
desktop reaches through `openLargeReview` in `reviewPanes.ts` and touch through
`openReviewByTouch`. SEED-287's branch moves the file facts into a shared
MakeMe revision description, `dashboard/tests/support/largeReviewFiles.ts`.
Change that one owner so each consumer states its facts at the call site: files
per folder, lines in the two long files, and the wide line. Desktop states
today's large facts. No second fixture.

PFE, viewport ownership: `dashboard/tests/README.md`,
[where a check goes](../../../dashboard/tests/README.md#where-a-check-goes),
already rules that touch journeys use one device unless the other reaches an
asserted arrangement the first does not, and names this spec's tablet portrait
for the side-by-side review body. The plan applies that rule inside the two
tablet cases. No new rule, North Star topic or ADR is needed.

Common rule for every slice: an observation or a distance stays only while a
deliberate product fault fails because of it.

No file this plan expects to edit exceeds 250 lines.
`storyReviewWorktree.ts` is at 250; the comparison's file facts leave it for
`largeReviewFiles.ts`, the seam SEED-287 already chose.

## Outside-in proof ownership

| Promise | Owning slice and observable proof |
| --- | --- |
| SEED-287 ownership is respected whichever story lands first | 1: the base observation records which case applies. 2: worker inputs, default budget or allowance stay as the base has them |
| Comparison no larger than the touch assertions distinguish, stated through MakeMe at the call site; desktop keeps its large comparison | 2: touch cases pass on the small facts; the desktop selection passes on unchanged facts |
| Only the strokes each reading promise needs | 2: stroke count from traced runs; reading examples on phone and tablet pass |
| Every scroll result comes from native touch | 2–4: no assigned scroll position, synthesized scroll or layout-only assertion replaces a gesture; faults F1 and F2 fail |
| One owner per viewport-independent observation; the tablet repeats only what its arrangement changes | 3: surviving-proof rows with a fault per removed observation; F4 still fails a tablet case and no phone case |
| A journey prepares only what its own assertions use | 4: context cases pass with fewer range reads; the explicit Commits beat still shows the whole range |
| Rotation, panel controls, Next file, Refresh, explicit Commits, leaving uncommitted changes out and Close keep or return what the examples name | 3–4: the remaining context cases pass with those observations; F3 fails at the chosen file after rotation |
| Surviving proof before any removal | 2–4: each removal names its remaining owner and the fault that owner fails |
| No changed case takes longer under load; no allowance added | 5: paired per-case durations under burners at two workers; no `test.setTimeout` added |
| A quarter less whole-command wall time and at most two thirds of the strokes | 5: alternating base and candidate runs, three passing observations each |
| Ordinary CI selection; no mocks, sleeps, retries, skips or runner modes | 5: same spec path and command; diff review; hosted CI on the published revision |

## Decisive premises

Observed in this preparation's workspace at `77716145b` on 2026-11-11 after
`node scripts/setup-native.mjs npm`, `browser` and `check`. Scratch edits were
reverted before recording.

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| The focused command runs the four cases in a worktree | Every slice's proof | `npm run --silent test:dashboard -- tests/review/story-review-touch.spec.ts --workers=1`, with `OPEN_DOUGH_DASHBOARD_PROOF_RECORD` for case durations | Settled: 4 passed in each of four runs on unchanged files; the record lists four attempts with `durationMs` |
| Native strokes dominate the reading cases | Slice 2 target | The same command with `--trace=on --reporter=list`; `Send CDP command` steps issued from `scrollByTouch` in each case's `test.trace`, six per stroke | Settled: phone reading 186 sends, 12.6 s of a 25.1 s body; tablet reading 132, 9.1 of 16.0 s; each context case 18. 59 strokes in all at load 33–36 |
| A smaller comparison keeps every current assertion passing on both viewports | Slice 2 approach | Scratch: 12 files per folder, 60-line long files, SEED-287's 125-character line, and the return distance bounded by the pane's own position | Settled: 4 passed three times; 28 strokes; whole command 28.9 and 32.1 s against 35.2 and 37.2 s with only the shorter line, load 4–9, alternating order. Unverified: how much smaller the facts can go |
| A fixed 1,000 px return needs that much content above it | Slice 2 journey change | Reading `scrollByTouch`: with a scroller it waits for `scrollend` after every stroke | Settled by the scratch run above, which bounded the distance and passed. A stroke that moves nothing would wait for a `scrollend` that never comes |
| The context journey's commit choice is only setup | Slice 4 approach | Scratch: select the file under the default comparison and skip `chooseLargeChangesCommitByTouch` | False: both context cases fail at `storyReviewTouchContext.ts:105` with "1 changed file in the chosen range". The later explicit Commits beat uses the chosen range. Slice 4 moves the choice to that beat and removes only the return to All changes |
| The reading cases own sideways reading | Slices 2–3 fault control F1 | Scratch `.story-review-code { overflow-x: hidden }`; `--workers=2 --reporter=list` | Settled: both reading cases fail and both context cases pass. They fail by exhausting the 60 s allowance, not by a named expectation |
| Every case needs the file browser to scroll on its own | Fault control F2 | Scratch `.story-review-files` with `overflow: visible` and no `min-height` | Settled: all four fail at `touchGestures.ts:69`, "room for an in-view finger stroke" |
| The context cases own the chosen file through rotation | Slices 3–4 fault control F3 | Scratch `key={offerMaximize ? "beside" : "covering"}` on the review section in `StoryReview.tsx` | Settled: both context cases fail at `storyReviewTouchContext.ts:60`; both reading cases pass. The phone context alone detects it |
| Only the tablet reaches the side-by-side body | Slice 3 fault control F4 | Scratch `.story-review-diff` without `min-width: 0` | Settled: tablet reading fails at `storyReviewTouchJourney.ts:109` and tablet context at "the stroke's scrolling comes to rest"; both phone cases pass |
| Desktop reaches the comparison only through `largeWorktree(origin)` with today's facts | Slice 2 consumer proof | `git grep` of `largeWorktree` and `openLargeReview`: `reviewPanes.ts:61`, called by `story-review-panes.spec.ts` and `story-review-file-moves.spec.ts`. The desktop selection under Verification, run once | Settled for the route: 5 passed in 20 s at load 11. The two callers are the only others; slice 2 reruns the selection after the builder changes |
| SEED-287's touch reading changes are on main | Slice 1 base; slice 2 file choice | `git diff` of the touch paths between main and `origin/codex/make-dashboard-journeys-fit-the-default-timeout` | Not on main at `77716145b`; accepted on that branch at `90cfdde52` with its last slice planned. Open by nature: slice 1 observes it again at Take |
| Burners reach SEED-287's load profile at two workers and the base passes there | Slice 5 load proof | `bash scripts/dashboard-repeat.sh 1 --load tests/review/story-review-touch.spec.ts` with Homebrew Bash first on `PATH` and a proof record | Settled: exit 0 in 38 s, load 11.5 → 22.2; cases 27.0, 16.4, 14.5 and 8.6 s. The phone reading case stayed 3 s inside the default 30 s and still carries its 60 s allowance on main |

## Verification

Local gate on fully awake AC macOS uses
[`caffeinate -s -i`](../../../tests/local-test-resources.md#machine-sleep-on-macos);
on battery, plug in or start fully awake with the lid open under
`caffeinate -i` and read the sleep log afterwards. The
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to every delegation and repair handoff.

Focused commands, from the repository root:

- Touch: `npm run --silent test:dashboard -- tests/review/story-review-touch.spec.ts --workers=1`,
  with `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=<file>` for durations and no
  `--reporter`. Three consecutive passes after a journey change.
- Strokes: the same command with `--trace=on --reporter=list`, counted as in
  the premise row.
- Desktop consumers of the comparison:
  `npm run --silent test:dashboard -- tests/review/story-review-panes.spec.ts tests/review/story-review-file-moves.spec.ts tests/review/story-review.spec.ts --workers=2`.
- Fault controls F1–F4: apply one scratch product edit from the premise rows,
  run the touch command with `--workers=2 --reporter=list`, record which cases
  fail and where, and revert before the next.
- Under load: `bash scripts/dashboard-repeat.sh 1 --load tests/review/story-review-touch.spec.ts`
  with Homebrew Bash first on `PATH` and its own proof record each time.

Typecheck and lint the affected paths through the ordinary commit hooks. No
whole local suite is required: the changed helpers serve only this spec and
the desktop selection above. Hosted CI runs the whole suite on the published
revision, and its failures stay the executor's.

Record the base revision, literal commands, pass counts, wall times and the
one-minute load before and after each timed run.

## Ordered slices

### 1. The execution base and its controls are on record
Type: Behavior
Status: done
Proof: The plan records the base revision and whether it holds SEED-287's
touch reading changes: the spec's `queuedClaudePreviewTest`, no
`test.setTimeout`, and `largeReviewFiles.ts`. A detached worktree of that
revision in a temporary directory outside the workspace, set up with
`setup-native`, stays runnable for slice 5 and is removed after it. On the
base: one proof record of the four cases and the stroke count from one traced
run. Rerun F1–F4 and the burner run on the base only when its touch paths
differ from `77716145b`.

Behavior: Main as it is at Take → the probe runs → the base revision, its
SEED-287 state, four case identities, strokes and fault owners are recorded.
This is an authorized early probe: a base whose strokes or fault owners differ
from the premise rows revises slices 2–4 before they start.

Accepted 2026-11-11: the [execution base record](#execution-base-record) holds
the proof; the coordinator read `base-proof-1.json` and recounted the traces.
Refactor disposition: records-only.

### 2. Touch reading covers only the distance its assertions need
Type: Behavior
Status: done
Proof: The touch command passes three consecutive times and the desktop
selection passes. The traced stroke count is recorded against the two-thirds
target that slice 5 judges. F1 fails both reading cases at a named reading
expectation, F2 fails every case, and F4 fails a tablet case and no phone
case. The consumer-trace record
gives every located consumer a disposition.

Behavior: A touch journey states its comparison's facts at the call site
through the shared MakeMe revision description → the reading cases run on the
phone and the tablet → each named part of the wide line and a short line are
read inside the code pane, the file browser moves on its own, and nothing else
moves.

- Facts the assertions need: a file list that overflows the file browser in
  its tallest arrangement; two files that overflow the code pane wherever the
  context journey scrolls them; a wide line that starts below the fold in both
  reading arrangements and exceeds the widest reading pane by more than its
  15-character end; one folder; one uncommitted file. Find each smallest value
  by observing the arrangement, not by copying the probe's numbers.
- Changed-file counts in touch helpers follow the stated facts.
- The return after the wide line covers the observed position, not a fixed
  1,000 px.
- A read whose stroke moves nothing ends and fails its own expectation, so a
  pane that stops scrolling fails by name instead of by timeout.
- Base with SEED-287: change `largeReviewFiles.ts`, keep
  `queuedClaudePreviewTest` and the default budget, and remove the
  reading-specific line argument the small comparison makes unused.
- Base without SEED-287: create the description at
  `dashboard/tests/support/largeReviewFiles.ts`, where SEED-287's branch puts
  it, so its integration meets one file to keep. Leave the 60 s allowance and
  its comment untouched.

Accepted 2026-11-11 on the "Base without SEED-287" bullet. Evidence is in
`/Users/terryyin/.claude/jobs/cb428881/tmp/s2/` and `tmp/s2-proof-*.json`.

- Facts, stated in `openReviewByTouch`: one folder of 15 files, 50-line long
  files, a 75-character wide line, one uncommitted file; 18 changed files.
  Tablet portrait binds each: its file browser is 691 px tall with 47 px rows
  (12 files is the least that leaves the first long file below the fold; 11
  fails both tablet cases), its code pane is 647 px tall and 440 px wide (47
  lines and 61 characters are the least that passed). The margin is 3 rows, 3
  lines and 14 characters for another machine's fonts.
- Desktop states today's facts in `openLargeReview`; a scratch comparison
  found its 63 files equal to the base's. Desktop selection: 5 passed.
- Touch command, final code: 4 passed three times, 107, 91 and 103 s at load
  25–35 (52, 51 and 52 s at load 9–25 before the one-stroke return).
- Strokes, traced: 5, 3, 5 and 3; 16 in all against 59. Range reads unchanged.
- F1 fails both reading cases at "the long line's ending is read within the
  diff", `storyReviewTouchJourney.ts:164`, in 9–24 s. F2 fails all four: phone
  reading there, the other three at "the stroke's scrolling comes to rest".
  F3 fails both context cases at `storyReviewTouchContext.ts:60`. F4 fails
  only tablet reading, at `overflows(code).sideways`,
  `storyReviewTouchJourney.ts:133`.
- For slices 3–4: tablet reading is now F4's only owner, so its `:133`
  observation stays. `reviewTouchReading.ts` is at 244 lines. F2 no longer
  fails at `touchGestures.ts:69`.
- Consumer trace: `tmp/s2/consumer-trace.txt`. The touch spec and the three
  desktop specs ran; other importers of `storyReviewWorktree.ts` use unchanged
  exports and `npm run --silent typecheck:dashboard` passes.
- Refactor pass complete: one local renamed and one comment reworded in
  `readCodePartByTouch`. After it the touch command passed three times
  (`tmp/refactor-proof-*.json`, 86, 79 and 129 s at load 31–39) and F1 still
  fails both reading cases at `:164`.

### 3. The tablet repeats only what its side-by-side arrangement changes
Type: Behavior
Status: done
Proof: The touch command passes three consecutive times. A surviving-proof
table in this plan lists each observation removed from a tablet case, its
remaining owner, and a scratch fault that owner fails. F4 still fails a tablet
case and no phone case. F1–F3 each still fail a remaining case. No case is
added and none gains a step.

Behavior: A tablet in portrait shows the file browser beside the code → its
cases run → they observe what that arrangement and the tablet's covering and
beside-the-page panel change. Tap-target size, the context reveal, the folder
toggle and the commit choice stay with their phone owner.

- A tablet case goes entirely only when every fault it detected has a
  remaining owner. Otherwise it keeps its arrangement-dependent observations.
- `dashboard/tests/README.md` keeps its statement that this spec holds tablet
  portrait for the side-by-side review body; correct it if the kept role
  changes.

Accepted 2026-11-11. Evidence is in
`/Users/terryyin/.claude/jobs/cb428881/tmp/s3/` and `tmp/s3-proof-*.json`.

- The phone owns what no arrangement changes, decided by
  `ownsSharedObservations` in `storyReviewTouchJourney.ts`. Tablet reading
  selects the long file under the default comparison and keeps the whole
  reading. Tablet context moves both panes and keeps the rotation loop:
  covering at 768 px, Maximize and Restore beside the page at 1024 px, no
  review read. Neither tablet case goes entirely: F4 needs tablet reading, and
  K1 (`narrowWindow` 800 → 700 in `sidePanelWidth.ts`) fails only tablet
  context, at `sidePanelWidthPage.ts:50`.
- [Surviving proof](#surviving-proof) lists the eleven removed observations.
- Touch command: 4 passed three times, 43, 52 and 63 s at load 11–24.
- Strokes, traced: 5, 3, 5 and 2; 15 in all. Range reads 2, 3, 0 and 0.
- F1 fails both reading cases at `storyReviewTouchJourney.ts:186`. F2 fails
  all four. F3 fails both context cases at `storyReviewTouchContext.ts:71`.
  F4 fails only tablet reading, at `storyReviewTouchJourney.ts:155`.
- The README sentence stands: tablet portrait is still held for the
  side-by-side review body. The spec file is unchanged.
- Line numbers in slice 2's records are those of `205452d94`.
- For slice 4: the tablet context case no longer chooses a commit; only the
  phone path remains. Phone reading keeps `chooseCommitThenAllChangesByTouch` as the
  owner of the commit choice and the return to All changes.
- For wrap-up: rows 36–39 of SEED-303's coverage map describe the base's
  tablet observations.
- Refactor pass complete: every viewport selects the long file in one
  statement, `chooseCommitThenAllChangesByTouch` no longer selects it, and the
  phone's panel controls are `keepReviewContextThroughPanelControls`. After it
  the touch command passed three times (`tmp/s3-refactor-proof-*.json`, 59, 63
  and 57 s at load 19–32), strokes and range reads were unchanged, and F3 and
  F4 failed as above.

### 4. Context journeys prepare only what they assert
Type: Behavior
Status: done
Proof: The touch command passes three consecutive times. A context case's
trace shows fewer `/__agent-launch/review/range` requests than the base's
three. F3 still fails a context case at the chosen file after rotation. The explicit Commits
beat still reports every changed file in the chosen range and keeps its file
and reading place through rotation.

Behavior: A context journey opens the review under its default All changes
comparison and selects its file → rotation, Maximize and Restore, Hide files
and Show files, Next file, Refresh, explicit Commits and leaving uncommitted
changes out run as today → the same reading places, file and comparison
survive. The "large changes" commit is chosen where the Commits beat needs its
range.

Accepted 2026-11-12. Evidence is in
`/Users/terryyin/.claude/jobs/cb428881/tmp/s4/` and `tmp/s4-proof-*.json`.

- The context journey opens under the default comparison and selects its
  file. The phone chooses the "large changes" commit at its Commits beat. The
  early choice and the return to All changes are gone from it: one Commits
  tap, one All changes tap and one range read fewer.
- That step had detected three faults. The commit choice and the All changes
  choice keep phone reading as owner. A chosen range forgotten outside Commits
  (fault FR) failed the step on `d7622bc2b`, fails no touch case now, and
  fails `story-review-commit-ranges.spec.ts:80` and
  `story-review-commit-refresh.spec.ts:96`. [Surviving proof](#surviving-proof)
  holds the row.
- Returned once at acceptance for the rotation example's whole result:
  `expectKept` now asserts the chosen file, All changes, the code's place and
  the file browser's place after each rotation, after Maximize, after Restore
  and after Show files. The product keeps the browser's place in every
  arrangement (phone 625, tablet 160). Faults that lose only the browser's
  place on rotation, or rebuild the body on Maximize, fail both context cases
  there. No stroke, tap or read was added.
- Touch command, final code: 4 passed three times, 87, 99 and 64 s at load
  38–54.
- Strokes, traced: 5, 3, 5 and 2; 15 in all against 59. Range reads 2, 2, 0
  and 0; 4 against 10.
- Final fault control on this code, one worker: F1 fails both reading cases at
  `storyReviewTouchJourney.ts:186`; F2 fails all four; F3 fails both context
  cases at the chosen file after rotation; F4 fails only tablet reading, at
  `storyReviewTouchJourney.ts:155`.
- For slice 5: at load 40–54 phone reading took up to 42 s in passing runs,
  inside the allowance SEED-287 owns. Only alternating runs compare.
- Refactor pass complete: one comment reworded above `expectKept`; no code or
  line moved. `npm run --silent typecheck:dashboard` passes.

### 5. The saving is measured against the base and kept
Type: Behavior
Status: planned
Proof: Alternating base and candidate runs of the one-worker touch command
under the same load, three passing observations each, with proof records. The
candidate's median whole-command wall time is at most 75% of the base's, and
its strokes at most two thirds. Alternating burner runs at two workers, three
each: every changed case's median duration is no longer than its base
counterpart. The diff adds no `test.setTimeout`, sleep, retry, skip, mock or
runner mode, and the spec path is unchanged. Hosted CI passes on the published
revision; the touch file's seconds from that run's `dashboard-times` artifact
are recorded beside 63.0 s as evidence, not as acceptance.

Behavior: The base worktree and the finished candidate run under like
conditions → the comparison is recorded in this plan → the declared saving is
observed with every preparation and teardown paid.

A miss is not rounded up. Record the observations and stop for the
coordinator's decision on keeping the smaller gain or continuing.

## Execution base record

Observed by slice 1 on 2026-11-11.

- Base revision: `58442ace806e4d1110d9b47e2d2fd6644ce7a1b2`, main as it was at
  Take; `origin/main` still names it. Story Branch Mode. The retained
  published revision is `58442ace8`, accepted on `main` as the Take claim.
- SEED-287 state: base without SEED-287. At the base,
  `story-review-touch.spec.ts` imports `test` from
  `../support/preparationPage.ts` and names no `queuedClaudePreviewTest`; it
  carries `test.setTimeout(60_000)` at line 18; and
  `dashboard/tests/support/largeReviewFiles.ts` does not exist. SEED-287's
  shorter line, worker inputs and removal of the 60 s allowance are therefore
  not on the base, and neither story waited for the other.
- Consequence: slice 2 takes its "Base without SEED-287" bullet. It creates
  `dashboard/tests/support/largeReviewFiles.ts` and leaves the 60 s allowance,
  its comment and the worker inputs untouched. The "Base with SEED-287" bullet
  is not triggered.
- Base worktree: detached at
  `/Users/terryyin/.claude/jobs/cb428881/tmp/base-58442ace8`, set up with
  `node scripts/setup-native.mjs npm`, `browser` and `check`, each exit 0. It
  is never edited. Slice 5 measures against it and then removes it.
- Carried from the premise rows, not rerun: F1–F4 and the burner observation.
  `git diff --stat 77716145b 58442ace8 -- dashboard/tests dashboard/src/client`
  is empty, so the base's touch paths are those the premises observed.

Commands, from the base worktree root, each after
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i`:

- Record: `npm run --silent test:dashboard -- tests/review/story-review-touch.spec.ts --workers=1`
  with `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/Users/terryyin/.claude/jobs/cb428881/tmp/base-proof-1.json`.
  4 passed; whole command 113 s; one-minute load 37.1 before, 19.2 after.
- Traced: the same command with `--trace=on --reporter=list`. 4 passed; whole
  command 90 s; load 17.9 before, 15.4 after. Sends are `Send CDP command`
  steps issued from `scrollByTouch` in each case's `test.trace`, six per
  stroke. Range reads are `/__agent-launch/review/range` requests in the
  case's `*.network` files.

| Case | Record `durationMs` | Traced run | Sends | Strokes | Range reads |
| --- | --- | --- | --- | --- | --- |
| phone review by touch › chooses a comparison and file and reads within each pane | 45,917 | 34.5 s | 186 | 31 | 2 |
| phone review by touch › keeps the chosen file and reading places through rotation and panel controls | 13,812 | 13.5 s | 18 | 3 | 3 |
| tablet review by touch › chooses a comparison and file and reads within each pane | 26,560 | 24.2 s | 132 | 22 | 2 |
| tablet review by touch › keeps the chosen file and reading places through rotation and panel controls | 10,897 | 12.9 s | 18 | 3 | 3 |
| All four | 97,186 | 85.1 s | 354 | 59 | 10 |

Sends, strokes and each context case's three range reads equal the premise
rows, so slices 2–4 stand as planned. Wall times are relative to load: the
premise's 35.2 and 37.2 s were at load 4–9. At load 37 the phone reading case
took 45.9 s, past the default 30 s and inside the 60 s allowance SEED-287
owns.

## Current decisions

- Cases only lose work. No case absorbs another's steps: that keeps each
  changed case no longer under load by construction, and slice 5 observes it.
- Story Branch Mode. No slice acts from trunk.
- Fault controls are scratch product edits in the execution workspace,
  reverted before any commit. Product code does not change.
- `scrollByTouch` stays as it is. A slice that finds it must change runs its
  other consumers first: `reportTouchPage.ts`, `settingsTouchPage.ts`,
  `touchTerminalPage.ts` and `frontend-tests/touch-reading-observation.spec.ts`.
- The comparison's probe values (12 files per folder, 60 lines, 125
  characters) are evidence that smaller facts pass, not the chosen facts.

## Plan concern assessment

Slice-plan refinement was not needed: five slices share one rule, each has one
proof loop, and the one premise that stays open by nature, whether SEED-287's
changes are on main at Take, is bounded by the early probe in slice 1. This review found no remaining slice-specific concern. No
human-owned scope or ADR decision is pending.

## Execution notes

- No numeric slice target or hard limit is supplied; judge boundedness by one
  proof loop and the Behavior gate.
- Shared `makeMe` arranges the comparison's domain data. No sleeps,
  `test.slow()`, or suite, file, group or hook timeout overrides.
- Timed runs are relative. This machine's load moved between 4 and 36 within
  minutes during preparation; alternate base and candidate and record loads
  rather than waiting for an idle machine.

## Failures seen outside this story

Slice 4's search for a remaining owner ran the review family
(`npm run --silent test:dashboard -- tests/review --workers=2`, 183 cases with
`backend-tests/review`) at load 34–49. Five cases this story does not touch
failed, and failed again at one worker with product code clean:
`backend-tests/review/story-review-completed-conflicts.spec.ts:73`,
`tests/review/story-review-completed-merge-edits.spec.ts:11`,
`tests/review/story-review-one-shot-choice-races.spec.ts:12`,
`tests/review/story-review-one-shot-choice.spec.ts:13` and
`tests/review/story-review-story-branch-landed.spec.ts:27`. Four exceed the
30 s case budget and one a 5 s observation; their Before Hooks took 2–4 s.

Attribution, 2026-11-12, the five files at one worker with `--reporter=list`:
the base worktree failed six cases, those five and
`story-review-completed-conflicts.spec.ts:16`, in 260 s at load 37.2 → 33.6;
the candidate failed the same five in 248 s at load 33.6 → 42.1
(`tmp/five/`). Hosted CI passed on `205452d94` (run 43035009375) and
`d7622bc2b` (run 43044486491). The cause is this machine's load from other
work, above the 20–30 that SEED-287 promises; no changed helper is imported by
these files.

Owner: SEED-287's active execution
(`codex/make-dashboard-journeys-fit-the-default-timeout`, Taken) owns
dashboard journeys fitting the default budget under load, and its story names
`story-review-story-branch-landed.spec.ts:27`. This execution writes no
duplicate repair. Remaining gate for that owner or the developer: the other
four cases are not named in SEED-287's story, and none is shown to pass at
load 20–30.

## Surviving proof

Recorded by slice 3 on 2026-11-11; slice 4 added the last row. Each fault is
a scratch product edit, reverted after its run. Slice 3's faults ran on
`205452d94`, before the removal, with the touch command at one worker and
`--reporter=list`: the tablet case and its phone owner failed at the same
place. After slice 3's removal the context-reveal and Hide files faults
failed only the phone cases. Owner lines are those of the code as slice 4
leaves it. Slice 4 moved lines in `storyReviewTouchContext.ts`. On its own
code it reran the two commit-choice faults and the explicit Commits fault,
whose lines its kept-things helper `expectKept` then moved by 17, and
afterwards the Hide files fault and its own row's third fault; the other
rows' lines are renumbered without a rerun. Logs:
`/Users/terryyin/.claude/jobs/cb428881/tmp/s3/` and `tmp/s4/`.

| Observation or step removed, and where it was | Remaining owner | Scratch fault | Observed failure of the owner |
| --- | --- | --- | --- |
| Reading: the context line, All changes, Commits, the folder and the uncommitted label are each at least 44 px tall (`storyReviewTouchJourney.ts:115-120`) | Phone reading, `storyReviewTouchJourney.ts:122-127`, the same five heights | `story-review-touch.css`: `.story-review-uncommitted label` left out of the `min-height` rule | Phone reading at `:126`: "Include uncommitted changes", expected >= 44, received 23.1875 |
| Reading: a tap shows the context in full with the worktree unclipped, and a second returns it to one line (`storyReviewTouchJourney.ts:121`) | Phone reading, `storyReviewTouchJourney.ts:128`, through `readContextByTouch`, `reviewTouchReading.ts:89-106` | `StoryReviewContextLine.tsx`: the tap only ever shows the line in full | Phone reading at `reviewTouchReading.ts:105`: `aria-expanded` expected "false", received "true" |
| Reading: a tap closes the folder and a second opens it (`storyReviewTouchJourney.ts:122-127`) | Phone reading, `storyReviewTouchJourney.ts:129-134` | `StoryReviewSnapshotView.tsx`: `onToggle` never collapses a folder | Phone reading at `:131`: `aria-expanded` expected "false", received "true" |
| Reading and context: the "large changes" commit chosen by touch lists every changed file (`chooseAllChangesFileByTouch` as it was, called at `storyReviewTouchJourney.ts:128` and `storyReviewTouchContext.ts:44`) | Phone reading, `storyReviewTouchJourney.ts:135`, through `chooseCommitThenAllChangesByTouch`, and phone context at its Commits beat, `storyReviewTouchContext.ts:149`; both through `chooseLargeChangesCommitByTouch`, `reviewTouchReading.ts:195-214` | `useStoryReviewComparison.ts`: `onSelect` leaves the range on its anchored item | Both phone cases at `reviewTouchReading.ts:208`: `aria-pressed` expected "true", received "false" |
| Reading and context: All changes chosen by touch after the commit is the comparison shown (the same call) | Phone reading, `storyReviewTouchJourney.ts:107-111`, in the same call | `StoryReview.tsx`: `onSwitch` ignores the All changes choice | Phone reading at `:111`: expected checked, received unchecked |
| Context: Hide files and Show files keep the chosen file and both reading places (`storyReviewTouchContext.ts:78-85`) | Phone context, `storyReviewTouchContext.ts:128-132`, through `expectKept`, `:43-53` | `StoryReviewSnapshotView.tsx`: the file browser keyed by whether it is shown | Phone context at `:52`, called at `:132`: expected 625, received 0 |
| Context: Next file opens the next file at its top (`storyReviewTouchContext.ts:86-89`) | Phone context, `storyReviewTouchContext.ts:133-136` | `StoryReviewSnapshotView.tsx`: `FileDiff` without its `key` | Phone context at `:136`: expected 0, received 285 |
| Context: Refresh reads again, says so and keeps the chosen file (`storyReviewTouchContext.ts:90-99`) | Phone context, `storyReviewTouchContext.ts:137-146` | `StoryReview.tsx`: the review body keyed by the Refresh round | Phone context at `:146`: `aria-pressed` expected "true", received "false" |
| Context: explicit Commits reports its range and keeps its file and reading place through rotation (`storyReviewTouchContext.ts:100-118`) | Phone context, `storyReviewTouchContext.ts:149-166` | `StoryReview.tsx`: the section keyed by `shown === "commits" && offerMaximize` | Phone context at `:163`: heading "Added long-b.txt", element not found |
| Context: leaving uncommitted changes out by its tap-sized label survives rotation (`storyReviewTouchContext.ts:120-125`) | Phone context, `storyReviewTouchContext.ts:168-173`, through `leaveUncommittedOutByTouchLabel`, `reviewTouchReading.ts:217-244` | `StoryReview.tsx`: an effect on `offerMaximize` includes uncommitted changes again. The label: the first row's fault | Phone context at `reviewTouchReading.ts:243`: expected not checked, received checked. The label, at `:235`: "touch target height", expected >= 44, received 23.1875 |
| Context: Close removes the review and returns focus to Review changes (`storyReviewTouchContext.ts:126-129`) | Phone context, `storyReviewTouchContext.ts:174-177` | `keyboardReturn.ts`: a return focuses nothing | Phone context at `:176`: expected focused, received inactive |
| Phone context, removed by slice 4: the "large changes" commit chosen by touch and All changes chosen again before the long file is selected (`chooseCommitThenAllChangesByTouch`, called at `storyReviewTouchContext.ts:54` as slice 3 left it), so that the later Commits beat returned to a range chosen before All changes | The commit choice: phone reading, `storyReviewTouchJourney.ts:135`, and phone context at its Commits beat, `storyReviewTouchContext.ts:149`, where the choice now happens once. The return to All changes: phone reading, `storyReviewTouchJourney.ts:107-111`. The chosen range kept while All changes is shown: `story-review-commit-ranges.spec.ts:73-80` and `story-review-commit-refresh.spec.ts:92-96`, by pointer | The two commit-choice faults above: `onSelect` leaves the range on its anchored item; `onSwitch` ignores the All changes choice. A third, `useStoryReviewComparison.ts`: the chosen ends are forgotten whenever the comparison is not Commits | On slice 4's code. The first: phone reading and phone context at `reviewTouchReading.ts:208`, `aria-pressed` expected "true", received "false". The second: phone reading at `storyReviewTouchJourney.ts:111`, expected checked, received unchecked; phone context later, at `reviewTouchReading.ts:233`, where All changes is tapped to leave uncommitted changes out: "Include uncommitted changes", element not found. The third failed the removed step on `d7622bc2b`, phone context at `storyReviewTouchContext.ts:135`: expected "18 changed files in the chosen range", received "1 changed file". On slice 4's code no touch case fails it; `story-review-commit-ranges.spec.ts:80`, heading "Changes in 3 commits", and `story-review-commit-refresh.spec.ts:96`, heading "Changes in 2 commits", fail it, element not found, and pass without it |

## Story obligations

### G1. Phone context case passes 30 s first in its worker under load; SEED-287's active execution owns the repair
Reported: slice 2 — "In two `--workers=2` runs the phone context case, first in its worker, hit the default 30 s. The traces show Before Hooks at 17.4 s and 19.7 s (origin fixture 10–11 s, dashboard 5–8 s)."
Story clause: "first-in-worker preparation, other touch specs and the desktop review checks stay as they are"
Disposition: excluded "first-in-worker preparation, other touch specs and the desktop review checks stay as they are"

### G2. Tablet context case no longer detects a side-by-side diff that keeps its width
Reported: slice 2 — "The tablet context case no longer fails F4, because the shorter line no longer breaks the side-by-side layout for it."
Story clause: "The last one fails only where the file browser sits beside the code."
Disposition: proved by slice 2: F4 fails tablet reading at `storyReviewTouchJourney.ts:133` and no phone case (`tmp/s2/F4.log`); the tablet context's earlier failure came from the 405-character line, not from an assertion about width

### G3. Long-named file left out of the touch comparison
Reported: slice 2 — "Long-named file dropped from the touch comparison. The story's scope does not list it and no touch assertion names it."
Story clause: "Give the touch journeys a comparison no larger than their assertions distinguish"
Disposition: no user cost "Ordinary CI continues to catch the same product regressions.": no touch assertion read the long name at the base; `story-review-panes.spec.ts` ("long names and long code lines scroll sideways in their own pane") and `story-review-file-moves.spec.ts:158` still assert it on the desktop comparison, whose files equal the base's

### G4. Vertical return sent four strokes on the phone
Reported: slice 2 — "The return costs 4 strokes on the phone. Its pane gives 252 px of room and the position is 775 px."
Story clause: "Send only the finger strokes each reading promise needs"
Disposition: proved by slice 2: returned and corrected; `storyReviewTouchJourney.ts:176-179` sends one stroke of at most half the pane's height, and the traced total is 16 (`tmp/s2/trace-delta`)

### G5. Desktop review specs changed one import line each
Reported: slice 2 — "Desktop specs edited on one import line each. A re-export from `storyReviewWorktree.ts` would have left them untouched, but would make the two modules import each other."
Story clause: "first-in-worker preparation, other touch specs and the desktop review checks stay as they are"
Disposition: no user cost "Ordinary CI continues to catch the same product regressions.": only the module that `longA` and `longB` come from changed; the steps, assertions and comparison files of `story-review-panes.spec.ts` and `story-review-file-moves.spec.ts` are unchanged, and the desktop selection passed 5 of 5

### G6. A pane that barely moves fails the return stroke at scrollend, not at a reading expectation
Reported: slice 2 — "If a fault leaves the pane less than the touch slop to travel, it fails after 5 s at "the stroke's scrolling comes to rest" (seen under F2 on the tablet), not at a reading expectation."
Story clause: "a file browser that no longer scrolls on its own"
Disposition: proved by slice 2: F2 fails all four cases by a named expectation inside the case's own budget (`tmp/s2/F2-delta.log`); the story asks that the fault fails a remaining case

### G7. Controls the tablet no longer taps are reached by touch at phone sizes only
Reported: slice 3 — "The tablet no longer taps or reaches the context line, comparison labels, folder, commit row, Hide/Show files, Next file, Refresh, uncommitted label or Close. A fault that clips one of them only at 768 or 1024 px wide would pass."
Story clause: "The second viewport repeats only what its arrangement changes"
Disposition: excluded "The second viewport repeats only what its arrangement changes"

### G8. Hide files and Show files by touch no longer run with the file browser beside the code
Reported: slice 3 — "Hide files / Show files by touch is no longer exercised with the browser beside the code. The phone runs it stacked."
Story clause: "The second viewport repeats only what its arrangement changes"
Disposition: excluded "The second viewport repeats only what its arrangement changes"

### G9. Explicit Commits and leaving uncommitted changes out survive rotation at phone sizes only
Reported: slice 3 — "Explicit Commits and uncommitted-out through rotation are proven at 390 ↔ 844 only, no longer at 768 ↔ 1024."
Story clause: "The second viewport repeats only what its arrangement changes"
Disposition: excluded "The second viewport repeats only what its arrangement changes"

### G10. Rotation-loop assertions kept on the tablet without a tablet-only fault
Reported: slice 3 — "Kept without a tablet-only fault: the code pane height floors, `All changes` checked and `pageFits` in the loop, `reads` 0, and Maximize/Restore at 1024."
Story clause: "Maximize and Restore when the panel sits beside the page"
Disposition: no user cost "Dashboard maintainers get faster feedback on reviewing a story by touch.": these assertions send no stroke and read no review; they belong to the rotation loop that K1 and F3 fail on the tablet, and the story names covering and Maximize and Restore for the second viewport

### G11. The helpers decide the owning viewport from the page's width
Reported: slice 3 — "Ownership is read from the viewport inside the helper. `ownsSharedObservations` compares `page.viewportSize()?.width` with `phoneLaunchTouchViewport.portrait.width`. This keeps the spec byte-identical; any edit to spec line 19 would abut SEED-287's removal of lines 15–18."
Story clause: "Keep one owner for each observation that does not depend on the viewport"
Disposition: no user cost "Ordinary CI continues to catch the same product regressions.": the rule has one home, `ownsSharedObservations`, and the phone is its owner in both journeys; the spec file stays as SEED-287's branch expects it, and the refactor pass judged the viewport the honest input to decide from

### G12. The two tablet case titles say more than the tablet now does
Reported: slice 3 — "Tablet titles now overstate. "chooses a comparison and file" and "panel controls" remain by instruction; the tablet chooses only a file and uses only Maximize and Restore."
Story clause: "The second viewport repeats only what its arrangement changes"
Disposition: no user cost "Dashboard maintainers get faster feedback on reviewing a story by touch.": the titles come from the unchanged spec loop that SEED-287's branch also edits; each journey's comment now says that the title describes the phone's journey and what every other viewport runs

### G13. Returning to Commits on an already chosen range is no longer run by touch
Reported: slice 4 — "The lost observation's owner is not a touch check. Returning to Commits on an already chosen range is proven only by pointer, in the two desktop specs. No touch case re-enters Commits after All changes."
Story clause: "Remove comparison choices that only repeat another case's proof as setup."
Disposition: proved by slice 4: fault FR, the range forgotten outside Commits, fails `story-review-commit-ranges.spec.ts:80` and `story-review-commit-refresh.spec.ts:96` at one and two workers, and both pass with it reverted (`tmp/s4/final-FR-family.log`); the story asks that the fault fail a remaining check

### G14. All changes after Maximize, Restore and Show files has no fault of its own
Reported: slice 4 — "All changes after Maximize, Restore and Show files has no fault of its own. The assertion is there, but I ran no fault that changes only the comparison at those points."
Story clause: "Maximize and Restore keep them where the panel sits beside the page."
Disposition: no user cost "Dashboard maintainers get faster feedback on reviewing a story by touch.": the assertion is part of `expectKept`, which the story's example requires at those points; it sends no stroke and reads no review, and faults FM and FE fail `expectKept` there

### G15. SEED-287's branch imports a helper this story made private
Reported: slice 4 — "its branch's `storyReviewTouchContext.ts` imports `chooseCommitsByTouch` (line 19, called at line 99), which is now module-private. That file already conflicts with this story's rewrite; a stale import fails typecheck loudly."
Story clause: "Its integration then keeps this story's comparison and journeys."
Disposition: no user cost "Ordinary CI continues to catch the same product regressions.": SEED-287's branch does not change `storyReviewTouchContext.ts` or `reviewTouchReading.ts` (`git diff --stat 58442ace8 origin/codex/make-dashboard-journeys-fit-the-default-timeout`), so its integration takes this story's files, which do not import the helper; a stale import would stop at the typecheck hook rather than pass
