# Slice 4 — genuine preview lifecycle and minimum-composition probe

Base: `f9264268ed39a88c98caa123722d6ff018979748`, same owned checkout,
branch and parent-owned observer as [execution context](execution-context.md).
The coordinator owns plan/readiness, source commitments, coverage and delivery.
The [failure policy](../../../AGENTS.md#failing-and-flaky-tests) applies unchanged.
Private raw evidence and exact disposable source: `/tmp/seed303-preview-KwFoNb`.

## Basis declared before edits

The supported current watcher/pin selection cost 103.32 seconds. Seek at least
**20 seconds of complete-family saving**, including every new or credited check,
startup, preparation and cleanup, to justify another production owner. Test one
bounded hypothesis: the CLI's real preview lifecycle can run drain/stop/start/
restore over genuinely built A/B outputs without staging every detailed variant.
Do not remove old proof before actual equivalent observations and fault controls.

PFE found `productionDeployment.mjs` owns real staging, `productionPreview.mjs`
owns one real process/drain handshake, and `watch-dashboard.mjs` alone orchestrates
replacement/restoration. The temporary 66-line `productionPreviewLifecycle.mjs`
extracted exactly process transitions. The actual CLI used it; staging, retirement,
Git selection and successful-baseline advancement stayed in their existing owners.
No parallel model, callback substitution, deployment cache or fake preview was added.
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
kept Git/local-machine ownership; [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
supplied the worthwhile-gain criterion. [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
was consulted: no released guidance, installed owner or source clock was changed.

## Measurements and paid boundaries

| Run | Strict selected/passed | Whole elapsed s | Case sum s | Deployment npm ci/build attempts | Other paid work |
| --- | ---: | ---: | ---: | ---: | --- |
| before | 24/24 | 103.32 | 87.134 | 13/13 | 1 development install, both original watcher chains, pin and 3 real-Git checks |
| probe | 6/6 | 20.88 | 13.420 | 2/2 | cold publication, 8 preview invocations, all original pin boundary assertions |
| composition | 7/7 | 44.61 | 32.856 | 4/4 | 1 development install/server, 2 full output copies, native host/runner, 9 preview invocations |

Every positive command terminated exit 0, ordinary strict pass, retry/repetition
index 0, no skips. Whole elapsed includes startup, cold fixture source/Git/HOME,
normal npm installation/build, every snapshot copy, assertions and teardown.
Normal npm/download/OS/Playwright caches remained; no dependencies or built output
were prepared outside the timed command. Complete normal npm logs retain actual
invocation titles; `composition-counts.json` and `measurements.json` summarize them.
Whole minus case sum includes runner, hooks and teardown; it is not omitted cost.

The initial owner probe published selected A then advanced main to B. It fetched,
installed and built A in its own actual checkout, served and stopped A, then
started it again and genuinely built B while A still served. It exercised failed
B preview start/restored A, successful same-B retry, failed A candidate plus failed
B restoration, and unexpected SIGKILL loss. The production owner made every process
transition. Existing published fault gates supplied real transient causes before
the actual npm/Vite commands; they never supplied stage/preview results.

At `production-preview-lifecycle.spec.ts` (parked exact source), the observing
checks were: distinct selected/latest SHAs; isolated SHA-prefixed directory outside
development; `verifyPublishedCommit`; positive A/negative B dist marker; loopback
HTTP 200/A marker; untracked cartoon setup and exact WebP bytes/type; only the
curated cartoon in dist; all four exact supplied icon bytes/types; own-origin
404 versus missing/foreign-origin 403; stopped PID and unavailable URL; exact
`process-started, process-ended` incident pair. Thus the paid probe repeated every
original pin assertion. The original case was never deleted or reallocated.

Restoration assertions checked the exact A commit and HTTP marker, unchanged URL,
new live PID and ended old PID. Retry checked B content/commit/path and ended A.
Dual failure checked both named commits and two actual failure causes, no current
preview and unavailable URL. SIGKILL checked the exact unexpected-exit error,
exited process and unavailable URL. Source/distribution digests differed across
A/B and stayed identical before/after failure, restoration and retry. The digest
excludes `.git` and `node_modules`; complete dependency-byte immutability was not
claimed. Setup uses the existing publication/host fixtures and shared MakeMe data;
exact marker/gate inputs and expectations remain at their test call sites.

The one disposable composition used the actual native/development fixture and
source projection plus published CI workflow. One real watcher served A beside
development, paid a B build failure, retried B with its real build held while C
reached main, then drained one accepted native start before serving selected B.
It observed 503 during drain, one launch call, persisted launched attempt/session,
shared production/development records, published HTTP revision/backlog, unknown-
project 404 without a launch, retirement of A after B served, and real C-build
cancellation. Shutdown observed build/preview death, unavailable URL, empty actual
deployment/inspection roots, unchanged store/config bytes and inodes, and dev 200.
The watcher paid four stage attempts: A, failed B, successful B, held C.

Inside the same timed command, two full A/B checkout copies retained actual built
source, dist and installed dependencies before CLI retirement. Relative symlinks
were preserved, Vite's realpath stayed inside each copy, copied digests matched
originals, a changed copied marker left the original intact, and restoring that
marker restored digest equality. After genuine CLI cleanup, the copied A/B outputs
ran real owner restore/retry, dual failure and SIGKILL transitions, with unchanged
source/dist hashes. No original checkout's retirement was bypassed.

## Literal commands and host conditions

```sh
npm_config_logs_max=1000 npm_config_logs_dir=/tmp/seed303-preview-KwFoNb/before-npm OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed303-preview-KwFoNb/before.json /usr/bin/time -p caffeinate -i npm run --silent test:dashboard -- --workers=1 --grep 'production-watcher-failures\.spec\.ts|production-watcher-updates\.spec\.ts|production-updates\.spec\.ts|deployment installs, builds, and serves its pinned commit in isolation after main advances, with the real preview boundaries' > /tmp/seed303-preview-KwFoNb/before.log 2>&1
npm_config_logs_max=1000 npm_config_logs_dir=/tmp/seed303-preview-KwFoNb/probe-npm OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed303-preview-KwFoNb/probe.json /usr/bin/time -p caffeinate -i npm run --silent test:dashboard -- --workers=1 --grep 'production-preview-lifecycle\.spec\.ts' > /tmp/seed303-preview-KwFoNb/probe.log 2>&1
python3 /tmp/seed303-preview-KwFoNb/controls.py > /tmp/seed303-preview-KwFoNb/controls.log 2>&1
npm_config_logs_max=1000 npm_config_logs_dir=/tmp/seed303-preview-KwFoNb/composition-npm OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed303-preview-KwFoNb/composition.json /usr/bin/time -p caffeinate -s -i npm run --silent test:dashboard -- --workers=1 --grep 'seed303-preview-composition\.spec\.ts' > /tmp/seed303-preview-KwFoNb/composition.log 2>&1
npm run --silent typecheck:dashboard > /tmp/seed303-preview-KwFoNb/typecheck2.log 2>&1
npm run --silent typecheck:dashboard > /tmp/seed303-preview-KwFoNb/composition-typecheck.log 2>&1
```

`controls.py` retained each faulted owner, ran the ordinary probe command once per
fault sequentially with its own `<fault>.json/.log/-npm`, and restored owner bytes
in `finally`. `control-results.json` retains exact inner argv. Each inner command
was `/usr/bin/time -p caffeinate -i npm run --silent test:dashboard -- --workers=1
--grep 'production-preview-lifecycle\.spec\.ts'`, with `npm_config_logs_max=1000`,
`npm_config_logs_dir=/tmp/seed303-preview-KwFoNb/<fault>-npm`, and
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed303-preview-KwFoNb/<fault>.json`.
Output/stderr went to `/tmp/seed303-preview-KwFoNb/<fault>.log`.

Before baseline: 16 logical CPUs/48 GiB, load 3.88/4.12/3.96, memory free 44%,
battery 96%, lid explicitly open. Before owner probe: battery 94%, load
5.10/4.50/4.14. Both used `caffeinate -i` under the maintained battery condition.
Before composition: now AC charging 92%, lid open, load 2.93/4.43/4.32, memory
free 44%; own typecheck had ended, no competing heavy proof visible or parent-
owned heavy proof active. Afterwards load 3.88/4.41/4.32, memory free 44%.
Normal production-preview/Codex/VM activity remained; unknown other work was not
stopped. Sleep-log inspection after runs found no sleep/wake in their windows.
Power changed: composition is an absolute target probe, not a matched saving
against the battery baseline. No identical-load or cold-download claim is made.

## Discriminating controls and cleanup

| Fault | Expected observed failure | Whole s |
| --- | --- | ---: |
| wrong-target | restoring failed candidate B instead of A yields paired fatal failure in restoration case | 21.51 |
| missing-restore | restoration case observes `No working preview` | 22.65 |
| missing-retry | same-candidate success case observes `Candidate already attempted` | 17.23 |
| candidate-ownership | restoration commit expected A, received B although A was restarted | 16.29 |
| lost-cleanup | stopped preview PID expected false, received true | 14.16 |

All five normal strict commands terminated exit 1 as intended; each observed its
listed fault, then serial successors skipped because of that intentional failure.
The cleanup control independently retained raw preview handles. `afterAll` awaited
the primitive `preview.stop()` on each even when lifecycle.stop was faulted;
`stopProcess` awaited child exit and killed remaining process-group descendants.
`lost-cleanup-retirement.json` records its exact logged fixture root absent and
zero matching processes. `all-retirement.json` records all ten logged fixture
roots absent and zero remaining processes referencing them after terminal runs.
All sessions launched by this implementer reached terminal results. No observer
was started, polled or managed; the parent-owned observer remains untouched.

Initial typecheck found two new test typing errors (caught-error message and
optional PID); both were corrected before the paid passing probe. Both later
literal typechecks passed. No unintended automated-test failure remains.
Three consecutive changed-async passes were not obtained: this candidate was
stopped at its decisive failed strategy checkpoint and is not accepted code.

## Checkpoint, missing proof and disposition

**The supported shared-output subset passed in 44.61 seconds, 14.61 seconds above
the entire story's 30-second target.** It already shares actual A/B builds across
the watcher and owner and pays only four stage attempts plus two copies. This
invalidates the current staged-output sharing strategy as a supported route to
the total target. It establishes no universal or irreducible floor.

The complete current watcher/pin family still measured 103.32 seconds, already
73.32 above the entire target before other families. The 44.61 subset omits
unchanged-poll quietness, unavailable-origin resumption, actual watcher SIGHUP/
restart, repeated excluded/rejected/published-policy observations and all three
stateful Git checks; actual CLI fatal-restoration/unexpected-exit integration;
full pin cartoon distribution and exact incident pair; and every other original
profile/touch/Cursor/pending-Take/repeat/provider family. Those protections are
additional unpaid proof in this subset. Separate earlier passes do not make them
free. No complete replacement timing/count or >=20-second equivalent-family gain
was established. The original 45-case baseline and all earlier accepted work stay
valid; the current complete replacement/combined remaining gap remains unmeasured.

The strongest simpler composition considered was this very one: build A/B through
one necessary CLI chain and reuse isolated copies for detailed preview variants.
It was paid and passed, yet exceeds the target before the omitted protections.
Avoiding copies by retaining CLI-owned retired checkouts has no proved isolation/
cleanup contract and would bypass a promised retirement boundary. More aggressive
preparation/dependency reuse remains unproved, not a saving to assume. Removing
real boundaries, excluding replacement proof, more workers or relaxing 30 changes
the story's constraints and requires a human decision. No further optimization or
future slice was started; pending request-owner clock authority remains untouched.

At the coordinator's checkpoint instruction, all temporary implementation was
parked as exact private evidence and removed/restored. `scripts/watch-dashboard.mjs`
was restored byte-for-byte from base f9264268; the new owner, owner spec and digest
helper were removed. The three disposable composition files were archived then
removed. Every original watcher/deployment test and helper stayed byte-identical
to base; `restoration-check.json` independently confirms six relevant paths.
Parent-owned execution-context and all later parent planning edits were preserved.
No commit, push, refactor pass, formatter, hook lint or status/source-map edit ran.
The delivered result is this evidence record; slice 4 implementation is incomplete.

| Parked source basename | SHA256 |
| --- | --- |
| productionPreviewLifecycle.mjs | e81024de50a6b7af017157879d865590452c6e93dfb4cc77f217435f58042ca7 |
| production-preview-lifecycle.spec.ts | ddbbed5aaf72e094b4609dfee67bb7359e76f1103e907118be6004e8c35a3ee2 |
| builtDeploymentDigest.ts | 5682861260e2594e66d7cc4be59862d11a1cd06d97d1fa94cf59b39b7bb960e5 |
| watch-dashboard.mjs | d113297cb6dfd8223c94ebf0c225bdb6785c85d6ea00a9b3bca987c42538406c |
| seed303-preview-composition.spec.ts | edf0ccaca8f64c03c577350fa2d02cbcea1cb3d2789d3aa0033faa746a1981c6 |
| seed303CompositionJourney.ts | 4936c333c1fb2239ddc818833dbdeb7042504e29544d90f46cc4ca9b73e7f620 |
| seed303CompositionPreview.ts | f42bdcaefba1f4c3156450eb7f50b2fe3965e6d42cd5f7699c184811587ca59e |

All files above are directly inside the private evidence root; each source is
under 250 lines. `source-disposition.json` retains original repository paths and
restored CLI hash. Literal whole-checkout consumer trace (before rollback):

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/run-the-slowest-dashboard-checks-together-in-und --base f9264268ed39a88c98caa123722d6ff018979748 --term startProductionPreview --term 'Production dashboard exited unexpectedly' --term 'Restored production dashboard' --term 'Waiting for accepted dashboard starts' > /tmp/seed303-preview-KwFoNb/final-consumer-trace.txt
```

Actual temporary consumers were the CLI and new owner/composition probes. Original
watcher failure/update assertions consumed preserved messages, PID/URL and drain
semantics; process/stage fixtures supplied unchanged real boundaries. Candidate
CLI stage-failure/pin/drain/shutdown passed in composition; full candidate fatal/
unexpected-exit integration remained unproved. `consumer-dispositions.md` in the
private root disposes all 56 located rows, mostly incidental lexical matches.
Parent planning filenames are not runtime effects. Exact rollback removes all
ongoing runtime/test effects; unchanged accepted proof requires no new regression
run merely for this records-only outcome. Source commitments SC-37/41 and G3's
slice outcome are not marked proved/completed by this experiment.
