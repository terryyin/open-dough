# Slice 5 behavior walkthrough

Candidate: internal `triage-retrospective-findings` after recording an explicit
developer deferral, evidence request, or no-change on the supplied finding was
added to the same skill. Reviewer: executing-maintainer walk of
`.agents/skills/triage-retrospective-findings/SKILL.md` against isolated fixtures.
Date: 2026-09-10. These are local representative records, not native cross-tool
acceptance. Exact prose is not a pass condition.

Authority: ranking remains recommendation-only until a developer **explicitly
chooses** queued follow-up or a non-queue disposition. These walks used isolated
finding and backlog copies. Real `DearDough.md` and
`docs/maintainer/finding-names.md` were checksummed only; they were not used as
evidence or write targets. Fictional `ODF-901` / `ODF-902` / `ODF-903` were not
allocated in the naming catalog.

Rule implemented for existing queued work: if the finding already records
queued or Taken follow-up, do not overwrite it with a non-queue disposition.
Stop, surface the existing follow-up (slice 4), and make no write unless the
developer **explicitly replaces** that follow-up. The default without that
replacement is this stop. Prefer not destroying queued work.

## Invocation context

The skill frontmatter and body apply when a maintainer asks to triage findings,
prioritize process findings, recommend finding follow-up, rereview already-linked
findings, queue a selected finding response, turn a selected retrospective
finding into backlog work, defer a finding, request more evidence, or record
no-change. They do not apply to identity allocation, catalog writes, or
occurrence collection into the findings file. Ranking may still *recommend*
deferral / evidence request / no-change; those writes run only after an
explicit developer choice. Real `DearDough.md` is not a default path.

## Required inputs

Ranking still requires an explicit accumulated-evidence path. The accepted
non-queue writes also named a writable finding location (same isolated file).
They did not require a seed destination or backlog write. Isolated backlogs
were supplied only as direction / isolation sentinels. No walk guessed
repository-root `DearDough.md`, `docs/maintainer/finding-names.md`,
`.planning/seeds/`, or the skill directory.

## Starting snapshots

Byte-identical inputs kept under [`starting/`](starting/):

- [`starting/findings.md`](starting/findings.md) — `ODF-901` (one occurrence);
  unrelated sibling `ODF-902` (two distinct executions); uncertain `ODF-903`
  (unidentified execution, no observed second planning pass) plus an unrelated
  maintainer note
- [`starting/PRODUCT-BACKLOG.md`](starting/PRODUCT-BACKLOG.md) — direction
  preferring high-severity harm prevention; one Taken sibling; two queued
  unrelated siblings; no work for `ODF-903`

Copies under [`evidence-request/`](evidence-request/), [`deferral/`](deferral/),
and [`no-change/`](no-change/) were the write targets. Starting files were not
edited. Recommendation-only used
[`recommendation-only/`](recommendation-only/) copies. Missing writable
location used [`starting/findings.md`](starting/findings.md) as read-only
evidence and
[`missing-finding-location/PRODUCT-BACKLOG.md`](missing-finding-location/PRODUCT-BACKLOG.md)
as the isolated backlog. Existing queued follow-up used
[`existing-queued/`](existing-queued/) copies of slice-4 `queued-starting/`.

## Primary walk: evidence request on uncertain `ODF-903`

**Inputs.** Accumulated evidence and writable finding location:
[`evidence-request/findings.md`](evidence-request/findings.md). Direction and
isolated backlog:
[`evidence-request/PRODUCT-BACKLOG.md`](evidence-request/PRODUCT-BACKLOG.md).
No seed destination.

**Checksum before ranking.** findings `db0ee40b…` (identical to `starting/`),
backlog `e7c8bc23…` (full hashes in Checksum proof).

**Read.** `ODF-901`: one distinct execution `fict-aaa111`; observed lost
Taken-work patches; no Follow-up. `ODF-902`: two distinct executions, no
Follow-up. `ODF-903`: unidentified execution; observed effect does not show a
second planning pass; inference of frequent duplicate planning is unsupported;
unrelated maintainer note present; no Follow-up.

**Proposal (actual).** Ranking first; then an explicit developer evidence
request.

1. **ODF-901 — Wrap-up overwrote the reviewed execution commit** (first).
   Observed impact: the reviewed patches disappeared and had to be reconstructed
   from an uncommitted backup before later review could proceed. Distinct
   supported occurrences: one execution,
   `fixture:slice-5-starting / wrap-up-overwrite @ fict-aaa111`. Confidence in
   that observation is high; the inferred wrap-up cause is not proven beyond
   this execution. Direction alignment: responding would address lost work and
   contaminated provenance, which the fixture direction prefers. Judgment: a
   severe one-off outranks repeated minor cost because the observed harm is
   recovery of lost execution work, not a completed delay. Advice only: optional
   later queued follow-up if a developer selects this finding; this walk did
   not select it.

2. **ODF-902 — Extra confirmation prompt before opening a short plan**
   (second). Observed impact: a few seconds of delay; both slices still
   completed. Distinct supported occurrences: two executions
   (`extra-prompt-a @ fict-bbb222`, `extra-prompt-b @ fict-ccc333`). Confidence
   in the delay observation is high; shared-cause inference remains qualified.
   Direction alignment: low-cost recurring inconvenience ranked below
   high-severity harm. Advice only: optional later queued follow-up; not
   selected.

3. **ODF-903 — Possible duplicate planning pass** (uncertainty surfaced).
   Observed effect: the record does not show a second planning pass, a second
   plan file, or a distinct execution identity. Distinct supported occurrences:
   none. The inference that duplicate planning is frequent was not treated as
   recurrence. Confidence is too low for a fix. Recommended next: evidence
   request (stable execution identity and locators for an actual second pass),
   otherwise deferral or no-change. No fix was invented.

This ranking does not authorize queueing, seed creation, disposition
recording, or finding edits.

**Selection.** Developer **explicitly chose** an evidence request on `ODF-903`
(uncertain cause). Rationale: gather a stable execution identity and locators
for an actual second planning pass before treating duplicate planning as a
fixable recurrence. Not a queued-follow-up selection.

**Validate.** Writable finding location supplied and writable. `ODF-903` has a
reconciled identity. No queued or Taken follow-up on `ODF-903`. Seed and
backlog writes are not required for this path.

**Write (actual).** On `ODF-903` only, using the file's Follow-up convention:

`Follow-up: evidence request, not resolved. Gather a stable execution identity and locators for an actual second planning pass before treating duplicate planning as a fixable recurrence.`

No story, seed, or queue entry. The finding heading, occurrence row, inference,
and maintainer note remain. `ODF-901` and `ODF-902` unchanged. Isolated backlog
byte-identical to `starting/PRODUCT-BACKLOG.md`. This is not problem resolution:
the finding was not deleted.

## Same concise rule: deferral and no-change

Deferral and no-change used the **same** write rule: one Follow-up line on the
supplied finding identity (`Follow-up: <disposition>, not resolved.` plus a
short rationale). They are not separate skill sections or workflows. Only the
disposition word and rationale varied. Neither walk created backlog work.

**Deferral.** Copies under [`deferral/`](deferral/). Developer explicitly chose
to **defer** `ODF-903`. Validate same as the primary walk.

Recorded line:

`Follow-up: deferred, not resolved. Wait for a later execution with a stable identity; current rows do not show a second planning pass.`

Finding, history, maintainer note, sibling findings, and isolated backlog
retained. Diff versus `starting/findings.md` is that Follow-up line only.

**No-change.** Copies under [`no-change/`](no-change/). Developer explicitly
chose to **retain current behavior** on `ODF-903`. Validate same as the primary
walk.

Recorded line:

`Follow-up: no-change, not resolved. Retain current planning behavior; the record does not show a duplicate pass to correct.`

Finding, history, maintainer note, sibling findings, and isolated backlog
retained. Diff versus `starting/findings.md` is that Follow-up line only.

## Missing writable finding location

**Inputs.** Same explicit evidence request on `ODF-903`. Accumulated evidence:
[`starting/findings.md`](starting/findings.md) (read-only). Isolated backlog:
[`missing-finding-location/PRODUCT-BACKLOG.md`](missing-finding-location/PRODUCT-BACKLOG.md).
No writable finding location supplied. Direction from that isolated backlog.

**Validate.** Writable finding location is required to record the disposition.
**Pre-edit stop:** do not write the finding, seed, or queue. Do not guess
`DearDough.md`.

**Report (actual).** Blocked disposition recording: writable finding location
is required and was not supplied. Backlog unchanged (byte-identical to
`starting/PRODUCT-BACKLOG.md`). `starting/findings.md` was not edited. No
story or queue entry was created to compensate.

## Existing queued follow-up (do not overwrite)

**Inputs.** Developer explicitly chose an evidence request on `ODF-901` in
[`existing-queued/`](existing-queued/) copies of slice-4 queued-starting.
That finding already records `Follow-up: queued, not resolved` with the story
link. Matching **Backlog list** line present.

**Validate.** Queued follow-up already exists. **Pre-edit stop** (default
without an explicit replacement instruction). Surface the existing work per
slice 4; do not replace it with a non-queue disposition.

**Writes.** None. Findings, seed, and backlog stayed byte-identical to slice-4
`queued-starting/` (`ba582bf6…` / `04a6ab9f…` / `39b7a472…`).

## Recommendation-only (no selection)

**Inputs.** [`recommendation-only/findings.md`](recommendation-only/findings.md)
and [`recommendation-only/PRODUCT-BACKLOG.md`](recommendation-only/PRODUCT-BACKLOG.md),
checksum-identical to `starting/`.

**Proposal.** Same ranking judgment as the primary walk: `ODF-901` first,
`ODF-902` second, `ODF-903` as an evidence request. No developer selection.

**Writes.** None. Ranking copies, starting snapshots, real `DearDough.md`, and
the naming catalog were not edited.

## Preservation comparison (primary walk)

| Sentinel | Starting | Evidence-request |
| --- | --- | --- |
| `ODF-903` unidentified occurrence row | present | preserved |
| Unrelated maintainer note on `ODF-903` | present | preserved |
| `ODF-903` heading and inference | present | preserved; Follow-up added, finding not removed |
| Unrelated `ODF-901` / `ODF-902` | present | preserved, no Follow-up |
| Taken: tighten occurrence-row labels | first Taken item | identical |
| Queued sibling order: notes-readable then useful-practice | that order | identical |
| Near-future direction text | high-severity harm preferred | byte-identical |

Starting snapshots remained byte-identical after ranking-only, missing-location,
and existing-queued stops (those walks used copies or read-only starting files).

## Behavior review

1. **Invocation context.** Description and body name ranking, selected
   queueing, rereview of already-linked findings, and explicit non-queue
   dispositions (defer / evidence request / no-change). They exclude identity
   allocation and occurrence collection, and they refuse real `DearDough.md` as
   a default. Ranking may still recommend those non-queue dispositions; recording
   them requires an explicit developer choice.
2. **Required context.** Evidence path remains explicit. Non-queue writes
   require a writable finding location and do not require a seed or backlog
   write. Missing writable finding location stops before any edit; the isolated
   backlog stays unchanged. Queued or Taken follow-up on the selected finding
   is a pre-edit stop unless the developer explicitly replaces it.
3. **Useful outcome.** The primary walk recorded an evidence-request Follow-up
   with decision and rationale on uncertain `ODF-903`, retained the finding and
   occurrence history, and left the isolated backlog unchanged. Deferral and
   no-change used the same Follow-up rule. Recommendation-only still wrote
   nothing. Existing queued follow-up was not overwritten.

Slices 1–4 ranking, queue, seed allocation, and rereview paths were not
rewritten as separate workflows. No status database was added.

## Checksum proof

SHA-256 before and after the walks. Starting fixtures, recommendation-only
copies, missing-location backlog, existing-queued copies, real log, and catalog
were unchanged. Disposition copies differ from `starting/findings.md` only by
the Follow-up line recorded above. Fictional `ODF-901`–`ODF-903` were not added
to `docs/maintainer/finding-names.md`.

```text
before:
d5cb82a3ad7ebaa57e916cb92297105b89bb550dda160049ecfd558a21cc81f8  DearDough.md
c6e27b52cb80fdcc5c88cfa3af3a7b3e4d4de678c1ddcb5b63d2d49e5b2d44c1  docs/maintainer/finding-names.md
db0ee40bfe8380dd59652c3dab769b6fc641a406ab090dc99219a879d588e8a5  starting/findings.md
e7c8bc231a6b534a2d7abb076743706e8ce61fda3bcf6cb62c70672c039860ff  starting/PRODUCT-BACKLOG.md
db0ee40bfe8380dd59652c3dab769b6fc641a406ab090dc99219a879d588e8a5  recommendation-only/findings.md
e7c8bc231a6b534a2d7abb076743706e8ce61fda3bcf6cb62c70672c039860ff  recommendation-only/PRODUCT-BACKLOG.md
e7c8bc231a6b534a2d7abb076743706e8ce61fda3bcf6cb62c70672c039860ff  missing-finding-location/PRODUCT-BACKLOG.md
ba582bf65329da92a4aef83a0bfaff8abd2617b3ca27ac30a63435bc8dd04d46  existing-queued/findings.md
04a6ab9ffb229a9dfb210f86984da57c24b87f9a793f3ed48c1ab6ffb52110b9  existing-queued/PRODUCT-BACKLOG.md
39b7a47257c6c1b74098ec6127ffaae5c1d3a16e7caa99ba5d7f0b65a71ff541  existing-queued/seeds/SEED-901-process-follow-up.md
ba582bf65329da92a4aef83a0bfaff8abd2617b3ca27ac30a63435bc8dd04d46  ../slice-4/queued-starting/findings.md
04a6ab9ffb229a9dfb210f86984da57c24b87f9a793f3ed48c1ab6ffb52110b9  ../slice-4/queued-starting/PRODUCT-BACKLOG.md
39b7a47257c6c1b74098ec6127ffaae5c1d3a16e7caa99ba5d7f0b65a71ff541  ../slice-4/queued-starting/seeds/SEED-901-process-follow-up.md

after:
d5cb82a3ad7ebaa57e916cb92297105b89bb550dda160049ecfd558a21cc81f8  DearDough.md
c6e27b52cb80fdcc5c88cfa3af3a7b3e4d4de678c1ddcb5b63d2d49e5b2d44c1  docs/maintainer/finding-names.md
db0ee40bfe8380dd59652c3dab769b6fc641a406ab090dc99219a879d588e8a5  starting/findings.md
e7c8bc231a6b534a2d7abb076743706e8ce61fda3bcf6cb62c70672c039860ff  starting/PRODUCT-BACKLOG.md
890b30047943a5e4df1917a9d48e406e0c534319ba83339c1d3e9833a3d97abe  evidence-request/findings.md
e7c8bc231a6b534a2d7abb076743706e8ce61fda3bcf6cb62c70672c039860ff  evidence-request/PRODUCT-BACKLOG.md
1abc3f05f1a19c7a0e2b89ddbe5e9e275002b04ea5d63c88f5613569a763cf86  deferral/findings.md
e7c8bc231a6b534a2d7abb076743706e8ce61fda3bcf6cb62c70672c039860ff  deferral/PRODUCT-BACKLOG.md
ad0a925d3985773195cbda0a5b30b6d02667920b03032450c23936a53e4d57d6  no-change/findings.md
e7c8bc231a6b534a2d7abb076743706e8ce61fda3bcf6cb62c70672c039860ff  no-change/PRODUCT-BACKLOG.md
db0ee40bfe8380dd59652c3dab769b6fc641a406ab090dc99219a879d588e8a5  recommendation-only/findings.md
e7c8bc231a6b534a2d7abb076743706e8ce61fda3bcf6cb62c70672c039860ff  recommendation-only/PRODUCT-BACKLOG.md
e7c8bc231a6b534a2d7abb076743706e8ce61fda3bcf6cb62c70672c039860ff  missing-finding-location/PRODUCT-BACKLOG.md
ba582bf65329da92a4aef83a0bfaff8abd2617b3ca27ac30a63435bc8dd04d46  existing-queued/findings.md
04a6ab9ffb229a9dfb210f86984da57c24b87f9a793f3ed48c1ab6ffb52110b9  existing-queued/PRODUCT-BACKLOG.md
39b7a47257c6c1b74098ec6127ffaae5c1d3a16e7caa99ba5d7f0b65a71ff541  existing-queued/seeds/SEED-901-process-follow-up.md
```

`git diff --check` from the worktree root reported no whitespace errors.

## Limitations

- Walkthrough proves authoring behavior for this non-queue disposition slice,
  not native Codex/Cursor/Claude Code acceptance.
- Fictional identities must not be copied into the maintained catalog.
- A later real trial must supply reconciled evidence at an explicit writable
  finding location; run `reconcile-finding-names` first when identities are
  missing.
