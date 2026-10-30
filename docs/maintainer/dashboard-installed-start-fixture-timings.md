# Isolated installed-start fixture preparation

Measured on 2026-10-29 after the scheduling and observation changes in
[dashboard test timings](dashboard-test-timings.md).
Baseline `a94c65e2c2e4a9143b5260b569c83bd4292f081c` is a metadata-only revision
with the runtime of `b22c40678b15adabb25fb10872048a77945940d9`. Candidate
`8c55a30c56d324100cc44cbb105123aa8ebfc823` prepares fresh packed installed-skill
origins once per run, then copies private origins and creates native clones.
No writable Git objects, refs, config, indexes, HOME, server, browser context or
fake-service state is shared. Run preparation uses current working-tree source
and is removed at teardown; there is no persistent cache.

The baseline selects 1,735 cases in 577 files. The candidate preserves every
original full case identity and verdict and adds three passing isolation guards:
concurrent real installed starts and private publication/cleanup; current source
across successive preparations; and failure cleanup with unexpected errors.
It selects 1,738 cases in 578 files: 1,734 pass and the same four platform skips
remain. Both use twelve shards with four observed workers; neither has a retried
case. Existing scenarios and assertions, strict verdicts, native input,
every-control observations and compile-cache policy are unchanged.

| Revision | Run | Max dashboard job | Max browser suite | Full CI | Job start spread |
| --- | --- | ---: | ---: | ---: | ---: |
| Baseline `a94c65e2` | [40809484652](https://github.com/terryyin/open-dough/actions/runs/40809484652) | 230s | 199.32s | 235s | 2s |
| Candidate `8c55a30c` | [40814111625](https://github.com/terryyin/open-dough/actions/runs/40814111625) | 219s | 187.70s | 221s | 0s |
| Same candidate `8c55a30c` | [40815056135](https://github.com/terryyin/open-dough/actions/runs/40815056135) | 227s | 203.38s | 230s | 0s |

All three runs passed all sixteen jobs. The baseline and repeat were manually
dispatched; the first candidate was push-triggered. Runs were sequential with
unchanged commands and workload. First-job queue was 3s/2s/3s respectively. The
maximum job and suite can belong to different shards. Both candidates preserve
the same original identities/verdicts plus three guards, with no extra attempts.
Accumulated origin-fixture spans fell from 442.99s to 81.66s/81.83s (81.5–81.6%
lower). Dashboard-fixture spans varied from 1,162.17s to 1,191.43s/1,187.21s.
Ordinary per-test setup/teardown, excluding shared hooks, fell from 1,829.75s
to 1,461.44s/1,465.70s.
These are accumulated, sometimes nested spans, not elapsed CI seconds; do not
add them together. The three new guard bodies cost 6.63s/7.06s of accumulated time.

The longest dashboard jobs were 3–11s (1.3–4.8%) shorter and full CI 5–14s
(2.1–6.0%) shorter than this baseline. Suite elapsed 187.70–203.38s straddles
the 199.32s baseline, so this sample establishes no reliable suite-elapsed
improvement. Shared runner headroom, cache state and unchanged slow-case
variability limit causal attribution. The repeated fixture-component reduction
is much clearer than the modest, variable elapsed CI effect.

The same normal local family passed all 45 cases before and after with eight
default workers on one 16-CPU/48-GiB host:

```sh
env -u NO_COLOR npm run test:dashboard -- agent-launch-model.spec.ts \
  agent-launch-codex-model.spec.ts agent-launch-preparation-codex-retry.spec.ts \
  agent-session-cursor.spec.ts accessible-board-keyboard.spec.ts
```

Wall time fell from 41.26s to 30.88s (25.2%); reporter time fell from 40.558s to
30.458s. The comparison includes eager preparation. Host load and available
memory varied. Three consecutive isolation-guard runs passed, as did twenty
ordinary installed-start, recovery, process, serving and compile-cache cases.

Preparation has a tradeoff: even focused runs with no installed starts pay its
cost. A real setup profile observed 1.71–3.29s for the two layout seeds. An early
first-use diagnostic varied/slowed despite cheaper initialization and does not
independently establish a gain. The retained benefit is supported by the normal
family and complete CI, not that microprofile. Aborted or incomplete diagnostics
are excluded from passing proof.

A real preview-server profile retained Vite, native config loading and prebuilt
assets. Three private starts took 269–276ms, with only 4–7ms before spawning;
closing them took 28–30ms. Existing build/bundle/executable reuse already removes
the obvious repeated immutable work, so no further bootstrap change was
justified. Concurrent HTTP/browser observations confirmed that changing and
stopping one preview left its peer's process, HOME, fake answers, Codex model
and browser storage intact. All observed processes and run preparation ended.

Raw strict records, complete report downloads, profiles, exact commands and
comparison outputs are retained outside Git under
`/private/tmp/cheap-isolated-fixtures-167`. Hosted reports and named revisions
provide the reproducible workload, subject to artifact retention.

Subsequent reduction of repeated production-watcher policy builds is measured
in [production policy test timings](production-policy-test-timings.md).
