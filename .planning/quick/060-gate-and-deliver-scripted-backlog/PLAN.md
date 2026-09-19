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
| 14: ordinary callers and root helper | 6: representative claim, closure/retry and integration caller walkthroughs; native routing in 8 (this plan) and the deferred story's 2/4 |
| 15: Codex guard and ordinary use | extracted 2026-09-19 to [the deferred Codex/Cursor story](../061-native-edit-protection-codex-cursor/PLAN.md): its 1: native edit boundary and registration; 2: installed scripted workflow and human stop/resume |
| 16: Cursor guard and ordinary use | extracted 2026-09-19 to the same deferred story: its 3: native edit boundary/coexistence; 4: installed scripted workflow and human stop/resume |
| 17: Claude Code guard and ordinary use | 7 (renumbered from 11): native edit boundary/coexistence; 8 (renumbered from 12): installed scripted workflow and human stop/resume |

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
Status: done
Proof: `bash tests/product-backlog-payload-update.sh`

Critical finding, confirmed empirically before any fix: `dough-product-backlog`'s
scripts — all 35 of them (24 pre-existing, including the entry point, plus the
11 new Git adapters from slices 1-4) — were entirely absent from every payload
manifest. Only `SKILL.md` and two reference docs were ever declared. A real
install/update delivered zero backlog scripts to any project; the whole
automation, including everything slices 1-4 built, was maintainer-only. This
predates this plan; slice 5 closes it.

Declared the full transitive set (verified via import-graph scan, one closed
set, nothing missing or extra) in all three places that must agree:
`install.sh`, `src/install/open-dough-release-version.sh`, and
`tests/helpers/public-payload-fixture.bash`. Refactoring then eliminated the
three-way duplication itself: `open-dough-release-version.sh` and the test
fixture now derive their file list by reading `install.sh`'s own declaration
(via an extracted `read_managed_files_declaration` helper) instead of carrying
a hand-duplicated copy; `install.sh`'s own array stays inline deliberately —
its historical-compatibility awk parser must keep reading already-tagged
older releases' inline arrays unchanged, so extracting it into a sourced data
file would add real risk to that tamper-detection path for a line-count win
alone. `install.sh`'s destination-safety checks were extracted into
`assert_safe_destination_root`/`destination_has_managed_skill`/
`assert_no_managed_collision` in the already-shared `open-dough-platform.sh`
to bring it under this project's 250-line file-size convention alongside the
manifest fix.

A real bug was found and fixed: `product-backlog-store.mjs`'s `readFile` only
caught `ENOENT`, so a directory supplied where a file was expected crashed
with an uncaught raw `EISDIR` Node stack trace (not a clean refusal) — fixed
with one narrow `EISDIR` branch throwing `BacklogError`; the lock was already
cleaned up correctly via the existing `finally`, so only the crash itself
needed fixing. `product-backlog-git-candidate.mjs`/`product-backlog-git-aggregate.mjs`
were checked for the same gap and confirmed already safe (their own Git-read
paths already turn a directory input into a clean refusal).

Proof: new `tests/product-backlog-payload-update.sh` + helper
`tests/helpers/product-backlog-payload-runtime.bash` — fresh install and
update deliver all files to both roots across Codex/Cursor/Claude Code
(reusing the existing generic `assert_payload`); edited/missing-script
refusal and `--force` restore (reusing `story-payload-update.sh`'s shape);
project backlog bytes unchanged; and, with the release source moved away
entirely, the *installed* `product-backlog.mjs` and
`product-backlog-git-merge.mjs` actually run — a non-default `--file`, a
launch from a subdirectory, and a real non-fast-forward Git merge through the
installed driver — proving the transitive closure truly loads, not just that
the files exist. A wide regression sweep of ~25 existing install/release/
payload tests, plus the pre-existing `tests/product-backlog.sh` (94) and
slices 1-4's `tests/product-backlog-git.sh` (25), all still pass.

Note for slice 6 and any later cleanup: several already-committed sibling
tests (`story-payload-update.sh`, `execution-payload-update.sh`,
`retrospective-reference-payload.sh`, `update-adds-new-payload-skill.sh`)
`sed`-strip a `managed_files=(...)` line out of
`open-dough-release-version.sh` to build an older fixture; since that file no
longer has an inline array, that particular `sed` target is now a harmless
no-op (confirmed: all those tests still pass). Left as-is, out of this
slice's scope since fixing it means editing already-committed baseline test
files this slice didn't otherwise touch.

### 6. Route ordinary backlog workflows through the installed contract
Type: Behavior
Status: done
Proof: representative guidance review under AGENTS.md;
`bash tests/product-backlog-payload-update.sh`;
`bash tests/product-backlog-git.sh`

Rewrote the guidance at all 5 real call sites (edited under `src/skills/`, the
declared source of truth per AGENTS.md, not the installed `.claude/skills/`
copies) so an executing agent actually invokes the merge/rebase/cherry-pick
adapters slices 1-4 built, instead of reading Git's three conflict stages and
reconciling by hand: `dough-product-backlog/references/merge-conflicts.md`
(full rewrite: primary path resolves the installed adapter and runs
`merge`/`rebase`/`pick`, `continue` for a real conflict, `validate` for a
clean-but-`disputed` rebase/cherry-pick result; the old manual steps survive
as an explicit, clearly-scoped fallback for when adapters are unavailable or
don't cover the conflict — preserved, not deleted, since the adapters
implement the same domain knowledge, not different knowledge),
`dough-product-backlog/SKILL.md`, `dough-execute-plan/SKILL.md` ("Take queued
work" — its own backlog change is same-branch, needing no adapter itself; the
real Git-level case is Trunk publication, covered next), `trunk-publication.md`
("Resolve a publication rebase conflict" — the ordinary candidate rebase now
routes through the installed rebase adapter), and `dough-story-wrap-up/SKILL.md`
(Story Branch integration merge now routes through the installed merge
adapter). Fixed `scripts/product-backlog-insert.mjs`'s confirmed-broken `add`
call with the one-line fix the finding required: `backlogDirectory:
dirname(file)`, matching `product-backlog.mjs`'s own pattern exactly; verified
against the real defect (crash → clean refusal) and that the identity-mismatch
refusal path still works.

Representative guidance review walked the three required scenarios: an
ordinary claim needs no adapter (same-branch, nothing to merge); an
interrupted Story Branch integration merge stays safely stoppable indefinitely
since the adapter leaves real Git state exactly as Git left it, resumed via
`continue`; a Trunk publication rebase that finishes with zero per-step
conflicts but a `disputed` aggregate result stops before any fast-forward or
push, resumed via `validate` once repaired or explicitly accepted.

Two real, explicitly-reported gaps carried forward rather than silently
patched or hidden: `product-backlog-git-rebase.mjs` has no `--onto`-shaped
verb, so Trunk's two rejected-push-retry rebases in "Recover a rejected push"
still use the manual fallback — a real follow-on story, not this plan's claim;
and `trunk-publication.md` (263 lines before this slice, 13 already over the
250-line convention) grew to 276 after the one authorized paragraph's edit and
a genuine line-wrap trim — left over budget deliberately rather than forcing
a structural split: 13 other files carry direct anchor links into 8 of this
file's specific headings, and restructuring it was correctly outside this
narrow slice's authorized scope (its "other mechanics" were explicitly
off-limits). A dedicated follow-on pass, not squeezed into a same-turn CI
repair or an unrelated slice, should own that split and its 13 cross-reference
updates.

Along the way, also found and fixed (outside this slice's own claim, but
necessary): a CI failure on slice 5's push, caused by slice 5's new payload
files never being documented in `docs/installation-and-updates.md` (delivered
as a separate repair commit); and this project's own "Taken" entry for this
story (written by hand in this execution's own claim commit) used an invalid
`— [plan](...)` form the shared parser rejects, leaving this repository's own
backlog unreadable by its own tooling until corrected to the parser's
`([plan](...))` form.

### 7. Establish lightweight native edit protection in Claude Code
Type: Behavior
Status: done
Proof: `bash tests/product-backlog-native.sh`;
`bash tests/product-backlog-native.sh --native claude --case guard`

**Renumbered from 11; rescoped 2026-09-19 by owner authorization.** Formerly
this slice applied "slice 7's" (Codex) guard outcome and feasibility boundary
to Claude Code. Codex and Cursor's native slices (formerly 7-10) were
extracted to
[a separate, deferred story](../061-native-edit-protection-codex-cursor/PLAN.md)
the owner will resume later; this slice established Claude Code's own native
editing-denial feasibility independently, from a first-principles
investigation, not by inheriting another host's result.

Investigated hypothesis-first: fetched Claude Code's real `PreToolUse` hook
contract (stdin carries `tool_name`/`tool_input`, denial is
`hookSpecificOutput.permissionDecision: "deny"` on stdout with exit 0, or a
bare exit 2), then confirmed it empirically with a scratch project before
committing to any design. **Feasible, and delivered**: a real `claude --print
--dangerously-skip-permissions --no-session-persistence` session asking to
`Edit` the resolved backlog was denied before any bytes changed; `Write` is
denied the same way; an `Edit` to an unrelated file, a `Read` of the guarded
file, and a `Bash`-run shell redirection into the guarded file all still
succeeded, exercised natively, not asserted. Repeat install/update is
idempotent (exactly one `PreToolUse` wrapper).

Delivered `dough-product-backlog/scripts/product-backlog-guard-hook.mjs` (the
`PreToolUse` hook; exports `evaluateGuard()` for direct testing; reuses
`defaultBacklogPath` from `product-backlog-store.mjs` as its single source of
truth for the guarded path; fails open on malformed stdin, matching
`ci-host-hook.mjs`'s existing convention) and
`dough-product-backlog/assets/claude-hooks-guard.json` (the fragment,
declared in the backlog domain skill, not `dough-execute-plan`, since it's a
backlog-domain concern). Generalized
`src/install/open-dough-register-hooks.mjs` from one fragment per host to a
list, extracting the inventory into new
`src/install/open-dough-register-hooks-fragments.mjs` (kept the orchestrator
under the file-size convention); Claude now combines the existing required CI
fragment with the new optional guard fragment, so an older source checkout
without it still registers CI hooks unchanged. Cursor is untouched — the
guard is Claude-only, matching this slice's scope; the actual settings-merge
policy (`open-dough-register-hooks-merge.mjs`) was reused exactly as-is, not
duplicated or reinvented. Extended `install.sh`'s declared manifest with the
two new payload files, following slice 5's precedent (`docs/installation-and-
updates.md`, `dough-update/SKILL.md`, and `tests/pin-and-inspect.sh` updated
to match; `open-dough-release-version.sh` and the test fixture already derive
from `install.sh`'s own declaration automatically).

Proof: `tests/product-backlog-native.sh` (default mode: real install plus
`evaluateGuard()` assertions, no agent) and `--native claude --case guard`
(real spawned `claude --print` sessions against a fixture with the guard
actually installed via real `install.sh`, asserting on real file bytes and
captured output, not exit codes alone). A subsequent refactor pass found and
fixed one real duplication (`readJsonFile()` had been reintroduced verbatim in
`open-dough-register-hooks.mjs` instead of reusing the one already moved into
the new fragments module) and confirmed no other refactor-check issues; all
proof and the full previously-passing regression suite re-run clean after the
fix.

No override or bypass exists by design: a human editing the file directly, or
any Bash-invoked process, is simply outside the hook's registered scope —
confirmed empirically, not just asserted; adding an "unlock" flag would weaken
the guard for no requirement in scope. `NotebookEdit`'s real field name
(`file_path` vs. `notebook_path`) is unconfirmed against every Claude Code
version; the guard defensively checks both, at no cost if only one is ever
populated — irrelevant to a `.md` backlog, so not spent on a native
invocation; an unexercised defensive branch, not a claimed proof. Slice 8
remains independently runnable and can extend
`tests/product-backlog-native.sh`'s existing `--case` dispatch with a `use`
case without redesign.

### 8. Use the installed scripted workflow in Claude Code
Type: Behavior
Status: done
Proof: `bash tests/product-backlog-native.sh --native claude --case use`

**Renumbered from 12; rescoped 2026-09-19 by owner authorization**, for the
same reason as slice 7 above: this no longer reuses "slice 8's" (Codex)
shared installed-workflow journey or test shape, since that slice was
deferred to the separate story. Established the installed-workflow journey
for Claude Code directly, reusing slice 7's `--native <host> --case <case>`
dispatcher shape and evidence-preservation idiom (extended with a new `use`
case) rather than the heavier ADR-awareness delivery-to-use harness, which
carries multi-scenario/results-dir machinery this slice's single journey
doesn't need.

A real two-branch Git fixture renames the same backlog entry two
incompatible ways (adapted from this project's own non-native rename-dispute
test case, run as real Git rather than in-process). A fresh native Claude
Code session, prompted only in ordinary language naming neither a script nor
a verb ("integrate close-b's backlog change... following this project's
installed guidance"), discovered and ran the installed
`product-backlog-git-merge.mjs` adapter itself, hit its real `conflict` stop,
and reported it plainly without forcing past it. Verified this was the
adapter and not a raw `git merge`: `.git/info/attributes` registered the
`merge=dough-product-backlog` driver, `git config` pointed at the installed
`product-backlog-git-driver.mjs`, and the on-disk conflict markers carried
the adapter's own domain-specific "different titles" explanation, not Git's
default markers. After the test script played the human (writing the
resolved backlog and `git add`-ing it, no native session involved), a second
fresh native session, told only that a human had resolved and staged the
conflict, resumed through the same adapter's `continue` verb, producing a
real two-parent merge commit holding the human-resolved bytes exactly.
Native tool version and the candidate script are recorded in the proof
output. The guard (slice 7) was confirmed not to interfere: both native
sessions invoke the adapter via Bash/Node child process, never through the
Edit/Write tools the guard's `PreToolUse` matcher intercepts.

Along the way, found and fixed (outside this slice's own claim, but
necessary): slice 7's own CI push failed on the real GitHub Actions runner
(`tests/install-ci-host-hooks.sh`), never locally. Root cause:
`tests/helpers/host-hooks-fixture.bash`'s `seed_exact_manual_registration`
modeled only Claude's pre-slice-7 combined fragment, so a real install
always found the seeded "exact manual registration" fixture out of date
once slice 7 added the guard's optional PreToolUse fragment, breaking
several "already current" assertions. Fixed by teaching
`resolve_host_hook_fragments` to also resolve the guard fragment (tolerating
its absence in older/synthetic checkouts, exactly matching the installer's
own required/optional combination) and merging it into the seeded fixture
and its assertion. Delivered as its own repair commit (`de7d819`), confirmed
green on the real GitHub Actions runner before this slice's own commit.
Separately, and reported transparently rather than silently worked around:
this failure was invisible in every local run on this machine because the
local `bash` resolves to macOS's system bash 3.2, which does not enforce
`set -e` on a standalone failing `[[ ]]` test the way this project's target
bash 5.x (and GitHub Actions' runner) does; the actual fix and the full
suite's continued health were verified with a real Homebrew-installed
modern bash instead.

## Sizing, stopping points, and remaining concerns

Result: 8 planned Behavior slices, replacing inherited 11-17 and this plan's
own prior 12-slice count. All 8 slices are delivered. Slices 7-8 (formerly
11-12) were this plan's remaining claim after the owner extracted the Codex
and Cursor native slices (formerly 7-10) to a separate, deferred story on
2026-09-19; that extraction is a scope reduction, not a deferral disguised as
completion — this plan's own outcome covers only the Git-gate core,
delivery, caller routing, and Claude Code's native protection/use, not all
three hosts. There was no supplied numeric target, hard limit, or timing
exception for the remaining slices.

After 1-4, Git gates were assessable without installation or host
enforcement. After 5-6, deterministic delivery and calling guidance were
assessable while native acceptance remained explicitly pending. Slices 7-8's
conditional feasibility resolved positively for Claude Code: native
edit-denial and installed-workflow discovery both proved feasible and were
delivered with real native evidence, not just a documented boundary.

Slices 1-6 have bounded outcomes and explicit, delivered proof, with slice
3's clean-replay input strategy having required the named representative Git
observation before adapter expansion, as recorded in that slice's own entry
above.

Execution requires separate authorization and the predecessor's delivered state.
When authorized, retain the established project execution/refactor/delivery gates,
run focused proof per slice, and use `npm run lint` / `npm test` for the required
broader checks. Planning alone leaves the story queued and performs no commit,
push, hook installation, product implementation, or native run. Keep this plan
through retrospective; ordinary wrap-up owns spent-artifact cleanup.
