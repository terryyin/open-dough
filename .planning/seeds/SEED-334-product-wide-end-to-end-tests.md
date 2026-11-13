---
id: SEED-334
status: active
planted: 2026-11-13
trigger_when: selected from the product backlog
scope: story
---

# SEED-334 — Product-wide end-to-end tests

<a id="run-and-observe-product-wide-end-to-end-tests"></a>

### Run and observe product-wide end-to-end tests

**Identity:** SEED-334#run-and-observe-product-wide-end-to-end-tests
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/608-product-wide-end-to-end-tests/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c4f0eb48d831101d43b5955bf5812b2b91bbb0760718da0710f41e85a693023b","plan":"1f8658854dce2895b9c9c256249d78c275b2710650d8e3a8259b832b9ff07538"}}
```

#### Goal

A developer can run representative Open Dough product workflows with
`npm run test:e2e` and understand their purpose and observed results in Intent
and CI. A workflow crosses its participating components to an observable
product outcome, including released Open Dough commands in an installed project.
The dashboard is a common entry point; the group is product-wide and can also
hold a workflow beginning elsewhere when that workflow exists.

#### Scope

**Required behavior**

| Entry name | Sources and command | Responsibility |
| --- | --- | --- |
| **E2E Test** | `e2e/`; `npm run test:e2e` | Representative product workflows from a supported entry point through the participating components to an observable outcome. |
| **Dashboard Frontend Test** | `dashboard/frontend-tests/`; `npm run test:dashboard:frontend` | Focused presentation, interaction, and recovery with controlled backend answers. |
| **Dashboard Backend Test** | `dashboard/backend-tests/`; `npm run test:dashboard:backend` | Focused server behavior, variants, failures, and test-runtime contracts at their stable public boundaries. |

1. Replace `test:dashboard` and its umbrella grouping with independent runners
   for these three groups, locally and in CI. E2E setup, workers, shards,
   duration inputs, output and proof ownership can change independently of the
   focused groups. Reuse suitable fixtures and proof mechanisms. Preserve the
   existing isolation, cleanup, failure diagnostics and local full-suite
   resource admission across linked worktrees.
2. Review the inventory by the behavior each case proves. Keep representative
   integrations in E2E; move detailed UI, server and harness checks to their
   focused owner. Account for every maintained spec, case and test-registering
   helper, naming its destination and surviving proof. Splitting or replacing
   redundant cases must retain their behavior and meaningful integration proof.
3. Keep working-tree skill journeys for feedback on current changes. Add one
   representative dashboard preparation-start journey using a real installation
   from an explicitly pinned published numeric release tag. Observe the
   published assignment at the project's Git origin and identify the tag,
   resolved revision and installed version with the proof. Never substitute
   working-tree bytes when the tagged source is unavailable.
4. Identify each representative journey's real integrations and simulated
   external boundaries. Deterministic native-host protocol and GitHub stand-ins
   remain valid for these workflows; they do not become native skill-use
   acceptance. Existing native acceptance responsibilities remain with
   [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md).
5. Capture discovery, CI shard membership and published proof inputs before
   migration. Verify each new command's selection and execute the migrated
   cases. Preserve behavior coverage and check setup, sharding and timing
   changes against that baseline; listing alone proves selection.
6. Publish each group's counts, outcomes, durations and file attribution from
   its own CI runner. Update producer jobs, shard counts, proof fragments and
   summary expectations together. Keep the frontend proof artifact specific to
   frontend files. Missing reports or parts remain distinguishable from passes
   and reported zeros. Verify a hosted run on the migrated revision.
7. Update Intent locations and affected readers so Project Intent, Purpose,
   Proof, story CI comparison and history identify the correct group and source.
   Use **E2E Test** as the display name wherever that entry is named; retain its
   path as source identity and useful navigation context. Registering helpers
   must remain discoverable when their locations own case proof.
8. Preserve historical observations at their recorded paths and revisions.
   `e2e` is a new scope identity; old `dashboard/tests` evidence is not relabeled
   as E2E. Read historical source/settings where supported, compare matching
   scopes, and show absent or changed scopes explicitly without a fabricated
   numeric timing comparison or dead link.
9. Update developer and agent guidance and live story/plan references to the
   three commands, placement rules, delivery checks and proof interpretation.
   Cover [repository tests](../../tests/README.md),
   [dashboard commands](../../dashboard/COMMANDS.md),
   [test placement](../../dashboard/tests/README.md),
   [local resources](../../tests/local-test-resources.md),
   [sharding](../../dashboard/tests/shards.md), and
   [CI status/proof](../../docs/dashboard-development-intent-ci-status.md).

**Deferred promises**

This increment adds no future service or new non-dashboard workflow, does not
optimize suite speed, and does not add native agent acceptance. No new release
is needed to test an already published tag. Naturally supported entry points
remain usable; these delivery limits are not rejection rules.

**Required restrictions**

Tagged proof must fail clearly when its pinned release cannot be obtained or
verified: [ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md)
requires immutable tagged content without branch fallback. Evidence must retain
unknown/missing/changed scope distinctions under
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
Apply the project's [failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests)
throughout the migration, including failures attributed to the prior layout.

#### Key examples

1. An isolated project has Open Dough installed from published tag `v0.3.97`
   (resolved revision and installed version recorded) → the developer runs the
   E2E command and starts story preparation from the dashboard → the installed
   preparation command publishes the assignment to the project's bare origin;
   the case proof belongs to **E2E Test** and names its substituted boundaries.
2. A frontend recovery/layout case uses controlled answers, and a server
   refusal case uses its public boundary → the developer runs their focused
   commands → each runs and reports in its own group. Changing E2E workers or
   shard allocation changes neither focused runner's selection nor settings.
3. A spec registers cases through another source module → it moves to its
   owning group → both selection/timing ownership and declared case-file proof
   follow the correct sources, with Purpose and Proof opening those sources.
4. A hosted run completes all producer matrices → CI publishes the summary →
   all three entries receive their actual cases, outcomes and durations, and
   the frontend artifact names frontend files. A deliberately missing producer
   report yields incomplete evidence; an actual empty share yields reported
   zero rather than a missing report.
5. A story comparison spans old `dashboard/tests` and new `e2e` evidence → the
   developer opens comparison/history and a historical source → old evidence
   stays readable at its revision, the distinct scopes are explicit, and only
   supported scope/unit matches receive numeric comparisons. The unchanged
   focused entry identities retain their supported comparisons.

#### Architecture

Runner ownership follows proof purpose, not the dashboard's component boundary.
Keep one case/proof model and reuse duration dealing, strict reporting, fixture
lifecycle and CI collection instead of introducing a runner framework for
hypothetical services. Shared dashboard fixtures can stay with their current
owner when they serve several runners; modules that register cases belong to
those cases' group. Each runner owns its setup invocation and teardown.

Keep literal entry paths as proof identity and configured labels as display
names. Preserve the existing generic comparison and history rules; a renamed,
narrower group is not the old scope. This follows
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and the [North Star's observation boundary](../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation).
[ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md) and
[ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md)
govern the real complete tagged installation. ADR 0005 keeps its deterministic
command proof separate from native acceptance. No Accepted ADR conflict or
exception is required.

#### Refinement evidence and alternatives

At `66375ceaaa2e08dbc7ce3ec90bce207abaece4e0` on 2026-11-13, discovery found
1,015 selected specs (598 integrated, 27 frontend, 390 backend). The native
runner's JSON listing declared 2,717 cases (1,319 integrated-source, 55 frontend,
1,343 backend), with 17 registering helper sources beyond spec filenames.
`proofRecord.ts` attributes proof to declared case locations; `specTimes.ts`
attributes shard timing to the importing spec. The inventory must preserve both.
The existing integrated root includes reporter, teardown and presentation-only
checks, so a blanket rename does not establish the intended E2E purpose.

Compared directions against independent operation and trustworthy proof:

- Relabel the existing suite and add a filtered command: simplest, but retains
  coupled setup/sharding and the umbrella inventory; insufficient for the goal.
- Separate the three purpose-owned runners and reuse current mechanisms:
  selected; establishes independent operation with the smallest new machinery.
- Introduce a generic multi-service runner registry: unnecessary for today's
  workflows and adds ownership/configuration without current value.

Borrowed mechanism: a shipping manifest maps each outgoing item to a receiving
owner and reconciles quantities. Here the items are specs, registering sources
and promised behaviors; destinations are the three proof groups. This makes
loss and double assignment visible. Its limit is semantic: matching totals
cannot establish surviving behavior or real integration, so execution remains
required.

The full preparation refusal/restart/retry journey now passes with both ordinary
working-tree skills and the complete published `v0.3.97` installation. The test
waits for the selected story's own results; all publication, restart, retry,
observer/reload and durable-state assertions remain. Its default case budget is
still 30 seconds. Cold shared inputs have a separate bounded worker-preparation
budget after an observed cold setup outlasted its inherited 30-second slot.
The plan retains the diagnosis, full-scenario commands and accepted evidence;
the earlier start-only pass did not clear those failures. Existing focused CI
action/history/comparison checks passed for independent parts, missing reports,
file attribution and changed-scope gaps; migrated hosted proof remains execution
acceptance work.
