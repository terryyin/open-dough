# Read distinct attempts, an adapter's selection, and waits a mean hides

**Identity:** SEED-284#read-distinct-attempts-and-hidden-waits

**Source:** [Correction story](../../seeds/SEED-284-optimize-tests-from-ci-proof.md#read-distinct-attempts-and-hidden-waits)

**Source review:** [Source-only commitments](source-review.md)

## Source and provenance

Retrospective correction of SEED-284#optimize-tests-from-ci-proof (plan 552, recoverable at `9f5036d43:.planning/slice-plans/552-optimize-tests-from-ci-proof/PLAN.md`).
Reviewed published revisions: `766593b4f` (Take), `2acd43bfb`, `304598724`,
`15495daa5`, `6ce0c2445`, `86c7b98dd`, `625936070`, `d5cd5ccf4` and
`f184ecd2b`; the trunk merges `9d6695e0c`, `8e7381516` and `afbdd494c` hold
only that execution's conflict resolutions. The guidance under correction
came from slice 4 (`6ce0c2445`) and slice 7 part A (`d5cd5ccf4`). The original
story promises: before experimenting, state the smallest saving worth keeping
from the scope's evidence; name the attempt's selection; examine individually
material files and group small costs by shared cause, so a cost no single file
shows can still lead. The Pygardon pilot (plan 552 Learnings "Slice 7 pilot")
reported the gaps below.

## Current findings at `f184ecd2b`

1. **Earlier revisions can read the same attempt.**
   `references/evidence-and-leads.md` "State the saving worth keeping"
   suggests "the same unchanged files in the reader's tables at one or two
   earlier revisions" for the measure's variation. The reader
   (`scripts/ci-proof-attempts.mjs` `chosenAttempt`) reads the newest
   successful attempt at the revision, else at its nearest ancestor. In a
   project whose CI skips many commits, such as Pygardon's path-excluded
   planning commits, several earlier revisions resolve to one attempt, so
   the "variation" compares an attempt with itself and reads as none. Open
   Dough's slice 4 walk did not show this, because nearly every Open Dough
   commit has its own attempt.
2. **The adapter selection remedy names no route.** For a CI adapter the
   table's Selection line says "read it from the CI configuration behind this
   project's ciAdapter" (`scripts/ci-proof-project.mjs` `selectionOf`), and
   the Selection bullet of "Read the retained CI proof" says to read it from
   "the CI configuration that line names". An adapter names no configuration
   file. The pilot found Pygardon's selection at
   `scripts/check-prepared-checkout.sh:224` only by searching.
3. **A per-case mean can hide one case's fixed wait.** The pilot's top lead,
   `tests/data_source/test_jobs_live_commands_sharadar.py`, reads 60.5 s over
   2 cases, mean 30.24 s. Locally one case took 61.45 s, held by a retry-sleep
   double's 60 s hang bound, and the other 0.14 s. "Rank removable causes"
   says a test whose time is the behavior it proves removes little, and gives
   no caution that a mean averages uneven cases, so a reader can judge such a
   file's time inherent without reading its cases.

## Preserved promises and constraints

- The reader's attempt choice, table format, gaps and exit codes stay
  unchanged; this correction changes guidance only.
- Discovery stays unadmitted and runs no fresh profiling run. Timing
  unmodified tests of a chosen lead stays permitted discovery.
- The saving worth keeping still comes from the developer's target or the
  evidence; the agent still asks no percentage, batch size or mode.
- One home per rule ([ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)):
  these rules belong in `evidence-and-leads.md`; `SKILL.md` keeps linking it.
  Write for the executing project; name no Pygardon or Open Dough path.
- Edit `src/skills/` only; installed copies change only from a released
  payload ([ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)).
  No release in this correction.

## Outside-in proof ownership

| Correction promise | Owner | Observable proof |
| --- | --- | --- |
| The variation behind the saving worth keeping comes from tables naming different attempts | 1 | Behavior review in Learnings: following the new text in Pygardon reaches two distinct attempts, as premise 1's commands did. |
| A CI adapter's selection is traced from the Source line's adapter command to the CI job's test command | 1 | Behavior review: the new text leads from `node scripts/pygardon-ci-adapter.mjs` to the command and markers Pygardon's CI job runs, without a repository-wide search. |
| A lead's per-case mean is not taken as each case's cost before its cases are read | 1 | Behavior review: walking the reader's Pygardon table at an attempt before `a2936bdee` with the new text reaches the 60 s hang bound as a removable wait before judging the file inherent. |
| Links and payload declarations still hold | 1 | `bash scripts/test.sh` over `payload-declaration-links`, `execution-increment-delivery` and `ci-github-acquisition`; links in the changed reference resolve. |

## Slices

### 1. Correct the evidence-reading guidance

Type: Behavior
Status: done
Proof: ownership rows 1–4; the AGENTS.md behavior review recorded in
Learnings, read-only in a Pygardon checkout (no edits, no profiling run).

Behavior: an agent following `evidence-and-leads.md` in a project with an
adapter and skipped commits →

- under "State the saving worth keeping", it reads comparison tables at the
  revision before the previous table's attempt (`--revision <attempt
  revision>~1`), checks that the Attempt lines differ, and counts tables
  naming one attempt as one observation;
- under "Read the retained CI proof", for a CI adapter it follows the adapter
  command named on the Source line to the CI job it reports and names that
  job's test command, filters and splits as the selection, else states the
  gap;
- under "Rank removable causes", it treats a lead's mean per case as an
  average: before judging a lead's time inherent, it reads its tests for
  fixed waits, timeouts and sleeps, or times its cases unmodified, which is
  discovery, not profiling.

## Proof and delivery gates

Follow the [AGENTS.md behavior review](../../../AGENTS.md#behavior-review) and
[runtime audience](../../../AGENTS.md#runtime-audience). Run the named Node
tests through `bash scripts/test.sh`. No dashboard or full suite run: the
change is guidance text that no Playwright test reads. The reader runs in the
Pygardon review only read its CI; they edit nothing there.

Local gate: start fully awake; on AC guard long runs with `caffeinate -s -i`;
on battery use `caffeinate -i` with the lid open and read the sleep log
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)).
Carry the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written into every delegation and repair handoff; attribution is no
exemption. Post-change refactoring and execution's normal delivery and CI
gates apply.

## Decisive premises

Observed on 2026-11-09 by the retrospective, read-only, with this branch's
`src/skills/dough-test-optimization/scripts/ci-proof-leads.mjs` at
`f184ecd2b`, run in Pygardon's `.worktrees/optimize-tests-from-ci-proof`
(`node <reader> --revision <rev> --scope tests`).

| Premise / consuming operation | Literal observation and result | Remainder |
| --- | --- | --- |
| Earlier revisions can resolve to one attempt (finding 1) | `--revision 4acc889b3` read attemptId `54fbc3bc…` at `4acc889b3`, 2,039.3 s. `4acc889b3~1` and `4acc889b3~3` both read attemptId `74a7dd32…` at `e430447dc` (2,017.8 s over 6,412 results). `e430447dc~1` read a distinct attemptId `11a26379…` at `faa998608` (3,290.3 s over the same 6,412). | None; slice 1's review repeats it with the new text. |
| The adapter selection remedy names no route (finding 2) | Every table above: `Source the CI adapter (node scripts/pygardon-ci-adapter.mjs)` and `Selection … remedy: read it from the CI configuration behind this project's ciAdapter`. | Slice 1's review confirms the route the new text gives. |
| A mean hides one case's wait (finding 3) | The same tables rank `tests/data_source/test_jobs_live_commands_sharadar.py` first at 60.4–60.5 s, 2 results, mean 30.22–30.24 s. Pygardon `SEED-20261090` (at `f93672986^`) records 61.45 s and 0.14 s locally for its two cases and the 60 s hang bound; fixed in `a2936bdee`. | None. |

## Execution resume context

- Established Story Branch start: workspace `/Users/terryyin/git/open-dough/.worktrees/read-distinct-attempts-an-adapter-s-selection-an`, branch `codex/read-distinct-attempts-an-adapter-s-selection-an`; authorized remote `origin`, trunk `main`; owned existing worktree, default integration checkout `/Users/terryyin/git/open-dough`.
- Publisher `dashboard-territory.local-open-dough`, agent/coordinator `ruuf-chan`; starting revision `f73ae69b60375c090319709fc77db6647168f114`; published claim/candidate `929c0d028c9fd2bfe47c9021cecebaf98c2fbf45`. Claim CI is unobserved.
- Exact checkout setup: `npm ci` succeeded against the current lockfile; `npm run --silent lint -- --staged` succeeded. Check-only `.githooks/pre-commit` checks staged lint and typechecks only staged scripts. Selective formatter: `npm run format`. No generation trigger for this reference-only change.
- Source: GitHub Actions `ci.yml` (push-triggered on this branch); live selector diagnostic held by GitHub rate limit, resumes `2026-11-09T16:14:04.605Z`. No API retry before that directed time.
- Observer: repository `terryyin/open-dough`, target `codex/read-distinct-attempts-an-adapter-s-selection-an`, coordinator `ruuf-chan`, directory `/tmp/dough-ci-501/watch-FiBFRP`, PID `97263`, stream session `99356`, yielded cell `g452:10`; runtime is this checkout’s `.agents/skills/dough-execute-plan`. Live identity confirmed.
- Replanning: existing planned authority retained; no numeric slice budget supplied, use one coherent bounded guidance slice. No fresh profiling or heavy local suite; AC power, use `caffeinate -s -i` for named focused checks.

## Current decisions

- One correction for findings 1–3, guidance only. Changing the reader to
  choose an earlier attempt itself, or to name an adapter's selection, is not
  needed for these findings and is not planned.
- Pilot gaps owned elsewhere stay out: admission's second workspace and the
  `**Goal:**` label (Pygardon DD-406, DD-407), quick-work completion steps,
  host backgrounding against completion bounds, the subagent CI bridge,
  refactor cost for tiny changes (ODF-141) and Intent Coverage for
  optimization stories.

## Learnings

### Slice 1 accepted proof

- Product edit: only `src/skills/dough-test-optimization/references/evidence-and-leads.md`; its Selection, saving threshold and removable-cost rules now cover the three correction promises. Reader implementation, formats, installed copies, Intent and release metadata are unchanged. Existing `SKILL.md` links and discovery-only admission boundary remain compatible. No new rule home or runtime vocabulary.
- Read-only behavior review in `/Users/terryyin/git/pygardon` (the original pilot workspace has retired): run this workspace's absolute `src/skills/dough-test-optimization/scripts/ci-proof-leads.mjs --revision <rev> --scope tests` with `node`. Requested `4acc889b3` selected attempt `54fbc3bc-1f3f-4586-8936-30c72be29824` at `4acc889b3`, sum 2,039.3 s. Requested `4acc889b3~1` selected `74a7dd32-427e-4071-854f-59a1b51794f8` at `e430447dc`, 2,017.8 s. Following the new rule, `e430447dc~1` selected `11a26379-64c7-421b-b0ef-1aa699bd1469` at `faa998608`, 3,290.3 s. The last two cover 6,412 results. All three commands exited 0, without profiling or project edits. Distinct Attempt lines establish distinct observations.
- At Pygardon `4acc889b3`, the Source command `node scripts/pygardon-ci-adapter.mjs` leads through `pygardon-ci-attempt-evidence.mjs` and `pygardon-ci-timing-report.mjs` to job `prepared-checkout`, whose recipe `scripts/check-prepared-checkout.sh:224` runs `pytest -p scripts.ci_crash_evidence --color=no --no-header -q -o console_output_style=classic -o junit_family=xunit1 --junitxml=.pytest_cache/ci-proof-junit.xml -n auto --dist loadfile --max-worker-restart=0 -m "not slow and not host_docker"`. `pyproject.toml` supplies `testpaths = ["tests"]`. This directed trace names command, markers, workers and file distribution without searching the whole repository.
- The same table's `tests/data_source/test_jobs_live_commands_sharadar.py` lead is 60.5 s over two cases, mean 30.24 s. Reading historical test source reaches `HeldRetrySleep` in `tests/jobs_live_sharadar_support.py:83`: `asyncio.to_thread(self.release.wait, HANG_TIMEOUT_SECONDS)`. `tests/hang_detection.py:17` defines 60.0 s. Historical seed `f93672986^:.planning/seeds/SEED-20261090-faster-held-sharadar-command-proof.md` records 61.45 s and 0.14 s. The coordinator inspected the recipe and wait source. The review exposes a removable wait before judging time inherent, with no fresh timing.
- Focused automated proof: `env PATH=/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin caffeinate -s -i bash scripts/test.sh tests/payload-declaration-links.sh src/skills/dough-execute-plan/scripts/execution-increment-delivery.test.mjs src/skills/dough-execute-plan/scripts/ci-github-acquisition.test.mjs` exited 0. The initial launch selected Bash 3.2 and stopped before tests; explicit Homebrew PATH supplies required Bash 5. This is a runner prerequisite correction, not a waived failure. `git diff --check` passed.
- Inspected observations: payload-declaration-links resolves each declared Markdown dependency against `install.sh`; execution-increment-delivery's route assertions preserve the common publication owner; ci-github-acquisition's instrumented provider fixture asserts admitted request routes and directed rate-limit suspension. These checks protect the existing supporting contracts, while the behavioral walk above owns the changed guidance's behavior. No prose-matching tests added.
- Consumer trace: installed `consumer-trace.mjs` against base `929c0d028c9fd2bfe47c9021cecebaf98c2fbf45`, then narrowed `--changed` to the owned reference; supplied terms `test-selection command` and `mean per case`. Inspected `install.sh` (links tested), `SKILL.md` (baseline/removable-cause entry and discovery), `candidate-record.md` (accepted-cost and bounded output anchors). Reader selection producers and reader tests are unchanged outputs consumed by this guidance; payload-update tests' path/install contract is unchanged. Complete trace/dispositions retained at `/tmp/seed284-guidance-consumer-trace.md`. No affected unproved consumer.
- Refactor return `/root/refactor_review`: none — already clean, no edits; `## REFACTOR COMPLETE` received. All accepted boundaries/consumer dispositions unchanged; no test rerun needed.
- Source-review comparison: all original triggers and qualifications map to the observed locations in `source-review.md`; preservation/exclusion commitments are supported by the bounded product diff. No gap or disputed source narrowing was found.


## Preparation review

Refinement was not needed: one slice owns one reference's three bounded
rules, each with its own review walk. This review identified no remaining
slice-specific concern.
