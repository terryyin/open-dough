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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/581-keep-ci-wall-time-history-readable-across-dashboard-updates/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"01a8ba74937fab26edf1618c96a0a8a0cb1edea93fe9a94274fb9dd9fb24dd1d","plan":"1801f8b7974ebb3c59790bc7cf668bb85026c3c266c2114335950f736869b3af"}}
```

#### Goal

A developer who leaves Project Intent's CI status open across an Open Dough
dashboard deployment can still read that project's collected CI wall time
history after the deployment introduces a new final gap reason. Measured
builds stay visible, and every gap still has an understandable reason for
each Open Dough frontend version this story keeps compatible.

#### Scope

**Required behavior**

- The local authenticated `intent=ci-history` history response remains
  readable by the Open Dough frontend that was already loaded before the
  deployment, including when the updated server would otherwise emit a new
  final gap reason such as `timing-basis`.
- That older frontend still shows the measured builds and an understandable
  gap for each landing that cannot be measured for that reason.
- A frontend loaded after the deployment can show the more specific new gap
  reason for the same history.
- Automated regression coverage exercises the previous frontend reader
  against the updated server response so a later new gap reason fails closed
  instead of repeating the response-shape outage.

**Required restrictions**

- Compatibility is owed only at Open Dough's local `intent=ci-history`
  response boundary between the dashboard server and Open Dough's own
  frontend readers. Remote CI adapters and non-dashboard clients are out of
  this contract.

**Scope limits**

- Does not require the developer to reload; a reload already picks up the
  deployed reader and is not the fix.
- Does not introduce a general dashboard API versioning framework beyond what
  this history response needs.
- Does not change how landings are collected or which landings are measured;
  it keeps already-collected measured history readable across the reader
  update.
- Does not promise compatibility with every historical Open Dough revision —
  only with the prior deployed frontend reader that can still be open after
  the update that introduced the new reason (evidenced by the PyArtem outage
  pair below).

**Evidence**

The production history response for PyArtem (`terryyin/pygardon`) included 12
measured builds and 12 gaps with reason `timing-basis`. The reader from Open
Dough revision `49367c2e4` rejected the entire response and reproduced the
reported response-shape error. The reader from the deployed revision
`5a5f5e922fab` accepted the same response. A reload picks up the deployed
reader.
[Server projection](../../dashboard/server/landedCiHistoryEntries.ts) ·
[Frontend reader](../../dashboard/src/authenticatedIntentCiHistoryRead.ts)

**Assumptions**

- The outage mechanism is the Zod reader rejecting an unknown final gap
  `reason`, which discards the whole history answer rather than only the
  unfamiliar gap.
- Planning may choose the smallest mechanism that satisfies the examples
  (for example a compatible default projection with an opt-in for newer
  reasons); the seed does not lock that design.

#### Key examples

- Pre-condition: Project Intent CI status is open on the prior deployed
  frontend, and the server has just begun emitting `timing-basis` gaps for
  some retained landings. Trigger: the open tab reads `intent=ci-history`.
  Result: measured builds remain visible, and each timing-basis landing
  shows as an understandable gap instead of a response-shape error that
  blanks the history.
- Pre-condition: the same collected history after the developer loads the
  newly deployed frontend. Trigger: that frontend reads `intent=ci-history`.
  Result: it can show the specific timing-basis reason for those gaps.
- Pre-condition: automated coverage pins the previous frontend reader.
  Trigger: the updated server answers with a response that includes the new
  gap reason. Result: the previous reader accepts a compatible history
  answer; a regression that reintroduces a whole-response rejection fails
  the check.
