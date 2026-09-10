# Slice 6 behavior walkthrough

Candidate: Proposed `dough-execution-retrospective` source after mixed-name
log continuation, plus internal `reconcile-finding-names` on the resulting log.
Date: 2026-09-10. These are local authoring records, not native cross-tool
acceptance ([ADR 0005](../../../../docs/adrs/0005-cross-tool-validation-accepted.md)).
Output wording was not used as a pass condition; the walkthrough inspected
issue headings, occurrence rows, preserved notes, release fields, catalog
fields, chat recommendations, and source-log bytes. The public skill was not
given `docs/maintainer/finding-names.md` or any naming catalog. Writable
catalogs for the internal invocation were isolated fixtures. The maintained
[`docs/maintainer/finding-names.md`](../../../../docs/maintainer/finding-names.md)
stayed empty scaffolding and was not the write target.

## Supplied representative records

- [Repeated recovery](records/repeated-recovery.md): Quick 036 / Quick 040
  Slice 1 process finding. Stable identity: canonical plan `Quick 034` plus
  first implementation commit `7650585`.
- [Distinct recovery](records/distinct-recovery.md): same concrete issue in
  distinct execution `record:quick-040-slice-6-distinct-recovery`. Tool:
  Cursor. Guidance release `0.3.6` tied to that work.
- [Unseen transcript reread](records/unseen-issue.md): unsupported match to
  the adopted heading. Identity
  `record:quick-040-slice-6-transcript-reread`. Tool: Claude Code. Release
  cannot be established.

## Release-bearing DD-001 start

[`starting/DearDough.md`](starting/DearDough.md) is a Slice 1-style log:
`DD-001`, Tool `Codex`, Model `gpt-5`, `Open Dough release: 0.3.4`, plus two
human notes as preservation sentinels. SHA-256
`a85a9f17acbf9b819f064b19fce0a91ab9326177453bdeddd879a695a5a69809`
([checksums.txt](checksums.txt)).

## Human rename as fixture setup

The heading `DD-001` was renamed to `ODF-001` in
[`after-human-rename/DearDough.md`](after-human-rename/DearDough.md). Notes,
description, and the original occurrence (including Tool, Model, and release
`0.3.4`) were copied unchanged. This is fixture setup representing a human
adoption; neither skill applied the rename. SHA-256
`385a2a3f9cfa0d6574cf3023a50d5c169fe3618a992197d1aa2151a8d70d8c0b`.

## Retrospective with a match and an unseen issue

Process recording used the adopted-heading log as the canonical destination.
Two supported findings were supplied in one invocation: the distinct-recovery
record (same concrete issue, distinct execution) and the unseen transcript
reread. No naming catalog was resolved or read.

[`after-retrospective/DearDough.md`](after-retrospective/DearDough.md) keeps
heading `ODF-001`. A second occurrence row was added under it for
`record:quick-040-slice-6-distinct-recovery` with `Tool: Cursor` and
`Open Dough release: 0.3.6`. The original `Quick 034 / 7650585` row is
unchanged, including `Open Dough release: 0.3.4`; it was not backfilled or
rewritten. Both human notes remain.

The unseen issue was recorded as `DD-002`, not `DD-001` and not `ODF-002`.
`001` is already used by the adopted heading, so the next unused local code
does not fill that gap. `Open Dough release: unknown` on the new row. SHA-256
`22e04368dd0e556a42f227fe0e10f7acf67a74f1d4449374e861d84e3e14a816`.

Recording result: updated canonical path; `ODF-001`, two occurrence rows;
created `DD-002`, one occurrence row.

## Internal skill on the mixed log

Invocation used source project `Open Dough`, the resulting log
[`after-internal/DearDough.md`](after-internal/DearDough.md) (byte-identical
copy of the retrospective result), and isolated catalog
[`after-internal/catalog-before.md`](after-internal/catalog-before.md)
(`ODF-001` already records this repeated-recovery meaning, mapped as
`Open Dough / DD-001`).

`ODF-001` in the source already uses the matching internal code. Chat reported
no rename for that aligned issue. The unmatched `DD-002` received a first-use
allocation.

[`after-internal/catalog.md`](after-internal/catalog.md) leaves the `ODF-001`
heading, meaning, `Open Dough / DD-001` mapping, and references unchanged. It
adds one `ODF-002` heading mapped to `Open Dough / DD-002`. There is no
Occurrences section, count, extra field, or occurrence-history row.

Chat recommendations: no rename for `Open Dough/ODF-001`;
`Open Dough/DD-002 → ODF-002` (unseen concrete issue; next unused internal code).

Source `DearDough.md` is byte-identical before and after. SHA-256
`22e04368dd0e556a42f227fe0e10f7acf67a74f1d4449374e861d84e3e14a816`
([after-internal/checksums.txt](after-internal/checksums.txt)). The internal
invocation did not write the source log.

## Behavior review

1. **Invocation context.** Process recording still runs after enabled process
   review. Mixed `DD-NNN` / adopted `ODF-NNN` headings are local log IDs to
   reuse or skip, not a naming-catalog workflow. The internal skill remains a
   maintainer rename recommender; it does not write `DearDough.md`.
2. **Required context.** Public recording needs an interpretable canonical log
   and a stable execution identity. It does not require an internal naming
   record. Internal matching needs source project, supplied feedback, and an
   isolated writable catalog for this proof. Missing catalog access is not a
   public-skill stop.
3. **Useful outcome.** Adopted `ODF-001` received the new matching occurrence.
   The unmatched finding received `DD-002` rather than `DD-001` or a minted
   `ODF-NNN`. Release-bearing rows and human notes survived. The internal
   skill left the aligned issue unrenamed, named only the new finding, left
   source bytes unchanged, and collected no occurrence history.

This is local behavior review of the Proposed public source and internal
authoring proof, not native cross-tool acceptance or release evidence. Public
mixed-code native requirements belong to SEED-010 Story 2. Quick 036 and this
walkthrough do not cover that acceptance.
