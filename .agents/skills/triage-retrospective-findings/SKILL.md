---
name: triage-retrospective-findings
description: Recommend an ordered, evidence-linked follow-up proposal for reconciled Open Dough process findings. Use when a maintainer asks to triage findings, prioritize process findings, recommend finding follow-up, or produce an ordered proposal from DearDough or supplied accumulated evidence.
---

# Triage retrospective findings

You are the maintainer agent working in the Open Dough source repository. This
skill is internal ([ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)):
it is not in the released payload and must not be added to `install.sh`. Do not
create a second procedure under `src/skills/`.

This invocation is **recommendation-only**. The response is the only proposal
channel. Do not edit the queue, findings, naming catalog, seeds, backlog, or
any other persistent state.

## When to apply

Use when a maintainer asks to triage, prioritize, or recommend follow-up for
already recorded process findings, or to produce an ordered proposal from
supplied accumulated evidence.

Do not use this skill to allocate `ODF-NNN` codes, rename findings, collect or
count occurrences into a catalog, fetch other projects, apply a selected
proposal to the backlog, create a seed, or record a deferral, evidence request,
or no-change disposition. Those write paths are out of scope for a
recommendation-only invocation.

Do not treat real `DearDough.md` or `docs/maintainer/finding-names.md` as a
default input. The evidence path must be supplied explicitly.

## Required context

Resolve these independently before ranking. Do not guess missing paths from this
skill's directory, repository-root `DearDough.md`, or
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
reading for ranking. After the invocation those bytes must be identical. Make
no catalog, log, or backlog write while checking.

Stop usefully when input is missing or unusable:

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
recurrence count, or cause to make the finding actionable.

Keep original findings preserved. After the proposal, supplied evidence (and
any supplied direction file) must be byte-identical to the pre-read checksums.

## Proposal shape

Chat is the only recommendation channel. Keep the proposal readable rather than
matching a template word for word. Include, for each ranked finding:

- internal identity and title
- observed impact, distinct from inference
- distinct supported occurrence executions (identities, not a redundant total)
- confidence, including any evidence request
- direction alignment, or that alignment is unassessed
- why it sits at this position relative to its neighbors
- recommended next step as advice only

Surface unidentified findings, empty evidence, and other stops as limitations,
not as ranked invented items.

State that this invocation does not authorize queueing the selected proposal,
creating a seed, recording a disposition, or editing findings. Later
maintainer skills own those writes:
[dough-product-backlog](../dough-product-backlog/SKILL.md) for canonical queue
updates, and
[seed-format](../dough-story-decomposition/references/seed-format.md) when a
story needs a canonical seed. Do not invoke those write paths here.

## Boundaries

- Do not write `DearDough.md`, supplied evidence, the naming catalog, seeds,
  or `.planning/PRODUCT-BACKLOG.md`.
- Do not default to real `DearDough.md` or `docs/maintainer/finding-names.md`.
- Do not allocate, rename, or reconcile identities; route that work to
  `reconcile-finding-names`.
- Do not fetch other projects or scan unrelated logs.
- Do not treat similar symptoms as a shared cause.
- Do not count the same execution twice.
- Do not invent recurrence, codes, fixes, or direction text.
- Do not claim a queued, seeded, or dispositioned outcome from a
  recommendation-only invocation.
