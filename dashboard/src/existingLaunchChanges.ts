// Default-checkout changes observed before a launch can confirm them.
import { z } from "zod";
import { existingChangesSchema } from "./launchRequest.ts";

// Report changed paths (never their content), their count, and the fingerprint
// a confirmation names. The path list is bounded while the count stays exact.
export const existingChangesShown = 50;

export const existingChangesFoundSchema = z.object({
  kind: z.literal("existing-changes"),
  paths: z.array(z.string().min(1)).max(existingChangesShown),
  count: z.number().int().positive(),
  fingerprint: existingChangesSchema,
});

export type ExistingChangesFound = z.infer<typeof existingChangesFoundSchema>;
