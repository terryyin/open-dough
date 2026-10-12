# Background CI monitoring and failure delivery

**Identity:** SEED-063#background-ci-failure-delivery
**Source:** [story](../../seeds/SEED-063-dashboard-owned-ci-monitoring.md#background-ci-failure-delivery).
**Prepared:** 2026-10-03; scope reduced by Terry on 2026-10-13.
[Execution history](EXECUTION-HISTORY.md) preserves earlier decisions and proof.

**Scope reduction:** Replace the former eleven-slice outcome with live Claude
Code background handoff using the existing mailbox and native asyncRewake.
G21 recovery stays delivered. Broader runtime work is deferred, not fulfilled;
[historical scope](SCOPE-BEFORE-REDUCTION.md) and [former runtime design](RUNTIME-SLICES.md)
remain evidence, not active slices. No new human fixture actions are requested.

## Current execution context

- Mode: story-branch; publisher: `dashboard-territory.local-open-dough`;
  agent: `joey-chan`.
- Execution checkout:
  `/Users/terryyin/git/open-dough/.worktrees/monitor-ci-in-the-background-and-wake-execution`;
  branch: `codex/monitor-ci-in-the-background-and-wake-execution`.
  Default checkout `/Users/terryyin/git/open-dough` remains outside this work.
- Authorized remote `origin`, trunk `main`; increments target
  `refs/heads/codex/monitor-ci-in-the-background-and-wake-execution`.
- Starting revision `887ec1c7475add6d3b782a0ab3042f5eba865ba9`;
  accepted claim and initial base `eea9a02ffd0b18e0c3f134d3fa94e6d9f67b45b0`;
  remote branch confirmed that claim before independent implementation.
- Locked setup: `npm ci` and dashboard typecheck succeeded. Reuse unchanged
  dependencies. Coordinator runs `npm run format`; the commit hook owns
  check-only lint and staged-script dashboard typecheck.
- Terry’s 2026-10-13 scope reduction authorizes the remaining bounded work.
  Reuse setup, execution identity and unchanged proof; no new Take or workspace.
  No numeric slice budget exception or no-replan instruction was supplied.
- Latest accepted increment: `8ce0029b69bf7292d7c7cc6dfcdd0c829367f8df`,
  suffix base `eea9a02ffd0b18e0c3f134d3fa94e6d9f67b45b0`; remote branch confirmed.
- Prior CI observer (ended): repository `terryyin/open-dough`, selector `ci.yml` / `CI`,
  coordinator `joey-chan-seed063-20261012`,
  `/tmp/dough-ci-501/watch-ogRHQ3`, PID `90134`, command session `78375`,
  yielded cell `4`. Managed resume recovered accepted 8ce0029b coverage, pushCount0.
  ogRHQ3 stopped at native-capability handoff: ended/CI unobserved,0/0/0,PID absent.
  Prior 77vPAs stopped: ended / CI unobserved, events 0/0/0, PID 57867 absent.
  Prior wZA3v7 stopped with ended / CI unobserved, recorded/delivered/unread
  0/0/0; exact PID 41624 absent, no signal sent. Prior VYrfiY also ended.
  Prior stop/result receipts report ended coverage / CI unobserved,
  zero recorded/delivered/unread events; exact old PID `63733` is absent.
  [History](EXECUTION-HISTORY.md) retains prior matching stopped receipts.
  Claim trunk CI remains unobserved by this coordinator.
- Current yielded CI observer: `/tmp/dough-ci-501/watch-Xtw1tl`, PID `61696`,
  command session `11769`, cell `12`; same coordinator/repository/target.
  Exact previous PID 90134 was absent before rearming. Managed resume retained.

## Goal and boundaries

A directly invoked, still-running interactive Claude Code coordinator may end its coding turn
while the exact accepted Story Branch publication’s CI is pending. For ten
minutes, a local asyncRewake waiter delivers actionable failure into that same
session under existing repair guidance. Pending/success are quiet. Keep one
existing observer, registration path and GitHub request owner; retain the
worktree. Other hosts, Trunk Mode and ordinary closure keep their current wait.
No automated dashboard runner, cold resume, rearming, retirement, reboot/transfer/mixed-version replacement
or dashboard lifecycle integration. The source owns the full reduced scope.

## Ordered slices

Three slices own the accepted recovery, bounded feasibility and final vertical
behavior. No numeric slice target/hard limit is configured. Implementation and
independent refactoring use fresh agents; the coordinator owns delivery.

### 1. Recover a GitHub request owner that no longer answers
Type: Behavior
Status: done

Replace a connectable but non-answering owner with one fenced generation and
shared allowance. [Accepted boundary and focused/full proof](REQUEST-OWNER-RECOVERY.md).
Accepted increment `8ce0029b69bf7292d7c7cc6dfcdd0c829367f8df`.

### 2. Prove native delivery for the reduced live Claude scope
Type: Behavior
Status: done

Claude’s native asyncRewake passed original foreground/background idle, busy,
permission, genuine structured question, context/policy/draft preservation and
parent/child isolation. [Async proof](CLAUDE-ASYNC-FEASIBILITY.md),
[protected proof](CLAUDE-PROTECTED-FEASIBILITY.md), [busy/child proof](CLAUDE-LIVE-FEASIBILITY.md).
The old cross-tool campaign is explicitly deferred under the source reduction.
Codex G25 proof remains historical; no claim of installed integration is made.

### 3. Hand off pending CI and wake the live Claude owner on failure
Type: Behavior
Status: done

Result: one explicit pending handoff on the existing registered publication,
owner-bound bounded local async Stop waiter, failure-only feedback with existing
repair instructions, truthful status and no duplicate attempt. Update installed
payload hooks and guidance at source; retain legacy paths for other hosts.

Proof: process-backed public command/hook tests for pending return, registered
SHA and owner validation, late provider failure, pending/success silence,
expiry/cancellation, concurrent hooks and retained uncertain delivery. Run the
changed hook/installation/guidance consumers. One fresh owned installed-Claude
interactive fixture (maximum three model turns, unchanged manual policy) proves
pending → coding-turn end → later actual fixture CI failure → same-session
native wake retaining context/repair instruction. Its provider, native process
and hook are owned and closed after observation. No user desktop actions.

[Accepted implementation, process/consumer proof and independent refactor](LIVE-CLAUDE-DELIVERY.md);
[installed native acceptance](CLAUDE-INSTALLED-ACCEPTANCE.md) passed. G17/G24
were resolved and the installed slice3 obligation check passed before done.

Existing solution: reuse `ci-mailbox.mjs`, mailbox event/progress storage,
`ci-observer-owner.mjs`, managed publication/observation binding and Claude’s
native asyncRewake. No `ws` dependency, new poller or subscription registry.
A scope or permission boundary not supplied by this cut returns for judgment;
known excluded future behavior does not expand this slice.

## Story obligations

### G11. A host that cannot reach the endpoint fails every CI read (first reported in plan 224 slice 4)
Reported: slice 2 — "An observer in a sandbox that cannot write `~/.open-dough`, connect to a Unix socket, or spawn a detached process will see every request fail as `gh failed` and hit the three-error path."
Story clause: "Missing observation or delivery is visible, never success."
Disposition: excluded "Restricted hosts that cannot run the existing observer or reach its request owner are not newly supported."

### G12. Mixed installed protocol versions fail every read (first reported in plan 224 slice 4)
Reported: slice 2 — "A consumer with an older installed protocol fails every read while a newer owner lives, and vice versa."
Story clause: "Installation and mixed-version startup must preserve one runtime owner."
Disposition: excluded "Codex/Cursor background delivery, closed-session resume, automatic rearming, dashboard lifecycle/status integration, full runtime replacement, ownership transfer, machine-reboot recovery, mixed-version cutover, new authorization-change handling, and automatic resource retirement."

### G15. Some login changes are noticed only at process restart (first reported in plan 224 slice 5)
Reported: slice 2 — "A keyring-only token change that does not rewrite `hosts.yml`, and the Windows config location, are not picked up until the process restarts."
Story clause: "Changed authorization cannot reuse incompatible live acquisition answers"
Disposition: excluded "Codex/Cursor background delivery, closed-session resume, automatic rearming, dashboard lifecycle/status integration, full runtime replacement, ownership transfer, machine-reboot recovery, mixed-version cutover, new authorization-change handling, and automatic resource retirement."

### G17. Paid native fixtures' gh shims may not answer the login read (first reported in plan 224 slice 5)
Reported: slice 2 — "I did not check whether their `gh` shims reach the request owner. If they do, each needs the same `auth` early exit."
Story clause: "Paid native runs require explicit native-check authority"
Disposition: proved by slice 3: CLAUDE-INSTALLED-ACCEPTANCE.md — custom provider discover/diagnose pipeline uses no gh shim; tripwire auth early exit retained

### G21. A stopped owner that still accepts connections is not replaced (first reported in plan 224 slice 6; carried by original plan 299 slice 1)
Reported: slice 1 — "A stopped owner whose socket still accepts connections is not replaced. This predates the slice."
Story clause: "The retained launcher restarts a failed runtime owner with fenced recovery."
Disposition: proved by slice 1: ../../../src/skills/dough-execute-plan/scripts/github-request-owner-unresponsive.test.mjs — paused connectable owner, concurrent consumers, one replacement generation, resumed-original fencing; REQUEST-OWNER-RECOVERY.md retains inspected setup/assertions and full consumer proof

### G22. An owner from before an update serves without persistence until idle (first reported in plan 224 slice 6)
Reported: slice 2 — "An owner from before this slice that is still running after an update serves without persistence or child records until it idles out."
Story clause: "Installation and mixed-version startup must preserve one runtime owner."
Disposition: excluded "Codex/Cursor background delivery, closed-session resume, automatic rearming, dashboard lifecycle/status integration, full runtime replacement, ownership transfer, machine-reboot recovery, mixed-version cutover, new authorization-change handling, and automatic resource retirement."

### G23. Required native continuation and safety remain unproved (first reported in original plan 299 slice 1)
Reported: slice 2 — "Still uncovered: the Claude decision; Codex desktop, approval/input safety, still-open or restrictive standalone behavior and standalone G11 shell proof; Cursor dashboard runner delivery, busy/waiting/composer safety, lost-ack reconciliation, restrictive policy preservation, G11 and IDE binding; applicable coordinator/child isolation."
Story clause: "Continuation preserves conversation, workspace, permission policy and repair authority."
Disposition: owner changed "Live Claude Code only."

### G24. Transport probes do not prove runtime filtering or skill behavior (first reported in original plan 299 slice 1)
Reported: slice 2 — "Installed-runtime pending/success filtering and skill-behavior acceptance were not exercised."
Story clause: "Pending or success never creates a new agent turn."
Disposition: proved by slice 3: ../../../src/skills/dough-execute-plan/scripts/ci-background-handoff.test.mjs — actual pending coverage held silent, success settles without feedback; CLAUDE-INSTALLED-ACCEPTANCE.md observes installed late-provider native wake

### G25. Readable desktop history does not establish its live continuation endpoint (first reported in original plan 299 slice 1)
Reported: slice 2 — "thread 01a12d43-026b-7880-a6fa-ba846ce9f278 already has an active writer"
Story clause: "Deliver to the exact enrolled coordinator."
Disposition: proved by slice 2: CODEX-DESKTOP-FEASIBILITY.md — original desktop thread automatically consumed one queue submission, queue-triggered native turn acknowledged prior context and failure, exact policy preserved; inspected rollout and public thread/read agree; draft/busy/wait safety remains G23

## Supporting design and proof

[Design/PFE](DESIGN.md), [prior preparation](PREPARATION-PROOF.md),
[learnings](LEARNINGS.md) and [native history](NATIVE-FEASIBILITY.md) preserve
existing evidence. The selected source and ordered slices above own current scope.
