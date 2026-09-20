# Prepare stories and slice plans without occupying shared main

Status: executing. Execution authorized 2026-09-20.

Execution identity: Story Branch Mode. Integration checkout/branch:
`/Users/terryyin/git/open-dough` on `main` (Taken claim `5128d91`, unpushed
until story wrap-up). Execution checkout/branch:
`.worktrees/065-prepare-stories-in-owned-worktrees` on
`quick/065-prepare-stories-in-owned-worktrees`, based on that same commit.
Authorized push destination: `origin` (`git@github.com:terryyin/open-dough.git`),
execution branch pushed there at each slice delivery; `main` is pushed only by
story wrap-up. CI: GitHub Actions default (`ci.yml` / `CI`), observer directory
`/tmp/dough-ci-501/watch-SfcVio`, bound to the execution checkout and this
coordinator session, observing pushes to `quick/065-prepare-stories-in-owned-worktrees`.

## Source and outcome

Identity: SEED-008#planning-workspace-procedure
Source: [refined story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#planning-workspace-procedure).
Terry confirmed the representative scenarios and then explicitly excluded
execution-startup backlog-to-Taken edits. That final exclusion takes precedence
over the earlier broad all-edits interpretation.

Outcome: decomposition, story refinement, slice planning, and plan refinement
prepare records in an owned worktree while other agents continue integrating.
A developer's decision to keep a result authorizes its bounded integration and
push; explicit local-only instructions override that default. Related preparation
reuses its workspace. Pauses preserve drafts; cleanup preserves unowned resources.

Execution-startup Taken changes stay outside this story. Do not change their
location, timing, authority, resume, or publication obligations. The later
same-machine coordination story owns their direct-on-main lock protection.
No queue, lock, daemon, workspace manager, execution mode, dashboard feature,
new CI observer policy, version bump, or release is included.

## Architecture and existing solutions

Applicable decisions: [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
(domain terms), [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(reuse, recoverability, current value),
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
(source and payload delivery), [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
(behavior proof and evidence reuse), and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(one runtime behavior source). Follow [AGENTS.md](../../../AGENTS.md).
ADRs 0007/0008 remain Proposed: report their planning-on-main wording mismatch;
this plan does not accept, supersede, or rewrite them.

PFE assessment of the current product:

- `src/skills/dough-manual-testing/references/exploration-workspace.md` already
  owns selecting/reusing a checkout, recording identity, partial setup failure,
  verified resume, and safe resource retention. It explicitly defers integration
  to the caller. Reuse that lifecycle by reference, clarifying neutral caller
  wording only if needed; do not duplicate Git workspace recipes or change
  manual testing's authority. A supplied checkout is suitable for preparation
  only when it is exclusively owned and separate from the integration checkout.
- `src/skills/dough-execute-plan/references/trunk-publication.md` owns fetching,
  rebasing only the unpublished owned suffix, validation, local fast-forward,
  exact-candidate push, rejection recovery, and interrupted-publication recovery.
  Reuse these semantics. Its execution modes, claims, and observer registration
  are caller responsibilities, not preparation requirements. Expose the common
  Git procedure once, retaining execution entry points as thin callers and
  preserving their current behavior. A focused reference under that skill is
  sufficient; no new skill, package, script API, or generic workflow engine.
- `publication-rebase-conflict.md` and the product-backlog scripts already own
  backlog conflict routing. Preserve their use when a preparation change touches
  the backlog; don't implement another merge policy or parsing grammar.
- `dough-story-refinement/references/planning.md` is already the common planning
  lifecycle. Add one focused preparation-workspace reference there, composed
  from the existing workspace and publication owners. The four skill entry
  points load it before any record writes and return to it at disposition.
  Replace conflicting instructions, including decomposition's unconditional
  leave-uncommitted wording; retain review before a keep decision.

This follows [North Star: shared work publication](../../NORTH-STAR.md#shared-work-publication-with-replaceable-workspace-coordination).
Workspace ownership, permission to integrate, permission to publish, and CI
coverage remain different facts. Add no new ledger or configuration. Record
workspace/branch, starting base, integration checkout/target, resource ownership,
and publication candidate in the existing conversation or plan only as needed.
Preparation does not take the story or establish an execution identity.

## Proof and delivery conventions

Edit published guidance only under `src/skills/`; never hand-update installed
`.agents/skills` or `.claude/skills` copies. Include any new runtime reference in
`install.sh`, `src/install/open-dough-release-version.sh`, and
`tests/helpers/public-payload-fixture.bash` in the slice that first requires it.

Use the representative invocation/context/outcome review in AGENTS.md for each
changed skill. Observe actual file and Git state in disposable repositories with
a local bare origin for the integration examples. A scripted Git demonstration
checks the procedure, not whether a native agent follows the skill. Likewise,
link/byte tests prove delivery, not behavior. Do not add phrase-matching tests.

Existing focused checks, run when their boundary changes, with Bash 4+:

- `bash tests/story-payload-update.sh` and `bash tests/story-payload-assertions.sh`
  check installed planning dependencies, update preservation, and missing-link
  failure detection.
- `bash tests/execution-payload-update.sh` checks execution dependencies after
  common publication references move.
- `bash tests/product-backlog-git.sh` checks existing conflict routing when an
  affected publication dependency changes; it does not prove publication itself.
- `git diff --check` checks every slice's changes.

Under ADR 0005, record applicable existing integration evidence separately from
new behavior evidence for Codex, Cursor, and Claude Code. Select fresh native
observations for uncovered workspace/publication risks using existing native
runner support; no tool-by-skill-by-case matrix or new runner framework. If native
proof remains unavailable, retain it explicitly as pending in a linked acceptance
story before implementation closure; do not claim cross-tool success or release
changed behavior from prose review alone. Do not create that follow-up now.

Future execution uses the existing execute-plan gates: accept focused proof,
independent post-change refactor, required formatting/lint, commit and delivery,
retrospective and wrap-up. Planning here performs none of that execution.
No project-specific numeric slice target or hard limit was found. Size by one
cohesive change and one outside-in proof loop; native runtime waits are reported
separately rather than used to justify a broad implementation slice.

## Ordered slices

### 1. Prepare and continue records in one owned worktree
Type: Behavior
Status: done
Proof: Invoke each of the four preparation skills from the integration checkout
in representative review; observe edits only in its owned worktree. Continue from
refinement into planning and plan refinement, and start from a suitable existing
host workspace. Observe reuse, no nested workspace, and unchanged integration
checkout. A second writer's prepared increment can integrate during a question.

Delivered: added
`src/skills/dough-story-refinement/references/preparation-workspace.md`,
composing `dough-manual-testing/references/exploration-workspace.md`'s
selection/resume/close lifecycle with the new write-gating, role-based
identity, reuse, tiny-correction-inclusion, Taken-transition-exclusion, and
isolated-draft rules; routed `dough-story-decomposition/SKILL.md`,
`dough-story-refinement/SKILL.md`, `dough-slice-planning/SKILL.md`, and
`dough-slice-plan-refinement/SKILL.md` through it before their record writes;
added the new file to `install.sh`'s `managed_files` array (the release-version
script and payload fixture derive their lists from it dynamically, confirmed
by reading both). Searched project documentation for stale "where planning
happens" prose per the plan's instruction; found none needing a change beyond
the skills themselves (the existing quick-edit-requirements doc already
anchors the direct-edit exception this slice preserves). Noted, without
editing, that Proposed ADR 0007 (`docs/adrs/0007-*.md:24`, "story refinement,
and planning on `main`") is now stale against this rule; ADR 0007 remains
Proposed and unedited per the plan.

Accepted proof:
- `PATH="/opt/homebrew/bin:$PATH" bash tests/story-payload-update.sh` — pass;
  covers installed dependency-link resolution for every `dough-story-*`
  managed file including the new reference and its links.
- `PATH="/opt/homebrew/bin:$PATH" bash tests/story-payload-assertions.sh` — pass.
- `PATH="/opt/homebrew/bin:$PATH" bash tests/execution-payload-update.sh` — pass;
  confirms execution-payload wiring undisturbed.
- `PATH="/opt/homebrew/bin:$PATH" bash tests/product-backlog-git.sh` — pass
  (unaffected boundary, run because it is in the affected-dependency list).
- `git diff --check` — clean.
- Representative review of all four skills' gated write paths and the reuse/
  no-nested-workspace/second-writer-integrates/role-based-identity claims
  against the new reference's prose (inspected directly, not merely reported).
- `dough-post-change-refactor` found no candidate: `## REFACTOR COMPLETE`,
  outcome "none — already clean".

Add the shared preparation-workspace entry, reusing exploration-workspace
selection/resume. Route all four skills through it before edits, resolving the
project and installed guidance from the intended checkout. Shared checkout
identity is determined by role, not merely by Git reporting a worktree. Missing
or ambiguous ownership stops only writes requiring it. Read-only discussion
alone does not require a new workspace. Include tiny preparation corrections;
explicitly exclude execution-startup Taken updates. Deliver the installed
reference closure and update the relevant planning-workspace explanation in
project documentation without removing the direct-edit claim exception.

Sizing: one common workspace rule with four thin entry points; medium confidence.
Review all four to catch early writes, but do not implement four lifecycles.
Safe stopping point: drafts are isolated and reviewable; automatic keep-delivery
is not claimed until slice 3.

### 2. Expose the existing publication procedure without changing its callers
Type: Structure
Status: done
Proof: Compare each current caller's obligations before/after the extraction;
exercise the unchanged claim and increment sequences against a disposable origin,
including an advanced remote and a rejected push. Run the affected execution
payload check and backlog check above. Observe retained claim ordering,
exact-candidate identity, local/remote agreement, and unchanged observer ownership.

Delivered: extracted `Preconditions`, `Publish the candidate`, and
`Recover a rejected push` out of `trunk-publication.md` into a new
`dough-execute-plan/references/publish-the-candidate.md`, following the
existing `publication-rebase-conflict.md` split precedent; `trunk-publication.md`
keeps those headings as thin wrapper stubs so every existing inbound anchor
still resolves unchanged (`dough-story-wrap-up`, `ci-monitor.md`, `wrap-up.md`,
`execution-location.md`, `publication-rebase-conflict.md` all verified). Did
not move `Resume an interrupted publication` or `Preserve remaining state`:
their prose is genuinely interleaved with claim/increment/CI-observer
vocabulary and separating them would require inventing generalized wording not
in the source — left for whichever later slice needs a second caller (slice 3
only needs ordinary publish). Added `publish-the-candidate.md` and the
pre-existing, previously-unlisted `publication-rebase-conflict.md` to
`install.sh`'s `managed_files`. Added scripted Git proof
`publish-the-candidate.test.mjs` (claim publication with no execution
worktree yet; proactive rebase-onto-candidate when remote advanced before any
push), reusing `trunk-publication-local-main-test-fixtures.mjs`'s helpers.

Accepted proof:
- `node --test src/skills/dough-execute-plan/scripts/publish-the-candidate.test.mjs` — 2/2 pass.
- `node --test src/skills/dough-execute-plan/scripts/trunk-publication-local-main.test.mjs` — 3/3 pass (unmodified behavior; covers ordinary verified-increment publication, an unrelated-commit precondition stop, and rejected-push recovery).
- `PATH="/opt/homebrew/bin:$PATH" bash tests/execution-payload-update.sh` — pass.
- `PATH="/opt/homebrew/bin:$PATH" bash tests/product-backlog-git.sh` — pass (28 sub-tests, rebase-adapter routing this extraction's cross-links depend on is undisturbed).
- `git diff --check` — clean.
- Caller-obligation comparison across every `rg -n 'trunk-publication|publish-the-candidate|recover-a-rejected-push|resume-an-interrupted-publication' src/skills` hit: same anchors resolve, same steps required, same order, for every caller.
- `dough-post-change-refactor`: fixed stale cross-file citations the extraction left behind (in the new file, `publication-rebase-conflict.md`, and two test-fixture comments) and the pre-existing missing-payload-entry gap for `publication-rebase-conflict.md`; re-ran all proof after editing. `## REFACTOR COMPLETE`.

Separate only the reusable publication mechanics and recovery from execution's
mode, claim, validation, and CI-observer policy. Keep existing anchors as wrappers
where needed to preserve inbound links. Inventory callers with
`rg -n 'trunk-publication|publish-the-candidate|recover-a-rejected-push|resume-an-interrupted-publication' src/skills`
before editing. Preserve direct-on-main claims and Story Branch/Trunk Mode
semantics exactly. Update required payload declarations with any extracted file.
This directly enables slice 3's preparation publication without a duplicate path.

Sizing: one shared-procedure extraction with preserved consumers; medium
confidence because execution and observer wording is interleaved. If separation
requires caller redesign, stop and reassess the extraction rather than expanding
scope. Safe stopping point: existing execution behavior unchanged.

### 3. Integrate and push a retained preparation result
Type: Behavior
Status: done
Proof: In an isolated preparation journey, let another writer advance origin;
then conclude that the prepared result should be kept. Observe that only retained
changes are committed, rebased onto current origin, integrated locally, and
pushed without another approval question. Confirm candidate identity and retained
intervening work; no Taken transition, implementation, or execution observer is
started. Repeat the disposition with an explicit no-push instruction and observe
that origin stays unchanged.

Delivered: `preparation-workspace.md` now records this preparation's
integration checkout/target during workspace selection, and replaced the
unconditional "leave drafts isolated" rule with "Decide what happens to the
written result" (explicit keep, explicit no-publish, or default-stays-isolated
— silence/pause is never keep), "Validate a keep instruction before acting",
"Keep and publish the retained result" (commit the retained record if needed,
reuse the recorded integration checkout/target, call slice 2's
`publish-the-candidate.md` Preconditions/Publish-the-candidate/Recover-a-
rejected-push verbatim), and "What keep does not do" (no Taken transition, no
implementation, no CI/execution-observer). Updated the four skills'
disposition sentences to apply the keep decision before close/retain;
`dough-story-decomposition/SKILL.md`'s prior unconditional "does not commit"
claim is now conditional. Added scripted Git proof
`preparation-workspace-keep-publish.test.mjs`, reusing
`trunk-publication-local-main-test-fixtures.mjs` helpers (that shared file's
`assertPublicationAgreement` gained an optional `execution` parameter during
refactor, backward-compatible with its existing callers).

Accepted proof:
- `node --test src/skills/dough-story-refinement/scripts/preparation-workspace-keep-publish.test.mjs` — 2/2 pass: keep-and-push rebases onto an advanced origin, preserves the other writer's intervening commit as the rebased candidate's parent, and converges local/origin/candidate; explicit no-push leaves origin and local integration target unchanged with the retained commit still recoverable in the owned workspace.
- `node --test src/skills/dough-execute-plan/scripts/publish-the-candidate.test.mjs src/skills/dough-execute-plan/scripts/trunk-publication-local-main.test.mjs` — 5/5 pass (regression check on the shared fixture helper's now-optional `execution` parameter).
- `PATH="/opt/homebrew/bin:$PATH" bash tests/story-payload-update.sh` — pass.
- `PATH="/opt/homebrew/bin:$PATH" bash tests/story-payload-assertions.sh` — pass.
- `git diff --check` — clean.
- Inspection: "no Taken transition, implementation, or execution observer" verified by reading "What keep does not do", which explicitly forbids all three and points to `ci-monitor.md#own-one-observer` as remaining execution's concern.
- `dough-post-change-refactor`: confirmed no restated duplication of publish-the-candidate.md's mechanics, no stale unconditional no-publish wording left in the other three skills, no naming collision with **Taken**, deduplicated the new test's convergence assertions against the shared `assertPublicationAgreement` helper. `## REFACTOR COMPLETE`. One mechanical lint failure (two unused imports left over from that dedup) fixed directly by the coordinator before formatting.

Add the keep decision and caller validation to the shared preparation lifecycle;
call slice 2's common publication and existing explicit integration-turn protocol.
Replace unconditional commit/push prohibitions in affected preparation guidance
with the keep/disposition rule while preserving planning-only execution limits.
Publication authority covers owned preparation only. A missing destination or
unknown integration ownership is a real stop, not permission to guess.

Sizing: one disposition-to-publication journey; medium confidence. Existing
common publication owns retries and reconciliation. Safe stopping point: retained
records reach origin; cleanup may conservatively leave the workspace intact.

### 4. Retain and resume an undecided preparation session
Type: Behavior
Status: planned
Proof: Pause a preparation session before keep, resume it after main advances,
and observe the same draft/workspace without publication. A partial setup or
identity mismatch preserves resources and stops affected edits. An explicit
discard removes only the identified session-owned draft; unrelated edits remain.

Reuse workspace identity verification and retention. Silence never becomes keep
or discard. Discussion and waiting leave no preparation edits on shared main.
Do not add a session registry or automatically replace a workspace whose identity
cannot be established. Clarify that a resumed session can inspect advanced main
without prematurely integrating an undecided result.

Sizing: one draft-resumption rule and its ownership boundaries; high confidence.
Safe stopping point: unfinished preparation remains recoverable independently of
publication or automatic cleanup.

### 5. Recover an interrupted preparation publication
Type: Behavior
Status: planned
Proof: Interrupt after local integration, and separately after a successful push
whose response is lost. Resume through the shared publication recovery and
observe no duplicate commits/pushes or replacement worktree. A conflicting story
scope change preserves both sides and names the human decision needed; a dirty
or unknown shared target stops before mutation.

Connect preparation's retained base/candidate/target to common publication
recovery, including changed candidate identity after a rebase. Keep further
product discussion outside an active integration turn; a blocked turn requires
explicit recovery/handoff, never timeout release. Do not duplicate reconciliation
or retry rules, automatically stash/reset another person's work, or add a
preparation recovery state machine. Reuse slice 2's execution preservation proof
where its boundaries are unchanged; observe preparation's own caller state here.

Sizing: one publication-resumption contract; medium confidence. Setup supplies
an interrupted state, not the successful recovery. If a missing common case is
found, repair its shared owner rather than adding a preparation-only exception.
Safe stopping point: failed publication is recoverable; no cleanup is attempted.

### 6. Close a preparation session without deleting reusable work
Type: Behavior
Status: planned
Proof: Complete keep/integrate/push for a session-created disposable workspace,
then observe safe removal of only that workspace and branch. Complete the same
journey in a reused or host-owned workspace containing unrelated unfinished work;
observe that it remains. Failed or unconfirmed publication never triggers cleanup.

Compose the existing workspace cleanup with the confirmed preparation publication
boundary. Ensure retained versus disposable ownership is explicit, and that
resource removal does not depend on assuming a clean directory proves ownership.
Report retained paths when cleanup is unsafe and report unpublished preparation
as invisible to the origin-only dashboard. Finish the representative end-to-end
behavior review through decomposition, refinement, planning, and plan refinement;
reuse earlier sufficient observations rather than replaying the full matrix.

Sizing: one cleanup decision at an established successful boundary; high
confidence. No host-specific automatic deletion or background-mode redesign.
Safe stopping point: the story's whole preparation lifecycle is usable without
the future queue.

## Promise ownership

| Source promise / confirmed example | Owning slices and observable proof |
| --- | --- |
| Start on main, isolate every preparation edit, including tiny edits | 1: actual edit locations and clean integration checkout |
| Reuse across skills and host-supplied workspace | 1: same verified workspace; no new nested entries |
| Other agents integrate while questions are pending | 1: intervening integration succeeds with draft left isolated |
| Keep authorizes commit/integration/push, not implementation | 3: published retained records without another approval or Taken change |
| Explicit local-only instruction wins | 3: unchanged origin |
| Main advances; preserve the other writer | 3: both changes in resulting history |
| Pause, reject, or ambiguous workspace identity | 4: preserved draft, verified resume or precise stop |
| Conflicting intent or interrupted publication | 5: preserved work, correct publication resume or human decision |
| Serialization deferred; claims remain out of scope | 1–5: current execution callers preserved, no lock implementation |
| Cleanup only disposable owned resources after publication | 6: owned removal, reused/dirty/unpublished retention |
| Unpublished preparation is invisible remotely | 6: truthful report matched to fetched origin |
| One shared source, delivered dependencies, cross-tool coverage honesty | each slice: changed-call-site review, applicable payload checks and evidence assessment |

## Current decisions and refinement assessment

Retain the existing workspace lifecycle and one publication sequence; preparation
adds the keep/disposition rule, not another Git workflow. Do not unify preparation
with execution merely because both use worktrees. Keep claim semantics untouched.
A conflict in product intent remains human-owned. Native evidence gaps are not
filled by static checks or another host's success.

All slices remain planned, with no implementation evidence yet. No completed
proof is claimed. Refinement reordered workspace behavior before the publication Structure slice,
placing that extraction immediately before its first new consumer. It split the
former combined draft/publication recovery slice into slices 4 and 5, each with
one lifecycle boundary. Result: six slices, no sizing exceptions or resplit
recommendation.

Cumulative assessment: Ready for each of slices 1–6 under the single-boundary
sizing rule. Structure is limited to sharing an existing procedure; the later
examples exercise workspace ownership, disposition, publication and cleanup
without accumulating new mechanisms. Existing exploration-workspace callers
include manual testing and bug fixing: any neutral wording change must preserve
their caller-owned delivery and cleanup. No additional North Star topic is needed.
The extraction and recovery proofs remain mandatory; this assessment does not
claim they have passed. No remaining slice-specific refinement concern was found
in this review. Ready for direct execution as a plan assessment; actual execution
still requires separate authorization. No unsupported infrastructure assumption
requires a planning-time experiment: this uses existing Git behavior and guidance.
