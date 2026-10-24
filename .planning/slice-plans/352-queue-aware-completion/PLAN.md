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

### 1. Authoritative queue progress remains distinct from attempts
Type: Behavior
Status: planned
Proof: real custom-adapter/observer/Git coverage integration tests for queued A, coalesced descendant B, retrying evidence and empty/failed/stale/foreign/context/unknown-ancestry counterexamples; affected command-adapter, revision coverage and integrated-state suites via node --test.

Behavior: discovery returns a truthful queue snapshot → accepted coverage carries
fresh separate pending explanation, retaining its own actual attempt state.
Exact failures and reruns retain precedence. Shared projection can distinguish
fresh pending work without changing real successful evidence rules. Extend the
protocol documentation and payload declaration for any runtime module added.

### 2. Completion yields and resumes a bounded durable pending handoff
Type: Behavior
Status: planned
Proof: complete-revision integration with real mailbox files and fake clock for queued/running/retrying work, caller cancellation and resume, no cap renewal under coalescing/repeated calls, exhaustion/late green, stale/unavailable evidence, exact and unread failures; trunk closure and host completion callers remain safe; affected completion/await/closure suites.

Behavior: legitimate pending progress outlasts foreground wait → persist pending
receipt and retain observation/resources → repeating the exact recovery command
continues with the original cap → real applicable evidence completes or expiry
ends unresolved. Update affected lifecycle recovery and guidance, including
completion wait, finish/stop, wrap-up and Codex behavior. Preserve existing
low-level read-only await and host-specific async handoff restrictions.

## Native mechanism and release

This changes shared mailbox semantics and existing command receipts, not native
skill discovery, hook activation or host identity. Deterministic shared logic is
proved once; inspect affected Codex/Cursor/Claude caller paths and reuse their
existing activation/owner verification tests where boundaries remain unchanged.
Any invalidated native requirement remains an explicit obligation until proved.
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

## Story obligations

None identified during preparation. Record discovered source gaps and their
receiving ownership before accepting dependent work.
