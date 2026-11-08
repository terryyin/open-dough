// What a Start session request names when it follows up an entry in Recently
// done (`./followUpContext.ts` composes the context): the source it follows
// up, and, once the server resolved it at admission, the context text it
// sends (`../server/agentLaunchAdmission.ts`). A page names only the source;
// one carrying context text is refused. The source, never the text, belongs
// to the launch's identity (`./launchRequest.ts`).

import { z } from "zod";
import { sessionHostSchema, sessionKey } from "./sessionReference.ts";

const followUpSessionSchema = z.strictObject({
  host: sessionHostSchema,
  sessionId: z.string().min(1).max(200),
});

export const followUpSchema = z.strictObject({
  // One retained session of the project.
  session: followUpSessionSchema,
  // The context resolved from the records at Start, kept so a retry, a
  // recovery or a rebuilt input resends it without reading again.
  context: z.string().min(1).optional(),
});

export type FollowUp = z.infer<typeof followUpSchema>;

// The source a follow-up names, as the request carries it from the page.
export type FollowUpSource = Omit<FollowUp, "context">;

// The one spelling of a follow-up's source, for identity and attempt keys.
export function followUpSourceKey(followUp: FollowUpSource): string {
  return `session ${sessionKey(followUp.session)}`;
}

// Whether two requests follow up the same source, or neither follows up.
export function sameFollowUpSource(
  a: FollowUpSource | undefined,
  b: FollowUpSource | undefined,
): boolean {
  if (a === undefined || b === undefined) return a === b;
  return followUpSourceKey(a) === followUpSourceKey(b);
}
