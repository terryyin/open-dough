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

<a id="cover-the-actual-user-outcome"></a>

### 21. Cover the actual user outcome before accepting proof

**Status:** Refined and planned; queued, execution not started.
**Plan:** [Cover the actual user outcome before accepting proof](../quick/047-cover-actual-user-outcome/PLAN.md).
**Decision:** On 2026-09-14, the owner accepted a narrow fix now and authorized
refinement and slice planning. Do not wait for another incident on the latest
release. Later real-use evidence assesses effectiveness; it is not a prerequisite
to making this correction. Implementation is not authorized by this instruction.

**Is this a real problem?** Yes, the retained evidence shows consequential gaps,
but does not establish that adding more guidance will prevent them:

- [ODF-028](../../docs/maintainer/finding-names.md#odf-028--preservation-proof-omits-the-physical-predecessor-store)
  records valid continuity proof for a Docker volume being understood as
  preservation of the owner's native production settings and roughly 22 GB.
  The original Pygardon plan explicitly deferred migrations. The supported
  problem is an unidentified predecessor and an overbroad completion claim;
  missing migration is not automatically an omitted authorized requirement.
- [ODF-045](../../docs/maintainer/finding-names.md#odf-045--dominant-query-purpose-hides-incompatible-production-callers)
  records a concrete escaped behavior: a trashed note remained gradeable despite
  passing planned suites. A shared query was classified as storage-oriented,
  overlooking its learning caller. This is the strongest evidence of a product
  defect hidden by incomplete obligation discovery.
- [ODF-041](../../docs/maintainer/finding-names.md#odf-041--required-pre-change-baseline-is-deferred-until-final-acceptance)
  records a missed execution prerequisite, not a missing planning instruction:
  the plan already said to collect the baseline before slice 1. Recovery at
  final acceptance succeeded. Extra recovery work and delayed assurance are
  supported; permanent loss of a reproducible baseline is not established.

These are three distinct executions across two projects at 0.3.14–0.3.16, not
three recurrences of one proven cause. Proof-boundary guidance shipped in
0.3.14 and remains in 0.3.17. The absence of a supplied occurrence on 0.3.17
does not establish prevention or justify deferral. Current [proof ownership](../../src/skills/dough-story-refinement/references/planning.md#own-executable-proof),
[proof acceptance](../../src/skills/dough-execute-plan/references/wrap-up.md#accept-proof),
and [PFE](../../src/skills/dough-pfe/SKILL.md#search-across-the-product) already
require outcome-based evidence and attention to callers and domain purpose.
The concrete correction is to make identity, affected-caller purpose, and
pre-change evidence explicit at the decisions they govern. Whether that reduces
recurrence remains an empirical question; existing general instructions do not
make the recorded failures resolved.

**Goal:** A developer carrying one selected story through planning and
execution can rely on its completion claim: the agent identifies consequential
preservation and consumer obligations within the authorized outcome, obtains
time-sensitive evidence before the dependent change, and accepts only what the
observations establish. This supports the backlog's coherent story lifecycle
by carrying the same understood outcome across its existing transitions.

**Alternatives and decision:** Waiting for latest-release incidents would defer
a proportionate response to already observed failures. Simply restating that
agents must follow existing guidance leaves the actionable gaps unresolved:
which store, which caller purpose, and which observation must precede a change.
Strengthen those three decision points within existing guidance now. Reuse or
relocate an existing rule where sufficient, replace overlapping prose, and
preserve the proof-acceptance rules rather than repeating them. Neither a new
verification skill nor a universal checklist is justified. Reviewing current
guidance chooses the smallest coherent edit; it is not an experiment that must
reproduce failure before this accepted correction can proceed.

**Scope:** Make three conditional checks explicit: preservation identity while
planning, affected caller requirements before changing shared behavior, and
required pre-change evidence before dependent implementation. Carry their results
through existing promise mapping and proof acceptance:

- Ground obligations in the selected story, approved decisions, and affected
  existing product behavior. A passing plan is not the sole source of what must
  remain true. Investigate only boundaries implicated by this change, including
  relevant callers outside the files initially expected to change.
- For a preservation claim, identify the installation, physical data store,
  and predecessor relationship that the claim concerns. Distinguish continuity
  within the same store from transfer out of another store. If the owner's
  intended target conflicts with the supplied scope, expose that conflict before
  dependent work; neither assume migration authority nor claim it occurred.
- When a changed shared operation has production callers with potentially
  different purposes, inspect those affected call sites and derive the distinct
  behavioral obligations. Equivalent purposes can share sufficient evidence;
  incompatible requirements need appropriate observations. A method's name or
  dominant use does not settle all its callers' requirements.
- When acceptance requires a pre-change observation, make it a prerequisite to
  the change that would invalidate it. Reuse an adequate baseline with known
  revision and relevant environment/selection conditions; otherwise obtain it
  before that change. This is not a requirement to benchmark every story or to
  run every baseline before unrelated setup or independent work.
- At proof acceptance, reconcile the discovered obligations with the actual
  observations and report the supported boundary. Retain gaps in the existing
  plan or conversation. Missing evidence leaves the affected promise incomplete;
  unrelated, independently supported work can continue. A late reconstructed
  baseline can support a comparison when equivalence is established, but must
  not be presented as an observation collected before implementation.

**Constraints and deferred promises:** Preserve human ownership of disputed
scope and product requirements. An example here does not authorize new product
behavior or require rejecting other valid cases. This delivery does not commit
to fixing Pygardon or Doughnut, adding migration machinery, auditing unrelated
consumers, guaranteeing discovery of every latent defect, requiring full-suite
runs, creating a proof registry or extra persistent checklist, changing delegated
handoffs, or redesigning release and installation validation. Necessary changes
to existing shared guidance are allowed; the examples are not a fixed file list.
Keep runtime guidance project-neutral and shared across supported hosts.

**Key examples:**

- **Preservation identity:** Given a Docker installation preserves its own
  volume across A→B while the owner's old data remains in a native store,
  planning identifies both stores and the intended preservation boundary.
  Proof of A→B supports only that volume's continuity. If migration is deferred,
  the agent says the old data has not been transferred; a conflicting owner
  expectation is a scope decision, not an automatic migration task.
- **Mixed purposes:** Given storage/export must retain trashed content while
  learning must exclude it, and both call one query, a trash-behavior change
  identifies both uses and obtains or reuses evidence for each requirement.
  Filtering every caller identically is not an acceptable repair.
- **Evidence timing:** Given measured optimization acceptance explicitly needs
  a full-suite baseline, execution obtains the required revision, conditions,
  selection, and result before the dependent implementation. If the environment
  prevents that observation, it reports the prerequisite and stops that path;
  passing post-change tests alone cannot establish a measured improvement.
- **Late discovery:** Given the baseline was missed, a recoverable old revision
  and demonstrably comparable environment may support a transparently labelled
  reconstructed comparison. Without sufficient comparability, the speedup
  remains unproved. Neither recovery nor its impossibility is assumed.
- **No extra ceremony:** Given an ordinary change has equivalent affected
  callers, sufficient unchanged evidence, and no migration or measurement
  promise, the agent reuses that evidence without adding a baseline run,
  per-caller duplicate tests, migration investigation, or a new document.

**Evaluation and limits:** Review each changed instruction through its normal
invocation using the representative inputs above. Observe which obligations are
identified, when evidence is requested, and what the completion claim says.
Check invocation context, required inputs and missing-input handling, and the
useful result under the maintainer behavior review. For any fresh agent session,
withhold the finding and expected answer; use ordinary story/plan context and
relevant caller/store evidence. The late-discovery and no-extra-ceremony examples
protect existing recovery and evidence-reuse behavior. Record observations in
ordinary execution evidence, without a new tracking system or mandatory
before/after agent benchmark. An unresolved case remains visibly unproved even
when the other cases pass.

A representative walkthrough establishes intended guidance behavior, not a
measured reduction in real-project defects. Later real use is needed for an
effectiveness claim, not permission to begin the fix. Historical incidents
justify this bounded correction, but do not quantify recurrence, savings, or
superiority to the second story. Preserve the owner's queue order. Judge slice
size by its focused behavior and proof; do not invent a timing guarantee.

**Depends on:** No other backlog story and no new latest-release incident.

**Safe stopping point:** One story's completion evidence can be made trustworthy
without the delegated-handoff story. Each corrected decision point provides
useful guidance independently; the story remains incomplete until all three
promises are covered. Retain unresolved evidence limits explicitly.

**Open uncertainty:** The correction's effectiveness in later real use and its
interruption cost. No unresolved product-scope decision prevents planning the
three accepted changes. Runtime proof and release acceptance remain distinct
from evidence of reduced recurrence.

**Source checks:** Read-only inspection during refinement confirmed the original
Pygardon plan's migration exclusion at
`d09f0a6ae:.planning/quick/112-automatic-tag-release-update/PLAN.md`, its explicit
baseline requirement at
`b1c3b5c83:.planning/quick/127-fast-service-and-packaged-tests/PLAN.md`, and
Doughnut's query classification at
`2be6138738:.planning/quick/115-web-note-trash-and-undo/PLAN.md`. Occurrence effects
remain attributed to the finding catalog; these reads did not reproduce the
incidents or evaluate current runtime effectiveness.

**Completion record:** After delivery, update each addressed finding in the
[catalog](../../docs/maintainer/finding-names.md) with the actual response,
recoverable implementation references, and containing release when known. Use
“Addressed in source; effectiveness unverified” until real-use evidence supports
a stronger conclusion; preserve each identity, occurrence, and unresolved limit.
Do not mark a finding resolved merely because this refinement or its plan exists.

<a id="return-complete-usable-delegated-handoffs"></a>

### 22. Return complete usable delegated handoffs

**Status:** Refined and planned; queued, execution not started.
**Plan:** [Return complete usable delegated handoffs](../quick/048-complete-delegated-handoffs/PLAN.md).
**Decision:** On 2026-09-14, the owner accepted reducing scope after the 0.3.17
release comparison and authorized updating refinement and slice planning.
Preserve released improvements; address only the remaining gaps below. This
instruction does not authorize implementation or release.

**Is this a real problem?** Yes, as observed coordination waste and a breached
review boundary. The evidence does not establish one shared cause, a general
failure of delegation, or that additional instructions will prevent recurrence.
The [finding catalog](../../docs/maintainer/finding-names.md) retains five
finding identities across six distinct executions in two projects at
0.3.8–0.3.16, rather than five executions:

- **ODF-007:** Two Claude Code executions returned before background verification
  finished. The coordinator needed two extra round-trips in one execution and
  three in the other; the latter also involved a refactor agent. Explicit
  wait instructions were already present in some prompts. This supports a
  completion-ownership problem, but weakens “add another reminder” as a remedy.
- **ODF-036:** One Claude Code execution received seven stale timeout
  notifications after a complete report. The problem was redundant watches,
  not missing proof. The report supports watch-lifecycle waste; it does not
  establish that every late host notification can be prevented.
- **ODF-038:** One Claude Code execution used dozens of no-op shell calls while
  awaiting notifications. This supports avoidable coordinator activity, not a
  need for faster tests or a new scheduler. The source's proposed wait behavior
  is host-specific, not a portable instruction to end any agent's turn.
- **ODF-040:** One Claude Code implementer committed and pushed before review
  when its prompt omitted the delivery boundary. No incorrect content was
  reported delivered. Explicit ownership wording was followed by four slices
  without recurrence; that is useful limited evidence, not causal proof.
- **ODF-043:** One Codex execution required three report-only retries for
  already-complete evidence. The supported problem is clerical rejection.
  The source's proposed schema validator is an inference; accepting equivalent
  inspectable evidence is the simpler alternative unless a real machine
  consumer requires serialization. None is established by this evidence.

These are retained reports, not freshly replayed source-project executions.
There is no supplied occurrence at the current 0.3.17 release. Current
[delegation](../../src/skills/dough-execute-plan/references/delegation.md)
already requires passing proof and an explicit stop before coordinator delivery,
and prescribes a literal proof block. Current
[proof acceptance](../../src/skills/dough-execute-plan/references/wrap-up.md#accept-proof)
already requires inspection and discourages redundant reruns. Neither the
implementation return nor the
[refactor verification and return](../../src/skills/dough-post-change-refactor/SKILL.md)
explicitly explains ownership through a yielded verification command's final
result. The justified target is a usable application of these contracts at
handoff, including removal of needless format rigidity; repeating the existing
rules or assuming an underlying host defect is insufficient.

**Release recheck (2026-09-14):** The remote release tags and local `VERSION`
identify v0.3.17 as the newest tagged release (commit `76aa14d`). Comparing
v0.3.16 with v0.3.17 shows a partial response to the broader handoff problem:
`dd2190c` adds targeted implementation/refactor returns, inspectable observation
and setup locations, and explicit reuse of accepted proof. The release also
clarifies recovery from the first unproved delivery obligation. Preserve these
improvements rather than rebuilding them. The relevant skill source has no
additional changes between v0.3.17 and the HEAD inspected for this recheck.

| Finding | Released coverage and remaining gap |
| --- | --- |
| ODF-007: premature verification return | Passing results and richer return evidence are required, but no explicit ownership protocol carries a yielded background verification command through its terminal result. The new report detail is partial support, not demonstrated prevention. |
| ODF-036: stale watches | Existing CI guidance owns and shuts down its CI observer. That is not the delegated per-command watches in this finding; no new correction to their lifecycle appears in the release. |
| ODF-038: no-op waiting | Existing no-AI-polling guidance concerns CI coverage. No new general delegated-result wait handling addresses the reported no-op calls. |
| ODF-040: premature delivery | The actual assignment was already required to say no commit/push in v0.3.16. v0.3.17 strengthens review/recovery context, but does not add a missing delivery prohibition. Treat this as an application/validation concern; another copy of the same prohibition is not a justified fix. |
| ODF-043: cosmetic retries | v0.3.17 still prescribes the proof block and adds required fields. It does not explicitly accept semantically equivalent organization. Richer evidence is useful, but does not resolve format-only rejection. |

**Scope consequence:** This is remaining-gap work on top of a partially improved
released contract, not an entirely unfixed handoff system. Existing report
content, proof reuse, and delivery prohibition are preservation/validation
obligations. Add or change guidance only where the comparison identifies a
missing or ambiguous behavior. Native acceptance was explicitly skipped for
v0.3.17 in [CHANGELOG](../../CHANGELOG.md); no supplied later execution proves
these incidents recur or are prevented at that release. Therefore neither
“fully fixed” nor “none of it was partially fixed” is supported.

**Goal:** A developer gets a usable delegated result without recovering unfinished
verification, consuming empty wait turns, handling avoidable stale watches, or
requesting cosmetic proof rewrites. Preserve the released review and delivery
boundary. This improves story-lifecycle transitions without expanding the
Story Branch Mode infrastructure.

**Scope — remaining corrections:**

- **Verification completion (ODF-007):** Implementers and refactor agents that
  run required verification retain ownership until they collect a terminal
  result or explicitly hand back an incomplete stop with the known command
  state, outstanding proof, and recovery ownership. Progress is not completion;
  supported yielding is valid and does not itself relinquish ownership.
- **Useful waiting (ODF-038):** Await delegated results through the host's
  supported notification, wait, or resume facility. Do not issue no-op calls
  solely to consume turns. Genuine state retrieval and necessary progress
  communication remain valid. Missing capability is an explicit limitation,
  not a reason to invent an API or assume another host's yield semantics.
- **Bounded watch lifetime (ODF-036):** Avoid extra command watches when existing
  completion handling suffices. Retire owned redundant watches through available
  controls when the obligation ends, retaining unread failure evidence. Handle
  an already-queued duplicate without restarting work. Preserve unrelated
  watches, especially the existing CI observer; report unavailable cleanup.
- **Semantic proof acceptance (ODF-043):** Use an equivalent complete report
  without a format-only resend. Preserve required literal commands, results,
  owned changes, promise coverage, boundaries, setup and observation locations,
  and consequential gaps. Missing or contradictory substance still prevents
  acceptance regardless of formatting.

**Preserve, do not rebuild:** v0.3.17's targeted reports, inspected evidence,
proof reuse, recovery boundaries, and the existing explicit no-commit/no-push
implementation assignment. ODF-040 receives a preservation check, not a new
prohibition, delivery mechanism, or claimed fix. The coordinator still reviews
and delivers; return formatting flexibility does not weaken that gate. A
refactor with unchanged accepted proof still requires no redundant verification.

**Excluded:** New schedulers, notification services, host adapters, telemetry,
report schemas or validators, mandatory handoff files, test-duration changes,
CI redesign, delivery-rule rewrites, general proof-coverage improvements owned
by story 21, originating-project fixes, and installation/release redesign.
Necessary edits to existing entry links are included. Missing host facilities
must not silently expand this guidance correction into runtime engineering.
These are delivery exclusions, not prohibitions on naturally supported cases.

**Key examples:**

1. Required verification yields a running command → the implementer collects
   its terminal pass and returns inspectable proof with uncommitted changes →
   coordinator review can proceed. The same ownership applies to refactor
   verification. A failed or inaccessible run produces an incomplete stop with
   its actual state, not a completion marker or a guessed result.
2. A coordinator awaits an agent result → it uses the supported host wait or
   notification path → no intervening no-op shell calls occur. If that path is
   unavailable, its report names the limitation and recovery need.
3. Verification finishes while an owned watch remains → the owner preserves
   unread evidence and retires the watch through supported controls → no
   avoidable live watch remains. A queued duplicate causes no repeated test;
   an unrelated CI observer remains active.
4. A complete report uses `Command` and `Result` headings → the coordinator
   inspects and uses the evidence without cosmetic retries. A report saying
   only “tests passed,” or contradicting an observed failure, remains incomplete
   even in the preferred format.

**Alternatives and evaluation:** Another reminder to return “passing proof” or
“do not commit” repeats released rules and is insufficient. Always rerunning
worker tests transfers rather than solves the ownership gap. Schema validation
adds machinery where semantic acceptance suffices. Make the smallest changes
at existing handoff decisions and evaluate observable actions and report use,
not matching words. A representative behavior walkthrough covers the examples
and preserved review order. Native host evidence and later recurrence evidence
remain distinct; neither is established by this refinement or a source edit.
Do not require a fresh incident merely to start the authorized correction.

**Effort and dependencies:** Four bounded decision changes using existing
facilities; no numeric estimate or timing policy is assumed. There is no product
prerequisite. Coordinate overlapping proof-contract edits with story 21, without
changing its outcome. Host capabilities and effectiveness remain uncertainties;
stop the affected implementation path if a new mechanism becomes necessary.

**Safe stopping point:** Each correction leaves useful handoff behavior without
requiring the others or changing coordinator delivery. Scope ends at those
corrections and their preservation checks, not universal agent compliance.

**Completion record:** After delivery, update actually addressed ODF-007,
ODF-036, ODF-038, and ODF-043 in the
[catalog](../../docs/maintainer/finding-names.md) with the response, recoverable
implementation reference, and containing release when known. Use “Addressed in
source; effectiveness unverified” until comparable real use supports more.
For ODF-040, record only the existing-rule assessment and any observed
preservation result; do not mark it fixed by this story. Retain finding
identities, occurrences, and unresolved limitations.

<a id="guide-useful-manual-testing"></a>

### 20. Guide a useful manual and exploratory test session

**Status:** Refined; unplanned.

**Goal:** A developer who explicitly requests manual testing, or executes a
story whose plan explicitly requires it, gets a focused test session that
observes the story's promised behavior, explores relevant nearby risks, and
returns trustworthy evidence and actionable findings without introducing a
separate UAT lifecycle.

**Scope:** Extract the useful core of Donut's project-local `manual-testing`
skill into reusable Open Dough guidance, while retaining project-owned setup,
access points, accounts, and commands in the project that supplies them. Keep
manual testing opt-in: invoke it only at explicit human direction or when an
authorized executable plan requires it. Resolve the test mission from that
request and the selected story's promises, examples, constraints, and proof;
do not derive acceptance solely from an implementation summary.

Use available browser or application-observation tools to exercise one coherent
flow at a time. State the expected observable behavior, perform the relevant
actions, and record what was actually observed. Reuse sufficient automated
evidence and manually exercise only missing procedural or human-judgment proof;
manual testing must not replace or ceremonially repeat a required automated
test. When the mission calls for exploratory testing, establish a bounded
charter from the story's risks and follow relevant surprises beyond the scripted
happy path. Record what was explored and material areas that were not observed.

Report each material outcome without claiming more than the evidence supports:
observed pass, observed discrepancy, blocked or could-not-observe with the
specific prerequisite, and a new idea that does not contradict the current
story. For a discrepancy, preserve the promised behavior, actual observation,
and useful screenshot, console, or network evidence. Do not infer that an
unavailable environment passed, silently turn a future idea into a current
defect, diagnose root cause, change product code, or create correction work
unless the triggering instruction separately authorizes it. Produce a concise
session report in the conversation or a project-supplied location; do not add a
default persistent UAT file, phase-completion state machine, cross-story UAT
audit, severity classifier, or automatic fix-planning pipeline.

Keep one shared behavioral source for Codex, Cursor, and Claude Code. Express
tool use by capability and add only the smallest host-specific adaptation needed
to operate the available browser or application surface. Validate the resulting
guidance on one real Donut flow while preserving Donut's local prerequisites and
test accounts outside the reusable skill.

**Key examples:**

- Given a developer asks to manually test a completed Donut interaction and the
  local stack is available, the agent derives the expected outcome from the
  selected story, exercises the flow, follows one relevant risk or surprising
  observation when warranted, and reports the actions, observations, evidence,
  and untested areas.
- Given automated proof already establishes a deterministic behavior but visual
  clarity still requires judgment, the session reuses the automated result and
  manually evaluates only the visual outcome; it does not rerun the automated
  path merely to manufacture manual compliance.
- Given the required application, account, service, or observation tool is not
  available, the report says the behavior could not be observed, names the
  missing prerequisite, and never records a pass.
- Given the observed behavior differs from the story's promise, the report
  retains both expected and actual behavior with available evidence. It does not
  guess a root cause or implement a fix without separate authority.
- Given exploration reveals a worthwhile idea that is outside the current
  promise, the report identifies it as a follow-up rather than failing or
  silently enlarging the story.

**Evaluation:** On one real Donut task, a developer can use the shared guidance
to obtain a report that distinguishes observed behavior, discrepancies,
unavailable observations, and follow-ups; traces checks to the story rather
than implementation narration; and includes a useful bounded exploratory
result when the mission warrants it. A representative walkthrough also shows
that project-specific setup remains in Donut and that already-sufficient
automated proof is not repeated.

**Depends on:** None. The current Donut skill and `gsd-core` verification
workflow are comparison inputs, not runtime dependencies.

**Deferred:** Persistent resumable UAT artifacts, stakeholder sign-off and
acceptance authority, phase or release gates, portfolio-wide verification-debt
audits, automatic browser activation, automated root-cause diagnosis and fix
planning, and general test-management infrastructure.

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
Story 14 is done. Story
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
