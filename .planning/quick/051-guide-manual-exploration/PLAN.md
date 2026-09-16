# Guide a useful manual and exploratory test session

Status: done.

## Execution identity

- Originating checkout: `/Users/terryyin/git/open-dough` on `main` (claim `b118af5`).
- Execution checkout: `/Users/terryyin/git/open-dough/.worktrees/051-guide-manual-exploration` on `quick/051-guide-manual-exploration`.
- Integration target: `main`.
- Replanning: existing planning authority preserved (neither `--replan` nor `--no-replan`).
- Slice budget: none numeric; bound by Behavior/Structure.
- CI observation: Cursor mailbox probe printed `CI_OBSERVER` only; host
  `CI_MONITOR_READY` did not appear. Pushed revisions are **unobserved**. Do not
  claim GitHub Actions coverage. Retry probe in a session where the hook attaches.

## Source and outcome

[SEED-004 Story 20](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#guide-useful-manual-testing),
refined with Terry on 2026-09-16. Deliver concise, budgeted external-observer
exploration across the requested surfaces, efficient temporary preparation,
and action-only reporting. This supports the backlog's lifecycle direction by
making requested story verification useful without introducing another lifecycle.

Execution is authorized via `/dough-execute-plan 51`. Exclude project customization,
permanent runner/setup tooling, automatic repairs, formal UAT machinery, promotion,
release, and installation/adoption. Do not edit installed managed skill copies.

## Context and decisions

- Edit `src/skills/dough-manual-testing/SKILL.md` in place. Baseline at `0efd101`:
  397 words including frontmatter (`wc -w`). Target the same size or shorter;
  permit only a small, behavior-justified increase. Count any mandatory linked
  instructions; moving prose to references does not satisfy concision.
- Use direct actionable instructions and one coherent sequence: establish mission
  and budget, prepare, explore, report. Replace browser recipes, duplicated
  constraints, lint-repair scope, and the old completion marker. Do not compress
  away recovery, isolation, authority, or truthful reporting.
- Existing `.planning/quick/NNN-description/PLAN.md` and planned/done conventions
  apply. Git history allocates through 050 even though spent plans were removed;
  051 was checked vacant before creation. No numeric implementation-slice budget
  or established North Star was found. Do not invent either. A testing session's
  exploration budget is a separate runtime input; resolve it from the request or
  project context, clarifying it if necessary for proportional allocation.
- When execution is authorized, use established execute-plan delivery preparation,
  focused proof, independent post-change refactor, formatting, commit/delivery,
  retrospective, and closure gates. Resolve execution checkout then. No commit,
  runtime test, or delivery is authorized by this planning request.

## Existing solutions and ADR alignment

PFE: the existing manual-testing skill owns opt-in observation and reporting.
Donut's `.agents/skills/manual-testing/SKILL.md` supplies local setup rather than a
second reusable owner. `dough-bug-fixing` owns diagnosis/repair; `dough-execute-plan`
owns execution and proof acceptance; `dough-story-wrap-up` removes spent stories.
Keep those responsibilities intact. Repository searches found no caller of the
manual-testing completion marker outside its source; the skill is not declared
in `install.sh` or the release payload. Change the existing Proposed source, with
no payload or discovery changes and no new supporting framework.

Current Accepted ADRs 0000–0006 agree with the index; 0007 is Proposed. Relevant
constraints (no conflict, exception, or metadata mismatch found):

- [ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md):
  runtime language addresses this project, not a separate client.
- [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
  prefer the least complexity and learn through a real use; do not build adapters
  in anticipation of project differences.
- [ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md):
  source editing does not promote or release the skill.
- [ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  representative behavior review and real scoped use; no routine three-host
  discovery matrix or claim that one host proves all integrations.
- [ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  one concise behavioral source, no platform API tutorial or exported maintainer
  rationale. Review under [AGENTS.md](../../../AGENTS.md).

## Ordered slices

### 1. Plan a bounded observation mission from recoverable expectations

Type: Behavior
Status: done

Behavior: Given an explicit testing scope and available budget, the skill guides
an agent to a proportional coverage plan grounded in current promises, including
Git-recovered stories and relevant non-web surfaces.

Change: Replace web-only discovery/scope and environment assumptions with the
mission, oracle recovery, opt-in boundary, required context, and brief upfront
area/risk/time plan. Resolve later decisions before applying old expectations.
Keep project access details and tools project-owned; name missing prerequisites.

Proof: Representative maintainer walkthrough of a recent-delivery request with a
deleted story, a later expectation change, and a CLI observable. Observe that the
resulting plan cites the right promises, allocates the supplied budget including
preparation/reserve, and does not infer acceptance from implementation. A missing
oracle/budget/environment names the specific unresolved input rather than inventing
it. Record decisive observations in this plan; no new prose-matching tests.

Safe stop: the source supports a grounded mission and plan; preparation and
exploration enhancements remain explicitly planned. Inspect the whole source for
contradictions introduced by this replacement.

Accepted proof:
- Promise: opt-in multi-surface mission; Git-recovered oracles including deleted
  stories; later decisions before older expectations; missing oracle/budget/environment
  named; proportional prep/breadth/depth/reserve plan; completing the plan is not
  acceptance.
- Boundary: `src/skills/dough-manual-testing/SKILL.md` mission and coverage sections.
  Leftover exercise/report text remains slice 3 and is not web-only.
- Command: representative walkthrough of recent CI-feedback deliveries plus
  `wc -w src/skills/dough-manual-testing/SKILL.md` and `git diff --check`.
- Setup: apply the edited skill in the execution checkout; recover promises from
  wrap-up `18a2673` (deleted SEED-013) and current
  `src/skills/dough-execute-plan/references/ci-monitor.md`.
- Observations: supplied 40-minute budget split 8/15/10/7; CLI surface `gh run view`;
  current-host dispatch supersedes the deleted seed’s Codex-first line; missing budget
  and missing notebook-UI oracle stop without invention; 387 words vs 397 baseline;
  whitespace check clean.
- Result: pass. Not rerun after refactor (`none — already clean`).

### 2. Reach an externally usable starting state through temporary preparation

Type: Behavior
Status: done

Behavior: Given costly setup and existing E2E facilities, the skill guides the
agent to a verified starting state without manually replaying all setup or changing
permanent test infrastructure.

Change: Add concise permission to reuse whole/partial journeys or create a temporary
harness/test, including a setup-only feature scenario. Choose the cheapest reliable
route, allow zero setup, verify surviving state/session/services, preserve isolation
and cleanup, reuse compatible states, and remove owned temporary artifacts. Missing
reuse is a potential improvement finding, not authority for permanent changes.

Proof: On one real Donut flow, use the candidate guidance to create and run a
temporary setup-only scenario using existing steps. Observe the prepared state
through the application's external interface and complete one exploratory action
that automated setup did not perform. Record the exact project revision, command,
setup/observation locations, result, and owned cleanup in this plan. Exit 0 or
persistent database rows alone do not prove usable takeover. Read Donut guidance
before mutation; preserve its existing local work and test ownership.

Inspected candidate: `/Users/terryyin/git/doughnut`, notebook creation/readme flow
in `e2e_test/features/notebooks/notebook_creation.feature`. The Given steps supply
an existing user and notebook. `e2e_test/step_definitions/hook.ts` resets before
each scenario, but `scripts/e2e-runner.mjs` owns and shuts down the batch stack.
The existing interactive wrapper is a candidate for retaining the application:
`pnpm cy:open --spec e2e_test/features/notebooks/notebook_creation.feature` (select
the temporary scenario through its UI). Confirm current target/isolation support
before use; isolated targets restrict supported specs. Do not bypass that restriction
or assume the inspected checkout is already an available test environment.

The decisive experiment belongs to this slice, before broad exploration: inspect
the current runner lifetime and supported selection, then verify one supported
preparation route and external observation. Start with one bounded attempt; retry
only for a concrete correctable setup error within temporary preparation authority. If none works without
project customization, retain the precise limitation and leave this proof pending;
do not build an adapter or silently substitute a paper walkthrough. Guidance may
still describe capability-based alternatives without claiming they were validated.

Safe stop: one starting state has been observed and temporary work cleaned up;
no permanent Donut or runner changes. Preserve the observation for reuse in Slice 3.

Accepted proof:
- Promise: cheapest temporary preparation; setup-only scenario using existing
  steps; surviving app/state for external observation; no permanent runner change.
- Boundary: `src/skills/dough-manual-testing/SKILL.md` Prepare section. Slice 3
  exploration/`Good.` reporting and leftover completion marker remain.
- Donut revision: `a4507e530475daded032da9d3528a8dc204b5904` on `main` (local
  ahead of origin by 1; later `ahead 1, behind 2` without our Donut edits).
- Command: `CURSOR_DEV=true SUT_TIMEOUT_MS=360000 nix develop -c pnpm cy:open --spec e2e_test/features/notebooks/notebook_creation.feature`
  (primary unconfigured checkout; spec is on the isolated allowlist; `--spec` is
  wrapper preselect only). Corrected Mountebank absence with existing
  `pnpm exec mb` after `start_mb.sh` skipped 2525.
- Setup: temporary `@focus` scenario `Temporary manual-exploration setup` in
  `e2e_test/features/notebooks/notebook_creation.feature` (Background login +
  `Given I have a notebook "Manual Explore NB"`). Selected through Cypress UI
  (`http://localhost:5173/__/#/specs`). Cypress reporter: 1 passed.
- Observation: external browser `http://localhost:5173/users/identify` then
  `/notebooks` as `old_learner` showed **Manual Explore NB**; opened
  `/notebooks/1` (heading, New note, Readme) — not performed by setup Givens.
- Result: pass for this route. Batch `cy:run` still shuts the stack; takeover
  used interactive lifetime. Cypress AUT iframe after the scenario showed an
  empty catalog while the independent session saw the notebook.
- Cleanup: restored the feature file; stopped owned `cy:open` and leftover SUT
  PGID; extra `mb` stopped. No Donut commit. Story-28 worktree runner left
  untouched. Coordinator confirmed Donut working tree clean of this attempt and
  no listener on `:5173`. Refactor: `none — already clean`.
- Remaining: slice 3 reclaimed weight to 397 words and replaced leftover
  report/marker behavior.

### 3. Explore within the budget and report only actionable outcomes

Type: Behavior
Status: done

Behavior: Given a planned mission and usable starting state, the skill guides
bounded breadth and selective depth and returns only actionable findings/material
uncertainty, or exactly `Good.` for completed coverage without such findings.

Change: Replace scripted browser operations and verbose reporting with deliberate
breadth/depth allocation, attention to surprises, reuse of automated evidence,
and sparse reporting. Preserve expected/actual evidence for discrepancies; distinguish
improvements from broken promises. Blocked or materially incomplete coverage cannot
be reported as good. Do not authorize product repair, permanent test changes, or
root-cause investigation through this skill.

Proof: Apply the completed guidance to a bounded Donut mission using the proven
route from Slice 2; reuse observations where boundary and setup still match.
Observe planned area coverage, a relevant exploratory question, deliberate time
allocation, and the resulting action-only report. Do not manufacture a discrepancy.
Use compact walkthrough counterexamples for an actual-vs-promised mismatch,
ambiguous expectation, material blockage, and an out-of-scope idea; verify that a
completed clean case produces only `Good.`. Also walk zero setup and an already
sufficient automated check to confirm no ceremonial replay is required. Retain
assessment evidence in this plan, separate from the sparse testing report.

Final review: walk invocation/context/outcome under AGENTS.md, including the CLI
mission from Slice 1. Review source descriptions and prose for project perspective,
capability-based operation, preserved boundaries, and coherence. Run
`wc -w src/skills/dough-manual-testing/SKILL.md` against the 397-word baseline and
`git diff --check`; inspect frontmatter and any introduced links. Explain any small
net growth. No new automated semantic assessor, broad installer suite, or per-host
discovery run is justified by this source-only change.

Safe stop: concise guidance and its promised behavior have been assessed. Missing
real-flow proof remains unfinished; no release or all-host validation is implied.

Accepted proof:
- Promise: breadth then selective depth; reuse automated evidence; `Good.` only
  for complete clean coverage; discrepancies with expected/actual; ambiguous
  expectation is unresolved not a fail; out-of-scope is improvement; blocked
  coverage is not `Good.`; no repair/root-cause; 397-word source.
- Boundary: Explore and Report in `src/skills/dough-manual-testing/SKILL.md`.
  Mission/Prepare from slices 1–2 remain.
- Commands: walkthroughs below; `wc -w src/skills/dough-manual-testing/SKILL.md`;
  `git diff --check`.
- Setup: apply finished skill; Donut live app from slice 2 was already cleaned up
  (`a4507e5304`, no `:5173` listener). Independent reporting walkthroughs used;
  no second Cypress session.
- Observations: mismatch → expected/actual discrepancy; ambiguous oracle →
  unresolved expectation; blockage → coverage gap not `Good.`; out-of-scope
  idea → improvement; clean coverage → exactly `Good.`; zero setup; reuse
  `notebook_creation` automation without replaying Givens; CLI mission still
  holds. 397 words; no new links; whitespace clean. AGENTS.md invocation/
  context/outcome review passed. Refactor: `none — already clean`.
- Result: pass for reporting/weight. Bounded live Donut exploration was not
  re-run; slice 2’s external `/notebooks/1` action remains the real-flow
  observation.

## Proof ownership and cumulative assessment

| Promise | Owner and observation |
| --- | --- |
| Opt-in, scoped multi-surface mission; recovered and current oracle; missing inputs | Slice 1 mission walkthrough |
| Upfront areas, proportional budget and reserve | Slice 1 coverage plan |
| Efficient temporary preparation, usable state, cleanup and no permanent changes | Slice 2 real preparation-to-observation journey |
| Breadth/depth balance, time adjustments, compatible state and automated-proof reuse | Slice 3 bounded exploration and walkthroughs |
| Good-only success; actionable discrepancies/improvements/uncertainty; no false pass | Slice 3 report and counterexamples |
| One concise project-facing shared source, no operational recipes or scope creep | Slice 3 final behavior/weight review |

One common model spans the slices: establish the mission, reach its starting state,
then observe and report. Temporary tests are a preparation option, not a parallel
workflow. No preparatory Structure slice or new North Star is needed. Each slice
has one outcome and owns its proof; retain prior evidence without rerunning it
merely to satisfy the next slice.

Remaining concern: none for this plan’s slices. Batch `cy:run` still tears down;
that is recorded Donut lifetime knowledge, not unfinished skill behavior. No
release or all-host validation is implied. CI for this branch is unobserved.

## Learnings

Planning inspection: database reset at scenario start does not establish application
availability after a batch ends. Keep state lifetime and runner lifetime distinct;
this finding narrows the real proof without adding project-specific runtime rules.

Slice 1 walkthrough: recover deleted SEED-013 at `18a2673`, then apply the current
execute-plan host-dispatch contract as the later decision. The seed’s Codex-first
proof line is not the live oracle.

Slice 3: Explore/Report weight came from leftover verbose report and tighter
headings, not from a reference file. Live Donut re-arm was optional once slice 2
had observed takeover; reporting counterexamples do not require a second Cypress
session.

## Slice-plan refinement assessment

Reviewed in place on 2026-09-16 under the requested refinement authority. Three
slices retained; none replaced. Slice 2's concrete integration concern was narrowed
to one supported preparation-to-observation attempt, with a lifetime/selection
check and a clear stop before permanent customization. Splitting inspection into
a separate slice would not deliver an independent behavior or remove the runtime
uncertainty. Slice 3 reuses that proof and owns the full exploration/report outcome.

Slices 1 and 3 have cohesive instruction changes and bounded observable review.
Slice 2 remains contingent on the stated real environment; its uncertainty is
explicit rather than hidden preparation. No scope escalation, numeric sizing
exception, new infrastructure, or story resplit is indicated. All three slices
are executed with accepted proof recorded above.
