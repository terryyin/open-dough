---
id: SEED-290
status: active
planted: 2026-11-10
scope: story
---

# SEED-290: Publish frontend test proof in CI

<a id="publish-frontend-test-proof"></a>

### Publish frontend test proof in CI

**Identity:** SEED-290#publish-frontend-test-proof

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** Developers reviewing dashboard frontend tests can download a dedicated
proof report from the GitHub Actions run and inspect the frontend results
without extracting them from the combined CI proof summary.

**Evaluation.** After the dashboard shards finish, the CI run publishes a
frontend test proof artifact alongside its combined CI proof summary. The
report identifies the checked revision and run attempt and contains outcomes
and recorded durations by test file for `dashboard/frontend-tests`. If a test
fails or a shard does not provide evidence, the report distinguishes the
observed failure from missing or unfinished results.

**Boundary.** Use the existing [dashboard proof records](../../dashboard/tests/proof-record.md)
from that attempt. Publishing the report requires no additional test run.
