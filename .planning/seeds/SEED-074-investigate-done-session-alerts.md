---
id: SEED-074
status: active
planted: 2026-10-01
planted_during: Terry's report of a possibly completed session raising attention again
scope: story
---

# SEED-074: Investigate attention from a completed session

<a id="investigate-done-session-alerts"></a>

### Investigate attention from a completed session

**Identity:** SEED-074#investigate-done-session-alerts
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless","assessment":"ready","reasons":[],"basis":{"document":"b0d4abbc7d30cb0fcbcf4ca10e46bc6cb2f075df974083fcb4e8d51354984cc0"}}
```

**Goal:** Prevent concurrent dashboard record updates from losing a persisted done marker and raising review attention again.

- **Scope:** Repair the confirmed shared-record lost update across dashboard processes, preserving intentional successful reopening and native failure semantics. Retired-workspace attachment UX remains outside this bounded repair.
- **Expected:** A successfully marked-done session does not raise review attention unless intentionally reopened under the existing contract.
- **Observed:** The screenshot shows “Ready for review”, one attention badge, and “The session could not be attached” for session `01a0f697-aa8a-7d10-892e-315c50158d8d`. Terry remembers probably using Mark as Done.
- **Evidence:** The saved session currently has no `doneAt`; its workspace `/Users/terryyin/git/open-dough/.worktrees/align-one-shot-callers-and-starts-with-the-revie` no longer exists.
- **Uncertainty:** Whether Mark as Done succeeded, a subsequent attachment reopened it, a stale write removed the done flag, or notification eligibility is incorrect.
- **Related evidence:** The earlier investigation is recoverable at commit `ae22469918f20d03640fe5cd584a89c55eedfc04`, `.planning/seeds/SEED-073-investigate-codex-terminal-attachment.md`.

## Investigation evidence

- Passive native reads confirm that conversation `01a0f697-aa8a-7d10-892e-315c50158d8d` still exists, with status `notLoaded`, saved workspace unchanged, and native name “Wrap up dough story”. No resume, interrupt, rename, or input was sent during investigation.
- Execution completed at 17:47:06 Singapore time. A later user turn invoked `$dough-story-wrap-up` at 17:49:06 and completed at 18:02:04 on 2026-10-01. Its final reply confirms removing its worktree and execution branches. This establishes the workspace-removal cause for this recurrence.
- The live launch record has no `doneAt` or `doneProblem`. Native completed history maps to `review` even when unloaded; alert eligibility excludes a persisted done marker. Therefore the displayed review state is consistent with the presently stored facts.
- Mark as Done persists the local marker before native operations and does not delete native history. Native lifecycle updates preserve the currently stored marker. Successful Codex terminal readiness intentionally clears a marker to reopen the session; failed attachment before readiness preserves it.
- A possible sequence is Mark as Done, successful reopening to submit wrap-up, then worktree retirement. That would legitimately clear the marker before the later completion alert. The click timing is not recorded and this sequence is not established.
- The machine JSON store also documents uncoordinated concurrent writes; a lost marker is a separate unconfirmed possibility, not an established explanation for this session.
- **Confirmed gap:** Retained native history can be reported ready for review and offered as an attachable terminal while its saved workspace has been retired. “Ready for review” establishes reply completion, not workspace usability.
- **Unresolved:** Whether a successful Mark as Done occurred after the final reopening, and whether persistence or notification behavior violated its contract. Do not claim that a notification ignored a persisted marker.
- **Retained workspace:** `/Users/terryyin/git/open-dough/.worktrees/investigate-done-session-alerts`, branch `codex/investigate-done-session-alerts`, created for this investigation. Starting revision `a4f408cb6cc19e5af0cb371783a921e2ba4df72f`; admission `14f1a2beeed571f045d839239b7c035914d90dc9` on `origin/main`, agent `Jane-chan`. Product code is unchanged.

- **Verification:** The existing `agent-terminal-done-codex-page.spec.ts` and `agent-launch-done-codex-races.spec.ts` passed with two workers. They cover failed reopening preserving done intent, successful reopening clearing it, and native rename/interrupt refusals retaining intent. The first run was rejected by the quiet reporter solely because conflicting color environment settings printed warnings; removing `NO_COLOR` for the test process produced a clean passing run. No failing reproduction of the reported done-marker loss was established.
- **Disposition:** Retain this admitted investigation Taken with local evidence while the Mark as Done timing and any resulting contract violation remain unconfirmed. No product repair or automatic fresh session is started.

## Confirmed concurrent-write defect

Terry explicitly requested continued investigation and cause identification. The
shared session-store persistence boundary was exercised with real filesystem I/O
in disposable isolated directories, without changing live records or product code.

- `replaceMachineJson` independently reads the complete document, applies one change, writes a unique temporary file, then renames it over the shared document. Atomic rename protects JSON integrity but does not serialize read-modify-write operations. Two successful writers can both begin with the same old document; the last rename silently discards the other writer’s change.
- An initial 30-trial probe overlapped marking one record done and adding an unrelated record: both writes succeeded in every trial, but 22 trials lost the done marker and the other 8 lost the unrelated addition.
- A second probe used a copy of the reported live record with the production `launchRecordSchema`. In 30 concurrent trials, 20 lost the done marker. Ten sequential-control trials lost no markers. Both transforms followed the production Mark as Done and keep-record update shapes; no filesystem dependency was mocked.
- Passing the resulting record through the real `sessionShown` and `alertReading` functions gave “Ready for review”, `needsAttention: true`, and a review alert. Supplying its persisted done marker suppressed the alert. This reproduces the persistence-to-attention causal chain.
- This is a confirmed product defect capable of explaining the missing marker and later attention. There is no persisted write/click history proving that this exact race caused Terry’s observed session; intentional reopening remains another possible route to the presently missing marker.
- Combined with the confirmed wrap-up worktree retirement, this chain explains why an alert can invite opening a terminal that fails: native history survives, the saved directory does not, and attachment starts inside that directory.

### Bounded repair requirements for later selection

- Serialize the complete read-modify-write operation per shared machine document, including writers from separate dashboard processes. Avoid relying solely on atomic replacement or a single in-process queue.
- Regression proof should overlap Mark as Done with an unrelated launch/lifecycle update, assert both changes survive, and assert no review attention for the retained done marker. Keep existing successful-reopening semantics and native failure coverage.
- Diagnose a retired saved workspace separately from native history availability; do not silently create a replacement conversation, claim, or workspace.

**Disposition:** Cause investigation has identified a reproducible lost-update defect and a confirmed missing-workspace attachment failure. Terry subsequently invoked dough-bug-fixing, authorizing the bounded planless repair under this existing claim with no replanning and a ten-minute hard limit.
