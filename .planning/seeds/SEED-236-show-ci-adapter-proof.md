---
id: SEED-236
status: active
planted: 2026-11-05
planted_during: Terry Yin's request to queue the Open Dough supplier for Pygardon CI proof
trigger_when: A developer opens Intent’s CI status tab for a project that uses a CI adapter
scope: story
---

# SEED-236 — Show the CI proof of a CI-adapter attempt

<a id="show-ci-adapter-proof"></a>

### Show the CI proof of a CI-adapter attempt

**Identity:** SEED-236#show-ci-adapter-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

A developer opening **Intent → CI status** for a project that uses a CI
adapter can see the proof counts and parts published for the displayed
attempt. Today the tab skips Proof for adapter projects, and the GitHub
Actions summary identity requires integer `runId` and `runAttempt` values.
Pygardon's controller identifies attempts with UUIDs.

Add a proof read to the CI adapter protocol. Use the adapter's `attemptId`
and full `revision` together to identify the summary, and render it in the
tab only when both identify the displayed attempt unambiguously. Keep the
GitHub Actions artifact reader and its existing run identity working.

- A matching summary for a UUID attempt shows its published counts and parts.
  Two attempts at the same revision each show their own proof.
- If an adapter lacks the proof read or the summary is missing, unreadable,
  ambiguous, or for another attempt or revision, the tab shows why Proof is
  unavailable and preserves the CI verdict. This follows
  [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  on distinguishing evidence availability from a negative result.

Release the Open Dough reader and protocol so Pygardon can complete its live
Intent check. Pygardon owns JUnit summary publication, diagnostics delivery,
its adapter's proof read, and the live Pygardon verification in
`SEED-20261076#publish-pygardon-ci-proof`.
