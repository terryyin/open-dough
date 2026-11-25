# Frontend browser connection closed during CI

## Signatures

Both occurrences show the same signature on hosted x64 `dashboard-frontend / shard 1/2`.
Vitest 5.1 browser mode reports an unhandled
`VITEST_BROWSER_CONNECTION_CLOSED` ("Browser connection was closed while
running tests. Was the page closed unexpectedly?"). Its cause is
`[birpc] rpc is closed, cannot call "createTesters"`. The stack is the orchestrator WebSocket `close` handler
(`@vitest/browser/dist/index.js:3101`). Every reported case passed. The
proof-fragment step then refused the incomplete record.

| | Occurrence 1 | Occurrence 2 (this execution) |
|---|---|---|
| Run / attempt / job | 45345208843 / 1 / 138278006284 | 45514916618 / 1 / 138871754089 |
| Revision | `efca0e5a9` (SEED-426 branch) | `99cb6c402` (this story branch) |
| Files passed | 170 of 205, 478 cases | 189 of 200, 496 cases |
| File in flight at close | `intent/intent-project-scope-history-source-identity.spec.ts` | `intent/intent-summary-story-comparison-presentation-bindings.spec.ts` |
| Close time | 07:06:54.58, right after the last reported case | 00:04:48.71, right after the last reported case |
| Earlier stderr | ResizeObserver loop, >30 s before | ResizeObserver loop (`story-review-diff-syntax-hint-reads.spec.ts:86`), ~40 s before |

Logs: occurrence 1 is
`/Users/terryyin/git/open-dough/.git/open-dough/evidence/SEED-426-ad-hoc-cutover-handoff/ci-45345208843-frontend.log`.
That execution's record holds rounds 1–2, reproduced in neither environment: macOS focused 0/1, Ubuntu arm64 shard
replay 0/1 (205/205), and a hosted DEBUG run with 205/205 passed. The record was copied to
`<EVID>/prior-diagnosis-frontend-browser-connection.md`. Occurrence 2 is
`<EVID>/ci-45514916618-frontend.log` and `<EVID>/ci-diag.json`. Here, `<EVID>` is
`/Users/terryyin/git/open-dough/.git/worktrees/read-the-published-board-and-review-from-local-g/open-dough/evidence`.

Attribution: this story's slice at `99cb6c402` changed only dashboard
e2e/backend test support (`fixtureOriginRoute.ts`, `dashboardServer.ts`,
`committedOrigin.ts`) and one backend spec. None of them is in the frontend Vitest
include (`dashboard/frontend.vitest.config.mts` includes only
`dashboard/frontend-tests` Vitest files). Occurrence 1 was on another branch's
revision, so the failure is not this story's change. Under the failure policy, the repair is still owed.

## Round 1 (this execution): evidence reading

What the pool code shows: `@vitest/browser` runs one file per
`createTesters` call on a page, so
`vitest/dist/chunks/index.Di8au7q4.js` runs about 4744. A rejected call rejects the
whole pool, and every still-queued file then reports "no cases". So the close
hit one orchestrator page right after its previous file finished. The
11 unrun files in occurrence 2 are a subset of occurrence 1's 35. They are the same
tail of the shard's queue.

The following were ruled out by reading the source. Vitest's browser server sets `server.hmr: false` and
`watch: null`, so no Vite full-reload of the orchestrator can occur. Heartbeat expiry and page crash have their own messages, which
were absent. The group runner's abort path (`groupVitest.mjs` `cancel`) is
deadline-bound, and the deadline was not reached.

The lead is joint session history. Tester iframes share the top-level orchestrator page's
session history. The app pushes history entries (`dashboardRoute.ts`,
`App.tsx`), and app Back buttons and seven Vitest specs call `history.back()` or
`history.forward()` from inside the tester iframe:
`development-intent-frame-keyboard`, `story-url-arrival`,
`story-destination-repeat-cue`, `project-keyboard-navigation`,
`system-settings-navigation`, `project-hide-selection` and app Back in
`frame-roster-look`. With `isolate: true`, each file's iframe is
removed after its cases finish. Suppose a traversal is still pending when the iframe goes, or a
traversal reaches an entry that is not the iframe's own. Then the top-level
orchestrator page can be the frame that navigates, which closes the orchestrator socket
with exactly this signature. In occurrence 2,
`development-intent-frame-keyboard.spec.ts` (its last step relies on
`history.back()`) reported its case 0.7 s before the close. In occurrence 1 it
was one of the files that never ran, so it cannot explain that close alone.

### Experiment 1: forced joint-history probe

Hypothesis: a `history.back()` or `history.go(-n)` issued from a tester
iframe can navigate the top-level orchestrator page. This happens when the traversal
targets an entry that the iframe did not push, either an earlier, removed iframe's
entries or the top-level page's own. The orchestrator connection then closes with
`VITEST_BROWSER_CONNECTION_CLOSED` / `createTesters`.

Design: a temporary scratch spec pair under `dashboard/frontend-tests/`
(to be deleted after the round), run once with one worker on macOS. The first file pushes
entries. The second logs `top.history.length` and its URL, then goes back past its
own entries. Stopping count: one run. A matching close confirms that the
mechanism can produce the signature. A pass with the top URL unchanged refutes it for a
fully committed traversal.

Result, `<EVID>/ci-fe-probe1.log` (macOS, AC power, load 3.8, one worker): **reproduced
the exact signature 1/1.** At the start of the file, `top.history.length` was 2: the
orchestrator URL `/__vitest_test__/?sessionId=…` plus the page's initial entry.
One `history.go(-1)` beyond the iframe's own entries navigated the
top-level page. The orchestrator socket closed with `VITEST_BROWSER_CONNECTION_CLOSED` /
`createTesters`, and the queued file reported "no cases". So the
mechanism can produce this failure. It remains to find which spec issues the traversal on hosted CI.

### Experiment 2: frame removal while a traversal is pending

Hypothesis: the repository's spec traversals are balanced, since each `history.back()`
follows an app push. They become top-level navigations only when the traversal
commits after its frame is gone, or when it targets an entry of an already removed
frame. Under load, a file can end before its `history.back()` commits, and
isolation then removes the iframe.

Design: one scratch file, one worker, one run. (a) A child iframe pushes
one entry, calls `history.back()`, and is removed immediately. (b) A child iframe
pushes two entries and is removed, and then the tester frame calls `history.back()` once.
Each case logs the top URL afterwards. Stopping count: one run. A close in (a) or
(b) identifies the condition that a balanced spec can hit.

Result, `<EVID>/ci-fe-probe2.log`: both cases passed and the top URL was unchanged.
Neither a traversal pending while its frame is removed nor a back into a removed frame's
entries navigated the top page. Entries from removed frames stay in the joint
history (`top.history.length` went to 5). So a page that has run files with net
pushes buffers later excess backs. The top page navigates only when
a traversal goes past every buffered entry, as in probe 1, for example on a fresh page.

### Experiment 3: each history-traversing spec alone on a fresh page

Hypothesis: one of the specs that traverse history goes back more often than the app
pushed. On a fresh page, where only the orchestrator entry exists, that closes the
orchestrator. On a page with accumulated entries it is silently absorbed, which explains
the rare, order-dependent hosted failures.

Design: run each of the 7 specs (`development-intent-frame-keyboard`,
`story-url-arrival`, `story-destination-repeat-cue`,
`project-keyboard-navigation`, `system-settings-navigation`,
`project-hide-selection`, `frame-roster-look`) alone with one worker, once each,
in one clock run. Stopping count: one pass each. A spec that closes the
connection alone has an excess back.

Result, `<EVID>/ci-fe-probe3.log`: all 7 specs passed alone on a fresh page (7/7).
None of them makes a deterministic excess traversal. Vitest's Linux-only
`maybeCollectChromiumGarbage` between files was also read. It only sends
`HeapProfiler.collectGarbage`, so it does not close or navigate the page (ruled out).

### Experiment 4: excess-traversal instrument over the whole suite (kind switch)

Hypothesis: on some file, a timing-dependent traversal goes back past that
file's own pushes. When the page has buffered entries from earlier files, this is
silent. On a page with no buffer it reaches the initial entry and closes the
orchestrator. If so, an instrument that tracks each tester frame's own
history index catches the excess even in a passing run.

Instrument (temporary): `dashboard/frontend-tests/zz-probe/history-guard.ts`
as a `setupFiles` entry in `dashboard/frontend.vitest.config.mts`. It wraps
`history.pushState`, `back`, `forward` and `go` in the tester frame and tracks its own
index. It logs `HISTORY-GUARD excess` with the spec path and stack whenever
a traversal would go below the frame's first entry. Run the whole
frontend Vitest suite once locally (default two workers, macOS, AC power). Stopping count:
one run. Any logged excess names the offending spec. No excess bounds the
trigger to conditions that this instrument cannot see.

Result, `<EVID>/ci-fe-guard-full.log`: the whole frontend suite passed, 315/315 files and
882/882 cases in 265 s (two workers, macOS, AC power, load about 5). It logged **no excess
traversal**. A scratch check confirmed the instrument works (`<EVID>/ci-fe-guard-check.log`).
It logged `HISTORY-GUARD excess back`, and the following back reproduced the
exact `VITEST_BROWSER_CONNECTION_CLOSED` / `createTesters` signature again (forced 2/2).

### Experiment 5: same instrument, CI shard 1/2 with CI's worker count

Hypothesis: the timing-dependent excess traversal needs CI's concurrency
(hosted `availableParallelism()` = 4 workers, shard 1/2 order). Design: reinstate the
same temporary instrument, set `OPEN_DOUGH_DASHBOARD_FRONTEND_SPLIT=1/2`, use `--workers 4`, and run once.
Stopping count: one run. Then remove the instrument again.

Result, `<EVID>/ci-fe-guard-shard1.log`: shard 1/2 with 4 workers passed 200/200
files and 509/509 cases in 77 s (macOS, AC power, load about 3.3). It logged **no excess
traversal**. The instrument and `setupFiles` entry were removed again. The tree
holds only this record, and the instrument source is kept at `<EVID>/ci-fe-history-guard.ts`.

## State after round 1

- Reproduction: forced 2/2 (probe 1 and the guard check). Natural reproduction locally is 0/2:
  one whole-suite run with two workers and one shard 1/2 run with four workers. Both were
  instrumented. Including the prior record, environments without a natural reproduction now
  total: macOS focused 0/1, macOS full 0/1, macOS shard 1/2 0/1, Ubuntu arm64
  shard 0/1, and hosted DEBUG shard 0/1. Hosted x64 shard 1/2 reproduced it 2 times in
  unknown total attempts.
- Confirmed mechanism: a session-history traversal from a tester iframe
  that passes every buffered entry navigates the top-level orchestrator page to
  its initial entry. This yields exactly the hosted signature, including the queued files'
  "no cases".
- Not demonstrated: that hosted CI hits this mechanism. No repository spec
  makes an excess traversal on its own (7/7 alone) or in either instrumented
  local run.
- Ruled out by this round's source reading: Vite HMR or full-reload (disabled),
  Vitest's Linux GC workaround (GC only), traversal pending at frame removal, and back into a removed
  frame's entries (probe 2).
- Temporary diagnostic edits: none remain. Parked changes: the coordinator's
  managed repair stash holds slice-2 work, untouched.
- Unrelated defects found: none.

Leading hypothesis: a timing-dependent excess history traversal. It is either app Back
(`App.tsx` `back`, `dashboardNavigation.ts` `onBack`) or a spec's
`history.back()`/`forward()`, and it needs hosted timing. It is silent wherever earlier
files left buffered entries. The page navigates only when the page had no
buffer, for example soon after `grow()` opened a fresh page late in the queue. That hypothesis is unconfirmed.

Next discriminating experiment (hosted, through the coordinator; no workflow
change): one temporary diagnostic commit that adds `<EVID>/ci-fe-history-guard.ts`
as a `setupFiles` entry of `dashboard/frontend.vitest.config.mts`. On an
excess, it should log and **throw** rather than traverse, so that the offending test fails
under its own name instead of closing the page. Observe one push run (both
frontend shards). Stopping count: one run. An excess named on hosted gives the
failing-before reproduction and the repair target, which is that spec or app Back. No excess
on a passing run weakens this mechanism without refuting it. A recurrence of the
original signature with the guard active refutes it, and the cause then lies outside
the history API.

Round count 1, about 6.5 cumulative active minutes (slice clock).

## Round 2: developer decision, a permanent history guard

Terry, through the coordinator, chose to land the guard permanently as a
test-harness defense rather than run the hosted diagnostic first. The hosted
cause **is still unconfirmed**. The guard closes the one mechanism that has been shown to produce
the signature. From now on, if hosted CI hits that mechanism, the result is a named failing
test with the message "Excess history traversal: it would leave this test
frame's own entries and navigate the Vitest orchestrator page". It is no longer
a shard-wide `VITEST_BROWSER_CONNECTION_CLOSED` that drops the queued files. Such a
failure then names the spec or app Back to repair. If the original
signature recurs with the guard active, it refutes this mechanism, and the
diagnosis resumes from this record outside the history API.

The guard is `dashboard/test-support/component-mount/historyTraversalGuard.ts`, installed by
`setupFiles` in `dashboard/frontend.vitest.config.mts`. It replaces the tester
frame's `history.back`, `forward` and `go`. Using the Navigation API's
`currentEntry.index`, plus traversals still in flight, it refuses with a throw any
traversal below the frame's first entry before it reaches the shared history.
An `afterEach` fails the case if a refusal was swallowed by app code and not
claimed through `takeRefusedTraversals()`. Its maintained test is
`dashboard/frontend-tests/test-harness/history-traversal-guard.spec.ts`.
Proof run records are under `<EVID>`:

- `ci-fe-guard-before.log`: the guard module ran with its installation disabled by a
  temporary edit, since reverted. The spec failed for the right reasons, with no throw on the
  excess Back and the swallowed case not failing. Its excess Back was absorbed
  because the page already held buffered entries.
- `ci-fe-guard-after.log`: the guard spec ran first on a fresh one-worker page,
  followed by `story-url-arrival` and `development-intent-frame-keyboard`.
  All 3 files passed (6 passed plus 1 expected fail), the later files executed, and legitimate
  in-frame Back still worked.
- `ci-fe-guard-typecheck.log`: `npm run typecheck:dashboard` passed.
- `ci-fe-guard-suite.log`: the whole frontend suite passed with the permanent guard,
  316/316 files and 884 passed plus 1 expected fail, in 172 s (macOS, AC power, two workers).
  No refusal was logged, so no existing spec or app Back trips the guard locally.

Open: the hosted cause is unconfirmed. The next hosted push exercises the guard under
the conditions where the signature occurred. Its outcome is read as described above.
