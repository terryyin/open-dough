# Gate Git backlog conflicts and deliver the scripted backlog

Status: planned; reviewed 2026-09-19. No execution has started or been authorized.

## Source and remaining outcome

Source: [SEED-008 story 6](../../seeds/SEED-008-worktree-branch-trunk-sync.md#gate-and-deliver-scripted-backlog).
The review assumes the predecessor, including corrections 058/059, is complete.
Correction 059 is currently Taken in this checkout; that is another execution,
not a reason to duplicate its work or claim its completion here. Before executing,
use the delivered predecessor revision and retain its applicable proof.

No active plan for this story existed at review. This is the sole current plan,
replacing the inherited remainder at
`46ce42d:.planning/quick/057-script-product-backlog/PLAN.md`, slices 11-17.
Completed slices 1-10 and correction evidence stay in Git; none are renumbered
as completed work here. No unfinished attempt-owned changes were present in the
review checkout. Do not reuse the predecessor's branch, observer, or worktree.

Outcome: installed workflows use the existing scripts to change and reconcile
the backlog, preserving compatible intent and stopping unresolved integrations
for human repair before continuation/publication. Merge, rebase, cherry-pick,
standalone installation/update, ordinary callers, and all three native hosts
remain in scope. Guard implementation is conditional on lightweight feasibility.
The seed owns exclusions; this plan adds no core redesign or Git lifecycle.

## Reassessment and selected solution

The repeated work repaired the core; it did not demonstrate Git or installation
delivery. Repeating those repairs or keeping the old seven headings would not
resolve the remaining risks. Shipping only commands is the strongest smaller
alternative, but leaves managed integration and ordinary agent use unproved.
Retain the outcome and reduce hidden work within its slices.

PFE checked the current source and callers, not just the historical plan:

| Responsibility | Reuse or bounded gap |
| --- | --- |
| Domain decisions | Reuse `src/skills/dough-product-backlog/scripts/` and `tests/product-backlog.sh`. Git adapters supply inputs; they do not duplicate membership, identity, priority, direction, or rendering rules. |
| Human candidate validation | CLI currently has no validation-only operation. Reuse the document/version invariants behind `parseBacklog`, `readVersion`, and `publishableCandidate`; expose only the read-only boundary recovery needs. Do not implement validation by merging the three disputed inputs again. |
| Git callers | `dough-execute-plan/SKILL.md`, `references/trunk-publication.md`, and `dough-story-wrap-up/SKILL.md` currently route textual conflicts to prose. Extend their existing integration boundaries, including clean results; retain branch, publication, and unrelated-conflict ownership. |
| Delivery | Extend `install.sh`, `src/install/open-dough-release-version.sh`, and `tests/helpers/public-payload-fixture.bash` together. Reuse real tagged fixtures from `tests/story-payload-update.sh` and `tests/execution-payload-update.sh`. |
| Native hooks | `src/install/open-dough-register-hooks.mjs` currently registers CI fragments for Cursor and Claude, not Codex edit protection. Reuse safe settings merging where it fits; do not assume this proves an edit hook or build a generic plugin framework. |
| Native observation | Reuse existing `tests/support/native-*` isolation, bounded execution, and assessment support. ADR/update journeys prove their own mechanisms, not backlog behavior. Add shared backlog cases and only necessary host adapters. |
| Root insertion helper | `scripts/product-backlog-insert.mjs` already delegates to shared modules. Retire the unused entry point during caller routing; do not describe it as a second merge-rule implementation. |

The cumulative model remains one backlog and one set of domain rules. Git has
operation-specific input selection; native hosts have different tool events.
Those differences justify thin adapters, not separate reconciliation models.
Human-candidate validation answers whether supplied bytes are admissible;
automatic reconciliation answers whether both branch changes can be combined.
Neither substitutes for the other.

Apply [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
for coherent ownership; [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
and [ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
for complete standalone delivery and preserved project data;
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) for
deterministic/native proof; and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
with [AGENTS.md](../../../AGENTS.md) for shared executing-project guidance.
The ADR index and relevant records agree; no exception is required. ADR 0007
remains Proposed. The backlog's existing near-future direction supports this
work; no new North Star topic or direction change is needed.

## Decisions that constrain execution

- Capture identifiable immutable Git inputs before the operation loses them.
  Use index stages where present, but do not rely on them after a clean result.
  Missing inputs stop. Reuse recoverable Git state; no permanent operation log.
- Run semantic reconciliation on clean outcomes too. Duplicate detection or
  parsing alone misses direction and priority disputes. Validate the actual
  staged/result bytes the caller will accept, not only an earlier candidate.
- On failure, stop the affected caller and leave its refs, index, and worktree
  recoverable. Never auto-abort, skip, reset, select a side, or ask AI to repair.
  Unrelated conflicts are neither resolved nor accepted by this gate.
- Recovery is explicit: a human supplies the result, the script validates its
  invariants without writing it, and the caller resumes from the retained Git
  boundary. A valid human decision may differ from the automatic candidate.
  The current core diagnostic telling a human to repair input versions and merge
  again is insufficient for this Git journey; align the Git-facing diagnostic
  and guidance. Keep original evidence and avoid a validation/acceptance mismatch.
- Trunk's normal candidate rebase, rejected-push suffix rebase, and subsequent
  execution-branch replay have different inputs. Inspect all three actual caller
  paths. Keep existing publication authority and suffix preservation; do not
  replace them with a backlog-owned sequencer or scheduler.
- Keep runtime changes under `src/skills/`. Declare the full transitive script
  set, not a stale historical filename list. Do not hand-edit installed copies.
  Fixture tags are test inputs; this plan does not authorize a real release tag.
- Installed callers resolve this project's backlog and use an explicit file path
  when invoked outside its root. No new discovery/configuration service is needed.
  Identity adoption stays explicit and retains the predecessor's contract.
- Keep `complete`'s existing missing-identity refusal. On a resumed, already
  authorized closure, absence of that same retained identity means the requested
  absence holds; it does not prove a typo was a successful removal. No blanket
  suppression of nonzero results or completed-item registry.
- Treat a directory supplied where a backlog/input file is required as an
  actionable nonzero refusal, with no replacement or leftover lock. This is the
  bounded `EISDIR` decision carried from 057, not a general filesystem-error project.
- Guard only the resolved whole backlog against covered native edits. Preserve
  reads, scripts, human repair, unrelated edits and hooks. Do not parse arbitrary
  shell programs or promise all-process enforcement. Each host starts with a
  bounded feasibility observation before permanent registration changes.

## Proof ownership and replacement map

| Inherited work / promise | New owner and observation |
| --- | --- |
| 11: merge, clean validation, human repair | 1: real merge inputs, staged bytes, recoverable refusal, no continuation/publication |
| 12: rebase conflict and clean suffix | 2: conflicted replay recovery; 3: clean semantic reconciliation before publication, including multiple commits |
| 13: cherry-pick | 4: actual pick/sequencer, selected parent, human continuation once |
| 14: complete standalone runtime | 5: real install/update, both roots, actual offline command use, preserved project data/settings |
| 14: ordinary callers and root helper | 6: representative claim, closure/retry and integration caller walkthroughs; native routing in 8/10/12 |
| 15: Codex guard and ordinary use | 7: native edit boundary and registration; 8: installed scripted workflow and human stop/resume |
| 16: Cursor guard and ordinary use | 9: native edit boundary/coexistence; 10: installed scripted workflow and human stop/resume |
| 17: Claude Code guard and ordinary use | 11: native edit boundary/coexistence; 12: installed scripted workflow and human stop/resume |

Proposed commands below are proof owners to create during implementation, not
existing or passing tests. Preserve inherited command entry points where useful.
Deterministic wrappers must be discovered by `scripts/test.sh`; native selection
must not introduce credential-dependent default CI. Assertions inspect file and
Git state, not just exit codes. A test-only caller sentinel proves the script
contract; native traces are still required to prove an agent follows guidance.

## Ordered slices

### 1. Reconcile a real merge and accept a human resolution safely
Type: Behavior
Status: planned
Proof: `bash tests/product-backlog-git.sh merge`

An authorized merge obtains real ancestor/side blobs, runs the shared resolver,
and gates the actual result before acceptance. Prove concurrent sibling closures,
a textual conflict, the historical clean duplicate case, and a clean direction
dispute. Keep a non-fast-forward merge uncommitted until accepted; validate a
fast-forward candidate before advancing the managed target. Failure leaves the
caller continuation/publication sentinel untouched and unrelated conflicts intact.

The same recovery journey owns the missing read-only candidate validation:
invalid human bytes remain stopped; valid supplied bytes are accepted unchanged
without rerunning disputed reconciliation. Inspect staged bytes as well as the
worktree so a different staged candidate cannot pass accidentally.
Hypothesis: one merge acceptance/recovery loop through the existing core. First
demonstrate input capture in a scratch Git repository before expanding the adapter.
If input capture and recovery demand separate machinery, reassess this slice.

### 2. Resume a conflicted rebase without losing the unpublished suffix
Type: Behavior
Status: planned
Proof: `bash tests/product-backlog-git.sh rebase-conflict`

With at least two unpublished commits, a backlog conflict identifies the replayed
commit, its parent, and the current destination by revisions, not intent inferred
from ours/theirs names. Reconcile or stop with rebase/index/worktree evidence
intact. Validate human repair before continuation; the remaining suffix is replayed
once and remains unpublished after any failure. Reuse slice 1's validation and
diagnostics. Include the production caller's retained suffix boundary.
Hypothesis: one conflicted replay journey; clean replay acceptance is slice 3.
Keep publication of clean results outside the delivered claim until slice 3.

### 3. Stop clean rebase results that combine incompatible backlog changes
Type: Behavior
Status: planned
Proof: `bash tests/product-backlog-git.sh rebase-clean`

A clean multi-commit replay is semantically checked using retained pre-rebase
inputs before the managed caller publishes. Prove a clean direction dispute with
no duplicate identity, the duplicate-move regression, and compatible changes whose
final result retains both intentions. Exercise normal publication and the distinct
rejected-push/execution-suffix paths using their actual revision boundaries.

Do not assume final-file parsing or one arbitrarily selected parent represents the
whole replay. Demonstrate the chosen input/candidate comparison in real scratch
Git first, including a human-resolved earlier replay. If aggregate comparison
cannot preserve that resolution and suffix intent, stop to reassess the adapter;
do not silently grow a general sequencer. Invalid local commits remain recoverable
and unpublished. Human repair follows the existing caller's authorized recovery,
with validation; no automatic history rewrite or reapplication of accepted work.
Hypothesis: one publication decision, but input capture is the highest remaining
Git sizing risk. Passing the conflict case alone proves none of this slice.

### 4. Gate cherry-pick acceptance and human continuation
Type: Behavior
Status: planned
Proof: `bash tests/product-backlog-git.sh cherry-pick`

An authorized pick supplies its actual parent/base and destination to the same
resolver, on both conflicted and clean results. Prove refusal blocks continuation
and publication, retains recoverable state, and accepts valid human repair once.
An absent or ambiguous required parent/mainline stops explicitly; do not invent
a mainline policy. Reuse common validation, with operation-specific state proof.
Hypothesis: one pick acceptance loop; merge/rebase proof does not substitute.

### 5. Install and update a complete standalone backlog runtime
Type: Behavior
Status: planned
Proof: `bash tests/product-backlog-payload-update.sh`

A fresh install and an ordinary update from a prior tagged fixture deliver all
transitive scripts and references into both managed roots. Invoke real installed
mutation, reconciliation, and validation operations with the source unavailable,
including a non-default path and launch from a subdirectory. Verify required
imports actually load, not merely that selected files exist. Cover all three
installation entry contexts while sharing the common payload assertions.

Project backlog/home bytes are unchanged by install/update; existing settings and
ownership/refusal policies survive. Reuse existing edited/missing-managed-file and
coexistence evidence when applicable. Include the bounded directory-input refusal
and lock cleanup. Keep ordinary agent routing outside this slice's claim.
Hypothesis: one install/update-to-offline-use loop through existing fixtures.

### 6. Route ordinary backlog workflows through the installed contract
Type: Behavior
Status: planned
Proof: representative guidance review under AGENTS.md;
`bash tests/product-backlog-payload-update.sh`;
`bash tests/product-backlog-git.sh`

Maintenance, execution claims, Trunk integration and story closure resolve the
installed script and their project path, call the selected operation, and respond
to its result under one authoritative contract. Rewrite intellectual merge repair
as input capture, scripted reconciliation, human stop and validation-only resume.
Cover clean outcomes and all production call sites identified above; links alone
must not leave the old conflict-only trigger in place.

Walk an ordinary claim, interrupted closure with retained identity, and a clean
integration refusal through those instructions. Preserve authority and identity
propagation already supplied by 058/059. Remove the unused root insertion entry
point after checking callers. Guidance must allow human repair with guards enabled.
Hypothesis: one shared caller contract; representative review checks invocation,
required context, and useful result. Native behavioral proof belongs to 8/10/12.

### 7. Establish lightweight native edit protection in Codex
Type: Behavior
Status: planned, conditional on host feasibility
Proof: `bash tests/product-backlog-native.sh --native codex --case guard`

First establish, in an isolated supported runtime, whether an ordinary native
patch can be denied before backlog bytes change while reads, scripts, unrelated
edits, and human repair work. Verify current native capability at execution time;
the old plan's hook assertion is not evidence. If feasible with a thin adapter,
deliver that adapter and safe install/update registration, then prove native
denial and repeat/update coexistence. Reuse settings preservation where applicable.
If absent or complex, report the exact boundary for human disposition without
expanding enforcement. Slice 8 remains independently runnable; no guard pass is
claimed. Hypothesis: one native editing boundary, separate from workflow use.

### 8. Use the installed scripted workflow in Codex
Type: Behavior
Status: planned
Proof: `bash tests/product-backlog-native.sh --native codex --case use`

After real update, a fresh native session follows installed guidance for an
authorized backlog change, encounters a scripted integration refusal, and stops.
After explicit human repair it validates and resumes. Observe actual script calls,
bytes and Git state; the prompt must not prescribe the answer or command route.
Use the guard when slice 7 delivered one. Reuse guard evidence unchanged rather
than redoing its matrix. Hypothesis: one installed workflow journey; record host,
version and candidate. Missing native access is pending proof, not a pass.

### 9. Establish lightweight native edit protection in Cursor
Type: Behavior
Status: planned, conditional on host feasibility
Proof: `bash tests/product-backlog-native.sh --native cursor --case guard`

Apply slice 7's guard outcome and feasibility boundary to the actual Cursor Agent
editing route. Adapt only the necessary event/tool interface; preserve CI hooks
and prevent duplicate invocation through enabled Claude compatibility loading.
Prove denied edits and allowed reads/scripts/unrelated edits/human repair after
installation/update. No Tab coverage. Hypothesis: one host editing boundary;
Codex's result does not establish this host's feasibility or behavior.

### 10. Use the installed scripted workflow in Cursor
Type: Behavior
Status: planned
Proof: `bash tests/product-backlog-native.sh --native cursor --case use`

Run slice 8's shared installed workflow through Cursor's native agent, with actual
tool and file/Git observations. Use any delivered guard, retain missing guard
disposition explicitly, and prove human-only stop/resume independently of guard
availability. Hypothesis: one host journey using the shared cases and assessment.

### 11. Establish lightweight native edit protection in Claude Code
Type: Behavior
Status: planned, conditional on host feasibility
Proof: `bash tests/product-backlog-native.sh --native claude --case guard`

Apply slice 7's guard outcome and feasibility boundary to Claude Code's actual
native editing routes. Verify pre-edit denial in the runtime before adding
permanent registration. Preserve unrelated handlers, reads/scripts, human repair,
and ordinary repeat/update behavior. Synthetic hook JSON alone is insufficient.
Hypothesis: one host editing boundary through shared protected-path policy.

### 12. Use the installed scripted workflow in Claude Code
Type: Behavior
Status: planned
Proof: `bash tests/product-backlog-native.sh --native claude --case use`

Run slice 8's shared installed workflow in a fresh Claude Code native session,
observing actual routing, refused integration, human repair and validated resume.
Reuse sufficient unchanged guard/installation evidence. This is ordinary native
use; background mode remains its separate story. Hypothesis: one host journey.

## Sizing, stopping points, and remaining concerns

Result: 12 planned Behavior slices, replacing inherited 11-17. There are no
completed slices in this plan and no supplied numeric target, hard limit, or
timing exception. Do not import another story's timing policy. Twelve is below
the skill's count-based resplit recommendation, but that does not make the story
small. The increase exposes separate proof loops; it promises no effort reduction.

After 1-4, Git gates can be assessed without installation or host enforcement.
After 5-6, deterministic delivery and calling guidance can be assessed while
native acceptance remains explicitly pending. Each host's guard and installed-use
outcomes are separate so failed guard feasibility cannot erase the useful core
proof. These are safe pauses within one story, not completion or release claims.
Do not require all slices to fit one uninterrupted execution.

Slices 1-6 have bounded outcomes and explicit proof, with slice 3's clean-replay
input strategy requiring the named representative Git observation before adapter
expansion. Slices 7/9/11 retain conditional feasibility; missing native capability
or complex registration requires the existing human decision, not more automatic
subdivision. Slices 8/10/12 need actual native access and fresh/reusable sufficient
evidence. No blanket direct-execution readiness is claimed for these uncertainties.

Execution requires separate authorization and the predecessor's delivered state.
When authorized, retain the established project execution/refactor/delivery gates,
run focused proof per slice, and use `npm run lint` / `npm test` for the required
broader checks. Planning alone leaves the story queued and performs no commit,
push, hook installation, product implementation, or native run. Keep this plan
through retrospective; ordinary wrap-up owns spent-artifact cleanup.
