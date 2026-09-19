# Gate Git backlog conflicts and deliver the scripted backlog

Status: executing. Taken 2026-09-19 (`dac740b`).

## Execution identity

Mode: Story Branch Mode. Originating checkout/integration branch:
`/Users/terryyin/git/open-dough` on `main`. Execution checkout:
`/Users/terryyin/.claude/jobs/a85ae87d/tmp/worktree-060` on branch
`quick/060-gate-and-deliver-scripted-backlog`, created from `dac740b`.
Authorized push destination: `origin` (`git@github.com:terryyin/open-dough.git`),
execution branch pushed there; integration into `main` is Story Branch wrap-up's
responsibility, not delivered here. CI observer: GitHub Actions default,
workflow `ci.yml` ("CI"), target branch `quick/060-gate-and-deliver-scripted-backlog`,
observer directory `/tmp/dough-ci-501/watch-M3RhYt`. Replanning permission:
not restricted by an explicit `--replan`/`--no-replan` or current instruction;
existing (allowed) planning authority preserved.

## Source and remaining outcome

Source: [SEED-008 story 6](../../seeds/SEED-008-worktree-branch-trunk-sync.md#gate-and-deliver-scripted-backlog).
The review assumes the predecessor, including corrections 058/059, is complete.
Correction 059 has since closed and merged (`8507488`), delivering its two
core slices. Its third slice (deleting `parseEntryLine`) was dropped by owner
authorization: execution found `scripts/product-backlog-insert.mjs` — a real
caller outside `src/`/`tests/`, untested by `tests/product-backlog.sh` — still
depends on it, and correction 059's own scope placed that script's promotion
out of its authority. That handoff lands here; see the root insertion helper
row below and slice 6. Before executing, use the delivered predecessor
revision and retain its applicable proof.

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
| Root insertion helper | `scripts/product-backlog-insert.mjs` delegates to shared modules but is a real, currently used caller, not dead code — correction 059 confirmed this. It now throws an uncaught `TypeError` (not a `BacklogError`) for an ordinary add whose identity differs from its href and whose href carries an anchor, because correction 059's `requireNamedHome` calls `openHome` with a `backlogDirectory` this caller never supplies; confirmed by direct invocation, not merely inferred. Migrate it onto the routed contract during caller routing rather than retiring it as unused; do not describe this as a second merge-rule implementation. |

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
Status: done
Proof: `bash tests/product-backlog-git.sh merge`

Delivered via a self-registering Git merge driver (local `.git/info/attributes`
+ `git config`, not the tracked `.gitattributes` — that promotion choice is
deferred to slices 5/6), which Git invokes with real `%O %A %B` blobs for every
two-sided change to the backlog path, clean or conflicted, feeding the existing
`mergeBacklogs` core unmodified. New files:
`product-backlog-git-merge.mjs` (CLI/orchestrator: fast-forward validation,
`mergeOperation`, `continueOperation`), `product-backlog-git-repository.mjs`
(Git plumbing primitives, `ensureDriverRegistered`, `repositoryRoot`),
`product-backlog-git-candidate.mjs` (`validateCandidate`, `acceptStaged`),
`product-backlog-git-driver.mjs` (the merge-driver entry point Git invokes,
including the Git-facing conflict-marker/diagnostic rewrite). Proof:
`tests/support/product-backlog-git-merge.test.mjs` (clean-result gating, 4
cases) and `tests/support/product-backlog-git-merge-conflict.test.mjs`
(conflict + human recovery, 3 cases), both real `git merge` in scratch repos,
asserting on real index stages/`MERGE_HEAD`/refs/bytes — 7/7 pass. Pre-existing
`tests/product-backlog.sh` (94 tests) unaffected.

Learnings for slices 2-4: `validateCandidate`, `acceptStaged`,
`ensureDriverRegistered`, and `repositoryRoot` are Git-generic, not
merge-shaped, and are exported for direct reuse; only `mergeOperation`/
`continueOperation` are merge-specific. Not covered here, left as an
explicit gap rather than silently dropped: the `"blocked"` status (this
path's own result accepted, but Git refuses to commit because an unrelated
path is still conflicted) is implemented but untested — a real but
lower-priority case for a later pass. The Git-facing diagnostic rewrite in
the driver does line/substring surgery against the shared core's current
refusal wording rather than a structural hook the core exposes; functions
today, but is coupled to that wording (out of this slice's authority to
restructure — it would touch the shared, heavily-tested
`product-backlog-merge.mjs` used by other callers).

### 2. Resume a conflicted rebase without losing the unpublished suffix
Type: Behavior
Status: done
Proof: `bash tests/product-backlog-git.sh rebase-conflict`

Delivered by reusing slice 1's driver/candidate machinery unmodified: the same
self-registering merge driver Git invokes for `git merge` is invoked
identically for `git rebase`'s per-commit replay (confirmed empirically against
this project's installed Git, both the default "merge" backend and the legacy
"apply" backend). New `product-backlog-git-rebase.mjs` (CLI/orchestrator:
`rebaseOperation`, `continueOperation`) identifies the real replayed commit,
its parent, and the current destination from Git's own rebase state — never
from rebase's reversed "ours"/"theirs" conflict labels — via a new
`rebaseState(repoRoot)` primitive added to `product-backlog-git-repository.mjs`
(Git-generic, reusable by slices 3-4). A shared `product-backlog-git-cli.mjs`
now owns the CLI-argument-parsing/dispatch shape both `product-backlog-git-merge.mjs`
and `product-backlog-git-rebase.mjs` use, extracted during refactoring to
remove duplication. Proof: `tests/support/product-backlog-git-rebase.test.mjs`
and `tests/support/product-backlog-git-rebase-sequence.test.mjs` (split for
file size), 4 cases total, real `git rebase` in scratch repos, asserting on
real rebase state/refs/bytes — 4/4 pass. `tests/product-backlog-git.sh` now
runs 11/11 (merge + rebase-conflict); pre-existing `tests/product-backlog.sh`
(94 tests) unaffected.

Learnings for slices 3-4: `rebaseState` doesn't care whether a replay
conflicted, so slice 3 (clean rebase results) can reuse it directly for
reporting around a clean multi-commit replay before its own semantic-acceptance
gate. The being-rebased branch's own ref never moving until Git's own success,
plus `ORIG_HEAD`, is a cheap, convincing way to prove nothing in the unpublished
suffix was dropped or duplicated — useful for slice 3's clean-replay proof and
slice 4's cherry-pick "replayed once" guarantee. The `noEditor`
(`GIT_EDITOR`/`EDITOR=true`) pattern added to `git`/`gitLine`/`gitOutcome`'s
optional `env` param will likely be needed again for cherry-pick's own
`--continue`. Cherry-pick's state lives under `.git/sequencer/`, not verified
here — slice 4 should redo the same empirical "read Git's real state" step
rather than assume symmetry with rebase's file names. Not covered here, left
as an explicit gap matching slice 1's own: the `"blocked"` status (this path's
own result accepted, but the rebase can't proceed because something unrelated
is unresolved) is implemented but untested.

### 3. Stop clean rebase results that combine incompatible backlog changes
Type: Behavior
Status: done
Proof: `bash tests/product-backlog-git.sh rebase-clean`

Confirmed empirically first (in a scratch repo, before writing production
code): a multi-commit rebase can finish with no Git conflict at any step while
the aggregate result is still wrong — an earlier commit's change coincidentally
matches the destination's own concurrent change, silently absorbing the
divergence, and a later commit changes the same value again, unopposed as far
as any single step can see. Proved for both a direction dispute and the
duplicate-move regression; also proved a genuinely compatible multi-commit
rebase produces no false positive.

Delivered via new `product-backlog-git-aggregate.mjs` (`aggregateOutcome`):
Git-generic, takes explicit revisions (`preOperationTip`, `destinationAtStart`,
`resultRef`) rather than hard-coding "main"/`ORIG_HEAD`, so a rejected-push
retry or execution-branch replay caller (later slices) can reuse it unchanged.
It computes the true merge-base of the two supplied revisions, re-runs
`mergeBacklogs` once over the true whole-operation triple, and reports whether
its accepted candidate matches what the operation actually left. New
`product-backlog-git-rebase-aggregate.mjs` wires this into `rebaseOperation`'s
own clean, unstopped `git rebase` finish, plus a read-only `validateOperation`
for the human-override recovery path. `product-backlog-git-cli.mjs`'s shared
dispatcher gained optional `extraOptions`/`validate` support, confirmed
backward-compatible (merge's CLI surface unchanged).

Deliberate, empirically-justified scope boundary: `continueOperation`'s clean
finish (after a human already resolved a real Git conflict earlier in the same
rebase) is NOT run through this gate — re-running the aggregate there, using
the true pre-rebase tip which still carries the pre-resolution content, would
falsely re-dispute a decision a human already accepted. Confirmed by a
dedicated test. A narrower related gap, left open and reported rather than
silently dropped: a rebase that stops only because an *unrelated* path
conflicts, while the backlog itself replayed clean at every step, is also
routed through `continueOperation` and so also escapes this gate — closing
that would require tracking state across the whole rebase, not just the
current stop, and was judged out of this slice's authority.

Proof: `tests/support/product-backlog-git-rebase-clean.test.mjs` (the gate's
refusal path: masked direction dispute, masked duplicate-move) and
`tests/support/product-backlog-git-rebase-clean-accepted.test.mjs` (no false
positive, human-resolved-suffix survives, disputed-result recovery via
`validate`), split by refusal vs. acceptance — 5 cases, real `git rebase` in
scratch repos, 16/16 across the whole `tests/product-backlog-git.sh` suite.
Pre-existing `tests/product-backlog.sh` (94 tests) unaffected.

Learnings for slice 4: cherry-picking a single commit has no "destination
already advanced through N prior steps of this same operation," so this
slice's specific masking mechanism likely has no analogue there. A
cherry-pick *sequence* (multiple commits in one invocation) would have the
same shape as a multi-commit rebase, though, and `aggregateOutcome` is already
Git-generic enough to reuse directly if slice 4's proof needs it — verify
empirically rather than assume either way. The `--pre-rebase-tip`/
`--destination-at-start` CLI flags are wired through and default correctly but
are not yet used by any real caller (caller integration is slices 6/8/10/12).

### 4. Gate cherry-pick acceptance and human continuation
Type: Behavior
Status: done
Proof: `bash tests/product-backlog-git.sh cherry-pick`

Confirmed empirically, diverging from rebase in two real ways: cherry-pick's
index stages during a stop are NOT reversed (stage 2/"ours" is always the
destination, stage 3/"theirs" always the picked commit — the same convention
as an ordinary merge), and cherry-pick has two stop shapes with no rebase
analogue — a picked merge commit missing `--mainline` (Git itself refuses with
a distinct, detectable message; no mainline policy was invented) and Git's own
"this step is now empty" stop (the destination already carries the step's net
effect; requires an explicit human `--skip`/`--allow-empty`, handled as its
own `"empty"` status rather than folded into "conflict" or "blocked"). A real
bug was found and fixed during implementation: `CHERRY_PICK_HEAD` can be
transiently absent while a pick sequence is genuinely still in progress (a
human resolving the "empty" stop via raw `git commit --allow-empty` clears it
before the sequencer's own `todo` advances); `cherryPickState` also checks
`.git/sequencer/todo` to avoid misreporting "nothing in progress."

A single-commit pick's driver invocation already receives the correct
three-way triple, so `validateCandidate`/`acceptStaged` alone suffice there
(confirming slice 3's own prediction). A multi-commit sequence
(`git cherry-pick a b c`) was confirmed to reproduce the same masking
mechanism slice 3 found for rebase, so it reuses `aggregateOutcome` unchanged
via new `product-backlog-git-cherry-pick-aggregate.mjs`. New
`product-backlog-git-cherry-pick.mjs` (CLI/orchestrator) and
`product-backlog-git-cherry-pick-stop.mjs` (stop interpretation) complete the
family alongside the merge/rebase adapters; `product-backlog-git-repository.mjs`
gained `cherryPickState` and a shared `blockedStopMessage` helper (extracted
during refactoring once rebase and cherry-pick independently produced the same
"blocked" sentence). Proof: 9 real `git cherry-pick` cases across 3 test
files — 25/25 across the whole `tests/product-backlog-git.sh` suite (merge +
rebase-conflict + rebase-clean + cherry-pick). Pre-existing
`tests/product-backlog.sh` (94 tests) unaffected.

Explicit, reported (not silently dropped) gaps for later attention: the
aggregate's "disputed" branch for a multi-commit pick is wired and tested on
its "agrees" side, but no scratch-repo scenario reached an actual disputed
result via one uninterrupted `git cherry-pick` call — every attempt hit either
a real conflict or the "empty" stop first, so that refusal path is
defense-in-depth, not confirmed load-bearing, for cherry-pick specifically.
Separately: a human resolving the "empty" stop with raw `git cherry-pick
--skip` (an ordinary, well-known Git idiom, more likely to be reached for
than merge/rebase's own raw equivalents since it reads like routine Git
rather than "this project's business") can silently cascade through all
remaining clean steps in one call, bypassing this tool's gating — including
the aggregate — for the rest of the sequence, with no further invocation
point to intervene. Caller-routing slices (6/8/10/12) should give explicit
guidance to always resolve a cherry-pick stop through this tool's own
`continue`, never raw Git.

**Slices 1-4 (all four Git gates) are now complete.** This is the plan's own
documented safe pause point: Git-level merge/rebase/cherry-pick gating can be
assessed independent of installation or native-host enforcement, which slices
5-12 address next.

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
propagation already supplied by 058/059. Repair `scripts/product-backlog-insert.mjs`'s
now-broken `add` call — confirmed: an ordinary identity-and-anchor entry currently
throws an uncaught `TypeError` — by routing it through the same installed contract
as the other callers, rather than deleting it as unused. Guidance must allow human
repair with guards enabled.
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
