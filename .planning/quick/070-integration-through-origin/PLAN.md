# Integration through origin

Status: complete; all slices delivered.

## Learnings

- Publication remote facts stay in `publish-the-candidate.md`. Default-checkout
  access, preservation, inspection, and refresh eligibility live in
  `maintain-default-checkout.md`. Inspection during publication does not
  fast-forward. A refresh attempt fast-forwards only a clean checkout whose
  declared owner is the caller and whose `HEAD` is a strict ancestor of fetched
  trunk. Proof is `publication-checkout-maintenance.test.mjs`.
- Publication and preparation Git proof is
  `publication.test.mjs`, `publication-resume.test.mjs`,
  `publication-racing-suffix.test.mjs`,
  `publication-racing-suffix-replay.test.mjs`,
  `publication-checkout-maintenance.test.mjs`,
  `preparation-publication.test.mjs`, and
  `preparation-publication-resume.test.mjs`. Those suites exercise Git
  mechanics, not guidance-following.
- Owned-workspace publication pushes the candidate SHA and does not
  fast-forward the default checkout. `git branch -d` then treats a
  session-created branch as merged only after its upstream is the fetched
  authorized remote; a lagging default-checkout `HEAD` is not an unmerged
  branch. A later refresh attempt, not that publication, fast-forwards a
  clean eligible checkout.
- Resume classifies the retained candidate by ancestry of the SHA kept
  immediately before the push, not by the remote tip. After a rewrite that
  SHA is the rewritten one. A lost success plus a later writer's commit is
  already published: record it, register it when an observer is already
  bound, and do not push. Maintenance stays an inspection result and cleanup
  stays with its caller. Unpublished fast-forward resume pushes that SHA
  once. A remote advance while the candidate is still absent stays
  rejected-push recovery, not this classification. Proof is
  `publication-resume.test.mjs` and `preparation-publication-resume.test.mjs`.
- An owned-suffix replay is
  `rebase --onto <fetched-trunk> --ref <base-the-suffix-extends> --branch <owned-branch>`
  through the backlog rebase adapter when the suffix touches the backlog.
  After a rewrite, that base is the trunk just replayed onto, not the older
  published revision and not the candidate tip. `--pre-rebase-tip` and
  `--destination-at-start` name aggregate endpoints only. One replay and one
  retry push follow the initial rejection; a conflict during that replay, or
  a second rejection, stops with the Git state left in place.
- Plan 069's readiness rule at `a74d22d` is unchanged through the `ec4046d`
  merge and is composed into `execution-location.md`. That commit's
  exclusive-turn publication paragraph is not composed: this branch publishes
  from the owned workspace through `publish-the-candidate.md` and keeps
  refresh eligibility on `maintain-default-checkout.md`. Shared checkout
  selection does not choose claim order. Slice 7 reorders the Taken claim
  around the owned workspace and must not restore that exclusive-turn
  paragraph.
- A queued Taken claim is committed in the owned workspace after that
  workspace is selected from fetched trunk, then published from there before
  implementation. Project-command readiness runs after that remote
  confirmation. A failed readiness leaves the published SHA and the workspace.
  Ownership is retained execution context together with the introducing
  commit's `Claim-Publisher` trailer. Identical Taken text does not decide
  it. A competing identity stays a conflict without replay; distinct
  identities replay once through the backlog rebase adapter. Proof is
  `workspace-publication.test.mjs` and `workspace-publication-race.test.mjs`.

### Accepted proof — slice 1

Promise: publication and default-checkout maintenance have distinct owners;
existing external Git outcomes stay the same.

```text
command: node --test src/skills/dough-execute-plan/scripts/publication.test.mjs src/skills/dough-story-refinement/scripts/preparation-publication.test.mjs src/skills/dough-story-refinement/scripts/preparation-publication-resume.test.mjs
boundary: Git mechanics on disposable remotes/worktrees
setup: none (suites build fixtures)
observations: publication.test.mjs claim, owned-suffix rebase, unrelated-local stop, one rejected-push recovery; preparation keep/leave-unpublished/discard and cleanup only after confirmed publication
guidance walk: preparation-disposition.md and trunk-publication.md defer to publish-the-candidate.md and maintain-default-checkout.md
result: pass (11/11) after slice 2 renamed these suites; original 14/14 covered the same outcomes before that rename
```

### Accepted proof — slice 2

Promise: an explicit keep publishes the retained record from the owned workspace; a pending human edit on the default checkout stays out of that candidate and is reported as deferred maintenance. Leave-unpublished and discard stay local.

```text
command: node --test src/skills/dough-execute-plan/scripts/publication.test.mjs src/skills/dough-story-refinement/scripts/preparation-publication.test.mjs src/skills/dough-story-refinement/scripts/preparation-publication-resume.test.mjs
boundary: Git mechanics on disposable remotes/worktrees
setup: fixtures create the remotes and workspaces; tests plant the human edit and unrelated commit before the push
observations: publication.test.mjs pending-human-edit test asserts remote candidate SHA, parent trunk, unchanged checkout HEAD/bytes, deferred maintenance, and an origin tree without unrelated.txt or human-* files; preparation-publication.test.mjs keep test asserts seed-draft.md content on a second clone, the other writer as parent, unchanged checkout, and worktree removal only after confirmed publication
guidance walk: preparation-disposition.md step 3 and publish-the-candidate.md step 5; decomposition, refinement, slice planning, and plan refinement share that disposition
result: pass (11/11)
```

### Accepted proof — slice 3

Promise: a rejected push replays only the owned suffix once, rechecks the combined backlog, and pushes once. A conflicting backlog change or a second rejection keeps that Git state and does not try again.

```text
command: node --test src/skills/dough-execute-plan/scripts/publication-racing-suffix.test.mjs src/skills/dough-execute-plan/scripts/publication-racing-suffix-replay.test.mjs tests/support/product-backlog-git-rebase-onto.test.mjs tests/support/product-backlog-git-rebase.test.mjs tests/support/product-backlog-git-rebase-clean.test.mjs tests/support/product-backlog-git-rebase-clean-accepted.test.mjs tests/support/product-backlog-git-rebase-sequence.test.mjs
boundary: Git mechanics
setup: fixtures; a second clone advances origin before the rejected push, and again before a second rejection
observations: publication-racing-suffix.test.mjs asserts parent is the other writer's commit, the log range is only "verified increment", the affected backlog check sees sibling B and owned D, and the checkout is unchanged; the conflict test leaves exec/story on the rejected candidate; the second-rejection test does not absorb the later remote commit; publication-racing-suffix-replay.test.mjs uses the trunk just replayed onto as the next cutoff; product-backlog-git-rebase-onto.test.mjs replays only the owned suffix
result: pass (4/4 racing cases after the split; adapter suite reused, 21/21 before the split)
```

### Accepted proof — slice 4

Promise: resume classifies the retained candidate from remote ancestry. A lost success followed by another writer's advance is already published and is not pushed again. An unpublished candidate is pushed once.

```text
command: node --test src/skills/dough-execute-plan/scripts/publication-resume.test.mjs src/skills/dough-story-refinement/scripts/preparation-publication-resume.test.mjs
boundary: Git mechanics
setup: fixtures; the lost-success case pushes the rewritten SHA, drops the response, then another writer advances origin
observations: publication-resume.test.mjs asserts the later tip's parent is rewrittenSha, the pre-rebase SHA is not an ancestor, published revisions record only rewrittenSha, and a later resume push count is 0; preparation-publication-resume.test.mjs removes the worktree only after already-published, and an unconfirmed keep leaves origin at trunk
result: pass (5/5); refactor reused this proof after moving message and worktree counters
```

### Accepted proof — slice 5

Promise: an eligible clean checkout this caller owns fast-forwards to fetched trunk. A pending edit, unpublished commit, another writer, or an in-progress lock is preserved. Remote publication stays accepted when refresh is deferred. Diverged history stays stopped even when the tree is also dirty.

```text
command: node --test src/skills/dough-execute-plan/scripts/publication-checkout-maintenance.test.mjs
boundary: Git mechanics
setup: createCleanTrunkFixture; tests plant the human edit, local commit, other owner, index lock, and a second remote advance; the preservation test then plants a human edit on the already diverged checkout
observations: eligible-clean result is "advanced" with an empty status; pending-edit and another-writer stay deferred with the checkout unchanged; dirty diverged is "stopped"/"diverged" and assertCheckoutUnchanged; the busy test accepts candidateSha while inspection is deferred, then a later handoff advances to laterSha whose parent is that candidate
guidance walk: maintain-default-checkout.md direct-edit holds access through commit, publication, and release
result: pass (3/3) after the refactor rerun that classifies ancestry before a pending edit
```

### Accepted proof — slice 6

Promise: checkout selection, local checkout role, and target selection have one lifecycle. Execution keeps mode, project-command readiness, and resume. A queued claim is still published before the workspace is created.

```text
command: node --test src/skills/dough-manual-testing/scripts/workspace-ownership-lifecycle.test.mjs src/skills/dough-execute-plan/scripts/execution-worktree-preparation.test.mjs src/skills/dough-execute-plan/scripts/execution-worktree-preparation-reuse.test.mjs src/skills/dough-execute-plan/scripts/execution-worktree-preparation-wrapper.test.mjs src/skills/dough-story-refinement/scripts/preparation-publication.test.mjs src/skills/dough-story-refinement/scripts/preparation-publication-resume.test.mjs
boundary: guidance structure plus Git mechanics for preparation and worktree readiness
setup: guidance tests read source; readiness fixtures build a disposable checkout; preparation fixtures build a bare origin
observations: workspace-ownership-lifecycle.test.mjs asserts the workspace is created only after publication is confirmed and execution-location does not contain git worktree add; readiness tests run setup in the selected checkout before delegation; preparation keep still publishes while a human edit stays put
result: pass (21/21); refactor reused this proof
```

Slice 7 replaces the claim-before-workspace order recorded above.

### Accepted proof — slice 7

Promise: queued Story Branch and Trunk work selects the owned workspace from fetched trunk, publishes the Taken claim from that workspace, and only then starts implementation. Distinct claims both land. A competing claim keeps one owner and a recoverable conflict.

```text
command: node --test src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-race.test.mjs src/skills/dough-manual-testing/scripts/workspace-ownership-lifecycle.test.mjs tests/support/product-backlog-take.test.mjs tests/support/product-backlog-git-rebase-onto.test.mjs
boundary: Git mechanics plus guidance structure
setup: fixtures build a bare origin, an integration checkout, and queued backlog entries
observations: workspace-publication.test.mjs trace is selected, committed, prepared, implementation, and onImplement sees the remote tip equal the published SHA before implementation-started exists; a competing publisher gets ownership other with provenance exec-a and no REBASE_HEAD; execution-location.md selects the workspace from fetched trunk before the claim is committed
result: pass (17/17); refactor reused the Git cases and reran the guidance test 3/3
```

### Accepted proof — slice 8

Promise: a validated increment or owned repair publishes through one owner. Trunk Mode lands the candidate on remote trunk and does not push the execution branch. Story Branch Mode lands it on the recorded remote execution branch and leaves remote trunk unchanged. The receipt is the accepted SHA and that target. An interrupted resume uses the same target. A repair stashes unfinished work around that publication and restores it.

```text
command: node --test src/skills/dough-execute-plan/scripts/execution-increment-delivery.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-publication.test.mjs src/skills/dough-execute-plan/scripts/publication-resume.test.mjs src/skills/dough-execute-plan/scripts/publication-resume-story-branch.test.mjs src/skills/dough-story-refinement/scripts/preparation-publication-resume.test.mjs
boundary: Git mechanics plus guidance structure
setup: fixtures build a bare origin and an execution workspace; Story Branch resume uses refs/heads/cursor/story-execution; the repair test stashes unfinished staged, unstaged, and untracked paths before the repair commit
observations: Trunk increment's rewritten SHA is on refs/heads/main and the pre-rebase SHA is not the receipt; Story Branch increment is on the recorded ref and refs/heads/main is unchanged; resume of an unpublished Story Branch candidate pushes once to that ref with that receipt target; already-published resume has pushCount 0; repair commit contains repair.txt and not the unfinished paths, and stash apply --index restores them with HEAD still the repair SHA; delivery test counts the destination sentences once in trunk-publication.md
result: pass (11/11) after refactor; earlier bash tests/execution-ci-runtime.sh pass (148/148) before the resume-script edit, whose callers are in the 11/11
```

### Accepted proof — slice 9

Promise: Trunk Mode publishes before-cleanup and final-closure commits to remote trunk, reports refresh separately, and removes only this execution's clean local worktree and local branch after the observer stops. A retry does not publish again. Dirty state, another workspace, unique unpublished work, and an active observer stay, with an explicit reason.

```text
command: node --test --test-concurrency=1 src/skills/dough-story-wrap-up/scripts/closure-publication.test.mjs src/skills/dough-story-wrap-up/scripts/closure-publication-refresh.test.mjs src/skills/dough-story-wrap-up/scripts/closure-resource-cleanup.test.mjs src/skills/dough-story-wrap-up/scripts/closure-publication-resume.test.mjs src/skills/dough-story-wrap-up/scripts/closure-publication-resume-published.test.mjs
boundary: Git mechanics
setup: fixtures build a bare origin, an execution worktree, and a checkout-bound observer; the happy path plants refs/heads/exec/story before closure
observations: both closure receipts are on refs/heads/main and that remote execution ref is unchanged; refresh is deferred/pending-edit or stopped/unexpected-branch without moving the accepted SHA; cleanup waits for observer.stop() then removes the local worktree and branch; retry is already-absent with the same remote commit count; preservation reasons are active checkout-bound observer, another workspace, dirty checkout, and unique unpublished work; resume publishes once then stops the observer before removal, and an already-published closure has pushCount 0
result: pass (6/6) after the refactor split
```

### Accepted proof — slice 10

Promise: Story Branch closure publishes a history-preserving candidate from the owned workspace onto remote trunk. A racing trunk advance keeps both published histories. The integration checkout's unrelated commit and human edit stay unpublished. Retry does not merge or push again. The remote execution branch is deleted only after its tip is on trunk.

```text
command: bash tests/closure-publication.sh
boundary: Git mechanics
setup: fixtures build a bare origin; the racing case advances trunk and plants an unrelated commit plus a human edit on the integration checkout; cleanup supplies remoteExecutionBranch only for Story Branch
observations: racing receipt is refs/heads/main, not the closure SHA or the superseded merge; closure, sibling backlog, and racing.txt are on trunk; unrelated.txt and human-edit files are absent; integration checkout is unchanged; retry is already-accepted with pushCount 0; eligible cleanup removes local worktree, local branch, and refs/heads/exec/story; a tip not on trunk stays with reason remote execution tip is not integrated
result: pass (10/10) after the refactor split; backlog merge tests skipped as unchanged
```

### Accepted proof — slice 11

Promise: current-branch and host-owned work stay in the recorded checkout. Local-only delivery commits and reports pending publication. A publish happens only when the operation and the authority both say so, from that same checkout. A local commit or merge stays local even when a destination and publish authority are present.

```text
command: node --test --test-concurrency=1 src/skills/dough-execute-plan/scripts/current-branch-publication.test.mjs src/skills/dough-execute-plan/scripts/current-branch-local-operation.test.mjs src/skills/dough-story-wrap-up/scripts/closure-current-branch.test.mjs src/skills/dough-execute-plan/scripts/publication-checkout-maintenance.test.mjs
boundary: Git mechanics
setup: fixtures build a bare origin; human-edit cases plant staged, unstaged, and untracked files; the host-owned case uses the execution worktree
observations: local-only receipt is null and refs/heads/main is unchanged; publish-authorized receipt is that SHA on refs/heads/main with maintenance deferred/pending-edit and the human edit still present; local commit and local merge stay classification local, and the merge commit has two parents; host-owned branch stays exec/story; another declared owner is another-writer with HEAD unchanged
result: pass (11/11) after the refactor split
```

### Accepted proof — slice 12

Promise: bug remaining-work retention removes only named disposable paths, keeps the durable record and unrelated exploration content, and follows preparation disposition. An explicit keep publishes from the owned workspace. A draft stays local with a pending disposition. A reused workspace is not removed.

```text
command: node --test src/skills/dough-bug-fixing/scripts/retained-artifacts.test.mjs src/skills/dough-story-refinement/scripts/preparation-publication.test.mjs
boundary: Git mechanics
setup: fixtures build a preparation workspace; the test plants a backlog record, a disposable reproduction file, and unrelated exploration content, then calls retainBugTriageArtifacts
observations: without keep the disposable path is gone, the backlog and unrelated file remain, disposition is pending, and refs/heads/main is unchanged; with keep the commit names only .planning/PRODUCT-BACKLOG.md, the remote has that file and not the disposable path or human-staged.txt, and the integration checkout is unchanged; a reused workspace stays with reason reused or host-owned
result: pass (8/8) after refactor
```

### Accepted proof — slice 13

Promise: an ordinary update from a supported prior installation installs the migrated publication references and runtime modules into both skill layouts and preserves planted project configuration.

```text
command: PATH="/opt/homebrew/bin:$PATH" bash tests/execution-payload-update.sh; PATH="/opt/homebrew/bin:$PATH" bash tests/story-payload-update.sh; PATH="/opt/homebrew/bin:$PATH" bash tests/story-payload-assertions.sh
boundary: ordinary candidate update and installed payload
setup: fixtures plant a 0.1.1 install that omits the migrated modules, plus `.planning/open-dough.json`; the story case plants a colliding host file
observations: install.sh managed_files lists the publication modules; install_declared_payload copies them; assert_installed_publication_modules imports those modules in both layouts; assert_project_configuration keeps the planted open-dough.json; edited or colliding managed files stay refused until --force; a missing story link fails assertions and passes after restore
```

### Accepted proof — slice 14

Promise: credential-free publication native harness assesses observable remote acceptance, human-edit preservation, claim ownership, and stream completeness; planted claim-race ownership is gone. Live Cursor and Codex publish-boundary (and Cursor local-only) have fresh proof; Claude OAuth and remaining host-assigned live journeys are outstanding acceptance obligations.

```text
command: bash tests/git-publication-native.sh
boundary: native publication assessor and substitute runner
setup: fixtures plant bare origin, owned workspace candidate, and human edit on the integration checkout; substitutes perform real push or skip-push for the selected journey
observations: assessor rejects missing remote acceptance, captured human edits, wrong ownership, claim-race foreign ownership with remote acceptance, and incomplete/stale streams; substitute journeys cover publish-boundary on codex/cursor/claude plus local-only, claim-race, uncertain-recovery, preparation, trunk-closure, story-branch-closure, and bug-disposition; ownership comes only from post-session Git observation
outstanding: live Claude publish-boundary (OAuth expired); remaining live host-assigned journeys beyond Cursor/Codex publish-boundary and Cursor local-only
```

## Execution identity

- Mode: Story Branch Mode
- Originating / integration checkout: `/Users/terryyin/git/open-dough` on `main`
- Authorized remote target: `origin/main`
- Execution checkout: `/Users/terryyin/git/open-dough-worktrees/070-integration-through-origin`
- Execution branch: `cursor/070-integration-through-origin`
- Claim published revision: `ca99ff262ef1939276046164de6781bca642f453` (trunk claim; Story Branch `pendingCi: unobserved`)
- Retained published revisions (this execution): `ca99ff262ef1939276046164de6781bca642f453`
- CI observer: `/tmp/dough-ci-501/watch-bap1mT` observing `terryyin/open-dough` branch `cursor/070-integration-through-origin` (GitHub Actions workflow `ci.yml` / `CI`)
- Replanning permission: allowed (existing planning authority retained; no `--no-replan`)
- Concurrent Taken work: SEED-008#prepare-execution-worktree on `cursor/069-prepare-execution-worktree` (coordinate exclusive integration turns when publishing to trunk)

## Source and outcome

Identity: SEED-008#migrate-git-branching-and-integration

Source: [refined story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#migrate-git-branching-and-integration).
Terry authorized complete refinement, slice planning, and necessary plan
refinement on 2026-09-21. The requested output is a plan. All slices are planned.

A developer runs independent tasks in owned workspaces and publishes validated
changes to the designated remote history while preserving other tasks' pending
local work. Complete the migration across implemented journeys and strengthen
the architecture that expresses their common responsibilities.

## Current decisions and boundaries

- The configured remote trunk is the shared integration authority. `origin` and
  `main` below are fixture names; runtime guidance resolves project context.
- An owned workspace prepares a candidate against fetched remote history. The
  caller supplies publication authority, destination, owned changes, and proof.
  Candidate construction preserves published history: unpublished suffixes can
  be rebased; a published story can be merged using the project's supported
  history policy. The remote's acceptance establishes publication.
- Workspace ownership, candidate preparation, publication/recovery, checkout
  maintenance, backlog semantics, and CI attribution are distinct concepts.
  Each behavioral rule has one authoritative home with small caller adaptations.
- Establish an owned workspace before a queued claim. Publish the claim before
  implementation in isolated modes. A matching retained execution resumes;
  another execution's published claim requires a recoverable conflict outcome.
  Use existing retained execution context and stable backlog identity to decide
  that distinction. Preserve the worktree-preparation story's readiness boundary
  before any project command depends on setup.
- Each trunk publication attempts an opportunistic default-checkout refresh
  under established local ownership. Successful publication and deferred refresh
  are independently reportable. Independent task setup can use fetched trunk.
- Preserve explicit local-only authority: commit/retain the authorized result in
  its owned workspace and report any pending publication. Preparation retains
  its keep/draft/discard decision. Caller-selected current-branch execution and
  its closure retain their existing publication owner. Existing task-authorized
  local merges remain local operations with truthful completion reporting.
- Retry reconciliation after a racing remote advance using the existing bounded
  policy: one ordinary retry after the initial rejected attempt, then preserve
  state and report persistent contention. Recovery first checks whether the
  candidate is already in remote history. Respect project protection/review
  requirements and use established supported publication routes.
- Keep the accepted remote revision and target as the input to CI registration.
  The existing observer lifetime and failure-repair contract remain owned by CI
  guidance. Cleanup uses actual publication, work ownership, and runtime state.
- Strengthen the implicated architecture up front and through slice-local
  refactoring. Necessary restructuring may cross existing file and skill
  boundaries. Select changes by conceptual ownership and current callers, with
  product behavior and proof kept coherent at each delivery boundary.
- Write all maintained guidance, names, examples, and test explanations around
  the supported contract. Delete superseded representations with their
  replacement. History remains in Git. Safety rules explain present ownership,
  preservation, authority, and recovery requirements.

Later outcomes retain their own stories: automated local locks and scheduling;
CI-observer overhead; dashboard features; new background/cloud-host capability;
changes to Story Branch integration timing; general hosted-review automation.
This plan changes the Git mechanics used at an already-authorized lifecycle
boundary. It leaves the ADR 0007 timing question with its human decision owner.

## Architectural basis and PFE findings

Inspection baseline: `3543fad2167169092ac47ba5afbbeba4d0a0d40b`.

Follow [AGENTS.md](../../../AGENTS.md), Accepted
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(domain mapping, cohesion, continuous integration),
[ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
(shared released payload),
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
(behavior and native evidence), and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(one behavioral source written for the executing agent).
[ADR 0009](../../../docs/adrs/0009-git-branching-and-integration.md) remains
Proposed; Terry explicitly selected its Git direction for this story. The
existing [North Star topic](../../NORTH-STAR.md#remote-publication-and-default-checkout-ownership)
already supplies sufficient short-term direction.

| Responsibility | Existing evidence | Selected architectural treatment |
| --- | --- | --- |
| Candidate publication and observed recovery | `dough-execute-plan/references/publish-the-candidate.md` owns fetch, validation, push, and resume; its preconditions and success test also embed checkout state | Change this shared owner. Separate remote facts from local-maintenance obligations; callers use the same acceptance/recovery rules. |
| Candidate construction and lifecycle authority | `trunk-publication.md`, execution `wrap-up.md`, preparation disposition, and story wrap-up each select owned work and destinations | Retain caller decisions; represent unpublished-suffix replay and published-history merge as explicit inputs/strategies at their actual domain boundary. |
| Default-checkout access and freshness | Publication preconditions, execution-location, preparation cleanup, and story closure repeat local-state requirements | Extract one focused maintenance reference beside the publisher, invoked for local edits/refresh with an independent outcome. |
| Workspace ownership and readiness | `dough-manual-testing/references/exploration-workspace.md` is reused by preparation; `execution-location.md` owns execution identity and setup | Reuse the shared ownership lifecycle, leaving execution-specific readiness and resume identity with execution. Reorder claim setup around the owned workspace. |
| Backlog meaning and concurrent reconciliation | Product-backlog document/identity/mutation modules and Git merge/rebase/cherry-pick adapters | Reuse these owners. Any reconciliation capability genuinely needed by the chosen Git operation belongs here, with its own existing adapter tests. |
| CI attribution and repair | `ci-monitor.md`, `runtime-setup.md`, and target-branch/worktree runtime tests already separate target from working directory | Reuse accepted-SHA/target registration and repair ownership; route repair publication through the common contract. |
| Durable bug-triage artifacts | `dough-bug-fixing/SKILL.md` independently commits, locally integrates, rebases, and cleans exploration records | Route artifact retention/disposition to the preparation owner, with explicit caller authority and preserved evidence. |
| Installed behavior and evidence | Payload declaration/tests, shared native supervision/result/host helpers, Git fixtures | Reuse delivery and native infrastructure; update domain assertions and add only the missing journey/assessor. |

Paths in this table are relative to `src/skills/` unless otherwise specified.
The current publication and preparation tests execute Git commands directly.
They establish Git mechanics, not that the agent follows the guidance. Preserve
that distinction when assigning proof.

A cohesive design is demonstrated by a rule change reaching its owning source,
with callers supplying their context. A low file count is not an acceptance
criterion. Shared wording with duplicated decision logic is still duplication.
Avoid constructing a generic workflow engine merely to consolidate prose.

## Completeness inventory

This is the active plan's coverage map. Each journey names its current source
owner and the proof that observes it. All listed journeys are part of the one
outcome.

| Journey / representation | Current source owner | Proof |
| --- | --- | --- |
| Remote candidate, retries, and resume | `publish-the-candidate.md`, `publication-rebase-conflict.md`, `trunk-publication.md`; runtime `history-preserving-publication.mjs`, `publication-resume.mjs`, `execution-increment-publication.mjs` | P; `publication-resume.test.mjs`; `publication-resume-story-branch.test.mjs`; `preparation-publication-resume.test.mjs` |
| Default checkout and explicit direct edits | `maintain-default-checkout.md` and `maintain-default-checkout.mjs` | `publication-checkout-maintenance.test.mjs` |
| Workspace selection and Taken claim | `execution-location.md`, execute-plan `SKILL.md`, `workspace-publication.mjs` with its push, select, and ownership modules, and the product-backlog take adapter | W; `workspace-publication-race.test.mjs`; execution worktree preparation tests |
| Planned, planless, contextual, correction, and repair delivery | `trunk-publication.md`, `wrap-up.md`, `ci-monitor.md`, `runtime-setup.md`; `execution-increment-publication.mjs` | `execution-increment-publication.test.mjs`; `execution-increment-delivery.test.mjs` |
| Trunk final closure and resources | story wrap-up; `closure-publication.mjs`; `closure-resources.mjs` | C |
| Story Branch progress and final integration | story wrap-up; `history-preserving-publication.mjs`; `closure-resources.mjs` | `closure-story-integration.test.mjs`; `closure-story-branch-cleanup.test.mjs` |
| Explicit current-branch and existing host-owned contexts | `current-branch-publication.mjs`; `execution-location.md`; current-branch closure in `closure-publication.mjs` | `current-branch-publication.test.mjs`; `current-branch-local-operation.test.mjs`; `closure-current-branch.test.mjs` |
| Decomposition, refinement, planning, and plan-refinement disposition | `preparation-workspace.md`; `preparation-disposition.md` | R |
| Bug investigation and durable remaining-work artifacts | bug-fixing `SKILL.md`; `retained-artifacts.mjs`; preparation disposition; exploration workspace lifecycle | B |
| Shared Git helpers those runtime modules load | `publication-test-fixtures.mjs` | imported with the owners above |
| Authoritative source, manifests, delivered references, docs, tests, names, and comments | `install.sh` `managed_files`, including `finish-or-stop.md` and `oversized-slice.md` | `bash tests/execution-payload-update.sh`; `bash tests/story-payload-update.sh`; `bash tests/story-payload-assertions.sh` |
| Native agent use and preservation | `tests/git-publication-native.sh` with assessor, fixture observe, substitute agent, and host runner | `bash tests/git-publication-native.sh`; live `--native` host journeys with outstanding Claude OAuth |

The manual-testing exploration lifecycle and internal release-version workflow
have separate owners for evidence retention and release/tag authority. Review
references that touch this migration, preserving those domain responsibilities.
Apply the same inventory to `src/`, `tests/`, `docs/`, and applicable internal
maintainer guidance. Managed installed copies are updated through released
payload delivery under AGENTS.md.

## Proof and delivery conventions

Each slice owns implementation, affected guidance and tests, representative
agent behavior review, and cleanup of superseded material in that footprint.
After changes, apply the established independent post-change refactoring and
execution proof/delivery gates. Review the implicated concept across its
representations, including untouched callers needed for cohesion. Then run the
focused proof and applicable checks. Each committed boundary stays usable and
green; whole-story completion requires the complete coverage map.

Use real disposable bare remotes, linked worktrees, and a second clone for Git
observations. Assert remote refs/ancestry, retained owned commits, working-tree
bytes and index state, backlog identity/order, and actual command locations.
Inject competing updates at the push boundary. A fixture-created desired result
or a hand-run protocol alone cannot establish agent invocation behavior.

The following capability-named test entry points are proposed outputs, to be
added or formed by renaming/consolidating the affected existing suites. Keep
one shared fixture and assessor per domain responsibility:

- **P:** `node --test src/skills/dough-execute-plan/scripts/publication.test.mjs src/skills/dough-execute-plan/scripts/publication-racing-suffix.test.mjs src/skills/dough-execute-plan/scripts/publication-racing-suffix-replay.test.mjs src/skills/dough-execute-plan/scripts/publication-checkout-maintenance.test.mjs`
- **W:** `node --test src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs`
- **R:** `node --test src/skills/dough-story-refinement/scripts/preparation-publication.test.mjs`
- **C:** `bash tests/closure-publication.sh`
- **B:** `node --test src/skills/dough-bug-fixing/scripts/retained-artifacts.test.mjs`
- **N:** `bash tests/git-publication-native.sh` (credential-free runner/assessor checks)

Tests of Git mechanics must be labeled as such. A guidance behavior claim uses
an assessed representative walkthrough and, where required, the native evidence
owned by slice 14. Reuse the current suites' supported cases while replacing
their obsolete expectations; each slice states the new observable promise.
Wire maintained deterministic suites into the existing test runner as they land.

Available regression entry points:
`bash tests/product-backlog-git.sh`, `bash tests/execution-ci-runtime.sh`,
`bash tests/execution-payload-update.sh`, `bash tests/story-payload-update.sh`,
and `bash tests/story-payload-assertions.sh`.
Follow repository environment/setup and formatting conventions. Run focused
checks per slice; run applicable final regression, `npm run lint`, and `npm test`
once after the complete change unless new changes or failures warrant another
run. Release/tag selection remains the release workflow's responsibility.

## Ordered slices

### 1. Give publication and checkout maintenance distinct owners

Type: Structure
Status: done

Separate the shared publisher's candidate/remote facts from default-checkout
access, refresh, and local preservation. Keep the existing external workflow
behavior while consolidating duplicated rule ownership in its consumers. The
immediate next Behavior is owned-workspace preparation publication in slice 2.
Use focused references and caller inputs; preserve conditional caller authority.

Proof: Existing publication/preparation Git suites retain their supported
outcomes. Walk one preparation and one execution caller to the same publication
owner and one local-maintenance owner; inspect that recovery and cleanup use
those owners. Run the affected current suites before their capability rename.
Sizing: one responsibility separation, medium confidence. Stop safely with the
existing external contract and consolidated ownership; slice 2 changes the
publication outcome.

### 2. Publish retained preparation from its owned workspace

Type: Behavior
Status: done

Given an owned preparation workspace and an explicit keep instruction, publishing
its retained records produces an accepted candidate in the authorized remote
history and a truthful disposition, including when the default checkout has a
pending human edit. Draft/discard/local-only authority preserves the selected
local disposition. Decomposition, refinement, planning, and plan refinement
all consume this shared disposition.

Change the common publisher and its actual preparation caller together. Update
execution publication references that repeat shared preconditions so they defer
to the common owner. Retain applicable resource ownership and record the separate
checkout maintenance outcome; the full refresh decision belongs to slice 5.

Proof: P and R observe the remote candidate, owned artifact content, unchanged
human working tree/index, correct disposition and retained resources. Review the
invocation using the actual skill input, rather than supplying Git commands as
its answer. Native preparation evidence is owned by slice 14.
Sizing: one retained-result publication gate, medium confidence. Safe stopping
point: preparation has a complete shared publication path; remaining caller
migrations stay explicitly unfinished in this plan.

### 3. Reconcile a racing remote update in the owned workspace

Type: Behavior
Status: done

Given a validated unpublished candidate, when another writer advances the target
before push, the publication owner fetches, reconciles only the owned change,
rechecks affected behavior, and retries within the bounded policy. Substantive
conflicts or exhausted retries retain exact recovery state and report the issue.

Use the existing backlog Git adapters whenever backlog content is combined.
Choose a Git operation whose range matches the owned suffix. If that operation
needs an adapter capability, extend the existing adapter and its proof in this
slice; keep backlog meaning with the backlog owner. Preserve published ancestry.

Proof: P plus the affected backlog adapter tests drive an actual rejected push
using two writers, then observe accepted combined history, affected validation,
and sibling backlog preservation. Exercise conflicting intent and a second
rejection as recoverable outcomes of the same decision. Native evidence samples
this boundary in slice 14.
Sizing: one reconciliation decision, medium confidence; exact suffix handling is
the main risk. Safe stopping point: bounded remote contention is recoverable.

### 4. Resume from observed remote publication state

Type: Behavior
Status: done

Given an interrupted publication, resume classifies the retained candidate from
remote history and completes the first unfinished obligation. A lost success
response followed by another writer's advance is recognized as published.
An unpublished candidate remains an owned recoverable candidate.

Use the same recovery owner for preparation and execution. Keep publication,
checkout maintenance, observer registration, and cleanup outcomes separate in
existing retained context. Carry a rewritten candidate's identity correctly.

Proof: P and R cover interruption before acceptance and after acceptance with a
lost response and later remote advance. Observe candidate ancestry, the number
of accepted publications, preserved commits, and remaining obligation handling.
An observer stub validates receipt attribution only; native use validates the
agent's recovery decision in slice 14.
Sizing: one observed-state recovery classification, medium confidence. Safe
stopping point: resume preserves and correctly reports each publication state.

### 5. Maintain the default checkout under local ownership

Type: Behavior
Status: done

Given a refresh or bounded direct edit, established local ownership and current
checkout state determine safe mutation. Eligible clean checkouts fast-forward;
pending human edits, staged changes, unpublished commits, ongoing operations,
and ambiguous ownership are preserved with a deferred maintenance result.
Owned-workspace publication reports success independently of that result.

Use the focused maintenance owner established by slice 1. Attempt refresh after
trunk publication and verify freshness before using the default checkout as a
base. A direct-edit owner publishes only its authorized change through the
shared contract. Re-read current state after access/handoff; existing explicit
coordination supplies ownership until the separate automation story delivers.

Proof: P observes clean advancement and exact preservation of index/working-tree
state, unpublished commits, and another writer's ownership. A busy-checkout
case accepts a remote publication and records deferred refresh; a later
coordinated attempt advances to current remote history. Review a direct edit's
ownership interval through commit and safe release.
Sizing: one local mutation eligibility decision, medium confidence. Safe
stopping point: baseline maintenance works with explicit coordination.

### 6. Give workspace selection one reusable ownership lifecycle

Type: Structure
Status: done

Consolidate reusable checkout ownership, retained identity, and safe selection
with the existing exploration/workspace lifecycle. Keep execution mode,
project-command readiness, and execution resume context with execution-location;
preparation supplies its own disposition. Preserve external setup ordering in
this structural slice. This immediately enables the claim-order change in 7.

Reconcile with the then-current result of plan 069. Reuse its readiness rule and
proof, preserving the active owner's work. Record target selection and local
checkout role separately in retained context, using actual established paths.

Proof: Existing setup and preparation lifecycle checks retain their behavior.
Walk preparation, contextual execution, and queued execution through the shared
ownership rule with their own domain-specific continuations. Run plan 069's
applicable focused checks if present on the integrated base.
Sizing: one ownership responsibility consolidation, medium confidence. Safe
stopping point: reusable ownership with unchanged caller outcomes.

### 7. Publish a Taken claim from an owned workspace

Type: Behavior
Status: done

Given queued work, select/reuse the owned execution workspace, prepare commands
as required, and publish the claim to remote trunk before implementation begins.
Concurrent claims for distinct stories preserve both changes. Competing claims
for the same identity result in one published owner and a recoverable conflict
for the other execution. A matching retained execution resumes its own claim.

Update startup and location selection together. Reuse backlog identity,
mutation, and adapter semantics; establish ownership from retained execution
context and the actual claim candidate's publication provenance. Recheck remote
membership before replaying a competing claim; identical Taken text alone is
insufficient evidence that this execution owns it. Ambiguous ownership retains
the conflict for resolution. Dashboard developer-name allocation remains with
its own story. Remote claim success is retained if
later environment preparation fails, with a recoverable continuation.

Proof: W and backlog adapter tests observe workspace selection, command
readiness when needed, claim mutation/publication, and implementation ordering.
Race two distinct identities and two attempts on one identity; assert published
membership and ownership outcomes. A setup failure preserves usable recovery
context. Native execution in slice 14 proves actual invocation sequencing.
Sizing: one claim acquisition gate, medium confidence because startup ordering
crosses readiness and publication. Safe stopping point: isolated execution starts
from its published claim; shared backlog meaning remains coherent.

### 8. Publish execution increments and repair results through the common owner

Type: Behavior
Status: done

Given a prepared execution workspace, a validated increment or owned repair is
published to the mode's authorized destination and registered using the accepted
revision and target. Planned, planless, contextual, bug-repair, and retrospective
correction entry points converge on this delivery outcome.

Trunk Mode uses its local branch to construct candidates for remote trunk.
Story Branch Mode publishes to its recorded remote execution branch. Preserve
caller proof and the existing asynchronous observer lifetime, pause/stash/restore
repair contract, and execution workspace identity. Use shared publication and
recovery rather than a second CI-repair delivery procedure.

Proof: W and `bash tests/execution-ci-runtime.sh` observe mode-correct remote
history and accepted-SHA receipts. A repair case preserves unfinished owned work
and restores it after its publication. Trace each wrapper to this same delivery
owner; sample the materially different entry authorities in behavior review and
native acceptance.
Sizing: one execution delivery gate, medium confidence. Safe stopping point:
all execution entry routes share attributable increment and repair publication.

### 9. Complete Trunk Mode closure with recoverable resource cleanup

Type: Behavior
Status: done

Given completed Trunk Mode work, publish before-cleanup and final-closure
revisions through the common owner, finish the existing observer obligation,
and remove eligible session-owned resources. A deferred default-checkout refresh
is reported separately. Interruption resumes outstanding obligations from actual
remote and resource state.

Keep lasting knowledge assimilation and backlog closure with story-wrap-up;
publication and maintenance retain their shared owners. Protect active observers,
other workspaces, dirty state, and unique unpublished work through the existing
cleanup ownership rule.

Proof: C observes closure records on remote trunk, accepted-SHA attribution,
resource removal eligibility, and a retry after partial cleanup. Preserved
resources carry an explicit reason and remain usable. Native evidence is part
of the completed execution journey in slice 14.
Sizing: one closure completion gate, medium confidence. Safe stopping point:
Trunk Mode completes or resumes closure truthfully.

### 10. Integrate a published Story Branch closure through remote trunk

Type: Behavior
Status: done

Given a published story and an authorized integration boundary, prepare a
validated candidate in an owned workspace that preserves published history and
sibling backlog changes, publish it to remote trunk, and complete eligible
resource cleanup. Project merge policy determines candidate construction.

Use the same publication/recovery owner with a history-preserving candidate;
retain the existing backlog merge adapter. A racing trunk advance recomputes a
candidate preserving both published histories. Recognize an already-accepted
closure on retry. Remote story-branch cleanup uses the project's integration
proof and retained exact identity.

Proof: C and backlog merge tests observe the story's accepted closure and
sibling backlog state after concurrent target changes. Assert published ancestry
for the supported merge convention, validated combined behavior, and exact
eligible branch/worktree cleanup. Native Story Branch use belongs to slice 14.
Sizing: one story integration completion gate, medium confidence. Safe stopping
point: Story Branch publication and closure share remote authority.

### 11. Preserve explicit current-branch publication authority

Type: Behavior
Status: done

Given explicit current-branch or an already-supported host-owned execution,
work remains in its recorded checkout and follows the caller's established
commit/publication authority. Local-only closure is reported as committed and
pending publication; an authorized delivery uses the common remote contract.

Adapt target/workspace references, preservation, and reporting to the shared
model. Compose default-checkout access where that workspace is selected and
retain contextual local-base decisions. Preserve existing supported host choices.

Proof: W and C pair local-only and publish-authorized invocations, observing
actual remote refs, retained commits, checkout identity, and reports. Existing
local commit/merge requests remain accurately classified as local operations.
Review existing host-owned callers against the same authority inputs.
Sizing: one authority-controlled delivery decision, medium confidence. Safe
stopping point: supported explicit caller contexts use the common model.

### 12. Retain bug-triage artifacts through preparation disposition

Type: Behavior
Status: done

Given durable authorized records from bug investigation, remove only disposable
reproduction changes and retain the records under preparation's disposition.
Publish explicitly retained results from their owned workspace when authorized;
local drafts remain recoverable with their pending disposition stated.

Route bug-fixing remaining-work retention to the shared preparation/publication
owners. Preserve the existing backlog selection policy and the exploration
lifecycle's session-created versus reused ownership. Repair execution itself
already routes through slice 8.

Proof: B and R observe the canonical story/backlog record, unrelated exploration
content preservation, selected disposition, remote acceptance when authorized,
and eligible workspace retention or cleanup. Review a bug report that produces
remaining work and a caller that deliberately retains local evidence.
Sizing: one durable-artifact disposition gate, medium confidence. Safe stopping
point: bug investigation and ordinary preparation share artifact ownership and
publication behavior.

### 13. Receive the complete contract through an ordinary payload update

Type: Behavior
Status: done

Given a project with a supported prior installation, an ordinary candidate
update delivers the coherent references and runtime dependencies required by
the migrated journeys while preserving project-owned configuration.

Update affected source payload declarations and reference links as needed.
Review the completeness inventory against all current source callers, public
and maintainer documents, examples, fixtures, test names, and comments. Give
current behavior affirmative explanations and current domain names. Assess
architectural cohesion after the full migration and resolve implicated duplicate
owners through refactoring within the owning slices' promises.

Proof: `bash tests/execution-payload-update.sh`,
`bash tests/story-payload-update.sh`, and
`bash tests/story-payload-assertions.sh` exercise ordinary update and installed
references with preserved project sentinels and configuration. Include every
new or relocated runtime reference in its existing payload owner. Use the
installed entry points to establish that the complete required contract is
available in each supported layout. The source inventory maps every affected
journey to its current owner and proof.

Sizing: one ordinary-update contract with existing fixture infrastructure;
medium confidence. Safe stopping point: the candidate payload is complete and
inexpensive checks pass. Native acceptance remains owned by slice 14 before
release qualification.

### 14. Use the installed publication contract in supported native sessions

Type: Behavior
Status: done

Given that updated candidate in a fresh supported host session, an ordinary
skill invocation follows the shared Git contract and produces the intended
remote, workspace, and preservation outcome. The same shared behavior applies
through Codex, Cursor, and Claude Code's existing supported interfaces.

Reuse the native supervision, stream, result-retention, and host adapters.
Extend only the bounded journey and outcome assessor for this publication
contract. Fixtures supply starting repositories, human edits, concurrent writers,
and controlled response interruptions. The native agent performs actual
workspace selection, claim, publication, and recovery from installed guidance.
Prompts state the task and authority; observable state establishes the result.

Proof entry points to add:

```sh
bash tests/git-publication-native.sh
bash tests/git-publication-native.sh --native codex
bash tests/git-publication-native.sh --native cursor
bash tests/git-publication-native.sh --native claude
```

The credential-free invocation tests maintained runner/assessor behavior with
substitute processes, complete streams, and counterexamples. For native runs,
reuse slice 13's candidate and follow these evidence boundaries:

- Exercise the shared publication boundary from an owned workspace on each
  host while another checkout holds a human edit. Observe accepted remote
  history, preserved index/working-tree state, and separate local maintenance.
- Select representative preparation, queued execution through Trunk closure,
  Story Branch closure, and durable bug-artifact disposition cases across the
  hosts. Trace each distinct caller's authority and useful outcome. Cover
  explicit local-only authority in the corresponding invocation.
- Select the materially different claim-race and uncertain-response recovery
  cases against the same common model. Observe actual claim ownership before
  implementation and accepted candidate ancestry after another remote advance.
  Use the existing bounded runner controls; preserve inconclusive evidence for
  the current assessment.
- Record each affected requirement and host as fresh proof or justified reuse,
  with candidate, invocation, runtime, decisive state, and result. Shared source
  and equivalent adapter behavior can support a reuse argument; identify what
  was actually observed. Distinguish mechanical Git checks, guidance review,
  payload proof, and native agent behavior.

The native assessor accepts equivalent wording and checks observable outcomes.
Test it against a claimed success with missing remote acceptance, captured human
edits, wrong claim ownership, and a stale or incomplete native stream. Separate
host failures remain explicit acceptance work under ADR 0005; release coverage
requires current proof or justified reuse.

Sizing: one installed-use contract and common assessor, with bounded independent
host runs. Medium confidence after separating update from use and reusing native
infrastructure. Adapter-specific evidence gaps are resolved at this boundary;
keep each case independently inspectable. Safe stopping point: supported native
use has assessed evidence or an explicit outstanding acceptance obligation.

## Promise ownership

| Refined-story promise | Owning slices and observations |
| --- | --- |
| Full caller coverage and one shared Git contract | inventory, 1–12, final source/behavior review in 13 |
| Fresh/explicit base and reusable owned workspace | 6–7, 11; retained identity and setup trace |
| Claim publication before implementation; concurrent identity protection | 7; remote membership, owner context, implementation ordering |
| Trunk increments, Story Branch publication and integration | 8–10; remote target, published history, closure records |
| Bounded races, conflicts, and uncertain response recovery | 3–4; real rejected push, remote ancestry, preserved recovery state |
| Safe default-checkout edits and opportunistic refresh | 5; index/working-tree preservation, freshness, independent publication result |
| Preparation and bug durable-record disposition | 2, 12; explicit disposition, canonical artifacts, owned resource state |
| Current-branch authority and local-only retention | 11; caller authority, local commits, truthful pending publication |
| CI attribution, repair, and resource recovery | 4, 8–10; accepted revision/target, restored work, observer-aware cleanup |
| Strong domain architecture and slice-local refactoring | 1, 6 and every slice review; owner/caller walkthrough, cumulative inventory |
| Affirmative maintained guidance and current tests | every changed footprint; final inventory review in 13 |
| Supported payload and host behavior | 13: ordinary update; 14: native observations and justified evidence reuse |

## Plan refinement assessment

The plan has 14 slices: two Structure and twelve Behavior. Refinement separated
payload update from native use, giving each its own observable gate and proof.
No completed slices existed. All story promises remain mapped above; both
Structure slices immediately precede the Behavior they enable.

The cumulative model uses one publication owner with explicit candidate and
caller inputs. Claim acquisition, preparation disposition, closure, and CI
observation retain their domain-specific decisions. Each new scenario exercises
that model. Discovery of a duplicated rule triggers refactoring at its owning
boundary and reassessment of affected caller proof.

| Slices | Assessment | Boundary checked |
| --- | --- | --- |
| 1–2 | Ready | Responsibility separation immediately enables retained-result publication. |
| 3–4 | Ready | Remote reconciliation and observed-state recovery are separate, bounded decisions. |
| 5 | Ready | Local mutation eligibility owns direct-edit/refresh preservation and maintenance reporting. |
| 6–7 | Ready | Shared workspace lifecycle immediately enables an owned-workspace claim; readiness composes from plan 069. |
| 8 | Ready | Existing execution and repair callers converge on one increment-delivery gate. |
| 9–10 | Ready | Each mode's closure has its own externally visible completion gate and preservation proof. |
| 11–12 | Ready | Explicit authority and durable investigation-artifact disposition have separate caller outcomes. |
| 13–14 | Ready | Installed payload availability and native use have separate evidence and proof loops. |

No unresolved story-scope or architectural question remains. Execution review
points are concrete: slice 3 must use an exact owned-range Git operation and its
matching backlog adapter; slices 6–7 compose the integrated worktree-readiness
contract; slice 14 assesses host-specific evidence rather than assuming parity.
These points have owners, evaluation criteria, and recoverable boundaries.
The assessment identifies no additional slice-specific refinement concern.

No numeric slice target, hard limit, or repeated-overrun threshold is supplied.
Sizing includes implementation, focused proof, refactoring, and cleanup. The
plan remains within the user's planning authority; implementation awaits its
own instruction. The 14-slice count yields no resplit recommendation.

## Preparation context

Owned checkout: `/Users/terryyin/.codex/worktrees/refine-origin-integration/open-dough`.
Branch: `codex/refine-origin-integration`.
Starting revision: `3543fad2167169092ac47ba5afbbeba4d0a0d40b`.
Originating checkout: `/Users/terryyin/git/open-dough`, branch `main`.
Recorded remote target: `origin/main`.

The story stays queued. This preparation owns its story section and this plan;
the Taken worktree-preparation story, plan, and execution remain with their owner.
Preparation is retained locally for review. Implementation and native acceptance
have not run in this planning session.
