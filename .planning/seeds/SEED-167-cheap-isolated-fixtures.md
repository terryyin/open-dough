---
id: SEED-167
---

# Cheaper isolated dashboard fixtures

<a id="cheap-isolated-fixtures"></a>

### Reduce fixture setup cost while preserving private test state

**Identity:** SEED-167#cheap-isolated-fixtures
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/370-cheap-isolated-fixtures/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9d3ce880248a95f7917b2047f83b9707a01be1890721345669ecd1ac36f59735","plan":"5eac2c99a82ccf35ff682a37d38a5da4e6ee44dff1fdc3d7dd4bddf528a04081"}}
```

**Goal:** Make the isolated dashboard fixtures cheaper without weakening coverage
or isolation, and measure the effect on CI time.

**Scope:** Target repeated preview-server bootstrap and Git/installed-skill
fixture preparation. Reuse only immutable preparation when measurements justify
it. Preserve every existing scenario, assertion, private HOME, writable Git
origin and worktree, HTTP server, browser context, fake-service state, and
strict verdict. Keep native touch and every-control observations unchanged.

**Examples:** Two concurrent tests can edit, publish, stop, and clean up their
own fixtures without changing another test's files, refs, server, state or
results. Prepared source reflects the current working tree on each run;
successive runs never consume a stale cache. Source skills are still installed
and exercised through the real entry points. Failures retain cleanup and
unexpected-error behavior.

**Evaluation:** Profile fixture substeps before selecting experiments. Compare
the same normal local test family before and after, with identical workers,
filters and relevant environment. Compare full hosted CI on named baseline and
candidate revisions, including case/verdict equality, fixture costs, queue,
job and suite time, and uncertainty. Retain only supported gains; report
inconclusive or rejected experiments honestly.

**Excluded:** Shared mutable origins, servers, HOME or fake-service state;
scenario/assertion removal; skips or retries; browser-clock changes; coarser
native input; deployment-policy tier changes; additional CI shards or workers;
product feature changes; and release work.
