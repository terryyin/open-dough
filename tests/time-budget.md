# Time budget

The suite's time budget lives in `tests/time-budget`: a per-job ceiling
(`per-job-seconds`) and a total ceiling over one run's jobs
(`total-job-seconds`), set from CI's `test-times-<i>` at the recorded list's
runner speed with headroom. The ceilings are in that unit, so only after a CI
run (`CI=true`) of the whole suite or a split share does the runner compare
that run's job times divided by the share's runner factor with them
(`scripts/test-budget.sh`); elsewhere it prints no budget report and the exit
status comes only from the checks. The factor is the median, over jobs
recorded in `tests/longest-first` with a measurable recorded time (at least
2 s), of observed/recorded seconds; without a measurable recorded job it is 1
and the breach line says it was unavailable. Within budget it prints nothing.
A breach fails the run and prints, after any failure reports, one line per job
over the per-job ceiling and one for a total over the total ceiling:

```text
OVER BUDGET: tests/install.sh took 78.4s observed (factor 1.2, 65.3s at recorded speed); the per-job ceiling is <per-job-seconds>s (tests/time-budget).
OVER BUDGET: all jobs took 720.0 job-seconds observed (factor 1.2, 600.0 at recorded speed); the total ceiling is <total-job-seconds> (tests/time-budget).
```

Fix the slow job rather than the number: raising a ceiling is an explicit,
reviewed edit of `tests/time-budget`. `tests/test-runner-budget.sh` proves
the budget with a substitute directory.

A slice that adds test time reads its baseline from recent trunk CI with
`bash scripts/ci-test-times.sh [job…]`, and its plan names that command rather
than a copied CI number. Over the last 10 successful `ci.yml` runs on `main`
whose `test-times-<i>` are still retained, it prints, for each job (only the
named ones, when given) and each share total, the lowest–highest seconds at
recorded speed (each run's times divided by that share's runner factor), the
factor range that share saw, the ceiling, headroom (ceiling − highest),
spread (highest − lowest), and a verdict that judges those recorded-speed
values:

- `wide` (headroom at least the spread): push without local timing; the
  pushed revision's CI job settles the budget.
- `thin`: run one paired A/B comparison of each changed job, before and after
  the change, under the current load rather than waiting for an idle machine,
  and apply its ratio to the recent highest at recorded speed the line names
  (66.7 s at a ratio of 1.11 projects 74.0 s). A projection at or over the
  ceiling splits the job in the same slice. A thin share total projects its
  recent highest at recorded speed plus each changed job's increase: the
  ratio minus 1, times that job's recent highest at recorded speed. When the
  change adds, removes or renames a test file, run the allocation preview,
  `node scripts/test-shares.mjs preview --split-count 3`
  ([test-shares.md](test-shares.md)): it prints each share's predicted
  job-seconds and headroom to the total ceiling from recorded CI seconds
  (the same unit as the ceiling and this report), and names the unrecorded
  jobs the deal assumes at the median.

A job with no recent timing, or `No recent trunk timings were found` with its
reason, leaves the budget to CI. Either way the pushed revision's CI result is
the verdict. `tests/ci-test-times.sh` proves the report with a `gh` stand-in.
