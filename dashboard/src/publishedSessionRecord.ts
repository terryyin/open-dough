// A session's published close record, validated at the read boundary against
// the workflow's one record contract
// (../../Distribution/src/skills/dough-execute-plan/scripts/session-record-publication.mjs).
// Only the fields the review reads are typed; the UUID names the session.
import { z } from "zod";

const commitSchema = z.string().regex(/^[0-9a-f]{40,64}$/);

export const publishedSessionRecordSchema = z.object({
  version: z.literal(1),
  sessionId: z.uuid(),
  workflow: z.string().min(1),
  closedAt: z.iso.datetime(),
  ranges: z
    .array(z.object({ base: commitSchema, candidate: commitSchema }))
    .min(1),
});

export type PublishedSessionRecord = z.infer<
  typeof publishedSessionRecordSchema
>;
