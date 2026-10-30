# Reduce redundancy in the dashboard touch test family

**Source:** [Selected implementation story](../../seeds/SEED-180-optimize-dashboard-touch-viewport-tests.md#optimize-dashboard-touch-viewport-tests)
**Source review:** [source-review.md](./source-review.md)
**Identity:** SEED-180#optimize-dashboard-touch-viewport-tests

## Request and evidence

Completed resolve-only triage of the candidates in
[dashboard test timings](../../../docs/maintainer/dashboard-test-timings.md#resolved-2026-10-30-resolve)
created this plan without profiling or implementing optimizations
(`d6bf4531`, `03424649`; SEED-178's source is recoverable at
`0136acf88f0f639d368ad94d54d04279a067de34`). Refinement on 2026-10-30 found
the family's suite-wall cost below measurement noise (24 matrix cases summed
to 237 s of 7,460 s test seconds in hosted run 40796911428 at `930974d6`; two
green local baselines under like load differed by 150 s) and its redundancy
real. Terry then set the story's target to reducing redundancy and the number
of tests, with the focused family as the measured evidence and one ordinary
suite run as a green check. SEED-176/SEED-177 timings are historical context.

## Goal and scope

Fewer touch test cases and one owner per touch rule, with every unique touch
protection kept, as the story's Scope defines. Evidence: case counts before
and after; the focused family's wall time over three consecutive passes before
and after under recorded load; the ordinary `npm run test:dashboard` green once
after the change. Retain the result under
[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md) when
every removal names surviving proof, the family passes, and the focused wall is
not worse; otherwise restore the affected cases and record why.

**Exclusions:** Product behavior changes; redundancy outside the fourteen
touch specs; suite-wall speedup claims; retries, sleeps, skips, or focus
markers; thinning the necessary-cost `agent-launch*` poles,
`agent-completion-attention`, or production-watcher chains. No implementation
until a later developer instruction authorizes execution.

## Preserved promises

- A layout rule is proved once per genuine CSS branch, following
  [dashboard test guidance](../../../dashboard/tests/README.md#where-a-check-goes);
  a device stays only where it reaches an asserted branch or arrangement the
  other device does not.
- Unique touch protections stay: native touch input and terminal fitting at
  reduced height, touch scrollback and the identity-header scroll
  (`agent-terminal-touch`), rotation keeping a draft, selection, or reading
  position without a re-read (`story-review-touch`, launch dialogs), the
  Done-row coarse disclosure (`recently-done-sessions-sidebar-touch`), the
  430×932 band and the held progress answer
  (`agent-launch-start-session-answer-touch`), the side-by-side review body at
  tablet portrait (`story-review-touch` tablet), and a live terminal surviving
  a settings round trip with viewport changes.
- Every removal names its surviving proof before the case or step goes.
- No focus/only markers; no retries, sleeps, or skips to mask flakes.

## Family and surviving proof

Fourteen specs under `dashboard/tests/` use `touchLaunchPage.ts`: 36 cases, of
which 24 loop both devices (12 specs), 7 are phone-only in
`agent-launch-start-session-answer-touch`, 1 is phone-only in
`recently-done-sessions-sidebar-touch`, and 4 are non-touch cases in the three
settings specs. The phone pair (390×844, 844×390) crosses every width branch
(400, 480, 640, 800 px) and the ≤480 px height branch; tablet adds the
768–800 px band, the wide-and-tall landscape, and the side-by-side review body
(`story-review.css` body container ≥ 556 px) at 768 portrait.

| Removal | Surviving proof |
| --- | --- |
| Tablet cases of `agent-launch-dialog-touch`, `agent-launch-start-session-touch`, `session-management-touch`, `sessions-sidebar-touch`, `story-review-mark-touch`, `system-settings-project-management-touch`, `system-settings-terminal-touch`, `system-settings-look`, `system-settings-openai-recovery`, `system-settings-terminal-theme` (10) | Confirmed 2026-10-30: each spec's phone case runs the same body as tablet via `launchTouchViewports`; reduced-height steps still force the ≤480 px branch on phone; `system-settings-look` 420 px case still owns the narrow settings fit |
| Tablet case of `agent-terminal-touch` (1) | Confirmed: phone case holds every shared assertion plus the phone-only identity-header scroll; 390 stacked and 844 landscape cover the panel arrangements tablet would repeat |
| `844×390` launched and refused cases of `agent-launch-start-session-answer-touch` (2) | Confirmed: each `390×844` launched/refused case still rotates into 844×390 and asserts the row there before returning |
| `story-review-mark-touch` file (1 remaining case) | Confirmed: rule still owned by `story-review-uncommitted-check.spec.ts`; the 44 px label tap and state through rotation still fold into `story-review-touch` (slice 4) |
| `system-settings-terminal-touch` file (1 remaining case) | Confirmed: attachment survival still owned by `system-settings.spec.ts` (terminal through settings), gaining one viewport-change step while settings hide the terminal (slice 4); touch read, rotation, and Back still owned by `system-settings-look` |
| Step trims: `system-settings-openai-recovery` touch remove-failure and clear-on-leave blocks; `system-settings-project-management-touch` Remove failure and Cancel; `session-management-touch` sidebar Session details step and the assertion-free rotation; repeated Maximize/Restore pairs in `agent-terminal-touch` | Confirmed with citation fix: openai remove-failure and clear-on-leave still owned by the non-touch case in the same file plus `system-settings-openai.spec.ts` (unsaved draft cleared on leave); project Remove/Add write-failure owned by `system-settings-project-management.spec.ts` (not only `project-remove.spec.ts`); Cancel dismissal owned by `project-remove.spec.ts`; Session details / choice-through-rotation owned by `sessions-sidebar-touch`; first Maximize/Restore per arrangement remains in `agent-terminal-touch` |

No row struck: every planned removal still has a holding survivor at
`bf6a6c6581bc9d9fc9c677376b8b9ddd166b65a3`. Expected after: 21 cases in 12
files (15 removed). Kept as unique: the `story-review-touch` tablet case (body
container ≥ 556 px / 34.75 rem side-by-side), the `430×932` and held cases of
the answer spec, `recently-done-sessions-sidebar-touch`, and the refinement
choices kept under resize in `agent-launch-dialog-touch`.

## Ordered slices

Slice 1 belongs to the completed predecessor; slice 2's baseline is recorded
below; slices 3–6 remain unstarted.

### 1. Predecessor triage disposition evidence (SEED-178)
Type: Structure
Status: done
Proof: `d6bf4531` and `03424649`, plus the maintained timing record, establish
the accepted dispositions with no pending coverage decision. No profile or
baseline command ran during resolve.

Enables: later authorized execution of slices 2–6.

### 2. Baseline and surviving-proof record
Type: Structure
Status: done
Proof: The literal focused command over the fourteen specs (`npx playwright
test --config dashboard/playwright.config.ts <the fourteen files>` from the
owned checkout, default workers) lists 36 cases and passes three consecutive
times; record each pass's wall time, the load average before and after, the
revision, and the proof-record path outside Git. Reconcile the table above
with the current specs; any removal whose survivor no longer holds is struck
before slice 3.

Internal change: a recorded before-state and a confirmed removal table.
Enables: slice 3's removals and slice 6's comparison. Summed test seconds and
case counts are not wall time.

Baseline recorded 2026-10-30 at revision
`bf6a6c6581bc9d9fc9c677376b8b9ddd166b65a3` (outside Git under
`/tmp/seed-180-slice2-baseline/`): `--list --reporter=line` → 36 tests in 14
files; three consecutive focused passes with
`env -u NO_COLOR -u FORCE_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=…` → walls
37.551 s / 35.696 s / 36.279 s (proofs `pass2.json`–`pass4.json`). Removal
table reconciled above; none struck.

### 3. Plain device and orientation repeats are removed
Type: Structure
Status: done
Proof: The thirteen device and orientation removals from the table (ten tablet
cases, the terminal tablet case, the two 844×390 answer cases) are applied by
selecting the phone device in each spec rather than looping the matrix
(`agent-launch-start-session-answer-touch` and
`recently-done-sessions-sidebar-touch` show the form); the shared helper keeps
both devices for `story-review-touch`. The focused command lists 23 cases and
passes.

Internal change: one device per journey where the other adds no asserted
branch. Unchanged external behavior; enables slice 4.

Accepted 2026-10-30: thirteen removals applied; `--list --reporter=line` → 23
tests in 14 files; focused family green
(`/tmp/seed-180-slice3-proof/pass1.json`, strict passed). Only
`story-review-touch` still loops tablet.

### 4. Two files fold into their owners
Type: Structure
Status: done
Proof: `story-review-mark-touch.spec.ts` is removed after `story-review-touch`
gains one tap on the "Include uncommitted changes" label (44 px target, state
kept through rotation). `system-settings-terminal-touch.spec.ts` is removed
after `system-settings.spec.ts`'s terminal-through-settings case gains a
viewport change while settings hide the terminal and asserts the re-fitted
terminal and its input afterwards. Both owners pass; the focused command lists
21 cases in 12 files. The moved steps each fail against a scratch edit that
breaks what they assert (label tap target, viewport change) and pass with it
restored.

Internal change: two single-rule files become steps in their owners.
Enables slice 5.

Accepted 2026-10-30: both files removed; owners pass; focused family
21 tests in 12 files (`/tmp/seed-180-slice4-proof/family.json`); label and
viewport moved steps fail under scratch edits and pass restored.

### 5. Repeated steps leave the touch journeys
Type: Structure
Status: done
Proof: The step trims in the table are applied; each trimmed step's owner is
cited in the commit. The touched specs and their named owners pass. Case count
stays 21.

Internal change: touch journeys keep only their touch delta. Enables slice 6.

Accepted 2026-10-30: four step trims applied with named owners; family still
21/12; touched specs + owners green
(`/tmp/seed-180-slice5-proof/touched-owners.json`).

### 6. Focused family and ordinary suite confirm the outcome
Type: Behavior
Status: done
Proof: Slice 2's focused command passes three consecutive times after the
change under recorded load; `env -u NO_COLOR npm run test:dashboard` (or its
ordinary proof-record form) passes once with its case count recorded.
`docs/maintainer/dashboard-test-timings.md` indexes before/after case counts
and walls; `docs/maintainer/dashboard-touch-family-timings.md` holds loads,
the surviving-proof table, and comparison limits; `dashboard/tests/README.md`
states the one-device rule for touch journeys if its wording does not already
cover it. Retain when every removal has surviving
proof, the family and suite pass, and the focused wall is not worse; otherwise
restore the affected cases and record the rejected or inconclusive result.

Behavior: Pre-condition — slices 3–5 applied. Trigger — comparable focused
remeasurement and one ordinary suite run. Postcondition — the retained family
has fewer cases with named surviving proof and recorded evidence, or the
experiment is undone with its outcome recorded.

Accepted 2026-10-30: RETAIN. After walls 32.647 / 33.074 / 31.827 s (21/12)
vs before 37.551 / 35.696 / 36.279 s (36/14); suite green 1742
(`/tmp/seed-180-slice6-proof/`); evidence indexed in
`docs/maintainer/dashboard-test-timings.md` with full record in
`docs/maintainer/dashboard-touch-family-timings.md`, and one-device rule in
`dashboard/tests/README.md`.

## Current decisions

1. **Target (Terry, 2026-10-30):** fewer touch test cases and less repeated
   proof, with coverage preserved. Focused-family wall over three passes is
   the measured evidence; the ordinary suite runs once as a green check, not
   as speedup evidence. Suite-wall claims are out of scope.
2. **Device rule:** one device per journey unless the other reaches an
   asserted branch or arrangement; `story-review-touch` keeps tablet portrait
   for the side-by-side review body; the answer spec keeps `430×932` and the
   held case.
3. **Necessary-cost launch poles and long journeys (accepted earlier):**
   unchanged and outside this story.
4. **Ownership and priority:** SEED-178 triage is complete; SEED-180 and this
   plan are first in Backlog list at Terry's request.
5. **Authority:** no Take or implementation during preparation; later explicit
   execution authorization is required.
6. **Slice 2 baseline (2026-10-30, execution):** focused family before-state
   locked at `bf6a6c6581bc9d9fc9c677376b8b9ddd166b65a3` — 36 cases / 14 files;
   three consecutive green walls 37.551 / 35.696 / 36.279 s under loads ~9–13
   with proofs outside Git at `/tmp/seed-180-slice2-baseline/pass{2,3,4}.json`.
   Local agent shells that set both `NO_COLOR` and `FORCE_COLOR` must run the
   focused command under `env -u NO_COLOR -u FORCE_COLOR` so the quiet reporter
   does not fail on Node's conflict warning (all cases still passed). Quiet
   reporter also swallows bare `--list`; use `--reporter=line` (or equivalent)
   only to observe the listing. Removal table confirmed; none struck. Step-trim
   survivor for project write-failure corrected to
   `system-settings-project-management.spec.ts`.

## Decisive premises

- **Proof route:** the focused family runs in this checkout. Observed
  2026-10-30 in the owned worktree after `setup-native.mjs npm` and `browser`:
  `npx playwright test --config dashboard/playwright.config.ts
  dashboard/tests/system-settings-look.spec.ts
  dashboard/tests/story-review-mark-touch.spec.ts --reporter=list` → 6 passed
  in 10.2 s at load 10.5; `--list` over the fourteen files → 36 tests in 14
  files. Slice 2 reconfirmed listing and three consecutive focused passes at
  the published revision (see Current decisions §6).
- **Classification:** each removal's survivor asserts the removed case's
  steps. Settled by reading every assertion of the fourteen specs and their
  cited owners on 2026-10-30; slice 2 reconciled the table against the specs
  at execution time before any removal — none struck; project write-failure
  survivor citation corrected as in Current decisions §6.

## Concern evidence

Slice-plan refinement did not run: the slices each own one proof loop and one
bounded change, and no cumulative design concern was found. Remaining
concern: none. Interim behavior: none.

## Execution complete

Product advice: no change. The retained touch-family reduction (36→21 cases,
shorter focused walls, suite green once, surviving proof recorded) meets the
story goal; this review recommends no new product backlog item. Process notes
recorded as ODF-329 occurrence (unused import at delivery format) and DD-369
(new Markdown trailing blank EOF). Conclusions remain conditional on unresolved
execution-branch CI at `2f800b3f`.
