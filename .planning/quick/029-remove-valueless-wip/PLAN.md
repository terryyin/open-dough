# Remove WIP without external value and find a home for the rest

## Source

[SEED-009 Story 1](../../seeds/SEED-009-keep-only-externally-valuable-work.md#harden-direction-change).

## Goal and scope

The Open Dough maintainer can trust that every retained work-in-progress item
has a named beneficiary, an evaluable external outcome, and one canonical story
home. Keep internal protection only when it directly safeguards such an outcome.
Delete work retained for future optionality or historical interest;
Git history is the recovery mechanism when demand returns.

Included:

- reconcile the product backlog and active seed stories with the current
  first-round SDLC direction;
- remove dormant or completed planning artifacts whose outcomes are already
  durable elsewhere;
- remove Proposed guidance, research, and Proposed ADRs that have no current
  client outcome, repairing their live references;
- retain original decisive native evidence required by Accepted ADR 0005; and
- establish ownership and a canonical story home for every surviving active
  change before keeping it.

Excluded:

- executing retained stories or extracting, promoting, releasing, or installing
  new guidance;
- inventing replacement stories for deleted possibilities;
- changing an Accepted ADR's decision or deleting immutable release history;
- deleting original decisive evidence retained under Accepted ADR 0005; and
- touching Quick 028's plan, product changes, test changes, observer state, or
  local `.cursor/hooks.json` while its current executor owns them.

## Key examples and outside-in proof

| Situation | Expected result | Owning slice |
| --- | --- | --- |
| Backlog or seed entry describes completed, speculative, or unowned work | It is completed and retained only where current backlog history requires it, or deleted with live links repaired | 1 |
| A dormant seed has no current beneficiary or demand | The seed is absent; Git history remains the recovery path | 1 |
| Completed plan/evidence repeats behavior already durable in current guidance, tests, ADRs, or Git | The redundant planning artifact is absent | 2 |
| Native acceptance evidence remains decisive and reusable under ADR 0005 | The original evidence remains addressable while obsolete process commentary is absent | 2 |
| Proposed skill, research note, or Proposed ADR has no current client outcome | The artifact and obsolete incoming references are absent | 3 |
| Quick 028 is still externally valuable and actively owned | Its surviving changes point to their existing story and are not modified by this cleanup | 4 |
| Quick 028 has finished or been abandoned before cleanup closes | Its owner-delivered result is retained in enduring behavior; leftover plan, host state, or unowned changes are removed | 4 |

## Execution context

- Status vocabulary: `planned`, `in-progress`, `done`.
- Slice target: 30 minutes including focused proof and slice-local cleanup.
- Hard limit: 60 minutes. A stated focused-test run or wait for Quick 028's
  active owner may exceed it; after two overruns, reassess Story 1 before
  further slice refinement.
- Starting point: `main` after refinement commit `acea6bd`. Recheck HEAD and the
  full ownership inventory before execution because Quick 028 is concurrently
  changing the working tree and may commit or restore files.
- Active ownership observed during planning: Quick 028 owns its PLAN,
  `src/install/open-dough-release-version.sh`, `src/install/open-dough-release.sh`,
  `tests/compare-payload.sh`, and `.cursor/hooks.json`. Treat this as a snapshot,
  not permission to absorb or delete those paths.
- Verification: use bounded link/title/status checks for planning changes,
  `npm run lint` for repository policy, and `npm test` only after deletions that
  can affect maintained behavior or payload checks.
- Refactoring and delivery: apply the repository's post-change-refactor and
  formatting gates, update this plan after each slice, and commit/push through
  the selected execution workflow. Remove this spent plan when the final slice
  and story completion records are delivered.

## Current decisions

- External value is a current observable outcome for a named user or client, or
  internal protection directly required to deliver that outcome. Possible
  future usefulness is not value now.
- Accepted ADR 0003 preserves released tags and defines undeclared source skills
  as Proposed; it does not require unused Proposed guidance to remain.
- Accepted ADR 0005 requires original decisive native evidence to remain
  reusable. Quick 023 and Quick 027 are presumed retained unless inspection
  proves a file is obsolete process commentary rather than decisive evidence.
- Accepted ADR 0006 permits deleting unused skill drafts but requires any
  retained executing-agent guidance to keep one authoritative behavioral home.
- Current concrete deletion candidates include dormant SEED-002, SEED-005, and
  SEED-008; completed Quick 004, 007, 011, 013, 014, 015, 025, and 026 artifacts;
  `dough-acme-change-readiness`; and research or Proposed ADR content without a
  live client outcome. Recheck references and current demand before deletion.
- Quick 028 protects clients from invalid released payloads and has a canonical
  home in SEED-004 Story 5. Preserve it while active; do not use this plan to
  make its completion decision for its owner.

## Ordered slices

### 1. Present only current externally valuable stories

Type: Behavior
Status: planned
Proof: Bounded script verifies backlog section order, exact linked titles,
unique entries, resolvable anchors, prerequisite order, and at most ten newest
completions; manual comparison to the near-future direction.

Behavior: Given the old backlog and seed set contains completed, dormant, or
speculative outcomes → the maintainer opens the product backlog after cleanup →
only selected current outcomes appear, every linked story has a named
beneficiary and evaluable result, and dormant ideas without current demand are
absent rather than archived.

Preserve the explicit first priority and stable anchors that still have live
callers. If Quick 028 remains unfinished, place its externally valuable story
ahead of later unstarted guidance work after this cleanup story. Do not create
new extraction candidates merely to populate the list.

### 2. Retain decisive evidence without completed planning residue

Type: Behavior
Status: planned
Proof: Reference scan plus manual ADR 0005 evidence walk; `npm run lint`; the
repository contains no completed quick-plan/evidence directories except original
decisive acceptance evidence with a live requirement or recognition reference.

Behavior: Given completed planning and acceptance artifacts coexist → the
maintainer inspects the repository after cleanup → outcomes already durable in
current source, tests, ADRs, or Git have no duplicate planning residue, while
original evidence still required to assess or reuse cross-tool acceptance
remains reachable.

Delete completed Quick artifacts that only narrate delivered work. Keep Quick
023 and Quick 027 original decisive evidence under ADR 0005 unless a bounded
reference-and-requirement review proves particular content is obsolete process
commentary. Do not rewrite retained evidence as if it were current instruction.

### 3. Remove proposed concepts without a current client outcome

Type: Behavior
Status: planned
Proof: Search confirms every remaining undeclared source skill, research note,
and Proposed ADR names a current client outcome and story; `npm run lint`; run
focused payload tests if any maintained declaration or fixture changes.

Behavior: Given proposed guidance and decision/research drafts predate the new
direction → the maintainer inspects unreleased work after cleanup → only concepts
with a current named client outcome remain; unsupported drafts and their stale
references are absent and can be recovered from Git if demand returns.

Start with `dough-acme-change-readiness`, the two research notes, and Proposed
ADRs 0001, 0002, and 0004. Keep a candidate only with current evidence satisfying
the story's value rule; a reference from another stale artifact is insufficient.
Do not alter Accepted ADR status or content.

### 4. Leave one owner and story home for every surviving WIP

Type: Behavior
Status: planned
Proof: Final `git status --short`, active-plan/status scan, story-link scan,
`git diff --check`, `npm run lint`, and `npm test` when maintained behavior was
removed or changed.

Behavior: Given Quick 028 and local host state may change while earlier cleanup
slices run → the maintainer reaches the cleanup boundary → every surviving WIP
path has one active owner and canonical story, completed or abandoned residue is
absent, the backlog and seeds agree, and unrelated work has not been absorbed.

Wait for Quick 028's owner to reach a terminal boundary before reconciling its
paths. Preserve owner-delivered product behavior. Delete spent planning and host
registration only when their lifecycle no longer needs them; stop for human
judgment if ownership remains ambiguous. Record Story 1 complete, move it to the
top of Recently done, and remove this spent plan during delivery.

## Promise ownership

| Promise | Slice and proof |
| --- | --- |
| Every retained story has current external value and one home | Slice 1, backlog/seed link and direction checks |
| Completed residue is removed without losing required native evidence | Slice 2, reference scan and ADR 0005 evidence walk |
| Unused Proposed guidance, research, and decisions are absent | Slice 3, undeclared/proposed artifact scan and lint |
| Concurrent work is preserved until ownership resolves | Slice 4, final ownership inventory and clean status classification |
| The cleanup itself leaves no WIP residue | Slice 4, story completion plus spent-plan removal |
