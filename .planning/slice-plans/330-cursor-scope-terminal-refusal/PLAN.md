# Show why a scoped Cursor session's terminal open was refused

**Identity:** SEED-052#cursor-scope-terminal-refusal-explanation
**Source:** [Show why a scoped Cursor session's terminal open was refused](../../seeds/SEED-052-start-agent-work-from-dashboard.md#cursor-scope-terminal-refusal-explanation)

## Goal and scope

A developer opening the terminal of a chosen-model Cursor session whose
recorded configuration scope is missing or unreadable sees the scope
refusal explanation on the terminal surface, instead of only the generic
attach failure. Nothing is spawned and the shared Cursor configuration
stays untouched, exactly as today.

Correction input: execution retrospective of
SEED-052#cursor-session-model-scope (plan 329, recoverable at commit `f3b53133f83d57250ccb99a8c4628c12ec25ccac` under `.planning/slice-plans/329-cursor-session-model-scope/PLAN.md`; related commits `230b9018`,
`2d74c7cb`, `36411da4`, `d1b52936`, `7d110ef8`, `08fbe909`). Current
finding: slice 3 of plan 329 promised that a missing or unreadable recorded
scope "refuses the continuation with an explanation" on every continuation
path, and recovery/resume delivers that explanation, but terminal
attach/open delivers only the generic attach text — `attachCursor` throws
the scope explanation (`dashboard/server/hosts/cursor/terminal.ts`),
`nativeAttach` catches every attach error into a host-only failure
(`dashboard/server/nativeAttach.ts`), the socket closes with
`<host> could not be attached.`, and the client maps that close code to
the fixed panel text "The session could not be attached"
(`dashboard/src/TerminalPanel.tsx`), discarding the reason. The delivered
continuation spec encodes the generic text for terminal open
(`dashboard/tests/cursor-session-scope-continuation.spec.ts`, the
missing-scope journey), so the gap is in the delivered surface, not only
in untested code.

Included: carrying this one bounded refusal explanation from the Cursor
attach refusal through the terminal attach failure surface to the panel.
Excluded: changing any other attach failure's wording; changing recovery,
resume, or replacement surfaces (they already show the explanation);
surfacing arbitrary host error text; any fallback to the shared
configuration.

## Current decisions and reuse

- Preserved promises: a recorded scope that cannot be re-established
  refuses the continuation and spawns nothing against the shared
  configuration; Default and pre-scope records keep today's behavior;
  other hosts' attach behavior is unchanged.
- Reuse: the terminal boundary already carries one bounded refusal with
  its explanation to the panel — the workspace-unavailable refusal
  (`refuseWorkspace` / `terminalWorkspaceUnavailableSchema`) — and
  `HostOperationFailure` already bounds a host diagnostic safe to retain.
  Follow that existing refusal-carrying pattern rather than inventing a
  second error channel; shared terminal code gains no Cursor- or
  scope-specific logic.
- Per [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md),
  deterministic fake-Cursor tests prove the dashboard protocol, not
  native Cursor behavior; no native proof is needed for wording carried
  over the dashboard's own socket. No Accepted ADR is contradicted.

## Outside-in proof ownership

| Source promise | Owner | Observable result |
| --- | --- | --- |
| Terminal open of a scoped session whose scope is missing shows why it was refused | 1 | The missing-scope journey's terminal panel shows the scope refusal explanation ("missing or cannot be read" / "not continued with your shared Cursor configuration"), still with no attach or runner call spawned and the fake shared configuration byte-unchanged |
| Other attach failures keep today's generic surface | 1 | Existing terminal attach specs stay green, including the generic "The session could not be attached" cases for non-scope failures |

Proof: extend the missing-scope journey in
`dashboard/tests/cursor-session-scope-continuation.spec.ts` at the real
page/server boundary, plus `npm run typecheck:dashboard`. Whole-suite
dashboard runs stay CI's.

## Decisive premises and preparation observations

Settled by tracing the refusal from throw to panel in this checkout
(2026-10-20): `attachCursor` already throws the full scope explanation;
`nativeAttach`'s catch is the point where it is reduced to a host name;
the client currently ignores the socket close reason and renders fixed
text for the attach-failed code; and the workspace-unavailable refusal
proves this boundary can carry a bounded explanation to the same panel.
No premise is left open.

## Ordered slices

### 1. Carry the scope refusal explanation to the terminal panel
Type: Behavior
Status: done
Proof: The missing-scope journey in
`cursor-session-scope-continuation.spec.ts` shows the terminal panel
presenting the scope refusal explanation while spawning nothing and
leaving the fake shared configuration unchanged; existing generic
attach-failure specs stay green; `npm run typecheck:dashboard` passes.

Behavior: Given a Cursor session record whose recorded configuration
scope is missing or unreadable, when the developer opens its terminal,
the panel states that the session's saved Cursor configuration is
missing or cannot be read, that the session was not continued with the
shared Cursor configuration, and that nothing was started. Given any
other attach failure, the panel keeps today's generic text.

## Current decisions

- Only the recorded-scope refusal gains a carried explanation; the
  generic attach failure remains the surface for every other failure.
- The explanation text is the one recovery already shows; no second
  wording is introduced.
- Accepted proof: the missing-scope journey in
  `dashboard/tests/cursor-session-scope-continuation.spec.ts` (panel shows
  the scope refusal incl. "Nothing was started.", generic text absent, no
  attach/runner calls, shared config unchanged) plus the generic
  attach-failure specs `session-workspace-retirement-attach.spec.ts` and
  `agent-terminal-done-codex-page.spec.ts` passed via
  `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts <those specs>`
  (unset both color vars or the quiet reporter fails on Node warnings);
  `npm run typecheck:dashboard` passed. Carrying uses the generic bounded
  `HostOperationFailure`/`terminalAttachRefusalSchema` (4002) pattern; no
  Cursor/scope logic in shared terminal code.
