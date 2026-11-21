// A session's published close record, validated at the read boundary against
// the workflow's one record contract
// (../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs).
// Only the fields the review reads are typed; the UUID names the session.
// `workflow` stays an open string so later plans can add values.
import { z } from "zod";
import {
  isSessionId,
  sessionRecordVersion,
} from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";

const commitSchema = z.string().regex(/^[0-9a-f]{40,64}$/);

export const publishedSessionRecordSchema = z.object({
  version: z.literal(sessionRecordVersion),
  sessionId: z.string().refine(isSessionId),
  workflow: z.string().min(1),
  closedAt: z.iso.datetime(),
  // The session's ordered recorded pairs; the review selects one by position.
  ranges: z
    .array(z.object({ base: commitSchema, candidate: commitSchema }))
    .min(1),
});

export type PublishedSessionRecord = z.infer<
  typeof publishedSessionRecordSchema
>;
