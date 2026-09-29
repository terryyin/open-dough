# Judge a change against the CI time budget from CI's own timings

## Source and authority

- **Identity:** SEED-055#ci-time-budget-from-ci-timings
- **Source:** [story](../../seeds/SEED-055-trustworthy-project-proof.md#ci-time-budget-from-ci-timings),
  refined with Terry on 2026-09-29 against
  [DD-158](../../../ProjectFindings.md#local-time-budget-measurement-under-load-second-priority)
  as plans 135 and 139 committed it.
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication.

## Outcome and boundaries

The agent planning or executing a slice bound by `tests/time-budget` reads each
job's recent trunk CI range, headroom, and whether local measuring is needed
from one read-only command. Wide headroom pushes and lets CI settle the budget;
thin headroom gets one paired local ratio applied to the recent highest value,
so a thin margin shows before the push.

Key examples (from the story):

1. Wide: `tests/git-publication-native.sh` at 40.0–51.4 s against 71 s. The
   headroom of 19.6 s is at least the spread of 11.4 s, so the verdict is to
   push without local timing.
2. Thin: the job at 48.5–61.2 s. The headroom of 9.8 s is below the spread of
   12.7 s, so the verdict is to measure. A paired ratio of 1.11 projects
   67.9 s before the push.
3. Share total: share 1 totals of 295–387 job-seconds against 470 are reported
   and judged by the same rule.
4. No readable runs: the command says so and why. The slice pushes and CI
   settles the budget.

Constraint (story): a local comparison is paired A/B under the current load,
never waiting for an idle machine; the command runs no paid native host.
Excluded (story): automated local timing or a per-slice timing gate; changing
or recalibrating either ceiling; history beyond CI's seven-day artifact
retention; dashboards or trend views.

## Current decisions

- **Recent means the last 10 successful `ci.yml` runs on `main`** whose
  `test-times-*` artifacts can still be downloaded. The report states how many
  runs it used and their date span. Successful runs are the accepted trunk
  states that later changes are measured against. There is no option for
  the run count until a use needs one.
- **The command gives the verdict, the agent does not derive it.** A
  deterministic rule belongs in the script, not in prose
  (`prefer scripts for mechanical steps`). Per job and per share total:
  headroom = ceiling − recent highest, spread = highest − lowest. The verdict
  is `wide` when headroom ≥ spread, otherwise `thin`, and the thin line names
  the recent highest value to project from.
- **One reader of the budget file.** `scripts/test-budget.sh` is today the only
  parser of `per-job-seconds`/`total-job-seconds`, with the strict refusal of
  a malformed file. The new command reads the ceilings through that same
  reader (slice 1), not through a second grammar.
- **Substitute budget like the runner's.** The command reads
  `${OPEN_DOUGH_TEST_DIR:-tests}/time-budget`, the runner's existing
  convention for a substitute checks directory, so its test supplies a budget
  without touching `tests/`.
- **Scope of output.** Named jobs restrict the job lines to those jobs. With
  no names, every job appears, highest recent value first. Share totals always
  appear. A named job with no recent timing (for example a job the slice is
  creating) is reported as such, and its first CI run settles it.
- **Thin share totals project from the changed jobs.** A thin share total
  projects as its recent highest plus each changed job's increase: the paired
  ratio minus one, times that job's recent highest. This uses only the
  changed jobs' paired runs, not a whole-share local run. By today's data
  share 1 is thin (headroom 82.6 against a spread of 88.4), so a slice that
  adds test time there measures its changed jobs.
- **CI stays the verdict.** The pushed revision's split job still fails on a
  breach; nothing here changes `scripts/test.sh` gating or either ceiling.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| Recent successful trunk runs are listable by one query | `gh run list --workflow ci.yml --branch main --status success --limit 3 --json databaseId,headSha,createdAt` (2026-09-29) | Returned 3 runs with ids, SHAs, and times |
| A run's times download as `test-times-<i>/test-times.txt` of `<seconds>\t<job>` lines | `gh run download <id> -D <dir> -p 'test-times-*'` for 8 runs (36545307185…36556722361) | Each gave `test-times-1/` and `test-times-2/` holding `test-times.txt`, longest first |
| A run without artifacts fails the download distinctly | `gh run download 34074640737 -p 'test-times-*'` (run of 2026-09-07, past retention) | Exit 1, `no valid artifacts found to download` |
| Retention is seven days | `.github/workflows/ci.yml` `retention-days: 7` on `test-times-${{ matrix.share }}` | Confirmed |
| The key-example numbers are current | The 8 runs above: `git-publication-native.sh` 40.0–51.4 s; share 1 totals 295.4–387.4, share 2 270.0–357.5 | Wide for the job; thin for share 1 |
| `scripts/test-budget.sh` is the budget file's only parser | `grep -rn 'test-budget.sh\|time-budget'` over the repository excluding planning records | Called only by `scripts/test.sh` line 216; exercised by `tests/test-runner-budget.sh` and `tests/test-runner-selection.sh` (substitute budgets) |
| New `tests/*.sh` checks run without wiring | `tests/README.md` lines 3–10 and 100–110: the runner discovers shell checks | Confirmed |
| Shell checks verify with modern Bash on this machine | `/opt/homebrew/bin/bash` present; system Bash is 3.2 | Run local proof with `PATH=/opt/homebrew/bin:$PATH` |

## Proof ownership

| Promise | Slice | Proof |
| --- | --- | --- |
| Budget breaches and refusals unchanged after sharing the reader | 1 | `tests/test-runner-budget.sh`, `tests/test-runner-selection.sh` |
| Per-job range, headroom, and wide/thin verdict (examples 1, 2) | 2 | `tests/ci-test-times.sh` with a `gh` stand-in |
| Share totals by the same rule (example 3) | 2 | `tests/ci-test-times.sh` |
| Named jobs, and a named job with no recent timing | 2 | `tests/ci-test-times.sh` |
| No readable runs, and a failing `gh`, are reported with the reason (example 4) | 2 | `tests/ci-test-times.sh` |
| Runs without artifacts are skipped, and the report counts runs used | 2 | `tests/ci-test-times.sh` |
| The command reads real trunk CI | 2 | One read-only run of the command against GitHub, output recorded in this plan |
| Guidance: plans name the command, not a copied number; rule and CI verdict | 2 | `tests/time-budget.md` (linked from `tests/README.md`) and the `tests/time-budget` header, reviewed against examples 1–4 |

## Ordered slices

### 1. One reader of the time-budget file

Type: Structure
Status: done
Proof: `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/test-runner-budget.sh tests/test-runner-selection.sh`
and `npm run lint` pass.

Internal change: move the parsing and strict refusal of `per-job-seconds` and
`total-job-seconds` out of `scripts/test-budget.sh` into one sourced reader.
`scripts/test-budget.sh` then uses the reader, with the same messages and exit
statuses. External behavior is unchanged: the runner's breach report, silence
within budget, and refusal of a malformed budget. Enables slice 2's command to
read the ceilings without a second grammar.

Accepted proof: the reader is `scripts/time-budget.bash`
(`read_time_budget <file>` sets `per_job_seconds` and `total_job_seconds`, or
prints the existing FAIL line and returns 1; it never exits). Both focused
checks and `npm run lint` passed; `tests/test-runner-budget.sh` observes the
breach report (runner and direct), silence within budget, and no local judging.
No test asserts the malformed-budget refusal; it was observed by hand (missing
total and non-numeric value print the FAIL line and exit 1; a last line
without a newline is read). Slice 2's test asserts that refusal through the
new command, which shares the reader. The refactor pass made no changes.

### 2. Report recent trunk CI timings against the budget

Type: Behavior
Status: done
Proof: `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/ci-test-times.sh tests/test-runner-budget.sh`
and `npm run lint` pass. One read-only run of the command against GitHub on
current trunk, with its output recorded under Accepted proof.

Behavior: trunk has successful CI runs whose `test-times-*` artifacts are
readable → an agent runs the command (under `scripts/`, optionally naming
jobs) → it prints:

- the number of runs used and their date span;
- for each job, the recent lowest–highest seconds, the per-job ceiling,
  headroom, spread, and `wide` or `thin`, with a thin line naming the value to
  project from;
- the same for each share total against the total ceiling.

It exits 0. With no readable runs, or when `gh` fails, it prints that no
recent trunk timings were found and why (for example `gh`'s own message), and
exits non-zero. Runs without artifacts are skipped and not counted.

`tests/ci-test-times.sh` puts a `gh` stand-in first on `PATH` that serves
fixture runs, including one without artifacts, and a substitute
`OPEN_DOUGH_TEST_DIR` budget. It checks example 1's wide job, example 2's
thin job, a share total, a named-job filter, a named job with no timing, the
empty case, a failing `gh`, and a malformed budget refused with the shared
reader's FAIL line.

Guidance in the same change:

- `tests/README.md`'s budget section names the command and the rule. A plan
  names the command rather than a copied CI number. Wide headroom pushes and
  lets CI settle it. Thin headroom takes one paired A/B comparison of the
  changed jobs under current load, applies the ratio to the recent highest
  value, and splits in the same slice when the projection reaches the
  ceiling. A thin share total adds the changed jobs' projected increases.
  The pushed revision's CI result remains the verdict.
- The `tests/time-budget` header points to the command in one line.

Accepted proof: the command is `bash scripts/ci-test-times.sh [job…]`. Both
focused checks and `npm run lint` passed. `tests/ci-test-times.sh` compares
exact reports: `all` (examples 1 and 2, headroom equal to spread is `wide`,
share totals, highest first, header counting 3 runs with artifact-less run 102
skipped), the exact `gh run list` query, `named` (filter and a job with no
timing), `none`, `empty`, and `gh-fails` (exit 1 with the reason), and
`malformed` (the shared reader's FAIL line). The real read-only run on
2026-09-29 against trunk used 10 runs (09:01–13:22 UTC) and exited 0:
`tests/git-publication-native.sh` 38.8–51.4 s, headroom 19.6, spread 12.6,
`wide`; share 1 265.7–387.4 and share 2 239.0–357.5 job-seconds, both `thin`
(project from 387.4 and 357.5). Every job was `wide`. The refactor pass moved the
budget section and this guidance out of `tests/README.md` (over its 250-line
limit) into `tests/time-budget.md`, linked from the README's runner section,
and dropped the unused `headSha` field from the `gh` query.

## Considered and excluded

- A `--runs` option or configurable window: no current use; the report states
  its window.
- Local timing automation, or a runner mode that projects CI time: that
  repeats the practice DD-158 found costly.
- Reusing the delivery CI observer (`src/skills/dough-execute-plan/scripts/`):
  it watches one revision's CI result for delivery and is installed guidance
  for other projects. This command is this repository's own tooling over
  timing artifacts. No existing script reads `test-times-*`.
- Recalibrating `tests/time-budget` from the new report: excluded by the story.
