# See and answer Cursor's workspace trust prompt when a session starts

**Identity:** SEED-066#cursor-trust-prompt-at-session-start
**Source:** [correction story](../../seeds/SEED-066-composable-lightweight-session-options.md#cursor-trust-prompt-at-session-start)

## Source and provenance

Bounded correction from [SEED-066#unattached-session-native-observation](../../seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-native-observation)
(plan 301), observed 2026-10-13 in Lizard with dashboard `e40d6854c99b` and
Cursor 2026.10.01-e373342. Terry accepted planning this correction the same day.

## Current findings

Original Lizard observation: dashboard `e40d6854c99b`, Cursor `2026.10.01-e373342`,
launch `2d5ab090-e36e-4f52-afd9-24363e66c8c7`,
chat `2787e58b-228e-4e60-96e2-b7ccfcf51cee`, new `.worktrees/session-2`.
The uncertain/timed-out launch, Startup recovery and entry did not name trust;
joining twice at different sizes delivered readiness only and a blank screen.
A private pty showed “Workspace Trust Required … [a] Trust this workspace / [q] Quit”.
Dashboard terminal `a` delivered the instruction and confirmed first input.
At `52a4f6e9`, launch used generic timeout wording, recovery recognized trust,
and the terminal contract relied on redraw.
Slice 1 establishes the absent screen's cause and fixes that boundary below.

## Goal and scope

When Cursor holds its workspace trust prompt at launch, the dashboard names and
shows it; the developer's terminal answer delivers the first input.

Preserved: no `--trust`, `--force` or `--yolo` flag and no answer typed by the
dashboard ([AGENT-LAUNCH-HOSTS.md](../../../dashboard/AGENT-LAUNCH-HOSTS.md));
the kept client, its instruction delivery on the first ready screen, and the
record's uncertain state until then; recovery's existing trust stop; wording
of other uncertain outcomes; Claude Code and Codex launches.

Excluded: trusting workspaces in advance, changing where isolated sessions are
created, the missing Cursor completion report seen in the same journey, and
retirement, which [plan 304](../304-retire-established-session-worktree/PLAN.md)
owns.

## Current decisions

- Reuse the trust recognition `recover.ts` owns; move it to a shared home only
  if both callers need it. Do not add a second phrase list.
- The trust wording replaces the timed-out explanation only when the held
  screen shows the prompt; the outcome stays `uncertain`, because the first
  input is still undelivered.
- Dashboard source only; no skill payload and no release. Follow
  [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md): the
  Cursor behavior needs native evidence, and substitute-client specs prove
  only their own boundary.

## Execution context

- Execution mode: story-branch; publisher `dashboard-territory.local-open-dough`;
  agent `d.kanai-chan`.
- Originating and execution checkout:
  `/Users/terryyin/git/open-dough/.worktrees/see-and-answer-cursor-s-workspace-trust-prompt-w`;
  reused owned worktree on `codex/see-and-answer-cursor-s-workspace-trust-prompt-w`.
  No integration checkout supplied; authorized trunk `origin/main`;
  increments publish to this execution branch.
- Starting revision `605e5b8bfb34f6a93f6326e64a9e7a277610da20`; claim accepted
  on `origin/main`: `310f729d31696ee83686f10684c808ab8cab432b`, first increment's
  published base. Claim CI is unobserved on trunk.
- Checkout setup: `npm ci`, then `npm run --silent typecheck:dashboard`, both
  passed on 2026-10-14 with the current `package-lock.json`.
- Replanning retains existing authority within this outcome, with no numeric
  slice limit. Use the bounded proof loop; no generation trigger is implicated.
- CI source: GitHub Actions, verified `ci.yml` / `CI`,
  `terryyin/open-dough`, execution branch above.
  Coordinator `seed066-cursor-trust`, installed runtime in this checkout,
  First observer stopped for the slice 1 decision: matching stopped receipt,
  no unread evidence, CI unobserved, PID exit confirmed, no increment.
  Terry authorized the native investigation and continuation on 2026-10-14.
  Resumed observer `/tmp/dough-ci-501/watch-j5qciV`,
  PID `56569`, stream session `57326`, yielded cell `5`, same coordinator,
  checkout, repository, workflow and execution target.
- Slice 1 accepted: `12feacafe168c84fe73faecbea31d0ca9c83f6e3`, base the claim;
  managed delivery reused the exact observer above, maintenance not applicable.
- Slice 2 accepted on the same remote branch: `0c6e4066f1e5d48c3675b0d50ef428eca62520c6`;
  suffix base slice 1, exact observer reused, maintenance not applicable.

## Outside-in proof ownership

| Promise | Owning slice and observation |
| --- | --- |
| The cause of the empty joined terminal is known | 1: a spec with a substitute client holding a trust screen at launch, joined after the launch wait, shows what the socket receives |
| The joined terminal shows the held trust prompt | 1: the same spec, once passing, reads the prompt text in the terminal |
| The launch answer, Startup recovery and session entry name workspace trust | 2: a launch-wait spec with the substitute trust screen reads all three |
| Answering in the terminal delivers and confirms the first input | 2: the spec types the answer and reads the delivered instruction and `confirmed` record |
| Real Cursor behaves the same in a new worktree | 3: one native Start session in an untrusted worktree |

## Ordered slices

### 1. A terminal joined to a held Cursor client shows its current screen
Type: Behavior
Status: done
Proof: focused Playwright spec beside `dashboard/tests/agent-terminal-cursor-launch-wait.spec.ts`,
using the existing substitute Cursor client, run with `--reporter=list`.

Behavior: a kept client holds a trust prompt; opening its terminal shows it.
First reproduce the empty screen with the substitute. If it does not reproduce,
record what differs from native and stop for a decision before terminal changes.

Accepted investigation and implementation on 2026-10-14:

- The original completed-frame trust substitute showed its prompt on join and
  reconnect (2 dev/preview tests). It did not reproduce the native failure.
  Terry then authorized one bounded native investigation and continuation.
- Production `execCursor` / `spawnCursorPty` opened Cursor
  `2026.10.01-e373342`, chat `df40ecf2-0d3e-4b47-9e4b-0cb69d671cf7`, in a fresh
  temporary fixture worktree detached at the claim revision. The 80×24 trust
  screen emitted 1,889 bytes with no completed synchronized frame; synchronous
  81→80 nudge emitted zero bytes; sustained 120×40 resize emitted 2,586 bytes.
  `q` quit, exit 0, with no instruction or model turn. The internal signal
  handling is not inferred. Native redraw alone cannot ensure join visibility.
- The new unframed/no-redraw substitute reproduced blank joins in both modes
  before product changes. Reuse the existing `KeptClientScreen` model with
  pinned xterm serialization; replay dimensions and ANSI current viewport to
  the joining socket before live output, then fit the browser panel. Existing
  sockets receive only live output; incomplete paints stay incomplete.
- Accepted proof: `npm run test:dashboard -- dashboard/tests/agent-terminal-cursor-trust-join.spec.ts --reporter=list`
  passed 4 tests after the 2 native-shaped RED failures. The same sole client
  survives reconnect, first input stays uncertain and no instruction is typed.
- `npm run test:dashboard -- 'dashboard/tests/.*terminal.*\.spec\.ts' dashboard/tests/claude-prompt.spec.ts dashboard/tests/kept-client-screen-replay.spec.ts dashboard/tests/joined-sockets-replay.spec.ts --reporter=list`
  passed 133 tests in 48.1s. Inspected browser trust-page assertions observe
  rendered prompt/choices, rendition, hidden cursor, fitting without temporary
  resize, reconnect and input. Screen replay tests observe both buffers,
  positioned cursor/pending wrap, resized current viewport and incomplete
  frames. Socket replay tests observe live ordering and admission race.
  All three hosts' shared terminal consumers ran; no known consumer is unrun.
- Diagnosed failures: stale fixture stdout dimensions supplied no kernel proof;
  unrelated assertion removed. Serializer needed explicit full-row cursor
  positioning preserving wrap; admission had to preserve its replay gate.
  Two prior equality assertions compare the common live suffix after new-socket
  replay; each affected observation passed. `npm ci` on the new lock and final
  `npm run --silent typecheck:dashboard` passed. Current viewport only; no history replay.
  Accepted native capture and clean fixture removed; execution checkout retained.
  Independent refactor completed: shared control type and extracted registry
  options preserve the accepted boundaries; typecheck passed. Formatter's
  unused-type finding was repaired, and final `npm run format` passed.

### 2. An unanswered trust prompt is named where the developer looks
Type: Behavior
Status: done
Proof: extend the launch-wait and Startup recovery specs for Cursor with the
substitute trust screen; then the whole dashboard suite and `npm test`.

Behavior: the wait ends on the trust prompt → launch answer, Startup recovery
and entry name workspace trust and say to answer in the session's terminal.
The answer writes the kept instruction and confirms first input. Other screens
retain today's timeout wording.

Accepted slice 2 proof on 2026-10-14:

- The existing held-session read now supplies an optional trust indicator from
  the current screen. Launch names it for the same held session and updates
  the uncertain first input through a locked record mutation. Shared recovery
  recognition and trust stop are preserved; legacy reads retain generic wording.
- `npm run test:dashboard -- dashboard/tests/agent-terminal-cursor-launch-wait.spec.ts dashboard/tests/cursor-startup-trust.spec.ts dashboard/tests/cursor-session-recovery-stops.spec.ts dashboard/tests/cursor-session-recovery-wait.spec.ts --reporter=list`
  passed 9 tests after the trust-specific RED failures. Raw dev/preview tests
  and the actual Start page observe the explanation, no input before `a`,
  exact instruction delivery and confirmed state on the same client. Other
  timeout wording and recovery's trust stop remain covered.
- `env -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed066-slice2-dashboard-controlled-proof.json npm run test:dashboard -- --workers=4`
  exited 0: strict receipt completed/passed, all 1,625 tests passed without
  skips or retries (1,092.290s, run `1763d9f1-69b3-4b84-8f72-88d57452706e`).
  All found receiving consumers ran, including shared records and all hosts.
  Independent refactor: none — already clean; accepted proof unchanged.
  `PATH=/opt/homebrew/bin:$PATH npm test` and dashboard typecheck passed.
- Earlier attempts reached terminal results: Bash 3.2 refused startup; inherited
  color flags failed stderr proof, then the owned run exited interrupted before retry.
  The clean default-worker full run
  had 1,624 passes and one unchanged Claude journey exhausting its 30s budget
  under overlapping shell proof. With unchanged source/deadline, that journey
  passed focused (10.1s) and inside the controlled full run (5.876s). The final
  whole proof supplies acceptance; no test deadline or helper was changed.

### 3. Cursor's real trust prompt is seen and answered from the dashboard
Type: Behavior
Status: done
Proof: one manually triggered or explicitly authorized paid native journey with
slices 1–2: Start session · Isolated workspace on Cursor in an untrusted worktree.

Behavior: dashboard names trust; terminal shows Cursor's prompt; answering
delivers the Established session block and confirms first input. Record Cursor
version, dashboard revision, launch and result here and in plan 301 slice 3.

Native acceptance on 2026-10-14, one authorized initial journey:

- Candidate `0c6e4066f1e5d48c3675b0d50ef428eca62520c6`, built loopback preview
  `http://127.0.0.1:54669`; isolated dashboard home/runner, native CLI/auth via
  temporary shims; machine runner untouched. `npm run test:dashboard` and shell
  proofs above passed before this live action.
- Lizard clean at `34c50f0d3140307cf4db96a893a9c138741dc448`, `origin/master`;
  complete tagged `0.3.61` installation: 251 files compared in both roots,
  zero mismatches; unattached capability true. Cursor `2026.10.12-d47ca18`,
  Auto. Fresh unpaid preflight still showed unframed trust/no nudge redraw;
  `q` quit without instruction, clean fixture removed.
- Start session · Isolated workspace · Automatically land; literal question:
  “Tell me the current working directory. Make no changes.” Launch
  `f6c25d01-b137-4c6b-94bc-c1634c6f7425`, chat
  `d1264523-ee3c-4600-ab6e-58ef4add70f6`; one new worktree
  `/Users/terryyin/git/lizard/.worktrees/tell-me-the-current-working-directory-make-no-ch`
  on the same suffix under `cursor/`, at Lizard's starting revision.
- CUA accessibility and screenshot observed uncertain/timed-out trust wording
  in launch answer, Startup recovery and entry. First terminal opening visibly
  showed “Workspace Trust Required”, the actual new path, and `[a]`/`[q]`
  before any answer. Runner read showed one client and workspaceTrust true.
- CUA terminal key `a` showed “Trusting workspace…”, then native `pwd` returned
  that worktree and the entry read “First input accepted”. Durable input was
  confirmed with no pending explanation. Native prompt_history/pasted_text
  contained exactly the one retained 2,485-character Established session block,
  reporting context and question; same chat/sole client. Worktree stayed clean
  at the starting revision. No workflow, publication or retirement proof added.
- Judged result: Good. Cleanup removed the owned runner, preview, tab, clean
  worktree/branch, native chat capture and temporary files. Both plans retain
  evidence; plan 301's retirement/completion-report gaps remain separate.
  Independent records refactor preserved proof and linked plan 301 history;
  all changed files meet 250 lines, links and `npm run format` passed.

## Story obligations

### G1. Native empty-screen cause and current-screen repair remain unresolved
Reported: slice 1 — "Cause of the native empty joined screen remains unknown; current-screen replay repair remains unimplemented."
Story clause: "Opening that session's terminal shows the prompt the client currently holds."
Disposition: proved by slice 1: dashboard/tests/agent-terminal-cursor-trust-join.spec.ts and agent-terminal-cursor-trust-page.spec.ts prompt visibility assertions

### G2. Trust explanation and first-input confirmation await slice 2
Reported: slice 1 — "Timeout trust wording and developer answer → first-input confirmation remain slice 2."
Story clause: "When the launch wait ends while the kept Cursor client shows its workspace trust prompt, the launch answer, Startup recovery and the session entry say that Cursor is waiting for workspace trust and that it is answered in the session's terminal."
Disposition: proved by slice 2: dashboard/tests/agent-terminal-cursor-launch-wait.spec.ts and cursor-startup-trust.spec.ts explanation, exact instruction and confirmed record assertions

### G3. Rendered dashboard and native Cursor proof await slice 3
Reported: slice 1 — "This raw-socket substitute proof establishes neither native acceptance nor page rendering."
Story clause: "A developer who starts a Cursor session in a workspace Cursor has not trusted learns from the dashboard that Cursor is waiting for workspace trust, sees that prompt in the session's terminal, and gets the first input delivered once they answer it."
Disposition: proved by slice 3: native CUA trust screen and three explanations; native prompt_history/pasted_text exactly matches retained input, confirmed record and pwd in the same worktree
