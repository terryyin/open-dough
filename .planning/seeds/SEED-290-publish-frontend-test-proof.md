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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/567-publish-frontend-test-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c8bd412db165e8af12ad3454d896814eecb51020447a38d481a88c7b21433d54","plan":"898d1852e29753682b6ee80ac97c0708a2ba29ad4a636e066e9e516fbc20b9a7"}}
```

**Goal.** Developers reviewing dashboard frontend tests can download a dedicated
proof report from the GitHub Actions run and inspect the frontend results
without extracting them from the combined CI proof summary. This makes the
observed frontend outcomes and their execution cost directly reviewable.

**Scope.**

- Publish one downloadable frontend test proof artifact for each run attempt
  whose existing CI proof collection job runs, alongside the combined summary.
  The report covers `dashboard/frontend-tests` and identifies the repository,
  checked revision, GitHub run ID and attempt.
- Show observed test-case outcomes and recorded execution durations by test
  file, with frontend totals and evidence gaps. Keep passed, failed and other
  results distinct. Explain that other results include skipped or unfinished
  selections; the existing evidence does not distinguish them further.
- Make missing or ambiguous shard evidence explicit. A present shard with no
  frontend tests is a reported zero; a missing shard is unknown. Partial
  results do not establish an overall executed pass. Keep measured zero time
  distinct from unavailable timing, and identify durations as summed recorded
  test execution time, rather than elapsed job time.
- Derive the report from the attempt's existing
  [dashboard proof records](../../dashboard/tests/proof-record.md), through the
  existing CI proof fragments and combined summary. Add no test run. Preserve
  the combined summary and existing test verdicts. Matching revision and
  attempt are correctness requirements: another attempt's results cannot prove
  this attempt.

**Scope limits.** No dashboard UI, new test collection, individual test
diagnostics, new outcome taxonomy, timing benchmark or threshold, or reports
for other test locations. No new cancellation/recovery guarantee: a cancelled
workflow can prevent the existing collector from running. An incomplete shard
record can remain missing under the existing collector's rules; recovering its
partial attempts is separate work.

**Key examples.**

1. All dashboard shards report for revision R, run 7 attempt 2. Two frontend
   files contain three passing cases with recorded durations of 20 ms and
   30 ms. When collection finishes, the run offers a dedicated report naming
   R/7/2, both files' outcomes and times, and the 50 ms frontend total. Browser
   journey and backend files remain in the combined summary and do not become
   frontend rows. No additional tests execute to make the report.
2. A completed shard record contains a failed frontend case taking 30 ms and
   an unfinished selected case with no duration. The report shows one failed
   and one other case, with unreported timing for the unfinished selection.
   It does not present the frontend suite as passed or replace its failed
   verdict merely because report generation succeeded.
3. Shard 1 reports observed frontend results, shard 2 completes with no frontend
   selections, and shard 3 supplies no usable completed record. The report
   keeps shard 1's observations, distinguishes shard 2's zero from shard 3's
   missing evidence, and labels the results incomplete. It does not invent
   file names or durations for the missing shard. Conflicting evidence remains
   ambiguous rather than being counted twice.
4. A passing file records 0 ms while another file has no duration. The report
   preserves the measured zero and marks the other timing unavailable. A later
   attempt receives its own artifact and identity; it does not borrow the
   earlier attempt's results to fill gaps.
