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

## Pending native logging acceptance

Broader native acceptance of execution guidance-release provenance, mixed
local/internal finding codes, project-configured process-review selection,
and bounded process-log recording remains with
[Story 2](../../../.planning/seeds/SEED-010-learn-from-execution-retrospectives.md#use-released-retrospective-log).
Shipping the reference and prior logging evidence do not establish those
changed requirements.
