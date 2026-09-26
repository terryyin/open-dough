# Finish story 1's event synchronization and keep native evidence identities current

This bounded retrospective correction has this plan as its canonical home.

**Identity:** quick/102-finish-story-event-synchronization/PLAN.md
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9f8bd183a44a39a6dc43b29d34ac3a29167fcb9b93956ff444c2a37c8ad3f380"}}
```

## Source

Execution retrospective of plan
096 (`.planning/quick/096-quiet-stable-fast-tests/PLAN.md` at
`704cd2081d27ebea5fae061268e171056c46aadb`), which delivered story 1 of
SEED-037 (`SEED-037#quiet-stable-four-times-faster-tests`; its section is in
`.planning/seeds/SEED-037-quiet-stable-fast-tests.md` at the same commit).
Reviewed commits on `claude/096-quiet-stable-fast-tests`, `bad3717..3fc3a8b`:
`0fdf13c`, `caa2731`, `0d5b072`, `014bc3d`, `eb56cc4`, `f9487c9`, `1ebc353`,
`0d7602e`, `c511efd`, `e09f4bc`, `3fc3a8b`. `1991985` and `0199610` changed only
the plan and seed, and are provenance only. Findings were checked at `0199610`.

The story 1 promise this correction completes (seed, event synchronization):
"Tests wait for observable events, not for elapsed wall-clock time… Product
behavior driven by time uses a controlled clock, or an injected short interval
observed by event… CI observer and mailbox await timeouts; dashboard
auto-refresh intervals and rate-limit backoff." It also applies
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) §5.
Before evidence is reused, that section requires showing it still applies to
the current adapters, helpers, fixtures, and runtime conditions.

## Goal and scope

**Beneficiary.** Open Dough developers who rely on story 1's promise: a
passing test is stable because it waits on events, not on time.

**Bounded outcome.** Four problems are fixed:

- the listed mailbox and dashboard tests no longer wait a fixed real time
  before a "nothing happened" assertion;
- the mailbox `stop` refusal is bounded by the stop operation's own lifecycle;
- each retained native evidence identity changes when a native supervision
  helper changes;
- the evidence identities no longer repeat the supervision inputs by hand.

No retries, and no timeouts made longer without other change. Passing output
stays silent. Existing assertions stay unchanged.

**Current findings (at `0199610`):**

- **F1. Fixed 75 ms waits before mailbox "still quiet" checks.**
  - The sites:
    - `src/skills/dough-execute-plan/scripts/ci-mailbox-await-exact-cases.mjs:25`
      and `:100`;
    - `ci-mailbox-complete-success-cases.mjs:27`;
    - `ci-mailbox-await-exception-cases.mjs:93`.
  - Each then asserts `waiting.output() === ""`.
  - All four use `launchMailboxCommand`
    (`ci-mailbox-await-test-fixtures.mjs`). Its `waitForRechecks(count)`
    (`:84-88`) already resolves once the command has paused to recheck
    `count` times, or once it has ended. `ci-codex-completion.test.mjs:68`
    uses it for the same purpose.
  - The first recheck was measured at 55–67 ms on an idle machine. Under
    load, the empty-output assertion can pass before the command has read
    anything.
- **F2. A real 500 ms pause behind the dashboard's negative checks.**
  - `checksAskedWhilePassing` (`dashboard/tests/autoRefreshJourney.ts:181-191`)
    steps the paused page clock, then waits 500 ms of real time. Only then
    does it count the revision checks the page noted when it called `fetch`.
  - Eight `toBe(0)` assertions depend on it:
    - `auto-refresh-rate-limit.spec.ts:77,80,102,120`;
    - `auto-refresh-recovery.spec.ts:138`;
    - `auto-refresh-visibility.spec.ts:53,89`.
    Each is paired with `callsSince(...)` equal to `[]` over the server's
    `gh` calls.
  - `taken-slice-clock.spec.ts:122` counts checks during a passing window.
    It asserts that the page made at least one check and that no `gh` call
    other than a heads check happened. The second part is a negative that
    depends on the same pause.
  - The pause adds about 4.5 s of real time. Under load, a late request
    could still be missed.
- **F3. Retained native evidence identities miss the supervision helpers.**
  - `tests/support/native-run-supervise.sh` sources `native-run-stream.sh`
    and `tests/helpers/wait-for.bash`, which drive stream completeness and
    the deadline and grace waits. It also sources `native-run-watchdog.sh`
    (`:76`).
  - Only the `execution-review` case of `git-publication-native-evidence.sh`
    (`:34`) hashes `wait-for.bash`. No identity hashes `native-run-stream.sh`.
  - Each of these identity writers hashes `native-run-supervise.sh` and
    `native-run-watchdog.sh` from its own hand-written list, and nothing else
    of the supervision:
    - `story-branch-closure-native-run.sh:67-85`;
    - `trunk-closure-native-run.sh:20-37`, which also sources `wait-for.bash`
      directly;
    - `delivery-evidence-native-run.sh:93-123`;
    - the `git-publication` case of `git-publication-native-evidence.sh`;
    - `native-result-retain-journey.sh` (around `:81`);
    - `execution-worktree-prep-native-run.sh` (around `:115`).
  - The ADR-awareness context identity (`native-result-retain.sh:222-227`)
    hashes no supervision input at all. Yet `tests/dough-adr-awareness-context.sh:19`
    sources `native-run-supervise.sh`.
  - The same list is copied by hand in seven places (shotgun surgery). No
    deterministic test observes `input-hash` lines today.
- **F4. The worker-loss `stop` refusal is bounded by an arbitrary 10 s.**
  - `ci-mailbox-worker-loss.test.mjs:35` runs `stop` with `timeout: 10000`.
  - `stopMailbox` (`ci-mailbox-complete.mjs:24-39`) first waits for the
    terminal result, up to the product's `terminalResultDeadlineMs = 5_000`
    (`ci-mailbox-store.mjs:7`). Only then does it refuse to terminate the
    unrelated PID.
  - The command therefore takes about 5.1 s alone (measured at planning, load
    4). The 10 s limit leaves about 5 s for two Node startups. It killed the
    command at loads 181–240.

**Excluded** (SEED-037 story 2, or waiting for a human decision):

- installer-run cost;
- the 30 s CI-observer poll (a product decision);
- duplicated test wait helpers;
- other fixed `exec` timeouts, such as `ci-codex-lifecycle:101`,
  `ci-codex-stop-lifecycle:66`, `ci-fixture-lifecycle:53`,
  `ci-mailbox-launch:187` and `ci-revision-coverage-stop-states:62`;
- npm's banner;
- the hung-job reporting bound.

Making the 5 s terminal-result deadline injectable through the CLI is also
excluded. It would change the product, and it would only make the test
faster, which is story 2's work.

**Preserved promises and constraints:**

- product behavior is unchanged;
- existing assertions stay, including the negative assertions and the
  `callsSince(...)` equal to `[]` checks;
- runs that pass stay silent;
- plan 096's decisions still apply:
  - shared waits stay inside their module boundaries;
  - `tests/` gets no imports from `src/skills/*/scripts`;
  - "Stable means cause-fixed".

**Assumptions:**

- The dashboard server makes `gh` calls only in response to page requests.
  `trackedGh.ts` has only a per-call timer. So once every request the page
  made has been answered, no further `gh` call can arrive.
- The retained native evidence identities are the seven writers listed under
  F3. Slice 3 confirms this list by searching for `native_result_input_hash_line`.

## Outside-in proof

| Promise | Slice | Observation |
| --- | --- | --- |
| A "still quiet" mailbox check asserts only after the command has read and rechecked | 1 | A temporary product break writes a receipt before the first recheck, and the tests fail. |
| The `stop` refusal ends by the stop command's own lifecycle, not a test-side guess | 1 | No `timeout` is left on that call; the call waits for the stop command's own exit, bounded by the product's terminal-result deadline. A temporary break that makes `stop` terminate the unrelated worker fails the test. |
| A dashboard negative check sees every request the page made during the window, without waiting in real time | 2 | No `setTimeout` or `waitForTimeout` is left in `dashboard/tests/autoRefreshJourney.ts`. Temporary product breaks that send a request during each window make each negative fail. |
| Each retained native evidence identity changes when any native supervision input changes | 3 | A deterministic check changes `wait-for.bash` (and each other input on the list) in a scratch copy, and every identity writer's `input-hash` output changes. |
| One list of supervision inputs | 3 | Every identity writer takes the supervision inputs from one list; no writer repeats them by hand. |
| Quiet and stable runs | 1, 2, 3 | The affected files pass silently alone, under the default runner (`PATH=/opt/homebrew/bin:$PATH npm test`), and in a run with CI-like Git settings (`GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1`). |

## Current decisions

- **Wait for events the fixtures already have.** Slice 1 uses
  `waitForRechecks` and the command's own exit. Slice 2 watches from inside
  the page, in `autoRefreshJourney.ts`, beside `noteChecksInPage`. Slice 3
  keeps the list of supervision inputs next to the helper that sources them
  (`native-run-supervise.sh`). The hashing stays in `native-result-retain.sh`.
- **No new arbitrary bounds.** Where the product's own deadline already
  bounds a wait, the test relies on that deadline and does not add a timeout
  of its own. Where a count, such as the number of rechecks or page turns, is
  a hypothesis, a temporary product break must show that the assertion
  catches the failure it guards against.
- **A temporary break is proof, not product.** Each break is made only in a
  scratch change, observed, and reverted. The plan's Learnings record the
  break and what failed.
- **No North Star topic.** The work is test infrastructure inside existing
  boundaries. ADR 0005 §5 is followed; nothing conflicts with it.

## Ordered slices

### 1. Mailbox CLI tests end their waits on the command's own events

Type: Structure (retrospective correction F1, F4)
Status: planned
Proof:
- **F1.** At the four sites, replace the 75 ms wait with
  `await waiting.waitForRechecks(n)`. Use `n = 2` when an event is published
  after launch, as in `ci-mailbox-await-exception-cases.mjs:93`, so that at
  least one full read follows the publication (the precedent is
  `ci-codex-completion.test.mjs:68`). Otherwise use the smallest count that
  follows one complete read.
  - The assertions stay unchanged.
  - Sensitivity: a temporary product break makes `await-revision` or
    `complete-revision` print its receipt for pending coverage. All four
    empty-output assertions must then fail.
- **F4.** Remove `timeout: 10000` from `ci-mailbox-worker-loss.test.mjs:35`.
  The stop command's own terminal-result deadline bounds its run, and the
  test waits for the process to exit by itself.
  - Sensitivity:
    - a temporary break that makes `stop` terminate the worker without
      checking its identity fails the `process.kill(unrelated.pid, 0)`
      assertion;
    - a break that makes it wait with no end hangs visibly. This only
      confirms that no hidden bound is left, and the case is recorded rather
      than kept.
  - Record in Learnings why no test-side bound is added: the product's own
    `terminalResultDeadlineMs`.
- **Runs.**
  - The five files that run these cases pass silently alone under
    `node --test --test-reporter=./tests/support/node-test-failures-reporter.mjs`.
    They are `ci-mailbox-await.test.mjs` and `ci-mailbox-complete.test.mjs`,
    which import the case modules, and `ci-mailbox-worker-loss.test.mjs`.
  - They also pass under the default runner and in one CI-like Git run.
  - Load stress: run the three files as 12 or more concurrent copies. Record
    before and after, the loads, and the copies in Learnings. Record no
    failures after the change.

Structure: the four quiet checks and the `stop` refusal wait on what the
mailbox command signals (recheck pauses, process exit) instead of on elapsed
time. The weakness removed is that a quiet assertion could pass before the
command had read anything, and that a stop killed at a guessed limit failed
under load. The external behavior the tests prove stays unchanged.

### 2. Dashboard negative checks settle on the page's own requests, not real time

Type: Structure (retrospective correction F2)
Status: planned
Proof:
- `checksAskedWhilePassing` no longer waits in real time.
  - After the clock steps, it gives the page its message turns: pull
    `setPageVisibility`'s `MessageChannel` turn loop into one shared helper
    and reuse it there.
  - It then waits, inside the page, until every request to the local
    boundary that the page made during the window has been answered. Extend
    `noteChecksInPage` to track outstanding `fetch` promises, including
    requests other than revision checks.
  - Then it returns the number of checks.
  - `grep -n 'setTimeout\|waitForTimeout' dashboard/tests/autoRefreshJourney.ts`
    finds nothing.
- Sensitivity: for each of the four selected tests, a temporary product break
  makes the page send a request inside the quiet window. Examples: ignore the
  rate-limit wait GitHub directs, check while hidden, or check sooner than the
  steady pace. Each affected `toBe(0)` must fail. For
  `taken-slice-clock.spec.ts:122`, a break makes the page read one more thing
  during that window, and the non-heads-call assertion must fail.
- Runs: `npm run test:dashboard -- --grep 'auto refresh rate limit|auto refresh recovery: a failed check|auto refresh: a hidden page|clock measures from the later'`
  selects exactly 4 tests, which pass silently with `--repeat-each 5`. The
  whole dashboard suite then passes silently once.

Structure: the negative checks observe the page's own request lifecycle
instead of waiting 500 ms of real time. The weakness removed is that a late
request under load could be missed, which let a negative pass without
checking anything, and the pause added about 4.5 s of real delay. The
auto-refresh behavior the tests prove stays unchanged.

### 3. Every native evidence identity includes the one list of supervision inputs

Type: Structure (retrospective correction F3)
Status: planned
Proof:
- **One list.**
  - `native-run-supervise.sh` declares its supervision inputs:
    `tests/support/native-run-supervise.sh`,
    `tests/support/native-run-stream.sh`,
    `tests/support/native-run-watchdog.sh` and
    `tests/helpers/wait-for.bash`.
  - `native-result-retain.sh` gets one function that writes an `input-hash`
    line for each input on that list.
  - The seven identity writers from F3 call that function in place of their
    hand-written supervision lines, and the ADR-awareness context identity
    gains it.
  - Before the change, confirm the list of writers:
    `grep -rn native_result_input_hash_line tests/support`.
  - Where a writer's `input-hash` lines are written inline inside a larger
    finalize function, move them into a function that can be called on its
    own, so the check can call it.
- **Deterministic check.** Extend `tests/native-result-retention.sh`, or add
  one check beside it if that check cannot reach the writers without
  credentials.
  - For each writer, capture its `input-hash` lines from a scratch copy of
    the source.
  - Then change `tests/helpers/wait-for.bash` in the copy, and each other
    input on the list in turn. The lines must change for every writer.
  - Sensitivity: a temporary break that removes the shared call from one
    writer makes the check fail and name that writer.
- **Runs.** `shellcheck` passes on the changed shell files. The check passes
  silently alone with Bash 5 (`PATH=/opt/homebrew/bin:$PATH`, because macOS's
  `/bin/bash` hides some `set -e` failures). It also passes under the default
  runner and in one CI-like Git run. The existing native checks still pass,
  among them `native-run-timeout.sh`, `native-run-watchdog-cleanup.sh`,
  `native-result-retention.sh` and `git-publication-native.sh` in its
  substitute mode.

Structure: native evidence identities take the supervision inputs from one
authoritative list. The weakness removed is twofold. First, a change to
`wait-for.bash` or `native-run-stream.sh` left the retained evidence
looking current, against ADR 0005 §5. Second, the identities copied the list
by hand in seven places. What each native run does, and every other line
of the record, stays unchanged.

## Learnings

- **Planning, `0199610`, load 4.4:**
  - `node --test --test-name-pattern='reused worker pid' ci-mailbox-worker-loss.test.mjs`
    took 5.10 s. That is the product's 5 s terminal-result deadline plus
    startup, which confirms F4's cause.
  - `npx playwright test --config dashboard/playwright.config.ts --list --reporter=list --grep '<slice 2 grep>'`
    selected 4 tests in 4 files. The broader grep
    `'auto refresh|each Taken card'` selected 8 in 6 files, including tests
    that never call `checksAskedWhilePassing`, so slice 2 uses the narrower
    grep.
