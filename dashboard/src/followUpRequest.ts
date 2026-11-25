// What a Start session request names when it follows up an entry in Recently
// done (`./followUpContext.ts` composes the context): the source it follows
// up, a retained session or a done story at the revision the page showed it,
// optionally a reviewed comparison or its file and line, and, once the server
// resolved it at admission, the context text it sends
// (`../server/followUpAdmission.ts`). A page names only the source; one
// carrying context text or attached note versions is refused. The source,
// never the text or the revision a story was shown at, belongs to the
// launch's identity (`./launchRequest.ts`). A story may ask to attach its
// waiting notes (`notes: true`); admission reads them from the store.

import { z } from "zod";
import { commitShaPattern } from "./authenticatedReadRules.ts";
import { publishedSessionIdSchema } from "./publishedSessionRecord.ts";
import { objectIdSchema, reviewedPathSchema } from "./storyReviewFiles.ts";
import { sessionHostSchema, sessionKey } from "./sessionReference.ts";

const followUpSessionSchema = z.strictObject({
  host: sessionHostSchema,
  sessionId: z.string().min(1).max(200),
});

const followUpSessionChoiceSchema = z.union([
  followUpSessionSchema,
  z.strictObject({ published: publishedSessionIdSchema }),
]);

export type FollowUpSessionChoice = z.infer<typeof followUpSessionChoiceSchema>;

export const followUpSessionKey = (choice: FollowUpSessionChoice) =>
  "published" in choice ? `published:${choice.published}` : sessionKey(choice);

// Optional file anchor on a done story: the comparison the diff shows and,
// when given, one line and its side. Exactly one identifier names the
// comparison. Baseline and tree are the file's own endpoints.
const pairFields = {
  baseline: objectIdSchema,
  tree: objectIdSchema,
};

const followUpComparisonSchema = z.strictObject({
  ...pairFields,
  completion: objectIdSchema,
});
const followUpFileSchema = z
  .strictObject({
    path: reviewedPathSchema,
    oldPath: reviewedPathSchema.optional(),
    ...pairFields,
    completion: objectIdSchema.optional(),
    reference: z.uuid().optional(),
    published: publishedSessionIdSchema.optional(),
    line: z.number().int().positive().optional(),
    side: z.enum(["old", "new"]).optional(),
  })
  .superRefine((file, ctx) => {
    if (
      [file.completion, file.reference, file.published].filter(Boolean)
        .length !== 1
    )
      ctx.addIssue({
        code: "custom",
        message:
          "A file anchor names a published completion, landed run or published session.",
        path: ["completion"],
      });
    if ((file.line === undefined) !== (file.side === undefined))
      ctx.addIssue({
        code: "custom",
        message: "A line anchor names both the line and its side.",
        path: ["line"],
      });
  });

const followUpStorySchema = z
  .strictObject({
    identity: z.string().min(1).max(200),
    // The published revision whose story the page showed.
    revision: z.string().regex(commitShaPattern),
    status: z.literal("taken").optional(),
    file: followUpFileSchema.optional(),
    comparison: followUpComparisonSchema.optional(),
    // Optional sessions, resolved against the story at admission.
    sessions: z.array(followUpSessionChoiceSchema).optional(),
    // Attach waiting notes from the machine store at admission.
    notes: z.literal(true).optional(),
  })
  .refine(
    ({ file, comparison }) => file === undefined || comparison === undefined,
    {
      message: "A follow-up names the whole comparison or one of its files.",
    },
  );

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

// The canonical identity verified at server admission and kept on the attempt.
const boundStory = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[^\r\n]*$/)
  .optional();

export const followUpSchema = z.union([
  // One retained session of the project.
  z.strictObject({
    session: followUpSessionSchema,
    context: resolvedContext,
    storyIdentity: boundStory,
  }),
  // One published story of the project, with the sessions its card holds.
  z.strictObject({
    story: followUpStorySchema,
    context: resolvedContext,
    notes: attachedNotes,
    storyIdentity: boundStory,
  }),
]);

export type FollowUp = z.infer<typeof followUpSchema>;
export type FollowUpFile = NonNullable<
  z.infer<typeof followUpStorySchema>["file"]
>;
export type FollowUpComparison = z.infer<typeof followUpComparisonSchema>;
export type FollowUpTarget = FollowUpFile | FollowUpComparison;
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
  const { identity, file, comparison, notes, sessions } = followUp.story;
  const anchor = file && [
    file.path,
    file.oldPath,
    file.baseline,
    file.tree,
    file.completion,
    file.reference,
    file.published,
    file.line,
    file.side,
  ];
  return JSON.stringify([
    "story",
    identity,
    anchor ??
      (comparison && [
        comparison.completion,
        comparison.baseline,
        comparison.tree,
      ]),
    notes === true,
    [...new Set(sessions?.map(followUpSessionKey))].sort(),
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
  sessions: readonly FollowUpSessionChoice[],
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
