// Words for attaching waiting story notes on a Done follow-up
// (`./AttachStoryNotes.tsx`). Request shaping lives in `./followUpRequest.ts`.

export const attachStoryNotesLabel = "Attach story notes";
export const attachStoryNotesNone = "No waiting notes";
export const attachStoryNotesDetail = (waiting: number, total: number) =>
  `${waiting} waiting of ${total} notes`;
