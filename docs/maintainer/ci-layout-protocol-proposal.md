# Proposed CI comparison correction

Status: awaiting developer decision; the
[active protocol](ci-layout-measurements.md#prospective-protocol--2026-11-14)
is unchanged. No existing observation becomes a passing layout comparison.

## Reason for the decision

The first replacement solo pair was B 278 seconds and C 388 seconds. C's
proof queued for 116 seconds after another execution started an unmatched run.
The first mixed pair was B 606 seconds and C 309 seconds, with C created one
second earlier; another workflow also ran jobs during that pair. These are
valid complete-verdict observations, with inadequate control for a causal
layout claim. Their full queues and preservation evidence remain recorded.

The current mixed-pair raw-sign veto is conservative but can conflate dispatch
priority with layout. Its 40-run ceiling buys exactly five eight-run blocks,
so an unmatched block prevents its five-block passing criterion. Subsequent
favorable samples cannot repair that under the active rule. The independent
method review supports retaining the incumbent or an inconclusive finding.

## Proposed prospective replacement

After the currently authorized first block ends, keep all of its observations
as exploratory evidence and leave the three-share layout unkept. Declare the
replacement before any new result; do not reuse these observations to pass it.

- Keep the fixed matched workload, exact revisions, runner class, worker
  policy, every test/outcome/unit/artifact and full queue-inclusive verdict.
- Keep the original requirement of no worse solo and overlapping verdicts;
  introduce no positive regression allowance.
- Use repeated solo B/C pairs and separate B+B/C+C episodes for acceptance.
  Predeclare alternating episode order and compare both chronological launch
  positions as well as each pair's slowest verdict.
- Retain mixed B+C episodes and counterbalanced launch orders as diagnostics.
  Their raw within-pair sign is not an unconditional acceptance veto or a
  substitute for equivalent-load B+B/C+C evidence.
- Require five eligible complete blocks: all five solo C-minus-B differences
  and all five equivalent-load slowest-verdict differences are strictly
  negative; C is no slower at either matched launch position; its worst solo
  and equivalent-load verdict is no worse than B's corresponding worst.
  Inspect all paired distributions and valid slow observations; a sign-test
  probability alone cannot establish exchangeability or causal confidence.
  A known unmatched background exposure cannot
  establish a matched-condition pass; retain it and count its dispatches.
- Bound a new campaign at 48 additional manual runs (six complete blocks),
  with at most two owned runs active. This permits at most one unusable block
  while seeking five eligible ones. Missing/confounded evidence at that
  ceiling remains inconclusive and unkept; do not renew the cap automatically.
- Never cancel or reserve another execution's work. Inspect visible load before
  episodes, sequence by observed completion, and retain visibility limits.

The existing campaign's dispatches and operational pushes remain additional
cost. Approval changes the prospective evaluation procedure and budget; it
does not approve the candidate, waive failed checks, or complete SEED-350.
The remaining Distribution and whole-workflow search stays required.
