---
id: SEED-186
status: active
planted: 2026-10-30
planted_during: Terry's discussion of the dashboard's three perspectives and enduring product intent
trigger_when: Updating the dashboard's product definition before designing its additional perspectives
scope: one documentation-only story across requirements, vocabulary, architecture, and existing UX guidance
---

# SEED-186: Document the dashboard's current product intent direction

## Why This Matters

For Terry and general-purpose agents working on Open Dough, the original
three-perspective vision still describes features and structure as later
possibilities, while recent discussion develops a more precise account of the
product's enduring intended behavior. That understanding currently depends on
a conversation. Terry wants one coherent, reviewable documentation update
before discussing new UX/UI or implementing another perspective.

This seed is self-contained preparation for a separate execution session.
Creating and refining this story does not perform its documentation update.

## Selected Stories

<a id="document-dashboard-product-intent"></a>

### Understand the dashboard's three perspectives and enduring product intent from maintained documentation

**Identity:** SEED-186#document-dashboard-product-intent
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/416-dashboard-product-intent-documentation/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"0ed208840160b8be44aae6fc74c4bf0b5297cb6c2e80a6218d00f548ff53a4d3","plan":"31fd3ca81d714264f649e0d3ed3dbbbe2c8e835b36a5d0534ae2111cb297c548"}}
```

**Goal:** Terry and an agent entering the project without this conversation
can read the maintained documents and understand the current three-perspective
direction, the enduring current-product meaning being explored for intent,
purpose and proof, and which terminology and UX/UI choices remain open.

**Scope:** Deliver one cohesive documentation update in the four existing
homes below. Replace obsolete or overlapping explanations with the best
current understanding. Keep necessary source links and existing product
constraints; use Git for revision history rather than appending a discussion
transcript, chronological design log, or parallel vision document.

| Home | Responsibility in this story |
| --- | --- |
| [Project visibility and state requirements](../../docs/project-visibility-requirements.md) | Primary home for the detailed three-perspective direction, purpose/proof exploration, examples, and explicitly unresolved questions. Read the whole document and reconcile stale early-stage framing affected by this update. |
| [ADR 0001 — Ubiquitous language](../../docs/adrs/0001-ubiquitous-language-accepted.md) | Introduce the shared conceptual distinctions general-purpose agents need, using concise definitions and links to detailed requirements. Keep unsettled names recognizably provisional. |
| [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md) | Record the cross-task domain relationships and architectural boundaries supported by Terry's direction, with enough explanation to guide other general-purpose agents. Keep feature-local detail in the requirements. |
| [Dashboard UX/UI North Star](../../docs/dashboard-ux-ui-north-star.md) | Align its purpose, scope, terminology references, and framing with the current understanding and existing delivered story dashboard. Preserve applicable current interactions and clearly distinguish established behavior from deferred design. Make no new UX/UI decisions. |

#### Required understanding to carry into execution

1. **Stories describe changing work.** They are units of planning and learning:
   attempts to affect the product, refined and executed through development.
   They can cross existing product and structural boundaries. Their completion
   and cleanup do not make them the permanent definition of the product.
2. **The second perspective describes the current product's intended
   behavior.** It is an enduring, maintained account that survives the stories
   that introduce or change it, while describing the product at its current
   revision. Enduring does not mean frozen. It includes what behavior is
   supposed to exist and its purpose, rather than treating every accidental
   implementation behavior as an intention or mixing future wishes into the
   current baseline.
3. **The name is still open.** Terry is neutral about whether "feature,"
   "intent," "intention," or "product intent" best conveys that meaning.
   "Product intent is the maintained definition of what the current product
   is meant to do and why" is an explanatory working formulation, not a
   finalized name. Product specification and behavioral contract were
   alternatives raised in advice, not selected replacements. Preserve the
   relationship to the existing Feature concept without claiming a completed
   product-wide rename or enforcing a new canonical label.
4. **Purpose and proof are the proposed two aspects of that account.** Purpose
   expresses what behavior is expected and why: its maintained descriptive
   side. Proof concerns executable verification and the evidence of whether
   the implementation fulfills the expectation: its execution-oriented side.
   Explain that verification procedures can themselves be maintained artifacts
   while particular results are observations. This is a conceptual distinction,
   not a decision to create separate stores, catalogs, files, or services.
5. **Execution information is exploratory.** Terry raised duration, evidence,
   and when verification last ran, and explicitly remained unsure of this
   scope. Revision, environment, coverage, freshness, and result were useful
   clarifications in advice. Preserve them as considerations, not mandatory
   fields, a finalized state model, or an implementation promise. A check's
   runtime and the product's performance are different information. A passing
   check supports its observed claim rather than establishing universal
   correctness; missing, stale, partial, and conflicting evidence remain
   distinguishable.
6. **Structure describes the implementation's organization.** Preserve the
   domain-model relationship to packages, folders, files, and functions.
   Stories, intended behavior, and structure are independent related dimensions
   without a required one-to-one mapping or containment hierarchy. A story can
   change several intentions and structural elements; one intention can endure
   through many stories and involve several structural elements. Filtering and
   mapping remain conceptual possibilities, not a selected mechanism. Placement
   of the architectural North Star in the structural perspective remains open.
7. **Present delivery and future direction stay distinct.** The implemented
   dashboard currently provides the story planning/execution perspective,
   including its existing local-session capabilities. Additional intended-
   behavior and structural perspectives are design direction. Documenting them
   does not implement them, require three panes, or restore the original
   dashboard's early scope as a present product restriction.

#### Authority and boundaries

Terry explicitly chose the four document homes and requested their update.
This is human direction to make those documentation changes during the later
execution; it is not permission to settle the unresolved name, proof data
model, or new UX/UI. Introduce the supported concepts into ADR 0001 and the
cross-task implications into ADR 0008 without presenting open proposals as
Accepted choices. Preserve the existing ADR statuses and human decision
ownership; no new ADR acceptance, rejection, supersession, or exception is
requested. An unresolved product design topic is an output to document here,
not an automatic blocker to this documentation-only story.

The existing repository-owned state, rebuildable dashboard views, and separate
local operational evidence remain the architectural baseline. Follow
[ADR 0000](../../docs/adrs/0000-use-adrs-accepted.md),
[ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md),
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
and [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
Use links between the four homes so the requirements own the detail and the
ADRs own only their relevant shared meaning and decisions.

**Scope limits:** No application, test-runner, skill, installer, or payload
changes; no new perspective implementation, code-wide rename, maintained
intent inventory, proof collection, storage schema, telemetry, or automated
discovery. Do not design new tabs, panels, navigation, layouts, interaction,
visualizations, or presentation states. The next UX/UI conversation is separate.
These limits bound this story's work; they do not require the product to
prevent those capabilities later. Retain existing implemented behavior and
unrelated architectural decisions. Necessary links and directly implicated
documentation consistency fixes belong to this outcome; a general repository
documentation audit does not.

#### Key examples

1. **Fresh reader:** Given only the updated requirements and their ADR links,
   an agent can explain the three perspectives, the second perspective's
   enduring current-product meaning, purpose/proof, and the explicitly open
   name and UX/UI choices without reading this chat or a spent plan.
2. **Story cleanup and product change:** When a story introducing an intended
   behavior is completed and its planning records are removed, the product
   definition and verification remain meaningful. A later intentional change
   updates the current account; a regression supplies contrary evidence rather
   than silently deleting the expectation.
3. **Evidence interpretation:** A check last passed on an older revision, or
   has no recorded result. The explanation supports interpreting its limited
   evidence without claiming the current product universally correct. A slow
   verification run alone does not establish a product performance defect.
   This example documents semantics; it does not select data fields or UI.
4. **General-purpose agent:** Reading ADR 0001 and ADR 0008 reveals the shared
   concepts, independent relationships, source authority, and where details
   live. The agent can distinguish an enduring behavioral expectation from a
   story and observed execution evidence, without treating a provisional name
   as a mandatory rename or an unbuilt perspective as delivered.
5. **UX boundary:** Reading the refreshed UX/UI North Star shows the same
   product direction and applicable existing story interactions. It introduces
   no new layout or interaction and leaves the new perspectives' UX/UI design
   for Terry's next discussion.
6. **Current account:** The four documents agree and link to the right owners.
   The requirements reflect the best current understanding instead of retaining
   a competing original vision, revision log, or transcript as required reading.

**Safe stopping point:** These documents are useful for review and further
design even if no additional dashboard perspective is ever implemented. Terry
can review the aggregate documentation diff before considering new UX/UI.

**Slice plan:** [One cohesive documentation slice](../slice-plans/416-dashboard-product-intent-documentation/PLAN.md).

## Preparation and execution handoff

This preparation was requested on 2026-10-30 in Codex chat
`01a18afd-aacc-7d81-b53d-4ebec126c8b3`, following recovery of the original
2026-09-19 discussion. The content above is the execution input; access to
either conversation or the recovery bundle is unnecessary.

Terry's final instruction replaced direct work on `main` with a separate
worktree and branch and requested one refined documentation-only backlog story
with a slice plan or an explicit planning-needed outcome. Execute this story
only after a separate instruction. Preparation changes only this seed, its
plan, and its backlog entry; the four target documents are not updated here.

Preparation landing publishes this seed, its plan, and the queued backlog
entry to `origin/main`. It does not Take the story or begin the documentation
update. A separate execution session can select this published story and its
plan from an owned workspace without needing the original preparation
worktree, branch, or conversation.

## Ordering

Preserve the priority of existing queued and Taken work; add this story last
among queued work. No blocking story dependency is required: this story provides
independently useful maintained documentation and does not implement either
new perspective or depend on another story's test or application changes.
