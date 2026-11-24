// What a Start session request names when it follows up an entry in Recently
// done (`./followUpContext.ts` composes the context): the source it follows
// up, a retained session or a done story at the revision the page showed it,
// optionally a file and line on that story's comparison, and, once the server
// resolved it at admission, the context text it sends
// (`../server/followUpAdmission.ts`). A page names only the source; one
// carrying context text or attached note versions is refused. The source,
// never the text or the revision a story was shown at, belongs to the
// launch's identity (`./launchRequest.ts`). A story may ask to attach its
// waiting notes (`notes: true`); admission reads them from the store.

import { z } from "zod";
import { commitShaPattern } from "./authenticatedReadRules.ts";
import { objectIdSchema, reviewedPathSchema } from "./storyReviewFiles.ts";
import {
  sessionHostSchema,
  sessionKey,
  type SessionReference,
} from "./sessionReference.ts";

const followUpSessionSchema = z.strictObject({
  host: sessionHostSchema,
  sessionId: z.string().min(1).max(200),
});

// Optional file anchor on a done story: the comparison the diff shows and,
// when given, one line and its side. Exactly one of completion or reference
// names the comparison; baseline and tree are that file's own endpoints.
const followUpFileSchema = z
  .strictObject({
    path: reviewedPathSchema,
    oldPath: reviewedPathSchema.optional(),
    baseline: objectIdSchema,
    tree: objectIdSchema,
    completion: objectIdSchema.optional(),
    reference: z.uuid().optional(),
    line: z.number().int().positive().optional(),
    side: z.enum(["old", "new"]).optional(),
  })
  .superRefine((file, ctx) => {
    if ((file.completion === undefined) === (file.reference === undefined))
      ctx.addIssue({
        code: "custom",
        message: "A file anchor names a published completion or a landed run.",
        path: ["completion"],
      });
    if ((file.line === undefined) !== (file.side === undefined))
      ctx.addIssue({
        code: "custom",
        message: "A line anchor names both the line and its side.",
        path: ["line"],
      });
  });

const followUpStorySchema = z.strictObject({
  identity: z.string().min(1).max(200),
  // The published revision whose done record the page showed.
  revision: z.string().regex(commitShaPattern),
  file: followUpFileSchema.optional(),
  // Optional retained sessions, resolved against the story at admission.
  sessions: z.array(followUpSessionSchema).optional(),
  // Attach waiting notes from the machine store at admission.
  notes: z.literal(true).optional(),
});

// A story follow-up keeps the framed message, including its current request.
// A string is context that precedes the separately assembled instruction.
const resolvedContext = z
  .union([z.string().min(1), z.strictObject({ message: z.string().min(1) })])
  .optional();

// Versions admission attached, kept so delivery can mark those versions sent.
const attachedNotes = z
  .array(
    z.strictObject({
      id: z.uuid(),
      version: z.string().min(1),
    }),
  )
  .optional();

export const followUpSchema = z.union([
  // One retained session of the project.
  z.strictObject({ session: followUpSessionSchema, context: resolvedContext }),
  // One done story of the project, with the sessions its card holds.
  z.strictObject({
    story: followUpStorySchema,
    context: resolvedContext,
    notes: attachedNotes,
  }),
]);

export type FollowUp = z.infer<typeof followUpSchema>;
export type FollowUpFile = NonNullable<
  z.infer<typeof followUpStorySchema>["file"]
>;
export type AttachedStoryNote = NonNullable<
  Extract<FollowUp, { story: unknown }>["notes"]
>[number];

// The source a follow-up names, as the request carries it from the page.
export type FollowUpSource =
  | { readonly session: z.infer<typeof followUpSessionSchema> }
  | { readonly story: z.infer<typeof followUpStorySchema> };

// The source and attachment choices identify a Start. A set of sessions
// has the same identity in any order or with duplicate references.
export function followUpSourceKey(followUp: FollowUpSource): string {
  if ("session" in followUp) return `session ${sessionKey(followUp.session)}`;
  const { identity, file, notes, sessions } = followUp.story;
  const anchor = file && [
    file.path,
    file.oldPath,
    file.baseline,
    file.tree,
    file.completion,
    file.reference,
    file.line,
    file.side,
  ];
  return JSON.stringify([
    "story",
    identity,
    anchor,
    notes === true,
    [...new Set(sessions?.map(sessionKey))].sort(),
  ]);
}

// Whether two requests follow up the same source, or neither follows up.
export function sameFollowUpSource(
  a: FollowUpSource | undefined,
  b: FollowUpSource | undefined,
): boolean {
  if (a === undefined || b === undefined) return a === b;
  return followUpSourceKey(a) === followUpSourceKey(b);
}

export function followUpSourceAttaching(
  source: FollowUpSource | undefined,
  sessions: readonly SessionReference[],
  notes: boolean,
): FollowUpSource | undefined {
  if (source === undefined || !("story" in source)) return source;
  return {
    story: {
      ...source.story,
      ...(sessions.length === 0 ? {} : { sessions: [...sessions] }),
      ...(notes ? { notes: true } : {}),
    },
  };
}
