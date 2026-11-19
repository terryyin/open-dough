---
id: SEED-353
status: active
planted: 2026-11-14
planted_during: Terry reviewed Git setup in the file-diff follow-up admission test
trigger_when: selected from the product backlog
scope: eight stories
---

# SEED-353 — Declarative Git test state

## Parent goal and retained scope

Developers should read the repository facts and relationships explaining dashboard tests without reconstructing routine Git, files, configuration or incidental identifiers. Terry approved smaller stories preserving the full migration on 2026-11-15. All original scope is allocated below; the landed-file admission example and its named start-origin revisions, launch reporting and file follow-up builders, and the Intent comparison, source selection, build provenance and timing-history arrangement are delivered and documented in the [test-data architecture guide](../../Distribution/tests/test-data-architecture.md).

Shared scope and correctness requirements:

- Audit direct and indirect arrangement throughout `dashboard/backend-tests/`, `e2e/`, affected `dashboard/frontend-tests/` and `dashboard/test-support/`, which took over the retired integrated tier and shared support. A scan is a starting point, not the boundary; preserve purposes and independent assertions.
- Use the one shared `makeMe` entry and existing repository/launch/landing builders for meaningful files, refs, authorship, ordered parents, exact bytes and workspace state. Extend current owners for demonstrated needs; no imperative scripts in builder spelling or second representation of those facts.
- Harnesses retain filesystem, Git, installation, environment and cleanup. Materialize only on demand; preserve prepared-prefix/template reuse and private mutable refs, objects, config, index and files. Expose named revision/workspace results instead of incidental `rev-parse` setup.
- Builders derive related incidental IDs, preferring fixed defaults where isolation permits and internal uniqueness when needed. Specs neither import `randomUUID` for defaults nor create, extract or pass an incidental UUID just to relate construction steps. Explicit meaningful differences, malformed IDs and real launch-returned reporting contexts remain intact.
- Keep actions under proof and independent observations visible: post-observation publication, competing writers, failed pushes, ref movement and destructive operations remain actions. Preserve staging, dirty state, authorship, topology and byte distinctions explaining each case.
- Update the [test-data architecture guide](../../Distribution/tests/test-data-architecture.md) for delivered capabilities. Apply selected MakeMe/page-object conventions, [ADR 0002's direct domain mapping](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution) and [ADR 0008's published/local distinction](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).

Under [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md), compare representative cases before/after. Keep readable construction only when its benefit justifies builder complexity without weaker proof, lost isolation or eager preparation. No speedup is promised; claim one only if measured. Each plan carries the shared [failure policy](../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Allocation, order and preparation

| Order | Receiving story | Original promises and scenario ownership |
| --- | --- | --- |
| 3 | [Declare merged review histories through MakeMe](#declare-merged-review-histories) | Story-branch commit/range comparisons, parent order, trunk integrations and conflict resolutions. |
| 5 | [Declare completed-story review histories through MakeMe](#declare-completed-story-review-histories) | Completion publication/attribution, merge edits and incomplete-history/capture fallback starting state. |
| 6 | [Declare retained landing and recovery state through MakeMe](#declare-retained-landing-recovery-state) | Story-branch/one-shot authority, captures, binding/refusal and recovery arrangement. |
| 7 | [Declare launch and session repository state through MakeMe](#declare-launch-session-repository-state) | Other launch/start/continuation/follow-up and session-association histories and incidental identities. |
| 8 | [Declare runtime and observation repository state through MakeMe](#declare-runtime-observation-repository-state) | Runtime/publication/source fixtures, Git-file/process observations, private-copy isolation and cleanup. |

Queue order: Intent aligns with the backlog's Purpose/proof direction; review increases topology risk; delivery, launches and runtime follow. Preserve unrelated order and Taken ownership. Shared code creates no blocking dependency; each outcome remains useful if later work is cancelled.

Each story resumes through story refinement; no mapped original slices require provisional plans. Indirect setup and defaults belong to the receiving scenario purpose, including newly discovered candidates. No general S/M/L bands are established (SEED-345's concern host workflows), so none are invented. Completed histories and runtime isolation have broader setup risk.

## Existing solution and evidence

Reuse the [repository builder](../../Distribution/tests/support/repositoryTestData.mjs), [materializer](../../Distribution/tests/support/repository-fixture.mjs) and [installed-origin layer](../../dashboard/test-support/support/startOriginPreparation.ts): they already own named history, ordered parents, authors/files/workspaces, deferred construction, reuse and private copies. Another framework, renamed imperative helpers or doing nothing retains the duplication.

The 2026-11-15 scan at `d25751dd51970273d7e5622b21cb66209a14e083` found 104 candidate specs (50 backend, 44 E2E, 10 integrated), matching `git`, `commitAll`, `commitAllAs`, `writeAt` calls or `randomUUID`. Actions/observations are included; differently named indirect setup is omitted. Eight repository checks passed. Neither establishes a full migration or speedup.

<a id="declare-merged-review-histories"></a>

### Declare merged review histories through MakeMe

**Identity:** SEED-353#declare-merged-review-histories
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-353#declare-merged-review-histories","dependencies":[{"supplier":{"identity":"SEED-353#declare-local-worktree-review-state","href":"seeds/SEED-353-declarative-git-test-state.md#declare-local-worktree-review-state"},"implementation":"Start origins materialize the shared repository description's workspace as Story A's linked worktree on claude/story-a, with its declared uncommitted state applied after the workspace's revisions.","rationale":"Both slices declare Story A's story-branch revisions and merges on that workspace, and the newest plain edit must be a workspace revision ahead of the uncommitted state; building them here would add a second worktree materializer, which the seed's shared requirements forbid, and reconciliation cannot avoid it.","condition":"The local-worktree story's start-origin workspace materialization and declared local state are published on main.","state":"satisfied","resolution":{"revision":"5ff2a175b73a7d78de0a72ac71108821423bc53b","path":".planning/seeds/SEED-353-declarative-git-test-state.md#declare-local-worktree-review-state","summary":"Satisfied on main at 8c37e642: dashboard/test-support/support/startOriginWorkspace.ts materializes a description workspace as the linked worktree .worktrees/<slug> on its branch (Story A on claude/story-a), committing its revisions, then writes its withLocalState facts (Distribution/tests/support/repository-local-state.mjs) after them. Proved by the review E2E and backend groups and repository-local-state.test.mjs (Intent Coverage: Caught); plan 708 and story recover from 5ff2a175.\nCondition satisfied: The local-worktree story's start-origin workspace materialization and declared local state are published on main.\nAccepted integration: 8c37e642d45d761ac635f01cacb4bdb97d239297 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/709-declare-merged-review-histories/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"bc25b70b09b54a9f20a5c9cbc95bdc0645ce5b662c5647fb32fdb73e36a69dec","plan":"cbd95b67096308e2e882f3c51c93f60a6f385c307c7ab4ad594d4b30b56e6a53"}}
```

**Goal.** A developer reads a story branch's commits, its trunk integrations
and their conflict resolutions from named revisions with ordered parents and
file changes, rather than from the Git commands that once produced them. The
Commits range and merge cases then explain which edits are the story's own and
which carry trunk's changes, and stay easy to change with the review behavior
they prove.

**Scope.** Migrate Story A's committed story-branch topology in
`dashboard/test-support/support/storyReviewTrunk.ts` (`worktreeWithStoryCommits`,
`integrateTrunk`, `sixth`) and its consumers
`e2e/review/story-review-commit-trunk.spec.ts` and
`e2e/review/story-review-commit-renames.spec.ts`, including the spec-local
history there (the separate-line story edit, the renames either side of a
conflicted integration). Also migrate the starting commits that commit-range
cases add before opening the review: the newest plain story edit and the empty
story commit in `story-review-commits.spec.ts`, and the first story commit in
`story-review-commit-refresh.spec.ts`. Declare trunk files, the landed slice
trunk takes, the story's commits, trunk's changing commit and each integration
merge with its first parent the story and its second parent trunk, its
resolved file bytes and its author, through the shared MakeMe repository
description and the start-origin workspace that the local-worktree sibling
gives Story A. Extend those owners for demonstrated needs; preserve deferred,
prepared-prefix reuse and each test's private mutable worktree. Named revision
results replace incidental `rev-parse`.

A conflicted integration stays a real conflict: the test confirms
independently, without the description's renderer, that its declared parents
conflict on the resolved file, and that a clean integration's parents merge
without conflict. Commits made, a push to trunk and a Refresh after the review
opened stay visible scenario actions. Update the test-data architecture guide
and compare representative construction before and after under ADR 0010. No
production behavior change or speedup promise.

Excluded: Story A's local worktree and its uncommitted state, the commit
admission request and admission worktree (local-worktree sibling); Trunk Mode
authorship, completed-story merges including `storyReviewMergeDriver.ts`
(which keeps importing `sixth`) and `laterStoryMergesTrunk.ts`, which its Intent
sibling owns; ad-hoc session commit runs and kept-commit records, which remain
session actions for the launch and session sibling. The shared `git`,
`commitAll` and `writeAt` helpers stay while other families import them.

**Key examples.**

- Given Story A's declared branch — trunk's files, a landed slice trunk later
  takes, the story's change to `src/c.ts`, and a merge of trunk's change to
  `README.md` — Commits lists two story commits, says trunk was integrated
  within the range, the merge alone changed nothing, and the whole range shows
  only `src/c.ts`'s `-c 5`/`+c story`, without `landed.txt`, `README.md` or
  `src/a.ts`.
- Given the same branch where trunk also changes `src/c.ts`'s sixth line and
  the declared merge settles it as `c story and trunk`, the merge alone shows
  `-c story`/`+c story and trunk` flagged “includes trunk's changes”, and the
  range shows `-c 5`/`+c story and trunk`; an independent merge of the two
  declared parents still conflicts on `src/c.ts`.
- Given a merge that settles `src/c.ts` back to `c 5`, the range stays flagged
  and shows `-c trunk`/`+c 5` from the destination baseline; given a story edit
  to a separate line of `src/a.ts` merged cleanly with trunk's sixth-line edit,
  the range shows only `-a 0`/`+a story` with no flag.
- Given `src/c.ts` renamed to `d.ts` before a conflicted integration with
  trunk's edit and to `e.ts` after it, the four story commits keep their order
  and the range shows `src/c.ts → src/e.ts` flagged with `-c 5`/`+c story and
  trunk`.
- Given a declared newest plain edit on Story A, or an empty story commit, the
  chosen commit's trees and the empty range's “changed nothing” stay as today;
  given one declared story commit, commits added and pushed to trunk after
  opening still move the anchored range only on Refresh.

**Safe stopping point.** Story-branch topology setup has one shared declarative
owner while unrelated trunk-mode and completed scenarios remain unchanged. No
open human decision. It starts after the local-worktree story's start-origin
workspace and local state land, which its declared merges compose.

<a id="declare-completed-story-review-histories"></a>

### Declare completed-story review histories through MakeMe

**Identity:** SEED-353#declare-completed-story-review-histories
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why.** A developer can see a completed story's claim, authors, completion
and merge relationships. Include `completedPublishedStory.ts`, its merge/input
helpers, published-file follow-ups and completed-review consumers across tiers.
**Evaluation.** Declared completion and interleaved/own/foreign merge histories
preserve completion comparisons, attribution, file admission and gap/fallback
refusals. Keep real publication/capture where that operation is the tested action.
**Safe stopping point.** Readable published-completion setup independent of local
activity; retained-run recovery remains separate.

<a id="declare-retained-landing-recovery-state"></a>

### Declare retained landing and recovery state through MakeMe

**Identity:** SEED-353#declare-retained-landing-recovery-state
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why.** A developer sees which launch, authority and comparison a retained
landing belongs to. Include story-branch and one-shot contexts, captures, binding,
retention, recovery and later-publication starting state and indirect helpers.
**Evaluation.** Related builder facts share their launch internally; deliberate
mismatch, missing objects and stale authority remain explicit. Capture, refused
push, retry and destructive cleanup under proof stay real visible operations.
**Safe stopping point.** Readable landing/recovery setup with unchanged refusal
and retained-evidence assertions.

<a id="declare-launch-session-repository-state"></a>

### Declare launch and session repository state through MakeMe

**Identity:** SEED-353#declare-launch-session-repository-state
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why.** A developer reads other launch/start/continuation/follow-up and
session-association cases from their repository and related-record facts. Include
remaining incidental UUID defaults, ambiguous/competing histories and shared setup.
Two overlaps are left for this story to weigh as it migrates their callers:
`withCapturedLanding` beside `withLanding(builder)`, and the installation
re-exports `startOriginPreparation.ts` keeps for its importers.
**Evaluation.** Named initial history and internally related IDs retain the same
launch, continuation and session-association/refusal results; actual starts and
returned reporting contexts stay the evidence where their behavior is under proof.
**Safe stopping point.** Launch/session setup is declarative with no change to
host, local-session or published-assignment meanings.

<a id="declare-runtime-observation-repository-state"></a>

### Declare runtime and observation repository state through MakeMe

**Identity:** SEED-353#declare-runtime-observation-repository-state
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why.** A developer can read runtime/source/publication, Git-file identity,
process and fixture-isolation scenarios from their starting facts. Include scoped
runtime/observation helpers and differently named indirect repository construction.
**Evaluation.** Declared starting state preserves publication/source selection and
independent identity/process observations. Isolation cases still mutate, publish,
corrupt and clean private copies as their visible actions and observe peers.
**Safe stopping point.** Runtime/observation construction is readable with sharing,
cleanup and mutation proof intact. Check direct and indirect candidates across the
original roots against this allocation; migrate this story's residue and retain
other unfinished stories' obligations rather than claiming them complete.
