# Source-only review

Reviewed against the narrowed story SEED-420#route-review-changes-to-intent after the card-opening outcome moved to SEED-420#open-review-changes-from-a-story-card. The source is that story's Goal, Scope, and key examples. The previous card-opening commitments moved with that remainder.

## Source context

While one story is open in Intent, a commit range, a chosen landed run, or Refresh keeps that story's last comparison and Compare, says the story is being read, and leaves Refresh focusable without starting another read. Selecting a different story shows none of the previous story's files or source while the new review is unread. A Done story's locations and CI endpoint stay on its default review. Opening Review changes from a Story card is out of scope.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| D1 | Choosing Commits while that range is still unread keeps Compare, keeps the pressed Commits choice focused, keeps the last file list, and says the story's changes are being read. Refresh can take focus and does not start another read. | slice 1 | observed: intent-story-compare-reading.spec.ts: a pending commit range keeps Compare, the pressed Commits choice, the file Modified dashboard/tests/a.spec.ts, the reading sentence, and a focusable Refresh that does not start another read |
| D2 | Pressing Refresh while the next read is unread keeps the same comparison. A second press does not read again. | slice 1 | observed: intent-story-compare-reading.spec.ts: a pending Refresh keeps the comparison and a second press does not increase the review-call count |
| D3 | A Done story's chosen landed run is still unread. Its locations and the CI comparison's landed endpoint stay on the published completion. | slice 1 | observed: intent-story-compare-reading.spec.ts: a pending landed run keeps locationRevisions on doneCompletion and the CI landed endpoint text captured from the default |
| D4 | Story B is selected while story A's review was on screen and story B's review and locations are still unread. Story B shows none of story A's files or source. | slice 1 | observed: intent-done-source-selection.spec.ts: a newly selected Done story shows only its own historical source after held comparison and locations reads |
