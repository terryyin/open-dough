# Source-only review

Reviewer launch: `/root/source_review`, fresh context (`fork_turns: none`), 2026-11-13.
The coordinator supplied only the original selected story Goal, Scope, named
cases and Key examples, with instructions to read no other files and change
nothing. The launch/input and complete numbered return remain in the session.
No human amendment was supplied. The table retains the returned clauses;
allocation is the coordinator’s, not the reviewer’s.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | Maintainers get passing dashboard checks while other work keeps the machine’s CPUs busy. | slice 2 | |
| C02 | An ordinary simulated GitHub API call creates no new process. | slice 2 | |
| C03 | Ordinary simulated API calls answer in an already-running test process. | slice 2 | |
| C04 | The work covers the fake `gh` used by dashboard checks. | slice 2 | |
| C05 | The work covers how a dashboard server under test reaches that fake. | slice 2 | |
| C06 | Preserve the real authenticated read boundary. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: closing the authenticated boundary; dashboard/backend-tests/runtime/fake-gh-in-process-activation.spec.ts: explicitly selected boundary server reaches fast owner; real request arrival, server close and zero unanswered calls |
| C07 | Preserve request-owner admission. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: real owner admits eight calls and queues ninth; marker and releases observe native owner admission |
| C08 | Preserve outstanding-call sharing. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: held shared read survives one departure and ends after last waiter; two actual consumers, marker barrier, released body, zero unanswered and real owner PIDs gone |
| C09 | Preserve rate-limit interpretation. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: real owner interprets status, headers and rate limits; 429 exact body/headers, later request held back without another fake call |
| C10 | Preserve cancellation. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: held shared read survives one departure and ends after last waiter; two actual consumers, marker barrier, released body, zero unanswered and real owner PIDs gone |
| C11 | Preserve shutdown. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: closing the authenticated boundary; dashboard/backend-tests/runtime/fake-gh-in-process-activation.spec.ts: explicitly selected boundary server reaches fast owner; real request arrival, server close and zero unanswered calls |
| C12 | Reuse the existing fake GitHub’s answerers. | slice 1 | observed: dashboard/tests/support/fakeGhTransport.mjs uses existing fakeGitHub.ts HTTP frame and unchanged ghReply.ts conversion; owner/wire specs exercise same answerers; no parallel answer model |
| C13 | Reuse the existing `gh` response conversion. | slice 1 | observed: dashboard/tests/support/fakeGhTransport.mjs uses existing fakeGitHub.ts HTTP frame and unchanged ghReply.ts conversion; owner/wire specs exercise same answerers; no parallel answer model |
| C14 | Preserve exact argv behavior used by current checks. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: exact include-prefixed Unicode header argv; dashboard/backend-tests/runtime/fake-gh-in-process-wire.spec.ts: exact empty/UTF-8 argv; independent expectations |
| C15 | Preserve binary bodies used by current checks. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: real owner receives binary stdout; dashboard/backend-tests/runtime/fake-gh-in-process-wire.spec.ts: independent bytes match native fake-gh-client.spec.ts binary contract |
| C16 | Preserve HTTP status behavior used by current checks. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: real owner interprets status, headers and rate limits; 429 exact body/headers, later request held back without another fake call |
| C17 | Preserve HTTP headers used by current checks. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: real owner interprets status, headers and rate limits; 429 exact body/headers, later request held back without another fake call |
| C18 | Preserve nonzero exits used by current checks. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process-wire.spec.ts: exact UTF-8 stdout/stderr, 403 and exit 7; dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: exact status/header interpretation; native fake-gh-client.spec.ts retains independent matching expectations |
| C19 | Preserve held answers used by current checks. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: held shared read survives one departure and ends after last waiter; two actual consumers, marker barrier, released body, zero unanswered and real owner PIDs gone |
| C20 | Preserve provider actions used by current checks. | slice 2 | |
| C21 | Keep the native CLI path where observation requires actual process creation. | slice 2 | |
| C22 | Keep the native CLI path where observation requires PIDs. | slice 2 | |
| C23 | Keep the native CLI path where observation requires signals. | slice 2 | |
| C24 | Keep the native CLI path where observation requires owner replacement. | slice 2 | |
| C25 | Keep the native CLI path where observation requires orphan cleanup. | slice 2 | |
| C26 | Preserve test isolation between machines. | slice 2 | |
| C27 | Preserve test isolation between request owners. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: isolated installations keep different request-owner roots/PIDs and first/second answers, then first after nested cleanup |
| C28 | Preserve test isolation between simultaneous servers. | slice 2 | |
| C29 | Preserve test isolation between hosted shards. | slice 2 | |
| C30 | Evaluate the named loaded failures locally. | slice 2 | |
| C31 | Evaluate SEED-324’s landed CI repeat checks locally. | slice 2 | |
| C32 | Record natural load. | slice 2 | |
| C33 | Record actual CPU contention. | slice 2 | |
| C34 | Hosted CI retains thirteen shards. | slice 2 | |
| C35 | Hosted CI retains its CPU-derived worker count. | slice 2 | |
| C36 | Hosted CI retains its current deadlines. | slice 2 | |
| C37 | Compare recorded shard times. | slice 2 | |
| C38 | Require the changed suite to pass. | slice 2 | |
| Q01 | The named cases and SEED-324’s landed CI repeat checks must pass with the default 30 s case timeout. | slice 2 | |
| Q02 | That goal applies under CPU-bound contention at a one-minute load of 30–50. | slice 2 | |
| Q03 | Local evaluation uses two workers. | slice 2 | |
| Q04 | Local evaluation keeps default case timeouts. | slice 2 | |
| Q05 | Local evaluation keeps observations unchanged. | slice 2 | |
| Q06 | Starting a private request owner may still use processes. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process-activation.spec.ts: native auth token and real owner process run; dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: actual private owner records; no per-call PID |
| Q07 | Resolving that owner’s login may still use processes. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process-activation.spec.ts: native auth token and real owner process run; dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: actual private owner records; no per-call PID |
| Q08 | Native process observations are independently necessary proof of the production process boundary. | slice 2 | |
| Q09 | Burners provide diagnostic evidence. | slice 2 | |
| Q10 | Burner evidence does not satisfy the natural-load acceptance required by local test resources. | slice 2 | |
| Q11 | No numeric speedup is promised beyond removing per-call process creation and meeting the existing default timeout under the stated load. | slice 2 | |
| N01 | `start-origin-isolation.spec.ts:140`. | slice 2 | |
| N02 | `intent-summary-story-comparison-sort.spec.ts:72`. | slice 2 | |
| N03 | `intent-story-changes-landed-run.spec.ts:75`. | slice 2 | |
| N04 | `intent-done-default-answer-selection.spec.ts:42`. | slice 2 | |
| N05 | `intent-scope-collected-file-timing-gaps`. | slice 2 | |
| N06 | `intent-scope-collected-file-timing-history`. | slice 2 | |
| N07 | `intent-scope-collected-timing-history`. | slice 2 | |
| N08 | `intent-scope-prior-build-states`. | slice 2 | |
| N09 | `intent-scope-prior-build-average`. | slice 2 | |
| N10 | SEED-324’s landed CI repeat checks. | slice 2 | |
| J01 | A Done comparison needs 21 GitHub reads while the machine has natural CPU-bound load of 30–50. | slice 2 | |
| J02 | Opening that comparison completes within its case’s default 30 s budget. | slice 2 | |
| J03 | Refreshing Project Intent completes within its case’s default 30 s budget. | slice 2 | |
| J04 | No simulated API read in that example launches its own subprocess. | slice 2 | |
| J05 | A fake GitHub holds one shared read while two consumers wait. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: held shared read survives one departure and ends after last waiter; two actual consumers, marker barrier, released body, zero unanswered and real owner PIDs gone |
| J06 | One consumer leaves. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: held shared read survives one departure and ends after last waiter; two actual consumers, marker barrier, released body, zero unanswered and real owner PIDs gone |
| J07 | The remaining consumer receives the answer after release. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: held shared read survives one departure and ends after last waiter; two actual consumers, marker barrier, released body, zero unanswered and real owner PIDs gone |
| J08 | When the last waiter leaves, the held transport ends. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: held shared read survives one departure and ends after last waiter; two actual consumers, marker barrier, released body, zero unanswered and real owner PIDs gone |
| J09 | When the server closes, the held transport ends. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: closing the authenticated boundary; dashboard/backend-tests/runtime/fake-gh-in-process-activation.spec.ts: explicitly selected boundary server reaches fast owner; real request arrival, server close and zero unanswered calls |
| J10 | Teardown leaves no request behind. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: held shared read survives one departure and ends after last waiter; two actual consumers, marker barrier, released body, zero unanswered and real owner PIDs gone |
| J11 | Teardown leaves no owner behind. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: held shared read survives one departure and ends after last waiter; two actual consumers, marker barrier, released body, zero unanswered and real owner PIDs gone |
| J12 | For a response containing binary bytes, the ordinary transport presents the same answer as the installed synthetic CLI. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: real owner receives binary stdout; dashboard/backend-tests/runtime/fake-gh-in-process-wire.spec.ts: independent bytes match native fake-gh-client.spec.ts binary contract |
| J13 | For a response containing a non-success HTTP status, the ordinary transport presents the same answer as the installed synthetic CLI. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process-wire.spec.ts: exact UTF-8 stdout/stderr, 403 and exit 7; dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: exact status/header interpretation; native fake-gh-client.spec.ts retains independent matching expectations |
| J14 | That non-success response’s headers retain the installed synthetic CLI’s answer. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process-wire.spec.ts: exact UTF-8 stdout/stderr, 403 and exit 7; dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: exact status/header interpretation; native fake-gh-client.spec.ts retains independent matching expectations |
| J15 | That non-success response’s stderr retains the installed synthetic CLI’s answer. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process-wire.spec.ts: exact UTF-8 stdout/stderr, 403 and exit 7; dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: exact status/header interpretation; native fake-gh-client.spec.ts retains independent matching expectations |
| J16 | A rate-limit response still changes request admission through the real owner. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: real owner interprets status, headers and rate limits; 429 exact body/headers, later request held back without another fake call |
| J17 | A workflow repeat is still recorded by the same fake provider. | slice 2 | |
| J18 | A subprocess-lifecycle check holds a real `gh`. | slice 2 | |
| J19 | That check closes its consumer. | slice 2 | |
| J20 | That check observes its PID disappear. | slice 2 | |
| J21 | That check observes its SIGTERM record. | slice 2 | |
| J22 | That check continues using the native CLI path. | slice 2 | |
| J23 | That check retains those assertions. | slice 2 | |
| J24 | Two servers use separate fake GitHubs with different answers. | slice 2 | |
| J25 | A restart preserves its own scope. | slice 2 | |
| J26 | A deliberately shared owner preserves its own scope. | slice 2 | |
| J27 | Reads remain isolated. | slice 2 | |
| J28 | That isolation includes operation on a hosted shard. | slice 2 | |
| J29 | A missing fake endpoint fails locally. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process-wire.spec.ts: missing/remote/closed/interrupted endpoints fail locally with API poison unlaunched; raw missing/closed stderr and malformed frame rejection; final 18-case mechanical proof |
| J30 | A closed fake endpoint fails locally. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process-wire.spec.ts: missing/remote/closed/interrupted endpoints fail locally with API poison unlaunched; raw missing/closed stderr and malformed frame rejection; final 18-case mechanical proof |
| X01 | A fake transport failure must not reach live GitHub. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process-wire.spec.ts: missing/remote/closed/interrupted endpoints fail locally with API poison unlaunched; raw missing/closed stderr and malformed frame rejection; final 18-case mechanical proof |
| X02 | A fake transport failure must not fall back to the machine’s real `gh`. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process-wire.spec.ts: missing/remote/closed/interrupted endpoints fail locally with API poison unlaunched; raw missing/closed stderr and malformed frame rejection; final 18-case mechanical proof |
| X03 | Do not substitute simulated PIDs for the necessary native process observations. | slice 1 | observed: dashboard/backend-tests/runtime/fake-gh-in-process.spec.ts: absent call PID file and call.* records; dashboard/backend-tests/runtime/fake-gh-in-process-activation.spec.ts: promise child has no PID; existing native subprocess-lifecycle and CLI controls retain real PIDs/signals |
| X04 | Do not remove assertions that provide the necessary native process proof. | slice 2 | |
| X05 | No product behavior changes. | slice 1 | observed: git diff inspection: only dashboard test support/specs and planning records change; production owner/transport, runner and answer model remain unchanged |
| X06 | No production `gh` transport changes. | slice 1 | observed: git diff inspection: only dashboard test support/specs and planning records change; production owner/transport, runner and answer model remain unchanged |
| X07 | No timeout increases. | slice 2 | |
| X08 | No removed journeys. | slice 2 | |
| X09 | No reduced assertions. | slice 2 | |
| X10 | No new GitHub answer model. | slice 1 | observed: dashboard/tests/support/fakeGhTransport.mjs uses existing fakeGitHub.ts HTTP frame and unchanged ghReply.ts conversion; owner/wire specs exercise same answerers; no parallel answer model |
| X11 | No general test-runner redesign. | slice 1 | observed: git diff inspection: only dashboard test support/specs and planning records change; production owner/transport, runner and answer model remain unchanged |
