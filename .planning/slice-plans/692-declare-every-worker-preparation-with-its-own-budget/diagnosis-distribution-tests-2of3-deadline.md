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

## Repair experiment: share-2 cost cut (slice `repair-distribution-share2`)

- Hypothesis: the native-guidance pair fixture repeats setup and substitute
  sessions across checks; removing that redundancy cuts share 2 by at least
  ~60 job-s (10 % of its ~600 fast-runner job-s) with no lost observation.
- Trial limit: the slice's 15 active minutes; one discovery profile, then at
  most one edit-and-measure trial.
- Decision criterion: keep a change only if it projects at least ~60 share-2
  job-s and every guarded assertion still runs; otherwise stop with evidence.
- Evidence read: `test-times-2` of run 44213987087 (native-guidance-checks
  446 job-s; the five `native-comparison-baseline-*` checks 184, the
  launch-command-tests pair 71).
- Local profile (load averages 4.7-7.7, Homebrew bash 5, scratch scripts
  through the slice clock): pair-fixture setup 2 s, rule commit <1 s, one
  capture 5 s, one reused-baseline pair 5 s, one fresh pair 8 s. Each
  substitute session costs ~5 s; tracing one capture puts ~54 % of it in
  `Distribution/evaluation/cases/guidance-checks/supplier-fixture.sh` (the
  case's starting project: 75 Git calls, per-turn observations).
  launch-command-tests: `case_materialize` 7 s, E2E specs 19 s, backend specs
  9 s; the two checks share only the materialization.
- Test-only redundancy found: identical setup+capture repeated in
  baseline-reuse/-conditions/-readers (capture of `quiet`) and
  baseline-misses/-unavailable (capture of the fixture baseline), and one
  duplicated launch-command-tests materialization. Every session beyond those
  carries its own assertion (session-count and acquisition per input kind).
  Merging the files saves at most ~3 x 8 + ~9 = ~33 job-s and lengthens the
  merged files.
- Decision: stop below the criterion; no edit made. The substitute session
  cost lives in the paused-supplier case's starting state, a case input of
  paid comparisons: changing it changes the recorded case/project basis and
  so the reusability of saved native baselines. That needs a maintainer
  decision before a repair can pursue it.

## Developer decision (2026-11-18, second)

Terry chose: apply the ~33 job-s test-only merges in native-guidance-checks,
then one bounded pass over git-publication for redundant test-only work. The
paused-supplier case basis and saved baselines stay untouched.

## Repair: share-2 merges (slice `repair-share2-merges`)

- Change (test-only, uncommitted): `native-comparison-baseline-conditions.sh`
  and `-readers.sh` merged into `native-comparison-baseline-reuse.sh` (one
  fixture, one `quiet` capture; sections conditions, reuse, readers; readers
  resets the harness to the captured commit before its own reader commits);
  `-unavailable.sh` merged into `-misses.sh` (one fixture-baseline capture;
  the task change stays last); `native-guidance-check-launch-command-tests-e2e.sh`
  merged into `native-guidance-check-launch-command-tests.sh` (one
  `case_materialize`; its E2E 0/4 and `Received length: 5` assertions run after
  the backend proof). `-environment-e2e.sh` comment now names the merged check.
- Every assertion of the removed files runs unchanged in the merged files;
  only the duplicate setup, rule commits and capture (`original.json` in
  readers is now the shared `baseline.json`) are gone.
- Local A/B (each file alone, sequential, Homebrew bash 5): before 266 s
  (7 files; load 12.5 -> 8.4), after 181 s (3 files; load 8.4 -> 11.3);
  all passed. Saving ~85 local job-s; CI test-times keys of the 4 removed
  files disappear, their cost moves to the 3 kept keys.

## Repair: git-publication pass (slice `repair-share2-git-publication`)

- Hypothesis: the git-publication checks (221 job-s on run 44213987087;
  `git-publication-native.sh` 39.5, one-shot workspaces/results/reviews
  28.0/22.3/18.0, owned-context 25.7, substitutes 19.3, admission four
  wrappers 38.3, fixture-identity 12.3) repeat test-only setup (fixture
  repositories, identical substitute journeys or assessor setup) across
  wrappers or sections, removable without losing an observation.
- Trial limit: the slice's 15 active minutes; one discovery profile, then at
  most one edit-and-measure trial.
- Decision criterion: keep a change only if it projects at least ~30 share-2
  job-s and every behavioral observation still runs; otherwise stop with no
  edit and report findings.
- Local profile (Homebrew bash 5, scratch timing wrappers through the slice
  clock, load 2.7 -> 3.0): `git-publication-native.sh` 22 s in 19 assessor and
  observer counterexample groups (story-closure observer 5.1, assessor 4.8,
  harness 2.3, CI-completion observer 2.1, the rest <= 2.1), each rejected case
  a distinct signal. Suite groups: one-shot workspaces 33.9 (5 journeys 15 s,
  their state counterexamples 19 s), results 33.5 (4 runs 17 s), reviews 20.2
  (4 runs 11 s), owned-context 27.9, substitutes 16.3 (15 runs of ~1 s).
- Every substitute run is a distinct journey, host stream shape or variant
  (unobserved CI, pushes, truncated, skip-push, exit-after-complete); each
  builds and installs its own fixture inside the case runner
  (`git_publication_run_journey`, evaluation case basis, out of scope). No
  check repeats another's journey, fixture or capture; real-state
  counterexamples already share each journey's kept fixture and restore it.
- Remaining test-only candidates: the story-closure observer's second fresh
  fixture (~2.5 s), the review and refinement `pushes` whole-run variants
  (~6 s; turning them into state mutations changes the proof form, a design
  judgment) and per-file wrapper overhead of the four admission jobs (<1 s
  each). Together ~10 local, ~15-18 CI job-s on a fast runner.
- Decision: stop below the ~30 job-s criterion; no edit made. The
  git-publication cost lives in per-journey fixture construction in the case
  runner and in distinct counterexamples.
