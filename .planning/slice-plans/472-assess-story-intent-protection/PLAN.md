# Review how well a story's intent is protected

**Identity:** SEED-192#assess-story-intent-protection
**Source:** [selected story](../../seeds/SEED-192-review-product-intent.md#assess-story-intent-protection)

**Prepared:** 2026-11-05. Planning only, in the story's established workspace
`claude/review-how-well-a-story-s-intent-is-protected`.

## Goal and boundaries

Terry receives an explainable, per-promise assessment of how well story 5,
SEED-192#review-story-intent-impact, protected its intent at its completion
revision `7c71049b`. He follows each verdict to its sources, decides retain,
clarify, or strengthen for each finding that still holds on trunk, and judges
whether the method is worth keeping. The story section holds the case, the
known review basis, the keep criterion, and the key examples. This plan does
not repeat them.

- **Included:** a blind assessment, one fresh local run of story 5's specs at
  `7c71049b`, at least two break checks, the comparison with the
  retrospective, a recheck of each live finding on trunk, Terry's evaluation,
  follow-ups queued from his decisions, and the method's learning in the
  memorandum.
- **Excluded:** product code, test, or project-rule changes; a reusable skill,
  retrospective extension, or dashboard action; a second case; numeric scores;
  paid native-host runs.

**Failure policy:** this project's
[failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests) policy
applies as written. A story-5 spec that fails or flakes at `7c71049b` is an
observation the assessment reports as *unknown*, since it describes the
historical revision under review. It is not a defect in current trunk to
repair under this story, and it is not a reason to rerun until green.

**Local gate:**

- This story changes no product code or tests. The checks it runs are the
  story-5 specs at `7c71049b` in a scratch detached worktree, through the
  dashboard runner (`npx playwright test --config
  dashboard/playwright.config.ts <specs> --reporter=list`, with `NO_COLOR`,
  `FORCE_COLOR` and `GIT_ALTERNATE_OBJECT_DIRECTORIES` unset). Trunk rechecks
  in slice 2 run named specs the same way in this workspace.
- Before landing, `npm run lint` covers the plan, seed, and memorandum edits.
  No full suite is needed: no shared code path changes. The runs here are
  short and focused, so the
  [machine sleep](../../../tests/local-test-resources.md#machine-sleep-on-macos)
  guard is needed only if a run goes past a few minutes. Then run it under
  `caffeinate -s -i` on AC power.
- Slice 1 creates the scratch worktree (`git worktree add --detach
  <job tmp>/case-7c71049b 7c71049b`, then `setup-native.mjs npm` and
  `browser`). Remove it (`git worktree remove`) once slice 2's evidence is
  recorded. It is never committed. Preparation removed its own copy.

## Direction and PFE

- **Existing tools:** Git history recovers story 5's section and plan 441 at
  `7c71049b`, and the dashboard runner runs its specs there. Intent's story
  lens and Review changes show its changed tests. The execution retrospective
  is the ordinary review this case is compared against. No new tooling.
- **Borrowed mechanism:** a break check is mutation testing kept to one fault
  per checked verdict. It shows that a named test is sensitive to that break
  of the promise. It does not show how clearly the test expresses the
  promise, which stays a reasoned judgment.
- **Result homes:** the assessment and comparison live beside this plan as
  `assessment.md`. Wrap-up removes them as spent planning records, and Git
  keeps them. Lasting method learning goes to
  [the memorandum](../../../docs/product-intent-review-memorandum.md).
  Decisions go to the backlog as queued stories or corrections. No new record
  type ([ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)).
- No Accepted ADR is contradicted. ADR 0010 makes the review's own cost part
  of the judgment, so slice 3 records elapsed and reading time.

## Decisive premises

| Premise | Consuming operation | Observation (form, profile, time) | Result | Remainder |
| --- | --- | --- | --- | --- |
| Story 5's intent is recoverable at the case revision | Slice 1 | `git show 7c71049b:.planning/slice-plans/441-review-story-intent-impact/PLAN.md` and the seed at `7c71049b` (section `#review-story-intent-impact`), read 2026-11-05 | Both present. `7c71049b` is an ancestor of trunk | none |
| Story 5's specs run locally at `7c71049b` | Slice 1 execution evidence | Scratch detached worktree at `7c71049b` in the job's tmp dir, 2026-11-05: `setup-native.mjs npm` and `browser`, then the dashboard runner (list reporter, env unset as above) on `intent-story-changes{,-gaps,-moves,-only}.spec.ts`, `intent-story-completed.spec.ts`, `story-card-selection.spec.ts`, `story-review-tree.spec.ts` | 11 passed in 52.3 s | Slice 1 reruns them for its own record. Other story-5 specs it finds are run then |
| A scratch fault at `7c71049b` makes a story-5 spec fail (break-check route) | Slice 1 break checks | Same worktree: `overlayFilesByPath` in `dashboard/src/intentStoryOverlay.ts` changed to map `files.slice(0, 0)`, then the runner on `intent-story-changes.spec.ts`; reverted afterwards | Failed at `intent-story-changes.spec.ts:133`: `toHaveText("Modified dashboard/tests/a.spec.ts")`, element not found. Passes without the fault | A fault must compile: the build rejects unreachable code. An empty-array `&&` fault was a no-op, because `[]` is truthy |
| No committed proof record exists at `7c71049b` | Slice 1 evidence choice | `git show 7c71049b:dashboard/tests/proof/latest.json` | Absent. The record first appears in `2d272e1bb` | none; the fresh run is the evidence |

## Outside-in proof

- **Examples 1–5 (verdicts, run, break checks):** `assessment.md` gives one
  verdict per story-5 promise and restriction, with citations. It records the
  run's command and per-test results, and each break check's fault, command,
  and failing assertion. The slice 2 reviewer opens a sample of citations and
  confirms that each cited line says what the verdict claims.
- **Examples 1, 2, 6 (recall and live findings):** `assessment.md`'s
  comparison table maps each retrospective finding to recovered or missed, and
  each new finding to its trunk recheck (the named spec or source on trunk).
- **Examples 6, 7 (decision and rejection):** Terry's recorded decisions and
  rejected-claim count in `assessment.md`, plus queued backlog entries, or the
  declined reasons, for strengthen and clarify decisions.
- **Lasting learning:** the memorandum section added in slice 4.

## Slices

### 1. Blind assessment of story 5 at its completion revision
Type: Behavior
Status: planned
Proof: `assessment.md` holds verdicts with citations, the fresh run record,
and at least two break checks, and none of it was written from post-`7c71049b`
records.

**Behavior:** story 5's section and plan 441 at `7c71049b`, plus that
checkout's tests and source → a fresh assessor, given only those inputs,
assesses every promise and restriction → `assessment.md` gives each one a
verdict (*protected*, *partially protected*, *not protected*, *unknown*), with
cited story text, test and support lines, run evidence, and a clarity note.
Each *protected* verdict is break-checked or labelled reasoned-only.

**How:** delegate to a fresh subagent. The executing agent has read this plan
and the story section, which name the retrospective's findings, so it is not
blind and must not write the verdicts. The brief names the detached worktree
at `7c71049b` and the two intent paths. It forbids reading later history
(`--all`, other refs, `origin/*`) or anything under the current workspace,
and states this story's verdict vocabulary, run, and break-check rules. It
passes on the failure policy above by link. The subagent records the time it
starts and ends. Blindness cannot be enforced, only instructed. Record that
limit in `assessment.md`.

### 2. Comparison with the review basis and trunk recheck
Type: Behavior
Status: planned
Proof: the comparison table in `assessment.md`. Each live finding cites the
trunk source or spec run that shows it still holds.

**Behavior:** slice 1's verdicts, the retrospective findings in plan 448 (at
`168c04473^`), and current trunk → the executing agent compares them → each
retrospective finding is marked recovered or missed. Each new gap is rechecked
on trunk and marked live or already resolved, with its evidence. A sample of
at least five citations is opened and checked, and any that does not support
its verdict is listed as unsupported.

### 3. Terry's evaluation and follow-ups
Type: Behavior
Status: planned
Proof: Terry's per-finding decisions, his rejected-claim count, and his
reading time recorded in `assessment.md`, and each strengthen or clarify
decision queued as a story or correction, or declined with a reason.

**Behavior:** the assessment and comparison → Terry reads them (published as
a private Artifact page for reading, at the executor's discretion) and gives
his judgment → his decisions are recorded, and follow-ups are queued through
[dough-product-backlog](../../../.claude/skills/dough-product-backlog/SKILL.md)
in suitable seeds.

**Human checkpoint:** execution stops here for Terry's evaluation and waits.
It submits the handoff through the dashboard reporting command as
`--outcome unfinished` with the exact question. It neither substitutes its own
judgment nor asks again until he answers.

### 4. Method learning in the memorandum
Type: Behavior
Status: planned
Proof: the memorandum's evaluation section names the case, its recall,
useful new verdicts, unsupported claims, cost, Terry's keep, fold, or reject
judgment, and the limits (one case, instructed blindness, break checks show
sensitivity, not clarity).

**Behavior:** Terry's judgment → the memorandum records what the first
protection case taught → a later story deciding on automation or a
retrospective extension reads it there, after this plan is removed.

## Current decisions

- Story Branch Mode; no trunk step.
- The case, its revision, and its review basis are fixed by the story
  section. Changing them is a scope change for Terry.
- Verdicts come from a fresh subagent, never from the agent that knows the
  known answer.
- Break checks run only in a scratch detached worktree at `7c71049b` and
  are reverted. Trunk rechecks read source or run existing specs without
  edits.

## Concern evidence

- Slice-plan refinement was not needed. Each slice owns one observable result:
  the blind verdicts, the comparison, Terry's decisions, and the lasting
  learning. Slice 3's human checkpoint is the story's own evaluation, not a
  premise.
- No remaining slice-specific concern was identified.
