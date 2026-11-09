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

<a id="map-github-actions-ci-test-data"></a>

### Make GitHub Actions run and attempt-job test setup map directly to the domain

**Identity:** SEED-261#map-github-actions-ci-test-data
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/553-map-github-actions-ci-test-data/PLAN.md","assessment":"not-ready","reasons":["Slice 1: the unchanged fast-forward comparison test failed its default 30000 ms timeout under contention. The admitted baseline, MakeMe conversion, discrimination and restored observations never started while another full suite held admission. Reproduce and repair the test or environment as needed, and verify that exact probe under maintained admission before clearing readiness."],"basis":{"document":"020372126b3f29db6e96113e19edff485aa62977d8a84f3b6364094cbd2294e4","plan":"e37e297ec9b31389c20ad136c51cf5886858012e58ba23610592121ffa486033"}}
```

#### Goal

Maintainers can read which GitHub Actions run and attempt a test checks, at
which revision, with which conclusion and timing, in the same vocabulary
across dashboard and execution tests. Shared MakeMe setup owns those arranged
facts so a domain change has one construction rule and preserves the existing
independent behavioral proof.

#### Scope

- Convert valid synthetic workflow runs, run attempts and attempt jobs in
  dashboard base-CI judgment, Intent CI status and story comparisons, the
  execution skill's GitHub observation, reuse and integrated-state fixtures,
  and Node support revision selection. Include indirect consumers of the
  shared run and job factories. Remove displaced constructors or have their
  harnesses delegate to MakeMe.
- Align the existing `aCiRun` with the production GitHub observation contract
  instead of the dashboard's suite-local `CiRunAnswer`. Keep actual GitHub
  REST responses and observed run/current-attempt projections distinct,
  reusing the existing API encoding seam. State revision, run and attempt
  identity, branch, event, conclusion and times at the call site whenever
  they drive the case. Preserve repository and workflow ownership in reuse.
- Preserve pending, queued, in-progress, cancelled, skipped, absent and
  completed outcomes as distinct facts. An earlier completed attempt and a
  current rerun keep their separate identities. Synthetic job setup states
  the facts the consumer needs; no new restriction on opaque identities or
  absent timing follows from conversion.
- Keep real Git histories and executed commands, fake GitHub routing,
  pagination, request counting, held or failing reads, controlled clocks,
  process lifetime and teardown in the harness. Keep captured job timestamps,
  log text, malformed/partial responses and exact encoder-input examples
  literal where their form is under proof. Expectations stay independent.
- CI adapter attempts, queue and coverage records, and CI proof fragments and
  summaries belong to the sibling stories. In mixed fixtures, convert the
  GitHub run/job facts only. This story changes test construction and exposed
  mapping mistakes; it makes no new UI, provider-contract or CI-policy promise.

#### Key examples

1. A run at the checked revision is in progress while a strict ancestor has
   completed. Base-CI judgment and revision lookup keep the running and
   completed evidence distinct, use only eligible ancestor results, and do
   not mistake a sibling or queued rerun for a completed verdict. For one run
   whose latest attempt is cancelled, an earlier completed timed attempt at
   that same revision remains selectable.
2. A listed run 41, attempt 1, starts at 10:00 and completes at 10:03 for the
   shown revision. Intent shows that attempt and CI wall time 3 min; absent
   timing remains unavailable. A cancelled latest attempt does not erase an
   earlier completed result's usable time.
3. A story's Branch and Landed results refer to the same attempt. The
   comparison retains the correct baseline and both endpoint identities,
   shows the same attempt-job timing, and reads the shared attempt's jobs
   once. A refused read can recover; settled evidence stops further reads.
4. A workflow is still running when one attempt's job fails, or a failed
   earlier attempt is discovered after a later success. The observer keeps
   that failure actionable with its own run, attempt and job evidence,
   including a failing job on a second page. Diagnostic log evidence remains
   the original text.
5. An exact-revision run has successful direct job proof with matching
   repository, workflow and context. Reuse selects its current attempt; a
   newer pending rerun or a changed/partial read chooses fresh execution.
   A later successful retry can qualify, preserving an opaque source run ID
   separately from the target's own completion.
6. Accepted B has a `not_required` basis and no run; descendant C executes the
   declared check successfully. With the integrated-state policy, the
   observer can validate B at C while retaining B's own basis. Without that
   policy B stays unresolved, and B's own failure remains a failure beside
   C's green. Git ancestry and the command producing C's result stay real.

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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/549-map-installation-and-native-test-data/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"bf8ac4617780d7e9728afb4494b3e6170cb705bd458470ef8fe4ed87c438c91e","plan":"288704bfd8873bdb0ec1a05b917bffa4cf47d624dd570f4e13184be9d883e614"}}
```

#### Goal

Maintainers can read installation and native-check setup in the same domain
language as the rest of the tests, and change a shared fact in one place.
Finish the conversion with real release and installation relationships and
the existing independent behavioral proof intact.

#### Scope

- Convert remaining arranged release, payload, host-hook settings, native
  starting project and runner-duration facts through the shared MakeMe entry
  point. Shell scenarios use small Node writers for domain data; installation,
  Git history, processes, clocks and teardown remain harness operations.
  Reuse the release-source path already converted by published-work stories.
- Establish ordinary installed baselines with the real installer. Preserve
  the added-payload check's asymmetric predecessor as an explicit case:
  an older verified shared root exists and the Claude root is absent. Do not
  let a collection of present files silently stand for an ordinary complete
  installation. Keep physical roots, source/version records, project-owned
  configuration and host settings distinct.
- Convert the native Take and closure scenarios' valid published starting
  facts, and the worktree-preparation scenarios' starting repository facts.
  Preserve the actual originating checkout, worktree topology, executable
  inputs and preparation observations. A changed fixture dependency must
  enter its evidence identity; replay and substitute-host results retain
  their existing evidential limits.
- Reconcile remaining setup across the five declared test entries and the
  separately discovered `tests/support/*.test.mjs` jobs. Known residue includes
  feedback-review dates, maintenance choice and observation facts, automatic
  maintenance requests, and recorded job durations. Extend the existing
  canonical builders where appropriate and remove displaced constructors
  and builder variants with no useful test consumer. Keep the currently
  separate project-registry and Intent/CI Proof stories' ownership intact.
- Keep literal malformed and legacy examples, exact parser inputs, generated
  product programs, captured native streams, assessor counterexamples,
  commands and independent expectations in their proof roles. Builders stay
  outside the managed installation payload. This story changes test setup;
  it does not add installer policy, scheduling policy or native host behavior.

#### Key examples

1. Release 0.1.1 withholds the subsequently added skills. An ordinary old
   installation, or the explicit older shared-root-only predecessor, is
   updated to 0.1.2. Both physical roots then contain the declared new payload
   and matching version records, while unrelated guidance and project-owned
   configuration retain their bytes. The ADR delivery-to-use fixture also
   retains its distinguishable old and improved released guidance.
2. Each host has valid unrelated settings and handlers. Installing merges
   the managed handlers once and preserves the unrelated settings. Exact
   prior registration remains unwritten; an explicitly edited managed
   handler still refuses before writes, including with force.
3. A native Take scenario starts with one queued, refined planned story.
   The real installed claim workflow moves that story to Taken. Closure
   scenarios keep their declared starting revisions, concurrent source
   changes and pending human files, so their existing publication and
   observer-order checks still evaluate the same journey.
4. A native preparation scenario has a non-bare originating checkout with no
   remote and a sibling execution worktree. The locked Node and executable
   wrapper cases keep their original project inputs, separate generated
   state and preparation traces. Fresh, reuse and failed-preparation
   observations still distinguish their existing outcomes; dependency hashes
   include any shared fixture modules newly used by those scenarios.
5. Feedback maintenance is enabled and the published review is due on
   2026-10-28. A start already serving that date prevents another start for
   it, including when its process has ended; a later due date can start.
   The saved choice, published review, kept session and live attempt remain
   distinct facts, and the existing due-row and settings journeys retain
   their observations.
6. Recorded jobs a, b and c each took five seconds and d took one. Dealing
   them into two shares still yields a/c and b/d, longest first; unrecorded
   jobs use the recorded median or the existing one-second fallback. Exact
   timing-list and malformed parser examples keep their independent bytes.

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
