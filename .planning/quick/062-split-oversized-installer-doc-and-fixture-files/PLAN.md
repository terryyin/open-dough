# Split installer doc and host-hooks fixture files past the 250-line convention

Status: planned. No execution has started or been authorized.

## Source and scope

Execution retrospective of the gate-and-deliver scripted backlog plan
(SEED-008), recoverable at the range
`a3c732c:.planning/quick/060-gate-and-deliver-scripted-backlog/PLAN.md`
(and its Git range `dac740b..39e9b9e` on the now-deleted
`quick/060-gate-and-deliver-scripted-backlog` branch history). Review
date: 2026-09-19. That plan's 8 slices were all delivered and CI-confirmed
green, and wrap-up has since integrated and deleted its spent history; this
is a follow-up correction for file-size residue found during the
retrospective's aggregate refactoring-smell assessment, not a reopening of
its completed slices.

Found by comparing every file in the execution's aggregate diff against this
project's 250-line convention (`dough-post-change-refactor/references/refactor-checks.md#file-size`):

1. `docs/installation-and-updates.md` grew from 233 lines (before this
   execution) to 271 lines (21 over), through incremental additions across
   two different slices of the reviewed plan: slice 5 added 35 script-file
   bullet entries and slice 7 added 2 more, each to the same
   "payload in each root is exactly" enumeration. Neither slice's own
   refactor pass re-measured this shared, cumulatively-edited file against
   the convention, since neither slice's own diff alone crossed the
   threshold.
2. `tests/helpers/host-hooks-fixture.bash` was already 430 lines before this
   execution started — a pre-existing violation, not introduced by it — and
   grew to 448 lines through a CI-repair commit
   (`de7d819`) that fixed a real defect in this file without addressing its
   size.
3. `src/skills/dough-execute-plan/references/trunk-publication.md` remains
   at 276 lines (26 over). This was already disclosed during that plan's
   slice 6 (not a new finding here) with a documented reason: 13 external
   cross-references into 8 of its specific headings from 5 other files made
   a safe split outside that slice's narrow authorized scope. It remains
   open.

Goal: bring all three files under the 250-line convention through cohesive
splits, preserving all existing content and behavior. This is a structural
cleanup, not a behavior change; no new product capability is in scope.

The Bash-version masking correction has been completed independently under the
current instruction to settle the first backlog item proportionally. Its plan
is recoverable at
`946015e:.planning/quick/063-prevent-bash-version-masked-test-failures/PLAN.md`.
This file-size cleanup remains queued with its own unchanged outcome.

## Decisions that constrain execution

- Preserve every existing cross-reference. `trunk-publication.md`'s split
  requires updating the 13 known incoming links from 5 other files
  (identified during slice 6; re-confirm the current set at execution time
  before splitting).
- Split along cohesive seams (one concept per file), not arbitrary line
  cuts. Keep each split file's own heading and content intact; do not
  summarize or drop material to fit the limit.
- No functional/behavioral change. Verify with the existing test suite
  (`tests/dough-update-guidance-payload.sh`,
  `tests/install-ci-host-hooks.sh`, and the broader suite these files
  support) rather than new proof.

## Ordered slices

### 1. Split the installer payload enumeration out of installation-and-updates.md
Type: Refactor
Status: planned
Proof: `bash tests/dough-update-guidance-payload.sh`; `wc -l docs/installation-and-updates.md`

Extract the long "payload in each root is exactly" file enumeration into its
own reference (or otherwise restructure along a cohesive seam), leaving
`docs/installation-and-updates.md` at or under 250 lines with all content
preserved and all incoming links updated.

### 2. Split tests/helpers/host-hooks-fixture.bash
Type: Refactor
Status: planned
Proof: `bash tests/install-ci-host-hooks.sh`; `bash tests/install-all-tools.sh`;
`bash tests/execution-payload-update.sh`; `bash tests/update-skip-verified.sh`;
`wc -l tests/helpers/host-hooks-fixture.bash`

Split this fixture helper along a cohesive seam (for example: seeding
helpers vs. assertion helpers), updating every sourcing test file, with no
behavioral change to any of its currently-passing callers.

### 3. Split trunk-publication.md
Type: Refactor
Status: planned
Proof: representative guidance review confirming all 13 known cross-references
still resolve; `bash tests/dough-adr-awareness-context.sh` (or the current
equivalent guidance-payload check)

Split along the seam identified during the originating plan's slice 6 (8
specific headings this file owns), updating the 13 known incoming links
from 5 other files. Re-confirm the current cross-reference set at execution
time rather than assuming it is unchanged from slice 6's review.

## Sizing, stopping points, and remaining concerns

Three planned Refactor slices, each independently safe to stop after: none
depends on another's completion. No supplied numeric target or hard limit.
This is mechanical structural cleanup with existing test coverage as proof;
it does not require new behavioral tests.

Execution requires separate authorization. When authorized, retain the
established project execution/refactor/delivery gates and run the listed
proof per slice. Planning alone performs no commit, push, or file split.
