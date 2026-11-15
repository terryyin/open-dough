# Resumed baseline and bounded opportunity judgment

Frozen payload `863ea5690d85f9f2da3ade7a370426ac20b44ad2`; native Codex 0.169.0,
Node 24.21.0, gpt-6.1-sol/xhigh. One capture, terminal exec session 53139 exit 0.
Host Territory.local, AC under caffeinate -s -i, prelaunch natural load
5.21/9.76/13.98 and memory_pressure 50% free. No native retry or candidate.
This is journey 2/5; three journeys remain.

Literal command:

```sh
env PATH="/opt/homebrew/bin:$PATH" TMPDIR=/Users/terryyin/tmp/native-comparison caffeinate -s -i Distribution/tests/native-comparison.sh --native codex --case paused-supplier --baseline 863ea5690d85f9f2da3ade7a370426ac20b44ad2 --model gpt-6.1-sol --effort xhigh --save-baseline Distribution/tests/native-comparison/paused-supplier/comparisons/seed356-resumed-baseline-863ea5690.json --results-dir /Users/terryyin/tmp/seed356-native-results
```

Immutable baseline: `Distribution/tests/native-comparison/paused-supplier/comparisons/seed356-resumed-baseline-863ea5690.json`.
Raw attempt: `/Users/terryyin/tmp/seed356-native-results/codex/native-comparison/paused-supplier/20261115T010028-4049`.
Original assessment pass; all four turns complete. First three turns preserve
partial work and waiting, with no integration, filing or remote mutation.
Final qualifying turn has completed supplier reader, satisfied dependency,
exactly one integration and filing, passing independent and execution-owned
proof, unchanged remote and no harness inspection. Whole journey 827.5 s,
preparation 0.9 s; all owned harness/native PIDs ended.

## Measurement limitation and retained raw diagnosis

The maintained export reports usage unknown, totals null, 65 response rows and
three expected workers. Original JSON remains unchanged. The actual forked
worker sessions contain all counters, but readCodexSession overwrites actual
child identity with copied parent session_meta, and treats inherited parent
lifecycle as worker lifecycle. Thus it drops two workers' own counters.
`/tmp/seed356-baseline-usage-diagnosis.json` retains per-session evidence.
All own turns are complete; all own native records have full counters and
valid root-turn attribution. Source-review worker is one response; forked
implementation/refactor workers are seven/five. Coordinator is 64 responses.
The maintained reader repair has now been verified by eight focused checks and
re-exported the same raw attempt to
`seed356-resumed-baseline-863ea5690-accounting-corrected.json` with passing current
assessment and complete usage. Capture record, observation hashes and input
manifest are unchanged; the original unknown export remains byte-identical.
The following totals are the corrected maintained accounting:

| Segment | Commands | Native responses | Processed tokens |
| --- | ---: | ---: | ---: |
| Initial hold | 20 | 15 | 783,957 |
| Unchanged wake | 2 | 2 | 175,167 |
| Nonqualifying wake | 7 | 7 | 638,243 |
| Qualifying coordinator | 43 | 40 | 5,285,398 |
| Qualifying source reviewer | included in owned worker | 1 | 19,563 |
| Qualifying implementation worker | included in owned worker | 7 | 1,074,140 |
| Qualifying refactor worker | included in owned worker | 5 | 885,235 |
| Total | 72 coordinator commands | 77 | 8,861,703 |

Corrected input 8,827,316; cached input 8,614,144; uncached input 213,172;
output 34,387. Native developer interventions zero; three scheduled wakes are
case events, not developer interventions. No coordinator stop in this capture.
First three turns process 1,597,367 tokens (18.0%); qualifying continuation and
workers 7,264,336 (82.0%). This allocates observed cost by phase, not causal
savings from removing steps. The 20% whole-task bar is 1,772,341 tokens.

## One-reduction decision

No ONE allowed worthwhile removal is supported. Recommend the source's S01
stop before optimization implementation, with no helper and no saving claim.
The unchanged wake already uses two commands, and the early publication seven.
The qualifying turn reuses its supplier-procedure context: full
supplier-dependencies.md is loaded once, in turn 1 call 15, not reloaded at
qualification. Read-dependencies in turn 4 calls 14 and 28 straddles guarded
resolution and verifies its recorded state. Required supplier judgment,
guarded resolution, partial-work continuation, proof, independent refactoring
and local-only delivery cannot be deleted as redundant wake handling.

The apparently repetitive JSON/merge retries are environment costs: turn 4
call 11 fails mkdtemp in parent TMPDIR; call 13 succeeds using .git/dough-tmp.
Call 17 fails zsh heredoc temporary creation; call 18 constructs its JSON via
node -e and call 19 records satisfied. They are not evidence for a reusable
blocked-procedure helper. The first three turns alone do not supply a 20%
whole-task removal, and inspection of qualification found no repeated supplier
procedure large enough to justify that bar. This is a bounded opportunity
judgment, not a measured candidate result.

The largest later dump is turn 4 call 33, 571,452 raw output characters,
including cat .git/dough-tmp/slice3-consumer-trace.md. It concerns generic
acceptance/consumer tracing, not repeated supplier continuation. Other large
reference reads concern ordinary delegation, completion and publication phases.
Expanding into phase loading, general proof bookkeeping, removing required
workers or designing a broad context protocol would exceed this increment.
No reduction has been selected and no product change was implemented.

## Re-export/reuse contract

exportBaseline (native-comparison-archive.mjs) re-reads raw record/observations,
retains their hashes and original input manifest, but recomputes evidence/usage
with the current reader into a NEW immutable archive. This can correct cost
from the same complete raw attempt without a native journey. Exporting from
an existing JSON instead is a byte-preserving validated copy, not a correction.

However baselineApplicability treats native-host-stream-codex-session.mjs as
material. Original raw record line 72 has its old hash
15cd0c9aa5ae84ef3f9900af99b5590eaa917b096674fdb13de51f5eb42948ba.
A shared-reader correction changes the current manifest; re-export preserves
that old capture hash. Therefore ordinary --reuse-baseline --require-usage
rejects reuse and automatically reacquires a baseline before a candidate.
The five excluded derived-reader basenames do not include this shared reader.
Exporter identity is not the rejecting field; input manifest mismatch is.
No supported corrected-same-attempt matched reuse path currently exists.
Do not run a comparison that would reacquire beyond the remaining allocation,
rewrite capture input hashes, or bypass that rule. Reader repair and derived
accounting are separate mandatory proof-defect work, with original evidence kept.

## Repair proof and visible evaluation cost

Both fork accounting and valid owned-worker proof failed before the reader repair.
The reader now preserves first session identity and counts only the owner’s
lifecycle after copied parent history, retaining copied contexts and calls for
audit. Tests preserve honest unknown totals and rejection of copied proof.

Passing terminal proof (session 57384, eight checks):

```sh
env PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=2 caffeinate -s -i bash scripts/test.sh \
  Distribution/tests/support/native-comparison-archive-usage.test.mjs \
  Distribution/tests/support/native-codex-owned-proof.test.mjs \
  Distribution/tests/native-stream-replay.sh \
  Distribution/tests/native-comparison-baselines.sh \
  Distribution/tests/native-comparison-baseline-readers.sh \
  Distribution/tests/native-comparison-baseline-reuse.sh \
  Distribution/tests/native-comparison-paused-supplier.sh \
  Distribution/tests/native-comparison-unblocked-supplier.sh
```

Independent refactoring returned `## REFACTOR COMPLETE` with no edits and reused
that proof. Consumer trace: `/tmp/seed356-fork-accounting-consumer-trace.md`.

Known native evaluation cost is at least 10,330,545 processed tokens: the initial
interrupted subtotal 1,468,842 plus this complete 8,861,703. There are 103 observed
native responses across those attempts; the initial attempt’s complete-task
usage remains unknown. Additional coordinator, review and repair model work is
unmeasured and outside these native totals. Deterministic repair checks and one
maintainer budget approval are additional evaluation effort. No optimization
implementation or candidate comparison was performed. Three journeys are unspent.
