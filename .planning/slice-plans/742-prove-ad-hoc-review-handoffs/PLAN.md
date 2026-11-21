# Prove ad hoc review handoffs with typed handlers

**Identity:** SEED-413#prove-ad-hoc-review-handoffs-with-typed-handlers
**Source:** [Prove ad hoc review handoffs with typed handlers](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-ad-hoc-review-handoffs-with-typed-handlers)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

Give dashboard maintainers Node Vitest feedback on the three remaining ad hoc
review handoff specs. Move their setup to MakeMe launch state and real Git
repositories. Keep the race, pending binding, and emitted command proofs
at the production entries that make those decisions. Retire
`dashboard/test-support/support/adHocReview.ts` and
`dashboard/test-support/support/branchResultValidation.ts`.

The [backend campaign](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-later-dashboard-backend-unit-test-families)
retains the other families, Story Notes storage and runner retirement. The
developer's broader native Done and terminal lifecycle proofs stay with
`sessions/`. Keep application behavior, reporting receipts, local-origin
admission and the shared review contract.

## Key examples and proof

| Promise | Observable proof and owner |
| --- | --- |
| A quiet completion overtakes a manual Done held between Git capture and the record write | Slice 2. In `ad-hoc-branch-result-race.spec.ts`, hold the first capture, report quiet Done with the later commit present, then release and await manual Done. Read the kept record through `storyReview`. Assert the later tree, the exact baseline and later pins, exclusion of the earlier pin, and an unused native stop collaborator. |
| A quiet Done report submitted before native binding keeps the verified manual landing | Slice 3. In `ad-hoc-manual-landing-precedence.spec.ts`, submit completion for an unbound attempt, observe `pending-native-session`, then bind. Review from the resulting record returns `landed` with the exact prior and new trunk revisions. |
| The emitted command binds the original checkout's own branch to its launch | Slice 4. In `ad-hoc-session-branch-handoff.spec.ts`, use production first input, execute the exact displayed command in the original checkout, and give its observed request to production admission. Assert the admitted receipt's session, canonical workspace, draft branch and entered commit. |
| The migrated cases run on plain Node Vitest and their spent support is gone | Slices 2–4. Run each migrated file through the standard backend entry, confirm Vitest selects it, and search the whole checkout for imports and old runner references before deleting helpers. |

## Current decisions

- Follow the [North Star for directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e),
  and [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
  Keep the same launch, branch entry, completion receipt and review facts
  across production and proof. Prefer MakeMe's existing launch, attempt,
  completion, checkout and session review builders over a new helper layer.
- **Existing seams.** Use `NativeDoneMarks` for manual Done and its native
  continuation, `setRecordDoneAt` for the persisted transition,
  `deliverCompletion` for the report, `bindRecord` for native binding, and
  `storyReview` for the selected comparison. The two review cases are about
  how the record acquires its evidence. Build the state before the triggering
  operation and read the resulting state afterward. `aHeldDone` and
  `ad-hoc-branch-result-supersession.spec.ts` demonstrate the hold and real
  Git pin checks. Their manual-vs-manual case and the quiet-report-vs-manual
  case protect different producers.
- **Handoff.** Use `unattachedInput` and the existing branch-entry command
  from `reportingInstruction`. Admit its captured request through the same
  validation and launch lookup the HTTP route calls. Reuse
  `recordSessionBranchEntry` for checkout validation and ref writes.
  Introduce an exported typed admission only if the current production
  entry still wraps it in `IncomingMessage`. Keep schemas, refusal status,
  origin binding and optional landing-context response on that same path.
  Use an inline fetch substitution at the process boundary to capture the
  command's outgoing request. Git resolves the path and branch in the
  actual child process. No server is needed to prove either the command's
  payload or what admission and the handler do with it.
- **Concurrent changes.** Recheck the landed forms of plans
  [734](../734-split-done-mark-decision-from-store/PLAN.md),
  735 (done; `9969388:.planning/slice-plans/735-propose-branch-entry-from-typed-inputs/PLAN.md`) and
  [738](../738-decide-landings-over-typed-attempts-and-records/PLAN.md) before
  editing their shared entries. Those plans may improve the existing seams.
  This plan can use today's adapters and preserves the same named proof
  cases, so it does not require those stories as startup suppliers.
- **File size.** `doneMarks.ts` is already 250 lines. Slice 1 owns any
  required split there. Keep coordination and tracking in `NativeDoneMarks`
  and move the native finish operation (host effect, terminal and durable
  result) as a unit. Its only production callers are the class's manual
  and reported continuations. Preserve both paths and shutdown behavior.
  `sessionBranchEntry.ts` is 233 lines. In slice 4, move wire and typed
  admission together into their own module if the split exceeds the
  250-line [check](../../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#file-size).
  Keep the production route and receipt connected and preserve the handler's
  tests at its existing entry.

## Decisive premises

Observed in the preparation worktree at `953a8a123` on 2026-11-20, on AC
power. “Focused Playwright” below means:

```sh
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR ./node_modules/.bin/playwright test --config dashboard/backend.playwright.config.ts ad-hoc-branch-result-race.spec.ts ad-hoc-manual-landing-precedence.spec.ts ad-hoc-session-branch-handoff.spec.ts --workers=2 --reporter=line
```

| Consuming operation | Result and boundary |
| --- | --- |
| The legacy tests reach the preserved outcomes (slices 2–4) | Focused Playwright passed 3/3 in 5.1 s. After reverting the scratch changes below it passed 3/3 in 11.9 s. These runs establish the existing assertions. Their wall-clock variation leaves any speed claim to a comparable before/after measurement. |
| The late manual write can replace the report's captured revision if its stale-write check is wrong (slices 1–2) | On the focused run, inverting the comparison of the live and candidate Done times in `recordDoneAt.ts` failed the race at the review tree assertion. Review returned the earlier commit instead of the later one. |
| Native binding reads a manually landed Git pair (slice 3) | On the same runner with only `ad-hoc-manual-landing-precedence.spec.ts` selected, disabling the manual comparison for an unreported landing in `sessionBranchCapture.ts` left Review `unavailable` instead of the asserted landed pair. Suppressing the copy of a reported pair from the attempt left this case green, confirming that a composed reported landing would miss this path. |
| The emitted command uses the actual checkout branch and resolves its reporting launch (slice 4) | Replacing branch detection with a constant `main` in the focused run failed at the command exit assertion with the production trunk refusal. Separately, `caffeinate -s -i node --input-type=module` invoked the real `unattachedInput` for a composed reporting request, ran its command with `/bin/sh -c` in a temporary `draft` Git checkout, and intercepted only `fetch` through Node `--import`. It observed the exact route, POST, origin, launch reference, host, source, canonical workspace and Git-derived branch. The Playwright result supplies the current production admission observation. The slice must connect both observations in the new Vitest proof. |

All scratch edits were reverted. The two imports of `adHocReview.ts` and
the one import of `branchResultValidation.ts` are in the two migrated
review files. Sweep selectors and indirect consumers again at execution.

## Ordered slices

### 1. Let the Done coordinator use a controlled branch capture

Type: Structure
Status: done

Expose the narrow production collaborator from `NativeDoneMarks` to the
manual `setRecordDoneAt` invocation so the race in slice 2 can wait at real
Git capture before its save. Keep today's production default and the manual
and report continuations. Reuse a landed capture seam if available. Keep
host effects and durable outcome ordering, using the file seam above.

**Proof.** Retain the original Playwright race and run the focused
`sessions/agent-launch-done-close` cases. The race observes the winner and
no stop, and the close cases observe an abandoned rename and the independent
manual stop. Use the next slice for the typed invocation's race proof.

**Accepted proof and learnings.** `doneMarks.ts` (179 lines) forwards optional
`DoneCollaborators.capture?: BranchCapture` to `setRecordDoneAt` and narrows
`markDone`'s `launches` parameter to `DoneLaunches = Pick<AgentLaunches, "stateOf">`;
`finishNativeDone.ts` (103 lines) extracts the native finish operation.
Verified by `npm run typecheck:dashboard`,
`npm run test:dashboard:backend -- review/ad-hoc-branch-result-race.spec.ts sessions/agent-launch-done-close.spec.ts --workers=2`,
and consumer specs `review/ad-hoc-session-commits{,-done}.spec.ts` and
`sessions/{agent-completion-quiet-rename,agent-launch-done,agent-launch-done-stop}.spec.ts`.

### 2. Keep the quiet report's revision after a held manual Done

Type: Behavior
Status: done

Arrange an isolated kept launch and matching reporting attempt, a real
checkout and two successive commits. Call `NativeDoneMarks.markDone` with
its explicit host and terminal collaborators and hold the selected capture.
Call `deliverCompletion` with the matching quiet `CompletionSubmission`,
reporting origin and same marks owner. Release and await manual Done in
cleanup. Read the actual saved record with `storyReview` and query the real
pins. Observe native stop on the same coordinator. Move the race to Vitest
and remove the now-unused `branchResultValidation.ts` fixture.

**Proof.** Assert all race signals in the proof table. Scratch bypassing the
stale capture guard should break the replacement just as it broke the
legacy case. Run the adjacent branch supersession and worktree result cases
for unchanged Git capture and pin behavior.

**Accepted proof and learnings.** `ad-hoc-branch-result-race.spec.ts` (158 lines)
runs on plain Node Vitest (`[node]`), holding `captureBranchResult` on `earlier`
inside `NativeDoneMarks.markDone`, delivering quiet `deliverCompletion` on `later`,
and verifying `{ kind: "branch-result", baseline, tree: later }` through `storyReview`,
`sessionBranchPins` `[baseline, later]` excluding `earlier`, and unused `doneStop`.
Scratch inverting `record.doneAt !== candidate.doneAt` in `doneTransition.ts` failed
the tree assertion (`earlier` vs `later`). Deleted `branchResultValidation.ts` and
unused `launchIsolatedReview` in `adHocReview.ts`. Verified with `typecheck:dashboard`
and `test:dashboard:backend` across `ad-hoc-branch-result-race`,
`ad-hoc-branch-result-supersession`, `ad-hoc-branch-worktree-result`, and
`ad-hoc-manual-landing-precedence`.

### 3. Keep the verified landed pair when an early report binds

Type: Behavior
Status: done

Arrange the reporting attempt without an outcome or accepted landing pair
and a corresponding isolated `LaunchRecord` that has yet to bind. Push
the work to a private real Git origin. Call `deliverCompletion` with the
attempt's submission and origin, then `bindRecord` with the source and
record. Use the same real attempt and record persistence for both calls.
Read that saved record with `storyReview`. Move the case to Vitest and
delete `adHocReview.ts` after the import sweep.

**Proof.** A pending receipt precedes binding, and the final review contains
the verified pair. Scratch suppressing the real manual comparison should
fail the landed review assertion. Run the neighboring completion-binding
and manual-landing cases for independent binding and comparison behavior.

**Accepted proof and learnings.** `ad-hoc-manual-landing-precedence.spec.ts`
(104 lines) runs on plain Node Vitest (`[node]`), pushing `early` to private
`origin` `HEAD:refs/heads/main`, observing `pending-native-session` with unused
`NativeDoneMarks.reported` from `deliverCompletion`, then calling `bindRecord`
and observing the matched `earlyReport?.receipt` and `{ kind: "landed", baseline, tree: early }`
through `storyReview`. Scratch suppressing `manualLandingComparison` in
`sessionBranchCapture.ts` failed at line 99 with `{ kind: "unavailable" }`.
Deleted `adHocReview.ts`. Verified with `typecheck:dashboard` and
`test:dashboard:backend` across `ad-hoc-manual-landing-precedence`,
`ad-hoc-manual-landing`, and `sessions/agent-completion-binding` (12/12 pass;
initial 5038 ms load spike on `ad-hoc-manual-landing.spec.ts:46` at 1-min load
26.27 attributed to its multi-Done Git setup, whose restructuring is actively
owned by Taken sibling `SEED-413#restore-done-capture-proof-after-composed-reviews`,
plan 743 Slice 6, so that file was preserved untouched).

### 4. Prove the branch-entry command through its typed admission

Type: Behavior
Status: planned

Build one Default main recorded request and its distinct retained launch
reference, then create the draft branch and entered commit in its
registered checkout. Run the command from `unattachedInput` as emitted.
Capture the request values at child `fetch` and pass them through the
production typed admission and branch-entry handler, backed by the real
checkout and an explicit retained-session input or private store.
Keep the default route wired to that same entry.

**Proof.** Observe the emitted command's URL, method, origin, launch and
Git-derived branch, and the production receipt's session, canonical
workspace, branch and entered tip. Exercise the branch-entry contract's
session and reporting-reference variants with their actual inputs when
extracting admission. Preserve the existing wrong-origin, unknown session
and trunk refusals at their owning boundary. Run `ad-hoc-session-branch-entry`
and `sessions/agent-completion-input` for branch-entry and first-input
regressions. The new case must fail when branch detection is forced to trunk.

## Local gates

- Apply [MakeMe selection](../../../.agents/skills/dough-makeme/SKILL.md),
  the [test boundary rule](../../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#choose-the-test-boundary),
  and the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Keep the default test timeout. Run focused commands with
  `caffeinate -s -i` on AC power under the
  [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- From the execution checkout, run `npm run typecheck:dashboard` and, under
  the guard, `npm run test:dashboard:backend -- review/ad-hoc-branch-result-race.spec.ts review/ad-hoc-manual-landing-precedence.spec.ts review/ad-hoc-session-branch-handoff.spec.ts --workers=2`.
  Run each slice's named readers and trace any additional affected consumers
  through the installed consumer trace. Preserve direct Playwright selectors
  only for cases still on that runner. Use the mixed group command where an
  in-flight plan still refers to a migrated spec by its current filename.
- Compare the three cases under the normal group command before and after at
  two workers, retaining per-case time and runner elapsed time with natural
  load. Use [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  to judge the gain alongside deleted support and preserved proof. The
  three-case comparison does not measure full-group savings.

## Plan review

Slice-plan refinement was unnecessary. The coordinator change has an immediate
race consumer, and the three outcomes have distinct triggers and proofs. The
same retained launch and review model serves both Done cases. No unresolved
slice-specific concern was identified in this review.
