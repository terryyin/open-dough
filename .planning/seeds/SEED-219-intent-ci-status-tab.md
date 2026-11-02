---
id: SEED-219
status: active
planted: 2026-11-02
planted_during: Terry Yin's request for a CI status tab in Intent
trigger_when: Developers review CI status in Intent with or without a selected story
scope: story
---

# Show CI status in an Intent tab

<a id="intent-ci-status-tab"></a>

### Show CI status in an Intent tab

**Identity:** SEED-219#intent-ci-status-tab

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/447-intent-ci-status-tab/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a9ef86eefc9ee78386fb00f714edade9ee01b246648aad5a50a3f9569aed15ae","plan":"38245ad7eea026c877cbda3992bdf8586f27be25da2aa6027c0449dd6a282fc4"}}
```

**For / why:** Developers reviewing a project's intent can see its CI status
in the same page, scoped to the story they are reviewing when one is selected,
without leaving for GitHub or mistaking another branch's result for the
story's.

**Goal:** Add a **CI status** tab to the Intent reading strip. With no story
selected it shows the selected check's status for the project's configured
trunk (`main` here). With a selected story that has a published story branch,
it shows that branch's status. The story's observable outcome is a correct,
attributed CI judgment beside Intent; judging the story's intent protection
stays with the
[near-future direction](../PRODUCT-BACKLOG.md#near-future-direction) stories.

**Scope:**

- **Tab.** A third tab labelled **CI status** in Intent's reading strip, after
  **Optimization Candidates**, with the same keyboard behavior. It shows its
  status across the content area without the location tree, and it is offered
  whether or not the project configures Intent locations (or its Intent
  settings cannot be read): CI status does not depend on them.
- **Which branch.** No selected story: the configured trunk. A selected story
  is judged on its published story branch, which is the branch its published
  execution assignment records in Story Branch Mode. A selected story with no
  such branch (queued or Preparing, Trunk Mode, or Recently done) is named
  with the explanation that it has no published story branch, and no other
  branch's status is shown. A story whose assignments cannot be read, or that
  conflicting assignments name, says its branch is unknown and why. A
  recorded branch that is no longer published says so by name. Clearing the
  selection returns to the trunk.
- **What is shown.** The tab always names the branch the status belongs to.
  The status is the selected check's judgment, using the same rule as the
  base-CI check before an execution start
  ([Base CI before an execution start](../../dashboard/LAUNCH-BASE-CI.md)):
  the newest result of the configured `ciWorkflow` (or `ciAdapter` discover)
  at the branch head or its nearest ancestor that has one. It states
  **Passed**, **Failed** (including cancelled or timed out), **Running**, or
  **Could not be read** with the reason; the judged revision (short SHA and
  subject); how many later commits have no result of their own; the run link
  when given; and, while running, the nearest completed ancestor result as
  context. A history with no result says so rather than reading as passed.
- **Results on shared commits.** A result belongs to its commit. For a story
  branch, a run of the selected check on the trunk for a commit in the
  branch's history counts as that commit's result, and the tab then names the
  branch the run was on. Reason: story branches often add only planning
  commits, which this repository's CI ignores; on 2026-11-02 three published
  story branches had no runs of their own, and their nearest result was a
  `main` push of a shared ancestor.
- **Following selection.** The page's selected story is the one
  Development's board selects (page-level, per project, disposable). The tab
  shows the judgment for the currently selected story; a changed selection
  replaces it, and a judgment read for an earlier selection is never shown
  for the new one.
- **Keeping the tab.** The chosen Intent tab (any of the three) is kept while
  the page stays on the project, across Development↔Intent switches and new
  revisions. A project change starts again on **Intent**. **Optimization
  Candidates** reads its record at the new revision when shown after a
  revision change.
- **Freshness.** The judgment is read when the tab is shown, when the judged
  branch changes, and when the page's existing revision check finds that
  branch's head moved. A **Check again** control re-reads on demand. The tab
  shows when the shown judgment was checked. There is no timed polling.
- **Cost.** Each judgment read costs the existing judgment's requests (one
  commit-history listing and one Actions runs listing, plus the trunk's runs
  listing for a story branch, or the adapter's discover), counted in [Dashboard GitHub requests](../../dashboard/GITHUB-REQUESTS.md).
  Nothing is kept beyond the page (ADR 0008).

**Required restrictions:**

- Never present a missing or unreadable result as passed, and never show one
  branch's result under another branch's name. Reason: the purpose is a
  trustworthy status for the reviewed scope; a substituted or optimistic
  result misleads the review (the seed's original restriction).
- The boundary judges only a branch name its existing read rule accepts
  (`isSafeBranchName` in `dashboard/src/authenticatedReadRules.ts`), at the
  head it resolves itself. Reason: the name reaches `gh api` paths and may
  reach the project's configured `ciAdapter` command, as branch-head reads
  already guard. A recorded branch the rule refuses is that story's gap, named
  as such, as slice progress already treats it.

**Deferred promises:** CI for a Recently done story's landing revision; CI for
a Trunk Mode story's published trunk commits; checks other than the selected
one; timed refresh while running; starting, rerunning, or owning CI; putting
the tab or branch on the URL; selecting a story from within Intent.

**Boundary assumptions:** Page-level story selection already exists on trunk
(`dashboard/src/pageStorySelection.tsx`, from SEED-192#review-story-intent-impact
slice 1, whose accepted proof is in that plan). This story reads it and does
not change selection behavior.

**Key examples:**

1. Open Intent with no selected story, choose **CI status**: it names `main`
   and shows, say, **Passed** at `a1b2c3d` "Add login", with two later
   commits without their own result (docs and planning commits do not run
   CI).
2. On Development, select a Taken Story Branch Mode story whose branch is
   `codex/example-story`, return to Intent: **CI status** is still the chosen
   tab and names `codex/example-story` with its judgment, here **Failed**
   with a run link, while `main` passes.
3. That branch adds only planning commits on top of `main`'s `4774f60`:
   the tab names `codex/example-story`, judges `4774f60` **Passed** (run on
   `main`), with the branch's later commits counted as without their own
   result.
4. Select another Story Branch Mode story: the tab replaces the earlier
   judgment with the new branch's, never showing the earlier branch's result
   under the new name.
5. Select a Recently done (or queued, or Trunk Mode) story: the tab names the
   story, says it has no published story branch, and shows no status.
6. Clear the selection: the tab shows `main` again.
7. The story branch's latest run is still in progress: **Running** at the
   head, with the nearest completed ancestor (**Passed** at `d4e5f6a`) as
   context. After the run finishes, **Check again** shows **Passed**; a push
   to the branch, seen by the revision check, re-reads by itself.
8. GitHub is rate-limited or the runs cannot be listed: the tab names the
   branch and says **Could not be read** with the reason; **Check again**
   retries.
9. A project with no Intent locations configured: the strip still offers
   **CI status** beside the not-configured explanation.
10. A new trunk revision arrives while **CI status** is shown: the tab stays
   chosen and re-reads the trunk judgment. Switching project shows **Intent**.

**Alternatives considered (Explore, Borrow, Challenge):**

- *Judgment rule.* (a) Reuse the base-CI nearest-ancestor judgment —
  recommended and selected. (b) The head commit's own status only: simpler,
  but this repository's CI ignores `.planning/**` and `docs/**`, so most trunk
  heads have no run and the tab would mostly say "no result". (c) The newest
  run on the branch regardless of ancestry: can report a run for a commit no
  longer in the branch's history.
- *Borrowed mechanism.* A clinical lab report shows the last final result
  while a new sample is pending, labelled with when each was taken; that maps
  to the running judgment plus its completed ancestor and the checked time.
  Limit: a lab result belongs to one patient-sample; a CI result belongs to a
  commit, so the tab must name the judged revision and later unjudged commits,
  which the analogy does not supply.
- *Placement.* CI on the Board's story cards would reach Taken stories
  directly, but Terry asked for an Intent tab; kept as requested.
- *Strongest doubt (Challenge).* Only Taken Story Branch Mode stories have a
  story branch, so most selectable stories, including the Recently done
  stories the near-future direction reviews, show no story status. Terry
  chose the explicit explanation and deferred landing-revision CI (2026-11-02).

**Architecture:** The base-CI judgment (`dashboard/server/baseCiJudgment.ts`,
`baseCiNearest.ts`) is specialized for the origin target before an execution
start. Generalize it into one judgment of a named branch of a published source
used by both the launch confirmation and the CI status tab, so the rule,
configuration reading, request routing through the GitHub request owner, and
unread reasons stay in one place. The new authenticated read applies the existing
safe-branch rule. Which branch a selected story has is the rule slice
progress already uses (`dashboard/src/progressRoute.ts`: single recorded
owner, Story Branch Mode, safe name, conflicting or unreadable profiles as
gaps); extract it as the one story-branch rule for both consumers rather
than restating it. Intent's reading-mode
choice moves from `IntentBrowser`'s local state to a page-level, per-project
owner beside story selection (ADR 0008 disposable page state), and the strip
renders above Intent's location-configuration branches so CI status is
reachable when they are absent. Accepted decisions:
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
(observe without owning; disposable page state; repository-owned records) and
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(reuse). No conflict found.

**Request evidence / priority:** Terry requested this on 2026-11-02 as the
first queued item in the [product backlog](../PRODUCT-BACKLOG.md#backlog-list),
with `main` as the default and a selected story's branch taking precedence.
In refinement on 2026-11-02 Terry chose: an explanation with no status for
stories without a published story branch; keeping the chosen Intent tab per
project; and re-reading on head change plus **Check again**, without polling.
