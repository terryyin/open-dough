# Existing solution and direction

[Active plan](PLAN.md).

## Existing solution and direction

Follow [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
machine-local evidence is separate from published story facts, there is no
server database, and browser storage is disposable. Its
[one representation per responsibility](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
rule gives one note shape across the store, the wire and the page. No North
Star topic or new ADR is warranted: the story review state already set this
shape for local story evidence.

PFE findings and choices:

- **Keeping notes.** Reuse `dashboard/server/machineJsonStore.ts` with a new
  `story-notes.json` beside `story-review-states.json`, by project id and
  story identity, as `server/storyReviewStates.ts` does. Notes have no other
  source, so the store uses the existing `unreadable: "preserve"` choice
  (today only `server/ciFollowUpStore.ts`): a read answers unreadable and a
  write refuses, leaving the file. Its refusal message names CI follow-up;
  change it to name the file's own store.
- **Requests.** Change `server/projectConfigurationBoundary.ts` to route one
  more same-origin endpoint, `/__project-configuration/story-notes?id=<project>`,
  shaped like the review-state one: GET answers the project's notes by story
  identity, POST carries one change (add, edit or delete) and answers the
  same. The request names a project and an identity, never a path.
- **Page state.** Add a page/project owner modeled on
  `src/storyReviewStates.ts`: one read per project, read again at the shared
  check interval, a change shown at once from its own answer, an older answer
  never replacing a newer one. Its failed-save rule is the model for "says so
  and keeps what was shown".
- **Diff entry points.** Change the existing owners: `StoryReviewFileHeader.tsx`
  holds the file-level action beside `StoryFileFollowUp`;
  `DiffLineNumber.tsx` is the one line menu; `StoryReviewFileDiff.tsx` decides
  whether a diff has line menus (`canLineFollow`) and mounts the line's
  dialog. `IntentFileReading.tsx` renders the same header and `FileDiff`, so
  Intent → Changed tests follows without its own implementation.
- **Context.** Reuse `fileFollowUpParts` in `StoryAnchoredFollowUp.tsx` for
  the path, old path, endpoints and the Published completion or landed run
  name; a workspace comparison adds its own name. A note's context is this
  one shape whichever diff it came from. The follow-up admission that
  verifies an anchor against published history is not reused: a note is the
  developer's words about what the page showed, also for workspace trees no
  server can verify later.
- **Dictation.** Reuse `useLaunchInstruction` (`src/LaunchInstruction.tsx`),
  which already drives recording, transcription, setup and the over-limit
  transcript review for one text field in one dialog. Its two status
  sentences end “before Start”; parameterize those words. A note's text
  therefore takes the same 4,000-character bound as a session instruction.
- **Dialogs.** Reuse the native `<dialog>` pattern of `LaunchDialog.tsx` and
  the in-place confirmation of `StoryReviewStateAction.tsx` for Delete. No
  Side panel kind is added: `pageSidePanel.ts` shows one item at a time, and
  notes must not detach a terminal or remount a review.

Gap: no product concept holds developer-authored text per story. Add it as
`storyNote` (contract and schema shared by server and page), the server
store, the page owner, and one `StoryNotes` control with its dialog.

Expected edits to files near the 250-line check, with their owners:

| File | Lines | Decision |
| --- | --- | --- |
| `dashboard/src/IntentFileReading.tsx` | 244 | Not edited. The view a note was taken in reaches the composer through a context Intent provides from a smaller owner (for example `IntentSelectionReading`), defaulting to Review changes. This provider is owned by slice 5 when the shared actions first appear. |
| `dashboard/src/StoryReview.tsx` | 247 | Not edited. The review's **Notes** control goes in `StoryReviewHeading.tsx` (36). |
| `dashboard/server/machineJsonStore.ts` | 235 | One message change, no growth. |
| `dashboard/src/StoryReviewDiffLines.tsx` | 219 | Slice 5 passes the line's text through the existing menu; if it would pass 250, move the menu state (`openMenu`, `lineMenu`) to its own module in that slice, callers `StoryReviewContextGap.tsx` and `diffLineItems` unchanged in behavior. |
| `dashboard/tests/support/voicePage.ts` | 228 | Slice 8 adds note-dialog helpers in a new support module, not here. |

## Current decisions

- One dialog, `Story notes`, with a list and a composer; from a diff it opens
  on the composer and closes on saving. The mockup's in-panel notes view is
  not followed (seed UI).
- A note is `{ id, text, savedAt, editedAt?, context? }`; `context` is
  `{ view, path, oldPath?, comparison: { name, baseline, tree }, line?: {
  number, side, text } }`. `view` is “Review changes” or “Intent → Changed
  tests”. The server assigns `id` and the times.
- Note text is trimmed, non-empty, and at most 4,000 characters, checked by
  the page and the server. The reason is the reused dictation review and a
  bounded machine document, not a product limit on thinking.
- Comparison names: “Published completion”, “Landed run”, and for a workspace
  review the words its Comparison switch shows.
- An unreadable notes file is never moved aside. Cards say “The notes could
  not be read.” in place of a count, and saving says it could not be saved.
- The plan holds eight slices, the limit. If execution has to split, the
  delivered boundary is after slice 6: Notes from the review and Intent, and
  dictation, move together.
- Words: **Notes**, **Story notes**, **Add note**, **Edit note**, **Save
  note**, **Edit**, **Delete**, “The note could not be saved.”, “Note saved
  to this story.”, “Note updated.”, “Note deleted.”
