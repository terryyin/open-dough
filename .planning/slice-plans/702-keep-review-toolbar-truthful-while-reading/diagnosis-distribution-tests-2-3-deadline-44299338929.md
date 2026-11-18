# Diagnosis: Distribution Tests (2/3) deadline — run 44299338929

**Identity:** SEED-384#keep-review-toolbar-truthful-while-reading

**Failed SHA:** `97fa4134b776754a10f353cb8331d3605c6dd7c2` (slice 1 publication)

**Run:** https://github.com/terryyin/open-dough/actions/runs/44299338929 attempt 1

**Job:** Distribution Tests (2/3) `134784637575`

## Failure signature

```
RUN DEADLINE: exhausted absolute cutoff (OPEN_DOUGH_TEST_DEADLINE_MS=…)
unfinished running: native-stream-replay.sh, page-object-makeme-browser-proof.mjs, page-object-native-browser-proof.mjs
not started: product-backlog-native-take-fixture.sh
TIMEOUT: … (exhausted run deadline; after 4.9–10.7s)
```

No product assertion failure. Inventory gap `no-recognized-failure` (timeout format). Sibling shares 1/3 and 3/3 succeeded.

## Reproduction / conditions

- Share 2 matrix pattern: `Distribution/evaluation/**`
- Job timeout 6m; absolute test cutoff 320s from job start
- Artifact `test-times-2`: 75 started jobs, **1224.2** job-seconds → ~5.10 min wall at 4 CPUs; CI variance 1.4–1.7× puts share over 320s
- Story change paths (review eye callers / source-review) do not touch Distribution evaluation
- Attribution: base-versus-candidate — overload of share 2, not this story's product code

## Hypotheses

1. **Leading:** Share 2's evaluation glob is over capacity for the 320s cutoff under ordinary CI variance. Repair by moving patterns (ci.yml) and/or speeding the heaviest evaluation checks so share 2 finishes with margin.
2. One-off runner slowness only — insufficient alone; times show structural overload near the cutoff even at ideal 4-way parallelism.

## Round 1

- Hypothesis before experiment: share 2 over capacity; rebalance or speed heaviest evaluation checks.
- Stopping count: one discriminating repair that proves the share fits, or a human stop if authority for matrix change is disputed.
- Parked unfinished work: slice 2 stash record `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-luT70P/record.json` (OID `b94b577d5e28b8cae338f9f09f0691be02278de7`).

### Evidence gathered

- Deadline epoch set at job start; setup used ~14s; test step had ~306s before absolute 320s cutoff.
- Failure `test-times-2`: 1224.2 job-seconds / 4 ≈ 306s wall — no margin after setup; unfinished residual small.
- Sibling shares same run: 996.6 and 1013.3 job-seconds (both succeeded). Suite total ~3234 → even ~1078/share (~269s wall) would fit.
- `ci-shard-balance.mjs distribution-tests` (5 main runs): even 651s; shards 635 / **701** / 616; slow file `native-comparison-baseline-reuse.sh` (71s); script: balanced, no single automatic pattern move; evaluation is one folder pattern so a narrower split is a manual matrix edit.
- Folder medians (share 2): guidance 304, git-publication 157, delivery-evidence 117, native-harness 99.
- Share 1 pattern medians: execute-plan 567, update-* 62.5.

### Experiment

Move `Distribution/evaluation/tests/delivery-evidence/**` onto share 1 and drop `Distribution/tests/installation/update-*` from share 1 so it falls to share 3 (rest); replace share 2's `Distribution/evaluation/**` with the other evaluation folders.

### Result

- Applied in `.github/workflows/ci.yml` (uncommitted). Listing: 262 / 66 / 324 checks, zero overlap, all 76 evaluation checks assigned once; `update-*` on share 3 only.
- `ci-shard-balance.mjs` after edit: **689 / 584 / 680** (was 635 / 701 / 616). Share 2 no longer the slowest; script reports balanced.
- Failure-run remix (artifact times onto new ownership): **1102 / 1013 / 1118** job-seconds → **275.6 / 253.3 / 279.6**s wall @4 CPU; margins vs ~306s post-setup budget: **30.4 / 52.7 / 26.4**s. Evidence: `open-dough/evidence/repair-failure-remix.txt`.
- Five main-run remixes: max walls 239 / 211 / 223s (margins ≥67s). Evidence: `open-dough/evidence/repair-main-slow-remix.txt`, `repair-shard-balance-after.txt`.
- Local Mac `OPEN_DOUGH_TEST_SPLIT=2/3` under a 280s absolute deadline exhausted the cutoff (native evaluation checks much slower here than ubuntu CI); not used as capacity proof. Log: `repair-share2-deadline-proof.log`.

**Verdict:** share-2 overload from the single `Distribution/evaluation/**` pattern; matrix rebalance restores deadline margin under the failing run's own times. Leading hypothesis confirmed; repair ready (do not commit from this agent).
