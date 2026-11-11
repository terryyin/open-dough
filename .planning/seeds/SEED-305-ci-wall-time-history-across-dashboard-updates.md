---
id: SEED-305
status: active
planted: 2026-11-11
planted_during: PyArtem CI wall time history displayed a response-shape error
scope: story
---

# SEED-305 — CI wall time history across dashboard updates

<a id="keep-ci-wall-time-history-readable-across-dashboard-updates"></a>

### Keep CI wall time history readable across dashboard updates

**Identity:** SEED-305#keep-ci-wall-time-history-readable-across-dashboard-updates
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

Developers who leave Open Dough's CI status tab open can still read collected
CI wall time history after a dashboard deployment introduces a new gap reason.
Keep measured builds visible and represent gaps truthfully for each supported
frontend version.

#### Evidence and scope

The production history response for PyArtem (`terryyin/pygardon`) included 12
measured builds and 12 gaps with reason `timing-basis`. The reader from Open
Dough revision `49367c2e4` rejected the entire response and reproduced the
reported response-shape error. The reader from the deployed revision
`5a5f5e922fab` accepted the same response. A reload picks up the deployed reader.

The compatibility boundary is Open Dough's local `intent=ci-history` response.
One candidate is to preserve a compatible default response and let a newer
frontend opt into new gap reasons.
[Server projection](../../dashboard/server/landedCiHistoryEntries.ts) ·
[Frontend reader](../../dashboard/src/authenticatedIntentCiHistoryRead.ts)

#### Key examples

- A frontend loaded before the deployment reads history from the updated
  server. It still shows the measured builds and an understandable gap for
  each landing whose timing basis could not be verified.
- A frontend loaded after the deployment reads the same history and can
  show the more specific timing-basis reason. Regression coverage exercises
  the previous frontend reader against the updated server response.
