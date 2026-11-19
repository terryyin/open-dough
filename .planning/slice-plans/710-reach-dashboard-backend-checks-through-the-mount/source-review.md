# Source-only review of the delivered outcome

Fresh source-only subagent `split_source_review` received the user-authorized
narrowed goal, scope and deferral. It returned the commitments below. The
reported deferred default, full-suite proof, timing proof and documentation
(27–30) map to SEED-408. Observations refer to the separately recorded proof
in this plan and the corresponding specs.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| R01 | An explicit mount request in boundary mode installs the dashboard’s local boundaries on the Dashboard Backend Test worker’s HTTP server. | slice 2 | observed: Mounted runtime receives HTTP without a boundary server child. |
| R02 | The mounted boundary set excludes the incident record. | slice 2 | observed: Mounted runtime incident-only route returns 404. |
| R03 | The mount uses the named project environment. | slice 2 | observed: Java development and production project-list cases pass; project-configuration-mount-lifetime.spec.ts observes distinct lists. |
| R04 | The mount uses the named machine directory. | slice 2 | observed: Mounted runtime locates the stand-in under the caller’s supplied machine HOME. |
| R05 | The mount uses a Cursor runner stand-in. | slice 2 | observed: Mounted runtime expects the worker-owned address and finds no native runner at that HOME. |
| R06 | The mount uses the fixture’s fake GitHub controls. | slice 2 | observed: Java intent reads use the arranged fake repository and inspect its calls. |
| R07 | The mount uses the fixture’s fake host controls. | slice 2 | observed: Claude acceptance controls the fake host and checks native arguments and working directory. |
| R08 | The mount uses the fixture’s fake time controls. | slice 2 | observed: Mounted runtime ends a held launch using endLaunchWait and observes the timed-out response. |
| R09 | The mount holds the worker environment until close. | slice 2 | observed: Mounted runtime observes HOME, PATH and the supplied setting during the mount. |
| R10 | Closing the mount restores the previous worker environment. | slice 2 | observed: Mounted runtime observes restored worker environment and a child reading the original HOME; deliberately omitting restoration reproduced failure. |
| R11 | Closing the mount withdraws the stand-in address. | slice 2 | observed: The mounted runtime case observes address absence after close. |
| R12 | Closing the mount releases the project configuration so a later mount can choose the other environment. | slice 1 | observed: Project list reads in development then production prove configuration release; omitting it reproduced the error. |
| R13 | A second mounted start is refused while a mount is active. | slice 2 | observed: Mounted runtime observes refusal naming liveServer while the first start is pending, plus next-start recovery after failed bind. |
| R14 | A mounted start names the live option when a case requests a process-only PID. | slice 2 | observed: Mounted runtime observes the PID access refusal naming liveServer. |
| R15 | A mounted start names the live option when a case requests process-only output. | slice 2 | observed: Mounted runtime observes the output access refusal naming liveServer. |
| R16 | Existing cases can explicitly request the live server and state why when they have Cursor, separate-process, connection, server-program, or other demonstrated fixture requirements. | slice 6 | observed: Slices 3–6 record Cursor starts, mixed launch pairs, original process/preload/connection/program proof and focused held-case reasons under a guarded scratch default. |
| R17 | Live remains the default for Dashboard Backend Tests. | slice 6 | observed: startDashboardServer selects mounted only for an explicit mount request; focused live-default proof passed in slice 6. |
| R18 | Dev keeps its existing entry. | slice 2 | observed: runtime/serving-modes.spec.ts exercises actual dev page, local HTTP and HMR. |
| R19 | Preview keeps its existing entry. | slice 2 | observed: runtime/serving-modes.spec.ts exercises preview HTTP and built assets. |
| R20 | The frontend group keeps its existing entry. | slice 6 | observed: DashboardServer default remains live and no frontend fixture opts into the mount; frontend spec paths are unchanged. |
| R21 | The E2E group keeps its existing entry. | slice 6 | observed: DashboardServer default remains live and no E2E fixture opts into the mount; E2E spec paths are unchanged. |
| R22 | The Java intent read retains its existing behavior for the HTTP answers, kept files, and host calls covered by the case. | slice 2 | observed: Java spec observes unchanged listing, file body, 404 and 400, with no contents fetch for excluded paths. |
| R23 | The production project-list case retains its existing behavior for the HTTP answers, kept files, and host calls covered by the case. | slice 2 | observed: Project-list spec observes seeded IDs, no-store, 403 and 405 over mounted HTTP. |
| R24 | The synthetic Claude launch acceptance case retains its existing behavior for the HTTP answers, kept files, and host calls covered by the case. | slice 2 | observed: Claude acceptance observes the original HTTP response, kept record and exact synthetic host calls. |
| R25 | Existing product assertions are preserved. | slice 6 | observed: The retained results at slices 1–6 and Take-to-candidate comparison preserve original assertions, including the refactored equivalent retained-window expected order. |
| R26 | Existing test layers are preserved. | slice 6 | observed: Source review shows no test moved below its entry or across backend, E2E or frontend locations. |
