---
id: SEED-239
status: active
planted: 2026-11-05
planted_during: Terry Yin's request to make CI status the Intent homepage with timing, backend caching and visible refresh progress
trigger_when: A developer opens Intent to review the current CI result and the cost of its tests
scope: story
---

# SEED-239: Show CI status and timing on the Intent homepage

<a id="show-ci-status-on-intent-home"></a>

### Show CI status and timing on the Intent homepage

**Identity:** SEED-239#show-ci-status-on-intent-home
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Who benefits.** A developer opening the dashboard's Intent perspective can
immediately review CI health and test execution cost, with useful cached
information while the latest result loads.

**Outcome and scope.**

- Make CI status the Intent homepage content. Replace the initial empty
  side-by-side Purpose and Proof panes, and remove the separate CI status tab
  from Intent's top-level mode strip. Existing Purpose/test-source browsing
  remains accessible from Intent.
- Retain the CI result and proof counts, and add two clearly named timing
  measures for the displayed run/attempt:
  - **CI wall time:** elapsed time from the CI run/attempt starting to its
    completion, covering the whole pipeline, including setup, checks and final
    reporting. Overlapping jobs count once in this elapsed interval.
  - **Total test execution time by kind:** the sum of individual test
    execution durations for each reported test kind across its shards or
    parallel workers. This is cumulative execution time, can exceed wall time,
    and is not the elapsed duration of a job or the whole CI pipeline. Extend
    the existing CI proof publication path where timing inputs are missing.
- Cache CI status and its associated proof/timing information in the backend
  so revisiting the homepage can display an available answer promptly without
  waiting for a fresh upstream read. Refresh against the latest CI information;
  caching must not leave a completed result permanently frozen while a newer
  run or attempt exists.
- Show a spinner while the latest information is loading, including while a
  cached answer is visible. Identify cached information and its freshness;
  replace it when the latest answer arrives and stop the loading indicator.
  With no cached answer, show the spinner from the initial load. If refresh
  fails, end loading and show the failure with any retained cached answer
  clearly distinguished from a newly verified result.
- Preserve the existing selected-project and selected-story CI targeting.
  Counts and timings must belong to the same repository, branch, revision and
  run/attempt as the displayed result; switching targets must not briefly show
  another target's cached result. Missing or incomplete timing evidence is
  labelled unavailable or partial, rather than shown as zero or a complete
  total. Keep both supported GitHub Actions and CI-adapter reading paths.

**Key examples.**

1. A developer opens Intent with no file or folder selected. CI status fills
   the homepage, replacing the empty Purpose/Proof panes, and there is no
   separate CI status mode tab to visit.
2. A CI attempt runs from 10:00 to 10:03. Its unit tests collectively execute
   for four minutes and its browser tests for two minutes across parallel
   workers. The homepage shows **CI wall time: 3 min**, **Unit test execution
   time: 4 min**, and **Browser test execution time: 2 min**, beside their
   existing proof counts. It does not add the parallel execution totals to
   calculate wall time.
3. A developer revisits Intent with a backend cache entry. The cached status,
   counts and timings appear promptly with a spinner while the latest result
   is being checked. A newer result replaces that answer and clears loading.
4. The first visit has no cache, or refresh cannot reach CI. The first visit
   shows a spinner until answered; a failed refresh ends with an explicit
   failure, preserving any prior answer with its cached freshness visible.
5. A developer changes project or selects a story with a different CI target
   during refresh. Only the new target's answer can populate the homepage.
   An older report without duration fields still shows its counts and explains
   the missing timings.

**Evaluation basis.** Compare the current separate-tab journey and cold CI
read with the homepage journey and a warm backend-cache read. Verify the two
timing measures against a known parallel CI attempt, including incomplete
reports. Observe initial loading, cached refresh, a newer attempt, refresh
failure and target switching. The intended gain is immediate access to useful
CI evidence and lower warm-read latency, while freshness remains visible.

**Architectural context.** [ADR 0008 — Project dashboard domain and
architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
keeps derived caches rebuildable from their sources and distinguishes missing
evidence from a negative result. The backend cache remains disposable derived
state. [ADR 0010 — Definition of
improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md) supplies
the comparison basis. Timing observations come from the existing CI evidence
producers and readers.
