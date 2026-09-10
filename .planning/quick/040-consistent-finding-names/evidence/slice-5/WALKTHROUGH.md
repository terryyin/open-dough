# Slice 5 behavior walkthrough

Candidate: internal `reconcile-finding-names` after uncertain-relationship
matching was enabled. Date: 2026-09-10. These are local authoring records, not
native cross-tool acceptance ([ADR 0005](../../../../docs/adrs/0005-cross-tool-validation-accepted.md)).
Output wording was not used as a pass condition; the walkthrough inspected
issue meaning, catalog fields, chat recommendations, and source-log bytes.
Writable catalogs were isolated fixtures. The maintained
[`docs/maintainer/finding-names.md`](../../../../docs/maintainer/finding-names.md)
stayed empty scaffolding and was not the write target.

Open Dough is both named roles: source project and catalog owner. Local codes
remain `DD-NNN`; internal codes are `ODF-NNN`.

Current revision assessed when history is involved: this Open Dough
authoring checkout `3d86e1d` (`VERSION` `0.3.6`). That names the revision
under assessment. It is not a disposable guidance fixture, and it is not the
execution's release. No nested `.git` was added under this evidence tree.
Relevant claimed recovery-skill history was not in the supplied inspection
set; this walkthrough did not audit all guidance or fetch another project.

## Supplied representative records

- [Repeated recovery](records/repeated-recovery.md): same missing-manifest class
  as `ODF-001`. Stable identity: canonical plan `Quick 034` plus first
  implementation commit `7650585`. Reused from Quick 036 / Quick 040.
- [Similar symptom](records/similar-symptom.md): Quick 036 similar-symptom
  versus repeated-recovery distinction. Observed transcript reread
  (`record:quick-036-slice-2`); shared cause with the boundary-recovery issue
  is not established.
- [Unknown release](records/unknown-release.md): boundary recovery whose
  execution release cannot be established.
- [Unverified claimed fix](records/unverified-fix.md): 0.3.6 report that
  claims a 0.3.5 correction without a verified guidance change.
- Isolated catalog already mapping the repeated-recovery issue
  ([`similar-symptom/catalog-before.md`](similar-symptom/catalog-before.md)
  and the same bytes in the other allocating variants).

## Similar rereading symptoms with a different unresolved cause

Invocation used source project `Open Dough`, the isolated log
[`similar-symptom/DearDough.md`](similar-symptom/DearDough.md) (`DD-001` is
the recorded repeated-recovery issue; `DD-003` is the Quick 036 transcript
reread), and isolated catalog
[`similar-symptom/catalog-before.md`](similar-symptom/catalog-before.md)
(`ODF-001` already records the missing-manifest issue).

`DD-001` is the same recorded source issue as `ODF-001`. The `DD-003` record
supports one transcript reread after losing an observation location. It does
not show repeated plan or commit-boundary reconstruction, so a shared cause
with `ODF-001` is not established. Similar rereading symptoms were not treated
as continuity or as a demonstrated correction.

[`similar-symptom/catalog.md`](similar-symptom/catalog.md) keeps the original
`ODF-001` heading and mapping `Open Dough / DD-001`. It adds one `ODF-002`
heading mapped to `Open Dough / DD-003`. **Meaning** and **References** on
`ODF-002` retain the matching uncertainty versus `ODF-001`. There is no
Occurrences section, count, extra field, continuity locator, or
demonstrated-correction relationship.

Chat recommendations: `Open Dough/DD-001 → ODF-001` (same recorded issue);
`Open Dough/DD-003 → ODF-002` (uncertain relationship; similar symptoms are not
a shared cause).

Source `DearDough.md` is byte-identical before and after. SHA-256
`eb1cbe8c623c1e363c76d75a0c1abd831b8bc3ef9078b5e503991a2b91cbd1dd`
([checksums.txt](similar-symptom/checksums.txt)).

## Unknown execution release

Invocation used source project `Open Dough`, the isolated log
[`unknown-release/DearDough.md`](unknown-release/DearDough.md) (`DD-002`
reports `Open Dough release: unknown`), and isolated catalog
[`unknown-release/catalog-before.md`](unknown-release/catalog-before.md).
Current revision assessed: `3d86e1d`.

The history range cannot be bounded from that finding. Checkout `VERSION`
`0.3.6` was not substituted as the execution's release. Continuity with
`ODF-001` and an intervening correction are both unestablished.

[`unknown-release/catalog.md`](unknown-release/catalog.md) keeps `ODF-001`
unchanged. It allocates `ODF-002` for `Open Dough / DD-002` with compact
**References** that state the unknown release and the matching uncertainty.
No continuity locators were appended to `ODF-001`.

Chat recommendation: `Open Dough/DD-002 → ODF-002` (conservatively separate;
do not assert continuity or correction from the missing release).

Source bytes remained
`9e31d9082ca3f94b24eaa73e270127eae1b22d714b77fef9e027c76f913f0534`.

## Claimed fix whose relevant change cannot be verified

Invocation used source project `Open Dough`, the isolated log
[`unverified-fix/DearDough.md`](unverified-fix/DearDough.md) (`DD-002` at
reported release `0.3.6`), isolated catalog
[`unverified-fix/catalog-before.md`](unverified-fix/catalog-before.md), and
the locator note
[`unverified-fix/claimed-changelog.md`](unverified-fix/claimed-changelog.md).
Current revision assessed: `3d86e1d`.

The report claims a 0.3.5 plan-manifest correction. The relevant recovery-skill
change is not in the supplied inspection set. The changelog excerpt locates a
claim; it does not prove the change's effect. This is not slice 4's evidenced
correction: no demonstrated removal, and no later recurrence after such a
removal.

[`unverified-fix/catalog.md`](unverified-fix/catalog.md) keeps `ODF-001`
unchanged (not rewritten as corrected). It allocates `ODF-002` for
`Open Dough / DD-002` with compact **References** that state the unverifiable
claim. There is no earlier-code/change relationship of the form used after a
demonstrated correction.

Chat recommendation: `Open Dough/DD-002 → ODF-002` (conservatively separate;
do not invent a fix or a current recurrence).

Source bytes remained
`572a49aa67c61501db419309aecdd92d99cc3f11f90b77637b60019615b13338`.

## Replay of uncertain input

[`replay-uncertain/DearDough.md`](replay-uncertain/DearDough.md) is the same
`DD-001` / `DD-003` log. The post-allocation catalog
[`replay-uncertain/catalog-before.md`](replay-uncertain/catalog-before.md)
was supplied again.

[`replay-uncertain/catalog.md`](replay-uncertain/catalog.md) is byte-identical
(`2999c68f5672f0e925866bbfae09a92c953939c9054d200151beb73ca25beb5b`). No
`ODF-003`, count, or history row. Chat again recommended
`Open Dough/DD-001 → ODF-001` and `Open Dough/DD-003 → ODF-002`. Source bytes
remained `eb1cbe8c623c1e363c76d75a0c1abd831b8bc3ef9078b5e503991a2b91cbd1dd`.

## Missing source identity or malformed catalog

[`missing-source-identity/DearDough.md`](missing-source-identity/DearDough.md)
is an interpretable transcript-reread finding with no local `DD-NNN` code.
Isolated catalog
[`missing-source-identity/catalog-before.md`](missing-source-identity/catalog-before.md)
is otherwise valid.

Result: stated limitation; no unsafe mapping write.
[`missing-source-identity/catalog.md`](missing-source-identity/catalog.md)
is byte-identical (`5686fcdd32f57ef05109c64779ca4cad93ebbdda879abd6c057466b0e7c81b13`).
Source bytes remained
`99362e818480cc1be7dd98e270ceee6b2c769322689e251107dfd15530d0b4db`.

[`malformed-catalog/DearDough.md`](malformed-catalog/DearDough.md) is
interpretable `DD-001`. Isolated catalog
[`malformed-catalog/catalog-before.md`](malformed-catalog/catalog-before.md)
has duplicate `ODF-001` headings and no Meaning or source-mapping fields, so the
next unused code cannot be determined.

Result: stated limitation; no unsafe write.
[`malformed-catalog/catalog.md`](malformed-catalog/catalog.md) is
byte-identical (`209afb59ae63195efc4ff2e4fc68d03ebec093d3d4b1e7af25803bf3500b8397`).
Source bytes remained
`fea3a65ae043b9115275ee63c38e2edfd276606f8b678e9c4d73028b884d5f6a`.

## Behavior review

1. **Invocation context.** Frontmatter names finding-name reconciliation, ODF
   codes, and rename recommendations. The skill applies to a maintainer working
   in the Open Dough source repository, not to public retrospective logging. It
   does not write `DearDough.md`, and the public skill does not read the catalog.
   History-dependent matching is no longer a pending limitation; uncertainty is
   a first-class outcome of the same evidence rule.
2. **Required context.** Source project, supplied feedback or canonical log,
   naming record, and (for history-dependent uncertainty) the current revision
   assessed are resolved separately. Isolated records are allowed for proof.
   Missing source identity and a malformed catalog stop without an unsafe
   write. Unknown release is not replaced by checkout `VERSION`.
3. **Useful outcome.** Similar rereading symptoms allocate a separate `ODF-002`
   with matching uncertainty and leave `ODF-001` in place. Unknown release and
   an unverifiable claimed fix also allocate separate identities without
   asserting continuity, inventing a fix, or inventing a current recurrence.
   Replaying the uncertain input reuses `ODF-002` with identical catalog bytes.
   Source bytes are unchanged on every internal invocation.

This is local authoring proof of the internal skill, not native delivery or
release evidence. The skill remains outside the payload ([ADR 0003](../../../../docs/adrs/0003-tagged-release-versioning-accepted.md)).
Slice 6 mixed-name adoption is not in this walkthrough.
