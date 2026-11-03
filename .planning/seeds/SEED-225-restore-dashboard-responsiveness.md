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

<a id="resolve-stuck-attempt-reconciliation"></a>

### Resolve attempts that appear to be reconciling forever

**Identity:** SEED-225#resolve-stuck-attempt-reconciliation
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/458-resolve-stuck-attempt-reconciliation/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"739f9f7d68c1dd459adde63e8ff31db49e9990659a7ead57e984718ff72d46f3","plan":"1549cba2659bdcd380c96b2af5bfb9297af5082adf73a886059b2da13dd491aa"}}
```

**Goal.** A developer reviewing an execution attempt in the dashboard can
tell whether reconciliation is still in progress or has reached an outcome.
An attempt whose session has already completed reaches its outcome instead
of holding the story's actions behind "Waiting for published story state"
indefinitely.

**Findings.** The responsiveness story's final report pointed at story
obligation G4 of its plan (recoverable at
`7c0fd67273be4abbff2c55b5820ee8e2ccc10938:.planning/slice-plans/456-restore-dashboard-responsiveness/PLAN.md`):
a story attempt with no recorded outcome but a completed session stays
"reconciling" forever. Refinement on 2026-11-04 confirmed the mechanism
through the dashboard's own modules, not from a production record:

- The displayed status is the `reconciling` startup state: the story card
  says "Waiting for published story state: this start settled on this
  machine, and this story's actions return once origin shows its result",
  and the story's actions stay unavailable (`dashboard/src/StartupStatus.tsx`).
- A completion report is accepted for a launch whose native session is not
  yet confirmed, so an attempt that lost its worker before confirming its
  session keeps no outcome while its session's completed report arrives
  (`dashboard/server/completionReservation.ts`). Until that report, the
  attempt needs reconciliation and Startup recovery offers Recheck and
  Continue; the report ends that need (`needsReconciliation` in
  `dashboard/src/launchAttemptSelection.ts`), so the story's startup falls
  through to the reconciliation judgement.
- That judgement, the fresh read it asks, and the machine's noting of a
  reconciled attempt all take "settled" as "has a recorded outcome and
  settlement time" (`dashboard/src/startupReconciliation.ts`,
  `dashboard/server/launchAttemptReconciliation.ts`), so the attempt is
  never judged against the published snapshot, never noted, and never
  leaves the Sessions overview's attention. Nothing the developer can do in
  the dashboard clears it.
- The machine's launch store (988 story attempts across six projects) and
  its three retained backups hold no attempt in that state today, and every
  published revision in it is contained by its project's trunk, so neither a
  production capture nor the judgement's silent "not contained" answer is
  available as the reported case.

**Scope.** The dashboard settles a story attempt by either its recorded
outcome or its session's completed report, and reconciles both the same way:

- A story attempt whose session reported completion is judged against the
  published snapshot like a settled attempt: reconciled once a fully read
  snapshot contains its published revision, or, when it published no
  revision, once a snapshot read was asked after its completion was
  received; the fresh read asked for a settled attempt is asked for it too.
- Once reconciled, the attempt is noted on this machine so every page reads
  it so, the story's actions return, and the attempt leaves the Sessions
  overview's attention like any reconciled attempt.
- A start that lost its worker and has no completed session keeps its
  Startup recovery (Recheck and Continue); a settled attempt whose snapshot
  is incomplete or whose latest read or containment check failed keeps the
  waiting display with its reason.

Scope limits: a containment answer of "not contained" still waits without
an explanation, as it does today, because no published revision has ever
been outside its trunk; settling the attempt's outcome from the native
session's own record is not undertaken; no purge or edit of stored attempts.

**Key examples.**

- A story attempt accepted with its assignment published at revision R lost
  its worker before confirming its session; its session later reported
  completion; trunk is now at a revision containing R → the page reads the
  project → the story shows its published state with its actions available,
  the attempt is noted reconciled on this machine, and the Sessions overview
  no longer carries it.
- The same attempt while the latest read of published work failed → the
  story card says it is waiting for published story state with the read's
  failure → the next successful read reconciles it.
- The same attempt before its session's completion report, with no server
  running it → the story card says its startup needs reconciliation and
  Startup recovery offers Recheck and Continue, as today.
- A story attempt that published nothing, whose session reported completion
  → a snapshot read asked after that report was received reconciles it.

**Architecture.** One rule for a settled attempt belongs in the selection
shared by browser and server (`dashboard/src/launchAttemptSelection.ts`),
consumed by the story startup, the reconciliation judgement, the overview's
attention set, and the server's noting, so the page and the machine agree on
what settled means. [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
applies and is kept: the completion report is machine-local session
evidence that settles a local attempt, while the attempt's published
progress is still judged from origin containment, not inferred from the
report.

**Evaluation.** Reproduce the confirmed failure in a dashboard journey with
a worker lost before its session was confirmed and that session's completion
reported, and verify through the dashboard that the story shows its actual
outcome after the published read settles, while an attempt whose read is
still failing continues to show that reconciliation is in progress.

**Plan:** [458-resolve-stuck-attempt-reconciliation](../slice-plans/458-resolve-stuck-attempt-reconciliation/PLAN.md)
