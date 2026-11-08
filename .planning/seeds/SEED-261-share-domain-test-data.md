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

<a id="map-launch-completion-and-landing-test-data"></a>

### Make launch completion and landing test setup map directly to the domain

**Identity:** SEED-261#map-launch-completion-and-landing-test-data
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Scope and value.** Convert completion reports and receipts, completion
recovery, retained final reports, landing and one-shot landing receipts in
the dashboard roots, and the launch data the skill
`dashboard-landing.test.mjs` arranges (about 43 specs). Extend the kept
record's outcome facts instead of a second completion model.

**Evaluation and stopping point.** Reports, receipts and terminal protocol
evidence stay separate; recovery and fault cases keep their injected faults
explicit. The completion and landing factories are removed or delegate to
MakeMe.

<a id="map-host-continuation-test-data"></a>

### Make Codex and Cursor session test setup map directly to the domain

**Identity:** SEED-261#map-host-continuation-test-data
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Scope and value.** Convert Codex and Cursor kept sessions, their
continuations, and terminal setup built on them, across `codexLaunch`,
`codexObservation`, `cursorStart`, `keptCursorTurn`, `cursorSessionRecovery`,
`runningCursorSessionsPage` and their consumers (about 55 specs). Each host
follows its own continuation contract.

**Evaluation and stopping point.** Fake host processes, terminal and process
behavior stay in the harness. Omitted legacy continuations and alias
rejections stay explicit where under proof. The host record factories are
removed or delegate to MakeMe.

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
