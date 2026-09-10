# Slice 2 behavior walkthrough

Candidate: internal `triage-retrospective-findings` after the selected-proposal
queue path was added to the same skill. Reviewer: executing-maintainer walk of
`.agents/skills/triage-retrospective-findings/SKILL.md` against isolated fixtures.
Date: 2026-09-10. These are local representative records, not native cross-tool
acceptance. Exact prose is not a pass condition.

Authority: ranking remains recommendation-only until a developer selects a
proposal for queued follow-up. Writes used only the supplied isolated seed,
backlog, and writable finding copies. Real `DearDough.md` and
`docs/maintainer/finding-names.md` were checksummed only; they were not used as
evidence or write targets. Fictional `ODF-901` / `ODF-902` were not allocated
in the naming catalog.

## Invocation context

The skill frontmatter and body apply when a maintainer asks to triage findings,
prioritize process findings, recommend finding follow-up, queue a selected
finding response, or turn a selected retrospective finding into backlog work.
They do not apply to identity allocation, catalog writes, missing-seed
creation, or non-queue dispositions (defer / evidence request / no-change).
Real `DearDough.md` is not a default path.

## Required inputs

Ranking still requires an explicit accumulated-evidence path. The accepted
write also named:

1. accumulated evidence (reconciled identities)
2. writable finding location (same isolated file for the accepted walk)
3. existing appropriate seed `SEED-901`
4. canonical backlog path (isolated fixture, not `.planning/PRODUCT-BACKLOG.md`)
5. established direction from that backlog's Near-future direction

No walk guessed repository-root `DearDough.md`,
`docs/maintainer/finding-names.md`, or the skill directory.

## Starting snapshots

Byte-identical inputs kept under [`starting/`](starting/):

- [`starting/findings.md`](starting/findings.md) — `ODF-901` with one occurrence
  plus an unrelated maintainer note; unrelated sibling `ODF-902` with two
  distinct executions
- [`starting/seeds/SEED-901-process-follow-up.md`](starting/seeds/SEED-901-process-follow-up.md)
  — parent problem hosts execution-integrity / process-log follow-up; three
  unrelated sibling stories
- [`starting/PRODUCT-BACKLOG.md`](starting/PRODUCT-BACKLOG.md) — direction
  preferring high-severity harm prevention; one Taken sibling; two queued
  unrelated siblings

Copies under [`accepted/`](accepted/) were the only write targets for the
selected-proposal walk. Starting files were not edited.

## Accepted-proposal walk

**Selection.** Developer selected the severe finding `ODF-901` (wrap-up
overwrote the reviewed execution commit) for queued follow-up. No explicit
priority instruction; placement used the existing backlog ranking (direction
alignment first).

**Validate before any edit.** Seed exists and is writable; parent problem is an
appropriate home for this finding. Backlog conventions identifiable (direction,
Taken, Backlog list). Writable finding location supplied and writable. Selected
finding has `ODF-NNN`. Story is evaluable (named beneficiary: Open Dough
maintainer; evaluable outcome: reviewed execution commit remains reachable /
Taken-work patches not replaced). No existing queued follow-up on `ODF-901`.

**Writes (actual file results).**

1. **Story.** New story 4 in
   [`accepted/seeds/SEED-901-process-follow-up.md`](accepted/seeds/SEED-901-process-follow-up.md)
   with stable anchor `prevent-wrap-up-from-overwriting-reviewed-commits`,
   **For / why** beneficiary, **Evaluation** outcome, and **Finding** locator
   `ODF-901` in `../findings.md`. Status is queued follow-up; not refined, not
   planned, not executed. Sibling stories 1–3 and seed metadata unchanged.
2. **Queue.** Canonical Backlog list entry (not Taken):
   `[Prevent wrap-up from overwriting a reviewed execution commit](seeds/SEED-901-process-follow-up.md#prevent-wrap-up-from-overwriting-reviewed-commits) — SEED-901`
   placed first because it aligns with preventing high-severity execution
   harm. Taken line unchanged. The two unrelated queued items kept their
   relative order. Direction text unchanged.
3. **Finding.** On `ODF-901` only:
   `Follow-up: queued, not resolved.` plus the same story link. Disposition is
   queued follow-up, not resolution.

No slice plan was generated. The proposed wrap-up fix was not implemented.

## Preservation comparison

| Sentinel | Starting | Accepted |
| --- | --- | --- |
| `ODF-901` occurrence `fict-aaa111` | present | preserved |
| Unrelated maintainer note on `ODF-901` | present | preserved |
| Unrelated `ODF-902` heading, both executions, observation/inference | present | preserved |
| Taken: tighten occurrence-row labels | first Taken item | identical |
| Queued sibling order: notes-readable then useful-practice | that order | same relative order after the new first item |
| Near-future direction text | high-severity harm preferred | byte-identical |
| Seed stories 1–3 | three siblings | unchanged |

Starting snapshots remained byte-identical after both the recommendation-only
walk and the accepted write (accepted used copies).

## Missing writable finding location

**Inputs.** Same selection of `ODF-901`. Accumulated evidence:
[`starting/findings.md`](starting/findings.md) (read-only). Existing seed and
canonical backlog: copies under
[`missing-finding-location/`](missing-finding-location/). No writable finding
location supplied. Direction from that isolated backlog.

**Validate.** Reciprocal-link contract cannot complete without a writable
finding location. **Pre-edit stop:** do not write the seed or the queue.

**Report (actual).** Blocked reciprocal update: writable finding location is
required and was not supplied; guessed `DearDough.md` was not used. Seed and
queue were not claimed fully linked. Copies stayed byte-identical to
starting seed and backlog. `starting/findings.md` was not edited.

**Rule chosen.** Missing writable finding location is a pre-edit stop, not a
partial success. Prefer not writing the other destinations when the reciprocal
contract cannot be completed. If a later write failed *after* validation (not
exercised here), the report would name which destinations were written and which
link is missing, rather than claiming all links were saved.

## Recommendation-only (no selection)

**Inputs.** Slice 1 ranking fixtures reused as
[`recommendation-only/findings.md`](recommendation-only/findings.md) and
[`recommendation-only/direction.md`](recommendation-only/direction.md), checksum-
identical to
[`../slice-1/ranking/findings.md`](../slice-1/ranking/findings.md) and
[`../slice-1/ranking/direction.md`](../slice-1/ranking/direction.md).

**Proposal.** Same ranking judgment as slice 1: `ODF-901` first (severe
one-off), `ODF-902` second (two distinct executions), uncertainty as an evidence
request. No developer selection.

**Writes.** None. Ranking copies, starting snapshots, real `DearDough.md`, and
the naming catalog were not edited.

## Behavior review

1. **Invocation context.** Description and body name both ranking and selected
   queueing. They exclude identity allocation, missing-seed creation, and
   non-queue dispositions, and they refuse real `DearDough.md` as a default.
2. **Required context.** Evidence path remains explicit. Write destinations are
   explicit for accepted writes. Missing writable finding location stops before
   seed or queue edits. Unsuitable or missing seed is a stop, not invented
   creation. Selected finding without `ODF-NNN` would route to
   `reconcile-finding-names`.
3. **Useful outcome.** The accepted walk produced an evaluable story with
   finding locator, a canonical backlog reference, and a reciprocal queued
   follow-up on the finding, while preserving occurrences, unrelated notes,
   unrelated findings, sibling stories, Taken order, unrelated queue order,
   and direction text. Recommendation-only remains read-only.

Slices 3–5 still own missing-seed creation, rereview duplicate avoidance, and
non-queue dispositions. Those writes were named as out of scope and were not
performed. The pre-edit stop and “do not add a second story when follow-up
already exists” leave those later paths possible.

## Checksum proof

SHA-256 before and after the walks. Starting fixtures, recommendation-only
copies, real log, and catalog were unchanged. Accepted copies differ only by the
story, queue line, and Follow-up recorded above. Fictional `ODF-901`–`ODF-902`
were not added to `docs/maintainer/finding-names.md`.

```text
before:
d5cb82a3ad7ebaa57e916cb92297105b89bb550dda160049ecfd558a21cc81f8  DearDough.md
c6e27b52cb80fdcc5c88cfa3af3a7b3e4d4de678c1ddcb5b63d2d49e5b2d44c1  docs/maintainer/finding-names.md
27ef70c00ede8e354695fa8e64e7f0857bd79ad1f8de796ce40f9590a06e51e0  starting/findings.md
e7c8bc231a6b534a2d7abb076743706e8ce61fda3bcf6cb62c70672c039860ff  starting/PRODUCT-BACKLOG.md
9649a0a2d6cd58fbe8ac47fc13987e8e5664e5678a28ce0178250976a5ed4704  starting/seeds/SEED-901-process-follow-up.md
8e14f5ad21465c8dd3d029e86401d3eaf3549003a52243c5015a2a5da8439d8f  recommendation-only/findings.md
c6fa9e085fa1b6ea7de025b73496e0ad15c5b541df37189eb8a42cf7a85102e4  recommendation-only/direction.md
8e14f5ad21465c8dd3d029e86401d3eaf3549003a52243c5015a2a5da8439d8f  ../slice-1/ranking/findings.md
c6fa9e085fa1b6ea7de025b73496e0ad15c5b541df37189eb8a42cf7a85102e4  ../slice-1/ranking/direction.md

after:
d5cb82a3ad7ebaa57e916cb92297105b89bb550dda160049ecfd558a21cc81f8  DearDough.md
c6e27b52cb80fdcc5c88cfa3af3a7b3e4d4de678c1ddcb5b63d2d49e5b2d44c1  docs/maintainer/finding-names.md
27ef70c00ede8e354695fa8e64e7f0857bd79ad1f8de796ce40f9590a06e51e0  starting/findings.md
e7c8bc231a6b534a2d7abb076743706e8ce61fda3bcf6cb62c70672c039860ff  starting/PRODUCT-BACKLOG.md
9649a0a2d6cd58fbe8ac47fc13987e8e5664e5678a28ce0178250976a5ed4704  starting/seeds/SEED-901-process-follow-up.md
e7c8bc231a6b534a2d7abb076743706e8ce61fda3bcf6cb62c70672c039860ff  missing-finding-location/PRODUCT-BACKLOG.md
9649a0a2d6cd58fbe8ac47fc13987e8e5664e5678a28ce0178250976a5ed4704  missing-finding-location/seeds/SEED-901-process-follow-up.md
8e14f5ad21465c8dd3d029e86401d3eaf3549003a52243c5015a2a5da8439d8f  recommendation-only/findings.md
c6fa9e085fa1b6ea7de025b73496e0ad15c5b541df37189eb8a42cf7a85102e4  recommendation-only/direction.md
ba582bf65329da92a4aef83a0bfaff8abd2617b3ca27ac30a63435bc8dd04d46  accepted/findings.md
04a6ab9ffb229a9dfb210f86984da57c24b87f9a793f3ed48c1ab6ffb52110b9  accepted/PRODUCT-BACKLOG.md
39b7a47257c6c1b74098ec6127ffaae5c1d3a16e7caa99ba5d7f0b65a71ff541  accepted/seeds/SEED-901-process-follow-up.md
```

`git diff --check` from the worktree root reported no whitespace errors.

## Limitations

- Walkthrough proves authoring behavior for this selected-queue slice, not
  native Codex/Cursor/Claude Code acceptance.
- Missing-seed creation, rereview without duplication, and recorded
  non-queue dispositions remain later slices.
- Fictional identities must not be copied into the maintained catalog.
- A later real trial must supply reconciled evidence, an explicit writable finding
  location, and an existing appropriate seed; run `reconcile-finding-names`
  first when identities are missing.
