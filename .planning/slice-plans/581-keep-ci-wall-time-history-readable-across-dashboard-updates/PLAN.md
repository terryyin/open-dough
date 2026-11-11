# Keep CI wall time history readable across dashboard updates

**Identity:** SEED-305#keep-ci-wall-time-history-readable-across-dashboard-updates
**Source:** [Refined story](../../seeds/SEED-305-ci-wall-time-history-across-dashboard-updates.md#keep-ci-wall-time-history-readable-across-dashboard-updates)
**Preparation:** owned workspace
`/Users/terryyin/git/open-dough/.worktrees/keep-ci-wall-time-history-readable-across-dashbo`,
branch `cursor/keep-ci-wall-time-history-readable-across-dashbo`, starting
revision `865681bc9b0d3e5bf4b17bfa79226800c6bc59d5`. This plan authorizes no
execution.

## Goal and scope

A developer who leaves Project Intent's CI status open across an Open Dough
dashboard deployment can still read collected CI wall time history after the
deployment introduces a new final gap reason such as `timing-basis`. Measured
builds stay visible; gaps stay understandable for the prior deployed frontend
that can still be open; a newly loaded frontend can show the specific new
reason; and regression coverage pins the previous reader against the updated
server.

Out of scope: requiring a reload as the fix; a general dashboard API
versioning framework; changing which landings are collected or measured;
compatibility with every historical Open Dough revision beyond that prior
deployed reader; remote CI adapters and non-dashboard clients.

## Architecture and reuse

PFE: the responsibility is “project `intent=ci-history` so an already-loaded
Open Dough frontend keeps reading measured history when the server gains a
new final gap reason, while a current frontend can still name that reason.”

Existing owners:

- Server projection:
  [`dashboard/server/landedCiHistoryEntries.ts`](../../../dashboard/server/landedCiHistoryEntries.ts)
  (`historyEntries` / `gapOf`)
- Read assembly:
  [`dashboard/server/intentCiHistoryRead.ts`](../../../dashboard/server/intentCiHistoryRead.ts)
- Frontend read and schema:
  [`dashboard/src/authenticatedIntentCiHistoryRead.ts`](../../../dashboard/src/authenticatedIntentCiHistoryRead.ts)
  and
  [`dashboard/src/landedCiHistory.ts`](../../../dashboard/src/landedCiHistory.ts)

Reuse and change that local history boundary. There is no existing gap-reason
vocabulary negotiation; `parseIntentCiHistoryRead` allows only `source` and
`intent` on the unscoped history read. Content negotiation elsewhere
(`Accept-Encoding` on launch answers) is a different concern and is not the
home for this contract. Do not add a second history API or a parallel schema.

Selected solution: keep one history response. By default, project final gap
reasons newer than the prior deployed reader into that reader's vocabulary
(`timing-basis` → `not-recorded`, which that reader already accepts and
labels “CI wall time not recorded”). Let the current frontend opt into the
expanded vocabulary so it can show the specific reason. Pin the previous
reader against the default answer in automated coverage.

No consequential product architecture choice beyond that local response
contract. No new North Star topic. Accepted ADRs are not implicated beyond
ordinary dashboard-boundary ownership already in ADR 0008.

Common rule: one response vocabulary per request; default is the prior
compatible set; newer reasons appear only when the current reader asks for
them.

## Outside-in proof ownership

| Final promise | Owning slice and observable proof |
| --- | --- |
| Prior open frontend still shows measured builds and an understandable gap when the server would emit `timing-basis` | 1: focused backend/history proof — default `intent=ci-history` answer is accepted by the previous frontend reader schema; measured points remain; each timing-basis landing appears as a prior-vocabulary gap (`not-recorded`) |
| Newly loaded frontend can show the specific `timing-basis` reason | 1: same boundary with the opt-in signal — answer includes `timing-basis`; current reader and gap words show the specific reason; existing timing-basis assertions move to the opt-in path |
| Regression fails closed if a later new reason again blanks the whole response | 1: pinned previous-reader check against the default updated-server answer |

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Prior final-gap schema (without `timing-basis`) rejects a gap with `reason: "timing-basis"` and rejects a whole history that includes one | Slice 1 default projection / previous-reader proof | Ran Zod parse of that prior reason enum against a timing-basis gap and a history containing a measured point plus that gap in this workspace | Settled: `oldRejectsTimingBasis: true`, `oldRejectsWholeHistoryWithTimingBasis: true` |
| The same prior schema accepts that history when the gap is projected to `not-recorded` | Slice 1 compatible default mapping | Same observation with `reason: "not-recorded"` | Settled: `oldAcceptsNotRecorded: true`, `oldAcceptsWholeHistoryWithNotRecorded: true` |
| Prior deployed gap words already label `not-recorded` as “CI wall time not recorded” | Slice 1 “understandable gap” for the open tab | `git show 49367c2e4:dashboard/src/ciHistoryGapWords.ts` | Settled: `not-recorded` → `CI wall time not recorded` |
| Current unscoped `intent=ci-history` parse refuses any query key other than `source` and `intent` | Slice 1 opt-in signal placement | Read `parseIntentCiHistoryRead` in `dashboard/server/intentCiHistoryRead.ts` | Settled: allowlist must gain an explicit opt-in parameter (or an equivalent request signal the read path already inspects); unknown keys refuse today |
| Current frontend history fetch sends only the query string and no capability header | Slice 1 how the new reader opts in | Read `authenticatedGet` in `dashboard/src/authenticatedGet.ts` | Settled: opt-in must be added to the history request the current reader makes |
| Focused timing-basis proofs currently expect `timing-basis` on the default history answer | Slice 1 consumer update | Read `dashboard/backend-tests/intent/landed-ci-attempt-start.spec.ts` | Settled: those assertions move to the opt-in answer; default answer must not keep emitting `timing-basis` |

## Ordered slices

### 1. Compatible default history with opt-in for new gap reasons
Type: Behavior  
Status: planned  
Proof: Focused backend/history checks at the local `intent=ci-history` boundary: (a) default answer with retained timing-basis landings is accepted by the previous frontend reader schema, keeps measured points, and projects those gaps to `not-recorded`; (b) the current frontend's opt-in request returns `timing-basis` and the current reader/words show the specific reason; (c) existing timing-basis collection proofs are updated to the opt-in path and still discriminate. Neighboring landed-CI history specs that assert default response shape stay green. On macOS start long runs fully awake; on AC use `caffeinate -s -i`.

Behavior: Collected history that would project `timing-basis` gaps → an already-loaded prior frontend reads the default `intent=ci-history` answer and a newly loaded current frontend reads with its opt-in → the prior reader still shows measured builds and an understandable gap instead of a response-shape error; the current reader can show the specific timing-basis reason; regression coverage pins that previous reader against the default updated-server answer.

## Current decisions

- Compatibility substitute for `timing-basis` on the default answer is
  `not-recorded` (prior vocabulary; understandable “CI wall time not
  recorded” on the open tab).
- Prefer an explicit allowed query parameter on the existing history read for
  opt-in over a new header or a second endpoint, so the signal stays on the
  same local authenticated-read contract.
- Do not invent a general versioning framework; only negotiate final gap
  reasons this story introduces for the prior-vs-current reader pair.

## Learnings

None yet.

## Plan concern assessment

Slice-plan refinement was not needed: one Behavior owns one proof loop at the
existing history boundary, with no independent second outcome, no preparatory
Structure beyond that Behavior, and no unresolved sizing concern. No remaining
slice-specific concerns.

## Execution notes

- Local gates: focused backend/history specs for the default and opt-in
  answers, plus affected neighbors that assert landed CI history shape
  (including `landed-ci-attempt-start` and related history collection/gap
  specs). Use the combined local gate only when a change reaches shared
  harnesses those suites share. Start long macOS runs fully awake and on AC
  use `caffeinate -s -i`. On battery plug in or keep the lid open under
  `caffeinate -i` and inspect sleep logs. Follow
  [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
- Carry the
  [failing and flaky tests policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written into every delegation and repair handoff. Arrange domain data
  through shared MakeMe. Never sleep for wall-clock time; wait on observable
  events. Keep the default test timeout.
