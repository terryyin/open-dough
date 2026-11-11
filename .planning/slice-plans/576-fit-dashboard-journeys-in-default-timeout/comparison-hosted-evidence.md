# Actual hosted comparison cases

Published revision `fb94704947c341ff0944e43fec83e820c558a981`,
[run42952620767, attempt1](https://github.com/terryyin/open-dough/actions/runs/42952620767).
Exact observer says the whole run failed one independent shutdown test on
shard9. Shard8 job130300233942 passed, with all comparison cases executed once:

| Complete case | Seconds | Status/retry |
| --- | ---: | --- |
| Full sort, drilling and both cross-story loops |13.763|passed/0|
| Full CLI source, clean merge |7.895|passed/0|
| Full CLI source, own-conflict-extra |8.487|passed/0|

Report metadata binds the full SHA/run and actual four hosted workers.
Shard8 reporter elapsed177.6963s;362 expected passes/four existing skips,
zero unexpected/flaky/errors. None of these three cases skipped or retried.
Three skips name this install's absent separate node-pty helper; the fourth
is the existing opt-in Sessions replay. No new skip was introduced.
The default case budget remains30s; the actual source/sort code has no override.
Reporter durations include teardown, so they are not exact body-slot counters.
Worker/global cold preparation is not included in per-case totals; it remains
paid in shard elapsed. No 1.5× runner-factor or full-suite success is inferred.

Connected GitHub artifact13825432134 belongs to that exact run/branch/SHA.
Downloaded890191-byte ZIP SHA256:
`40bd82aac305200aaf837425a522268352f936d5f613d315bf53297ccd887a91`.
Outer and embedded report ZIP CRCs pass. Parsed report/file detail results:
`/tmp/seed287-hosted-42952620767`; original individual statuses, retry0, errors[]
and exact case titles are retained. This is actual passed-shard proof while
the complete run remains failed. Parent inspected metadata and case results.
The local worst sort body still has about .980s headroom; all original local
timing qualifications remain in comparison-default-evidence.md.
