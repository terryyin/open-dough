// Developer-authored notes kept on the serving machine, by project and story
// identity. Context records what the page showed, without verifying Git trees.
import { z } from "zod";
import { launchInstructionLimit, workIdentitySchema } from "./launchRequest.ts";

export const storyNotesEndpoint = "/__project-configuration/story-notes";
export const storyNoteTextLimit = launchInstructionLimit;
export const storyNoteTextSchema = z
  .string()
  .trim()
  .min(1)
  .max(storyNoteTextLimit);

export const storyNoteContextSchema = z.strictObject({
  view: z.enum(["Review changes", "Intent → Changed tests"]),
  path: z.string().min(1),
  oldPath: z.string().min(1).optional(),
  comparison: z.strictObject({
    name: z.string().min(1),
    baseline: z.string().min(1),
    tree: z.string().min(1),
  }),
  line: z
    .strictObject({
      number: z.number().int().positive(),
      side: z.enum(["old", "new"]),
      text: z.string(),
    })
    .optional(),
});
export type StoryNoteContext = z.infer<typeof storyNoteContextSchema>;

export const storyNoteSchema = z.strictObject({
  id: z.uuid(),
  text: storyNoteTextSchema,
  savedAt: z.iso.datetime(),
  editedAt: z.iso.datetime().optional(),
  delivered: z.iso.datetime().optional(),
  context: storyNoteContextSchema.optional(),
});
export type StoryNote = z.infer<typeof storyNoteSchema>;

/** Server-assigned version a follow-up can deliver: the last edit, else save. */
export const storyNoteVersion = (
  note: Pick<StoryNote, "savedAt" | "editedAt">,
): string => note.editedAt ?? note.savedAt;

/** Waiting when never delivered, or when the current version differs. */
export const storyNoteIsWaiting = (
  note: Pick<StoryNote, "savedAt" | "editedAt" | "delivered">,
): boolean => note.delivered !== storyNoteVersion(note);

export const storyNoteWaitingForFollowUp = "Waiting for follow-up";
export const storyNoteSentToFollowUp = "Sent to follow-up";
export const storyNoteDeliveryLabel = (
  note: Pick<StoryNote, "savedAt" | "editedAt" | "delivered">,
): string =>
  storyNoteIsWaiting(note)
    ? storyNoteWaitingForFollowUp
    : storyNoteSentToFollowUp;

/** Card description while any notes wait for a follow-up. */
export const storyNotesWaitingDescription = (waiting: number): string =>
  waiting === 1 ? "1 note waiting" : `${waiting} notes waiting`;

export const storyNotesAnswerSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("notes"),
    notes: z.record(z.string(), z.array(storyNoteSchema)),
  }),
  z.strictObject({ kind: z.literal("unreadable") }),
]);
export type StoryNotesAnswer = z.infer<typeof storyNotesAnswerSchema>;

export const storyNoteChangeSchema = z.discriminatedUnion("action", [
  z.strictObject({
    identity: workIdentitySchema,
    action: z.literal("add"),
    text: storyNoteTextSchema,
    context: storyNoteContextSchema.optional(),
  }),
  z.strictObject({
    identity: workIdentitySchema,
    action: z.literal("edit"),
    id: z.uuid(),
    text: storyNoteTextSchema,
  }),
  z.strictObject({
    identity: workIdentitySchema,
    action: z.literal("delete"),
    id: z.uuid(),
  }),
]);
export type StoryNoteChange = z.infer<typeof storyNoteChangeSchema>;
