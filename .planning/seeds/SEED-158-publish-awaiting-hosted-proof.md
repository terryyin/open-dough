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

For a coordinator whose slice needs its published source to obtain hosted
proof, publish the authorized reviewed source through the existing guarded
preparation, hook, credit and exact-candidate publication path while the slice
and its receiving obligations remain unfinished. After observing that source,
record accepted proof and complete the slice through the ordinary path.

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
