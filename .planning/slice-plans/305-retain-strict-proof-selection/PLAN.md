# Read the selection and strict outcome of one dashboard proof run

**Identity:** SEED-131#retain-strict-proof-selection
**Source:** [selected story](../../seeds/SEED-131-repository-test-feedback.md#retain-strict-proof-selection)

## Goal and scope

Let a contributor opt into one directly discoverable record of the actual
selected tests and results from a strict dashboard run, without executing them
again or changing its verdict. Preserve silent successful console output and
normal passing-output cleanup. Selection, observed attempts, strict verdict,
and incomplete evidence remain distinguishable.

The source's key examples and constraints apply in full. Caller-owned retention
is one compact file per requested invocation; ordinary runs create no new
archive. No dashboard UI, published skill changes, shell-suite reporting, CI
policy, trace retention on pass, cache policy, or general evidence service is
included. Updating DD-216/DD-243 requires observed acceptance, not merely code.

## Existing solution and direction

PFE inspected `dashboard/tests/support/quietReporter.ts`,
`dashboard/playwright.config.ts`, `dashboard/tests/quiet-reporter.spec.ts`,
`dashboard/tests/support/innerPlaywright.ts`, `dashboard/tests/README.md`,
`scripts/dashboard-repeat.sh`, `scripts/ci-repeat.sh`, and
`tests/support/node-test-failures-reporter.mjs`.

- Change the existing quiet reporter: it already owns strict output rejection,
  diagnostics, final status override, and output cleanup. Its `onBegin` can use
  the supplied suite's selected tests, and its test/end hooks see actual results.
  Do not derive the strict verdict independently in a second reporter.
- Playwright's last-run file is removed on silent success and is not a selected
  test/result account. CI's HTML reporter is a file-only companion, but raw
  runner success is not the quiet reporter's output-policy verdict. The Node
  reporter and timing scripts own different events and purposes; do not merge
  them into this responsibility. The repeat scripts consume existing failure
  lines and kept-path output, which must remain compatible.
- Wire the opt-in path through the normal dashboard configuration as an option
  of the existing reporter. A concrete interface is
  `OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/absolute/unused/proof.json`; document that
  path before invocation so discovery needs no successful console message.
  Custom inner-run configs must not accidentally claim an outer run's path.
- Keep one run model, with selection and subsequent observations. Distinct
  test IDs/project/location/title identify selections; attempts do not inflate
  selected count. Store run identity/context and terminal strict outcome only
  when observed. Selection-only listing is not executed proof; stopped snapshots
  and missing/invalid records are not success. Do not infer process exit or a
  completed assertion from a selected/skipped entry.
- Claim a fresh destination without replacing existing evidence. Update only
  this run's record, with a complete-read strategy so interruption cannot turn
  a partial write into apparent terminal success. Keep the record outside the
  output directory Playwright clears. Catch recording failures separately from
  test policy: emit an explicit recording diagnostic, preserve the existing
  strict test exit status, and never leave an apparently valid completed record
  after an unsuccessful write. Consumers require valid completed evidence as
  well as the command's exit result.

The ADR index was reviewed: Accepted records 0000–0006 concern product-wide
architecture, language, workflow, releases, installation and guidance. This
repository-local test-support change introduces no conflicting architectural
choice. Dashboard ADR 0008 is Proposed, not a binding decision. Existing
`.planning/NORTH-STAR.md` topics govern runtime/dashboard responsibilities;
none requires new direction for this reporter change. No new topic or ADR is
needed. The common model above covers all examples without separate reporting
systems for pass, failure, concurrency, or interruption.

## Observed premises

Observations ran in
`/Users/terryyin/git/open-dough/.worktrees/read-a-dashboard-proof-selection-without-rerunni`
at base `521e0190adf57c4deff17ca62a492cb4a88fb36a`, with Node 24.21.0 and the
locked Playwright 1.63.0. `npm ci --no-audit --no-fund` installed dependencies.
No implementation remains from preparation.

1. **Real reporter proof route and preserved behavior.**
   `env -u NO_COLOR NODE_DISABLE_COMPILE_CACHE=1 npm run test:dashboard -- quiet-reporter.spec.ts --workers=2`
   exited 0 with no reporter output. All six existing specs ran: quiet success
   and directory removal; assertion failure/trace; retained report and last
   kept-path line; test-output rejection; global-setup output rejection; and
   timeout/HTML unfinished-test evidence. The first invocation without
   `env -u NO_COLOR` exited 1 because this host supplies NO_COLOR alongside
   Playwright's FORCE_COLOR. That warning is real rejected output; unsetting
   the conflicting caller variable settles the observation without weakening
   the reporter. Disabling compile cache bounded these experiments only and is
   not implementation of the sibling story.
2. **The output-policy regression proof discriminates.** Temporarily changed
   `onTestEnd` to return for every expected result, including printed output.
   `env -u NO_COLOR NODE_DISABLE_COMPILE_CACHE=1 npm run test:dashboard -- quiet-reporter.spec.ts --grep 'a passing spec that prints' --workers=1`
   exited 1 at `expect(run.status).not.toBe(0)`: the inner printing fixture had
   incorrectly exited 0. The intact suite above passes that assertion. The
   scratch mutation was restored before any record write.
3. **Selection/results/strict override reach a surviving file.** A temporary
   subclass of the real quiet reporter recorded `suite.allTests()` at begin,
   test ID/status/outcome/retry at test end, and both incoming runner status
   and `await super.onEnd(result)`'s returned status at end. It wrote outside
   the disposable output directory and otherwise delegated unchanged lifecycle
   hooks. `env -u NO_COLOR node .proof-selection-probe/observe.mjs` launched real
   Playwright subprocesses using the existing quiet-reporter fixtures. Quiet
   pass: one selected/one passed attempt, strict passed, exit 0, empty streams,
   record retained and output directory absent. Printing pass: one selected/
   one passed attempt, incoming passed, strict failed, exit 1. Two-test 2-second
   deadline: two selected/no completed attempts, incoming timedout, strict
   failed, exit 1. Listing: one selected/no attempts, incoming and returned
   passed, exit 0. Thus a raw `onEnd` passed value cannot establish executed
   proof; listing needs explicit distinction in the model.
4. **A forced stop need not fabricate completion.**
   `env -u NO_COLOR node .proof-selection-probe/interrupt.mjs` launched the
   hanging fixture with that observer, waited for its selected snapshot, then
   SIGKILLed the owned process group. Observed null exit code/SIGKILL and a
   surviving selected snapshot with one test, no attempts and no terminal
   verdict. All probe scripts, records, scratch output and mutations were
   removed. This establishes the available lifecycle route, not acceptance of
   the proposed final atomic-write or collision behavior; those are new slice
   obligations below.

## Ordered slices

### 1. Retain a trustworthy record of a strict dashboard invocation
Type: Behavior
Status: planned
Proof: Extend the real subprocess journeys in `dashboard/tests/quiet-reporter.spec.ts`
(and capability-named support/specs if cohesion warrants) to inspect the actual
requested record and command status across the cases below. Run the complete
reporter suite with the documented strict configuration, plus a small normal
configuration invocation exercising the opt-in and a direct invocation from a
different working directory. Observe the file after the command ends; never
substitute a listing or weaker reporter's verdict.

Behavior: A contributor chooses an unused evidence path and a test selection →
runs normal strict dashboard proof once → reads that run's attributed selection,
attempt results and strict outcome without rerunning tests; failures, listing and
incomplete runs cannot look like completed passing proof.

Implement the configuration/reporting path, its lifecycle and errors, focused
subprocess proof, usage/retention documentation in `dashboard/tests/README.md`,
and evidence-backed DD-216/DD-243 follow-up together. Preserve existing diagnostic
literals and report/trace ownership. Exercise the real environment-to-config-to-
reporter route; a temporary config passing an option directly proves only the
reporter, not that normal users can request it. In nested subprocess proof,
assert that the outer requested record survives inner runs unchanged by them.

| Promise / source examples | Observable proof owned by this slice |
| --- | --- |
| One actual selection, readable count and outcomes; quiet success survives cleanup (1) | Filter fixtures to known selections; compare record IDs/titles/project/location and count with observed fixture execution; assert one run, empty streams, exit 0, no output directory, record still readable. Exercise normal npm and direct config entry; no second execution to obtain counts. |
| Strict verdict remains authoritative (2, 6) | Assertion failure, passing test output, and setup output retain existing diagnostics and nonzero exits; record shows passed assertion separately from strict failed. Run the complete existing reporter suite, including HTML timeout companion. |
| Failure/interruption is not completed pass (3) | An ordered fixture finishes one test before another hangs; timeout/graceful interruption records completed versus unfinished tests and strict failure. Kill an owned runner group after selection is persisted and verify the record is incomplete or explicitly unfinished, never terminal passed. Absence before begin is documented. |
| Concurrency, ownership and bounded retention (4) | Overlap distinct filtered runs with separate paths, then read each selection/outcome. Request an existing path and prove its bytes are unchanged and a diagnostic identifies recording unavailability. Repeat without opt-in and prove no new evidence store or passing directories accumulate. |
| Selection is not attempts, skips or listing (5) | Exercise listing-only, skipped tests and repeated/attempted execution: counts and test identities stay accurate and distinguish observed results from selection. In particular a listing ending passed cannot become completed executed proof. |
| Recording failure does not invent a verdict (6) | An invalid/unwritable destination and a controlled write failure produce an explicit recording diagnostic, unchanged underlying strict exit, and no valid completed evidence. Reading an incomplete/malformed record is not treated as pass. |
| Existing callers and inner runs remain compatible | Assert unchanged failure/Kept output via existing specs; exercise CI HTML companion; run outer opt-in proof containing inner Playwright runs and inspect attribution. The shared reporter option must not leak into nested configs. |
| Contributor can use and assess the result | README contains one opt-in run and file-read example, separate exit/record interpretation, retention/deletion, listing/interruption and errors. Update the existing finding with that run's measured outcome and remaining manual opt-in/read cost. |

Use `env -u NO_COLOR NODE_DISABLE_COMPILE_CACHE=1 npm run test:dashboard -- quiet-reporter.spec.ts --workers=2`
as the baseline focused command, adding any new capability spec files to the
same strict selection. A full dashboard suite is not a new local prerequisite
for this opt-in change; if execution alters a shared default beyond the inspected
reporter/config consumers, reassess and run affected consumer proof. Preserve
normal full CI checks after publication. `.githooks/pre-commit` requires staged
lint and, when script files are staged, `npm run --silent typecheck:dashboard`.
Apply ordinary execution's independent post-change refactor and delivery gates.
Do not accept an unchanged green test as proof of the new file promise: omit its
write or strict-verdict field in a scratch mutation and observe the new journey
fail, then restore and pass.

**Sizing and safe stop:** One reporter-owned run lifecycle and one focused proof
loop; keeping its success, failure and interruption semantics together avoids
shipping a record that can falsely claim proof. Existing six-spec baseline is
short enough for focused feedback; no numeric slice target or hard limit is
supplied. If lifecycle or normal-entry proof reveals a new responsibility or
unbounded verification, reassess before widening. The slice leaves the complete
opt-in outcome usable; no interim weaker record is delivered.

## Current decisions

- Preserve the original strict test exit status even when optional recording
  fails; a recording diagnostic and missing/incomplete evidence remain separate.
- Do not overwrite existing records or infer terminal success from an absent
  end observation. Caller-owned paths eliminate global retention/pruning policy.
- Preserve the sibling cache story and its preparation exactly; these stories
  are independent and may touch the same Playwright configuration.
- Preparation authorizes no implementation or Take. Execution remains a separate
  developer instruction.

## Learnings

The actual reporter lifecycle reports a listing as passed without attempts and
an output-rejected run as passed before the reporter's override. Both facts
constrain evidence interpretation; observing only raw runner status is insufficient.
