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

## After atomic shutdown repair

Revision `edba4cd924f7d968da6961257f46611a89b0867a`,
[run42957320139/attempt1](https://github.com/terryyin/open-dough/actions/runs/42957320139).
All twelve dashboard jobs passed; the complete run failed only repository
interruption-fixture test1/3 (G14), so overall CI is not called green.
Shard8 job130315382935 passed, elapsed213.396548s, four actual workers,
362 expected/four existing skipped, zero unexpected/flaky/errors.

| Complete comparison case | Seconds | Status/retry |
| --- | ---: | --- |
| Sort with both full loops |13.936|passed/0|
| Full CLI source, clean |8.230|passed/0|
| Full CLI source, conflict |9.223|passed/0|

Current artifact13827269743:894230 bytes, SHA256
`68a8cfc5453be061f6af320739b079e7e63bffb15e5072398418b8f4b2a7fbfb`.
Current proof artifact13827738524:19972 bytes, SHA256
`751aa07eaf30c818fb5e08dd489e2531c925a427c80a012d2b3467a8d68944ed`.
Both CRC-checked ZIPs, complete summary and per-case detail are retained at
`/tmp/seed287-hosted-42957320139`, matching exact SHA/run/attempt.

All twelve parts of each dashboard entry are present with zero failed cases:
browser1295 passed/1 other, frontend23/0, backend1262/7 other. The summary's
other unit includes existing conditional/opt-in results; do not call it pass.
It locates Cursor helper-survival1, notifier setup3, helper-repair shapes3,
and opt-in replay1. The native helper case is not claimed as hosted execution;
slice13 must carry that limit with the retained actual Mac proof. No new skip
was introduced. The original turns case is4 passed/0 other, and the new source
disconnect file is1 passed. Summed case durations are not shard wall time.
