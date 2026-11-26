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

## Ordered slices

### 1. Share the attempt run contract instead of repeating its setup

Type: Structure
Status: planned
Estimate: 12–15 active minutes.

Move `attemptRun`'s note callbacks into its services object, updating
`agentLaunches.ts` and every caller. Add the accepted-ad-hoc-attempt MakeMe
step. Recompose the six specs and the two older `attemptRun` specs on them.
Give each branching case its own test with expectations in its parameter
table. Drop the ineffective `vi.waitFor` timeouts, or make an essential
override inside its test. Bring `admitted-session-competing-claim.spec.ts`
under 250 lines by that recomposition. Then compare the landing specs'
Start-to-reporting setup and compose it the same way where it shares a
production contract.
Reduce the cost of the near-limit real-Git cases, so they finish well
within the default limit under local load. Find where the time goes, such
as repeated origin preparation or the installed start, before changing it.
Use an in-test override only where the remaining time is essential.

Proof. Every touched spec passes on one worker with unchanged case
observations and counts, aside from split cases. Typecheck and eslint are
clean, and each file is at most 250 lines after Prettier. Record before and
after summed case time. Rerun the near-limit cases under comparable local load
and record their times and the load average.

### 2. Restore the kept-start continuation observations

Type: Behavior
Status: planned
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

### 3. Restore scheduled feedback eligibility and review read failures

Type: Behavior
Status: planned
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

### 4. Move the Codex isolated start off the legacy runner

Type: Behavior
Status: planned
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
