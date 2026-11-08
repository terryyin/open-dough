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

Start the shared library with the agent profile builder needed by the pilot.
Likely public names include `anAgentProfile`, `aBacklogEntry`, `aStoryPlan`,
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
- **Launch and session.** The Recently done helper combines arbitrary hosts,
  workflows, and identities through a `LaunchRecord` cast. The launch-record
  schema tests also wrap Claude input in a recorded Codex request. Use coherent
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
Assess the pilot against the existing proof and maintainer effort under
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md). A runtime
gain needs measurement.

## Story decomposition

Effort is relative. The pilot is a smaller cross-entry change. The four
conversion blocks are large, with scope and sizing to refine against real
consumers. No calibrated story effort bands are established.

<a id="share-published-agent-profile-builders"></a>

### Share one published agent profile builder across test entries

**Identity:** SEED-261#share-published-agent-profile-builders
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/505-share-published-agent-profile-builders/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"27ca9faa1592ccb993bf7739db5afe0cf31a58f9b31ea6e5c31179021558bd60","plan":"84576c3e6eb18678adceb4777fee95922a2b91838c8593b460e0092d820626d9"}}
```

#### Goal

Maintainers and agents reading Open Dough tests see a published agent profile
arranged the same way in Playwright TypeScript and `node:test` JavaScript
entries, with only the facts that drive each case at the call site. This first
complete conversion creates the shared MakeMe entry point and shows whether one
builder carries across runners before the larger families follow.

#### Scope

- Create `tests/support/makeMe.mjs` with `makeMe.anAgentProfile`, typed with
  `@ts-check` against `renderAgentProfile`'s input. `.preparing(...)` and
  `.executing(...)` choose the activity and `.please()` returns profile facts,
  not rendered text. Name the activity on both, as `parseAgentProfile` returns
  it, so a read-back profile and a built one have the same shape. Tests still
  render with `renderAgentProfile`.
- Defaults cover only incidental facts. An execution profile defaults to Trunk
  Mode on `origin/main`, and host and model stay unrecorded unless given. Tests
  state the name, which decides the profile path and rotation, wherever it
  matters. Add story-branch or other variants only with a real consumer.
- Convert all valid profile setup in:
  - the dashboard published-facts isolation fixture ([browser setup](../../dashboard/tests/publishedFactsIsolation.ts));
  - the backend profile-addition spec ([backend profile addition](../../dashboard/backend-tests/observation/authenticated-read-profile-addition.spec.ts));
  - the skill preparation-assignment fixture, which changes
    `publishAssignment(trunk, name, facts)` to `publishAssignment(trunk, profile)`
    ([skill assignment fixture](../../src/skills/dough-story-refinement/scripts/preparation-assignment-test-fixtures.mjs));
  - the recovery fixture's `occupyAllBut`, which publishes execution profiles
    ([recovery fixture](../../src/skills/dough-story-refinement/scripts/preparation-assignment-recovery-fixtures.mjs));
  - the rival Yui profile in the announce test.

  Update every caller of the changed `publishAssignment`: the announce,
  land, nerds, one-shot refinement and one-shot auto-land tests, and the
  dashboard [preparing journey](../../dashboard/tests/preparingJourney.ts).
- Keep each test's assertions, real Git publication, server reads and recovery
  faults. Expected values stay independent of the builder.
- Scope limits: other `renderAgentProfile` callers, parser tests in
  `tests/support/product-backlog-agent-profile.test.mjs`, and the
  dough-land tests stay with their owning conversion stories. No builder-only
  test is added.
- Keep raw input under proof literal: the abandon test's unrecognized rival
  profile stays `{ unrecognized: true }`.
- Evaluation: compare before and after for readability, coverage, duplication
  and maintenance cost. Record in the plan's learnings what carried across
  entries, what needed a distinct form and what later stories should reuse.
  Finish with no superseded profile helper.

#### Key examples

1. **Dashboard, two revisions.** Revision A's isolation facts build Akiho as
   `executing({ name: "Akiho", identity: sharedStoryIdentity })` with host
   `codex` and model `model-at-A`. They also build Kirara as
   `preparing({ name: "Kirara", identity: queuedIdentity })` with host
   `claude`. Rendering them produces the same bytes as today's literal facts.
   The published-facts isolation spec shows A's owner and preparer, then B's,
   with unchanged assertions.
2. **Backend, incidental identity.** The profile-addition spec publishes
   preparation profiles for Yui and Akiho. Only the names appear at the call
   site, and the work identity uses the builder default. `committed=added`
   gives the same commits and refusals.
3. **Skill, another developer's assignment.** The announce test publishes
   `publishAssignment(trunk, makeMe.anAgentProfile.executing({ name: "Yui", identity: "SEED-X#x" }).please())`
   and a preparing Akiho. A real `start` still announces the next free name,
   and the trunk file has `renderAgentProfile`'s bytes.
4. **Dashboard calls a skill helper.** The preparing journey republishes the
   refining agent's preparation profile with host `cursor` and model
   `later-model` through the changed `publishAssignment`. The dashboard specs
   that read this reused revision keep their assertions.
5. **Recovery, every name held.** `occupyAllBut(trunk, "Yui")` builds an
   execution profile for every other rotation name. The reuse test still
   announces Yui. In the stops test, a rival takes Yui during the push, and
   the start still reports `agent-unavailable`.
6. **Type safety.** A builder that returns a value `renderAgentProfile` rejects,
   such as a numeric identity, fails `npm run typecheck:dashboard` through the
   dashboard test that imports it.

#### Architecture

The builder lives in `tests/support/makeMe.mjs`, which the Playwright and
`node:test` runners both import. Skill tests already import shared helpers
from `tests/support`. Its JSDoc type comes from `renderAgentProfile`'s
parameter, so the encoder in
[product-backlog-agent-profile.mjs](../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs)
remains the authority for the profile shape and validation
([ADR 0002 §5](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)).
The install payload is an explicit list in `install.sh`, so neither
`tests/support` nor the skill fixtures are installed
([ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md)).
The native owned-context fixture
([fixture](../../tests/support/git-publication-native-owned-context-fixture.mjs))
loads the preparation fixture module only for `createPreparationTrunk`, which
arranges no profile. It will now load MakeMe too, but its scenario uses no
builder, so its evidence identity stays unchanged.

<a id="map-published-work-test-data"></a>

### Make published work test setup map directly to the domain

**Identity:** SEED-261#map-published-work-test-data
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Scope and value.** Convert the remaining project source, story, backlog,
assignment, readiness, dependency, plan, done record, and published Git review
setup. This spans the dashboard roots, skill suites, and supporting Node or
shell checks where they arrange those facts. A reviewer should be able to
distinguish identity, source revision, membership, and readiness in the test
without reconstructing them from fixture-specific fields. Include mapping
repairs such as the readiness entry and catalog setup described above.

**Evaluation and stopping point.** The affected suites exercise the same
published, taken, moved, dependent, and completed cases with their governing
facts explicit. Real Git still supplies relationships under proof. The
published work families are converted and readable on their own.

<a id="map-launch-and-session-test-data"></a>

### Make launch and session test setup map directly to the domain

**Identity:** SEED-261#map-launch-and-session-test-data
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Scope and value.** Convert machine-local configuration, starts and attempts,
workspace ownership, host sessions, observation, terminal setup, completion and
landing facts in the three dashboard roots and related skill and Node support.
Repair contradictory or flattened representations, including host/workflow and
recorded/live distinctions. Reviewers can then see which real state enables
each action or refusal across layers.

**Evaluation and stopping point.** Valid setup follows the same discriminants
in frontend, backend, and integrated tests. Cases still show first input,
workspace ownership, stale or unknown observation, and actual terminal or
process behavior where they drive the proof. Existing protocol evidence and
malformed or legacy examples remain explicit. The machine-local families are
converted independently of later work.

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

Queue the pilot first, then published work, local launch and session work,
Intent and CI Proof, and release and native checks. The first story supplies
experience with a complete cross-entry change. The later stories are organized
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
