# Session review after workspace retirement

**Identity:** SEED-076#session-after-workspace-retirement
**Source:** [refined story](../../seeds/SEED-076-session-after-workspace-retirement.md#session-after-workspace-retirement)
**Authority:** Planning only. No Take, implementation, commit, or publication.
**Preparation:** Reused the established workspace
`/Users/terryyin/git/open-dough/.worktrees/show-truthful-session-access-after-its-workspace`,
branch `codex/show-truthful-session-access-after-its-workspace`, starting revision
and published assignment `bb1b005555cbbc0d83cf8d68df7743dbf5a4482a`,
agent `jackson-chan`, remote `origin`, target `main`, integration checkout
`/Users/terryyin/git/open-dough`. Git branch, HEAD, worktree listing and
`refs/worktree/dough/created-for/` confirmed the supplied identity.

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
Status: planned
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

### 2. Review retained results when their workspace is unavailable
Type: Behavior
Status: planned
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

### 3. Explain workspace loss at the attachment boundary
Type: Behavior
Status: planned
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

## Current decisions and preparation review

- One observation model keeps conversation, workspace, activity and done intent
  distinct. Access decisions reuse it; there are no entry-specific status models.
- The selected report view is in the dashboard. Full transcript browsing and
  alternate-workspace continuation remain deferred.
- Three slices contain one immediate enabling Structure and two observable
  Behaviors. Retired-session review spans layers and entry points because it
  has one coherent user result; the action-time race has a separate trigger and
  proof loop. No independent second outcome or speculative framework is included.
- No remaining slice-boundary, proof-ownership or sizing concern was found in
  this review. Native feasibility is not claimed passed: it is bounded by the
  first slice's stop condition before implementation of dependent behavior.
- This preparation's readiness assessment is plan review, not execution or
  publication authority. All slices remain planned.
