# Standardize the test optimization candidate record

**Source:** [Selected story](../../seeds/SEED-182-standardize-test-optimization-candidates.md#standardize-test-optimization-candidates)
**Identity:** SEED-182#standardize-test-optimization-candidates

## Goal and scope

One standard project record, `.planning/TEST-OPTIMIZATION-CANDIDATES.md`,
defined once in the optimization skill and used by the optimization pass,
`--resolve`, and story wrap-up, with the sections, entry fields, empty
convention, and missing/unreadable handling the story's Scope defines.

**Exclusions:** Migrating or inspecting existing findings anywhere, including
this repository's
[dashboard test timings](../../../docs/maintainer/dashboard-test-timings.md);
a validation or rewrite script; expiry of accepted costs; pass history beyond
Git; any test-runner exclusion mechanism; implementing recorded candidates;
release and client updates. No implementation until a later developer
instruction authorizes execution.

**Assumptions:** Guidance follows
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
(address the agent in its project; no maintainer vocabulary). Edits to the
declared skills begin as Proposed under
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md); the
new reference joins `install.sh`'s `managed_files` because declared guidance
links to it, as ordinary feature commits already do.

## Outside-in proof

The product is agent guidance, so each key example is proved by the
[behavior review](../../../AGENTS.md#behavior-review) walk: follow the changed
guidance from the trigger and confirm it produces the example's record state,
recording the walk in this plan's slice. Payload proof uses the existing
deterministic checks, run with Bash 5 first on `PATH`
(`/opt/homebrew/bin` on this machine):

```text
bash scripts/test.sh tests/payload-declaration-links.sh tests/update-adds-new-payload-skill.sh
```

No native-host (paid) run is part of this story.

## Ordered slices

### 1. An optimization pass writes and consults the standard record

Type: Behavior
Status: planned
Proof: behavior-review walk of key examples 1 and 4, and the writer's half of
example 5 (unreadable record stops the write), recorded here; the payload
command above passes.

Behavior: a project with no record → a default or profile-only pass that ends
with findings → the record exists at `.planning/TEST-OPTIMIZATION-CANDIDATES.md`
with `# Test Optimization Candidates`, a `## Latest pass` summary, each finding
as a slug-headed entry under `## Pending candidates` with the labeled fields,
and `None.` in the empty sections. A later pass reads it first, keeps accepted
costs unless it has new evidence, and replaces only `## Latest pass`.

Changes:

- New `src/skills/dough-test-optimization/references/candidate-record.md`:
  the single definition of path, heading, section order and meaning, entry
  slug and fields, `None.` convention, missing/empty/unreadable handling, the
  accepted-cost-is-not-an-exclusion rule, and the lifecycle (pending →
  accepted / excluded / transferred; transferred removed when its receiver
  closes). Keep it short with one compact template.
- `SKILL.md`: baseline step reads the record and its approved exclusions;
  "Verify and close" replaces "existing record or active plan" with writing
  the latest-pass summary and candidates to the record via that reference;
  a profile-only request also records its findings there.
- Add the reference to `install.sh` `managed_files` and to
  `tests/update-adds-new-payload-skill.sh`'s `new_managed_files`, beside
  `resolving-candidates.md`.

### 2. `--resolve` records each disposition in the standard record

Type: Behavior
Status: planned
Proof: behavior-review walk of key examples 2, 3 (through the transfer), and
5 (empty, missing, unreadable reports), recorded here.

Behavior: pending entries in the record → `--resolve` → each entry, same slug,
moves to `## Accepted necessary costs`, `## Profile-only exclusions` (only
when the project's mechanism was actually applied), or
`## Transferred obligations` linking the replacement plan, or stays pending
with its human decision; a missing record is reported as no recorded findings
without creating it; an unreadable or mismatched record stops without edits.

Changes: `references/resolving-candidates.md` reads and writes the record
through `candidate-record.md`, replacing "the project's candidate record, or
candidate entries in the relevant optimization plan", the remove-after-
disposition rule, and "established empty-section convention" with the
standard sections and `None.`

### 3. Wrap-up keeps findings across plan cleanup

Type: Behavior
Status: planned
Proof: behavior-review walk of key example 3's cleanup half: the original
plan's wrap-up leaves the transferred entry for a later pass, and the
replacement story's wrap-up removes it when its work is done or returns an
unfinished part to pending; the payload command above passes.

Behavior: a story whose plan holds optimization findings, or which receives a
transferred obligation, is wrapped up → before the before-cleanup commit,
findings only in the plan are in the record, and the received transferred
entry is removed or returned to pending; the record itself is never deleted
as spent history.

Changes: a short section in `src/skills/dough-story-wrap-up/SKILL.md`, after
"Settle an existing follow-up plan", linking to `candidate-record.md` for the
rules; update the optimization `SKILL.md` close text so it points at the
record instead of "the established follow-up location".

## Current decisions

- One owner for the format: `references/candidate-record.md`. Other guidance
  links to it and does not restate fields or sections.
- Entry references are kebab-case slugs, not allocated IDs.
- `## Latest pass` holds only the most recent pass.

## Decisive premises

- **Payload link proof discriminates.** Consuming operation:
  `tests/payload-declaration-links.sh`. Observed 2026-10-30 in this workspace
  with a scratch `candidate-record.md` linked from the optimization
  `SKILL.md`: undeclared → exit 1, `FAIL: declared
  dough-test-optimization/SKILL.md links to undeclared
  references/candidate-record.md`; declared in `install.sh` → exit 0. Scratch
  edits reverted.
- **Fixture list accepts the new file.** Consuming operation:
  `tests/update-adds-new-payload-skill.sh`. Observed 2026-10-30 with the
  scratch file declared in both lists → exit 0 (2.6 s). Reverted.
- **Shell tests need Bash 5.** `scripts/test.sh` refuses `/bin/bash` 3.2
  (observed); `/opt/homebrew/bin/bash` first on `PATH` runs them.
- **Wrap-up has a pre-commit place for record edits.** "Commit closure inputs
  and preserve Git recovery" commits owned closure-input changes before
  deletion, and "Delete spent history" lists what is deleted, which does not
  include project records like this one (read 2026-10-30).

## Concern evidence

Slice-plan refinement did not run: each slice owns one consumer's behavior and
one review walk, sharing the format slice 1 introduces, and no cumulative
design concern was found. Remaining concern: none. Interim behavior: between
slices 1 and 2, `--resolve` still reads the record through its older generic
wording, which already accepts "the project's candidate record"; slice 2
replaces it.
