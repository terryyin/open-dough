---
id: SEED-252
status: active
planted: 2026-11-07
scope: story
---

# Dashboard frontend test entry

## Context

The current dashboard test entry contains browser journeys through the real
service alongside DOM-only observations and frontend behavior exercised with
synthetic backend responses. Initial examples include touch-reading geometry,
control reachability, Intent read recovery, and attachment refusal feedback.
Some files mix these responsibilities, and the shared fixture can start a real
backend even for assertions that need only the DOM.

## Story

<a id="extract-dashboard-frontend-tests"></a>

### Extract Dashboard Frontend Test as a separate entry

**Identity:** SEED-252#extract-dashboard-frontend-tests
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer reviewing frontend behavior and its automated
protection independently of backend service behavior.

**Outcome:** Dashboard Frontend Test appears as a separate Intent entry backed
by `dashboard/frontend-tests/`, beside the existing dashboard and backend test
directories. Its tests exercise frontend behavior without requiring the real
dashboard backend service.

**Scope:** Audit the existing dashboard test cases and their fixtures. Extract
frontend-only tests and frontend tests that substitute mocked backend-service
responses. Remove incidental backend setup from those tests. Split mixed files
when needed so frontend cases move while genuine service-integration coverage
remains protected in the existing dashboard entry. Inspect what each test
proves: an image stub, a transport failure, or interception that still fetches
and verifies real service behavior does not by itself establish frontend-only
coverage.

**Key examples:**

1. A test creates synthetic DOM and checks control reachability → it runs in
   Dashboard Frontend Test without starting the dashboard backend.
2. A test verifies UI recovery or feedback using synthetic backend responses →
   it belongs to Dashboard Frontend Test with explicit service substitutes.
3. A file mixes frontend-only cases with real-service assertions → separate
   their ownership without losing either behavior or executing a case twice.
4. The extracted inventory contains more than ten test files → organize them
   into concise frontend feature groups during this story. With ten or fewer
   files, keep the frontend entry flat. Count the files presented in Intent;
   do not split files merely to change the threshold.

**Grouping:** When needed, use the existing feature vocabulary where accurate,
with a small complete set of at most ten groups. Each group has one defining
domain name, without "and" or a list of concerns. Every frontend test belongs
to exactly one group; shared fixtures may remain shared.

**Constraints:** Preserve all existing cases and assertions, the independent
Dashboard Backend Test entry, and real frontend/backend integration coverage.
Update discovery, imports, Intent locations, CI proof ownership, duration
records, and maintained documentation for the new entry. Keep CI execution
complete, avoid duplicate cases or added shared setup costs, and verify no
increased CI wall time against a comparable baseline.

**Failure policy:** [Failing and flaky tests](../../AGENTS.md#failing-and-flaky-tests)
applies as written.

## Inspection starting points

- [Touch-reading observation](../../dashboard/tests/runtime/touch-reading-observation.spec.ts).
- [Control reachability](../../dashboard/tests/runtime/control-reachability-observation.spec.ts).
- [Mixed observation measurements](../../dashboard/tests/runtime/observation-measurements.spec.ts).
- [Intent candidate recovery](../../dashboard/tests/intent/intent-candidates-read-recovery.spec.ts).
- [Attachment refusal feedback](../../dashboard/tests/terminals/agent-terminal-touch-paste-image.spec.ts).
- [Current shared fixture](../../dashboard/tests/dashboardTest.ts).
- [Current feature groups](../../dashboard/tests/feature-groups.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
