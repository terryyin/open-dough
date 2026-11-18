# Diagnosis: distribution-tests-2of3-deadline

Round 1 (clock diagnosis `distribution-tests-2of3-deadline`).

## Failure signature

- Run 44214090643 attempt 1, SHA 6c7b0461f, job "Distribution Tests (2/3)"
  134499451216, step "Run Distribution Tests": `RUN DEADLINE: exhausted
  absolute cutoff`; 3 checks unfinished (`native-evidence-identity.sh` at
  33.2 s, `native-stream-replay.sh`, `page-object-makeme-browser-proof.mjs`),
  4 not started. Test step wall 309 s (01:13:39 to 01:18:48); the 320 s cutoff
  started at job start, setup used ~12 s.
- Same signature on main run 44201614131 (SHA 8e3480bc9), share 2 step 302 s.

## Attribution

- Base: fails on main before this story. Candidate: this story's commits since
  b07639815 touch dashboard test support/specs, e2e spec imports and
  `Distribution/tests/local-test-resources.md` text; nothing under
  `Distribution/evaluation/`, `scripts/` or `.github/` (`git diff --name-only`).
  Share 2 is `Distribution/evaluation/**`; no share-2 check reads those files.
  Story changes do not touch the failing code.

## Evidence (CI artifacts `test-times-<share>`, read with gh)

Share job-seconds (sum of per-file wall seconds), files:

| run | result | s1 | s2 | s3 | s2 step wall |
|---|---|---|---|---|---|
| 44214090643 (story) | s2 fail | 542 | 1233 (76 started) | 934 | 309 |
| 44201614131 (main) | s2 fail | 757 | 1205 (79 started) | 908 | 302 |
| 44202590162 | pass | 552 | 1202 | 679 | 303 |
| 44213987087 (main) | pass | 555 | 1004 | 704 | 254 |
| 44211284088 (main) | pass | 779 | 705 | 678 | 179 |

- Slowdown is uniform per file: every top share-2 file is ~1.8x slower in
  44214090643 than in 44211284088 (e.g. baseline-reuse 66.4 vs 36.5,
  return-transport 54.2 vs 29.5, evidence-identity 33.2 vs 20.3). No single
  check regressed or hung; the runner was slow and the share ran out of time.
- Growth: share 2 on fast runners was 70 files / ~600 job-s through
  2026-11-17T04:37Z (runs 44018516061, 43851260112) and is now 80 files /
  ~705 job-s. New checks since then: `native-guidance-check-launch-command-tests(-e2e).sh`
  (~57 s fast; commits cdad2c608, 88cef0957, 80ecc810a) and
  `delivery-evidence-return-transport.sh` (~30 s fast; 937b22553); the rest are
  renames from `native-comparison/` to `native-guidance-checks/`. Earlier, a slow
  runner gave 1047 job-s (43815794977) and passed; at the new size the same
  ~1.75x factor gives ~1230 job-s, about 4 CPUs x 308 s.
- `node scripts/ci-shard-balance.mjs distribution-tests` (5 main runs):
  medians s1 714, s2 761, s3 679, even 718; "Balanced: no single pattern
  change lowers the slowest shard by 36 s; no diff proposed."
- `bash scripts/ci-job-times.sh` (10 main runs): Distribution Tests slowest
  job 199-304 s, deadline 320 s, headroom 16 s; its slowest job spreads 105 s across runs. The group has
  less headroom than its runner-speed spread, so a slow runner on the
  heaviest share fails it.
- Share-2 per-folder job-seconds (run 44213987087): native-guidance-checks 446,
  git-publication 221, delivery-evidence 182, native-harness 126, rest < 25.

## Hypotheses

1. This story's changes slow share 2. Refuted: no share-2 path touched; main
   failed the same way before the story.
2. One share-2 check regressed or hangs. Refuted: per-file ratio is uniform
   (~1.8x) and the cutoff check had run 33 s, its normal slow-runner length.
3. Leading (supported by CI timing, not by a forced reproduction): share 2's
   load grew ~16 % on 2026-11-17 from the new native-guidance launch-command
   and return-transport checks, and with runner-speed variance of 1.4-1.8x
   it now exceeds the 320 s cutoff on slow runners. Rebalance cannot restore
   the reserve (group headroom 16 s vs 105 s spread).

No local repeat batch or CI run was started: a local Mac run cannot
reproduce runner slowness, and the CI timing above already discriminates.

## Environments ruled out

- None local. CI: 2 failures of 2 share-2 jobs that landed on ~1.75x-slow
  runners; 1 pass at 303 s (44202590162) at the same load.

## Temporary edits / parked changes

None. Checkout clean apart from this record.

## Unrelated defects

None found.

## Next discriminating step (human judgment)

The repair changes a project budget or the suite's cost; it needs a decision:

- Recommended: reduce share-2 cost (dough-test-optimization) starting from
  `native-guidance-checks` (446 job-s), whose pair fixture launches several
  scripted sessions per check; target lowering share 2 by at least the
  group's spread.
- Alternative: split `Distribution/evaluation/**` into narrower patterns
  across shares (manual maintainer edit per rebalance-ci-shards); gains at
  most ~40 s of median balance, not the reserve.
- Alternatives needing budget review: a fourth Distribution share (CI job
  limit; measure first) or a different 320 s cutoff.

Round 1 ended paused; cumulative active minutes 4.8 (clock).

## Developer decision (2026-11-18)

Terry chose to continue slices 4–7, then, before landing, deliver a bounded
test-optimization repair that cuts Distribution share 2's cost (starting with
the native-guidance pair fixture), proven on CI runs including a slow runner.
The repair stays owed by this execution until the final target CI.
