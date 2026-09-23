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

<a id="accept-delivery-evidence"></a>

### 27. Accept delivery only with evidence for affected promises

**Identity:** SEED-004#accept-delivery-evidence
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../quick/085-accept-delivery-evidence/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"221bf317d1169133f9c0939711fbd4658babe5efbef770d69018ed4a43d0374d","plan":"41a74709429efa2a539fc6741cb8e4692a45faeeb6a181c7c0c213eeaf88ac54"}}
```

**Status:** Refined with Terry on 2026-09-23. Refinement and slice planning are
authorized; implementation is not. Existing identity and backlog position stay
unchanged. [Executable plan](../quick/085-accept-delivery-evidence/PLAN.md).

**Goal:** The developer receiving an execution increment gets an accurate account
of demonstrated behavior, and required proof gaps are corrected before delivery.
Address the four recorded acceptance failures below through the existing workflow.

**Why now:** ODF-075 and ODF-076 record delivered defects the developer repaired.
They matter to frequent publication by parallel agents; CI observation alone
cannot detect a consumer or behavior absent from the selected proof. ODF-057 and
ODF-063 were caught during execution and support making those existing checks
reliable, not claims of additional post-delivery failures. This evidence supports
a bounded correction, not automatic precedence over dashboard ownership or
branch visibility. Retain the existing queue order; neither story depends on this.

**Scope:** Correct only the four demonstrated mechanisms: empty/partial filtered
test selection accepted as complete proof; unsupported delegated behavioral prose
reported as verified; a stale unaffected-consumer judgment surviving a shared
contract change, including test-support consumers; and an explicitly uncovered
required readiness behavior recorded as learning while delivery proceeds.
Use existing proof ownership, implementation returns, and coordinator acceptance.
Keep one authoritative acceptance rule and amend its concrete application rather
than adding another gate. Use concise, personalized instructions addressed to the
executing agent, with clear responsibility and easy-to-follow actions. Rewrite
and simplify existing guidance, removing overlap instead of adding reminders
that dilute this goal or other workflow intentions. Existing acceptance happens before commit; do not move
it to after publication. Obtain missing observations within authorized work;
only a disputed requirement or explicit scope change needs a human decision.

Affected promises mean the selected work's required behavior and existing behavior
affected by its changed contracts. A relevant change to implementation, consumer
contract, setup, or observation can invalidate evidence; a new SHA alone does not.
Preserve sufficient proof, equivalent report layouts, focused checks, and ordinary
quick/planned execution. Inspect behavioral claims before reporting them as
verified; incidental untested claims do not automatically become new product scope.

**Key examples:**

1. A `merge direction` filter exits zero but runs no tests, or `published overview`
   selects one of three owned observations. Acceptance names the missing coverage
   and obtains the missing observations before treating those promises as proved.
   A nonzero test count alone does not establish complete selection.
2. A delegated report says an anchor-only link is unusable, but no assertion
   observes that and the code links the planning directory. The coordinator does
   not repeat it as fixture-covered; it returns the required behavior for correction
   and accepts only after the observing assertion and product behavior agree.
3. A command factory changes to `(CaptureContext, release_tag)`. An earlier
   unaffected-E2E assessment cannot exclude its stand-in without reassessment.
   The affected consumer is aligned and exercised before accepting the increment.
4. A return explicitly leaves required storage-readiness requeue behavior untested.
   Recording the gap in Learnings does not complete the promise. Obtain matching
   proof or leave that delivery incomplete with its specific missing requirement.
   The later active-task handoff repair corroborates lifecycle risk; it does not
   prove that the precise omitted requeue test would have caught the race.
5. All affected observations are current and sufficient, including reused proof.
   Acceptance proceeds without blanket reruns, a new approval request, or a
   report-format-only retry. A genuinely disputed promise stops its dependent
   path while independently supported work can continue.

**Exclusions:** General assurance or evidence-registry machinery; exhaustive
consumer discovery; mandatory full-suite runs; universal concurrency hardening;
CI observer redesign or synchronous CI waits; installation/coexistence redesign;
fixing the historical application defects again; new report schemas; automatic
scope reduction; unrelated findings or historical-log cleanup. The already
delivered ODF-080 live-transition gate remains separate.

**Evidence and limitations:**
[ODF-057](../../docs/maintainer/finding-names.md#odf-057--pattern-selected-proof-silently-omits-owned-tests),
[ODF-063](../../docs/maintainer/finding-names.md#odf-063--untested-delegated-claims-become-authoritative-user-reports),
[ODF-075](../../docs/maintainer/finding-names.md#odf-075--a-changed-shared-contract-leaves-an-untested-consumer-broken), and
[ODF-076](../../docs/maintainer/finding-names.md#odf-076--known-concurrent-state-proof-gaps-are-accepted-at-delivery).
Mechanisms stay distinct; shared execution evidence is not independent recurrence.
Historical logs demonstrate failures and successful local corrections, not that
all failures recur under today's guidance. The plan retains decisive locators.

**Evaluation:** Exercise actual agent acceptance of representative evidence-backed
returns and sufficient-evidence controls. Observe selected tests, inspected
assertions/consumers, corrections or precise incomplete outcomes, and truthful
reports. Wording checks and exit zero alone cannot establish the outcome. Reuse
valid host-integration evidence and select native behavior checks by unresolved
risk under ADR 0005; do not require every example on every tool.

**Completion and follow-up:** Update each addressed entry in
`docs/maintainer/finding-names.md` with its actual response, implementation and
recoverable evidence locator, containing release or explicitly pending release,
and limitations. Source implementation means addressed in source, effectiveness
unverified. Reconcile `docs/maintainer/near-term-watch-list.md` at delivery: start
an actual watch only after a released response has verified relevant use. Until
then retain the active catalog entry and unknown watch start/review-after. On
eligible use record its provenance and review seven calendar days later. Do not
resolve a finding from preparation, installation alone, or silence.

**Depends on / safe stopping point:** Existing proof and publication contracts;
no unfinished product prerequisite. Each corrected acceptance mechanism is useful
independently. No open product-scope decision remains. Runtime proof may expose
implementation learning; it does not authorize broader scope or another workflow.
