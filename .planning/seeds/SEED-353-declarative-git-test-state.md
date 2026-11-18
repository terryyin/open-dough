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

Developers should read the repository facts and relationships explaining dashboard tests without reconstructing routine Git, files, configuration or incidental identifiers. Terry approved smaller stories preserving the full migration on 2026-11-15. All original scope is allocated below; the landed-file admission example and its named start-origin revisions, launch reporting and file follow-up builders are delivered and documented in the [test-data architecture guide](../../Distribution/tests/test-data-architecture.md).

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
| 1 | [Declare Intent comparison histories through MakeMe](#declare-intent-comparison-histories) | Intent/CI comparison, source selection, build provenance and timing-history arrangement. |
| 2 | [Declare local worktree review state through MakeMe](#declare-local-worktree-review-state) | Worktree content, staged/unstaged/untracked/ignored state, modes, renames, binary and context fixtures. |
| 3 | [Declare merged review histories through MakeMe](#declare-merged-review-histories) | Story-branch commit/range comparisons, parent order, trunk integrations and conflict resolutions. |
| 4 | [Declare trunk review authorship through MakeMe](#declare-trunk-review-authorship) | Trunk-mode own/foreign history, rewritten histories and attribution. |
| 5 | [Declare completed-story review histories through MakeMe](#declare-completed-story-review-histories) | Completion publication/attribution, merge edits and incomplete-history/capture fallback starting state. |
| 6 | [Declare retained landing and recovery state through MakeMe](#declare-retained-landing-recovery-state) | Story-branch/one-shot authority, captures, binding/refusal and recovery arrangement. |
| 7 | [Declare launch and session repository state through MakeMe](#declare-launch-session-repository-state) | Other launch/start/continuation/follow-up and session-association histories and incidental identities. |
| 8 | [Declare runtime and observation repository state through MakeMe](#declare-runtime-observation-repository-state) | Runtime/publication/source fixtures, Git-file/process observations, private-copy isolation and cleanup. |

Queue order: Intent aligns with the backlog's Purpose/proof direction; review increases topology risk; delivery, launches and runtime follow. Preserve unrelated order and Taken ownership. Shared code creates no blocking dependency; each outcome remains useful if later work is cancelled.

Each story resumes through story refinement; no mapped original slices require provisional plans. Indirect setup and defaults belong to the receiving scenario purpose, including newly discovered candidates. No general S/M/L bands are established (SEED-345's concern host workflows), so none are invented. Completed histories and runtime isolation have broader setup risk.

## Existing solution and evidence

Reuse the [repository builder](../../Distribution/tests/support/repositoryTestData.mjs), [materializer](../../Distribution/tests/support/repository-fixture.mjs) and [installed-origin layer](../../dashboard/test-support/support/startOriginPreparation.ts): they already own named history, ordered parents, authors/files/workspaces, deferred construction, reuse and private copies. Another framework, renamed imperative helpers or doing nothing retains the duplication.

The 2026-11-15 scan at `d25751dd51970273d7e5622b21cb66209a14e083` found 104 candidate specs (50 backend, 44 E2E, 10 integrated), matching `git`, `commitAll`, `commitAllAs`, `writeAt` calls or `randomUUID`. Actions/observations are included; differently named indirect setup is omitted. Eight repository checks passed. Neither establishes a full migration or speedup.

<a id="declare-intent-comparison-histories"></a>

### Declare Intent comparison histories through MakeMe

**Identity:** SEED-353#declare-intent-comparison-histories
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/643-declare-intent-comparison-histories/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"1aa1274ec23e575a0778bd1b861bc8aca9cfc76ee8b351a7736410f3d348c081","plan":"80abe97f794ac87b7a1c65b1672d146d281af7423f0ee63de4107100c03da1b6"}}
```

**Goal.** A developer reads the repository facts explaining Intent's compared
revisions, selected source and build provenance directly, without reconstructing
routine Git setup. This makes Purpose and CI proof easier to maintain together.

**Scope.** Migrate direct and indirect Intent/CI comparison, completed/retained
Intent, Summary comparison and timing-history arrangement across backend, E2E
and Frontend-group tests. Include `storyCiComparison*`,
`intentCompletedStory`, retained-Intent, summary and scope-history callers and
their incidental identity wiring. Use the shared MakeMe repository facts and
existing completed-history owners for files, configuration/workflow bytes,
authorship, ordered parents, named endpoints and starting workspace state.
Extend those owners for demonstrated gaps; preserve deferred preparation,
prepared-prefix/worker reuse, private mutable copies and independent assertions.

Keep publication after an observation, actual completion/capture under proof,
ref movement, shallow-history recovery, corruption and cleanup as visible
actions. Preserve meaningful IDs and real returned reporting contexts. Update
the test-data architecture guide and compare representative construction before
and after under ADR 0010. This changes test construction, with no production
behavior change or speedup promise. General review, completion, launch and
recovery migrations remain with their receiving siblings; shared consumers keep
their current proof and gain no completion claim from this story.

**Key examples.**

- Given a named built baseline, planning-only ancestors, claim and provisional
  branch/trunk tip, opening Taken Intent shows the same baseline, provisional
  identity and CI rows. Publishing a new branch head after that observation
  remains a scenario action and triggers the same fresh read.
- Given an owning landing merge, later completion and later trunk build, Done
  Intent selects the original landing/branch endpoints. Each build uses its own
  workflow bytes even when the local tip's workflow differs. Planning-only,
  code, cancelled and proofless cases retain their distinct exact, ancestor,
  equivalent, later-build and unavailable results.
- Given completion-time locations and file bytes plus conflicting later trunk
  and retained-workspace edits, Done Intent reads the immutable completion;
  ordinary Review can still read the local edits. Missing history remains
  unavailable until the explicit recovery action.
- Given changed, added, removed and renamed files in nested test locations,
  Summary and collected/retained scope history keep the same independent
  counts, timing rows, represented landing and selected build provenance. A
  measured file absent from the current tree still contributes to history;
  uncollected endpoints and gaps stay visible.

**Safe stopping point.** Intent construction is readable with unchanged
CI/source/proof assertions and isolated fixtures; other review/launch families
need not migrate first. No open human decision or blocking dependency.

<a id="declare-local-worktree-review-state"></a>

### Declare local worktree review state through MakeMe

**Identity:** SEED-353#declare-local-worktree-review-state
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why.** A developer sees which local files/index/workspace facts explain
review and refresh. Include uncommitted, nested/large/context, rename, mode and
binary starting state in `storyReviewWorktree.ts` and its callers across tiers.
**Evaluation.** Declared committed, staged, unstaged, untracked and ignored bytes
produce the same review and independent Git status/index results. A later edit,
stage or commit being observed stays explicit in the scenario.
**Safe stopping point.** Local-content review fixtures are declarative and isolated;
no trunk-attribution or completed-history migration is required for their value.

<a id="declare-merged-review-histories"></a>

### Declare merged review histories through MakeMe

**Identity:** SEED-353#declare-merged-review-histories
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why.** A developer reads story-branch commit/range comparisons from named
parents and file changes rather than setup scripts. Include `storyReviewTrunk.ts`,
commit/range/mark/admission helpers and their backend/E2E/integrated consumers.
**Evaluation.** Clean integration, conflicted resolution, destination-baseline
resolution and renamed-path histories preserve exact shown edits, ancestry and
trunk flags; actions that change a previously observed comparison stay visible.
**Safe stopping point.** Story-branch topology setup has one shared declarative
owner while unrelated trunk-mode and completed scenarios remain unchanged.

<a id="declare-trunk-review-authorship"></a>

### Declare trunk review authorship through MakeMe

**Identity:** SEED-353#declare-trunk-review-authorship
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why.** A developer reads own versus foreign Trunk Mode changes directly
from authored revision facts. Include `storyReviewTrunkMode.ts`, older-Git,
rewritten-line, own-since, flagged-history and worktree-ambiguity starting state.
**Evaluation.** Declared agent/developer authors, Takes, interleaving and rewritten
history preserve own-change comparisons, marks and ambiguity/refusal results;
Git observations remain independent of the description's renderer.
**Safe stopping point.** Trunk attribution setup is readable without changing
publication/refresh transitions or waiting for completed-story migration.

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
