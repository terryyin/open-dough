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
Status: planned
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
revise this plan; the current approval stop first requires concrete human resolution.

### 2. Retain an agent's attention message on its open dashboard session
Type: Behavior
Status: planned
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
Status: planned
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

## Execution observation: slice 1 native approval stop (2026-10-02)

Execution identity above; publisher `dashboard-territory.local-open-dough`, agent
`d.kanai-chan`, workspace `/Users/terryyin/git/open-dough/.worktrees/complete-dashboard-sessions-quietly-and-retain-m`,
branch `codex/complete-dashboard-sessions-quietly-and-retain-m`, story-branch, `origin/main`.
Published/candidate `418e5e52582602f86f83c3a6d99dea432e527118`; starting revision
`5659e235bc8d567e034480d208f74ebc6e1dcef5`. Coordinator established claim/setup;
Node 24.21.0, locked dependencies/browser/check/typecheck passed. No product implementation.

Probe root below: `run.mjs` uses actual `launchCodex`/`launchClaude`/`launchCursor` inputs/modes,
private Git fixtures in `.agents/skills/`/`.claude/skills/`, stable `tools/report.mjs`/host context
JSON and disposable receiver. Cursor wrapper execs unchanged args; no behavior/MCP/permission change.

Literal commands from execution checkout (the probe path variable only shortens spelling):
```sh
probe_root=/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/open-dough-completion-probe-r_xkysjf
bash "$probe_root/run.sh" "$probe_root" codex
bash "$probe_root/run.sh" "$probe_root" codex --recover
bash "$probe_root/run.sh" "$probe_root" codex --retire
bash "$probe_root/run.sh" "$probe_root" claude
bash "$probe_root/run.sh" "$probe_root" cursor
(cd "$probe_root/claude-project" && claude)
cursor-agent --workspace "$probe_root/cursor-project" --resume 1060353f-f482-4273-83bb-338b37724b8e
bash "$probe_root/run-resume.sh" "$probe_root" claude
bash "$probe_root/run-resume.sh" "$probe_root" cursor
```
`run.sh`/`run-resume.sh` prepend `/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin`,
source `tests/support/native-run-supervise.sh`, call `native_run_owned` with
`node --experimental-transform-types <probe-root>/run.mjs` (or `run-resume.mjs`), 180s/5s grace.
Transform flag fixed strip-only parameter-property rejection before launch, no product edit.
Initial Claude/Cursor fixture trust refusals remain under `evidence/claude/`, `evidence/cursor/`.
Coordinator inspected authored fixtures and accepted only native interactive fixture trust;
both empty PTYs exited 0, no work or override flags. Recoveries restored original receivers/references.

**Codex 0.160.0 — accepted partial mechanism evidence.** Session `01a0fc63-1513-7fc3-9b21-95e35ffef548`,
launch `a517e410-1b6e-4fe7-a267-5c69b3e82ca3`. First turn `01a0fc63-1593-7e52-8d1d-e0461aa9ec2f`
failed: empty-rollout `thread/read` closed receiver; reporting/retry saw `ECONNREFUSED 127.0.0.1:55087`.
Same-session recovery restored port; turn `01a0fc64-13d4-7392-920a-e25681eeb97d` returned
receipt `be6cfd86-5471-4af5-bc01-d35e3ec7a153`, completed normally, supervisor exit 0.
Retirement continuation `01a0fc64-9a17-7e43-98b3-692f945a58ef` called stable operation with `retired`,
receipt `bcc83df5-e29a-46a3-878e-b86aaacbf2cc`, normal completion/exit 0; `codex-project` absent.
Coordinator inspected native reads/commands/results and matching durable/agent receipts;
no interrupt/stop/rename. Host history uses exact ids above; association ignored `/private/var`
spelling through explicit launch/session id. Native shell Node 24.5.0.

**Cursor 2026.10.01-e373342 — accepted partial mechanism evidence.** Original session
`1060353f-f482-4273-83bb-338b37724b8e`, launch `99932ef9-57cc-42e6-87a1-9b22d2475d5a`,
receipt `c0e0c898-07f1-496d-80b8-8da8300b28d9` matched durable and agent acknowledgment.
`cursorPrompt(request, undefined)` byte-matched original input; `execCursor` used original
continuation args/closed stdin/no extra flags, no second chat; exit 0, no stop/rename.
Native history `/Users/terryyin/.cursor/chats/2666d147112f05500df1cf1ac38ba89d/1060353f-f482-4273-83bb-338b37724b8e/store.db`
read SQLite `mode=ro&immutable=1`; Read `toolu_01M9PYnpEnuFn3dtUmojTiRQ` received context,
Shell `toolu_01QtxdQzHrZRjxcZPfUixV3e` invoked operation, exit 0/same receipt/native id.

**Claude Code 2.1.287 — approval rejection, reporting unproved.** `launchClaude`/`claude --bg`
session `405d00da-d99b-46fb-a109-df6991095d1b`; receiver withheld binding until receipt; none arrived.
Bash `toolu_01AJZJtY6cQx2tWP5dM15E5z` reading `tools/claude-context.json` then executing
`tools/report.mjs` with context/`initial` was denied: “Permission for this action was denied by
the Claude Code auto mode classifier. Reason: [Code from External].” Result forbids same
outcome via another tool/host/later turn, names no clearing observation. No alternate operation,
allowance rule or permission-mode change. Supervisor exit 1/native waiting observed, then owned
background cleanup `claude stop`. Trace `/Users/terryyin/.claude/projects/-private-var-folders-65-16p4k5qj42qg7l46k2j0nhj40000gn-T-open-dough-completion-probe-r-xkysjf-claude-project/405d00da-d99b-46fb-a109-df6991095d1b.jsonl`.
Preserved `evidence/claude-recovered/`: `001-launch-result.json`, `002-pre-binding-observation.json`,
`004-failure.json`, `005-owned-background-cleanup.json`, `native-listing.json`; scripts/context/fixture remain reviewable.

All supervisors reached terminal results; watchdogs/receivers ended; shared Codex daemon/native
histories untouched. Coordinator deleted accepted spent `evidence/codex`, `evidence/cursor-recovered`,
`evidence/cursor-native-trace.txt` under ADR 0005; blocked Claude evidence/recovery inputs remain.
Slice 1 incomplete: Claude reporting/early binding unproved; 2–5 unstarted, stopped pending human resolution.
Later shipped integration and actual Land/Wrap Up acceptance remain pending on all hosts in SEED-053.
