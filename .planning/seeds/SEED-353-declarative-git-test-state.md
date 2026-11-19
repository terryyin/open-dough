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

<a id="declare-trunk-review-authorship"></a>

### Declare trunk review authorship through MakeMe

**Identity:** SEED-353#declare-trunk-review-authorship
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/711-declare-trunk-review-authorship/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c4e5077891eb53e1be5eda76be4f63633b63ca5df4b8db680f6874338695d8e0","plan":"9a5fc625a85dadcbb28a9b092c1c3d771b5054146492d10f3e72017d19856e1b"}}
```

**Goal.** A developer reads a Trunk Mode story's review cases from who
authored each trunk and worktree revision, which worktrees the agent holds and
where each starts, rather than from the pushes, pulls, rebases and Git config
calls that once produced them. Own versus foreign changes, flagged rewrites and
worktree ambiguity then explain themselves and stay easy to change with the
review behavior they prove.

**Scope.** Migrate the starting state of
`dashboard/test-support/support/storyReviewTrunkMode.ts` and
`storyReviewTrunkCommits.ts` and their consumers
`e2e/review/story-review-trunk-own-changes.spec.ts`,
`story-review-trunk-own-flagged.spec.ts` and
`story-review-trunk-own-older-git.spec.ts`, and the agent-authored worktrees of
`e2e/review/story-review-trunk-worktree-ambiguity.spec.ts`. Declare, through the
shared MakeMe repository description and its start-origin materialization: Yui-chan's
published story commits interleaved on trunk with another developer's commits,
Mina-chan's preparation commit and a merge Yui-chan authored with its ordered
parents; a story commit that changes a line another developer's later trunk
commit rewrites; unpublished story commits; untracked files; and each
worktree's branch, starting revision and agent authorship. The review reads a
worktree's agent from its per-worktree author configuration, so declared
authorship is materialized through the real `configureAgentAuthorship`, not a
second spelling of it. The ambiguity cases need several agent-authored
worktrees beside the story's, each possibly holding an unpublished claim, so
the description gains them as a demonstrated need. Extend those owners;
preserve deferred, prepared-prefix reuse and each test's private mutable
checkouts. Named revision and tree results replace incidental `rev-parse`.
Remove `publishLater`, which no spec uses.

Changes made after the review opened stay visible scenario actions: an
unpublished commit before reopening, Yui-chan publishing and another developer
rewriting her line before Refresh, and the older-Git reset to trunk. The
Trunk Mode start in `story-review-trunk-worktree.spec.ts` stays the real start,
since that spec proves the review of what a terminal start leaves; its later
commit and push stay actions on that start's worktree. Git observations the
specs assert (`merge-base`, a commit's subject, a parent tree) stay independent
of the description's renderer, and the older-Git fixture stays the environment
it is. Update the test-data architecture guide and compare representative
construction before and after under ADR 0010. No production behavior change or
speedup promise.

Excluded: completed-story histories and the completed-review backend specs that
also import `agentAuthoredWorktree.ts` (completed-story sibling, which can
reuse this story's declared agent worktrees); Story Branch Mode merges (merged
review histories sibling); launch, start and session-association arrangement
(launch and session sibling). Shared `git`, `commitAll` and `writeAt` helpers
and `agentAuthoredWorktree.ts` stay while other families import them.

**Key examples.**

- Given trunk declared up to Yui-chan's Trunk Mode claim of Story A, then her
  `s1` changing `src/a.ts`'s first line, another developer's `o1`, Mina-chan's
  `prep.md`, Yui-chan's merge of side work bringing `merged.md` with its first
  parent trunk and its second the side commit, `o2` changing the file's last
  line, and her `s2` adding `d.md`, and her worktree on `claude/story-a` at
  trunk's head authored as her with untracked `notes.md`: All changes lists
  `d.md`, `notes.md` and `src/a.ts` with only `-a 0`/`+a one`, the review
  reports two published commits, and the context line reads “origin/main less
  2 story commits”. An unpublished `u1` committed after opening joins on
  reopening while Commits lists only `u1`.
- Given nothing published since the claim and a declared unpublished `u1`, the
  baseline is the claim, which an independent `merge-base` confirms, and only
  `notes.md` and `src/g.ts` are listed.
- Given a declared `s1 more` changing `src/c.ts`'s ninth line, `s2` changing
  its third, and another developer's `o3` rewriting that third line, `src/c.ts`
  is flagged from the named tree before `s1 more`, counted `+2 −2` and diffed
  `-c 3`/`-c 9` to `+c trunk`/`+c nine`; `HEAD~1` is still `s2`. With one
  commit published when the review opens, publishing `s2` and `o3` afterwards
  flags the file only on Refresh.
- Given the same two published commits and `u1` on a Git that cannot restate
  trees, the review lists only `notes.md` and `src/g.ts` and says the published
  commits could not be taken out; resetting the worktree to trunk afterwards
  still reports no changes with that explanation.
- Given the claim on trunk, the story's worktree `trunk-a` with one slice, and
  declared agent-authored worktrees beside it — one at trunk before the claim,
  one holding Yui-chan's unpublished claim of another story, one holding
  Akiho-chan's unpublished claim of Story A — the review reads `trunk-a` alone;
  given a second worktree `trunk-b` at the claim, the review is unavailable,
  names both worktrees, and the boundary refuses both reads with 409.

**Safe stopping point.** Trunk Mode review attribution setup has one shared
declarative owner, with publication and Refresh transitions and the real
terminal start unchanged, independent of the completed-story migration. No
open human decision.

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
Delete `dashboard/test-support/support/storyReviewMergeDriver.ts` instead of
migrating it: `printingMergeDriver` has had no consumer since review marks were
removed, and it is the last importer of `sixth` outside the commit-trunk specs.
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
