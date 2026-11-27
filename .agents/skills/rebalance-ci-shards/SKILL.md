---
name: rebalance-ci-shards
description: Reports how evenly one CI test group's shards share recent main-run times and proposes one spec-pattern change to .github/workflows/ci.yml for the maintainer to accept or decline. Use when a maintainer asks to rebalance, even out or check the CI shards of e2e, dashboard-backend or distribution-tests. Job counts are handled by the CI job timing report.
---

# Rebalance CI shards

Internal to the Open Dough repository; do not distribute via the installer.

Sharded test groups declare their patterns in `.github/workflows/ci.yml`: the
`distribution-tests` matrix's `tests` patterns, and each sharded browser job's
`specs` input. Shard balance has no automatic owner. Rebalance only when a
maintainer asks, typically because a shard drifts toward its deadline or the
group's job durations spread apart. Drift shows in
`bash scripts/ci-job-times.sh`, in the job durations of recent `main` runs,
or in this skill's report.

A question about how many jobs a group keeps is not a rebalance. Each group
keeps the smallest job count whose slowest job stays inside the deadline in
recent `main` runs; `ci.yml` holds each group's count. Answer from
`bash scripts/ci-job-times.sh`, which reads recent successful `ci.yml` runs on
`main` and gives each group a `could drop one` or `keep` verdict. Remove a job
when the report says `could drop one`; the following `main` runs check it. Add
a job only after a job of that group was ended by the deadline on `main` and
neither moving spec patterns between its shards nor a faster spec restored its
headroom. Verdict time is never a reason: more jobs lengthen the runner wait.
This skill never changes a shard count or deadline.

## Inputs

- The group is one of `distribution-tests`, `e2e` or `dashboard-backend`.
  Ask when the request names none. One invocation covers one group.
- `gh` authenticated for this repository; the script reads recent successful
  `ci.yml` runs on `main` and their times artifacts.
- For `distribution-tests` on macOS, Homebrew bash 5 first on `PATH`: the
  script discovers that suite through `scripts/test-jobs.sh`.

## Run the report

From the repository root:

```sh
node scripts/ci-shard-balance.mjs <group>
```

For `distribution-tests` on macOS:

```sh
PATH=/opt/homebrew/bin:$PATH node scripts/ci-shard-balance.mjs distribution-tests
```

`--runs N` reads N runs instead of the default 5. The script only reads: it
starts no run and leaves no file behind. It exits non-zero saying why when `ci.yml`'s
declaration is refused, `gh` fails, or no recent run still holds the group's
times artifacts; relay that reason and stop.

## Show the result

Show the maintainer, from the script's output:

1. The runs read and each shard's total seconds against the even total, with
   the files no run timed listed apart.
2. The slow files. Each is a candidate for a faster test rather than a move;
   name them as such.
3. The proposal: one unified diff to `ci.yml` and the totals it would give, or
   the statement that the shards are balanced.

When the script says the shards are balanced but one shard still stands out
because its single pattern names one folder (for example
`Distribution/evaluation/**`), say that no allowed single change can lower
it; splitting that folder into narrower patterns is a manual edit the
maintainer may choose.

## Apply only on acceptance

Apply the diff only when the maintainer accepts it, with `git apply` on the
printed diff saved to a temporary file outside the repository, and change
nothing else. A declined proposal leaves `ci.yml` as it is. The script
proposes one change per invocation: a maintainer who wants more applies this
one and invokes the skill again for the next.

After applying, a configuration refuses an overlapping or empty pattern
before any test runs; for a browser group,
`<settings>_SPLIT=i/n npm run <command> -- --list --reporter=list`, with the
job's `settings` and `command` inputs, lists shard i's files locally. The
check of an applied change is the next `main` runs: compare the group's shard
job durations there, or invoke the skill again once those runs hold times
artifacts.

## Example

A maintainer asks to rebalance `e2e`. The report reads five `main` runs, shows
six shard totals against an even 780 with shard 1 at 900, no slow files, and
a diff taking `e2e/configuration/**` out of shard 1 into the last shard's
rest, with the totals it would give. The maintainer accepts; the diff is
applied to `ci.yml`, and the next `main` runs' E2E shard durations are named
as the check.
