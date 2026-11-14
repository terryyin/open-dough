# SEED-324 repair ownership clarification

Recorded 2026-11-13 at the SEED-332 broader-full diagnostic boundary.

The [repository failure policy](../../../AGENTS.md#failing-and-flaky-tests)
applies as written to this coordination boundary and any resulting repair.

SEED-334's `608-product-wide-end-to-end-tests/PLAN.md:271–275` (at `125c45649`) groups
follow-up-reading ×2, reconciliation ×3, scope ×3 and landing-capture ×3
under this execution's G2 and pending `landedCiHistoryTest.ts` edits.
That reference does not match our recorded G2 or establish that each timeout
has the same cause. No matching landing-capture repair handoff is recorded
in this execution's plan or adapter coordination record.

The actual landing-capture spec is identical at the inspected import/setup
boundary in our checkout and SEED-332's current checkout: line12 imports
`pageTest`, lines31–34 import `startOrigin`, and lines45–48 manually call
`startOrigin`/`startBoundary`. It does not select `landedCiHistoryTest` as its
test fixture. That named pending-start registry is therefore not evidence
of an already-owned repair for these three cases.

Our G2 is specifically reconciliation submission before its prerequisites:
the rerun count remains zero after receipt ingestion. Its readiness changes
are in the offered adapter candidate. Our G4 owns a server starting during
fixture teardown; its pending-start registry has a native regression. G9
owns a separate collector child surviving teardown; its origin-scoped native
process-group owner also has a native regression. These responsibilities and
their explicitly offered patches remain ours. They are available to SEED-332
under the exact hashes and composition terms in the coordination record.

Shared fixture consumption alone does not assign every consumer's case-budget
failure to those repairs. Our own G1–G6 and required family/load gates stay
open. Scope-refresh read cost remains G6; no history-cache extension beyond
the frozen offered prototype is selected by the current evidence.

SEED-332's current diagnostic records three landing-capture timeouts at lines
55, 171 and 194 as G15. The existing SEED-334 grouping is an ownership
discrepancy requiring coordination, rather than evidence that SEED-324 has
already accepted or repaired those exact failures. The receiving full-run
owner must settle the repair handoff against actual failing phases before
implementation. If a failure reproduces the owned pending-start or collector
lifetime defect, route that exact evidence here; an unrelated budget cause
needs its own diagnosis and explicit receiving owner.

No source changes, tests, duplicate repair, timeout adjustment or failure
exemption follows from this clarification. Preserve SEED-334's separately
owned production/publication preparation and all receiving source/processes.
Do not edit another execution's records to manufacture agreement. This note
is the SEED-324 owner-home clarification requested by SEED-332's current
correction evidence; it is not a claim that its full gate has passed.

At15:36UTC SEED-332's `normal-pool-evidence.md` explicitly acknowledges this
note and retains G15 receiving diagnosis, unless exact evidence matches a
separately offered owned defect. That settles the receiving diagnosis owner;
the landing-capture causes, fixes and passing proof remain unresolved. All
pending source and process ownership stays preserved.
