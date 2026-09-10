---
name: triage-retrospective-findings
description: >-
  Recommend an ordered, evidence-linked follow-up proposal for reconciled Open Dough
  process findings, and when a developer selects a proposal, record one evaluable
  story in a supplied existing seed, queue its canonical reference, and link the
  retained finding. Use when a maintainer asks to triage findings, prioritize
  process findings, recommend finding follow-up, queue a selected finding
  response, or turn a selected retrospective finding into backlog work.
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
selects a proposal to queue into an existing seed.

Do not use this skill to allocate `ODF-NNN` codes, rename findings, collect or
count occurrences into a catalog, fetch other projects, create a missing
seed, or record a deferral, evidence request, or no-change disposition without
queueing. Ranking may still *recommend* those non-queue dispositions. Do not
invent those writes, and do not add a rule that would force a second story, a
new seed, or a queued item for those choices.

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
4. **Existing appropriate seed** — an explicitly supplied seed path that already
   exists and is a suitable home for this finding's follow-up. Do not invent a
   seed or filename.
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

## Queue a selected response in an existing seed

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

- The supplied seed exists, is writable, and is an **appropriate** home for
  this finding's follow-up (the parent problem can host this response). If the
  seed is missing, stop and say that a suitable existing seed is required; do
  not invent one. If the seed exists but is unsuitable, stop and say so; do not
  stuff unrelated work into it.
- Backlog conventions are identifiable (title, Near-future direction when
  present, Taken retained, Backlog list). If they are not, stop before editing.
- The writable finding location was supplied, exists, and is writable. If it
  is missing, **do not write the seed or the queue**. The reciprocal-link
  contract cannot be completed; report that concrete block. Prefer this
  pre-edit stop over a half-linked story.
- The selected finding has a reconciled `ODF-NNN` identity in the evidence. If
  not, route identity work to `reconcile-finding-names` and make no write.
- The story would be evaluable: a named beneficiary and an evaluable outcome
  can be stated from the selected proposal. If either is missing, stop rather
  than invoking decomposition, refinement, or slice planning to fabricate them.

A finding that already records queued or Taken follow-up is left for later
rereview; do not add a second story, queue line, or disposition.

### Write the three linked records

After validation succeeds, write all three in one invocation. Preserve
occurrences, human notes, unrelated findings, unrelated sibling stories,
unrelated queue order, and direction text.

1. **Story in the existing seed.** Add one new story with the next unused local
   number, a kebab-case stable anchor, named beneficiary, and evaluable outcome.
   On the story, record the finding code and the supplied finding location. Do
   not copy occurrence rows into the seed. Do not rewrite sibling stories or
   seed metadata.
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
pre-edit stop, so seed and queue remain unchanged.

## Boundaries

- Do not default to real `DearDough.md` or `docs/maintainer/finding-names.md`.
- Do not allocate, rename, or reconcile identities; route that work to
  `reconcile-finding-names`.
- Do not fetch other projects or scan unrelated logs.
- Do not treat similar symptoms as a shared cause.
- Do not count the same execution twice.
- Do not invent recurrence, codes, fixes, seeds, or direction text.
- Do not claim a queued, seeded, or dispositioned outcome from a
  recommendation-only invocation.
- Do not claim a fully linked outcome when the reciprocal finding update was
  blocked or failed.
- Do not generate a slice plan or implement the proposed fix.
