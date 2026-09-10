# Evolve a cohesive design from incremental delivery examples

## Source and outcome

[SEED-012](../../seeds/SEED-012-cohesive-design-from-examples.md#cohesive-design-from-examples).
Status: in-progress. Execution authorized in an isolated worktree and branch.

A developer delivers small evidenced increments while agents evolve a cohesive
product design, challenge accidental plan restrictions, and review architecture
and tests as a whole product. This advances reusable lifecycle guidance learned
from Donut. Story commitments do not define implementation boundaries.

## Scope and current decisions

Change existing shared guidance and conflicting references under `src/skills/`.
Use one authoritative home per rule and links at its consumers. Necessary
reconciliation belongs in each behavior slice, not a later cleanup backlog.
Keep all requested outcomes; reduce machinery, not the review's product focus.

Human decisions:

- Examples demonstrate promises; domain constraints justify rejection; deferred
  promises are not prohibitions. Natural generality need not enlarge delivery
  or verification commitments. Do not promise future layouts or bulk performance.
- Story refinement decides delivery scope. Implementation changes whatever
  product parts need changing. Story-shaped structure is not a design objective;
  any coincident structure needs independent domain justification.
- Accidental plan restrictions go back to a human before conflicting changes,
  even when they look clearly unsupported.
- Post-change refactoring owns concrete conceptual/structural examination;
  implementation retrospectives also assess overall architecture and the whole
  test suite. Neither is limited to files added by the story.
- Keep important E2E behavior documentation and integration proof, consolidate
  redundant coverage for cost, and move details to black-box unit tests. Use
  project testing guidance when supplied; no standalone testing extraction here.
- Retrospectives plan corrections, including suite-wide cleanup; they do not
  execute them. Product-constraint changes remain human decisions.

Excluded: release preparation, promotion/payload changes, version/tag work,
Donut implementation or mandatory fresh Donut use, Story Wrap-Up changes,
new skills/stages/report schemas, automated architecture assessors, and a new
unit-testing methodology. Broad review does not require speculative redesign.
Preserve unrelated work and backlog order.

Applicable Accepted decisions:

- [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md):
  source changes remain distinct from selection/release; installed copies stay
  untouched. No release work belongs to this plan.
- [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
  use representative behavior review for ordinary guidance changes. Static
  checks and walkthroughs are not native acceptance. Existing integration proof
  may remain valid; changed skill behavior requires fresh proof or justified
  reuse before release. Active evidence lasts through retrospective and is
  removed at wrap-up, with history recoverable in Git.
- [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  one behavioral home, concise entrypoints, executing-project perspective in
  descriptions, examples, and references. No maintainer vocabulary at runtime.

No numeric slice target, hard limit, or overrun threshold was supplied. Each
slice has one observable outcome and one proof loop with focused variations.
No infrastructure or storage experiment is needed for Markdown guidance changes.

## Outside-in proof and execution conventions

The observable boundary is what an agent produces when following candidate
instructions with supplied project context. Use one small representative Donut-
like scenario: README plus three Notes followed by README plus two Notes and
one Relationship. Include the supplied exact-layout plan restriction, duplicated
layout handlers sharing persistence helpers, a genuine independent constraint,
and important versus detailed/overlapping E2E coverage. Add an older test and an
untouched representation so story-file filtering cannot accidentally pass.

For each slice, manually walk its invocation through candidate guidance and
inspect the resulting refinement, plan, decision handoff, proposed refactor, or
retrospective correction plan against the observations below. Supply project
conventions; vary missing context only where named. Assess invocation context,
required inputs, and useful outcome under `AGENTS.md`. Do not count matching
phrases as behavior, invent success, or build a new proof harness. Record the
actual observation and limitations compactly in this active plan as work runs.
The walkthrough is authoring evidence, not a claim of native execution.

Each slice owns its changed references, descriptions, examples, and focused
checks: `git diff --check`, review changed frontmatter, and resolve changed local
Markdown links. No exact-prose tests. No installer or host mechanism changes are
planned, so no routine per-host discovery reruns. If a functional test is
invalidated, identify and run the existing focused test; do not broaden merely
because more tests exist. `npm run lint` is the existing lint command; CI runs
lint and `npm test`. Avoid repository-wide formatting for Markdown-only edits.

On separately authorized execution, use `dough-execute-plan` for independent
post-change refactoring, selective formatting, plan updates, owned commit/push,
and asynchronous CI repair. Keep this plan and inputs through retrospective;
existing wrap-up owns subsequent closure. This plan does not execute corrections
in the representative target product.

Native acceptance remains separate from source completion under ADR 0005. Route
these changed refinement/planning, refactoring/conflict, architecture-review,
and test-review behaviors to the existing
[release/adoption work](../../seeds/SEED-010-learn-from-execution-retrospectives.md#use-released-retrospective-log)
before release: assess requirements on Codex, Cursor, and Claude Code, reuse
valid shared integration evidence, and select representative fresh native cases
for missing behavioral proof. Missing evidence stays pending; source completion
here neither performs nor declares that release work complete.

## Ordered slices

### Distinguish required examples from rejection constraints
Type: Behavior
Status: done
Proof: Refine the representative two-example story and its genuine-constraint
variation; inspect the resulting Goal, Scope, and Key examples.

Behavior: Given a bounded story illustrated by concrete counts, when refinement
records its scope, the result distinguishes required behavior, independently
justified rejection, and deferred promises without forbidding unlisted examples.

Update `dough-story-refinement/SKILL.md` and its `references/planning.md` where
needed. Keep the distinction in one existing home and align any seed/template
wording that contradicts it. State that delivery scope is not a map of product
implementation boundaries. No mandatory three-column form or new artifact.

Observe that the two supplied layouts are required examples, bulk performance
is deferred rather than rejected, and an explicit domain limit still supports
negative acceptance. Missing domain justification cannot be invented.

Safe stop: refinement expresses bounded commitments without accidental gates.
Sizing: one refinement result with a boundary variation; no new workflow.

### Plan increments that exercise one coherent model
Type: Behavior
Status: done
Proof: Plan the refined sequence, then assess the same plan's cumulative design
through the existing slice-refinement/readiness path.

Behavior: Given successive examples, planning produces delivery slices that
evolve a common supported rule without prescribing count recognizers or
expanding the story's promises to every case the implementation naturally handles.

Align `dough-slice-planning/SKILL.md`, `dough-slice-plan-refinement/SKILL.md`,
`dough-story-decomposition/references/problem-decomposition.md#decompose-slices`,
and the shared executable-plan reference only as needed. Add the cumulative
model-versus-special-cases question to existing assessments, alongside sizing
and proof ownership; do not add a readiness certification or workflow transition.

Observe delivery-owned proof, no fixture-derived production gates, a reasoned
common rule limited by current evidence, and retained independent constraints.
Do not prescribe a Donut representation or speculative generic framework.

Safe stop: the plan describes incremental commitments with coherent design intent.
Sizing: one plan/assessment result; shared-reference contradictions are the main
editing risk, so follow links only where they govern this result.

### Surface accidental plan restrictions for human resolution
Type: Behavior
Status: done
Proof: Present the existing exact-layout rejection instruction to execution,
post-change review, and retrospective review using the same decision case.

Behavior: Given a plan restriction supported only by fixture arrangements, a
reviewer cites the contract and conflicting story/domain evidence and stops the
conflicting change for a human decision instead of silently broadening behavior
or treating plan compliance as proof of justified design.

Use the existing execution decision reference and refactor/retrospective
handoffs; link the shared distinction rather than duplicating a new policy.
Ensure the behavior-preserving refactor promise cannot be used to conceal the
conflict. Align affected plan-review callers and stop descriptions. Independent
explicit product constraints remain binding; absence of justification is grounds
for a question, not an invented human approval.

Observe a concrete evidence-backed question and unchanged disputed behavior.
Vary a justified domain restriction: it remains enforced and is not called
accidental merely because it limits a count.

Safe stop: conflicting changes wait for a human with useful evidence.
Sizing: one decision handoff exercised at existing consumers; no new approval UI.

### Refactor complete concepts beyond shared helpers
Type: Behavior
Status: done
Proof: Review handlers sharing persistence helpers plus an untouched parallel
representation; inspect the smallest coherent refactor and its focused proof.

Behavior: Given another example exposing repeated domain knowledge, post-change
refactoring identifies all representations of that concept and favors the
simplest supported common rule over another recognizer or helper-only cleanup.

Strengthen `dough-post-change-refactor/references/refactor-checks.md` duplication,
naming, and cohesion criteria and align `SKILL.md` scope language. Include
orchestration and representations outside the current diff. Story membership
cannot prohibit necessary edits. Reconcile current subsystem handoff language:
product subsystem/ADR authority remains meaningful, but story decomposition is
not such a boundary. Whole-product examination does not authorize overriding a
project's genuine architectural decisions. Use the conflict handoff where needed.

Observe the domain knowledge consolidation, unchanged promised behavior, and
absence of a framework justified only by hypothetical cases. Coincident story
and product organization must have independent domain rationale. Shared helper
reuse alone must fail the review when the orchestration still duplicates rules.

Safe stop: concept refactoring is coherent and still respects actual decisions.
Sizing: one conceptual refactor outcome; existing subsystem gates need careful
wording so neither partial fixes nor unauthorized constraint changes are implied.

### Review whole-product architecture and plan corrections
Type: Behavior
Status: planned
Proof: Review an aggregate implementation with story-shaped handlers and a
concrete architectural weakness beyond newly changed files; inspect its finding
and correction plan, then vary an already-fixed finding.

Behavior: Given completed execution, the implementation retrospective assesses
the current product's architecture independently of delivery decomposition and
places supported needed corrections in its follow-up plan.

Align `dough-execution-retrospective/SKILL.md` principles, outcome review, and
current-truth reconciliation. Replace story-file limits without rewriting the
original promised product behavior or falsely attributing older defects to this
execution. Keep provenance for historical claims and use current truth for
remediation. Broader architectural assessment is required; unrelated speculation
or cosmetic preference is not a defect. Reconcile the planning handoff so a
bounded whole-product correction can be planned without inventing a new feature
promise or forcing it back into the old story's implementation footprint.

Observe complete implicated concepts, overall architectural reasoning, concrete
impact, and one bounded correction plan; human-owned constraint conflicts use
the preceding handoff. Already-resolved findings create no duplicate work. Keep
unfinished-plan amendments, review skip options, and no retrospective execution.

Safe stop: supported architectural corrections have an actionable destination.
Sizing: one retrospective correction result; original-story wording across the
planning handoff is the principal reconciliation concern.

### Keep the test suite useful as behavioral documentation
Type: Behavior
Status: planned
Proof: In the same retrospective, inspect a suite containing a key integrated
journey, detailed E2E variations, and an older overlapping scenario; inspect the
resulting coverage-preserving correction plan. Vary missing preferred test style
and no newly added E2E tests.

Behavior: The implementation retrospective assesses the whole suite and plans
retention, consolidation, and movement of detailed coverage to black-box unit
tests based on important behavior documentation and execution cost.

Update the retrospective and shared refactor checks' redundant-test and
stable-boundary advice together. Preserve important E2E integration proof;
merge overlapping scenarios only when their meaningful coverage survives.
Use project style when available and observable black-box unit behavior as the
fallback. Reuse existing real-lower-layer/data-over-internal-mocks guidance;
no separate testing methodology. No-new-E2E history does not exempt older tests.

Observe explicit replacement unit coverage before removal/narrowing, an owned
consolidation task for older redundant tests, retained important E2E behavior,
and no blanket deletion. Suite-wide assessment does not require running every
test during a read-only retrospective; use focused checks for actual findings.

Run the complete representative sequence once against the final candidate,
including the human plan-conflict branch. Check all changed descriptions and
linked references agree on human decisions, whole-product implementation,
review responsibilities, and correction ownership. This final consistency pass
reuses the preceding proof and is not a new testing framework or release gate.

Safe stop: the story's source behavior and focused authoring proof are complete;
release and any outstanding native acceptance remain separate.
Sizing: one suite-assessment/correction result with focused coverage variations.

## Proof ownership

| Final-state promise | Owning slice / observable evidence |
| --- | --- |
| Examples, constraints, deferred promises; no unlisted-case prohibition | Distinguish required examples: resulting refined scope |
| Cohesive delivery slices, natural generality, cumulative readiness question | Plan increments: plan and existing assessment result |
| Human ownership of accidental plan restrictions and genuine constraints | Surface restrictions: cited conflict and stopped disputed path |
| All concept representations, orchestration, common rule, no speculation | Refactor complete concepts: coherent refactor proposal and behavior proof |
| Whole-product architecture, exceptional justified coincidence with stories | Review architecture: evidence-backed aggregate/current assessment |
| Architectural correction ownership, current fixes, no review execution | Review architecture: bounded follow-up or existing-plan amendment |
| Whole-suite E2E documentation, detail downgrade, overlap consolidation, cost | Keep test suite useful: coverage and correction-plan inspection |
| Preferred style or black-box fallback; retain important integrated proof | Keep test suite useful: missing-style and retained-journey variations |
| Reconcile consumers/references; no mandatory new machinery or wrap-up changes | Each owning slice's reference review; final cumulative walkthrough |
| Source-only changes, no release or installed-copy work | Each slice's owned diff review |

## Remaining concerns and learnings

Six Behavior slices, no speculative Structure work. No numeric timing assumption
is made. The plan concerns are bounded but real: planning-reference reconciliation
in Plan increments, distinguishing genuine subsystem authority from story-shaped
limits in Refactor complete concepts, and reconciling original-story correction
language with whole-product architecture in Review architecture. These may affect
editing size; resolve each within the corresponding behavior and preserve human
constraint ownership. Do not evade them by dropping the requested review scope.

No product behavior has been verified during planning. Record only discoveries
that change remaining work here. Native behavior evidence remains pending unless
later judged reusable; a walkthrough alone cannot establish release acceptance.

## Active execution evidence

Execution uses `/private/tmp/open-dough-quick-037`, branch
`codex/quick-037-cohesive-design`, based on `eba7472` from `main`.
Source edits follow ADRs 0003, 0005, and 0006; no conflicts or exceptions found.
The repository has no commit hook or selective Markdown formatter. For these
Markdown-only slices, formatting is a no-op and `git diff --check` checks
whitespace. Run the existing lint command explicitly before final delivery;
no hook or formatting configuration change is warranted.

CI: `terryyin/open-dough`, `ci.yml` / `CI`, push-triggered. Codex observer
coordinator `root-canonical`, cell 12, session 65416, PID 20303, receipt
`/tmp/dough-ci-501/watch-SDxjdK`, checkout as above; status watching.
The initial noncanonical `/tmp` invocation exited without launching: its CLI
entrypoint compares the invoked path with the canonical module URL. The
canonical launch produced the receipt above.

### Required examples — authoring observation

Manual refinement yielded both README/three-Notes and README/two-Notes/one-
Relationship imports as required examples; bulk performance and future-layout
promises remained deferred, with no other-mixture rejection. A supplied maximum
attachment count produced cited over-limit negative acceptance; without that
requirement, no rejection was invented. Implementation reach remained independent
of delivery grouping. Invocation and required project context remain explicit.
Local links/frontmatter and `git diff --check` passed. Independent post-change
review found no refactor needed. This is authoring evidence, not native acceptance.

### Coherent increments — authoring observation

The manual plan assigned the two imports to Behavior increments with each owning
its import proof and the second preserving the first example. The supported
rule processed content kinds under their domain rules, extending for Relationship
behavior without count dispatch or universal-layout promises. An explicit
attachment maximum retained rejection proof. Cumulative refinement classified
separate fixture recognizers as Refine despite small single-proof slices; the
common-rule sequence passed the existing assessment. An already contractual
exact-layout restriction remained a human decision, not an automatic rewrite.
Links/anchors/frontmatter, skill validation, and whitespace checks passed.
Independent refactor review found no changes needed; source-only authoring proof.

### Disputed restrictions — authoring observation

Execution, refactor, and retrospective consumers reached one shared handoff:
“The plan requires rejecting other mixed counts, but the story supplies two
required examples and defers future-layout promises; no independent rejection
rule is supplied. May we remove that rejection and align the plan with the
common rule, or should it remain under an explicit product requirement?”
Execution stopped the disputed implementation; refactoring returned JIDOKA
instead of a clean result; retrospective kept the removal correction pending
while independent reviews continued. No disputed behavior changed. Planning
classified the contractual conflict as Escalate. A supplied attachment maximum
remained binding with its rejection proof. Changed links/anchors/frontmatter and
whitespace checks passed; independent refactor review found no edits needed.

### Complete concepts — authoring observation

Two representative import handlers shared persistence but repeated validation,
ordering, and attachment-limit knowledge; an untouched preview repeated
validation. The proposed smallest refactor gave shared rules one home consumed
by both handlers and preview, retaining distinct representations justified by
their responsibilities. Helper reuse alone failed the review. Focused proof
covered both promised imports, preview/import agreement, and genuine over-limit
rejection, without promises for hypothetical layouts or a speculative framework.
An unresolved exact-layout contract or genuine architectural conflict stopped
before edits; story-named handlers alone did not establish separate subsystems.
Links/anchors/frontmatter and whitespace checks passed. Independent review
found no refactor changes needed. No native product behavior is claimed.

### CI fixture repair during architecture slice

Runs 34434147532/1 (`0517e0b`) and 34434296713/1 (`ea9c3a8`), test jobs
102735634229 and 102736069900, failed `tests/story-payload-update.sh`: the
simulated old release removed every story-skill declaration but deleted only
decomposition/refinement source, leaving wrap-up inconsistently present. The
same filter and fixture source are present on the base `main`; this was a
pre-existing fixture defect, not an updater safety-check defect.

Paused the only writer, stashed its four unstaged slice-5 source files at
`84aa78f519db7c028c0e3a1f8bc3abf9e6c2d0e4`, and repaired at current HEAD.
Narrowing the filter to the two removed skills preserves the safety check.
`bash tests/story-payload-update.sh` reproduced the mismatch, then passed all
three host contexts, collision refusal, edited/missing-reference protection,
and force restoration. An intermediate attempt was invalidated by editing the
running shell script; final proof ran with its input unchanged. Independent
refactor review found no edits needed. Selective shfmt, shellcheck, and whitespace
checks passed. Slice 5 remains in progress; restore its exact stash after push.
