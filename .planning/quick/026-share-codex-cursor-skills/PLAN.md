# Share installed skills between Codex and Cursor

**Source:** Terry Yin's 2026-09-08 follow-up to Quick 025: use Cursor's support
for `.agents/skills/` to remove the redundant Cursor installation.
**Status:** Planned; ready for direct execution. Planning only.

## Goal and scope

Install once from any supported tool and support all three with two physical
skill roots: `.agents/skills/` for Codex and Cursor, `.claude/skills/` for Claude
Code. Retain one shared product source and ordinary all-tool updates. Migrate
existing v0.2.3 installations and older Cursor-only installations safely.

Exclude product skill behavior changes, symlinks, configuration, native harness
repairs, a comprehensive scenario matrix, and release/tagging. Do not change
`../random`; Terry is testing manually. Keep client edits uncommitted.

## Current decisions and constraints

- Cursor documents `.agents/skills/` as a project discovery location:
  [official skill directories](https://cursor.com/docs/skills#skill-directories),
  checked 2026-09-08. This is documentation evidence, not native acceptance.
- Keep `--platform cursor` compatible, but map its normal destination and source
  record to `.agents`. Iterate distinct physical destinations once so Codex and
  Cursor sharing a root does not double-copy, double-verify, or double-write it.
- When `.agents` is absent and a legacy Cursor updater invokes an ordinary
  no-URL update, read its `.cursor/skills/dough-update/SOURCE` as migration input.
  Never infer a source from the client remote. If both roots exist, require
  compatible verified records before ordinary migration; do not hide a bad
  canonical record by falling back to the legacy one.
- Verify legacy managed payload against its recorded immutable release before
  ordinary migration. Preflight unsafe paths, edited/incomplete payload,
  conflicting SOURCE, and newer legacy versions before any target writes.
  Existing explicit-force recovery semantics remain available; no silent force.
- After both required roots verify, retire only known release-owned Open Dough
  files/records under `.cursor/skills/`. Preserve unrelated skills, rules, extra
  files, and parent directories. Do not delete the whole `.cursor` directory.
  Removal failure must report incomplete migration, retaining truthful records;
  do not claim success with a stale discoverable updater left behind.
- Fully current two-root installs remain unwritten on repeat updates. Equal
  version is not a reason to skip retirement of a verified redundant Cursor copy.
- Cursor also discovers `.claude/skills/`. This plan removes the unnecessary
  third copy; it does not assume that the remaining two roots cannot cause
  duplicate discovery. Record actual Cursor resolution during manual testing.

[ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md) preserves human ownership.
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) retains
immutable latest numeric releases and human version choice.
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) and the
repository guard require shared behavior and per-platform evidence. This layout
is consistent with those constraints. ADR 0004 remains Proposed; update any
affected layout wording without changing its status.

The owner's simplified-validation instruction carries forward: focused
deterministic checks and lint only, no automated native acceptance runs.
Native results remain pending for Terry's manual testing. This does not waive
evidence truthfulness or authorize publication of a new release.

## Ordered slices and outside-in proof

### 1. Fresh installation uses two roots for three tools
Type: Behavior
Status: planned
Proof: Extend `tests/install-all-tools.sh`: omitted platform and each supported
platform value produce identical payload plus SOURCE/VERSION in `.agents` and
`.claude`, with no managed `.cursor` copy. Preserve unrelated sentinels.

Behavior: Clean project → install from any tool → both required roots exist and
Codex/Cursor share one installation record. Adjust destination mapping and
distinct-destination iteration in `open-dough-platform.sh` and affected installer
callers. Align fresh-install assertions, shared updater instructions and docs
with the new paths in the same slice. Keep existing failure/containment checks.

### 2. Existing installations converge on the shared layout
Type: Behavior
Status: planned
Proof: Extend the existing tagged update fixture: clean v0.2.3 three-root install
→ newer release → two verified roots and no obsolete managed Cursor copy.
Use a Cursor-only baseline variation to prove remembered-source bootstrap.
Repeat the resulting ordinary update and assert no writes.

Behavior: Verified old installation → update from any tool → canonical shared
roots are current and the redundant Cursor payload is retired. Include the
source-lookup fallback, verification of the legacy root, and narrowly scoped
retirement in this single migration path. Reuse existing baseline and retirement
helpers; do not introduce a generic migration system. Align affected callers,
update instructions and compatibility assertions at this boundary.

### 3. Migration preserves client changes and reports failures truthfully
Type: Behavior
Status: planned
Proof: Apply the existing refusal/failure fixtures to the legacy Cursor root:
edited payload, conflicting source, newer version and unsafe topology refuse
before writes. One retirement-failure injection reports non-success. Explicit
force restores the intended managed layout without deleting unrelated files.

Behavior: Legacy state cannot migrate ordinarily → update → actionable refusal
or truthful incomplete outcome, preserving unrelated content. Retain the shared
preflight, no-downgrade and opt-in force rules. Keep these targeted checks; no
cross-product of every error and invoking tool. Finish before manual handoff.

### 4. Hand off a candidate for manual discovery and use
Type: Behavior
Status: planned
Proof: Focused changed install/update/refusal checks and lint pass. Record the
candidate commit and fill the evidence table with actual observations only.

Behavior: Implementation complete → handoff → Terry can test a single install
in fresh Codex, Cursor and Claude Code sessions. Use `$dough-update` in Codex
and `/dough-update` in Cursor/Claude Code. Observe discovery, the loaded path,
invocation, useful ADR-guided application with no source checkout, and update
coexistence. Record Cursor duplicate-resolution behavior explicitly. A new
published release is needed for the normal GitHub flow; do not tag one here.

## Per-platform acceptance

| Platform | Required installed location | Deterministic installation/update/coexistence | Native discovery, invocation/application and behavior |
| --- | --- | --- | --- |
| Codex | `.agents/skills/` | Pending slices 1–3 | Pending manual observation |
| Cursor | Shared `.agents/skills/` | Pending slices 1–3, including legacy retirement | Pending manual observation; record resolved path and duplicates |
| Claude Code | `.claude/skills/` | Pending slices 1–3 | Pending manual observation |

Earlier single-root and three-root acceptance does not prove this changed
topology. Reuse only unaffected skill-behavior evidence with a stated reason;
no native pass follows from byte equality or documentation alone.

## Sizing and learnings

Target roughly five minutes active work per leaf; reassess at five and stop at
ten to split newly discovered independent work unless test runtime explains
the overrun. Slice 2 is one migration proof loop with two baseline variations;
reuse existing verification/retirement machinery to keep it bounded. No preceding
Structure slice is needed. Do not require the full suite or native automation.

Current implementation maps three platforms to three destinations and iterates
all three. Changing only Cursor's mapping would visit `.agents` twice and leave
old `.cursor` copies behind; destination deduplication and migration are both
necessary. This plan changes the installed layout, not the all-three-tools goal.
