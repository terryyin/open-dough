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

<a id="check-gap-dispositions-through-guided-paths"></a>

### 1. Check a reported gap against the paths the story guides before accepting it

**Identity:** SEED-132#check-gap-dispositions-through-guided-paths
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** A developer receives the promised story behavior without a
later correction for a reported limitation that acceptance dismissed as
unreachable or costless.

**Outcome / scope:** Establish how acceptance checks a proposed `no user cost`
or `proved` disposition against the actual entry, continuation, failure, and
handoff paths relevant to that gap. A reachable contradiction is returned or
retains an explicit owner; a justified harmless limitation can close without
adding routine obligations unrelated to the change. Preserve the existing
story-obligation identity and human authority over scope.

**Evaluation:** Use representative cases from [ODF-223](../../docs/maintainer/finding-names.md#odf-223),
including a hand-resolved integration failure and a worktree left by another
agent. Acceptance distinguishes a reachable broken promise from a genuinely
unreachable limitation even when the named proof passes. Include a benign
case to assess the added work; another checklist or entry count alone is not
evidence of improvement.

**Completion:** Record the actual response, implementation commit, first
containing release when available, observed results, and remaining limits on
ODF-223. Delivery alone does not mark the finding resolved. Keep occurrences
in the catalog rather than copying them here.

**Depends on:** None; no blocking story prerequisite.

**Safe stopping point:** Gap decisions have support from the reachable story
paths even if the separate consumer-proof response is not selected.

<a id="prove-indirect-consumers-before-acceptance"></a>

### 2. Prove affected indirect consumers before accepting a slice

**Identity:** SEED-132#prove-indirect-consumers-before-acceptance
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** A developer avoids preventable CI repairs and interrupted
parallel work when a small change reaches consumers beyond its named files.

**Outcome / scope:** Reconsider the consumer-selection response released in
0.3.57 using its supported later failures. Make affected consumers discoverable
and account for their proof before acceptance, including page-wide text
assertions and callers of a newly unconditional storage read. Keep proof
proportionate to the changed behavior; do not prescribe every repository's
whole suite or weaken a project's failure policy.

**Evaluation:** [ODF-150](../../docs/maintainer/finding-names.md#odf-150)
contains two distinct verified 0.3.57 recurrences, in Open Dough and Pygardon.
Use those mechanisms to show the response finds and proves consumers missed
by a selector/helper search or the plan's named callers. A representative
unchanged consumer must stay outside the required selection. Compare the
result with the previous response, including proof cost and limitations.

**Completion:** Update ODF-150 with the actual response, implementation commit,
first containing release when available, evaluation, and remaining limits.
Do not restart a successful watch merely because new guidance was written;
verified relevant use and absence of supported recurrence are required.

**Depends on:** None; no blocking story prerequisite.

**Safe stopping point:** The changed operation's affected consumers are
accounted for without depending on the separate gap-disposition response.
