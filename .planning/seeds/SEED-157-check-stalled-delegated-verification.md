---
id: SEED-157
status: active
planted: 2026-10-28
planted_during: Combined project and shared feedback maintenance
trigger_when: The recorded shared execution boundary is encountered again
scope: small
---

# SEED-157: Keep delegated verification from waiting indefinitely

## Why This Matters

The retained [ODF-369](../../docs/maintainer/findings/ODF-369.md) evidence identifies
a concrete coordinator cost and an unfinished shared response. This story is
queued maintenance follow-up; implementation and proof have not started.

## Selected Stories

<a id="check-stalled-delegated-verification"></a>

### 1. Check stalled delegated verification before observation coverage lapses

**Identity:** SEED-157#check-stalled-delegated-verification

For a coordinator waiting on delegated proof, check liveness when the real
command outlasts its expected proof window. Distinguish an active expensive
run, queued work, a yielded handle and a non-yielding/stuck process; preserve
the command, actor, process/handle, last progress and applicable CI coverage.
Return a bounded diagnosis, safe recovery or explicit unfinished handoff before
waiting consumes the observer budget or requires the owner to ask for status.
Use the project's existing runner bound and process ownership; the shared
response does not implement Pygardon's separate test-runner story.

**Evaluation:** Reconstruct the recorded DD-371 wait with a controlled stuck
verification: the coordinator notices and retains evidence without a human
status request. A healthy long-running verification keeps its real result and
is not restarted solely for being slow. No completion is fabricated, no
unowned process is killed, and an ended CI observer is reported truthfully.
Record added liveness-check effort alongside delay avoided; do not impose a
universal new test duration or build a second process supervisor.

**Completion:** At ODF-369's authoritative finding record, retain the actual
response revisions, first containing release, proof/limits and a checkable
ordinary-use observation request. Queueing is **not resolution**.
