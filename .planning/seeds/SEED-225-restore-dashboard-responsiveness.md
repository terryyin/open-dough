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

## Selected Stories

<a id="correct-incident-and-workspace-observation-residue"></a>

### Correct incident identity and observation residue

**Identity:** SEED-225#correct-incident-and-workspace-observation-residue
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/457-correct-incident-and-workspace-observation-residue/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"0659f31933f0f2e0d2354aaabc91b982ecdde74a0f5ad75ccceebe1dda49f43d","plan":"e189686090a0b043db35c76b4d4ad7b7d190433550ac3659d9fa8b4985421638"}}
```

**Goal.** A developer relying on the dashboard's incident record and cheap
Sessions refreshes gets evidence that stays attributable across a dev-server
restart, refreshes that stay cheap while Git runs in a project's main
checkout, accurate advice when the request owner cannot be reached, and a
recovery proof that does not depend on machine speed: the residue the
execution retrospective of Restore dashboard responsiveness
(SEED-225#restore-dashboard-responsiveness, recoverable at
`7c0fd67273be4abbff2c55b5820ee8e2ccc10938:.planning/seeds/SEED-225-restore-dashboard-responsiveness.md`)
found.

**Scope.** Correct the five reviewed defects named in the plan without
changing that story's promises: a per-load incident identity, a queued signal
for the owner-replacement proof, a Git identity without folder times, the
lost-connection wording limited to a mid-request loss, and one declared list
of history-only fields. No new product behavior beyond those corrections.

**Plan:** [457-correct-incident-and-workspace-observation-residue](../slice-plans/457-correct-incident-and-workspace-observation-residue/PLAN.md)
