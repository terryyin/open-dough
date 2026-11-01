// Base CI observed before a new execution start can confirm it.
import { z } from "zod";

// States a developer may confirm (every non-pass). A pass never asks.
export const baseCiStates = ["failed", "running", "unread"] as const;
export type BaseCiState = (typeof baseCiStates)[number];

// What the request names as the judgment the developer confirmed. Transient:
// never recorded.
export const baseCiConfirmationSchema = z.strictObject({
  revision: z.string().min(1),
  state: z.enum(baseCiStates),
});

export type BaseCiConfirmation = z.infer<typeof baseCiConfirmationSchema>;

// What the boundary answers when the origin target's CI is not a pass: the
// judged revision and state to confirm, what the dialog shows, and the run
// reference when the provider gave one.
export const baseCiFoundSchema = z.object({
  kind: z.literal("base-ci"),
  branch: z.string().min(1),
  revision: z.string().min(1),
  subject: z.string().min(1),
  state: z.enum(baseCiStates),
  // How many commits after the judged revision have no result of their own.
  laterWithoutResult: z.number().int().nonnegative(),
  // Why the base could not be read, when `state` is unread.
  reason: z.string().min(1).optional(),
  runUrl: z.url().optional(),
});

export type BaseCiFound = z.infer<typeof baseCiFoundSchema>;
