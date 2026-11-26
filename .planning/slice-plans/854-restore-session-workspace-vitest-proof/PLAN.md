# Restore dropped session workspace proof in Node Vitest

**Identity:** SEED-413#restore-session-workspace-vitest-proof

**Source:** [Restore dropped session workspace proof in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#restore-session-workspace-vitest-proof),
a retrospective correction of
[Prove Dashboard session workspace choices in Node Vitest](https://github.com/terryyin/open-dough/blob/daea1238c354addf980ff601d7b794fe4523c927/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-workspace-starts-on-vitest)
(completed plan at
[`daea1238c`](https://github.com/terryyin/open-dough/blob/daea1238c354addf980ff601d7b794fe4523c927/.planning/slice-plans/848-prove-session-workspace-starts-on-vitest/PLAN.md)).

## Provenance

Plan 848 was executed on `claude/prove-dashboard-session-workspace-choices-in-nod`.
The claim was `dffa94bab`, and slices 1–8 are commits `fed47784`,
`5f4484ae`, `08a530c4`, `122b3b18`, `baf46f35`, `abb188bf`, `431e93ba`
and `cc799350`. Its completed plan records each slice outcome and the story
comparison. An independent outcome review of `dffa94bab..cc799350` read the
deleted legacy specs at `dffa94bab` against their named owners. It produced
the findings below.

## Findings

1. **Scheduled feedback.** `feedback-maintenance-due-admission.spec.ts`
   replaced `feedback-maintenance-launch.spec.ts` and its eligibility cases,
   and lost these observations:
   - Admission must refuse a launch request carrying the page-sent
     `maintenance` mark (`agentLaunchAdmission.ts:136`). The named owner
     `feedback-maintenance-boundary.spec.ts` tests the settings endpoint,
     not this rule.
   - The "off" case also has an open invocation session, so the off switch
     is never observed alone.
   - The due date launching once after the developer marks their own
     invocation session done has no owner.
   - An unrelated open session neither blocking nor counting has no owner.
   - The `publishedReview()` paths for a failed ref read (`unread` with its
     `ref` diagnostic) and a missing watch list (`absent`) are no longer run.
   - `feedbackMaintenanceCheck.ts` grew from 292 to 297 lines, over the
     250-line check.
2. **Execution checkout timed-out wait.** The legacy
   `agent-launch-start-session-kept.spec.ts:112-185` case observed:
   - the timed-out answer (`keptWords("~/git/open-dough", "main")`);
   - `claim.publishedSha` kept after the held start finishes in the
     background;
   - on Continue, the project cwd, no instruction, and the
     `landingReporting.authority` workspace and branch.

   `execution-checkout-start-stops.spec.ts` reaches the kept start through a
   native refusal instead. The recovery E2E covers only the isolated wait,
   while its rewritten header names the new spec for the execution checkout.
   `keptWords` lost its only consumer.
3. **Distinct landing choice.** `pending-input-continuation.spec.ts` checks
   only one installed start. The legacy case showed worktrees `session` and
   `session-2`, with `session-2` established and the waiting workspace
   intact. The pending record names a `session` worktree that does not
   exist, so the new Start reuses that path.
4. **Confirmed Start with no policy.** No case confirms existing changes on
   a request with no policy and observes no `policy` and no
   `establishedSession`. The legacy landing-boundary spec did.
5. **Retained Codex isolated spec.**
   `agent-launch-start-session-isolated-codex.spec.ts` still runs on the
   legacy runner. The runner retirement condition "No workspace choice or
   scheduled launch case in this supplier's scope depends on the legacy
   backend runner" cannot hold while it does. It owns these Codex-only
   observations:
   - `thread/start` cwd taken from the established worktree;
   - the `codex/<slug>` namespace;
   - the input order: block, reporting, `Taken story`, then text.
6. **Test structure.**
   - About 70–90 lines of attempt-run setup repeat across six new specs. Two
     older specs repeat the call shape. The repeated parts:
     - origin preparation;
     - the `HOME` stub with project configuration and done marks;
     - the recording dispatch;
     - the accepted ad hoc attempt chain;
     - `attemptRun` with three no-op note callbacks.
   - About 45 lines of Start-to-reporting setup repeat between
     `story-bound-landing-capture` and `retained-landing-after-expiry`.
   - `admitted-session-competing-claim.spec.ts` is 253 lines.
   - These test bodies branch on their parameter:
     - `isolated-start-before-establishment.spec.ts:172-238` (`made`);
     - `admitted-session-start.spec.ts:138` (`cwdOf`).
   - Two `vi.waitFor` 30 s timeouts cannot take effect inside the default
     test limit:
     - `admitted-session-start.spec.ts:153`;
     - `isolated-start-before-establishment.spec.ts:187`.
   - Several real-Git cases run close to the 5 s default limit. Wrap-up's
     Intent Coverage probe at `29d112fb` saw the confirmed review and
     auto-land Start cases in `ad-hoc-existing-changes-start.spec.ts`
     (lines 160 and 178) exceed 5000 ms in all four local runs, at load
     average 30–51. Branch CI run 45791889476 passed them. Other cases at
     3.5–3.8 s: `retained-landing-after-expiry.spec.ts:150` and
     `story-bound-landing-capture.spec.ts:150`.

## Preserved promises and constraints

- Keep the reviewed story's goal, scope, key examples and every
  observation that plan 848 delivered. Product behavior stays unchanged.
- Follow the North Star on
  [direct production test boundaries](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Add zero test-support wrappers. Prefer a production contract change or a
  [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) builder step.
- Redesign oversize files by cohesive responsibility, with no plain split
  for size. Keep default test timeouts. An override must be essential and
  inside its test.
- Keep native dispatch, installed publication and real Git at the
  boundaries that observe them. The retained E2E journeys stay as plan 848
  names them.

## Current decisions

- `attemptRun` takes its publication, slow and worker notes in its typed
  services object rather than three positional callbacks. A MakeMe step
  builds an accepted ad hoc attempt with a policy, accepted now. Specs
  compose state directly from those, with no shared harness module.
- The Codex isolated observations move to Node Vitest within this
  correction, which keeps the reviewed story's own zero-legacy promise. The
  Codex host runs over its existing fake protocol through `attemptRun`.
  Moving the observations to `SEED-413#prove-native-first-input-on-vitest`
  instead would change that story's scope and needs the owner.
- `FeedbackMaintenanceCheck`'s review read (`ReviewRead`,
  `publishedReview()`) leaves `feedbackMaintenanceCheck.ts` as its own
  module. The read's failure paths are tested at that module.

## Execution context

- Story Branch Mode. Published Take `30000855dabe3893b6bacedefe9b091288c7337e`,
  starting at `9063489578dce292132da71da99337178bbffcdb`. The established start
  reported Changed since readiness review. The story scope and plan still agree.
- Owned Dashboard worktree `.worktrees/restore-dropped-session-workspace-proof-in-node`,
  branch `codex/restore-dropped-session-workspace-proof-in-node`, publisher
  `dashboard-territory.local-open-dough`, agent Kaoru-chan. Integration checkout
  `/Users/terryyin/git/open-dough`, target `origin/main`.
- Ordinary publication and GitHub Actions `ci.yml` observation follow the remote
  execution branch. Codex coordinator `seed-413-854-a3f5b09a`, mailbox
  `/tmp/dough-ci-501/watch-jekBo8`, cell `g620:10`, session `13436`, PID `9831`.
- Locked `npm ci`, Dashboard typecheck, and the Chromium prerequisite check
  passed in the owned checkout. No new replanning permission was selected.

## Ordered slices

### 1. Share the attempt run contract instead of repeating its setup

Type: Structure
Status: done
Estimate: 12–15 active minutes.

Removes finding 6's repeated attempt-run setup, branching bodies and
ineffective waits. Move `attemptRun`'s note callbacks into its services
object, updating `agentLaunches.ts` and every caller. Add the
accepted-ad-hoc-attempt MakeMe step. Recompose the six specs and the two
older `attemptRun` specs on them. Give each branching case its own test with
expectations in its parameter table. Drop the ineffective `vi.waitFor`
timeouts, or make an essential override inside its test. Bring
`admitted-session-competing-claim.spec.ts` under 250 lines by that
recomposition.

Proof. The eight `attemptRun` specs pass on one worker with unchanged case
observations and counts, aside from split cases. Typecheck and eslint are
clean, and each touched file is at most 250 lines after Prettier.

Outcome (9.2 active minutes). The eight Node specs retained all 22 baseline
cases and passed alongside the existing two worker-settlement cases. The
isolated Start and second-server Chromium journeys passed and observed the
durable publication receipt and both worker steps through the production
adapter. Admission and interruption cases use three-second polling budgets
inside the default five-second tests. The competing-claim spec formatted to
222 lines, and all affected files formatted to at most 250. Dashboard typecheck
and targeted ESLint passed. Independent refactoring reused the worktree reader
and a stateless Done substitute. Its eight affected cases and typecheck passed.

Branch CI run `45819534993` revealed one dynamically loaded fixture still
calling the old positional publication callback. The legacy
`accepted-attempt-settlement.spec.ts` reproduced the 30-second timeout. With
the fixture taking the named callback, its genuine follower request arrived
while the store lock was held, and the settled outcome arrived after lock
release. The case passed in 877 ms with no retries.

### 2. Restore the kept-start continuation observations

Type: Behavior
Status: done
Estimate: 10–14 active minutes.

Proof:
- An execution checkout start held past its wait answers the timed-out
  words through `keptWords`. The claim keeps `publishedSha` once the held
  start finishes in the background.
- Continue launches in the project with no instruction, and its
  `landingReporting.authority` names that workspace and branch. Correct the
  recovery E2E header.
- A distinct landing choice with a real waiting `session` worktree creates
  `session-2` and establishes it. The waiting workspace and its uncertain
  record stay intact.
- Confirming existing changes on a request with no policy records no
  `policy` and no `establishedSession`.
- Use the held installed start, a real bare origin and private stores.

Outcome (5.3 active minutes). The Node selection retained all nine baseline
cases. Eleven cases passed, including the timed-out execution-checkout Start
and confirmed Start without a policy. The timeout case observes the durable
claim SHA at the new origin revision, then the project cwd, absent instruction,
and persisted landing authority on Continue. The distinct choice establishes
`session-2` while the waiting worktree and uncertain record stay intact. The
retained Chromium isolated recovery journey passed and its header identifies
the Node timeout owner. Dashboard typecheck and targeted ESLint passed. Only
subject specs and the recovery header changed, with no refactor candidate in
the observed paths or their shared operations.

### 3. Restore scheduled feedback eligibility and review read failures

Type: Behavior
Status: done
Estimate: 10–14 active minutes.

Proof:
- Admission refuses a launch request carrying the page-sent `maintenance`
  mark.
- Through the real check loop:
  - with the setting off and nothing else open, nothing is admitted;
  - after the developer marks their own invocation session done, the due
    date launches once;
  - an unrelated open session neither blocks the check nor counts as the
    maintenance session.
- In the extracted review read module, a failed ref read answers `unread`
  with its `ref` diagnostic, and a missing watch list answers `absent`.
  Use a private origin or the real `gh` boundary that the read wraps.
- `feedbackMaintenanceCheck.ts` falls under 250 lines.
- The retained scheduled E2E journeys still pass.

Outcome (7.8 active minutes). The backend selection retained all ten
baseline cases and passed 14, including the existing admission journey.
The page-supplied mark passes schema validation and is refused by admission.
The check loop admits nothing when off, and after a persisted Done admits the
due date once while the unrelated session stays open and does not count.
The moved review reader exercises the real CLI transport across a ref 403
and a pinned watch-list 404. The scheduler formats to 245 lines. Both
scheduled E2E journeys and all three due-row E2E cases passed. Independent
review narrowed the eligibility assertions and its 11 affected Node cases
passed. Dashboard typecheck and targeted ESLint passed.

### 4. Move the Codex isolated start off the legacy runner

Type: Behavior
Status: done
Estimate: 10–14 active minutes.

Proof:
- Through `attemptRun` with the Codex host over its fake protocol, a real
  bare origin and the recorded installed start, an isolated Codex Start
  observes:
  - `thread/start` cwd at the established worktree;
  - the `codex/<slug>` namespace in the installed start;
  - first input in the order: block, reporting, `Taken story`, then the
    developer's text.
- Delete `agent-launch-start-session-isolated-codex.spec.ts`.
- `--list` over the 19 mapped paths shows zero legacy cases.

The Codex native dispatch is `launchHost` itself. The origin is prepared with
`startOrigin(repository, { host: "codex" })` and the Codex layout, and the
fake protocol's `env` is stubbed into `process.env`, which the Codex host
reads.

Outcome (7.1 active minutes). The Node case passed with the default limit.
It checks the real installed branch arguments and established Git revision,
the `thread/start` cwd, the durable reporting context, the exact order of
the four first-input parts, and native connection teardown. The mapped listing
went from 45 Node and one legacy case to 46 Node and zero legacy cases, with
the other 45 titles unchanged. The separately scoped maintenance admission
case remains with its supplier. The first Node trial hit its own test limit
with fixture setup in the body. The focused case passed with fixture lifecycle
in the hook, keeping the installed Start and observations in the test.
Dashboard typecheck and targeted ESLint passed. The retained isolated Chromium
reporting assertions still apply. Only subject specs and the cross-reference
header changed, with no refactor candidate in their shared operations.

### 5. Bring the real-Git landing and existing-changes cases well within the default limit

Type: Structure
Status: done
Estimate: 12–15 active minutes.

Removes finding 6's near-limit real-Git cases and the repeated
Start-to-reporting setup in `story-bound-landing-capture.spec.ts` and
`retained-landing-after-expiry.spec.ts`. Compose that setup from a shared
production contract where one exists. Find where the time goes in the
near-limit cases, such as repeated origin preparation or the installed start,
before changing it. Use an in-test override only where the remaining time is
essential.

Proof. `ad-hoc-existing-changes-start.spec.ts`,
`story-bound-landing-capture.spec.ts` and
`retained-landing-after-expiry.spec.ts` pass on one worker with unchanged
case observations and counts. Record before and after per-case times through
`OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD` with the load average, against
the baseline in the premise rows, under comparable local load.

Outcome (10.5 active minutes). A bounded Git trace found that installed Start
dominated private origin preparation. Both handoff cases now exercise real
production settlement and Start. The separate landing guard and publisher
cases begin with their actual durable pending or retained authority and real
Git, so they skip the unrelated interpreter and admission setup. Confirmed
Start cases reuse the production checkout fingerprint. All nine exact titles
and observations passed with the default limit, as did typecheck and ESLint.
Only the three subject specs changed and no refactor candidate remained.

| Case | Plan premise at load 14–19 | Final at load 17.82–19.82 |
| --- | ---: | ---: |
| Confirmed review Start | 3254 ms | 2388 ms |
| Confirmed automatically landing Start | 4530 ms | 3103 ms |
| Bound launch retained replay | 3481 ms | 2638 ms |
| Retained authority refusal | 2423 ms | 594 ms |
| Review reporting handoff | 2242 ms | 2323 ms |
| Pending landing authorization and capture | 2447 ms | 936 ms |

The nine-case fresh baseline passed at a lighter load of 12.86. Relative to
that run, the two independent landing cases improved from 1552 and 1959 ms.
The observed whole-run wall time varied with host contention.

## Decisive premises

All observations were made at `2882d92c1` in this preparation's workspace,
on Node v24.21.0 after `npm ci`. Scratch files were deleted afterwards.

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| The Codex host runs over its fake protocol through `attemptRun` in Node Vitest (slice 4) | A Node Vitest `attemptRun` of an isolated ad hoc Codex Start | A scratch spec under `dashboard/backend-tests/launches/`, run through `npm run test:dashboard:backend -- --workers=1`. It used the `native` dispatch `launchHost`, `installFakeCodex` with its `env` stubbed, `startOrigin(…, { host: "codex" })` and `recordStarts(origin, "codex")` | Launched in 2.6 s at load 18. `thread/start` cwd was `.worktrees/tidy-the-readme-wording`, and the installed start took `--branch codex/tidy-the-readme-wording`. `turn/start` input began with the established block. With the Claude origin layout, the start was refused: "do not establish a session". |
| The dropped kept-start, distinct-landing and no-policy observations still hold on current product (slice 2) | The legacy specs at `dffa94bab`, run at `2882d92c1` | `agent-launch-start-session-kept`, `-identity`, `-landing-boundary` and `-landing-retained` restored as scratch files and run with `npx playwright test -c backend.playwright.config.ts --workers=1 --reporter=line` from `dashboard/` | 6 passed, at load 10–13. Product paths since: `launchRun.ts` and `nativeSessionRun.ts` changed in `08a530c46`, with no change after `cc799350b`. |
| The dropped scheduled feedback eligibility and failed-read observations still hold (slice 3) | `feedback-maintenance-launch.spec.ts` and its eligibility cases at `dffa94bab`, with their `feedbackMaintenanceServer.ts` and `feedbackMaintenanceDue.ts` support at that revision | Same Playwright command | 3 passed, at load 13. The maintenance-mark refusal is at `agentLaunchAdmission.ts:136`, which has not changed since `6dc31fef1`. The legacy off case also had an open invocation session, so slice 3's off-alone test is the first observation of that case, as finding 1 records. The legacy run did not exercise the missing-watch-list `absent` path, so slice 3's test is its first observation too. |
| Near-limit real-Git cases (slice 5) | `npm run test:dashboard:backend -- --workers=1` over the three specs, with `OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD` | Per-case `durationMs` at load 14–19 | `ad-hoc-existing-changes-start` :160 3254 ms and :178 4530 ms; `retained-landing-after-expiry` :150 3481 ms and :207 2423 ms; `story-bound-landing-capture` :117 2242 ms and :150 2447 ms. |
| `feedbackMaintenanceCheck.ts` holds `publishedReview` and is over 250 lines (slice 3) | `wc -l`; `ReviewRead` at lines 119–126 | Read | 297 lines. |
| `keptWords` has no consumer (slice 2) | `git grep keptWords` | Read | Only its definition, at `dashboard/test-support/support/keptSessionStart.ts:43`. |

## Concern evidence

Refinement ran. It split the original slice 1, which held two proof loops,
into slice 1 (the attempt-run contract) and slice 5 (real-Git case cost).
Slice 5 is placed last so that slices 2–4 keep the numbers that other
records cite. This review found no remaining slice-specific concern.

## Local gates

- Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  to the plan and every repair handoff.
- Focused backend checks:
  `npm run test:dashboard:backend -- --workers=1 <spec paths>`.
- Named E2E paths: `npm run test:e2e -- --workers=1 <spec paths>`.
- Typecheck: `npm run typecheck:dashboard`.
- Follow [AGENTS.md](../../../AGENTS.md) for long macOS checks.
- Compare each slice's selection before and after on one worker, with
  `OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD`.

## Execution complete

Product advice: Keep the existing runner cutover scope and order. Recheck
its recorded workspace-choice prerequisite after this correction integrates.
