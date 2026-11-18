# Let a long Codex wait run without model requests

**Identity:** SEED-399#let-a-long-codex-wait-run-without-model-requests
**Source:** [Let a long Codex wait run without model requests](../../seeds/SEED-399-long-codex-wait-without-model-requests.md#let-a-long-codex-wait-run-without-model-requests)
**Source review:** [Independent source commitments](source-review.md)

## Goal and scope

Reduce model requests while a proof, CI completion, or supplier command
waits quietly in Codex. Preserve timely delivery of the original terminal
result and the original deadline. The seed owns the examples and scope.
The separate SEED-389 evaluation owns natural supplier-watch sampling.
The correction is to Open Dough's Codex guidance. Existing command and
observer contracts supply the results and remain the authority for them.

Local gate: run the representative use review in
[Author Open Dough skills](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review)
and the focused checks in slice 2. For long local runs on a fully awake Mac,
use `caffeinate -s -i` on AC. On battery, use `caffeinate -i` with the lid
open and check the sleep log afterwards. Follow the maintained
[macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
and the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Outside-in proof

| Promise | Owning slice and observation |
| --- | --- |
| Shorter-than-window quiet wait uses zero intermediate model requests and returns when the command ends | Slice 2, native Codex proof command with a known exit status. Correlate subprocess completion, tool output, the caller's next action, and distinct model requests. |
| After a host yield, resume the same operation and keep the existing deadline | Slices 1 and 2. Establish the actual yield in the probe. In native acceptance, follow one CI completion command across that boundary and observe its applicable-revision receipt. Compare launches, cell/session IDs, and request counts against the control. |
| A supplier publication reaches its existing judgment and an expired watch follows its stop procedure | Slice 2, an isolated Git publication and an unchanged watch that reaches its deadline. Inspect the real command receipts and the caller's action. |
| Other host paths stay usable | Slice 2, review the shared guidance through its Claude Code and Cursor entry points and check any links needed by the installed payload. |

## Decisive premises

| Premise | Consuming operation | Observation and limit |
| --- | --- | --- |
| The historical model wakes occurred at the outer wait | Slice 1 control | Codex rollout `01a1e7c4-7085-7903-83b8-bcfeec6241f9`, 2026-11-17 08:40:21Z–08:57:34Z, rows 3190–3312. The inner empty `write_stdin` asked for 300,000 ms. The enclosing `exec` initially yielded after 1,000 ms and subsequent outer `wait` calls asked for 50,000–60,000 ms. The window has 15 distinct response usage records. This is an observed historical cadence. Slice 1 establishes the matched control on the candidate surface. |
| Applying a longer yield at the outer layer can get past a minute | Slice 1 candidate | Dashboard-started Codex 0.170.0 (`source: vscode`), rollout `01a1ed83-201a-7653-a606-f98c727bd684`, 2026-11-18. Rows 64–67, `exec` pragma and inner empty `write_stdin` both `300000`, quiet local Node command `node -e 'setTimeout(() => console.log("SEED-399 above-minute exec probe completed"), 67000)'`: the outer call completed after 67.1 s with exit 0 and no intermediate request. Rows 71–78, initial outer yield `1000`, inner empty `write_stdin` and resumed `wait` both `300000`, equivalent quiet command for 70 s: the resumed call held 60.6 s to exit 0, with no further intermediate request after resumption. These establish lower bounds on that surface. The full window, behavior at yield, and any surface variation go to slice 1. |
| The rollout can distinguish model requests from elapsed shell time | Slices 1 and 2 measurement | `python3 -I` over those local rollout JSONL files found top-level `token_usage_record` with `payload.response_id`, `usage.input_tokens`, and `usage.cached_input_tokens` alongside timestamped outer calls and results. The new rollout's usage records at rows 65, 72, and 76 match the requests sending the respective calls. No usage record occurs between each of those launch/resume requests and its own terminal result. Verify the same observation route on the execution surface before using it. |

## Ordered slices

### 1. Measure the outer Codex wait window
Type: Behavior
Status: done
Proof: retain a matched native control and candidate trace with timed calls,
distinct in-window model requests, the command's terminal result, and the
host returns that explain those counts. Record the selected route and the
effective window for both launch and continuation on the tested surface.

Behavior: the same bounded quiet command and trace access are available in
the native Codex execution surface → run the current short outer wait
pattern and the candidate with a long outer `exec` and, after a yield,
long outer `wait` → obtain a measured window and a request-count comparison
with which the maintainer can choose the guidance. Pin the host/profile,
model and payload revision. Use a quiet interval near five minutes and a
run crossing a measured outer boundary. Ask for about 300 seconds first
and distinguish the accepted argument from the observed hold. If the tool
yields sooner, measure that cap or confirm rejection and select the
longest reliable setting appropriate to the original deadline. If outer
waits outlast one inner poll, test continuing the empty polls in the same
cell. Set a finite deadline and assess the proof budget before launching
these native model runs.

Count distinct originating responses that re-enter while the operation is
unchanged. Exclude the initial launch, the response after the terminal
result, and replies to the developer. Count an early handoff that forces a
resumption, even when the next `wait` is quiet. Keep window bounds,
request count, optional cache share, tool arguments and the reason for
each wake. Verify the existing fallback for host surfaces that
expose a direct shell session or reject the long outer wait. If the
candidate loses the result, exceeds the original deadline, or shows no
gain against the matched control, stop slice 2 and reassess the route from
that evidence. A missing observable route remains an open proof concern.

### 2. Wait through unchanged intervals and return the original result
Type: Behavior
Status: done
Proof: a representative agent follows the candidate guidance in an
isolated native Codex session. Retain rollout references and terminal
receipts for the examples below. Compare with slice 1 and accept only if
the shorter wait has zero intermediate requests, a longer wait wakes
only at observed unavoidable host returns, and the caller handles each
terminal outcome promptly within its existing contract.

Behavior: Open Dough starts a bounded operation whose command is quiet
while pending → its Codex host binding waits through the measured window,
resuming the existing cell and shell session only when needed → the
caller receives the original result and its existing continuation applies.
Change the published
[wait procedure](../../../Distribution/src/skills/dough-execute-plan/references/wait-for-proof.md#by-host)
and link the Codex foreground path from
[CI completion](../../../Distribution/src/skills/dough-execute-plan/references/ci-completion-wait.md#completion-command-and-receipt-mechanics)
if tracing it shows the entry point lacks that binding. Keep result and
deadline judgment at the existing command/caller boundary. On early tool
return, preserve identity and remaining time. Preserve direct shell
continuation and the existing blocking fallback when the code-mode tools
are unavailable.

- Run a quiet sliced proof command with a known exit status through the
  existing proof wait. Confirm the original exit-file evidence and zero
  intermediate requests.
- Start CI completion from the exact local observer and revision. Use a
  controlled local adapter to keep it pending across an observed host
  yield, then finish it. Inspect the original `CI_OBSERVER` receipt and
  shutdown verdict. Use the
  [completion fixture](../../../Distribution/tests/skills/dough-execute-plan/ci-mailbox-complete.test.mjs)
  for the mailbox and adapter setup, with actual wall-clock wait on the
  native side.
- Use the existing
  [supplier Git fixture](../../../Distribution/tests/support/wait-for-publication-fixture.mjs)
  to observe publication before expiry and deadline with unchanged refs in
  separate bounded watches. Confirm the exact receipt and the caller's
  continue/stop action. No real upstream repository or CI submission is
  needed for these observations.
- Use the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  for reached entry points and their existing checks. Start with
  `npm test -- Distribution/tests/installation/payload-declaration-links.sh Distribution/tests/skills/dough-execute-plan/ci-mailbox-complete.test.mjs Distribution/tests/skills/dough-execute-plan/wait-for-publication.test.mjs Distribution/tests/skills/dough-execute-plan/continued-wait-for-publication.test.mjs`.
  Those checks cover linked payload references and command behavior. Use
  the native traces for request cadence and continuation.

## Current decisions

- Use the existing code-mode cell and waitable shell session. Like a
  parent waiting for a child process, the caller blocks on a handle and
  receives terminal evidence when the work ends. Codex adds an outer
  yield independent of the shell handle, so a long inner poll alone leaves
  the historical wake path intact.
- Shell blocking or a larger inner `write_stdin` alone cannot govern the
  outer yield. The existing
  [Codex CI notification adapter](../../../Distribution/src/skills/dough-execute-plan/references/ci-notify-codex.md)
  demonstrates a long-lived cell, but its events arrive at a coordinator
  boundary and it has a different purpose. Public
  [Codex hook behavior](https://learn.chatgpt.com/docs/hooks#how-background-hooks-run)
  also gives no independent wake from an idle turn. A new notification
  bridge would need evidence that it reliably resumes the correct owner
  at result or deadline. Prefer the outer wait supported by the probes.
- The probe is a safe stopping point before guidance edits. The guidance
  and its native acceptance form one delivery slice. One rule waits on an
  existing operation regardless of which workflow owns it. No shared
  scheduler or Structure slice is needed for that rule. This follows
  [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md),
  [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md), and
  [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Plan review

Refinement was not needed. The host-window probe bounds the remaining
runtime premise before the guidance change, and the three final examples
exercise one wait rule with their existing terminal contracts. This review
identified no remaining slice-specific concern outside that probe.

## Execution context

- Story Branch Mode. Established workspace `codex/let-a-long-codex-wait-run-without-model-requests` in `.worktrees/let-a-long-codex-wait-run-without-model-requests`, publisher `dashboard-territory.local-open-dough`, agent Eimi-chan. Base `6c78472566abcb7434da517e3ce48408cd25fac1`, claim `0b0997b02ae68fb85427da76e0f7b96a16d804f6` accepted on `origin/main` and the execution branch, initial candidate equal to the claim. Default integration checkout is the repository's `main` worktree.
- GitHub Actions `ci.yml` (CI), observer `eimi-chan-seed-399` on `terryyin/open-dough` and the execution branch. Codex cell `g12:15`, shell session `32037`, mailbox `/tmp/dough-ci-501/watch-fLtqNT`, PID `29503`. The trunk claim predates this branch observer.
- Slice 1 proof budget: one matched 275-second control and candidate and one crossing trial, capped at 650 seconds of shell time. These quiet timers and native traces run on the AC-powered macOS 26.6.2 execution host under `caffeinate -s -i`. Initial host sample showed 16 logical CPUs, load about 18, 58% system memory free, and other browser work. This proof adds no build or browser load. Stop or reconsider on loss of trace access, deadline or terminal result, changing host conditions that invalidate timing, or no measured gain.

## Slice 1 measured wait window

Codex 0.170.0, dashboard app server (`vscode`, `open_dough_dashboard`),
`gpt-6.2-sol` at `xhigh`, payload `0b0997b02`. Both matched arms used the
same quiet 275-second command and returned exit 0. Control rollout
`01a1ede2-2d38-7f51-8ecc-9cde40ceb0a9` had five in-window response IDs
(rows 23, 27, 31, 35, 39) from a 1.043-second launch handback and four
roughly 61-second waits. Candidate rollout
`01a1ede2-2d38-7f51-8ecc-9ca2c0d58dfd` had zero between the launch usage
row 17 and the terminal result at row 19 (275.109 seconds). Both returned
within 21 ms of the command's output.

Crossing rollout `01a1ede2-2d38-7f51-8ecc-9d0d6f34399d` used `300000` on
both outer tools. `exec` handed back after 301.034 seconds (rows 18–20).
The first `wait` on cell `g18:1` handed back after 301.080 seconds (rows
22–24). The next `wait` on the same cell returned after 10.517 seconds
(rows 26–29), 25 ms after output from the original shell session `10363`.
That cell continued through three inner polls. The only two in-window
responses were rows 23 and 27, one per outer handback; the original
command exited 0 before its deadline. Use the observed five-minute
window where the host supports it, keeping the command, cell, and deadline
on handback. Treat earlier host returns according to their actual handles.

Separate-cell shell continuation returned exit 17 on the same shell
handle. The generic blocking fallback produced the recorded exit and the
deadline result in separate cases. The isolated CLI and app-server
surfaces did not expose a separate direct-only tool UI under the attempted
configuration. The evidence for that fallback is the exercised underlying
command/session path. Full report and run record are in the checkout's Git
evidence directory (`slice-1-report.md`, `slice-1-native-run.log.run.json`).
Records-only refactor disposition.

Slice 1 was published and registered on the execution branch at
`60b5b814666f3d49e88e018f4e7cb1b87a8a84e7`, extending the accepted claim.

## Slice 2 accepted verification

- Proof rollout `01a1edf7-d1cd-73a3-a722-0817cc94a6e4` bounded outer launch
  by its original two-minute deadline. It returned exit 17 after 12.326
  seconds, 12 ms after the command marker, with zero intermediate model
  requests. The recorded exit-file result kept the proof gate open.
- CI rollout `01a1edf4-66c1-7891-afde-ebbd0f40c49f` used one 301.031-second
  outer launch and one necessary request to resume the same `g27:1` cell.
  The 60-second continuation returned after 44.215 seconds with the original
  exact revision's `CI_OBSERVER` success and confirmed shutdown. The original
  completion record's start and deadline survived. Slice 1 separately
  measured the full five-minute continuation on the same host profile.
- Local supplier rollouts `01a1edf4-66c1-7891-afde-eb2305d55dcb` and
  `01a1edf4-66c1-7891-afde-eb5be690b336` used zero intermediate requests.
  Verified Git object changes lifted the hold before its original deadline.
  Unchanged refs ended at the deadline with the original resume condition.
- Four named focused checks passed for payload links, CI completion, supplier
  publication, and continued publication wait. The representative authoring
  review followed shared proof, CI and supplier entries and inspected Cursor
  and Claude Code routes. See the checkout's Git evidence files
  `slice-2-report.md`, `slice-2-consumer-trace.md`,
  `slice-2-final-focused-outcomes.txt` and native run records for commands and
  trace coordinates. Both native and focused runner records exited zero.
- Independent refactor aligned the published slice-clock caller with the
  shared host wait. The payload-link check and `git diff --check` passed.
  Existing native proof still exercises the same command and wait. The
  refactor consumer trace is in the checkout's Git evidence directory.
