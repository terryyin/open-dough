# Queue-aware completion with a recoverable pending handoff

**Identity:** SEED-150#story-queue-aware-completion
**Source:** [story](../../seeds/SEED-150-queue-aware-completion.md#story-queue-aware-completion)

## Goal and execution context

User authorized implementation coordinated with Pygardon SEED-148. Work in
`/Users/terryyin/git/open-dough/.worktrees/queue-aware-completion`, branch
`codex/queue-aware-completion`; Story Branch Mode, origin/main, publisher
`codex-queue-completion-20261025`, agent darren-chan. This work created the
worktree before startup reused it. Admission accepted
`725dce660f26ee67b90a9111534b70915b182162`.
Default checkout `/Users/terryyin/git/open-dough`; management context its `.git`.
Locked npm ci and workspace-local prettier 3.9.6 succeeded.

## Design and constraints

PFE: custom adapter acquisition, coverage projection, await/complete composition,
atomic mailbox JSON and existing cleanup gates own this responsibility. Evolve
them, preserving one shared cross-host procedure. Existing live-Claude async
handoff has distinct host restrictions and is not the Codex recovery mechanism.
ADR-0002 requires cohesive proportional changes, ADR-0003/0004 tagged complete
payload installation, ADR-0005 functional proof plus justified native reuse,
ADR-0006 runtime-agent perspective and one authoritative procedure. No conflict.

Discovery adds optional `queue` separately from attempts. Each entry has full
sha, branch and queued/running/retrying state, optionally check/context. Exact
queue facts may explain accepted revision pending; descendant facts require
explicit integrated-state policy, compatible target/check/context and locally
proved ancestry. Never fetch non-successful candidates to establish ancestry.
Queue facts never create verdicts, checkedBy, run IDs or failure diagnostics.
Empty authoritative queue withdraws prior facts; failed discovery also withdraws
them, even when no integrated policy exists. Stamp successful observation locally.

Completion keeps a ten-minute foreground wait and uses fresh pending evidence
(at most two minutes old) to return an immutable durable handoff, original
deadline, mailbox/SHA and repeatable complete-revision command. Persist the
sixty-minute overall budget once before waiting; interruption/coalescing/resume
cannot renew it. Failure always wins over queue/cap; exhausted handoff cannot
revive from later green. Dead workers remain explicitly unavailable. Pending
never permits resource retirement or hides unread failures.

## Preparation observations

Exact workspace baseline `node --test /tmp/open-dough-queue-baseline-claim725dce66.mjs`
passed 1 test: real custom adapter→observer coverage leaves queued A undiscovered
with no queue/checkedBy; real completeRevision with fake time returns timeout
after 20ms and confirmed stop. This proves the missing behavior and consuming
route without elapsed-time verdicts or production access. Existing fixture is
ci-revision-coverage-test-fixtures.mjs; low-level await has fake clock/sleep seams.
No infrastructure, image, dependency or paid observation is needed.

## Ordered slices

Observer: coordinator `codex-queue-completion-20261025`, target
`terryyin/open-dough codex/queue-aware-completion`, directory
`/tmp/dough-ci-501/watch-iijDA8`, PID 12475, PTY 29057, yielded cell 184.
Canonical runtime and enabled push workflow verified. Plan publication accepted
`458daed3354efcc73f23a0ecea39a72b79825839` on main; no implementation yet.

### 1. Authoritative queue progress remains distinct from attempts
Type: Behavior
Status: done
Proof: real custom-adapter/observer/Git coverage integration tests for queued A, coalesced descendant B, retrying evidence and empty/failed/stale/foreign/context/unknown-ancestry counterexamples; affected command-adapter, revision coverage and integrated-state suites via node --test.

Behavior: discovery returns a truthful queue snapshot → accepted coverage carries
fresh separate pending explanation, retaining its own actual attempt state.
Exact failures and reruns retain precedence. Shared projection can distinguish
fresh pending work without changing real successful evidence rules. Extend the
protocol documentation and payload declaration for any runtime module added.

Accepted: `/root/source_promises` and `/root/source_promises_recovery` were fresh
source-only reviews; their original inputs and individual commitments are
retained in conversation. Parent inspected the real adapter/worker/Git setup and
assertions in queue coverage tests, pending projection and coverage acquisition:
queued/running/retrying never creates verdict/checkedBy; matching coalesced
descendant explains pending only with local proven ancestry; missing objects
are not fetched; empty/unsupported/failed/foreign/context-invalid snapshots
withdraw progress; fake-clock freshness and newer real retries preserve failure
and current-attempt precedence. Pending inherited bases are observed freshly.
Implementation proof `/tmp/open-dough-queue-proof.md` retains exact terminal
commands: 30 affected suites (one expected new-field assertion corrected and
rerun), 6 new queue integration tests, 11 direct consumers, 3 guidance/install
checks and 4 further projection suites all passed after the noted assertion
repair. Source control and assertion boundaries were inspected, not inferred
from exit status. Consumer dispositions are in
`/tmp/open-dough-queue-consumer-trace.md`.
Independent refactor extracts queue projection and queue protocol manual,
splits integrated queue/await tests without reducing assertions, and declares
both new runtime/manual files in install.sh. Existing externally supplied
withdrawIntegratedState callback contract is preserved. Its renewed affected
coverage/install proof and final marker are retained in conversation.

### 2. Completion yields and resumes a bounded durable pending handoff
Type: Behavior
Status: done
Proof: complete-revision integration with real mailbox files and fake clock for queued/running/retrying work, caller cancellation and resume, no cap renewal under coalescing/repeated calls, exhaustion/late green, stale/unavailable evidence, exact and unread failures; trunk closure and host completion callers remain safe; affected completion/await/closure suites.

Behavior: legitimate pending progress outlasts foreground wait → persist pending
receipt and retain observation/resources → repeating the exact recovery command
continues with the original cap → real applicable evidence completes or expiry
ends unresolved. Update affected lifecycle recovery and guidance, including
completion wait, finish/stop, wrap-up and Codex behavior. Preserve existing
low-level read-only await and host-specific async handoff restrictions.

Accepted: fresh source-only review commitments were compared with the source,
code and assertions, including all three alternative pending states and each
negative evidence category. Parent inspected `completeRevision`, exclusive
completion state, all new completion suites and the real installed finish gate.
`/tmp/open-dough-s2-proof.md` retains literal commands, setup and assertion
locations: 32 distinct focused suites passed, covering 24 new tests. Real adapter/
Git/worker journeys prove queued, running, retrying and current attempt handoff,
first record before wait, exact emitted recovery command executed by child,
immutable 60-minute cap, coalesced A retaining its own state through descendant
success, and newer pending rerun superseding older green. Real concurrent CLI
and SIGINT/SIGTERM/SIGKILL cases retain the same first record; stale, withdrawn,
foreign, unsupported, unreadable and unavailable evidence cannot yield pending
or success. Exact failures and unread actionable events retain ownership at cap.
The actual installed finish command proves pending/expiry keep branch/worktree;
its imported completion collaborator is substituted at that gate only, with real
composition independently proved. Both installed runtime roots import their
completion and closure entry points, proving the declared module closure.
Consumer record `/tmp/open-dough-s2-consumer-trace.md` dispositions all listed
consumers. Native activation, host owner/enrollment and low-level read-only await
remain unchanged; affected shared behavior and existing Codex/host/background
consumer suites passed. No new live vendor run is claimed or needed. Guidance
keeps one canonical completion procedure and preserves CI applicability scope.
Two initially wrong test setups (provider start synchronization and exact-own
pending versus an ignored-only pending basis) were corrected before their final
passing observations; stopped commands and a nonexistent suite selected nothing
and were never counted as proof. No release or real adoption has happened.
Fresh independent refactor regrouped only related installer declarations to keep
install.sh at 250 lines, preserving payload tokens/order. It renewed actual
dual-root installation/byte equality/import closure and the historical
single-entry acquisition scanner suite; both terminal commands passed. All
mailbox behavior, setup and assertion locations stayed unchanged, so accepted
behavioral proof is reused. Its 82-consumer trace at
`/tmp/open-dough-s2-refactor-consumer-trace.md` has no undisposed gaps; parent
inspected the sole regroup, and the REFACTOR COMPLETE receipt is retained.

## Native mechanism and release

This changes shared mailbox semantics and existing command receipts, not native
skill discovery, hook activation or host identity. Deterministic shared logic is
proved once; inspect affected Codex/Cursor/Claude caller paths and reuse their
existing activation/owner verification tests where boundaries remain unchanged.
Any invalidated native requirement remains an explicit obligation until proved.
Retrospective: original prepared plan `458daed3`, claim `725dce66` and source
were compared with attributable implementation commits `a6499102` and
`eca69808`; adjacent earlier work was excluded. Shared discovery/coverage,
read-only projection, completion state and existing cleanup ownership remain
cohesive and follow Accepted ADRs and the current shared-runtime direction.
The focused protocol/queue suites and completion journeys prove distinct
boundaries; no obsolete framework or duplicate production mechanism was found.
Process review used the actual coordinator/agent history, including corrected
setups, CI repair in the separate Pygardon execution, proof reuse and report
latency; it found no additional supported actionable finding. No process log or
backlog mutation is warranted. Product advice is no change. Conclusions are
conditional on the pending branch CI for `eca69808`; release/adoption still
requires the maintainer's requested numeric version. No live host proof or
release/adoption is claimed. Retain both workspaces for that dependent action.
After functional delivery and review, finalize the maintainer-supplied version,
publish immutable tag and use ordinary dough-update for Pygardon adoption.
Do not hand-edit managed copies or silently invent a version. No rollout to
unrequested projects or host deployment is authorized.

## Readiness and sizing

Refinement not needed: queue interpretation and durable completion are cohesive
successive behaviors, with complete proof per outcome and no extra framework.
Source project has no numeric slice limit; keep each proof loop bounded and
reassess if hidden independent behavior or disputed requirements appear.
Pygardon's parallel scheduler is independent; adapter adoption waits for release.

## Execution complete

Product advice: no change. Functional source delivery and selected retrospective
are complete; release/adoption and dependent closure await the maintainer-supplied
version. Keep the accepted candidate, workspaces and exact observer receipts.

## Story obligations

### G1. Durable completion remains owned by the next behavior
Reported: slice 1 — "Slice 2’s durable handoff and completion budgets remain intentionally unimplemented."
Story clause: "Keep the ten-minute foreground wait. For fresh legitimate queued, running or retrying evidence, return a durable pending receipt with retained observer and exact recovery command. Persist a sixty-minute overall completion cap once per accepted revision before waiting; resuming and coalescing cannot renew it."
Disposition: proved by slice 2: real adapter queued/running/retrying and current-pending journeys assert durable first record before wait, original cap, saved no-verdict receipt with retained observer and exact emitted recovery command, then execute recovery to real success; coalesced progress, repeated/concurrent calls and signals preserve the original deadline.

### G2. Overall expiry must retain the worker-loss explanation
Reported: slice 2 — "At-cap composition overwrites the primary unavailable detail with the overall deadline, leaving only indirect terminal evidence."
Story clause: "Worker loss remains explicitly unavailable."
Disposition: proved by slice 2: actual killed worker/provider are observed exited; at original cap complete returns completion_expired with explicit observation_unavailable/worker_exited, unchanged handoff, no verdict or pending replacement, and terminal lost coverage.

### G3. Observation freshness must not change successful evidence identity
Reported: slice 2 — "Another poll can renew accepted observation timestamps without changing the validated run identity, making the whole-evidence fingerprint differ."
Story clause: "without inventing success or renewing the original overall budget."
Disposition: proved by slice 2: real ignored-only pending-basis and successful descendant journey retains via unread failure, renews accepted progress timestamps/queue, preserves known same successful run at original cap, then rejects a different late successful attempt without renewing the cap.
