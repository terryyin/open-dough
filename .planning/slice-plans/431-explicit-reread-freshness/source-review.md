# Source review — SEED-206#explicit-reread-freshness

**Launch:** Fresh general-purpose reviewer; source-only; no plan, return, product, or proof; read no other project files.
**Input:** Selected story Goal, Scope, key examples, and Deferred promises from `.planning/seeds/SEED-206-explicit-reread-freshness.md#explicit-reread-freshness` (beneficiary, goal, scope bullets, three key examples, deferred promises).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | After a Host selection change, the explicit machine-session re-read returns offers based on evidence obtained after that change, without waiting for the next regular poll and without multiplying observations across viewers. | slice 2 | |
| 2 | The freshness promise applies to the explicit launch-offer re-read used by both launch dialogs after a Host selection change. | slice 2 | |
| 3 | Offers (options definitions, establishing hosts, session policies) come from each project's installed skill files; the observation's reuse key (project catalog and machine documents) does not cover those files, so a re-read names its own freshness rather than relying on a key change. | slice 1 | observed: `sessionsFreshHeader` / `x-open-dough-sessions-fresh` in `dashboard/src/machineSessionsRevision.ts`; demand `fresh` in `dashboard/server/sharedObservation.ts`; HTTP ask in `dashboard/tests/boundary/agent-launch-sessions-fresh.spec.ts` returns new revision with `--option-b` after options change under `sessionsReuseMs: 60_000` while held ordinary ask stays unchanged |
| 4 | A settled observation that predates that Host selection change cannot answer the re-read, even while it is inside the one-second reuse window. | slice 1 | observed: `shared-observation.spec.ts` “a settled observation inside the reuse window does not answer a fresh demand” (`starts` 1→2; ordinary still served); HTTP fresh ask observes `--option-b` |
| 5 | An observation already running before the change cannot supply stale evidence as the re-read's completed answer. | slice 1 | observed: `shared-observation.spec.ts` “an observation running before a fresh demand cannot complete it; no overlap” — fresh resolves to value 2 after release, not value 1 |
| 6 | Keep at most one observation running; wait for it to finish before obtaining suitable fresh evidence. | slice 1 | observed: same no-overlap case — `starts` stays 1 until first settles, then 2; HISTORY observation paragraph |
| 7 | Concurrent re-reads for the same changed state may share one observation that includes that change. | slice 1 | observed: `shared-observation.spec.ts` “concurrent fresh demands share one suitable observation” — three fresh → value 2 with one extra start |
| 8 | Regular background polls and the notification observer retain their existing sharing and one-second settled reuse. | slice 1 | observed: concurrent case ordinary still shares; `agent-launch-codex-observation-sharing.spec.ts` and `agent-launch-codex-observation-wait.spec.ts` stay green; notification path keeps ordinary `demand` |
| 9.1 | Preserve parsed-document reuse. | slice 1 | observed: existing boundary sessions/unchanged path unchanged; no edit to document parse reuse |
| 9.2 | Preserve unchanged-answer consistency. | slice 1 | observed: `agent-launch-sessions-unchanged.spec.ts` green; fresh HTTP case ordinary held ask `{ revision, unchanged: true }` |
| 9.3 | Preserve bounded waits. | slice 1 | observed: `agent-launch-codex-observation-wait.spec.ts` green; fresh path uses same `waited` deadline |
| 9.4 | Preserve retryable failures. | slice 1 | observed: existing failed-observation / 503 wait path unchanged in shared demand loop |
| 9.5 | Preserve each departing viewer's independent wait. | slice 1 | observed: demand still uses per-waiter `signal`; HISTORY retains “hidden or departing page ends only its own wait” |
| 11 | Example 1 expected result: after settled A, options change to B, Host switch to Codex 400 ms later → completed re-read shows B without waiting for the next 15-second poll. | slice 2 | |
| 12 | Example 2 expected result: releasing an in-flight observation that captured A does not complete the explicit re-read with A; fresh evidence yields B, with no overlapping observations. | slice 1 | observed: no-overlap unit case (value 2, starts never overlap); Host-switch wiring of the fresh marker remains slice 2 |
| 13 | Example 3 expected result: several concurrent explicit re-reads after the same installed change receive B from one suitable shared observation; ordinary polls still share and receive small unchanged answers when appropriate. | slice 1 | observed: concurrent fresh share unit case; ordinary reuse after; HTTP ordinary unchanged with held revision |
| 10.1 | Deferred: Observation expiry |  | G1 |
| 10.2 | Deferred: Lower settled heap |  | G2 |
| 10.3 | Deferred: Changes to GitHub request sharing |  | G3 |
| 10.4 | Deferred: Story-specific session reads |  | G4 |
| 10.5 | Deferred: A general refresh framework |  | G5 |
| 10.6 | Deferred: Fresh reads for actions other than the dialogs' Host switch |  | G6 |
