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

**Outcome:** An Open Dough developer can open **Intent → CI status** in the
live dashboard and see the proof summary from the GitHub Actions run shown
there. Verify the published artifact and the rendered tab together. Repair
any gap on that path that prevents the check from passing.

**Starting point:** [The judged workflow](../../.github/workflows/ci.yml)
already collects proof across the dashboard Playwright shards and the
shell and Node check shares. GitHub Actions run
[41948039142](https://github.com/terryyin/open-dough/actions/runs/41948039142)
published a summary. Use a retained run with its artifact still available.

**Acceptance:** Compare the dashboard with the downloaded artifact for the
same repository, run, attempt, and tested revision. Confirm that the rows for
`dashboard/tests`, `tests`, and `src/skills` agree with the artifact's
counts and coverage. Record the run link and the observed dashboard result.
Also verify that the tab distinguishes an unavailable summary from a failed
CI verdict when the shown run lacks proof.

Follow [ADR 0008, Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
Use the dashboard as a reader of the workflow's published evidence.
