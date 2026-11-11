# Repeat admission waits for the real request

This is the minimal test-wait repair discovered during slice 1. It changes
only `dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts`.
The seven cases, real receipt ingestion, collector, request owner, provider
answers, case deadline, five-second polling defaults, and all outcome and
exactly-one assertions remain.

## Failure and causal boundary

The failed original selection at `17a2f12052f50acf1f844855ea2e16b45377a630`
recorded three failures: recovered, cancelled, and uncertain. After successful
receipt ingestion, the five-second `repeatCalls.length` poll saw zero. The
variant-specific provider outcome had not yet been set. See
[baseline evidence](baseline-evidence.md#failed-observations-remain-owned).

`LandedCiCollection.collect` resolves landing history before
`collectCiFollowUps`; `collected()` queues receipt nudges behind an active
pass. Thus receipt acceptance only establishes ingestion. The existing
`ciFollowUpScenario.holdSubmission` callback is invoked after the synthetic
provider receives the real `actions-workflow-rerun` request and records its
run ID. The spec now awaits a Promise resolved by that callback. Its immediate
`repeatCalls === [71]` assertion remains independent, and every final
exactly-one and outcome assertion remains. The first lifecycle retains its
held POST and persisted `intent` assertion before the response is released.
No shared helper or production contract changes.

A temporary diagnostic on this same request boundary recorded arrivals after
receipt acceptance: recovered 1298 ms, failed 1229 ms, cancelled 1152 ms,
partial 1155 ms, refused 1219 ms, uncertain 1154 ms. The whole diagnostic
family strictly passed. This observes that ingestion precedes readiness; it
does not observe a request arriving after five seconds in the original
pressured run. Those fixtures had already torn down. The original trace
cannot distinguish late admission from admission that never occurred. No
claim about an unobserved runtime defect or its repair is made.

Temporary timing instrumentation was removed before the three final passes.
Raw diagnostic timings, strict records, logs, load observations and consumer
traces are at `/tmp/seed303-repeat-repair-yc30ed7t`.

## Final focused proof

Each run used the ordinary strict reporter and one worker, with its own
proof destination. Literal shell selection:

```sh
proof_root=/tmp/seed303-repeat-repair-yc30ed7t
for run in 1 2 3; do
  OPEN_DOUGH_DASHBOARD_PROOF_RECORD="$proof_root/proof-$run.json" \
    /usr/bin/time -p caffeinate -s -i npm run --silent test:dashboard -- \
    dashboard/backend-tests/intent/landed-ci-automatic-repeat.spec.ts --workers=1 \
    > "$proof_root/proof-$run.log" 2>&1
done
```

All three commands exited 0. Each strict record is completed/passed, selects
seven cases and contains seven passed attempts, retry 0, with no skips.
These are focused family observations, not the story's combined baseline or
its final under-30-second proof.

| Run | Whole command seconds | Runner seconds | Strict cases |
| --- | ---: | ---: | --- |
| 1 | 47.68 | 47.164 | 7 passed |
| 2 | 41.82 | 41.305 | 7 passed |
| 3 | 45.56 | 44.978 | 7 passed |

Setup is `prepareRepeatScenario` using shared MakeMe, a real published story,
five predecessor landings, and existing synthetic provider facts. The test's
real `postLanding` ingestion and collector produce the rerun request. The
observing assertions are the first case's held `intent`, original run ID,
progress/slow cards, selected history, restart persistence and exactly-one
request; and each outcome case's particular explanation, retained original
120000 ms, average 100000 ms, honest card kind, and exactly-one request after
disabling further follow-up. Recovered, failed, cancelled, partial proof,
refused and uncertain variants all execute through their final assertions.

## Host and consumer trace

Pre-launch host: this macOS machine was awake on AC with 48 GiB memory,
42% free, load 7.53/14.28/14.38. SEED-287's earlier pressure workers had
exited. The bounded choice was one-worker sequential focused proof under
`caffeinate -s -i`; no owned competing heavy workload was launched.
Per-run load snapshots remain beside the strict records. No time goal is
claimed from different load conditions.

The installed `consumer-trace.mjs` was run with checkout, base
`17a2f12052f50acf1f844855ea2e16b45377a630`, the changed spec path, and
`holdSubmission`/`repeatCalls` effect terms. `consumer-trace-all.md` retains
all resulting rows with dispositions. Its broad planning-name matches come
from the parent's separate uncommitted records. `consumer-trace.md` repeats
the whole-checkout search for this repair's path and effect terms alone.

That targeted trace finds no production consumer. The shared
`ciFollowUpScenario.ts` helper and seven sibling specs are excluded from
changed-effect proof: the helper and their private waits are unchanged, and
none imports this spec. Historical timing evidence, the coverage map and
baseline evidence only name this proof; they are not an execution consumer.
The seven-case spec is the entire surface whose private wait changed, and
all seven cases passed three times. The parent retains the three comparable
passing 45-case baseline obligation and the overall story remains unfinished.

## Mechanical delivery correction

The selective formatter rejected the outcome callback's unnecessary `async`
under `require-await`. Delivery rewrites it as a normal callback that resolves
the same arrival signal and returns `Promise.resolve()`. Both forms return an
already fulfilled Promise to the same awaited hook; request handling, signal
order, assertions and timeout contracts are unchanged. This is an already-traced
mechanical repair inside the accepted refactor's paths; focused and combined
proof remain applicable without a new test run. The measured source hash remains
in the frozen baseline; delivery's repeat-spec SHA256 is `387af5c4b67f80b175bebafe28f2cbbb196408381cc75540215363720bc78583`.
