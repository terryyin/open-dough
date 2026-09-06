# Update Open Dough to the latest release only when needed

**Status: NOT FOR DIRECT EXECUTION.** This is reused planning material.
Before execution, refine the linked story, update this plan to match that
refinement and the then-current implementation, and run Donut's
slice-plan-refinement skill on this plan. Do not execute these fragments as-is.

Source: [SEED-001, Story 5](../../seeds/SEED-001-install-and-update-open-dough.md#update-only-when-needed).
Previous outcome: [Story 4 release plan](../004-versioned-updates/PLAN.md).
Following outcome: [Story 6 changelog plan](../006-show-update-changelog/PLAN.md).

## Candidate goal and boundary

A developer installs latest, updates an older/unknown selected installation,
and gets a no-write result when it is already current. All three native tools
must support the delivered outcome and coexist in one project.

Use the accepted [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
release contract. A valid tagged release is necessary; the internal skill is
one way to produce it, not a technical dependency of the updater.

This story intentionally stops before automatic changelog presentation. The
release already contains readable notes which developers can inspect manually.
Story 6 replaces that interim interaction. Version comparison must remain part
of the update decision: a detector followed by unconditional update would not
meet this story.

## Reused work and outside-in proof to retain

These are inherited work groups, not execution-ready leaves. Original numbers
refer to the former aggregate 27-leaf plan, whose full mapping is in the seed.

| Original work | Retained outcome | Proof to carry into the updated plan |
| --- | --- | --- |
| 1–2, 16, 20 | Install a valid latest tagged payload and its selected-tool record | Actual installation from a supplied repository; highest numeric release wins over tag date and branch HEAD; native discovery in each tool. |
| 3–4 | Ordinary repeat protection and explicit forced replacement | Each platform warns/stops on ordinary repeat; explicit force replaces selected payload/record, preserving other copies and unrelated content. |
| 5, 18, 22 | Equal-version no-op | Native invocation identifies both versions; no installer call or installed-file/record writes, including when untagged source changed. An empty diff alone is insufficient. |
| Mechanics of 6–8, 17, 19, 21, 23 | Advance an older or unknown selected installation directly to latest | Native old-to-latest transition and genuine legacy bootstrap per tool; no intermediate installations, no changelog display prerequisite. |
| Version/source portion of 9 | Reject unusable releases or unsupported version selection | No tags, fetch failure, mismatched tag/version, malformed installed record, or unsupported requested-version input cannot cause branch fallback or writes. Check release metadata, including the required release entry, before use. |
| 10–11 | Preserve newer installations and truthful state after failure | No downgrade; failed application does not advance the marker or print success, including a failure after replacement starts. No rollback framework is required. |
| Later-release portion of 24 | Make this actual improvement available as a subsequent release | The chosen new version, tag, and notes describe the delivered updater. Do not recreate or move Story 4's initial release. |
| Version-aware portion of 25–27 | Use the released updater in Open Dough itself | Native transition for each actual installation, correct source/tag/commit and selected path, coexistence, and fresh-session reuse. |

Changelog-text portions of shared original leaves move to Story 6. This file
does not contain a second implementation of those portions.

## Constraints and provisional implementation notes

- Keep the supplied source URL and running-tool selection. Use one resolved
  tagged snapshot for metadata and payload; no default-branch fallback.
- Keep an independent installed version for each tool. The former plan proposed
  a `VERSION` beside each installed `dough-update/SKILL.md`; revisit the small
  implementation detail during refinement without changing the release contract.
- Compare before mutation. Unknown means no record; equal means no writes;
  newer installed means report and preserve. Write the new record only after
  successful installation and payload verification.
- Existing old skills allow only `SKILL.md` writes. Refine the explicit forced
  bootstrap and fresh-session journey using those genuine old skills. Story 4's
  initial source version does not imply that its installer recorded versions.
- Preserve source, other installations and records, unrelated project work,
  internal skills/guard, and home guidance. Do not distribute the internal skill.
- Keep one shared workflow with minimal native adaptation. Do not prebuild a
  generic updater framework; choose only helpers required by a refined leaf.
- Align README's installation, update, bootstrap, and distribution statements
  with the delivered version-aware behavior. State that release notes can be
  read manually until Story 6; do not prematurely promise inline content.
- Requested-version updates, prereleases, rollback, source persistence, global
  configuration, synchronization, customization merging/backup, notifications,
  and release automation remain excluded.

## Questions for the required refinement

- What is the smallest complete fresh-install and legacy transition on the
  implementation delivered by Story 4? Do not assume the old updater can adopt
  the new write contract automatically.
- Which source-selection and record operations need deterministic production
  code, and which can stay in the existing shared skill? Inspect then, not by
  treating the aggregate plan's helper suggestions as architectural decisions.
- Split source resolution, installation, comparison outcomes, and native proof
  into small usable Behavior leaves; do not retain the aggregate error suite
  or a whole platform journey as one oversized leaf.

## Acceptance evidence to collect after refinement and execution

| Platform | Required native evidence | Status |
| --- | --- | --- |
| Codex | Install/discover, invoke update, older/equal/unknown outcomes, coexistence, released self-use | Pending |
| Cursor | Same outcomes; observe actual selected entry with all integrations present | Pending |
| Claude Code | Same outcomes through its native entry | Pending |

Focused real-installer checks complement native evidence. Prior unconditional
updater success cannot establish the new version contract. Record new evidence
in this plan or its change summary and leave unobserved native behavior pending.

## Next action and learnings

**Do not execute this plan.** Refine Story 5, update and size these inherited
fragments, run slice-plan-refinement, reconcile proof ownership, and only then
assess execution readiness. No slice is complete and no product verification
has been performed. The key inherited lesson is that legacy skills cannot be
assumed to permit new installed-version writes.
