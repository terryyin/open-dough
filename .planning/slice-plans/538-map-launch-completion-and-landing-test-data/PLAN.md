# Make launch completion and landing test setup map directly to the domain

**Identity:** SEED-261#map-launch-completion-and-landing-test-data
**Source:** [Refined story](../../seeds/SEED-261-share-domain-test-data.md#map-launch-completion-and-landing-test-data)
**Source review:** [source review](source-review.md)

## Goal and boundaries

Maintainers can read the completion and landing facts a test arranges and
recognize the same facts in the machine store, the dashboard, and the landing
delivery script. Convert the valid starting facts in the scoped tests and
support. Preserve the assertions, the operations under proof, and the
distinction between local launch evidence and published workflow progress.

The [kept record story](../534-map-launch-and-session-test-data/PLAN.md) owns
the shared store writer. The [live observation story](../536-map-launch-observation-test-data/PLAN.md)
owns session states, machine answers and accepted attempts. Host continuation
and native terminal setup stay with their [own story](../../seeds/SEED-261-share-domain-test-data.md#map-host-continuation-test-data).
Convert the completion and landing facts in mixed fixtures, using the current
store seam or its shared replacement. The existing builder and seam allow
this work to start independently of those conversions.

## Reuse and decisions

- Extend the existing [MakeMe](../../../tests/support/makeMe.mjs) kept launch
  builder and its [outcome facts](../../../tests/support/launchOutcomeTestData.mjs).
  `.completedWith`, `.landedAt`, and `.markedDoneAt` already compose a kept
  record. Their defaults serve simple cases. Share the typed construction of
  full facts with callers that arrange them independently. Cases that read
  multiple reports need distinct receipts and explicit read markers. Cases
  with controlled clocks need explicit receipt times.
- Follow [completion schemas](../../../dashboard/src/completionReport.ts)
  and [admission](../../../dashboard/server/completionAdmission.ts). A
  submission names the source, host and delivery. A report keeps its receipt,
  outcome, message and time. A delivery receipt describes binding. Keep
  native history messages and the developer's disposition at their own
  boundaries. The dashboard's local [completion contract](../../../dashboard/AGENT-LAUNCH-COMPLETION.md)
  explains the observable distinctions.
- Follow the [landing schemas](../../../dashboard/src/launchLanding.ts),
  [admission](../../../dashboard/server/launchLandingAdmission.ts), and
  [delivery script](../../../src/skills/dough-execute-plan/scripts/dashboard-landing.mjs).
  Distinguish repository authority, prepared input, stored evidence, and
  acknowledged receipt. Compose the reference and Git comparison wherever
  their relationship matters. Git still owns commit IDs, ancestry and remote
  acceptance in the cases that exercise them. Reuse the repository builder
  for starting Git facts when needed.
- This follows [ADR 0002 §5](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
  and [Agent launch as a requested assignment](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment).
  One kept record carries related evidence from different authorities. The
  same comparison can be prepared, captured and read through distinct product
  shapes. Reuse the common facts, as a Git comparison preserves its two ends
  across publication and review, while letting each boundary own the state it
  adds. Keep deterministic tests at their existing boundaries under
  [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md#2-keep-deterministic-checks-in-ci).

## Preparation evidence

The owned preparation checkout at `0ba229468` used Node 24.21.0,
Homebrew Bash 5, and the locked Playwright Chromium 153.0.8010.12.
The Playwright commands below use `env -u NO_COLOR -u FORCE_COLOR
PATH="/opt/homebrew/bin:$PATH" npm run test:dashboard -- --workers=1`.
Landing observations used the same command under `caffeinate -s -i` on AC.
Scratch changes were restored and checked against HEAD.

| Premise and consuming operation | Observation |
| --- | --- |
| The session view consumes a report receipt independently of native activity and Done. | `backend-tests/sessions/session-unread-rule.spec.ts` passed. Changing `reportUnread` in scratch to test whether `reportRead` was absent made the newer-report case fail. It expected `Unfinished work` and observed no unread label. |
| A reporting retry reaches the retained delivery and leaves Git and retirement settled. | `dashboard/tests/sessions/agent-completion-recovery.spec.ts` passed. The installed command returns the original receipt across a lost acknowledgment and server restart. The journey checks the later receipt and manual disposition and verifies that the Git operation log stays unchanged. |
| Prepared landing evidence requires actual target acceptance and can survive attempt expiry. | `dashboard/backend-tests/review/one-shot-landing-capture-admission.spec.ts` and `dashboard/backend-tests/review/one-shot-landing-recovery-retention.spec.ts` passed. Removing only the accepted-target ancestry verification in scratch made the former observe 200 where it requires 409 before publication. |
| The skill fixture drives the installed publisher's acceptance and retry path. | `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 npm test -- src/skills/dough-execute-plan/scripts/{dashboard-landing,publication-landing-target,publication-resume-story-branch,history-preserving-landing-expectation}.test.mjs` passed. The callers share the landing context fixture and observe actual Git and receiver requests. |
| Pending completion follows its launch through native binding. | `backend-tests/sessions/agent-completion-binding.spec.ts` passed. The pending receipt names no session and remains the bound record's receipt. `backend-tests/sessions/final-report-admission.spec.ts` also passed. Cursor's explicit message and Codex's native turn text reach the report reader through their respective routes. |
| A retired launch's capture and published review read different evidence. | `dashboard/tests/review/one-shot-landing-recovery.spec.ts` and `dashboard/backend-tests/review/story-review-completed-gaps.spec.ts` passed. Recovery retains the rewritten comparison after trunk advances and the worktree is removed. Default review reads published completion when the captured repository is unavailable. Choosing that capture explicitly shows its gap. |
| Replay facts reach the full and compact session reads. | `dashboard/backend-tests/sessions/agent-launch-sessions-listing.spec.ts` and `dashboard/tests/sessions/agent-launch-done-listing.spec.ts` passed. History retains landing evidence for the done records and the compact listing omits it at the current boundary. |

## Proof and delivery gates

Compare converted setup with the previous values at the boundary each case
consumes. Preserve every case-driving fact, observable result and independent
expectation. Where a fixture used an abbreviated or inconsistent valid
shape, record the difference and the assertion that still discriminates.
Review the conversion for direct domain language and reduced duplicated
construction under [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
Use the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
for changes to shared setup. Run the named focused selections and their
affected callers. The Playwright selections below use the repository's
`npm run test:dashboard --` entry point.

Local gate. Follow [test automation](../../../AGENTS.md#test-automation) and
carry the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written into every delegation and repair handoff. Follow
[native setup](../../../tests/native-setup.md), use Bash 5 first on macOS,
and unset `NO_COLOR` and `FORCE_COLOR` for Playwright. Run
`npm run typecheck:dashboard` for shared fixture changes. Before final
delivery run `npm run test:dashboard` and `npm test` because MakeMe is shared
by both runners. Start full runs on fully awake macOS with AC power under
`caffeinate -s -i`. On battery, plug in or start fully awake with the lid open
under `caffeinate -i` and check the sleep log after the run. Follow
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Hosted CI follows the selected execution mode.

## Slices

### 1. Session views read completion and Done as separate facts
Type: Behavior
Status: done
Proof: Seed example 1. Run `npm run test:dashboard -- 'backend-tests/sessions/(done-question-rule|session-unread-rule|session-working-count-rule|final-report-(admission|codex))\.spec\.ts$' 'dashboard/tests/sessions/(final-report-touch[^/]*|session-unread-report[^/]*|session-workspace-retirement[^/]*|agent-launch-retained-history|session-attribution|cursor-session-(alerts|recovery))\.spec\.ts$'`.

A record has a read report. When the view receives a later report, its new
receipt makes the message unread. Quiet completion and the developer's Done
mark still contribute their own facts to the view. Migrate valid report and
disposition setup, including `completionReport`, the completion portions of
`retainedReport`, `sessionAttributionFixture` and `sessionsReplayRecords`.
Keep explicit report text and the Codex protocol history in the cases that
test their content or interpretation. Leave live-state construction and
store-writer ownership with the sibling conversions.

Accepted proof: the slice selection passed 61 tests and the affected callers
(`agent-completion-binding`, `agent-launch-sessions-listing`,
`agent-launch-done-listing`) passed 8, with the opt-in replay measurement
skipped. `npm run typecheck:dashboard` passed. A scratch comparison showed
existing `aLaunchRecord` chains build byte-identical records. `completionReport.ts`
is deleted; `makeMe.aCompletionReport` and the shared `LaunchOutcomeBuilder`
(`completedWith` receipt and receipt time, `withReportRead`) replace it. Cases
reading two reports state distinct receipts. `agent-completion-binding.spec.ts`
already uses the builder for its completion, which slice 2 reuses.

### 2. Completion delivery retains its receipt across binding and recovery
Type: Behavior
Status: done
Proof: Seed example 2. Run `npm run test:dashboard -- 'backend-tests/sessions/agent-completion-[^/]+\.spec\.ts$' 'dashboard/tests/sessions/agent-completion-[^/]+\.spec\.ts$' 'backend-tests/launches/agent-launch-incomplete-reporting-settlement\.spec\.ts$'`.

An accepted completion before native binding carries its original receipt
into the bound record. A later delivery to a bound launch whose response
is lost returns its original receipt on retry after restart. Convert the
valid submission and retained completion/receipt facts where these journeys
arrange them. Keep CLI input files, actual receivers and receipt assertions,
exact invalid or legacy inputs, write faults, lost acknowledgments, clock
control, and native binding in their present proof roles. Real results from
the reporter or store continue to supply the observed facts.

Accepted proof: the slice selection passed 29 tests, the Cursor
replacement-session spec passed, and `npm run typecheck:dashboard` passed.
These journeys observe every receipt from the real reporter or receiver, so
the only valid facts they arranged were completion submissions. Those now come
from `makeMe.aCompletionSubmission` in the binding, identity, quiet and Cursor
replacement-session specs. Exact invalid inputs and `malformedRetry` stay literal.

### 3. Landing delivery retains the accepted comparison for its launch
Type: Behavior
Status: planned
Proof: Seed example 3. Run `npm run test:dashboard -- 'backend-tests/review/(one-shot-landing-[^/]+|story-branch-(landing-[^/]+|retained-landing))\.spec\.ts$' 'backend-tests/launches/agent-launch-start-session-landing-[^/]+\.spec\.ts$' 'dashboard/tests/(review/one-shot-landing-recovery|launches/agent-launch-start-session-landing[^/]*)\.spec\.ts$'` and `npm test -- src/skills/dough-execute-plan/scripts/{dashboard-landing,publication-landing-target,publication-resume-story-branch,history-preserving-landing-expectation}.test.mjs`.

A launch prepares a comparison, trunk accepts the revision, and trunk
then advances. Capture or reporting-only recovery still returns the
original launch's comparison. Convert valid context and submission setup,
including the shared `dashboard-landing-test-fixtures.mjs` context and
valid starting bodies in the landing admission specs. Align valid loopback
receipt substitutes with the receipt contract. Delegate domain
construction while keeping the raw request mutations, real publication,
pinning, retention, and injected Git and receiver failures in the journeys.
The receiver and publisher continue to produce the receipts these cases
assert, with completion and Done driven separately.

### 4. Readers use retained landing evidence with published fallback
Type: Behavior
Status: planned
Proof: Seed example 4 and example 3 at the retained read boundary. Run `npm run test:dashboard -- 'backend-tests/review/story-review-completed-gaps\.spec\.ts$' 'dashboard/tests/review/(story-review-(completed|landed|story-branch-landed)|recently-done-one-shot-review)\.spec\.ts$' 'backend-tests/sessions/(final-report-admission|agent-completion-quiet-closure|agent-launch-sessions-listing)\.spec\.ts$' 'dashboard/tests/sessions/(session-workspace-retirement-cursor|agent-launch-done-listing)\.spec\.ts$'`.

A retained comparison can be read with its exact endpoints. When its local
repository cannot supply those commits, review can use published history.
Convert stored landing and authority facts in `keepTrackedClosureEvidence`,
`keepUnusableCompletedCapture`, and the landing portions of
`sessionsReplayRecords`. Keep the deliberately unusable repository and the
real fallback. Retain replay cardinality, sizes, times and distinct record
identities. For valid replay evidence, make authority and reporting reference
agree where the real capture path ties them. Preserve a mismatch literally
where the proof depends on it. Keep the Git setup or capture path where a
caller tests it directly.

## Concern evidence

Slice-plan refinement was unnecessary. Each slice owns one consuming
boundary and its proof, and later slices reuse the outcome builders instead
of creating parallel models. This review found no remaining concern about
the slice boundaries.
