# Observer ownership holds at its recovery edges

**Identity:** SEED-121#settle-observer-owner-edges
**Source:** [correction story](../../seeds/SEED-121-execution-observer-ownership.md#settle-observer-owner-edges),
written by the execution retrospective of plan 280 on 2026-10-10.
**Provenance:** SEED-121#retain-execution-observer-owner, whose story and plan
are recoverable at
`eaf7af7e8466d1c25b2a3da7350b266bb6802aea:.planning/seeds/SEED-121-execution-observer-ownership.md`
(anchor `retain-execution-observer-owner`) and
`eaf7af7e8466d1c25b2a3da7350b266bb6802aea:.planning/slice-plans/280-execution-observer-ownership/PLAN.md`;
reviewed commits
`8014c2f8`, `8d2bbee8`, `9ac9ae4b`, `2da88b86` on
`origin/claude/register-trunk-delivery-with-its-own-execution-o` after claim
`f9ddf723`. Planning only; this plan grants no Take, execution, or publication.

## Goal and boundaries

A coordinator whose observer ownership is verified keeps a usable observer and
truthful recovery guidance at the edges plan 280 left: a closure rerun after
its worktree is retired, a caller that names another session, a subagent
coordinator, and the native closure harness. One owner derivation and one gap
vocabulary serve delivery, resume, and closure.

Preserve plan 280's delivered promises: owner-first selection, no owner-free
fallback, accepted publication reported beside any coverage gap, sibling
observers untouched, existing CLI forms, and Story Branch Mode target binding.
Exclude dashboard-owned CI monitoring, CI discovery or transport, repair
scheduling, hook rebinding of an observer to a different session, retiring a
worktree whose project lies below its Git toplevel, and release.
Modify published guidance in `src/skills/` only.

## Current findings

Observed by the retrospective's read-only review at `2da88b86`.

| Finding | Evidence | Impact |
| --- | --- | --- |
| A closure rerun after retirement cannot read its owner's observer armed from another worktree | `trunk-closure-settlement.mjs` `observerRoot` returns the retired path; `ci-mailbox-location.mjs` `readMailbox` compares checkout identities; a scratch repository showed the retired worktree's identity is its own path while a sibling checkout's is `<repo>/.git` | A rerun that only finishes retirement stops at `step: "observation"`; a host observer reads `missing` and a Codex stream reads `foreign` ("belongs to another coordinator or repository") |
| Closure derives the owner from the common Git directory; the hook, delivery, and resume derive it from the checkout root | `trunk-closure-observer.mjs` `closureObservers`; `ci-host-hook.mjs`; `execution-increment-delivery.mjs`; the scratch check gave the same hash for worktree, main checkout, and common directory, and a different one for a project root below the Git toplevel; the installed commands reproduced it, see [observed premises](#observed-premises) | Two derivations of one rule; a project below its Git toplevel gets `missing` on an accepted-closure rerun although its first `finish` reused that observer |
| Gap reasons and guidance steer a later session to name the earlier one with `--session-json` | `execution-increment-observation-recovery.mjs` `ownedGaps.missing`; `trunk-closure-observer.mjs` `hostGap`; `trunk-publication.md` resume paragraph; `wrap-up-closure-publication.md` rerun paragraph; `ci-host-hook.mjs` delivers only through the invoking session's `owner-<hash>/` bindings; `ci-notify-hosts.md` tells a replacing session to stop the old observers and start its own | `deliver` or `resume` reports `reused` or `recovered` while that observer's failure events never reach the caller |
| A Claude Code subagent coordinator's ambient identity names its parent session | `ci-host-bridge.mjs` ambient session carries no child; `ci-observer-owner.mjs` `hostInputOwner` claims with `agent_id` | Its own armed observer reads `missing` and delivery starts a second one bound to the parent; no guidance names `agent_id` in `--session-json` |
| The native trunk-closure harness supplies inputs no guidance teaches, and its Codex case cannot pass | `tests/support/trunk-closure-native-fixture.sh` pre-starts a detached observer for every host, leaves Codex unclaimed, and writes `Observer owner session:`; `tests/support/trunk-closure-native-run.sh` waits for registration on that mailbox; `tests/git-publication-native.sh` offers `trunk-closure/*` for Codex; `trunk-publication.md` tells Claude Code not to build session JSON | A manual Codex closure run times out; a native host run that omits the flag fails the harness while the product succeeds |
| Two gap tables and three session-input parsers express one rule | `ownedGaps` in `execution-increment-observation-recovery.mjs`; `hostGap` and `notLive` in `trunk-closure-observer.mjs` (no `live` entry, no recovery step, a different meaning of ambiguous); `--session-json` parsing in `execution-increment-delivery.mjs`, `execution-increment-resume.mjs`, and `trunk-closure.mjs` with different strictness | Coordinated edits; a race prints `undefined` in a closure gap reason |
| Stale wording still describes repository-and-branch matching | `execution-increment-delivery.mjs` header; test titles in `execution-increment-managed-delivery.test.mjs`, `execution-increment-managed-delivery-resume.test.mjs`, `trunk-closure.test.mjs`; `ci-monitor.md` Codex bullet and "Own one observer" | Readers are taught the removed selection rule |

## Current decisions

- A session that replaces a coordinator owns a new observer. It stops the old
  one by its recorded directory and its next `deliver` establishes its own, as
  `ci-notify-hosts.md` already says. `--session-json` names the same
  coordinator from a call that lacks its ambient identity, including a
  subagent coordinator's `agent_id`.
- Closure uses delivery's owner derivation and reads an observer through the
  repository identity its worktrees share. The retired checkout path is one
  accepted access root, not the only one.
- The native harness arms observers the way the taught guidance does. A Codex
  closure case arms `stream --coordinator` and records the note's coordinator
  and directory. Native runs stay paid and manually triggered; substitute runs
  are not native acceptance.
- No new owner model, schema, or CLI flag.

## Observed premises

Observed on 2026-10-10 at `17c33bd2` through the installed `deliver` and
`finish` of a scratch fixture built from `createCleanTrunkFixture`,
`installManagedDelivery`, `installClosureSkills`, `siblingCheckouts`,
`deliverThroughCli`, and `finishThroughCli`, with a controlled CI adapter and
a bare remote. No product file changed.

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Closure reaches observation for a project below its Git toplevel | Slice 1's one-derivation proof | Skills installed in `<worktree>/proj/.claude`; `deliver --workspace <worktree>/proj` as a Claude Code session, a final closure commit, then `finish --workspace <worktree>/proj --created-for-work` twice | `deliver` accepted and attached an observer it claimed. The first `finish` published once, reported that observer `reused`, completed with shutdown `confirmed`, and stopped at `step: "retire"`, `cleanup.reason: "ambiguous checkout"`, worktree preserved. The rerun stopped at `step: "observation"`, `ownership: "missing"` |
| Closure retires that layout | Slice 1's boundary | The same fixture; also `deliver` and `finish` with `--workspace <worktree>` | Retirement refuses the project path as `ambiguous checkout`. Naming the Git toplevel stops both commands with "CI runtime is missing from selected checkout". No rerun after retirement exists for this layout, so slice 1 proves its derivation with the worktree present |
| A retired-worktree rerun cannot read the owner's observer armed from the default checkout | Slice 1's rerun proof | `siblingCheckouts` for Claude Code; observer started from the default checkout and claimed by the publisher through the installed hook; `deliver`, an accepted final closure, `finish --created-for-work`, then the rerun from the default checkout with `--repository` | `deliver` reused that observer; the first `finish` reported it `recovered`, completed, and removed the worktree and branch; the rerun stopped at `step: "observation"`, `ownership: "missing"` |

## Outside-in proof ownership

| Promise | Owner and observable proof |
| --- | --- |
| Retired-worktree rerun reaches the owner's observer from any worktree | Slice 1: installed `finish` rerun from the management context with the observer armed from the default checkout, for a host session and a Codex stream; completion reused, cleanup `already-absent`, zero pushes, sibling untouched |
| One owner derivation | Slice 1: installed `finish` rerun on an accepted closure for a project below its Git toplevel reports the observer its `deliver` claimed and stops at `step: "retire"` with `cleanup.reason: "ambiguous checkout"`, as its first `finish` does, instead of `step: "observation"` with `ownership: "missing"` |
| Recovery guidance matches notification routing | Slice 2: installed `deliver`, `resume`, and `finish` gap reasons; the installed hook delivers a failure to the named session and nothing to the caller; guidance tests |
| Subagent coordinator keeps its observer | Slice 2: installed `deliver` with `--session-json` carrying `agent_id` reuses the observer that child claimed; without it the receipt names the input |
| Native closure harness uses taught inputs | Slice 3: substitute `trunk-closure` family for Claude Code, Cursor, and Codex through `tests/git-publication-native*.sh` |
| One gap vocabulary and session parser | Slice 4: every managed-delivery, resume, and closure suite |

## Ordered slices

### 1. A closure rerun after retirement reaches its owner's observer
Type: Behavior
Status: done
Proof: Extend `trunk-closure-owner.test.mjs` and `trunk-closure-codex-owner.test.mjs`
through installed `finish` with the publisher's observer armed from the default
checkout and the execution worktree retired, and add the accepted-closure rerun
for a project below its Git toplevel.

Behavior: The execution worktree is gone and the owner's observer was armed
from another worktree of the repository → `finish` reruns from the management
context with the retained owner input → it reads that observer, reuses or
repeats completion, and reports retirement. A stranger's input still stops.

Derive the owner through the function delivery uses and read the observer
through the shared repository identity. A project below its Git toplevel keeps
its own path as that identity while its worktree exists; its retirement stays
refused as today. Remove the misleading `foreign` reason
for the owner's own stream. Run all closure suites and the managed-delivery
consumers of the changed helpers.

Safe stopping point: closure reruns no longer depend on which worktree armed
the observer.

Accepted proof, through the installed `finish`, `deliver`, hook, and `stream`
with real observer workers, a bare remote, and a controlled CI adapter:
`trunk-closure-owner.test.mjs` and `trunk-closure-codex-owner.test.mjs` run
the retired rerun with the owner's observer armed from its execution worktree
and from the default checkout, and stop a stranger's input;
`trunk-closure-below-toplevel.test.mjs` runs the rerun for a project below its
Git toplevel. Command: `npm test --` with every
`src/skills/dough-story-wrap-up/scripts/trunk-closure*.test.mjs`.

Learnings for later slices: closure reads observers through
`observerAccess` in `trunk-closure-observer.mjs`, which returns the execution
checkout while it exists and the retired path plus the common Git directory
afterwards; `readMailbox` accepts that list. After retirement a coordinator
that reruns `finish` on its ambient identity alone can now reach its own
observer armed from the default checkout, as it already could while the
worktree existed. `trunk-closure.mjs` is 248 lines against the 250-line limit.

### 2. Recovery guidance names the observer that can notify the caller
Type: Behavior
Status: done
Proof: Extend the installed owner-gap and resume-owner proofs and the hook
boundary; align the guidance tests.

Behavior: A coordinator's `deliver`, `resume`, or `finish` finds no observer of
its own → the gap reason and the guidance tell a replacing session to stop the
recorded observer and deliver to establish its own, and tell a caller without
ambient identity, including a subagent coordinator, which session fields to
pass. A receipt that reuses a named session's observer says whose session
receives its events.

Update `trunk-publication.md`, `wrap-up-closure-publication.md`, and
`ci-notify-hosts.md` together. Run the managed-delivery, resume, session,
hook, and guidance suites.

Safe stopping point: no gap reason or guidance steers a caller to an observer
whose events it cannot receive.

Accepted proof, through the installed `deliver`, `resume`, `finish`, and host
hook: `execution-increment-managed-delivery-recipient.test.mjs` (a named
session's failure reaches that session's hook and never the caller's; a
subagent coordinator naming its `agent_id` keeps one observer),
`execution-increment-managed-delivery-resume-owner.test.mjs` and
`-resume-owner-gaps.test.mjs` (gap wording, recipient, and a replacing
session's journey on both hosts), `trunk-closure-owner-gaps.test.mjs` (the
same for `finish` on Claude Code), and `observer-owner-guidance.test.mjs`.

Learnings for later slices: host receipts carry `observation.notifies`, the
session that receives the observer's events and the input that named it; a
harness can assert it. The shared recovery sentence and session fields live in
`ci-host-bridge.mjs` (`ownObserverRecovery`, `eventRecipient`,
`hostIdentity.fields`); each gap table appends its own command step.
`eventRecipient` needs the raw explicit session to tell `--session-json` from
the ambient identity, so one parser keeps that distinction. The named-session
hook proof and the `finish` replacing-session journey run for Claude Code
only. `trunk-publication.md` is at the 250-line limit,
`execution-increment-observation.mjs` at 245, `trunk-closure.mjs` at 248.

### 3. The native closure harness arms observers as the guidance teaches
Type: Behavior
Status: done
Proof: The substitute `trunk-closure` cases for each host through
`tests/git-publication-native*.sh`; assess native evidence under ADR 0005.

Behavior: A native closure case starts → its fixture arms and records the
observer through the taught route for that host → the agent's `finish`
registers on it and the controller observes that registration. The Codex case
arms a claimed stream and records its coordinator and directory.

Align `tests/support/trunk-closure-native-*` and
`native-agent-owned-context.sh`. Correct plan 280's statement that no harness
case exercises Codex closure where it is retained. Record the literal manual
native commands; run none without the developer's authorization.

Safe stopping point: every offered native closure case can pass with inputs a
real agent is taught.

Accepted proof: `tests/git-publication-native-owned-context.sh` runs the
substitute `trunk-closure/owned-context` case on Claude Code, Cursor, and
Codex through the controller and the installed `finish`; with it
`tests/git-publication-native.sh`, `tests/native-evidence-identity.sh`, and
the two `tests/native-assessor-counterexample*` checks.

Decision: on Claude Code and Cursor the fixture arms no observer, because only
the launched session's own tool carries the coordinator's identity; its
`finish` establishes the observer and the controller follows the one that
holds the final closure's coverage record. Only the Codex fixture arms and
records one. The native host cases therefore no longer exercise reuse of an
observer armed earlier; `trunk-closure-owner*.test.mjs` keeps that proof.
Plan 280's statement about Codex closure survives only in Git history.

Learnings: `finish` establishes a host coordinator's observer through managed
delivery when it holds none and the final closure is unpublished. The
`source` and `ignored-only` closure scenarios have no committed substitute.
The owned-context check now runs the closure three times; compare it with
`bash scripts/ci-test-times.sh` after CI reports.

### 4. One gap vocabulary and session-input parser
Type: Structure
Status: done
Proof: Existing managed-delivery, resume, and closure suites stay green.

Give delivery, resume, and closure one table from classification kind to
reason, with each command's recovery step, and one `--session-json` parser.
Correct the stale header, test titles, and `ci-monitor.md` wording. Consolidate
the three proofs of the missing-identity gap where one keeps the journey.

Safe stopping point: the correction is complete.

Accepted proof: the managed-delivery, resume, closure, one-shot, and guidance
suites and the payload and install checks stay green;
`trunk-closure-owner-gaps.test.mjs` pins the observer that goes live while
`finish` runs, which used to print `undefined`.

Result: `execution-increment-observation-gaps.mjs` holds the one table and
`withExplicitSession` in `ci-host-bridge.mjs` the one `--session-json`
reading. Closure's ended, lost, not-live, and several-live reasons now use
the shared wording with a `finish` recovery step. The missing-identity journey
stays in `execution-increment-managed-delivery-owner-gaps.test.mjs` and the
closure owner-gaps journey.

Left as it was: when several of the owner's observers each registered the
final closure and none is live, `finish` reports `ownership: "ambiguous"` with
its own text and no recovery step; folding it into the table would change
selection or the receipt schema, and no test reaches it. The three commands
keep their own flag loops, which differ on a `--session-json` value that
starts with `--`. `deliver` reads the table only for several live observers.

## Execution complete

Product advice: no backlog change recommended. The review left one bounded
follow-up, [Recovery steps reach the observer they name](../291-recovery-steps-reach-their-observer/PLAN.md),
queued first by the developer at wrap-up. The developer had the subagent
identity guidance reworded to what is observed. Two decisions stay recorded
in that plan: which observer an ambient-identity `finish` rerun may use after
retirement, and what the native closure cases assert.

## Verification and gates

Run focused suites through `npm test -- <paths>` with the Node in
`.node-version` and Bash 5 first on `PATH`, per
[tests/README.md](../../../tests/README.md). Each slice includes proof
acceptance, independent post-change refactoring, and coordinator-owned
formatting and delivery. Shared helper changes run the managed-delivery,
resume, closure, and `tests/*.sh` consumers because distributed fixtures load
them. Paid native runs are manual only.

## Pending native evidence

Carried from the delivered ownership story under ADR 0005. No native run exists
for any of these; substitute and replay results are not native acceptance, and
each run is paid and needs the developer's authorization.

- Cursor and Claude Code: concurrent `deliver`, repair, and completion with the
  ambient session identity; `resume` and `finish` with ambient identity or
  `--session-json`.
- Codex: arm the documented cell with `COORDINATOR` set, confirm
  `<directory>/owner` after the first yielded output, run `deliver` with
  `--coordinator` and `--observer-directory`, and expect
  `observation.state: "reused"` on that directory; repeat with a second
  coordinator's stream live on the same target. Then `resume` and `finish` with
  the same inputs.
- Claude Code subagent coordinator: whether its Bash tool carries its parent's
  `CLAUDE_CODE_SESSION_ID` and whether it can state its own `agent_id` are
  unobserved. On the developer's decision of 2026-10-10 the guidance and
  receipt state only that the variable names the session alone and that an
  observer claimed with an `agent_id` is named by `--session-json` with both.
- Trunk-closure harness, every case
  `tests/git-publication-native.sh --native HOST --case trunk-closure/...`
  after its arming change: on Claude Code and Cursor one `finish` without
  `--session-json` whose receipt's `notifies` names the tool's variable; on
  Codex one `finish` carrying the note's coordinator and stream directory with
  `observation.state: "reused"`. `tests/native-publication.md` records the
  commands.
- Retained trunk-closure and git-publication evidence identities changed with
  the hashed modules.

## Sequence review and sizing

No slice target or limit was supplied. Slices 1–3 each own one journey with
its proof; slice 4 consolidates only representations the first three touch.
Refinement was not needed. The earlier concern about a project below its Git
toplevel is settled under [observed premises](#observed-premises): slice 1
proves the shared derivation at the accepted-closure rerun, and retiring that
layout stays outside this correction.
