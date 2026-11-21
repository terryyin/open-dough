# Source review: SEED-418#attribute-every-workflow-session-record

Launch: fresh general-purpose reviewer (no inheritance), 2026-11-21, by the
execution coordinator before slice 1 delegation. Input: only the story section's
split note, Goal, Scope, Key examples and Architecture text from
`.planning/seeds/SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record`,
with instructions to read no other files and number independently observable
promises.

Unnumbered context returned: split provenance (parent story supplies the record
contract and reader); the Scope opening frames C1–C4; deferred story-card
selection, combined comparisons, historical recovery and UUID hand-off; ADR 0008
rationale; "assembled from accepted publication evidence" explains C7, C12–C15;
"authorized" in C24 qualifies the trigger, not a rejection rule.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | An execution session closed through Story Wrap-up publishes one session record that includes all of its accepted increments. Scope "including … execution", "Publish one record"; Key example 1 "An execution publishes two increments … then wraps up. A developer using only another clone opens its UUID and can inspect both contributions." | slice 3 | |
| C2 | A refinement session that lands publishes its own session record, and its UUID resolves that session's changes. Scope "including refinement"; Goal "across repeated refinements"; Key example 2 "A refinement lands … Each UUID resolves its own changes" | slice 5 | |
| C3 | An ad hoc follow-up to a story publishes its own session record, separate from the story's earlier sessions, and that record resolves its own changes. Scope "and ad hoc story follow-ups"; Key example 2 | slice 5 | |
| C4 | A standalone ad hoc session closed through Land still publishes its session record under the extended contract. Scope "standalone ad hoc work" | slice 1 | observed: Distribution/tests/skills/dough-land/session-close-resume.test.mjs "a refused record push resumes after trunk advances with the original record and one work publication — full ad-hoc record compared" |
| C5 | When a launch UUID is supplied, the record is published under that UUID. Scope "Use the launch UUID when supplied" | slice 1 | observed: Distribution/tests/skills/dough-land/session-record-publication.test.mjs "a Dashboard-launched Land publishes the session record of its accepted comparison under the launch reference" |
| C6 | A natively started session keeps a session UUID of its own and publishes its record under it. Scope "retain a session UUID for native starts" | slice 1 | observed: Distribution/tests/skills/dough-land/session-close-resume.test.mjs "a close whose record acknowledgement was lost settles on rerun under the same native UUID without pushing" |
| C7 | The record carries the workflow, the original close time, and the session's accepted comparisons in order. Scope "Publish one record with the workflow, original close time, … and ordered comparisons for that session's accepted work." | slice 3 | |
| C8 | When a session belongs to a story, its record carries that story's identity, and sessions of the same story carry the same identity. Scope "story identity when associated"; Key example 2 | slice 5 | |
| C9 | Earlier accepted work that went straight to trunk is included in the record once its comparison is reachable from trunk. Scope "Include earlier accepted trunk … work when its comparison becomes reachable from trunk." | slice 3 | |
| C10 | Earlier accepted story-branch work is included once reachable from trunk; in Story Branch Mode the original branch hashes can still be read after integration and branch retirement. Scope; Key example 1 | slice 4 | |
| C11 | In Story Branch Mode, a contribution appears once, even when both its branch comparison and its integrated form are reachable. Key example 1 "without reviewing the same contribution twice." | slice 4 | |
| C12 | Comparisons leave out other writers' intervening contributions, including changes received only by pull. Scope "Exclude intervening contributions"; Key examples 1 and 2 | slice 6 | |
| C13 | Unsuccessful push attempts are left out of the record's comparisons. Scope "Exclude … unsuccessful push attempts" | slice 3 | |
| C14 | Unpublished edits are left out of the record's comparisons. Scope "Exclude … unpublished edits" | slice 6 | |
| C15 | The record's own publication is not attributed as session work. Scope "Exclude … the record's own publication." | slice 3 | |
| C16 | When shared-checkout evidence cannot separate individual contributions, the affected ranges are marked, and the review shows the uncertainty or overlap. Scope; Key example 2 | slice 6 | |
| C17 | If a close is retried after the work reached trunk but the record push failed or its response was lost, the retry keeps the original UUID, close time and accepted comparisons. Scope "A close retry keeps the original record"; Key example 3 | slice 1 | observed: Distribution/tests/skills/dough-land/session-close-resume.test.mjs "a refused record push resumes after trunk advances with the original record and one work publication — bytes equal sealed record" |
| C18 | After such a retry, the repository holds exactly one record for the session. Key example 3 "The repository ends with one record" | slice 1 | observed: Distribution/tests/skills/dough-land/session-close-resume.test.mjs "a refused record push resumes after trunk advances… and the native rerun case — ls-tree lists one session file" |
| C19 | A retry resumes from its first unfinished step, so the session's work is published only once. Scope "and resumes its first unfinished step."; Key example 3 "and one publication of the work." | slice 1 | observed: Distribution/tests/skills/dough-land/session-close-resume.test.mjs "a refused record push resumes after trunk advances… — origin push log [work, intervening, record]; lost-result rerun adds no push" |
| C20 | A developer on another machine, with only another clone, can open and inspect each range for a UUID in the existing published-session review; the UUID plus the published repository are enough. Goal; Scope "Use the existing published-session review to open and inspect each range for a UUID."; Key example 1; Architecture | slice 2 | |
| C21 | Launch state, conversations, workspace paths and native controls stay on the originating machine and do not appear in the published record. Architecture | slice 1 | observed: Distribution/tests/skills/dough-land/session-record-publication.test.mjs "a Dashboard-launched Land publishes… — full record deepEqual has only version, sessionId, workflow, closedAt, ranges" |
| C22 | A record stored in the repository stays available in current review until 30 days after close. Scope; Key example 4 "Just before 30 days a record is available to review." | slice 7 | |
| C23 | At 30 days after close, the record leaves current review. Scope "At expiry they leave current review"; Key example 4 | slice 7 | |
| C24 | The next authorized session-record publication removes expired record files from the current snapshot and keeps live records. Scope; Key example 4 | slice 8 | |
| C25 | An expired, pruned record can still be recovered from earlier Git snapshots. Scope "Earlier Git snapshots retain them."; Key example 4 | slice 8 | |
