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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer can run Open Dough's end-to-end workflows with
`npm run test:e2e` and identify their purpose and observed results in Intent
and CI. These tests exercise complete product workflows across the components
involved, including released Open Dough skills in installed projects. The
dashboard is a common starting point. A future service can join the same test
group when it participates in a product workflow, including a workflow that
starts elsewhere.

#### Test purpose and grouping

| Entry | What belongs there |
| --- | --- |
| **E2E Test** | Representative product workflows from a supported entry point through the participating components to an observable outcome. An installed story start can begin in the dashboard, run the installed skill's command, and publish a claim to the project's Git origin. |
| **Dashboard Frontend Test** | Focused dashboard UI tests for presentation, interaction, and recovery using controlled backend answers. |
| **Dashboard Backend Test** | Focused dashboard server tests for behavior, variants, and failures at HTTP, WebSocket, file, command, or in-process boundaries. |

The [current suite](../../dashboard/tests/README.md#three-roots-integrated-journeys-frontend-only-and-boundary-tests)
runs `dashboard/tests`, `dashboard/frontend-tests`, and `dashboard/backend-tests`
together through `npm run test:dashboard`. Retire that command and the umbrella
dashboard test grouping. `npm run test:e2e` starts a dedicated runner for the
product journeys. Run dashboard frontend and backend tests outside that runner
locally and in CI. Give the E2E runner its own setup, worker, and shard settings
so maintainers can optimize it independently of both dashboard groups. Common
fixtures and proof utilities can be reused. Give both dashboard groups
documented ways to run independently and keep all three groups covered in CI.
Use **E2E Test** wherever the product-wide entry is presented by name. Decide
source paths and command names for the focused groups during refinement.

Review the current inventory against these purposes and account for every
maintained spec and the behavior it proves. Keep detailed variants in the
focused group that owns the behavior. Record which integrations each
representative journey exercises and which external boundaries it simulates.
The existing [installed-start fixtures](../../dashboard/tests/fixture-origins.md)
also install skills from the working tree. Establish during refinement which
journeys use a tagged release and which use working-tree skills, and retain
explicit proof of the released-skill workflow under the
[release contract](../../docs/adrs/0003-tagged-release-versioning-accepted.md).

#### Proof, CI observation, and documentation

- Capture the current test inventory, CI shard membership, and proof entries
  before the migration. Check that the new commands select the intended
  groups, then execute representative cases. Carry forward behavior coverage
  and review changes to discovery, setup, sharding, and timing inputs against
  that baseline. Verify that changing E2E worker or shard settings leaves
  dashboard test selection and execution settings intact. A test listing
  proves selection only.
- Update the [CI workflow](../../.github/workflows/ci.yml), shard allocation,
  and [proof publication](../../dashboard/tests/proof-record.md) together. In
  hosted CI on the migrated revision, verify that all three groups run and
  that counts, outcomes, and durations reach the correct entries and files in
  the published summary at the supported granularity. Verify that the frontend
  proof artifact still reports its own group's files. Check that missing or
  incomplete evidence is still distinguishable from a pass or a reported zero.
- Update [Intent locations](../open-dough.json) and the affected proof and CI
  observation readers. Verify navigation and attribution in Project Intent,
  test Purpose and Proof, and story CI comparison and history. If an entry
  path changes, establish how retained observations and links resolve across
  the migration, and how incomparable scopes are shown. Check consumers that
  identify the suite by command, path, job, artifact, or proof key.
- Update the maintained references that developers and agents use, including
  the [repository test guide](../../tests/README.md),
  [dashboard commands](../../dashboard/COMMANDS.md),
  [test placement and journey guidance](../../dashboard/tests/README.md),
  [local test resources](../../tests/local-test-resources.md),
  [CI sharding](../../dashboard/tests/shards.md), and
  [CI status and proof guidance](../../docs/dashboard-development-intent-ci-status.md).
  Explain each group's purpose, placement and invocation, how to run all
  checks for delivery, and how to read their proof. Update live story and plan
  references where they would otherwise point at a retired command or entry.
- Apply the project's
  [failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests)
  throughout the migration.

#### Examples to refine

1. `npm run test:e2e` selects an installed story-start journey. The developer
   starts from the dashboard and observes the resulting claim at the Git
   origin. The proof identifies the skill input and attributes the result to
   **E2E Test**.
2. A developer runs a dashboard layout or recovery case with controlled
   answers and a dashboard server contract case through the focused groups.
   CI reports those cases under their respective frontend and backend entries.
3. A developer reviews a story with evidence spanning the migration. The
   proof opens the right source and reports comparable counts and timings
   where the evidence supports them. Changed scope or missing observations
   appear explicitly.
