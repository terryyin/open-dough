# Workflow startup proof

Supporting proof for [plan 192](PLAN.md). Native useful execution remains
slice 8; source-installed mechanical fixtures do not establish released activation.

## Slice 6 — planned execution startup accepted

The existing shared start/dispatch already launches Codex execution. A new
actual card/Taken/retry journey found that an accepted `existing` script result
dropped known startingRevision/candidateSha while retaining agent/plan.
startRecording.establishedStart now preserves both earlier revision fields;
script-reported replacements still take precedence. Its sole caller,
executionStart.runningStart, supplies the same kept identity/publisher/workspace/
branch. Preparation uses its separate owner and is unaffected.

Coordinator inspected product producer/caller and all new proof/support files:

- support/codexStart uses startOrigin's actual isolated bare origin, ready queued
  story and source-installed selected `.agents` start script/formatter. Git URL
  rewriting keeps publications local. Codex fixture supplies vendor responses;
  dashboard code establishes the claim, workspace, record and native input.
- agent-launch-start-codex: actual card selects Codex/Default and starts with
  instruction. Explicit creation refusal leaves no accepted thread/input but a
  published Codex profile, Taken entry, real branch/workspace and retained start.
  Reload shows the Taken-card retry. Before native acknowledgment, actual store
  already holds the same start/session and uncertainty. Retry accepts one turn;
  two creation attempts (first refused) use the same saved workspace. Sole
  origin profile/revision/workspace remain unchanged, kept start clears, no
  Claude fallback occurs and the session remains on the card after reload.
- support/codexStartAssertions: exact whole turn/start input contains execution
  invocation, installed formatter handoff including original startingRevision
  and candidateSha, and developer text. candidateSha equals this isolated
  publication's revision. Native skill input names the workspace's installed
  execute SKILL.md. Exact thread/start params contain only saved cwd; model
  requests/overrides are absent. Confirmed turn ID and exact text are retained.
- agent-launch-start-codex-recovery: native accepted input loses acknowledgment,
  actual store retains uncertainty/start/thread. Actual server restart recovers
  original history using exact same-thread read/resume. One thread/start,
  turn/start, profile/revision/workspace/history entry and unchanged start/session
  establish no repeated claim/setup/conversation/input.
- Current shared consumers checked: Claude execution card/Taken/refusal/
  duplicate/phases/resume, start store/result, and mixed-host Codex launch.

Initial failures: the expected plan wrongly included `.planning/`; the actual
script reports planning-root-relative `slice-plans/A/PLAN.md`. Correcting that
expectation preserved the runtime contract. Lost startingRevision exposed the
product defect; explicit candidateSha assertion now also catches its loss.
A later expected canonical `/private/var` spelling differed from the saved `/var`
workspace; assertions now require actual established spelling. An existing
slow-push retry returned uncertain in the parallel selection with its 1,000ms
wait. The trace/expiry path were consistent with that deadline, but the raw HTTP
reason was not retained. Full serial replacement passed unchanged timeout and
assertions; unrestricted parallel timing stability is not established.

Accepted command, all twelve paths without name filtering, terminal exit 0:

```sh
env -u FORCE_COLOR -u NO_COLOR npx --no-install playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-start-codex.spec.ts dashboard/tests/agent-launch-start-codex-recovery.spec.ts dashboard/tests/agent-launch-start-taken.spec.ts dashboard/tests/agent-launch-codex.spec.ts dashboard/tests/agent-launch-start.spec.ts dashboard/tests/agent-launch-start-resume.spec.ts dashboard/tests/agent-launch-start-card.spec.ts dashboard/tests/agent-launch-start-refusal.spec.ts dashboard/tests/agent-launch-start-duplicate.spec.ts dashboard/tests/agent-launch-start-phases.spec.ts dashboard/tests/start-store.spec.ts dashboard/tests/execution-start-result.spec.ts --workers=1 > /tmp/dough192-slice6-serial-proof.log 2>&1
npm run typecheck:dashboard
git diff --check
```

All terminal exit 0; no verification remained running at implementation return.
Fresh independent refactor: the collaboration host refused another agent with
`agent thread limit reached`. A new configured Codex CLI agent instead read the
refactor skill, checked the five paths/current consumers and returned
`none — already clean` plus `## REFACTOR COMPLETE`; no edits/tests or exception.
CLI 0.159.3, gpt-6.1-sol/high, never/danger-full-access, unchanged configuration;
owned review thread 01a0f5cb-e8e5-7123-8fd1-02ebb5ddcff2, terminal exit 0.
Public producer/caller and proof boundaries stayed unchanged. Read-only
formatted sizes were <=250, largest 149. Coordinator npm run format passed;
staged whitespace check passed. No readiness renewal. Slice 7 is next.

## Slice 7 — ad hoc text and intentional blank accepted

Ad hoc text reaches turn/start once with its exact submitted bytes. A blank or
whitespace field instead records awaiting/blank intent before the materialization
read, then not-requested/blank after native persistence acknowledgment; neither
path submits an artificial empty model turn. Only the previously observed
-32601/list_turns-is-not-supported refusal is tolerated, followed by original
ID/workspace validation. Other errors, transport loss or mismatched context
remain uncertain. Recovery retries materialization for that saved blank,
without resume/new thread/input. A completed deliberate blank may be followed
by another deliberate Start; incomplete blank/input still recovers conservatively.
Predecessor confirmed/uncertain records retain their meaning and continuation.

StartSession's remaining Claude-only automatic terminal gate was exposed by
actual browser checks and now consumes the existing embeddedTerminal capability.
Blank records describe no instruction, rather than falsely confirmed acceptance;
failed materialization describes persistence unconfirmed. Live zero-turn state
still belongs to native observation and the common session presentation.

Coordinator inspected producers/callers, the private materialization helper,
shared pending selector/schema/presentation/capability consumer and these signals:

- agent-launch-ad-hoc-codex: actual Start session dialog/Default, exact text or
  zero blank submission, durable awaiting intent before includeTurns read,
  final no-input evidence, label and terminal focus; saved ID/workspace/endpoint
  through reload/restart, sidebar navigation, done/name/local mark and successful
  original-ID reopen. Retained zero-turn metadata is a vendor precondition;
  production supplies presentation. Owned PTYs receive SIGHUP and become absent.
- agent-launch-ad-hoc-codex-input: actual HTTP/store exact raw text (including
  whitespace/control newlines) once, followed by two deliberate blank starts;
  three distinct IDs, one text submission, no artificial empty turn.
- agent-launch-ad-hoc-codex-recovery: loss during materialization or input
  acknowledgment leaves original intent/identity. Actual server restart reads
  predecessor-shaped uncertainty through the store and recovers original input
  or blank without resubmission/fork. Error-code/message variations, unreadable
  transport/history and mismatched ID/workspace remain conservative, then correct
  same-ID materialization completes. Original request/time/session persist.
- Current consumers considered: common recording/schema/pending selection,
  SessionEntry/SidebarEntry/LaunchSession, StartSession/terminal lifecycle,
  Codex launch/input/recovery, preparation/execution, history, done and alerts.
  Existing confirmation proof includes genuine predecessor confirmed records.

The first browser run exposed absent auto-opening, not native CLI failure;
StartSession's capability fix resolved it. A later assertion expected “Awaiting
instruction”; the existing shared label is “Awaiting first instruction”, so the
assertion was corrected without changing presentation. Two test typing findings
were repaired before the accepted command. No native parity is inferred.

Accepted implementation command (26 paths, no name filter; terminal exit 0):

```sh
env -u FORCE_COLOR -u NO_COLOR npx --no-install playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-ad-hoc-terminal.spec.ts dashboard/tests/agent-launch-ad-hoc-sessions.spec.ts dashboard/tests/agent-launch-codex-recovery.spec.ts dashboard/tests/agent-launch-codex-confirmation.spec.ts dashboard/tests/agent-launch-ad-hoc-codex.spec.ts dashboard/tests/agent-launch-ad-hoc-codex-recovery.spec.ts dashboard/tests/agent-launch-ad-hoc.spec.ts dashboard/tests/agent-launch-ad-hoc-boundary.spec.ts dashboard/tests/agent-launch-codex.spec.ts dashboard/tests/agent-launch-codex-creation.spec.ts dashboard/tests/agent-launch-codex-reconciliation.spec.ts dashboard/tests/agent-launch-codex-lifetime.spec.ts dashboard/tests/agent-launch-codex-options.spec.ts dashboard/tests/agent-launch-start-codex.spec.ts dashboard/tests/agent-launch-preparation-codex.spec.ts dashboard/tests/agent-launch-host-identity.spec.ts dashboard/tests/agent-launch-records.spec.ts dashboard/tests/agent-terminal-codex.spec.ts dashboard/tests/agent-terminal-codex-page.spec.ts dashboard/tests/agent-terminal-codex-close.spec.ts dashboard/tests/agent-terminal-done-codex-page.spec.ts dashboard/tests/agent-launch-done-codex.spec.ts dashboard/tests/agent-launch-done-codex-races.spec.ts dashboard/tests/agent-launch-done-codex-intent.spec.ts dashboard/tests/session-alerts.spec.ts dashboard/tests/session-alerts-unavailable.spec.ts
npm run typecheck:dashboard
git diff --check
```

All terminal exit 0. Fresh implementation and independent refactor used new
configured CLI agents because the collaboration host reached its agent limit.
Refactor moved unchanged exact-input/deliberate-blank HTTP assertions to the
input spec (without unrelated published-story setup) and reused the existing
fixture refusal helper for creation/input errors. No production refactor;
native mechanism, public API and browser/lifecycle assertions stayed unchanged.
Coordinator inspected moved assertions and equivalent native wire replies.
Only those affected boundaries were rerun, terminal exit 0:

```sh
env -u FORCE_COLOR -u NO_COLOR npx --no-install playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-ad-hoc-codex-input.spec.ts dashboard/tests/agent-launch-ad-hoc-codex-recovery.spec.ts dashboard/tests/agent-launch-codex-reconciliation.spec.ts dashboard/tests/agent-launch-codex-options.spec.ts dashboard/tests/agent-launch-start-codex.spec.ts dashboard/tests/agent-launch-preparation-codex.spec.ts
npm run typecheck:dashboard
git diff --check
```

Fresh refactor returned ## REFACTOR COMPLETE; no command remained running.
Formatter found only fixture parameter-alias/non-null assertion mechanics.
Coordinator used local fixture aliases and a checked accepted-turn precondition;
observations and behavior stayed unchanged. Final affected proof/typecheck and
formatter all terminal exit 0:

```sh
env -u FORCE_COLOR -u NO_COLOR npx --no-install playwright test --config dashboard/playwright.config.ts dashboard/tests/agent-launch-ad-hoc-codex-input.spec.ts dashboard/tests/agent-launch-ad-hoc-codex-recovery.spec.ts dashboard/tests/agent-launch-ad-hoc-codex.spec.ts > /tmp/dough-192-ad-hoc-mechanical-proof.log 2>&1
npm run typecheck:dashboard > /tmp/dough-192-ad-hoc-mechanical-typecheck.log 2>&1
npm run format > /tmp/dough-192-ad-hoc-final-format.log 2>&1
```

Changed files <=250 after formatting (largest240). Whole implemented journey is
available, with native complete-dashboard/materialization/useful-execution and
configured-policy waiting acceptance still owned by slice 8. No readiness renewal.
