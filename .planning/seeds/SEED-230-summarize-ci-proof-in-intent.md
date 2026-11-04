---
id: SEED-230
status: active
planted: 2026-11-04
planted_during: Terry Yin's request to show client CI proof summaries in Intent
trigger_when: A developer opens Intent's CI status tab for a project that publishes proof artifacts
scope: story
---

# SEED-230: Summarize CI proof in Intent

<a id="summarize-ci-proof-in-intent"></a>

### Summarize CI proof in Intent

**Identity:** SEED-230#summarize-ci-proof-in-intent

**Outcome:** A developer opening Intent's **CI status** tab can see which
configured proof entries ran and their test outcome counts for the CI run
shown there, without opening CI logs. Show the tested revision and a link to
the run, including when the tab shows a result from an ancestor. Keep the CI
verdict and proof availability separate. This adds CI observations alongside
the [existing deliberate Proof workflow](SEED-192-review-product-intent.md#human-owned-framing-and-constraints).

**Recommended first cut:** Pilot on GitHub Actions with one real project and
at least two proof entries, one split across parallel jobs. Open Dough's
[current workflow](../../.github/workflows/ci.yml) already uploads separate
timing and Playwright artifacts for matrix shards. Reuse runner reports where
they provide the needed outcomes. Each producer writes isolated output by
proof entry and job or shard; workers within a job use the runner's merge
facility or write separate fragments. After the proof jobs settle, a collector
validates the fragments against the expected entries and shards, then uploads
one versioned, compact summary artifact for that run attempt. Keep job failure
semantics intact and publish available evidence after test failures. The
dashboard downloads the summary for the same repository, workflow run,
attempt, and tested revision as the displayed evidence. A rerun of only some
jobs can initially show partial proof; do not silently reuse older attempts.

**Adoption:** Ship one standalone recipe with Open Dough's installed guidance.
Show how to map a project's test commands to proof entries, upload a single
job's output or uniquely named parallel fragments, declare the expected parts,
and publish the summary even after ordinary test failures. Include artifact
retention and the dashboard's read access requirements. The project opts in by
editing its own CI. Per-test detail in the dashboard and other CI providers
are outside the first cut.

**Examples:**

- Two jobs for the same proof entry report 12 passes and 7 passes plus 1
  failure. Another proof entry reports 5 passes. The CI tab shows 19 passes
  and 1 failure for the first entry, 5 passes for the second, and the CI
  verdict. The separate jobs' output does not overwrite or double-count tests.
- A cancelled shard or partial rerun leaves an expected part missing, or
  duplicate fragments make its count ambiguous. The summary shows the gap
  and does not imply the full entry ran or pull totals from an older attempt.
- A project has no summary, the artifact has expired, or it cannot be read
  or validated. The tab still shows the CI verdict and explains why proof is
  unavailable.

**Constraints:** [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
keeps the dashboard an observer and distinguishes missing evidence from a
negative result. [ADR 0004 — Client installation and update](../../docs/adrs/0004-client-installation-and-update-accepted.md)
keeps the installed recipe standalone. Write it for the agent working in the
adopting project, as required by [ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
