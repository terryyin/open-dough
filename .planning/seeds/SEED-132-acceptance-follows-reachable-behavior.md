---
id: SEED-132
status: active
planted: 2026-10-12
planted_during: Authorized retrospective-findings runbook maintenance
trigger_when: Prevent reported story failures and missed consumers from passing slice acceptance
scope: medium
---

# SEED-132: Acceptance follows reachable behavior

## Why This Matters

Developers need an accepted slice to preserve the story's promises along the
paths its guidance and changed behavior actually reach. Recent executions
accepted explicit limitations as costless without tracing those paths, or
selected proof that missed consumers despite the released consumer-coverage
response. Both problems produced later corrections; their identities and
execution evidence remain in the finding catalog.

These two responses improve confidence in parallel story delivery. They do
not change the product direction or implement the client products' repairs.

## Stories

<a id="prove-indirect-consumers-before-acceptance"></a>

### 2. Prove affected indirect consumers before accepting a slice

**Identity:** SEED-132#prove-indirect-consumers-before-acceptance
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/304-prove-indirect-consumers/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"384f1c049bd548e8d588255c260ba7eb211b164459f3f65e8700789b705e63a5","plan":"e60019022b77a690dbe42153bba25e759a8eb2ee3a393c163e3f2ba9f38d469c"}}
```

**Goal:** A developer can accept a slice without preventable CI repairs or
interrupting parallel work because proof missed an indirect consumer of the
changed behavior.

**Scope:**

- Reconsider the consumer-selection response released in 0.3.57 using its two
  verified later failures. Discover consumers from the effect of the change:
  follow changed output into the enclosing surface that observes it, and
  changed operation preconditions through the entry points and caller scenarios
  that reach it. Changed filenames, selectors, helpers and a plan's named tests
  are starting points, not sufficient evidence of the affected boundary.
- Account for the resulting consumer proof before slice acceptance. Inspect
  actual assertions and setup, including aggregate text and callers that omit
  storage previously unnecessary on their path. Obtain missing relevant proof
  or return the affected slice; an unrun affected consumer is not covered by a
  passing helper check or by leaving it to CI.
- Keep selection proportional. Reuse sufficient current evidence, distinguish
  equivalent from incompatible consumer purposes, and preserve the existing
  changed-surface-suite rule when that suite fits the focused-check time.
  Exclude a consumer when the changed effect does not reach its boundary;
  preserve the project's failure policy and human ownership of requirements.
  Discovering a failing assertion does not authorize weakening its promise.

**Deferred promises and boundaries:** No repairs to the historical dashboard
or Pygardon product, universal whole-repository test mandate, automatic
consumer graph, new acceptance record schema, or sibling gap-disposition
implementation. This delivery does not promise a release or a full native-host
matrix. These are delivery limits, not new product rejection rules.

**Key examples:**

1. **Whole-page text:** a sidebar heading moves below its session list.
   Searches for selectors and helper imports miss a spec reading the entire
   `body`, including hidden text. Selection follows the rendered text into that
   aggregate assertion, observes the word-boundary failure, and accounts for
   its legitimate contract before acceptance. Focused sidebar passes alone do
   not establish coverage.
2. **Newly unconditional storage:** a latest-update read moves from a
   data-source-specific strategy branch to every exit-settings computation.
   Selection follows the endpoint's caller scenarios, including profiles with
   no data-source store, rather than stopping at the three named files. The
   missing-store failure remains unaccepted until required behavior and proof
   are aligned; supplying a store solely to hide it is not sufficient.
3. **Unchanged consumer:** an independent status-label formatter consumes
   neither that rendered surface nor that storage operation. Its matching
   existing proof stays valid and it needs no additional run solely because
   other consumers were missed. Conversely, a formerly excluded consumer newly
   reached by the change must be reassessed.
4. **Incomplete return:** an implementer reports green named tests but leaves a
   discovered endpoint caller unrun or for CI. Acceptance obtains its missing
   observation or returns the dependent work, retaining unrelated valid proof
   and the project's existing handling of failures.

**Evaluation:** [ODF-150](../../docs/maintainer/finding-names.md#odf-150)
contains the two distinct verified 0.3.57 recurrences in Open Dough and
Pygardon. Preserve their original change, selection, consumer assertion/setup,
and observed failure when comparing the revised instructions with the prior
response. Demonstrate discovery and acceptance decisions for both mechanisms
and the unchanged control; record extra inspection, commands, elapsed proof
cost where observed, and limits. A longer checklist, a passing wording test,
or finding a known consumer by its supplied name does not prove improved
selection. Distinguish recovered evidence and representative walkthroughs from
fresh native-agent behavior.

**Completion:** Update ODF-150 with the actual response, implementation commit,
first containing release when available, evaluation, and remaining limits.
Do not restart a successful watch merely because new guidance was written;
verified relevant use and absence of supported recurrence are required.

**Depends on:** None; no blocking story prerequisite.

**Safe stopping point:** The changed operation's affected consumers are
accounted for without depending on the separate gap-disposition response.
