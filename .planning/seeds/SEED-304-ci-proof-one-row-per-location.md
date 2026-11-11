---
id: SEED-304
status: active
planted: 2026-11-11
scope: story
---

# SEED-304 — One CI proof row per location

<a id="show-one-ci-proof-row-per-location"></a>

### Show one CI proof row per location

**Identity:** SEED-304#show-one-ci-proof-row-per-location
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/582-show-one-ci-proof-row-per-location/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"87262a00c4a28949c6808c53a5296f3c904d529feb11480b1ba2c242881d1c88","plan":"13de68d32fe8f11f54239a10437aaa8946a892e4ffea7a4fc7d807621440be93"}}
```

#### Goal

A developer reading Intent's CI status can see the full result for a test
location without scanning repeated paths. Show each location once in the Proof
table, with each result type's own labeled counts and execution time in that row.

#### Scope

In the CI status tab's Proof table, show one row for each declared location.
Within that row, label each reported result type: test cases, test files, or
legacy test results. Keep each type's passing, failing, and other results,
measured execution time, and genuine reporting or timing gaps attributable to
that type. Show its totals across shards. Do not add different result types
together: a failed file before any cases run must remain visible even beside
passing cases. This separation prevents misleading counts and execution times.

Use the existing published CI proof summary. A present report containing zero
results needs no execution time and does not introduce a timing gap for another
type. Distinguish an explicitly reported zero from missing or ambiguous evidence.
Keep whole location rows together when sorting the table, and preserve readable
single-type and legacy summaries. A dashboard deployment delivers the change for
already published summaries, without rerunning the observed project's CI.

This increment does not redesign folder Summaries, file Proof, story comparison
tables, collectors, or the summary format. CI wall time history compatibility is
the separate SEED-305 story.

#### Key examples

- Doughnut's two Vitest shards appear as one `frontend/tests` row with 2,542
  passing test cases and zero file-level failures. The case execution time is
  the sum across both shards. If a file fails before any cases run, its failure
  is visible in that same row, labeled as a test file result.
- Doughnut's `scripts` row shows 450 passing Node test cases and 22 passing Bash
  test files, with separately labeled execution times (about 1 min 39 s for
  cases and 34.2 s for files in the observed summary). Its thirteen empty Node
  file reports do not make the Bash file time partial.
- A location reports timed cases and a missing file-results shard. It still has
  one row: the case time remains measured, and the missing-part explanation
  names test files. Sorting moves this whole row without mixing its figures
  with another location's or summing different types.
- After the new dashboard is deployed, opening the same already published run
  shows these combined rows. A single-type or older legacy summary remains
  readable with its own labels and timing information.

#### UI

Keep the Entry, Counts, and Test execution time columns. Write the path once;
align labeled result-type lines inside its counts and time cells, so a reader
can associate each count, duration, or gap without following a repeated path.
Keep those labels and gap explanations available to assistive technology.

Observed in [Doughnut CI run 42828209530](https://github.com/nerds-odd-e/doughnut/actions/runs/42828209530).
