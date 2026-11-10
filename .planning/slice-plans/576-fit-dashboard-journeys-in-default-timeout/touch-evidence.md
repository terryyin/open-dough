# Touch attempt and required-input refinement

Slice 6 remains planned. The width-only attempt did not prove the default budget.
Proof completed at00:27–00:36 Singapore, 2026-11-11; exact implementation-start
clock is not retained. No numeric slice hard limit applies. It returned
incomplete after one controlled-pressure observation, without unchanged retry.

## Observations

At published8e93b1d24426, whole four-case baseline passed with the reading60s
allowance: phone30.192s, tablet20.492s; rotation18.490/11.937s; runner44.617s.
Candidate retained all reading assertions with a125-character still-overflowing
line: phone24.187s/tablet14.790s, rotation17.611/13.254s, runner40.354s. Loads
differed (~10 vs~14); these are observations, not a causal elapsed saving claim.
Literal command for both: `caffeinate -s -i npm run test:dashboard -- tests/review/story-review-touch.spec.ts --workers=2 --trace=on --reporter=json`.
JSON: /tmp/seed287-touch-before.json and /tmp/seed287-touch-after.json.

One bounded pressure command:
`caffeinate -s -i node /tmp/seed287-touch-pressure.mjs /tmp/seed287-touch-pressure-candidate 1`.
Twelve finite CPU workers stopped at terminal; observed load21.042–26.039.
Phone reading37.715s passes only60s; phone rotation31.504s times out at default.
Tablet20.133/20.198s passed. Shell65.560s/runner63.036s include all preparation.
Phone rotation before-hooks15.173s; measured first-demand origin6.347s,
app5.100s, bundle0.593s. Global prefix2.046s is outside case time but included
in elapsed. Only17 native commands/1.388s ran before rotation timed out at its
third gesture; detach error followed deadline cleanup. No gesture hang established.
Raw summary, logs, artifact/host samples and times:
/tmp/seed287-touch-pressure-candidate. Failed trace copied to
/tmp/seed287-touch-replan-20261111/pressure-failure-trace before any new run.

## Safe disposition and remaining proof

Only the attempt's three paths were parked and restored to HEAD before plan
refinement. Exact snapshots, SHA256 manifest and tracked patch are retained at
/tmp/seed287-touch-replan-20261111. They are compatible unfinished work,
not acceptance: storyReviewTouchJourney.ts, storyReviewWorktree.ts and new
largeReviewFiles.ts. Default fixture data63files matched byte-for-byte, but
desktop browser proof remains due. Consumer dispositions are in
/tmp/seed287-touch-consumers.md (133rows). The reading allowance remains.
G10 owns this failure in slice6. J01/J20 remain unobserved until required proof.

## PFE and changed decisive premise

Responsibility: exact required immutable input readiness before bounded touch
journeys, without excluding preparation from suite elapsed. Whole-product search
found runArtifacts.ts/globalSetup.ts already own on-demand immutable inputs and
cleanup, with startOriginPreparation.ts, dashboardBuild.ts and serverBundle.ts
exporting their keys. pageTest.ts's queuedCodexOriginReady and five Intent
beforeAll consumers establish the existing before-case readiness pattern.
Touch uses preparationPage.ts's default Claude queued origin, so the Codex input
is not its solution. Direct requestRunArtifact calls in touch beforeAll can reuse
its exact Claude queued/app/bundle keys concurrently, under default hook budget.
No new worker fixture, registry, lifetime, private-case sharing or product choice.
Private clones, actual server startup, gestures and independent assertions stay.
A broader gesture4-to2 rewrite is unsupported by rotation's1.388s gesture cost.

New pressure data disproves the sufficiency of the quiet3–4s premise:15.173s
setup now dominates the failing first case. Reuse required-input readiness once;
measure total elapsed including moved work. Three pressure passes plus affected
desktop consumers remain required; return if this bounded strategy misses.

## BeforeAll premise rejected before default-proof acceptance

From00:49–00:56 Singapore, one exact-key beforeAll candidate passed4/4 at
load20.513–26.347: phone reading24.272s/tablet20.808s, rotations23.850/23.904s.
Shell71.234s/runner68.218s include moved work; no speedup accepted against the
prior65.560s under different conditions. Artifact trace showed origin6.610s,
app4.419s and bundle0.669s were already complete before the three requests.
Local Playwright lib/index.js _setupArtifacts auto all-hooks-included depends
on combined context options/baseURL. Our baseURL depends on dashboard/origin.
Thus beforeAll created a separate private hook dashboard before issuing warm,
redundant requests. This is not the selected concurrent immutable-input cut.
The candidate is rejected; preserve its budget observation only as diagnosis.
Evidence: /tmp/seed287-touch-required-inputs-fit and its artifacts-1.jsonl.

The attempted three-default-pass controller ended during finite10000-batch
priming without reaching20–30: no Playwright child, runs[], inFlight:false,
ownedWorkersStopped:true, exit1. /tmp/seed287-touch-required-inputs-default.
No default pass is claimed. Four owned paths were parked to
/tmp/seed287-touch-worker-refinement with exact hashes/patch before rewriting
the plan; beforeAll and premature60s removal will not be restored.

Reassessment keeps the same bounded outcome; no numeric repeated-overrun
threshold is supplied. The remaining gap has a concrete existing mechanism:
workerProcessEntry.js139 uses the project default workerFixtureTimeout slot
(and1488 sets it from project.timeout). Lines288–309 collect auto fixtures
before callback parameters. Therefore a callback-only readiness request is
too late. Declare the readiness worker fixture in pageTest.ts's shared pool,
and make the touch spec's existing private-origin fixture depend on it before
base origin setup. Request exact Claude queued/app/bundle inputs concurrently
there; remove beforeAll. No worker option/pool split, extra private hook server,
new artifact lifetime or deadline override. Default private cases remain.
This refines the same slice6 proof loop; three actual default pressure passes
and desktop proof remain due. Return before another variant if it fails.

## Accepted worker-input implementation and local proof

The final candidate keeps the reading-specific125-character overflowing line
and canonical largeReviewFiles revision from the compatible work. The original
400-character default line and63large-file facts stay unchanged. pageTest.ts
registers lazy queuedClaudePreviewReady in the single shared worker pool; the
touch spec's originRepository dependency requests it before private origin
setup. It concurrently requests exact existing Claude queued/app/bundle keys.
No beforeAll, private hook dashboard, new artifact lifetime, gesture rewrite
or deadline override remains. Case repositories/servers remain private.

One fit command: `caffeinate -s -i node /tmp/seed287-touch-pressure-adaptive.mjs /tmp/seed287-touch-worker-inputs-fit 1`.
Strict4/4 at load20.116–22.003; shell51.625s/runner49.392s includes coldworker
setup. Only then was the60s reading allowance removed.
Three actual default-budget runs: `caffeinate -s -i node /tmp/seed287-touch-pressure-adaptive.mjs /tmp/seed287-touch-worker-inputs-default 3`.
Each child: `npm run test:dashboard -- tests/review/story-review-touch.spec.ts --workers=2`.
All12executions passed, retry0; runload20.629–25.571. Phone reading
20.700/23.085/22.827s; other cases16.508–20.177s. Shell
51.248/52.517/54.635s; runner49.022/50.328/52.161s. All moved work included.
No precise cross-condition speedup claim: earlier width-only pressure differed.
Raw proof, logs, timings, host samples and artifacts at both directories above.
The adaptive finite controller used at most16CPUworkers, reducing to10 at
observedload26; every run terminal0, inFlightfalse, ownedWorkersStoppedtrue.
The earlier12-worker priming failure remains recorded; it launched no tests.

Artifact traces establish actual cold concurrency before private case setup:
origin6.292/5.925/5.024s, app5.405/4.916/4.345s, bundle1.105/1.111/.796s.
Starts within121–346ms; first private requests follow readiness. Six requests
per key each run =2worker requests+4privatecase requests; noextra hookserver.
Worker fixture uses the project default30s slot; no timeout option supplied.

J01 observing locations: chooseComparisonAndReadByTouch retains44px targets,
actual comparison/commit/file/folder/context choices, exact rendered text,
initially hidden end, real horizontal/vertical reading and return, positive
scrollLeft, independent browser/code scroll, fixed geometry and page fit.
keepReviewContextThroughTouch retains reading places through rotation, panel
controls and file operations. Setup supplies private Git/data, not touch result.

Desktop selection (complete artifact-capture command in the targeted return): `caffeinate -s -i npm run test:dashboard -- tests/review/story-review-panes.spec.ts tests/review/story-review-file-moves.spec.ts tests/review/story-review.spec.ts --workers=2`.
Strict5/5 retry0; runner13.268s, proof /tmp/seed287-touch-worker-desktop-proof.json.
It observes large/narrow independent pane scrolling, Hide files, previous/next
file order/reach and the actual changed-file/worktree/branch/baseline summary.
The507-row consumer record /tmp/seed287-touch-worker-inputs-consumers.md
retains every disposition; unrequested worker fixture does not run elsewhere,
and registration stays uniform in the existing pool. Full targeted return:
/tmp/seed287-touch-worker-inputs-return.md. No spec added/removed for this slice.
Hosted and whole-suite obligations remain in12; these local observations do
not close them. Refactor disposition is recorded at delivery below.

## Independent refactor accepted

The fresh reviewer retained one canonical revision name: largeWorktree now
commits revision.name, still exactly"large changes". No data, gesture, worker
readiness, assertion or budget change. Its complete affected four-spec selection
passed strict9/9 retry0, runner31.090s, terminal0; pressure proof stays applicable.
Literal command, observing independent commit selector and507-row dispositions:
/tmp/seed287-touch-refactor-return.md and /tmp/seed287-touch-refactor-consumers.md.
REFACTOR COMPLETE received. No generator trigger; formatter and check-only hooks
remain the coordinator's guarded delivery operations.
