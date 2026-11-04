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
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/463-summarize-ci-proof-in-intent/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"bb2a2a8f69ae24c4730829e04e45d9c0871ec276fa763507f876e7323ad3b5de","plan":"108b58d58d01b907c380d97a450aabce1c5d8045ef2c0dca84706c662ffb5992"}}
```

**Goal:** A developer reviewing a project in Intent's **CI status** tab can
see, for the CI run whose result the tab shows, which of the project's
configured Intent entries that run proved and with what outcome counts,
without opening CI logs or downloading artifacts. A failed run then points to
the entry that failed, and a passing run shows what it actually covered. This
adds CI observations beside the
[existing deliberate Proof workflow](SEED-192-review-product-intent.md#human-owned-framing-and-constraints);
it does not change retained Proof or the CI verdict.

**Scope:**

- *Proof entries* are the project's configured Intent locations
  (`.planning/open-dough.json` `intent.locations`), named by their `path`.
  A project's CI declares which of those entries it proves and how many parts
  (single job, or one part per matrix job or shard) each expects.
- Each CI producer writes one fragment per entry and part, from runner
  reports where they give the outcomes. A job that runs several entries,
  such as Open Dough's `npm test` share, which runs both `tests` and
  `src/skills` checks, writes a fragment for each. Parallel workers inside a
  job are merged by the runner or written as separate fragments. Producers
  keep their job's failure semantics and still publish after test failures.
- After the proof jobs settle, including after failures, one collector
  checks the fragments of the current run attempt against the declared entries
  and parts. It then uploads one versioned, compact summary artifact naming the
  repository, workflow run, attempt and tested revision. For each entry it
  names the runner's counted unit, such as Playwright tests or `npm test`
  checks, the passed, failed and other counts, and parts that are missing or
  ambiguous.
- The tab shows that summary for the same repository, workflow run, attempt
  and tested revision as its displayed result. For a running result, it shows
  the summary for the completed ancestor's run that the tab already shows.
  It names the tested revision, the run with its link and the attempt. A
  missing or ambiguous part is shown as a gap; it is not counted as passed and
  is not filled from another attempt.
- The verdict and proof stay independent: the verdict appears and reads the
  same whether proof is available, missing or still being read, and proof
  counts never restate or override it.
- When no proof can be shown, the tab gives one reason: no summary in the
  run, expired, unreadable, invalid or for another run, attempt or revision.
  The same applies when the project's CI is read through a `ciAdapter`
  rather than GitHub Actions, or when no completed run is shown.
- Pilot on Open Dough itself: `dashboard/tests` across 12 Playwright shards,
  plus `tests` and `src/skills` across the 3 `npm test` shares.
- Ship one standalone recipe with Open Dough's installed guidance. It must
  show how to map a project's test commands to entries, write single-job or
  uniquely named parallel fragments, declare the expected parts, run the
  collector after failures, choose artifact retention, and grant the
  dashboard's read access (the developer's `gh` with Actions read on the
  repository). The project adopts it by editing its own CI.
- Document the added GitHub requests in
  [GITHUB-REQUESTS.md](../../dashboard/GITHUB-REQUESTS.md). Summaries are
  immutable per attempt, so the dashboard process may remember a read
  summary by run and attempt.

**Required restrictions:** The summary is used only when its repository, run,
attempt and tested revision match the displayed result. Otherwise another
run's counts would appear as this run's proof
([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
distinguish missing, outdated and conflicting evidence from a negative result).
Fragments from an earlier attempt are not counted toward a later one, for the
same reason.

**Considered and deferred:** Per-test names and failure detail in the
dashboard, CI providers other than GitHub Actions, proof in the Intent
location or folder views, and comparing CI counts with retained Proof are
outside this story. The rejected approaches were: having the dashboard
aggregate the raw per-job artifacts (27 artifacts of up to 0.7 MB each per
Open Dough run, and no independent list of expected parts); publishing through
check runs or third-party test-report actions (needs `checks: write`, and the
summary would have to be parsed back out of rendered text); and committing CI
results to the repository (conflicts with deliberate Proof).

**Key examples**

- Two `dashboard/tests` shards report 12 passes, and 7 passes plus 1
  failure. `tests` reports 5 passing checks in one share. The run failed. The
  tab shows **Failed** at the run's revision as today, and below it Proof
  for that run: `dashboard/tests` with 19 passed and 1 failed tests, and
  `tests` with 5 passed checks, each with every declared part present. No
  part overwrites or double-counts another.
- Shard 4 is cancelled, or only failed jobs are rerun as attempt 2. The
  attempt-2 summary shows `dashboard/tests` with its present parts' counts
  and "part 4 of 12 missing", and does not total it as a full run or use
  attempt 1's fragment. Two fragments for the same part make that part
  ambiguous, and its counts are not used.
- A story branch is running. The tab shows its completed ancestor's
  passing trunk run, and Proof names that ancestor's revision and run, not
  the running commit.
- The project has no collector, the summary has expired, GitHub refuses the
  read, or the summary names another attempt or revision. The tab still shows
  the verdict exactly as before, and under Proof one line explains why proof is
  unavailable for this run.

**UI:** Proof follows the existing judgment as its own labelled part of the
tab. It names the run (revision, link and attempt) once, then gives one row
per declared entry in configuration order. Each row shows the location path,
counts with their unit and any gap, and needs no colour to be understood.
While the summary is being read, the verdict is already shown and Proof says it
is checking. **Check again** refreshes both.

**Architecture:** The CI-side responsibility is new: the project's producers
and collector are written from the installed recipe into the project's own
workflow, standalone under
[ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md)
and written for the agent working in that project under
[ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
The dashboard stays an observer under ADR 0008. It reads the summary through
the authenticated read boundary. The GitHub Actions judgment must therefore
carry the shown run's id, attempt and head SHA, which today carries only its
URL. Proof is a separate read keyed by that run, so a slow or failed artifact
read never delays or alters the verdict. GitHub delivers artifacts as zip
archives, so the server must extract one small file.

**Facts and hypotheses for planning (observed 2026-11-04):** Through the
developer's `gh`, `actions/runs/<id>/artifacts` listed Open Dough run
41776408979's 27 artifacts. Each artifact names its run id and head SHA but
not its attempt, so the summary itself must carry the attempt.
`actions/artifacts/<id>/zip` downloaded a zip archive. The current
`test-times-*` artifacts give seconds per check, not outcomes, and the CI
Playwright reporters are quiet plus HTML, so both producers need an outcome
output. Planning must still observe two hypotheses: what upload and download
of a same-named artifact do on a partial rerun, and whether the summary can be
read once a run's other artifacts are cleaned up.

<a id="guard-ci-proof-revision-and-trim-proof-specs"></a>

### Guard the CI proof revision and trim the proof specs

**Identity:** SEED-230#guard-ci-proof-revision-and-trim-proof-specs
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/464-guard-ci-proof-revision-and-trim-proof-specs/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"130e128c78832d65c40c8b26e8be4a88ef9646152a5c94970964dea4c3aa383f","plan":"cf40510a08bec40369943de480e829525ab4ceaf4d3a5e4c5f5e6d94418c48db"}}
```

**Goal:** A maintainer changing Open Dough's CI or the CI status tab keeps the
[CI proof summary](#summarize-ci-proof-in-intent) matched to the run Intent
judges, with a regression test for the pull-request revision, proof specs
that each document one behaviour, and one read of the project's CI
configuration per CI status judgment. This is a retrospective correction of
that story; it adds no product promise.

**Scope:** Open Dough's `ci.yml` revision expression and its declaration test;
the Intent CI proof specs and the `intent=ci-proof` query refusals; how the CI
status read learns that a project uses a `ciAdapter`. Visible tab behaviour
and the summary contract stay as they are.

**Plan:** [Guard the CI proof revision and trim the proof specs](../slice-plans/464-guard-ci-proof-revision-and-trim-proof-specs/PLAN.md)
