# Slice 3 behavior walkthrough

Candidate: internal `triage-retrospective-findings` after the no-suitable-seed
host path was added to the same skill. Reviewer: executing-maintainer walk of
`.agents/skills/triage-retrospective-findings/SKILL.md` against isolated fixtures.
Date: 2026-09-10. These are local representative records, not native cross-tool
acceptance. Exact prose is not a pass condition.

Authority: ranking remains recommendation-only until a developer selects a
proposal for queued follow-up. Writes used only the supplied isolated seed
directory, backlog, and writable finding copies. Real `DearDough.md` and
`docs/maintainer/finding-names.md` were checksummed only; they were not used as
evidence or write targets. Real `.planning/seeds/` was not supplied and was not
used for ID allocation. Fictional `ODF-901` / `ODF-902` were not allocated in the
naming catalog.

## Invocation context

The skill frontmatter and body apply when a maintainer asks to triage findings,
prioritize process findings, recommend finding follow-up, queue a selected
finding response, or turn a selected retrospective finding into backlog work
in a suitable existing seed or a newly created canonical seed. They do not apply
to identity allocation, catalog writes, or non-queue dispositions (defer /
evidence request / no-change). Seed creation is allowed only after selection,
and only when the supplied canonical seed directory has no suitable existing
seed. Real `DearDough.md` is not a default path.

## Required inputs

Ranking still requires an explicit accumulated-evidence path. The accepted
absent-seed write also named:

1. accumulated evidence (reconciled identities)
2. writable finding location (same isolated file for the accepted walk)
3. canonical seed directory (isolated `accepted/seeds/`, not `.planning/seeds/`)
4. canonical backlog path (isolated fixture, not `.planning/PRODUCT-BACKLOG.md`)
5. established direction from that backlog's Near-future direction

No walk guessed repository-root `DearDough.md`,
`docs/maintainer/finding-names.md`, `.planning/seeds/`, or the skill directory.

## Starting snapshots

Byte-identical inputs kept under [`starting/`](starting/):

- [`starting/findings.md`](starting/findings.md) — `ODF-901` with one occurrence
  plus an unrelated maintainer note; unrelated sibling `ODF-902` with two
  distinct executions
- [`starting/seeds/SEED-901-workshop-notes.md`](starting/seeds/SEED-901-workshop-notes.md)
  — parent problem hosts classroom-workshop documentation; cannot host wrap-up
  overwrite follow-up; three unrelated sibling stories
- [`starting/PRODUCT-BACKLOG.md`](starting/PRODUCT-BACKLOG.md) — direction
  preferring high-severity harm prevention; one Taken sibling; two queued
  unrelated siblings

Copies under [`accepted/`](accepted/) were the only write targets for the
absent-seed walk. Starting files were not edited.

Reuse and stop walks used their own copies under
[`reuse-existing/`](reuse-existing/), [`missing-conventions/`](missing-conventions/),
and [`missing-finding-location/`](missing-finding-location/).

## Absent-seed accepted walk

**Selection.** Developer selected the severe finding `ODF-901` (wrap-up
overwrote the reviewed execution commit) for queued follow-up. No explicit
priority instruction; placement used the existing backlog ranking (direction
alignment first).

**Ranking (first).** Same judgment as earlier slices: `ODF-901` first (severe
one-off, lost Taken-work patches), `ODF-902` second (two distinct executions,
seconds of delay). Ranking alone authorized no writes.

**Validate before any edit.** Writable finding location supplied and writable.
Canonical seed directory supplied and readable. Conventions from the only
existing file in that directory (`SEED-901`): ID pattern `SEED-NNN`, next
unused ID `SEED-902` (highest in the **supplied** directory plus one; real
`.planning/seeds/` was not consulted), filename `SEED-NNN-<kebab>.md`,
frontmatter `id` / `status` / `planted` / `planted_during` / `trigger_when` /
`scope`, title `# SEED-NNN: ...`, story-section heading `Stories`,
`<a id="kebab-case"></a>` immediately before `### N. Title`, status vocabulary
`active`. `SEED-901` parent problem (keep classroom workshop notes out of the
product queue) cannot host wrap-up overwrite follow-up — unsuitable; do not write
into it. None suitable → create. Backlog conventions identifiable. Selected
finding has `ODF-NNN`. Story is evaluable (named beneficiary: Open Dough
maintainer; evaluable outcome: reviewed execution commit remains reachable /
Taken-work patches not replaced). No existing queued follow-up on `ODF-901`.

**Writes (actual file results).**

1. **New seed.** Allocated
   [`accepted/seeds/SEED-902-protect-reviewed-execution-commits.md`](accepted/seeds/SEED-902-protect-reviewed-execution-commits.md)
   with required metadata `id: SEED-902`, `status: active`, `planted: 2026-09-10`,
   `planted_during: Quick 039 slice-3 walkthrough (fictional)`, `trigger_when`
   for execution-integrity wrap-up follow-up, `scope: small`. Parent problem:
   protect reviewed execution commits during wrap-up. One story (local number
   1) with stable anchor `prevent-wrap-up-from-overwriting-reviewed-commits`,
   **For / why** beneficiary, **Evaluation** outcome, and **Finding** locator
   `ODF-901` in `../findings.md`. Status is queued follow-up; not refined, not
   planned, not executed. Unrelated `SEED-901` left byte-identical.
2. **Queue.** Canonical Backlog list entry (not Taken):
   `[Prevent wrap-up from overwriting a reviewed execution commit](seeds/SEED-902-protect-reviewed-execution-commits.md#prevent-wrap-up-from-overwriting-reviewed-commits) — SEED-902`
   placed first because it aligns with preventing high-severity execution
   harm. Taken line unchanged. The two unrelated queued items kept their
   relative order. Direction text unchanged.
3. **Finding.** On `ODF-901` only:
   `Follow-up: queued, not resolved.` plus the same story link. Disposition is
   queued follow-up, not resolution.

No slice plan was generated. Story refinement was not invoked. The proposed
wrap-up fix was not implemented.

## Preservation comparison (absent-seed)

| Sentinel | Starting | Accepted |
| --- | --- | --- |
| `ODF-901` occurrence `fict-aaa111` | present | preserved |
| Unrelated maintainer note on `ODF-901` | present | preserved |
| Unrelated `ODF-902` heading, both executions, observation/inference | present | preserved |
| Taken: list omitted internal skills | first Taken item | identical |
| Queued sibling order: workshop notes then useful-practice | that order | same relative order after the new first item |
| Near-future direction text | high-severity harm preferred | byte-identical |
| Unsuitable `SEED-901` stories 1–3 and metadata | workshop-notes seed | unchanged |

Starting snapshots remained byte-identical after the accepted write (accepted
used copies).

## Reuse existing suitable seed

**Inputs.** Same selection of `ODF-901`. Canonical seed directory:
[`reuse-existing/accepted/seeds/`](reuse-existing/accepted/seeds/) (working
copy of [`reuse-existing/starting/`](reuse-existing/starting/), itself a copy of
[`../slice-2/starting/`](../slice-2/starting/)). That directory already contains
suitable [`SEED-901-process-follow-up.md`](reuse-existing/starting/seeds/SEED-901-process-follow-up.md)
(parent problem hosts execution-integrity / process-log follow-up). Writable
finding location and backlog: copies under
[`reuse-existing/accepted/`](reuse-existing/accepted/).

**Validate.** Suitable existing seed found. Do not allocate a new seed.

**Writes (actual).** Slice 2 behavior: story 4 with the same stable anchor in
`SEED-901`, canonical Backlog list entry to that story, reciprocal
`Follow-up: queued, not resolved` on `ODF-901`. No `SEED-902` file was created
in the reuse directory. Accepted copies are checksum-identical to
[`../slice-2/accepted/`](../slice-2/accepted/). Reuse starting snapshots remained
byte-identical to slice 2 starting.

## Missing seed conventions

**Inputs.** Same selection of `ODF-901`. Accumulated evidence and writable finding
location: [`missing-conventions/findings.md`](missing-conventions/findings.md).
Canonical backlog: [`missing-conventions/PRODUCT-BACKLOG.md`](missing-conventions/PRODUCT-BACKLOG.md).
No canonical seed directory supplied. A second variation named an empty
`missing-conventions/empty-seeds/` directory with no invocation-supplied
convention (no existing `SEED-NNN` files, so next ID and required metadata
fields cannot be determined). `.planning/seeds/` was not guessed.

**Validate.** Seed destination cannot be resolved. **Pre-edit stop:** invent no
path or ID scheme; do not claim queue or finding writes complete.

**Report (actual).** Blocked: a canonical seed directory with resolvable
conventions (or a suitable existing seed) is required and was not supplied.
Guessed `.planning/seeds/` was not used. Copies stayed byte-identical to the
starting findings and backlog. The empty directory stayed empty. No `SEED-902`
was created.

## Missing writable finding location

**Inputs.** Same selection of `ODF-901`. Accumulated evidence:
[`starting/findings.md`](starting/findings.md) (read-only). Canonical seed
directory and backlog: copies under
[`missing-finding-location/`](missing-finding-location/). No writable finding
location supplied.

**Validate.** Reciprocal-link contract cannot complete without a writable
finding location. **Pre-edit stop:** do not create a seed or write the queue.

**Report (actual).** Blocked reciprocal update: writable finding location is
required and was not supplied; guessed `DearDough.md` was not used. Seed
directory still contains only unsuitable `SEED-901`. No `SEED-902` was
created. Copies stayed byte-identical to starting seed and backlog.
`starting/findings.md` was not edited.

## Behavior review

1. **Invocation context.** Description and body name ranking, existing-seed
   queueing, and creating a minimal canonical seed when none is suitable. They
   exclude identity allocation and non-queue dispositions, refuse real
   `DearDough.md` as a default, and refuse guessing `.planning/seeds/`.
2. **Required context.** Evidence path remains explicit. Write destinations are
   explicit for accepted writes. Missing writable finding location stops before
   seed creation or queue edits. Missing or unusable seed conventions stop
   without inventing a location or ID. An unsuitable existing seed is not reused.
3. **Useful outcome.** The absent-seed walk produced a newly allocated evaluable
   seed/story with finding locator, a canonical backlog reference, and a
   reciprocal queued follow-up on the finding, while preserving occurrences,
   unrelated notes, unrelated findings, the unsuitable seed, Taken order,
   unrelated queue order, and direction text. When a suitable seed already
   existed, the same selection reused it and did not allocate a new ID. No
   slice plan or implementation was generated.

Slices 4–5 still own rereview duplicate avoidance and non-queue dispositions.
Those writes were named as out of scope and were not performed.

## Checksum proof

SHA-256 before and after the walks. Starting fixtures, reuse starting copies,
stop-walk copies, real log, and catalog were unchanged. Accepted copies differ
only by the new seed, queue line, and Follow-up recorded above. Reuse accepted
copies match slice 2 accepted. Fictional `ODF-901`–`ODF-902` were not added to
`docs/maintainer/finding-names.md`.

```text
before:
d5cb82a3ad7ebaa57e916cb92297105b89bb550dda160049ecfd558a21cc81f8  DearDough.md
c6e27b52cb80fdcc5c88cfa3af3a7b3e4d4de678c1ddcb5b63d2d49e5b2d44c1  docs/maintainer/finding-names.md
a24019906ed9a0f01596edf9342af3f2928777c63e71ed4fac45e24005ba1445  starting/findings.md
dbf6415c485d49a69181533cd2938bb6e47f872edcc0f884e6e45b633a37f5ad  starting/PRODUCT-BACKLOG.md
53d9868e723d5d4f466f7a220f5e4e1de93586358f52f4143b531f30bcbeea69  starting/seeds/SEED-901-workshop-notes.md
27ef70c00ede8e354695fa8e64e7f0857bd79ad1f8de796ce40f9590a06e51e0  reuse-existing/starting/findings.md
e7c8bc231a6b534a2d7abb076743706e8ce61fda3bcf6cb62c70672c039860ff  reuse-existing/starting/PRODUCT-BACKLOG.md
9649a0a2d6cd58fbe8ac47fc13987e8e5664e5678a28ce0178250976a5ed4704  reuse-existing/starting/seeds/SEED-901-process-follow-up.md
a24019906ed9a0f01596edf9342af3f2928777c63e71ed4fac45e24005ba1445  missing-finding-location/findings.md
dbf6415c485d49a69181533cd2938bb6e47f872edcc0f884e6e45b633a37f5ad  missing-finding-location/PRODUCT-BACKLOG.md
53d9868e723d5d4f466f7a220f5e4e1de93586358f52f4143b531f30bcbeea69  missing-finding-location/seeds/SEED-901-workshop-notes.md
a24019906ed9a0f01596edf9342af3f2928777c63e71ed4fac45e24005ba1445  missing-conventions/findings.md
dbf6415c485d49a69181533cd2938bb6e47f872edcc0f884e6e45b633a37f5ad  missing-conventions/PRODUCT-BACKLOG.md

after:
d5cb82a3ad7ebaa57e916cb92297105b89bb550dda160049ecfd558a21cc81f8  DearDough.md
c6e27b52cb80fdcc5c88cfa3af3a7b3e4d4de678c1ddcb5b63d2d49e5b2d44c1  docs/maintainer/finding-names.md
a24019906ed9a0f01596edf9342af3f2928777c63e71ed4fac45e24005ba1445  starting/findings.md
dbf6415c485d49a69181533cd2938bb6e47f872edcc0f884e6e45b633a37f5ad  starting/PRODUCT-BACKLOG.md
53d9868e723d5d4f466f7a220f5e4e1de93586358f52f4143b531f30bcbeea69  starting/seeds/SEED-901-workshop-notes.md
762c0843ef99cdbe3f48c989ca88b4f42f8569f33106e1c7352353936d57ee1d  accepted/findings.md
d1f2cf767b157cd15f2c7ee3c12bd30b5a5fdd926d29d08610ab39acdfea4946  accepted/PRODUCT-BACKLOG.md
53d9868e723d5d4f466f7a220f5e4e1de93586358f52f4143b531f30bcbeea69  accepted/seeds/SEED-901-workshop-notes.md
196c55b7ad5e55b9dfff31ecda8056e5c9f9225e2f9b7f335099e0fd006dd99e  accepted/seeds/SEED-902-protect-reviewed-execution-commits.md
27ef70c00ede8e354695fa8e64e7f0857bd79ad1f8de796ce40f9590a06e51e0  reuse-existing/starting/findings.md
e7c8bc231a6b534a2d7abb076743706e8ce61fda3bcf6cb62c70672c039860ff  reuse-existing/starting/PRODUCT-BACKLOG.md
9649a0a2d6cd58fbe8ac47fc13987e8e5664e5678a28ce0178250976a5ed4704  reuse-existing/starting/seeds/SEED-901-process-follow-up.md
ba582bf65329da92a4aef83a0bfaff8abd2617b3ca27ac30a63435bc8dd04d46  reuse-existing/accepted/findings.md
04a6ab9ffb229a9dfb210f86984da57c24b87f9a793f3ed48c1ab6ffb52110b9  reuse-existing/accepted/PRODUCT-BACKLOG.md
39b7a47257c6c1b74098ec6127ffaae5c1d3a16e7caa99ba5d7f0b65a71ff541  reuse-existing/accepted/seeds/SEED-901-process-follow-up.md
a24019906ed9a0f01596edf9342af3f2928777c63e71ed4fac45e24005ba1445  missing-finding-location/findings.md
dbf6415c485d49a69181533cd2938bb6e47f872edcc0f884e6e45b633a37f5ad  missing-finding-location/PRODUCT-BACKLOG.md
53d9868e723d5d4f466f7a220f5e4e1de93586358f52f4143b531f30bcbeea69  missing-finding-location/seeds/SEED-901-workshop-notes.md
a24019906ed9a0f01596edf9342af3f2928777c63e71ed4fac45e24005ba1445  missing-conventions/findings.md
dbf6415c485d49a69181533cd2938bb6e47f872edcc0f884e6e45b633a37f5ad  missing-conventions/PRODUCT-BACKLOG.md
ba582bf65329da92a4aef83a0bfaff8abd2617b3ca27ac30a63435bc8dd04d46  ../slice-2/accepted/findings.md
04a6ab9ffb229a9dfb210f86984da57c24b87f9a793f3ed48c1ab6ffb52110b9  ../slice-2/accepted/PRODUCT-BACKLOG.md
39b7a47257c6c1b74098ec6127ffaae5c1d3a16e7caa99ba5d7f0b65a71ff541  ../slice-2/accepted/seeds/SEED-901-process-follow-up.md
```

`git diff --check` from the worktree root reported no whitespace errors.

## Limitations

- Walkthrough proves authoring behavior for this missing-seed slice, not
  native Codex/Cursor/Claude Code acceptance.
- Rereview without duplication and recorded non-queue dispositions remain later
  slices.
- Fictional identities must not be copied into the maintained catalog.
- A later real trial must supply reconciled evidence, an explicit writable
  finding location, and either a suitable existing seed or a canonical seed
  directory with resolvable conventions; run `reconcile-finding-names` first
  when identities are missing. Do not default to `.planning/seeds/`.
