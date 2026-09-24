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
[shared startup](../../src/skills/dough-execute-plan/SKILL.md#take-queued-work)
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

<a id="accept-delivery-evidence-native"></a>

### 28. Accept delivery-evidence behavior in Codex and Claude Code

**Identity:** SEED-004#accept-delivery-evidence-native
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../quick/089-accept-delivery-evidence-native/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ceaeeedb34da0a41ca6a0b7e0063a9f24633d3b5addfeb484a7368841a711778","plan":"7c7f4f0d471de8080492588ca07a40513f35c06045f590804b629471d1e7dd31"}}
```

**Goal:** Maintainers learn, from real Codex and Claude Code sessions, whether
the released `dough-execute-plan` proof-acceptance guidance actually applies its
four delivery-evidence rules, and act on that answer in the same work. The
guidance has shipped since 0.3.33 with this native acceptance reported as
pending; this story turns that pending state into decided results instead of
carrying it forward.

**Scope:** For each of the four rules — filtered selection, supported reported
claims, changed test-support consumers, and known required proof gaps — decide
a Codex result and a Claude Code result under [ADR
0005](../../docs/adrs/0005-cross-tool-validation-accepted.md), choosing runs by
remaining risk rather than a full host-by-case matrix. Judge each run as soon as
it finishes and delete its spent output after judging; keep only the decision
and its decisive reason in the active plan. Diagnose an unexpected result
before retrying, and never rerun until green.

Cursor is already accepted: each of the four rules passed a judged native
Cursor run during implementation, and the later structure-only harness
consolidation preserved that behavior under credential-free proof without
changing the rules' text. Cursor needs no new sessions unless a rule's
guidance changes.

**Key examples:**

- A zero-exit filter that selects no relevant tests leaves its promises
  incomplete; an anchor-only-link claim with no observing assertion is not
  reported as verified; a changed factory contract refreshes proof for an
  affected E2E stand-in; an explicitly missing requeue observation stays
  incomplete until matching proof exists. Sufficient current evidence in each
  case proceeds without a blanket rerun or a retry only to reformat the report.
- A Codex filtered-selection run shows the agent refusing the empty selection:
  the rule is accepted for Codex right then, the results directory is deleted,
  and the plan records one line — rule, host, candidate and runtime, result,
  decisive observation.
- A Claude Code run times out before its decisive step: the trace is read now
  to find the cause, the cause is fixed or named, and the run is repeated only
  if something changed. The output is deleted once the cause is decided.
- A run shows the guidance really failing a rule on one host: the story records
  that defect and routes it as a bounded correction; it does not hold the run's
  output while waiting.

**Required tools and evidence:** Run the installed candidate in fresh Codex and
Claude Code sessions with
`tests/git-publication-native.sh --native HOST --case delivery-evidence/CASE [--results-dir DIR]`,
Bash 4+, and the runner's bounded supervision. Use a temporary results
directory only while judging. Inspect the selected command, candidate and host
runtime, selected observations, fixture assertions, native trace, and
independent fixture state; do not accept exit status or self-report alone. The
four credential-free assessors live in `tests/support/`. The Cursor runs and
each case's expected observations are recoverable from
`6cb67dbe680211ad64a60e7f50a0d413c7c68b20:.planning/quick/085-accept-delivery-evidence/PLAN.md`.

**Completion:** Every rule has a decided Codex and Claude Code result or a
specific justified reuse, or an explicitly routed product defect. A rule whose
proof is still missing keeps this story open; it is not moved to a new
acceptance record. At wrap-up, delete the story's run output and assessment
records; the next release notes report the decided results.

**Boundary:** This story does not reimplement the proof-acceptance guidance,
refactor the native harness, cut a release, or change the dashboard and CI
observer contracts. A product defect it finds is fixed in its own bounded
correction.
