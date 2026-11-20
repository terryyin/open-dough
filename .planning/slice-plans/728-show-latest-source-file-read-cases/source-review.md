# Source review: SEED-413#show-latest-source-file-read-cases

Launch: fresh general-purpose subagent (no fork, no inherited conversation),
2026-11-20, instructed to read no project files and change nothing. Input: the
seed section's title, Goal, Scope (with sub-bullets and scope limits), Key
examples and Effort hypothesis, verbatim, with the source-only reviewer
instructions. No plan, product or proof was supplied.

Unnumbered context returned: the reason (readability, frontend group's
one-minute goal); "Preserve each distinct assertion…" as a summary of 5–10;
scope limits staying in the parent story; effort S.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1a | Both cases of `intent-source-target-recovery.spec.ts` (held then released, failed then retried) become two plain Vitest cases on mounted Chromium with typed inputs, mounting the smallest rendered owner with typed locations, file and Optimization Candidates record replies; the case reaches the source through an Optimization Candidates entry, the record reaching the mount the same typed way as locations and files. | slice 2 | |
| 1b | The built-app case that mounts `<App />`, holds HTTP reads and drives the page clock is gone, taking one more built-app consumer off the frontend group. | slice 2 | |
| 2 | Each case that observes a pending read holds its own deferred reply. | slice 2 | |
| 3 | Add zero test-support wrappers. | slice 2 | |
| 4 | Retire each `dashboard/test-support/` module whose last consumer is the moved spec. | slice 2 | |
| 5 | Held then released, while held: entry's source open at `before`, line 44 targeted, focused, scrolled; newer revision offered and Show latest chosen while its file read is held. The browser shows the new revision, but the source still reads `at revision before` with its old text, line, offset and focus, and no failure. | slice 2 | |
| 6 | Held then released, on release: the source shows the new text at the new revision and keeps line, offset and focus. | slice 2 | |
| 7 | Failed then retried, on failure: the reading shows `<path> could not be read at revision <after>; showing <before>. Retry` and keeps the old text, line, offset and focus. | slice 1 | observed: dashboard/frontend-tests/intent/intent-source-target-recovery-mounted.spec.ts "…failed then retried": failsWith(text) with shows("assert True"), isAt(before), targets(44), isFocused, isScrolledTo(offset) |
| 8 | Failed then retried, on Retry: Retry shows the new text at the new revision, and the failure disappears. | slice 1 | observed: same spec: retryRead() then shows("assert 2 == 2"), isAt(after), targets(44), isScrolledTo(offset), showsNoReadFailure() |
| 9 | Read order at the new revision: locations come first, then the record and the file independently. | slice 2 | |
| 10 | Retry adds exactly one file read. | slice 2 | |
| 11 | The held-read case checks that a revision check keeps the pinned answer at a steady pace; remove that check only after locating its equivalent proof in the auto-refresh cases. | slice 2 | |
| 12 | This story compares the focused selection before and after. | slice 2 | |
