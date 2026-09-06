# Install the Open Dough update placeholder

Status: in progress — first installation verified; repeat protection next.
Source: [SEED-001, Story 1](../../seeds/SEED-001-install-and-update-open-dough.md#install-from-github).

## Goal and scope

Install Open Dough's `dough-update` placeholder into a project for Codex.
Installing again stops with a warning; `--force` overwrites the installed file.
Use Open Dough itself to demonstrate the complete flow and learn from it.

Only this placeholder is included. Real updating, versions, migration, merging,
additional rules, other platforms, and a comprehensive edge-case suite wait.

## Execution context and decisions

- There is no existing installer, runtime, or test framework. Use Bash and Git
  already available in the development environment; introduce no package stack.
- Start with a cloneable public GitHub repository URL. A documented shallow
  clone into a temporary directory obtains its default branch; run that copy's
  `install.sh --target <project> [--force]`. This honors the supplied repository
  URL without adding a URL resolver or release lookup.
- Keep distributable content at `skills/dough-update/SKILL.md`. The installer
  reads it relative to its own location and copies it to
  `<project>/.agents/skills/dough-update/SKILL.md`. Source and installed output
  remain separate even when Open Dough installs itself.
- Use that skill directory's existence as the simple already-installed check.
  Write only this skill's destination; do not replace the whole `.agents` tree
  or create root agent instructions/global configuration.
- The skill has `name` and `description` metadata and instructions to report
  that updating is not implemented. Codex supports repository-local
  `.agents/skills` discovery: [official skill documentation](https://learn.chatgpt.com/docs/build-skills).
- Follow [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md).
  Using the refined story's recommended `dough-update` name does not change
  ADR 0001's Proposed status.

## Ordered slices

### 1. Install and invoke the placeholder
Type: Behavior
Status: done
Proof: A focused installer check in a temporary target observes the supplied
skill content at the project-local destination. A fresh Codex session discovers
it and invocation reports that updating is not implemented.

Observed 2026-09-06: `bash tests/install.sh` passed (matching source content,
unrelated sentinel preserved, invoked outside the checkout). Skill metadata
validation and Bash syntax checks passed. A fresh bundled Codex CLI 0.153.4
session in a temporary installed target invoked `$dough-update` and returned
"Updating Open Dough is not implemented yet." No commands or edits were made
by the invocation. Independent refactor review found no changes needed.
GitHub self-install demonstration remains in final delivery below.

Behavior: A target has no Open Dough installation → run the source checkout's
installer for that target → the update placeholder is available in Codex.

Add the minimal source skill, `install.sh`, and a small `tests/install.sh` shell
check that drives the real installer. Document the GitHub clone/install command
and skill invocation in README. In the same temporary-target check, keep one
unrelated sentinel file and observe that installation preserves it.

### 2. Stop an ordinary repeat installation
Type: Behavior
Status: planned
Proof: Run install again against the populated target; observe a warning,
nonzero exit, and unchanged installed content.

Behavior: Open Dough is installed → run install without override → it stops
and tells the maintainer how to explicitly reinstall.

Add the simple directory-presence guard and extend the same shell check.

### 3. Overwrite when the maintainer insists
Type: Behavior
Status: planned
Proof: Edit the installed placeholder, then run install with `--force`; observe
that its contents match the supplied source again.

Behavior: Open Dough is installed → explicitly force installation → the supplied
placeholder replaces the previous installed content without merging.

Add the override, extend the shell check, and document the forced form.

## Verification and delivery

Run `bash tests/install.sh` as the focused proof as each behavior is added.
The checks correspond to the three behaviors above; no new test framework.
Use temporary targets for overwrite checks, not the maintainer's working files.

After the implementation is available at the GitHub URL, follow the documented
clone/install command into Open Dough itself and invoke `dough-update` in a fresh
Codex session. This completes Story 1's first example; slices 2–3 cover its
repeat-install example. Record the observed result here before marking the
story complete. Local file-copy checks alone do not prove Codex discovery or
the GitHub entry point.

Each slice targets roughly five minutes of implementation and focused checking.
Native-session and network demonstration time may be longer. No Structure
slice is needed. The refinement-trigger review found no reason for another
planning pass; refine an individual slice if execution exposes unexpected work.

During execution, use Donut's execute-plan workflow for slice review and wrap-up,
with this repository's focused shell check rather than Donut's application
tooling. Keep progress in this PLAN; when complete, record the outcome in the
home story/backlog and trim spent planning detail.

## Learnings

- The standalone Codex CLI 0.144.1 cannot invoke the configured model; the
  desktop app's bundled CLI 0.153.4 successfully verified the skill instead.
- This repository has no CI workflows or formatter; use the focused Bash test,
  syntax checks, and diff whitespace check for local verification. Donut's
  application formatter and CI observer do not apply.
