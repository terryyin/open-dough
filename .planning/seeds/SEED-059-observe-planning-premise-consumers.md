---
id: SEED-059
status: active
planted: 2026-09-30
planted_during: Authorized three-project retrospective-findings runbook
trigger_when: A planning premise stops before its consumer or a proposed bug remedy has not reproduced the symptom
scope: unknown
---

# SEED-059: Settle decisive planning premises on their actual journey

## Why This Matters

The generic decisive-premise response shipped in 0.3.43, yet actual 0.3.46–0.3.47 executions still rely on a named seam or grep result that does not reach the consuming operation. The cost includes non-converged attempts, replaced proof and scope decisions during delivery. At least six distinct representative executions support the selected journey problem across the three projects; overlaps between supporting findings count once, and unknown releases cannot establish a failed numbered-release fix.

## Story Decomposition

<a id="observe-premise-consumers"></a>

### Observe a planning premise through the operation that consumes it

**Identity:** SEED-059#observe-premise-consumers
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/176-observe-premise-consumers/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"413234cef9e6c0648c42fdb89b7ed296d0bd8af75592aba3655822631cb6c816","plan":"118c9b07a195319d1157ce508a85fe557351602320f53604394e2a22ae55e4df"}}
```

- **Goal:** The developer and the executing agent can rely on a `ready` plan's decisive premises. Each was observed through the operation that consumes its result, on the fixture and input path the slice uses, or the plan puts the uncertainty in an early bounded probe and stops dependent work until it is answered. This cuts the non-converged attempts, replaced proof and mid-delivery scope decisions the retrospectives record.
- **Scope:**
  - **Required behavior**
    - Premises come from the key examples. The planner traces each key example from trigger to observable result through existing code, and every step the plan relies on as already behaving is a decisive premise, written down or not. This covers premises the planner never wrote (an overlay that collides with the story's own "scroll past without marking" example; two matching rules that differ) and every transformation between a fixture's inputs and the operation that evaluates them.
    - Each recorded premise names the operation that consumes its result and the observation that reaches it. A helper, step, hook or test that exists, or a grep hit, is presence evidence; it does not settle the premise. A claim that a change fixes a reported symptom is such a premise, so the symptom is reproduced first, and a remedy spec that already passes leaves the symptom unexplained instead of counting as a fix.
    - When an existing fixture can run the journey cheaply and safely (for example the racing-push fixtures), run it instead of reading call sites.
    - Readiness stays blocked while a replay or observation records a part of the promised journey as not covered. The journey rule is stated once, where premises are recorded; the readiness text links to it.
  - **Kept**
    - Cheap read-only inspections still settle a factual premise. Paid, credentialed and owner-held observations keep their existing probe-slice and authority boundaries.
    - The delivered moved-function caller clarifications (aa650875, 9d4bf02f, c97c3fe0) stay and are reused, not duplicated.
  - **Deferred, not committed or verified here:** an audit of every fact, automatic execution permission, a general process engine, and any claim of host improvement beyond existing native-acceptance evidence.
  - **Evidence limits:** of the retrospective cases, only those on 0.3.46 or 0.3.47 show the 0.3.43 rule failing to be applied (doughnut plans 049, 051, 053, 055, 056 and pygardon plan 275). The other cases predate the rule or have an unknown release. Whether stating the rule where premises are recorded, rather than in readiness, changes behavior is unverified.
- **Key examples**
  1. Doughnut 056 (0.3.47): the plan says the E2E steps exist, "confirmed by grep". The steps run on the chosen EPUB fixture and find a marked book block. The recorded premise names that step and fixture path as the consumer; a grep hit does not settle it.
  2. Doughnut 053 (0.3.47): the story's example scrolls past a block without marking it. Tracing it reaches `blockAwaitingConfirmation` and the two overlays that share `absolute left-0 right-0 bottom-0 z-20`. The overlap surfaces at planning as a premise, or as an owner decision before Take.
  3. Pygardon 275 (0.3.46): a real-calculation fixture is planned as proof. Tracing it from fixture inputs to the evaluated genome reaches `repair_genome`. The plan names that transformation, or picks a fixture it does not distort, before proof is accepted.
  4. Open-dough plan 112, Take-then-replay race: the premise is observed by running the existing racing-push fixture, not by reading the hook's call sites.
  5. Doughnut 198 (unknown release): a slice assumes one code swap fixes a UAT defect. The plan reproduces the symptom first. The regression spec that already passes is not called the fix, and the symptom stays open.
  6. Boundary: a premise that current code already satisfies costs one cheap observation reaching its consumer and adds no extra investigation.
  7. Boundary: only a paid or owner-held run can settle a premise; its cheap parts are observed now and the rest becomes an early probe slice that stops dependent slices.
- **Evaluation:** Judge the revised guidance by the behavior review of key examples 1 to 7 against its text. A one-off manual native replay against the pre-change baseline gives limited evidence for Claude Code only; claims stay within what those runs show. The plan owns the replay design.
- **Supporting findings:** [ODF-074](../../docs/maintainer/finding-names.md#odf-074), [ODF-110](../../docs/maintainer/finding-names.md#odf-110), [ODF-182](../../docs/maintainer/finding-names.md#odf-182), [ODF-198](../../docs/maintainer/finding-names.md#odf-198). Occurrence evidence stays in the catalog and its linked source records.
- **Completion criterion:** Record the actual response, implementation commit, first containing release (or release pending), and proof limits on every supporting finding in `docs/maintainer/finding-names.md`. Delivery and queueing alone do not mark the finding resolved; a watch starts only from verified relevant use.
- **Depends on:** None established; the two selected responses address separate acceptance and planning decisions and can deliver independently.
- **Safe stopping point:** This response preserves current authorization, story ownership and proof boundaries if other process work is cancelled.
- **Effort hypothesis:** S: two guidance files, one rule, plus a manual replay; the replay is the uncertain part.

## When to Surface

Selected by the owner-authorized runbook on 2026-09-30; queued for later refinement.

## Breadcrumbs

- [Retrospective findings runbook](../../docs/maintainer/retrospective-findings-runbook.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
