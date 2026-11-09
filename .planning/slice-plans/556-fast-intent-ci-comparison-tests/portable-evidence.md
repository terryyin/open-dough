# Slice 5: whole-family and portable timing acceptance

Implementation base: `817cb6883c46ea008669945f2d824f0969524051`.
Slice 5 remains planned. G1 and G3 remain open until the published candidate's
complete-case CI timings are observed. Current local green is not that proof.

## Proof composition and ordinary feedback

The exact role inventory combines slice 4's 164 rules and eighteen declared
connections with three real-store rules and three Refresh connections. All
188 selected cases match these owners: 167 rules and 21 connections. The
three existing native launch/capture journeys remain additional preservation
owners measured separately; they were not part of the original 75-case local
selection. No slow rule was reclassified after measuring it.

```sh
/usr/bin/time -p caffeinate -s -i env SEED286_TIMING_RECORD=/tmp/seed286-execution-20261109/final-ordinary-timing.json SEED286_SETUP_RECORD=/tmp/seed286-execution-20261109/final-ordinary-setup.jsonl OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed286-execution-20261109/final-ordinary-proof.json OPEN_DOUGH_DASHBOARD_ARTIFACT_TRACE=/tmp/seed286-execution-20261109/final-ordinary-artifacts.jsonl npm run test:dashboard -- --config /tmp/seed286-execution-20261109/performance-instrumentation.config.ts backend-tests/intent/ci-comparison backend-tests/intent/ci-proof-memory backend-tests/intent/ci-time-without-runner-waits.spec.ts tests/intent/intent-ci-comparison tests/intent/intent-summary-story-comparison tests/review/story-review-one-shot-choice-refresh.spec.ts backend-tests/review/story-review-stored-
```

Terminal strict pass 188/188, no skipped cases or retries; runner 86,853.104 ms,
shell wall 87.35 s. The original ordinary 75-case selection took 269.01 s wall,
runner 268,095.894 ms. This demonstrates 181.66 s less wall time (67.5%) while
including every replacement and the broader current family, not a smaller
selection. Both use ordinary two workers/default tracing/timeouts, Node
24.21.0 on this macOS arm64 host. The external measurement config preserves the
real config and quiet reporter, adding file-only timing observations.

All 167 rule durations are 0–743 ms; conservative observed end envelopes,
including trace cleanup/IPC and excluding the union of inspected shared
intervals, are 3–748 ms. The 21 predeclared connections remain separate:
reported 996–12,633 ms, complete conservative envelopes 1,001–12,640 ms.
The strict source selection, role matching and raw envelopes stay outside Git
under `/tmp/seed286-execution-20261109/` with the command's four output files.

Preflight at 22:46: awake AC96%, load 2.06/2.85/3.35, memory 72% free,
WindowServer about 29.6% CPU and VM 3.4%, no other heavy test process. The
selection ran 14:48:05–14:49:31 UTC; postflight at 22:49: AC96%, load
5.80/4.30/3.83, memory 71% free. `caffeinate -s -i` covered the command.
Baseline preflight load was 2.95/4.50/7.92, with 62% free memory; after
10.47/7.74/8.36, 59% free. These conditions qualify the measured comparison.

Shared preparation is separately observed, without an exclusive-overhead sum:
combined runner preparation before workers 574 ms; original global-setup owner
and module load 178.125 ms, returned teardown 88.358 ms. Each initial worker's
dispatch/process/config interval is 190 ms, then first-spec preparation 95/94 ms;
shared browser fixtures 94/84 ms. These are actual named boundaries, not isolated
fork or CPU timers. Artifact start/complete spans are history 624 ms, queued
origin 1,195 ms, app 750 ms, server bundle 79 ms and comparison mount 473 ms.
They overlap hooks/tests and one another; do not add or subtract them twice.
All 188 test begin/end pairs and 2,184 hook/fixture begin/end pairs are present.
All 167 raw, unadjusted rule envelopes also remain below one second (max 748).
The reproducible details are `final-ordinary-analysis.md/json` and
`final-ordinary-roles.json` beside the raw evidence.

## Equivalent proof and independent refactoring

Refresh rules, transitions, native ownership and builder consumers are mapped
in [Refresh evidence](refresh-evidence.md). Actual store persistence,
replacement identity, native-independent arrangement, deletion and retention
are executed, not inferred from a fake frontend answer. The existing native
helper remains unchanged for its other consumers.

Six existing DOM observer responsibilities now batch coherent actual state;
independent expected rows, words, counts, roles, labels, cues and all actual
keyboard/click/Show % transitions remain. The two sort consumers pass their
same literal row orders into the batched observer. Scratch controls reject a
rowheader changed to cell and an added aria-label while keeping words intact;
both identical observers pass after restoration. The scratch was removed.
Thirty-one cases across sixteen external consumer files passed. This ordinary
188-case gate executes the other five affected comparison consumer files.
Full setup/assertion and consumer dispositions are in
`slice5-portable-rules-return.md` and its linked records outside Git.

Independent refactoring consolidated the duplicate preferred-key observation
and one duplicate canonical replacement arrangement in existing test-support
seams. Literal expected keys and omitted-landing preservation proof remain.
Only the two new backend specs were invalidated: current focused three-case
proof passed at 14/270/15 ms, runner 1,298.974 ms/wall 1.74 s; typecheck passed.
The ordinary profile above predates this fixture-only refactor. Its other
185 observations and unchanged browser/native/builder boundaries remain valid;
the current three-case replay supplies the changed fixture observation.

Fresh preparation first stopped before commit/publication on five redundant
`Element.textContent` null fallbacks. The local DOM getter and Playwright
element types establish non-null strings. Scoped independent review caught a
normalizer call accidentally removed with one fallback; that call was restored
before retry. The five final removals preserve actual DOM strings and every
normalization/expectation. Other formatter changes are mechanical. Accepted
behavioral proof remains unchanged; the formatter and check-only hooks rerun.

## G3 experiment and decisive checkpoint

Actual published Linux run 42627028218 attempt 1 at slice-4 `7f656baa...`
matched all 164 old rule owners. Sixteen passing default-slot times exceeded
one second; the queued-selection case adds a seventeenth through observed
cleanup (997 reported, 1,033 ms through After Hooks). Four more complete
upper bounds were inconclusive because they include inter-test scheduling.
Its single heading-race failure was deterministically repaired and published
as `817cb6883c46ea008669945f2d824f0969524051`; it is not a waived flake.

CI step evidence attributes repeated browser assertions: the worst sort case
used 26 serial assertions taking 749 ms. The chosen experiment batches the
same observations in their existing owners. Readiness now preserves the old
semantic locator auto-wait before reading a collection, avoiding a new empty
collection's generic-poll delay. No production/mount/motion/timeout change,
shared mutable server, hook relocation or broader framework was introduced.

The ordinary 87-case local experiment does not demonstrate batching speedup:
unmodified wall 10.74 s/summed attempts 17.351 s; final corrected wall 12.69 s/
summed attempts 21.134 s. All cases pass, 106–742 ms, conservative complete
envelopes at most 747 ms. Differing host load/external VM activity limit causal
comparison. Do not attribute the whole-story feedback gain to this experiment.

The supported next decision is one concrete published CI profile of this
candidate, retaining slice 5 planned through `progress: true`. That evidence
decides retain/revise and closes neither G1 nor G3 until observed. No additional
local variant or unmeasured performance claim substitutes for it. Record exact
revision/run/attempt, outcomes and complete per-case bounds; reported durations
alone omit some trace cleanup. Final target CI C067 remains its lifecycle duty.

Historical loaded 83-case triple repetition passed 249/249 at 108–823 ms with
independent Python workers at about 103%/62% CPU, load 8.74→6.44. The later
native/87-case intended pairing did not overlap: native ended 14:35:06.140,
UI began 14:35:07.731 UTC. It supplies no concurrent-rule evidence. Refresh
integration did overlap the required external consumer gate at 14:39:02.926–
14:39:08.871. Current assertion changes, actual CI concurrency and finite
environment limits remain explicit; no arbitrarily starved-machine guarantee
is inferred from any profile.

### Published checkpoint result and lint repair

Progress candidate `80ef2d480d18da013c29eb8705e1ba5c47590fd9` was accepted
and registered. Run 42640995642 attempt 1 has no failing dashboard case:
all 167 rule owners match and pass. The twelve retained reports show nineteen
reported rule durations over one second (max 1,501 ms), 21 cleanup prefixes
over it (max 1,549 ms), and 24 conservative next-start upper bounds over it.
Thus the experiment did not establish portable acceptance. G3 stays open;
remaining-observation analysis must choose a supported strategy before more
dependent implementation. No passing rerun will substitute for a correction.

That run's only failed job is full-tree lint: the earlier GitHub-memory stub
inherited contextual `any` from an unannotated JavaScript acquisition function.
Its argv is now explicitly `string[]`, matching the real literal argv caller
and archive contract. This one-line type annotation emits byte-identical
JavaScript (3,679 bytes). Current owner tests pass 3/3 at 4/5/1 ms, typecheck
and whitespace pass. Independent refactor found no further edit; actual
formatter/hooks and the repair publication remain coordinator-owned.
The complete failed-job log and all twelve HTML reports account for the
original diagnostic's inaccessible-log gap. No test failure was waived.

## Existing timeout follow-up

SEED-284 commit `625936070c372a5559e3baf25ad3e88668b2e2c9` already moved the
old comparison candidate's obligation here when converting the record to live
candidates. Its removal is not this execution's cleanup. The four old 60-second
comparison allowances are gone with their mapped replacement/retirement;
all retained comparison/Refresh/native owners passed at the default timeout.
The unrelated live rate-limit candidate remains with its current decision.
