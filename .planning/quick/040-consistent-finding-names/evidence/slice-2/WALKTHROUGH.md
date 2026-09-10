# Slice 2 behavior walkthrough

Candidate: internal `reconcile-finding-names` after first-identity allocation was
enabled. Date: 2026-09-10. These are local authoring records, not native
cross-tool acceptance ([ADR 0005](../../../../docs/adrs/0005-cross-tool-validation-accepted.md)).
Output wording was not used as a pass condition; the walkthrough inspected
catalog fields, chat recommendations, and source-log bytes. Writable catalogs
were isolated fixtures. The maintained
[`docs/maintainer/finding-names.md`](../../../../docs/maintainer/finding-names.md)
stayed empty scaffolding and was not the write target.

Open Dough is both named roles: source project and catalog owner. Local codes
remain `DD-NNN`; internal codes are `ODF-NNN`.

## Supplied representative records

- [Repeated recovery](records/repeated-recovery.md): Quick 036 / Quick 040
  Slice 1 process finding reused as `DD-001`. Stable identity: canonical plan
  `Quick 034` plus first implementation commit `7650585`.
- Isolated empty catalog copies of the maintained scaffolding, used as the
  writable naming record unless a variant supplies a different isolated file.

## First use

Invocation used source project `Open Dough`, the isolated log
[`first-use/DearDough.md`](first-use/DearDough.md), and isolated catalog
[`first-use/catalog-before.md`](first-use/catalog-before.md) (empty scaffolding;
next unused code `ODF-001`). No current-catalog identity matched the concrete
repeated-recovery issue.

The catalog result is [`first-use/catalog.md`](first-use/catalog.md): one
`ODF-001` heading, a concrete Meaning, source mapping `Open Dough / DD-001`,
and compact references to the representative record, source log, and execution
`Quick 034 / 7650585`. There is no Occurrences section, count, or history row.

Chat recommendation: `Open Dough/DD-001 → ODF-001` (unseen concrete issue; first
unused internal code).

Source `DearDough.md` is byte-identical before and after. SHA-256
`fea3a65ae043b9115275ee63c38e2edfd276606f8b678e9c4d73028b884d5f6a`
([checksums.txt](first-use/checksums.txt)).

## Replay exact input

The same source log and the allocated catalog
[`replay/catalog-before.md`](replay/catalog-before.md) were supplied again.
`ODF-001` already records this concrete issue for `Open Dough / DD-001`.

[`replay/catalog.md`](replay/catalog.md) is byte-identical to the first-use
catalog (`2fe80bfae32ec31bc796a5430aa6ede2e2bd2542c1f5e0850e1ce33f6d9350f2`).
No count, history row, or extra field was added. Chat again recommended
`Open Dough/DD-001 → ODF-001` because the identity already exists. Source bytes
remained `fea3a65ae043b9115275ee63c38e2edfd276606f8b678e9c4d73028b884d5f6a`.

## Missing or empty feedback

No supplied record and no canonical log were present. Isolated catalog
[`missing-feedback/catalog-before.md`](missing-feedback/catalog-before.md) was
empty scaffolding.

Result: nothing to match; no finding invented. [`missing-feedback/catalog.md`](missing-feedback/catalog.md)
is byte-identical (`c6e27b52cb80fdcc5c88cfa3af3a7b3e4d4de678c1ddcb5b63d2d49e5b2d44c1`).
Empty feedback uses the same stop.

## Uninterpretable naming record

Source log was interpretable `DD-001`. Isolated catalog
[`uninterpretable-record/catalog-before.md`](uninterpretable-record/catalog-before.md)
has duplicate `ODF-001` headings and no Meaning or source-mapping fields, so the
next unused code cannot be determined.

Result: limitation reported; no unsafe write.
[`uninterpretable-record/catalog.md`](uninterpretable-record/catalog.md) is
byte-identical (`209afb59ae63195efc4ff2e4fc68d03ebec093d3d4b1e7af25803bf3500b8397`).
Source bytes remained `fea3a65ae043b9115275ee63c38e2edfd276606f8b678e9c4d73028b884d5f6a`.

## Interim cross-revision matching

[`interim-cross-revision/catalog-before.md`](interim-cross-revision/catalog-before.md)
already maps `ODF-001` to the 0.3.4 repeated-recovery issue.
[`interim-cross-revision/DearDough.md`](interim-cross-revision/DearDough.md)
supplies `DD-002` at release `0.3.6` that claims a possible 0.3.5 correction
without a verified guidance diff. Deciding reuse of `ODF-001` versus a new code
requires historical continuity/correction matching (slices 3–5).

Current revision assessed: this Open Dough checkout `962b4e7` (`VERSION` `0.3.6`).
No all-guidance audit and no other-project fetch.

Result: pending, without guessing reuse or a new code, and without claiming a
fix or recurrence. Catalog bytes unchanged
(`5686fcdd32f57ef05109c64779ca4cad93ebbdda879abd6c057466b0e7c81b13`). Source
bytes unchanged
(`e18349a8f0adb094482d53922aacd6aafa2d9607d379277890fd3bd4c0d54069`).

## Behavior review

1. **Invocation context.** Frontmatter names finding-name reconciliation, ODF
   codes, and rename recommendations. The skill applies to a maintainer working
   in the Open Dough source repository, not to public retrospective logging. It
   does not write `DearDough.md`, and the public skill does not read the catalog.
2. **Required context.** Source project, supplied feedback or canonical log, and
   naming record are resolved separately. Isolated records are allowed for proof.
   Missing or empty feedback stops with nothing to match. A malformed catalog
   stays byte-identical. Cross-revision history matching is an explicit pending
   limitation.
3. **Useful outcome.** First use allocates `ODF-001` and recommends
   `Open Dough/DD-001 → ODF-001` without editing source bytes. Replay keeps that
   identity with no history or counts. Unsupported writes do not invent findings
   or guess a continuity/correction outcome.

This is local authoring proof of the internal skill, not native delivery or
release evidence. The skill remains outside the payload ([ADR 0003](../../../../docs/adrs/0003-tagged-release-versioning-accepted.md)).
