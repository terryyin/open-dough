# Source ingestion and complete watcher-family saving

Current slice4 reuses the established on-demand run-artifact owner for one
immutable full-source Git snapshot. Each full-source fixture clones private
writable Git objects/index/refs/working tree with no hardlinks or alternates,
removes the snapshot remote and creates its own initially empty bare origin.
HOME and fixture state stay private. Actual npm installs, Vite builds, starts,
serving and cleanup remain. No persistent/worker cache or prewarm is added.
Calls without a run owner prepare current source privately; false-source stays
an independent empty starting commit. Existing owner/other keys are unchanged.

The decisive unchanged fixture profile took2.921s at load4.87→5.44:
5,742 copies1.279s, initial Git add1.231s and commit0.183s. This supported one
variant; it did not itself establish a saving. A strip-only Node import failed
before fixture work; the supported transform-types command corrected that setup.

## Observed C11 / Q03 / G9

Exactly3 alternating ORIGINAL32/CHANGED31 case family pairs strictpassed,
retry0, on the same16CPU AC macOS host with the same competing worktree suite.
Before shell170.775636/156.893714/142.575286s;
after138.590675/136.400577/133.992428s.
Median156.893714→136.400577 saves20.493137s, meeting the10s median target.
Runner median156.213784→135.867652 saves20.346132s.
Pair savings32.185/20.493/8.583s are all retained, including the third below10.
This compares retained consolidation plus source cut with the original family;
it does not attribute all20.49s precisely to source ingestion alone.

All hooks, private clones, real installs/builds/starts, signal destination and
first-demand preparation are included in complete elapsed. Cold snapshots cost
3.532/3.352/3.461s; each run shows3requests and exactly1start/complete. Every
prepared source directory was absent after run teardown. No cost was prewarmed
or moved outside elapsed. After worstcase15.012s. Per-spec/hook sums remain
separate from elapsed; updates is also affected by the shared fixture change.
Before load endpoints4.35–14.21, after9.82–14.21; after runs start at preceding
before endpoints and finish at higher1min load. Host variance remains; no
universal causal20.49s or per-run10s guarantee is claimed. No synthetic load.
Final20–30 pressure/hosted/default-allowance/fullsuite/shard gates stay12-owned.

Literal family command in both checkouts:
`caffeinate -s -i npm run test:dashboard -- tests/runtime/production-watcher-failures.spec.ts tests/runtime/production-watcher.spec.ts tests/runtime/production-watcher-updates.spec.ts --workers=2`.
Baseline791cce's relevant actual app/runtime/package/scripts matchd1acd744;
intentional consolidation, records and unrelated publisher are identified.
Raw exact command/cwd/status/selection/load/phase records and paired medians:
`/tmp/seed287-source-ingestion-20261110/paired-summary.json` and return.md.

## Inspected behavior and consumer proof

Root inspected current source-copy/materialization/registration and all56
consumer dispositions. Whole-family observing assertions retain sameC PID/page
through outage/recovery into D failure/restoration exact2newcauses, both fatal
preview outcomes/cleanup, actualHUP naturalexit beforestop, exactcurrent restart
SHA/checkout/page, same runner/client/input, activebuildSIGTERM and finalSIGINT.
Existing actual no-opHUP/stale-parent fault proof remains applicable: runtime
and observing assertions are unchanged; current-source copying and current
runtime-byte publication plus positive families exercise the same inputs.

Publication/refusal/deployment selection passed7/7 (then2publication,1refusal,
4deployment); qualificationfalsepath passed4/4. Source-copy boundary uses canonical
MakeMe repository facts and exact live inputs at the case site. Two concurrent
fixtures contain modified/untracked source and exclude tracked deletions/avatars;
origins start empty, HOMEs differ, mutations/publications remain independent after
source and snapshot removal, and sibling can push after first fixture removal.
No-owner fallback publishes exact current runtime bytes. Existing docs publication
still changes only requested paths; real refusal requires no published main;
real deployment installs/builds/serves pinned revision after main advances, with
avatar/private-file/origin boundaries, icons, child cancellation and cleanup.

After timing, only the isolation test's partial-creation/close ownership was
corrected. Final publication3/3 passed with runtime/helper unchanged; no extra
family timing. Typecheck and whitespace passed. Every command is terminal and
no owned watch remains; parent baseline and CI observer remain untouched.
Literal commands, observing assertions/setup, consumer map, bounded host/proof
decision and source artifacts: `/tmp/seed287-source-ingestion-20261110/return.md`.

Independent source_ingestion_refactor returned none—already clean with
REFACTOR COMPLETE, no edits/tests and all accepted proof/consumer dispositions
unchanged. No new observation or architecture gap was found.
