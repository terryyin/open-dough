# Frontend browser connection closed during the hosted shard

Registered revision `0e58f2b6b2d1b8dd19448887d2fb5203b134ba5c`,
push run 45775533807, attempt 1, Dashboard frontend shard 1/2,
job 139758172341. The story's four committed increments change backend
tests and planning records. Slice 5 was paused before any focused proof
and preserved by the managed CI stash at
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-9eBPB0/record.json`
with OID `fb912b73b25715ba9388f02248c51b6fae666a83`.

The job passed setup and ran for about two minutes. Its first decisive
failure was `VITEST_BROWSER_CONNECTION_CLOSED` while running
`intent-revision-update-outcomes.spec.ts`. Vitest then reported missing
cases and the proof record remained incomplete. The full job log and
installed diagnostic are in worktree Git evidence as
`ci-45775533807-frontend.log` and `ci-45775533807-1.json`. The attempt as
a whole was still in progress when diagnosed. No exact current repair
owner or affirmative infrastructure cause was found before dispatch.

Round 1 will determine whether repository browser history or fixture
lifetime closes the Vitest connection, or whether the hosted runner or
browser process terminated independently. Start by preserving CI and
recent same-shard evidence and tracing the named spec and browser setup.
The probe owner records each bounded hypothesis, workload, stop count
and command before launching it. Current local host is awake macOS on
AC, 16 logical CPUs with one-minute load near 9. No other owned
expensive proof is active.

### Round 1 archive and code observations

The archived JSON for artifact 15095299794 shows 566 reported assertions
and 196 of 217 test-module entries with assertions. The 21 empty entries
include the named outcomes spec. The JSON reports success for completed
assertions and cannot establish that the shard completed. The installed
Vitest BrowserWorker empties its queue on a failed RPC and waits for the
other busy pages before reporting the error. The last printed pass is
therefore not proof of which page, prior file, or timestamp initiated
the orchestrator close.

Prior identical signatures are in runs 45345208843, 45514916618 and
45733591466. The archived comparisons at
`79475eaef:.planning/slice-plans/847-prove-installed-story-starts-on-vitest/diagnosis-frontend-browser-disconnect.md`
put them 94.227, 99.570 and 160.739 seconds after Vitest RUN, while this
one was about 119 seconds. The current failure uses Ubuntu runner image
20261122.23.1, a third image, and names yet another pending file. The
guard installed by 6a5ce378a was active and reported no refusal. The
known forced excess traversal produces this signature, but a recurrence
with the guard active does not identify an unguarded ordinary
history.back/forward/go as the cause.

The other execution's one-hosted-run lifecycle instrument at 5c4e1a2b6
recorded top-frame navigation, page close and crash, browser disconnect,
provider shutdown, process exit and OOM or disk-pressure signals. It
passed all 212 files and 564 assertions in run 45739110922. Its commit
was withdrawn by 5ebbb4666 before that story closed. The developer's
recorded exception is specific to 45733591466, attempt 1, job
139621469022. No active competing repair owner or current exception was
identified. Prior natural focused, macOS whole or shard, Linux arm64,
hosted DEBUG and one hosted lifecycle runs did not reproduce the cause.
Current Colima images are arm64 and do not add an independent x64
discriminator. A further unchanged or one-off DEBUG run would repeat
that experiment.

### One private transport-lifecycle probe

Hypothesis: a server-side orchestrator transport loss leaves the browser
and its page connected at the close, with no prior top-level navigation
or provider shutdown. A Node-side upgrade observer paired with the
existing Playwright event boundary should add a transport-only
discriminator even when the ordinary Vitest error remains identical.
Validate it by closing only the exact orchestrator TCP socket in a
disposable diagnostic adapter after the first existing case reports.
Read the order of transport closure, page state, provider shutdown and
browser disconnect. If the evidence does not distinguish the order, it
does not validate the probe. A successful discrimination establishes its
diagnostic value and does not attribute the hosted failure.

Stopping count is one targeted run on awake AC-powered macOS arm64 with
one worker and two existing Intent specs. Load was 16.09 at selection
on a 16-logical-CPU host, so no broader local run or hosted retry is
planned. The script and output stay in the worktree's Git evidence
directory. No repo source, maintained test, test timeout or CI setting
is changed. Exact runnable command from the checkout:

```sh
evidence=$(git rev-parse --path-format=absolute --git-path open-dough/evidence)
node .agents/skills/dough-execute-plan/scripts/slice-clock.mjs run --log "$evidence/frontend-socket-causality-probe.log" --exit-file "$evidence/frontend-socket-causality-probe.exit" -- caffeinate -s -i env DEBUG=vitest:browser:pool,vitest:browser:api,pw:browser node "$evidence/frontend-socket-causality-probe.mjs"
```

### Round 1 result

The one private probe intentionally reproduced the full signature. It
ran the installed Vitest and the existing frontend configuration at
`0e58f2b6b2d1b8dd19448887d2fb5203b134ba5c`. The existing scope-history
remount case passed before the injected close. The terminal result was
exit 1 in 5.587 seconds, as expected. No natural hosted reproduction was
attempted. The log and command, revision, and terminal run record are
`frontend-socket-causality-probe.log` and
`frontend-socket-causality-probe.log.run.json` under Git evidence.

| UTC | Observed transition |
| --- | --- |
| 07:39:53.349 | Deliberate server socket destroy, then TCP close. Browser connected, page open and route still `/__vitest_test__/`. |
| 07:39:53.355 | Vitest reports `VITEST_BROWSER_CONNECTION_CLOSED` with the nested `createTesters` failure. |
| 07:39:53.356 | Playwright provider cleanup begins. |
| 07:39:53.359 | Page closes. |
| 07:39:53.366 | Browser disconnects. |

The experiment shows that a transport-only primary event yields the
same signature as the historical forced navigation. It validates
session-correlated socket and page events as a discriminator. It does
not prove which happened in the archived hosted run. Reported assertion
results do not account for the unrun cases. There is no failing-before
reproduction of the natural cause, confirmed infrastructure event, or
usable repair candidate.

The next useful experiment is a longer-lived passive capture of
ordinary hosted frontend shard 1/2 until one matching failure, with a
bounded window agreed before enabling it. Reuse the prior provider,
top-frame, crash, process and resource observations. Add a correlation
between the orchestrator session ID, server-side WebSocket/TCP closure
and current page state. Keep a small recent event buffer, emit it only
on unexpected closure, and exclude endpoint query tokens. A leading
main-frame navigation, provider close, process exit or crash identifies
its own path. A transport close while the same page remains live and
the URL has not changed narrows the branch to transport and server
lifetime and supports the next targeted reproduction. A clean run
only validates the lifecycle instrumentation. Keeping this experiment
on ordinary runs beyond this story needs a decision about scope,
ownership and removal. Repeating the previous one-off hosted
instrumented pass without a new discriminator does not settle the
failure.

Round 1 used about six active minutes. The only checkout edit is this
diagnosis record. The private probe and CI artifacts remain in Git
evidence. The four Slice 5 paths remain in the coordinator's managed
repair stash. The coordinator owns the clock transition and the next
diagnostic or disposition decision.

## Round 2

Prepare a temporary failure-only capture for one normal hosted
`dashboard-frontend / shard 1/2` push on the established story branch.
The existing workflow passes the GitHub push event, ref, and frontend
split, so there is no workflow or shard configuration change. The
hypothesis is that the first correlated browser, page, WebSocket, and
TCP events will distinguish a page or provider shutdown from transport
loss with the orchestrator still open. On a matching failure, preserve
the bounded event record and the linked job log. A preceding provider
shutdown, browser disconnect, top-page navigation or crash supports that
branch of the diagnosis. A TCP close with the orchestrator page still
open and its route intact supports the transport branch. Resource
counters are context, not by themselves proof of the failing process.
The hosted stopping count is one push execution on this candidate.
Normal completion with no matching failure checks compatibility and
leaves the historical cause open.

Prior to any hosted launch, run one quiet focused selection through the
maintained frontend runner and one private forced-close validation.
The quiet selection enables the capture using the same gate as CI.
It must pass and produce no capture marker. The forced probe must still
fail and report the exact browser error plus a correlated TCP close while
the browser is connected and the original orchestrator page remains
open. The adapter itself must emit no URL, query value, or session token.
The forced close is a validation of the instrument, not a reproduction
of the natural hosted cause. Use one worker, awake macOS on AC, load near
13 on the 16-logical-CPU host and 45% memory free at dispatch. Do not run
a full local shard in this round.

The initial quiet selection passed both Intent cases with no capture
line. The first forced probe emitted one capture line and observed
TCP close while the browser was connected and the page open. The
display route was `other` because the instrument's path classifier
omitted Vitest's trailing slash. Correct the path classifier and repeat
this forced validation once to verify the intended route discriminator.
The same final candidate will rerun the quiet two-case selection once
to check the narrow diagnostic correction. No natural local or hosted
reproduction is claimed.

A distinct local validation checks that the same capture can observe
an actual departure from the orchestrator route. After the first case
passes, a private adapter asks Playwright to navigate the active top
page to a blank document. The hypothesis is that the capture includes
both the same session's transport closure and its navigation event,
even if Playwright delivers the navigation notification after Node's
TCP event. Run this once with the same two cases and one worker. The
event sequence guides interpretation of the hosted output. The mere
absence of a preceding navigation signal does not prove the transport
caused the disconnect.

The draft typecheck required an explicit session record whose browser, page
and provider facts are optional. The final typecheck covers that declaration.

### Round 2 local results

The temporary source paths are `dashboard/frontend.vitest.config.mts`
and `dashboard/test-support/support/frontendDisconnectCapture.ts`. The
capture leaves the browser, workflow, worker, test-reporting and test
timeout options intact. It adds a single failure observer to the
resolved Vitest reporter list. The last 96 events use numeric session,
browser and provider labels and route categories only. The matching
error emits one JSON line beginning with
`{"source":"frontend-disconnect"`. The successful run emits none.
The existing mounted frontend group is the consumer. The full trace is
`frontend-capture-consumers.md` in worktree Git evidence.

All candidate commands ran in the established checkout at `0e58f2b6b`
with the temporary working changes. The Git evidence names below give
each literal wrapped command in its companion `.log.run.json`. The
quiet command was `npm run test:dashboard:frontend -- 'intent/(intent-project-scope-history-remount|intent-revision-update-outcomes)\.spec\.ts$' --workers=1`
under the same four gate variables as the hosted shard. The two
controlled faults ran disposable adapters from Git evidence with those
variables and the same selected tests. They do not modify any tracked
test source.

| Git evidence log | Terminal result | Observation |
| --- | --- | --- |
| `frontend-capture-quiet-final.log` | Exit 0, 6.517 s | 2 files and 2 cases passed, with zero capture markers. |
| `frontend-capture-force-final.log` | Intentional exit 1, 5.750 s | 1 case passed before forced transport loss. The exact Vitest error appeared. At 5141 ms the TCP connection closed while the page was open on the orchestrator and the browser still connected. The same page's WebSocket closed at 5142 ms. There was no departure navigation. |
| `frontend-capture-navigate.log` | Intentional exit 1, 7.344 s | Explicit top-page navigation produced the same Vitest error. At 6645 ms TCP reported ECONNRESET, followed by TCP close at 6646 ms while Playwright's last known route was still the orchestrator. The same session reported its navigation to blank at 6651 ms. |
| `frontend-capture-typecheck-final.log` | Exit 0 | Dashboard typecheck passed after the type-only correction. |

Both injected failures produced one trace line and preserved the
original failure verdict. A separate inspection verified the same
session across each signal, including the navigation in only the
navigation probe. The records contained no raw URL, endpoint query,
session token or path. `git diff --check` and the read-only Prettier
check passed. Resource sampling on this macOS host yielded only
temporary disk space, as expected. Linux-specific counters have not
been exercised locally.

Interpret both sides of the close. The cached page state can still
look live when TCP closes first during real top-page navigation. A
TCP-first sequence does not identify a transport cause by itself.
The later same-session route change distinguishes the forced navigation
from the forced socket loss. Missing lifecycle evidence in a hosted
capture leaves the cause unresolved.

The one instrumented push `2b7802bd0` ran as 45778980880, attempt 1.
Frontend job 139769509169 passed 217 files and 590 tests without a capture
marker. The full job log is `ci-45778980880-frontend.log` in Git evidence.
This result validates the instrument on a hosted success. The natural
cause of 45775533807 remains unknown. The temporary config and support
have been restored to the pre-experiment Git tree. Further diagnostic
publication needs a different experiment or a longer-lived capture
decision and owner.

After HTTP upgrade typing and reporter parameter cleanup, the quiet check
passed and the two injected traces distinguished whether the session changed
route. See the `-reviewed.log` records in Git evidence.
