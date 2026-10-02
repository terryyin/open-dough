# Quiet dashboard session completion with retained attention messages

**Identity:** SEED-008#installed-story-branch-integration
**Source:** [refined story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#installed-story-branch-integration).
**Prepared:** 2026-10-02 in the established preparation workspace.

## Goal and boundaries

Successful Land and Wrap Up need no recap. An installed operation explicitly reports a
dashboard-started session's completion: success without attention marks it done;
useful attention or unfinished work stays visible on its open card until Mark as done.
Direct use stays independent and follows the same quiet-success rule.

Preserve publication, merge judgment, CI observation, refresh, retirement owners/gates,
and useful failure/reminder/limitation reporting. A marker is presentation, not proof;
Session Done is local disposition, not story completion. Exclude the original Git
integration command, dashboard resource retirement, MCP discovery/registration, general
inbound messaging, vendor transport replacement, unrelated skills' auto-completion,
and generic installer/Git-helper redesign. Dashboard CI belongs to SEED-063.

## Direction and existing solutions

Follow [North Star](../../NORTH-STAR.md) sections “Agent launch as a requested assignment”
and “Explicit skill completion and retained attention messages”, and
[dashboard UI direction](../../../docs/dashboard-ux-ui-north-star.md).
Accepted ADRs [0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md)/
[0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md): one meaning/owner, useful increments.
[0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)/
[0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)/
[0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md): shared source,
self-contained dependencies, existing payload; author `src/skills/`, never managed copies.
[0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md): functional/native proof differ.

- Extend `launchRecordDocument.ts`, `launchRecordStore.ts`, `machineJsonStore.ts` with
  optional completion evidence; retain old records, fresh reads, serialized atomic
  writes and machine-local sessions outside repositories. Create no second registry.
- Reuse `launchAttemptStore.ts` identity/write-ahead lifetime before native id exists;
  bind reports to that recorded session, never a story's newest session. Claude learns
  its id after first input, so caller-supplied native id cannot be universal.
- Carry shared context through existing `LaunchHost` input builders; preserve native
  settings, preparation/start, continuation and blank/ad hoc semantics. No SDK/ACP migration.
- Extend `agentLaunchPlugin.ts`, admission and `localOrigin.ts` with narrow report/receipt
  using configured origin and launch-scoped reference. Preserve browser origin guards;
  request spelling/fields do not mandate a generic protocol/framework.
- `doneMarks.ts` owns user rename/detach/stop. Reuse local Done without native stop/rename
  inside a reporting tool request. Cursor has no stop; local Mark as done still works.
  Preserve existing explicit interruption of other sessions.
- Reuse shared card/session and retained-report presentation; render submitted text as
  text. Codex `readResult` remains passive native history, not explicit success authority
  or a Claude/Cursor prerequisite. Keep reports accessible after story membership changes.
  Keep `worktree-retirement.mjs` and `trunk-closure.mjs` in their existing domain.

## Planning premises and observations

Planning observations establish old behavior/seams, not the feature. No native run
occurred during planning; slice 1 needs real credentialed model execution, not substitutes.

| Premise | Observed source/command and result |
| --- | --- |
| Local Done persists but interrupts native work | `dashboard/server/doneMarks.ts`, `dashboard/tests/agent-launch-done.spec.ts`; `env -u NO_COLOR npm run test:dashboard -- agent-launch-done.spec.ts session-workspace-retirement-done.spec.ts --workers=2` exited 0. Raw HTTP/terminal journey observes rename, detach, stop, stored Done and restart; reporting must not reuse interruption. |
| Retired-workspace UI and concurrent records survive | Same run's `session-workspace-retirement-done.spec.ts` uses real page/server, private removed workspace, synthetic native history, deliberate Done and concurrent record across polling/reload. Proves store/UI, not reporting or retirement. |
| Focused runner available | Missing Vite initially prevented baseline; `npm ci --ignore-scripts --no-audit --no-fund` installed locked dependencies, rerun passed; no product/lockfile changes. |
| Existing writers can erase new completion fields | `rg -n 'updateRecord\(|keepRecord\(|setRecordDoneAt\(' dashboard` reaches `launchRecording.ts`, `launchRun.ts`, `launchVerification.ts`, `terminalAttachments.ts`, `doneMarks.ts`; `updateRecord` reconstructs fields, preserving only current Done facts. Extend preservation and prove late updates cannot erase completion. |
| Store already owns restart/serialization | Read `machineJsonStore.ts`, `launchRecordDocument.ts`, `launchAttemptStore.ts` and callers; passing journeys consume that store. New report/Done races belong to slice 5. |
| Native id timing differs | Read `hosts/codex/input.ts`, `hosts/claude/launch.ts`, `hosts/cursor/prompt.ts` and callers. Codex/Cursor know ids before input; Claude confirms printed id after background launch. Adoption, continuation and early report remain slice-1 premises. |
| Skills recap and can retire CWD | Read Land “Stop, rerun, and report”, Wrap Up “Report”/retirement and existing `## STORY WRAP-UP COMPLETE`; closure/retirement CLI/import callers and `tests/git-publication-native.sh` with both closure-native runners. Preserve gates; alter only incompatible recap assertions. |

## Ordered slices

### 1. Establish launch-to-report feasibility on the three native hosts
Type: Behavior
Status: done
Behavior: Installed-skill fixture receives explicit dashboard context and calls its
operation; acknowledgment matches launch/session, no broad tool registration or turn stop.
Proof: One isolated bounded round trip per host in existing dashboard launch mode;
inspect native trace, received facts and association, not self-report or exit alone.

Supervise disposable receiver/script runs/retries through actual builders, no SDK/direct
model calls. Cover Claude receipt before binding, continuation and post-removal callability
representatively. Use a surviving installed location or prepare before removal/submit after
settled work, never assume deleted script/CWD callability. Deliver feasibility only.
Track mechanism acceptance before runs in [SEED-053#quiet-dashboard-completion](../../seeds/SEED-053-native-guidance-acceptance.md#quiet-dashboard-completion),
which also owns later integration/Land/Wrap Up acceptance on each host, not a new queue
item. Native runs need selected execution authority, not planning/release authority.
If context, early association or safe acknowledgment fails within scope, stop 2–5 and
revise this plan. The resolved fixture-only approval and recovered evidence are below.

### 2. Retain an agent's attention message on its open dashboard session
Type: Behavior
Status: done
Behavior: Completed-with-reminder or unfinished-with-exact-reason report is stored
and acknowledged for its session; visible message leaves it open until Mark as done.
Proof: Focused real-preview Playwright launch/installed CLI child with actual context and
card/message/Mark as done; native executable synthetic, CLI/HTTP/store/polling/rendering real.

Deliver shared context, narrow request/receipt, optional stored facts, installed CLI,
required dependencies and presentation together. Preserve old records/all three input
adaptations; blank sessions gain no instruction. Prove wrong project/host/session,
unknown reference, malformed requests and cross-origin refusals without weaker guards.
Unbound reports cannot acknowledge a wrong session or mark it done. Persist before
receipt; survive restart/disappearance. Reported Mark as done is local even without
host stop; preserve explicit interruption. Keep access after published stage changes
and manual Done; no report means no new Done. Update feature-local launch/terminal docs
and declared payload/fixture dependencies here, with no standalone packaging/protocol slice.

### 3. Land and Wrap Up quietly when there is nothing to report
Type: Behavior
Status: done
Behavior: Direct settled unqualified success emits no recap, at most its minimal
marker. Reminders/failures/unfinished steps/material limits yield useful facts and next action.
Proof: AGENTS.md representative behavior review and maintained assessor good/bad paraphrase
fixtures replacing conflicting mandatory recap checks; deterministic proof is not native adherence.

Both source skills/linked instructions share one attention rule and existing Wrap Up marker;
add no parser/marker unless needed by selected host. Default-checkout “not applicable”/
already-absent cleanup alone is no warning. Evidence stays in operations/conversation/lasting
homes. Source/installed checks retain publication, containment, backlog reconciliation,
shutdown/recovery gates. Direct non-dashboard use makes no dashboard contact.

### 4. Automatically finish a quiet successful dashboard session
Type: Behavior
Status: planned
Behavior: After settled work/final words, explicit success/no attention is the final
operation; durable Done, acknowledgment and normal minimal response follow for that session.
Proof: Outside-in candidate installed Land/Wrap Up operations and CLI, real local Git
fixtures/private receiver/browser. Observe storage/receipt before Done, no native stop,
rename or premature terminal shutdown reaching sender.

Wire shared operation into Land and both Wrap Up closure paths using slice-1 callability/
order. Retained attention text equals agent response. Marker, completed native turn,
silence, failed/held work, missing context or superseded candidate cannot imply success.
Use local Done, not interrupting user-Done tool flow. If attachment disposal is delayed,
name its owner/prove no interruption of reporting or newer turn. Failed cosmetic/shutdown
work cannot erase durable report or claim unobserved stop. No new Cursor stop required.

### 5. Recover a failed or repeated completion delivery without repeating work
Type: Behavior
Status: planned
Behavior: After Git/closure, interrupted reporting preserves message/local unacknowledged
notice/open session; retry yields one receipt/message/disposition without repeating publication/retirement.
Proof: Focused CLI/HTTP/browser faults: unavailable receiver, write failure, stored
receipt/lost response, concurrent native update, duplicate, older launch, restart and
deliberate reopen/Done. Inspect durable data and native/Git calls, not exceptions alone.

Use stable completion identity/existing launch lifetime and pending context/message outside
retired workspace as needed. Recovery stays bounded/visible, no watcher/daemon/scheduler/queue.
Unavailable channel cannot claim acknowledgment; restart refresh preserves launch/session.
Preserve newer Done/reopen/concurrent evidence; stale reports cannot close different/newer
work or resurrect deleted records. Retry returns stored receipt; failed writes yield none.
Deferred disposal remains owned across error/shutdown/restart under observed contract.

## Proof ownership and acceptance

| Promise | Proof owner and decisive boundary |
| --- | --- |
| Skill-only operation/context/all hosts | 1 feasibility; 2 real launch/CLI and host inputs; affected-host native acceptance. |
| Attention/unfinished message/open card/local Done | 2 real request/store/card; 3 behavior review; native stop is no acknowledgment prerequisite. |
| Quiet direct/dashboard success/truthful limits | 3 behavior/assessor counterexamples; 4 integrated closure; native skill acceptance. |
| Done only explicit success/no message, normal final response | 4 installed-operation/browser and native order; silence/crash/marker counterexamples. |
| Survive retirement/native closure/restart | 1 callability; 2 persistence/page restart; 4 actual owned Git retirement/report. |
| Durable-before-receipt, races/retry/session | 2 boundary/store; 5 faults/native/Git call counts. |
| Standalone Git/CI/retirement gates | 3/4 maintained Land, Trunk/Story Branch closure checks; actionable failures. |
| Installed dependencies/config preservation | 2 actual install/update/payload fixtures and preservation assertions across supported layouts. |

At owning slices run `npm run test:dashboard -- <affected specs>`, `npm run typecheck:dashboard`,
`npm test -- <affected checks>`: affected Done/record/result/input regressions, Land/retirement/
closure checks, `tests/payload-declaration-links.sh`, install/update dependencies/preservation.
Broaden only for affected consumers/unresolved failure. Preserve execution delivery/CI gates.

Linked acceptance owns each host's callback/context, quiet skill behavior, attention and
report-before-closure. Slice 1 blocks feasibility; 2–5 own functional proof. Require fresh
real commands/retained facts, not static guidance/synthetic CLI/old recaps/exit 0. Reuse only
matching unchanged host/installer mechanisms. ADR 0005 permits functional completion before
native acceptance; complete gaps before affected release, never label them passed.

One outcome/optional attention drives Done/presentation; native activity, disposition,
receipt and story state remain distinct. Five Behavior slices retain proof/install/cleanup,
no speculative framework. No numeric limit supplied: one proof loop/probe stop. Preparation
found no concern; readiness grants no execution authority; no renewed readiness/completion.

## Accepted execution evidence (2026-10-02)

Publisher `dashboard-territory.local-open-dough`, author `d.kanai-chan`, identity above;
workspace `/Users/terryyin/git/open-dough/.worktrees/complete-dashboard-sessions-quietly-and-retain-m`,
branch `codex/complete-dashboard-sessions-quietly-and-retain-m`, story-branch `origin/main`.
Claim `418e5e52582602f86f83c3a6d99dea432e527118`, start `5659e235bc8d567e034480d208f74ebc6e1dcef5`;
slice-2 delivery base `9fcbf0397bf1f1d07d809715b5b1e675144e5a4e`. Retain later delivery receipts in execution context.

**Slice 1:** accepted actual native Codex 0.160.0, Claude Code 2.1.287 and Cursor
2026.10.01-e373342 reporting feasibility. Full commands, native identities, receipt/tool
signals, refusal diagnoses and user-approved exact fixture-only Claude permission are
recoverable in this plan at `9fcbf039` and in
[mechanism acceptance](../../seeds/SEED-053-native-guidance-acceptance.md#quiet-dashboard-completion).
All owned supervisors/PTYs/receivers ended; assessed disposable probe deleted under ADR 0005.
Shared daemon/native histories remain untouched. Shipped integration and actual Land/Wrap Up
native behavior remain pending there before affected release; no native reruns in slice 2.

**Slice 2:** coordinator accepted real preview/installed CLI/HTTP/store/polling/rendering
proof in `agent-completion-{attention,binding,cursor,input}.spec.ts`. Only native transport
and GitHub answers are synthetic; private origins/start and installed candidate files are real.
Matching durable receipt precedes display; attention/unfinished stay open; refusals cover
wrong project/host/session/reference, malformed and cross-origin requests. Text escapes,
retains published stage movement/removal/restart/Done/Recent access, and preserves native
Working separately. Reported Done is local, including Cursor; no native stop/rename/detach.
Claude pending receipt claims no native id; normal/Recheck binds the same receipt without a
second launch. Late attempt/keepRecord/updateRecord writers retain facts. Blank inputs remain
blank; host grammar, unreported Done, passive native reports and old records retain proof.

Locked Node 24.21.0/dependencies/browser setup accepted. Literal proof commands:
```sh
PATH=/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH env -u NO_COLOR npm run test:dashboard -- agent-completion-attention.spec.ts agent-completion-binding.spec.ts agent-completion-cursor.spec.ts agent-launch-done.spec.ts agent-launch-records.spec.ts agent-launch-start.spec.ts agent-launch-start-codex.spec.ts agent-launch-start-codex-recovery.spec.ts agent-launch-start-cursor.spec.ts agent-launch-ad-hoc-codex-input.spec.ts agent-launch-ad-hoc-cursor.spec.ts session-result-admission.spec.ts session-result-codex.spec.ts session-workspace-retirement-done.spec.ts agent-launch-default-checkout-warning.spec.ts agent-launch-preparation-start.spec.ts agent-launch-unconfirmed-input.spec.ts agent-launch-claude-verification.spec.ts agent-launch-claude-own-record-verification.spec.ts --workers=3
PATH=/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=3 npm test -- tests/payload-declaration-links.sh tests/install-preserves-open-dough-json.sh tests/install-all-tools.sh tests/execution-payload-update.sh tests/story-payload-update.sh
PATH=/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH env -u NO_COLOR npm run test:dashboard -- agent-completion-attention.spec.ts agent-completion-binding.spec.ts agent-completion-input.spec.ts agent-completion-cursor.spec.ts agent-launch-done.spec.ts agent-launch-done-codex.spec.ts agent-launch-done-refusal.spec.ts agent-terminal-done.spec.ts session-result-admission.spec.ts session-result-codex.spec.ts agent-launch-preparation-store-failure.spec.ts agent-launch-preparation-start.spec.ts agent-launch-ad-hoc-cursor.spec.ts --workers=2
PATH=/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH env -u NO_COLOR npm run test:dashboard -- agent-launch-codex-creation.spec.ts --grep 'lost creation identity' --workers=1
PATH=/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH npm test -- tests/install-all-tools.sh
PATH=/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH env -u NO_COLOR npm run test:dashboard -- agent-completion-attention.spec.ts agent-completion-binding.spec.ts agent-completion-cursor.spec.ts agent-completion-input.spec.ts --workers=2
PATH=/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH npm run typecheck:dashboard
```
All terminal exit 0; final four-spec run reverified mechanical lint repair, creation grep
selected the restart/duplicate-prevention journey. Real install/update across supported roots
preserves config/coexistence and compares reporting CLI/direct-entry dependency bytes.
Fresh independent refactor centralized completion/schema/label and Done capability, reuses
named-session admission, and extracted terminal admission, result response, creation persistence
and input proof. Coordinator inspected moved boundaries; unchanged accepted proof retained.
Formatter initially found mechanical lint issues; corrected, affected proof and final formatter
passed. Earlier test color warning and overlapping trace-output collision resolved by sequential
runs. No verification remains running. No readiness renewal. Slices 3–5 were planned at that delivery.

Consequential learning: macOS path aliases need the existing direct-entry helper; prepared
context must update the current owned attempt after publication and survive verification
reconstruction. Script/dependency copy outside the launch workspace survives retirement.
Managed Codex delivery currently has no supported retained stream binding: record its
unobserved receipt truthfully rather than claiming coverage. No observer has been armed.

**Slice 3:** accepted shared `dough-land/references/completion-attention.md` rule via
Land's retained anchor and Wrap Up/linked instructions. Quiet direct success preserves
only the existing Wrap Up marker; material issues require facts/consequence/next action.
CI attention applies only to existing obligations. AGENTS invocation/context/useful-outcome
walkthrough accepted. Maintained Land/Story Branch/Trunk assessors retain operational gates;
independently observed dirty/default refresh requires useful attention, never marker-only.
Clean/no-default cases stay quiet. Native adherence remains pending, not inferred from fixtures.
Fresh refactor extracted common closure response/refresh helper, declared installed reference,
proved two-hop links and updated evidence input hashes. Accepted final command (exit 0):
```sh
PATH=/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH npm test -- tests/git-publication-native.sh tests/git-publication-native-owned-context.sh tests/install-public-payload.sh tests/payload-declaration-links.sh tests/native-assessor-counterexamples.sh tests/native-assessor-counterexample-guard.sh tests/native-evidence-identity.sh
```
Coordinator inspected source, actual Git/installed fixture and counterexample boundaries;
formatter passed after literal-sed annotations only. All verification terminal; no readiness
renewal. Slice-3 publication base `d213f1efec373b098bddd4e83030db2c08693571`; slices 4–5 planned.
