---
id: SEED-010
status: active
planted: 2026-09-09
planted_during: Execution retrospective extraction follow-up
trigger_when: Improve empirical process control in Open Dough and selected client projects
scope: large
---

# SEED-010: Improve products and processes through observed outcomes

## Current context

Developers and maintainers use retrospectives and feedback maintenance to
connect observed problems to bounded responses and evaluate their effect after
release. The [research report](../../docs/maintainer/empirical-process-control-research.md)
retains the findings and evaluations, including the completed assessment of
Doughnut's note-details disclosure. The
[maintenance runbook](../../docs/maintainer/retrospective-findings-runbook.md)
and [response watch list](../../docs/maintainer/near-term-watch-list.md) track
the current workflow and outstanding observations.

The [execution retrospective](../../Distribution/src/skills/dough-execution-retrospective/SKILL.md)
and [project findings maintenance](../../Distribution/src/skills/dough-triage-project-findings/SKILL.md)
guidance own the delivered workflows. The broader feedback-loop proposal and
its decisions are recoverable from the
[original seed](https://github.com/terryyin/open-dough/blob/7cda80ffebcb3a190d1c71f80aec3e33b7e59f95/.planning/seeds/SEED-010-learn-from-execution-retrospectives.md).

## Stories

<a id="review-independently-observable-promises"></a>

### 1. Record source-review evidence once per independently observable promise

**Identity:** SEED-010#review-independently-observable-promises
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/616-review-independently-observable-promises/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"06b5d57b9db2882c86d0d46d78a1bf8b2be5d0c4c04c6229277d655475d0ad4e","plan":"d3af488e0dabc02f5caf95b8de95c643c27b9cabbfccac96964142d23f2229c5"}}
```

**Goal:** Let planned-execution coordinators use an independent review to catch
missing product proof while recording a shared observation once when several
qualifications describe the same promise. Keep user-visible alternatives,
restrictions that need their own check, and post-execution owners traceable to
the original source.

**Scope:**

- The source-only reviewer numbers independently observable promises, rather
  than every clause or list item. Keep a promise's conditions, qualifications,
  triggers and examples attached to its source text so one sufficient
  observation can cover that promise without repeated allocations.
- Separate outcomes that can fail independently, including user-visible
  alternatives and justified rejection behavior. Sharing a test command or
  proof location does not by itself make two outcomes one promise. Grouping
  must preserve each expected result and its source provenance.
- Keep context, reasons, settled baselines, effort hypotheses, proof-method
  explanations and delivery deferrals available as source context without
  creating observation rows merely for those statements. A statement that also
  promises an independently checkable result still needs a numbered promise.
  Scope limits do not become new product rejection rules.
- Preserve the fresh review's source-only isolation, timing before planned
  delegation, retained launch/input/return evidence, unchanged-source reuse,
  and replacement after human amendments. The reviewer chooses the promise
  boundaries; the coordinator retains and allocates every returned promise id,
  rather than silently deleting ids during acceptance.
- Reuse `source-review.md`, its existing allocation/observation cells and the
  Story obligations record. Missing results still receive an obligation or
  block acceptance. A promise observable only after execution keeps its own
  `landing`, `target CI` or `reporting` owner and is not marked observed early.

Scope limits: no new review registry, record schema, bulk-recording interface,
automatic prose classifier, or change to evidence sufficiency, amendment
remapping, execution authority, or lifecycle completion. Release and rollout
are separate work; record this response and its first containing release in
ODF-481 when each becomes known, without treating delivery as an observed
ordinary-use improvement.

**Key examples:**

1. A small source story says a blank instruction opens the terminal because
   the session waits for the developer, and repeats that result in an example
   → the independent review keeps the blank-input condition and example with
   the terminal-opening promise → one allocation and sufficient observation
   cover it; the explanation creates no additional observation.
2. The same story also says a typed instruction leaves the current view in
   place → the review retains that separately checkable alternative → proving
   blank-input opening alone cannot accept it. A qualification such as keeping
   developer-moved keyboard focus is retained wherever it changes the result.
3. A compound source story repeats a clipboard journey across its Goal, Scope
   and examples and describes the limits of automated proof → the review keeps
   the source conditions with the promised outcomes and avoids observation
   rows for the proof-method explanation. Independently checkable copy, paste,
   scrolling and preservation results still require their own sufficient proof.
4. A source says a one-kana pronunciation such as `て` is hidden even inside
   `挙げて` → grouping related pronunciation clauses preserves that expected
   result → evidence hiding only standalone readings leaves a gap. A genuine
   restriction such as refusing a pronunciation as a correct written answer
   likewise needs rejection proof.
5. A source contains a settled baseline and effort hypothesis, and separately
   requires final target CI after landing → the first two remain context;
   the CI promise is separately allocated to `target CI`, pending its owner's
   receipt rather than an execution-slice observation.

**Evaluation:** Replay the small conditional-terminal story and compound mobile
selection story retained in [ODF-481](../../docs/maintainer/findings/ODF-481.md),
comparing allocations and duplicated observation text with their 44-row and
112-row reviews. Judge a worthwhile result by removing allocations that have no
independent result while preserving every independently checkable promise and
its qualifications; do not optimize for an arbitrary row count. Include the
retained pronunciation miss and a separately checkable alternative/restriction
as counterexamples to over-grouping. Report comparison limits: bookkeeping
reduction alone does not establish time or token savings or sustained benefit.

## Separately pending lifecycle validation obligations

These obligations remain pending under the recorded release exceptions. This
section preserves their scope without creating another selected story or
assigning backlog priority. A future human selection can establish an
appropriate acceptance story.

- Retrospective findings remain useful and correctly attributed: local recording,
  recurrence without duplicate counting, qualified findings, project context,
  execution-release provenance, and preservation of adopted finding identities.
- Review selection and bounded logging behave as configured: independent process
  and product selection, preserved project preferences after update, bounded
  recording and replacement, and authorized product-to-backlog outcomes.
- Quick, planned, and oversized executions preserve attributable work and proof:
  entry authority, **Taken** handling, refactoring and delivery, remaining-work
  conversion, planless retrospective recovery, and ordinary planned recovery.
- Wrap-up closes supported execution contexts, handles absent retrospective
  advice, preserves active work and recoverability, and retires only disposable
  implementation direction.
- Planning and implementation guidance produces useful decisions: refinement and
  planning boundaries, cumulative design, whole-product correction and test
  review, simple domain rules, PFE reuse and changed assumptions, optional
  architectural thinking, and human resolution of conflicting direction.

Use representative native cases and justified reuse under
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md). Separate shared
integration proof from skill behavior; one tool's success does not prove another's.
Assess applicable evidence from 0.3.11 and ordinary released use before fresh
runs. Missing proof remains pending. Release exceptions do not mark these
obligations passed.
