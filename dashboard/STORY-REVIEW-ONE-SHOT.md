# Landed one-shot review

The retained run comparison extends the [story review](AGENT-LAUNCH-REVIEW.md).

Queued refinement results remain reachable from their active story card. A
completed one-shot execution offers the same **Review changes** on its Recently
done card, using the published done identity and title even after the story seed,
plan, workspace and branch are gone. Review reads all kept launches for that
story, independently of the marked-done sessions nested in the card: an open
session with an unfinished attention report can still supply the landed run.
While done details are unread or failed, the catalog identity supplies the card
and review title; reading the record supplies its title for later openings.
Closing the review returns the keyboard to the card's review action and keeps
Recently done's shown range and entry counts.

A retained one-shot run can also be reviewed after its workspace and local branch
are retired. The Comparison switch offers **Landed one-shot runs** beside the
workspace's All changes, Since the review and Commits choices. Its bounded native
listbox offers every retained refinement or execution run, newest first by launch
time, including older runs without a reporting handoff. The initial run is the
newest captured comparison, or the newest retained run's evidence gap when none
has capture. A readable current workspace remains the opening default; otherwise
Review changes opens that historical choice. The selector names workflow, launch
time and accepted revision, or missing capture. The context names **Landed one-shot
run**, its workflow/time, authorized remote target, and exact captured base and
accepted revision. The existing file browser, counts, rename detection, binary
explanation and file moves compare those two commits.

Switching to a run hides Mark reviewed and leaves the story's mark and workspace
comparison unchanged. Returning to the workspace restores its comparison and
chosen Commits range. Refresh keeps the chosen run while retained, including when
a new capture appears; when it is deleted or expires, Refresh selects the newest
remaining captured run, or the newest retained evidence gap. A delayed reply for
an earlier run or file cannot replace the later choice. Maximize, resize, Hide/Show
files, narrow layout and Close/focus return use the same panel and browser.
Refresh and restart read the fixed pair even when trunk has advanced or reverted
the result. Historical reads use the original saved common Git repository and
write no ref, index or checkout content; they neither fetch trunk nor replace the
workspace review mark.

A valid empty comparison says that this run's delivered comparison is empty.
A retained one-shot run without capture explains its evidence gap; missing or
unreadable saved repository or objects explain why the comparison is unavailable.
None of these states guesses a baseline or lists substitute files from today's
trunk. Requests to the same review/file boundary name the project, story and
retained launch identity (the reporting reference or durable host/session key). File reads must name that captured pair and one of its
literal changed paths, including the exact old path for a rename. No request
can supply a repository or workspace path.
