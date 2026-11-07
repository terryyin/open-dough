---
id: SEED-254
status: active
planted: 2026-11-07
scope: story
---

# CI proof for skipped builds

Intent's **CI timing comparison** names a Baseline, Branch and Landed build for
a selected story ([Intent design](../../docs/dashboard-development-intent.md)).
In this repository many of those revisions never build. On GitHub, a push
whose changes the workflow's `paths-ignore` excludes creates no run and no
check runs, so a skip appears only as an absent run. A superseded run is a
real run whose conclusion is `cancelled`.
[CI workflow](../../.github/workflows/ci.yml),
[skipped workflow runs](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/skip-workflow-runs).

Observed on 2026-11-07 against `origin/main`:

- Recent `.planning/`-only trunk commits (`cb4ed7eda`, `4d2adeff6`,
  `07f54554c`) have no workflow run and zero check runs.
- Of the 60 latest first-parent trunk merges, 1 was ignored-only with no
  run, 9 had a cancelled push run, 1 changed code but had no run (it was
  not the head of its push, `199a61b8d`), 5 failed and the rest passed.

## Stories

<a id="use-ancestor-ci-proof-for-skipped-builds"></a>

### Use the nearest ancestor's CI proof for skipped builds

**Identity:** SEED-254#use-ancestor-ci-proof-for-skipped-builds
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/494-use-ancestor-ci-proof-for-skipped-builds/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e7fed7584a3e25125cefb389efaef8d90fe03d0896f5de03429923449b0e2f5c","plan":"bd661460c7715f71fd377ee45d9b56af97ef0ea6df3d16c1dd9856c110a5e4f7"}}
```

**Beneficiary:** A developer reviewing a story's CI proof in Intent.

**Goal:** When CI skipped the build of a story's Baseline, Branch or Landed
revision, the comparison can still use proof from an earlier build in that
revision's own history. The reviewer sees that the requested revision was
skipped and which build the proof came from.

**Scope:**

- **Status at the requested revision.** Each comparison endpoint shows its
  requested revision's own status separately from the build whose proof it
  uses: its own build, **Cancelled**, **Skipped**, or **No build** with an
  unknown reason.
  - **Skipped** means a confirmed skip: the provider reports `skipped`, or
    every change from the nearest ancestor with a build to the requested
    revision is excluded by the workflow's path rule at that revision.
  - A missing run alone is not a skip. A delete or rename of a path CI does
    not ignore, a mixed or unreadable diff, an unreadable workflow policy, or
    no ancestor build within the readable history leaves the reason unknown.
    The endpoint says which of these prevented confirmation.
- **Baseline and Branch.** The walk on the endpoint's existing first-parent
  lineage and within its existing bounds uses the nearest build with usable
  proof. It continues past skipped revisions, revisions without a build, and
  builds whose proof is absent, expired, unreadable, invalid or mismatched.
  The label names the source revision, run and attempt and counts the
  revisions passed over. A revision that already falls back to an ancestor
  today, whether cancelled or unexplained, keeps that fallback and now also
  shows its own status.
- **Landed.** A confirmed-skipped landing uses the proof of its equivalent
  build only: the nearest ancestor build from which every change to the
  landing is CI-ignored. If that build has no usable proof, Landed shows
  **Skipped** and why that build's proof is unavailable, and walks no
  further. A cancelled or unexplained landing keeps today's exact-only result
  and explanation, so Landed never shows proof from before the story's code.
- Proof at the requested revision itself stays authoritative whenever it
  exists.
- This story covers GitHub Actions comparisons. Adapter projects use
  [Intent's shared story comparison](../../docs/dashboard-development-intent.md)
  and its endpoint rules. The live CI status judgment of a
  Taken story's branch head, including its running-ancestor proof, is
  unchanged.
- Keep [GitHub requests](../../dashboard/GITHUB-REQUESTS.md) accurate for the
  comparison's per-revision run and proof reads, including the extra proof
  reads this walk adds.

**Deferred promises:**

- Proof for a cancelled landing from a later trunk build:
  [its own story](#use-later-ci-proof-for-cancelled-landings).
- Telling skipped intermediate revisions apart from unexplained ones inside
  the "revisions passed over" count.

**Examples:**

- *Docs-only landing.* A story's landing merge changes only `.planning/`
  files relative to its first parent, which has a passing build with proof.
  Landed shows **Skipped** at the merge and uses the parent's proof, labelled
  with the parent's revision, run and attempt.
- *Landing equivalent build without proof.* The same landing, but the
  parent's build failed before it published proof. Landed shows **Skipped**
  and that the parent's build at `<rev>` published no CI proof summary. It
  does not use an older build.
- *Skipped baseline.* The story starts at a `.planning/`-only "Announce
  preparation" commit. Its parent has a completed build with no proof
  artifact, and the grandparent has readable proof. Baseline shows
  **Skipped** at the start commit and uses the grandparent's proof, counting
  two revisions passed over. A skipped final branch revision follows the same
  rule on the story branch.
- *Cancelled.* A landing merge's push run was cancelled when a later push
  superseded it. Landed shows **Cancelled** with today's explanation and no
  proof. A Baseline revision with a cancelled run shows **Cancelled** there
  and uses its nearest ancestor's proof as above.
- *Unexplained absence.* A landing merge changes `dashboard/` files but has
  no run because a later commit headed the same push. Landed shows **No
  build**, explains that CI's path rule does not account for the absence, and
  uses no ancestor proof.

**Architecture:** Confirming a skip reuses the execution workflow's
conservative path classifier
([`ci-path-applicability.mjs`](../../src/skills/dough-execute-plan/scripts/ci-path-applicability.mjs)),
which the dashboard server can call as it already calls the execution
scripts' GitHub Actions reader. It reads the workflow at the requested
revision from the local repository and diffs it against the nearest ancestor
build. An equivalent build is only as equivalent as the project's declaration
that CI-ignored paths cannot change test results. That is the same judgment
CI made when it did not run. Showing the requested revision's status beside
the observed proof source follows
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
The before-and-after presentation of these labels belongs to
[SEED-255](SEED-255-compare-before-and-after-ci-proof.md#compare-before-and-after-ci-proof).

<a id="use-later-ci-proof-for-cancelled-landings"></a>

### Use a later trunk build's CI proof for cancelled landings

**Identity:** SEED-254#use-later-ci-proof-for-cancelled-landings
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer reviewing a done story's Landed CI proof in
Intent.

**Goal:** When a newer trunk push cancelled the landing's own run, Landed
can show proof from the nearest later trunk build that contains the landing.
The landing still shows as **Cancelled**, and the reviewer can see the later
build and that it includes changes after the landing.

**Scope:** To be refined. Starting points: the descendant build must contain
the landing, the changes between them stay visible, and the rule must keep a
cancellation distinguishable from a skip. 9 of the 60 latest trunk landing
merges were cancelled (see above).
