---
id: SEED-158
status: active
planted: 2026-10-28
planted_during: Combined project and shared feedback maintenance
trigger_when: The recorded shared execution boundary is encountered again
scope: small
---

# SEED-158: Publish a guarded increment while hosted proof remains pending

## Why This Matters

The retained [ODF-275](../../docs/maintainer/findings/ODF-275.md) evidence identifies
a concrete coordinator cost and an unfinished shared response. This story is
queued maintenance follow-up; implementation and proof have not started.

## Selected Stories

<a id="publish-awaiting-hosted-proof"></a>

### 1. Publish source for hosted proof without marking its slice complete

**Identity:** SEED-158#publish-awaiting-hosted-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/364-publish-awaiting-hosted-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"cf1a244fdf268900a26aa0511f9d826c0d8cfa3ce51a3f1fa329a9f820d6c744","plan":"9d54005dcd78355bc7bcea9f154c243548af89e13a1af91c1b494317faefa085"}}
```

**Goal:** A coordinator whose planned slice needs its published source before
hosted or external proof can be accepted can publish that authorized reviewed
source through the existing guarded preparation, hook, credit, and
exact-candidate publication path while the slice and its receiving obligations
remain unfinished, then record accepted proof and complete the slice through
the ordinary path once the observation exists.

**Scope:** Extend shared execution delivery so a fresh guarded increment may
publish the reviewed candidate without mutating the selected slice to `done`
when that slice's promised observation still depends on the published revision
(or another external observation that cannot honestly be claimed yet). Local
prerequisites, hooks, agent or ordinary commit credit, exact-candidate
publication, target authority, execution workspace ownership, observer
ownership, and interrupted-publication / existing-candidate resume stay the
same paths they are today. After the published source is observed, the
coordinator records accepted proof and finishes the slice with the ordinary
fresh path that marks `done` and still refuses completion while receiving
obligations are open or the promised observation is missing.

Failed local prerequisites still publish nothing. A progress publication does
not close receiving obligations, invent accepted proof, or authorize a later
completion that skips the observation. Ordinary fresh delivery that marks the
slice done remains available when proof is already accepted.

**Constraints:** No new release authority, trunk-integration authority ahead of
ordinary story integration, hosted merge, or CI bypass. Do not treat an open
receiving obligation as satisfied by publication alone. Preserve existing
rerun recovery so an accepted provisional candidate is resumed as an
existing candidate rather than re-prepared. These limits come from the retained
[ODF-275](../../docs/maintainer/findings/ODF-275.md) responsibility split and
evaluation, not from the number of examples below.

**Deferred promises:** Early trunk integration or early Dough Land solely to
obtain a stable main checkout for later proof remains a separate
publication-before-proof boundary and is not promised here. No second Git
plumbing path, manual agent-commit-plus-deliver workaround as the supported
contract, new observer, or broad redesign of story-obligation ownership is
promised. This preparation does not authorize implementation or a release.

**Key examples:**

1. A planned slice's proof requires a hosted CI receipt of its own published
   source, and a receiving obligation for that observation is still open → the
   coordinator runs the guarded progress publication → the reviewed source is
   accepted on the authorized target with ordinary credit and an exact
   candidate SHA, the slice stays unfinished, the obligation stays open, and
   nothing is published when a local prerequisite fails first.
2. After that provisional publication, the hosted run and skip receipts exist
   for the published SHA → the coordinator records accepted proof and runs
   ordinary fresh delivery for the same slice → the slice becomes `done` only
   with that proof; completion still refuses while the promised observation is
   missing.
3. An externally blocked hosted-delivery slice needs a useful progress
   increment while its slice remains unfinished → guarded progress publication
   ships the reviewed source without marking the slice done → later ordinary
   completion follows once the external observation is accepted; execution
   HEAD, index ownership, and slice status stay coherent across the two
   increments.
4. An evidence-only slice cannot honestly be marked done yet because its proof
   is only an external observation → progress publication (or an equivalent
   unfinished-slice increment that does not claim done) publishes without a
   false done transition → a later ordinary increment records the observation
   and marks done; the earlier "slice is done in the working plan but not at
   HEAD" refusal shape is not forced by inventing an early done mark.

**Evaluation:** Use the three Lizard DD-002 cases as bounded examples: hosted
CI needs a source SHA; externally blocked hosted delivery has a useful progress
increment; an evidence-only slice cannot honestly be done yet. Verify that
pending proof stays owned, failed local prerequisites publish nothing, the
published SHA matches the reviewed source, and final completion still refuses
until the promised observation exists. Preserve existing target authority,
execution workspace/observer ownership and rerun recovery. No new release,
trunk integration authority, hosted merge or CI bypass is implied.

**Completion:** At ODF-275's authoritative finding record, retain the actual
response revisions, first containing release, proof/limits and a checkable
ordinary-use observation request. Queueing is **not resolution**.
