# Verify Open Dough CI proof in the live dashboard

**Identity:** SEED-234#verify-live-dashboard-ci-proof
**Source:** [selected story](../../seeds/SEED-234-verify-live-dashboard-ci-proof.md#verify-live-dashboard-ci-proof)
in SEED-234, refined 2026-11-05 with explore, borrow, challenge, clarify,
investigate and architecture.
**Source review:** [source-review.md](source-review.md)
**Prepared:** 2026-11-05. Planning only, in the story's established workspace
(branch `claude/verify-open-dough-ci-proof-in-the-live-dashboard`, agent
juacompe-chan), continuing the refinement in the same session.

## Goal and boundaries

An Open Dough developer opening Intent → CI status for Open Dough in the live
dashboard sees the shown trunk run's own published proof summary, and a run
without one keeps its verdict with one reason line. The story's three key
examples are the acceptance.

Included: one live observation of the tab and of the shown run's
`ci-proof-summary-attempt-<n>` artifact, compared field by field; one live
observation of a project whose shown run published no summary; a repair of
the publish-to-render path only if the comparison disagrees. Excluded, as the
story records: automated or recurring reconciliation, workflow changes,
story-branch comparison, other projects' adoption, new wording, provoking a
failing run.

Apply this repository's
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
throughout. Local gate: none for the observation-only outcome. If slice 1
turns into a repair, run the touched specs through the focused runner and,
before landing a dashboard change, `npm run test:dashboard` with Bash 5 first
on PATH under `caffeinate -s -i` on AC power
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)).

## Direction and PFE

- **Reuse the shipped reader.** `dashboard/src/IntentCiProof.tsx` and
  `authenticatedIntentCiProofRead.ts` already read the artifact with the
  developer's `gh` and refuse a summary for another run, attempt or revision
  (`ciProofWording.ts` `mismatched`). The observation uses them as deployed;
  nothing new is built.
- **Observe through the read access check the guidance names.**
  `src/skills/dough-test-optimization/references/ci-proof-summary.md` step 6
  gives the `gh api` listing and archive download; the comparison downloads
  the artifact that way.

## Decisive premises

| Premise | Consuming operation | Observation (form, profile, time) | Result |
| --- | --- | --- | --- |
| The shown trunk run has a readable summary artifact | slice 1 artifact download | `gh api repos/terryyin/open-dough/actions/runs/41951088108/artifacts?per_page=100`, then `.../actions/artifacts/<id>/zip`, 2026-11-05 09:02 (+07) | `ci-proof-summary-attempt-1` unexpired (expires 2026-12-05); archive holds `ci-proof-summary.json` for `terryyin/open-dough`, run 41951088108, attempt 1, revision `b4ec1c8a46…` |
| The live dashboard renders that run's Proof | slice 1 tab reading | headless Playwright Chromium (from the integration checkout's `@playwright/test`) against `http://127.0.0.1:4173`, deployment `b4ec1c8a469f`, project `open-dough`, Intent → CI status, same time | Passed at `b4ec1c8`, run 41951088108; Proof rows equal the artifact (see seed example 1) |
| A live shown run without a summary keeps its verdict | slice 1 second observation | same script, projects doughnut, terry-talks, lizard, clipboard | each Passed, Proof gives "This run published no CI proof summary.", no counts |

No unverified remainder: the observation route is the slice's own route. A
newer shown run at execution time is an expected change, not a reopened
premise; the slice observes whichever run is shown.

## Slices

### 1. Live CI proof agrees with the published summary
Type: Behavior
Status: done
Proof: the recorded comparison below, with the run link; repair specs only if
a gap is found.

Behavior: the deployed dashboard shows Open Dough trunk's latest completed
run → a developer opens Intent → CI status → Proof's run, attempt, revision,
per-row counts and present parts equal the downloaded
`ci-proof-summary.json`; a project whose shown run has no summary shows its
verdict and the one reason line.

Steps: read the tab headlessly (scratch script outside the repository,
importing `chromium` from the integration checkout's `@playwright/test`);
download the shown run's summary through `gh api`; compare; observe one
no-summary project; record the run link, both observations and the verdict
under Accepted proof here. On disagreement, stop the observation, diagnose
the reader or the workflow publication, repair with a failing spec first,
land, let the dashboard redeploy, and observe again.

## Accepted proof

Slice 1, observed 2026-11-05 09:11 (+07) from the execution workspace after
`setup-native.mjs npm`, `browser` and `check` passed (Chromium 153). Trunk
`origin/main` was `ce0c426`; its newest completed CI run was still
[41951088108](https://github.com/terryyin/open-dough/actions/runs/41951088108)
(the later commits are records-only and started no CI run).

- **Artifact:** `gh api repos/terryyin/open-dough/actions/runs/41951088108/artifacts?per_page=100`
  listed `ci-proof-summary-attempt-1` (id 13381461023, unexpired, expires
  2026-12-05); `gh api .../actions/artifacts/13381461023/zip` held
  `ci-proof-summary.json`: repository `terryyin/open-dough`, run 41951088108,
  attempt 1, revision `b4ec1c8a469f…`; `dashboard/tests` 2042 passed, 0
  failed, 8 other, parts 1–12 present; `tests` 196/0/0 checks, parts 1–3
  present; `src/skills` 291/0/0 checks, parts 1–3 present.
- **Tab:** headless Playwright Chromium (scratch script, deleted after the
  run) against `http://127.0.0.1:4173`, project `open-dough`, Intent → CI
  status: state "Passed at b4ec1c8 (Complete SEED-192#recover-intent-locations-read)";
  Proof "Attempt 1 of run 41951088108 at b4ec1c8."; rows
  "dashboard/tests: 2042 passed and 8 other tests; 12 of 12 parts present.",
  "tests: 196 passed checks; 3 of 3 parts present.",
  "src/skills: 291 passed checks; 3 of 3 parts present."; run link
  `https://github.com/terryyin/open-dough/actions/runs/41951088108`.
  The tab names no failed count because every row's failed count is 0.
- **No-summary project:** same script, project `doughnut`: state "Passed at
  61c0a9a (Update Open Dough guidance to 0.3.84)"; Proof "Attempt 1 of run
  41948058190 at 61c0a9a." and "This run published no CI proof summary.",
  no counts. `gh api repos/nerds-odd-e/doughnut/actions/runs/41948058190/artifacts`
  lists only `frontend-dist`, `donut-0.0.1-SNAPSHOT.jar`, `cli-dist`.
- **Verdict:** agree. Repository, run, attempt, revision and every row's
  passed, failed, other and present parts match; the no-summary run keeps its
  verdict with the one reason line. Example 3's repair is not triggered; no
  product change.

## Current decisions

- The refinement-time observation (seed examples 1 and 2) already met the
  acceptance; execution repeats it on the then-shown run so the accepted proof
  is current at completion.

## Concern evidence

Slice-plan refinement not needed: one observation slice with a conditional
repair, no fragmentation or second outcome. This review identified no
remaining slice-specific concern.
