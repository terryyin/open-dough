# Show an unreadable preparation continuation

**Identity:** SEED-292#show-an-unreadable-preparation-continuation

**Source:** [Refined story](../../seeds/SEED-292-report-launch-failure-causes.md#show-an-unreadable-preparation-continuation)

## Goal and scope

A developer whose retained preparation cannot continue because
`preparation-assignment.mjs continue` failed without a readable JSON result
sees that command's own failure text on the Intent Taken card. Required
restriction: every failed continuation keeps the existing safety wording — the
start was kept, and assignment ownership remains unverified — so an unreadable
failure is never permission to announce again. A structured stop already keeps
its `error` as the detail inside the same refusal shape.

Out of scope: changing when a continuation may announce; releasing a lost
workspace; the Cursor runner story; inventing failure text when the command
produced none.

## Direction and existing solutions

PFE: the refusal shape already belongs to `continuationRefusal` in
`preparationResult.ts`. The continuing branch in `preparationStart.ts` chooses
the detail string, then wraps it. `runPreparationCommand` /
`readPreparationResult` classify stdout; `runStartCommand` owns the subprocess
stdio. The installed CLI catch in `preparation-assignment.mjs` prints a thrown
message only to stderr and exits 2 with empty stdout.

Observed at preparation (this checkout):

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Thrown continue failure prints message on stderr, empty stdout, exit 2 | CLI catch shape used by `preparation-assignment.mjs` | Spawned the catch body (`stderr.write(error.message)`, `exitCode = 2`) | `status` 2, `stdout` `""`, `stderr` `"ownership probe exploded\n"` |
| `runStartCommand` discards that stderr | `runStartCommand` stdio `["ignore","pipe","ignore"]` | Same catch body spawned with that stdio | `stdout` `""`, `stderr` null — Intent never sees the printed message |
| Unreadable continue detail is the generic sentence | `preparationStart` continuing ternary | Evaluated the live detail selection | `{ kind: "unreadable" }` → `"The installed command could not verify continuation."`; stopped+error keeps that error |
| Safety wrapper already carries detail | `continuationRefusal` | Called with a boom detail | Explanation includes boom text and "assignment ownership remains unverified" |

Reuse `continuationRefusal` and the structured-stop detail path unchanged.
Change the preparation command result path so an unreadable continue can carry
the command's printed failure text when present, and the continuing branch uses
that text as detail instead of the generic sentence. Prefer extending the
existing `runStartCommand` / `PreparationResult` transport over a second
refusal writer. Do not invent failure text when nothing was printed; keep the
generic sentence only as that empty-text fallback. Execution start shares
`runStartCommand` but is out of scope for messaging changes: preserve its
current stdout-only contract unless a shared return shape must widen, and keep
execution refusal wording unchanged.

No consequential architectural choice. Follow
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
Taken / launch attempt wording as local product language. No North Star topic,
ADR conflict, or new ADR.

Expected edit seams at preparation revision: `startLaunch.ts` (`runStartCommand`)
228 lines, `preparationCommand.ts` 117, `preparationResult.ts` 180,
`preparationStart.ts` 246, CLI `preparation-assignment.mjs` 88. None above 250.
Keep refusal wording in `continuationRefusal`; do not grow a parallel explanation
builder.

## Outside-in proof ownership

Every promise belongs to slice 1. Existing tests locate fixtures and preserved
boundaries; they have not been claimed as new-behavior proof during preparation.

| Promise | Observable proof |
| --- | --- |
| Thrown / printed continue failure appears on the Taken-card refusal | Boundary or backend journey patterned on `backend-tests/launches/agent-launch-preparation-resume.spec.ts`: kept preparation, continue exits without readable JSON while printing a distinctive failure text (stderr or equivalent the product captures). Assert the settled attempt / card explanation contains that text and does **not** use only "The installed command could not verify continuation." as the detail. |
| Safety sentence remains on that refusal | Same observation: explanation still says the start was kept and assignment ownership remains unverified. |
| Structured ownership stop still shows its own error | Preserve/extend the resume path that already asserts "assignment ownership remains unverified" with the structured stop's error as detail (see interrupted precommit case in that file); do not regress it into the generic unreadable sentence. |
| Empty printed failure keeps a truthful fallback | When continue is unreadable and produced no failure text, the existing generic detail may remain; do not invent a fake exception. |

Arrange domain data through shared `makeMe.aThing.please()` under
[test data architecture](../../../tests/README.md#test-data-architecture).
Reuse `keptPreparation` / launch boundary helpers; state the distinctive failure
text at the call site. Actions, exact malformed inputs, and independent
expectations stay outside builders.

Consumer trace for a widened `runStartCommand` return: `preparationCommand.ts`
and `executionStart.ts`. Inspect their actual assertions after the shape change;
preserve execution start's current unreadable/refusal behavior. Unit readers in
`preparation-start-result.spec.ts` own `readPreparationResult` /
`continuationRefusal` contract updates when the unreadable kind gains optional
failure text.

## Slice

### 1. Show the continue command's printed failure on an unreadable continuation

Type: Behavior
Status: planned
Proof: all rows of the outside-in table; focused unit coverage for unreadable
result carrying failure text and `continuationRefusal` wrapping it; preserve
structured-stop and empty-text fallback.

Behavior: Given a kept preparation start, when Intent continues and
`preparation-assignment.mjs continue` exits without readable JSON after printing
a failure, the Taken-card refusal detail names that printed failure and still
states the start was kept with ownership unverified. A structured stop keeps its
own error as detail. An unreadable result with no printed failure may keep the
generic detail.

## Local verification

Local gate: focused new/extended preparation continuation proof above;
`backend-tests/launches/preparation-start-result.spec.ts` when the result
contract changes; affected `executionStart` consumers only if `runStartCommand`'s
shared return shape widens; `npm run typecheck:dashboard`; applicable
lint/format hooks. No full repository or full dashboard suite is a routine local
gate for this bounded change; every published CI failure remains owned.

Starting command shapes (add the concrete new/extended specs as the slice
becomes concrete):

```sh
PATH="/opt/homebrew/bin:$PATH" caffeinate -i npm run test:dashboard -- backend-tests/launches/agent-launch-preparation-resume.spec.ts backend-tests/launches/preparation-start-result.spec.ts --workers=1
npm run typecheck:dashboard
```

Local sleep guard: start fully awake; on AC prefer `caffeinate -s -i` (requires
AC power). On battery, plug in or use `caffeinate -i` with lid open and inspect
the sleep log, per
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).

[The project's failing and flaky test policy applies as written](../../../AGENTS.md#failing-and-flaky-tests)
to every slice, delegation and repair, including base failures, published CI,
other active repair ownership and human exceptions. Never rerun until green as a
fix. Never sleep, use `test.slow()`, or override suite/file/group/hook timeouts;
any essential override belongs inside the individual test.

## Concern review and current decisions

One Behavior slice owns the unreadable-continue failure text and the preserved
structured-stop / safety boundaries. No numeric slice target or hard limit is
supplied; boundedness is that one proof loop. No Structure slice: existing
refusal and result owners already hold the responsibility. No interim behavior,
early probe, or pre-Take human decision.

Slice-plan refinement was not needed: boundaries, cumulative design, sizing, and
proof ownership are settled in this single slice with reused owners and settled
premises. Planning review found no remaining concern.

Record readiness through the installed backlog recorder after reviewing this
plan and source. Readiness does not authorize Take or execution.
