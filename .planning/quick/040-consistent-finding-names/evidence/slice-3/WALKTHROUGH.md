# Slice 3 behavior walkthrough

Candidate: internal `reconcile-finding-names` after demonstrated-continuity
matching was enabled. Date: 2026-09-10. These are local authoring records, not
native cross-tool acceptance ([ADR 0005](../../../../docs/adrs/0005-cross-tool-validation-accepted.md)).
Output wording was not used as a pass condition; the walkthrough inspected
historical and current guidance, catalog fields, chat recommendations, and
source-log bytes. Writable catalogs were isolated fixtures. The maintained
[`docs/maintainer/finding-names.md`](../../../../docs/maintainer/finding-names.md)
stayed empty scaffolding and was not the write target.

Open Dough is both named roles: source project and catalog owner. Local codes
remain `DD-NNN`; internal codes are `ODF-NNN`.

Current revision assessed: disposable guidance fixture `v0.3.6`
(`f8c20339c2603756cbf571dfe154280770b3bfdc`). That is the guidance revision
under assessment, not the Open Dough authoring checkout `23f0347`.

## Supplied representative records

- [Repeated recovery](records/repeated-recovery.md): same missing-manifest class
  as `ODF-001`. Stable identity: canonical plan `Quick 034` plus first
  implementation commit `7650585`.
- Isolated catalog already mapping that issue from release A
  ([`continuity/catalog-before.md`](continuity/catalog-before.md)).
- Disposable A/B Git fixture built outside this worktree (no nested `.git`
  here). Reconstruct with
  [`reconstruct-fixture.sh`](reconstruct-fixture.sh). Exported trees, SHAs, and
  logs: [`fixture/`](fixture/).

## Fixture history

Revision A `v0.3.4` (`e0af631d6f47de17303a68eb590d3e1afbcec834`):
[`fixture/revision-a/skills/recover-execution/SKILL.md`](fixture/revision-a/skills/recover-execution/SKILL.md)
tells later review to reopen the plan and Git log and reconstruct the boundary,
and not to retain a compact reviewed manifest.

Unrelated intervening `v0.3.5` (`4edda03a33066dbf9f8a6b8d3d39dc2b05e6725e`):
CHANGELOG, README, and VERSION only. The 0.3.5 changelog claims "Improve
execution recovery guidance wording" but does not touch the recovery skill
([`fixture/inspect-log.txt`](fixture/inspect-log.txt)).

Revision B `v0.3.6` (`f8c20339c2603756cbf571dfe154280770b3bfdc`): the recovery
section is byte-identical to A and still omits a compact reviewed manifest;
only the unrelated near-future section changed
([`fixture/revision-b/skills/recover-execution/SKILL.md`](fixture/revision-b/skills/recover-execution/SKILL.md)).

Inspection used ordinary `git log` / `git show` / tags, bounded to
`v0.3.4` through `v0.3.6` and `skills/recover-execution/SKILL.md`. No
other-project fetch and no all-guidance audit. The changelog located 0.3.5; the
skill files were inspected for effect. Different release numbers alone were not
treated as a new identity.

## Demonstrated continuity

Invocation used source project `Open Dough`, the isolated log
[`continuity/DearDough.md`](continuity/DearDough.md) (finding reports release
`0.3.4`), and isolated catalog
[`continuity/catalog-before.md`](continuity/catalog-before.md) (`ODF-001`
already records this concrete issue from A). Current revision assessed:
`f8c2033` (`v0.3.6`).

The recovery instructions at A and B are the same concrete missing-manifest
issue. [`continuity/catalog.md`](continuity/catalog.md) still has one `ODF-001`
heading. **References** gained compact continuity locators: `0.3.4`
(`e0af631`, tag `v0.3.4`) → assessed `0.3.6` (`f8c2033`, tag `v0.3.6`) and
remaining-issue locator `skills/recover-execution/SKILL.md` recovery section
still omits a compact reviewed manifest. There is no Occurrences section,
count, extra heading, or `ODF-002`.

Chat recommendation: `Open Dough/DD-001 → ODF-001` (same issue remains at
assessed revision B `f8c2033`).

Source `DearDough.md` is byte-identical before and after. SHA-256
`fea3a65ae043b9115275ee63c38e2edfd276606f8b678e9c4d73028b884d5f6a`
([checksums.txt](continuity/checksums.txt)).

## Alias spelling of the same issue

[`alias/DearDough.md`](alias/DearDough.md) keeps local code `DD-001` and the
same concrete meaning, with a retitled heading ("Repeated recovery of the
reviewed plan and commit boundary"). The post-continuity catalog
[`alias/catalog-before.md`](alias/catalog-before.md) was supplied again.

[`alias/catalog.md`](alias/catalog.md) is byte-identical to the continuity catalog
(`13df5df592f4b257f76280bf8a4f6fef80369cca9990b8274d3e8eb354527d85`). No second
identity. Chat again recommended `Open Dough/DD-001 → ODF-001`. Source bytes
remained `f08a15407e4f6666c9447697a95e1957b4d63542208bd3b831f7f995f988f8f6`.

## Still pending

An evidenced correction that would mint a later code, and uncertain
similarity or missing history, remain pending (slices 4–5). This walkthrough
does not claim a fix or a recurrence from the 0.3.5 changelog.

## Behavior review

1. **Invocation context.** Frontmatter names finding-name reconciliation, ODF
   codes, and rename recommendations. The skill applies to a maintainer working
   in the Open Dough source repository, not to public retrospective logging. It
   does not write `DearDough.md`, and the public skill does not read the catalog.
2. **Required context.** Source project, supplied feedback or canonical log,
   naming record, and (for continuity) the current revision assessed are
   resolved separately. Isolated records are allowed for proof. Missing or
   empty feedback still stops with nothing to match. Correction and
   uncertain-similarity history matching remain explicit pending limitations.
3. **Useful outcome.** Feedback from release A, with current B still containing
   the same missing-manifest issue, reuses `ODF-001` and records compact
   continuity references. A title alias of the same source issue does not mint
   `ODF-002`. Source bytes are unchanged. Different release numbers alone do not
   allocate a new code.

This is local authoring proof of the internal skill, not native delivery or
release evidence. The skill remains outside the payload ([ADR 0003](../../../../docs/adrs/0003-tagged-release-versioning-accepted.md)).
