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
| 5 | [Declare completed-story review histories through MakeMe](#declare-completed-story-review-histories) | Completion publication/attribution, merge edits and incomplete-history/capture fallback starting state. |
| 6 | [Declare retained landing and recovery state through MakeMe](#declare-retained-landing-recovery-state) | Story-branch/one-shot authority, captures, binding/refusal and recovery arrangement. |
| 7 | [Declare launch and session repository state through MakeMe](#declare-launch-session-repository-state) | Other launch/start/continuation/follow-up and session-association histories and incidental identities. |
| 8 | [Declare runtime and observation repository state through MakeMe](#declare-runtime-observation-repository-state) | Runtime/publication/source fixtures, Git-file/process observations, private-copy isolation and cleanup. |

Queue order: Intent aligns with the backlog's Purpose/proof direction; review increases topology risk; delivery, launches and runtime follow. Preserve unrelated order and Taken ownership. Shared code creates no blocking dependency; each outcome remains useful if later work is cancelled.

Each story resumes through story refinement; no mapped original slices require provisional plans. Indirect setup and defaults belong to the receiving scenario purpose, including newly discovered candidates. No general S/M/L bands are established (SEED-345's concern host workflows), so none are invented. Completed histories and runtime isolation have broader setup risk.

## Existing solution and evidence

Reuse the [repository builder](../../Distribution/tests/support/repositoryTestData.mjs), [materializer](../../Distribution/tests/support/repository-fixture.mjs) and [installed-origin layer](../../dashboard/test-support/support/startOriginPreparation.ts): they already own named history, ordered parents, authors/files/workspaces, deferred construction, reuse and private copies. Another framework, renamed imperative helpers or doing nothing retains the duplication.

The 2026-11-15 scan at `d25751dd51970273d7e5622b21cb66209a14e083` found 104 candidate specs (50 backend, 44 E2E, 10 integrated), matching `git`, `commitAll`, `commitAllAs`, `writeAt` calls or `randomUUID`. Actions/observations are included; differently named indirect setup is omitted. Eight repository checks passed. Neither establishes a full migration or speedup.

<a id="declare-completed-story-review-histories"></a>

### Declare completed-story review histories through MakeMe

**Identity:** SEED-353#declare-completed-story-review-histories
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/716-declare-completed-story-review-histories/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"b81b72ac5267a20b30b9a1929184d6015635be97b8b3c3216f78151c6c854fe7","plan":"d9fc4ee5c8d347bc445bf564cc6be86a675fa3989413eb347b5c84735e65f73c"}}
```

**Goal.** A developer reads a completed story's review case from its declared
history: who claimed the story and who took it over or returned it, the story's
implementation, which merges are its own integrations and which are another
writer's, each with ordered parents, resolved bytes and author, and which
revision publishes the done record. Today a variant name passed to
`completedPublishedStory` replays a real start, pushes, merges and backlog CLI
runs out of sight. Completion comparisons, attribution, merge edits and
gap/fallback refusals then explain themselves and stay easy to change with the
review behavior they prove.

**Scope.**

- Replace `dashboard/test-support/support/completedPublishedStory.ts` and the
  inputs it threads through variant names and callbacks
  (`completedStoryInput.ts`, `completedStoryMerges.ts`,
  `publishCompletedStoryLanding`'s Story Branch landing,
  `advanceCompletedTrunk`, and `keepUnusableCompletedCapture`'s `rev-parse`
  base) with one declared completed-story history in the shared
  `makeMe.aRepository` description, materialized by the start origin. Declare
  the claim through `takeRevision`, the implementation, the interleaving
  writer, the takeover and return profiles, each integration and landing merge,
  and the completion as a revision carrying `makeMe.aDoneRecord`. The done
  record carries Intent coverage, or omits agent, host and model, when the case
  states it. Named revisions replace the returned `claim`, `completion` and
  `branchSide`. Extend these owners only for demonstrated needs, and keep
  deferred, prepared-prefix reuse and each test's private mutable copy.
- Migrate every consumer, keeping its purpose and independent assertions:
  - the backend review `story-review-completed*`, historical-choice and
    capture-fallback specs;
  - the launches follow-up-file specs and `followUpCompletedFile.ts`;
  - the E2E review completed, merge-edits, follow-up, diff-line-follow-up and
    diff-add-note specs;
  - the Intent consumers: the E2E intent specs, `intentCompletedStory.ts`,
    `retainedIntentCompletion.ts`, `ciFollowUpScenario.ts`,
    `storyCiComparisonDoneFixture.ts` and
    `intentSummaryStoryComparisonFixture.ts`;
  - `storyCiComparisonEarlierLanding.ts` and
    `storyCiComparisonSkippedLandingFixture.ts`, whose completion commit and
    later trunk advance are the same starting facts;
  - `laterStoryMergesTrunk.ts`, the later developer's merge that carries the
    done record onto trunk's first-parent path.
- A conflicted merge stays a real conflict. The case confirms it
  independently, without the description's renderer, by checking that its
  declared parents conflict on the resolved file. The fallback inputs stay
  visible scenario actions or harness inputs: shallow fetches, merge-driver
  configuration, the moved `.git` folder, and retained captures that point at a
  missing repository.
- The real backlog completion's own outputs, such as an agentless record after
  a return, stay proved by the backlog completion tests. The planner adds a
  backlog-level check where a declared record replaces the only current proof.
- Delete `storyReviewMergeDriver.ts`. `printingMergeDriver` has had no consumer
  since review marks were removed, and it is the last importer of `sixth`
  outside the commit-trunk specs. Retire
  `story-review-uninterleaved-input.spec.ts` with the helper validation it
  guards. A refusal the declaration still needs becomes a builder check that
  runs before any Git.
- Update the test-data architecture and repository test-data guides. Compare
  representative construction before and after, under ADR 0010. No production
  behavior change and no speedup promise.

Excluded:

- `completeBacklogStory`, `commitBacklogCompletion` and
  `publishCompletedStory` stay for completions made in launch workspaces or
  retained landings: `retainedIntentLanding.ts` and the
  `intent-done-prior-execution` and `intent-done-default-answer-selection`
  specs belong to the retained-landing sibling, and
  `adHocCompletedAssociation.ts` and the completed-story association specs to
  the launch and session sibling.
- The shared `git`, `commitAll` and `writeAt` helpers stay while other
  families import them.

**Key examples.**

- **Trunk Mode.** Given a declared Trunk Mode history, the review is published
  with completion `completion` and agent Yui. The history has:
  - Yui's claim of Story A;
  - the implementation changing `shared.txt`'s first line and adding
    `[literal]*.txt`;
  - another writer's interleaved `other-story.txt` and last-line edit, merged
    into the story;
  - the completion revision with Yui's done record.

  The files list `shared.txt` and `[literal]*.txt` without `other-story.txt`.
  In Story Branch Mode, a declared trunk-first landing merge authored by Yui
  gives the same files, and `branchSide` names its second parent.
- **Takeover.** Given the same history where Akiho takes over and adds
  `takeover.txt`, the review lists `takeover.txt` (`+second agent work`) beside
  Yui's files.
- **Return.** Given a story returned before completion, whose declared done
  record has no agent, the review recovers Yui as the unique published
  execution agent.
- **Another writer's merges.** Given another writer's declared merge on trunk
  that resolves `unrelated.txt`, or that rewrites the story's line in
  `shared.txt`, or an octopus merge of two side branches, the attribution and
  refusal answers stay as today.
- **The story's own merges.** Given the story's own conflicted integration:
  - Its declared resolution is `resolved story and trunk`.
  - It moves `agents/` to `profiles/`, restores trunk's `agents/other.json`,
    renames `checks/before.test.mjs` to `after.test.mjs`, and adds
    `merge-resolution.txt`.

  The delivered files are `[literal]*.txt`, `checks/after.test.mjs` (renamed),
  `merge-resolution.txt`, `profiles/only.json` (renamed) and `shared.txt`,
  which is flagged as including trunk's changes. An independent merge of its
  declared parents still conflicts on `shared.txt`.
- **Capture fallback and gaps.** Given a declared completion and a retained
  capture whose repository is missing, the review falls back to published
  history with the declared completion's first parent as its base. A shallow
  checkout or a done record without an agent still gives today's gap answers.
- **Done record via a later merge.** Given a later developer's declared merge
  that carries the done record onto trunk's first-parent path, the completed
  review still finds Story A's completion.

**Safe stopping point.** Completed-story review setup is declarative and
independent of local activity. Launch-workspace completions and retained-run
recovery stay with their siblings. No human decision is open.

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
