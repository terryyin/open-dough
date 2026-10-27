# Keep the integration receipt when a post-acceptance visit is refused

**Identity:** SEED-154#keep-visit-receipts-after-acceptance

**Source:** [Correction story](../../seeds/SEED-154-supplier-integration-consumer-reconciliation.md#keep-visit-receipts-after-acceptance),
from the execution retrospective of
SEED-154#harden-supplier-visit-trigger-and-settlement (plan 360, all four
slices done; reviewed commits `25ffa738`, `c01a7b8a`, `b0f843ab`, `76a568ab`;
Take `e2a363f6`). Its story and completed plan are recoverable at
`3da055f403a62e68b2fd181edaf826f88338c7ff:.planning/seeds/SEED-154-supplier-integration-consumer-reconciliation.md`
and `3da055f403a62e68b2fd181edaf826f88338c7ff:.planning/slice-plans/360-harden-supplier-visit-trigger-and-settlement/PLAN.md`.

## Goal and scope

When a supplier integration, Land publication or Trunk closure is accepted, a
visit that cannot run returns a stopped visit beside the accepted receipt
instead of throwing it away; and a Trunk `finish` interrupted after a clean
visit names the rerun that completes it. Preserve plan 360's outcomes: the one
trigger rule, explicit `--supplier-identity`/`supplierIdentity`, the one-call
clean visit, the `--visit-settled` refusal, standalone `visit-consumers`
refusals of bad input, generic publication without supplier meaning, observer
ownership, landing context and retirement. Exclude new visit features, release
and client rollout. No new story dependency is needed. This plan authorizes no
execution.

## Current findings (verified at `76a568ab` in this checkout)

1. **A post-acceptance visit refusal throws away the receipt.** Plan 360 slice
   3 made `visitCurrentConsumers` rethrow `BacklogError` and removed
   `visitSelectedSupplier`'s wrapper
   (`src/skills/dough-execute-plan/scripts/supplier-integration.mjs`).
   `repositoryRoot` turns a Git failure into a `BacklogError`
   (`product-backlog-git-repository.mjs`), so a caller's `--backlog-path` /
   `backlogPath` outside Git now throws after the push was accepted: Trunk
   `finish` reports `step: "git"` and drops `acceptedSha` and observation;
   Story Branch `integrate` exits 2 as a usage error; Land APIs throw. This
   contradicts `publish-reviewed-checkout.md` ("receipt stands even when that
   visit stopped") and the comment on `visitSelectedSupplier`.
2. **An interrupted clean `finish` gets a misleading recovery.** On plan 360's
   one-call path no `--visit-settled` is passed. A rerun after the worktree is
   gone reaches `trunk-closure-visit.mjs`'s worktree-absent stop, which says
   "nothing here can establish its current consumers", although a clean visit
   was already printed and `--visit-settled <acceptedSha>` would finish it.
3. **A new test repeats an existing journey.**
   `tests/support/supplier-integration-late-consumer.test.mjs` (67 lines) runs
   the same late-trunk-consumer path as
   `tests/support/supplier-integration-visit.test.mjs:33`, differing only in
   `branchedSupplier(t, { consumerBeforeBranch: false })`; the script never
   reads the branch's consumers, and `supplier-visit-guidance.test.mjs` pins the
   "even when its branch shows no consumer" wording.

Dismissed in the review: `laterRegistered` against other executions, rebased
finals and superseded candidates; the clean path's `contained`; the unawaited
`runCli`; generic paths; moved guidance sections. `dough-product-backlog/SKILL.md`
(270 lines) predates plan 360, which changed one line; it is not this
correction's residue.

## Current decisions

- **Caller boundary owns the post-acceptance shape.** `visitSelectedSupplier`,
  called only after acceptance, returns any `BacklogError` as the stopped visit
  (`reason: "error"`, its message, the existing recovery). Standalone
  `visit-consumers` keeps refusing bad input, so `visitCurrentConsumers` stays
  as it is.
- **Recovery text, no new state.** The worktree-absent stop's recovery adds
  that a clean `visit` printed by an earlier `finish` lets the agent rerun with
  `--visit-settled <acceptedSha>`; update the `step: "visit"` row in
  `wrap-up-closure-publication.md` to match. No record of the earlier visit is
  added.
- **Fold, keep the premise.** Move the "branch's own discovery is empty"
  premise into the existing journey (or its fixture default) and delete the
  sibling file, keeping each file under 250 lines.

Applicable direction: [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md),
[maintainer guidance](../../../AGENTS.md).

## Preparation observations

Observed in this checkout at `76a568ab` on 2026-10-27: `visitSelectedSupplier`
called with `backlogPath: "no-such-dir/PRODUCT-BACKLOG.md"` threw
`BacklogError … no-such-dir is not inside a Git repository.` (finding 1). The
worktree-absent recovery text was read at `trunk-closure-visit.mjs` lines
80–88 (finding 2).

## Outside-in proof

| Promise / boundary | Owner | Required observation |
| --- | --- | --- |
| Accepted receipt survives a refused visit | Slice 1 | Installed `integrate --supplier-identity` (and Trunk `finish`) with a backlog path outside Git: accepted receipt with `visit.status: "stopped"`, `reason: "error"`, exit as for any stopped visit, not `step: "git"`/exit 2; fails on current code. Standalone `visit-consumers` non-full revision refusal unchanged. |
| Interrupted clean finish names its rerun | Slice 1 | Worktree-absent `finish` rerun without `--visit-settled` names `--visit-settled <acceptedSha>` in its recovery; that rerun completes and retires. |
| No duplicate late-consumer journey | Slice 1 | One journey covers a late trunk consumer for a branch whose own discovery is empty; supplier integration suites green. |

## Ordered slices

### 1. Keep the receipt and name the rerun

Type: Behavior
Status: done
Proof: Cases in `tests/support/supplier-integration-visit.test.mjs` and
`tests/support/supplier-trunk-closure-visit-recovery.test.mjs` (or siblings
under 250 lines) through the installed CLIs; scratch-disable each change and
observe its case fail; plus `supplier-*.test.mjs`,
`supplier-visit-guidance.test.mjs`, `ci-completion-lifecycle-guidance.test.mjs`
and `trunk-closure*.test.mjs` touched by the recovery text, through
`PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=2 bash scripts/test.sh <paths>`.

Behavior: Given an accepted publication whose visit is refused, the caller
receives the receipt with a stopped visit; given a clean `finish` interrupted
after retirement began, the rerun's recovery names `--visit-settled <acceptedSha>`.

Safe stopping point: correction complete.

## Learnings and concern review

Slice-plan refinement was not needed: one small Behavior slice owns both
recovery outcomes and the test fold, each with its own failing observation.
No remaining slice-specific concern was identified; finding 1's premise was
observed above and finding 2 is a text path read directly. No human decision
is required.

## Execution context

- Established Story Branch execution: `SEED-154#keep-visit-receipts-after-acceptance`,
  publisher `dashboard-territory.local-open-dough`, agent `jackson-chan`.
- Owned execution checkout:
  `/Users/terryyin/git/open-dough/.worktrees/keep-the-integration-receipt-when-a-post-accepta`,
  branch `codex/keep-the-integration-receipt-when-a-post-accepta`; default checkout
  `/Users/terryyin/git/open-dough`; final target `origin/main`.
- Established claim `4c84a50beac7e95e44d94592f3ecebd2add70194` accepted on
  `origin/main`; starting revision `dd88b7487e0eca3fd76e7ff6dcd1c48869aa731b`.
  First increment uses the claim as its previously published base.
- Exact-checkout setup passed on Node `24.21.0`: `node scripts/setup-native.mjs npm`,
  `node scripts/setup-native.mjs browser`, `node scripts/setup-native.mjs check`,
  and `PATH=/opt/homebrew/bin:$PATH npm test -- tests/test-runner-bash.sh`.
- CI: GitHub `terryyin/open-dough`, verified workflow `ci.yml` (CI, ID 351271804),
  observing remote execution branch. Codex coordinator `jackson-seed154`, directory
  `/tmp/dough-ci-501/watch-HD8LcY`, PID `75936`, stream session `78118`,
  yielded cell `12`. The earlier claim on trunk is unobserved by this stream.
- No numeric slice budget or explicit overrun-replanning change was supplied;
  preserve existing planning authority and the single bounded Behavior slice.

## Story obligations

### G1. Prove integration through its scratch installation
Reported: slice 1 — "Implementation proof audit found the existing integration helper launched the source CLI despite describing an installed boundary; installation proof is incomplete until the helper deploys and calls its scratch installation."
Story clause: "A developer whose supplier integration, Land publication or Trunk closure was accepted always gets that accepted receipt with a stopped visit when the visit itself cannot run"
Disposition: proved by slice 1: `supplier-integration-visit-fixture.mjs` deploys the scratch skill, and `integrate`/`visitConsumers` invoke its installed CLIs; the corrected integration, revisit and refusal suites passed, and disabling the receipt change again reproduced all three caller failures. Coordinator inspected the deployed paths, explicit backlog input and observing assertions.

## Slice 1 acceptance evidence

Source-only review: fresh agent `/root/source_commitments`, launched with
`fork_turns: none`, received the selected story's original Goal and Scope plus
complete original correction findings and decisions, without slicing, product,
implementation return or proof. Its launch/input and returned commitments are
retained in the execution conversation. The independent return split receipt
preservation across all three callers, stopped/error/message/recovery shape,
conditional clean-visit recovery and no new state, test fold and all unchanged
boundaries. Coordinator compared that return against the original source and
inspected the following implementations, setup and observations.

| Original trigger/setup | Expected result | Actual observation / disposition |
| --- | --- | --- |
| Accepted integration, Land publication or Trunk closure; visit input refuses outside Git | Accepted receipt beside stopped visit, reason `error`, original error message and existing recovery | `supplier-publication-visit-refusal.test.mjs` observes all three against real remotes. Installed integration retains `receipt.sha`/`acceptedSha`, finish retains `acceptedSha` and original observer with no completion/cleanup, Land API retains receipt. `visitSelectedSupplier` alone catches `BacklogError`. Proved. |
| Standalone visit receives partial accepted revision or bad transport | Existing refusal/stopped semantics | Installed `visitConsumers` assertions in `supplier-integration-visit.test.mjs` retain non-full revision exit 1 with no JSON, and transport stopped/error behavior. `visitCurrentConsumers` unchanged. Proved. |
| Earlier finish printed clean visit with no consumers/problems; worktree disappears with branch retained | Absent-worktree recovery names exact `--final` and `--visit-settled`; following rerun completes and retires | New `supplier-trunk-closure-visit-recovery.test.mjs` journey first obtains actual visit and successful completion at held retirement; removes only scratch worktree, observes recovery, then settled rerun removes branch with zero pushes. No prior-visit record added. Proved. |
| Worktree absent without earlier clean visit | Retain unfinished visit and accepted closure | Existing recovery test still stops before completion/retirement; guidance gives the clean-visit condition and otherwise reports unfinished visit. Proved. |
| Supplier branch shows no consumer, trunk gains consumers after branch starts | Visit current trunk consumers and preserve judgment, unrelated dependencies and retirement | Existing integration journey now asserts empty branch discovery; retains late consumer resolutions, THIRD waiting state, replay, publication/revisit and retirement. Duplicate sibling deleted. Changed test/helper files are 203/218/86/181 lines before formatting. Proved. |
| Existing explicit supplier trigger, clean one-call visit, settlement refusal, generic publication, observer ownership, landing and retirement | Preserve established boundaries | Supplier, Trunk closure and guidance suites passed; new logic is confined to the refused selected visit and absent-worktree recovery. No release/client rollout or new visit feature. Proved. |

Terminal passing commands (Node `24.21.0`, prepared execution checkout):

```sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=2 bash scripts/test.sh tests/support/supplier-*.test.mjs src/skills/dough-execute-plan/scripts/supplier-visit-guidance.test.mjs src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs src/skills/dough-execute-plan/scripts/observer-owner-guidance.test.mjs src/skills/dough-story-wrap-up/scripts/trunk-closure*.test.mjs tests/support/consumer-discovery-anchors.test.mjs tests/native-evidence-identity.sh
PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=2 bash scripts/test.sh tests/support/supplier-integration-visit.test.mjs tests/support/supplier-integration-revisit.test.mjs tests/support/supplier-publication-visit-refusal.test.mjs
python3 /tmp/seed154-scratch-proof.py
PATH=/opt/homebrew/bin:$PATH node scripts/test-shares.mjs preview --split-count 3
git diff --check
```

The first command ran 33 checks (expanded paths retained at
`/tmp/seed154-focused-suite-paths.txt`); the second renewed only installed-helper
consumers after G1's correction. Scratch-disable proof restores each original
source file separately in disposable archives: old receipt helper reproduces
integration exit 2, finish `step: git`, and Land `BacklogError`; old absent-worktree
text fails the new recovery assertion. Logs:
`/tmp/seed154-scratch-receipt.log`, `/tmp/seed154-scratch-recovery.log`.
Initial absolute outside-repository input stopped during publication's pathspec
validation; the relative `no-such-dir/PRODUCT-BACKLOG.md` matches the plan's
observed post-acceptance refusal and makes each mutation fail at its intended
boundary. Share preview leaves 172–174 predicted job-seconds headroom per share.

Consumer trace: `/tmp/seed154-consumer-trace.md` and
`/tmp/seed154-consumer-trace-focused.md`, generated by the installed script
against `4c84a50beac7e95e44d94592f3ecebd2add70194`; every located consumer has a
disposition. Supplied effects include `visitSelectedSupplier`,
`publishSelectedSupplier`, `integrateSelectedSupplier`, `settledVisit`,
`branchedSupplier`, the retired recovery wording and downstream dashboard helper
exports. Actual callers and fixture consumers ran; dashboard/native generic
journeys omit supplier identity and do not reach this changed branch, while the
dashboard guidance assertion reads an unchanged link. Managed installed copies
and historical evidence remain unchanged. Coordinator inspected these paths and
the concrete assertions rather than extending helper proof to callers.

Bounded proof decision: this 16-core/48 GiB Mac had load about 8 and about
14 GiB free+inactive memory; runner concurrency 2 kept proof bounded without
touching unrelated VM/nix work. No required proof was deferred. Representative
guidance review followed the earlier-clean-visit condition through its exact
rerun and retirement, consistent with ADR 0002 cohesion and ADR 0006's
executing-agent audience. No unresolved story obligation remains.

Independent refactor `/root/receipt_refactor` returned `## REFACTOR COMPLETE`:
none — already clean; no edits or test reruns. Its inspected exception
boundaries have distinct responsibilities, so extracting their small stopped
result would add indirection. All accepted implementation, setup, assertions
and consumer proof remain unchanged. Coordinator confirmed G1 is proved and
the obligation check passes.
