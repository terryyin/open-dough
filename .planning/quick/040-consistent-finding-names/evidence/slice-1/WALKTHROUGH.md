# Slice 1 behavior walkthrough

Candidate: Proposed `dough-execution-retrospective` source after occurrence
guidance-release recording was enabled. Date: 2026-09-10. These are local,
representative records, not native cross-tool acceptance. Output wording was
not used as a pass condition; the walkthrough inspected file state and the
meaning of each recorded release.

## Supplied representative records

- [Repeated recovery](records/repeated-recovery.md): Quick 036 process finding
  reused as the supported issue. Stable identity for variants 1 and 4:
  canonical plan `Quick 034` plus first implementation commit `7650585`.
- [Used 0.3.4 under a 0.3.6 review](records/provenance-used-034.md): Codex,
  model `gpt-5`, guidance release `0.3.4` tied to that execution.
- [No release evidence](records/provenance-none.md): Cursor; identity
  `record:quick-040-slice-1-unknown`; no model; no release tied to the work.
- [Modified guidance](records/provenance-modified.md): Claude Code; identity
  `record:quick-040-slice-1-modified`; revision `4f8a1c2`; base `0.3.4`.
- [Identical rereview](records/provenance-rereview.md): same Quick 034 execution
  and process evidence against a Tool/Model-era log that has no release field.

## Used A, review under B

The repeated-recovery record was reviewed with process enabled in disposable
project `used-a-review-under-b/`. That project's checkout `VERSION` and both
updater files `.agents/skills/dough-update/VERSION` and
`.claude/skills/dough-update/VERSION` are `0.3.6`. Execution provenance names
released `0.3.4` as the guidance used during the work.

The recording result was: created `<project-root>/DearDough.md`; `DD-001`, one
occurrence.

Inspection of [`used-a-review-under-b/DearDough.md`](used-a-review-under-b/DearDough.md)
shows `Open Dough release: 0.3.4`, executing tool `Codex`, and model `gpt-5`.
The occurrence does not record `0.3.6`. Review-time installation is present only
in the decoy VERSION files.

## No release evidence

The same process finding was reviewed under identity
`record:quick-040-slice-1-unknown`. Tool is Cursor. Release cannot be established.
The review environment decoy
[`no-release-evidence/.agents/skills/dough-update/VERSION`](no-release-evidence/.agents/skills/dough-update/VERSION)
is `0.3.6` and is not tied to the work.

[`no-release-evidence/DearDough.md`](no-release-evidence/DearDough.md) records
`Open Dough release: unknown` and `Tool: Cursor`. There is no Model line. The
occurrence does not substitute `0.3.6` or any checkout VERSION.

## Modified guidance with known revision

Provenance states a locally modified copy of released `0.3.4` at fixture
revision `4f8a1c2`. The review-environment updater still reads `0.3.4`.

[`modified-guidance/DearDough.md`](modified-guidance/DearDough.md) records
`Open Dough release: modified; revision 4f8a1c2; base 0.3.4` and
`Tool: Claude Code`. It does not call the work a clean `0.3.4` release. No Model
line. Unreleased guidance uses the same state-plus-revision rule; this walk
used the modified case, which also retains the known base.

## Existing rows without releases

The journey started from a Quick 036-style log that already has Tool and Model
on some rows and no `Open Dough release` field:
[`existing-rows/before/DearDough.md`](existing-rows/before/DearDough.md). Human
notes and unrelated `DD-002` are preservation sentinels. An identical rereview
of `Quick 034 / 7650585` ran with review-environment decoy VERSION `0.3.6`.

[`existing-rows/after/DearDough.md`](existing-rows/after/DearDough.md) is
byte-identical. SHA-256 of both files is
`920da4b3947d84deecf08b02f64d4bf70d3798eb23f7174b31868957435914e4`
([checksums.txt](existing-rows/checksums.txt)). No occurrence was added. No
release was guessed or backfilled. Notes, `DD-002`, Tool, and Model remain.

## Unchanged skip, no-finding, and preservation

Quick 036 already proved process skip, no supported finding, missing identity,
conflicting location, failed write, human-note and unrelated-entry preservation,
and ambiguous-log refusal. This slice did not change those rules and did not
re-run those cases. Evidence remains at
[Quick 036 evidence](../../036-record-retrospective-process-findings/evidence/).

## Behavior review

1. **Invocation context.** Process recording still runs after enabled process
   review. The new field is part of writing a new occurrence, not a separate
   workflow, naming catalog, or history matcher.
2. **Required context.** The guidance release must come from execution or
   installation provenance tied to the reviewed work. Missing release evidence
   is recorded as `unknown`; it does not stop the write when tool and identity
   are present. Review-time updater VERSION paths are named so they are not
   substituted by default.
3. **Useful outcome.** A supported finding records the actual guidance used
   during execution: `0.3.4` rather than review-time `0.3.6`; `unknown` rather
   than today's VERSION; `modified` with revision `4f8a1c2` and base `0.3.4`
   rather than a clean release. Older rows without a release field stay
   untouched on identical rereview.

This is local behavior review of the Proposed source, not native cross-tool
acceptance or release evidence. Public native requirements for the release
field belong to SEED-010 Story 2.
