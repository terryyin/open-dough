# Start queued work with a confirmed remote Taken claim

Status: planned.

Identity: `SEED-008#settle-taken-claims-on-remote-trunk`

Source: [refined story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#settle-taken-claims-on-remote-trunk).
Terry authorized story refinement and slice planning after the reviewed
architecture/backlog commit `3287d02`. This plan grants no Take or implementation.

## Goal and scope

In either supported execution mode, authorized queued work starts from the
intended published story/plan in a suitable owned workspace, with Taken confirmed
on authoritative remote trunk before implementation. One installed startup
operation owns source preflight, workspace selection, claim mutation/commit,
publication/recovery, and safe local-main refresh attempts. Preserve unrelated
local work and report local maintenance separately from remote acceptance.

Support queued planned work and explicitly authorized queued planless work through
existing preparation and authority rules. Resolve actual remote/trunk names.
Preserve existing caller-selected and host-owned workspace/mode restrictions;
no new host mode, branch-protection bypass, or publication authority. Context-only
work without a queue claim stays on its existing path.

Project-command preparation remains with execution-location guidance and must
succeed before implementation. The new command neither runs implementation nor
creates a general dependency installer/readiness runner. Its accepted claim is
retained if later project setup fails. CI setup/attachment, normal increment
publication, preparation keep, closure, ownership-name allocation, automatic
checkout locking, and invisible host triggering belong to other stories.

## Existing solutions and current decisions

Follow the [reviewed design](../../../docs/maintainer/execution-publication-design.md)
and [North Star: remote publication and default-checkout ownership](../../NORTH-STAR.md#remote-publication-and-default-checkout-ownership).
Accepted ADRs [0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md),
[0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md), and
[0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
constrain cohesion, delivery, proof, and instruction ownership. ADR 0009 remains
Proposed; no lifecycle or ADR-status decision is made here.

PFE carried forward from the architecture review and checked during planning:

| Responsibility | Existing owner; selected action |
| --- | --- |
| Canonical source and preparation | `dough-product-backlog/scripts/product-backlog-home-reader.mjs`, `product-backlog-story-state*.mjs`: reuse pure readers on fetched/staged/worktree text, loading the recorded plan as needed. No second Markdown grammar. |
| Take | `product-backlog-take.mjs` and store: reuse membership and plan-link semantics. Take itself does not enforce execution authority/readiness; startup must invoke the existing preparation reader/refusal contract first. Pass the selected plan explicitly; the old claim fixture helper omits it. |
| Workspace and publication | `dough-execute-plan/scripts/workspace-publication*.mjs`: extract usable Git mechanics into production modules and the small CLI facade, provisionally `execution.mjs start`. Remove runtime dependency on `publication-test-fixtures.mjs`, hardcoded `origin/main`, fixture readiness, and `onImplement` callbacks. Do not build later publish verbs yet. |
| Race/ownership | Existing claim provenance and ownership classification plus real backlog Git adapters: reuse and correct within the same model. Identical Taken text does not establish ownership. No new registry. |
| Local refresh | `maintain-default-checkout.mjs`: reuse eligibility with real established caller access and extract its production dependencies. It does not acquire access. Unknown access defers even when clean; do not invent an owner merely to advance main. |
| Installed workflow | `dough-execute-plan/SKILL.md`, `references/execution-location.md`, `trunk-publication.md`, `publish-the-candidate.md`, and `maintain-default-checkout.md` behavior: replace claim-specific procedural repetition with one operation/result contract. Preserve other publication callers and project setup. |
| Proof | Existing workspace claim/race tests and `tests/git-publication-native.sh`: reuse Git/host infrastructure, replace inadequate setup/assertions, extend with actual queued startup journeys. Existing generic publication fixtures are not startup proof. |

Unqualified script/reference paths above are under `src/skills/`; the local
refresh reference is `dough-execute-plan/references/maintain-default-checkout.md`.
Production imports must ship in the standalone payload through existing installer
mechanisms. Edit source guidance, not managed `.agents`/`.claude` copies.

### Source freshness versus preparation readiness

Compare the originating checkout's unpublished source changes at each relevant
Git layer: local commits outside fetched trunk, index versus HEAD, and worktree
versus index. Use the canonical anchored region for the selected story and the
active plan; inspect identity/path context needed to interpret them. An unrelated
sibling-section edit is not a selected-source change. Unresolvable identity,
selected source deletion, or unpublished selected-source changes stop before a
new claim; preserve all original bytes and index content.

Read preparation assessment from the fetched remote snapshot and associated
published plan, independently of unrelated local edits. Current assessment hashes
cover the whole canonical document, excluding state fences. Do not change that
policy here: a genuinely stale published assessment still stops for re-review.
A local sibling edit must not invalidate an otherwise valid remote assessment.
Repeat the affected checks after remote reconciliation changes the source basis.

### Publication and recovery boundary

Use an exact owned claim candidate/base and the authorized remote ref. Rebase only
its unpublished suffix with the backlog adapter. Confirm both remote containment
and current selected claim ownership/membership, allowing a later remote descendant.
On a remote race, refetch, recheck, reconcile, and retry once under the existing
contract. An unresolved conflict or further race preserves recoverable state.

For first acquisition, retain the publisher/execution identity and workspace in
existing plan/conversation context and claim provenance. Resume verifies those
facts against Git; it does not generate a new claimant. New-claim reuse must
establish an isolated candidate:
unrelated staged changes or mixed unpublished commits cannot enter the claim
commit/push. Preserve them and stop for workspace resolution when isolation is
not established; dirty originating main remains separately supported. Never push
another task's commit, rewrite published history, or blindly retry an ambiguous push. Accepted
publication survives refresh failure and subsequent project-setup failure.

Attempt one safe local-main refresh during startup and one after accepted trunk
publication; each observes a fetched head, not perpetual equality. Clean and
behind with established access fast-forwards. Dirty, busy, ahead/divergent,
unexpected-branch, or ambiguous access preserves work and yields a separate
maintenance outcome. No automatic locking or coordination service is introduced.

## Ordered slices

### 1. Start queued work through the installed remote-claim boundary

Type: Behavior
Status: done

Behavior: authorized queued work has valid published preparation, with clean or
unrelated dirty originating state → invoke installed startup → select/reuse the
owned workspace from fetched trunk, publish the isolated Taken claim to trunk in
either mode, attempt safe local refresh, and return the exact accepted receipt.
Selected unpublished source, failed fetch, incompatible workspace/authority, or
invalid preparation stops before claim publication and implementation.

Deliver production extraction, the real command, installed dependencies, and the
claim callers together. Preserve planned plan links and explicit planless rules.
Return enough existing execution context for the caller to run project setup and
continue; no implementation callback and no CI success implication. A native agent
uses one startup operation instead of separately assembling fetch/Take/commit/push.
The separate local Take tool retains its domain purpose.

Proof owned by this slice:

- Extend `workspace-publication.test.mjs` with real CLI subprocesses against a
  bare remote and genuine canonical story/plan/preparation records. Drive both
  modes; inspect remote backlog/claim provenance independently. A story-branch
  claim goes to trunk, not merely its future progress branch. Exercise a
  non-default remote/trunk name to catch fixture hardcoding.
- Inspect index blobs and tracked/untracked content before/after unrelated dirty
  main startup. Include a sibling story edit in the same seed, selected source
  changes separately in index/worktree/local commits, and stale published
  readiness. Assert blocked cases produce no claim or implementation and do not
  overwrite existing work. Valid remote readiness must ignore unrelated local
  document edits.
- Reuse matching owned workspaces without nesting or branch switching; preserve
  existing host/mode refusals. Confirm clean-main refresh at startup and after
  acceptance with established access. Busy/unknown/dirty/divergent cases retain
  content and return deferred maintenance rather than false publication failure.
- Preserve the existing project-setup gate. A real failing fixture command after
  accepted Take leaves the claim/workspace intact and implementation unstarted.
  The old substitute readiness actor and test-supplied `onImplement` callback
  cannot prove the installed workflow crossed the right boundary.
- Extend the existing native runner with real queued startup fixtures and cases
  below. Install the candidate before fresh use. Observe actual command invocation,
  remote claim acceptance before the first implementation edit, and local content
  preservation. The prompt states the user's execution goal and authority, not
  the expected command sequence. Add assessor counterexamples for skipped
  startup, early implementation, local-only Take, wrong target, and captured
  human edits; do not infer success from the agent's final prose.

Focused commands (new native case names must be added to the existing runner):

```sh
node --test src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs
bash tests/execution-payload-update.sh
bash tests/product-backlog-payload-update.sh
bash tests/git-publication-native.sh
bash tests/git-publication-native.sh --native codex --case publication/startup-trunk
bash tests/git-publication-native.sh --native cursor --case publication/startup-story-branch
bash tests/git-publication-native.sh --native claude --case publication/startup-story-branch
bash tests/git-publication-native.sh --native claude --case publication/startup-selected-source
```

Use the same maintained CLI scenario tests for refresh and source cases; do not
add another shell runner or a cross-product host matrix. Existing install/update
proof is reusable only for unchanged boundaries. Because the new command and its
imports ship, observe real installation followed by use for affected dependencies.

Safe stopping point: ordinary authorized startup works through the production
boundary and unsafe paths stop with preserved work. Concurrent/uncertain outcomes
may still stop conservatively; slice 2 supplies the promised bounded recovery.
Do not report the whole story complete at this point.

Execution evidence (2026-09-23): The installed `execution-start.mjs start`
command checks fetched preparation and local selected source, selects an
isolated workspace, takes and confirms the claim on remote trunk in both
modes, and reports local refresh separately. `node --test
src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs` passed
19/19 after refactoring and formatting, covering both modes, non-default
remote/trunk, source changes at each Git layer, unrelated local work,
maintenance deferrals/stops, installation/use, and setup failure after an
accepted claim. `bash tests/execution-payload-update.sh`,
`bash tests/product-backlog-payload-update.sh`, and
`bash tests/git-publication-native.sh` passed. Fresh Cursor Story Branch
native proof confirmed one installed CLI invocation, an owned Taken claim on
remote main, setup and implementation after acceptance, and preserved local
edits. Fresh Claude selected-source native proof confirmed a `source-refused`
tool receipt, no remote claim or implementation, and preserved source. Codex
Trunk native proof confirmed remote claim and setup but its implementation
agent facility failed with `no thread with id`; the full native journey
remains pending. An earlier Claude Story Branch journey completed, while the
tightened setup-timing rerun reached the expected Git and timing state but
ended with host API 429; that full tightened native verdict remains pending.
Carry these host-specific gaps into linked ADR 0005 acceptance work before
release. The refactor pass changed test and native-harness organization only
and returned `## REFACTOR COMPLETE`; post-format focused CLI and
credential-free native checks passed.

### 2. Reconcile and resume claims without duplicating ownership

Type: Behavior
Status: planned

Behavior: competing startups or an interrupted/uncertain claim publication reach
the shared command → reconcile distinct claims, or recover this execution's
already-accepted claim, or stop for another/ambiguous owner → implementation can
continue only on confirmed current ownership with valid source and workspace.

Complete bounded recovery through the same publisher and result contract. Two
stories can converge from one base; two attempts for the same story cannot both
claim ownership. Source/preparation changes during replay return for review before
publishing an invalid claim. Resume already-published claims through containment,
not exact equality to a later remote tip. Repeat only unfinished maintenance;
never convert refresh failure into a second Take or push.

Proof owned by this slice:

- Extend `workspace-publication-race.test.mjs` to invoke the real command for
  both executions, using controlled barriers only to arrange the race. Bare
  remote history must retain different claims once each in either order; a
  same-story rival/ambiguous provenance stops before implementation. Test the
  existing semantic backlog adapter, not a fixture that supplies the final merge.
- Inject a remote advance between candidate construction and push. Observe the
  owned suffix replay, source/preparation recheck, one retry bound, and exact
  accepted revision. A selected-source change or genuine conflict preserves the
  stopped candidate; unrelated remote changes do not disappear.
- Simulate interruption before push and lost response after acceptance; then
  start a fresh process with retained execution context. Advance remote after
  acceptance to prove ancestor recovery. Check no duplicate Take/commit/push,
  no mistaken rival ownership, and preserved partial state when verification
  cannot reach the remote. Use faults at existing Git/process seams; do not add
  production fault-control flags or a durable global operation log.
- After accepted publication but before/within refresh, fail the local step.
  Resume must report accepted remote ownership independently and safely retry
  eligible maintenance. Existing human content and another task's workspace
  remain unchanged.
- Add native competing-claim and resume cases to the same harness. Real source
  records and ownership evidence must exist: the old `rival.txt` generic fixture
  alone cannot establish a Taken conflict. Review all affected hosts for reuse;
  add another native run only for a host-specific requirement left unproved.

Focused commands:

```sh
node --test src/skills/dough-execute-plan/scripts/workspace-publication*.test.mjs
bash tests/git-publication-native.sh
bash tests/git-publication-native.sh --native codex --case publication/startup-claim-race
bash tests/git-publication-native.sh --native claude --case publication/startup-resume
bash tests/workspace-publication-callers.sh
git diff --check
```

The caller regression suite checks that production extraction has not broken
existing preparation/bug/manual-test consumers. It does not migrate them. Keep
native results pending until observed or supported by applicable reuse evidence;
if implementation is closed earlier, carry outstanding requirements into linked
acceptance work under ADR 0005 before releasing affected behavior.

Safe stopping point: both normal startup and required race/resume paths satisfy
the story through one installed boundary, with separate remote/local outcomes.
No later CI automation or local coordination story is required for correctness.

## Promise ownership and instruction review

| Promise | Owner and decisive observation |
| --- | --- |
| Both modes settle Taken on remote trunk before implementation | Slice 1: actual CLI/native trace and independent remote history. |
| Fresh intended published story/plan; selected local edits stop | Slice 1: real Git layers and remote preparation reader; slice 2 repeats after reconciliation. |
| Unrelated dirty main and sibling edits survive | Slice 1: exact index/content comparison and selected-region check. |
| Clean safe main normally advances; unsafe refresh is separate | Slice 1: observed heads and content; slice 2: accepted-then-failed-refresh recovery. |
| Same/different story races and uncertain acceptance | Slice 2: two real command processes, remote provenance/containment, fresh-process resume. |
| Project setup/authority/host restrictions preserved | Slice 1: refusal/failed-setup observations and installed caller review. |
| Cohesive source, shorter instructions, installed native use | Both slices: one runtime owner per rule, payload import closure, before/after reading path and actual native invocation. |

Compare the full startup path with `3287d02`: fewer routine commands and repeated
choices, no duplicate fallback recipe, and conditional detail loaded only when
needed. Success reports remain compact; source conflict and uncertain ownership
stay actionable. Treat command-count/prose changes as supporting evidence, not
proof that native agents used the new boundary. Inspect the ordinary caller and
recovery paths, not only CLI help.

## Delivery, sizing, and plan review

Execution uses the established per-slice post-change refactor/proof/commit gates
and staged check-only lint hook. Do not add a full-suite run or independently run
hook-owned lint. Native work uses disposable fixtures; no Donut/Doughnut repair,
production test claims, version bump, release, or unrelated installed-copy edits.

Two cohesive Behavior slices, with no separate infrastructure or testing slice.
The first owns ordinary startup including its source/preservation checks; the
second owns recovery under concurrency/interruption. Runtime, caller replacement,
and native evidence are kept together rather than deferred to a documentation
or integration slice. No numeric slice target/hard limit was supplied. These are
bounded proof loops, not time estimates; reassess if execution uncovers a new
framework requirement or incompatible caller purpose.

Plan refinement review: retain both boundaries. A separate source-reader or CLI
slice would not deliver the startup result; a separate local-refresh slice would
fragment its required receipt. Combining race/resume into ordinary startup would
hide its distinct ownership and interruption proof. The source-readiness concern
was resolved by distinguishing local selected-source changes from remote whole-
document assessment, without changing the latter. No remaining slice-specific
blocking concern was identified in this review. This judgment is not executed
proof; readiness is recorded against the final story and plan basis.

## Preparation and evidence

Owned preparation workspace:
`/Users/terryyin/git/open-dough-worktrees/refine-seed008-remote-publication`,
branch `codex/refine-seed008-remote-publication`, base `3287d02`.
Originating/integration checkout: `/Users/terryyin/git/open-dough`.
Terry authorized keeping this preparation, publishing to `origin/refs/heads/main`,
and removing the temporary preparation worktree/branch on 2026-09-23. These paths
record preparation provenance; later execution must establish its own workspace.

Plan root/layout is the existing `.planning/quick/NNN-name/PLAN.md`. Entry 079 is
the highest allocation found; 080 was checked absent immediately before writing.
No claim or implementation was performed while planning. No new runtime/native
proof has run; inspected tests establish reusable infrastructure and gaps, not
acceptance of the proposed operation. Record consequential execution learnings,
actual proof commands/results, and resume decisions here during authorized work.

## Execution identity and current state

Authorized execution began on 2026-09-23 in Story Branch Mode. The originating
and integration checkout is `/Users/terryyin/git/open-dough`; the created
execution worktree is
`/Users/terryyin/git/open-dough-worktrees/080-publish-startup-claims` on
`codex/080-publish-startup-claims`, based on `d5a3da0db09d7bbd9df73f48a0413c5d11330525`.
The Taken claim `bb50966257004d8c9c9fe9b4f40a22958eb93438` was accepted
on `origin/refs/heads/main` before implementation. Future execution increments
target `origin/refs/heads/codex/080-publish-startup-claims`. The local main
checkout was clean but remained behind the claim; no exclusive default-checkout
owner was established for a refresh, so maintenance was deferred. `npm ci` and
`node --test src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs`
succeeded in the execution worktree. The Codex CI observer is bound to
`terryyin/open-dough`, target `codex/080-publish-startup-claims`, coordinator
`080`, mailbox `/tmp/dough-ci-501/watch-iWiO9o`, PID `54058`, and yielded
cell `16`. The Story Branch claim on main has unobserved CI coverage.
