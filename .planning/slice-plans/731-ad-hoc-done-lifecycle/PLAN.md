# Prove the ad hoc Done lifecycle and kept-record release at typed seams

**Identity:** SEED-413#ad-hoc-done-lifecycle
**Source:** [Prove the ad hoc Done lifecycle and kept-record release at typed seams](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#ad-hoc-done-lifecycle)

**Source review:** [source-review.md](source-review.md)

## Execution context

- Story Branch Mode in the dashboard-established worktree
  `/Users/terryyin/git/open-dough/.worktrees/prove-the-ad-hoc-done-lifecycle-and-kept-record`.
  The integration checkout is `/Users/terryyin/git/open-dough`.
- Agent Koharu-chan, publisher `dashboard-territory.local-open-dough`.
  Starting revision `9fe73239fd473bc9729e5cf23d1c04456e2a3d59`.
  Accepted claim `18b9a405bb45e995ff6f7513f967b5a2d9b6c8d8` on
  `origin/main` and initial candidate on
  `origin/codex/prove-the-ad-hoc-done-lifecycle-and-kept-record`.
- GitHub Actions `ci.yml` observer for the execution branch,
  coordinator `koharu-731-9b4bcd53`, stream `/tmp/dough-ci-501/watch-bYQjx8`,
  PID `82611`, execution session `96952`, Codex cell `g23:20`.
- Locked native npm setup and dashboard typecheck passed in this checkout.
  No new replanning authority was supplied.

## Goal and scope

Move fourteen cases under `dashboard/backend-tests/review/` to plain Node
Vitest:

- `ad-hoc-session-commits.spec.ts`
- `ad-hoc-session-commits-done.spec.ts`
- `ad-hoc-session-commits-pending-done.spec.ts`
- `ad-hoc-review-unavailable.spec.ts`
- `kept-commits-release.spec.ts`

Each case calls production functions directly, with MakeMe kept records and
attempts and real Git. Follow
[Which entry a case uses](../../../dashboard/backend-tests/README.md#which-entry-a-case-uses)
and the Done capture family's
[`doneCaptureCase.ts`](../../../dashboard/backend-tests/support/doneCaptureCase.ts).

Exclusions:

- The developer's native Done stays in the parent story, including "a newer
  quiet Done takes precedence over a manual mark", as do the `sessions/`
  completion cases.
- The branch result belongs to `SEED-413#ad-hoc-branch-result-handoff`.

## Key examples and proof

| Example | Observable signal |
| --- | --- |
| Quiet report | A kept Default main launch reports through reference `R`, with an accepted attempt `R` reporting to the case's origin, and commits `typo`. `deliverCompletion` gets a quiet submission for `R`. Once its continuation settles, the kept record's `doneAt` equals the receipt's `receivedAt`. `review` answers `session-commits` with one run of one commit. |
| Abandoned rename | The injected host's `rename` waits on its stop signal. A quiet report is delivered, then `close()` is awaited. The rename saw the abort, and the kept record holds the commits read at that Done. |
| Stale capture | A record's commits were read before its latest Done. `review`, `fileText` and `fileDiff` of the earlier capture refuse it, and the record does not report "no commits". |
| Release | Two kept records in one repository pin session runs and a landing comparison. `deleteRecord` of one, or its expiry at the next record write, removes only its `refs/open-dough/…` references. This also works when that record's saved repository is gone. |

## Current decisions

- **Typed Done marks.** `NativeDoneMarks` reads `launchHost` and
  `configuredProject` (through `reportingFolder`) in `doneMarks.ts`. Give its
  constructor typed collaborators:
  - the terminals' attachment use (a `Pick` of `AgentTerminals`);
  - a host lookup;
  - a reporting-folder lookup.
  `launchBoundary.ts` passes the production ones. `reported` answers the
  continuation it starts, so a case awaits it. The scratch below reached into
  the private `reporting` set to do this.
- **Arrangement.**
  - Records: `aDefaultLaunch(…).reportingThrough({ origin, reference, command })`.
  - Attempts: `keepAttempt(makeMe.anAcceptedAttempt.withId(reference).adHoc().reportingTo(origin).capturingLanding({ reporting }).launched({ host, sessionId }))`.
  - Submissions: `makeMe.aCompletionSubmission.reportingFor({ host, reference })`.
  - Done as a precondition is `markDone`/`undoDone`. Do not deliver a report
    or reopen through a terminal to reach that state.
- **MakeMe steps.** Two states have no builder step, so the plan adds them to
  the launch outcome builder (`launchOutcomeTestData.mjs`):
  - session commits read before Done (`readAt` earlier than `doneAt`);
  - a failed capture at Done (`sessionCommitsFailedAt`).
- **Tip before log.** `readSessionCommits` in `sessionCommitsCapture.ts`
  resolves `head` before reading the reflog. Split it so the reflog read
  takes that `head` as typed input. The "later commit excluded" case then
  passes a `head` older than the checkout's tip, with no reflog hold. The
  pending-done spec's tail ("the next report includes the later commit") is
  already covered by the reopen and later-Done cases; drop it.
- **Duplicates to drop, not move.**
  - The Done and review halves of the unavailable case are owned by
    `done-kept-session-unavailable.spec.ts` and
    `ad-hoc-review-kept-unavailable.spec.ts`. Its launch half becomes a unit
    case of `defaultLaunchStartFacts` (`defaultLaunchStart.ts`).
  - The `shared` fact of the rename-wait case is owned by
    `done-kept-session-shared-checkout.spec.ts`.
  - The pending `doneProblem` after an abandoned wait is owned by
    `sessions/agent-completion-quiet-rename.spec.ts`.
  - Session-commit reference release on deletion is owned by
    `done-kept-commit-refs-release.spec.ts`.
- **Release cases.** Add the landing references and the gone repository to
  the deletion and expiry loop of
  [`ad-hoc-branch-result.spec.ts`](../../../dashboard/backend-tests/review/ad-hoc-branch-result.spec.ts),
  or to a sibling Vitest spec when that file would exceed the project's size
  limit.
- **Test-support retirement.** `DefaultMainSessionWork.launchReporting` in
  `dashboard/test-support/support/sessionCheckoutWork.ts` has only these
  specs as consumers; delete it in slice 4. After each slice, grep
  `dashboard`, `e2e` and `Distribution` for every module the removed spec
  imported, and delete any export left without a consumer.

## Decisive premises

| Consuming operation | Observation |
| --- | --- |
| A Vitest case delivers a quiet report through `deliverCompletion` with a MakeMe kept record, attempt and submission, and the record is Done at receipt with its commits kept | Scratch at `5eae84032` in this workspace, since reverted. It used `NativeDoneMarks({} as AgentTerminals)`, the arrangement above, and an `aCheckoutWork` commit. Ran `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:backend -- review/zz-scratch-quiet-done`. With the marks closed at once, the record was Done at `receivedAt` and its capture was skipped, because `captureReportedDone` checks `closed`. That is why `reported` must answer its continuation. Awaiting the continuation first, `review` answered `session-commits` with run `Add typo.txt`. Passed in 424 ms. |
| The behaviors moved are current product behavior | CI run 44698610582 at `78236bdf8` passed all fourteen cases on Playwright: `ad-hoc-session-commits` 1, `-done` 5, `-pending-done` 3, `ad-hoc-review-unavailable` 1, `kept-commits-release` 4 (23.0 s summed). The moved cases change only the entry, and each slice's discrimination check reproduces the behavior. |

## Ordered slices

### 1. A quiet report's Done is proven through `deliverCompletion` with typed Done marks

Type: Structure
Status: done

Give `NativeDoneMarks` its typed collaborators and have `reported` answer its
continuation. Rewrite `ad-hoc-session-commits.spec.ts` on Vitest.

| Promise | Slice 1 proof |
| --- | --- |
| Quiet report example | The case passes with every signal in its row. The injected host records the rename it was asked for. |
| The case discriminates | With `keptWithDoneCapture` skipped in `captureReportedDone` in a scratch edit, the case fails on the missing commit run. It passes once reverted. |
| Production unchanged | `sessions/agent-completion-quiet-rename`, `sessions/agent-completion-identity` and the remaining `review/ad-hoc-session-commits-done` pass. `npm run typecheck:dashboard` passes. |


Accepted evidence: the typed case observes the receipt timestamp, the
injected rename, and one review run with the single real Git commit.
Skipping `keptWithDoneCapture` fails the review assertion. The restored
candidate passes 16 focused cases across quiet reporting, binding, identity,
and the existing Done lifecycle. Dashboard typecheck passes. The
independent refactor emits identical JavaScript and keeps the formatted
Done marks file at 250 lines. Run records and observations are in
`open-dough/evidence/731-slice-1-return.md` and
`open-dough/evidence/731-s1-refactor-return.md` under this worktree's Git
directory.

CI run 44710919350 flagged three ignored continuation promises at
existing background call sites. Targeted ESLint reproduced all three;
explicit `void` discards preserve scheduling and pass targeted lint and
eight focused delivery, binding and capture cases. See
`open-dough/evidence/731-ci-lint-repair-return.md`.

### 2. Rename waits keep and refresh a quiet report's capture

Type: Structure
Status: done

Move "a quiet report during an earlier rename wait refreshes the commits"
and "a reported Done whose rename wait a closing server abandons has kept its
commits" into a Vitest `ad-hoc-session-commits-done.spec.ts`. Both use an
injected host whose rename is held. Remove them from the Playwright file.

| Promise | Slice 2 proof |
| --- | --- |
| Abandoned rename; refreshed capture | Both cases pass. |
| The cases discriminate | With the `stopped` signal not passed to `rename` in a scratch edit, the abandoned case never settles and fails on its awaited `close()`. With `continueReported` returning before capture while a rename is running, the refresh case fails. Both pass once reverted. |

Accepted evidence: both Node cases pass. Severing the rename's stop signal
blocked close until the default test timeout, and returning before capture
during an earlier rename failed the later review. Both scratch edits were
restored. Eight cases pass including the relocated legacy cases and the
existing shared-checkout owner. Dashboard typecheck passes after the slice 1
CI repair (`52be56f13db56631969739b5ff17ff47b141e8a9`). Run records and
consumer observations are in `open-dough/evidence/731-slice-2-return.md`.

Independent refactor shares the kept reporting launch setup across the first
two Node specs. All three affected cases and dashboard typecheck pass again.
See `open-dough/evidence/731-s2-refactor-return.md`.

Guarded formatting exposed unused callback parameters and optional chaining
on its required signal. The callback now reads the typed signal directly,
and both Node cases pass again (`731-s2-rename-signature.log`).

### 3. Re-Done, retry and reopen keep the right capture

Type: Structure
Status: done

Add the failed-capture MakeMe step. Move the remaining three cases into the
Vitest file and delete the Playwright one:

- reopen keeps the earlier capture until the next Done (`markDone`, `undoDone`,
  `markDone`);
- a quiet report after a confirmed Done keeps the additional commit;
- retrying the same quiet delivery resumes native Done without a second
  capture.

| Promise | Slice 3 proof |
| --- | --- |
| Three examples | All pass. The retry case asserts that the injected rename ran once and that the record's commits are unchanged. |
| The cases discriminate | With the `sessionCommitsFailedAt === doneAt` check in `doneCapture.ts` removed in a scratch edit, the retry case fails on a new capture. It passes once reverted. |

Accepted evidence: all five cases now run on Node. Reopen preserves the
previous Git run until the next Done. A later quiet receipt captures the
additional commit after a confirmed Done. The exact delivery retry resumes
one rename and keeps the failed capture. Removing the failure-at-Done guard
makes the retry retain an unexpected Git run, and restoration passes. The
last three temporary Playwright cases are retired. See
`open-dough/evidence/731-slice-3-return.md`.

The independent refactor grouped the matching reporting setup and injected
rename collaborators. Both Node files still pass all six affected cases.
See `open-dough/evidence/731-s3-refactor-return.md`.

### 4. A later Done never shows a stale capture, and a commit after Done's tip is excluded

Type: Structure
Status: planned

Add the earlier-read MakeMe step and split `readSessionCommits`. Rewrite
`ad-hoc-session-commits-pending-done.spec.ts` on Vitest as two review-only
cases on the typed review and one `readSessionCommits` case. Delete
`launchReporting`.

| Promise | Slice 4 proof |
| --- | --- |
| Stale capture example; later commit excluded | All three cases pass. |
| The cases discriminate | With `sessionCommitsAtDone` in `src/sessionCommits.ts` ignoring `readAt` in a scratch edit, both review cases fail. With the split reading the checkout's tip instead of its `head` input, the exclusion case fails. All pass once reverted. |

### 5. A kept record releases only its own references, even with its repository gone

Type: Structure
Status: planned

Move the four `kept-commits-release.spec.ts` cases onto `deleteRecord` and
the expiry write, keeping only their unique facts (landing references, the
other record's references, a gone repository). Delete the Playwright spec.

| Promise | Slice 5 proof |
| --- | --- |
| Release example | All cases pass. |
| The cases discriminate | With `releaseExpiredRecordPins` skipped in a scratch edit, the expiry case fails on a left reference. It passes once reverted. |

### 6. An unreadable checkout keeps no start, and the family leaves Playwright

Type: Structure
Status: planned

Write a `defaultLaunchStartFacts` unit case for a checkout Git cannot read,
and delete `ad-hoc-review-unavailable.spec.ts`. Recheck test-support
consumers. Name the moved specs in the ad hoc review paragraph of
`dashboard/backend-tests/README.md`.

| Promise | Slice 6 proof |
| --- | --- |
| No start kept | The case answers `{}` for an unreadable checkout and start facts for a readable one. |
| No orphan, gates pass | The test-support grep finds no orphaned export. `npm run typecheck:dashboard` and `npm run lint` pass. `npm run --silent test:dashboard:backend -- review/ad-hoc-session-commits review/kept-commits review/done-kept review/ad-hoc-review sessions/agent-completion-quiet-rename` passes. |
| Focused speed | Run the old selection at `5eae84032` and the new one at the candidate: three interleaved warm runs each of `npm run --silent test:dashboard:backend -- <the five specs> --workers=2`. Record median command time and load in this plan. |

## Local gates

Apply [Dough MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) before
test or builder edits. Run focused selections with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:backend -- <selection>`,
and run `npm run typecheck:dashboard` and `npm run lint`. The two MakeMe
steps only add methods to `launchOutcomeTestData.mjs` and leave existing
output unchanged, so the type check and the focused selections cover them
without a broader local suite. CI runs every consumer after publication. On
AC power, run under
`caffeinate -s -i`, as
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
describes. Follow the
[shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Keep default test timeouts.

## Plan review

Slice-plan refinement was not needed. The plan has six Structure slices,
each one spec or case group with one proof loop. Slice 1 alone changes the
Done marks' constructor, and slice 4 alone splits a capture function. The
entry premise was observed in scratch. This review found no remaining
slice-specific concern.
