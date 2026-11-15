---
id: SEED-374
status: active
planted: 2026-11-15
planted_during: Project-local retrospective findings maintenance
trigger_when: selected from the product backlog
scope: story
---

# SEED-374 — See stale test duration estimates before relying on CI headroom

<a id="see-stale-test-duration-estimates"></a>

### See stale test duration estimates before relying on CI headroom

**Identity:** SEED-374#see-stale-test-duration-estimates
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/649-see-stale-test-duration-estimates/PLAN.md","assessment":"not-ready","reasons":["awaiting story review: Scope keeps the CI matrix unchanged; current run exceeds three-share capacity and retained trials do not establish a sufficient repair. Decide whether to permit four shares or continue broader optimization."],"basis":{"document":"89d5b3bb43b521479f931fe283d4fc0b4ec563749b863c91871a37dade9190ff","plan":"f12e58f9f826d0c62af7f3a01cd173bc8ef36e22217561cf54efb5e3fdc6e7df"}}
```

**Goal:** Contributors and agents changing the Distribution test inventory
can tell from the pre-push share preview whether its headroom rests on recorded
CI seconds or on a stale duration list, so a thin share is judged on evidence
and the list is refreshed before the push instead of after a failed CI run.

[DD-537](../../docs/maintainer/project-test-findings.md#dd-537) records the
failed share. The preview estimated 178.2 s of headroom while assuming 26
existing jobs at 1.5 s each; the refreshed list showed 26.6 to 28.1 s.

**Scope:**

- `node scripts/test-shares.mjs preview` separates unrecorded jobs into those
  the remote trunk already runs, whose CI seconds exist and the list lacks,
  and those this change adds, which no CI run has timed.
- Any unrecorded job trunk already runs makes the list stale. The preview says
  so first, with the count, marks the headroom of each share holding such a job
  as resting on assumed seconds, and gives the refresh step from
  [test shares](../../Distribution/tests/test-shares.md#preview-before-pushing).
- A job this change adds stays listed with its share and assumed seconds, named
  as an estimate; on its own it leaves the list current and the headroom
  stated as today.
- The preview's exit status, the deal, share allocation,
  `Distribution/tests/time-budget` and the CI matrix keep their behavior; they
  are inputs to the judgment.
- [Test shares](../../Distribution/tests/test-shares.md) describes the stale and
  estimate readings in place of its "high unrecorded count" sentence.
- Delivery leaves `Distribution/tests/longest-first` current through the
  existing refresh, so this repository's own preview reports no stale job.

Scope limits: the dashboard spec-file preview (`--spec-dir`), which has no
budget or headroom, is not a delivery commitment. Drift in recorded seconds of
jobs the list does name is not detected. No push hook or CI check runs the
preview.

**Key examples:**

- Stale list: the retained list and job set from before the DD-537 refresh,
  26 jobs trunk runs unrecorded → the preview opens by naming the list stale
  with 26 jobs lacking recorded seconds, marks the affected shares' headroom
  as resting on assumed seconds, and prints the refresh step.
- One new job: a current list and one job this change adds → no stale
  statement; each share's headroom as today; the job listed in its share as
  an estimate at the recorded median.
- Both: a stale list and one added job → the stale statement counts only the
  jobs trunk runs; the added job is still listed as an estimate.
- Every job recorded → the preview is as today, with no stale or estimate
  lines.
