# Prove bounded GitHub failure evidence in Node Vitest

**Status:** awaiting story refinement — not ready for slice-plan refinement or execution

**Source:** [Prove bounded GitHub failure evidence in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#github-failure-evidence-via-vitest)

**Identity:** SEED-413#github-failure-evidence-via-vitest

**Split from:** SEED-413#github-request-lifetime-and-evidence-via-vitest
([plan 890](../890-prove-github-request-lifetime-and-evidence-on-vitest/PLAN.md))
on 2026-11-28, at its delivered slice 5. The slices below are provisional
input for this story's refinement. They are plan 890's former slices 6–10.
Old slice readiness does not make this plan executable.

## Current decisions (carried from plan 890)

- Use `diagnosticsForSource` and `recordFailedRead`. `GitHubRequests`
  reports a failure once per shared invocation and not for a held-back
  answer or an ordinary departure. The in-memory history is one
  module-level list of 100.
- A plain Vitest spec cannot import `dashboardServer.ts`, because it loads
  `@playwright/test` through `serverTimeControls.ts`.
- `GitHubRequests` captures `DOUGH_READ_TIMEOUT_MS` when `ghRead.ts` is
  evaluated. G1 still has to admit a CLI read past the output cap and then
  read the incident history. `authenticated-read-output-bound.spec.ts`
  does not record that history.

## Ordered slices

### 1. Record one safe diagnostic for an admitted failure

Type: Behavior
Status: planned

Behavior: An admitted failure shows its typed cause, safe metadata, and
request attribution, including a pinned revision, once per shared
invocation. Ordinary departure and a read held back before it fails do
not add an entry.

Proof: Drive `recordFailedRead` through an admitted shared read and
inspect with `diagnosticsForSource`. One upstream call for two waiters
leaves one entry carrying the admitted pin. A departing waiter and a
held-back answer leave the failure list unchanged. A recorded rate-limit
failure is not the held-back observation.

Legacy: the shared timeout, 403, rate-limit, and one-entry cases of
`authenticated-read-diagnostics.spec.ts`, plus the departure and
pinned-failure cases of `authenticated-read-diagnostics-bounds.spec.ts`.
Retire `authenticated-read-diagnostics.spec.ts` when this slice is green.
The bounds file stays until slice 2. Its separate-process stdout secret
check has no Node observation yet.

### 2. Keep only the newest safe diagnostic entries

Type: Behavior
Status: planned

Behavior: The history keeps the newest 100 failures and filters to the
requested source. Malformed, oversized, or secret-like optional metadata
is omitted and does not leak.

Proof: Drive the production observer with controlled failed answers and
inspect through `diagnosticsForSource`. Assert length 100 for the
admitted source, the oldest of 101 absent, the other source empty, and
no secret, raw text, oversized request id, or rate-limit object from the
bad optional fields.

Legacy: the newest-100 and metadata cases of
`authenticated-read-diagnostics-bounds.spec.ts`. Retire that file when
this slice is green.

### 3. Leave an incident-history record for an oversized answer

Type: Behavior
Status: planned

Behavior: An oversized answer leaves an incident-history record with its
source, category `content`, and cause `output-bound`, and with no status,
rate limit, or secret. This is G1.

Proof: Exceed the output cap with the CLI fixture in
`authenticated-read-output-bound.spec.ts`, inside an admitted read, and
read the incident history the production path writes. That spec's `runGh`
classification is not this observation. Give the case its essential
per-test timeout inside the individual test.

Legacy: none.

### 4. Read bounded incident evidence after shutdown and restart

Type: Behavior
Status: planned

Behavior: A new instance on the same machine reads earlier failures with
original dispatch, failure and owner attribution, newest first. The
entry/byte budget retains the newest records, counts drops and preserves
the start time and private permissions across trim. Clean close flushes
pending writes before the end record. A killed instance is lost, and
restart in the same PID keeps distinct instances.

Proof: Use the production `appendIncident`, `flushIncidents` and
`readIncidentRecord` with a private real directory for budget, modes and
safe bytes. Preserve a real server lifecycle witness using the admitted
pinned read, clean close and forced exit, then read through
`diagnosticsForSource` or the existing route. Exercise the real Vite
restart for same-PID identity. Capture current/ended/lost states from the
reader, never from injected stand-in process records.

Legacy: `authenticated-read-incident-record.spec.ts`,
`authenticated-read-incident-record-bounds.spec.ts`,
`authenticated-read-incident-record-restart.spec.ts`, and the process
lifecycle case of `authenticated-read-incident-record-lifecycle.spec.ts`.

### 5. Report measured stalls and fold excess stalls at close

Type: Behavior
Status: planned

Behavior: The next diagnostic read can report a real event-loop stall
with its delay, start, load, Dashboard revision and process age.
After three individual stalls in a window, later stalls fold into a
single entry with the earliest folded time, longest delay and count.
Close writes that entry.

Proof: Drive `installIncidentLifecycle` and its existing isolated stall
trigger with real Node event-loop sampling and files. Observe the first
stall through `diagnosticsForSource`, then prove the folded evidence on
close via persistent records. Keep the actual clock and event loop for
the measurement witness.

Legacy: `authenticated-read-incident-record-stalls.spec.ts` and the
stall case of `authenticated-read-incident-record-lifecycle.spec.ts`.

## Story obligations

### G1. Oversized-output incident record (first reported in slice 1 of plan 862)
Reported: slice 1 — "The incident-history record check was not carried over: source, category `content`, cause `output-bound`, no status or rate limit, and no secret in the history."
Story clause: "leave bounded, safe evidence of failures"
Disposition: receiving slice 3
