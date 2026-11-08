# Make published work test setup map directly to the domain

**Identity:** SEED-261#map-published-work-test-data
**Source:** [Refined story](../../seeds/SEED-261-share-domain-test-data.md#map-published-work-test-data)
**Source review:** [Independent source commitments](source-review.md)

## Goal and boundaries

Make the facts behind published work readable and reusable at the test call
site. Deliver one test-data conversion per observable family, with existing
product behavior and independent expectations preserved. The seed owns the
scope, examples, and waiting supplier agreement.

Use the pilot's single `tests/support/makeMe.mjs` entry and profile builder.
Each addition has a real caller and returns canonical facts. Use the type,
schema, or encoder input from the product to type the builder with JSDoc and
`@ts-check`. Defaults express incidental facts. Continue to use existing
harnesses for Git, processes, clocks, and teardown. The
[Git fixture migration](../../seeds/SEED-262-faster-dashboard-test-feedback.md#build-explicit-git-fixtures)
owns repository description and materialization. Reuse it if available at
execution and keep the conversion independent of its delivery.

The launch/session, Intent/CI, and installation/native stories own the remaining
setup in those domains. Mixed journeys keep those facts in their current
roles, and still verify the journey when their published-work setup changes.

## Reuse and decisions

- Build backlog entry facts against
  [`renderEntry`](../../../src/skills/dough-product-backlog/scripts/product-backlog-document.mjs).
  It accepts `identity`, `title`, `href`, and the optional `{ label, target }`
  plan link. The parsed entry's line number and original bytes belong to the
  reader. The CLI's `--link` flag is the adapter for a canonical `href`.
- The [published source](../../../dashboard/src/publishedSource.ts) owns the
  configured repository, ref and backlog path. A resolved revision pins reads
  through the existing [publication fixture](../../../dashboard/tests/publishedFiles.ts).
  The dashboard derives its published view from the returned files.
- Reuse the profile and done record encoders, the preparation and dependency
  commands, and actual Git. Shape any plan or slice setup from the fields the
  [plan reader](../../../src/skills/dough-product-backlog/scripts/product-backlog-plan-reader.mjs)
  and completion reader consume. Keep exact format cases and independent
  expectations in their tests. Establish a shared writer only where valid
  callers need one and the product has no applicable writer.
- Follow [ADR 0002, Direct domain mapping](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
  and [ADR 0008, Durable project state and local operational state](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).
  Repository records own durable work facts and origin owns published
  progress. The [Dashboard North Star](../../../docs/dashboard-ux-ui-north-star.md)
  uses those same sources. Keep test support outside the managed payload
  under [ADR 0004, Client installation and update](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
  and preserve deterministic proof under [ADR 0005, Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md#2-keep-deterministic-checks-in-ci).

## Proof and delivery gates

The slices below own the seed examples. Their named checks anchor the proof.
Before each change, trace all consumers of the fixture, including shared
helpers used by other feature suites and shell/native setup. Include the
checks that reach affected behavior, then run the
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
for altered or removed helpers. Record each disposition with the slice proof.
Keep expectations independent of the builder and compare them to the prior
proof before accepting each conversion. If a native scenario uses changed
arranged facts, list its MakeMe and writer dependencies in that scenario's
[evidence identity](../../../tests/native-family-layers.md). Run the affected
deterministic proof and retain the existing native acceptance boundary.

Local gate: follow the [test automation rules](../../../AGENTS.md#test-automation)
and [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written for every slice and handoff. Run focused shell/Node checks through
`bash scripts/test.sh <paths>` with Bash 5 first on `PATH`, and Playwright
through `npm run test:dashboard -- <spec selection>` after
[native setup](../../../tests/native-setup.md). Run `npm run typecheck:dashboard`
for changed shared JS. At the final combined proof, run `npm test` and
`npm run test:dashboard` because the shared changes reach distributed consumers
across the runners. On fully awake macOS with AC power wrap each full run in
`caffeinate -s -i`. On battery follow the lid-open `caffeinate -i` and log-check
instructions in [Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Hosted CI and publication follow the selected execution mode.

## Execution context

Story Branch Mode on `codex/make-published-work-test-setup-map-directly-to-t`,
with trunk `origin/main`. The established Take published
`7b6947971c8a4a5d994562946fec3b9f61814940` to both refs. The readiness
change records the fulfilled MakeMe dependency and leaves the reviewed goal
and proof scope aligned. Locked checkout setup and dashboard type-check passed.
The Codex coordinator `seed-261-map-published` observes GitHub Actions
`ci.yml` on the story branch through `/tmp/dough-ci-501/watch-EnjBtZ`.

For the final ADR 0010 evaluation, compare the original and converted
published-work cases at their call sites. A worthwhile result makes the
governing facts visible, keeps the existing observations independent, and
removes fixture translations or duplicate constructors. Assess the ongoing
cost of any added writer or builder against those gains.

## Slices

### 1. Backlog operations arrange canonical entries and homes
Type: Behavior
Status: done
Proof: Seed example 2. Run `product-backlog-identity.test.mjs`, `product-backlog-refresh.test.mjs`, `product-backlog-take.test.mjs`, the affected merge and adoption suites, and the scoped shell consumers. Existing assertions show the moved home follows the same identity and the queue/Taken transitions preserve ordering.

Start with valid story-home and backlog facts in
[the backlog fixture](../../../tests/support/product-backlog-fixture.mjs)
and the refresh, identity and merge helpers. On add, refresh, Take or merge,
observe the same membership and stable identity through the real commands.
Keep independently authored expected rows and malformed inputs literal.
Reuse the renderer for arranged rows and keep Git-driven merges in their
harness.

Accepted proof on the macOS execution checkout:

```zsh
export PATH="/opt/homebrew/bin:$PATH"
files=$(rg -l 'from "\./product-backlog-(fixture|refresh-fixture|merge-fixture|adoption-fixture|identity-evidence-fixture|lock-fixture)\.mjs"' tests/support --glob '*.test.mjs' | sort)
OPEN_DOUGH_TEST_OUTCOMES=/tmp/od-seed261-slice1-outcomes.tsv bash scripts/test.sh ${=files} tests/product-backlog-payload-update.sh
npm run typecheck:dashboard
```

All 55 selected jobs passed, along with the type-check. The real refresh
follows moved and reanchored homes, preserves the original identity and list
position, and leaves home bytes intact. Take and merge check ordered membership
against independently authored rows. The installed shell proof checks the
merged rows and Git parents. The consumer trace at
`/tmp/od-seed261-slice1-consumer-trace.md` accounts for imported fixtures and
shell setup. Legacy native merge rows and the native hook sentinel keep their
literal inputs. The native Take fixture goes with the preparation setup in
slice 3 (G1).

The independent refactor moved the existing admission case into its own file
and reused the canonical home fixture. The existing admission and Take
assertions passed under
`PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/support/product-backlog-take.test.mjs tests/support/product-backlog-admit.test.mjs`.
Full runner discovery includes both files.

### 2. Catalog observation reads each pinned project's own work
Type: Behavior
Status: done
Proof: Seed example 1. Run `authenticated-project-observation.spec.ts` and the affected navigation and Intent callers of `catalogProjectRecords.ts`. Verify selection and reload read the expected ref, pin the expected revision, and show that project's Taken and queued cards and purpose.

Replace the local aggregate in
[`catalogProjectRecords.ts`](../../../dashboard/tests/catalogProjectRecords.ts)
with separate published source and revision facts, canonical work entries,
and independent expectations. Carry the Taken correction's identity and home
directly into setup. Serve the encoded files through the existing read
harness.

Accepted proof on the macOS execution checkout:

```zsh
export PATH="/opt/homebrew/bin:$PATH"
dough_slice_specs=( "${(@f)$(< /tmp/od-seed261-slice2-bxlTQT/specs.txt)}" )
[[ ${#dough_slice_specs} -eq 52 ]] && npm run test:dashboard -- "${dough_slice_specs[@]}"
npm run typecheck:dashboard
```

All 103 selected tests passed, along with the type-check. The catalog
observation selects and reloads all four projects through the local
authenticated read path. Its independent expectations check repository, ref,
revision, canonical links, membership, and queued purpose. A comparison
against `8ea16d198` confirmed the four served file sets and transport values
are byte-identical. Navigation and Intent callers passed through the existing
publish harness. The selected specs and consumer dispositions are under
`/tmp/od-seed261-slice2-bxlTQT`. No native scenario uses this fixture.

The refactor consolidated the identical Intent publication composition in
`dashboard/tests/publishIntentProject.ts`. The refactor's 17 affected specs
passed through the shared publisher, with their selection and dispositions
in `/tmp/od-seed261-refactor2-consumer-trace-with-dispositions.md`.
The type-check and whitespace check passed.

The formatting gate exposed missing types on the existing href split and
the backlog writer. The annotations describe their existing behavior.
Dashboard type-check passed after the repair.

### 3. Readiness reads the assessment and the associated plan from published bytes
Type: Behavior
Status: done
Proof: Seed example 2. Run `story-readiness.spec.ts`, `story-readiness-gaps.spec.ts`, `story-readiness-accessible.spec.ts`, queued-plan consumers, and the affected `story-state*.test.mjs` suites. Check published Ready, changed review, plan link, and missing or malformed evidence.

Convert the [readiness fixture](../../../dashboard/tests/storyReadinessFixture.ts),
[`storyReadinessCli.ts`](../../../dashboard/tests/storyReadinessCli.ts)
and matching Node state helpers. Carry canonical entries through the backlog
renderer. Arrange preparation inputs separately, and let the real CLI read
the basis and record the assessment. Preserve the exact `\\u0002` text that
the raw pinned-read case exercises.

Accepted proof on the macOS execution checkout:

```zsh
export PATH="/opt/homebrew/bin:$PATH"
slice_checks=( "${(@f)$(< /tmp/od-seed261-slice3-4yXU9E/all-node-and-shell.txt)}" )
slice_specs=( "${(@f)$(< /tmp/od-seed261-slice3-4yXU9E/all-specs.txt)}" )
[[ ${#slice_checks} -eq 50 && ${#slice_specs} -eq 57 ]] &&
  OPEN_DOUGH_TEST_OUTCOMES=/tmp/od-seed261-slice3-4yXU9E/all-node-outcomes.tsv bash scripts/test.sh "${slice_checks[@]}" &&
  OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/od-seed261-slice3-4yXU9E/dashboard-proof.json npm run test:dashboard -- "${slice_specs[@]}"
npm run typecheck:dashboard && git diff --check
PATH="/opt/homebrew/bin:$PATH" bash /tmp/od-seed261-slice3-4yXU9E/native-take-fixture-proof.bash
```

All 50 Node and shell jobs and 140 Playwright tests passed. Nine readiness
publications retained identical bytes, including the raw plan case. Both
old queued startup writers matched the shared writer's backlog, seed, and
plan bytes. The readiness checks observe pinned reads, plan links, the
existing assessment after a content change, explicit reassessment, and
membership updates. The installed native Take fixture proof observes the
recorder, Taken plan link, preserved preparation, and evidence input hashes.
Paid native tool-call proof stays with the existing scenario. Selection,
results, and consumer dispositions are under
`/tmp/od-seed261-slice3-4yXU9E`.

The independent refactor moved the plan paths and bodies to
`dashboard/tests/storyReadinessPlans.ts` and used MakeMe for the fresh
assessment publication. All nine byte comparisons and six affected
Playwright specs passed again. The type-check and whitespace check passed.
The refactor selection and dispositions are in
`/tmp/od-seed261-refactor3-consumer-trace-with-dispositions.md`.

CI run `42439000527` attempt 1 on `e85d59b0` found a startup fixture
that supplied the old digest fields to the preparation adapter. The
`workspace-publication.test.mjs` case for satisfying every dependency
failed at `publishReadyAssessment` with missing `--expect-document`.
Slice 4's declared writer already held the matching `expectedBasis` repair
and owns its focused proof and publication.

### 4. Dependency eligibility reads the independent supplier agreement
Type: Behavior
Status: done
Proof: Seed example 3. Run `story-dependencies.spec.ts`, `agent-launch-start-dependencies.spec.ts`, `story-dependencies-review-and-eligibility.test.mjs` and affected supplier, start and navigation callers. The blocker clears through verified resolution without renewing the readiness assessment.

Convert the dashboard
[dependency fixture](../../../dashboard/tests/storyDependencyFixture.ts)
and Node/skill dependency helpers. Use the canonical supplier identity and
`href`, condition, and resolution fields. Keep agreement state, consumer
readiness, and malformed evidence independently visible. Let the commands
apply changes and derive start eligibility.

Accepted proof on the macOS execution checkout:

```zsh
export PATH="/opt/homebrew/bin:$PATH"
slice_checks=( "${(@f)$(< /tmp/od-seed261-slice4-4rjCwJ/node-and-shell.txt)}" )
slice_specs=( "${(@f)$(< /tmp/od-seed261-slice4-4rjCwJ/specs.txt)}" )
[[ ${#slice_checks} -eq 30 && ${#slice_specs} -eq 18 ]] &&
  OPEN_DOUGH_TEST_OUTCOMES=/tmp/od-seed261-slice4-4rjCwJ/node-outcomes.tsv bash scripts/test.sh "${slice_checks[@]}" &&
  OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/od-seed261-slice4-4rjCwJ/dashboard-proof.json npm run test:dashboard -- "${slice_specs[@]}"
npm run typecheck:dashboard && git diff --check
node /tmp/od-seed261-slice4-4rjCwJ/compare-agreements.mjs
```

All 30 Node and shell jobs and 42 Playwright tests passed. The real resolver
uses integrated supplier proof, clears the blocker, and preserves the
recorded Ready assessment. The startup job passed the exact case reported
by branch CI after it supplied `expectedBasis`. Four representative agreement
payloads and encoded records matched their prior bytes. The held-facts fixture
uses the canonical dependency fence placement and its observation specs
passed. Selection, results, and dispositions are under
`/tmp/od-seed261-slice4-4rjCwJ`.

The finished CI attempt's inventory named only the startup failure above.
The independent refactor separated startup and admission, eligibility
behavior and module boundaries, and dependency writes and refusals. All
six affected Node jobs passed, including the exact startup regression.
Proof and dispositions are in
`/tmp/od-seed261-refactor4-consumer-trace-with-dispositions.md`.

Branch CI run `42440063442` attempt 1 on `7ecff946` passed the startup
repair. Dashboard shard 12 hit its 276.374-second remaining suite budget
after its type-check used 26 seconds. The report has 20 unfinished case
IDs and zero unexpected cases. The repair moves the once-per-run
type-check to lint and keeps the browser deadline, shard assignments, and
proof collection. A scratch timing refresh increased the failed shard's
estimated normalized load from 714.2 to 779.4 test-seconds, so this repair
keeps the existing allocation.

The updated container contract check rejected the original workflow and
passed with the repair. The focused workflow, native setup, shard selection,
and container checks passed. With `CI=true`, split `12/12`, four workers,
and a 302.374-second remaining deadline, the local run passed all 198 case
IDs across 61 specs in 117.69 seconds. The selection matches the hosted
report, including its 20 unfinished IDs. Exact commands, retained report,
and consumer dispositions are under
`/tmp/od-seed261-ci-42440063442-QohM3B`. Hosted CI still owes the timing proof.
The independent repair refactor found no edits necessary. The lint setup
check is platform-skipped on macOS and remains covered by Linux CI.

### 5. Published assignment tests use the pilot profile facts
Type: Behavior
Status: done
Proof: The owner portion of seed example 4. Run `published-facts-arrival.spec.ts`, the affected roster and attribution specs, `workspace-publication-startup-agent.test.mjs`, and affected profile, preparation, Take and Land tests. The same agents, activities and execution modes are read or credited in the existing cases.

Move remaining valid published profile setup onto `anAgentProfile`, extending
it for cases such as a recorded Story Branch with an existing consumer.
Continue to encode with `renderAgentProfile`. Trace the remaining encoder
callers, including fixtures that write profile directories. Keep deliberate
legacy and invalid fields explicit and retain separate execution authorship
and published assignment facts.

Accepted proof on the macOS execution checkout:

```zsh
export PATH="/opt/homebrew/bin:$PATH"
dough_slice_checks=( "${(@f)$(< /tmp/od-seed261-slice5-eWqOMC/node-and-shell.txt)}" )
dough_slice_specs=( "${(@f)$(< /tmp/od-seed261-slice5-eWqOMC/specs.txt)}" )
OPEN_DOUGH_TEST_JOBS=2 OPEN_DOUGH_TEST_OUTCOMES=/tmp/od-seed261-slice5-eWqOMC/node-outcomes.tsv caffeinate -s -i bash scripts/test.sh "${dough_slice_checks[@]}"
[[ ${#dough_slice_specs} -eq 125 ]] &&
  OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/od-seed261-slice5-eWqOMC/dashboard-proof.json caffeinate -s -i npm run test:dashboard -- "${dough_slice_specs[@]}"
npm run typecheck:dashboard
git diff --check
node --experimental-transform-types /tmp/od-seed261-slice5-eWqOMC/compare-fixtures.mjs /tmp/od-seed261-slice5-eWqOMC/prior "$PWD"
```

All 24 Node jobs and 378 Playwright tests passed. The existing opt-in
Sessions measurement skipped by design, and the regular listing proof
exercises its shared fixture. The earlier Playwright interruption during
CI repair supplies no proof. Ten fixtures retained published paths and
bytes. The startup check observes the assigned agent, story, and remote
branch separately from Git authorship. The dashboard observes owner,
activity, mode, and branch, and distinguishes modified profiles from
profiles removed and re-added. The three G2 assignment fixtures encode
their MakeMe preparation facts through the product writer. Native fixture
inputs are unaffected. Results and consumer dispositions are under
`/tmp/od-seed261-slice5-eWqOMC`.

The independent refactor kept the rotation and identity cases under the
same runner job and shared the profile writer across completion tests.
Nine affected Node jobs passed with the original assertions. Selection and
dispositions are in `/tmp/od-seed261-refactor5-consumer-trace-with-dispositions.md`.

### 6. Published plans retain ordered progress and separate execution completion
Type: Behavior
Status: done
Proof: The progress portion of seed example 4. Run `story-readiness.spec.ts`, `taken-execution-complete.spec.ts`, `plan-execution-complete-detail.spec.ts`, and affected plan-reader, completion and obligations checks. Verify that prospective proof, accepted proof, ordered progress and execution completion still produce their own observations.

Convert valid plan and slice facts in
[`storyReadinessRecords.ts`](../../../dashboard/tests/storyReadinessRecords.ts),
[`branchProgressRecords.ts`](../../../dashboard/tests/branchProgressRecords.ts)
and the plan support fixtures. Keep the raw alternate layouts and gap cases
that exercise the reader's input. Preserve the actual operation when a test
asks it to record proof or complete execution.

Accepted proof on the macOS execution checkout:

```zsh
export PATH="/opt/homebrew/bin:$PATH"
dough_slice6_dir=/tmp/od-seed261-slice6-g9WTCo
checks=( "${(@f)$(< "$dough_slice6_dir/node-and-shell.txt")}" )
specs=( "${(@f)$(< "$dough_slice6_dir/specs.txt")}" )
OPEN_DOUGH_TEST_JOBS=2 OPEN_DOUGH_TEST_OUTCOMES="$dough_slice6_dir/node-outcomes.tsv" \
  caffeinate -s -i bash scripts/test.sh "${checks[@]}"
OPEN_DOUGH_TEST_JOBS=2 OPEN_DOUGH_TEST_OUTCOMES="$dough_slice6_dir/node-rerun-outcomes.tsv" \
  caffeinate -s -i bash scripts/test.sh \
  src/skills/dough-story-refinement/scripts/dough-land-completion.test.mjs \
  tests/git-publication-native-one-shot.sh
OPEN_DOUGH_DASHBOARD_PROOF_RECORD="$dough_slice6_dir/dashboard-proof.json" \
  caffeinate -s -i npm run test:dashboard -- "${specs[@]}"
npm run typecheck:dashboard && git diff --check
node --experimental-transform-types "$dough_slice6_dir/compare-fixtures.mjs" \
  "$dough_slice6_dir/prior" "$PWD"
```

The combined results passed 29 Node and shell jobs after correcting a
duplicate import. All 123 Playwright tests passed. The checks observe
ordered progress and accepted proof apart from the completion record and
its advice gap. Fresh delivery still runs the real status mutation.
Eleven before/after comparisons kept fixture paths and bytes identical,
including the raw plan text and five G3 preparation fixtures. The
credential-free one-shot native check passed and the evidence identity
included the exact writer and MakeMe hashes. The paid host observation
remains separate. Results and dispositions are under
`/tmp/od-seed261-slice6-g9WTCo`.

The independent refactor kept the original completion and stream assertions
in their specs and shared branch publication setup between polling and
streaming. Seven affected Playwright tests, eleven byte comparisons,
dashboard type-check, and the evidence identity check passed on the refactored
candidate. Proof and dispositions are under `/tmp/od-seed261-refactor6`.

### 7. Completing work leaves a durable done record
Type: Behavior
Status: planned
Proof: Seed example 5. Run `product-backlog-complete-done-record.test.mjs`, `product-backlog-git-done-catalog-replay.test.mjs`, `authenticated-read-done-catalog.spec.ts`, the gaps and refusal specs, and affected Recently done consumers. Verify membership removal, persistence, revision-specific catalog reads and attribution.

Convert valid done-record setup using the canonical facts accepted by
[`renderDoneRecord`](../../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs).
Derive catalog entries through the product path where the test needs a
normal catalog. Preserve deliberately absent, stale or unreadable evidence.
Keep real completion, replay, and read operations in the tests.

### 8. Review separates the story's published changes from trunk and local edits
Type: Behavior
Status: planned
Proof: Seed example 6. Run `story-review-trunk-own-changes.spec.ts`, `story-review-trunk-worktree.spec.ts`, `execution-increment-publication-base-identity.test.mjs`, and affected worktree review, admission and reconciliation consumers. Check the selected files, comparison base and exclusion of unrelated trunk commits.

Convert arranged story, branch and publication facts in the
[Trunk Mode review fixture](../../../dashboard/tests/support/storyReviewTrunkMode.ts)
and supporting review and publication cases. Let actual commits and refs
establish provenance and ancestry. Retain the deliberate edits, collisions,
operations and assertions in the scenarios.

### 9. Completed review retains the comparison from accepted publication
Type: Behavior
Status: planned
Proof: The completed-review boundary of seed example 6. Run `story-review-story-branch-landed.spec.ts`, affected backend completed-review and merge cases, and relevant publication-resume and closure checks. Verify that the accepted pair still selects the story's changes after trunk advances or the worktree is retired.

Convert remaining published comparison facts in the completed-story
publication and review fixtures. Keep real integration, pinning, retirement
and receipt proof at their current boundaries. Inspect scoped callers for
remaining suite-only shapes and displaced constructors, and finish the
combined proof. Record before/after examples and findings about readability,
coverage, duplication and maintenance cost under
[ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
Evaluate the conversion on these observations.

## Decisive premises

Observations used the assigned macOS worktree at `86795b327`, Node 24.21.0,
and locked Chromium 153.0.8010.12 on 2026-11-08.

| Premise | Consuming operation and observation | Result |
| --- | --- | --- |
| The canonical entry can carry an anchored plan link and both seed and plan homes | Fed the readiness Taken entry and catalog's queued seed and Taken correction entries to production `renderEntry` and `parseEntryLine` in this worktree, using their actual identities, hrefs and plan link | All three round trips preserved identity, href and plan. The rendered readiness plan target kept `#ordered-slices` |
| Real backlog, preparation, dependency and completion operations supply the facts being preserved | `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh` with the identity, sibling-readiness, dependency-review, plan-completion, profile, complete-done-record and Git done-catalog replay files in `tests/support` | Exit 0 for the selected operations and assertions |
| Refresh, merge, assignment startup and publication expose separate facts through the CLI | Ran the same shell runner with `product-backlog-refresh.test.mjs`, `product-backlog-merge-identity.test.mjs`, `workspace-publication-startup-agent.test.mjs` and `execution-increment-publication-base-identity.test.mjs` | Exit 0 for the selected operations and assertions |
| The existing dashboard journeys reach the observable boundaries | Ran the focused Playwright selection for `authenticated-project-observation`, `story-readiness`, `story-readiness-gaps`, `story-dependencies`, `published-facts-arrival`, `taken-execution-complete`, `authenticated-read-done-catalog`, `story-review-trunk-own-changes` and `story-review-story-branch-landed` using `npm run test:dashboard`, Chromium and the production preview where the spec selects it | 19 passed. Covered pinned source and publication updates, independent readiness and eligibility, execution-complete detail, revision-specific done records, and both review comparisons |
| The shared test-only JS entry is usable in both runners | The pilot owns its cross-entry imports and dashboard type-check. See the [pilot's proof map](../505-share-published-agent-profile-builders/PLAN.md#outside-in-proof) | Waiting on the recorded supplier agreement. No independent entry or probe is needed for this story |

## Plan concerns

Slice-plan refinement was unnecessary. Each conversion owns one observable
boundary and its proof, with no preparatory builder slice. This review found
no remaining slice-specific concern. The shared-entry dependency is recorded
on the story.


## Story obligations

### G1. Native Take uses a valid queued story with preparation
Reported: slice 1 — "The Native Take writer still arranges valid backlog membership together with the preparation it gives the native agent. Its evidence currently has failure-transcript retention only."
Story clause: "Where a native scenario changes its arranged input, update its evidence inputs."
Disposition: proved by slice 3: product-backlog-native-take.sh take_write_evidence_inputs and native-take-fixture-proof.bash verify the input hashes and installed recorder and Take effects
Commitment: P21

### G2. Assignment journeys include preparation facts
Reported: slice 3 — "assignmentCreditRecords.ts, publishedFactsIsolation.ts, and sliceClockRecords.ts still arrange preparation inside published assignment fixtures."
Story clause: "In mixed cases, convert the published facts here and verify the existing journey."
Disposition: proved by slice 5: renderPublishedPreparation in all three fixtures, fixed-clock byte comparison, and the affected assignment, isolation, and slice-clock dashboard specs

### G3. Plan readers include preparation facts
Reported: slice 3 — "branchProgressRecords.ts, intentCiStoryBoard.ts, limitedReadingRecords.ts, reopenedProject.ts, and unchangedRecordsRefresh.ts still arrange preparation inside plan fixtures."
Story clause: "In mixed cases, convert the published facts here and verify the existing journey."
Disposition: proved by slice 6: five plan fixtures use renderPublishedPreparation; the fixture byte comparisons and focused progress, Intent, reopening, and read-limit specs passed

### G4. Done catalog revision reuse includes preparation facts
Reported: slice 3 — "revisionReuseOrigin.ts still arranges preparation within its done catalog and revision reuse setup."
Story clause: "In mixed cases, convert the published facts here and verify the existing journey."
Disposition: receiving slice 7

### G5. Admission and review include preparation facts
Reported: slice 3 — "workspace-publication-admission-fixtures.mjs withFacts still arranges preparation within its admission setup."
Story clause: "In mixed cases, convert the published facts here and verify the existing journey."
Disposition: receiving slice 8

### G6. Dependency setup still supplies a legacy fixture field
Reported: slice 3 — "The Node preparation adapter still accepts link from the mixed dependency and supplier fixtures."
Story clause: "Carry identities and homes explicitly where they drive a case."
Disposition: proved by slice 4: story-state-fixture.mjs recordArgs uses href directly; supplier and dependency command suites passed with canonical homes
