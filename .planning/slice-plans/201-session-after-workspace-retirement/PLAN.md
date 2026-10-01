# Session review after workspace retirement

**Identity:** SEED-076#session-after-workspace-retirement
**Source:** [refined story](../../seeds/SEED-076-session-after-workspace-retirement.md#session-after-workspace-retirement)
**Authority:** Execution authorized by Terry's `dough-execute-plan` invocation on
2026-10-01, using the supplied established start in Story Branch Mode.
**Preparation:** Reused the established workspace
`/Users/terryyin/git/open-dough/.worktrees/show-truthful-session-access-after-its-workspace`,
branch `codex/show-truthful-session-access-after-its-workspace`, starting revision
and published assignment `bb1b005555cbbc0d83cf8d68df7743dbf5a4482a`,
agent `jackson-chan`, remote `origin`, target `main`, integration checkout
`/Users/terryyin/git/open-dough`. Git branch, HEAD, worktree listing and
`refs/worktree/dough/created-for/` confirmed the supplied identity.

**Execution context:** Owned checkout and branch above; identity
`SEED-076#session-after-workspace-retirement`, publisher
`dashboard-mac.lan-open-dough`, execution agent `juacompe-chan`, starting revision
`1ff6dd388f29fc6d2c98cdee49e593448063a2e4`, established published claim
`1a97994b1e6aa6fbdcc31562aafd7817dc5b4e95`, remote `origin`, trunk `main`.
Story increments publish to `refs/heads/codex/show-truthful-session-access-after-its-workspace`.
The remote execution branch was confirmed at the claim. Checkout-bound `npm ci`
and `npm run typecheck:dashboard` passed; dependencies are local, without the
planning session's dependency symlink. Existing planning authority is retained
for bounded replanning; no numeric slice target or hard limit was supplied.

**Delivered revisions:** `33eb0b69afbca8db3cc860f5d6ca2d9dd74aa17f` (slice 1)
and `34fd7257ee0c0282700e095a225cf369d5ad723d` (slice 2),
plus `130e8a6d2b4c15cae951777b109552ced66473be` (host-isolation CI repair),
accepted on the execution branch. CI repairs `130e8a6d2b4c15cae951777b109552ced66473be`
and `bc98c4ac53100d4fd658bab2f0dc43c86d7e52fa` were also accepted. CI source is GitHub Actions `ci.yml` (`CI`),
verified with `gh run list --repo terryyin/open-dough --workflow ci.yml --branch
codex/show-truthful-session-access-after-its-workspace --event push --limit 1
--json workflowName`. Codex observer: coordinator `/root`, execution checkout
above, cell `42`, tool session `72248`, directory `/tmp/dough-ci-501/watch-qG1qAV`,
PID `16942`; managed delivery reused it and registered the accepted revision.
The initial trunk claim has no matching trunk observer and remains unobserved;
ordinary increments are covered on the execution branch, without per-slice CI waits.

**Owned CI repair during slice 3:** run `36861023410`, attempt `1`,
`dashboard (2/9)` failed on slice 2's accepted revision: the legacy equal-ID
host-isolation spec's exact machine-response expectation omitted Codex's new
transient `workspaceState: unknown`. This was a contract-consumer expectation
gap, not evidence of native identity loss. The minimal local command
`npm run test:dashboard -- dashboard/tests/agent-launch-host-identity.spec.ts`
reproduced that exact extra-field assertion failure (and separately emitted the
known NO_COLOR/FORCE_COLOR warning). The repair aligns the read and done-response
expectations and explicitly proves native/workspace observations are not persisted.
`env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-host-identity.spec.ts`
then passed the single selected case. Independent refactoring found no edits;
`git diff --check` passed. No product behavior or prior accepted proof changed.
The failed notification was accounted and acknowledged at mailbox sequence 1.
Slice 3 remained planned and paused while its ten owned paths were preserved
through the installed repair-stash operation; resume occurs only after repair
publication and verified restoration. The exact stash record is retained in
the coordinator conversation, not copied into another state file.

**Second owned CI repair:** run `36862248330`, attempt `1`,
`dashboard (8/9)` failed on `130e8a6d`: the active attached done-session journey
clicked Open terminal after reload while preparation reads still expanded the
cards above Recent sessions. CI's trace shows the control moving during the
click, unchanged scroll position, and no terminal WebSocket request. The retained
record stayed Done. Controlled held `PLAN.md` responses plus the recorded scroll
condition reproduced the same absent-panel assertion; releasing those responses
and awaiting the existing journey `settled()` before clicking passed. The literal
reproduction command was `env -u NO_COLOR npm run test:dashboard --
agent-terminal-done-codex-page.spec.ts --grep 'active attached'` (red before the
ordering change, green afterward). Temporary reproduction artifacts were disposed
after judgment. The two-line test-only repair reuses that existing settlement
helper after reload. `env -u NO_COLOR npm run test:dashboard --
agent-terminal-done-codex-page.spec.ts` passed all three cases;
`npm run typecheck:dashboard` and `git diff --check` passed. Independent refactoring
found no edits; native reader and product behavior were unchanged. Mailbox
sequence 2 was accounted and acknowledged. Slice 3 remained planned and quiescent;
its 15 tracked and two untracked paths were preserved by the installed stash helper
for restoration after publication. The coordinator retains the exact receipt.

## Goal and scope

A developer can read a retained Codex session's final report inside the dashboard
after landing removes its saved workspace, while understanding why terminal
continuation is unavailable. Terry selected this review surface on 2026-10-01.

Cover story-card, Recent sessions and Sessions-sidebar access, refreshed workspace
availability, attachment-time retirement, uncertain filesystem/result reads,
and preservation of attention, host-qualified identity, associations and done
marks. Preserve ordinary existing-workspace continuation and Claude Code behavior.
Missing directories are not proof of retirement's cause or story completion.

The read-only view must show the final agent report, including landing outcome
and limitations; it need not become a full transcript browser. It uses the same
native conversation and does not resume, send input, interrupt or fork it.
Do not recreate directories, substitute workspaces or generate completion marks.
Deferred: continuation elsewhere, endpoint/general attachment repair, full history
browsing, new hosts, and implementing the multi-tool architecture review.

## Architecture and PFE

Follow Accepted [ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
§§3–5: distinct facts, one representation per conceptual solution, and the smallest
cohesive change. Follow [ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
for shared proof and host-native differences. The ADR index and record statuses
agree; no conflict or exception was found. ADR 0008 remains Proposed.

Follow the existing [North Star agent-launch topic](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment):
`LaunchHost` owns native operations; machine-local records never become published
story truth; passive observation never takes interactive control. Preserve the
[UX/UI North Star](../../../docs/dashboard-ux-ui-north-star.md) session placement,
keyboard navigation and focus-return conventions. Feature-local extension of
these established responsibilities needs no new ADR or North Star topic.

| Existing solution and evidence | Decision |
| --- | --- |
| `server/hosts/codex/sessions.ts` observes saved IDs and native activity; `src/sessionShown.ts` owns attention independently of `doneAt` | Extend the existing observation with workspace facts; do not turn absent cwd into absent conversation or add another lifecycle/status registry. |
| `server/hosts/codex/recovery.ts` reads turns through `CodexRpc`, but also resumes and may submit input | Reuse RPC/identity validation concepts, never call recovery for review. Add a narrowly read-only native result operation behind `LaunchHost`; extract a shared parser only when current uses have equivalent purpose. |
| `server/projectFolders.ts` has `folderExists`, which collapses all errors to false | Its Boolean contract is unsuitable for saved-workspace uncertainty. Use directory observation that distinguishes established absence from lookup failure; retain the launch-check caller's existing meaning. |
| `src/LaunchSession.tsx` renders card/Recent access; `src/TerminalSplit.tsx` separately selects sidebar sessions and opens terminals | Route all three through one session-access decision while reusing project/story reveal and terminal transport. A read-only report view is a demonstrated gap, not another terminal implementation. |
| `server/terminalAttachments.ts` calls host attachment and catches failure generically; Codex PTY cwd and resume --cd use the saved workspace | Preserve shared transport/readiness and existing-workspace behavior; carry a specific saved-workspace refusal through the current boundary to the report action. |
| `launchRecordStore.ts`, native done operations and existing race specs own durable done intent | Reuse these owners; viewing a result writes no mark and cannot clear one through terminal readiness. |

Search covered session/history/result concepts in dashboard, source skills and
docs. Existing native reads and terminal history display are not a dashboard
read-only report viewer. No new machine store, transcript cache or general host
framework is justified. Native details belong in the Codex module; common code
handles access and presentation without imitating another host's capabilities.

## Observed premises and proof entry points

Baseline is the unchanged product at the starting revision above; only the seed
was edited. On 2026-10-01 an isolated substitute-protocol probe used a saved
`notLoaded` conversation with a completed turn and a nonexistent cwd, called
`codexSessions`, then `attachCodex`. Observation returned
`available / retained / review`; attachment exited 1. This reproduces the causal
boundary of the reported failure, not the complete original native/browser
incident. The seed records the original incident separately.

The probe's literal command and setup are retained below. It supplies vendor
metadata only; product observation and PTY startup are real. It cleaned its
private temporary directory and native server afterward.

```sh
node --disable-warning=ExperimentalWarning --experimental-transform-types --input-type=module <<'JS'
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { installFakeCodex } from './dashboard/tests/support/fakeCodex.ts';
import { codexSessions } from './dashboard/server/hosts/codex/sessions.ts';
import { attachCodex } from './dashboard/server/hosts/codex/terminal.ts';
const root=mkdtempSync(path.join(tmpdir(),'dough-retirement-premise-'));
const native=await installFakeCodex(root,process.env.PATH,true);
const session={host:'codex',sessionId:'retained-example',shortId:'retained',name:'retained example',continuation:{workspace:path.join(root,'retired-workspace'),endpoint:`unix://${path.join(root,'codex.sock')}`}};
native.observations.set(session.sessionId,{status:{type:'notLoaded'},turns:[{id:'completed-turn',status:'completed'}]});
try {
 const result=await codexSessions([{session}],AbortSignal.timeout(10000));
 console.log(JSON.stringify({workspaceExists:false,observed:result.map(r=>r.sessionState)}));
 try { const attached=attachCodex(session,undefined,{cols:80,rows:24}); attached.pty.onExit(e=>console.log(JSON.stringify({attachmentExit:e}))); await new Promise(resolve=>setTimeout(resolve,500)); attached.pty.kill(); } catch(error) { console.log(JSON.stringify({attachmentError:error.message})); }
} finally { await native.close(); rmSync(root,{recursive:true,force:true}); }
JS
```

`env -u NO_COLOR npm run test:dashboard -- agent-launch-codex-observation-status.spec.ts agent-terminal-codex.spec.ts`
passed (exit 0, quiet reporter). Setup/assertions inspect real HTTP/store and
WS/PTY boundaries with vendor substitutes: retained metadata, native status,
saved cwd/arguments, readiness, mark preservation and detach. This is preservation
baseline, not proof of the proposed report viewer. Initial execution failed
before assertions because this worktree lacked `node_modules/.bin/vite`; a
session-owned symlink to the repository's installed dependencies enabled the
passing run. Remove that symlink when this preparation finishes.

The cheapest direct observation settled current missing-cwd behavior. The native
final-report payload after retirement remains unobserved: existing recovery's
`includeTurns` read proves a candidate route exists, not its feasibility in this
case. It requires the owner's retained native endpoint/conversation; slice 1
bounds this premise before dependent product work. Do not count fake history as
native evidence. Native observation uses read-only methods and costs no new
model turn; unavailable endpoint or incompatible payload stops dependent work.

Other premises were observed by inspecting their consuming operations:
`LaunchSession` invokes `openTerminal`; `TerminalSplit.goToSession` independently
invokes terminal opening and story reveal; both consult `attachOpens` and host
capabilities. `TerminalAttachments.connect` catches attachment failure and clears
marks only after readiness. `fakeCodexObservation` handles metadata-only reads
and latest turns; `fakeCodex.ts` supplies full turns. Extend those vendor fixtures
with observed report payloads rather than synthesizing product access decisions.
These call sites are obligations for slices 2 and 3, not proof of new behavior.

## Proof ownership and verification

| Source promise | Owner and observable proof |
| --- | --- |
| Example 1: retained final report, identity, attention, card/Recent/sidebar access | Slice 2 browser journey through real HTTP/native adapter; final text visible, same host/id/project/story selected, no PTY/resume/start/input, no cwd recreation. Native payload premise owned by slice 1. |
| Example 2: existing-workspace terminal and Claude behavior preserved | Slice 1 preservation baseline; slices 2–3 rerun Codex terminal boundary/page and representative Claude terminal/sidebar navigation checks. |
| Example 3: retirement between observation and attachment | Slice 3 held page/WS journey: remove private cwd after observation, request attach, assert specific explanation and report access without generic empty terminal. |
| Example 4: uncertainty does not become retirement/deletion/completion | Slice 2 lookup-error boundary cases plus visible uncertainty; slice 3 same error at attach. Exercise explicit lookup error, not only absent-path ENOENT. |
| Example 5: result read fails conservatively | Slice 2 browser retry/failure journey, retained ID/attention and no resume, replacement or done write. |
| Example 6: viewing changes no done intent; done survives polling/concurrent updates | Slice 2 real store/polling journey including a concurrent update, plus existing `agent-launch-done-codex-races` and `agent-launch-done-codex-intent` coverage. |
| UI is read-only, understandable and usable from all entry points | Slice 2 keyboard open/close/focus return and selected session marks; slice 3 race fallback focus and meaningful status. |

Use proposed `dashboard/tests/session-workspace-retirement.spec.ts` for the
outside-in report journey and `session-workspace-retirement-boundary.spec.ts`
for lookup/native/attachment error contracts. Focused proof commands:

- Slice 1: `env -u NO_COLOR npm run test:dashboard -- agent-launch-codex-observation-status.spec.ts agent-terminal-codex.spec.ts`, plus the bounded native probe through the selected read method recorded when run.
- Slice 2: `env -u NO_COLOR npm run test:dashboard -- session-workspace-retirement agent-terminal-codex-page.spec.ts agent-launch-done-codex-races.spec.ts agent-launch-done-codex-intent.spec.ts session-sidebar-navigation.spec.ts agent-terminal.spec.ts`.
- Slice 3: `env -u NO_COLOR npm run test:dashboard -- session-workspace-retirement agent-terminal-codex.spec.ts agent-terminal-codex-page.spec.ts agent-terminal.spec.ts`.
- Changed TypeScript contracts: `npm run typecheck:dashboard`; final touched-source lint through `npm run lint` (also protects the staged pre-commit hook).

Inspect affected test consumers before changing shared fixtures; add a relevant
recovery check if their consumed native payload changes. Do not require the
whole repository suite just because CI has one. These new specs are planned
work, not claims of existing tests or passing proof. Final native report-to-view
acceptance belongs to slice 2: use the observed retained report with its missing
workspace through the real result boundary and browser; inability to cover that
journey leaves the promise pending.

Execution uses installed post-change refactoring before committing each coherent
increment and the check-only `.githooks/pre-commit` lint requirement. Publish and
own CI only under separately authorized execution. No numeric slice target or
hard limit was supplied; each slice includes implementation, focused proof and
cleanup in its bounded outcome. New evidence of hidden preparation or excessive
size requires adjusting remaining slices, preserving accepted proof.

## Ordered slices

### 1. Establish a passive retained-report contract
Type: Structure
Status: done
Proof: Bounded read-only native probe of the known saved Codex conversation with
its absent workspace, observing matching thread ID, completed-turn final report,
and no resume/start/input/interrupt. Then focused adapter contracts with that
observed payload and the existing preservation command above.

Structure: First inspect the saved endpoint and request native history for the
owner-held retained conversation without attaching a terminal or changing cwd.
Record the exact request/command, native version, result shape and covered
boundary. Use existing RPC, deadlines and connection cleanup. If successful,
expose the smallest validated passive result reader behind the host boundary,
without a new store or public UI yet. Prove wrong identity, read refusal and
unrecognized/missing report remain conservative. Keep existing native observation,
recovery and terminal behavior unchanged. This immediately enables slice 2.

Stop before dependent work if the native endpoint cannot be read or the final
report is not available without resume. Revisit this plan with that evidence;
do not silently switch to native navigation or restore the workspace.
Safe stop: current dashboard behavior remains green; feasibility is established
or dependent work is explicitly stopped. No new model turn or fixture report
counts as native proof.

Accepted proof (2026-10-01): Codex 0.159.3 returned the retained conversation
`01a0f713-8a12-75b3-980b-998b1a3841f8` through its saved Unix endpoint with
`initialize`, `initialized`, and `thread/read {threadId, includeTurns:true}` only.
Its saved workspace lookup returned ENOENT, native status was `notLoaded`, and
latest completed turn `01a0f720-5643-7d03-bc93-5cae1b02ac40` contained the final
`agentMessage` with `phase: final_answer`, string `text`, and nullable
`memoryCitation`, `delivery`, and `questions`. The actual `LaunchHost.readResult`
adapter returned the exact report: landing at `a5df85d90a`, new story 3, story 2
not ready, released Preparing assignment, refreshed integration, removed worktree
and branch, and no product code change. The live machine document was byte-for-byte
unchanged; its newer `doneAt: 2026-10-01T11:18:09.545Z` was preserved. This newer
done intent changes the native acceptance precondition, not story scope.

Literal adapter probe: `node --disable-warning=ExperimentalWarning
--experimental-transform-types --input-type=module` imported `launchHost`, read
the matching saved record from `~/.open-dough/dashboard/agent-launches.json`, and
called `launchHost('codex').readResult(record.session,AbortSignal.timeout(10000))`.
It compared exact final text/turn ID with the prior passive native read, statted
the saved cwd, and compared before/after document bytes; exit 0. Compact temporary
native payload `/tmp/open-dough-seed-076-native-report.json` was reused for
slice 2's real-native report-to-view observation and then disposed after judgment.

`npm run typecheck:dashboard` and
`env -u NO_COLOR npm run test:dashboard -- session-result-codex.spec.ts
agent-launch-codex-observation-status.spec.ts agent-terminal-codex.spec.ts`
passed. The four result cases inspect the real host/RPC boundary against vendor
payloads: exact report with absent cwd and passive method whitelist, id/cwd
mismatch, refusal/disconnection/cancellation/retry, and latest-result uncertainty.
The setup checks no cwd creation and closed native connections. Existing focused
specs preserve native observation, saved-cwd continuation, detach, readiness, and
done marks. Shared vendor fixtures and recovery were unchanged. Independent
post-change refactoring returned `none — already clean`; subsequent test lint
repairs preserve the same setup/assertion semantics. No public report route or
view is claimed until slice 2.

### 2. Review retained results when their workspace is unavailable
Type: Behavior
Status: done
Proof: New outside-in report journey selects the same retained session from a
story card, Recent sessions and sidebar. Remove only a private fixture workspace;
observe truthful limitation, final report, project/story association, keyboard
focus and unchanged identity/attention/marks/store across refresh. Simulate a
lookup error, result refusal, retry and concurrent record update. Inspect native
call log and filesystem to prove no resume/input/recreation. Run slice 2 checks
and native report-to-view acceptance above.

Behavior: Given a retained conversation needing review and a confirmed missing
saved workspace, refresh/select opens its read-only final report inside the
dashboard and explains terminal unavailability. Existing-workspace sessions
keep terminal access. Uncertain workspace/result reads say what is unknown and
retain the conversation and attention; retry observes the same identity.
Opening/closing review changes no done mark; deliberate Mark as done continues
to suppress attention across polling and concurrent updates.

Integrate workspace observation, bounded recorded-session result access and
presentation in this slice; do not fragment it into server/UI/test deliveries.
Reuse existing catalog/session admission checks, shared access decision and
project/story reveal; accept host-qualified recorded sessions, not arbitrary
paths/endpoints supplied by the browser. Render native report text read-only,
including formatting needed to read the landing report, without executing its
content. Cancel/close returns focus to the invoking session control. A pending
or failed report read must not leave another session's result shown as this one.
Update maintained launch/navigation and troubleshooting documentation for this
new behavior. Preserve any unfinished architecture-review direction.
Safe stop: sessions whose workspace is already observed missing have usable
review access; the subsequent action-time race is still explicitly slice 3.

Accepted proof (2026-10-01): the real observation/store/HTTP/native boundary and
browser show the same report from card, Recent sessions and sidebar, preserving
project/story selection, attention and host-qualified identity. Keyboard opening,
Command+Shift+Escape/Close focus return, current session marks and the story-card
outline are observed. Script-shaped report content renders as escaped text.
Missing directories never get recreated. Real ELOOP lookup remains unknown;
native read refusal offers retry with no stale text or done write. A held result
cannot appear under the next session's identity. Deliberate Mark as done survives
poll/reload and a concurrent retained-record addition; merely opening/closing
the report leaves document bytes unchanged. Result admission rejects wrong
source/host/ID, arbitrary endpoint, external origin and wrong method before native
result access. Filesystem boundary covers available, ENOENT, non-directory and
ELOOP without changing the session.

Native report-to-view acceptance passed using an isolated exact copy of the live
Doughnut record (same source/story/host/ID/endpoint/cwd/newer doneAt). Actual
`/__agent-launch/result` returned the precise landing report; the browser displayed
that same text and identity, showed no terminal, and returned focus on Close.
Both the private record document and original live document bytes/hash were
unchanged; the original cwd remained absent. Literal command:
`DOUGH_NATIVE_REPORT_ACCEPTANCE=1 env -u NO_COLOR npm run test:dashboard --
session-workspace-retirement agent-terminal-codex-page.spec.ts
agent-launch-done-codex-races.spec.ts agent-launch-done-codex-intent.spec.ts
session-sidebar-navigation.spec.ts agent-terminal.spec.ts` — exit 0, 19 tests in
8 files before test extraction. The first native attempt failed before report
assertions because fake published GitHub lacked the Doughnut project response;
using its existing published-origin fixture fixed that isolated setup gap.
The owner-specific native acceptance spec and temporary payload were disposed
after inspection under ADR 0005 §5; deterministic regression fixtures remain.

Independent refactoring consolidated kept host-qualified lookup in the store,
session admission, and mutually exclusive terminal/report selection with focus.
It exposed the missing report story-card outline, now covered before acceptance.
`SessionAccess` and shown-session identity have one owner across current callers;
terminal, done and delete retain their existing folder and readiness requirements.
Focused post-refactor proof:
`env -u NO_COLOR npm run test:dashboard -- session-workspace-retirement.spec.ts
session-workspace-retirement-done.spec.ts session-result-admission.spec.ts
agent-terminal-codex-page.spec.ts agent-terminal-done-codex-page.spec.ts
agent-launch-done-codex-races.spec.ts agent-launch-done-codex-intent.spec.ts
session-sidebar-navigation.spec.ts agent-terminal.spec.ts
agent-terminal-maximize.spec.ts agent-terminal-close.spec.ts
agent-terminal-delete.spec.ts` — exit 0, 23 tests in 12 files.
`npm run typecheck:dashboard` and `git diff --check` passed. Setup now resides
in `tests/support/retainedReport.ts`; separate admission and deliberate-done specs
preserve their assertions. Native reader, report rendering and filesystem
observation were unchanged by refactoring, so their accepted proof was reused.
No shared native vendor fixture changed. Maintained launch, navigation and
troubleshooting documentation describes report access and its conservative limits.

Later-outcome check: hiding terminal continuation only for missing/inconclusive
saved directories is compatible with slice 3's existing-directory attachment and
specific fallback after later disappearance. No session/history/state is removed.

### 3. Explain workspace loss at the attachment boundary
Type: Behavior
Status: done
Proof: Hold the journey after an existing-workspace observation, remove its
private directory, then request terminal attachment through the real boundary.
Assert a specific missing-workspace explanation and usable same-session report
access, no empty-terminal generic failure, no restored cwd and unchanged done
intent. Inject an inconclusive lookup at this point and preserve uncertainty.
Run slice 3 checks and verify ordinary saved-cwd continuation remains green.

Behavior: A workspace can disappear after refresh. Attachment checks its saved
directory at the action boundary; confirmed absence redirects access to the
read-only report with a truthful explanation. Lookup failure cannot claim
retirement. If absence occurs between check and process start, preserve the
failure and re-observe cwd to identify established absence before presenting
that specific fallback; do not infer it from a generic exit code. Other startup
failures retain their existing meaning. No fallback resumes elsewhere or clears
a done mark. Race-time status/focus lead to the same view from slice 2.
Safe stop: all story examples have their mapped proof; update remaining docs
and retain completion/review evidence for authorized execution wrap-up.

Accepted proof (2026-10-01): the Codex host synchronously reuses the saved
workspace observer before native attachment. Missing/inconclusive observations
travel through the existing binary WebSocket control channel to the same
read-only report. Spawn failure or exit before readiness re-observes the saved
cwd; existing-directory failures retain generic attachment semantics. Readiness
alone can reopen done intent. No pending asynchronous attach lifecycle was added.

`env -u NO_COLOR npm run test:dashboard -- session-workspace-retirement
agent-terminal-codex.spec.ts agent-terminal-codex-page.spec.ts
agent-terminal.spec.ts agent-terminal-resize.spec.ts
agent-launch-host-identity.spec.ts agent-terminal-done-codex-page.spec.ts`
passed. The three held-browser attachment cases preserve an actual initial
available-directory HTTP answer, then remove cwd, establish ELOOP, or lose cwd
inside the vendor PTY before readiness. Real WS/result boundaries show the exact
same-session report, missing versus uncertain wording, selected marks, focus and
Close focus return, no generic terminal failure, no recreated cwd, unchanged
store/done intent and passive RPCs. The startup case checks original cwd/arguments
and the exited process. `session-workspace-retirement-startup.spec.ts` schedules
real directory removal at the external native spawn boundary after a successful
check, then invokes real node-pty startup with that absent cwd. Product transport
re-observes absence and emits the limitation without readiness or replacement
input. Existing selected specs preserve Codex saved context/input/readiness/detach,
generic failures, legacy missing-endpoint 1011/no Claude substitution, Claude
selection/Close and both resize-race consumers.

Independent refactoring removed obsolete asynchronous observation wrappers and
guarded all disposed-attachment callbacks, including a later retry of the same
request. The real-browser/socket/PTY lifetime regression was extracted to
`session-workspace-retirement-lifetime.spec.ts`: controlled late readiness,
workspace-refusal and output events from the old socket cannot redirect the
current terminal, inject output, request a report or disturb current input;
store bytes remain unchanged. Refactor proof passed:
`env -u NO_COLOR npm run test:dashboard --
session-workspace-retirement-attach.spec.ts session-workspace-retirement.spec.ts
session-workspace-retirement-done.spec.ts agent-terminal-codex-page.spec.ts
agent-terminal.spec.ts agent-launch-host-identity.spec.ts
agent-terminal-done-codex-page.spec.ts
agent-launch-codex-observation-status.spec.ts`, then
`env -u NO_COLOR npm run test:dashboard --
session-workspace-retirement-lifetime.spec.ts` after extraction.
`npm run typecheck:dashboard` and `git diff --check` passed. Native report
acceptance, filesystem and spawn/exit transport, and resize proof were unchanged
and reused. Documentation now covers action-time and failed-start fallback.
All implementation files remain below 250 lines after formatting. Mechanical
lint corrections annotate decoded JSON as unknown, remove obsolete test async
and an unnecessary optional chain; no runtime behavior changed.

## Current decisions and preparation review

- One observation model keeps conversation, workspace, activity and done intent
  distinct. Access decisions reuse it; there are no entry-specific status models.
- The selected report view is in the dashboard. Full transcript browsing and
  alternate-workspace continuation remain deferred.
- Three slices contain one immediate enabling Structure and two observable
  Behaviors. Retired-session review spans layers and entry points because it
  has one coherent user result; the action-time race has a separate trigger and
  proof loop. No independent second outcome or speculative framework is included.
- No remaining slice-boundary, proof-ownership or sizing concern was found.
  Native feasibility and report-to-view acceptance were established in slices
  1–2; their unchanged boundaries retain that proof. All three slices are done.
- The original preparation assessment supplied plan readiness; Terry's current
  execute-plan invocation supplies execution/publication authority. Readiness
  was not renewed by execution evidence updates.
