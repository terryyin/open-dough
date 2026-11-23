# Start execution Cancel viewport diagnosis

## Round 1

GitHub Actions CI run 45100433154 attempt 1 failed frontend shard 2/2,
job 137449890922, at `a625e1da22090e5d348daae0619100b07cb051fd`.
The four dialog cases all used the runner's default viewport after
`1830ffb17` removed the prior shared mount's explicit custom size. The
execution case failed while clicking Cancel on its second opening after
filling the instruction. Playwright found the enabled and stable button
and repeatedly scrolled it into view, then reported it outside the
viewport. The attached screenshot includes Cancel inside the 390 × 844
image. The other three dialog cases and the voice cases passed.

The screenshot and job log are retained in
`open-dough/evidence/ci-45100433154` in the execution Git path.
The source evidence includes the frontend report artifact 14785427393.
The finished workflow attempt had one failed job, this shard.

Hypothesis: a coordinate or clipping mismatch between the mounted
frame and outer Chromium viewport makes pointer activation fail, or
the production dialog footer actually clips after focused editing.
Inspect both viewport bounds and the hit position before changing the
test. Run one focused instrumented proof on the current revision under
the AC guard. Prefer a simple repair preserving native Cancel and
the ordinary viewport. Reproduction and proof use the named spec and
any specific affected consumers. A shared runner edit requires whole
frontend proof and preserving desktop/touch assignments.

The Linux shard completed the native-effort and ad-hoc refinement files just
before the failing execution case. Their zoom proof clears Chromium's device
metrics override, while the Vitest orchestrator caches the last viewport sent
to Playwright. An outer viewport divergence after that cleanup is another way
the iframe screenshot could show a control that Playwright cannot click. The
first experiment stops after one macOS CI-mode, two-worker run of the three
files. It captures inner and outer viewport bounds, both hit tests, and the
Cancel rectangle immediately before the click and again if the click fails.
The first experiment will distinguish a visible footer in a clipped browser
frame from a clipped footer inside a correctly sized frame if it reproduces.

The macOS run passed all 10 cases. Both before-click samples had inner and
outer dimensions 390 × 844, an unclipped iframe at (0,0), an iframe hit
from the outer page and a Cancel hit from the inner page. Cancel was at
y=775–819 in both dialogs. In that run the execution case fired before
either zoom proof, so the observed order left the cleanup hypothesis open.
Evidence is `macos-geometry.{log,exit.json,proof.json}`.

One Linux Ubuntu 24.04 arm64 run uses the cached matching Node 24.21.0 and
Playwright 1.65.0 image, two workers and the same three-file selection. If
the case fails, collect the browser protocol's layout metrics and the Cancel
content quads used by Playwright. Stop after one run before choosing a next
experiment. This changes browser platform without assuming equivalence to
the hosted x64 runner or the rest of the shard.

The Linux focused run passed all 10 cases. The execution case had matching
390 × 844 dimensions, passed both hit tests and again ran before the zoom
proofs. The Linux text metrics put Cancel at x≈188 and y=775–819, matching
the retained hosted screenshot. Evidence is
`linux-geometry.{log,exit.json,proof.json}`. Vitest runs test-finished
hooks in stack order, so the zoom proof normally clears the CDP override
before mount restores the viewport.

One same-page carryover probe places the production catalog dialog's
600px mount and real DPR2 zoom immediately before the execution test in
the same file. It uses the same test-finished hooks as native effort and
logs the inner and outer geometry on its successor. Run only this file
once on Ubuntu arm64 and remove the temporary predecessor and geometry
instrumentation. This fixed ordering tests whether the actual cleanup
leaves a reused page clipped, independently of scheduling.

The Linux same-page zoom predecessor and its four successors passed.
The execution sample showed both 390 × 844 viewports, scale 1, the same
Cancel geometry and both hits. Evidence is
`linux-order.{log,exit.json,proof.json}`. This weakens the specific
native-effort cleanup explanation. One bounded run now selects all mounted
Vitest files of the failed shard with the temporary geometry capture and
with the diagnostic predecessor removed. It tests whether the hosted
cross-file workload and additional viewport consumers are necessary for a
matching failure. The retained Playwright files run in separate browsers
and are outside this diagnostic experiment. The host load was about 16
on 16 logical CPUs, so limit the Linux container to two CPUs, run at most
two workers and hold other execution proof during this run.

The mounted shard passed all 203 cases across 54 files, including the two
native Cancel journeys and both browser instances. Vitest measured 29.75s.
Execution had a valid inner and outer hit with matching 390 × 844 bounds
and passed in 213ms. The runner scheduled it before both zoom files, as in
the earlier three-file checks. Evidence is
`linux-mounted-shard2.{log,exit.json,proof.json}`. Each of the four guarded
commands returned exit 0 and its adjacent `.log.run.json` records the exact
arguments and working directory. No local run reproduced the hosted click
failure in four execution samples. The native-effort predecessor passed
once under a fixed same-page order. The checkout's only remaining change
from this investigation is this record. `geometry-probe.patch` in the Git
evidence directory retains the removed probe, and the diagnostic
predecessor was removed.

Playwright reports this exact actionability failure when Chromium's
content quads collapse after intersection with the main frame's dimensions.
The default Vitest failure screenshot captures the mounted body element,
so its visible Cancel supports a good iframe layout and does not measure
the main frame's actionability bounds. The current leading possibilities
are a main-frame bounds mismatch or stale Chromium quadrilateral data on
the hosted run. The old passing branch run precedes the removal of the
explicit 1440 × 900 mount size. That change reaches the test harness and
is a candidate attribution. It does not establish causality because the
failing revision passed these local probes at the maintained default size.

The failing journey begins in `story-card-launch-dialogs.spec.ts` via
`mountStoryLaunches` → `StoryCardLaunches` → `StartLaunch` → `LaunchDialog`
and its `LaunchDialogFooter`. The journey observes opening details,
focused instruction editing, Escape, focus return, empty reopen, editing
again, pointer Cancel, focus return and zero start calls. The same helper
exercises refinement. The other execution pointer case closes a dialog
with an establishing skill. The ad-hoc layout and native-effort tests
exercise the same dialog footer and viewport handling, and the mounted
shard additionally exercised the unchanged desktop and touch paths. No
product or shared runner effect was changed by the investigation. There
is no candidate repair to accept yet.

The next discriminating experiment is one hosted Ubuntu x64 run with the
geometry probe on the failing shard. Record viewport bounds and hits near
the action and capture `Page.getLayoutMetrics` and `DOM.getContentQuads`
before the action or during its retries to avoid the action timeout
preventing post-failure capture. Trigger one attempt only. An existing
check run without this instrumentation cannot distinguish the remaining
hypotheses. The coordinator owns dispatch and decides the diagnostic
publication route. Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

Before handing that probe back, run its CDP capture once on the named
execution case in the same Ubuntu arm64 container. This checks that the
page session can query the child-frame Cancel element and return both
protocol measurements in the test log. It validates the instrument;
it does not repeat the shard reproduction. Stop after one capture run.

The single diagnostic capture passed with exit 0. The page session returned
390 × 844 CSS and visual viewports at scale 1 and Cancel's CDP quad
`[188.359375,775,269.796875,775,269.796875,819,188.359375,819]`. Evidence is
`linux-protocol.{log,exit.json,proof.json}`. The `hosted-protocol-probe.patch`
in the Git evidence directory retains that probe. It records just before
clicking, and takes one more sample when the click is still pending after
750ms. It leaves the native pointer click and its timeout in place. This
smoke check observed the pre-click capture. The pending-click callback
remains unobserved because the click succeeded.

The coordinator can run that probe without moving the story branch. Create
a detached scratch worktree at `a625e1da22090e5d348daae0619100b07cb051fd`,
apply only `hosted-protocol-probe.patch`, commit in the scratch checkout
and push its HEAD to a unique `refs/heads/diagnostics/seed-413-cancel-viewport-45100433154`.
The push-triggered CI workflow has no branch filter, so the scratch push
starts the single proposed diagnostic run. Use the scratch SHA and ref to
locate that run and read frontend shard 2's logs. The diagnostic commit
is separate from the story branch and carries no landing context.

Round 1 paused at 10.4 cumulative active minutes without a reproduced
failure or an accepted repair. The probe records and this diagnosis are
retained for a fresh round. The current checkout has no tracked edits from
this investigation.

Slice 5 paused at 5.3 active minutes, with its two source paths
preserved by stash `586c223c60650ba21d6d16efa300c9dbf41d8290`.
The stash receipt is
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-Qpbi9w/record.json`.
The captured typecheck passed and the four E2E cases remain.

## Round 2

Round 1 settled at 10.4 active minutes. Four local attempts had zero
failures matching the hosted signature. The separate smoke test for
the protocol probe passed and measured a 390 × 844 layout viewport
with usable Cancel quads at y=775–819. Pending clicks also sample at
750 ms so a timeout cannot suppress the second observation. The patch
and proof are in `ci-45100433154/hosted-protocol-probe.patch` and
`ci-45100433154/linux-protocol.*`.

Run one instrumented push on an isolated ref at the failed revision.
Only the two original frontend shards run there. Their selection, job
implementation, runner image label and worker calculation are
unchanged. The instrument distinguishes a clipped outer viewport,
off-screen content quads and a clipped footer. A passing shard will
establish geometry for that hosted attempt and leave the original
failure open. Stop after this one hosted attempt and keep its raw logs.

Diagnostic ref: `refs/heads/codex/diagnose-seed-413-cancel-e0b72832`.
Detached commit `c735988247dbccc65b17bb2412e2b2909ff631e5` has
only the probe and frontend-only CI routing. The commit hook passed
lint, format and typecheck. The local smoke uses equivalent protocol
calls and the hosted probe logs frame and control bounds as tuples.

The failed shard completed the actual `system-settings-usage-average`
200% zoom case before the Cancel failure. Its `beforeEach` calls
`doubleUsageDeviceScale` before `mountUsage` registers cleanup. Vitest runs
test-finished hooks in reverse registration order. The hypothesis is that
mount first requests the original dimensions, then CDP clear discards the
outer page's actual viewport while Vitest still records the restored size.
The launch iframe can then keep 390 × 844 even though Chromium reports a
shorter main viewport to Playwright. Native effort used the opposite hook
order in the earlier passing probe.

Stop after one focused two-worker Ubuntu arm64 run under the macOS AC
guard, while the coordinator observes the independent hosted run
45102837964. In one browser file run the genuine 640 × 450 usage mount
and DPR 2 override with the cleanup orders reversed and original, each
followed immediately by the same unchanged execution Cancel journey.
Trace iframe and main viewport dimensions before, between and after
both cleanups. Use the retained protocol probe to capture the Cancel quad,
main viewport metrics and hit tests at click time and during a pending
click. The matching result is the original-order successor failing on
native Cancel with the hosted outside-viewport actionability error when
the reversed-order successor can click it. Keep the exact command and
trace with the existing Git evidence and remove the temporary code.

Hosted Ubuntu x64 run [45102837964](https://github.com/terryyin/open-dough/actions/runs/45102837964),
attempt 1, passed frontend jobs 137457373100 and 137457373378. Shard 2
passed all 203 mounted cases. The execution and refinement Cancels had
390 × 844 outer and iframe bounds, usable protocol quads at y=775–819,
and hits in both documents. The execution case completed at 02:57:55 UTC,
before the usage zoom case at 02:58:00 and native effort at 02:58:05.
On the original failed shard the usage zoom finished at 02:36:06, and
the 15.055s execution failure reported at 02:36:22. That places the
execution case's start around 02:36:07.6, before native effort finished
at 02:36:11. These logs interleave browser sessions, so wall-clock
order alone does not establish the same outer page. Evidence is
`hosted-x64-shard2.log`, `hosted-x64-result.json` and
`hosted-x64.watch.log.run.json`.

The one same-page Ubuntu arm64 command returned exit 0. All four selected
cases passed, including both usage predecessors and both identical native
Cancel journeys. Three other dialog cases were filtered out. The host was
on AC with a natural one-minute load of 5.84 before and 5.69 after. The
cached image was limited to two CPUs, with `--workers=2` and one selected
browser file. The coordinator's hosted run was independent. Evidence is
`linux-usage-cleanup.{log,exit.json,proof.json}`, its
`.log.run.json` with the exact command, the two load samples and
`usage-cleanup-order.patch`.

The installed Vitest Playwright path sends changed viewport requests
through Playwright's `setViewportSize`, which sets Chromium device
metrics including the configured scale (DPR 1 here). Vitest keeps the
last requested size in the outer orchestrator and skips an equal request.
The diagnostic hook trace was:

| Order | Active chart | First hook | Last hook | Native Cancel |
| --- | --- | --- | --- | --- |
| Original, zoom then mount | 640 × 450 in both, DPR 1 | Mount restores both to 390 × 844 | CDP clear leaves both at 390 × 844 | Passed in 178 ms |
| Reversed, mount then zoom | 640 × 450 in both, DPR 2 | CDP clear exposes 1280 × 720 outside and leaves the 640 × 450 iframe | Mount restores both to 390 × 844 | Passed in 190 ms |

Both branches used the production Usage mount, the existing CDP helper,
the original chart data and the real chart touch journey. The helper's
DPR 2 assertion passed in both orders. With the original order its
assertion runs before mount reconfigures the viewport and loses DPR 2.
This exposes a separate Usage proof defect on Ubuntu arm64. Move the
existing zoom helper after the 640 × 450 mount and observe DPR 2 with
the chart mounted to correct that proof. The reversed control demonstrates
real zoom, the same layout and actions, and complete cleanup. It does not
establish a fix for the hosted Cancel defect.

Before both native Cancel clicks the textarea was focused, the iframe
and main page were 390 × 844 at DPR 1, both hit tests succeeded, and
Chromium returned Cancel x=188.359375–269.796875, y=775–819. The local
hook-order hypothesis did not reproduce the hosted failure. The CDP
clear fallback to 1280 × 720 is real. If the iframe were 390 × 844
when that fallback persisted, Playwright would clip the observed quad
to zero height and emit the hosted actionability error. Invoking the
zoom helper at the default size without its existing mount and resize
sequence would test this mechanism with a synthetic predecessor. It
would not attribute the failure to an unchanged case.

The other inspected touch launch zoom journeys mount at a custom size
before registering zoom cleanup, so their mount can restore after CDP
clear. The desktop `story-card-launch-offers` zoom case has no viewport
restore registered by `mountStoryLaunches`. It resizes from 420 × 900
to 640 × 450 and clears CDP at test completion. It ends with Vitest
holding 640 × 450, so a subsequent isolated file on the same orchestrator
requests the different configured 390 × 844 size. The failed case also
uses a different browser project, `chromium`, from that case's
`chromium-desktop`. Vitest schedules separate project workers and
Playwright contexts/pages, and CDP attaches to the page. If a warm browser
process is reused between projects, Playwright closes its old pages and
contexts before the new project adopts it. The desktop path provides no
evidence of a state transfer into the touch Cancel page.

The remaining alternatives include hosted-only carryover through a
particular same-session sequence and a stale Playwright content quad or
main-frame bounds during the second dialog opening. A persistent 720px
outer cap would also threaten the following refinement Cancel, which
passed on the original shard. A discriminating further experiment would
bind the original touch predecessors and the execution case to the same
hosted page, recording session identity and main/iframe dimensions across
file boundaries and the quad Playwright measures during the pointer retry.
Retain the genuine viewport transitions and the unchanged action. The
current commands did not observe an unchanged case leaving the clipped
state. Any further proof keeps the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

Round 2 recorded zero matching failures across the two ordered local
successors and the hosted shard. The clock was running at 13.8
cumulative active minutes on the cleanup check. Temporary test changes
were reverted, the notes stash remains `586c223c60650ba21d6d16efa300c9dbf41d8290`,
and the coordinator owns the Round 2 clock settlement.

The coordinator paused round 2 at 5.2 active and 15.6 cumulative
minutes. Hosted evidence is retained in `hosted-x64-result.json`,
`hosted-x64-shard2.log` and `hosted-x64-commit.patch`. The coordinator
deleted the unique remote diagnostic ref and removed its detached
worktree after capturing evidence. The story branch and stash were
unchanged.

## Round 3

One bounded macOS smoke on AC uses the installed probe, two workers and the
three unchanged mounted specs. It checks that the runner reports all three
files on the same session, records their viewport requests and emulation
transitions, and captures the actual Cancel quad and bounds. The coordinator
then dispatches one Ubuntu x64 Actions attempt at the failed revision with
the original two frontend shards, test selections, worker defaults and
proof settings. Only shard 2 installs the temporary dependency probe. The
scratch ref's source changes are diagnostic workflow routing and installation.

The touch browser queue puts the original native-effort and Usage specs
immediately before the launch-dialog spec on one page, at the original
Usage queue position. Both predecessor files retain every action and
viewport transition. This controls for a same-page carryover that the
original hosted log could not establish. Other files remain in their
relative queue order, and desktop keeps its original assignment. Ad-hoc
refinement cannot be inferred as an original predecessor because its
completion came after execution started. It remains in the ordinary shard
selection. The retained `frontend-shard2.zip` Vitest report puts the original
launch-dialog file start at 02:36:07.530 UTC and the Usage-average file end at
02:36:06.099 UTC. Native effort and ad-hoc refinement started at 02:36:10.848
and 02:36:12.918 UTC. Native effort is a controlled warmup in this experiment.
The original report does not identify page sessions.

The `CANCEL_PROBE file`, `viewport` and `cdp` markers identify ordered test
files and viewport requests by session. `CANCEL_PROBE intersection` records
Playwright's actual post-scroll quads, main-frame dimensions, mounted iframe
dimensions, stable page and call IDs and the original clipping result on
each execution and refinement Cancel sample. It also reports whether those
same quads would collapse at the previously observed 1280 × 720 fallback.
A collapsed quad with a 720px main-frame cap and a 390 × 844 iframe supports
viewport carryover. A collapsed quad with matched bounds instead directs
investigation to content-quad geometry or coordinate offsets. Passing tests
with healthy geometry establish the measured session behavior for this
sequence and leave the original failure open. Original clicks, dimensions,
timeouts and viewport iterations are used throughout. Stop after the single
hosted run and retain its logs under the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

The guarded macOS smoke returned exit 0 with 12 cases passing across three
unchanged files. All three file-start markers report the same touch session.
Its single Playwright page reports both zoom set/clear sequences, with the
native effort restore after its clear and the Usage restore before its
clear. The launch spec then runs without another viewport request. The
three native Cancel actions returned `in-viewport` with a 390 × 844 main
frame and iframe at DPR 1. Playwright measured quads spanning y=775–819 and
reported all three would collapse at the recorded fallback size. The probe
added no awaited queries before Cancel. Its extra observations used the
existing concurrent main-frame metrics evaluation. The smoke observed the
success branch of that intersection. Evidence is
`macos-retry-probe.{log,exit.json}`, `macos-retry-probe.log.run.json`, and
`hosted-cancel-retry-probe.mjs` in the same Git evidence directory.

Hosted run 45104186050, attempt 1, shard 2 job 137461583432 used
diagnostic commit `1e029e6d896c3c0f7390f373188ca42d10f8971b`. It passed
203 mounted cases across 54 specs plus the retained Playwright part.
The native effort, Usage, and story dialog files ran in that order
on the same touch session. All three native Cancel calls used the same
Playwright page. Their post-scroll quads had y=775–819, and each outer
page and iframe was 390 × 844 at DPR 1. Every intersection returned
`in-viewport`. The probe also confirmed these same quads would have
zero clipped area if the outer height fell to the previously observed
720px fallback. The source and measured run are retained in
`hosted-retry-commit.patch` and `hosted-retry-shard2.log` in Git evidence.

Round 3 captured the actual pointer predicate and observed that the same
page recovers under the selected hosted predecessor sequence. The
original failure remains open. There is no failing-before proof for a
repair. Main-frame fallback or stale content coordinates are plausible
but unconfirmed in the failing attempt, which supplied only an iframe
screenshot and action log.

A separately authorized next round could inject the 720px fallback
through CDP at the default mounted viewport and verify the exact
pointer failure on the native request. It could then check whether
aligning Playwright's initial viewport with Vitest's default prevents
the mismatch. This would test the mechanism and a runner-level
countermeasure. Attributing the original failure would still need
evidence from an unforced failure. Another round or a decision to
change how the Cancel behavior is proved requires developer direction.
The pre-existing Usage case's lost DPR 2 is an independent observed
test defect and has no proposed disposition in this execution yet.

Slice 5 remains paused, and its two unfinished source files are held
by the exact CI repair stash above. Its focused tests and typecheck
passed before the pause. Its four end-to-end cases, final review and
delivery remain. Slices 6–8 and the exact whole timing acceptance are
still open.

The coordinator paused round 3 at 6.3 active minutes and 21.9
cumulative minutes across all three authorized rounds. Both hosted
shards completed successfully on the diagnostic ref. The coordinator
retained `hosted-retry-result.json`, deleted the exact ref and removed
the detached scratch checkout. The execution observer
`/tmp/dough-ci-501/watch-sGXDju` returned `stopped` with zero unread
events; PID 85012 exited. CI coverage after shutdown is unobserved.
Run 45100433154 remains the open CI failure on the published story SHA.

## Round 4

The maintainer approved one additional diagnosis round in the execution
conversation. Test whether Chromium's reported 1280 × 720 fallback
reproduces the native Cancel failure at the mounted 390 × 844 default,
and whether using the same initial Playwright and Vitest viewport
prevents it. The CI repair stash remains parked.

Use one paired focused experiment under the AC guard and two workers.
During each run, start at the configured viewport, then use the real
device-metrics override and clear that can expose Chromium's fallback.
Measure the outer page and test iframe, and capture Playwright's actual
post-scroll Cancel quad and terminal result. Compare the same actions
with only the provider's initial viewport aligned to Vitest. Keep
native Cancel, both cases' normal viewports and default timeouts.
If the actual clear already restores the full size, one direct
injection of the known 1280 × 720 fallback may discriminate the
theoretical pointer mechanism. An injected failure is evidence of
that mechanism, with original hosted attribution evaluated separately.
Stop after the pair and the single specified diagnostic fallback if
needed. Follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

The measured pair uses the cached Ubuntu 24.04 arm64/Node 24.21.0/
Playwright 1.65.0 image, limited to two CPUs and two Vitest workers, on the
AC-powered macOS host under `caffeinate -s -i`. A detached local scratch
checkout at the failed SHA inserts one predecessor before the unchanged
execution journey in its original spec. The predecessor uses
`doubleUsageDeviceScale()` at the runner default and logs both viewport
bounds before zoom, with DPR 2 and after its actual cleanup hook. The
installed Playwright click path records post-scroll quads and the original
intersection in both runs. The hypothesis is that the default 1280 × 720
initial Playwright context permits clear to leave the outer viewport at
that fallback, while the mounted iframe stays 390 × 844. Stop after one
baseline and one candidate, changing only the configured initial Playwright
context viewport in the candidate. If the unchanged provider clears
successfully, run one CDP-forced fallback mechanism check in the baseline
configuration. This control tests the exact click failure at the observed
fallback dimensions. It supplies no failing-before proof for the initial
viewport candidate when both actual clears succeed.

The actual-clear baseline failed at the unchanged native Cancel on the
second dialog. The original window configuration and iframe were 390 × 844
before the real zoom, both at DPR 2 during it. The clear left the same
window bounds and iframe at 390 × 844 and returned the main layout and
visual viewport to 1280 × 720. Playwright saw the Cancel quad at
x=188.359375–269.796875, y=775–819 on the same page. Its ordinary
intersection returned `error:notinviewport` through the retry loop, and the
terminal failure included the original visible, enabled, stable and
outside-viewport lines. This used real clear and needs no forced injection.
Run the single matched candidate to check that matching the initial sizes
keeps the original action and the default iframe reachable after clear.

The aligned candidate passed both selected cases. Vitest and the initial
Playwright context used one 390 × 844 default, with touch enabled in
`chromium` and disabled in `chromium-desktop` as before. The instrumented
run selected the touch instance. After the identical CDP clear, both
viewports measured 390 × 844 at DPR 1. Playwright measured the same Cancel
quad, accepted it on the first intersection, and completed the case in
266 ms with the existing focus-return and zero-launch assertions. The
baseline failed once in one selected execution case and the aligned
candidate passed once in one. The three other dialog cases were filtered
in each run. No other execution-owned tests were run. The host had 16
logical CPUs and one-minute load of 30.95 at baseline start and 28.44 at
candidate start. The candidate ended at 27.21.

The baseline's 32 retry samples and the two 390 × 844 failure screenshots
explain how the hosted click error can coexist with a visible Cancel in
the mounted capture. This establishes a real fallback defect on the
committed runner using the existing zoom helper, and the paired run
establishes the aligned initialization as its repair. The original hosted
attempt did not record its main viewport or session history. Which
unchanged predecessor or transition produced its failure remains
unobserved. The separate Usage zoom proof defect from Round 2 is unchanged
by this diagnosis.

Recover the two exact commands and exit statuses, raw logs, proof
records, original baseline report and screenshot from `round-4/` in
`open-dough/evidence/ci-45100433154` in the execution Git path.
`same-page-zoom.patch` and `install-probe.mjs` retain the temporary
predecessor and instrumentation. `initial-viewport-candidate.patch`
contains only the shared runner viewport change. The detached scratch
checkout and both source edits were removed. The execution checkout has
only this diagnosis untracked, with the Slice 5 work still parked. The
candidate command ended at 3.7 active and 25.6 cumulative minutes. The
coordinator owns clock settlement and the separate fix slice. Whole
frontend and CI proof remain due under the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

The coordinator paused Round 4 at 4.9 active minutes and 26.8
cumulative minutes. The separate viewport repair applies only
`initial-viewport-candidate.patch` from the paired proof. It shares
the existing default between Vitest's frame and both Playwright
contexts so a CDP clear cannot return the outer page to 1280 × 720
at the default. No diagnostic code ships.

Run the full frontend group once for behavior at two workers on
AC macOS. The host had 16 logical CPUs and one-minute load 21.03
before launch. There are no other execution-owned heavy runs.
Limit the proof to two workers and avoid concurrent type checking.
If host contention affects the outcome, inspect the specific failure
under the shared policy before another attempt. This broad run is
for compatibility, including native touch and desktop pointer cases.
It does not supply a timing acceptance comparison.

The unfiltered frontend command waited at repository admission behind
the live Distribution verification in a different worktree, and had
started no frontend checks. After more than two minutes of this wait,
the coordinator stopped only this execution's queued frontend process.
Use this project's two explicit frontend CI shares sequentially at two
workers on AC macOS. The runner defines these shares as disjoint and
exhaustive, retains both browser engines, and permits explicit shares
without full-suite admission. Together they provide the whole frontend
compatibility selection. No other heavy proof is owned by this
execution during these runs; check the terminal report before proceeding.

The reproduced failure screenshot and the original hosted attachment
are byte-for-byte identical. Both have SHA-256
`c2008f5950ac31913f84a273d4a486ccd3faeac530240a5e41028476281a74e2`.
This corroborates the same visible layout and failing action. It
cannot identify which transition occurred earlier on the original
hosted browser page.

The first local share reached its retained Playwright workers. More than
six minutes later the host load reached 53.08 on 16 logical CPUs while
another worktree still owned full Distribution verification. The
coordinator stopped this execution's local share before it had a terminal
verdict. No local frontend verdict is inferred. Move compatibility proof
to one hosted Ubuntu 24.04 attempt on an isolated ref containing the exact
viewport candidate. Route only the existing two frontend shards with their
original runner, worker defaults, case selection and proof settings. Check
whether sharing the configured viewport preserves the ordinary retained and
mounted test roster, including the desktop and native touch witnesses.
Stop after one hosted run and record its exact result. The separate
controlled Linux baseline and candidate remain the failure mechanism proof.

Hosted compatibility run 45107076936 passed both standard frontend
shards on disposable commit `f101f088b66a6e0eab6b6ac3dc8f0fb35e4f7f08`.
The candidate configuration was byte-identical to the story checkout.
The two case proof fragments cover 856 passes across 321 files, with
zero failures or other outcomes. The 523 mounted passes include the
original execution Cancel (271 ms), the two `chromium-desktop` launch
specs, and the native refinement touch rotation. The original retained
Playwright selection passed in both shards. Evidence consists of
`repair-hosted-result.json`, both `repair-hosted-share*.log` files,
and both proof fragment ZIPs in `ci-45100433154/round-4`. This check
does not replace the exact launch timing comparison. The interrupted
local share ends with an interruption receipt and supplies no partial
verdict. The dashboard typecheck passed in the story checkout.

Independent refactoring found no edit candidate and retained the
failing-before pair. The config has one shared default for both
pointer assignments and Vitest and leaves the ordinary browser actions
in place. Source freshness is unchanged at `65d7bd49`.
