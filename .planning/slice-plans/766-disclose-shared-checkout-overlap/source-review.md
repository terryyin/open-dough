# Source review for SEED-418#disclose-shared-checkout-overlap

The coordinator launched a fresh general-purpose reviewer on 2026-11-22 with
no conversation inheritance. Its only input was the story's Goal, Scope and
Key examples from the seed; it was told to read no files and change nothing.
The launch input and returned commitments are in this execution's Claude Code
conversation (the source-only review agent launch and its final report).

Unnumbered context: the Goal's reason (no misattribution); the existing
`checkoutSharedMeanwhile` baseline; the field being optional; ADR 0008 as the
reason launch records stay local; unpublished edits already outside the range
(settled, nothing added); no per-session attribution inside a shared checkout;
no landing context means no overlap evidence.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | When another session opens in a session's checkout, the Dashboard records when the overlap began next to that open session's landing context, also when the overlap starts after the session launched. (Scope 1; Example 2) | slice 3 | |
| 2 | At close, the publisher marks each published range accepted at or after the overlap start with `uncertainty: "shared-checkout"`, taking the overlap start only from the Dashboard's note; ranges accepted before it stay unmarked. (Scope 2; Scope 1) | slice 1 | observed: Distribution/tests/skills/dough-land/session-record-publication.test.mjs "a close noted as sharing its checkout publishes its range marked…" (since 60s before close → marked, read from origin main) and "…only after its acceptance publishes its range unmarked" (since after → unmarked); session-close-resume.test.mjs resumed case marks a range accepted exactly at since; run s1-focused-3 |
| 3 | On another machine, the published-session review shows a marked range with the existing Done warning: "Another session was open in the same checkout during that time, so the comparison may include that session's work." (Scope 3; Goal; Examples 1 and 2) | slice 2 | observed: e2e/sessions/recently-done-published-sessions.spec.ts "Recently done warns that another machine's published session may include a shared checkout's work": a record published through publishSessionClose with a shared-checkout note, opened on a machine with no launch, shows the shared Done sentence (owner sharedCheckoutWarning); published-session-ranges.spec.ts marked range returns session.shared; runs refactor2-3, refactor2-4 |
| 4 | Records and ranges without the mark, including those from installations that predate the note, stay readable in the review and show no warning. (Scope 2; Scope 6) | slice 2 | observed: e2e/sessions/recently-done-published-sessions.spec.ts shared-checkout test: an unmarked close without a landing context (as an older installation publishes) shows its file and no warning; dashboard/backend-tests/review/published-session-ranges.spec.ts unmarked first range of a record with a marked second range has no session.shared; runs refactor2-3, refactor2-4 |
| 5 | A session that never shared its checkout (a follow-up in its own worktree, or a Default main session that closed before another opened there) publishes no mark and shows no warning. (Example 3) | slice 3 | |
| 6 | A close without a Dashboard landing context publishes no mark. (Scope 6) | slice 1 | observed: Distribution/tests/skills/dough-land/session-close-resume.test.mjs native-session lost-work-result case compares the whole published record bytes with no mark; run s1-focused-3 |
| 7 | Only the uncertainty mark is published; launch records stay local. (Scope 4) | slice 1 | observed: session-record-publication.test.mjs marked case asserts the whole published record equals version, sessionId, workflow, closedAt and the marked range only (no since or launch data); the note stays in the reporting directory; run coord-1 |
| 8 | The published comparison still leaves out commits the checkout received only by pull. (Scope 5; Example 1) | slice 1 | observed: session-record-publication.test.mjs marked case with pulledBeforeOneUnpublishedEdit: published range diff lists only edited.txt and pulled.txt exists at the range base; run s1-focused-3 |
