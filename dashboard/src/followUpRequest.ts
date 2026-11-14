// What a Start session request names when it follows up an entry in Recently
// done (`./followUpContext.ts` composes the context): the source it follows
// up, a retained session or a done story at the revision the page showed it,
// optionally a file and line on that story's comparison, and, once the server
// resolved it at admission, the context text it sends
// (`../server/followUpAdmission.ts`). A page names only the source; one
// carrying context text is refused. The source, never the text or the
// revision a story was shown at, belongs to the launch's identity
// (`./launchRequest.ts`).

import { z } from "zod";
import { commitShaPattern } from "./authenticatedReadRules.ts";
import { objectIdSchema, reviewedPathSchema } from "./storyReviewFiles.ts";
import { sessionHostSchema, sessionKey } from "./sessionReference.ts";

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
});

// The context resolved from the records at Start, kept so a retry, a
// recovery or a rebuilt input resends it without reading again.
const resolvedContext = z.string().min(1).optional();

export const followUpSchema = z.union([
  // One retained session of the project.
  z.strictObject({ session: followUpSessionSchema, context: resolvedContext }),
  // One done story of the project, with the sessions its card holds.
  z.strictObject({ story: followUpStorySchema, context: resolvedContext }),
]);

export type FollowUp = z.infer<typeof followUpSchema>;
export type FollowUpFile = NonNullable<
  z.infer<typeof followUpStorySchema>["file"]
>;

// The source a follow-up names, as the request carries it from the page.
export type FollowUpSource =
  | { readonly session: z.infer<typeof followUpSessionSchema> }
  | { readonly story: z.infer<typeof followUpStorySchema> };

function followUpFileKey(file: FollowUpFile): string {
  const comparison =
    file.completion !== undefined
      ? `completion ${file.completion}`
      : `reference ${file.reference}`;
  const rename = file.oldPath === undefined ? "" : ` old ${file.oldPath}`;
  const line =
    file.line === undefined || file.side === undefined
      ? ""
      : ` ${file.side} ${file.line}`;
  return ` file ${file.path}${rename} ${file.baseline} ${file.tree} ${comparison}${line}`;
}

// The one spelling of a follow-up's source, for identity and attempt keys.
export function followUpSourceKey(followUp: FollowUpSource): string {
  if ("session" in followUp) return `session ${sessionKey(followUp.session)}`;
  const file = followUp.story.file;
  return `story ${followUp.story.identity}${file === undefined ? "" : followUpFileKey(file)}`;
}

// Whether two requests follow up the same source, or neither follows up.
export function sameFollowUpSource(
  a: FollowUpSource | undefined,
  b: FollowUpSource | undefined,
): boolean {
  if (a === undefined || b === undefined) return a === b;
  return followUpSourceKey(a) === followUpSourceKey(b);
}
