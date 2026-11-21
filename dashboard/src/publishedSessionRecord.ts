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
  // Exactly one recorded pair: the page reviews one comparison. A several-
  // range record is skipped as malformed (plan 747 widens run selection).
  ranges: z.tuple([z.object({ base: commitSchema, candidate: commitSchema })]),
});

export type PublishedSessionRecord = z.infer<
  typeof publishedSessionRecordSchema
>;
