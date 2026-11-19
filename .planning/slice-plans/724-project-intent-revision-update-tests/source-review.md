# Source review for SEED-413 Project Intent revision update

The coordinator launched a fresh general-purpose reviewer on 2026-11-19 with no
conversation inheritance. Its only input was the story's title, lead
paragraph, Goal, Scope, later-family exclusion and Key examples from
[the seed](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-remaining-dashboard-frontend-unit-tests).
It was told to read no files and change nothing. The launch input and the
returned commitments are in this execution's Claude Code conversation.

Unnumbered context returned: this is the second frontend family; the later
families own the campaign timing target, project and perspective switches,
planning-only return, Optimization Candidates, other frontend folders and
runner retirement; the Goal's "offered, applied or retried" summarizes C10–C20.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | The five revision-apply cases exist as typed, direct Vitest Browser Mode cases in Chromium of the production perspective. (Scope with Goal) | slice 5 | |
| C2 | The five built-app cases are removed from the built-app suite after replacement. (Scope) | slice 5 | |
| C3 | Published inputs and service answers are built with MakeMe. (Scope) | slice 1 | observed: `dashboard/frontend-tests/intent/intent-revision-apply.mounted.spec.ts`, `workAt`, `source` and `publishedReadService` build the published work, source, locations, CI judgment and history with `makeMe` from `pageMakeMe.mjs`. |
| C4 | The cases drive the real production perspective, reading state and clients, and substitute only the local authenticated read service's answers. (Scope, Goal) | slice 1 | observed: `dashboard/frontend-tests/intent/intent-revision-apply.mounted.spec.ts`, `Reading` mounts production `IntentPerspective` in `StorySelectionProvider`, `IntentPageProviders` and `IntentReadRecovery`; only `authenticatedReadEndpoint` fetches are answered and `service.unexpected` stays empty. |
| C5 | The new cases run and are discovered through the maintained frontend command and appear in the CI proof. (Scope) | slice 5 | |
| C6 | A recorded comparison of the five cases' summed two-worker durations, built app against Vitest Browser Mode, under comparable conditions. (Scope) | slice 5 | |
| C7 | Command elapsed time is recorded separately from the summed case durations. (Scope) | slice 5 | |
| C8 | Zero test-support wrappers are added. (Scope) | slice 5 | |
| C9 | No deleted support still has a consumer. (Scope) | slice 5 | |
| C10 | Two arriving revisions give one polite notice; the old reading and focus stay until the reader asks. Each case keeps its read order, selection, scroll, focus and exact failure wording. (Key example 1, Scope) | slice 1 | observed: `dashboard/frontend-tests/intent/intent-revision-apply.mounted.spec.ts`, "newer revisions wait behind one notice…": after B and C, one `status` notice with `aria-live` polite names `showing <A>`, one Show latest button, focus unchanged, A's source, revision and only A's two reads. |
| C11 | While the answer is held after Show latest, the old source and selection stay. (Key example 1) | slice 1 | observed: same case, with C's locations held: `Updating…`, revision A, A's source, and the feature still pressed. |
| C12 | When the last revision answers, the same file and scroll position remain, the new text appears and focus is on that file. (Key example 1) | slice 1 | observed: same case, after release: C's source, notice gone, revision C, group expanded, feature pressed, `pane.scrollTop` equal to the scrolled offset, feature focused, reads exactly locations and file at C. |
| C13 | The latest revision deleted the selected path; applying it, Purpose names the missing file and revision and the reading pane takes focus. (Key example 2) | slice 2 | |
| C14 | No other source is selected or requested after the deleted path is applied. (Key example 2) | slice 2 | |
| C15 | A failed next locations read keeps the old tree and text when applied and offers Retry. (Key example 3) | slice 3 | |
| C16 | An unreadable settings answer keeps the old tree and text when applied and offers Retry. (Key example 3) | slice 4 | |
| C17 | A successful locations retry applies the revision. (Key example 3) | slice 3 | |
| C18 | A failed new text read for the selected file keeps the retained text and offers its own retry; a successful retry replaces the text. (Key example 3) | slice 3 | |
| C19 | A malformed latest settings answer, when applied, shows the settings explanation and names the new browser revision. (Key example 4) | slice 5 | |
| C20 | Applying malformed settings takes focus into the explanation panel. (Key example 4) | slice 5 | |
