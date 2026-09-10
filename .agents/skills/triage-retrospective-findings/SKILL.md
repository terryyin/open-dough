---
name: triage-retrospective-findings
description: >-
  Recommend an ordered, evidence-linked follow-up proposal for reconciled Open Dough
  process findings, and when a developer selects a proposal, record one evaluable
  story in a suitable existing seed or a newly created canonical seed, queue its
  canonical reference, and link the retained finding. Use when a maintainer asks
  to triage findings, prioritize process findings, recommend finding follow-up,
  queue a selected finding response, or turn a selected retrospective finding into
  backlog work.
---

# Triage retrospective findings

You are the maintainer agent working in the Open Dough source repository. This
skill is internal ([ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)):
it is not in the released payload and must not be added to `install.sh`. Do not
create a second procedure under `src/skills/`.

One skill, two invocation modes. Ranking is always the first step. Persistent
writes run only after the developer **selects** a proposal for queued follow-up
and supplies the write destinations below. Do not treat a ranking request as
authorization to edit.

Identity ownership stays with
[reconcile-finding-names](../reconcile-finding-names/SKILL.md). This skill does
not allocate, rename, or collect catalog identities.

## When to apply

Use when a maintainer asks to triage, prioritize, or recommend follow-up for
already recorded process findings, or to produce an ordered proposal from
supplied accumulated evidence. Use the same skill when the developer then
selects a proposal to queue into a suitable existing seed or, when none is
suitable, a newly created canonical seed.

Do not use this skill to allocate `ODF-NNN` codes, rename findings, collect or
count occurrences into a catalog, fetch other projects, or record a deferral,
evidence request, or no-change disposition without queueing. Ranking may still
*recommend* those non-queue dispositions. Do not invent those writes, and do
not add a rule that would force a second story, a new seed, or a queued item
for those choices.

Create a seed only on the selected-proposal path, and only when the supplied
canonical seed directory has no suitable existing seed. Do not create a seed
during ranking. Do not invent a seed location or ID scheme.

Do not treat real `DearDough.md` or `docs/maintainer/finding-names.md` as a
default input or write target. The evidence path must be supplied explicitly.

## Required context

Resolve ranking inputs independently before ranking. Do not guess missing
paths from this skill's directory, repository-root `DearDough.md`, or
`docs/maintainer/finding-names.md`.

1. **Accumulated evidence** — an explicitly supplied path to canonical findings
   Markdown whose issue identities are already reconciled internal codes
   (`ODF-NNN`). The file should use the same issue-heading plus occurrence-row
   shape as this project's process log: one heading per issue, occurrence rows
   as the count, observed effect separate from inference. See
   [dough-execution-retrospective](../dough-execution-retrospective/SKILL.md)
   for that shape. Stop if no evidence path was supplied.
2. **Established product direction** — a supplied backlog or direction path, or
   explicit direction text in the invocation. Do not guess
   `.planning/PRODUCT-BACKLOG.md`. If direction is missing, say that alignment
   cannot be assessed against an established direction, and still produce any
   independently supported ranking from observed severity, distinct supported
   recurrence, and confidence.

Checksum every supplied evidence file, and any supplied direction file, before
reading for ranking. Recommendation-only invocations must leave those bytes
identical. Selected-proposal writes may change only the write destinations
listed below; they still must not change the naming catalog or real
`DearDough.md` unless that path was the explicitly supplied writable finding
location.

Stop usefully when ranking input is missing or unusable:

- Missing evidence path: report that an accumulated-evidence path is required.
  Invent no findings, codes, or counts.
- Empty or uninterpretable evidence: report that there is nothing to rank.
  Invent no findings, codes, or counts.
- Finding without a reconciled internal identity (`ODF-NNN`): report that
  limitation for that finding and route the maintainer to
  [reconcile-finding-names](../reconcile-finding-names/SKILL.md). Do not invent
  codes, auto-reconcile, rename, collect occurrences, fetch other projects, or
  write the catalog. Rank any remaining findings that already have `ODF-NNN`
  identities; do not drop a usable ranking because a sibling finding is
  unidentified.
- Missing direction: continue ranking as above, with alignment marked
  unassessed.

### Write destinations (selected proposal only)

When the developer has **not** selected a proposal, stop after the proposal.
Make no queue, seed, finding, catalog, or backlog edit.

When the developer **selects** a proposal for queued follow-up, also require:

3. **Writable finding location** — an explicitly supplied path to the finding
   record that may receive the reciprocal story link and queued-follow-up
   disposition. It may be the same file as accumulated evidence. Do not guess
   `DearDough.md`. Missing writable location blocks the reciprocal-link
   contract; see [Validate before any edit](#validate-before-any-edit).
4. **Seed destination** — an existing suitable seed path, or an explicit
   **canonical seed directory**. Do not guess `.planning/seeds/`. If a suitable
   existing seed is supplied or found in that directory, reuse it (same writes
   as an existing-seed queue). If none is suitable, the canonical seed directory
   is required so a minimal seed can be created there. Resolve identity,
   filename, metadata fields, and stable-anchor conventions from files already
   in that directory, or from invocation-supplied convention.
5. **Canonical backlog path** — the backlog file to receive the canonical story
   reference. Follow
   [dough-product-backlog](../dough-product-backlog/SKILL.md). Do not invent a
   second backlog format. Do not guess `.planning/PRODUCT-BACKLOG.md`.

## Read findings

Identify each interpretable issue from the supplied evidence only.

- Treat a heading `## ODF-NNN — <title>` plus a concrete description as one
  finding. Local `DD-NNN` headings, untitled prose, or codes you would have to
  mint are not reconciled internal identities.
- **Occurrences are the count.** Count distinct supported execution identities
  among occurrence rows that identify an execution and show an observed effect.
  Repeated reports of the same execution are one occurrence. Do not add a
  stored total, and do not treat an inference of “this happens often” as
  recurrence.
- Distinguish **observed effect** (what the record shows) from **inference**
  (qualified cause, cost, or speculation). Rank from observed impact; keep
  inference visible and qualified.
- Do not import occurrence rows, counts, or execution history into the naming
  catalog.

## Rank and propose

Produce one ordered, evidence-linked proposal in the response. Explain
judgment. Use these considerations together; do not reduce them to a numeric
formula or a minimum recurrence threshold:

- **Observed severity** — harm shown in the observed effect (lost work,
  contaminated provenance, blocked closure, wasted investigation), not the
  strength of an inferred cause.
- **Distinct supported recurrence** — how many distinct executions the rows
  actually support.
- **Confidence** — whether the rows identify executions, locate evidence, and
  separate observation from speculation. Low confidence is visible; it is not
  filled in.
- **Established product direction** — whether responding would advance, ignore,
  or digress from the supplied direction. If direction is missing, say so and
  do not invent one.

A severe one-off can outrank repeated minor cost when the observed harm is
greater; say why. Recurring low-cost friction can outrank a mild one-off when
the record supports that judgment; say why. There is no required order beyond
that explained comparison.

An uncertain finding may warrant an **evidence request**, **deferral**, or **no
change**. Recommend that disposition in the proposal. Do not invent a fix,
recurrence count, or cause to make the finding actionable. Do not queue or
write those non-queue dispositions.

Keep original findings preserved during ranking. After a recommendation-only
proposal, supplied evidence (and any supplied direction file) must be
byte-identical to the pre-read checksums.

## Proposal shape

Keep the proposal readable rather than matching a template word for word.
Include, for each ranked finding:

- internal identity and title
- observed impact, distinct from inference
- distinct supported occurrence executions (identities, not a redundant total)
- confidence, including any evidence request
- direction alignment, or that alignment is unassessed
- why it sits at this position relative to its neighbors
- recommended next step as advice until the developer selects it

Surface unidentified findings, empty evidence, and other stops as limitations,
not as ranked invented items.

When this invocation is recommendation-only, state that it does not authorize
queueing, seed creation, disposition recording, or finding edits.

## Queue a selected response

Run this path only after a developer selection for **queued follow-up**. Record
the selection as queued follow-up, not problem resolution. Do not start story
refinement, slice planning, or implementation.

Use [seed-format](../dough-story-decomposition/references/seed-format.md) for
the story body and this project's stable-anchor convention: a
`<a id="kebab-case"></a>` line immediately before the story heading. Follow
[dough-product-backlog](../dough-product-backlog/SKILL.md) for the queue write
(canonical link + identity, Taken vs Backlog list, preserve unrelated order and
Near-future direction unless the developer gives a priority instruction).

### Validate before any edit

Check every destination before changing any file:

- The writable finding location was supplied, exists, and is writable. If it
  is missing, **do not create a seed, write an existing seed, or write the
  queue**. The reciprocal-link contract cannot be completed; report that concrete
  block. Prefer this pre-edit stop over a half-linked story.
- Suitability: a seed is a suitable home when its parent problem can host this
  finding's follow-up.
  - If a suitable existing seed is supplied, or found in the supplied canonical
    seed directory, reuse it. Do not allocate a new seed. A supplied seed that
    exists but is unsuitable is not reused; do not stuff unrelated work into it.
  - If no suitable seed is available, the canonical seed directory must have been
    supplied and be readable. If it is missing or unreadable, stop. Do not
    invent `.planning/seeds/` or another path. Do not claim a queued or linked
    outcome.
  - Seed conventions for a new seed are resolvable from existing `SEED-NNN`
    files in that supplied directory, or from invocation-supplied convention: ID
    pattern, next unused ID (one greater than the highest `SEED-NNN` already in
    **that supplied directory**), filename pattern, required frontmatter fields,
    title shape `# SEED-NNN: ...`, and `<a id="kebab-case"></a>` immediately
    before the story heading. If the directory is empty and no invocation
    convention was supplied, or next ID or required metadata fields cannot be
    determined, stop. Do not invent a location or ID scheme.
  - If none is suitable and conventions are resolved, create one minimal
    canonical seed in the supplied directory, then continue with the same
    linked writes as an existing-seed queue.
- Backlog conventions are identifiable (title, Near-future direction when
  present, Taken retained, Backlog list). If they are not, stop before editing.
- The selected finding has a reconciled `ODF-NNN` identity in the evidence. If
  not, route identity work to `reconcile-finding-names` and make no write.
- The story would be evaluable: a named beneficiary and an evaluable outcome
  can be stated from the selected proposal. If either is missing, stop rather
  than invoking decomposition, refinement, or slice planning to fabricate them.

A finding that already records queued or Taken follow-up is left for later
rereview; do not add a second story, queue line, or disposition.

### Create a minimal canonical seed

When no suitable existing seed is available and validation above succeeded,
create one seed file in the supplied directory:

1. Allocate the next unused `SEED-NNN` (highest already in that directory plus
   one) and a filename that matches the directory's existing pattern
   (`SEED-NNN-<kebab>.md`).
2. Write required metadata using the field names already used in that
   directory (typically `id`, `status`, `planted`, `planted_during`,
   `trigger_when`, `scope`). Map them from
   [seed-format](../dough-story-decomposition/references/seed-format.md): seed
   identity, this project's status vocabulary from existing files or invocation,
   creation date, creation context from the invocation, resurfacing trigger, and
   whole-set size. Do not invent field names or an ID scheme.
3. Title: `# SEED-NNN: <parent problem that can host this follow-up>`.
4. A short **Why This Matters** (beneficiary, current problem, desired effect).

Do not write the queued story here. Do not add sibling stories, a slice plan, or
implementation. Do not invoke story refinement or full story decomposition beyond
this minimal host.

Preserve any unrelated seeds already in the directory; do not rewrite them.

Then write the three linked records using that new seed as the story home.

### Write the three linked records

After validation succeeds (and after creating a seed when none was suitable),
write all three in one invocation. Preserve occurrences, human notes,
unrelated findings, unrelated sibling stories, unrelated seeds, unrelated queue
order, and direction text.

1. **Story in the destination seed.** In the existing suitable seed, or in the
   newly created seed, add one new story under the destination's story-section
   heading (use the directory's heading pattern; on a new seed, add that
   heading). Use the next unused local number (1 on a new seed), a kebab-case
   stable anchor, named beneficiary, and evaluable outcome. On the story,
   record the finding code and the supplied finding location. Do not copy
   occurrence rows into the seed. Do not rewrite sibling stories or, on an
   existing seed, its metadata.
2. **Canonical queue entry.** Add the story to **Backlog list** (not Taken)
   using the exact title linked to its stable anchor plus the seed ID. Leave
   details in the seed. Queueing here does not start execution.
3. **Reciprocal finding link.** On the supplied writable finding location, add a
   concise Follow-up (or the file's equivalent human-note convention) that
   links to the queued story and states that the finding is **queued, not
   resolved**. Do not add a separate status database. Do not edit
   `docs/maintainer/finding-names.md`. Preserve occurrence rows, observed
   effect, inference, unrelated human notes, and unrelated findings.

### Partial failure

If a later write fails after validation (for example the finding file cannot
be updated), report the actual outcome: which destinations were written and which
link is missing. Do not claim that all links were saved. Do not silently roll
forward as if the reciprocal contract completed.

A missing writable finding location is not a partial success: it is a
pre-edit stop, so no seed is created and the existing seed and queue remain
unchanged. Missing or unusable seed conventions are the same kind of pre-edit
stop: invent no path, and do not claim queue or finding writes complete.

## Boundaries

- Do not default to real `DearDough.md` or `docs/maintainer/finding-names.md`.
- Do not allocate, rename, or reconcile identities; route that work to
  `reconcile-finding-names`.
- Do not fetch other projects or scan unrelated logs.
- Do not treat similar symptoms as a shared cause.
- Do not count the same execution twice.
- Do not invent recurrence, codes, fixes, seed locations, ID schemes, or
  direction text.
- Do not guess `.planning/seeds/` as the canonical seed directory.
- Do not force unrelated follow-up into an unsuitable existing seed.
- Do not claim a queued, seeded, or dispositioned outcome from a
  recommendation-only invocation.
- Do not claim a fully linked outcome when the reciprocal finding update was
  blocked or failed, or when seed conventions could not be resolved.
- Do not generate a slice plan or implement the proposed fix.
- Do not invoke story refinement to fabricate a seed or story.
