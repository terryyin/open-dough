# Keep dashboard launch history

**Identity:** SEED-358#keep-dashboard-launch-history
**Source:** [selected story](../../seeds/SEED-358-dashboard-launch-history.md#keep-dashboard-launch-history)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Stop deleting dashboard launch records. A record that leaves the operational
records in `~/.open-dough/dashboard/agent-launches.json`, either because it was
marked done more than 30 days ago or because the developer removed its session,
moves into a dashboard-owned launch history. Visible behavior stays the same.
The only visible change is the wording: done sessions are *listed* for 30 days,
not *kept* for 30 days.

Exclusions: no history view, no token usage, no recovery of records pruned
before delivery (the
[reconstruction story](../../seeds/SEED-358-dashboard-launch-history.md#reconstruct-codex-and-claude-code-usage-history)
owns these), and no returned-to-backlog outcome
([its own story](../../seeds/SEED-358-dashboard-launch-history.md#close-launches-returned-to-the-backlog)).
Launch attempts, landing retries, CI history and other dashboard files keep
their own retention. Terry set this boundary on 2026-11-14: change the internal
data structure, stop deleting, and leave external behavior unchanged.

## Design

- **One rule, one place.** Every session record leaves the operational
  document inside `replaceRecords` (`dashboard/server/launchRecordDocument.ts`).
  The retention filter drops records there, and `deleteRecord`
  (`launchRecordDeletion.ts`) removes them through its `change`. Inside the same
  locked replacement, append each session record that leaves to history before
  the document is replaced. Record why it left: `aged-out` when the retention
  filter dropped it, `removed` when `change` dropped it. Binding and update
  writers keep the session key, so they move nothing (see premises).
- **Store.** History is append-only JSON Lines under
  `~/.open-dough/dashboard/launch-history/`, with one file per month in which
  records left (for example `2026-11.jsonl`). Writes append. Nothing on the
  routine read path opens these files. Each entry holds the project id, the
  `LaunchRecord` exactly as stored, `leftAt` and `reason`, validated with zod
  beside `launchRecordSchema`. There is no database
  ([ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)).
- **Exactly once.** A history reader yields one entry per project and session
  key, so an append repeated after a failed document replacement adds no second
  entry. Appending happens before replacement, so a failed append never loses a
  record.
- **History append failure.** For retention, the write keeps the aged-out
  records in the operational document. The read filter still hides them, and a
  later write moves them. The write's own change still applies, so a broken
  history store never blocks launches. For explicit removal, the deletion fails
  like today's unwritable-store case and keeps the record.
- Host-local retirement (`recordsDroppedByRetention`, `notifyRecordRemoved`)
  still runs only after the record has left the document.

## Outside-in proof ownership

| Story promise | Owner and observable proof |
| --- | --- |
| A session done 31 days ago leaves Recently done and its count; history holds it once across a later write and restart | Slice 1: new `dashboard/backend-tests/sessions/launch-history.spec.ts` seeds the store, triggers a launch write, restarts, writes again, and reads the history files |
| A session done 29 days ago stays listed, and history does not hold it | Slice 1: same spec |
| A failed history append keeps the records in the operational document, and a later write moves them once | Slice 1: same spec, with the history path unwritable, then restored |
| Removing a session hides it and retires host-local state as before, and history holds it marked `removed` | Slice 2: same spec through the existing delete route; `agent-launch-delete.spec.ts` stays green |
| A removal that history cannot accept is refused and keeps the record | Slice 2: same spec |
| Wording says done sessions are listed for 30 days | Slice 1: `RecentlyDone.tsx` and `RecentlyDoneSessions.tsx` text, with `tests/sessions/recently-done-sessions-sidebar.spec.ts` updated |

Write the new tests in a new spec rather than extending
`agent-launch-records.spec.ts`, which has 245 lines, or
`agent-launch-delete.spec.ts`, which has 233. The selected MakeMe convention
applies to `dashboard/backend-tests` (`.planning/open-dough.json`). Reuse
`dashboard/tests/machineLaunchRecords.ts` (`daysAgo`) and the store fixtures
those two specs use.

## Decisive premises and observations

| Premise / consuming operation | Form, observed result and remainder |
| --- | --- |
| The focused backend route runs in this worktree | 2026-11-14, at `b0fd5c16f` plus seed edits: `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/launches/agent-launch-records.spec.ts dashboard/backend-tests/sessions/agent-launch-delete.spec.ts dashboard/backend-tests/sessions/agent-launch-retention-scope.spec.ts --reporter=list` passed 12 of 12 after `node scripts/setup-native.mjs npm` and `browser`. That run covers the 31/29-day drop on write, deletion, the unwritable-store refusal and Cursor scope retirement on expiry. |
| Only retention and deletion remove a session key from the document | Read every `replaceRecords(` caller (`completionDelivery`, `launchCreationStore`, `launchLandingReporting`, `launchRecordBinding`, `launchLandingRetained`, `launchRecordDeletion`, `launchLandingRecord`, `launchRecordStore` ×2). `launchRecordBinding` filters and re-adds the same session key. The others map entries in place, or touch creation records, which have no `session`. Slice 1's spec still shows a launch write moving only the aged-out record. Slice 2's spec shows deletion moving only the removed one. Not decisive: if another writer ever drops a key, the rule still preserves that record and only its `removed` label is imprecise. |
| The new assertions discriminate | History does not exist at `b0fd5c16f`, so each new history assertion fails before its slice. The operational assertions in the existing specs pin unchanged behavior. |
| Growth makes a separate store necessary | Local read on 2026-11-14: `agent-launches.json` held 1,333 records from 30 days in 8,403,236 bytes. Every write rewrites it, and every changed read parses it again. |

## Ordered slices

### 1. Aged-out launch records move into launch history
Type: Behavior
Status: done
Proof: `launch-history.spec.ts`: the 31-day, 29-day and failed-append examples
pass. `agent-launch-records.spec.ts`, `agent-launch-retention-scope.spec.ts` and
`recently-done-sessions-sidebar.spec.ts` stay green with the updated wording.

Behavior: the store holds a session marked done 31 days ago and one marked done
29 days ago → a launch writes the record store, the dashboard restarts, and
another write follows → the operational records hold the 29-day session and the
new launch. Reading history yields exactly one `aged-out` entry for the 31-day
session, with its project and unchanged record. With the history directory
unwritable, the same write leaves the 31-day record in the operational
document, still hidden from reads, and the new launch is saved. After the
directory is restored, the next write moves it once.

Includes the history entry schema and reader, the append inside
`replaceRecords`, the "listed for 30 days" wording, and the
[session history doc](../../../dashboard/AGENT-LAUNCH-HISTORY.md) sentence
"done records expire after 30 days". That sentence becomes: they leave the
operational records after 30 days and remain in launch history.

### 2. Removed sessions remain in launch history
Type: Behavior
Status: planned
Proof: `launch-history.spec.ts`: the removal examples pass;
`agent-launch-delete.spec.ts` stays green.

Behavior: a recorded session the host no longer lists → the developer removes
it → the dashboard no longer answers it, host-local retirement runs as before,
and history yields one `removed` entry for it. With history unwritable, the
removal answers the existing failure and keeps the record.

## Verification, sizing and concern review

- Refinement: not needed. The plan has two small Behavior slices over one rule,
  with separate proof loops and a safe stop after slice 1, because retention
  already stops losing records there.
- Remaining slice-specific concerns: none identified.
- Local gate: the focused specs named in each slice through the backend and
  frontend Playwright configs, with `env -u NO_COLOR -u FORCE_COLOR -u
  GIT_ALTERNATE_OBJECT_DIRECTORIES`. No full-suite run is prescribed. Any long
  local run follows the
  [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
  on AC power use `caffeinate -s -i`; on battery plug in, or start fully awake
  with lid open under `caffeinate -i` and inspect the sleep log afterwards.
- Failure policy: follow
  [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests) as
  written. A failing or flaky test is a defect to fix, and reproducing a
  failure on main is attribution, not an exemption.

## Execution context

- Retained published base: `9d1d5b28036faf193d79c9ec35d3c2d3526e457b` on `origin/main`.
- Replanning permission: preserve existing planning authority.

## Learnings

- `recently-done-sessions-sidebar.spec.ts` is owned by
  `dashboard/integrated.playwright.config.ts`, not the frontend config the
  plan's local-gate line named.
- Slice 1 wires `removed` detection in `replaceRecords` for the shared append
  rule; slice 2 still owns removal proof and unwritable-removal refusal.

## Accepted proof (slice 1)

- Backend:
  `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/sessions/launch-history.spec.ts dashboard/backend-tests/launches/agent-launch-records.spec.ts dashboard/backend-tests/sessions/agent-launch-retention-scope.spec.ts --reporter=list`
  (implementation pass 7/7; coordinator reconfirmed `launch-history.spec.ts` 2/2).
- Integrated:
  `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/integrated.playwright.config.ts dashboard/tests/sessions/recently-done-sessions-sidebar.spec.ts --reporter=list`
  (pass 2/2).
- Refactor: none — already clean.


## Story obligations

### G1. No history view
Reported: slice 1 — "Scope limits: no history view"
Story clause: "Scope limits: no history view"
Disposition: excluded "Scope limits: no history view"
Commitment: 12a.1


### G2. No token usage
Reported: slice 1 — "no token usage"
Story clause: "no token usage"
Disposition: excluded "no token usage"
Commitment: 12a.2

### G3. No recovery of already-pruned records
Reported: slice 1 — "and no recovery of records already pruned before delivery; the [reconstruction story](#reconstruct-codex-and-claude-code-usage-history) owns the last two."
Story clause: "and no recovery of records already pruned before delivery; the [reconstruction story](#reconstruct-codex-and-claude-code-usage-history) owns the last two."
Disposition: excluded "and no recovery of records already pruned before delivery; the [reconstruction story](#reconstruct-codex-and-claude-code-usage-history) owns the last two."
Commitment: 12a.3
### G4. Other dashboard files keep their own retention
Reported: slice 1 — "Temporary launch attempts, landing retries, and other dashboard files keep their own retention."
Story clause: "Temporary launch attempts, landing retries, and other dashboard files keep their own retention."
Disposition: excluded "Temporary launch attempts, landing retries, and other dashboard files keep their own retention."
Commitment: 13