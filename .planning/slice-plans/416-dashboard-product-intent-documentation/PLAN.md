# Keep the dashboard's three-perspective design current in its maintained documents

**Source:** [Selected documentation story](../../seeds/SEED-186-dashboard-product-intent-documentation.md#document-dashboard-product-intent)
**Source review:** [Independent original-source commitments](source-review.md)
**Identity:** SEED-186#document-dashboard-product-intent

## Goal and scope

Give Terry and general-purpose agents one coherent, current account of the
dashboard's three perspectives and the enduring intended-behavior direction,
with purpose/proof and unresolved decisions clearly distinguished.

Update the four existing homes named in the source: project visibility and
state requirements, ADR 0001, ADR 0008, and the dashboard UX/UI North Star.
The source holds all substantive discussion context, required understanding,
boundaries, and examples; neither chat history nor a recovery artifact is
required. Replace overlapping or stale direction rather than adding revision
history. The requirements own details, ADR 0001 shared vocabulary, ADR 0008
cross-task architectural implications, and the North Star current UX framing.

**Exclusions:** Application or skill changes; another perspective's
implementation; final terminology selection; new proof schema or collection;
new UX/UI decisions; new ADR lifecycle decisions; a general documentation
audit. Existing state authority and implemented story behavior stay intact.
No implementation is authorized by this planning session.

## Existing context and preparation observations

Inspected in the prepared checkout at
`e46170ee1d19e03290ff7cbcbf68932bcc5cb20c`:

- `docs/project-visibility-requirements.md`, especially Three perspectives,
  Initial scope, Board and zoom, and the questions retained for later design;
  it is already the detailed owner and still frames later perspectives using
  Feature terminology.
- `docs/adrs/README.md` and Accepted ADRs 0000, 0001, 0002, and 0008: the
  detailed requirements/shared vocabulary/architecture split already exists.
  ADR 0008 defines Feature and the independent relationships; ADR 0001 points
  to it and already distinguishes enduring product knowledge from stories.
- `docs/dashboard-ux-ui-north-star.md`, especially Authority and scope and
  its early-story wording. Its current interactions and evidence distinctions
  can be retained while its perspective framing is updated.
- `.planning/NORTH-STAR.md`: existing short-term implementation direction
  exists. This story needs no new architectural implementation topic there.

PFE outcome: change the existing four owners and link their responsibilities;
reuse their domain and authority distinctions. A separate vision document,
intent catalog, or copied glossary would add competing representations.
No implementation responsibility or source-of-state change is needed.

Identity evidence reports the next seed as SEED-186 and this full candidate as
unlisted. Its one metadata gap, SEED-184 lacking frontmatter, was resolved for
allocation by reading that file and its adding commit `dda970fc`: both record
the sole identity SEED-184#recover-completed-review-agent, below the evidenced
maximum SEED-185. That existing record was not edited. Publication review found
that another story had since allocated plan 415 on fetched trunk. This
unpublished plan therefore uses 416, which was unoccupied when rechecked.

## Outside-in proof and ownership

The changed surface is maintained documentation consumed by Terry and agents.
One cross-document reading and diff review is the proportionate proof boundary;
no application behavior changes or new automated tests are needed.

| Source promise | Owning slice | Observable proof |
| --- | --- | --- |
| Detailed current understanding, enduring/current meaning, purpose/proof, and current-account writing | 1 | Walk key examples 1, 2, 3, and 6 using the updated requirements; locate each explanation and confirm no design log or competing definition is required. |
| Shared concepts and cross-task implications in the correct ADR homes | 1 | Walk example 4 from ADR 0001 through ADR 0008 to requirements; check authority, relationships, provisionally named concepts, and preservation of unrelated decisions. |
| UX guidance aligned without new design decisions | 1 | Walk example 5 and review the aggregate diff for new tabs, layouts, interactions, mandatory proof fields, or claims that new perspectives are implemented. |
| All four homes coherent and navigable | 1 | Check local Markdown links/anchors affected by the edits, compare overlapping definitions, and run `git diff --check`. |
| Documentation-only, later execution authority | 1 | Inspect the final changed-file list; preparation has not changed target documents or begun the slice, and execution changes only documentation and its normal planning records. |

At execution, record the locations read, each example's observed result,
literal focused commands and their results in this plan. A passing whitespace
check alone does not prove the conceptual promises. Reuse existing focused
documentation checks if applicable; do not run application or installation
suites solely because these four documents changed. Hosted CI retains its
normal workflow.

## Ordered slices

### 1. A fresh reader understands the current three-perspective direction without the conversation

Type: Behavior
Status: done
Proof: all source key examples and the ownership table above, affected
link/anchor checks, and `git diff --check`.

Behavior: the source's complete context and the existing four document homes
are available → an authorized execution reconciles them → Terry or an agent
can explain the current product direction, intended-behavior meaning,
purpose/proof, cross-task implications, and remaining choices by reading the
maintained documents alone, without newly prescribed UX/UI or runtime changes.

Changes:

1. Read the four current documents and their linked authority before editing;
   reconcile intervening work with the source rather than replacing unrelated
   content from the preparation snapshot.
2. Update the requirements as the detailed current account. Cover every item
   under Required understanding in the source, distinguish present capability
   from later direction, and remove obsolete implicated framing and design
   history. Keep terminology and proof-metric choices explicitly open.
3. Add only the shared concept distinctions needed in ADR 0001 and the
   cross-task domain/architectural implications needed in ADR 0008. Use the
   user's document-update direction and their existing scopes; retain statuses,
   state authority, and human-owned decisions. Link details rather than copying
   a second requirements model.
4. Bring the UX/UI North Star's framing and references into agreement. Retain
   applicable existing story interactions and revisable hypotheses. Record the
   deferred new-perspective UX question without selecting a presentation.
5. Review the four files together against the source examples and exclusions,
   repair directly affected references, and retain one aggregate reviewable
   documentation result for Terry under the authorized execution workflow.

This is one cohesive slice: splitting by file would expose competing concept
definitions before the cross-document explanation is complete. There is one
proof loop and no new application architecture to establish.

## Execution complete

Product advice: no change. Retrospective found no supported correction or new
backlog recommendation; original six examples and architectural boundaries hold.
Process occurrences recorded under ODF-264 and DD-369 in DearDough.md. The log
is 703 lines; its 500-line threshold warning remains a maintenance reminder.
Implementation published as `85e1d6caeca4b573fb7daae6ae0c67dc378bcd2a` on the
recorded origin execution branch, with suffix base `cba3aa43858318729018af6ab75f13a98e63c13a`.

## Current decisions

- One documentation story, one slice; leave execution to a separate instruction.
- The requirements document is the detailed owner, not this temporary plan.
- Product intent is an explanatory working term. Recording the meaning does
  not require finalizing that name or renaming the product/code vocabulary.
- Purpose/proof distinguishes adopted intended behavior and supporting
  verification; candidate metadata stays exploratory and no storage contract
  or universal-correctness claim is introduced.
- The source's explicit deferred choices are documentation outputs, not human
  decisions required to start this bounded update. An actual new conflict with
  a current Accepted ADR or an unsupported product decision still stays with
  Terry under the project's existing process.
- New UX/UI is the next discussion and remains outside this slice.

## Plan review and concerns

Slice-plan refinement was not needed: a single bounded reading outcome owns
all four documents and every source promise; no independent file-level slices
or speculative structure remain. No remaining slice-specific concern was
identified in this preparation. The inspected document homes and authority
support this approach; no technical probe is necessary.

## Learnings

The North Star's linked design-review criteria still deferred Recently done
and instructed against maintained completion records. Consumer inspection found
that this directly contradicted the delivered story perspective and ADR 0008's
repository-owned done records. The source authorizes directly implicated
documentation consistency fixes, so slice 1 also corrects that narrow companion
without adding UX decisions or broadening into a documentation audit.

## Story obligations

### G1. Linked review criteria retain obsolete delivered-scope restrictions
Reported: slice 1 — "Implementation consumer inspection found docs/dashboard-design-review.md still deferring a recently finished stories view and preferring Git history over a maintained completion list; coordinator confirmed these active criteria conflict with the current dashboard and ADR 0008."
Story clause: "Necessary links and directly implicated documentation consistency fixes belong to this outcome"
Disposition: proved by slice 1: `docs/dashboard-design-review.md#focused-review-and-revision` now preserves Recently done and repository done records, links current dashboard and requirements, and retains evidence/accessibility examples; coordinator inspected its entry from the North Star and aggregate diff. `python3 /tmp/seed186-check-links.py` passes all 111 affected local links/anchors.

## Execution context

- Authorized execution: 2026-10-30, SEED-186#document-dashboard-product-intent;
  Story Branch Mode, publisher `dashboard-territory.local-open-dough`, agent
  `ruuf-chan`. In-scope planning authority is retained; no numeric slice budget
  or exception is configured. One cohesive documentation proof loop applies.
- Originating and execution checkout (established, reused):
  `/Users/terryyin/git/open-dough/.worktrees/understand-the-dashboard-s-three-perspectives-an`,
  branch `codex/understand-the-dashboard-s-three-perspectives-an`.
  Optional integration/default checkout: `/Users/terryyin/git/open-dough`.
  Authorized integration target: `origin`, `refs/heads/main`;
  increments publish to the named execution branch.
- Starting revision: `f62aea18f818fff2a51a4bde33ae374cb533fd51`.
  Established accepted claim and first increment base:
  `cba3aa43858318729018af6ab75f13a98e63c13a` on `origin/main`.
  No second claim was made. Claim CI is unobserved by this coordinator.
- Checkout setup: `npm ci` passed with unchanged `package-lock.json`;
  `npm exec -- prettier --check package.json` passed. Runtime is the
  same-checkout `.agents/skills/dough-execute-plan` installation. The
  `.githooks/pre-commit` hook checks staged lint and only typechecks when
  script files are staged; selective formatting is `npm run format`.
- CI: GitHub Actions `terryyin/open-dough`, verified workflow `ci.yml` (`CI`),
  observing `codex/understand-the-dashboard-s-three-perspectives-an`.
  Coordinator `seed186-ruuf-chan`, directory `/tmp/dough-ci-501/watch-S3Vh5X`,
  PID `56334`, stream session `8876`, yielded cell `10`; checkout as above.
  Documentation and planning paths are ignored by the workflow; the observer
  determines the applicable validation basis.
- Slice 1 delegated to `/root/document_intent`; source-only commitments
  independently requested from `/root/source_commitments` with no inherited
  conversation and only the selected seed as input.


## Accepted slice 1 proof

Implementation returned from `/root/document_intent` with five uncommitted
product documents; all writers idle. Setup: none for documentation reading.
Boundary: maintained documents consumed by Terry and general-purpose agents.
The coordinator compared the unchanged source, independent source-only return,
plan, actual document text and aggregate diff. Per-commitment observations and
all six trigger/journey examples are retained in `source-review.md`.

- Examples 1 and 2: requirements `Three perspectives`, `Intended-behavior
  perspective`, and `Purpose and proof` explain all three dimensions, current
  enduring meaning, cleanup, intentional revision, and regression.
- Example 3: `Interpreting verification evidence` distinguishes an old pass,
  absent results, evidence limits, and check runtime from product performance.
- Example 4: ADR 0001 `Dashboard product concepts` leads through ADR 0008's
  relationships and state authority to requirements; terminology stays open.
- Example 5: North Star `Authority and scope` preserves delivered story/local
  session behavior and leaves additional-perspective UX unselected.
- Example 6: aggregate five-document review establishes coherent current
  understanding and owner links. G1's directly linked inconsistency is fixed.
- `python3 /tmp/seed186-check-links.py`: pass, 111 affected local links/anchors,
  including 30 inbound. The temporary script inspects local Markdown targets
  and generated/explicit heading anchors; no network or application behavior.
- `git diff --check`: pass. `git diff --name-only` and
  `git diff --stat -- docs/`: only the five documented product files plus
  coordinator-owned execution records. No application/installation suite is
  applicable; no generator trigger changed.
- Consumer trace command:
  `node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout /Users/terryyin/git/open-dough/.worktrees/understand-the-dashboard-s-three-perspectives-an --base cba3aa43858318729018af6ab75f13a98e63c13a --term 'Feature perspective' --term 'product intent' --term 'first Board' --term 'local evidence come later' --term 'recently finished stories view' > /tmp/seed186-consumer-trace.md`.
  The complete dispositions are `/tmp/seed186-consumer-dispositions.md`;
  the five-owned-path trace/dispositions are
  `/tmp/seed186-owned-consumer-trace.md` and
  `/tmp/seed186-owned-consumer-dispositions.md` (33 consumers).
  Linked documentation received consistency/authority and anchor inspection.
  Source-navigation tests assert unchanged URL/path/#decision resolution rather
  than prose; coordinator inspected their assertions and fixture. Historical
  fixtures and generic substring matches do not consume changed semantics.
  No runtime product consumer is affected. No uncovered promise remains.

Independent refactor `/root/refactor_docs` returned `## REFACTOR COMPLETE`.
Only repeated prose in requirements and ADR 0008 was removed; coordinator read
`/tmp/seed186-refactor-only.diff`. All headings, links, authority and semantic
proof remain applicable. `git diff --check` passed; no runtime tests were needed.
Its 19 consumer dispositions are in `/tmp/seed186-refactor-consumer-dispositions.md`.
Source freshness: unchanged at trunk `cba3aa43858318729018af6ab75f13a98e63c13a`.
Story obligations check: pass, 1 proved obligation and 225 observed commitments.

## Human closure disposition

Terry directed: "ok. wrap up and I will ask another agent to fix it."
This authorizes closing the documentation story despite known CI run
41009881980 attempt 1 failing at `338e63af98ed972eb4de5badc1730e64ea3fc4fb`.
`dashboard (1/12)` exhausted the 30-second test budget in
`dashboard/tests/agent-launch-story-card-sessions.spec.ts:59` at step 191.
The runtime/test was unchanged; repair is Terry's separate-agent follow-up.
No repair or passing CI verdict is claimed. Observer `/tmp/dough-ci-501/watch-S3Vh5X`
was stopped with no unread events and its PID exited. Documentation proof and
retrospective remain accepted. DearDough's 703-line maintenance warning was reported.
All lasting meaning is in the five maintained docs; no North Star topic is spent.
