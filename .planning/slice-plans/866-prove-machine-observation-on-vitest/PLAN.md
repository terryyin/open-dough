# Prove Dashboard machine observations in Node Vitest

**Source:** [Prove Dashboard machine observations in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#machine-observation-via-vitest)

**Identity:** SEED-413#machine-observation-via-vitest

## Goal and scope

Give Dashboard maintainers fast Node Vitest feedback that a checkout's Git
identity changes with every Git change its found workspaces depend on, and that
the machine host status reports CPU and free disk from their own sources, each
unavailable on its own, from one shared sample. The two legacy observation
specs below (7 cases) are the complete selection; each case needs a named
Node Vitest replacement or maintained owner before its spec is removed.

- Checkout identity uses real Git transitions. Only the trust window's clock
  is controlled, so a changed file ages without a one-second wait.
- Host sampling drives `HostStatusObservation` directly with only the platform
  readers scripted. One small in-process Node HTTP witness keeps the wire
  proof: method refusal, other-site and other-Host refusal, and one answer
  from the real platform readers.
- Out of scope: the sidebar in the browser, which keeps
  `e2e/sessions/sessions-sidebar-host-status.spec.ts`, and any change to how
  localWorkspaces reads or keeps found worktrees.

## Current decisions

- [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
  [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md),
  and the North Star topics
  [Make production code directly testable](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [Plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
  govern the proof boundary. Add zero wrappers to `dashboard/test-support/`.
  The existing `startInProcessBoundaryHttp` and `rawRequest` serve the wire
  witness, as in
  `dashboard/backend-tests/configuration/terminal-theme-boundary.spec.ts`.
- Clock seam: `gitFilesIdentity(checkout, trunk, now = Date.now)` takes the
  clock as a defaulted typed parameter, read once per call and threaded to the
  trust test, so `localWorkspaces.ts` (the only caller) stays unchanged.
  `observationClock.ts` is not reused: its file-driven, process-wide control is
  for shared observations' reuse windows, and the trust window judges file
  metadata. Backdating file times is not an option: the trust test also reads
  `ctime`, which `utimes` cannot set.
- One Vitest case per Git change, each from a fresh checkout, so a failure
  names the change; the legacy single sequence of seven changes does not
  survive as a case.
- File size: `gitFilesIdentity.ts` is 134 lines and `hostStatusObservation.ts`
  163, both under 250. Only `gitFilesIdentity.ts` is edited.
- The wire answer from the real platform readers stays one Vitest case. It
  carries the production 250 ms priming wait, so it is a named exception to
  the ~100 ms case target: it is the only observation of the real `os.cpus()`
  and `statfs` readers.

## Premises and baseline

Observed in this isolated preparation workspace at `2e8319472` on 28 November
2026 (Node v24.21.0, macOS on AC power, one worker, default timeout, load
12–17 on the host).

```sh
caffeinate -s -i npx playwright test -c dashboard/backend.playwright.config.ts \
  --workers=1 --reporter=list \
  'observation/(git-files-identity|host-status)\.spec\.ts$'
```

| Consuming operation | Observed result at `2e8319472` | Plan consequence |
| --- | --- | --- |
| Legacy two-spec Playwright baseline (command above) | 7 cases passed: Git identity sequence 7.4 s, main-checkout Git 1.1 s, plain folder 0 ms; CPU window 1 ms, unavailable figures 1 ms, shared sample 304 ms, endpoint 261 ms. 9.2 s summed case time, 10.3 s wall. | Exact inventory: 7 cases in 2 specs, all active and green. |
| The identity spec ported as it is to Vitest (scratch copy importing `vitest`, `backend.vitest.config.mts`) | The 7-change sequence timed out at the default 5 s; main-checkout (1.2 s) and plain-folder (3 ms) passed. Each of the seven changes waits out the one-second trust window. | A direct port breaks the default-timeout rule; the clock seam is required, not optional. |
| Same scratch with `gitFilesIdentity` reading a clock that the case sets (scratch edit, reverted) | With the clock at the real time right after a change, the earlier identity never stood; with it two seconds ahead, each identity settled. All 3 cases passed: sequence 165 ms for seven real transitions, main-checkout 98 ms, plain folder 0 ms. | The seam settles the sizing; per-change cases from fresh checkouts need a measured setup cost near 90 ms each. |
| Host status endpoint through `startInProcessBoundaryHttp({ install: installHostStatusMiddleware }, "production")` and `rawRequest` (scratch spec, deleted) | Same-origin GET: 200, `{"cpuPercent":41.27…,"freeBytes":143382769664}` in 288 ms. Other Origin and other Host: 403. POST: 405. | The wire witness needs no Vite server, no new support and no production change. |
| Consumers of the changed seam (`rg gitFilesIdentity dashboard`) | `localWorkspaces.ts` is the only production caller and passes two arguments; `git-files-identity.spec.ts` the only test. | A defaulted third parameter changes no caller. |
| Maintained owners of the host status refusals (`rg` for `hostStatusEndpoint` and `host-status` under `dashboard` and `e2e`) | No other spec asserts the host status method or origin refusal; the frontend specs mock the read, and the sidebar journey stays in `e2e/sessions/`. | The wire witness is the refusals' only owner; keep all three refusals. |
| Retiring `host-status.spec.ts` (`rg startDashboardServer dashboard e2e`, `rg rawRequest dashboard`) | `startDashboardServer` has 79 consuming files and `rawRequest` 48; the spec's scripted-readers helper is local to it. | Retiring the spec leaves no support module without a caller. |

## Execution context

- Ai-chan, publisher `dashboard-territory.local-open-dough`, Story Branch
  Mode, branch `codex/prove-dashboard-machine-observations-in-node-vit`.
  Owned worktree `/Users/terryyin/git/open-dough/.worktrees/prove-dashboard-machine-observations-in-node-vit`,
  integration checkout `/Users/terryyin/git/open-dough`, target `origin/main`.
- Starting revision `dfc699737c5df187855e7941ef4d2e44e8021115`. The accepted
  Take and branch base is `4609e081cfabab8a95e2a7f3fa9b4bc722484762`.
  The two revisions differ only in the backlog and agent assignment.
- Locked `npm ci`, native Chromium check, and Dashboard typecheck passed in
  the execution checkout. GitHub Actions workflow `ci.yml` monitors the
  execution branch with coordinator `ai-chan-14af1101`, mailbox
  `/tmp/dough-ci-501/watch-66ZnwK`, PID 13343, Codex cell `g775:12`,
  shell session `11438`.
- Recount at the accepted Take, on AC power using the legacy command above
  and one worker: 7 Chromium passes, 0 Vitest cases. The case times were
  7.4 s, 1.1 s, 0 ms, 1 ms, 1 ms, 305 ms, and 274 ms (about 9.1 s
  summed, 11.7 s reported by Playwright). One worker and focused local
  proof keep the comparison on the same host and avoid competing with CI.

## Ordered slices

Legacy paths are in `dashboard/backend-tests/observation/`. Each slice budgets
15 active minutes or less and owns one proof loop. Keep a legacy spec running
until its Node Vitest replacement is green, then retire it in the same slice.

### 1. Detect checkout identity changes through real Git operations

Type: Behavior
Status: done

Behavior: A checkout's Git files keep their identity while nothing changes and
for Git run in the main checkout (a plain `git status` that rewrites its index,
or a new file there). After the worktree's author config, its branch, trunk,
packed refs, its head switching branches, an added worktree, or a removed
worktree folder changes, the identity differs. A file changed under a second
ago gives no identity, so the caller reads Git afresh; a missing or non-Git
folder has an identity of its own.

Proof: Node Vitest cases over `gitFilesIdentity` with real Git in a temporary
home (the existing `git` helper's environment and fixture checkout move into
the spec), one case per change, the held case, the main-checkout case, the
withheld case and the missing or plain folder case. The case that controls the
trust window passes the clock as the defaulted `now` parameter:
the real time, or a time two seconds ahead, for a settled identity. Replaces
`git-files-identity.spec.ts` (3 cases). Retire that spec.

Observed in the execution checkout at the Take with the slice edits applied.
The spec converted in place. Its 11 Node Vitest cases cover the seven real
Git changes, unchanged identity, recent-file withholding, main-checkout
index refresh and new file, and missing and plain folders. The seven change
cases compare defined identities from separate Git checkouts. Trunk and
worktree HEAD use prepared refs so only the named transition follows the
held read. All passed at 1–68 ms per case (589 ms summed, 1.82 s Vitest).
The maintained group passed with 11 Node cases and four retained Chromium
host status cases, and the Dashboard typecheck passed. The live Sessions
replay with `DOUGH_SESSIONS_REPLAY=1` passed and reported eight found
workspaces with unchanged response revisions on quiet reads. This exercises
the two-argument production call through `localWorkspaces.ts` while the
focused spec owns the clock and Git transitions.
Independent refactoring isolated the age rule in a real fresh Git checkout
with only `.git/config` contributing file metadata. The same config is
withheld at 500 ms and trusted at two seconds. All 11 cases passed after
that edit (7–161 ms, 1.0 s summed, 2.04 s Vitest), with the age case at 10 ms.
Published as `d3209ff3ff77c48f2dce3ff5c480dcdbb6277587` on the execution
branch and registered with its CI observer.

### 2. Share host sampling and disclose partial availability

Type: Behavior
Status: done

Behavior: The first host sample primes a second CPU snapshot and answers that
span; later samples average the trailing minute of snapshots, and after a gap
longer than the window the next sample starts afresh. A disk that cannot be
read leaves CPU readable; CPU counters that cannot be read, or do not advance,
leave free bytes readable. Concurrent readers share one sample and a later
read inside the reuse window gets it; with no demand nothing is sampled, and
the next demand samples again.

Proof: Node Vitest cases over `HostStatusObservation` with only the typed
`HostStatusReaders` (CPU snapshots, free bytes, priming, reuse window)
scripted, moved from `host-status.spec.ts`: CPU window (1), unavailable figures
(1), shared sample (1). The shared-sample case keeps its read of `reuseMs`
per demand. It advances virtual timers past the original window with no
demand, then lowers the window to 1 ms to observe the next sample within
the original window. Replaces three of the four `host-status.spec.ts` cases.
Keep that spec until slice 3.

All three cases in `host-status-observation.spec.ts` passed in Node Vitest
(2 ms, 0 ms, 2 ms, 772 ms elapsed). The real `HostStatusObservation` and
`SharedObservation` check CPU priming and expiry, independent unavailable
readings, and concurrent, reused and subsequent samples. Only the typed
reader callbacks and the sharing case's timers are controlled. The maintained
group passed 14 Node and four retained Chromium cases. Consumer tracing found
the same host status API and wire owner. The read-only refactor pass found no
candidate beyond the temporary duplicate that slice 3 retires.

### 3. Refuse foreign host status requests at the wire

Type: Behavior
Status: planned

Behavior: A GET from the page's own origin answers real CPU percent (0–100)
and free bytes (above zero) with `no-store`; another origin or Host is refused
403 and a POST 405.

Proof: An in-process Node HTTP witness (`startInProcessBoundaryHttp` with
`installHostStatusMiddleware` in production mode and `rawRequest`) in two
cases: the refusals (no sampling), and one answer from the real platform
readers. Replaces the endpoint case of `host-status.spec.ts` (1). Retire that
spec once this and slice 2 are green. The real-reader answer is the named
exception to the ~100 ms case target (about 290 ms observed).

## Local gate and delivery

- Apply [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) selection
  before authoring or changing any test. Follow [AGENTS.md](../../../AGENTS.md)
  for default timeouts (no `test.slow()`, no suite, file or hook overrides)
  and awake macOS on AC power under `caffeinate -s -i` for long local checks.
  Apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- After each slice run the focused selection under the maintained runner, for
  example `caffeinate -s -i npm run test:dashboard:backend --
  'observation/(git-files-identity|host-status)\.spec\.ts$' --workers=1`
  (quiet when green), and `npm run typecheck:dashboard` after slice 1's seam.
  Take per-case times from `npx vitest run --config
  dashboard/backend.vitest.config.mts <files> --reporter=verbose`.
- Apply [consumer tracing](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  to `gitFilesIdentity.ts` and the two retired specs; `localWorkspaces.ts` and
  the spec that reads found workspaces are the consumers to confirm.
- Recount at the execution starting revision and record the final exact
  command with runner counts, per-case times against the campaign's ~100 ms
  target, summed case time, elapsed time and host load. Require zero legacy
  Chromium cases for this family and account for every retired case against
  the 7 inventoried above.

## Plan review

Refinement not needed: three slices each own one proof loop and cover all 7
observed baseline cases; the one structural change (the defaulted clock
parameter) sits inside slice 1 with its observed result, and no slice-specific
concern remains on the observed basis. The one named case-time exception is the
real-reader wire answer in slice 3.
