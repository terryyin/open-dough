# Summarize CI proof in Intent

**Identity:** SEED-230#summarize-ci-proof-in-intent

**Source:** [Selected story](../../seeds/SEED-230-summarize-ci-proof-in-intent.md#summarize-ci-proof-in-intent)
**Source review:** [source-review.md](source-review.md)

**Prepared:** 2026-11-04 in `claude/summarize-ci-proof-in-intent` at
baseline `110637df6`.

## Outcome and direction

In Intent's **CI status** tab, a developer sees which configured Intent
entries the shown run proved, with outcome counts and gaps. The tab names that
run's revision, link and attempt. The verdict stays exactly as it is today.
Open Dough's own CI is the pilot, and other projects adopt the result through
one standalone installed recipe. Per-test detail, other CI providers,
location-view proof and comparison with retained Proof are excluded (see the
story).

[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
keeps the dashboard an observer and keeps missing or mismatched evidence
distinct from a negative result.
[ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
and [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
govern the recipe. Under [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md),
the recipe and its collector enter the payload through `install.sh`
`managed_files`, with the payload fixtures kept aligned.

## Existing solution and design

- **Producers.** Do not invent a reporter. For Playwright, set
  `OPEN_DOUGH_DASHBOARD_PROOF_RECORD` in each shard
  ([proof record](../../../dashboard/tests/proof-record.md)). Its
  `tests[].executions[].outcome` (`expected`, `unexpected`, and others) gives
  the counts. For `npm test`, `scripts/test.sh` already records each job's exit
  status in `<output_root>/<index>.status` beside its label. Add an outcomes
  file, `OPEN_DOUGH_TEST_OUTCOMES`, named like `OPEN_DOUGH_TEST_TIMES`, that
  writes one status and check path per line. The counted units are Playwright
  `tests` and `npm test` `checks`. The fragment conversion assigns each check to
  the Intent location whose `path` contains it (`tests` or `src/skills`).
- **Fragment and summary contract.** The shipped collector owns both versioned
  JSON schemas, so the recipe, Open Dough's CI and the dashboard share one
  definition:
  - A fragment records `schemaVersion`, `entry`, `part`, `of`, `attempt`,
    `revision`, `unit`, `passed`, `failed` and `other`.
  - The summary records `schemaVersion`, `repository`, `runId`,
    `runAttempt`, `revision`, and `entries[]`. Each entry has its `path`,
    `unit` and total counts, plus `parts[]` with a status of `present`,
    `missing` or `ambiguous`.
  - Artifact names carry the attempt: one `ci-proof-fragments-<job>-<part>-attempt-<n>`
    per job part, holding that part's fragment for each entry, and
    `ci-proof-summary-attempt-<n>`. Then neither the collector nor the
    dashboard depends on same-name behaviour across reruns, and earlier
    attempts are excluded by name and by the recorded `attempt`.
- **Collector.** Add `src/skills/dough-test-optimization/scripts/ci-proof-summary.mjs`
  (CLI and re-exported API) with its modules `ci-proof-contract.mjs`,
  `ci-proof-fragments.mjs` and `ci-proof-collect.mjs` and their tests, beside the existing
  [Cucumber proof reference](../../../src/skills/dough-test-optimization/references/cucumber-proof.md).
  Its `--expect <entry>=<parts>` arguments are the declaration. Fragments
  present are never treated as the expectation. Open Dough's `ci.yml` runs it
  in a `ci-proof` job with `needs: [test, dashboard]` and
  `if: ${{ !cancelled() }}`. A test keeps the declared part counts equal to the
  `test` and `dashboard` matrix lengths, because tests already read `ci.yml`.
  The collector job is outside the verdict's correctness: its failure is still
  a CI failure, and the producers' failure semantics stay unchanged.
- **Judgment identity.** `ci-github-actions.mjs` `observedRun` already has
  `databaseId`, `attempt` and `headSha`. `baseCiNearest.ts` `ListedRun` drops
  them, so carry `runId` and `runAttempt` on the judged result and on
  `completedAncestor` (for GitHub Actions only).
- **Proof read.** Add a separate authenticated read, `intent=ci-proof`, that
  names the source, run id, attempt and revision. On the server, it lists the
  run's artifacts and selects `ci-proof-summary-attempt-<n>`. It distinguishes
  absent from `expired: true`, downloads `actions/artifacts/<id>/zip`, extracts
  the single JSON entry with `node:zlib` raw inflate, and validates the schema
  and identity. It remembers a valid summary by run and attempt for the process
  lifetime. A `ciAdapter` project is answered "unavailable" without a GitHub
  request. The client starts this read once the judgment names a run. It never
  changes `IntentCiJudgment`'s verdict lines, and **Check again** re-reads both.
- **Docs.** Update [GITHUB-REQUESTS.md](../../../dashboard/GITHUB-REQUESTS.md)
  (one artifact listing plus one download per newly shown run attempt) and
  [dashboard-development-intent.md](../../../docs/dashboard-development-intent.md).

## Decisive premises

| Premise | Consuming operation | Observation (2026-11-04) | Result |
| --- | --- | --- | --- |
| The developer's `gh` can list and download a run's artifacts | Proof read, server | `gh api repos/terryyin/open-dough/actions/runs/41776408979/artifacts?per_page=100`; `gh api repos/terryyin/open-dough/actions/artifacts/13296973250/zip > t.zip; unzip t.zip` | 27 artifacts listed with `workflow_run.id` and `head_sha`, but no attempt field; the zip extracted `test-times.txt` |
| A sharded CI Playwright run yields per-test outcomes | Playwright fragment conversion | `env -u NO_COLOR -u FORCE_COLOR CI=1 OPEN_DOUGH_DASHBOARD_PROOF_RECORD=… OPEN_DOUGH_DASHBOARD_SPLIT=12/12 npm run --silent test:dashboard` | Record with 162 `tests`, outcomes `expected` 147 and `unexpected` 15, plus a `terminal` status |
| `npm test` knows each check's own status | `OPEN_DOUGH_TEST_OUTCOMES` writer | Read `scripts/test.sh` `report_job` (`<index>.status`, `labels[index]`) | Present per job; the writer is new code proved in slice 1 |
| Rerun same-name artifact behaviour | — | Not needed: names carry the attempt | Removed by design |

The 15 unexpected outcomes came at a load of 64.9 on 16 cores. Rerunning those
nine spec files with `--workers=2` at a load of 14.9 passed all 25 tests, and
CI on `a5b0489dd` (main) passed. Execution follows the
[failing and flaky tests policy](../../../AGENTS.md#failing-and-flaky-tests)
as written: a failure that recurs in its own runs is its defect to repair.

## Proof ownership

| Promise (story) | Slice | Proof |
| --- | --- | --- |
| Shards merge without overwrite or double count (example 1) | 1 | Collector `.test.mjs`; the story branch's hosted run uploads a summary whose three entries have every part present |
| Missing, ambiguous and other-attempt parts are gaps (example 2) | 1 | Collector `.test.mjs` |
| Summary published after test failures | 1 | Collector job `if: !cancelled()`; a test asserts the `ci.yml` declaration and matrix lengths |
| Tab shows the run's proof with revision, link and attempt (example 1) | 2 | Dashboard spec with controlled GitHub responses, including an artifact zip |
| Gaps shown, not totalled (example 2) | 2 | Same spec, with a summary with a missing part |
| Running result shows the ancestor run's proof (example 3) | 3 | Dashboard spec |
| Unavailable reasons leave the verdict unchanged (example 4) | 3 | Dashboard spec: none, expired, refused, mismatched, invalid, `ciAdapter` |
| Requests documented and remembered per attempt | 3 | Spec counts artifact calls on a re-shown run; documentation updated |
| Standalone recipe for the agent working in the adopting project | 4 | Behavior review walk-through (AGENTS.md); payload checks after the `managed_files` change |

## Slices

### 1. Open Dough CI publishes one proof summary per run attempt
Type: Behavior
Status: done
Proof: `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-fragments.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-summary.test.mjs tests/support/ci-proof-declaration.test.mjs tests/test-runner-failure-report.sh tests/ci-container.sh tests/ci-lint-setup.sh tests/native-setup.sh src/skills/dough-execute-plan/scripts/ci-workflow-path-policy.test.mjs`; then the story branch's hosted CI run, with its `ci-proof-summary-attempt-1` downloaded through `gh api`, gives `dashboard/tests` 12/12, `tests` 3/3 and `src/skills` 3/3 parts present, with counts equal to the run's.

Behavior: Open Dough's CI runs on a pushed revision. Each test share and
dashboard shard uploads its attempt-named fragments, including after test
failures. The collector then uploads a summary with per-entry totals. Missing,
duplicate and earlier-attempt fragments show as gaps or are excluded.

### 2. The CI status tab shows the shown run's proof
Type: Behavior
Status: planned
Proof: New `intent-ci-proof.spec.ts` using the controlled `gh` of `intentCiStatusPage.ts`. A failed trunk run with a summary shows **Failed** as before, and below it Proof for that revision, run link and attempt: `dashboard/tests` 19 passed and 1 failed tests, and `tests` 5 passed checks. A summary with part 4 of 12 missing shows that gap. A run without a summary says so. The existing `intent-ci-status*.spec.ts` files stay green.

Behavior: A developer opens the CI status tab for a project whose shown run
has a summary for its attempt. They see the verdict immediately. Proof then
lists each entry with counts, the counted unit and any gap.

### 3. Proof follows the shown run and explains each unavailability
Type: Behavior
Status: planned
Proof: The same spec, extended. A running story branch shows its completed ancestor's run proof. Each of an expired, refused, mismatched (another attempt or revision) and invalid summary, and a `ciAdapter` project, shows one reason under Proof while the verdict text is identical to the no-proof case. Showing the tab again for the same run attempt makes no second artifact download. GITHUB-REQUESTS.md and the Intent development doc are updated.

Behavior: In each displayed state, the tab either shows the proof of exactly
the run whose result it shows, or says why it cannot. The verdict never
depends on the proof read.

### 4. Projects can adopt CI proof from the installed recipe
Type: Behavior
Status: planned
Proof: Behavior review (AGENTS.md "Behavior review") walking one adoption: a project with a single-job pytest entry and a 2-shard Playwright entry. The recipe yields fragment steps, an `--expect` declaration, a collector job after failures, retention and `gh` read access. Payload checks pass with the recipe and collector in `managed_files` (focused install/payload tests named by `tests/` that read `managed_files`).

Behavior: An agent working in another project follows the installed
recipe (`dough-test-optimization/references/ci-proof-summary.md`, linked from
that skill's `SKILL.md`) to make its CI publish a summary. Intent then shows it
as in slice 2. The recipe uses only that project's own paths and names.

## Current decisions

- Proof entries are Intent location `path`s. The CI's `--expect` arguments
  declare which ones the CI proves and with how many parts.
- Artifact names carry the run attempt. Earlier attempts are never read or
  counted.
- A check in no declared entry, such as `npm test`'s
  `scripts/check-self-installation.sh`, proves no entry and counts toward
  none (CI run 41805064723 repair).
- Proof is its own read, keyed by the judged run id, attempt and revision.
  It is separate from `intent=ci-status`.
- The collector ships in `dough-test-optimization/scripts/` as four
  `ci-proof-*.mjs` modules (Node built-ins only). The recipe tells the
  adopting project to copy them into its own CI scripts, with steps
  equivalent to Open Dough's two composite actions
  (`.github/actions/ci-proof-fragments`, `.github/actions/ci-proof-summary`),
  so its CI does not depend on an installed skill path. Open Dough's CI runs
  the source copy.
- No file-size exception (Terry, 2026-11-04): `ci.yml` stays under 250 lines
  through those composite actions, YAML anchors for the repeated Node setup,
  and `scripts/setup-lint-tools.sh`; job ids, check names and matrices stay in
  `ci.yml`. The runner settings moved from `tests/README.md` to
  `tests/runner-settings.md`.

## Concern evidence

Slice-plan refinement was not needed: each slice has one outcome and one proof
loop, and the producer and dashboard sides meet at one versioned schema. This
review identified no remaining slice-specific concern. Slice 1's final proof
waits on a hosted CI run of the published story branch, an external wait whose
merge rules the local collector and declaration tests prove first.


## Story obligations

### G1. Hosted CI summary not yet observed
Reported: slice 1 — "The story branch's hosted run must upload ci-proof-summary-attempt-<n> with every declared part present; observed only after push."
Story clause: "It then uploads one versioned, compact summary artifact"
Disposition: proved by slice 1: hosted CI run 41806711276 (90764ef71) artifact ci-proof-summary-attempt-1: schemaVersion 1, repository/runId/runAttempt/revision match; dashboard/tests 12/12 present 1972 passed 0 failed 8 other tests; tests 3/3 present 183 checks; src/skills 3/3 present 290 checks, equal to the discovered checks
