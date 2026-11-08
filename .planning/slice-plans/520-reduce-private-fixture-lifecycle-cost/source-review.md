# Source review

Launch: fresh general-purpose reviewer (agent 8f739a08-1070-4e00-b8e0-de080a146093), source text only — Goal, Scope, key examples, and Evaluation from SEED-262#reduce-private-fixture-lifecycle-cost. No plan, product, or proof inputs.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer running the dashboard attention journeys or authenticated-read refusal checks gets faster feedback from cheaper private server setup and teardown. | slice 2 |  |
| 2 | That faster feedback keeps the same browser, HTTP, and native observation proof. | slice 2 |  |
| 3 | Keep the built preview and a private browser context for attention. | slice 2 |  |
| 4 | Keep the real HTTP boundary for authenticated-read refusals and accepted reads. | slice 1 | observed: authenticated-read-refusal.spec.ts: stand-in boundary; refusal status/ghCalls + accepted read through gh (26-case strict proof /tmp/seed262-s1-F37XUF/refusal-standin.json) |
| 5.1 | Preserve the existing published assertions, including failure and recovery, for: Board | slice 2 |  |
| 5.2 | Preserve the existing published assertions, including failure and recovery, for: Claude listing | slice 2 |  |
| 5.3 | Preserve the existing published assertions, including failure and recovery, for: attention | slice 2 |  |
| 5.4 | Preserve the existing published assertions, including failure and recovery, for: Mark as done | slice 2 |  |
| 6 | Use a lighter private Cursor runner fixture in the selected checks, where Cursor operations are outside the proof. | slice 2 |  |
| 7 | An unexpected Cursor operation must fail the fixture with its cause (qualification: allowing it to settle on the substitute could make a Cursor-dependent case pass without real coverage). | slice 1 | observed: private-http-stand-in-runner.spec.ts: unexpected POST /keep fails after cleanup with Unexpected Cursor protocol…; HOME/address gone |
| 8.1 | Keep the real runner for checks of: startup | slice 1 | observed: runtime/serving-modes.spec.ts + boundary-server.spec.ts: real runnerMain still observed (real-owners proof) |
| 8.2 | Keep the real runner for checks of: use | slice 1 | observed: serving-modes/boundary-server real runner use retained (real-owners proof) |
| 8.3 | Keep the real runner for checks of: survival | slice 1 | observed: agent-launch-story-card-session-states.spec.ts: same-machine restart retains runner (real-owners proof) |
| 8.4 | Keep the real runner for checks of: restart | slice 1 | observed: agent-launch-story-card-session-states.spec.ts restart route (real-owners proof) |
| 8.5 | Keep the real runner for checks of: cleanup | slice 1 | observed: observation/run-processes.spec.ts: normal/abandoned/orphan cleanup (real-owners proof) |
| 9 | Keep real preview and same-machine restart where those paths are part of what the test proves. | slice 2 |  |
| 10.1 | Concurrent cases and runs keep their own: mutable state | slice 1 | observed: private-http-stand-in-runner overlapping fixtures: distinct homes/mutable state |
| 10.2 | Concurrent cases and runs keep their own: GitHub answers | slice 1 | observed: overlapping fixtures: distinct github.serve revisions for same repository |
| 10.3 | Concurrent cases and runs keep their own: request owners | slice 1 | observed: overlapping fixtures: private request owners per server; second read after first close |
| 10.4 | Concurrent cases and runs keep their own: native fixture resources | slice 1 | observed: overlapping + failure cases: native stand-in address/listener/HOME retired per owner |
| 11 | Cleanup retires only what the fixture owns, including after startup or test failure. | slice 1 | observed: failure + unexpected cleanup retire HOME/address; startOnOwnAddress catch still closeOwned() with stand-in release |
| 12.1 | Outside this increment: Git fixture construction |  | G1 |
| 12.2 | Outside this increment: run-wide build and artifact production |  | G2 |
| 12.3 | Outside this increment: workflow prerequisite arrangement |  | G3 |
| 12.4 | Outside this increment: polling cadence |  | G4 |
| 12.5 | Outside this increment: suite-wide fixture migration |  | G5 |
| 13.1 | Given each attention case’s published work and private Claude state, when the browser opens the built preview and the case acts on its sessions, it observes: the same counts | slice 2 |  |
| 13.2 | Given each attention case’s published work and private Claude state, when the browser opens the built preview and the case acts on its sessions, it observes: listing loss and recovery | slice 2 |  |
| 13.3 | Given each attention case’s published work and private Claude state, when the browser opens the built preview and the case acts on its sessions, it observes: project isolation | slice 2 |  |
| 13.4 | Given each attention case’s published work and private Claude state, when the browser opens the built preview and the case acts on its sessions, it observes: Mark as done | slice 2 |  |
| 14 | In that attention journey, the unused Cursor process is absent. | slice 2 |  |
| 15 | Given the authenticated-read refusal spec’s private server and fake GitHub, refused inputs still stop before launching `gh`. | slice 1 | observed: authenticated-read-refusal: refuses before gh (ghCalls length unchanged) |
| 16 | An accepted read still goes through `gh`. | slice 1 | observed: authenticated-read-refusal: accepted Sec-Fetch-Site/read goes through gh |
| 17 | A second live fixture can answer differently for the same repository. | slice 1 | observed: private-http-stand-in-runner: two fixtures different revisions same repository |
| 18 | Closing the first retires its private resources and leaves the second able to answer. | slice 1 | observed: private-http-stand-in-runner: close first retires first HOME; second still 200 |
| 19.1 | Given a check that asserts real runner startup or a real preview restart, the unchanged serving-mode and restart routes still show: the real runner at the relevant boundary. | slice 1 | observed: serving-modes + boundary-server + session-states: real runner at relevant boundary (real-owners proof) |
| 19.2 | Given a check that asserts real runner startup or a real preview restart, the unchanged serving-mode and restart routes still show: the same machine state at the relevant boundary. | slice 2 |  |
| 20 | Compare the same named selection on the same runner profile before and after the fixture change. | slice 2 |  |
| 21.1 | Record: server setup and teardown | slice 2 |  |
| 21.2 | Record: counts and duration of executed cases | slice 2 |  |
| 21.3 | Record: total elapsed time | slice 2 |  |
| 22.1 | Keep the change when repeated comparable runs show: lower lifecycle cost | slice 2 |  |
| 22.2 | Keep the change when repeated comparable runs show: a worthwhile end-to-end gain | slice 2 |  |
| 22.3 | Keep the change when repeated comparable runs show: with the same proof | slice 2 |  |
| 22.4 | Keep the change when repeated comparable runs show: and reliable cleanup | slice 2 |  |
| 23 | The measured phase includes any replacement fixture work. | slice 2 |  |
