// The commits a Default main session made in its checkout, kept with its
// launch record when the session is marked done: read from the checkout's
// local Git log from the launch to Done. Each run is an uninterrupted series
// of session commits, kept as a fixed pair in the checkout's common Git
// repository and held there by references, as a landing is
// (`./launchLanding.ts`). Local evidence only, never a story fact.

import { z } from "zod";
import { commitIdSchema } from "./launchLanding.ts";

// One run's comparison: its first commit's first parent to its last commit.
export const sessionCommitRunSchema = z.object({
  base: commitIdSchema,
  revision: commitIdSchema,
});
export type SessionCommitRun = z.infer<typeof sessionCommitRunSchema>;

// A kept run as a review offers it: how many commits it holds, and its last
// commit's subject and time.
export const sessionRunChoiceSchema = z.object({
  commits: z.number().int().positive(),
  subject: z.string(),
  committedAt: z.iso.datetime(),
  baseline: commitIdSchema,
  tree: commitIdSchema,
});
export type SessionRunChoice = z.infer<typeof sessionRunChoiceSchema>;

export const sessionCommitsSchema = z.object({
  // The checkout's common Git repository, which holds the kept pairs.
  repository: z.string().min(1),
  // Oldest first.
  runs: z.array(sessionCommitRunSchema),
  // Whether another session worked in the same checkout meanwhile.
  shared: z.boolean().optional(),
  // The original checkout switched branches without identifying its new branch.
  branchEntryMissing: z.literal(true).optional(),
  readAt: z.iso.datetime(),
});
export type SessionCommits = z.infer<typeof sessionCommitsSchema>;

// A capture can answer the current Done only if it was read for that mark.
export function sessionCommitsAtDone({
  sessionCommits,
  doneAt,
}: {
  readonly sessionCommits?: SessionCommits | undefined;
  readonly doneAt?: string | undefined;
}): SessionCommits | undefined {
  return doneAt !== undefined &&
    sessionCommits !== undefined &&
    Date.parse(sessionCommits.readAt) >= Date.parse(doneAt)
    ? sessionCommits
    : undefined;
}
