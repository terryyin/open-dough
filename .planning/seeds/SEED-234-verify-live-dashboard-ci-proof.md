---
id: SEED-234
status: active
planted: 2026-11-05
planted_during: Terry Yin's request to prioritize CI proof adoption
trigger_when: An Open Dough developer opens Intent’s CI status tab for a real Open Dough CI run
scope: story
---

# SEED-234: Verify Open Dough CI proof in the live dashboard

<a id="verify-live-dashboard-ci-proof"></a>

### Verify Open Dough CI proof in the live dashboard

**Identity:** SEED-234#verify-live-dashboard-ci-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/469-verify-live-dashboard-ci-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ae7976dfab0db7ff2588e75f43caaac39ca46ba2531373a89fc1822d64a65ce1","plan":"86c6452827871849c1980e7a99f04ec32a2bbe0ebc6f71e4ae6f8a96727be05f"}}
```

**Goal:** An Open Dough developer who opens **Intent → CI status** for Open
Dough in the live dashboard can trust the **Proof** shown there: it is the
proof summary that the shown GitHub Actions run published, with the same
counts and parts, and a run without a usable summary says so instead of
reading as a CI failure. This closes the adoption of CI proof in Open Dough
itself with observed evidence rather than fixture-only proof.

**Scope:**

- Required: one observation of the live dashboard (the deployed production
  dashboard at `http://127.0.0.1:4173`, reading with the developer's own
  `gh`) and of the summary artifact the shown trunk run published, compared
  for repository, run, attempt and revision, and for the
  `dashboard/tests`, `tests` and `src/skills` rows' passed, failed and other
  counts and present parts. Record the run link, both observations and the
  verdict in the plan's accepted proof.
- Required: observe, live, a project whose shown run published no summary,
  and confirm the tab keeps the run's verdict and gives the one reason line
  under Proof. The failed-verdict-without-summary combination stays proven by
  `dashboard/tests/intent-ci-proof-reasons.spec.ts`; no failing run is
  provoked to observe it live.
- Required when the comparison disagrees: repair the gap on the path from
  the workflow's published summary to the rendered tab, then observe again.
- Scope limits: no recurring or automated live reconciliation; no change to
  the workflow's entries, parts or retention; story-branch CI status and
  other projects' adoption are not compared; no new wording.
- Boundary assumptions: the dashboard stays a reader of the workflow's
  published evidence ([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md));
  the shown run at execution time may be newer than the one observed during
  refinement, and any retained run whose summary has not expired serves.

**Key examples:**

1. Open Dough trunk's latest completed run published
   `ci-proof-summary-attempt-1` → the developer opens Intent → CI status →
   Proof names the same run, attempt and short revision, and each row's
   counts and `n of n parts present` equal the artifact's. Observed during
   refinement on 2026-11-05 at 09:02 (+07): run
   [41951088108](https://github.com/terryyin/open-dough/actions/runs/41951088108),
   attempt 1, revision `b4ec1c8`, verdict Passed; artifact and tab both give
   `dashboard/tests` 2042 passed, 0 failed, 8 other, 12 of 12 parts;
   `tests` 196 passed checks, 3 of 3; `src/skills` 291 passed checks, 3 of 3.
2. A project's shown run published no summary → the tab keeps that run's
   verdict and shows "This run published no CI proof summary." under Proof,
   with no counts. Observed the same morning for doughnut (run 41948058190),
   terry-talks, lizard and clipboard, each Passed with that line.
3. The shown run's summary disagrees with the tab, or the tab shows an
   unavailable reason while the artifact is readable → the story repairs the
   reader or the workflow's publication, and example 1 is observed again.

**Architecture:** none new. ADR 0008 asks the dashboard to distinguish
missing evidence from an explicit negative result; example 2 is that rule's
live observation.

**Refinement notes (2026-11-05):** Investigation found both acceptance checks
already passing live, so the story's remaining value is the recorded
evidence; a repair is conditional. Alternatives considered: a maintainer
script that reconciles artifact and tab on demand (like a bank
reconciliation of ledger against statement) was rejected as recurring scope
the purpose does not need, since the tab's reader already checks the
artifact's identity fields; extending the fixture specs adds nothing the
existing specs do not prove.
