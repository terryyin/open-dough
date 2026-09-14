---
name: triage-retrospective-findings
description: >-
  Ranks reconciled Open Dough process findings with evidence-linked follow-up
  proposals. After explicit developer selection, records and queues one evaluable
  story with reciprocal finding links, or records defer, evidence-request, or
  no-change disposition. On rereview, surfaces existing queued or Taken work
  instead of duplicating it. Use to triage or prioritize findings, recommend
  follow-up, rereview linked findings, queue a selected response, defer, request
  evidence, or record no-change.
---

# Triage retrospective findings

You are the maintainer agent in the Open Dough source repository. This internal
skill stays outside the released payload and `install.sh`; keep its single procedure
here under [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md).
Follow [maintainer guidance](../../../AGENTS.md) when authoring or reviewing it.

Rank first. Persistent writes require an explicit developer choice of queued follow-up
or a non-queue disposition and that path's supplied destinations. Ranking alone authorizes
no edit. Identity allocation, renaming, reconciliation, and occurrence collection belong to
[reconcile-retrospective-findings](../reconcile-retrospective-findings/SKILL.md).
Use only supplied evidence; do not fetch other projects or scan unrelated logs.

## Required context

Require an explicitly supplied accumulated-evidence path. Never infer an input or writable
target from this skill's location, real `DearDough.md`, or `docs/maintainer/finding-names.md`.

- **Evidence:** canonical Markdown findings with reconciled `ODF-NNN` identities,
  including the catalog only when supplied. Source mappings may retain `DD-NNN`;
  source adoption is unnecessary. Use issue headings, concrete descriptions (catalog:
  **Meaning**), and occurrence rows as in [process findings](../dough-execution-retrospective/SKILL.md).
  Naming-only entries or Evidence notes can support qualified advice, but no occurrence count.
- **Direction:** supplied backlog/direction path or explicit invocation text. If absent,
  mark alignment unassessed and rank independently supported severity, recurrence, and
  confidence. Do not invent direction or guess `.planning/PRODUCT-BACKLOG.md`.

Checksum supplied evidence and direction files before reading. Ranking leaves them
byte-identical. Writes are limited to the selected path's destinations below; the catalog
or real `DearDough.md` is writable only when explicitly supplied as the finding destination.

Missing evidence path stops ranking; empty/uninterpretable evidence yields nothing to rank.
Report unidentified findings and route their identity work to reconciliation, while ranking
usable `ODF-NNN` siblings. Invent no findings, codes, counts, causes, or fixes.

### Write destinations after developer selection

Without selection, return the proposal. Selection of already queued/Taken work follows
[Rereview existing follow-up](#rereview-existing-follow-up). An explicit defer,
evidence-request, or no-change choice follows [non-queue recording](#record-a-non-queue-disposition).
For selected queued work without an existing follow-up, require:

1. An explicitly supplied, existing, writable finding record for the reciprocal link
   and disposition; it may be the evidence file.
2. A suitable existing seed path or explicit canonical seed directory. Reuse a suitable
   seed supplied or found there. Create a minimal seed only if none fits and the canonical
   directory and its conventions are supplied/resolvable; never guess `.planning/seeds/`.
3. A supplied canonical backlog path using
   [dough-product-backlog](../dough-product-backlog/SKILL.md), not a second format.

## Read findings

Identify issues only from supplied evidence:

- A `## ODF-NNN — <title>` heading plus concrete description identifies a finding.
  Local `DD-NNN`, untitled prose, and unallocated codes are not reconciled identities.
- Count distinct supported execution identities in occurrence rows with observed effects;
  qualify by source project when the catalog supplies it. Repeated reports of one execution
  count once. Neither a stored total nor inferred frequency establishes recurrence.
- Separate observed effect from qualified inference about cause, cost, or speculation.
  Similar symptoms do not establish a shared cause.
- Read Follow-up or equivalent human notes. A linked queued/Taken story is existing work
  even without a supplied backlog. If backlog is supplied, resolve its matching **Backlog
  list** or **Taken** line for a usable link. Deferred, evidence-request, and no-change
  dispositions are recorded advice/decisions, not queue items.

Do not import occurrences, counts, or execution history into the naming catalog.

## Rank and propose

Return one ordered, readable, evidence-linked proposal. Weigh observed severity, distinct
supported recurrence, evidence confidence, and established direction together. Explain
relative positions without a numeric formula or minimum recurrence threshold: severe
one-off harm can outrank repeated minor cost, and supported recurring friction can outrank
a mild one-off. Keep uncertainty visible rather than filling evidence gaps.

Recommend an evidence request, deferral, or no change when warranted; recording it still
requires explicit developer choice. For existing queued/Taken work, recommend retaining it
under the rereview rules. Verify recommendation-only evidence/direction checksums unchanged.

## Proposal shape

For each finding, include:

- internal ID/title and observed impact, separate from inference;
- distinct supported execution identities, not a redundant total;
- confidence and any evidence request;
- direction alignment or unassessed status;
- reason for its position relative to neighbors;
- recommended next step as advice pending selection;
- existing queued/Taken disposition, usable story anchor and matching queue-line link when
  supplied, and that another queued fix is unauthorized; or
- recorded non-queue disposition and rationale, identified as outside the queue.

Report unidentified/empty/unusable evidence as limitations, not invented ranked items.
For recommendation-only work, state that queueing, seed creation, disposition recording,
and finding edits remain unauthorized.

## Rereview existing follow-up

Use this path whenever ranking or selection finds queued/Taken follow-up. Both states
refer to the same linked canonical home.

1. Surface the disposition, usable seed/story anchor, and matching **Backlog list** or
   **Taken** line when supplied. Do not duplicate, rewrite, move, or delete the existing
   follow-up, story, seed, or queue entry, or start refinement, planning, or implementation.
2. Checksum the finding, seed, and backlog before reading; same-evidence rereview leaves
   them byte-identical. New observed impact or execution evidence may change proposal
   order/confidence; it authorizes neither another fix nor occurrence collection here.
   Preserve disposition and existing evidence. Count additional rows already recorded
   elsewhere normally; mention newly supplied evidence in the proposal without adding rows.
3. Reselecting already linked work for queueing makes no write. An explicit non-queue
   choice also stops and surfaces existing work unless the developer explicitly replaces
   that follow-up. Continue ordinary ranking/selected queueing for unlinked siblings.

## Record a non-queue disposition

Only an explicit developer choice of defer, seek more evidence, or retain current behavior
enters this path. Before editing, verify a supplied existing writable finding location,
its reconciled `ODF-NNN` identity, and absence of queued/Taken follow-up unless explicitly
replaced under rereview. A missing destination stops all writes, including any supplied
backlog. Missing identity routes to reconciliation.

Write one concise Follow-up or equivalent note against the finding:
`Follow-up: <deferred | evidence request | no-change>, not resolved.`
Add the developer's short rationale: why wait, what evidence to gather, or why current
behavior stands. For example: `Follow-up: evidence request, not resolved. Gather a stable
execution identity and locators for an actual second planning pass.`

Preserve identities, occurrences, observed effects, inference, unrelated notes/findings,
and any supplied backlog. Use no status database, separate procedure per choice, story,
seed, or queue item. On failure, report the disposition unrecorded; queueing is not a fallback.

## Queue a selected response

After explicit queued-follow-up selection, record queued work, not problem resolution.
Do not start decomposition, story refinement, slice planning, or implementation. Use
[seed-format](../dough-story-decomposition/references/seed-format.md) for the story and
this project's `<a id="kebab-case"></a>` immediately before its heading. Follow
[dough-product-backlog](../dough-product-backlog/SKILL.md) for canonical links/identity,
**Taken** versus **Backlog list**, unrelated order, and Near-future direction;
apply explicit developer priority instructions.

### Validate before any edit

Validate all destinations and the selected story before creating or changing any file:

- The supplied finding destination exists and is writable. Without it, the reciprocal-link
  contract is blocked: create no seed and leave the existing seed/queue unchanged.
- Reuse a supplied/found seed only when its parent problem can host this follow-up.
  If none fits, require a supplied readable canonical directory and resolvable conventions
  from its existing files or invocation: ID and filename patterns, required frontmatter,
  title `# SEED-NNN: ...`, and the stable anchor above. Next ID is one greater than the
  highest `SEED-NNN` in that directory. Empty directory without supplied conventions,
  unknown next ID, or missing metadata conventions stops the write; invent no scheme/path.
- The supplied backlog's title, Near-future direction when present, retained **Taken**,
  and **Backlog list** conventions are identifiable.
- Evidence identifies the selected `ODF-NNN`; otherwise route to reconciliation.
- The proposal supplies a named beneficiary and evaluable outcome. Missing understanding
  stops this path rather than launching discovery/refinement/planning to fabricate it.
- Existing queued/Taken follow-up uses rereview instead of this write path.

### Create a minimal canonical seed

Only after all validation, when no suitable seed exists, create one in the supplied directory:

1. Allocate the next `SEED-NNN` and match its filename pattern (`SEED-NNN-<kebab>.md`).
2. Use established metadata field names (typically `id`, `status`, `planted`,
   `planted_during`, `trigger_when`, `scope`), mapped from seed-format to identity,
   project status vocabulary, creation date, invocation context, resurfacing trigger,
   and whole-set size. Resolve vocabulary from existing files or invocation.
3. Write `# SEED-NNN: <parent problem that can host this follow-up>` and a short
   **Why This Matters** with beneficiary, current problem, and desired effect.

Leave the story for the linked writes below. Add no siblings, plan, or implementation;
preserve unrelated seeds and avoid full decomposition/refinement of this minimal host.

### Write the three linked records

After validation and any seed creation, write all three in one invocation:

1. **Story:** add one under the seed's story-section heading, matching the directory
   pattern and creating that heading on a new seed. Use next unused local number (1 on
   a new seed), stable anchor, beneficiary, and evaluable outcome. Cite the finding code
   and supplied finding location without copying occurrences. Include a completion criterion
   to update every addressed finding at its supplied writable location after delivery under
   [finding status](../../../docs/maintainer/finding-names.md#retained-evidence).
   Preserve sibling stories and existing-seed metadata.
2. **Queue:** add to **Backlog list**, using exact story title linked to its stable anchor
   plus seed ID. Keep details in the seed. Queueing does not start execution.
3. **Finding:** add Follow-up or equivalent note linking the story and stating **queued,
   not resolved** at the supplied writable location. Preserve identity, occurrences,
   effects, inference, unrelated notes/findings, seeds, queue order, and direction text.
   No separate status database is needed.

### Partial failure

If a later write fails, report each written destination and missing link; claim full linking
only when all three writes succeed. Missing writable location or unusable seed conventions
is a pre-edit stop, not partial success: create no seed or queue/finding edit.
