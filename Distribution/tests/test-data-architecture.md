# Test data architecture

Every Intent test entry in `.planning/open-dough.json` selects the shared
MakeMe convention, which the installed [`dough-makeme`](../../.agents/skills/dough-makeme/SKILL.md)
skill owns. This guide gives the project's construction boundary and builders.

Use one test-only JavaScript ESM entry point at `Distribution/tests/support/makeMe.mjs`,
exporting `makeMe`. Playwright TypeScript specs and `node:test` JavaScript tests
import it directly. A shell check that arranges domain data invokes a small Node
helper, such as `Distribution/tests/support/release-source.mjs`, that calls MakeMe and writes
it in the product's existing format. The helper and the builders it reaches
follow the convention the shell check selects, though their own paths match no
entry. A test reaches a builder as `makeMe.aThing` or `makeMe.anThing`, and
`.please()` returns the finished product value.

Type builders against the production type, schema, or encoder input with
`@ts-check` and JSDoc imports. Builder modules import no dashboard module at
runtime: native journeys hash makeMe's runtime import closure
(`Distribution/evaluation/src/native-import-closure.mjs`) as evidence identity, and
`Distribution/evaluation/tests/native-harness/native-evidence-identity.sh` fails when that closure reaches outside
`tests/` and `src/`. Include the builder sources in the dashboard
type-check. Organize builders by domain concept behind the one entry point.
Return the canonical shape directly to every caller. Preserve actual storage
and response distinctions, such as a persisted `LaunchRecord` and a live
`LaunchWithState`. Use existing production encoding at file and transport
boundaries. Keep servers, Git, installation, clocks, and teardown in the test
harness; its fixtures delegate domain construction to these builders.
[ADR 0002, Direct domain mapping](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
· [ADR 0008, Durable project state and local operational state](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)

For example, dashboard and skill tests can build the same preparation profile
facts and hand them directly to `renderAgentProfile` when writing a published
profile. [Dashboard setup](../../dashboard/test-support/publishedFactsIsolation.ts) ·
[Skill setup](skills/dough-story-refinement/preparation-assignment-test-fixtures.mjs)

```js
const profile = makeMe.anAgentProfile
  .preparing({ name: "Kirara", identity: storyIdentity, host: "claude" })
  .please();
const profileText = renderAgentProfile(profile);
```

[CI test data](ci/ci-test-data.md) covers proof evidence, observed runs and jobs,
adapter attempts, queue entries and stored revision coverage.

Build a project this machine configures with
`makeMe.aConfiguredProject.with({ id, label, repository, localPath }).please()`:
the published source it reads, as `makeMe.aPublishedSource` builds it (ref
`main` and the standard backlog path unless the case states them), plus the
checkout this machine uses. State `ref` or `hidden` at the call site when the
case relies on it. Dashboard harnesses keep the environment, the saved
project list file and its encoding; the default development harness writes
the real production seed only when the development list is missing.
[Builder](support/projectConfigurationTestData.mjs) ·
[Harness](../../dashboard/test-support/support/projectConfiguration.ts)

Declare the Git state a test starts from with `makeMe.aRepository`.
[Repository test data](repository-test-data.md) covers named revisions,
workspaces and their uncommitted state, releases, claims and served revisions.

Arrange native hook settings with `makeMe.hostHookSettings.forHost(host)`.
State unrelated settings through `.with(...)` and handlers through `.handling(...)`;
the builder returns each host's actual document shape. `.registeredWith(...)`
copies the production fragments into a prior registration without running the
merge under test. Keep edited managed handlers and independent byte or semantic
expectations in the case. [Settings builder](support/hostHookSettingsTestData.mjs)

Feedback maintenance keeps the published review (`makeMe.aFeedbackReview`),
saved machine choice (`makeMe.aFeedbackMaintenanceChoice`), observed state
(`makeMe.aMaintenanceObservation`) and due-check session
(`makeMe.aMaintenanceSession`) separate. State review dates and observations
explicitly. Compose existing launch, request, host-session and attempt builders
for their facts; the review document's fence and storage remain harness work.
[Feedback builders](support/feedbackTestData.mjs)

Build a kept launch with `makeMe.aLaunchRecord`: the requested story or
instruction, the host session (the request takes the session's host), the
workspace its start established, and when it was launched. Dashboard tests keep
such records in the machine launch store only through
`dashboard/test-support/support/launchStore.ts`, which writes the store's own
`{ [project]: records }` document under the machine home without retention;
the file and its location stay harness facts. Read the parsed document through
`keptLaunchStore` or one project's records through `keptLaunchRecords`, which
includes unresolved creations. Use `launchStoreFile` when checking exact bytes
or waiting for the file. Write exact store text under proof through
`keepLaunchStoreText`.
[Builder](support/launchTestData.mjs) ·
[Launch store harness](../../dashboard/test-support/support/launchStore.ts)

Build native session rows for usage-history import with
`makeMe.aCodexRollout` and `makeMe.aClaudeTranscript`. Name the session, turns,
responses and counters, workers or launch-input facts the case asserts; the
builders supply session-meta, role rows, parent links and in-window timestamps.
Write ordinary built sessions through the import harness's `writeCodexSession`
or `writeClaudeSession`. Keep malformed bytes, asserted times and filesystem
layout under proof (`.zst` archives, Claude `subagents/`, missing
`session_meta`) in the case with raw `nativeFile` only there. Persist task
facts for report and collector boundaries with `makeMe.aUsageTask`.
[Codex builder](support/codexRolloutTestData.mjs) ·
[Claude builder](support/claudeTranscriptTestData.mjs) ·
[Persisted task](support/usageHistoryTestData.mjs) ·
[Import harness](../../dashboard/test-support/usage-history/importHarness.ts)

Build the host session a terminal or runner consumes on its own with
`makeMe.aHostSession.claude`, `.codex` or `.cursor`; a kept launch's
`inClaudeSession`, `inCodexSession` and `inCursorSession` use the same
construction. State the conversation's identity and where it continues: a
Codex thread's saved workspace and app-server endpoint, with its notice when
the case needs it, or a Cursor chat's UUID and workspace, with its saved
configuration scope when the case needs it. Resume arguments default to the
host's current resume command for that conversation, so each session resumes
its own identity. A Codex session without a continuation is a predecessor
record. [Host session builder](support/hostSessionTestData.mjs)

A kept launch states what happened after it started through
`.completedWith`, `.withReportRead`, `.landedAt` (or `.withCapturedLanding` for
the complete recorded comparison) and `.markedDoneAt`: its
final report, the developer reading it, the comparison its landing recorded,
and the developer's Done mark. These stay separate facts. Build a final report
on its own with `makeMe.aCompletionReport`, and the body an agent submits with
`makeMe.aCompletionSubmission`. A submission is answered by a delivery receipt
and is not the stored report. State a receipt or receipt time when the case
reads more than one report or controls the clock.
[Outcome builders](support/launchOutcomeTestData.mjs)

A landing shares one comparison across its shapes: the launch's reporting
reference, the remote and target, and the base and revision. Build the
dashboard-prepared context with `makeMe.aLandingContext`, the submission with
`makeMe.aLandingSubmission`, the receiver's answer with
`makeMe.aLandingReceipt`, and the stored evidence with `makeMe.aLaunchLanding`
captured from `makeMe.aLandingAuthority`. A submission and a stored landing
always state `.comparing({ base, revision })` at the call site. When extending
builders for related records, have them generate and reuse incidental IDs.
State IDs explicitly when they matter to the scenario. Exercise the capture
path in tests that verify it.
[Landing builders](support/launchLandingTestData.mjs) ·
[Stored landing](support/launchLandingEvidenceTestData.mjs)

A kept launch reports through `.reportingThrough({ origin, command })`; the
launch allocates its reporting reference at `.please()` unless the case states
one. Given the landing builder, `.withLanding(makeMe.aLaunchLanding…)` stores
that landing under the launch's reference unless the landing states
`.forLaunch(reference)`; `.withCapturedLanding` and a completed landing keep it
as given. Name a Follow-up with `makeMe.aFollowUp.ofSession(record).please()` or
`makeMe.aFollowUp.ofStory(story, revision).please()`. Ask for waiting notes
with `.attachingNotes()`, keep resolved context with `.withContext(text)`,
record attached versions with `.withAttachedNotes(notes)`, and anchor a file
with `.anchoredAt(file)`. The file on a landed run comes from
`makeMe.aFileFollowUp.onLandedRunOf(record).at({ path, line, side }).please()`,
which takes the comparison and reference from the record. Send the Follow-up
through the case's request helper and keep the expected host input independent.
[Reporting](support/launchReportingTestData.mjs) ·
[File follow-up](support/followUpFileTestData.mjs) ·
[Landed-run admission](../../dashboard/backend-tests/launches/agent-launch-follow-up-file-admission.spec.ts)
