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
Assess each conversion against the existing proof and maintainer effort under
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md). A runtime
gain needs measurement.

## Story decomposition

Effort is relative. The four conversion blocks are large, with scope and sizing to refine against real
consumers. No calibrated story effort bands are established.

<a id="map-published-work-test-data"></a>

### Make published work test setup map directly to the domain

**Identity:** SEED-261#map-published-work-test-data
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-261#map-published-work-test-data","dependencies":[{"supplier":{"identity":"SEED-261#share-published-agent-profile-builders","href":"seeds/SEED-261-share-domain-test-data.md#share-published-agent-profile-builders"},"implementation":"The pilot establishes tests/support/makeMe.mjs as the single test-only ESM entry and delivers its first shared builder for published agent profiles.","rationale":"Every conversion slice must use the canonical MakeMe entry. The pilot owns its first cross-entry delivery, and a second or independently bootstrapped entry would duplicate that responsibility. The profile conversion also extends the pilot's builder.","condition":"Trunk contains tests/support/makeMe.mjs and its shared anAgentProfile builder, exercised from dashboard and Node test entries with dashboard type-check coverage.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/508-map-published-work-test-data/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"7ad817b02f9495054541859b7c4069186ecd19f3b10477283b73cf72ab80a922","plan":"5fb5b5831b270962d2a8b964bfbe4d5636e5d67f827eabd6e65bd4315d73a93b"}}
```

#### Goal

Maintainers reviewing tests for published work can read the facts that drive
each case in the product's vocabulary. A story's identity and home, its
membership, its published revision, and its preparation and progress should be
recognizable across test entries without decoding fixture-specific fields.

#### Scope

- Convert remaining valid setup for published project sources, story homes and
  backlog membership, published assignments, preparation and supplier
  agreements, slice plans and progress, done records, and published Git
  comparison inputs. Cover dashboard, skill, Node and shell consumers that
  arrange these facts. Extend the shared MakeMe entry and the pilot's profile
  builder with real consumers. Keep defaults incidental and remove displaced
  fixture models and constructors as each family is converted.
- In readiness setup, carry `href` and the product backlog entry's plan link
  through the existing renderer and preparation commands. In catalog setup,
  keep pinned source facts and work records distinct from expected card text
  and paths. Carry identities and homes explicitly where they drive a case.
- Preserve independent expectations and use the existing CLI, encoders,
  observation boundaries and real Git operations that the cases exercise.
  Keep exact syntax, malformed and legacy records, captured evidence, and
  fault injection explicit where they are the subject of the test. Where a
  native scenario changes its arranged input, update its evidence inputs.
- Scope limits: machine-local configuration and workspace/session state,
  launches and landing receipts, Intent and CI evidence, and installation or
  native-runner setup belong to the later conversion stories. In mixed cases,
  convert the published facts here and verify the existing journey. The
  delivery changes test setup and preserves product contracts and UI behavior.
  The [Git fixture migration](SEED-262-faster-dashboard-test-feedback.md#build-explicit-git-fixtures)
  owns the shared repository description and materializer. This story owns
  the published work facts those fixtures arrange and can use the existing
  harness where the shared materializer is unavailable.
- Evaluate the converted families against their original cases. Check that the
  facts governing each outcome remain visible, that assertions still catch the
  same failure, and that shared setup removes a translation or a second model.

#### Key examples

1. A pinned catalog project has a Taken correction and a queued story with
   purpose. When selected, the dashboard reads its configured repository and
   ref, then reads that revision. Its two cards show that project's titles and
   purpose. The fixture supplies distinct source and work facts, and the test
   checks the requests and visible text independently.
2. An existing story moves to a different home without changing identity.
   When the backlog is refreshed, the entry follows the moved home. For a
   Taken story with a plan, the readiness journey reads its canonical entry
   and recorded assessment. A separately published update changes membership
   or assessment only through the facts it writes.
3. A ready consumer has an unsatisfied supplier agreement. A start eligibility
   read still reports the dependency blocker. A verified resolution clears
   that blocker without renewing the consumer's readiness review.
4. An execution profile names an agent and a story, while a plan shows ordered
   slices and recorded proof. When the dashboard reads them, it shows the
   published owner and progress. The execution-complete indication still
   depends on its own proof, even when the slices appear done.
5. Completing a Taken item through the product command leaves a durable done
   record. A later read still shows that work and its recorded attribution
   after the plan or assignment has been removed.
6. A reviewed story has published work alongside another author's trunk
   commit and an unpublished worktree edit. Review continues to select the
   story's published changes and distinguish local changes. Git establishes
   the revisions and ancestry the test checks. After a Story Branch
   integration retires its workspace, review from the done card still uses
   the comparison pair recorded at landing.

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

Queue published work first, then local launch and session work, Intent and CI
Proof, and release and native checks. The stories are organized
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
