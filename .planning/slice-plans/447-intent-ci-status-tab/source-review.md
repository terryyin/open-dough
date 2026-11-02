# Source review: SEED-219#intent-ci-status-tab

Launch: fresh general-purpose sub-agent without conversation inheritance,
2026-11-02, started by this execution's coordinator. Input: only the story
section text, lines 14–142 of `.planning/seeds/SEED-219-intent-ci-status-tab.md`
at `16ecc82a` (identity, For / why, Goal, Scope, Required restrictions,
Deferred promises, Boundary assumptions, Key examples), with instructions to
read no other files, change nothing, and number every commitment. Ids and text
are as returned; exclusions and restrictions keep their returned kind in the
text.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G1 | Developers reviewing intent can see the project's CI status on the same page, without going to GitHub | slice 5 | |
| G2 | The status is scoped to the story under review when one is selected | slice 4 | |
| G3 | Developers do not mistake another branch's result for the story's | slice 4 | |
| G4 | Add a **CI status** tab to the Intent reading strip | slice 1 | observed: dashboard/tests/intent-ci-status.spec.ts "CI status names main…": tab list [Intent, Optimization Candidates, CI status] |
| G5 | With no story selected, it shows the selected check's status for the configured trunk (`main` here) | slice 1 | observed: dashboard/tests/intent-ci-status.spec.ts "CI status names main…": heading "CI status of main", Passed at a1b2c3d |
| G6 | With a selected story that has a published story branch, it shows that branch's status | slice 4 | |
| G7 | Observable outcome: a correct, attributed CI judgment beside Intent | slice 5 | |
| G8 | Exclusion: judging the story's intent protection stays with the near-future direction stories | slice 5 | |
| S1.1 | Third tab labelled **CI status** in Intent's reading strip | slice 1 | observed: dashboard/tests/intent-ci-status.spec.ts "CI status names main…": tab list includes "CI status" third |
| S1.2 | Placed after **Optimization Candidates** | slice 1 | observed: dashboard/tests/intent-ci-status.spec.ts "CI status names main…": tab order Intent, Optimization Candidates, CI status |
| S1.3 | Same keyboard behavior as the other tabs | slice 1 | observed: dashboard/tests/intent-ci-status.spec.ts "CI status names main…" step "arrow keys, Home and End move between the three tabs" |
| S1.4 | Shows its status across the content area without the location tree | slice 1 | observed: dashboard/tests/intent-ci-status.spec.ts "CI status names main…": CI status panel visible, .intent-locations hidden |
| S1.5a | Offered when the project configures Intent locations | slice 1 | observed: dashboard/tests/intent-ci-status.spec.ts "CI status names main…": Open Dough project with configured locations offers CI status |
| S1.5b | Offered when the project does not configure Intent locations | slice 1 | observed: dashboard/tests/intent-ci-status.spec.ts "CI status is offered without Intent locations…" step "no Intent locations": CI status chosen beside the explanation |
| S1.5c | Offered when the project's Intent settings cannot be read | slice 1 | observed: dashboard/tests/intent-ci-status.spec.ts "CI status is offered without Intent locations…" step "unreadable Intent settings": alert "is not valid JSON", CI status still offered |
| S1.6 | CI status does not depend on Intent locations/settings | slice 1 | observed: dashboard/tests/intent-ci-status.spec.ts "CI status is offered without Intent locations…": judgment shown with no locations and with unreadable settings |
| S2.1 | No selected story: the configured trunk is judged | slice 1 | observed: dashboard/tests/intent-ci-status.spec.ts "CI status names main…"/dashboard/tests/intent-ci-status-reads.spec.ts "the CI status read refuses an unsafe branch name…": heading "CI status of main"; boundary answer branch main |
| S2.2 | A selected story is judged on its published story branch | slice 4 | |
| S2.3 | Published story branch = the branch its published execution assignment records in Story Branch Mode | slice 4 | |
| S2.4 | A selected story with no such branch is named with the explanation that it has no published story branch | slice 4 | |
| S2.4a | No-branch case includes queued or Preparing | slice 4 | |
| S2.4b | No-branch case includes Trunk Mode | slice 4 | |
| S2.4c | No-branch case includes Recently done | slice 4 | |
| S2.5 | Restriction: in the no-branch case, no other branch's status is shown | slice 4 | |
| S2.6a | A story whose assignments cannot be read says its branch is unknown and why | slice 4 | |
| S2.6b | A story named by conflicting assignments says its branch is unknown and why | slice 4 | |
| S2.7 | A recorded branch that is no longer published says so by name | slice 4 | |
| S2.8 | Clearing the selection returns to the trunk | slice 4 | |
| S3.1 | The tab always names the branch the status belongs to | slice 1 | observed: dashboard/tests/intent-ci-status.spec.ts every UI test: heading "CI status of main" incl. could-not-be-read |
| S3.2 | Status is the selected check's judgment using the same rule as the base-CI check before an execution start (LAUNCH-BASE-CI.md) | slice 1 | observed: dashboard/server/launchStart.ts and intentCiStatusRead.ts both call judgeBranchCi; agent-launch-base-ci*.spec.ts green |
| S3.3 | Rule: newest result of configured `ciWorkflow` (or `ciAdapter` discover) at the branch head or nearest ancestor that has one | slice 1 | observed: dashboard/server/baseCiJudgment.ts judgeBranchCi + baseCiNearest; dashboard/tests/intent-ci-status-reads.spec.ts "a running head shows…" nearest ancestor; dashboard/tests/intent-ci-status-reads.spec.ts "a project with a ciAdapter…" adapter discover |
| S3.4a | States **Passed** | slice 1 | observed: dashboard/tests/intent-ci-status.spec.ts "CI status names main…": "Passed at a1b2c3d (Add login)" |
| S3.4b | States **Failed**, including cancelled or timed out | slice 1 | observed: dashboard/tests/intent-ci-status.spec.ts "CI status is offered without Intent locations…": cancelled → "Failed at a1b2c3d"; timed_out after Check again (new checked datetime) still Failed; dashboard/tests/intent-ci-status-reads.spec.ts "a project with a ciAdapter…" adapter Failed |
| S3.4c | States **Running** | slice 1 | observed: dashboard/tests/intent-ci-status-reads.spec.ts "a running head shows…": "Running at <head> (Plan the next story)" |
| S3.4d | States **Could not be read** with the reason | slice 1 | observed: dashboard/tests/intent-ci-status-reads.spec.ts "CI status that could not be read…": "Could not be read" with .intent-ci-reason "failed: HTTP 404" |
| S3.5 | Shows the judged revision (short SHA and subject) | slice 1 | observed: dashboard/tests/intent-ci-status.spec.ts state tests: short SHA and subject in .intent-ci-state |
| S3.6 | Shows how many later commits have no result of their own | slice 1 | observed: dashboard/tests/intent-ci-status.spec.ts "CI status names main…": "2 later commits have no result of their own." |
| S3.7 | Shows the run link when given | slice 1 | observed: dashboard/tests/intent-ci-status.spec.ts "CI status names main…", dashboard/tests/intent-ci-status.spec.ts "CI status is offered without Intent locations…", dashboard/tests/intent-ci-status-reads.spec.ts "a running head shows…": run link by role with href |
| S3.8 | While running, shows the nearest completed ancestor result as context | slice 1 | observed: dashboard/tests/intent-ci-status-reads.spec.ts "a running head shows…": "Nearest completed ancestor: a1b2c3d (Add login) — passed." with link |
| S3.9 | A history with no result says so rather than reading as passed | slice 1 | observed: dashboard/tests/intent-ci-status.spec.ts "CI status is offered without Intent locations…" step unreadable settings: "No result of the selected check was found…", no /passed/i |
| S4.1 | A result belongs to its commit | slice 4 | |
| S4.2 | For a story branch, a trunk run of the selected check for a commit in the branch's history counts as that commit's result | slice 4 | |
| S4.3 | The tab then names the branch the run was on | slice 4 | |
| S4.4 | Reason: story branches often add only planning commits that CI ignores; on 2026-11-02 three published story branches had no own runs, nearest result was a `main` push of a shared ancestor | slice 4 | |
| S5.1 | Page's selected story is the one Development's board selects (page-level, per project, disposable) | slice 4 | |
| S5.2 | Tab shows the judgment for the currently selected story | slice 4 | |
| S5.3 | A changed selection replaces the shown judgment | slice 4 | |
| S5.4 | Restriction: a judgment read for an earlier selection is never shown for the new one | slice 4 | |
| S6.1 | Chosen Intent tab (any of the three) is kept while the page stays on the project | slice 2 | observed: dashboard/tests/intent-ci-status-kept.spec.ts "CI status and Optimization Candidates stay chosen across Development and back; …": expectChosen for both tabs |
| S6.1a | Kept across Development<->Intent switches | slice 2 | observed: dashboard/tests/intent-ci-status-kept.spec.ts same test: CI status steps Development→Intent still CI status (Passed at a1b2c3d), Candidates step expectCandidatesRevision |
| S6.1b | Kept across new revisions | slice 2 | observed: dashboard/tests/intent-ci-status-kept.spec.ts "a new trunk revision keeps CI status chosen and reads the trunk's judgment again at the new head": expectChosen after moveTrunk |
| S6.2 | A project change starts again on **Intent** | slice 2 | observed: dashboard/tests/intent-ci-status-kept.spec.ts step "a project change starts again on Intent, and so does returning" |
| S6.3 | **Optimization Candidates** reads its record at the new revision when shown after a revision change | slice 2 | observed: dashboard/tests/intent-test-optimization-candidates-revision.spec.ts "Optimization Candidates shown across a new revision stays chosen and reads that revision's record" |
| S7.1a | Judgment is read when the tab is shown | slice 1 | observed: dashboard/tests/intent-ci-status.spec.ts "CI status names main…": judgment calls asserted on showing the tab |
| S7.1b | Judgment is read when the judged branch changes | slice 4 | |
| S7.1c | Judgment is read when the page's existing revision check finds that branch's head moved | slice 5 | |
| S7.2 | A **Check again** control re-reads on demand | slice 1 | observed: dashboard/tests/intent-ci-status-reads.spec.ts "CI status that could not be read…" and dashboard/tests/intent-ci-status-reads.spec.ts "a running head shows…": Check again re-reads to Passed |
| S7.3 | The tab shows when the shown judgment was checked | slice 1 | observed: dashboard/tests/intent-ci-status.spec.ts expectChecked: "Checked at" with time[datetime] ISO |
| S7.4 | Exclusion: no timed polling | slice 5 | |
| S8.1 | Each judgment read costs only the existing judgment's requests: one commit-history listing and one Actions runs listing |  | O1 |
| S8.2 | Plus the trunk's runs listing for a story branch | slice 4 | |
| S8.3 | Or the adapter's discover (adapter case) | slice 1 | observed: dashboard/tests/intent-ci-status-reads.spec.ts "a project with a ciAdapter…": adapter judgment with no actions-* calls; GITHUB-REQUESTS.md history listing only |
| S8.4 | Requests are counted in Dashboard GitHub requests (GITHUB-REQUESTS.md) | slice 4 | |
| S8.5 | Restriction: nothing is kept beyond the page (ADR 0008) | slice 5 | |
| R1.1 | Restriction: never present a missing or unreadable result as passed | slice 1 | observed: dashboard/tests/intent-ci-status.spec.ts "CI status is offered without Intent locations…" unreadable settings and dashboard/tests/intent-ci-status-reads.spec.ts "CI status that could not be read…": no passed text, Could not be read |
| R1.2 | Restriction: never show one branch's result under another branch's name | slice 4 | |
| R1.3 | Reason: purpose is trustworthy status for the reviewed scope; substituted/optimistic result misleads review | slice 4 | |
| R2.1 | Restriction: boundary judges only a branch name accepted by existing read rule `isSafeBranchName` (dashboard/src/authenticatedReadRules.ts) | slice 1 | observed: dashboard/tests/intent-ci-status-reads.spec.ts "the CI status read refuses an unsafe branch name…": 400 for branch=main..other, has%20space, two branch values, no judgment calls; judgeBranchCi refuses unsafe names |
| R2.2 | Restriction: boundary judges at the head it resolves itself | slice 1 | observed: dashboard/tests/intent-ci-status-reads.spec.ts "the CI status read refuses an unsafe branch name…": revision=<sha> refused 400; parameterless read answers the boundary's own judgment |
| R2.3 | Reason: name reaches `gh api` paths and possibly the configured `ciAdapter` command, as branch-head reads already guard | slice 1 | observed: dashboard/tests/intent-ci-status-reads.spec.ts "the CI status read refuses an unsafe branch name…": unsafe names reach no gh call; dashboard/tests/intent-ci-status-reads.spec.ts "a project with a ciAdapter…" adapter path |
| R2.4 | A recorded branch the rule refuses is that story's gap, named as such (as slice progress already treats it) | slice 4 | |
| D1 | Deferred: CI for a Recently done story's landing revision | slice 5 | |
| D2 | Deferred: CI for a Trunk Mode story's published trunk commits | slice 5 | |
| D3 | Deferred: checks other than the selected one | slice 5 | |
| D4 | Deferred: timed refresh while running | slice 5 | |
| D5a | Deferred: starting CI | slice 5 | |
| D5b | Deferred: rerunning CI | slice 5 | |
| D5c | Deferred: owning CI | slice 5 | |
| D6a | Deferred: putting the tab on the URL | slice 5 | |
| D6b | Deferred: putting the branch on the URL | slice 5 | |
| D7 | Deferred: selecting a story from within Intent | slice 5 | |
| B1 | Assumption: page-level story selection already exists on trunk (dashboard/src/pageStorySelection.tsx, SEED-192 slice 1) | slice 4 | |
| B2 | This story reads the selection | slice 4 | |
| B3 | Restriction: this story does not change selection behavior | slice 4 | |
| E1 | No selected story, choose CI status: names `main`, shows e.g. Passed at `a1b2c3d` "Add login", two later commits without own result (docs/planning commits don't run CI) | slice 1 | observed: dashboard/tests/intent-ci-status.spec.ts "CI status names main…" |
| E2 | On Development select Taken Story Branch Mode story `codex/example-story`, return to Intent: CI status still chosen, names `codex/example-story` with its judgment, e.g. Failed with run link, while `main` passes | slice 4 | |
| E3 | Branch adds only planning commits on `main`'s `4774f60`: names `codex/example-story`, judges `4774f60` Passed (run on `main`), later branch commits counted as without own result | slice 4 | |
| E4 | Select another Story Branch Mode story: tab replaces earlier judgment, never showing earlier branch's result under new name | slice 4 | |
| E5 | Select Recently done (or queued, or Trunk Mode) story: names the story, says no published story branch, shows no status | slice 4 | |
| E6 | Clear selection: tab shows `main` again | slice 4 | |
| E7a | Story branch's latest run in progress: Running at head, nearest completed ancestor (Passed at `d4e5f6a`) as context | slice 4 | |
| E7b | After run finishes, Check again shows Passed | slice 4 | |
| E7c | A push to the branch, seen by the revision check, re-reads by itself | slice 5 | |
| E8a | GitHub rate-limited or runs cannot be listed: tab names branch, says Could not be read with reason | slice 1 | observed: dashboard/tests/intent-ci-status-reads.spec.ts "CI status that could not be read…": runs listing fails → names main, Could not be read, reason |
| E8b | Check again retries | slice 1 | observed: dashboard/tests/intent-ci-status-reads.spec.ts "CI status that could not be read…": Check again then Passed |
| E9 | Project with no Intent locations: strip still offers CI status beside the not-configured explanation | slice 1 | observed: dashboard/tests/intent-ci-status.spec.ts "CI status is offered without Intent locations…" step "no Intent locations" |
| E10a | New trunk revision while CI status shown: tab stays chosen and re-reads trunk judgment | slice 2 | observed: dashboard/tests/intent-ci-status-kept.spec.ts "a new trunk revision keeps CI status chosen…": Failed at e8e8e8e, new checked datetime, commit-list main calls 1→2 |
| E10b | Switching project shows Intent | slice 2 | observed: dashboard/tests/intent-ci-status-kept.spec.ts step "a project change starts again on Intent…": Doughnut shows Intent selected |
