# Source-only review

Launch: fresh general-purpose reviewer, 2026-11-16, model inherit.
Input: Goal, Scope, Key examples, and Architecture concept constraints from
SEED-379#review-changes-from-completed-ad-hoc-sessions only. No plan, product,
proof, or slice scope.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer who marked an ad hoc session done can open **Review changes** from that session’s card in **Recently done**. | slice 5 | observed: recently-done-ad-hoc-review.spec.ts Review changes on Done ad hoc entry |
| 2 | From that action they can read the change that session’s landing delivered to trunk. | slice 5 | observed: same: panel shows landed files/diff for session landing |
| 3 | That reading uses evidence the dashboard already retains. | slice 1 | observed: ad-hoc-review.spec.ts landed answer from retained landing after trunk advance |
| 4 | Every standalone ad hoc session entry in **Recently done** offers **Review changes**. | slice 5 | observed: same: every standalone entry (landed + no-landing) shows Review changes |
| 5 | That control is named as on a done story’s card. | slice 5 | observed: AdHocSessionReviewAction text Review changes like StoryReviewAction |
| 6 | That control is drawn as on a done story’s card. | slice 5 | observed: AdHocSessionReviewAction start-launch-button + GitCompare icons like story card |
| 7 | A session whose launch established no place for a landing still offers **Review changes**. | slice 5 | observed: same: noLandingEntry Review changes visible |
| 8 | When the comparison is absent, that absence is explained where the developer looks for the review. | slice 6 | observed: recently-done-ad-hoc-review.spec.ts not-captured/unreadable/empty explanations without file browser; Review changes on entry |
| 9 | Opening the review uses the page’s one side panel. | slice 5 | observed: same: sidePanelPages storyReview opens in page side panel |
| 10.1 | That panel provides the existing review capability: file browser | slice 5 | observed: same: expectChangedFiles / expectChangedFile file browser |
| 10.2 | That panel provides the existing review capability: counts | slice 5 | observed: same: expectChangedFiles 1 changed file counts |
| 10.3 | That panel provides the existing review capability: rename detection | slice 5 | observed: StoryReview.tsx same landed body; rename detection not gated on identity |
| 10.4 | That panel provides the existing review capability: binary explanation | slice 5 | observed: StoryReview.tsx same landed body; binary explanation not gated on identity |
| 10.5 | That panel provides the existing review capability: file moves | slice 5 | observed: StoryReview.tsx same landed body; file moves not gated on identity |
| 10.6 | That panel provides the existing review capability: context expansion | slice 5 | observed: StoryReview.tsx same landed body; context expansion not gated on identity |
| 10.7 | That panel provides the existing review capability: Refresh | slice 5 | observed: StoryReview.tsx same Refresh control for session subject |
| 10.8 | That panel provides the existing review capability: Maximize/Restore | slice 5 | observed: StoryReview.tsx same Maximize/Restore for session subject |
| 10.9 | That panel provides the existing review capability: Hide files/Show files | slice 5 | observed: StoryReview.tsx same Hide/Show files for session subject |
| 10.10 | That panel provides the existing review capability: Close | slice 5 | observed: same: storyReview.close() Close control |
| 11 | The panel header names the session by its label. | slice 5 | observed: same: expectStory(landedTitle) header label |
| 12.1 | The panel context line states the launch time | slice 5 | observed: same: expectLandedContext launchedAt |
| 12.2 | The panel context line states the authorized remote target | slice 5 | observed: same: expectLandedContext remoteTarget |
| 12.3 | The panel context line states the exact captured base | slice 5 | observed: same: expectLandedContext base |
| 12.4 | The panel context line states the exact accepted revision | slice 5 | observed: same: expectLandedContext revision |
| 13 | The comparison is the launch record’s retained landing. | slice 1 | observed: storyReviewLanded.ts reads record.landing; ad-hoc-review.spec.ts asserts landed files for that pair |
| 14 | That retained landing is the fetched trunk tip the publication was accepted onto, together with the accepted revision. | slice 1 | observed: ad-hoc-review.spec.ts landing.base/revision match captured pair |
| 15 | The comparison stays fixed when trunk advances the result. | slice 1 | observed: ad-hoc-review.spec.ts advances trunk after capture; answer still uses captured revision |
| 16 | The comparison stays fixed when trunk reverts the result. | slice 1 | observed: storyReviewLanded.ts compares only landing.base and landing.revision (same fixed pair as advance) |
| 17 | The comparison stays fixed after the session’s worktree is removed. | slice 1 | observed: ad-hoc-review.spec.ts workspace path never present; landed answer still returned |
| 18 | The comparison stays fixed after the session’s branch is removed. | slice 1 | observed: storyReviewLanded.ts ignores branch; comparison is retained landing objects only |
| 19 | The comparison remains available for as long as the launch record is kept. | slice 1 | observed: namedKeptSession → keptSession; unavailable once record not kept |
| 20 | The review is read-only. | slice 5 | observed: same: expectNoMarkReviewed; read-only panel |
| 21 | The review holds one comparison. | slice 5 | observed: same: expectNoComparisonSwitch; one comparison |
| 22 | The review shows no Comparison switch. | slice 5 | observed: same: expectNoComparisonSwitch |
| 23 | The review shows no Mark reviewed. | slice 5 | observed: same: expectNoMarkReviewed |
| 24 | Opening the review clears the selected story. | slice 5 | observed: same: expectSelected story false after open |
| 25 | That clearing matches showing a session attached to no story. | slice 5 | observed: sidePanelContent clears shownStory for session subject |
| 26 | Close returns the keyboard to the entry’s **Review changes**. | slice 5 | observed: same: after close action toBeFocused |
| 27 | Command+Shift+Escape returns the keyboard the same way Close does. | slice 5 | observed: pageSidePanel Command+Shift+Escape uses same close return-to-control path |
| 28 | If that control is no longer shown, Close or Command+Shift+Escape returns the keyboard to the session’s entry. | slice 5 | observed: pageSidePanel returns keyboard to session entry when control gone |
| 29 | Closing keeps Recently done’s shown range. | slice 5 | observed: same: expectEntries namesBefore after close |
| 30 | Closing keeps Recently done’s entry counts. | slice 5 | observed: same: count text unchanged after close |
| 31 | Sessions completed before this story that hold a retained landing are reviewable the same way. | slice 1 | observed: same landed path for any kept ad-hoc record with landing (ad-hoc-review.spec.ts) |
| 32 | Nothing is captured anew for those earlier sessions. | slice 1 | observed: ad-hoc-review.spec.ts only GET review; no capture write |
| 33 | A review’s subject is a story or an ad hoc session. | slice 1 | observed: reviewedWorkSubject.ts + storyReviewRequest dual subject |
| 34 | A story review names its project and story identity. | slice 1 | observed: identityReviewRequest preserved; backend-tests/review/ green (93) |
| 35 | An ad hoc review names its project and the session, as the dashboard’s other session requests do. | slice 1 | observed: sessionReviewRequest names source/host/session via reviewedWorkQuery |
| 36 | The review boundary admits either subject through one admission path. | slice 1 | observed: storyReviewRequest.ts one entry admitting identity or session |
| 37 | No review request supplies a repository path. | slice 1 | observed: reviewedWorkQuery omits repository; requireExactQuery lists only subject keys |
| 38 | No review request supplies a workspace path. | slice 1 | observed: reviewedWorkQuery omits workspace; requireExactQuery lists only subject keys |
| 39 | A file read names the retained pair and one of its literal changed paths. | slice 3 | observed: ad-hoc-review.spec.ts rename file admit: query names pair + oldPath; diff/text returned |
| 40 | That path set includes a rename’s old path. | slice 3 | observed: ad-hoc-review.spec.ts rename oldPath admitted via landedFileQuery for renamed file |
| 41 | A launch record’s retained comparisons are its change evidence. | slice 1 | observed: landedStoryReview uses record.landing as change evidence |
| 42 | For this story, that evidence is the launch record’s one landing. | slice 1 | observed: ad-hoc landed answer uses that one landing; no other comparison |
| 43 | The ad hoc review reuses the landed-run comparison reader. | slice 1 | observed: storyReviewSnapshot.ts calls landedStoryReview for session run |
| 44 | The ad hoc review reuses the story review’s panel. | slice 4 | observed: StoryReview.tsx still opens in PageFrame side panel; frontend review/ recently-done-review and intent-done-review suites green |
| 45 | The panel’s subject is generalized from a story to reviewed work. | slice 4 | observed: pageStoryReviews StoryReviewRequest.subject + sameReviewedWork; StoryReviewHeading; queries use reviewedWorkQuery |
| 46 | The review reads the saved common Git repository. | slice 1 | observed: storyReviewLanded.ts cwd is landing.repository; cat-file/changedFrom only |
| 47 | The review fetches nothing. | slice 1 | observed: no fetch in landedStoryReview; test HEAD unchanged |
| 48 | The review writes no ref content. | slice 1 | observed: ad-hoc-review.spec.ts HEAD/index unchanged after review |
| 49 | The review writes no index content. | slice 1 | observed: ad-hoc-review.spec.ts index bytes unchanged after review |
| 50 | The review writes no checkout content. | slice 1 | observed: ad-hoc-review.spec.ts HEAD unchanged; no checkout write |
| 51 | The review states what this launch’s landing delivered. | slice 1 | observed: ad-hoc-review.spec.ts files list delivered.txt between base and revision |
| 52 | The review claims nothing about other work the session may have done. | slice 1 | observed: answer exposes only landing comparison fields; no other session work claimed |

## Qualifications

- Goal outcome: this makes half of today’s completed ad hoc sessions reviewable.
- Goal positioning: this gives later stories the action their evidence appears under.
- Absent landing: the control is still offered so the missing comparison can be explained in place.
- Persistence bound: fixed comparison lasts only while the launch record is kept.
- Read-only single comparison: no Comparison switch and no Mark reviewed in this story.
- Keyboard return alternative: to **Review changes** when shown; otherwise to the session entry.
- Historical sessions: same review path; no new capture.
- Architecture continuity: ADR 0008 keeps a launch record as machine-local evidence; observation only.
- Later retained comparisons (Default main attributed commits; own-branch branch result) are named as future retained comparisons of the same record, read by the same reader and shown in the same panel; this story builds none of that.
- Comparison switch returns only when a session later holds more than one retained comparison; this story does not build that.

## Trigger / journey examples

1. Session launched with Isolated workspace · Automatically land, landed through Dough, marked done; worktree gone and trunk advanced → **Review changes** on its Recently done entry → side panel lists files between captured base and accepted revision; each diff reads as it did at landing.
2. Session completed weeks before this story holds a readable retained landing → **Review changes** → the same comparison.
3. Default launch pushed with plain Git and holds no landing → **Review changes** → panel says this session’s changes were not captured and lists no files.
4. Retained landing whose saved repository or objects can no longer be read → **Review changes** → panel explains why the comparison is unavailable and lists no substitute files.
5. Retained landing whose base and accepted revision hold the same content → **Review changes** → panel says this session’s delivered comparison is empty.
6. Ad hoc row that uniquely establishes a published Done story → choosing it reveals that story’s card, as before.

## Exclusions

1. An ad hoc row linked to a published Done story keeps opening that story; the story’s card holds its review.
2. An open ad hoc session’s entry gains no review action.
3. Follow up from a file or line of an ad hoc review is deferred.
4. The entry’s own Follow up stays as it is.
5. This story does not add attributed-commit comparison (Default main story).
6. This story does not add own-branch result comparison.
7. This story does not build a Comparison switch for multiple retained comparisons.
