# Quiet dashboard session completion with retained attention messages

**Identity:** SEED-008#installed-story-branch-integration
**Source:** [refined story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#installed-story-branch-integration).
**Prepared:** 2026-10-02. Planning only, in the established preparation workspace.

## Goal and boundaries

Successful Land and Wrap Up need no recap. A dashboard-started session reports
explicit completion through an installed skill operation: success without an
attention message marks that session done; a useful message or unfinished
outcome stays visible on its card, with the session open until Mark as done.
Direct invocations stay independent and follow the same quiet-success rule.

Preserve existing publication, merge judgment, CI observation, refresh, and
worktree/branch retirement owners and gates. Preserve useful failure, reminder,
and limitation reporting. An end marker is presentation, never completion
proof. Session Done remains a local disposition, not product-story completion.

Exclude the original Git-integration command, dashboard resource retirement,
MCP registration/discovery, general inbound agent messaging, vendor transport
replacement, automatic completion for unrelated skills, and general installer
or Git-helper redesign. Dashboard-owned CI remains SEED-063's responsibility.

## Direction and PFE

Follow [North Star](../../NORTH-STAR.md), “Agent launch as a requested assignment”
and “Explicit skill completion and retained attention messages”, and the existing
[dashboard UI direction](../../../docs/dashboard-ux-ui-north-star.md).
Accepted ADRs [0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) and
[0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
support one meaning/owner per fact and small useful increments.
[0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md),
[0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md), and
[0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
require shared source guidance, self-contained installed dependencies, and the
existing payload declaration. [0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
separates deterministic implementation proof from native acceptance.

PFE findings and choices:

- Reuse `launchRecordDocument.ts`, `launchRecordStore.ts`, and
  `machineJsonStore.ts`: the machine already retains host-qualified sessions
  outside repositories, reads fresh records, serializes writes, and replaces
  them atomically. Add optional completion evidence there; old records without
  it remain valid. Do not create a second session/result registry.
- Reuse the accepted launch attempt's identity/write-ahead lifetime
  (`launchAttemptStore.ts`) when context must exist before a native session id
  is known. Bind its report to the recorded session; never target the newest
  session on a story. Claude chooses its id after receiving the first prompt,
  so a caller-supplied native id cannot be a universal prerequisite.
- Change existing launch input builders behind `LaunchHost` to carry one shared
  dashboard context. Preserve native settings, established preparation/start,
  continuation, and blank/ad hoc launch semantics. No vendor SDK/ACP migration.
- Extend the existing loopback boundary (`agentLaunchPlugin.ts`, admission,
  `localOrigin.ts`) with a narrow agent-report request/receipt. A script can use
  the configured local origin and a launch-scoped reporting reference; keep
  browser origin refusals intact. Request spelling and field layout are not a
  generic protocol/framework mandate.
- `doneMarks.ts` owns user-requested rename/detach/stop. Reuse the local Done
  mutation for reported completion, without calling native stop/rename from
  inside the reporting agent's tool request. Cursor has no stop operation in
  this checkout; reported completion still offers local Mark as done. Existing
  explicit interruption of other sessions retains its current semantics.
- Reuse shared session/card presentation and the retained-report surface where
  appropriate. Codex's passive `readResult` remains a distinct native-history
  read; it is not the authority for explicit workflow success or a prerequisite
  for Claude/Cursor messages. Render submitted text as text, as the existing
  report panel does. Keep the report accessible through the retained session
  when published story membership changes.
- Keep `worktree-retirement.mjs` and `trunk-closure.mjs` in their current domain.
  Author behavior in `src/skills/`; do not edit installed managed copies.

## Premises and observations

Planning inspected current production and proof consumers; these observations
bound the proposed work, not proof of the future feature.

| Premise consumed by the plan | Literal observation and result |
| --- | --- |
| Existing local Done persists across restart, but interrupts native work | Read `dashboard/server/doneMarks.ts` and `dashboard/tests/agent-launch-done.spec.ts`; then run `env -u NO_COLOR npm run test:dashboard -- agent-launch-done.spec.ts session-workspace-retirement-done.spec.ts --workers=2`: exit 0. The raw HTTP/terminal journey observes rename, attachment end, native stop, stored Done, and restart. Automatic reporting must not reuse that interruption sequence. |
| Stored session/result UI survives retired workspaces and preserves concurrent records | The same run executes `session-workspace-retirement-done.spec.ts`: real page/preview server, private removed workspace, synthetic native history, deliberate Done and concurrent record survive polling/reload. Native history is supplied by a stand-in: this proves our store/UI boundary, not agent reporting or retirement. |
| Current proof runner is usable in this checkout | Initial baseline could not spawn local Vite. `npm ci --ignore-scripts --no-audit --no-fund` installed locked dependencies; the focused rerun passed. No product code or lockfile changed. |
| New completion evidence can be lost by existing evidence writers unless preserved | `rg -n 'updateRecord\(|keepRecord\(|setRecordDoneAt\(' dashboard` reaches `launchRecording.ts`, `launchRun.ts`, `launchVerification.ts`, `terminalAttachments.ts`, and `doneMarks.ts`. Reading `updateRecord` shows it reconstructs a record and preserves only current Done fields. Extend that preservation for completion facts and prove late native updates cannot erase them. |
| Machine persistence has suitable serialization and restart semantics | Read `machineJsonStore.ts`, `launchRecordDocument.ts`, `launchAttemptStore.ts`, and their callers; the passing restart/concurrent-record journeys consume the launch store. It is an existing JSON file, not uncertain new storage infrastructure. New report/done races still need focused tests in slice 5. |
| All hosts have an instruction boundary, but host id timing differs | Read `hosts/codex/input.ts`, `hosts/claude/launch.ts`, `hosts/cursor/prompt.ts`, and launch callers. Codex/Cursor know ids before first input; Claude confirms its printed native id after background launch. Native adoption, context survival, and report-before-record races remain an early probe in slice 1. |
| Current skills demand success recaps and may retire their own workspace | Read Land's “Stop, rerun, and report” and Wrap Up's “Report” and retirement sections. Wrap Up already has `## STORY WRAP-UP COMPLETE`. Read `trunk-closure.mjs` and retirement CLI/import callers; `tests/git-publication-native.sh` sources both maintained closure-native runners, which exercise these commands. Preserve those gates and update only incompatible success-response assertions. |

Native feasibility costs credentials/model execution and cannot be established
by shell help, source presence, or substitute processes. Slice 1 bounds this
premise before dependent implementation. No native run occurred during planning.

## Ordered slices

### 1. Establish launch-to-report feasibility on the three native hosts
Type: Behavior
Status: planned
Proof: One isolated, bounded launch-context/report round trip per host through
its existing dashboard launch mode; inspect the native trace, received report,
and session association, rather than accepting self-report or exit 0.

Behavior: A maintainer launches a representative installed-skill fixture in a
private project → the agent receives explicit dashboard context and calls the
skill-referenced reporting operation → a retained acknowledgment matches that
same launch/session, with no broadly registered tool and no native turn stopped.

Use a disposable minimal receiver/script and the actual host launch-input
builders, not a replacement SDK or a direct model call. Bound each run and any
retry using existing native-run supervision. Exercise receipt before session
recording for Claude, continuation, and availability after workspace removal;
choose representative shared coverage instead of every scenario on every host.
For removed-workspace execution, establish a callable installed location or
prepare reporting while the workspace still exists, with the settled report
submitted after operations finish. Do not assume a deleted script/CWD can run.

Track this new integration mechanism in a separate linked native-acceptance
home before running native checks, under ADR 0005; link its actual home here
when established. This planning request creates no new queue item or paid run.
If a host cannot retain context, associate an early report, or acknowledge it
safely without changing selected scope, stop slices 2–5 and revise this plan.
Native proof still requires the execution instruction's applicable authority.
This slice delivers feasibility evidence, not shipping completion behavior.

### 2. Retain an agent's attention message on its open dashboard session
Type: Behavior
Status: planned
Proof: A new focused Playwright journey launches through the real preview-server
boundary, runs the candidate installed reporting CLI as a child process with
that launch's actual context, then observes the message and Mark as done on
its session card. The native executable is synthetic; the CLI, HTTP boundary,
record store, polling, and card rendering are real.

Behavior: A dashboard-started session reports completed work with a reminder,
or reports unfinished work with its exact reason → the dashboard stores the
outcome/message and acknowledges the matching session → its card displays the
message and the session remains open until the developer marks it done.

Deliver the shared context, narrow request/receipt, stored optional completion
facts, installed CLI and required dependencies, and presentation together.
Preserve older launch records and all three native input adaptations; a blank
session submits no unexpected instruction. Include wrong project/host/session,
unknown launch reference, malformed request and cross-origin refusals at the
boundary, without weakening existing browser guards. A report before session
binding cannot acknowledge the wrong session or mark one done.

The message is retained in the existing machine-local store before the receipt
is returned and is readable after server restart or workspace disappearance.
Mark as done for a reported outcome is local acknowledgment, even when the
host lacks stop; existing explicit interruption remains available where it
already applies. Preserve readable message access after the story leaves its
published card stage and after manual Done. No report means no new Done action.
Update feature-local launch/terminal documentation and declared payload/fixture
dependencies in this slice; no standalone packaging or generic protocol slice.

### 3. Land and Wrap Up quietly when there is nothing to report
Type: Behavior
Status: planned
Proof: Representative skill behavior review under AGENTS.md: successful direct
Land/Wrap Up yields no recap, while publication/CI/cleanup limitations produce
an actionable message. Update maintained guidance assessors and their good/bad
paraphrase fixtures where existing mandatory recap checks conflict; deterministic
checks do not establish native adherence.

Behavior: Direct Land or Wrap Up completes without a material qualification →
no success summary is emitted, with at most its minimal completion marker.
A reminder, failure, unfinished step, or material limitation → the agent gives
useful facts and next action instead of silence, retaining existing truthfulness.

Change the two source skills and relevant linked reporting instructions as one
common attention rule. Reuse Wrap Up's existing end marker; do not introduce a
new marker/parser unless the selected host needs one. Successful default-checkout
“not applicable” or already-absent cleanup is not a warning by itself. Preserve
required evidence in operations/conversation or relevant lasting homes without
forcing it into a final user recap. Source and installed tests must keep owning
publication, containment, backlog reconciliation, shutdown, and recovery gates.
A non-dashboard invocation attempts no dashboard contact.

### 4. Automatically finish a quiet successful dashboard session
Type: Behavior
Status: planned
Proof: Outside-in Land/Wrap Up fixture journeys run candidate installed guidance
operations and reporting CLI with real local Git fixtures and a private receiver;
a browser sees local Done only for explicit successful completion without an
attention message. Assert receipt/storage precedes Done, and no native stop,
rename, or premature terminal shutdown reaches the sending agent.

Behavior: The skill finishes its existing operations and settles final words →
it submits success with no attention message as its final operational step →
the dashboard durably records it and marks the matching session done. The
agent can receive the acknowledgment and finish its minimal response normally.

Wire the shared reporting operation into Land and both Wrap Up closure paths,
using the callable-location/order proven in slice 1. Keep any useful attention
message identical between the agent response and retained dashboard message.
A marker, native turn completion, absent message, failed/held operation, missing
context, or superseded candidate cannot substitute for explicit workflow success.

Apply the existing local Done representation; do not invoke the interrupting
user-Done flow during the reporting tool call. If attachment disposal is delayed,
name its owner and prove cleanup cannot interrupt reporting or a newer turn.
Failed native cosmetic/shutdown work cannot erase a durable report or claim an
unobserved native stop. No new Cursor stop implementation is required.

### 5. Recover a failed or repeated completion delivery without repeating work
Type: Behavior
Status: planned
Proof: Focused CLI/HTTP/browser fault journeys: receiver unavailable; write failure;
receipt stored then response lost; concurrent native record update; duplicate
completion; report for an older launch; restart and deliberate reopen/Done.
Inspect durable data and native/Git calls, not only the returned exception.

Behavior: Git/closure work has finished but reporting is interrupted → preserve
the message and report the unacknowledged delivery locally, with the session
open → retry the same completion after recovery → one receipt/message and the
correct session disposition, without repeating publication or retirement.

Give the script's report retry a stable completion identity and preserve pending
message/context outside the retired workspace where needed. Reuse the existing
store/launch lifetime; keep recovery bounded and visible, without a watcher,
new daemon, background retry scheduler, or generic message queue. An unavailable
channel yields no acknowledged-success claim. Refresh connection details after
restart without changing which launch/session the report belongs to.

Preserve newer local Done/reopen intent and concurrent native evidence; a stale
completion must not close a different session or newer work. Do not resurrect
an explicitly deleted record. A stored receipt wins over a lost response on
retry; a failed write produces no receipt. Any deferred resource disposal stays
owned through error, server shutdown, and restart under its observed contract.

## Proof ownership and acceptance

| Source promise | Owner and decisive signal |
| --- | --- |
| Shared skill-only operation, explicit launch context, all hosts | 1 feasibility probe; 2 real launch/installed-command boundary and host-input tests; native acceptance for each affected host requirement. |
| Useful attention/unfinished report, visible card, open session and manual Done | 2 real request/store/card journey; 3 skill behavior review; no native stop prerequisite for local acknowledgment. |
| No recap on direct or dashboard success; truthful limitations | 3 source behavior plus assessor counterexamples; 4 integrated quiet closure; native skill-behavior acceptance. |
| Automatic Done only from explicit success/no message, no interrupted final words | 4 installed-operation/browser journey and native ordering acceptance; silence/crash/marker counterexamples. |
| Message survives retirement, native-session closure, and restart | 1 callable-location probe; 2 real persisted report/page restart; 4 actual owned Git workspace retirement and report delivery. |
| Acknowledgment after durable storage; retries, races, correct session | 2 boundary/store proof; 5 fault journeys and native/Git call counts. |
| Existing standalone Git, CI and safe retirement gates preserved | 3/4 relevant maintained Land, Trunk and Story Branch closure checks; failures remain actionable rather than suppressed. |
| Self-contained installed dependencies and preserved project configuration | 2 actual install/update fixtures, payload checks and existing preservation assertions for the new dependency set, all supported layouts. |

Local focused verification uses `npm run test:dashboard -- <affected specs>`,
`npm run typecheck:dashboard`, and `npm test -- <affected checks>`. The planning
baseline above establishes only the stated old behavior. Add new specs to the
existing suite and run them at their owning slice, alongside the affected Done,
record/result and launch-input regressions. Use relevant Land/retirement and
closure checks, `tests/payload-declaration-links.sh`, and an installation/update
journey covering the new command dependencies; include preservation assertions.
Do not run the entire suite merely because CI config exists. Broaden local
checks only for a new affected consumer or unresolved failure. Apply the usual
execution publication, slice-local refactoring, review and CI gates when
execution is authorized; planning does not invoke them.

Native acceptance: assign the new launch-context/callback mechanism on each
host, quiet successful skill behavior, attention-message submission, and
report-before-closure ordering to linked acceptance work. Slice 1 owns the
blocking feasibility observation; fixtures in slices 2–5 own functional delivery.
Fresh native skill use must show real command use and resulting retained facts;
static Markdown, a synthetic CLI, old recap transcripts, or terminal exit 0 are
insufficient. Reuse existing unchanged installer/host proof only with a stated
matching mechanism. Complete missing native acceptance before affected release,
while letting this implementation story finish on functional criteria under
ADR 0005. Do not silently mark missing native proof passed.

## Current decisions and review

One report has explicit outcome plus an optional attention message. The same
rule drives local Done and all card/session presentations. Keep native activity,
local disposition, report receipt, and published story state distinct. Reporting
never takes over Git, CI, or retirement judgment. No success recap is required.

Cumulative review retained five slices: the first isolates native feasibility;
subsequent boundaries deliver a retained attention message, quiet skill response,
quiet auto-completion, and recoverable reporting. Each has one evaluable result
and its proof, dependencies, installation and local cleanup stay with it. No
Structure slice or generic abstraction is needed in advance. No project numeric
slice target/hard limit was supplied; boundedness is judged by one proof loop
and the explicit probe stop, without invented timing estimates.

No remaining plan concern was identified in this review. Native feasibility is
unproved today and explicitly bounded by slice 1; failure stops dependent work.
Readiness is a preparation judgment, not Take, publication or execution authority.
