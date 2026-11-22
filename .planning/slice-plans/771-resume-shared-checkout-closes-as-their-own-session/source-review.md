# Source review for SEED-418#resume-shared-checkout-closes-as-their-own-session

Launch: a fresh general-purpose Claude Code subagent (no conversation
inheritance) at the first delegation of plan 771 execution, 2026-11-22. Input:
the story section's Goal and Scope verbatim, and the plan's correction input
(`## Findings` and `## Outcome and preserved promises`, including **Excluded**)
copied to a file it alone read. It read no other project file and changed
nothing; it returned the numbered promises below with unnumbered context
(fault causes per finding, design notes, the exclusions, ADR 0008 baseline).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | "A developer or agent who resumes or closes a Land session in a shared checkout gets that session's own record." With two Default main launches in one `(workspace, branch)`, a later launch does not make the earlier session's resume or close resolve as the other session. "two closes in one checkout each resume their own close." (Goal; Outcome; Preserved promises; Finding 1) | slice 2 | observed: Distribution/tests/skills/dough-land/session-close-shared-launches-resume.test.mjs "two launches' closes interrupted in one checkout each resume as their own session" (records under A's and B's references) and "a close naming neither open launch is refused even with an unclosed native session" |
| 2 | Closing or clearing one shared-checkout session's landing expectation does not remove another open session's expectation ("clearing either removes both" is the fault). (Finding 1; Goal) | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/first-landing-expectation.test.mjs "launches sharing a workspace and branch each keep their own open expectation"; resolve-publication-landing-context.test.mjs "publication omitting its landing context names no launch while two share the checkout…" |
| 3 | The Land resume guidance names the identity a resume needs, so that a resume following it gets that session's own close. (Scope; Finding 1) | slice 2 | observed: Distribution/src/skills/dough-land/references/publish-reviewed-checkout.md#publish-a-session-close names a Dashboard launch's own landingContext; Distribution/tests/skills/dough-land/session-close-shared-launches-resume.test.mjs resumes with exactly those inputs |
| 4 | When a resumed close in a shared checkout runs, it neither rebuilds the range nor pushes accepted work again. (Preserved promises) | slice 2 | observed: Distribution/tests/skills/dough-land/session-close-shared-launches-resume.test.mjs first case: accepted pushes are exactly [workA, workB, recordA, recordB] and ranges trunk..A, A..B |
| 5 | A shared-checkout note that cannot be written does not make a kept launch read as unrecorded; launch verification does not answer "This machine's launch records could not be written…" for a recorded, running session. (Goal; Outcome; Finding 2) | slice 4 | |
| 6 | A shared-checkout note that cannot be written or read (for example, a torn note) does not block a later launch, meaning a later keep in that checkout. (Goal; Finding 2) | slice 4 | |
| 7 | A shared-checkout note that cannot be read does not block a close: `publishSessionClose` does not throw before the push. (Goal; Finding 2) | slice 3 | observed: Distribution/tests/skills/dough-land/session-record-publication.test.mjs "a close whose shared-checkout note is torn publishes its range marked" (red before: SyntaxError before push) |
| 8 | "Each session's local close state has one owner." Land close state shares the execution-session-evidence store rather than repeating its Git-path resolution and read/ENOENT/write code. (Goal; Scope; Outcome; Finding 3; Exclusions) | slice 5 | |
| 9 | Local close state "is removed once its record is published." After publication, `open-dough/session-close/<sessionId>.json` no longer exists. (Goal; Outcome; Finding 3) | slice 6 | |
| 10 | The published uncertainty value is owned by the record contract (`session-record.mjs`), not the local-note module; `publishedSessionReview.ts` reads a published record without importing local-note code. (Scope; Finding 5) | slice 7 | |
| 11 | "the Dashboard notes when overlap began beside each affected open launch, including later-opening overlap." (Preserved promises) | slice 4 | |
| 12 | "the publisher marks ranges accepted at or after that start." (Preserved promises) | slice 3 | observed: Distribution/tests/skills/dough-land/session-record-publication.test.mjs "a close noted as sharing its checkout publishes its range marked…"; Distribution/tests/skills/dough-land/session-close-shared-checkout-resume.test.mjs "two closes interrupted in one checkout each resume…" |
| 13 | "unmarked records stay readable." (Preserved promises) | slice 7 | |
| 14 | "the published review shows the existing Done warning" for a marked record. (Preserved promises) | slice 7 | |
| 15 | "no mark for an isolated worktree." (Preserved promises) | slice 3 | observed: dashboard/backend-tests/review/shared-checkout-note.spec.ts "a launch in an isolated worktree notes no overlap…" (no note written, so the publisher marks nothing) |
| 16 | "no mark for … an earlier-closed session." (Preserved promises) | slice 3 | observed: Distribution/tests/skills/dough-land/session-record-publication.test.mjs "a close noted as sharing its checkout only after its acceptance publishes its range unmarked"; shared-checkout-note.spec.ts "a launch done in Default main before another opened there gets no note" |
| 17 | "no mark for … a native close." (Preserved promises) | slice 3 | observed: Distribution/tests/skills/dough-land/session-close-shared-checkout-resume.test.mjs: the native close's range is unmarked |
| 18 | "no mark for … an older installation." (Preserved promises) | slice 3 | observed: inspection: only the installed publisher's sharedCheckoutNote (session-close-identity.mjs) reads a note; an older installation's publisher has no note reader, so its ranges carry no mark, and this story changes nothing an older installation runs; Distribution/tests/skills/dough-land/session-record-publication.test.mjs "a Dashboard-launched Land publishes the session record…" shows the no-note result unmarked |
| 19 | "concise Land and wrap-up guidance." (Preserved promises) | slice 2 | observed: publish-reviewed-checkout.md resume paragraph: one clause changed, same length |
| 20 | "expectations, notes and close state stay local; only the mark is published." (Preserved promises, ADR 0008) | slice 7 | |
