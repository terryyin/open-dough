# Deliver registered CI verdicts through the existing observer

## Source

**Identity:** SEED-008#restore-ci-verdict-delivery

[Refined story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#restore-ci-verdict-delivery).
Supporting evidence: [ODF-069](../../../docs/maintainer/finding-names.md#odf-069)
and [ODF-112](../../../docs/maintainer/finding-names.md#odf-112).
The story remains first in the queue; this plan does not interrupt Taken
SEED-037 or authorize execution.

## Goal and scope

An already attached observer discovers the selected workflow's run for a
registered revision, delivers its failure to that revision's owning coordinator,
and subsequently records and delivers its repair's success through the existing
host interaction. Missing observation becomes an explicit coverage gap.
Delivery remains asynchronous, at the next supported coordinator interaction.

Correct the demonstrated selection/setup boundary, using the existing observer.
Exclude initial Claude attachment, publication replay, automatic reruns,
dashboards, new adapters, observer redesign and per-slice CI waits. Do not
claim the historical incident resolved merely because a controlled case passes.

## Evidence and current decisions

Surveyed at `89564f4e7bda87f765a2f5aa93386f3bb4994656`, 2026-09-25:

- Doughnut's `ci.yml` declares `name: donut CI`. The existing GitHub acquisition
  requests `--workflow ci.yml`, then `matchingCiRuns` applies an independent
  display-name filter defaulting to `CI`. A matching filename alone therefore
  does not establish observation under current defaults.
- Retained plan 029 mailbox `/tmp/dough-ci-501/watch-7llTFe` records four
  registered revisions as undiscovered, a discovery-delay event, then
  `CI_MONITOR_UNAVAILABLE` after `gh run list` could not connect to GitHub.
  Its request identifies `nerds-odd-e/doughnut` and
  `story/remove-raw-file-storage`; it does not retain the workflow-name env.
  These facts support investigation, not a confirmed historical root cause.
- A controlled acquisition probe returned no `donut CI` runs under defaults;
  the same display-name predicate accepted one with the explicit override.
  The minimal reproducible selection comparison below uses modeled run data,
  not a historical replay or a native host pass. Run from repository root:

```sh
for name in CI 'donut CI'; do
  DOUGH_CI_WORKFLOW_NAME="$name" node --input-type=module <<'JS'
import { matchingCiRuns } from './src/skills/dough-execute-plan/scripts/ci-runs.mjs';
const branch = 'story/remove-raw-file-storage';
const rows = [{headBranch: branch, headSha: 'registered-revision',
  workflowName: 'donut CI', event: 'push'}];
console.log(process.env.DOUGH_CI_WORKFLOW_NAME,
  matchingCiRuns(rows, {branch, sha: 'registered-revision'}).length);
JS
done
```

Critical postcondition: the same selected run changes from rejected to accepted
solely with the display-name setting. Baseline result: `CI 0`, `donut CI 1`.
Do not weaken repository, branch, revision, event or workflow identity checks to
make this comparison pass.

**Existing solutions (PFE).** Extend `ci-runs.mjs` selection/acquisition and, as
needed, the existing runtime setup guidance. Both ordinary acquisition and
`discoverApplicabilityCandidateRuns` consume workflow selection; keep one rule.
Reuse `watch-ci-execution.mjs`, `ci-mailbox-revision-coverage.mjs` and
`ci-host-hook.mjs` for observation, coverage and owner delivery. Existing
`ci-client-configuration.test.mjs` protects custom workflow configuration;
`ci-revision-coverage-late-github-failure.test.mjs` already drives acquisition
through the mailbox worker to the owner hook. No second observer, selection
registry or host abstraction is warranted.

**Architecture.** Follow [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
for a cohesive integrated correction, [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
for shared deterministic proof versus host-specific evidence, and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
for runtime-facing guidance. Preserve [North Star](../../NORTH-STAR.md)
separation of publication, checkout refresh and exact-revision CI coverage.
No new architecture decision is proposed.

## Slice 1 — Deliver the selected workflow's failure and repair verdicts

**Type:** Behavior
**Status:** planned

**Outcome:** A non-default workflow display name cannot silently defeat an
otherwise supported observation setup. Registered failure and repair verdicts
reach their owner, and observation loss remains explicit.

**Work:**

1. Reproduce selection loss through the actual acquisition entry point with
   controlled GitHub responses representing the reported workflow and branch.
   Inspect available configuration evidence and the taught setup. Distinguish
   missing/incorrect setup from a supported configuration that silently loses
   runs. If the explicit supported setup suffices, correct setup/validation
   rather than replace observation machinery. Preserve the historical caveat.
2. Make the smallest coherent correction at that demonstrated boundary. A
   selected workflow must have one consistent identity across normal and
   applicability acquisition; preserve meaningful explicit overrides. Reject
   inconsistent setup usefully if it cannot be observed. Do not special-case
   Doughnut, broaden listing limits speculatively, or accept unrelated workflows.
3. Extend the existing late-GitHub-failure journey: attach before polling,
   register revision A, discover its failed run, deliver it to its owner, then
   register repair B and observe/deliver its success. Keep A's failure evidence.
   Include another owner and an unrelated revision so misrouting cannot pass.
   Use acquisition results, not prewritten terminal mailbox events. Fixtures
   must honor the requested workflow, not depend on impossible `gh` responses.
4. Exercise the unavailable-acquisition path with existing coverage tests;
   retain previously observed evidence and explicitly mark unproved revisions.
   Update runtime setup guidance only where the corrected selection contract
   changes what the executing agent must supply or verify.
5. Refactor affected selection concepts before final checks, following the
   project's execution/refactoring gates. Record what mechanism was corrected
   and what historical uncertainty remains in linked findings at wrap-up;
   record implementation and first containing release only when known.

**Outside-in proof owned by this slice:**

| Promise or constraint | Observable proof |
| --- | --- |
| Selected workflow failure reaches owner | Extend `ci-revision-coverage-late-github-failure.test.mjs`: non-default name travels through acquisition, watcher, coverage and hook; assert exact SHA, run and owner |
| Repair succeeds without erasing prior failure | Same journey, revision B success in coverage and existing host delivery; A remains failed |
| Coverage loss stays honest | `watch-ci-execution-coverage.test.mjs`: discovery errors emit unavailable once; prior evidence retained; unproved revision never passes |
| Selection and isolation remain valid | `ci-client-configuration.test.mjs` plus journey assertions: explicit workflow configuration, wrong workflow/branch/revision and foreign owner cannot satisfy coverage |
| Applicability uses the same selection | Reuse/extend `ci-revision-coverage-not-required.test.mjs` and `ci-revision-coverage-ignored-only-failure.test.mjs` where the selection change touches their acquisition |
| Runtime guidance remains executable | Walk one non-default-name setup using the revised instructions; no hard-coded maintainer/project assumptions |

Focused regression command (repository root):

```sh
node --test src/skills/dough-execute-plan/scripts/ci-client-configuration.test.mjs src/skills/dough-execute-plan/scripts/ci-revision-coverage-late-github-failure.test.mjs src/skills/dough-execute-plan/scripts/watch-ci-execution-coverage.test.mjs src/skills/dough-execute-plan/scripts/ci-revision-coverage-not-required.test.mjs src/skills/dough-execute-plan/scripts/ci-revision-coverage-ignored-only-failure.test.mjs
```

The selection logic is shared across Codex, Cursor and Claude Code. Reuse
existing host delivery checks for unchanged adapters; deterministic hook proof
is not a fresh native-host acceptance claim. If the correction changes a host
adapter, expand proof for that adapter before declaring the slice done. No new
all-host native acceptance campaign belongs to this selection correction.
Apply required repository checks under the execution workflow after edits;
this planning baseline is not proof of the future correction.

**Size and stopping point:** One correction and one integrated verdict journey.
No numeric slice target or hard limit is supplied; do not invent a timing rule.
A separate diagnosis-only or host-proof slice would split the same proof loop.
No Structure slice is justified. Stop with the selected workflow observed and
failure, repair and gap evidence mapped above. If diagnosis instead requires an
independent registration, attachment or delivery redesign, preserve the
reproduction and refine scope before that implementation; do not accumulate
fallbacks in this slice.

## Learnings and preparation review

- Planning baseline: custom-workflow and late-failure journey tests passed
  (2 tests); coverage-loss/isolation suite passed (8 tests). No product edits
  were made to obtain these results.
- Original execution environment remains unavailable. This limits attribution,
  not the reproducibility of the current selection/setup mismatch.
- Construction review found no remaining slice-boundary or proof-ownership
  concern within this bounded correction; no additional split or plan rewrite
  is warranted. Preparation readiness is recorded in the story state.
