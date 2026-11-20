# Source review for SEED-413#optimization-candidates-revision-cases

The coordinator launched a fresh general-purpose reviewer, with no inherited
conversation, on 2026-11-20. Its only input was the selected story section
(Goal, Scope, Key examples and exclusions) copied to a job-local file. It was
asked to read no other project files and change nothing. The launch input and
returned commitments are in this execution's Claude Code conversation.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | When a newer revision is offered, Optimization Candidates stays the chosen view and the record still reads `Recorded at revision <before>` with entry `launch-records-poll-waits`. (Goal; Scope "Preserve each distinct assertion"; key example *Stays chosen and reads the new record*, first half) | slice 1 | observed: dashboard/frontend-tests/intent/intent-candidates-revision.spec.ts, "stays chosen…" case: after offerRevision(after) and the notice, isChosen, isRecordedAt(before), shows launch-records-poll-waits |
| 2 | After **Show latest**, the view stays chosen, the record reads `Recorded at revision <after>` with entry `launch-records-page-clock`, and the old entry is gone. (Goal; Scope "Preserve…"; key example *Stays chosen…*, second half) | slice 1 | observed: same case after notice.showLatest(): isChosen, isRecordedAt(after), shows launch-records-page-clock, lacks launch-records-poll-waits; discriminated by a pinned-revision scratch edit (evidence s1-discriminate.log) |
| 3 | While the new read is held, the record reads `Recorded at revision <after>` and `Reading Test Optimization Candidates…`, with no failure. (Scope "Preserve…"; key example *The old read departs*) | slice 2 | |
| 4 | An old read at `before` still outstanding at **Show latest** ends with its abort, as the page's own read does; no failure and no old entry show, and once the new read is released the new entry shows. (Scope "Preserve…" and "two ways"; key example *The old read departs*) | slice 2 | |
| 5 | An old read that ignores its abort and answers with the old record after the new entry shows leaves the record at `after` with the new entry alone and no failure. (Scope "two ways"; key example *A late old answer*) | slice 2 | |
| 6 | The cases are plain Vitest cases on mounted Chromium with typed replies, mounting the real `ProjectIntentReading` on Optimization Candidates with typed locations and record replies, offering the revision by rerendering with the newly published work; a case observing a pending read holds its own deferred reply. (Goal; Scope) | slice 2 | |
| 7 | Both cases of `intent-test-optimization-candidates-revision.spec.ts` move out of the built-app spec. (Scope "Move both cases"; Goal) | slice 2 | |
| 8 | No test-support wrappers are added. (Scope) | slice 2 | |
| 9 | Each `dashboard/test-support/` export or module whose last consumer is the moved spec is retired. (Scope) | slice 2 | |
| 10 | The focused selection is compared before and after the move. (Scope limits) | slice 2 | |
