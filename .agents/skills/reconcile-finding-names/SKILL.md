---
name: reconcile-finding-names
description: Reconcile a source project's retrospective finding names with stable internal Open Dough finding codes (ODF-NNN). Use when a maintainer asks to recommend a rename, assign an ODF code, match finding names, or reconcile source and internal codes from DearDough or supplied feedback.
---

# Reconcile finding names

You are the maintainer agent working in the Open Dough source repository. This
skill is internal ([ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)):
it is not in the released payload and must not be added to `install.sh`. Do not
create a second procedure under `src/skills/`.

Two roles stay separate even when both are Open Dough:

- **Source project** — the selected project whose supplied feedback or canonical
  `DearDough.md` you inspect. Its local codes stay `DD-NNN` until a human adopts
  an internal name.
- **Open Dough catalog** — this repository's naming record. Internal codes are
  `ODF-NNN`.

Never treat those namespaces as interchangeable. This skill never writes the
source log. The public retrospective skill does not read this catalog and does
not mint `ODF-NNN` codes.

## When to apply

Use when a maintainer asks to reconcile finding names, recommend a source-code
rename to an ODF code, or match supplied DearDough/feedback against the internal
catalog.

Do not use this skill to collect recurrence, count executions, edit guidance,
apply a source rename, respond to a finding, or audit every skill. Do not
fetch other projects.

## Required context

Resolve these independently before matching:

1. **Source project** — a name for mappings (use `Open Dough` when this
   repository is the source). Stop if the source project cannot be identified.
2. **Feedback** — supplied process feedback, or the source project's canonical
   `DearDough.md`. Do not search other repositories for a log.
3. **Naming record** — `docs/maintainer/finding-names.md` in this Open Dough
   catalog, unless the invocation supplies an isolated writable catalog. When an
   isolated catalog is supplied, write only that file; leave the maintained
   record unchanged.
4. **Current revision assessed** — for a continuity or correction decision,
   name the current guidance revision being assessed. Inspect only the
   relevant local Git history for that revision range as described under
   Inspect relevant history.

Checksum the source log or supplied feedback before any catalog work. After the
invocation, the source bytes must be identical.

Stop usefully when input is missing:

- Missing, empty, or uninterpretable feedback: report that there is nothing to
  match. Invent no finding and make no catalog write.
- Uninterpretable or malformed naming record: leave it byte-identical, report
  a limitation, and make no unsafe write. Do not guess the next code.
- Missing naming-record path with no default or isolated file: report that
  limitation and stop without creating a catalog from scratch in an unexpected
  place.

## Workflow

1. Read the naming record. Confirm it follows the documented entry shape enough
   to list existing `ODF-NNN` identities and the next unused code. Empty
   scaffolding with no allocated findings is valid; it is not a finding, and
   the next code is `ODF-001`.
2. Read only the supplied feedback or the selected source log. Identify each
   interpretable source finding (local code plus concrete meaning). Do not import
   occurrence rows, counts, or execution history into the catalog.
3. For each interpretable finding, look for a current-catalog identity whose
   **concrete meaning** is the same issue. Wording, title, or symptoms alone are
   not a match. Identity is the concrete issue plus evidence of continuity or
   an intervening correction; release numbers locate history and do not
   partition identities. A spelling or alias change of the same source issue
   must not mint another identity. After a demonstrated correction, a later
   finding of a reintroduced or different problem is a new identity, not that
   earlier code. Qualify a source alias by project and, when necessary, a
   revision or evidence locator.
4. **No known match:** allocate the next unused `ODF-NNN`. Write one minimal
   entry (see below). Recommend `source-project/code → ODF-NNN` in chat with a
   brief matching reason (unseen concrete issue; first unused internal code).
   First-use needs only the current catalog and the supplied finding; do not
   invent a history investigation.
5. **Known match already recorded:** reuse that identity when the supplied
   finding is the same recorded source issue. Recommend the same mapping.
   Make no catalog edit: do not add counts, history rows, extra fields, or
   duplicate mappings. Reprocessing the same source finding keeps the
   recorded identity. If the supplied finding reports a later revision than
   the catalog entry, inspect history (see Inspect relevant history) before
   reuse; continuity and correction below decide whether this is still that
   identity.
6. **Source already uses that internal code:** if the source heading is already
   the matching `ODF-NNN`, report that no rename is needed. Still do not edit
   the source log or add catalog history.
7. **Demonstrated continuity:** when the catalog already has an identity for
   this concrete issue, the supplied finding reports an earlier revision, and
   that entry does not yet record that the issue remains at the current
   revision assessed, inspect history (see Inspect relevant history). If the
   issue is still present with no intervening removal, reuse the existing
   `ODF-NNN` and append continuity locators on that entry (see Catalog entry).
   Recommend `source-project/code → ODF-NNN` with a brief reason that the same
   issue remains at the current revision. If inspection shows the issue is
   gone, this is not continuity; follow demonstrated correction below.
8. **Demonstrated correction, later finding:** when inspection shows an
   intervening correction (the issue is gone in that range), distinguish the
   supplied finding:

   - **Supported later feedback at the current revision assessed:** if that
     revision contains a reintroduced instance of the old issue or a different
     problem, allocate a new identity (see Catalog entry) with compact
     **References** to the earlier `ODF-NNN` and the decisive correction
     change. Recommend `source-project/code → ODF-NNN` with a brief reason
     that continuity broke at that correction. Leave the earlier heading's
     source mapping unchanged.
   - **Same source code on both sides:** qualify the new recommendation and the
     new entry's source mapping by revision or occurrence locator. Do not
     recommend renaming the entire historical source entry to the new code.
   - **Historical feedback only:** if the supplied finding is only the earlier
     report of the already-corrected issue (for example, replaying that
     revision's log), reuse the existing identity. Make no new catalog heading
     and invent no current issue. Explain that this report's revision limit is
     the earlier revision; it does not establish a finding at the current
     revision assessed.
9. **Unsupported — uncertain similarity:** matching that would require a
   qualified-uncertainty record when history or similarity is insufficient is
   not supported. Report that limitation as pending without guessing a
   correction, a later new identity, or a recurrence. Missing or unverifiable
   history is not a demonstrated fix or recurrence. Unknown continuity stays
   qualified.

Chat is the only recommendation channel. Format:
`source-project/code → ODF-NNN`. Never edit source feedback, even when the source
project is Open Dough.

## Inspect relevant history

Use ordinary `git log`, `git show`, and tags on the supplied or selected guidance
files in a Git repository. This is not a new history engine.

- When an existing catalog identity is in play, bound the inspection from that
  identity's recorded revision through the current revision being assessed, and
  to the files that could contain that concrete issue. Do not audit all
  guidance. The supplied finding's reported revision is a locator in that
  range; do not truncate the range so an intervening correction is skipped.
- Decide continuity or correction from the meaning of those tagged and current
  guidance diffs: whether the concrete issue is still present, gone, or later
  reintroduced. A changelog helps locate a change; it does not prove the
  change's effect. A release-number difference or a changelog keyword such as
  "fix" is not that evidence. Name the current revision assessed.

## Catalog entry

Follow [docs/maintainer/finding-names.md](../../../docs/maintainer/finding-names.md).
A new identity is one heading and these fields only:

```markdown
## ODF-NNN — <short title>

- **Meaning:** <one concrete issue>
- **Source mappings:** <source-project / local-code>
- **References:** <compact evidence or change locators>
```

Qualify a source mapping with a revision or occurrence locator when needed so
one source code cannot overwrite an earlier different issue. After a
demonstrated correction, do not rewrite the earlier heading's source mapping
to the new code. Do not add occurrence history, totals, or count fields.

When continuity is demonstrated, append compact locators to **References** on
the existing heading: the reported revision, the current revision assessed,
and the decisive remaining-issue locator. Do not add a second heading,
occurrence rows, or counts.

When a new identity follows a demonstrated correction, write the new heading
with compact **References** to the earlier `ODF-NNN` and the decisive
correction change (revision, tag or SHA, and the guidance locator that shows
the old issue is gone).

Replace `_No findings allocated yet._` with the first entry. Append later
entries after existing findings. Do not rewrite unrelated catalog text.

## Boundaries

- Do not write `DearDough.md` or any source-project feedback file.
- Do not add this skill, its Claude pointer, or the naming record to the payload.
- Do not fetch other projects or scan unrelated logs.
- Do not turn a matching limitation into a claim that a fix or recurrence
  occurred.
- Do not allocate a new `ODF-NNN` from a release-number difference or a
  changelog claim alone.
- Do not invent a current issue from historical feedback about an
  already-corrected finding.
- Do not overwrite an earlier source mapping when one source code spans a
  correction.
