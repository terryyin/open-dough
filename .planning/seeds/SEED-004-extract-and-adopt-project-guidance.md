---
id: SEED-004
status: active
planted: 2026-09-06
planted_during: Parallel exploration of extracting existing project guidance
trigger_when: A real task benefits from reusable project guidance
scope: medium
---

# SEED-004: Extract useful guidance and use it on real work

## Goal

Turn one useful project practice into shared guidance, then use it on an actual
task. Keep source review and project-specific fixes manual. Shared skill behavior
follows the established Codex, Cursor, and Claude Code conventions.

## Stories

<a id="match-success-claims-to-promised-outcome-proof"></a>
### 20. Match success claims to proof of the promised outcome

**Status:** Complete in source on 2026-09-12 after explicitly authorized planned
execution. The linked plan retains comparative source review and delivery
evidence. Release/adoption, native acceptance, and measured token savings are
not claimed. Retrospective and story wrap-up remain separate.

**Goal:** Help an agent using Open Dough reach a correctly supported completion
claim with less total token expenditure: clear, correct instructions should lead
it to the smallest sufficient proof early, avoiding false completion, later
repair, repeated investigation, and unnecessary verification. The developer can
see what is established and what remains unproved. Shorter skill text is useful
only when it preserves correctness and reduces the work needed overall.

**Critical assessment:** Universal trust in completion is too broad to certify.
The selected occurrences establish evidence gaps and recovery work, not a common
root cause in skill wording or measured token waste. Existing
[proof ownership guidance](../../src/skills/dough-story-refinement/references/planning.md#own-executable-proof)
already requires observations for promises, and
[execution delegation](../../src/skills/dough-execute-plan/references/delegation.md)
already connects coverage to them. Adding another generic warning would increase
reading cost without establishing value. Prefer clarifying, replacing, or removing
ambiguous or duplicate instructions in the existing flow. If current guidance
already handles the cases efficiently, recommend no change with evidence.

**Confirmed occurrences:** Checked on 2026-09-12 against the source projects'
`DearDough.md` records and the following Git artifacts; historical runs were not
repeated. The linked findings below retain full provenance.

- **ODF-014, Pygardon / former DD-003:** `b6d24ac22`,
  `tests/test_ci_command.py`, tests a synthetic remaining PID through
  `CiCommandHelper.run`. Its quick-109 plan still records a combined ARM64 stop
  stall. The retrospective records the broader cleanup-success claim; the
  original conversation was not independently recovered. Later `2e06e144f`,
  `tests/test_ci_command_stop.py`, adds worker-directed signal delivery to public
  stop proof. This supports the specific signal-dispatch case, not every retained
  child-pipe cleanup failure.
- **ODF-011, Doughnut / former DD-005:** `b0dad96aaa`,
  `scripts/e2e-runner.test.mjs` and the quick-105 plan, records premature target
  resolution before provisioning, its repair, and a successful paired live run.
  The new fresh-worktree unit case proves reaching `startLifetime` using a
  stand-in; it does not alone prove real allocation and service readiness. The
  occurrence records failed live proof, repair, cache cleanup, and rerun. Do not
  attribute the separate cache failure solely to the missing provisioning case.
- **ODF-017, Pygardon / former DD-006 and Open Dough:** Pygardon's quick-111
  occurrence records a blocked retrospective after an update reported current.
  Open Dough `v0.3.9` links `references/bounded-process-log.md` from the skill but
  omits it from `install.sh`; `v0.3.11` includes it. The
  [released repair](../../CHANGELOG.md#0311---2026-09-11) is already delivered.
  This is a concrete installer omission as well as an example of an unsupported
  usability claim, not evidence that more agent instructions would prevent it.

**Historical-to-current comparison:** The `Own executable proof` section in
`dough-story-refinement/references/planning.md` and `Accept proof` in
`dough-execute-plan/references/wrap-up.md` are textually unchanged between current
source and both Open Dough `v0.3.6` / `v0.3.12`. The same text is present in the
recorded installed snapshots: Pygardon `f5fd66e60` and Doughnut `be7234f7f2`, under
`.agents/skills/`. Therefore those two cases cannot be dismissed as already
addressed by newer wording. Snapshot presence does not prove the agent loaded
or followed the sections during the original execution.

Current instructions say to compare assertions and enough setup to identify the
boundary, but leave the agent to infer whether a fixture has supplied behavior
that the product promises to perform. The bounded correction is to make that
inference explicit at proof selection and reuse it at acceptance, preserving the
existing rejection of incomplete proof and unnecessary reruns. This is a
clarity opportunity evidenced by the text and occurrences, not a claim that
current guidance invariably fails. The installer repair remains a preservation
example; no further installer work is justified by this comparison.

**Scope:** Improve only the existing proof-selection and completion-reporting
instructions where these cases expose a useful correction or simplification:

- Match the intended claim to the observed path, including setup the product
  promises to perform and completion at the boundary the caller relies on.
  Choose the smallest sufficient proof early; reuse relevant existing evidence.
  A focused inner test remains sufficient for an inner contract.
- If a seam or fixture bypasses promised behavior, obtain the missing observation
  within authorized work. If it cannot be obtained, report the covered result
  and specific unproved promise. That promise remains incomplete; honest
  reporting neither fulfills it nor authorizes dropping it.
- Permit success supported by adequate evidence without another broad suite,
  repeated investigation, mandatory report, or approval step. Keep shared
  instructions in their existing home and align callers only as necessary.

**Delivery boundary:** A focused shared-source improvement, if justified, and
representative behavior review under the maintainer guideline. Release and
real-project adoption remain separate. No new skill, evidence schema, benchmark
infrastructure, workflow-wide audit, full lifecycle/per-host certification,
installer redesign, or source-project repair/replay is promised. Source-project
history is evidence to inspect, not work to reenact. A newly discovered concrete
installer defect belongs with SEED-001's installation contract. The next backlog
story owns reconsideration of the premise and finish line.

**Key examples:**

- **Public completion:** An inner deadline passes while public settlement is
  unobserved → assess public stop completion → identify the uncovered caller
  path and obtain focused settlement proof or leave that promise unproved.
- **Provisioning:** A test supplies an allocated target → assess fresh-start
  success → identify the bypassed allocation and seek proof including it. Reuse
  that test for the narrower already-allocated case; do not discard useful proof.
- **Installed use:** Version metadata passes but a required invocation reference
  is absent → assess usable installation → identify the affected invocation as
  unsupported. Do not reopen the shipped repair or audit unrelated skills.
- **Sufficient evidence:** Available evidence includes the promised setup and
  completion for the stated case → report that outcome without rerunning it or
  extending the claim to other failure modes. This is a comparison case, not an
  additional historical occurrence.

**Evaluation:** Compare current guidance and any proposed revision on the same
cases with the same supplied evidence. Inspect the resulting claim and next
action, not just whether the wording mentions proof. Review both:

- **Language efficiency:** Instructions are clear, correct, actionable where
  needed, and free of avoidable duplication. Compare the changed text and any
  required reference reads; fewer words alone do not establish an improvement.
- **Total token efficiency:** Compare the work induced: context reads, reasoning
  and reporting, tool calls and output, repeated tests, and correction loops.
  Prefer a small instruction cost that prevents larger wasted work. Use actual
  token totals when available for comparable runs; otherwise record observable
  differences as a qualitative assessment, with no numerical savings claim.

A useful revision preserves correct decisions in all selected cases and shows
how it removes ambiguity or avoidable work without moving that cost into extra
reads or ceremony. Use existing review mechanisms; do not build measurement
infrastructure. Representative review cannot establish lower real-project token
use or recurrence rates. If no advantage over current guidance is demonstrated,
retain that result and recommend no change rather than manufacture a rule.

**Effort hypothesis:** Likely a small clarification or simplification if a
remaining gap is demonstrated; no execution estimate is promised.

**Depends on:** No new product prerequisite or active execution plan identified.

**Safe stopping point:** The reviewed source change supports the case-specific
claims with clear instructions and a supported efficiency rationale. Report
review limits; do not certify release, adoption, measured token savings, or
resolution of every historical finding.

**Open details:** No further product clarification is needed. Exact replacement
wording and its benefit are implementation judgments to assess against the same
cases. If a candidate is no clearer or merely repeats existing rules, simplify
it or retain the evidence-backed no-change outcome. Historical token totals and
the original Pygardon status conversation remain unavailable; they are not
prerequisites for this bounded source change and limit quantitative/causal claims.

**Slice plan:** [Match success claims to proof](../quick/039-match-success-claims-to-proof/PLAN.md).

**Findings:** [ODF-014](../../docs/maintainer/finding-names.md#odf-014--local-failure-proof-was-accepted-as-public-completion-proof),
[ODF-011](../../docs/maintainer/finding-names.md#odf-011--pre-satisfied-test-seams-hide-provisioning-order-defects),
and [ODF-017](../../docs/maintainer/finding-names.md#odf-017--certified-installations-omit-required-skill-references).
Grouped by related failure of evidence coverage; identities and historical
observations remain separate. Queued follow-up does not resolve these findings.

<a id="proudly-found-elsewhere-design"></a>

### 19. Strengthen architectural review after using the lightweight guidance

**Status:** Decomposed; deferred and not refined.

**Goal:** A developer gets useful architectural corrections and maintained
direction from normal review after the initial PFE and North Star guidance has
been used, without accumulating duplicate review work or stale instructions.

**Scope candidate:** Carry the remaining broader architecture-review work here:
review PFE use, whole-product domain cohesion, and North Star alignment in
post-change refactoring and execution retrospective; propose evidence-backed
corrections or direction updates; refine lifecycle handling where actual use
shows the minimal flow insufficient. Consider broader refactoring-authorization
alignment only for a demonstrated obstacle. Basic planning, execution stops,
coordinator updates, and ordinary retirement are already delivered by the
lightweight guidance. Do not assume every candidate extension is worth
implementing.

**Evaluation:** From actual use of the lightweight guidance, identify a concrete
missed architectural issue or unnecessary process step; refine this story around
a review result or simplification the developer can evaluate. Existing review
that already supplies the outcome is evidence to drop that extension.
**Depends on:** Evidence from using the delivered lightweight guidance. Its
completed source contract and plan are recoverable at
`7f672bf:.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md` and
`7f672bf:.planning/quick/044-lightweight-pfe-and-direction/PLAN.md`.
**Safe stopping point:** Any selected review improvement delivers its own useful
correction or reduced burden; no further process rollout is required.
**Effort hypothesis:** Uncertain until a concrete review gap is observed; no
S/M/L estimate without repository definitions and a refined outcome.
**Deferred decisions:** Which remaining extensions are justified, their concrete
examples, and the final bounded delivery scope. Tracking machinery, mandatory
per-story documents, partial wrap-up, and early termination remain excluded.

<a id="show-stories-as-taken-during-execution"></a>

### 14. Show queued work as taken when plan execution starts

**Status:** Done on 2026-09-10. Implemented directly at human direction without
a slice plan, reviewed in an execution retrospective, and closed through an
explicit one-off exception. New native acceptance was explicitly skipped.

**Goal:** A developer can distinguish a backlog item whose plan is being
executed from work that remains available in the queue.

**Scope:** Add a **Taken** section immediately above **Backlog list** in the
product-backlog layout and retain the section when it is empty. For a story or
bounded correction selected from the queue, execute-plan first resolves the
plan and confirms current execution authorization, then makes moving the
existing entry from **Backlog list** to **Taken** its first project-state
change. Preserve the entry's exact canonical link and identity, preserve the
order of entries already in **Taken**, append the moved entry, and never list it
in both sections. If it is already in **Taken**, resume without duplicating or
reordering it.

Refinement, initial slice planning, slice-plan refinement, and an unfulfilled
intent to execute do not change backlog placement. A context or authorization
failure before execution starts leaves the entry in the queue. After execution
starts, pauses and failures leave it in **Taken**; successful execution also
leaves it there for the existing retrospective and story-wrap-up lifecycle,
which removes completed work. Returning cancelled work to the queue remains an
explicit product-backlog maintenance decision. Executing work that was not
selected from the backlog does not fabricate a backlog entry.

Behavioral source changes are limited to `dough-product-backlog`,
`dough-execute-plan`, the minimum `dough-story-wrap-up` wording needed to remove
a completed **Taken** entry, and directly affected checks. It does not add a
general status model, owner metadata, timestamps, concurrency or locking,
automatic assignment, cancellation policy, finished history, release, or
adoption.

**Key examples:**

- Given the highest-priority entry is refined and then slice-planned, it remains
  first under **Backlog list** and **Taken** is unchanged.
- Given that queued entry and an authorized executable plan, starting execution
  moves the unchanged entry to **Taken** before implementation is delegated.
  This story's first execution performs the same
  transition as the bootstrap case.
- Given execution later pauses, fails, completes, or resumes, the entry remains
  once under **Taken**. Story wrap-up removes it after its existing completion
  conditions are met; only explicit backlog maintenance returns cancelled work
  to the queue.

**Completion:** Updated the shared product-backlog layout and transition,
execute-plan's first project-state change, and story-wrap-up's active-entry
removal. Recorded representative source walkthroughs for first execution,
pre-authorization failure, resume, non-backlog execution, and wrap-up. The
focused guidance, story-payload, and execution-payload checks passed; release
and adoption remain excluded. Commit `519bb4a` contains the implementation.
The retrospective recorded its process findings in `DearDough.md`; the human
authorized this story's planless execution as a one-off closure and directed
that its canonical story and **Recently done** entry remain.

<a id="plan-without-numbering-or-budget-prompts"></a>

### 13. Receive a slice plan without numbering or budget prompts

**Status:** Complete, 2026-09-10.

**Goal:** A developer requesting a plan receives it immediately when the story
and project planning location are known, without supplying a plan number or
inventing a numeric timing policy.

**Scope:** Reuse an existing active plan for the selected story. For a new plan,
use the next available number under the project's established numbering and
location convention, preserving padding and avoiding overwrite. A missing numeric
slice budget does not block planning: use cohesive slices with one observable
outcome and proof loop, report concrete uncertainty without a timing guarantee,
and honor any existing explicit limits. Align only directly contradictory shared
planning guidance. Exclude automatic execution, allocation tooling, new timing
defaults, unrelated feature promotion, and manual edits to installed copies.

**Completion:** Published `v0.3.5` from the reviewed bounded payload, then
updated this repository through its ordinary recorded-source updater. Both
native roots record `0.3.5`, the post-update self-installation check passed,
and a fresh installed Codex session created plan 033 without a supplied number
or numeric timing policy and without implementing the generated plan.


<a id="write-installed-skills-from-this-project"></a>

### 12. Write installed skills from this project's perspective

**Status:** Complete in source, 2026-09-09; implemented directly at human direction. Not yet released.

**Goal:** An agent using an installed Open Dough skill understands that its
instructions apply to this project, without maintainer-facing language implying
that it must locate or serve a separate client project.

**Scope:** Review externally distributed skills and their runtime references
under `src/skills/` for language written from Open Dough's internal maintainer
perspective. Fix “client project” and similar audience or location mistakes to
address the executing agent in this project. Check meaning in context rather
than doing only a literal phrase replacement: project guidance, paths,
decisions, and workflow context must resolve in the project where the skill is
being used. Keep an explicit distinction between this project and the Open
Dough source repository where the task actually needs both, such as updating.

Preserve useful behavior and required context; this is an audience/perspective
repair, not removal of checks for genuinely missing inputs or a redesign of
planning and execution policy. Apply the same review to related headings,
examples, and linked runtime instructions so the confusion does not survive
outside `SKILL.md`. “Client project” remains appropriate in internal maintainer
guidance and recognition records when describing Open Dough's consumers.

Edit the shared distributable sources only. Do not hand-edit installed managed
copies in `.agents/skills/` or `.claude/skills/`. Exclude a global repository
terminology rewrite, automatic wording lint, new per-tool adapters, release,
and installation/adoption work.

**Key examples:**

- Given an installed skill says “resolve context from the client project,”
  when it is revised, the agent is directed to this project's guidance and
  paths; it is not asked to identify another client repository.
- Given a runtime reference describes project-owned ADRs or slice budgets,
  when it is reviewed, its wording uses the executing project's perspective
  while retaining any necessary missing-context behavior.
- Given similar maintainer-facing wording appears without the exact phrase
  “client project,” the review corrects the misleading audience or location
  assumption as well.
- Given the updater distinguishes the installed project from the Open Dough
  source, the corrected instructions preserve both roles explicitly. Internal
  maintainer records can still refer to client projects.

**Evaluation:** Review the distributed runtime guidance for the perspective
problem and walk representative corrected uses under the existing `AGENTS.md`
behavior review and
[ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
The executing project is unambiguous, source/target distinctions remain correct,
and required behavior survives. Reuse the established cross-tool delivery
mechanism; no new discovery matrix is required for wording changes.

**Depends on:** No new product prerequisite. This is separate from Story 11's
planning authorization boundary and SEED-001's hook registration work.
**Completion:** Clarified ADR 0006 and the maintainer authoring guideline;
restored the historical ADR 0001 as a focused Proposed vocabulary draft. Reviewed
all 23 runtime Markdown files and corrected perspective in all ten skills and
affected references. Kept maintainer records and installed managed copies intact.

Manual behavior walkthroughs confirmed that a selected story uses this project's
plan destination and slice limits, ADR checking reads this project's catalog and
still stops on a real conflict, and the updater captures this project (or an
explicit target) separately from the fetched Open Dough release source. Runtime
examples and references retain required missing-context checks. This is a manual
content review, not a new native-host acceptance run; shared delivery mechanisms
are unchanged under ADR 0005.

Validation passed: skill frontmatter for all ten skills, relative file links in
all 23 runtime Markdown files, `git diff --check`, and the existing
`dough-update-guidance-payload.sh`, `story-payload-update.sh`, and
`execution-payload-update.sh` checks. The updater wording check accepts equivalent
payload phrasing. No slice plan, release, or installation/adoption was performed.

<a id="keep-slice-planning-bounded"></a>

### 11. Keep slice planning within the requested workflow

**Status:** Complete in source, 2026-09-10; implemented via
[Quick 035](../quick/035-bounded-slice-planning/PLAN.md). Not released. Native
acceptance excluded by scope.

**Goal:** A human or coordinating agent requesting a slice plan receives a
useful plan and concrete remaining concerns without unintended execution or a
planner-issued workflow decision.

**Scope:** Finish after writing and reporting the plan unless the triggering
human or parent-agent instruction explicitly also requests execution. Do not
treat readiness or concern evidence as authorization. Report remaining
slice-specific concerns or a limited no-concerns finding without prescribing
the next workflow. Correct obvious construction defects; preserve decomposition,
proof ownership, and sizing. Exclude mandatory refinement, coordinator tooling,
budget redesign, refinement's own assessment redesign, cross-tool acceptance,
release, installation, and hand-edits of installed managed copies.

**Completion:** Updated `src/skills/dough-slice-planning/` so planning-only and
parent-delegated planning stop after the plan, explicit plan-and-execute may
continue without re-approval, and reports carry concern evidence instead of
`ready for direct execution` / `refinement recommended`. Local AGENTS.md
behavior walkthroughs are recorded in recognition; linked references needed no
edits.

<a id="extract-story-refinement"></a>

### 6. Extract story refinement and improve one real story

**Status:** Unplanned.
**Goal:** Refine an actual Open Dough story using reusable shared guidance.
**Scope:** Extract Donut's story-refinement practice and its needed guidance into
the source skills. Apply it to one selected story in its existing seed.
**Evaluation:** The story has a useful goal, small scope, and concrete examples
that the owner can review. Include the skill in the next useful release.
**Effort:** M, medium confidence; assumes the supplied practice is self-contained
with its directly referenced guidance.
**Depends on:** The source practice and Story 9's direct extraction workflow.

<a id="extract-story-decomposition"></a>

### 7. Extract story decomposition and simplify one real problem

**Status:** Unplanned.
**Goal:** Split one oversized Open Dough problem into useful, ordered stories.
**Scope:** Extract Donut's decomposition practice and its needed guidance, then
use it on one actual problem. Keep the smallest worthwhile outcomes in their
seed and queue the useful next story.
**Evaluation:** Each selected story delivers something the owner can judge and
has a rough effort estimate. Manual work is considered when choosing scope.
Include the skill in the next useful release.
**Effort:** M, medium confidence; assumes one bounded problem.
**Depends on:** The source practice and Story 9. Select when an actual problem
needs decomposition.

<a id="adopt-known-client-projects"></a>

### 8. Adopt shared guidance in one other client project

**Status:** Deferred until another named client wants the guidance.
**Goal:** That client uses a released shared practice on an existing task.
**Scope:** Choose one project and practice, install the release, retain required
local context, fix callers manually, and delete redundant borrowed guidance.
**Evaluation:** The installed practice helps complete the chosen task and the
owner can review the resulting project changes.
**Effort:** M, low confidence; the actual project determines the work.
**Depends on:** A named client, wanted practice, and available release.

<a id="extract-plan-execution-with-ci-monitor"></a>

### 5. Extract plan execution for one real task through CI

**Status:** Complete.
**Goal:** Finish the self-installation drift prevention plan using shared
execution guidance and obtain actionable evidence from Open Dough's real CI.
**Scope:** Make `src/skills/` the explicit source for client-payload edits, add a
deterministic self-installation baseline check, and gate release finalization on
that check. Execute with one CI observer and repair a delivered legacy CI defect.
Manual post-release self-update/commit and the separate historical regression
fixture remain maintainer-owned follow-ups.

## Ordering

Story 9 is complete. Story 5 is complete. Story 12 is complete in source.
Story 11 retains its separate outcome and
backlog position relative to the other existing items. Story 14 is done. Story
15 is selected. Story 6 remains the next extraction reuse opportunity after
higher-priority queued work. Story 7 surfaces for a real oversized problem;
Story 8 surfaces for its named client/task needs.

## Delivered capabilities

<a id="extract-directly-with-guidelines"></a>

### 9. Extract a project skill directly into unreleased source

**Status:** Complete.
**Goal and scope:** One extraction request yields a reviewable shared skill under
`src/skills/` with concise recognition; generalization and review stay manual.
Publication, client delivery, and particular Donut extractions remain separate.

<a id="generalize-project-guidance"></a>

### 1. Turn a supplied project practice into usable public guidance

**Status:** Complete.
**Goal and scope:** Generalize one practice while retaining its useful behavior.

<a id="reconcile-guidance-on-install"></a>

### 4. Complete one authorized ADR-guidance replacement in Codex

**Status:** Complete.
**Goal and scope:** Replace a borrowed practice while retaining required client project context.

<a id="maintain-skills-without-discovery-rechecks"></a>

### 10. Maintain skills with a minimal shared guideline

**Status:** Complete.
**Goal and scope:** Add or edit skills with a short shared guideline and manual
behavior review; keep surrounding process small.
