# Loaded gate diagnosis — returned slice 2 gaps

No maintained source was edited during this diagnosis. The one bounded diagnostic replay is terminal; no live commands remain. The original failed run remains failed, and neither G1 nor G2 is disposed by this replay.

## Original required run

Coordinator `/tmp/seed332-loaded/proof-24289.json`: 33 selected, first repetition strict failed; natural load40.10 before to30.18 after, default30s cases, two workers, AC guard, no burners. Repetitions2/3 were withheld without test execution. Sleep logs exclude sleep in the failed window. Host top snapshots show roughly50% aggregate idle; a load number alone does not establish CPU-bound contention.

Failure trace directory: `dashboard/test-results/2026-11-13T03-15-26.944Z-25999`.

- `start-origin-isolation.spec.ts:140`: first live-source preparation/clone assertion at+6.979s; changed-source assertion at+13.853s; initial installation still first source at+13.862s; fresh default-source origin verified at+23.294s. The final real installed execution-start claim finishes at+30.064s, after test timeout begins at+30.009s. Three preparation/clone phases do no GitHub reads; this is filesystem/materialization/Git/Node startup cost. Assertion and source semantics are intact.
- `intent-done-default-answer-selection.spec.ts:42`: first navigation begins about+24.3s relative to trace's before-hook origin (which includes worker/beforeAll/setup, so not a precise case-body stopwatch). It reaches the second default comparison and the final file/diff selection near its case deadline. Authenticated request durations in the retained failed network trace are mostly0.2–1.1s; review requests about2.5s. Final diff cannot render before deadline. There is no demonstrated wrong selected default, changed expected answer or missing published content.

## One bounded cause experiment

Question: do these installed-origin hot journeys still spawn a native fake API per read because fast preload is lost, or does cost lie in their real fixture/workflow Git operations?

Command:

`NODE_OPTIONS="${NODE_OPTIONS:+$NODE_OPTIONS }--import=/tmp/seed332-process-diag.mjs" SEED332_DIAG_LOG=/tmp/seed332-process-diag.jsonl OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed332-process-diag-proof.json caffeinate -s -i npm run test:dashboard -- backend-tests/launches/start-origin-isolation.spec.ts tests/intent/intent-done-default-answer-selection.spec.ts --grep 'successive preparations|selecting another Done story' --workers=2`

Tool session72545 reached terminal exit0. Record strict passed2 cases, run38.524s; source case24.226s, Done case20.275s. Actual host before: natural load12.59/22.58/28.89,44% memory free; inherited AC guard. This is a quieter diagnostic context, not the required load acceptance. No retry loop was used.

The /tmp preload records real `ChildProcess.spawn`, sync child calls, recursive `cpSync` duration and process identity. It adds itself explicitly beside the fake owner's import solely to observe owner OS spawning despite production deleting NODE_OPTIONS. It never changes answers or budgets. File/copy and Git timings are component measurements; parallel calls and parent/child intervals mean they are not all additive wall time.

Decisive observations:

- Zero OS `gh api` executions across all observed subprocess/sync call records. Native `gh auth token` remains. The browser received actual server responses, whose fake answerer is `publishCommittedOrigin` behind `githubFor(page)`, not a substituted page answer.
- Server, runner, fake host and server-launched installed execution-start49842 carry FAKE_GH_TRANSPORT=in-process and fast NODE_OPTIONS. The direct source-isolation execution-start53242 has no fake-GitHub environment and makes no GitHub call; manual fixture completion/publication children similarly perform real Git work rather than API transport. Actual owner spawn args include explicit `--import file://.../dashboard/tests/support/fakeGhPreload.mjs`; its environment intentionally no longer contains NODE_OPTIONS. Real private ownerPID49670 performs no native API call. Therefore no missed fast API propagation was found.
- Source-case worker29682:58 async Git calls,13.561s cumulative child durations;11 copies,4.106s. Long operations include `git add --all`2.16s/2.42s and copying full repository templates1.38s/0.98s. Its installed native start process53242 executes73 async Git calls,2.151s cumulative, plus small sync calls.
- Done fixture worker29675:16 async Git calls,1.958s;73 sync Git operations,3.333s. Its actual dashboard server47060 performs180 async Git calls,3.411s, including12 git-log/full-history,12 rev-list,10 cat-file batch-check and10 cat-file batch calls. Installed execution-start49842 executes74 async Git calls,3.394s. History-preserving integration58578 executes23 Git calls,1.168s. Its body constructs actual claims, commits, capture publication and second completion before UI assertions.

## Inspected propagation and cost owners

`fakeGhEnv` and `dashboardServerEnvironment` compose fast selection/preload and caller probes. `developerShellEnvironment` removes npm startup additions but preserves NODE_OPTIONS and FAKE_GH fields. `github-request-owner-start.mjs` deletes NODE_OPTIONS as before; test-only fakeGhPreload re-adds only the explicit owner import. Instrumentation confirms this actual path, rather than inferring it from flags.

`startOriginPreparation.withInstallation` reads current skill bytes on every call. `prepareStartOrigin` calls `materializeRepository`; that builds a template with bare origin+checkout, copies both, resets the copy's remote, then clone--bare--no-local repacks its origin. `startOriginInitialization` copies that packed origin and makes the project clone, then cleans branch/upstream refs. The source-isolation case explicitly tests changed source and fresh default source with no persistent cache, so moving its private work outside the case or warming caches is invalid.

`claimedLaunchWithStoryCommit`/`publishCompletedStory` deliberately exercise real installed claim/completion/publication and Git history. `publishCommittedOrigin` answers from actual Git: commitOf/showAt/listedAt/filesUnder, plus history/comparison helpers. These real Git operations remain after eliminating fake-gh transport processes. No duplicate repair owner was established; coordinator inspected SEED334 separately and retained that boundary.

## Smallest correction proposal and scope boundary

For G1 only, existing `materializeLocalCheckout(undefined, description, {at:<private directory>, gitTemplates:true})` can build the exact current installation once in its own checkout, followed by one independent `git clone --bare --no-local` into the preparation output. That removes redundant temporary bare-origin setup/push, entire template-copy and remote reset while preserving current-source bytes, actual Git history, packed independent origin, no hardlinks/alternates, no persistent cache and every existing observation. It is a bounded preparation-owner change, not a transport fix. `startOriginPreparation.ts` is248 lines; splitting current-source installation assembly into a cohesive module may be needed if edited. The current262-line source-isolation spec must not be edited without an explicit reorganization decision.

G2 has no comparably established single transport correction. Memoizing/batching immutable Git answers or replacing native preparation with declared starting history may reduce cost, but those require separate proof of mutable-follow/history semantics or may remove a journey. They were not implemented or assumed authorized. Increasing timeouts, weaker/removed observations, moving private work outside the budget and a general runner redesign remain forbidden.

As coordinator directed, stop before optimizing unrelated materialization/Git simply to make deadlines. Resolve whether the narrowly described preparation/answerer cost work fits or needs a human scope decision; the original loaded promises remain open. The passing quieter replay supplies cause evidence only.
