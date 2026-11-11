# Speed up touch review checks

**Identity:** SEED-312#speed-up-touch-review-checks
**Source:** [Story](../../seeds/SEED-312-touch-review-checks.md#speed-up-touch-review-checks)

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
Status: planned
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

### 2. Touch reading covers only the distance its assertions need
Type: Behavior
Status: planned
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

### 3. The tablet repeats only what its side-by-side arrangement changes
Type: Behavior
Status: planned
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

### 4. Context journeys prepare only what they assert
Type: Behavior
Status: planned
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
