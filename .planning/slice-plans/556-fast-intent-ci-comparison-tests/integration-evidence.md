# Incoming main integration

Slice 2 published as `0edefa723f02a32c59539a75e7bdc5072536fb9a`, after
slice 1's `2d1c966890a2c8ebf0b552275200655b8d036b22`. Each publication was
accepted on the execution branch and registered with the existing
`seed286-codex` observer. Neither is a trunk landing.

Before slice 3, fetched main at `1c784a6d62d48bd845f50992775064fed6d8192f`
introduced schema 2 proof units, configured-project builders and pinned Done
story recovery. Both published histories are being combined through the
installed history-preserving publisher and product-backlog merge adapter.
The prepare phase stops before publication for compatibility proof.

The backlog matches incoming main: completed project-configuration and pinned
Done stories leave Taken; the new default-timeout story joins the queue's end;
other priorities and this execution's Taken identity remain. Incoming done
record additions and removals are preserved; the adapter rebuilds the catalog.

Compatible code joins retain the configured-project admission/fetch wrapper
and exact retained-completion owner. The extracted completion reader calls the
same `PublishedStoryHistory` acquisition factory as the existing algorithms.
One incoming `PublishedSourceBuilder` also serves configured-project data;
the redundant slice 1 owner is removed. `CiProofBuilder.summaryFor` now emits
schema 2 while retaining explicit evidence entries at the case's call site.

Typecheck and the maintained Node owners `repository-description`,
`dashboard-ci-comparison-entries` and `dashboard-ci-proof-units-read` passed.
Raw logs are `/tmp/seed286-execution-20261109/incoming-main-typecheck.log`
and `incoming-main-node-checks.log`. Independent refactor found no further
edits; its 33-consumer trace has every disposition recorded in
`incoming-refactor-consumer-trace.md` in the same directory.

The joined proof passed strictly 84/84 with the ordinary two workers and
default tracing: all comparison backend cases, real history acquisition,
completed/historical review, shared Git fetch and the seven mixed-unit UI
journeys. Literal command:

```sh
/usr/bin/time -p caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed286-execution-20261109/incoming-main-behavior.json npm run test:dashboard -- backend-tests/intent/ci-comparison backend-tests/review/story-review-completed backend-tests/review/story-review-historical-choice.spec.ts backend-tests/review/git-target-fetch tests/intent/intent-ci-comparison-units.spec.ts
```

Runner time was 92,513 ms; shell wall time 93.14 s. The machine was awake on
AC, load 3.00/4.69/6.98 before and 7.71/5.92/7.11 after, free memory 55%
after, with no competing local test process at launch. This establishes joined
behavior, not an aggregate optimization gain. The selective formatter passed;
the exact publication receipt is retained outside Git in
`incoming-main-publish.log` beside the proof logs. The accepted merge is
`87433ea6f7f5f43e6486f4a5b6a525702165b092`; both its push receipt and
observer registration name that SHA. The local execution branch was then
fast-forwarded through the backlog adapter to the same SHA.

The current ordinary family has 87 cases in 29 files, versus the original
75 in 26. The additions are seven unit cases, one extracted drilldown case,
two source-pinning cases, one rename journey and the extra deletion/expiry
Refresh descendant. Added unit and Summary cases, plus the split deletion/expiry Refresh
descendants, remain obligations in slices 4 and 5. New timeout overrides in
the incoming cancellation UI cases do not satisfy this story's default-timeout
promise; replacement and retirement remain owned here. No original assertion
is silently dropped and no new timing claim is made by this integration.
