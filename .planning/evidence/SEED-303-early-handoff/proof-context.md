# Architecture and existing proof

- Reuse normal Playwright, its strict proof record, shared MakeMe and existing
  external-provider fixtures. Existing [run artifacts](../../../dashboard/tests/support/globalSetup.ts)
  already share the app and published origins. Start by measuring their
  included setup cost and reusing them where the consumed state is identical.
- Qualification already has a [real Git boundary](../../../dashboard/backend-tests/runtime/production-qualification.spec.ts).
  [Deployment](../../../dashboard/backend-tests/runtime/production-deployment.spec.ts)
  exercises real pinning and preview. Read the failure chain's accepted cost
  before proposing a smaller lifecycle proof. Keep real process signals and
  preview drain where they establish distinct protection.
- The [request admission policy](../../../src/skills/dough-execute-plan/scripts/github-request-admission.mjs)
  already receives time for some operations. The [observation clock](../../../dashboard/server/observationClock.ts)
  serves a different owner. Reuse its controlled-time pattern if useful and
  trace the installed request owner through real requests. Accepted
  [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  and the [North Star](../../NORTH-STAR.md) keep authority in Git and local
  request admission at the existing boundary. Keep production clocks, routing,
  credential handling, and process ownership on their existing paths. Any
  change to the released owner follows [ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md).
- Reuse Cursor's [last-held proof](../../../dashboard/backend-tests/sessions/cursor-runner-last-held.spec.ts),
  [reconciliation boundary](../../../dashboard/backend-tests/launches/settled-attempt-reconciliation.spec.ts),
  and landed repeat's [receipt](../../../dashboard/backend-tests/intent/landed-ci-repeat-receipt-boundary.spec.ts),
  [admission](../../../dashboard/backend-tests/intent/landed-ci-repeat-admission.spec.ts)
  and [verdict](../../../dashboard/backend-tests/intent/landed-ci-repeat-verdict.spec.ts)
  checks as coverage candidates. Their presence does not establish overlap.
  Verify which plausible regression each would detect before crediting it.
- Accepted [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  requires comparable gain that justifies future maintenance. Judge new setup
  or timing control by the proof it preserves and its maintenance cost.
