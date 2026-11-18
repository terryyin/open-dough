# Source-only review

Fresh general-purpose agent `/root/source_review`, launched with no inherited
context. The launch message supplied the selected SEED-403 goal, scope, key
examples, deferrals, and architecture clauses and instructed the reviewer to
use only that text and read no project files. The commitments below retain
its numbered return. The coordinator allocated observations to the plan.

The beneficiary is the developer changing a dashboard server rule or waiting
for Dashboard Backend Test. Local wall time counts as evidence only if both
entries alternate in one sitting.

The seed explains the process constraints behind these promises. The test
process acts as the machine while mounted, and the server reads the process
environment at request time. A child command run by the case inherits that
environment unless the case supplies one. Held documents, locks, and caches
are keyed by paths under the machine directory. Stopping the Cursor runner
signals the process named by its address, which would be the test worker for
a stand-in. The incident lifecycle takes the live process’s termination signal.

The seed defers returning outside-kind exceptions to the mount, moving a
preview-mode case whose fact is independent of preview, and mounting a single
boundary for a case that only needs that boundary.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P01 | A Dashboard Backend Test boundary-mode case reaches the mount through the start it already calls, with no rewrite to that entry. The test process owns the mounted HTTP server. | slice 7 | |
| P02 | A mounted start exposes every local boundary except the incident record lifecycle. That lifecycle remains a live-process proof. | slice 2 | observed: mountedDashboardServer.ts installs the production list except dough-incident-record. mounted-boundary-server.spec.ts observes the incident-only route returning 404 and the terminal upgrade handler answering. |
| P03 | The mount runs in the project environment the case names. | slice 2 | observed: project-configuration-mount-lifetime.spec.ts reads distinct development and production lists through the expanded mount. The Java and project-list examples use those environments through startDashboardServer. |
| P04 | The mount uses the machine directory the case names. | slice 2 | observed: mounted-boundary-server.spec.ts locates the stand-in under the HOME of the caller-supplied machine and observes that address withdrawn on close. |
| P05 | The mounted case retains the fake GitHub and access to its recorded calls. | slice 2 | observed: authenticated-read-intent-java.spec.ts serves the Java catalog through its fake GitHub and uses the captured call log to exclude forbidden contents fetches. |
| P06 | The mounted case retains its synthetic host controls. | slice 2 | observed: agent-launch-boundary.spec.ts uses the same fixture Claude controls and observes the synthetic host arguments and cwd. |
| P07 | The mounted case retains its time controls. | slice 2 | observed: mounted-boundary-server.spec.ts ends a held Claude launch through endLaunchWait and observes the boundary's timed-out response. |
| P08 | The mounted start uses the Cursor runner stand-in. In the Java intent example, no Cursor runner starts. | slice 2 | observed: mounted-boundary-server.spec.ts observes the stand-in address belongs to the test worker and finds no native runner for that HOME. The Java case takes the same mount route. |
| P09 | A request that reaches the Cursor runner while mounted fails and identifies the unexpected Cursor request. | slice 2 | observed: mounted-boundary-server.spec.ts sends POST /keep to the stand-in and observes the method and path in the cleanup failure, after address retirement. |
| P10 | A case explicitly asks for the live server when its proof needs a separate process, a live connection, or the server program. Examples include an empty process, a second server beside a mount, a server left running or killed, and the process-owned incident record. | slice 5 | |
| P11 | The explicit live-server request names which of the three proof kinds applies. | slice 5 | |
| P12 | A case that fails on the mount for a reason outside those three kinds can explicitly ask for the live server and keep its proof. | slice 6 | |
| P13 | An outside-kind request names its reason. The known examples are the case’s child command inheriting the mount environment and a time setting that the server reads once per process. | slice 6 | |
| P14 | A case that hands a start to the Cursor host asks for the live server with the real runner as a separate-process proof. The Cursor work remains observable with the same outcome. | slice 3 | |
| P15 | A dev start retains its current behavior. | slice 7 | |
| P16 | A preview start retains its current behavior. | slice 7 | |
| P17 | An E2E Test boundary-mode start retains its current behavior. Only Dashboard Backend Test mounts. | slice 7 | |
| P18 | A Dashboard Frontend Test boundary-mode start retains its current behavior. Only Dashboard Backend Test mounts. | slice 7 | |
| P19 | A browser workflow stays in E2E Test. | slice 7 | |
| P20 | A presentation case stays in Dashboard Frontend Test. | slice 7 | |
| P21 | A lower function stays the entry where the rule already permits it. This story introduces no move from a boundary to a lower entry. | slice 7 | |
| P22 | The README entry rule tells a case how to ask for the live server. | slice 8 | |
| P23 | A running server keeps one project environment for its lifetime and refuses a second one. A mount holds its chosen environment until close. | slice 1 | observed: project-configuration-mount-lifetime.spec.ts, a running development mount refuses a second project environment. Live initialization remains process-bound in projectConfiguration.ts; runtime/serving-modes.spec.ts exercised live dev and preview. |
| P24 | The next mount chooses its environment again. In the project-list example, the same worker can mount production after previously mounting development. | slice 1 | observed: project-configuration-mount-lifetime.spec.ts, a production mount reads the seeded projects after the development mount closes. Temporarily omitting the release reproduced the rejection. |
| P25 | A mount sets `HOME`, `PATH`, and the server settings in the test process for the mount’s lifetime. | slice 2 | observed: mounted-boundary-server.spec.ts observes fixture HOME, synthetic host PATH, and extra setting on the worker while the server is mounted. |
| P26 | Closing the mount restores the process environment it changed. | slice 2 | observed: mounted-boundary-server.spec.ts observes original HOME in a child started after close, and restored PATH and extra setting on the worker. The same observation detects omitted restoration. |
| P27 | A test process permits only one mounted server at a time. | slice 2 | observed: mounted-boundary-server.spec.ts refuses a second start while the first is pending and names liveServer. A separate failed port bind also frees the slot for the next start. |
| P28 | Server module state can outlive a mount. | slice 2 | observed: mountedDashboardServer.ts uses the normal cached module loader; close retires boundary instances, HTTP, and the project lease. Sequential scopes are exercised by project-configuration-mount-lifetime.spec.ts and the runtime failed-bind recovery. |
| P29 | A new machine directory starts with clean held-document, lock, and cache state even when server modules persist. | slice 7 | |
| P30 | The incident record of a killed live server remains observable and ends at process exit. | slice 5 | |
| P31 | A live server can run beside a mounted server on the same machine. | slice 4 | |
| P32 | The mounted Java intent read returns the same listing of admitted `.java` files for the location. | slice 2 | observed: authenticated-read-intent-java.spec.ts compares the request's Java listing and selector results with the existing expected file lists. |
| P33 | The admitted Java file returns the same text. | slice 2 | observed: authenticated-read-intent-java.spec.ts reads admitted Java file text through the mounted HTTP boundary. |
| P34 | The refused Java path still returns `404`. | slice 2 | observed: authenticated-read-intent-java.spec.ts observes 404 for each refused path. |
| P35 | The Java `..` path still returns `400`. | slice 2 | observed: authenticated-read-intent-java.spec.ts observes 400 for the path containing '..'. |
| P36 | The refused Java path still causes no contents fetch. | slice 2 | observed: authenticated-read-intent-java.spec.ts observes no forbidden contents fetches in the fake GitHub log. |
| P37 | The mounted Java intent case starts no server process. | slice 2 | observed: The Java cases use the same explicit mount proven by mounted-boundary-server.spec.ts, which serves HTTP and observes no boundaryServer child of the worker. |
| P38 | The production mount returns the seeded project IDs after the worker’s earlier development mount. | slice 1 | observed: project-configuration-mount-lifetime.spec.ts asserts the production project-list HTTP response IDs after the development mount closes in the same worker. |
| P39 | The production project list still returns `403` for a foreign origin. | slice 2 | observed: project-configuration-boundary.spec.ts observes 403 from the mounted project list for a foreign origin. |
| P40 | The production project list still returns `405` for `POST`. | slice 2 | observed: project-configuration-boundary.spec.ts observes POST 405 from its mounted list. |
| P41 | The production project list still returns `Cache-Control: no-store`. | slice 2 | observed: project-configuration-boundary.spec.ts checks the mounted successful GET's Cache-Control header. |
| P42 | The mounted launch of the synthetic `claude` returns the same answer. | slice 2 | observed: agent-launch-boundary.spec.ts observes the mounted Claude launch's original status, response shape, and kept session identity. |
| P43 | The mounted launch writes the same launch record under the case’s machine directory. | slice 2 | observed: agent-launch-boundary.spec.ts reads the kept record back through machine sessions and compares it to the launch answer. The product record store writes under the mounted fixture's HOME. |
| P44 | The mounted launch makes the same calls to the synthetic host. | slice 2 | observed: agent-launch-boundary.spec.ts compares the synthetic Claude call arguments and cwd with the original expectations. |
| P45 | The live proof can still observe the server PID. | slice 5 | |
| P46 | The live proof can still observe a preload. | slice 5 | |
| P47 | The live proof can still observe that the restart uses a new process. | slice 5 | |
| P48 | The live proof can still observe a server left running. | slice 5 | |
| P49 | With both servers on the same machine, the mounted server’s launch answer is unchanged. | slice 4 | |
| P50 | In that same case, the second server’s live launch answer is unchanged. | slice 4 | |
| P51 | Dashboard Backend Test has the same passing cases. | slice 7 | |
| P52 | The cases’ product assertions stay unchanged. | slice 7 | |
| P53 | At least 800 of the run’s boundary-mode starts mount. | slice 7 | |
| P54 | Summed start and close time for those mounted starts is below one quarter of the baseline time for the same starts. | slice 7 | |
| P55 | The median Dashboard Backend Test step time across the five main CI runs after landing is lower than the median across the five main CI runs before landing. | target CI | |
