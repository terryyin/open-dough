# An unconfirmed stop still blocks a replacement after local Done

**Identity:** SEED-052#cursor-unconfirmed-stop-after-local-done
**Source:** [Correction story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#cursor-unconfirmed-stop-after-local-done), a bounded retrospective correction of SEED-052#safe-cursor-session-stop (plan 327; attributable commits `f121d999`, `81eb33fb`, `fa05f9ec`, `f5c59fad`, `07f0c521`, `45d548d3` on published claim `474a9347`).

## Goal and scope

A developer who marked a still-working Cursor session done locally and then
pressed Stop without confirmation still gets the story's core protection: no
replacement writer starts in that workspace until the stop is confirmed or
they explicitly override with the competing-writer risk shown. The open
terminal panel offers the local Mark as done on the same capability facts as
the session entry.

Included: the replacement-writer block keys on the retained unconfirmed-stop
explanation, not on the absence of a done mark; the terminal panel's Mark as
done uses the same host facts as the entry.

Excluded: any native Cursor verification (SIGHUP termination of a native
in-flight turn remains unproven under ADR 0005 and pending in plan 327 and
ODF-204/ODF-229); changes to Claude/Codex stop, rename, or Done behavior;
changes to what local Done claims.

## Current findings (evidence)

- `dashboard/server/launchPreAcceptance.ts` (`replacementWriterBlock`)
  requires `record.doneAt === undefined`, so a record carrying
  `stopUnconfirmed` after a local Done is silently skipped — while
  `dashboard/src/sessionRecordActions.tsx` deliberately keeps Stop offered
  on a locally done Cursor entry and `dashboard/server/sessionStop.ts`
  retains the unconfirmed explanation on that done record. The combined
  sequence in plan 327's key examples 2 + 4 therefore admits a competing
  writer with no block and no risk wording, contradicting the seed's
  rejection constraint that an unconfirmed stop must not silently admit one.
  Neither plan 327 journey covers the combination.
- `dashboard/src/TerminalPanel.tsx` gates its Mark-as-done icon on
  `marksDone` (the native `doneStop` fact), so a Cursor session's local
  Mark as done is unavailable inside its open terminal panel (named gap in
  plan 327 slice 3 learnings), while the entry offers it through
  `marksRecordDone`/`marksLocalDone`.
- Plan 327 slice 2 learnings name a second uncovered branch: a stop the
  runner holds past the confirmation deadline (still held) shares the
  retained/block path but has no journey of its own; only the
  runner-unreachable journey exists.

Preserved promises: Stop never writes the done mark and Mark as done never
claims native termination; a confirmed stop clears the retained explanation;
local Done wording stays local-only; host behavior is learned from boundary
facts, never a host-name check.

## Outside-in proof ownership

| Promise | Owner | Observable result |
| --- | --- | --- |
| Locally done, still-working Cursor session → Stop unconfirmed → replacement blocked until override | 1 | Fake-Cursor journey shows the retained explanation on the done record, the launch block naming the competing-writer risk, and Start anyway admitting the replacement |
| Still-held stop reads unconfirmed with remaining state named | 1 | Journey where the runner keeps holding the client past confirmation shows the unconfirmed explanation retained |
| Local Mark as done offered in the open terminal panel | 2 | Journey marks the Cursor session done from the terminal panel with local-only wording |
| Claude and Codex unchanged | 1, 2 | Existing Claude/Codex done, stop, and recently-done specs stay green |

Proof boundary: focused dashboard Playwright specs at the real page/server
boundary with the fake Cursor runner, plus `npm run typecheck:dashboard`.
Native Cursor proof is explicitly out of scope (ADR 0005).

## Ordered slices

### 1. Block a replacement writer after an unconfirmed stop on a locally done session
Type: Behavior
Status: not started
Proof: Fake-Cursor journeys show (a) a locally done, still-working Cursor
session whose Stop is unconfirmed (runner unreachable) retains its
explanation and blocks a replacement launch in the same workspace until the
explicit Start anyway override, and (b) a stop the runner still holds past
the confirmation deadline reads unconfirmed with the remaining state named
and the explanation retained. Existing Cursor stop/done and Claude/Codex
done/stop/recently-done specs stay green.

Behavior: The replacement-writer block follows any kept record carrying a
retained unconfirmed-stop explanation for that workspace, whatever its local
done mark says; the host-fact rule (a local Done does not stop the native
session) is applied at the block, not only at the Stop button. No wording
claims termination, and a confirmed stop still clears the retention.

### 2. Offer the local Mark as done in the open terminal panel
Type: Behavior
Status: not started
Proof: A fake-Cursor journey marks an active Cursor session done from its
open terminal panel and lands in Recently done with the local-only wording,
setting only the local mark (no SIGHUP to the held client). Existing
Claude/Codex terminal-panel Done journeys stay green.

Behavior: The terminal panel learns Mark-as-done availability from the same
host capability facts as the session entry (`marksRecordDone`, including the
local-Done fact), so every surface that offers the mark applies the same
rule; hosts whose Done is native keep their current panel behavior.

## Current decisions

- The retained `stopUnconfirmed` explanation is the block's authority; a
  local done mark neither clears it nor implies the session stopped.
- Reuse the existing host-fact seam (`sessionCapabilities.ts`) and the
  existing launch pre-acceptance block; add no Cursor-name branch.
- This correction is planned, not queued or authorized; a separate request
  executes it. Native verification remains pending under plan 327 slice 5's
  named manual actions and is not part of this correction.
