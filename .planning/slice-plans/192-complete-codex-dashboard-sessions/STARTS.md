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
