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
  and preserve the real artifact encoding and collector proof. [Skill fixture](../../src/skills/dough-test-optimization/scripts/ci-proof-test-fixtures.mjs) · [Playwright converter](../../src/skills/dough-test-optimization/scripts/ci-proof-fragments.mjs) · [Artifact helper](../../dashboard/tests/support/ciProofArtifacts.ts)
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

<a id="map-project-configuration-test-data"></a>

### Make machine-local project configuration test setup map directly to the domain

**Identity:** SEED-261#map-project-configuration-test-data
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/540-map-project-configuration-test-data/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"0f90a5ca633c93868256435472a2f159e1801b84f1d22cc2bec9fb900f58d290","plan":"27d4042f05b3192fc2b42b7a1d60dd86b6e52c92bc72e93b8424742594455da0"}}
```

#### Goal

Maintainers can see which projects a test configures, which published source
each project reads, and which checkout the machine uses. Use shared MakeMe
setup so the same configuration facts can be read and changed consistently
across dashboard tests.

#### Scope

- Arrange valid synthetic entries in `projects-development.json` and
  `projects-production.json` through a shared builder typed against
  [ConfiguredProject](../../dashboard/server/projectConfiguration.ts). Keep
  project order, environment, repository and ref, local path, and visibility
  explicit wherever they drive the case. Remove displaced constructors or
  have their harnesses delegate the data construction to MakeMe.
- Cover the ordered saved catalog, configured predecessors for project
  admission and settings, and the Sessions replay catalog. Keep real server
  seeding, Add, Hide and Remove operations, Git checkout setup, and fake
  GitHub responses at their existing boundaries. The default development
  harness can reuse the real production seed for its ordinary starting list.
- Preserve literal malformed, wrong-shape and empty-file examples, exact
  Add inputs, write faults, and independent assertions. Keep any saved bytes
  captured from a real operation as evidence. Project configuration selects
  a published source and supplies a machine-local path. Source-only fixtures,
  published Intent settings, launch records, and session evidence have their
  own scope.

#### Key examples

1. A saved production catalog puts Zebra on `trunk` before Apple on
   `default`. The dashboard starts and restarts with Zebra selected, reads
   the configured repository and ref, and preserves the saved file.
   Development and production each read their own environment's list.
   An existing empty or malformed file retains its bytes and still gives
   the corresponding empty or error result.
2. A valid saved project already claims the repository or project ID in a
   different case. Adding the same repository or ID is refused with the
   predecessor intact.
3. A configured long checkout path is shown in settings even at narrow
   width, while the published project list omits checkout paths.
4. The Sessions replay starts with six configured projects and their real
   test checkouts. The server reads the same ordered sources, resolves their
   configured paths to the checkouts holding 44 linked worktrees, and keeps
   the existing open, Done, and history listing proof.

<a id="map-intent-and-ci-proof-test-data"></a>

### Make Intent location, source and candidate test setup map directly to the domain

**Identity:** SEED-261#map-intent-and-ci-proof-test-data
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/548-map-intent-and-ci-proof-test-data/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a4b05455de5da3815abd369668726dd1e44525cc07195e10701c9619bf79b0d8","plan":"a3f68b06d31d1590d5fd98b9148d5f0bb48bc8ac20e990a9fd4395948cde8d0c"}}
```

#### Goal

Maintainers reviewing Intent tests can see which locations a project
declares, which published files each location selects at a revision, and
which Test Optimization Candidates the project records, in the vocabulary of
the product's settings, locations answer and candidates record. The same
declaration or record reads the same way in integrated journeys, backend and
frontend specs, and Node support tests, so a change to one of these contracts
is followed in one place.

#### Scope

- Arrange valid Intent settings in `.planning/open-dough.json` through
  `makeMe.intentSettings` and `makeMe.anIntentLocation`: a location's path,
  its kind with optional include patterns or its source entries with
  optional syntax, and its label when the case shows one. Publish them as
  JSON with the project's other files at the published revision through the
  existing published-file harness. Replace the per-fixture settings strings
  in the Intent browse, Gherkin, candidates, boundary and story-worktree
  fixtures, and the settings written inline in Intent specs.
- Build a locations answer, a declared location with the files it selects
  at a revision and its problem when one applies, through the same location
  builder wherever a backend, frontend or Node test arranges that answer
  instead of observing it. Type the frontend service substitute's locations
  and candidates answers against the product's answers. Derive the
  candidates' configured inventory with the product's
  [`inventoryFromIntentLocations`](../../dashboard/src/intentCandidatesLocationMatch.ts)
  instead of restating it.
- Build Test Optimization Candidates records through
  `makeMe.aTestOptimizationCandidatesRecord`, extended for entries in each
  finding section with the facts a case states. Replace the hand-written
  record Markdown in the Intent candidates fixtures and the backend
  candidates read spec, and remove the suite-local `candidateRecordEntry`.
- Keep literal what a case proves by its exact form: malformed, empty or
  unreadable settings; declarations the reader must ignore, such as a
  non-string label, unsafe or empty include patterns, and malformed source
  entries; mismatched or partial record Markdown; recorded location
  references matched as written; and authored test sources and Gherkin
  features whose syntax, lines or wording are the subject. Independent
  expectations stay as they are.
- Keep real server reads, published-file serving, Git worktrees, fake GitHub
  answers and injected read faults at their existing boundaries.
- Scope limits: GitHub Actions runs, CI adapter attempts and coverage, and
  CI proof data belong to the sibling stories below. In a mixed case, such as
  a journey that publishes Intent settings and serves CI, convert the Intent
  facts here and leave the CI setup for its story. Settings, locations and
  candidates contracts and UI behavior do not change.
- Evaluate each converted case against its original: the facts that drive
  each outcome stay visible, assertions catch the same failure, and the shared
  setup removes a translation or a second model.

#### Key examples

1. An Open Dough-shaped project declares `dashboard/tests` TypeScript specs
   and `tests` shell checks. Intent lists both locations with their published
   files. The test states both locations through MakeMe, the settings are
   published from that value, and the expected tree is written independently.
2. A project declares a usable Gherkin location, a missing path, an empty
   folder, a `java` kind and a JavaScript location with include patterns.
   The locations read lists the usable files and marks `no-matching-files`
   and `unsupported-kind` as before. All five come from MakeMe with those
   facts visible. A label of `42` or a malformed `sources` list that a case
   proves is ignored stays literal JSON in that case.
3. A candidates record holds a pending candidate naming a file by `path:line`
   and an accepted necessary cost naming a case by `path::case`. MakeMe builds
   the record with those entries, and opening each from Optimization
   Candidates positions Purpose as before. An empty record still shows its
   four sections with `None.`, and a record with a different heading stays
   literal Markdown.
4. The recorded-location matcher derives its configured inventory from
   answered locations built through MakeMe, and the story overlay and the
   frontend service substitute use the same answered-location shape. The
   recorded reference strings stay literal.

<a id="map-github-actions-ci-test-data"></a>

### Make GitHub Actions run and attempt-job test setup map directly to the domain

**Identity:** SEED-261#map-github-actions-ci-test-data
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Scope and value.** Convert the GitHub Actions workflow runs, run attempts
and attempt jobs that tests arrange for a checked revision: dashboard base-CI
judgment, CI status and story CI comparison endpoints (`CiRunAnswer`, `wall`,
`actionsRunsAnswer` and the `storyCiComparison*` fixtures), the execution
skill's GitHub observation, reuse and integrated-state fixtures, and the Node
support revision lookups (about 33 files). A reviewer can see which run and
attempt a case checks, at which revision, with what conclusion and timing.

**Evaluation and stopping point.** Real Git histories, fake GitHub routing,
request counting, held or failing reads and controlled clocks stay in the
harness. Queued, in-progress, cancelled and missing runs stay distinct from a
completed verdict. Suite-local run constructors are removed or delegate to
MakeMe.

<a id="map-ci-adapter-and-coverage-test-data"></a>

### Make CI adapter attempt, queue and coverage test setup map directly to the domain

**Identity:** SEED-261#map-ci-adapter-and-coverage-test-data
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Scope and value.** Convert CI adapter attempts and queue entries for a
checked revision, and the execution mailbox's revision coverage records:
dashboard adapter answers for base CI, CI status and comparisons, the
execution skill's command adapter, revision coverage, queue and mailbox
completion fixtures, and Node support adapter lookups (about 60 files). A
reviewer can trace which adapter attempt supplied a verdict, which revisions
were only queued, and what coverage the mailbox recorded.

**Evaluation and stopping point.** A queue fact keeps no verdict. Pending,
undiscovered, not-required and resolved coverage stay distinct. Adapter
processes, mailbox workers, wake-ups and process lifetime stay in the harness.
Suite-local attempt, queue and coverage constructors are removed or delegate
to MakeMe.

<a id="map-ci-proof-test-data"></a>

### Make CI proof evidence test setup map directly to the domain

**Identity:** SEED-261#map-ci-proof-test-data
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Scope and value.** Convert CI proof fragments, summaries, proof entries and
runner proof records across the collector and converter tests, the Node
support readers and scope comparisons, and the dashboard proof journeys
(about 35 files). Correct path-based proof unit inference and the positional
part tuples and casts around fragment facts named in the source findings
above. A reviewer can trace what was checked, which attempt supplied
evidence, and what is absent or measured zero.

**Evaluation and stopping point.** Keep the same evidence distinctions and
assertions in the existing proof producer, collector, and reader cases. Real
artifact assembly, parse failures, and source positions still reach their
respective boundaries. A summary and its fragments keep one attempt identity
and checked revision. Proof fixtures are removed or delegate to MakeMe.

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
Cursor sessions, then machine-local project configuration. Terry split the
Intent and CI Proof block into four stories, queued in order: Intent
locations, sources and candidates; GitHub Actions runs and attempt jobs; CI
adapter attempts, queue entries and coverage; then CI proof evidence. CI proof
comes last so its refinement maps onto the explicit test case and test file
units of [SEED-281](SEED-281-distinguish-test-cases-and-files-in-ci-proof.md#distinguish-test-cases-and-files-in-ci-proof).
The stories are organized
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
