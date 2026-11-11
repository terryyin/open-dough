# Slice 3 — stateful real-Git watcher selection

Base: `25bdcd3de68545b19841bf8962d3987256a1c84f`, same owned checkout,
branch, dependency/native setup and parent-owned CI observer as
[execution context](execution-context.md). The parent owns acceptance, statuses,
source-review, coverage-map and publication. Follow the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).
All work and proof return uncommitted; no CI wait or manual test was performed.

## Basis declared before the first edit

Retained original watcher bodies cost 105–112 seconds and required 16 deployment
install/build-command attempts. The bounded hypothesis was to move the serving
baseline and excluded-range state into one production selection owner used by
the CLI, prove its detailed variants against real published Git, and remove four
policy stages. Keep at least **eight seconds of whole-family saving**, including
all new/displaced proof, to justify the new boundary. Fault risk: rejection,
exclusion, failure or premature activation advances the wrong baseline.

The declaration preceded the first edit: the new production module's filesystem
birth timestamp is `2026-11-11T03:32:55.592Z`. The first focused command's config
stamp was `03:33:13.216Z`, runner start `03:33:17.411Z`, ordinary strict 7/7,
11.07 seconds elapsed. The measured command profile was normal quiet reporter,
one worker, fresh proof/run-artifact ownership, current source, and no prebuilt
fixture or special runner mode. Normal npm/OS/Playwright caches were retained.

PFE found real Git interpretation in productionQualification.mjs and the baseline
state only in watch-dashboard.mjs. The 41-line productionUpdates.mjs now owns
that existing ephemeral state and calls real qualifyPublishedRange. The actual
CLI uses select() and reports activated() only after successful preview startup.
No stage/preview callbacks, mocks, exported test-only internals, new persistence,
daemon, clock, auth or routing contract were introduced. Git remains authority
under [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
The measured keep criterion follows [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Preserved and substituted observations

Five detailed policy cases become three real-Git state cases. Three actual
watcher policy cases remain: excluded docs do no work; published extra exclusion
wins over a dirty local workflow; unsupported policy repeatedly reports before
install while the working preview serves. The existing canonical published
policy is supplied with A, rather than buying an E activation just to install
that policy. Existing held shutdown X repairs the rejected workflow as part of
its own source. Its real build, signal, PID, checkout, record/config bytes and
inode, and independent development-HTTP assertions remain unchanged.

| Original coverage rows | Passing maintained observation |
| --- | --- |
| 1–10 | Entire unchanged production-watcher-failures.spec.ts: initial real activation; failed build preserves A; same B retries; C prepares while B serves; failed start restores B; same C retries; origin outage/resumption; HUP cleanup and restart; fatal restoration; unexpected SIGKILL cleanup. |
| 11–16 | Existing production-watcher-updates.spec.ts observations unchanged: quiet unchanged checks, shared durable records, held B selected while C reaches main, actual closed admission/drain and one native start, later C preparation/replacement, exact store/config bytes, published reads/refusal, and retirement after serving. |
| 17 | Retained real excluded-only no-work/serving assertion in productionUpdatePolicies.ts. New state case at production-updates.spec.ts:13 also proves excluded-range caching leaves baseline A. |
| 18 | New case :13 uses actual app commit followed by docs-only latest E; selects E from the accumulated/mixed range. Existing held B/C path still proves real selected-commit staging/content, one build per served commit, same-URL activation and retirement. |
| 19 | Retained actual watcher published-extra/dirty-local conflict, unchanged deployment work and same serving PID/title. |
| 20 | Retained actual repeated unsupported-policy error, exact working baseline, no preparation/build/restart, and serving. New case :46 also rechecks rejection through real Git. |
| 21 | New case :46: Q changes only ignored workflow/docs after rejected P app changes; Q remains a candidate against A. The actual watcher activation path remains proved by B/C and the failure/retry integration. |
| 22–23 | New case :88: unactivated R is selected again; later docs-only S retains R app paths against A. Real build-failure preservation/retry remains in failure rows 2–3; main advancing during a genuine held build remains in row 12. The transient held-once gate was scenario input, not a new production decision owner. |
| 24 | New cases :13/:88: after activated E/S, docs-only T is excluded from that successful baseline. Retained real watcher exclusion occurs after actual C activation, observing no install/build/restart. |
| 25 | Existing real SIGTERM-during-build shutdown and all native/shared-file/development assertions remain in productionUpdateJourney.ts. |

SC-38 is observed by rejection/repair case :46 and retained actual repeated
rejection; SC-39 by state case :13 and both real no-work policy cases; SC-40 by
state case :88 and the unchanged real same-commit build/start retry chain.
SC-37/41 remain protected by the unchanged passing integration and belong to the
parent's following preview-lifecycle slice. The standalone pin proof was neither
removed nor credited elsewhere. No proof moved into production-watcher.spec.ts.

## Literal commands and measurement

Private root: `/tmp/seed303-watchers-wncuNF`. All JSON records use the ordinary
strict reporter; successful runs have retry/repetition index 0 and no skips.
Run names below are the actual files. No test/fixture acquisition ran between
measurements. The entire normal command pays cold current-source publication,
real Git, development installation/server, every stage, browser, and cleanup.

```sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed303-watchers-wncuNF/selection1.json /usr/bin/time -p caffeinate -s -i npm run --silent test:dashboard -- --workers=1 --grep 'production-updates\.spec\.ts|production-qualification\.spec\.ts' > /tmp/seed303-watchers-wncuNF/selection1.log 2>&1
npm_config_logs_max=1000 npm_config_logs_dir=/tmp/seed303-watchers-wncuNF/before2-npm OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed303-watchers-wncuNF/before2.json /usr/bin/time -p caffeinate -s -i npm run --silent test:dashboard -- --workers=1 --grep 'production-watcher-failures\.spec\.ts|production-watcher-updates\.spec\.ts' > /tmp/seed303-watchers-wncuNF/before2.log 2>&1
npm_config_logs_max=1000 npm_config_logs_dir=/tmp/seed303-watchers-wncuNF/after1-npm OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed303-watchers-wncuNF/after1.json /usr/bin/time -p caffeinate -s -i npm run --silent test:dashboard -- --workers=1 --grep 'production-watcher-failures\.spec\.ts|production-watcher-updates\.spec\.ts|production-updates\.spec\.ts' > /tmp/seed303-watchers-wncuNF/after1.log 2>&1
npm_config_logs_max=1000 npm_config_logs_dir=/tmp/seed303-watchers-wncuNF/neighbors-npm OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed303-watchers-wncuNF/neighbors.json /usr/bin/time -p caffeinate -s -i npm run --silent test:dashboard -- dashboard/tests/runtime/production-watcher.spec.ts dashboard/backend-tests/runtime/production-watcher-refusals.spec.ts --workers=1 > /tmp/seed303-watchers-wncuNF/neighbors.log 2>&1
npm run --silent typecheck:dashboard
```

The after command ran sequentially with `after1`, `after2`, `after3`, replacing
that basename in all three destinations. Before1 used the before selector and
proof/log basename `before`, with npm_config_logs_dir=.../before-npm but no
logs_max override. It strictly passed; npm's default retention pruned its
count diagnostics to 11 files. Its elapsed/behavior evidence remains included;
it supports no exact stage count. The single additional before2 run retained
all native npm logs. Logs_max only retains normal npm diagnostics; it changes
no install/build command, process boundary or runner behavior.

| Run | Selected/passed | Whole s | Case sum s | Deployment installs | Build-command attempts |
| --- | ---: | ---: | ---: | ---: | ---: |
| before | 25/25 | 113.80 | 100.046 | not retained | not retained |
| before2 | 25/25 | 115.55 | 100.692 | 16 | 16 |
| after1 | 23/23 | 95.47 | 80.816 | 12 | 12 |
| after2 | 23/23 | 99.18 | 82.552 | 12 | 12 |
| after3 | 23/23 | 95.93 | 80.387 | 12 | 12 |

Each complete-count run also included one development install. Native npm argv/title,
cwd and exit records count actual deployment ci/build invocations, including
failures and held shutdown. Before2: 13 build-command exits 0, two exits 42,
one killed held build; after: ten exits 0, one exit 42, one killed held build.
These are build-command attempts, not claims that every attempt completed Vite.
The four removed stages are E, Q, failed R and S. All three new state checks are
inside each after command; their summed bodies were 1.894/2.417/1.952 seconds.
The family count is 25 → 23, not a claim of substantially fewer checks overall.

Comparable whole-family saving against complete before2: 16.37–20.08 seconds,
median **19.62 seconds (17.0%)**. Against before1: 14.62–18.33 seconds. Both
before observations exceed every after observation by more than the
predeclared eight seconds. This is a measured family gain; no full-selection
saving is claimed. Runner/outside-case phases and source hashes are retained
in measurements.json; original strict records retain every selected identity.

All launches were awake AC under caffeinate -s -i on 16 logical CPUs/48 GiB.
Pre-launch load (1/5/15 min), memory free: before 3.05/3.57/4.10,43%; before2
3.36/3.61/4.03,42%; after1 3.26/3.84/4.08,40%; after2 3.44/3.97/4.11,42%;
after3 6.05/4.90/4.46,41%. Normal system/production-preview activity varied;
FSEvents/Spotlight and a PyGardon worktree removal were visible around after3.
No artificial load or stopping another owner occurred. These are credible
one-worker shared-host observations, not an identical-load or cold-cache claim.

## Fault controls and neighboring proof

Each controlled variant used the same strict entry, worker and caffeinate
profile, its own `<name>.json/.log`, and `--grep` for the literal test title below.
The module/script were restored byte-identically from owned private snapshots;
cmp and final hashes confirmed restoration. No normal source failure occurred.

| Control | Deliberate fault | Selection and observed failure |
| --- | --- | --- |
| rejected-control | qualify rejection sets baseline to selected P | `a rejected policy is checked again and its ignored repair retains application changes`: 1 selected/failed, 5.30s, :75 baseline expected A received P. |
| retry-control | qualifying R advances baseline before activation | `an unactivated candidate is retried and the next docs commit retains its application paths`: 1/failed, 4.36s, :106 retry expected candidate received unchanged. |
| excluded-control | excluded D advances baseline | `published updates keep excluded and accumulated changes against the last activation`: 1/failed, 5.39s, :31 repeated range expected already-excluded received unchanged. |
| activation-control | activated(S) does not advance baseline | Same unactivated-candidate title: 1/failed, 4.67s, :112 docs T expected excluded received candidate. |
| cli-control | actual CLI calls activated(selected) before stageDeployment | `a watcher serves the working commit whose build and start are gated` plus `a failed build keeps working production`: 2 selected, initial passed/fault case failed, 17.23s, existing :95 expected Keeping A received Keeping B after real failed build. |

Selection1 strictly passed all three new cases plus four qualification neighbors
(7/7,11.07s). The normal replacement family then passed three consecutive times.
Neighbors strictly passed all seven serial watcher lifecycle cases plus refusal
(8/8,36.87s), including native runner/client survival, occupied-port refusal,
current-main restart and SIGINT cleanup. They are regression neighbors, not
uncounted replacement proof. Typecheck and git diff --check passed. No formatter,
hook lint, commit, push or status/source-map mutation was performed here.

## Checkpoint and handoff

Keep the measured stateful selection substitution. It removes four real stages
and two maintained checks with a small production owner and less policy-harness
code. Shared MakeMe domain data and existing real publication/Git/provider
fixtures remain; exact path/policy strings are inputs whose form is under test.
[Consumer dispositions](watcher-consumers.md) cover the whole-checkout base trace.

The smallest measured replacement family is still **95.47 seconds**, already
65.47 above the whole-story threshold, before other original families or pinning.
This does not establish an irreducible floor. Approximately 19.62 seconds of
family gain plus slice2's roughly 2.2-second preparation estimate would leave
about 235 seconds of the original median gap; that is a strategy estimate,
not a measured combined replacement. G3 is open for slice4's genuine preview
lifecycle/staging reduction; G4 remains slice11; the unanswered clock authority
remains slice5. No further optimization was started and no threshold relaxed.

All owned commands ended. Parent-owned observer identity is `/tmp/dough-ci-501/watch-Bv7V91`,
coordinator `seed303-kanai`, cell `g39:11`, session `95073`, PID `68484`; this
implementer neither queried nor managed it. Parent refactor should inspect the
now-unconsumed heldOnceFault test-input export and fixture policy ownership.
The SEED-287 worktree and all other-owner code/metadata were preserved.

Current test home: `production-update-selection.spec.ts`, renamed from
`production-updates.spec.ts` with rule-specific case titles. Bodies and assertions
are unchanged; historical commands and measured identities above retain old names.

Independent `/root/slice3_refactor` removed the unconsumed heldOnceFault and
relocated byte-identical publishedPolicy into productionQualificationFixture.ts,
repointing the two existing fixture consumers. Typecheck, strict discovery
(17 selected, listed only), whitespace and file-size checks passed. Runtime
boundaries, fixture values and assertions stayed unchanged; the accepted triple,
controls and neighbors remain applicable. Its targeted trace disposed all 14
consumers in `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/seed303-refactor-s0_et434/consumer-dispositions.md`.
