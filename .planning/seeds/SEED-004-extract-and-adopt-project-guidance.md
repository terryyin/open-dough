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

<a id="continue-test-optimization-plans"></a>

### 24. Continue test optimization plans into execution or the backlog

**Identity:** SEED-004#continue-test-optimization-plans
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Bounded scope is aligned; story refinement and execution approach selection remain."],"basis":{"document":"56590af07155530af2547b7db55cd7e5c2bd7d4e5f8d38cd912c70d5de161cf6"}}
```

**Status:** Captured; unrefined.

**Goal:** A developer who asks Open Dough to optimize tests gets durable forward
progress after profiling and planning: the optimization plan either proceeds
directly into authorized execution or becomes the next explicitly queued work,
rather than being left as an inactive planning artifact.

**Scope candidate:** Clarify the shared `dough-test-optimization` lifecycle at
the point where its executable plan is complete. When the original request and
resolved project context authorize implementation, continue through
`dough-execute-plan` without requiring a second request merely to begin the
planned optimization. When execution is not authorized or cannot start, use
`dough-product-backlog` to queue the planned work before ending. Link the plan
directly when it is the canonical active home for a bounded correction; when an
existing feature story owns the work, queue that story and preserve its plan
link according to the backlog contract.

Preserve explicit profile-only requests, which produce findings rather than an
executable optimization plan. Do not treat creating a plan as starting
execution, move work to **Taken** before execution actually starts, invent a
backlog when the project has none, or silently discard a plan whose execution
prerequisites are missing.

**Key examples:**

- Given a developer asks to optimize a selected test scope and the resulting
  plan is authorized and executable, test optimization invokes
  `dough-execute-plan` and continues the work instead of stopping after writing
  the plan.
- Given the invocation authorizes planning but not implementation, test
  optimization adds the planned work as the highest-priority queued item using
  the project's canonical story or bounded-correction identity, and reports
  that handoff.
- Given a profile-only request, test optimization reports its findings and does
  not manufacture a plan or backlog entry solely to satisfy the lifecycle
  handoff.

**Evaluation:** Representative default and planning-only invocations leave each
created optimization plan in exactly one actionable state: execution has
started through `dough-execute-plan`, or the work appears once in the product
backlog with a valid canonical link. A profile-only invocation remains
unchanged, and neither route duplicates the work across **Taken** and **Backlog
list**.

**Git context:** Reuse a suitable owned workspace and carry identity, mode,
and publication authority into the existing preparation/execution workflow.
Retained source must be published through the authorized preparation path before
[shared startup](../../src/skills/dough-execute-plan/SKILL.md#take-or-admit-work)
can consume it. Taken settles on remote trunk in either mode. This handoff adds
no separate freshness check, Git publication recipe, or CI setup; it consumes
those shared operations as they are delivered. A planning-only request does
not grant execution authority.

**Depends on:** Existing executable-plan, execution, and product-backlog
contracts supply the two handoff destinations. Installed execute-plan
publication guidance owns their shared publication behavior; this story owns
continuation and queue placement at the optimization handoff.

**Safe stopping point:** Every created optimization plan is either being
executed or is recoverable as explicitly prioritized product work; existing
profile-only behavior and backlog ownership rules remain intact.

<a id="proudly-found-elsewhere-design"></a>

### 19. Strengthen architectural review after using the lightweight guidance
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

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
`7f672bf:.planning/slice-plans/044-lightweight-pfe-and-direction/PLAN.md`.
**Safe stopping point:** Any selected review improvement delivers its own useful
correction or reduced burden; no further process rollout is required.
**Effort hypothesis:** Uncertain until a concrete review gap is observed; no
S/M/L estimate without repository definitions and a refined outcome.
**Deferred decisions:** Which remaining extensions are justified, their concrete
examples, and the final bounded delivery scope. Tracking machinery, mandatory
per-story documents, partial wrap-up, and early termination remain excluded.

#### Retained experience for later refinement — 2026-09-27

**Source:** [Open Dough process feedback](https://claude.ai/artifact/5zjpVg4o5yvTtRQNn3LWjB),
the section of *Local AI notebook effort: closing review* for Donut
`SEED-048#story-1`, reviewed 2026-09-27. The report covers
`23f081f05b..5a4bfe2f92` (2026-09-20–2026-09-27; 767 commits, 1,191 files).
Its source is Donut's
`.planning/slice-plans/016-review-and-close-local-ai-notebook-effort/report.html`.
All paths, ADR numbers, transcript IDs, finding codes, and commits in the
summary below refer to Donut, not this repository.

The developer describes this as **partially real-life experience of using the
current architecture guidance**. Retain it as input to this story's later
refinement alongside retrospective findings still to be collected. These are
the report's observations and proposals, not independently verified findings
or accepted changes to Open Dough. The story remains deferred and not refined;
this evidence capture does not select a solution or expand delivery scope.

**What worked, according to the report:**

- Dated owner decisions reached the North Star promptly. Dropping a story
  updated backlog, seed, and direction together (`506c267839`); the rebase
  reversal was recorded as Git owning replay (`03afc699bf`).
- The North Star supplied a useful review yardstick. Correction `quick/031`
  used the single-LFS-representation direction to find leftovers. Its explicit
  distinction between accepted architecture and delivered capability kept
  plans honest.
- Humans retained ADR ownership: `quick/021` and `quick/031` left ADR 0002
  unchanged; the agent's ADR 0001 vocabulary edit (`9c8aca9bbd`) came from
  story-closure inputs.

**Suggestions to evaluate later:** The source marks all six **NOT NOW** and
does not request a Donut story or Open Dough skill edits from that review.

1. **Expose a second representation as an owner decision.** Direction added
   legacy/LFS modes on 2026-09-23; the owner challenged the marker and separate
   Book limits the next day (transcript `6e749b83`). Reversal needed conversion,
   raw-storage removal, and leftover cleanup (`quick/031`, `dd17928977`). The
   proposal is to present a mode, marker, or second representation beside the
   simpler single-representation alternative during refinement/ADR review.
2. **Make a candidate story's architectural premise visible.** One candidate
   would delete a picture still needed by Git history (transcript `8ed5aa4e`);
   another silently relied on the no-cross-notebook-deduplication rule and was
   dropped after the owner questioned copying bytes (`6806d413`, `506c267839`).
   The proposal is a short reference to the North Star rule a candidate relies
   on or strains. The report associates the pattern with Donut's DD-128.
3. **Preserve lasting rules when trimming spent direction.** Removing rollout
   order (`002bad682f`) also removed the rule to confirm a byte migration in
   production before deleting old stores in a later release. The owner had to
   restate it (transcript `da2f9fa0`). The proposal is to distinguish disposable
   sequencing from enduring rules and retain or move the latter to their owning
   documentation during wrap-up. The report says no current Donut work needs
   this retired migration rule restored.
4. **Keep delivery bookkeeping out of the North Star.** Story numbers, plan
   references, and order lists introduced in `4f0b551959` led to three cleanup
   commits (`002bad682f`, `fcda2014a5`, `506c267839`) among 14 North Star changes.
   The proposal is to keep direction and rules there while the backlog owns
   delivery order.
5. **Clarify the owner's ADR amendment policy.** The owner's `4f0b551959`
   rewrote Accepted ADRs 0002/0004 in a mixed commit, removing six amendment
   provenance lines despite Donut's supersession guidance. `quick/021` later
   reconciled related documentation. The report leaves the choice to the
   owner: dated in-place amendments or supersession, with separate ADR commits.
   This is evidence for review, not authority to change Open Dough's ADR policy.
6. **Keep plan references unambiguous.** Donut's numbering note claimed a
   2026-09-20 reset under `slice-plans`, while plans moved from `quick` only on
   2026-09-26 (`82e789ee86`). Number 008 was reused (`247e9a9664`, `38a307560c`),
   making retained evidence ambiguous; further renumbers followed
   (`909995f4d0`, `df5ba26eb0`). The proposal is to correct that local note and
   avoid reusing deleted plan numbers; Donut's ODF-106 already covers allocation.

**Use at refinement:** Compare these examples with the current guidance and
later retrospective evidence before selecting any improvement. Preserve what
already worked, distinguish guidance gaps from application failures and local
documentation defects, and drop extensions whose outcome existing review
already supplies. The numbering observation is retained as adjacent process
context, not an added architectural-review promise. The report also cites
existing Donut findings ODF-092, ODF-106, ODF-110–113, ODF-116, ODF-120–125,
and DD-126–136 rather than duplicating them; it reports no additional evidence
for the unchecked-plan-claim issues in DD-126, DD-129, DD-130, and DD-134.
