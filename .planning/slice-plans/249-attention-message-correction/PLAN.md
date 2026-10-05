# Correct the attention message story's wording and proof

**Identity:** SEED-103#attention-message-correction
**Source:** [correction story](../../seeds/SEED-103-attention-message-on-story-card.md#attention-message-correction),
a bounded retrospective correction of
SEED-103#attention-message-on-story-card (`d60da8d0:.planning/seeds/SEED-103-attention-message-on-story-card.md#attention-message-on-story-card`, plan
`d60da8d0:.planning/slice-plans/248-attention-message-on-story-card/PLAN.md`), reviewed
commits `0b3d3c78`, `fa0a60f5`, and `58ea4c37` on base `e8a1ef8a`.
**Prepared:** 2026-10-05. Planning only, in the story's execution worktree.

## Goal and boundaries

The dashboard's tests and documents say what the attention message story
delivered, and its one product rule left untested gains its proof: Mark as
done is offered beside a message, not after reading it; the side panel's
final report is observed as Codex's native final report alone; a developer's
expansion choice ends at a newer report; and a host without a native reader
is refused once, at admission.

Preserved: everything SEED-103's story delivered, as its key examples and
rejection constraint state. No product behavior changes; slice 2 moves a
refusal without changing what any request receives.

Material exclusions:

- Whether Recent sessions entries offer Mark as done for reported sessions
  whose conversation is unavailable. It awaits Terry's decision and is not
  planned here.

## Current findings

1. **Swap wording.** `dashboard/tests/agent-completion-cursor.spec.ts:93`
   says “Read, the session stays open on its card, now offering Mark as
   done”, and checks Mark as done only after the read.
   `dashboard/AGENT-LAUNCH-TERMINALS.md:140` says “**Mark as done** then
   closes a reported session”. Both place Mark as done after the read,
   contrary to the story's “neither control takes the other's place”.
2. **Fixture conflation.** `dashboard/tests/support/storyPanels.ts`:
   `storyBLaunchRecord` (Claude) holds a completion whose message is
   `storyBReport`, “Story B's final report…”, under the comment “its session
   ended with a final report”; `storyBRetiredCodexRecord` inherits it and
   keeps the same text as Codex's native final report. The attention message
   and the native final report share one text, so
   `story-panel-replacement.spec.ts:121` cannot tell which the panel shows,
   blurring the two terms
   [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) keeps
   apart.
3. **Untested rule.** `dashboard/src/SessionAttentionMessage.tsx:41-42` keeps
   the developer's expansion choice only for the receipt it was made on;
   `dashboard/AGENT-LAUNCH-COMPLETION.md` says the choice lasts for that
   report. No test expands a read message before a newer report arrives.
4. **Duplicate refusal.** `dashboard/server/sessionAdmission.ts:134` refuses
   a host without `readResult`; `dashboard/server/sessionResultResponse.ts:15-16`
   repeats the same refusal, reachable only to narrow the type. No test sends
   a reported Claude record's result request.

## Direction

[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) applies:
“attention message” and “final report” keep their own meanings in fixtures
and comments. No North Star topic governs the work.

- **Story B carries no message.** `storyBLaunchRecord` loses its
  `completion`, so neither Story B record holds an attention message and
  `storyBReport` is only Codex's native final report; the comments say so.
  Neither panel spec uses Story B's message, its unread state, or its Mark as
  done.
- **One refusal.** Admission resolves the host's native reader once and
  admits the result request with it (`{ kind: "result", record, read }`, the
  reader typed non-optional); `sessionResultResponse` calls that reader and
  drops its own refusal and host lookup. This follows the boundary's existing
  pattern of admitting a request with the host it needs (`request.host` in
  `launchBoundaryAnswer.ts`).

## Premises and observations

| Premise consumed by the plan | Literal observation and result |
| --- | --- |
| The swap wording exists only at the two named places (slice 1) | `grep -rnI -i -e "now offer" -e "then closes" -e "offering Mark as done" dashboard/src dashboard/server dashboard/tests dashboard/*.md docs` → the two findings, plus `agent-completion-attention.spec.ts:196`, whose “then” sequences the panel's own Mark as done after its guard that the panel gains no control; it does not imply a swap and stays. |
| The Cursor card offers Mark as done before the read, so the spec can assert it (slice 1) | Read `MarkDone` in `src/sessionRecordActions.tsx` and `marksRecordDone` in `src/sessionCapabilities.ts`: offered when `record.completion` is defined, read or not; `SessionEntry.tsx:124` renders it on the card. |
| A Codex record whose workspace is gone offers Read final report without a completion (slice 1) | Read `sessionAccess` in `src/sessionAccess.ts`: `"result"` for a Codex record whose workspace state is not available; completion is not consulted. `LaunchSession.tsx:69` names it Read final report. |
| No Story B consumer relies on its completion (slice 1) | `grep -rn "storyBLaunchRecord\|storyBRetiredCodexRecord\|storyBReport" dashboard/tests` → `story-panel-switching.spec.ts` (only Review changes of card B) and `story-panel-replacement.spec.ts` (Read final report and the panel's text); `grep -n "Mark as\|message\|unread"` in the replacement spec → nothing. |
| Expanding a read message, then marking a newer report read, collapses only because of the receipt check (slice 1) | Read `SessionAttentionMessage.tsx:37-42`: expanded = unread, or the choice's receipt is this report's and it chose expanded. After the newer report's Mark as read, `unread` is false and the choice names the older receipt, so the part collapses; without the receipt check it would stay expanded. The journey's step after 6 already reports a newer message on the same session (`storyA.report({ outcome: "unfinished", message: newerMessage })`), no new launch. |
| Admission already refuses a host without a native reader before the response runs (slice 2) | Read `resultRequest` in `server/sessionAdmission.ts:123-137` and the `"result"` case in `server/launchBoundaryAnswer.ts:121-122`: the response is reached only with an admitted request. `grep -rn "sessionResultResponse\|resultRequest\|readResult" dashboard/server dashboard/src dashboard/tests` → callers are `launchBoundaryAnswer.ts`, `agentLaunchAdmission.ts` (endpoint map and `Admitted` union, line 74), `codexHost.ts`, `hosts/codex/result.ts`, and `session-result-codex.spec.ts` (reads `launchHost(...).readResult` directly, unaffected). |
| The admission spec can keep a Claude record beside the Codex one (slice 2) | Read `tests/support/retainedReport.ts`: `retained` launches and stores the Codex record, `save(home, records)` rewrites the project's records; `keptSession` (`server/launchRecordStore.ts:45`) finds a record by host and session ID alone. |
| The named specs run green locally today (all slices) | `unset NODE_ENV; npx playwright test --config dashboard/playwright.config.ts --reporter=list agent-completion-cursor story-panel session-unread-report session-result-admission` → 10 passed (12.1s). |

## Outside-in proof

Proof is the Playwright journeys in `dashboard/tests/` named below, through
the real launch boundary, reporting command, store, and page. Each slice runs
`npm run typecheck:dashboard`, because the journeys do not type-check
unvisited code, and `npm run lint`, which refuses imports left unused by the
moves. Hosted CI runs the whole suite after publication.

| Finding | Slice | Observation |
| --- | --- | --- |
| 1. Mark as done beside the message, before and after the read | 1 | `agent-completion-cursor.spec.ts`; read `AGENT-LAUNCH-TERMINALS.md` against the story |
| 2. The panel shows the native final report alone | 1 | `story-panel-replacement.spec.ts`, `story-panel-switching.spec.ts` |
| 3. An expansion choice ends at a newer report | 1 | `session-unread-report.spec.ts` |
| 4. A host without a native reader is refused, once | 2 | `session-result-admission.spec.ts`; `grep -rn "cannot read a final report" dashboard/server` finds one place |

## Ordered slices

### 1. Say and prove what the attention message story delivered
Type: Structure
Status: planned
Proof: `unset NODE_ENV; npx playwright test --config
dashboard/playwright.config.ts --reporter=list agent-completion-cursor
story-panel session-unread-report` passes, with: (a) in
`agent-completion-cursor.spec.ts`, Mark as done visible on the card while the
message is unread, before Mark as read, and still visible after it; (b) in
`session-unread-report.spec.ts`, the read message A expanded from its heading
before the newer report arrives, and, after the newer report's Mark as read,
the part collapsed; (c) `story-panel-replacement.spec.ts` green with Story B
holding no completion, so the panel's `storyBReport` can only be Codex's
native final report. A deliberate check: with the receipt comparison removed
from `SessionAttentionMessage.tsx`, (b) fails; restore it.
`npm run typecheck:dashboard` and `npm run lint` pass.

- `agent-completion-cursor.spec.ts`: assert the card's Mark as done before
  `part.markRead.click()`, and replace the comment at line 93 with wording
  that the read leaves the session open on its card with its Mark as done.
- `AGENT-LAUNCH-TERMINALS.md` (“Explicit reports, Mark as read and Mark as
  done”): replace “**Mark as done** then closes a reported session as above”
  with Mark as done as the entry's own control, offered beside the message,
  read or not, which closes a reported session as above.
- `support/storyPanels.ts`: remove `completion` from `storyBLaunchRecord`;
  rewrite its comment and the file header so Story B's Claude record is a
  kept session and the Codex record's final report is Codex's own; keep
  `storyBReport`'s comment to the native final report. Adjust the
  `story-panel-replacement.spec.ts` header only where it says otherwise.
- `session-unread-report.spec.ts`: in the step after 6, before
  `storyA.report(...)`, activate `messageA.heading` and expect it expanded
  with `reportedMessage`; after the newer report's `markRead`, the existing
  `expectCollapsed` observes the end of the choice. Say so in the step's
  comment.

### 2. Refuse a result request without a native reader once, at admission
Type: Structure
Status: planned
Proof: `unset NODE_ENV; npx playwright test --config
dashboard/playwright.config.ts --reporter=list session-result session-unread-report
story-panel agent-completion-attention` passes, with a new case in
`session-result-admission.spec.ts`: a kept Claude record holding a
completion with an attention message, saved beside the retained Codex
record, is asked for its result by its host and session; the answer is 400
“This host cannot read a final report.”, its body holds no message text, and
the native fixture records no `thread/read` for it. Written before the move,
the case passes against the current admission and stays green after.
`npm run typecheck:dashboard` and `npm run lint` pass;
`grep -rn "cannot read a final report" dashboard/server` finds
`sessionAdmission.ts` only.

- `resultRequest` returns the host's reader with the record, typed as
  non-optional; update the `"result"` member of `Admitted` in
  `agentLaunchAdmission.ts`.
- `sessionResultResponse` takes the admitted request and calls its reader;
  remove its refusal and the imports it leaves unused.

## Current decisions

- Story B holds no attention message, rather than a second distinct text:
  neither panel spec uses one, and an absent message cannot be mistaken for
  the native final report.
- The admission spec's Claude case passing before the move is expected: it is
  the guard that the move keeps the refusal, not a reproduction of a defect.
- Both slices are Structure: they change tests, fixtures, documents, and one
  refusal's place, and no observable product behavior.
