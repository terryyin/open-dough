# Correct the attention message story's wording and proof

**Identity:** SEED-103#attention-message-correction
**Source:** [correction story](../../seeds/SEED-103-attention-message-on-story-card.md#attention-message-correction),
a bounded retrospective correction of
SEED-103#attention-message-on-story-card (`d60da8d0:.planning/seeds/SEED-103-attention-message-on-story-card.md#attention-message-on-story-card`, plan
`d60da8d0:.planning/slice-plans/248-attention-message-on-story-card/PLAN.md`), reviewed
commits `0b3d3c78`, `fa0a60f5`, and `58ea4c37` on base `e8a1ef8a`.
**Prepared:** 2026-10-05. Planning only, in the established preparation
worktree on `codex/correct-the-attention-message-story-s-wording-an`, based on
`8c8b41f9`. Reuses the published Preparing assignment for `chaifeng-chan`.

## Goal and boundaries

The dashboard's tests and documents say what the attention message story
delivered, and its one product rule left untested gains its proof: Mark as
done is offered beside a message, not after reading it; the side panel's
final report is observed as Codex's native final report alone; a developer's
expansion choice ends at a newer report; and a host without a native reader
is refused once, at admission.

Preserved: everything SEED-103's story delivered, as its key examples and
rejection constraint state. No product behavior changes; slice 4 moves a
refusal without changing what any request receives.

Material exclusions:

- Whether Recent sessions entries offer Mark as done for reported sessions
  whose conversation is unavailable. It awaits Terry's decision and is not
  planned here.

## Current findings

1. **Swap wording.** `dashboard/tests/agent-completion-cursor.spec.ts`
   says “Read, the session stays open on its card, now offering Mark as
   done”, and checks Mark as done only after the read.
   The reviewed `dashboard/AGENT-LAUNCH-TERMINALS.md` also said “**Mark as
   done** then closes a reported session”. Both placed Mark as done after
   the read, contrary to the story's “neither control takes the other's
   place”. At this refinement's base `8c8b41f9`, the document already says
   “its own control beside it” and “read or not”; preserve and verify that
   correction rather than reapplying it. The Cursor spec still needs its
   before-read assertion and wording correction.
2. **Fixture conflation.** `dashboard/tests/support/storyPanels.ts`:
   `storyBLaunchRecord` (Claude) holds a completion whose message is
   `storyBReport`, “Story B's final report…”, under the comment “its session
   ended with a final report”; `storyBRetiredCodexRecord` inherits it and
   keeps the same text as Codex's native final report. The attention message
   and the native final report share one text, so
   `story-panel-replacement.spec.ts:121` cannot tell which the panel shows,
   blurring the distinction in the
   [completion contract](../../../dashboard/AGENT-LAUNCH-COMPLETION.md).
3. **Untested rule.** `dashboard/src/SessionAttentionMessage.tsx:41-42` keeps
   the developer's expansion choice only for the receipt it was made on;
   `dashboard/AGENT-LAUNCH-COMPLETION.md` says the choice lasts for that
   report. No test expands a read message before a newer report arrives.
4. **Duplicate refusal.** `dashboard/server/sessionAdmission.ts:134` refuses
   a host without `readResult`; `dashboard/server/sessionResultResponse.ts:15-16`
   repeats the same refusal, reachable only to narrow the type. No test sends
   a reported Claude record's result request.

## Direction

[ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
guides consistent vocabulary. The attention message and native final report
distinction comes from the completion contract above; preserve it in fixtures
and comments. No new architectural decision or North Star topic governs the
work. The existing [Dashboard North Star](../../../docs/dashboard-ux-ui-north-star.md#meaning-and-terminology)
routes session behavior to its maintained launch contracts; this correction
follows those contracts without changing that direction. No new topic is
needed.

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

### Existing solutions (PFE)

The result responsibility already belongs to `resultRequest`: it resolves the
record's host and rejects an absent `readResult`. Product-wide search
`rg -n 'sessionResultResponse|resultRequest|readResult' dashboard src tests`
finds one result-response caller, in `launchBoundaryAnswer.ts`, the admission
map in `agentLaunchAdmission.ts`, and Codex's sole native reader. The
`host-options` admission/answer pair already carries its resolved host, and
review responses already consume admitted request objects. Change this existing
result admission to carry its verified reader; keep the host's native reader
and `withResponseSignal` lifecycle unchanged. A second host lookup, refusal,
reader abstraction, or runtime registration mechanism adds no value here.
This follows [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)'s
one representation per conceptual solution.

Reuse `messagePartOf`, `expectExpanded`, and `expectCollapsed` for the existing
message journey, `keepFinalReport` for Codex's native-history fixture, and
`retained`/`save` for the admission journey. Story B's two consumers only use
review or native final report; removing its unused completion is simpler than
maintaining another attention-message fixture. No production message logic or
new test-support abstraction is needed.

## Premises and observations

| Premise consumed by the plan | Literal observation and result |
| --- | --- |
| The swap wording still needs correction in the Cursor spec (slice 1) | Original observation: `grep -rnI -i -e "now offer" -e "then closes" -e "offering Mark as done" dashboard/src dashboard/server dashboard/tests dashboard/*.md docs` → the two findings, plus a legitimate panel sequence in `agent-completion-attention.spec.ts`. Refinement at `8c8b41f9`: read the Cursor spec and the terminal document's “Explicit reports, Mark as read and Mark as done” section → the spec still says “now offering”; the document already states “its own control beside it” and “read or not”. The document needs verification only. |
| The Cursor card offers Mark as done before the read, so the spec can assert it (slice 1) | Read `MarkDone` in `src/sessionRecordActions.tsx` and `marksRecordDone` in `src/sessionCapabilities.ts`: offered when `record.completion` is defined, read or not; `SessionEntry.tsx:124` renders it on the card. |
| A Codex record whose workspace is gone offers Read final report without a completion (slice 2) | Read `sessionAccess` in `src/sessionAccess.ts`: `"result"` for a Codex record whose workspace state is not available; completion is not consulted. `LaunchSession.tsx:69` names it Read final report. |
| No Story B consumer relies on its completion (slice 2) | `grep -rn "storyBLaunchRecord\|storyBRetiredCodexRecord\|storyBReport" dashboard/tests` → `story-panel-switching.spec.ts` (only Review changes of card B) and `story-panel-replacement.spec.ts` (Read final report and the panel's text); `grep -n "Mark as\|message\|unread"` in the replacement spec → nothing. |
| Expanding a read message, then marking a newer report read, collapses only because of the receipt check (slice 3) | Read `SessionAttentionMessage.tsx:37-42`: expanded = unread, or the choice's receipt is this report's and it chose expanded. After the newer report's Mark as read, `unread` is false and the choice names the older receipt, so the part collapses; without the receipt check it would stay expanded. The journey's step after 6 already reports a newer message on the same session (`storyA.report({ outcome: "unfinished", message: newerMessage })`), no new launch. |
| Admission already refuses a host without a native reader before the response runs (slice 4) | Read `resultRequest` in `server/sessionAdmission.ts:123-137` and the `"result"` case in `server/launchBoundaryAnswer.ts:121-122`: the response is reached only with an admitted request. `grep -rn "sessionResultResponse\|resultRequest\|readResult" dashboard/server dashboard/src dashboard/tests` → callers are `launchBoundaryAnswer.ts`, `agentLaunchAdmission.ts` (endpoint map and `Admitted` union, line 74), `codexHost.ts`, `hosts/codex/result.ts`, and `session-result-codex.spec.ts` (reads `launchHost(...).readResult` directly, unaffected). |
| The admission spec can keep a Claude record beside the Codex one (slice 4) | Read `tests/support/retainedReport.ts`: `retained` launches and stores the Codex record, `save(home, records)` rewrites the project's records; `keptSession` (`server/launchRecordStore.ts:45`) finds a record by host and session ID alone. |
| The named proof journeys run in this preparation workspace (all slices) | At `8c8b41f9`, `unset NODE_ENV; npx playwright test --config dashboard/playwright.config.ts --reporter=list agent-completion-cursor story-panel session-unread-report session-result-admission` → 11 passed (14.4s), using 8 workers. This consumes the real production build and isolated fixture stores; it is a baseline, not proof of the new assertions. The first attempt failed at setup with the local Vite executable absent. `npm ci --include=dev --ignore-scripts --no-audit --no-fund` installed the locked development dependencies, after which this same command passed. Execution must have local development dependencies installed and unset `NODE_ENV` for these journeys. |
| The preserved native-report journey reaches the result boundary independently of its attention message (slice 4) | At the same base, read `agent-completion-attention.spec.ts`'s `keepFinalReport(native, workspace, nativeReport)` setup and its panel assertions for `nativeReport` and absence of the reminder, then run `unset NODE_ENV; npx playwright test --config dashboard/playwright.config.ts --reporter=list agent-completion-attention.spec.ts` → 1 passed (35.7s). This exercises reporting, stage change, retirement, restart, and native-report reading through the real result endpoint; native history is synthetic and private to the fixture. |

## Outside-in proof

Key examples for this correction:

- A Cursor session has an unread attention message → the developer marks it
  read → Mark as done is visible both before and after, and the session stays
  open. Its later Mark as done keeps the current confirmation rules.
- Story B's Codex workspace is gone and its record has no attention message
  → the developer selects Read final report → the panel shows `storyBReport`
  from Codex's native history.
- A read message A is manually expanded → a newer report arrives for the
  same session and is marked read → the new message part collapses; A's
  expansion choice does not carry over.
- A kept Claude session has an attention message but no native result reader
  → its result endpoint is requested → admission returns 400 “This host
  cannot read a final report.” without the message or a native report read.

Proof is the Playwright journeys in `dashboard/tests/` named below, through
the real launch boundary, reporting command, store, and page. Each slice runs
`npm run typecheck:dashboard`, because the journeys do not type-check
unvisited code, and `npm run lint`, which refuses imports left unused by the
moves. Hosted CI runs the whole suite after publication.

| Finding | Slice | Observation |
| --- | --- | --- |
| 1. Mark as done beside the message, before and after the read | 1 | `agent-completion-cursor.spec.ts`; read `AGENT-LAUNCH-TERMINALS.md` against the story |
| 2. The panel shows the native final report alone | 2 | `story-panel-replacement.spec.ts`, `story-panel-switching.spec.ts` |
| 3. An expansion choice ends at a newer report | 3 | `session-unread-report.spec.ts` |
| 4. A host without a native reader is refused, once | 4 | `session-result-admission.spec.ts`; `rg -n "cannot read a final report" dashboard/server` finds one place |

## Ordered slices

### 1. Describe and prove Mark as done's independent availability
Type: Structure
Status: done
Accepted proof: `unset NODE_ENV; npx playwright test --config dashboard/playwright.config.ts --reporter=list agent-completion-cursor.spec.ts` → 3 passed;
the reported Cursor card test asserts `markAsDone(card)` visible before and after
`part.markRead.click()`, one listed session, and no native call from reading.
The terminal document already held the corrected wording and was left unchanged.
Proof: `unset NODE_ENV; npx playwright test --config dashboard/playwright.config.ts --reporter=list agent-completion-cursor.spec.ts` passes. In the reported
Cursor card journey, Mark as done is visible while the message is unread,
before Mark as read, and stays visible afterwards; the session stays open
and native calls do not change. Read the terminal document's explicit-report
section against the preserved contract. Run the shared static checks below.

Correction: remove the suggestion that reading creates Mark as done, and
observe its availability independently of the message's read state.

- Assert the card's Mark as done before `part.markRead.click()` in
  `agent-completion-cursor.spec.ts`; replace the “now offering” comment with
  wording that reading leaves the session open with its existing control.
- Verify and preserve `AGENT-LAUNCH-TERMINALS.md`'s already-corrected “its own
  control beside it” and “read or not” wording. Preserve SEED-104's current
  confirmation rules and the spec's later Done observations.

Safe stopping point: the misleading spec wording and missing before-read
observation are corrected; every later correction can remain undone.

### 2. Make Story B's fixture observe only the native final report
Type: Structure
Status: done
Accepted proof: `unset NODE_ENV; npx playwright test --config dashboard/playwright.config.ts --reporter=list story-panel-replacement.spec.ts story-panel-switching.spec.ts` → 2 passed
with `storyBLaunchRecord` holding no completion; the replacement journey's panel
shows `storyBReport` from `keepFinalReport`'s native history, review replaces it,
and `doneAt` stays undefined. Only the two panel specs consume Story B.
Proof: `unset NODE_ENV; npx playwright test --config dashboard/playwright.config.ts --reporter=list story-panel-replacement.spec.ts story-panel-switching.spec.ts` passes with Story B holding no completion. The replacement journey reads
`storyBReport` through Codex's native-history fixture into the panel, returns
to review, and leaves the session unmarked done; the switching journey still
reviews Story B. Run the shared static checks below.

Correction: remove the fixture conflation between an attention message and
Codex's native final report without changing either product concept.

- Remove `completion` from `storyBLaunchRecord` in `support/storyPanels.ts`.
  Its Claude record is a kept session; its Codex variant uses the existing
  `keepFinalReport` fixture to retain `storyBReport` as native history.
- Align the helper's header and record/report comments with those meanings,
  and the replacement spec's header where it describes the record otherwise.
  No consumer relies on Story B's message, unread state, or Mark as done.

Safe stopping point: both panel journeys remain green with an unambiguous
native-report fixture; no product code changes or later slices are needed.

### 3. Prove that a newer report ends the old expansion choice
Type: Structure
Status: done
Accepted proof: `unset NODE_ENV; npx playwright test --config dashboard/playwright.config.ts --reporter=list session-unread-report.spec.ts session-unread-report-message.spec.ts` → 4 passed;
the journey expands read message A by hand before the newer report, which is
expanded while unread and collapses after Mark as read. With the receipt check
replaced by `chosen !== undefined`, that collapse assertion failed; the
production expression was restored unchanged.
Proof: `unset NODE_ENV; npx playwright test --config dashboard/playwright.config.ts --reporter=list session-unread-report.spec.ts session-unread-report-message.spec.ts` passes. The same session's read message A is manually expanded before
report B arrives; B is expanded while unread and collapses after Mark as
read. The existing message-part journey retains pointer/keyboard disclosure
and the independent Done control. Run the shared static checks below.

Correction: close the regression-proof gap for the existing per-receipt
expansion rule; preserve the current production behavior.

- Before the newer `storyA.report(...)` after step 6, activate
  `messageA.heading` and use `expectExpanded` with `reportedMessage`.
  After B's Mark as read, the existing `expectCollapsed` must observe the
  end of A's choice. Update that step's comment accordingly.
- Validate sensitivity in this execution worktree: temporarily replace only
  `chosen?.receipt === report.receipt` with `chosen !== undefined` in
  `SessionAttentionMessage.tsx`, preserving its boolean result and protection
  against an absent choice, and
  run `unset NODE_ENV; npx playwright test --config dashboard/playwright.config.ts --reporter=list session-unread-report.spec.ts`. The new collapse assertion
  must fail. Restore the production expression and run the slice's proof
  command green before delivery. Each invocation rebuilds production assets,
  so the deliberate check consumes the changed expression, not a stale build.

Safe stopping point: the receipt-bound choice is covered and the deliberate
mutation is restored; no failing test or product change is retained.

### 4. Admit a verified native reader and refuse unsupported results once
Type: Structure
Status: done
Accepted proof: `unset NODE_ENV; npx playwright test --config dashboard/playwright.config.ts --reporter=list session-result-admission.spec.ts story-panel-replacement.spec.ts agent-completion-attention.spec.ts` → 3 passed;
the new kept Claude case passed before and after the move with 400, no message
in the body, and no added `thread/read`. `resultRequest` returns the bound
reader as `AdmittedResult`; `rg -n "cannot read a final report" dashboard/server`
finds only `sessionAdmission.ts`.
Proof: `unset NODE_ENV; npx playwright test --config dashboard/playwright.config.ts --reporter=list session-result-admission.spec.ts story-panel-replacement.spec.ts agent-completion-attention.spec.ts` passes. The admission journey preserves malformed/unknown/wrong-host
refusals and the positive Codex response. A new kept Claude record with an
attention message is refused with 400 “This host cannot read a final report.”,
without that message in the body or any additional native `thread/read`.
The panel journeys still show Codex's own report rather than the attention
message, without continuing or implicitly marking the session done. Run the
shared static checks below. `rg -n "cannot read a final report" dashboard/server`
finds the refusal in `sessionAdmission.ts` only.

Correction: give the existing admission boundary sole ownership of native
reader availability, leaving response execution and native reading unchanged.

- Add the Claude admission case first, keeping it beside the retained Codex
  record via `save`. Measure native reads immediately around the Claude
  request, so Codex setup and the later successful request cannot contaminate
  the assertion. Run the admission spec before the move: this case should
  pass because it guards existing refusal behavior, not a reported defect.
- `resultRequest` resolves the host reader once, rejects its absence, and
  returns it with the record. Keep the result member of `Admitted` consistent
  and the reader non-optional, using the existing `LaunchHost["readResult"]`
  contract rather than a new signature or parallel admission representation.
- `launchBoundaryAnswer.ts` passes the admitted result request to
  `sessionResultResponse`, which calls its reader with the same session and
  response signal. Remove the response's duplicate refusal, host lookup,
  and unused imports; preserve `withResponseSignal` and Codex's native reader.

Safe stopping point: admission and response agree on the resolved reader,
all refusals and native-report outcomes remain green, and no other caller
or native operation changes. No later slice is needed to make this coherent.

## Shared verification and sizing

After each slice's changes and local cleanup, run
`npm run typecheck:dashboard` (the fixtures and admission are TypeScript) and
`npm run lint` (including unused-import and formatting checks). Execution's
installed workflow owns independent post-change refactoring, proof acceptance,
selective formatting, commit hooks, publication, and CI observation; this plan
adds no full-suite local test gate. Hosted CI remains responsible for its full suite.

All four slices directly own one evidenced correction and one focused proof
loop while preserving behavior. Slices 1–3 improve independent observations;
slice 4 changes one existing admission/response contract atomically. They share
the existing report/read-state model and native host boundary, with no new
special-case product rule or deferred structure. Each completed slice retains
useful progress if execution stops there; the story completes only after all
four findings are resolved.

No numeric slice target, hard limit, or sizing exception was supplied. The
observed focused baseline takes 14.4 seconds, so verification does not require
a timing exception. The earlier slice 1's three independent proof loops are
split into slices 1–3; earlier slice 2 is retained as slice 4. No broader split
or story resplit is needed, and this review finds no remaining slice-specific
concern.

## Current decisions

- Preserve current Mark as done confirmation from SEED-104. The correction
  concerns when its control is offered; it does not change when confirmation
  is required. The terminal documentation correction is already present.
- Story B holds no attention message, rather than a second distinct text:
  neither panel spec uses one, and an absent message cannot be mistaken for
  the native final report.
- The admission spec's Claude case passing before the move is expected: it is
  the guard that the move keeps the refusal, not a reproduction of a defect.
- All four slices are Structure: they change tests, fixtures, documents, and one
  refusal's place, and no observable product behavior.
