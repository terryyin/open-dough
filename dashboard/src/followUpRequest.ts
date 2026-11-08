// What a Start session request names when it follows up an entry in Recently
// done (`./followUpContext.ts` composes the context): the source it follows
// up, a retained session or a done story at the revision the page showed it,
// and, once the server resolved it at admission, the context text it sends
// (`../server/agentLaunchAdmission.ts`). A page names only the source; one
// carrying context text is refused. The source, never the text or the
// revision a story was shown at, belongs to the launch's identity
// (`./launchRequest.ts`).

import { z } from "zod";
import { commitShaPattern } from "./authenticatedReadRules.ts";
import { sessionHostSchema, sessionKey } from "./sessionReference.ts";

const followUpSessionSchema = z.strictObject({
  host: sessionHostSchema,
  sessionId: z.string().min(1).max(200),
});

const followUpStorySchema = z.strictObject({
  identity: z.string().min(1).max(200),
  // The published revision whose done record the page showed.
  revision: z.string().regex(commitShaPattern),
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

// The source a follow-up names, as the request carries it from the page.
export type FollowUpSource =
  | { readonly session: z.infer<typeof followUpSessionSchema> }
  | { readonly story: z.infer<typeof followUpStorySchema> };

// The one spelling of a follow-up's source, for identity and attempt keys.
export function followUpSourceKey(followUp: FollowUpSource): string {
  return "session" in followUp
    ? `session ${sessionKey(followUp.session)}`
    : `story ${followUp.story.identity}`;
}

// Whether two requests follow up the same source, or neither follows up.
export function sameFollowUpSource(
  a: FollowUpSource | undefined,
  b: FollowUpSource | undefined,
): boolean {
  if (a === undefined || b === undefined) return a === b;
  return followUpSourceKey(a) === followUpSourceKey(b);
}
