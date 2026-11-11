# SEED-311 source-only review

The fresh reviewer `watcher_source_review` received only the original
SEED-311 scope, goal, examples and exclusions, and Terry's amendments in
this conversation. The launch used no inherited context. The reviewer
was instructed to read no files and change nothing.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | Make local feedback faster for dashboard maintainers exercising production watcher deployment and recovery. | slice 3 | observed: The plan records whole-command one-worker baseline and replacement wall times, including all fixture work. |
| C02 | Reduce repeated test staging code. | slice 3 | observed: Recovery shares a single tiny real watcher across consecutive build and preview failures and same-commit retry. The full app no longer stages for port refusal. |
| C03 | Reduce repeated test support code. | slice 3 | observed: The actual watcher and lower-boundary preview test call the same productionPreviewLifecycle owner. One filesystem event helper waits for signal cleanup. |
| C04 | Preserve ordinary CI test selection. | target CI |  |
| C05 | Preserve equivalent behavioral protection in ordinary CI. | slice 3 | observed: Ordinary dashboard selectors retain recovery, Git selection, startup and update; the backend runtime selector adds the genuine preview lifecycle and occupied-port checks. See the mapped observations and actual target CI gate. |
| C06 | Cover actual candidate build failure. | slice 1 | observed: production-watcher-failures.spec.ts real build failure and keeping the last working preview assertions |
| C07 | Cover retry of the candidate after build failure. | slice 1 | observed: production-watcher-failures.spec.ts same commit retry build and serving assertions |
| C08 | Cover actual preview start failure. | slice 3 | observed: The minimal watcher reports the candidate and exact real preview-process error while the working commit remains available. |
| C09 | Cover restoration after preview start failure. | slice 3 | observed: A live watcher restores the working title at the same URL with a replacement PID after a genuine preview-start failure. |
| C10 | Cover retry of the candidate after preview start failure. | slice 3 | observed: The real watcher tries the same candidate through its genuine build and preview faults before serving it, with candidate identity and preparation count asserted. |
| C11 | Cover an unavailable origin. | slice 1 | observed: production-watcher-failures.spec.ts real origin rename and reported failed Git read |
| C12 | Cover resumption after origin becomes available. | slice 1 | observed: production-watcher-failures.spec.ts restored real origin and subsequent successful trace read |
| C13 | Cover the unchanged case. | slice 2 | observed: production-watcher-updates.spec.ts unchanged published main, unchanged PID, build count and shared record |
| C14 | Cover the excluded case. | slice 2 | observed: productionUpdatePolicies.ts both excluded-only and published-versus-dirty policy cases, no extra work |
| C15 | Cover rejection under published policy. | slice 2 | observed: productionUpdatePolicies.ts repeated published policy rejection, last served title and no staging |
| C16 | Cover recovery after published policy rejection. | slice 2 | observed: productionUpdateJourney.ts repairs policy and stages its accepted replacement before SIGTERM |
| C17 | Cover selected-commit pinning. | slice 2 | observed: productionHeldUpdate.ts B checkout during hold, publishes C then B serves exact title and URL |
| C18 | Cover native-start drain before the selected revision activates. | slice 2 | observed: productionHeldUpdate.ts uses actual Codex resolved through a private developer-shell bin, actual store lock, persisted pending attempt and real admission closure/503, and a durable successful native outcome at drain response. |
| C19 | Cover preservation of shared records. | slice 2 | observed: production-watcher-updates.spec.ts shared record served in both environments and bytes through replacement and shutdown |
| C20 | Cover preservation of shared configuration. | slice 2 | observed: productionUpdateJourney.ts checks machine configuration bytes and inode after shutdown |
| C21 | Cover signals. | slice 2 | observed: Full watcher restart and real SIGINT, update journey SIGTERM, and minimal recovery SIGHUP prove process ownership. Both terminal-signal checks observe checkout retirement through real filesystem and command-close events. |
| C22 | Cover fatal restoration. | slice 3 | observed: The lower real owner check asserts both commit IDs, both real preview error causes, no live preview and a closed URL. Fatal watcher cleanup stays proved through real preview loss. |
| C23 | Cover preview loss. | slice 3 | observed: Killing the restarted preview produces a nonzero watcher exit, exact failure signal and cleared deployment root, while independent development still serves. |
| C24 | Cover cleanup. | slice 2 | observed: productionUpdateJourney.ts build and preview ended, absent URL and checkouts, independent development alive |
| C25 | Keep the delivered production update-selection owner. | slice 2 | observed: productionUpdates.mjs remains the actual CLI update-selection owner |
| C26 | Keep the three Git cases. | slice 2 | observed: production-update-selection.spec.ts 3/3 in the direct native update gate |
| C27 | Replace remaining polling with events. | slice 2 | observed: watcherEvents.ts output and file subscriptions, productionBuildGate.ts real release event, launchAdmissionObservation.ts HTTP/diagnostic events, productionWatcherClient.ts actual terminal events |
| C28 | Measure the speedup with the same behavioral coverage. | slice 3 | observed: Matched ordinary selector and mapped coverage passed 31/31 in 138.77 s on base and 29/29 in 82.43 and 83.90 s after repair (39.5–40.6% faster). |
| C29 | Proceed with SEED-311 and update its story. | slice 1 | observed: origin/main preparation commit 04ec5b24c |
| C30 | Update its plan. | slice 1 | observed: origin/main preparation commit 04ec5b24c |
| C31 | Land everything. | landing |  |
| Q01 | Include every retained or replacement check in one ordinary one-worker measurement. | slice 3 | observed: Exact whole-family selector in plan includes every retained case and the new ordinary backend preview case at one worker. |
| Q02 | Include all preparation in that measurement. | slice 3 | observed: Whole npm command wall times include fixture, native acquisition, Git, install, build and browser preparation. |
| Q03 | Include all teardown in that measurement. | slice 3 | observed: Whole npm command wall times include teardown of processes, native state, isolated deployments and runner reporting. |
| Q04 | Retain real Git where it distinguishes a regression. | slice 1 | observed: productionWatcherFixture.ts bare origin, Git publication and real deployment checkout; focused 11/11 |
| Q05 | Retain real builds where they distinguish a regression. | slice 1 | observed: productionWatcherFixture.ts real Vite builds from staged source and failure and retry assertions |
| Q06 | Retain real processes where they distinguish a regression. | slice 3 | observed: Ordinary checks retain actual Git, npm, Vite, Codex, Cursor runner and PTY processes where the behavior crosses those boundaries. |
| Q07 | Retain real serving where it distinguishes a regression. | slice 3 | observed: The lower lifecycle check uses an actual loopback preview and verifies connection refusal after double failure. Full replacement and independent development also use real serving. |
| Q08 | Arrange test data with shared MakeMe. | slice 1 | observed: productionWatcherFixture.ts MakeMe repository revision builder |
| Q09 | Use the smallest dataset that reveals intent and provides proof. | slice 1 | observed: productionWatcherFixture.ts one HTML title, minimal package/lock and actual workflow policy |
| Q10 | Focus checks on Open Dough’s own business logic. | slice 3 | observed: The detailed cases assert Open Dough ownership, selected commit, recovery, process state, URL and bytes; dependencies supply the genuine boundary inputs. |
| Q11 | Find ways to accelerate test execution. | slice 3 | observed: One-page Vite inputs, lower preview owner, shared retry journey and event gates reduce repeated staging, support code and latency. The plan records the measured comparison. |
| Q12 | Wait for observable events. | slice 2 | observed: build, watcher, admission, durable result and terminal observations are event driven in the 31/31 and 18/18 gates |
| Q13 | Optimize for those events to occur promptly. | slice 2 | observed: direct file/output subscription wakes on the write, closes after match, with no test polling interval |
| Q14 | Retain a few full-scale end-to-end checks. | slice 3 | observed: Retained ordinary full dashboard startup, replacement, native drain and Cursor runner journeys exercise the browser and actual command. |
| Q15 | Use cheaper lower-level checks for detailed coverage. | slice 3 | observed: Dual startup failure uses the real preview owner and two tiny builds. Actual occupied-port refusal uses the minimal watcher and actual sockets. |
| Q16 | Give the last priority less weight than the others, then combine. The supplied amendment leaves that priority unnamed. | slice 3 | observed: Minimum inputs, no mocks and events were established first; detailed coverage moved only after the cheaper real proof and wrong-restoration control. |
| J01 | A candidate fails its build, the last working revision keeps serving, and the same candidate stays retryable. | slice 1 | observed: production-watcher-failures.spec.ts failure preserves serving A then the same B activates |
| J02 | A candidate fails to start its preview, the last working revision is restored, and the same candidate stays retryable. | slice 3 | observed: The minimal watcher restores its previous title and URL on candidate preview failure, then the same candidate serves after the fault clears. |
| J03 | Main advances while the selected revision’s build is held. The selected revision activates only after accepted starts drain, with shared records and configuration preserved. | slice 2 | observed: productionHeldUpdate.ts held actual selected build, later C, successful native drain, same URL, shared state |
| J04 | Shutdown stops owned processes and removes deployments while preserving development and shared state. | slice 2 | observed: productionUpdateJourney.ts actual SIGTERM while staging and preserved development/store/configuration |
| J05 | Fatal preview loss stops owned processes and removes deployments while preserving development and shared state. | slice 3 | observed: The actual watcher exits and removes its deploys on preview loss; one independent real development listener keeps serving and shared launch/config bytes stay intact. |
| X01 | Standalone pinned-deployment proof remains in SEED-303. | slice 1 | observed: production-deployment.spec.ts standalone pin and distribution proof retained; direct 12/12 neighbor gate |
| X02 | Archived experiments serve as evidence only and stay outside maintained selection. | slice 3 | observed: The archived SEED-303 experiments remain archived; the maintained replacement lives in ordinary dashboard test projects. |
| X03 | Exclude checks of dependencies’ own behavior. | slice 3 | observed: Real dependencies produce failures, events and HTTP serving; assertions target the watcher, launch admission, retry, preservation and cleanup decisions. |
| X04 | Use no mocks. | slice 3 | observed: Retained and replacement cases use real processes, Git, sockets, files, native launch admission and plain MakeMe records. No mocked native or provider responses in this selection. |
| X05 | Use no fixed wall-clock waits or sleeps. | slice 2 | observed: watcher test and support scopes await filesystem, output, HTTP, process and terminal events |
| X06 | Use no test retries. | slice 1 | observed: ordinary Playwright strict proof with no retries |
| X07 | Use no test skips. | slice 1 | observed: focused 11/11 executed and passed |
| X08 | Use no timeout inflation. | slice 1 | observed: default timeout for all recovery and refusal cases |
| X09 | Use no special runner modes. | slice 1 | observed: ordinary one-worker Playwright selection with setup and cleanup paid |
