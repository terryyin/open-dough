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
Status: done
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

**Slice 2:** accepted real preview/installed CLI/HTTP/store/polling/rendering proof
for attention/unfinished retention, exact launch binding, local manual Done, refusals,
all host inputs, restart, late writers and passive native results. Native transports
and GitHub answers were synthetic. Literal commands, selected observations, setup,
refactor effects and formatter repairs remain recoverable in this plan at `d213f1ef`.
Fresh refactor centralized completion/Done capability and extracted terminal admission,
result response and creation persistence; all terminal proof/formatter/hook exit 0.
Locked Node 24.21.0/dependencies/browser setup accepted. No verification remains live.

Consequential learning: macOS path aliases require the existing direct-entry helper;
prepared context must update the current owned attempt after publication and survive
verification reconstruction. The prepared script/dependency lives outside the workspace.
Initial managed deliveries were unobserved without a retained stream binding. Later
startup/reuse recovery is recorded below; these earlier receipts never proved CI.

**Slices 3–4:** accepted quiet shared attention guidance, maintained assessors and
installed dependencies (`b69852ae`), then explicit quiet report/Done with actual private
Land/Story Branch/Trunk closure and retirement, durable receipt, no native interruption,
early Claude binding, Cursor Done, browser restart and independent passive native reading
(`4ef5e2e`). Full literal commands, observation locations, refactor effects and formatter
repairs remain in this plan at those published revisions. All local proof and delivery
gates passed; native guidance adherence remains pending in SEED-053 before release.

**Owned CI repair:** recovered startup/reuse route from DearDough DD-201 and installed
Codex adapter. GitHub `ci.yml` / display `CI` verified for this execution branch. Observer
`/tmp/dough-ci-501/watch-YbJYkk`, cell 116, session 1277, PID 34317, coordinator d.kanai-chan,
checkout above; managed resume accepted `4ef5e2e` with pushCount 0 and recovered this owner.
Delivered sequence 1: run 37021271369/attempt 1, SHA `4ef5e2e`, seven dashboard jobs and
test (2/3) failed. All failures inspected; no infrastructure exemption. Slice 5 paused
before edits; installed stash-save receipt `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-DPBsk4/record.json`
was clean/oid null. Repair updates obsolete prompt/attempt/recap proof without weakening
native grammar/developer/settings/ownership/CI gates. Independent input oracle replaces
circular expected-input construction. Preserved chmod-fault assertion exposed reporting
bootstrap before cleanup finally; move inside finally clears launching progress, retains
uncertain durable attempt and launches no native session. Minimal red then green:
```sh
PATH=/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH env -u NO_COLOR npm run test:dashboard -- agent-launch-session-options.spec.ts --grep 'one-shot execution · isolated · review' --workers=2
PATH=/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH npm test -- src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs
PATH=/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH env -u NO_COLOR npm run test:dashboard -- agent-launch-codex-model.spec.ts agent-launch-preparation-cursor.spec.ts agent-session-cursor.spec.ts agent-launch-preparation-codex.spec.ts agent-launch-cursor-model.spec.ts agent-launch-acceptance.spec.ts agent-launch-codex-lifetime.spec.ts agent-launch-session-options.spec.ts agent-launch-ad-hoc-cursor.spec.ts agent-launch-start-codex.spec.ts agent-launch-start-codex-recovery.spec.ts --workers=2
PATH=/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH env -u NO_COLOR npm run test:dashboard -- agent-launch-acceptance.spec.ts --workers=2
PATH=/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH npm run typecheck:dashboard
```
First two exit 1 for diagnosed assertions; lifecycle rerun and final commands exit 0.
Broad proof selected 42 tests/14 files; final acceptance three tests observe no native launch.
Real installed Git/server/browser/persistence; native transports synthetic. Fresh independent
refactor: no edits/tests. Formatter passed after redundant optional-chain repair only;
all changed files <=250, no owned verification remains live. No readiness renewal.
Repair publication base `4ef5e2e72e31238091858d0534da21b9825bd768`; slice 5 remains planned.
