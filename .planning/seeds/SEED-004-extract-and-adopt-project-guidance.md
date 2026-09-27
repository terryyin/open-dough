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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/133-preserve-lasting-rules/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"2009248b86e296b2c36b14662dfdf18ca7057f65cc3fa6f0ac33c978b54f723d","plan":"bfe0f2bd035a82bc6b5cf4419d474da8932578f2addfcec24a907f5d8036eb66"}}
```

**Identity:** SEED-004#proudly-found-elsewhere-design

**Goal:** A developer can let an agent retire completed planning and temporary
direction without losing rules needed to maintain the product.

**Scope:** Clarify where lasting rules belong and preserve them during ordinary
wrap-up. Reuse the existing architectural-thinking reference and wrap-up skill;
replace ambiguous or duplicated wording instead of adding another procedure.
Product-wide architectural decisions belong in the project's ADR process;
feature-local behavior and design belong in maintained feature documentation.
Use existing project formats. Keep instructions short, direct, and conditional
on the records being retired.

**Key examples:**

1. A completed migration topic mixes spent rollout order with a still-needed
   feature rule to verify production conversion before deleting old storage.
   Wrap-up preserves that rule in maintained feature documentation before
   removing the topic; the feature rule alone does not require a new ADR.
2. A retiring plan or topic contains a product-wide decision needing human
   resolution. The agent keeps that context and reports the specific decision;
   it neither accepts an ADR nor claims closure while the decision is unresolved.
3. The lasting rule already has a maintained home, or the record contains only
   spent sequencing. Wrap-up removes eligible temporary material without a
   duplicate document or extra approval. Direction another active story still
   needs remains in place.

**Evaluation:** Walk these cases through the revised guidance under AGENTS.md's
behavior review: invocation and required project context are clear, the lasting
rule survives in the right home, and ordinary cleanup remains simple. A missing
destination or conflicting decision produces a specific stop, not an invented
policy. Existing code, tests, and documentation are preserved.

**Architecture:** The accompanying ADR 0000 clarification defines document
ownership; ADR 0002 points to it. ADR 0006 requires one authoritative behavioral
home and instructions addressed to the executing project's agent. These internal
ADRs guide authoring, not runtime dependencies imposed on other projects.

**Excluded:** New document formats, required per-story architecture sections,
registries, review stages, broad document audits, new ADR amendment policy,
consumer-proof changes, and changes to the file-size or refactoring gates.
Architectural assumptions during refinement and broader review improvements
remain candidates in the retained evidence, not promises of this story.

**Safe stopping point:** Ordinary closure preserves lasting rules without any
further architecture-process rollout. No S/M/L estimate is assigned without
repository definitions.

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
or accepted changes to Open Dough. That evidence capture did not select a
solution; the scope above records the developer's later, narrower selection.

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

<a id="preserve-rules-from-story-sections"></a>

### Preserve lasting rules from every record wrap-up deletes

**Identity:** SEED-004#preserve-rules-from-story-sections
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/134-preserve-rules-from-story-sections/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ebf84c648a4961b61aeb0c8526a3e1e2761bf42a75c526bb909a7b0cd01dc677","plan":"9079ce6a41b9b77fe923c066a799b17073e066202b91ece68876690eb30360b1"}}
```

**Goal:** An agent wrapping up keeps a still-needed rule written only in the
completed story's section or seed, not only in a plan, execution record,
review, or North Star topic.

**Scope:** Correction of "Strengthen architectural review after using the
lightweight guidance" (story section
`.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md` at `29d0c909`)
from its execution retrospective (implementation commit `29d0c909`, Take
`848db9fd`). Wrap-up's Assimilate step triggers the shared preservation rule
only before deleting "a spent plan, execution context, review, or North Star
topic", while its Delete spent history step also deletes the canonical story
section and a spent seed. Make the trigger cover every record wrap-up deletes,
and keep one enumeration of record kinds, in the rule. Excludes changes to the
rule's destinations, stops, deletion steps, and any new record kinds.

**Plan:** [Preserve lasting rules from every record wrap-up deletes](../slice-plans/134-preserve-rules-from-story-sections/PLAN.md).
