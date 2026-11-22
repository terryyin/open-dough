// What a shared-checkout note is: the Dashboard's local note, beside a launch's
// landing context, that another session was open in the same checkout since
// `since`. Its file name, shape and the range mark it yields have one owner
// here. No filesystem, Git, or Node-only imports, so the publisher and the
// Dashboard share it. The note stays local; only the mark on a published range
// is published.

// The note's file name, in the launch's reporting directory beside
// landing-context.json.
const sharedCheckoutNoteFileName = "shared-checkout.json";

// The mark a published range carries when its comparison may include another
// session's work from the same checkout.
export const sharedCheckoutUncertainty = "shared-checkout";

// The note's path beside the landing context file at `landingContextPath`.
export function sharedCheckoutNotePathBeside(landingContextPath) {
  const slash = landingContextPath.lastIndexOf("/");
  return `${slash < 0 ? "" : landingContextPath.slice(0, slash + 1)}${sharedCheckoutNoteFileName}`;
}

// The note's parsed `{ since }` from its text, or undefined when it names no
// valid time.
export function parseSharedCheckoutNote(text) {
  const since = JSON.parse(text)?.since;
  return typeof since === "string" && !Number.isNaN(Date.parse(since))
    ? { since }
    : undefined;
}

// The mark for a range accepted at `acceptedAt` under `note`: shared-checkout
// when accepted at or after the note's `since`, otherwise none.
export function rangeUncertainty(note, acceptedAt) {
  return note && Date.parse(acceptedAt) >= Date.parse(note.since)
    ? sharedCheckoutUncertainty
    : undefined;
}
