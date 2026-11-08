---
id: SEED-261
status: active
planted: 2026-11-08
planted_during: Terry Yin's request to convert Open Dough tests to shared MakeMe builders
trigger_when: Maintainers need tests to express and reuse canonical domain facts across test entries
scope: epic
---

# SEED-261: Share canonical domain data across Open Dough tests

## Why this matters

Developers and agents maintaining Open Dough should be able to read test setup
in the product's vocabulary and recognize the same facts in another test entry.
Today, valid setup is spread across literals, suite-local builders, and harnesses
that sometimes invent another shape for the same data. This makes changes to
the domain harder to follow and can produce fixtures the product would never
create. Conversion includes repairing those mappings wherever the scoped tests
expose them. Keep independently stated expectations and the behavioral proof
that makes the tests worth maintaining.

Terry selected Donut-style MakeMe syntax, one shared library, a complete bounded
pilot first, and conversion stories for the remaining entries and test families.
The standing [test rule](../../AGENTS.md#test-automation) and
[test data architecture](../../tests/README.md#test-data-architecture) govern
the work. This seed records research hypotheses and story boundaries.

Keeping local helpers is the smallest alternative. It can shorten individual
specs, but retains separate decisions about the same concepts. A mechanical
conversion would move those inconsistencies into a shared file. A library-first
inventory would guess which variants matter before a real test needs them.
Convert complete test families against the domain, using existing product
representations and growing the library alongside its consumers.

## Domain map and builder hypotheses

The families below come from product concepts and authorities. They guide
ownership and naming as real tests are converted. A row may yield several
builders, composition of existing builders, or direct reuse of a production
constructor. Expose one `makeMe` entry point and group its internals by these
domain responsibilities. Actual file and transport forms keep their product
encoders and schemas. A representation that exists only because a suite invented
it should be removed or aligned with its authoritative product shape.

The shared library starts with [`anAgentProfile`](../../tests/support/makeMe.mjs),
which one `@ts-check` module serves unchanged to `node:test`, Playwright browser
fixtures and backend specs. Add a builder variant, such as a story-branch
execution, only with the converting story's consumer, and prove rendered bytes
against the replaced literals before relying on unchanged assertions. Further
likely public names include `aBacklogEntry`, `aStoryPlan`,
`aLaunchRecord`, `aSessionObservation`, `aCiProofFragment`, and `aRelease`.
Names follow the actual product concept. For example, a live observation can
compose a launch record and its state, and an ordinary installation can start
from a release built for that case. Keep separate modules for coherent families
as consumers justify them. All entries use the same public import.

| Domain family | Candidate data and ownership | Relationships to preserve |
| --- | --- | --- |
| Project and published source | Published source and pinned repository facts, plus machine-local project registration and settings when a test arranges them. [Published source](../../dashboard/src/publishedSource.ts) · [Project configuration](../../dashboard/server/projectConfiguration.ts) | A machine setting can select where to read. The repository at a revision owns the published work. Keep a derived dashboard view separate from its source facts. |
| Story and backlog | Story identity and canonical home, purpose, ordered backlog entries, Taken membership, and a completed story's done record. [Backlog document](../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs) · [Done record](../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs) | Identity survives a moved home. A story can exist outside the backlog. Ordering, membership, and completion are separate facts. Use the actual done-catalog derivation where it belongs. |
| Assignment and preparation | Published agent profile in preparation or execution, recorded refinement and approach, readiness assessment and basis, supplier agreement. [Agent profile](../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs) · [Story state](../../src/skills/dough-product-backlog/scripts/product-backlog-story-state.mjs) · [Supplier agreements](../../src/skills/dough-product-backlog/scripts/product-backlog-story-dependencies.mjs) | Agent identity, assignment, and running session have separate lifetimes. Preparation has no execution mode or branch. Readiness and an agreed dependency carry independent meaning. |
| Plan and execution | Slice plan and ordered Behavior/Structure slices, recorded progress, accepted proof and execution completion when needed by a real case. [Plan reader](../../src/skills/dough-product-backlog/scripts/product-backlog-plan-reader.mjs) · [Plan completion](../../src/skills/dough-product-backlog/scripts/product-backlog-plan-completion.mjs) | A plan or done slice is evidence of its own fact. Keep observed proof and completion distinct from planned proof and the story's done record. |
| Revision, publication, and review | Revision and branch facts, published comparison endpoints, owned workspace claim, publication and landing receipts. [Workspace publication claim](../../src/skills/dough-execute-plan/scripts/workspace-publication-claim.mjs) · [Landing receipt](../../dashboard/src/launchLanding.ts) · [Published work](../../dashboard/src/publishedWork.ts) | Build facts a test arranges. Let real Git create commit IDs, branch relationships, and ancestry when those operations matter. Preserve the authority of published origin, local worktree, and the reviewed comparison range. |
| Launch and native session | Incoming and recorded launch requests, native `HostSession` variants, launch attempt, established context, kept/running start, persisted `LaunchRecord`. [Launch request](../../dashboard/src/launchRequest.ts) · [Host session](../../dashboard/src/hostSession.ts) · [Launch outcome](../../dashboard/src/launchOutcome.ts) · [Launch record](../../dashboard/src/launchRecord.ts) | Story workflows require story identity. Ad hoc work has its own request shape. Claude aliases, Codex continuations, and Cursor workspace/resume arguments follow their own contracts. Keep persisted facts distinct from a launch command or transient confirmation. |
| Session observation and completion | `SessionState` and live `LaunchWithState`, machine answer, typed attachment facts, completion report and receipt, landing disposition. [Machine answer](../../dashboard/src/agentLaunch.ts) · [Completion report](../../dashboard/src/completionReport.ts) · [Landing](../../dashboard/src/launchLanding.ts) | Compose the observation with its own persisted session when required. Preserve loaded, retained, unknown, and unavailable, and keep reports, receipts, and terminal protocol evidence separate. |
| CI observation and Proof | Checked revision, GitHub or adapter attempt, queue observation, mailbox revision coverage, CI proof fragment and summary, file counts and timing. [Revision coverage records](../../src/skills/dough-execute-plan/scripts/ci-mailbox-revision-records.mjs) · [Proof contract](../../src/skills/dough-test-optimization/scripts/ci-proof-contract.mjs) · [Dashboard proof](../../dashboard/src/ciProof.ts) | A queue fact has no verdict. A summary and its fragments have the same attempt identity and checked revision. Distinguish missing or ambiguous evidence, a recorded zero, and a known outcome. |
| Intent and source evidence | Intent location declaration, resolved source files at a revision, test optimization candidate records, and comparison scope. [Intent locations](../../dashboard/server/intentLocationsSettings.ts) · [Story CI comparison](../../dashboard/src/storyCiComparison.ts) | A declaration, resolved file list, source text, and observed proof have different owners. Preserve read and provenance distinctions. Keep authored test-source and Gherkin examples literal where syntax, line, or wording is the subject. |
| Release and installation | Tagged release identity with version and changelog, declared managed payload, installed baseline and source/version records, project-owned configuration and hook settings. [Release version operations](../../src/install/open-dough-release-version.sh) · [Release fixture](../../tests/helpers/release-fixture.bash) | Version, tag, and payload agree for a valid release. Keep each physical managed root, tool configuration, and project-owned bytes distinct. Use the existing declaration and real installer to establish ordinary baselines. |
| Native acceptance and test runner | Reuse published work, release, and CI facts in native setups. Consider native attempt identity and selected check or outcome records where tests arrange valid synthetic data. [Native family layers](../../tests/native-family-layers.md) · [Native evidence identity](../../tests/support/native-result-identity.sh) · [Check discovery](../../scripts/test-jobs.sh) | A retained real stream and an assessed observation are evidence. Keep captured events, malformed inputs, deliberate assessor counterexamples, commands, process control, paths, and timing in their existing proof roles. |

## Source findings to test during conversion

These observations are starting evidence, not a claim that the same examples
will still exist at execution. Recheck the current callers and choose the
smallest correction that preserves the proof.

- **Published work.** The readiness fixtures use a local `link` field and
  re-render backlog rows. The product backlog entry already owns `href` and
  its rendering. Carry the real entry shape through valid setup and keep raw
  strings in tests that prove the format. The catalog fixture's local `Project`
  also groups source, revision, membership and expected labels. Separate source
  facts from assertions when the setup is converted. [Readiness records](../../dashboard/tests/storyReadinessRecords.ts) · [Readiness fixture](../../dashboard/tests/storyReadinessFixture.ts) · [Backlog document](../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs) · [Catalog fixture](../../dashboard/tests/catalogProjectRecords.ts)
- **Launch and session.** The Recently done helper now builds its records with
  `makeMe.aLaunchRecord`. The launch-record schema tests still wrap Claude
  input in a recorded Codex request. Use coherent
  host and workflow variants for valid baselines. Keep deliberately contradictory
  cases, omitted legacy continuations, and alias rejection explicit if they are
  under proof. Review the fixture that casts incoming requests to recorded ones
  against the actual request contract. [Recently done helper](../../dashboard/tests/recentlyDoneSessionsSidebarPage.ts) · [Record rules](../../dashboard/backend-tests/launches/launch-record-session-rules.spec.ts) · [Shared launch fixture](../../dashboard/tests/support/sharedLaunchRecord.ts)
- **CI Proof.** The skill fixture infers `tests` from the single `dashboard/tests`
  path, while the Playwright converter emits `tests` for the frontend and
  backend entries too. Move setup onto the actual proof-unit contract. The
  dashboard artifact helper also has positional part tuples and casts around
  fragment facts. Compare those helpers with the production fragment constructor
  and preserve the real artifact encoding and collector proof. Reconcile with
  the overlapping [CI summary correction](SEED-259-scan-intent-ci-summaries.md#correct-scan-intent-ci-summaries)
  when this story is refined. [Skill fixture](../../src/skills/dough-test-optimization/scripts/ci-proof-test-fixtures.mjs) · [Playwright converter](../../src/skills/dough-test-optimization/scripts/ci-proof-fragments.mjs) · [Artifact helper](../../dashboard/tests/support/ciProofArtifacts.ts)
- **Installation and native checks.** The added-payload update check manually
  reconstructs an older installation from file presence and seeds one managed
  root. Establish whether that state is intentional migration evidence. If it
  is, keep the partial state explicit. If the case needs an ordinary verified
  installation, use the older installer as the existing story-payload check
  does. The shell host-hook fixture already invokes Node with arguments and
  gives the shared library a reuse path when a shell scenario needs it.
  [Added-payload check](../../tests/update-adds-new-payload-skill.sh) · [Story payload check](../../tests/story-payload-update.sh) · [Host-hook fixture](../../tests/helpers/host-hooks-fixture.bash)

## Conversion and proof boundaries

- Classify each scoped setup as arranged domain data, a real operation or
  harness responsibility, exact raw input or captured evidence, or an
  independent expectation. Convert the first category and preserve the others
  in their existing roles. A refusal can start with valid but unauthorized
  domain facts. Supply those facts through MakeMe and show the reason for the
  refusal in the case.
- Introduce or extend a builder only in the same change as a real test that
  uses it. Move useful existing construction into the shared entry point or
  make the harness delegate. Delete a builder or variant immediately when its
  last useful test consumer goes away, along with superseded fixture factories.
  A fabricated caller or a test of an otherwise unused builder does not justify
  retaining it.
- Repair fixture shapes and unnecessary translations when the scoped tests
  expose a mismatch. Retain real product boundary shapes and production
  encoders. A product contract or authority change with external consequences
  needs its own decision. Preserve exact malformed and legacy examples and keep
  expected results independent of the code producing the input.
- When a native scenario uses a new writer or builder, include its dependencies
  in the scenario's evidence identity. Keep test builders out of the managed
  installation payload. [Native evidence inputs](../../tests/native-family-layers.md)
- Compare the changed cases with their existing proof. A developer should be
  able to see the facts driving each case, follow them to the canonical model,
  and identify the same failure the test would catch. Run the relevant test
  entries and dashboard type-check when shared JavaScript changes. Carry the
  [failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests) into
  every plan and delegation. On awake macOS with AC power, wrap full runs in
  `caffeinate -s -i`. For battery, follow the maintained lid-open and log-check
  guidance. [Machine sleep on macOS](../../tests/local-test-resources.md#machine-sleep-on-macos)

These boundaries apply the current accepted decisions for
[direct domain mapping](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
[dashboard state authority](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
[release identity](../../docs/adrs/0003-tagged-release-versioning-accepted.md),
[installation ownership](../../docs/adrs/0004-client-installation-and-update-accepted.md),
and [cross-tool validation](../../docs/adrs/0005-cross-tool-validation-accepted.md).
Assess each conversion against the existing proof and maintainer effort under
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md). A runtime
gain needs measurement.

## Story decomposition

Effort is relative. The four conversion blocks are large, with scope and sizing to refine against real
consumers. No calibrated story effort bands are established.

<a id="map-launch-and-session-test-data"></a>

### Make kept launch record test setup map directly to the domain

**Identity:** SEED-261#map-launch-and-session-test-data
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/534-map-launch-and-session-test-data/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d2ac8d7e6f2df641dc123377b9eba40a3615b6e01783d6d38e1ecbe47dad3fb3","plan":"8f430970eba5ce448ba1ccc3a171f304fd2e2862ea289d2f15e46d595925ecea"}}
```

#### Goal

Maintainers reviewing dashboard tests can see which kept launches a case
starts from: the story or instruction a launch was requested for, its host
session, the workspace its start established, and when it was launched, in
the vocabulary of the persisted `LaunchRecord`. The same kept launch reads the
same way in frontend, backend, and integrated tests, and a test cannot keep a
launch the dashboard itself would never record.

#### Scope

- Build every valid kept launch record in the machine launch store through
  `makeMe.aLaunchRecord`, extending it with the variants its new consumers
  need. Cover launch history, Recently done, the sessions listing, story
  cards and side panels, review, configuration and runtime cases that keep
  records in the store across the three dashboard roots. Move or delete the
  suite-local record factories this displaces, such as
  `storyALaunchRecord`, `machineLaunchRecords`, `sharedLaunchRecord`,
  `sessionsReplay*`, `recentlyDone*` and `localTakenSessions`.
- Give the harness one owner for keeping records in the machine launch store,
  writing the store's own document shape for a project or for several, and
  route the current separate writers through it. The store file and its
  location stay harness layers, not builder facts.
- Keep an incoming launch request distinct from the request a record keeps.
  Remove `launchRequest as LaunchRecord["request"]` style conversions from
  stored setup; a record states its request through the builder. Keep the
  record's host and its session's host the same in valid setup: the
  launch-record session rules no longer wrap a Claude session in a Codex
  request unless that contradiction is under proof.
- Keep exact store text, malformed, legacy and retention-boundary records
  explicit where they are the subject, such as `seedStore` text and the
  launch-record schema specs. Times that drive retention stay visible at the
  call site and measured from the server's clock where they are today.
- Scope limits: launch request bodies sent to start a launch are test actions
  and stay as they are; only a body reused as a kept record's request
  changes. Live observation (`LaunchWithState`, `SessionState`, machine
  answer) and accepted attempts, completion and landing setup, Codex and
  Cursor continuation and terminal setup, and machine-local project
  configuration belong to the sibling stories below. In a mixed case, convert
  the kept record here and leave the other family's setup for its story.
  Product contracts and UI behavior do not change.
- Evaluate each converted family against its original cases: the facts that
  drive each outcome stay visible, assertions catch the same failure, and the
  shared setup removes a translation or a second model.

#### Key examples

1. Two projects each keep an execution launch of one story, one marked Done
   yesterday. When the sessions sidebar loads, Recently done lists only the
   Done one, under its project. The test states both records through
   `makeMe.aLaunchRecord` and writes them through the one store owner; the
   expected rows are written independently.
2. A dashboard server starts with a kept launch shared from the machine store.
   Its record is built as a recorded execution request with a Claude session,
   not as the incoming launch body cast to a record, and the server's
   answer matches that record.
3. The launch-record session rules accept a Claude session with its alias.
   The record wrapping it is a Claude record; a case that proves a mismatched
   host would state that mismatch itself.
4. The store holds text with an older record shape or an invalid entry. The
   test still writes those exact bytes, and the dashboard's handling is
   observed as before.

#### Architecture

Kept launches are machine-local operational evidence under
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state);
the builder returns the persisted `LaunchRecord` shape and the harness writes
it where a dashboard server reads it, keeping the record (domain fact) and the
store file (harness) apart, per
[ADR 0002 §5](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution).
Today about nine helpers write `agent-launches.json` themselves, and nine
suite-local factories build records, most without the builder. This story
makes `makeMe.aLaunchRecord` the one record constructor and one harness
function the one store writer, so the sibling stories compose observation,
completion, landing and host continuations onto the same record instead of
adding writers. Planning decides whether that writer uses the server's
[launch record document](../../dashboard/server/launchRecordDocument.ts) or
the plain document shape; either keeps the bytes the server reads.

<a id="map-launch-observation-test-data"></a>

### Make live launch observation test setup map directly to the domain

**Identity:** SEED-261#map-launch-observation-test-data
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/536-map-launch-observation-test-data/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a2fdc1270f21f3d431c3e908bed81c668a5a536c3b9972888c0f4fcf03af043d","plan":"ff60ee12180c38443fe44e73cb63381e7276d31d9a5871ada090b6be4a1a407e"}}
```

#### Goal

Maintainers can read a dashboard test's starting facts in the product's
vocabulary, including the kept launch being observed, the host's report,
the answer the page has read, and the machine's accepted attempts.
The same facts are recognizable across backend rules, frontend substitutes,
and integrated journeys, with the evidence for each outcome still visible.

#### Scope

- Arrange valid `SessionState`, `LaunchWithState`, and machine sessions
  answers through the shared MakeMe entry point. Compose a live record with
  the kept record it observes. Keep loaded and retained availability,
  activity such as working, waiting and review, unknown observation, and
  confirmed unavailability distinct. A stale read or a page holding its
  last answer is expressed through the read that produced it.
- Arrange accepted attempts and their observations through MakeMe. A kept
  attempt retains its incoming request and acceptance facts. A live attempt
  observation adds the answering server's ownership and activity. An attempt
  can precede a launch record; a launched outcome references its host and
  native session ID.
- Convert the scoped observation and attempt factories, deleting them or
  making them delegate to MakeMe. Keep case-driving facts at the call site.
  Preserve independent expectations, the operations under proof, and
  explicit native protocol inputs, exact wire omissions, legacy data and
  injected faults where a case depends on their form.
- Kept record persistence and its writer belong to the
  [kept record story](#map-launch-and-session-test-data).
  [Completion and landing](#map-launch-completion-and-landing-test-data),
  [host continuation and terminal setup](#map-host-continuation-test-data),
  and [machine-local project configuration](#map-project-configuration-test-data)
  retain their own setup conversions. Mixed cases convert the observation or
  attempt facts they arrange here. Product behavior and contracts are preserved.

#### Key examples

1. Two kept records share a native ID across different hosts. When one
   host's read fails and the other reports a retained session ready for
   review, the answer still carries both records with their respective
   unknown and retained-review states.
2. A card has shown a session ready for review. When a later machine read is
   refused with a retryable 503, the page keeps that entry and its last shown
   state. A successful read reporting confirmed unavailability can instead
   show Session unavailable.
3. A story has an accepted attempt owned by the answering server and still
   running, with no launched outcome or kept session. When the page reads
   that machine answer, the card shows startup in progress and disables its
   Start actions. When a launch does settle, the attempt identifies the
   session by host and ID.
4. A read receives an unfamiliar native status, a missing protocol field or
   corrupt attempt-store text. The case supplies that exact evidence and
   observes the same unknown or unreadable result after conversion.

#### Architecture

Compose the existing product shapes at the boundary the test arranges.
The stored record and host-qualified session identity come from
[`LaunchRecord`](../../dashboard/src/launchRecord.ts), while
[`LaunchWithState`](../../dashboard/src/launchRecord.ts) joins transient
session evidence to that record. The
[`MachineAnswer`](../../dashboard/src/agentLaunch.ts) and
[`AttemptObservation`](../../dashboard/src/launchOutcome.ts) carry the facts
the dashboard reads at their own boundaries. This follows
[ADR 0002 §5, Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
and [ADR 0008, Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).
Keep real host observation and attempt acceptance in the tests that prove
those operations. A fixture that supplies both an input and its expected
interpretation would hide the very regressions those tests catch.

<a id="map-launch-completion-and-landing-test-data"></a>

### Make launch completion and landing test setup map directly to the domain

**Identity:** SEED-261#map-launch-completion-and-landing-test-data
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/538-map-launch-completion-and-landing-test-data/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9b6552a8e42bb3812cbc52b9c0605a9a6a4dfb725166cf9465b83dcbd28d0a58","plan":"45b8a9783eca874a11ada775e54b29e8cbd3fa0dcf3fff25ce9761f15df972c4"}}
```

#### Goal

Maintainers can read a launch test's starting facts in the product's
vocabulary, from a retained final report and its receipt to the comparison
accepted for a landing. Those facts are recognizable across dashboard tests
and the landing delivery script, with each test's original proof still visible.

#### Scope

- Arrange valid completion reports, receipts, and retained final-report facts
  through MakeMe. Extend the existing kept launch builder with the outcome
  facts cases need, such as report identity, receipt time, and disposition.
  Keep the report, delivery receipt, native terminal evidence, and developer
  Done mark distinct.
- Arrange valid landing authority, submissions, retained comparisons and
  receipts where the dashboard suites and `dashboard-landing.test.mjs` supply
  those starting facts. Keep the original launch and the comparison's base
  and revision explicit when they drive the case. Use real Git and the actual
  capture path where the test observes publication, pinning or recovery.
- Remove the scoped completion and landing factories or make them delegate to
  MakeMe. Keep case-driving facts, independent expectations, exact malformed
  and legacy input, injected faults, and the operations under proof visible.
- The [kept launch record](#map-launch-and-session-test-data) story owns the
  common store writer. [Live launch observation](#map-launch-observation-test-data)
  and [host continuation](#map-host-continuation-test-data) own their data in
  mixed cases. This story preserves product behavior and proof boundaries.

#### Key examples

1. A kept launch has a read final report. When it receives a report with a new
   receipt, the new message is unread. A quiet completion and a developer Done
   mark remain separately readable facts.
2. A completion report accepted before native session binding carries its
   receipt into the bound record. When a bound launch loses a later delivery's
   acknowledgment, retrying that delivery after restart returns its original
   receipt without repeating Git or retirement.
3. A one-shot or story-branch publication has an accepted base and revision.
   When landing evidence is captured or recovered after trunk advances, it
   keeps that comparison for the original launch. Recording the comparison
   leaves completion and Done to their own operations.
4. A completed story has a retained comparison whose local repository is
   unavailable. When review opens the story, published evidence can still
   supply its changes. The test arranges the unusable local comparison and
   obtains the fallback through the real published reader.

<a id="map-host-continuation-test-data"></a>

### Make Codex and Cursor session test setup map directly to the domain

**Identity:** SEED-261#map-host-continuation-test-data
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/539-map-host-continuation-test-data/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"53b3efa3c327ad75e9dadcf76f825db2fbd02eecf57990c6f2e2f33a2902a6b1","plan":"fd6cd9cabe72929723126e462ff94cbcf02f8ddc6c5c5f2e90960f722f28cb67"}}
```

#### Goal

Maintainers can read which saved Codex thread or Cursor conversation a test
continues, where it resumes, and which host-specific facts drive the result.
Use the same domain setup in terminal, recovery, and held-session tests so
changes to continuation data can be made and reviewed in one place.

#### Scope

- Arrange valid Codex and Cursor sessions through shared MakeMe builders,
  either on a kept launch or as the session a terminal or runner consumes
  directly. Show the facts the case relies on. Codex has a thread ID, saved
  workspace and endpoint, and resume arguments, with a notice when the case
  needs it. Cursor has a native UUID, workspace and resume arguments, with
  the saved configuration scope when the case needs it.
- Convert arranged host and continuation facts in the Codex launch and
  observation support, Cursor start and recovery support, kept Cursor turns,
  Running Cursor sessions setup, and their terminal and runner consumers.
  Remove displaced constructors or make harness helpers delegate to MakeMe.
  A record actually produced by a launch, start, or recovery stays evidence
  from that operation. Keep fake hosts, real runner operations, terminal
  frames, process control and faults in their existing proof roles.
- Keep exact predecessor omissions, malformed input and extraneous aliases
  visible in the cases that verify how they are handled. Keep command,
  identity, and terminal expectations independent of fixture construction.
  Correct synthetic sessions whose resume arguments name a different
  conversation from their stored identity.
- The [kept record story](#map-launch-and-session-test-data) owns the machine
  store writer and general kept-record setup. The
  [live observation story](#map-launch-observation-test-data) owns passive
  observation records and live session and attempt answers. The
  [completion and landing story](#map-launch-completion-and-landing-test-data)
  owns report and receipt setup. In mixed cases this story owns the
  continuation or terminal facts needed to exercise those operations.

#### Key examples

1. A kept Codex thread has a saved endpoint and workspace. Opening its
   terminal resumes that thread with the saved endpoint and working directory.
   A schema case that supplies a predecessor record with no continuation or
   an extra Claude alias still observes the current decoding behavior.
2. A kept Cursor session has a saved model configuration scope. Recovering it
   resumes the saved UUID in its workspace with that scope. When a replacement
   runner considers several kept sessions, it revives the eligible one and
   the existing controls still distinguish finished, never-held, and failed
   revivals.
3. A terminal joins an already held Cursor session. The saved session
   identifies the conversation and the terminal assertions still observe its
   replay before queued live output.
4. A sidebar test arranges enough held Cursor sessions to overflow the list.
   Each row's UUID and resume arguments refer to the same conversation, and
   the test still observes that both lists can reach their last entries.

<a id="map-project-configuration-test-data"></a>

### Make machine-local project configuration test setup map directly to the domain

**Identity:** SEED-261#map-project-configuration-test-data
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Scope and value.** Convert machine-local project registration and settings
that tests write to `projects-development.json` and
`projects-production.json` (about 20 specs), through a shared configured
project builder typed against
[project configuration](../../dashboard/server/projectConfiguration.ts).
Keep a machine setting distinct from the published source it selects.

**Evaluation and stopping point.** Validation, serving-mode and add-project
cases keep their exact invalid inputs. The configuration writers in
`projectConfiguration`, `projectAddMachine`, `systemSettingsMachine` and
`sessionsReplayProjects` are removed or delegate to MakeMe.

<a id="map-intent-and-ci-proof-test-data"></a>

### Make Intent and CI proof test setup map directly to the domain

**Identity:** SEED-261#map-intent-and-ci-proof-test-data
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Scope and value.** Convert Intent source/location and candidate setup,
revision CI observation, attempts, mailbox records, and proof data across the
dashboard, skill, and support tests. Correct path-based proof unit inference
and any suite-only translations of attempt, fragment, or summary facts. A
reviewer can trace what was checked, which attempt supplied evidence, and what
is absent or measured zero.

**Evaluation and stopping point.** Keep the same evidence distinctions and
assertions in the existing proof producer, collector, and reader cases. Real
artifact assembly, parse failures, and source positions still reach their
respective boundaries. The evidence families are converted and usable on
their own.

<a id="map-installation-and-native-test-data"></a>

### Make installation and native test setup map directly to the domain

**Identity:** SEED-261#map-installation-and-native-test-data
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Scope and value.** Convert remaining release, payload, installed state,
host-hook settings, native scenario and runner setup across `tests` and the
skill suites. Reuse the same library through the Bash-to-Node boundary where
the shell arranges domain data. Review partial installation and duplicated
configuration setup against the actual release, settings and installation
contracts. Keep platform and host differences visible where they determine
the result.

**Evaluation and stopping point.** Real installer, update, subprocess, replay,
and assessor checks retain their behavior and evidence. Valid synthetic
records come from the shared library while raw inputs and retained evidence
keep their provenance. Reconcile coverage across all five entries, including
Node support jobs under `tests/support`, and remove any remaining obsolete
domain constructors or builders without a useful test consumer.

## Ordering and scope

Queue published work first, then local launch and session work, Intent and CI
Proof, and release and native checks. Terry split the launch and session block
into five stories, queued in order: kept launch records and the machine
store, live observation and attempts, completion and landing, Codex and
Cursor sessions, then machine-local project configuration. The stories are organized
by the domain facts they own, so each can finish its proof without waiting for
an entire runner or layer to migrate. Queue order expresses Terry's requested
priority and learning sequence. No blocking supplier agreement has been
established. If rollout pauses, retain completed family conversions and their
proof. Refinement can adjust a block's boundary when live consumers reveal a
better stopping point.

Use the [declared test entries](../open-dough.json) as the coverage inventory.
Published-work, machine-local, and Intent cases can cross the three dashboard
roots. Published-work and CI stories also own their facts in skill and Node
support checks. The final block owns shell release and native setup and checks
for remaining domain setup in all entries. A cross-domain test can use builders
from several families while each fact keeps one owner.
