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
- GitHub Actions comparisons only. Adapter projects get story comparison in
  [SEED-257](SEED-257-compare-story-ci-through-adapters.md#compare-story-ci-through-adapters),
  which applies these endpoint rules there. The live CI status judgment of a
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
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-254#use-later-ci-proof-for-cancelled-landings","dependencies":[{"supplier":{"identity":"SEED-254#use-ancestor-ci-proof-for-skipped-builds","href":"seeds/SEED-254-use-ancestor-ci-proof-for-skipped-builds.md#use-ancestor-ci-proof-for-skipped-builds"},"implementation":"Landed's later-build proof extends the per-endpoint requested-revision status (Cancelled shown apart from the proof source) and the proof-usability walk that the supplier introduces in the comparison lookup.","rationale":"Both stories change the same endpoint selection rule in intentCiComparisonResolve.ts and baseCiRevisionLookup.ts. Building the Cancelled status and the usable-proof walk here first would duplicate the supplier's design and force a conflicting reconciliation of one domain rule; the supplier is already Taken and planned.","condition":"The supplier's comparison on trunk shows each endpoint's requested-revision status, including Cancelled at Landed, apart from its proof source, and its Baseline walk passes over builds without usable proof.","state":"waiting"}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/496-use-later-ci-proof-for-cancelled-landings/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"6839f116be6dee719287b81a6c9153b9cef0fed7511eef7e0a2737ffe34429fe","plan":"fbaf8720daa1227a8fdd8c021e7b98708c237cd74d882e18b43dbc9454c0863f"}}
```

**Beneficiary:** A developer reviewing a done story's Landed CI proof in
Intent.

**Goal:** When a newer trunk push cancelled the landing's own run, Landed
can show proof from the nearest later trunk build that contains the landing.
The landing still shows as **Cancelled**, and the reviewer can see the later
build and that it includes changes after the landing.

**Scope:**

- **Which landings.** A Story Branch Mode landing (the landing merge, or the
  story tip for a fast-forward) whose own push run was cancelled and that has
  no usable proof of its own. Proof at the landing itself, including a rerun
  attempt, stays authoritative.
- **Which later build.** Walking forward on the trunk's first-parent history
  from the landing, Landed uses the nearest later build with usable proof.
  Every revision on that walk contains the landing. The walk passes over
  cancelled builds, revisions without a build, and builds whose proof is
  absent, expired, unreadable, invalid or mismatched, under the same proof
  usability rule as the Baseline walk. It stops at a running build, at the
  trunk head the dashboard has read, and after 30 revisions.
- **What the reviewer sees.** Landed keeps **Cancelled** at the landing and
  names the later build as the proof source: its revision, run, attempt and
  conclusion, and how many later trunk revisions it includes beyond the
  landing. The label says the build is later than the landing, so it never
  reads as a skip's equivalent build.
- **No later proof.** When the walk finds no usable proof, Landed keeps
  today's cancelled explanation, adds why (no later trunk build yet, a later
  build still running, or the nearest later build's proof unavailable and
  why), and shows no figures.
- A failed later build with usable proof is used. Its conclusion is shown
  beside the source.
- Keep [GitHub requests](../../dashboard/GITHUB-REQUESTS.md) accurate for the
  forward walk's run listings and proof reads.

**Scope limits:**

- Timed-out landings keep their exact-only result: a timeout is the
  landing's own outcome, not a supersession.
- Trunk Mode Landed keeps its ancestor walk, and Baseline and Branch keep
  theirs.
- GitHub Actions comparisons only, as in the sibling story.

**Deferred promises:**

- Later-build proof for a code landing with no run whose absence is
  unexplained (for example, not the head of its push).
- Telling which of the included later revisions CI ignores.

**Considered:** Stopping superseded trunk push runs from being cancelled in
this repository's [CI workflow](../../.github/workflows/ci.yml) would give
future landings exact proof, but it does not reach other projects' CI or
landings already cancelled. A per-ref group without `cancel-in-progress`
still cancels a queued run superseded by a newer one, so only a per-revision
group on trunk would avoid every cancellation. The later build is shown as a
later build, never as the landing's equivalent, because the push that
cancelled the landing always changed CI-relevant paths.

**Examples:**

Observed on `origin/main` on 2026-11-07 (8 cancelled landing merges among
the 60 latest):

- *Next push passed.* Landing merge `aeb973a39`'s push run was cancelled.
  The next trunk revision `83518b9e3` has a passing run 42348289912 with a
  proof summary. Landed shows **Cancelled** at `aeb973a39` and uses run
  42348289912 attempt 1 at `83518b9e3`, which includes 1 later trunk
  revision.
- *Cancelled chain.* Landing `306277a2b`'s run was cancelled, and so were
  the runs at `6bfb0a576` (+1) and `1977a75a9` (+3). `d05727aaf` (+5)
  passed. Landed uses `d05727aaf` and says it includes 5 later trunk
  revisions.
- *Later build failed.* Landing `c60d7e720`'s run was cancelled. The next
  trunk revision `5f90f93af`, another story's merge that also changes
  `ci.yml`, has a failed run 42347766843 that published a proof summary.
  Landed shows **Cancelled**, and uses that run labelled failed, including 1
  later trunk revision.
- *No later proof in reach.* A cancelled landing where no later build
  within the walk has usable proof, as for builds that predate CI proof
  summaries (run 41755363191 at `9377f6d9f`). Landed shows **Cancelled**,
  names the nearest later build and that it published no CI proof summary,
  and shows no figures.
- *Newest landing.* A cancelled landing is the trunk head the dashboard has
  read, or the next build is still running. Landed shows **Cancelled** and
  says no later trunk build has finished yet.
