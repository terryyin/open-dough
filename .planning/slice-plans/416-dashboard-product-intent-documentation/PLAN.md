# Keep the dashboard's three-perspective design current in its maintained documents

**Source:** [Selected documentation story](../../seeds/SEED-186-dashboard-product-intent-documentation.md#document-dashboard-product-intent)
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
Status: planned
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

None affecting the plan beyond the inspected existing context above.
