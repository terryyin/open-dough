# Diagnose mounted viewport failures after Board integration

Published revision `341de8f4aa1366fe6302898b57f40368398eb140` ran as
GitHub CI 44932035631 attempt 1. Frontend shard 2/2 (job 136930547614)
reported one existing Projects case unable to click Add because it was
outside the viewport. Its other 124 cases, including repaired launch
touch and desktop offers, passed.

Frontend shard 1/2 (job 136930547663) reported five Board failures.
Accessible Board scroll and frame Board appearance had one column
outside the expected three-column view. Three Board paging cases had
only one whole column where two were expected. The exact titles,
viewport assertions, and logs are in the checkout Git evidence
directory as `ci-44932035631-frontend-job.log` and
`ci-44932035631-frontend-job-1.log`.

The branch includes the landed Board fixture at `fbb074217`. Trunk
`2cc0d8209` changes Board swipe and frame history preferences, but
does not change the five failing observations. No active owner of these
exact failures was found. Diagnose browser setup and viewport geometry
before assuming a shared cause or changing application behavior.

Slice 4 and its refactor are preserved by managed stash
`9305355a5a3edaf8b00faad481f8922518e69a16`, record
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-FC01BO/record.json`.
Round 1 starts with the clean published candidate.

## Round 1

At the exact published revision, first run the four affected specs once
on locked Linux arm64 with two workers and the Mac on AC. The live
baseline hypothesis is a platform-specific geometry assumption. A
matching failure will determine which fixture measurements to capture.
If the baseline passes, inspect the hosted screenshots and instrument
the specific dimensions. Keep the assertions and timeouts unchanged.

Locked Linux arm64 passed 11/11 in the first focused run. Hosted
artifact 14718625550 shows an open Sessions sidebar in the 864px
paging failure and the 1440px scroll failure. This fits the exact
loss of one whole column without changing the page width. Artifact
14718530772 shows Add at y552–592 in a 390×844 Projects iframe after
both inputs were filled. The click is outside the browser's usable
viewport despite the button being within the iframe screenshot.
The pinned Vitest runner sizes the iframe by configuration but
calls Playwright setViewportSize on the outer page through an
explicit viewport command. A shorter outer viewport can therefore
produce this signature when a test inherits the browser's state.

Try one controlled before run at two workers. Inject the exact
remembered-open Sessions preference into the five Board cases. For
Projects, temporarily use Chromium emulation to shorten the outer
page while leaving the 390×844 iframe untouched. Print inner frame
and outer window dimensions and the Add button boundary before the
real click. Keep the existing business and geometry assertions and
default timeouts. The interventions are diagnostic and will be
removed from the final diff.

The controlled before run reproduced all six signatures. The five
Board width arrays matched the hosted failures exactly. Projects
measured a 390×844 iframe inside a 390×390 outer page with Add at
y553–597. Playwright resolved an enabled, stable button and retried
because the target was outside the viewport. The hosted outer
viewport dimensions and the operation that left them stale were
not captured. Diagnosis round 1 paused at 3.2 active minutes.

## Repair

Run one additional Projects-only baseline with the short outer
viewport set immediately before mount. This discriminates a stale
starting fixture from a resize during the test, which the first
injection simulated. The normal explicit viewport can only repair
the former. Run the exact same controlled preconditions once after
the setup changes. The exit records will distinguish the paired
baseline from the maintained tests.

The Projects-only inherited-window baseline failed before the
repair at the same Add click. Opening Add and filling both fields
still passed at the measured 390×844 inner and 390×390 outer sizes.
Use the explicit 1280×720 desktop setup used by the mounted settings
family and keep the real click and refusal assertions. Port the
existing sidebar preference helper from trunk 2cc0d8209, then use
it only at the five affected Board mount sites. Run the original
four-spec cohort once with both pre-mount injections retained to
prove the setup neutralizes them.

With the same forced starting preferences, Linux passed 11/11.
Projects measured 1280×720 in both the iframe and outer page before
Add, whose rectangle was y491–535. All five Board cases reached
their unchanged cohort and geometry assertions. Remove both
injections and their console probe. Then run the four maintained
files and three nearby ownership checks on Mac and locked Linux.
The latter exercise remembered Board positions, the deliberately
open sidebar, and viewport changes in the separate Projects touch
journey. Run one cohort per platform with two workers, sequentially.

The maintained seven-spec cohort passed 17/17 on both macOS and locked
Linux arm64. The Board preference lifecycle and deliberately open sidebar
also passed, along with the Projects touch viewport changes. Dashboard
typechecking and `git diff --check` passed. See
`mounted-viewport-ci-implementation.md` and `mounted-viewport-consumers.md`
in the Git worktree evidence path for exact commands, observations and
consumer dispositions. Hosted Linux amd64 verification awaits publication.

## Adopt the landed Board repair

Trunk `396f81d69` owns the same saved-Sessions failure at the mounted
frame boundaries. Local merge `7ab70dbda` adopts that accepted repair.
The separately tried Board edits were removed from the working tree.
The Projects refusal retains its explicit desktop viewport.

The final seven-spec selection passed all 17 cases on locked Linux arm64
against the adopted Board setup and local Projects fix. Its record is
`viewport-reconcile-linux.log.run.json`. The previous local contrast
remains evidence for the two causes, with arm64 and amd64 distinguished.

Use one automatic hosted CI run on the published repair. Expect the
three- and two-column Board results with the stored sidebar preference
scoped, and a real Add click followed by the path refusal at the explicit
desktop viewport. Any further failure needs its actual new evidence.

The next published revision included these repairs and Slice 4. Both
frontend shards and the entire hosted check passed at `e90a94283`.
[Hosted run 44934101206](https://github.com/terryyin/open-dough/actions/runs/44934101206).
