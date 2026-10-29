---
id: SEED-171
---

# Cheaper production-watcher policy coverage

<a id="production-policy-ci-time"></a>

### Reduce repeated full-app policy builds without losing protection

**Identity:** SEED-171#production-policy-ci-time
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal:** Reduce repeated full-app builds in the production-watcher policy tests
without weakening coverage, and measure the effect on CI time.

**Scope:** Consolidate overlapping range, exclusion and published-policy rule
coverage at the existing real-Git qualification boundary. Preserve the actual
watcher's unique orchestration observations: skipped changes perform no install,
build or restart; selected published policy wins over local edits; accumulated
changes select the latest commit; unsupported policy and failed builds retain the
served baseline; only successful activation advances it. Keep real npm/Vite
deployment, pinned serving, replacement, recovery, shared records, configuration
and process/check-out cleanup proof. Every removed assertion needs an inspected
equivalent surviving or replacement observation before its predecessor narrows.

**Examples:** Excluded-only and mixed/accumulated ranges are decided from real
published Git trees. A candidate's changed policy is used despite a different
uncommitted local workflow. An unsupported policy or failed build cannot hide an
application change under a later documentation-only commit. After successful
activation, a later excluded-only commit is skipped without deployment work.

**Evaluation:** Map original observations to surviving proof. Compare the same
normal local family before and after with identical filters, default workers
and relevant environment, including replacement tests' cost. Compare fresh full
hosted CI on named baseline and candidate revisions; account for unchanged case
verdicts and intentional test moves, unchanged platform skips/retries, real-build
counts, fixture costs, queue, job and suite time, and runner variance. Retain only
supported improvements; report inconclusive measurements honestly.

**Excluded:** Production behavior changes, fake internal outcomes, shared mutable
fixtures, weakened assertions, skips/retries, second-server or clock changes,
additional workers/shards, unrelated fixture optimization, releases and guidance
changes. Shard-weight refresh is outside this selected priority.
