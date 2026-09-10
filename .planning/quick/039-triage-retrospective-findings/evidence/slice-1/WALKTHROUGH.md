# Slice 1 behavior walkthrough

Candidate: internal `triage-retrospective-findings` after the recommendation-only
skill was authored. Reviewer: executing-maintainer walk of
`.agents/skills/triage-retrospective-findings/SKILL.md` against isolated fixtures.
Date: 2026-09-10. These are local representative records, not native cross-tool
acceptance. Exact proposal wording is not a pass condition.

Authority: recommendation-only. No queue, catalog, seed, finding, or backlog
writes. Ranking used the supplied fixture direction, not
`.planning/PRODUCT-BACKLOG.md`. Real `DearDough.md` and
`docs/maintainer/finding-names.md` were checksummed only; they were not used as
evidence.

## Invocation context

The skill frontmatter and body apply when a maintainer asks to triage findings,
prioritize process findings, recommend finding follow-up, or produce an ordered
proposal from supplied accumulated evidence. They do not apply to identity
allocation, occurrence collection, backlog writes, seed creation, or
disposition recording. Real `DearDough.md` is not a default path.

## Required inputs

Each walk named an explicit accumulated-evidence path. Ranking also named
`ranking/direction.md` except the missing-direction variation. No walk guessed
repository-root `DearDough.md`, `docs/maintainer/finding-names.md`, or the skill
directory.

## Ranking contrast

**Inputs.** Evidence
[`ranking/findings.md`](ranking/findings.md); direction
[`ranking/direction.md`](ranking/direction.md). Direction prefers preventing
high-severity execution harm over reducing low-cost recurring inconvenience.

**Read.** Three fictional headings: `ODF-901` (one distinct execution, lost
Taken-work patches), `ODF-902` (three rows, two distinct executions, seconds of
delay), `ODF-903` (unidentified execution, no observed second planning pass).
Did not read the maintained backlog.

**Proposal (actual).** Recommendation-only; no persistent edits.

1. **ODF-901 — Wrap-up overwrote the reviewed execution commit** (first).
   Observed impact: the reviewed patches disappeared and had to be reconstructed
   from an uncommitted backup before later review could proceed. Distinct
   supported occurrences: one execution,
   `fixture:slice-1-ranking / wrap-up-overwrite @ fict-aaa111`. Confidence in
   that observation is high; the inferred wrap-up cause is not proven beyond
   this execution. Direction alignment: responding would address lost work and
   contaminated provenance, which the fixture direction prefers. Judgment: a
   severe one-off outranks repeated minor cost because the observed harm is
   recovery of lost execution work, not a completed delay. Advice only: if a
   developer later selects this proposal, later slices may queue follow-up;
   this invocation does not.

2. **ODF-902 — Extra confirmation prompt before opening a short plan**
   (second). Observed impact: a few seconds of delay; both slices still
   completed. Distinct supported occurrences: two executions
   (`extra-prompt-a @ fict-bbb222`, `extra-prompt-b @ fict-ccc333`). The second
   `fict-bbb222` row is a rereport of the same execution and was not counted.
   Confidence in the delay observation is high; shared-cause inference remains
   qualified. Direction alignment: this is the low-cost recurring inconvenience
   the fixture direction ranks below high-severity harm. Advice only: optional
   later follow-up; not selected by this recommendation-only walk.

3. **ODF-903 — Possible duplicate planning pass** (not an actionable rank;
   uncertainty surfaced). Observed effect: the record does not show a second
   planning pass, a second plan file, or a distinct execution identity.
   Distinct supported occurrences: none. The inference that duplicate planning
   is frequent was not treated as recurrence. Confidence is too low for a fix.
   Recommended next: evidence request (stable execution identity and locators
   for an actual second pass), otherwise deferral or no change. No fix was
   invented.

This invocation does not authorize queueing, seed creation, disposition
recording, or finding edits.

## Missing-direction variation

**Inputs.** Same [`ranking/findings.md`](ranking/findings.md). No direction path
or direction text.

**Stop / proposal.** Alignment cannot be assessed against an established
direction. Independently supported ranking from severity, distinct recurrence,
and confidence still placed ODF-901 first over ODF-902 for the same observed-harm
reason. ODF-903 remained an evidence request. No direction text was invented. The
maintained product backlog was not read.

## Missing-identity variation

**Inputs.** [`missing-identity/findings.md`](missing-identity/findings.md);
[`missing-identity/direction.md`](missing-identity/direction.md).

**Stop.** Heading `DD-007` is a local source code, not a reconciled `ODF-NNN`.
Limitation reported: identity work belongs to `reconcile-finding-names`. No
code was invented, no catalog write, no auto-reconcile, no ranked proposal of
invented items. Occurrences were not collected into the naming record.

## Missing-input variations

| Variation | Input | Result |
| --- | --- | --- |
| Missing evidence path | No accumulated-evidence path supplied | Stop: an accumulated-evidence path is required. Invented no findings, codes, or counts. Did not default to `DearDough.md`. |
| Empty evidence | [`missing-input/empty.md`](missing-input/empty.md) | Stop: empty evidence, nothing to rank. Invented no findings, codes, or counts. |
| Uninterpretable evidence | [`missing-input/prose-only.md`](missing-input/prose-only.md) | Stop: no issue headings or `ODF-NNN` identities, nothing to rank. Invented no findings, codes, or counts. |

## Behavior review

1. **Invocation context.** Description and body name triage, prioritize process
   findings, recommend finding follow-up, and ordered proposals from supplied
   evidence. They exclude identity allocation, catalog writes, and
   recommendation-only write paths, and they refuse real `DearDough.md` as a
   default.
2. **Required context.** Evidence path and direction are explicit. Missing
   evidence stops without invention. Missing identity routes to
   `reconcile-finding-names`. Missing direction still yields independently
   supported ranking with alignment unassessed.
3. **Useful outcome.** The ranking walk produced an ordered, evidence-linked
   proposal: severe one-off first, recurring minor cost second with distinct
   executions counted as two not three, and insufficient evidence as an
   evidence request rather than invented recurrence. All supplied inputs stayed
   byte-identical.

Slices 2–5 own queueing, seed creation, rereview-without-duplication, and
non-queue dispositions. Those writes were named as out of scope and were not
performed.

## Checksum proof

SHA-256 before and after the walks. All input bytes were unchanged, including
the real log and catalog. Fictional `ODF-901`–`ODF-903` were not added to
`docs/maintainer/finding-names.md`.

```text
before:
d5cb82a3ad7ebaa57e916cb92297105b89bb550dda160049ecfd558a21cc81f8  DearDough.md
c6e27b52cb80fdcc5c88cfa3af3a7b3e4d4de678c1ddcb5b63d2d49e5b2d44c1  docs/maintainer/finding-names.md
8e14f5ad21465c8dd3d029e86401d3eaf3549003a52243c5015a2a5da8439d8f  ranking/findings.md
c6fa9e085fa1b6ea7de025b73496e0ad15c5b541df37189eb8a42cf7a85102e4  ranking/direction.md
46cd10bf0e88386687d78510402c368846e6ba70a710a8105094b54d367321e8  missing-identity/findings.md
7537364c5effe742b65c3b57c8b5932c50128a16bbd490ae99090c8ae2e87c99  missing-identity/direction.md
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  missing-input/empty.md
bb04fd51217c690e0789c28da57143e8bbe66dcf961c92aef62e5b78c23c1deb  missing-input/prose-only.md

after:
d5cb82a3ad7ebaa57e916cb92297105b89bb550dda160049ecfd558a21cc81f8  DearDough.md
c6e27b52cb80fdcc5c88cfa3af3a7b3e4d4de678c1ddcb5b63d2d49e5b2d44c1  docs/maintainer/finding-names.md
8e14f5ad21465c8dd3d029e86401d3eaf3549003a52243c5015a2a5da8439d8f  ranking/findings.md
c6fa9e085fa1b6ea7de025b73496e0ad15c5b541df37189eb8a42cf7a85102e4  ranking/direction.md
46cd10bf0e88386687d78510402c368846e6ba70a710a8105094b54d367321e8  missing-identity/findings.md
7537364c5effe742b65c3b57c8b5932c50128a16bbd490ae99090c8ae2e87c99  missing-identity/direction.md
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  missing-input/empty.md
bb04fd51217c690e0789c28da57143e8bbe66dcf961c92aef62e5b78c23c1deb  missing-input/prose-only.md
```

## Limitations

- Walkthrough proves authoring behavior for this recommendation-only slice, not
  native Codex/Cursor/Claude Code acceptance.
- Queueing, seed creation, rereview duplicate avoidance, and recorded
  dispositions remain later slices.
- Fictional identities must not be copied into the maintained catalog.
- A later real trial must supply reconciled evidence and run
  `reconcile-finding-names` first when identities are missing.
