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

<a id="accept-indirect-consumer-proof-natively"></a>

### 3. Accept indirect consumer discovery and proof judgment natively

**Identity:** SEED-132#accept-indirect-consumer-proof-natively
**State:** Unrefined; queued for native acceptance, without execution or release authority.
**Covered work:** [The consumer-proof story](https://github.com/terryyin/open-dough/blob/cfdca05274dc9845b7f9666e35a0ad68ce6ec73b/.planning/seeds/SEED-132-acceptance-follows-reachable-behavior.md#prove-indirect-consumers-before-acceptance)
and [plan 304](https://github.com/terryyin/open-dough/blob/cfdca05274dc9845b7f9666e35a0ad68ce6ec73b/.planning/slice-plans/304-prove-indirect-consumers/PLAN.md), affecting
`executable-proof.md`, implementation delegation and slice proof acceptance.

**For / why:** A developer releasing Open Dough needs observed evidence that
indirect-consumer selection and acceptance work in native host sessions.

**Outcome:** Native implementation and acceptance discover consumers from the
changed effect and obtain their sufficient observations, or leave dependent
work unaccepted, while reusing proof for unrelated boundaries.

**Tools and selection:** Codex, Cursor and Claude Code each need recorded
evidence or justified reuse for affected requirements. Select fresh behavioral
runs by unresolved risk; verified Claude Code recurrences require aggregate
output and changed I/O preconditions. Reuse shared integration evidence only for
matching unchanged mechanisms; it does not prove this behavior. No host-by-case
matrix is required. Resolve native-run authority and selection before execution;
paid runs remain explicitly invoked and outside default tests and CI.

**Representative cases:** In isolated projects and fresh native sessions,
start from a heading reorder and from conditional-to-unconditional I/O. The
invocation supplies the change and repository surface, without naming the
missing consumer. Observe discovery of an enclosing aggregate-text assertion
and entry-point scenarios with no store, inspection of their actual setup and
purpose, and proof selection and acceptance accounting for the reached result.
Retain an independent status formatter as the unchanged control. A return with
green named proof and a discovered caller left for CI must obtain missing proof
or leave dependent delivery unaccepted. Preserve the historical failure shapes
and the project's failure policy; setup that supplies the missing resource or
an assertion that removes the legitimate promise is not success.

**Reusable evidence and limits:** Plan 304's historical walkthrough records
intended guidance decisions, not native use. The `delivery-evidence/consumers`
fixture observes a changed factory contract, a stale stand-in exclusion and an
unchanged badge; its deterministic results do not exercise aggregate text or
conditional I/O. Neither source implies a native pass or universal integration recheck.

**Completion:** Before affected release under
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md), assess selected
native runs or justified reusable evidence against every affected requirement
on each tool. Require evidence of installed skill use, discovered boundary,
observed result and acceptance decision; self-report, exit zero and consumer
lists alone are insufficient. Record candidate, runtime, inputs, decisive
evidence and judgment while active. Missing proof remains pending; delivery does
not complete this acceptance story or restart ODF-150's failed watch.
