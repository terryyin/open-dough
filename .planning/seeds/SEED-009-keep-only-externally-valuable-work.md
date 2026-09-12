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

**Status:** Selected for backlog; unrefined.

**For / why:** A product owner using Open Dough can keep corrective execution
focused on the smallest intended outcome when an assumption fails or they request
simplification, rather than receiving an expanding plan without delivery.

**Scope:** Improve the existing planning and execution response to accumulating
corrective work or an explicit simplification request. Revisit the parent premise
and current finish line before extending the plan. Use available evidence to
compare a simpler environmental or product choice, preserve useful completed
work and its proof, and distinguish an authorized scope decision from a proposal
that needs the owner's decision. Reuse existing PFE and direction guidance;
refinement should identify the remaining gap before adding instructions.

**Evaluation:** In a representative environment-premise case, corrective
expansion prompts a bounded comparison of the infrastructure assumption before
more downstream implementation. In a simplification case, the agent restates the
smallest intended outcome, identifies work no longer required, and continues only
within established authority or surfaces the specific unresolved scope decision.
A justified correction within an unchanged valid outcome can proceed without
inventing a new approval gate. Neither case treats more slices as authorization
for a broader finish line.

**Value / learning:** Reduce avoidable implementation and planning that leave the
owner's outcome undelivered, while retaining useful proof and necessary corrections.
The environmental and product-scope findings remain distinct causes.

**Effort hypothesis:** Uncertain until refinement compares these cases with the
current planning and execution guidance; no execution estimate is promised.

**Depends on:** No new product prerequisite; independent of the first selected
finding response.

**Safe stopping point:** The active work has an evidence-supported premise and
an authorized, evaluable finish line. No automatic cancellation, deletion of useful
work, new tracking system, or broader workflow redesign is required.

**Findings:** [ODF-013](../../docs/maintainer/finding-names.md#odf-013--plan-splits-preserve-an-untested-environment-premise)
and [ODF-023](../../docs/maintainer/finding-names.md#odf-023--simplification-retains-an-expanding-closure-condition).
Grouped as related failures to reassess ongoing work; identities and historical
observations remain separate. Queued follow-up does not resolve these findings.

## Ordering

Story 1 is complete. Resume ordinary backlog selection; do not recreate deleted
work unless current demand names a beneficiary and evaluable outcome.
