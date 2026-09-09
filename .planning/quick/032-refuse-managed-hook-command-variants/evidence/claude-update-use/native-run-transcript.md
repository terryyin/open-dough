Native tool version: 2.1.266 (Claude Code)
--- CLAUDE CODE LEGACY REFUSAL PROOF ---
I inspected the pinned release snapshot before running anything, and it fails the safety gate the update skill requires.

**What I checked:**
- `git ls-remote --tags` on the supplied source found exactly one release tag, `v0.2.1` (peeled commit `72b7c691009b9e01867f11b47c49d6b2d461c64f`), so that's the latest numeric release.
- I pinned it with a clean `git init` + `git fetch --depth 1` + detached checkout, and confirmed `git rev-parse HEAD` matches the peeled commit.
- I read `install.sh` and `open-dough-release-apply.sh` from that pinned snapshot before executing anything, per the skill's instruction not to run the installer without first inspecting it.

**Why I'm stopping:**
The skill's own instructions state the complete public payload is only three files — `dough-update/SKILL.md`, `dough-adr-awareness/SKILL.md`, and `dough-adr-awareness/RECOGNITION.md` — and require that I "proceed only if the inspected files write solely to the three declared public payload paths."

But the fetched `v0.2.1` snapshot's `install.sh` has a `managed_files` array covering **~25 files across 9 skill directories** — `dough-adr-awareness`, `dough-update`, `dough-product-backlog`, `dough-story-decomposition`, `dough-story-refinement`, `dough-resplit-story`, `dough-slice-planning`, `dough-slice-plan-refinement`, `dough-execute-plan` (including several `.mjs` scripts and hook JSON assets), and `dough-post-change-refactor`. It also actively **deletes** `dough-adr-awareness/RECOGNITION.md` as "retired" rather than installing it.

That's far outside the declared three-path scope, so I did not run `open-dough-release.sh apply`. No files were written or removed in the target project — I only worked in a disposable temp checkout, which I've left in place in case you want to inspect it yourself:
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.uBeWWetdS7`

Let me know if you want me to clean up that temp directory, or if you can confirm this expanded payload is expected (e.g., a newer release genuinely broadening Open Dough's skill suite) so I can proceed with an explicit override.

--- CLAUDE CODE INSPECTED BOOTSTRAP PROOF ---
Source: file:///var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.5htu8Pn6jp/fixture-source
Release: v0.2.1 (commit 72b7c691009b9e01867f11b47c49d6b2d461c64f)
Tool path: /var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.5htu8Pn6jp/atlas adopter/.claude/skills/dough-update
codex: installed Open Dough guidance in /private/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.5htu8Pn6jp/atlas adopter/.agents/skills (version 0.2.1).
claude: installed Open Dough guidance in /private/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.5htu8Pn6jp/atlas adopter/.claude/skills (version 0.2.1).
hooks: registered Open Dough entries in .cursor/hooks.json.
hooks: registered Open Dough entries in .claude/settings.json.
Outcome: installed 0.2.1 in the shared Codex/Cursor root and Claude Code by explicit force.
Start fresh sessions before invoking dough-update again.
--- CLAUDE CODE INSTALLED-IMPROVEMENT UPDATE PROOF ---
Update complete. Here's the report:

**Source:** `file:///var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.5htu8Pn6jp/fixture-source` (recorded `SOURCE`, matches the URL supplied)
**Release:** v0.2.2, commit `83e14a40bd07ec3f52714aa146b0ae92d1f87bc7`
**Previous version:** 0.2.1 → **New version:** 0.2.2
**Running tool:** Claude Code (`--platform claude`)

**Outcome:** Ordinary update applied to both native roots (baseline for 0.2.1 verified unchanged before replacement; host hooks already current, left unwritten).

**Installed paths** (payload copied into both `.claude/skills/` and `.agents/skills/`, each skill's `SKILL.md` plus its declared references/assets/scripts):
- `dough-update/` (SKILL.md, VERSION, SOURCE)
- `dough-adr-awareness/SKILL.md`
- `dough-product-backlog/SKILL.md`
- `dough-story-decomposition/` (SKILL.md, references/problem-decomposition.md, references/seed-format.md)
- `dough-story-refinement/` (SKILL.md, references/planning.md)
- `dough-resplit-story/SKILL.md`
- `dough-slice-planning/SKILL.md`
- `dough-slice-plan-refinement/SKILL.md`
- `dough-post-change-refactor/` (SKILL.md, references/refactor-checks.md)
- `dough-execute-plan/` (SKILL.md, assets/claude-hooks.json, assets/cursor-hooks.json, references/*.md ×8, scripts/*.mjs ×9)

The retired `dough-adr-awareness/RECOGNITION.md` was removed from both roots as part of this release (it is source-only in the release payload, not an installed file — not counted above).

Start a fresh session in Claude Code, then invoke `/dough-update` to use the updated guidance. As instructed, I have not invoked ADR awareness.

--- CLAUDE CODE INSTALLED-IMPROVEMENT USE PROOF ---
Invocation: $dough-adr-awareness.

Requested change: switch telemetry history from shared object storage to per-node files.

Conflicting repository-relative authorities on ARC-12's Standing:
- `architecture/decisions/CATALOG.md` (Standing column, ARC-12 row): **Replaced**
- `architecture/decisions/retain-complete-telemetry-history.md` (Standing field): **Adopted**

Per `AGENTS.md`, the catalog and each record's `Standing` field are joint status authorities, and disagreement between them must stop work and be resolved by a human — not by this check. Separately, the ARC-12 decision text itself already prohibits switching to per-node files without a human-owned exception or a human-adopted replacement decision, so even the "Adopted" reading blocks this work outright.

Work is stopped pending resolution. Who owns precedence between the catalog's Standing column and the record's Standing field for ARC-12 — and do you want to update the catalog, the record, or record a governance exception in `governance/architecture-exceptions.md`?

No decision or implementation was changed.

--- CLAUDE CODE DELIVERY-TO-USE INTEGRITY PROOF ---
fixture source: file:///var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.5htu8Pn6jp/fixture-source
legacy release: v0.2.0
bootstrap release: v0.2.1 (commit 72b7c691009b9e01867f11b47c49d6b2d461c64f)
fixture release: v0.2.2
fixture release commit: 83e14a40bd07ec3f52714aa146b0ae92d1f87bc7
installed recognition: absent
preserved companion SHA-256: 6f267c87ad959d282d720b4cdb93a29b8dbc79c439822baa75a113d065189c61
PASS: legacy Claude Code refused the incompatible smaller candidate unchanged; the explicit inspected bootstrap installed the current two-skill updater; a fresh session ordinarily updated it to the newer release.
PASS: fresh native Claude Code discovered and invoked only the installed dough-adr-awareness skill; no original adr-awareness skill or installed recognition was present.
PASS: Claude Code enumerated both conflicting alternate-layout status authorities and their Adopted/Replaced values, stopped for human precedence, and changed no client project files.
PASS: final recognition is absent, all platform installations advanced together, and the companion integration remained byte-identical.

[exited with code 0]
