# Recognition: dough-execution-retrospective

Review: ready for maintainer review

## Original clues

- Original skill: `execution-retrospective`
- Source project: Doughnut
- Source path: `.agents/skills/execution-retrospective/SKILL.md`
- The source reconstructs deleted or partial plan evidence, reviews related
  execution commits as one outcome, and plans only unresolved findings.

## Purpose

Review one completed or unfinished planned execution, or a completed quick
execution whose plan never existed, against its original story; separate
implementation findings from process improvements and product learning; route
only unresolved bounded implementation work back into planning; record
supported process findings locally; and return product recommendations without
unauthorized backlog writes.

## Triggers

- "execution retrospective" or "review this execution"
- Record a supported retrospective process finding in `DearDough.md`
- Product review or backlog recommendation from an execution
- `--skip-process` or `--skip-product` on a retrospective
- Project `open-dough.json` or `skipProcessRetrospective` for process review
- Invalid or unreadable process configuration on a retrospective
- 500-line warning, 1,000-line ceiling, or recoverable replacement on `DearDough.md`
- Audit of a completed or unfinished plan's aggregate result
- Recovery of an executed plan from partial names, story phrases, commits, or
  Git history after normal cleanup
- Review of a completed quick execution from current or supplied chat history
  without reconstructing a plan

## Distinguishing behavior

- Uses eight decision principles, including product learning is not an
  implementation defect and direction is a criterion, not a deliverable.
- Rechecks findings at the current revision, updates an unfinished plan in
  place, and permits a follow-up plan only for a completed execution. Planless
  execution with unresolved completion stays evidence-limited rather than
  acquiring a reconstructed or corrective plan.
- Keeps repository findings, process proposals, product recommendations, and
  overlooked user attention distinct, and never executes planned corrections.
- Records supported process findings in one project-local `DearDough.md` with
  stable issue and execution identities. New occurrences record the Open Dough
  guidance release used during the reported execution. Interpretable logs retain
  IDs (including an adopted `ODF-NNN` heading), notes, evidence, unrelated
  entries, and release-bearing rows while same-execution rereview stays one
  row; distinct proven recurrence adds a row under the matched heading; a new
  unmatched finding receives the next unused local `DD-NNN` that does not
  collide with or fill a renamed heading's number. The public skill does not
  mint `ODF-NNN` or read an internal naming record. Process skip, unresolved
  process selection, no findings, unresolved identity or location, ambiguous
  content, and write failure do not become successful writes or suppress
  independent reviews.
- Resolves process review from this project's optional
  `<established-planning-directory>/open-dough.json`
  (`skipProcessRetrospective`) together with `--skip-process` and an explicit
  include-process request, before any process analysis or log access. Invalid
  or unreadable config leaves process unresolved: report the error, skip
  process and log access, and continue independent reviews. Explicit invocation
  instructions override the stored preference without editing the file.
  Product skip remains independent. A file beside the installed skill is not
  this project's configuration. The file is outside managed payload lists;
  ordinary install/update and supported `--force` replacement preserve its
  bytes or absence so later selection still uses the same preference.
- After constructing a supported process-log candidate, warns when the existing
  log is already at least 500 physical lines and never writes a result over
  1,000. Below 500, ordinary recording has no threshold warning even if the write
  crosses 500. An overflowing candidate or already oversized file is retained
  only when higher-priority new information can replace recoverable lower-priority
  material without losing interpretable identity; otherwise it is refused
  without mutation and reported as `not recorded`/`unchanged` with the reason.
  No-findings and identical rereview stay no-op; skipped or unresolved process
  review does not inspect size. Removed IDs are not reused; a rereview of a
  pruned execution does not resurrect a pruned occurrence.
- A retrospective authorizes product recommendations only; backlog writes require
  separate authority. Missing direction means alignment cannot be assessed.
  Missing backlog conventions keep product conclusions provisional. Neither
  invents files.

## Client project context

The executing project must supply its story locations, repository navigation,
focused verification commands, and any writer/reviewer assignment. Planned work
also supplies plan location, format, lifecycle, and status vocabulary. Quick
work supplies a canonical story and current or supplied conversation evidence
that planless execution was explicitly selected. Git history or equivalent
execution provenance must be available. Near-future direction is required to
assess alignment in every enabled review. Backlog/story conventions are required
only for product conclusions that depend on them. Process recording also needs
one unambiguous canonical `DearDough.md` location and a stable execution identity;
missing evidence stops recording, not the remaining reviews. A process write
also needs the existing log and complete candidate measured as physical lines,
including blanks, metadata, and an unterminated last line. Bounded retention
also needs a usable recovery reference that contains any affected uncommitted
bytes, interpretable retained identity, and enough lower-priority material;
missing recovery or unsafe identity stops the write, not the remaining reviews.
Process-review preference is optional project configuration at
`<established-planning-directory>/open-dough.json`, defaulting to
`<project-root>/.planning/open-dough.json`. Missing file or key is default-on.
Do not read a file beside the installed skill, create a missing file, or repair
an invalid one during retrospective. The Open Dough
`dough-post-change-refactor` and `dough-slice-planning` skills supply the smell
and planning gates.

## Differences that rule out replacement

The rewrite follows ADR 0001's Proposed vocabulary boundary: this recognition
record uses maintainer terms, while the runtime skill addresses the agent in
"this project." It does not carry Doughnut's `.cursor` topology, fixed planning
paths, Nix and pnpm commands, stack map, generated API conventions, or subsystem
names.

Under ADR 0003 the revision remains Proposed in `src/skills/` and outside the
client payload. Under ADR 0006 the runtime skill is principle-led, links to the
authoritative refactoring and planning behavior instead of repeating it, and
keeps provenance in this recognition record. The unchanged Doughnut source
remains authoritative for that project unless separately replaced there.

## Validation needed

Walk representative planned and planless retrospectives. For planned recovery,
let a partial capability phrase resolve one cleaned-up plan and preserve the
unfinished-plan update path. For planless recovery, use current and supplied
chat-history variants, require explicit quick selection and a canonical story,
and do not reconstruct a plan. In both, exclude unrelated commits, constrain
missing-proof and ambiguous-attribution conclusions, and confirm that an
established completed execution may produce a bounded follow-up plan without
executing it. Verify invocation context, required project context, and the useful
outcome before promotion.

## Slice 1 local behavior evidence

Walked the updated skill on 2026-09-10 in worktree
`worktree-quick-034-retrospective-product-learning`. Inputs, observations, and
destination effects:
[evidence/slice-1/WALKTHROUGH.md](../../../.planning/quick/034-retrospective-product-learning/evidence/slice-1/WALKTHROUGH.md).

1. **Invocation.** Description and body now name product review and backlog
   recommendation alongside implementation retrospective. Recommendations-only
   authority is explicit; correction planning remains the only listed write.
2. **Required context.** Missing direction yields "alignment cannot be assessed";
   missing backlog conventions yield provisional product conclusions without
   invented files. Independent implementation review still proceeds.
3. **Useful outcome.** Quick 031 produced a traceable no-change product result
   with no backlog or direction edits. The urgent-fix fixture produced no
   queue investigation. The hypothesis fixture stayed an exploration proposal.

Existing implementation-review provenance and current-truth behavior were not
re-audited in this slice. Cross-tool verification is skipped for this story.

## Slice 2 local behavior evidence

Walked the shared direction-alignment home on 2026-09-10.
[evidence/slice-2/WALKTHROUGH.md](../../../.planning/quick/034-retrospective-product-learning/evidence/slice-2/WALKTHROUGH.md).

One authoritative skill section now applies to implementation, process, and
product. The digression fixture routed a contract extra to correction planning
and a process detour to a process recommendation, without editing direction. The
later-changed-direction fixture did not treat approved historical work as a
defect.

## Slice 3 local behavior evidence

Walked process-efficiency observations on 2026-09-10.
[evidence/slice-3/WALKTHROUGH.md](../../../.planning/quick/034-retrospective-product-learning/evidence/slice-3/WALKTHROUGH.md).

Repeated context recovery produced an actionable reuse recommendation with
qualified cost and no token requirement. Necessary investigation was not labeled
waste. Insufficient Quick 031 transcript was reported as a limit. No
`DearDough.md` write, guidance edit, or recursive retrospective.

## Slice 4 local behavior evidence

Walked authorized vs unauthorized product maintenance on 2026-09-10.
[evidence/slice-4/WALKTHROUGH.md](../../../.planning/quick/034-retrospective-product-learning/evidence/slice-4/WALKTHROUGH.md).

Authorized disposable backlog received only the intended queue/story edits
(add understood retry story, queue-remove charts while keeping SEED-A,
canonical SEED-B detail). Unauthorized copy stayed a proposal. Disputed
priorities stayed unresolved. Real product backlog and direction were not
written.

## Slice 5 local behavior evidence

Walked completion-after-correction-planning on 2026-09-10.
[evidence/slice-5/WALKTHROUGH.md](../../../.planning/quick/034-retrospective-product-learning/evidence/slice-5/WALKTHROUGH.md).

Unfinished and completed variants produced the correct plan destination and
still reported product/process results. The correction was not executed.
Resolved current-truth produced no duplicate plan. Completion marker remains
last except for the gated attention banner.

## Slice 6 local behavior evidence

Walked the four selection combinations on 2026-09-10.
[evidence/slice-6/WALKTHROUGH.md](../../../.planning/quick/034-retrospective-product-learning/evidence/slice-6/WALKTHROUGH.md).

Default, `--skip-process`, `--skip-product`, and both skips produced only the
selected results. Skipped product did not suppress direction in implementation
or process. Correction planning remained available. `DearDough.md` fixture
unchanged. Quick 031 slice-1 product no-change still applies.

## Quick 036 Slice 1 local behavior evidence

Walked first-log recording and its refusal boundaries on 2026-09-10.
[evidence/slice-1/WALKTHROUGH.md](../../../.planning/quick/036-record-retrospective-process-findings/evidence/slice-1/WALKTHROUGH.md).

The default and explicitly overridden destinations each received a readable
`DD-001` occurrence with stable execution identity, decisive evidence, observed
effect, and a qualified inference. No-findings, process-skip, missing-identity,
existing-log, and failed-write variants created no false success and preserved
their destinations. Product skipping did not suppress the enabled process write.
This is local behavior review of the Proposed source, not native cross-tool
acceptance or release evidence.

## Quick 036 Slice 2 local behavior evidence

Walked recurring-log maintenance on 2026-09-10.
[evidence/slice-2/WALKTHROUGH.md](../../../.planning/quick/036-record-retrospective-process-findings/evidence/slice-2/WALKTHROUGH.md).

The Slice 1 `DD-001` log was augmented with a human note and unrelated `DD-002`
entry. An identical rereview made no edit; new decisive evidence enriched the
original execution without adding a row; a distinct matching execution added a
second row. Similar but unproven symptoms became caveated `DD-003`. Existing IDs,
notes, evidence, and unrelated content remained intact. A malformed variation
stayed byte-identical with a recording limitation. This is local behavior review
of the Proposed source, not native cross-tool acceptance or release evidence.

## Occurrence execution metadata follow-up

Updated the occurrence format on 2026-09-10 after maintainer feedback. Every new
occurrence now identifies the tool that executed the work; it records the model
only when execution evidence supplies one. The reviewer does not substitute its
own tool, guess a model, or backfill historical rows without evidence. Missing
tool identity leaves the supported finding in the response without adding a
countable occurrence.

Behavior review: the occurrence-writing path clearly invokes the rule; required
context distinguishes executing tool from reviewing tool and treats model as
evidence-dependent; a representative Codex occurrence can record `Codex` and a
known model while the same record without model evidence omits only that line.

## Quick 041 Slice 1 local behavior evidence

Walked process-review selection from stored project preference on 2026-09-11
in worktree `worktree-quick-041-bound-process-log-and-configure-review`.
Inputs, observations, and destination effects:
[evidence/slice-1/WALKTHROUGH.md](../../../.planning/quick/041-bound-process-log-and-configure-review/evidence/slice-1/WALKTHROUGH.md).

1. **Invocation.** Description names `open-dough.json` and
   `skipProcessRetrospective` beside the independent skip flags. Selection
   happens before process analysis or any `DearDough.md` access.
2. **Required context.** Established planning directory defaults to
   `.planning`; a different established directory wins. Missing file or key is
   usable default-on, not a stop. Invalid or unreadable config stops only process
   selection and leaves independent reviews running.
3. **Useful outcome.** Stored `true` skips process and log access; explicit
   `--skip-process` still skips when the file says `false`; explicit
   include-process runs process this invocation without editing the file;
   unknown keys stay byte-identical; a skill-adjacent file is ignored.

This is local behavior review of the Proposed source, not native cross-tool
acceptance or release evidence. Slice 2 owns the warning and ceiling walked
below. Slices 3–4 own priority replacement and install/update preservation.

## Quick 041 Slice 2 local behavior evidence

Walked bounded process-log recording on 2026-09-11 in worktree
`worktree-quick-041-bound-process-log-and-configure-review`. Inputs, measured
line counts, checksums, and destination effects:
[evidence/slice-2/WALKTHROUGH.md](../../../.planning/quick/041-bound-process-log-and-configure-review/evidence/slice-2/WALKTHROUGH.md).

1. **Invocation.** Description names the 500-line warning and 1,000-line
   ceiling beside process recording. The recording section loads the size/write
   rule only for an enabled process write.
2. **Required context.** A candidate write needs an interpretable log and a
   complete candidate whose physical line count can be measured, including
   blanks, metadata, and an unterminated last line. Missing process selection
   still stops before any log or size inspection.
3. **Useful outcome.** 499→507 recorded with no threshold warning. Existing 500
   and 999 warned and recorded within the ceiling, including an accepted
   1,000-line candidate. A 1,001-line candidate and a 1,020-line existing file
   stayed byte-identical with `not recorded`/`unchanged` reasons. No-findings,
   identical rereview, and skipped process did not inspect size as a write.

This is local behavior review of the Proposed source, not native cross-tool
acceptance or release evidence. Slice 3 owns priority replacement; this
walkthrough refuses overflow rather than repairing it.

## Quick 041 Slice 3 local behavior evidence

Walked bounded retention on 2026-09-11 in worktree
`worktree-quick-041-bound-process-log-and-configure-review` against an isolated
Git fixture, not this worktree's history. Inputs, measured counts, recovery
refs, and ID observations:
[evidence/slice-3/WALKTHROUGH.md](../../../.planning/quick/041-bound-process-log-and-configure-review/evidence/slice-3/WALKTHROUGH.md).

1. **Invocation.** Description names recoverable replacement of lower-priority
   material when a write would overflow. The same candidate-write flow loads
   retention only after an enabled process write would exceed 1,000 lines.
2. **Required context.** Bounded retention needs a usable recovery reference
   that contains any affected uncommitted bytes, interpretable retained
   identity, and enough lower-priority material. Missing recovery or unsafe
   identity stops the write, not independent reviews.
3. **Useful outcome.** A 995-line committed log plus a severe finding overflowed
   to 1,010, then a bounded write of 58 lines recorded DD-005 after removing
   whole-issue DD-001 (top), redundant occurrence `dd002-c`, and whole-issue
   DD-004 (highest code). Recovery from `git show 90d2b82…:DearDough.md` held
   the removed bytes. Rereview did not resurrect pruned rows; DD-003 kept its ID
   with two honest rows; a decisive match recovered DD-001 without a new ID;
   the next unmatched issue allocated DD-006. Refusal variants left original
   bytes unchanged.

This is local behavior review of the Proposed source, not native cross-tool
acceptance or release evidence. Slice 4 owns install/update preservation.

## Quick 041 Slice 4 local behavior evidence

Walked install/update preservation of the optional project preference on
2026-09-11 in worktree
`worktree-quick-041-bound-process-log-and-configure-review`. Inputs, byte
comparisons, and selection after retention:
[evidence/slice-4/WALKTHROUGH.md](../../../.planning/quick/041-bound-process-log-and-configure-review/evidence/slice-4/WALKTHROUGH.md).

1. **Invocation.** Installation docs name optional
   `<established-planning-directory>/open-dough.json` (default
   `.planning/open-dough.json`) when installing or updating. They reuse the
   skill's single JSON example and link
   [Select reviews](SKILL.md#select-reviews) instead of restating defaults,
   flags, or invalid-file handling.
2. **Required context.** The path is the project being installed or updated,
   not a skill directory and not the Open Dough source checkout. Missing file
   is usable absence. Codex, Cursor, and Claude Code share that one file.
3. **Useful outcome.** Real `install.sh` and `apply` operations, including
   `--force`, left retained `true` plus unknown keys byte-identical
   (`46079f7c…`, same as Slice 1 variant 7) and left absence absent. Walking
   Select reviews on the retained file still skips process and does not access
   `DearDough.md`. No managed-payload list gained `open-dough.json`; installer
   behavior was not changed.

This is local behavior review of the Proposed source, not native cross-tool
acceptance or release evidence. Fresh native use after update remains pending
Story 2.

## Pending native logging acceptance

Execution guidance-release provenance and mixed local/internal finding codes
remain source-only behavior. Native acceptance and public release belong to
[Story 2](../../../.planning/seeds/SEED-010-learn-from-execution-retrospectives.md#use-released-retrospective-log).
Prior logging evidence does not establish these changed requirements.

## Quick 040 Slice 2 local behavior evidence

Walked the planless-recovery boundary on 2026-09-11 using the Quick 040 Slice 1
story and change as an authoring fixture. This is a source review, not a claim
that Slice 1 itself ran planlessly.

1. **Invocation.** In the current-chat and supplied-history variants, explicit
   quick-path selection, the same canonical story, and the same delivered change
   selected planless recovery. Neither variant required or reconstructed a plan.
   A planned comparison still recovered Quick 040's executable plan, and a
   removed-plan comparison used Git history rather than being relabeled planless.
2. **Required context.** The planless variants recovered the story contract,
   approved conversation changes, commit membership, and proof. Nearby commit
   `cd5b176` was excluded because its finding-triage cleanup does not belong to
   the Slice 1 execution; proximity did not override provenance. In a variant
   with the required proof removed, completion and proof-dependent findings
   remained unresolved while independently supported review could continue.
   Ambiguous commit attribution likewise stayed outside the manifest.
3. **Useful outcome.** Established completed variants reach the unchanged
   implementation, process, and product reviews and ordinary completed-execution
   correction routing. Evidence-limited variants report the exact gap and create
   neither a reconstructed historical plan nor a premature correction plan.

Native behavior remains pending for Codex, Cursor, and Claude Code under
[Story 2](../../../.planning/seeds/SEED-010-learn-from-execution-retrospectives.md#use-released-retrospective-log).

## Quick 040 Slice 3 local behavior evidence

Walked retrospective recovery for the oversized quick-attempt fixture recorded
in execute-plan recognition and its ordinary remaining-work continuation.

1. **One execution boundary.** Recovery used the explicit quick selection and
   initial chat first, then the plan linked to the same canonical story and only
   its remaining work. Preserved quick-attempt work and proof were not invented
   as earlier planned slices, and the source transition did not create a second
   execution identity.
2. **Combined attribution.** The manifest used one boundary for every
   attributable commit, whether retained quick-attempt work was committed before
   or during the planned continuation, while the unrelated nearby change
   remained excluded. Completion required the finished remaining-work plan plus
   combined evidence for the original story, so a proof gap or ambiguous
   continuity limited only dependent conclusions.
3. **Comparison and stops.** Ordinary planned, wholly planless, and
   removed-plan recovery retained their existing rules. Unclear attribution did
   not widen the manifest, and a changed source outcome still stopped for human
   decision rather than being rewritten as a correction.

This is a local Proposed-source authoring walkthrough, not native acceptance.
Combined quick-to-planned retrospective behavior remains pending for Codex,
Cursor, and Claude Code under [Story 2](../../../.planning/seeds/SEED-010-learn-from-execution-retrospectives.md#use-released-retrospective-log).
