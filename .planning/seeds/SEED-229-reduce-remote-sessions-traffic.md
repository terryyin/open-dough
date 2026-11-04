---
id: SEED-229
status: active
planted: 2026-11-04
planted_during: Terry Yin's report of heavy traffic when using the dashboard remotely and request to prioritize the improvement
trigger_when: A developer opens the dashboard or its Sessions view over a limited connection
scope: story
---

# SEED-229: Reduce remote Sessions traffic

<a id="reduce-remote-sessions-traffic"></a>

### Reduce remote Sessions traffic

**Identity:** SEED-229#reduce-remote-sessions-traffic
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/462-reduce-remote-sessions-traffic/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"749aef7dc6b8bd2f884a7fc2b4d418fbee0b0dba74dc088746dbae8f3ef74980","plan":"b86a28378b1b91f4468bca5bb6b79b6c9fd425382e70a8e704083906d85d22a9"}}
```

**Goal:** A developer using the dashboard over a limited connection can see
which sessions need attention and open retained session details while
downloading substantially less data.

**Why now:** A cold load through the configured Tailscale route transferred
13.5 MB on production revision `4b5c31481`. The full Sessions reply accounted
for 9.9 MB and repeated once during a 61-second idle trace. Completed story
SEED-225#restore-dashboard-responsiveness has since separated retained detail
from the overview in the source. Applying that split to the measured records
projected 2.3 MB for the overview and 0.50 MB with gzip. Evaluate this story
against the current split, independently of the gains from deploying it.

**Scope:** Reduce the bytes transferred by full Sessions overview and
on-demand history responses. Preserve the existing session states, attention
pace, revision checks and access to retained details. A local session remains
machine evidence. Its visibility does not change published story membership,
progress, or the evidence shown in Intent. Portraits, terminal streaming,
other endpoints, hosting configuration and a protocol for partial updates
are outside this story.

**Key examples**

- A developer opens the dashboard with roughly 1,000 retained sessions, then
  an open session needs attention. The first and changed full overview each
  transfer at least 70% fewer response-body bytes to a client accepting gzip
  than the same uncompressed reply, with a target of at most 650 kB
  (650,000 bytes) for the replay fixture. The status appears within the
  existing refresh pace. An unchanged poll still carries only its revision
  and unchanged marker.
- A developer opens retained history. The full history reply transfers at
  least 70% fewer response-body bytes on the same fixture and still supplies
  the same detail. The page asks for history on demand under its own revision,
  and a failed read still leaves the listing usable and can be retried.
- A client omits gzip support or explicitly refuses it and receives the same
  full JSON using identity encoding. The transport leaves the reply private to
  the existing local boundary and the browser does not store it in its HTTP
  cache.

This is a top-priority usability fix for the existing Development and
review workflow. It supports access to the evidence described in the
[Dashboard UX/UI North Star](../../docs/dashboard-ux-ui-north-star.md)
alongside the backlog's near-future focus on reviewing Purpose and Proof.
