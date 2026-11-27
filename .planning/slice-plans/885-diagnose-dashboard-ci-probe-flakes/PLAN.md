# Diagnose Dashboard CI probe flakes

**Identity:** SEED-413#diagnose-dashboard-ci-probe-flakes

**Source:** [Diagnose Dashboard CI probe flakes](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#diagnose-dashboard-ci-probe-flakes), based on the maintainer's 2026-11-27 backlog request. Probe branch names, revisions, and job URLs were not supplied.

## Findings and scope

| Probe finding | Preserved behavior and observation |
| --- | --- |
| [`launches/responsive-unattached-startup.spec.ts:156`](../../../dashboard/frontend-tests/launches/responsive-unattached-startup.spec.ts#L156) twice reported zero terminal presentations where the test expected one. | A blank keyboard start presents the correct session's terminal once and leaves focus on the other task. Determine whether the test asserted before presentation could settle, or whether presentation was missed. |
| `VITEST_BROWSER_CONNECTION_CLOSED` appeared once during [`intent/intent-scope-timing-history-provenance.spec.ts`](../../../dashboard/frontend-tests/intent/intent-scope-timing-history-provenance.spec.ts). | The Intent spec still proves the timing history's build provenance. Establish whether the file started and reached its assertion, and where the browser connection failed. |

The maintainer observed these specific occurrences on probe branches only and
reported both unresolved. The same disconnect signature has separately
occurred on main. [Plan 881](../881-keep-full-frontend-runs-connected/PLAN.md)
already owns the frontend browser-connection repair. Compare this occurrence
with its evidence and give that owner any matching or distinguishing
observations. A shared error code alone cannot establish a shared cause.

Keep the existing assertions and apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Use the existing frontend Vitest runner in keeping with the
[Architectural North Star](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).

## Ordered slices

### 1. Attribute each CI probe failure

Type: Behavior (early probe)
Status: done

Behavior: Given the three reported probe occurrences, comparing the original
CI evidence and a focused replay gives maintainers the cause and repair owner
for each failure, or a precise record of the missing observation that prevents
attribution.

Proof:
- Recover the probe job logs and retained browser output if available. Record
  the branch, revision, run/job, attempt, and relevant log excerpt. For the
  terminal case, compare the attempt observation, terminal callback, and
  assertion order. For the Intent case, compare the last file-start and
  browser/socket events with plan 881's findings.
- If the logs leave the terminal ordering unresolved, replay
  `npm run test:dashboard:frontend -- responsive-unattached-startup.spec.ts`
  on the matching revision and worker profile where possible. Use at most
  three focused diagnostic runs and capture the callback and assertion order.
  For the disconnect, use the existing owner's full-run evidence and avoid
  launching a duplicate full-suite reproduction.
- Record a conclusion and owner for each symptom, or the missing signal and
  next discriminating check when the evidence is inconclusive. A passing replay
  leaves the failure open. Identify retained proof for any subsequent repair
  before changing a test, runner, or product behavior.

Local gate: a focused runner invocation for the terminal symptom if needed.
Run any long macOS check from a fully awake machine on AC power under
`caffeinate -s -i` per [AGENTS.md](../../../AGENTS.md).

#### Findings (2026-11-27)

| Occurrence | Branch @ revision | Run / job (attempt 1) |
| --- | --- | --- |
| Terminal 1 and the disconnect, same job | `probe/viewport-after-device-scale-d7e` @ `3fc2b1fb4` | CI run `45992989916`, job `140485272968` (cancelled run; job failed) |
| Terminal 2 | `probe/viewport-leaker-27a` @ `1052f7a37` | Probe run `45999181750`, job `140506165000` |

The same terminal failure also hit branch CI runs `45988567463`
(`4dea577e9`) and `45995513122` (`1e2fd49f6`), so it is not probe-specific.
No failure of it appears in failed runs from 2026-11-20 until 11:12Z on
2026-11-27. The spec, `mountComponent` and the launch code were unchanged
over that span. CI moved to one frontend shard at `403be9cce` (06:10Z), which
fits a load-sensitive race but does not prove the onset.

**Terminal: the test asserts before presentation settles.** Presentation is
correct and arrives late. The excerpt is `expected "vi.fn()" to be called 1
times, but got 0 times` at `:158`. The trace shows that every DOM wait in
`startWith` passed between +262 and +265 ms, after the ended answer. The DOM
wait and the mock check race:

- `mountComponent`'s `rerender` is a plain `root.render`, a default-lane
  update. That commit re-enables Start, because `shownAttempt` returns
  `undefined` for a launched outcome. `useAskedLaunches` then calls
  `onLaunched`, and so `presentTerminal`, from a passive `useEffect`. React
  flushes that effect in a later task.
- `await expect.element(...)` can resolve between that commit and the effect
  task. The spec's synchronous `toHaveBeenCalledTimes(1)` then sees zero.

Focused replay (load averages 35–43, `npm run test:dashboard:frontend --
responsive-unattached-startup.spec.ts` with a scratch `MutationObserver` that
resumes `startWith` at the re-enabling commit, since reverted):

- Run 1 failed both blank cases deterministically with the CI message. It
  recorded `enabled-commit presented=0` and `after-toBeEnabled presented=0`.
- Run 2 added a poll after the check. It recorded `test-check t=4563.2
  presented=0`, then `present t=4564.4`, with the correct session, control and
  `takesKeyboard: false`. Both blank cases passed.

The refused-admission case (`toHaveBeenCalledOnce()` after `toBeEnabled`)
has the same race. The instructed case's `not.toHaveBeenCalled()` would pass
even if presentation came late. Owner: slice 2. The scratch hook from run 1
is its discriminating proof.

**Disconnect: plan 881's closure, before the file started.** The excerpt is
`Failed to run the test …/intent/intent-scope-timing-history-provenance.spec.ts`,
then `Browser connection was closed while running tests` from
`@vitest/browser/dist/index.js:3101`, then `[birpc] rpc is closed, cannot
call "createTesters"`, and finally `Vitest reported no cases for` that file.
The run reported `241 passed (329)`. The last case passed at
11:48:57.997Z, and the closure followed at 11:48:58.017Z. The file never
started and never reached an assertion. It was only the next file scheduled.
This matches the premise plan 881 settled from main run `45958801316`.
Seventeen other failed runs from 2026-11-24 to 2026-11-27 show the same
`createTesters` chain on 17 different files, Intent and others. Nothing
distinguishes this occurrence, and it adds no new closer signal. Owner: plan
881, Taken by another execution. This plan leaves that plan's files
untouched.

### 2. A blank start's terminal presentation is awaited, not raced

Type: Behavior
Status: done

Behavior: Under any scheduling between the commit that re-enables Start and
the effect that presents the terminal, the responsive startup cases observe
presentation once it happens. The cases still prove the same presentation:
the correct session, the launcher as control, and whether it takes the
keyboard.

Proof:

- In `responsive-unattached-startup.spec.ts`, wait for the presentation
  (for example `await expect.poll(() => presentTerminal.mock.calls).toHaveLength(1)`)
  wherever a case expects one. This covers the blank and whitespace cases and
  the refused-admission retry. Keep every existing assertion and leave the
  product code unchanged.
- Discriminating check: reapply slice 1's scratch commit hook. It fails the
  current spec, and with the repair the cases pass. Revert the hook.
- One focused run of the unmodified repaired spec passes.
- The publication's CI `dashboard-frontend` job passes.

Accepted proof (2026-11-27, load averages 54–57): two cases now `await
expect.poll(() => presentTerminal.mock.calls).toHaveLength(1)`. With the
scratch commit hook, the focused spec passed 4/4, and the hook was then
removed. The unmodified repaired spec also passed 4/4, and
`typecheck:dashboard` passed. The consumer trace finds no consumers beyond
the spec's own cases.

CI repair (run `46011428917`, `e2e / shard 6/6` on `c446520f5`). A test-side
write to `agent-launches.json` raced the page's `/reconciled` rewrite, which
happens under the store's lock. The test's write took no lock. Two Cursor
recovery specs now change records through the new
`changeKeptSessionsBesideServer`, which takes that lock. See
[diagnosis-cursor-done-no-recover.md](diagnosis-cursor-done-no-recover.md).
Proof: `cursor-session-recovery.spec.ts --repeat-each 5` passed 30/30, the
recovery-stops spec `--repeat-each 3` passed 3/3, and the e2e typecheck
passed. Named follow-up from the refactor pass: other unlocked test writes
to the launch store, made beside a running server after a page start, can
race the same way. Representative files:
`e2e/sessions/recently-done-sessions-sidebar-reopen.spec.ts`,
`e2e/sessions/agent-launch-retained-history.spec.ts`,
`e2e/launches/agent-launch-story-card-open-session.spec.ts`,
`dashboard/test-support/runningCursorSessionsPage.ts`.

Failure policy: [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Plan review

One bounded probe uses the shared CI evidence and leaves repair sizing to the
findings. The probe owns log availability, reproduction, and cause
attribution. The current evidence does not establish either cause.

## Execution complete

Product advice: No change. The disconnect evidence supports plan 881's
existing premise, a browser-side closure before `createTesters`, on 17 more
files. It adds no new closer signal. Plan 881 keeps that repair.
