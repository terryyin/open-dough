# Keep a departed candidate read from showing a failure after Show latest

**Source:** [selected story](../../seeds/SEED-334-product-wide-end-to-end-tests.md#observe-no-stale-candidate-failure-after-show-latest)
**Source review:** [source review](source-review.md)
**Identity:** SEED-334#observe-no-stale-candidate-failure-after-show-latest

## Goal and scope

A maintainer changing Test Optimization Candidates reading learns from the
Frontend held-answer case when a superseded revision's read disturbs the
record Show latest selected. Strengthen only
`dashboard/frontend-tests/intent/intent-test-optimization-candidates-revision.spec.ts`
"a held answer for the old revision cannot replace the record Show latest
selected": also hold the new revision's candidates read across Show latest, and
while it is held observe the record at the new revision still reading, with no
alert. Then release it and keep every existing assertion. No product change,
new helper module or other spec.

## Decisive premise and retained observation

Observed in this owned preparation workspace at
`3aa5935c11988179aeea184d27a3c9b922be6632`, 2026-11-18, Node 24.21.0 after
`npm ci`, host load about 15–16.

| Premise and consuming operation | Form and profile observed | Result and remainder |
| --- | --- | --- |
| Holding the new revision's read makes the window observable, and the strengthened case discriminates the guards | Scratch edit of the held-answer case: a second `holdAuthenticatedReadsWhere` for `intent=test-optimization-candidates` at the moved revision, registered after `passTimeUntilCheckedWhileReadsOutstanding` and before Show latest; after Show latest, `expectCandidatesRevision` at the moved revision, `expect.poll(newAnswer.held).toBe(1)`, record contains "Reading Test Optimization Candidates", `getByRole("alert")` count 0, then release and the existing assertions. Command: `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run test:dashboard:frontend -- frontend-tests/intent/intent-test-optimization-candidates-revision.spec.ts --workers=2 --reporter=list [--repeat-each=3]` | Restored product: 2 passed. Both guards in `dashboard/src/IntentCandidatesRecord.tsx` replaced with `if (true)`: the held-answer case failed 3 of 3 at the reading-text assertion; the other case passed. Each faulted failure then hung in teardown until the 30 s test timeout, because this file frees held reads only on the happy path. Scratch edits reverted; no remainder. |

## Outside-in proof

| Promise | Owner and observation |
| --- | --- |
| A departed old-revision read cannot show a failure or replace the selection after Show latest | Slice 1: the strengthened case, passing restored and failing with both guards faulted |
| Existing selection and late-answer assertions remain | Slice 1: the file's two cases, unchanged assertions |

## Ordered slices

### 1. The held-answer case observes the window after Show latest
Type: Behavior
Status: done
Proof: the focused command above passes; with both guards faulted as above it
fails on the held-answer case, then the fault is reverted.

Behavior: the old revision's candidates read is held, a new revision is
published and Show latest is chosen while the new revision's read is also held
→ the record names the new revision and is still reading, with no "could not be
read at this revision" alert or Retry; after release it shows the new record,
and the old answer released later changes nothing.

Use the established sibling pattern in
`intent-revision-notice.spec.ts`: a file-level `releases` list freed in
`test.afterEach`, so a failing journey reports promptly instead of hanging in
teardown. Update the file's header comment if its explanation changes. Apply
the installed `dough-makeme` and `dough-page-objects` selection before editing;
reuse `candidatesRecord`, `holdAuthenticatedReadsWhere` and existing page
helpers, adding a page-object query only if the convention requires one. Keep
the default test timeout; no `test.slow()`.

Sizing: one test-file change with an observed scratch version fits one slice;
no Structure slice or interim behavior.

Accepted proof (2026-11-18): focused command with `--repeat-each=3`, 6 passed
before and after the refactor (which swapped the alert locator for
`readFailure` from `dashboard/tests/intentReadRecoveryPage.ts`). Both guards
faulted to `if (true)`: the held-answer case failed in 7.5 s at the
"Reading Test Optimization Candidates" assertion with the record showing
"could not be read at this revision. Retry"; teardown no longer hangs. Fault
reverted. Consumer trace: test-only, no runtime consumers. Learning: a
file-level `releases` list freed in `afterEach` keeps faulted held-read cases
from hanging to the test timeout.

## Local gates and current decisions

- Focused gate: the command in the premise table, plus one faulted run and
  revert. Hosted CI runs the Dashboard Frontend group after publication; a
  single-spec change makes no full suite a local gate.
- For any long/full macOS run, start fully awake; on AC use `caffeinate -s -i`.
  On battery plug in, or use `caffeinate -i` with lid open and inspect the sleep
  log afterwards, under [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- All failing/flaky checks follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Slice-plan refinement was not needed: one cohesive test outcome, mapped
  proof and an observed decisive premise.
- Remaining slice-specific concerns: none identified in this review.
