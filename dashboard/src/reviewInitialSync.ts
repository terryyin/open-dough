import { z } from "zod";
import { commitIdSchema } from "./launchLanding.ts";

export const reviewInitialSyncEndpoint = "/__review-initial-sync";

export const reviewInitialSyncStatusSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("idle") }),
  z.object({ kind: z.literal("running") }),
  z.object({ kind: z.literal("ready"), revision: commitIdSchema }),
  z.object({ kind: z.literal("failed"), problem: z.string().min(1) }),
]);

export type ReviewInitialSyncStatus = z.infer<
  typeof reviewInitialSyncStatusSchema
>;
