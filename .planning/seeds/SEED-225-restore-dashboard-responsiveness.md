---
id: SEED-225
status: active
planted: 2026-11-03
planted_during: Terry Yin's report of a less responsive production dashboard and more frequent GitHub access outages
trigger_when: Dashboard interaction stalls or published work becomes temporarily unreadable
scope: story
---

# SEED-225: Restore dashboard responsiveness and reliable GitHub access

<a id="deferred-proposals"></a>

## Deferred proposals

Restore dashboard responsiveness (SEED-225#restore-dashboard-responsiveness,
recoverable at `7c0fd67273be4abbff2c55b5820ee8e2ccc10938:.planning/seeds/SEED-225-restore-dashboard-responsiveness.md`)
delivered a durable incident record and cheap Sessions refreshes, and
deferred these proposals, not rejected, until the incident record has
evidence from a real outage:

- Intent inventory shown independently of Proof, with proof read for the
  visible selection and fan-out bounded so Board and CI reads keep
  progressing, and a browser measurement of the 94-file journey. Judged on
  recorded queue waits behind Intent reads.
- Controlled request-owner handoff that preserves holds and in-flight
  ownership, mixed-version handoff tests, and serving the old preview until
  its replacement is ready. Judged on recorded owner turnover and
  replacement gaps at incidents.
- Proxy access logging, dial retry, and process supervision.
- Retained-answer cache scan changes, judged on recorded event-loop stalls.
