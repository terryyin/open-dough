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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/488-extract-dashboard-frontend-tests/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d0e2b440b78fc58163b9816fd0aa8c2520a762dd8c60aa36fcc6ab0b3baa2fac","plan":"2d8b98f2e0152e91b0c0621678eda4a12022476f95e6e4cb1ffcd30b40c131d5"}}
```

**Beneficiary:** A developer reviewing frontend behavior and its automated
protection independently of backend service behavior.

**Goal:** Opening Intent reveals **Dashboard Frontend Test** as a separate entry
backed by `dashboard/frontend-tests/`, beside `dashboard/tests/` and
`dashboard/backend-tests/`, whose tests exercise DOM and frontend UI behavior
with explicit service substitutes and without starting the real dashboard
backend service, while preserving integrated journey coverage, backend boundary
coverage, and shared CI wall time.

**Scope:**

- **Required:**
  - Audit the existing dashboard test suite and its shared fixtures to separate
    DOM-only tests and frontend tests that exercise UI behavior through
    synthetic backend-service responses from journeys that prove real
    frontend/backend service integration.
  - Extract frontend-only and mocked-backend frontend cases into
    `dashboard/frontend-tests/` and remove incidental backend setup (such as
    starting `dashboardServer`, fake `gh`/host processes, or git-published
    origin fixtures) from those extracted tests, replacing them with explicit
    frontend service substitutes where the UI reads or posts to an endpoint.
  - Split mixed spec files so frontend cases move to `dashboard/frontend-tests/`
    while genuine service-integration cases remain in `dashboard/tests/`.
  - Organize `dashboard/frontend-tests/` according to the extracted file count
    presented in Intent: keep it flat when ten or fewer files are extracted;
    organize it into concise frontend feature groups using the existing feature
    vocabulary ([feature groups](../../dashboard/tests/feature-groups.md)) when
    more than ten files are extracted.
  - Expose `dashboard/frontend-tests` in `.planning/open-dough.json` with label
    `Dashboard Frontend Test` and update test discovery, TypeScript/ESLint
    configuration, Intent browse coverage, CI proof fragment/summary
    declarations, duration records (`dashboard/longest-first*`), and maintained
    documentation.
- **Required restrictions:**
  - Do not extract a test merely because it stubs an image, injects a transport
    failure, or intercepts a request while still fetching and verifying real
    backend service behavior. Justification: genuine service-integration
    protection must remain in the integrated dashboard suite rather than being
    misclassified or weakened.
  - Preserve every existing case and its assertions, executing each case once
    across the shared Playwright run; do not split files merely to cross the
    ten-file grouping threshold. Justification: extraction must not drop,
    duplicate, or artificially fragment test protection.
  - When grouping is triggered (more than ten extracted files), use at most ten
    groups, each with one defining domain name (without "and" or a list of
    concerns), and place every frontend test in exactly one group while allowing
    shared fixtures to remain shared. Justification: Intent browsing stays
    scannable and consistent with the existing domain vocabulary.
  - Keep the independent Dashboard Backend Test entry, the single shared
    Playwright build and twelve-shard CI schedule, and CI wall time no worse
    than a comparable successful baseline. Justification: separating the
    frontend entry must not add shared setup overhead or slow CI feedback.
- **Scope limits:**
  - Does not change product runtime behavior beyond configuring and browsing the
    new Intent location.
  - Does not redesign the shared Playwright runner, shard count, deadlines,
    retries, or add CI jobs or builds.
  - Does not regroup `dashboard/backend-tests/`
    ([SEED-251](SEED-251-group-dashboard-backend-tests.md#group-dashboard-backend-tests)).

**Key examples:**

1. A test creates synthetic DOM and checks control reachability or layout
   arrangement → it runs in **Dashboard Frontend Test** (`dashboard/frontend-tests/`)
   without starting the dashboard backend or fake GitHub.
2. A test verifies UI recovery, status formatting, polling, or refusal feedback
   using synthetic backend responses (such as candidates recovery from synthetic
   rate-limit/malformed answers, phone Paste 413 attachment refusal, synthetic
   host-status figures, or synthetic startup/runner responses) → it runs in
   **Dashboard Frontend Test** against the built frontend with explicit service
   substitutes and no real backend server.
3. A file mixes frontend-only or synthetic-response cases with real-service
   assertions (such as `observation-measurements.spec.ts`,
   `intent-candidates-read-recovery.spec.ts`,
   `agent-terminal-touch-paste-image.spec.ts`,
   `agent-launch-creation-gates.spec.ts`,
   `sessions-sidebar-host-status.spec.ts`, or `cursor-runner-sessions.spec.ts`)
   → the frontend cases move to `dashboard/frontend-tests/` and the
   real-service cases stay in `dashboard/tests/`, with each case executing once.
4. The extracted inventory contains ten or fewer test files → keep
   `dashboard/frontend-tests/` flat; if the audit extracts more than ten test
   files → organize them into at most ten single-concept frontend feature groups
   during this story.

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
