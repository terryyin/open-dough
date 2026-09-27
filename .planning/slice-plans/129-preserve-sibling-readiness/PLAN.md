# Preserve readiness when an unrelated sibling story changes

## Source

**Identity:** SEED-043#preserve-sibling-readiness

[Story](../../seeds/SEED-043-preserve-relevant-readiness.md#preserve-sibling-readiness),
supported by [ODF-116](../../../docs/maintainer/finding-names.md#odf-116).

## Goal and scope

An execution coordinator starts a ready story without repeating preparation
solely because a sibling story in the same seed was prepared, edited or
closed. A story's readiness basis covers its own section, the seed's shared
context and its distinct plan; any change to those still requires
reassessment. Former whole-seed records stay interpretable without fabricated
readiness.

**Excluded** (story's deferred promises): code-drift or premise detection;
relevance analysis between sections; renewing siblings' readiness in wrap-up
or preparation writers; satisfied dependencies (ODF-120); any change to
startup authority or dashboard presentation.

**Assumptions:** every consumer reads readiness through `readStoryState`
(`product-backlog-story-state.mjs`): the `read-state`/`record-state` CLI,
execution startup (`execution-source.mjs`), and the dashboard
(`dashboard/src/storyPreparation.ts`, whose schema does not check basis
fields). Changing the basis there reaches all of them; nothing else computes
a readiness basis except test fixtures that call `computeBasis` directly.

## Current decisions

- **Story section and shared context reuse the reader's region.** The story
  section is `readHome`'s existing region (anchor to the next `<a id="` line
  or `## ` heading). The scoped content is the seed with every *other*
  anchored region that holds a `### ` story heading removed; everything else,
  including frontmatter, title and seed-level prose, is shared context.
  Story-state fences stay stripped as today. An anchorless home (whole
  document, including a plan-homed correction) removes nothing, so its digest
  equals today's.
- **One matching rule, no new record shape.** The basis keeps its `document`
  and `plan` fields, so `--expect-document`, `--expect-plan` and the
  record-preparation commands are unchanged; `read-state` returns the
  story-scoped `document` digest, and `record-state` checks the expected basis
  against it, so every fresh assessment records the scoped digest. At read
  time a recorded `document` digest matches when it equals *either* the
  current story-scoped digest or the current whole-document digest (plan
  digest compared as today). This is sound without a marker: a former
  whole-seed digest equals the current scoped digest only when the old seed
  had no siblings and only siblings were added since, and a scoped digest
  equals the current whole-document digest only when siblings were removed
  and nothing else changed. Former records therefore stay `ready` while the
  seed is unchanged and read `needs-reassessment` after any other change; no
  record is rewritten on read. Readers from older releases compare only the
  whole-document digest and so report `needs-reassessment` for a scoped
  record in a multi-story seed, which is safe.
- **Fixtures.** The five startup fixture sites that call `computeBasis`
  directly (`workspace-publication-fixtures.mjs`, the canonical-plan,
  plan-link and recovery cases) use single-story seeds, where the scoped and
  whole-document digests are equal; change them only if the entry point's
  signature changes, not to adopt a new shape.
- **Guidance.** One sentence in
  `src/skills/dough-product-backlog/references/record-preparation.md` states
  what the basis covers, so an assessing agent reviews the story section,
  shared context and plan; the `read-state` usage text and the basis module
  comment say the same. No other skill prose changes.

PFE: the region rule (`product-backlog-home-reader.mjs` `regionFor`),
fence stripping (`digestSource`) and mismatch view (`normalizeAssessmentView`)
are reused; no new Markdown grammar or parallel state. No Accepted ADR is
affected beyond ADR 0005, satisfied by justified reuse: the change is
host-neutral Node code exercised through the shared CLI and startup script,
with no host-specific discovery or wording.

## Outside-in proof

| Example | Proof |
| --- | --- |
| 1. Sibling closed | `read-state` on the first story of `twoStorySeed` stays `ready` after the second story's section is removed |
| 2. Sibling prepared | same, after the second story's text and story-state block change; at startup, appending a sibling story to the queued trunk's `seeds/A.md` after its ready record, then `execution-start.mjs start`, publishes the Taken claim |
| 3. Own section changed | existing "content change makes ready outdated" test stays green; plus an edit to the first story's **Depends on**-style line reads `needs-reassessment`; startup's existing "stale published readiness stops without a Taken claim" stays green |
| 4. Plan changed | existing plan-edit assertion stays green |
| 5. Shared context changed | editing `twoStorySeed`'s "Shared scope for both stories." reads `needs-reassessment` |
| 6. Former record | a planted ready block whose `document` is the whole-document digest reads `ready` with the seed unchanged; after a sibling edit it reads `needs-reassessment`; recording afresh with `read-state`'s digests reads `ready` and survives a further sibling edit |
| 7. Plan-homed correction | existing canonical-plan startup cases stay green |

Focused commands:
`node --test tests/support/story-state*.test.mjs` and
`node --test src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs`;
then `npm test` before delivery.

## Slices

### 1. A sibling's preparation or closure leaves a ready story startable
Type: Behavior
Status: done
Proof: examples 1–7 above, through `read-state`/`record-state` in a new focused
`tests/support/story-state-sibling-readiness.test.mjs` (example 6 plants a
block whose `document` is the whole-document digest) and one new startup case
beside "stale published readiness stops without a Taken claim" in
`workspace-publication-startup-source-cases.mjs`.

Behavior: two stories in one seed, the first recorded ready (under either the
former whole-seed or the story-scoped digest) → the sibling is refined,
edited or removed → `read-state` reports the first story `ready` for a
scoped record and startup takes it, while a former whole-seed record reads
`needs-reassessment` and a fresh assessment then records the scoped digest;
an edit to the first story's own section, shared context or plan reports
`needs-reassessment` for either record and startup refuses. Includes the
story-scoped digest, the two-digest match, fixture switches, and the guidance
and usage sentences.


Accepted proof: `node --test tests/support/story-state*.test.mjs` (18 pass;
`story-state-sibling-readiness.test.mjs` covers examples 1, 2, 3, 5, 6);
`node --test src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs`
(30 pass; "a published sibling story added after readiness still takes the
ready story" fails on the pre-change code); other importers of the home reader
and story-state (16 pass); dashboard readiness Playwright specs (10 pass).

## Learnings

- The story-scoped text drops trailing blank lines on an anchored home, so
  closing the last sibling reads the same whether or not its separating blank
  line went with it. A closure leaving uneven blank lines mid-seed still reads
  a conservative `needs-reassessment`.
- The assumption that only direct `computeBasis` fixtures were affected missed
  `dashboard/tests/storyReadinessPublications.ts`: its "assessed content
  change" appended to the seed's end, which touches only the last story. It
  now edits the shared-context sentence so every assessed story still needs
  reassessment.
- Pre-existing: `regionFor` matches the story's own anchor on a trimmed line,
  while section boundaries are detected untrimmed, so an indented sibling
  anchor would not end a section. Left unchanged.
