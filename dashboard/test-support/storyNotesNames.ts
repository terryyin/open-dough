// Story notes control names, roles, selectors and announcement text, named
// once for the Playwright page object (support/storyNotesPage.ts) and the
// mounted one (mounted-dashboard/mountedStoryNotesPage.ts). Imports neither
// engine.
export const storyNotesNames = {
  dialog: "Story notes",
  field: "Note text",
  savedNotes: "Saved notes",
  add: "Add note",
  save: "Save note",
  close: "Close",
  cancel: "Cancel",
  edit: "Edit",
  editHeading: "Edit note",
  delete: "Delete",
  deleteQuestion: "Delete this note?",
  saved: "Note saved to this story.",
  // The dialog's announcement, and a saved entry's note text.
  announcement: ".launch-dialog-body > [role='status']",
  noteText: ".story-note-text",
  // The card's notes control: "Notes", or "Notes (n)" with a count.
  control: /^Notes(?: \(\d+\))?$/,
  counted: /^Notes \(/,
  count: (count: number) => (count ? `Notes (${count})` : "Notes"),
  // Matches exactly `text`, for a note's text.
  exactly: (text: string) =>
    new RegExp(`^${text.replace(/[.*+?^$|()[\]{}\\]/g, "\\$&")}$`),
};
