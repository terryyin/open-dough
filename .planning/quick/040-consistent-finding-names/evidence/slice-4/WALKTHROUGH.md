# Slice 4 behavior walkthrough

Candidate: internal `reconcile-finding-names` after evidenced-correction matching
was enabled. Date: 2026-09-10. These are local authoring records, not native
cross-tool acceptance ([ADR 0005](../../../../docs/adrs/0005-cross-tool-validation-accepted.md)).
Output wording was not used as a pass condition; the walkthrough inspected
historical and current guidance, catalog fields, chat recommendations, and
source-log bytes. Writable catalogs were isolated fixtures. The maintained
[`docs/maintainer/finding-names.md`](../../../../docs/maintainer/finding-names.md)
stayed empty scaffolding and was not the write target.

Open Dough is both named roles: source project and catalog owner. Local codes
remain `DD-NNN`; internal codes are `ODF-NNN`.

Current revision assessed: disposable guidance fixture `v0.3.6`
(`9060700d5c041308c34f16103542ebf7c01f5b3e`). That is the guidance revision
under assessment, not the Open Dough authoring checkout `4ded892`.

## Supplied representative records

- [Repeated recovery](records/repeated-recovery.md): same missing-manifest class
  as `ODF-001`. Stable identity: canonical plan `Quick 034` plus first
  implementation commit `7650585`.
- [Reintroduced recovery](records/reintroduced-recovery.md): later execution of
  that same class after the compact-manifest correction.
- Isolated catalog already mapping the A issue
  ([`feedback-at-c/catalog-before.md`](feedback-at-c/catalog-before.md)).
- Disposable A/B/C Git fixture built outside this worktree (no nested `.git`
  here). Reconstruct with
  [`reconstruct-fixture.sh`](reconstruct-fixture.sh). Exported trees, SHAs, and
  logs: [`fixture/`](fixture/).

## Fixture history

Revision A `v0.3.4` (`3cd28847958c83e3388b2c0c37c4302598e0653b`):
[`fixture/revision-a/skills/recover-execution/SKILL.md`](fixture/revision-a/skills/recover-execution/SKILL.md)
tells later review to reopen the plan and Git log and reconstruct the boundary,
and not to retain a compact reviewed manifest.

Revision B `v0.3.5` (`36bb259583397374a4b0781e426097387af2bf13`): the recovery
section retains a compact reviewed manifest and tells later review not to
reopen the plan and Git log
([`fixture/revision-b/skills/recover-execution/SKILL.md`](fixture/revision-b/skills/recover-execution/SKILL.md)).
The 0.3.5 changelog also mentions that retain instruction. The skill file was
inspected for effect; the changelog keyword was not treated as proof that the
old issue ended.

Revision C `v0.3.6` (`9060700d5c041308c34f16103542ebf7c01f5b3e`): the recovery
section again omits a compact reviewed manifest; the near-future section is an
unrelated reword
([`fixture/revision-c/skills/recover-execution/SKILL.md`](fixture/revision-c/skills/recover-execution/SKILL.md)).
The 0.3.6 changelog says only "Reword near-future direction notes" and does not
mention the reintroduction
([`fixture/inspect-log.txt`](fixture/inspect-log.txt)).

Inspection used ordinary `git log` / `git show` / tags, bounded to
`v0.3.4` through `v0.3.6` and `skills/recover-execution/SKILL.md`. No
other-project fetch and no all-guidance audit. Different release numbers alone
were not treated as a new identity. The B skill meaning shows the old issue is
gone; the C skill meaning shows it is reintroduced.

## Feedback at C

Invocation used source project `Open Dough`, the isolated log
[`feedback-at-c/DearDough.md`](feedback-at-c/DearDough.md) (finding `DD-002`
reports release `0.3.6`), and isolated catalog
[`feedback-at-c/catalog-before.md`](feedback-at-c/catalog-before.md) (`ODF-001`
already records this concrete issue from A). Current revision assessed:
`9060700` (`v0.3.6`).

History shows an intervening correction at B, then the same missing-manifest
issue present again at C. [`feedback-at-c/catalog.md`](feedback-at-c/catalog.md)
keeps the original `ODF-001` heading and mapping `Open Dough / DD-001`. It adds
one `ODF-002` heading. **References** on `ODF-002` retain a compact relationship
to earlier code `ODF-001` and the decisive correction
`skills/recover-execution/SKILL.md` at 0.3.5 (`36bb259`, tag `v0.3.5`). There is
no Occurrences section, count, extra field, or overwrite of the `ODF-001`
mapping.

Chat recommendation: `Open Dough/DD-002 → ODF-002` (continuity broke at the
B compact-manifest correction; later C finding is a new identity).

Source `DearDough.md` is byte-identical before and after. SHA-256
`d525b139e55bc5aec575ff5b418be215d201e557e0b79e866aea4919bd3e673d`
([checksums.txt](feedback-at-c/checksums.txt)).

## Replay only the historical A report

[`replay-historical-a/DearDough.md`](replay-historical-a/DearDough.md) is the
0.3.4 `DD-001` report (`Quick 034 / 7650585`). The same isolated catalog was
supplied again. Current revision assessed remains `9060700` (`v0.3.6`).

[`replay-historical-a/catalog.md`](replay-historical-a/catalog.md) is
byte-identical to catalog-before
(`5686fcdd32f57ef05109c64779ca4cad93ebbdda879abd6c057466b0e7c81b13`). No
`ODF-002`. Chat recommended `Open Dough/DD-001 → ODF-001` and explained the
revision limit: this report is the issue at A; it does not establish a current
issue at C. Source bytes remained
`fea3a65ae043b9115275ee63c38e2edfd276606f8b678e9c4d73028b884d5f6a`.

## Same source code on both sides of the correction

[`spanning-source-code/DearDough.md`](spanning-source-code/DearDough.md) keeps
local code `DD-001` for both the 0.3.4 occurrence and the later 0.3.6
occurrence. The post-A catalog
[`spanning-source-code/catalog-before.md`](spanning-source-code/catalog-before.md)
was supplied again.

[`spanning-source-code/catalog.md`](spanning-source-code/catalog.md) still maps
`ODF-001` to `Open Dough / DD-001` with the original 0.3.4 reference. `ODF-002`
maps `Open Dough / DD-001` qualified at 0.3.6 (`9060700`, tag `v0.3.6`) and
cites the same earlier-code/change relationship. The historical `DD-001` entry
was not recommended for a wholesale rename to `ODF-002`.

Chat recommendation: `Open Dough/DD-001` at assessed revision C `9060700` →
`ODF-002` (do not rename the entire historical `DD-001` heading). Source bytes
remained `d5845581458d0f187756202199b266d98b9b736af131bf12d26233a5672d65de`.

## Still pending

Uncertain similarity or missing history remains pending (slice 5). This
walkthrough does not claim a fix from the 0.3.5 changelog keyword, and does not
claim a current issue from the historical A report alone.

## Behavior review

1. **Invocation context.** Frontmatter names finding-name reconciliation, ODF
   codes, and rename recommendations. The skill applies to a maintainer working
   in the Open Dough source repository, not to public retrospective logging. It
   does not write `DearDough.md`, and the public skill does not read the catalog.
2. **Required context.** Source project, supplied feedback or canonical log,
   naming record, and (for continuity or correction) the current revision
   assessed are resolved separately. Isolated records are allowed for proof.
   Missing or empty feedback still stops with nothing to match. Uncertain
   similarity or insufficient history remain explicit pending limitations.
3. **Useful outcome.** Feedback at C after a demonstrated B correction allocates
   `ODF-002` with a compact relationship to `ODF-001` and the decisive skill
   change. Replaying only the historical A report retains `ODF-001` and does not
   invent a C issue. The same source code on both sides is qualified by
   revision; the earlier mapping is preserved. Source bytes are unchanged.
   Changelog keywords and release-number differences alone do not allocate a
   new code.

This is local authoring proof of the internal skill, not native delivery or
release evidence. The skill remains outside the payload ([ADR 0003](../../../../docs/adrs/0003-tagged-release-versioning-accepted.md)).
