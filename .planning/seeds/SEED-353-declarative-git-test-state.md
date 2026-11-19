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
| 6 | [Declare retained landing and recovery state through MakeMe](#declare-retained-landing-recovery-state) | Story-branch/one-shot authority, captures, binding/refusal and recovery arrangement. |
| 7 | [Declare launch and session repository state through MakeMe](#declare-launch-session-repository-state) | Other launch/start/continuation/follow-up and session-association histories and incidental identities. |
| 8 | [Declare runtime and observation repository state through MakeMe](#declare-runtime-observation-repository-state) | Runtime/publication/source fixtures, Git-file/process observations, private-copy isolation and cleanup. |

Queue order: Intent aligns with the backlog's Purpose/proof direction; review increases topology risk; delivery, launches and runtime follow. Preserve unrelated order and Taken ownership. Shared code creates no blocking dependency; each outcome remains useful if later work is cancelled.

Each story resumes through story refinement; no mapped original slices require provisional plans. Indirect setup and defaults belong to the receiving scenario purpose, including newly discovered candidates. No general S/M/L bands are established (SEED-345's concern host workflows), so none are invented. Completed histories and runtime isolation have broader setup risk.

## Existing solution and evidence

Reuse the [repository builder](../../Distribution/tests/support/repositoryTestData.mjs), [materializer](../../Distribution/tests/support/repository-fixture.mjs) and [installed-origin layer](../../dashboard/test-support/support/startOriginPreparation.ts): they already own named history, ordered parents, authors/files/workspaces, deferred construction, reuse and private copies. Another framework, renamed imperative helpers or doing nothing retains the duplication.

The 2026-11-15 scan at `d25751dd51970273d7e5622b21cb66209a14e083` found 104 candidate specs (50 backend, 44 E2E, 10 integrated), matching `git`, `commitAll`, `commitAllAs`, `writeAt` calls or `randomUUID`. Actions/observations are included; differently named indirect setup is omitted. Eight repository checks passed. Neither establishes a full migration or speedup.

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
