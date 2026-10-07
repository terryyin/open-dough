# A private Claude Code rename types only at a ready prompt

**Identity:** SEED-116#claude-done-rename-readiness-correction
**Source:** [correction story](../../seeds/SEED-116-claude-done-rename.md#claude-done-rename-readiness-correction),
from the execution retrospective of SEED-116#claude-done-rename
(`bcb39b01:.planning/seeds/SEED-116-claude-done-rename.md`, plan
`bcb39b01:.planning/slice-plans/267-claude-done-rename/PLAN.md`), delivered by
commits ed9a306e, 0bd831be and bcb39b01 (net diff `fef99b34..bcb39b01`) on
`claude/a-claude-code-session-marked-done-is-renamed-wit`.
**Prepared:** 2026-10-07. Planning only; refined in the established preparation
workspace on `codex/a-private-claude-code-rename-types-only-at-a-rea`, base
`fc2fbdc6c3e9303c4e8b1e0bc0b92ef5bb1cd35d`. Existing plan and identity retained.

## Required execution context

Read these linked parts of this same plan before executing their affected slice:

- [Correction contract](CORRECTION-CONTRACT.md): goal, examples, findings, and preserved promises.
- [Design and delivery decisions](DESIGN-AND-DELIVERY.md): existing solutions, retry and timing decisions, setup, delivery gates, and refinement review.
- [Proof and observations](PROOF-AND-OBSERVATIONS.md): premises, preparation observations, proof owners, and commands.

## Ordered slices

Slices 2–4 do not depend on slice 1 and may run while its observation is
pending. Slice 5 starts after slice 1's accepted marker/timing and slice 4's
signal seam; it keeps its fake and product changes in one green delivery.

### 1. A real Claude Code attach prompt is observed
Type: Behavior
Status: done
Owner: executing agent, explicitly authorized by Terry on 2026-10-07; early probe, no product implementation.
Proof: the accepted native observation in [proof and observations](PROOF-AND-OBSERVATIONS.md#accepted-execution-proof-slice-1), including the prompt marker, T, and native listing confirmation.

Behavior: a developer-selected finished session is still running and idle
with no page terminal → the owner observes its native attach → the ready
prompt is distinguishable from earlier output at 80×24, typed `/rename` is
confirmed by the listing, and prompt timing is recorded for slice 5.

The original execution recorded an auto-mode refusal of an agent's real
attach. Terry explicitly authorized the executing agent to perform this credentialed
probe on 2026-10-07. The agent selected a dedicated one-turn probe session,
completed idle before attach; no unrelated session was modified. The owner
chooses a session they intend to finish and captures its native attach:

```sh
cd /Users/terryyin/git/open-dough
claude agents --json --all            # pick one with "status":"idle"
script -q /tmp/claude-attach.typescript claude attach <short id>
# Use an 80×24 terminal for this capture and record time to the ready prompt.
# The moment the input prompt shows, type: /rename done-<its name>  Enter,
# then Ctrl+Z.
claude agents --json --all | grep -o '"name":"done-[^"]*"'
```

Record: T measured from starting attach to the first ready prompt, without
including time spent typing or detaching; the native version and session;
what the prompt looks like; and whether the listing shows the new name. The
executing agent then renders
`/tmp/claude-attach.typescript` through `KeptClientScreen` (xterm headless,
80×24 as the private client) up to before the typed `/rename` echo, and
records the screen text and the stable marker that slice 5's predicate will
use. Read both the pre-prompt and ready snapshots through that same renderer;
terminal prose or a replay that does not distinguish those states is not
sufficient evidence. Stop rule: if no stable marker distinguishes the ready
prompt from the screen before it, or the rename typed at the prompt is not confirmed, stop
slice 5 and replan. If T exceeds roughly three seconds, apply the decision
point above.

Safe stopping point: the real marker and timing are known; a failed probe
leaves the current product untouched and stops slice 5. Slices 2–4 remain
independent. This probe is not evidence that the corrected dashboard works.

### 2. Example 3: Recently done renames a retired-workspace session with an old problem
Type: Behavior
Status: done
Proof: `session-workspace-retirement-claude.spec.ts` green, with the case
below for each of the two old texts.

Behavior: a recorded Claude session whose saved workspace was removed, still
running and idle (`done-live`), marked done earlier with one of the two old
stored problem texts above → the developer opens the page and clicks Mark as
done on its Recently done entry → the entry shows `Named done-<name>` and no
longer shows the old text or any problem, the listing names `done-<name>`,
and the fake saw one private attach whose lines are `/rename done-<name>`.

Includes: replacing the HTTP `markDone` call in the existing case at
`:142-170` with the page click, seeding `doneAt` and the old `doneProblem`
through `recorded()`/`save` before the page loads. No product change is
expected; if the case fails, that is a product defect this slice fixes.

Safe stopping point: the old-problem recovery is proved through the page,
without changing the native prompt assumption or stopping policy.

### 3. `keepRecord` requires its Done owner
Type: Structure
Status: done
Proof: `agent-completion-recovery.spec.ts`,
`agent-completion-early-recovery.spec.ts`, `agent-completion-binding.spec.ts`,
`agent-completion-identity.spec.ts` green; typecheck; lint.

Correction: removes the production comment and optional parameter that exist
only for out-of-process test writers. The locked binding write is exported by
its own name and returns the early report; `keepRecord` requires `doneMarks`
and starts the reported Done after it. The four test writers named in current
decisions call the binding write, in the same change. External behavior is
unchanged; enables nothing further.

Safe stopping point: the binding and its completion owner have one explicit
contract, with deletion, reserved-receipt, early-binding, and recovery journeys
still green. No new native operation or persistence authority is introduced.

### 4. One rename signal, owned by the Done that runs
Type: Structure
Status: done
Proof: typecheck; `agent-completion-quiet-claude.spec.ts` (manual Done during
the wait, server closed mid-wait), `agent-launch-done-stop.spec.ts`,
`agent-launch-done-rename-wait.spec.ts`, `agent-launch-done-close.spec.ts`,
`agent-terminal-done-reopen.spec.ts`, `agent-completion-quiet.spec.ts`,
`agent-completion-cursor.spec.ts` green; one new case in
`agent-launch-done-close.spec.ts`: a manual Done waiting on a `working`
session while the server closes leaves a record that does not show `Named`
(its `doneProblem` is one of the four texts); lint.

Correction: `NativeDoneMarks.track` creates the controller and passes its
signal to the Done it runs; `NativeDone` carries it for both intents;
`LaunchHost.rename`'s `stopped` is required and `renameInClaudeCode` drops its
default. A reported Done abandoned writes nothing, as today; an abandoned
manual Done records its rename failure as today's outcome would. Behavior is
otherwise unchanged. Preserve manual stop after rename failure. Where a
spec externally makes a stopped fake session run again, describe that as a new
precondition rather than proof of the deferred retry promise. Cancellation
reports the existing cause for its stage of the rename wait; the reported
abandonment still discards that late write.

Safe stopping point: both Done intents share their lifecycle owner, and an
abandoned manual attempt cannot advertise a confirmed native name. This is a
direct correction of finding 4; it also supplies slice 5's cancellation seam.

### 5. The private rename attachment types only once Claude Code's prompt shows
Type: Behavior
Status: done
Accepted proof: [slice 5 proof](SLICE-5-PROOF.md), including the real dashboard observation.
Proof: the new cases below in `agent-launch-done-prompt.spec.ts`; existing
`agent-launch-done-stop`, `agent-launch-done-rename-wait`, `agent-launch-done-prompt`,
`agent-launch-done-close`, `agent-terminal-done-reopen`,
`session-workspace-retirement-claude`, `agent-completion-quiet-claude`,
`agent-completion-binding`, `agent-completion-quiet`,
`agent-completion-cursor`, `agent-launch-card-done`,
`agent-launch-done-question`, `agent-launch-done-codex-races`,
`agent-launch-done`, `session-unread-report` green; the 15 specs that read the
fake attach's text green (`agent-terminal`, `agent-terminal-reopen`,
`agent-terminal-maximize`, `agent-terminal-boundary`,
`agent-launch-ad-hoc-sessions`, `session-sidebar-keyboard`,
`frame-sessions-look`, `agent-launch-ad-hoc-terminal`,
`agent-terminal-lifetime`, `story-panel-switching`,
`session-sidebar-navigation`, `agent-terminal-done-question`,
`agent-terminal-keyboard`, `agent-terminal-avatar`, `side-panel-width`);
then the whole dashboard suite; typecheck and lint. One owned real-host
Mark as done with no page terminal, followed by native listing confirmation,
checks the corrected dashboard against the marker observed in slice 1.
The executing agent completed this observation with a dedicated probe; the
fake and slice 1's direct rename remain separate evidence.

Behavior: a recorded Claude session is idle with no terminal open, and its
attach shows `attached …` at once but its prompt only after a delay shorter
than the wait → Mark as done → the record shows `Named done-<name>` with no
problem, and the attach's recorded lines are exactly `/rename done-<name>`
(at `bcb39b01` the same case fails: the keys arrive before the prompt and are
discarded). With the prompt delayed past the wait → `The terminal attachment
could not be opened.`, no lines typed, the attach ended by SIGHUP. With an
open page terminal, typing is as today.

Before changing production, make the fake emit the observed prompt late and
discard early keys; run the delayed-prompt case against the unchanged rename
path and require the expected confirmation failure. If it already passes,
stop this remedy and investigate the symptom rather than claiming a fix.
Keep that red setup uncommitted until the whole slice is green.

Includes: the Claude prompt predicate from slice 1 in
`dashboard/server/hosts/claude/`; `WithAttachment` and
`TerminalAttachments.withAttachment` take the predicate the rename supplies,
and `openPrivate` waits for a recorded screen that satisfies it, re-evaluated
after each output settles, ended by `signal` or the client's exit. Extend
`LiveTerminalClient` and its existing `DetachedIdleWatch`/`KeptClientScreen`
observation to provide the settled text and cursor visibility to that wait;
the current `screenText()` is only a read, not a readiness subscription. Reuse
the client's existing screen, output stream, and tracked lifetime. Aborts,
exit, or a false prompt never start typing; remove any wait listener on every
settlement. Preserve one deadline for idle, prompt, key entry, and confirmation,
including the key pauses; do not restart the wait after readiness. Keep the
fake's prompt marker, delay file, pre-prompt key discard, support control, and
README line in this same slice; the comments at `terminalAttachments.ts:124-128`,
`:159-161`, `launchHosts.ts:55-60`, `nativeAttach.ts:1-3`, and
`AGENT-LAUNCH-TERMINALS.md:97-101` say the private attachment types once
Claude Code's prompt shows.

Safe stopping point: delayed-prompt success, bounded failure/cleanup, and
real-host confirmation establish the correction. If the real host disagrees,
keep the failure and change the predicate/proof in this same slice; do not
claim the real-host outcome from green fake tests alone.

## Execution complete

Product advice: no change. The correction establishes host-owned, bounded
private rename through existing terminal observation and Done ownership.
Retain Terry's deferred manual-retry decision and current product priorities.
Retrospective: no implementation, architecture, test-cleanup or supported
process finding; plans unchanged. Published manifest: `c5b7cc8b`, `e7b25862`,
`c611e187`, `59baac64`, `f8c3061b`, `211edd01`; claim is provenance only.

## Learnings

CI run `37578754642`, attempt 1, failed the recent-sessions placement assertion
on slice 4's published SHA `c611e187`: the busy fake's five-second native wait
raced its five-second UI assertion. Trace showed Done returning valid 200
at 75521 ms, with the assertion ending at 75580 ms. The placement-only test
uses the existing two-second rename-wait override; production waits unchanged.
`env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts agent-launch-recent-sessions.spec.ts --workers=1 --reporter=line`
passed (one test, 8.7 s), observing card removal and retained Recently done
placement across project switching/reload. Native failure/cancellation proof
remains unchanged. This repairs test timing; a passing retry was not the cause evidence.

## Execution context

- Established start: identity `SEED-116#claude-done-rename-readiness-correction`,
  publisher `dashboard-territory.local-open-dough`, agent `darren-chan`.
- Execution and originating checkout:
  `/Users/terryyin/git/open-dough/.worktrees/a-private-claude-code-rename-types-only-at-a-rea`
  (reused owned linked worktree); no integration checkout supplied.
- Branch `codex/a-private-claude-code-rename-types-only-at-a-rea`,
  mode `story-branch`, remote `origin`, authorized trunk `main`.
- Published claim `4c3bb49e1efdb265cf7130b5f3d647ffcb96834f`;
  starting revision `7ee18a095f1841560914df5eefc26774f9d39271`.
- Accepted story-branch increments: slice 2 `c5b7cc8bf784335665e52f94c483b55364d2bb00`;
  slice 3 `e7b25862935ebecd3cbd32eca5563b6ac0cd862b`;
  slice 4 `c611e18769db80f6f3548ae5411dfd3578652e14`;
  CI repair `59baac6473732faf6723918ac086022730240134`;
  slice 1 `f8c3061bcd0bf1c9563f4b1d410cbade1e38fc04`.
- Checkout setup: `env -u NODE_ENV npm ci --ignore-scripts --offline`;
  applicable command `env -u NODE_ENV npm run typecheck:dashboard` passed.
- No numeric slice limit supplied; existing planned-work replanning authority
  retained. Manual retry repair remains deferred.
- CI: GitHub Actions `ci.yml` (verified selector), observing the remote story
  branch. Codex yielded stream cell `11`, session `86975`, PID `60644`,
  directory `/tmp/dough-ci-501/watch-Ws0DXW`; coordinator launch reference
  `feb9bae7-fd70-4864-bcc6-439be0be1c46`. Claim publication on trunk is unobserved.
- All five slices have accepted proof. Terry authorized the native slice 1
  probe on 2026-10-07; slice 5 also passed through the corrected dashboard.
