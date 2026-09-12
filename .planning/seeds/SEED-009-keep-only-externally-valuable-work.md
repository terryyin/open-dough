---
id: SEED-009
status: active
planted: 2026-09-09
planted_during: Near-future direction hardening
trigger_when: Before further first-round SDLC skill extraction
scope: medium
---

# SEED-009: Keep only work that manifests external value

## Goal

The Open Dough maintainer can trust that every retained work-in-progress item
advances a named external outcome under the current direction. Work retained
only because it might become useful is deleted and may be recreated if demand
returns.

## Stories

<a id="harden-direction-change"></a>

### 1. Remove WIP without external value and find a home for the rest

**Status:** Complete.

**Goal:** The Open Dough maintainer sees a minimal, coherent working set in
which every remaining WIP has a named beneficiary, an evaluable external
outcome, and one canonical story home.

**Scope:** Review active and dormant seeds, backlog entries, executable plans,
unreleased skills and rules, retained acceptance evidence, and uncommitted work
created before the direction change. External value means a current outcome for
a named user or client, or protection directly required to deliver that outcome;
future optionality and historical interest are insufficient. Give retained work
one canonical story section and repair its links. Delete everything else instead
of archiving it for possible future use. Preserve immutable release history and
original decisive evidence required by a current contract or Accepted ADR. Do
not execute retained stories, extract new guidance, or invent replacement work
during this cleanup.

**Key examples:**

- Given the completed Quick 025 plan or earlier resolution evidence repeats an
  outcome already durable in released guidance, tests, ADRs, or Git history,
  when it is reviewed, then the redundant planning artifact is deleted.
- Given dormant collaboration, feedback, or worktree seeds have no current
  beneficiary or demand, when they are reviewed, then they are deleted rather
  than retained for a possible future trigger.
- Given the unreleased `dough-acme-change-readiness` example has no current
  client outcome, when it is reviewed, then its source and recognition record
  are deleted; a later real demand may extract the practice again.
- Given WIP still manifests external value but has no canonical story, when it
  is reviewed, then the smallest corresponding story is placed in the seed that
  owns its outcome and all live references point there.
- Given Quick 028 and its uncommitted tests still protect clients from receiving
  an invalid released payload and remain owned by their existing story, when
  they are reviewed, then they are retained as current WIP without being
  executed by this cleanup.
- Given native acceptance evidence remains decisive and reusable under Accepted
  ADR 0005, when evidence is reviewed, then the original evidence is retained
  while obsolete process commentary is deleted.
- Given an uncommitted change has another active owner, when cleanup reaches it,
  then its ownership and value are established before any deletion; uncertainty
  is not permission to destroy someone else's work.

**Evaluation:** No retained WIP lacks a named beneficiary, evaluable external
outcome, or canonical story home; completed or speculative planning residue is
absent; the backlog contains only selected current stories; all surviving links
resolve; ADR-required original evidence remains; and previously committed
deletions are recoverable from Git history.

**Effort:** M, medium confidence; the amount and ownership of uncommitted WIP
must be resolved during execution.

**Depends on:** None. This hardening precedes further extraction work.

<a id="revisit-premise-and-finish-line"></a>
### 2. Revisit the premise and finish line before expanding corrective work

**Status:** Quick execution complete in source; retained for retrospective and
story wrap-up. Real-use effectiveness remains unverified.

**Goal:** A product owner using Open Dough gets corrective work directed at the
smallest authorized, evaluable outcome when an assumption fails or they request
simplification. The agent reassesses why the work is needed before extending it.
This supports delivering useful outcomes and changing direction at low cost.

**Evidence and need:** This story comes from triaging two retained Pygardon
findings, selected together on 2026-09-12:

- [ODF-013](../../docs/maintainer/finding-names.md#odf-013--plan-splits-preserve-an-untested-environment-premise):
  execution `quick/107-checked-docker-release` at `276caaf2e` accumulated
  application ownership corrections while publication remained unimplemented.
  A later pinned-image probe reaped an orphan with Docker init and retained a
  zombie without it. This supports questioning the application obligation;
  it does not establish that init fixes every historical hang.
- [ODF-023](../../docs/maintainer/finding-names.md#odf-023--simplification-retains-an-expanding-closure-condition):
  execution `quick/108-publish-install-checked-docker-release` at `f011af3b5`,
  continuation `3f6302ec6..e3e2a25c4`, retained a broad finish line after the
  owner's simplification request. Nine implementation and seven planning
  commits left ten publication slices; the owner stopped execution without a
  published release. Commit counts describe the sequence, not proof that all
  intervening work was unnecessary.

These are supplied retrospective observations retained in the finding catalog,
not a fresh reproduction. Both report an unknown Open Dough release, so they
support investigating the failure mechanism but do not prove current guidance
still fails. Their environmental and product-scope causes remain distinct.

**Challenge and preferred approach:** More instructions are not yet justified.
[Decomposition](../../src/skills/dough-story-decomposition/references/problem-decomposition.md#choose-the-decomposition-level)
already says to revisit invalidated parent decisions;
[planning](../../src/skills/dough-slice-planning/SKILL.md) requires evidence for
uncertain infrastructure assumptions; and
[execution decisions](../../src/skills/dough-execute-plan/references/execution-decisions.md)
already handle scope and direction changes. The likely gap is recognizing that
accumulating corrections or a simplification request calls for that reassessment
before further subdivision, even without an explicit recorded-direction conflict.
This is a hypothesis to check against the examples below.

Prefer making the existing decision path clearer through consolidation or
replacement. Reusing the guidance unchanged is a valid smaller alternative if
representative use already produces the intended behavior; do not manufacture a
rule to mark findings addressed. A reminder that depends on the owner repeatedly
interrupting execution does not meet the goal. Separate environment and
simplification procedures risk duplicating one decision: is the remaining work
still necessary for the authorized outcome?

**Scope:** Clarify that decision within existing planning and execution guidance.
When the premise is challenged, compare the strongest relevant simpler choice
using available evidence, with a bounded check only for a decisive uncertainty.
When simplification is requested, establish the smallest intended finish line
and remove obligations the owner has authorized dropping. Preserve compatible
completed work and proof. Continue justified corrections within existing
authority; surface only an unresolved consequential decision.

Although this responds to findings, the expected resolution is simpler, clearer,
more concise instructions. Prefer one common rule in an existing authoritative
home, replacing overlapping prose rather than adding case-by-case coverage.
Judge simplicity by the decisions, steps, and text an executing agent must use,
not word count alone or moving verbosity into references. If a simpler solution
cannot satisfy these examples while preserving necessary constraints, inform
the owner with the concrete failure and smallest proposed exception before
adopting a more elaborate solution.

**Boundaries:** No new skill, tracking system, routine approval gate, numeric
expansion threshold, or general workflow redesign is promised. No Pygardon
infrastructure repair or release delivery is included. Existing PFE and direction
handling may be reused or clarified where necessary; a general rewrite is outside
this story. Fewer slices are not themselves success, and necessary corrections
are not waste merely because they cross components. Simplification does not
authorize cancelling user promises or deleting useful work. These boundaries
keep delivery small without prescribing Docker init as the answer.

**Key examples:**

- Given the ODF-013 assumption and growing application corrections, before
  extending implementation the agent compares the environment's existing
  lifecycle capability against the presumed application obligation. It states
  what the probe establishes and what remains unproved, then proceeds only on
  the supported, authorized choice.
- Given the ODF-023 simplification request and useful completed local-CI work,
  before adding publication slices the agent states the minimum intended
  delivery and which obligations are unnecessary. It applies scope already
  authorized by the owner; if the finish line is still ambiguous, it presents
  that specific choice. Completed local-CI proof is preserved.
- Given a defect whose correction remains necessary for an unchanged, supported
  outcome, the agent repairs it within existing authority. It does not require
  another approval or reopen the whole product merely because the plan grows.

**Evaluation:** Representative use of these cases reaches the supported premise
and authorized finish line before further corrective expansion, preserves useful
proof, and permits ordinary corrections. Compare the current and proposed
instructions to demonstrate a simpler decision path without losing these
behaviors. A walkthrough supports the guidance change; effectiveness in real
use remains unverified until subsequent feedback.

**Effort hypothesis:** Bounded guidance clarification; estimate remains for
execution planning. If the examples require broader redesign, report the gap
instead of absorbing it into this story.

**Depends on:** No new product prerequisite.

**Safe stopping point:** Existing guidance supplies a clear, concise path to an
evidence-supported premise and authorized finish line. Findings retain their
separate evidence and are not resolved merely by refining this story.

## Ordering

Story 1 is complete. Resume ordinary backlog selection; do not recreate deleted
work unless current demand names a beneficiary and evaluable outcome.
