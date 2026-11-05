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

// The branch whose push produced a judged result. A result belongs to its
// commit, so a story branch's judgment may rest on a trunk run of a shared
// ancestor.
const runBranchSchema = z.string().min(1).optional();

// A GitHub Actions run a judged result rests on: its id and attempt, which
// with the result's revision key the run's CI proof read. A ciAdapter's
// results name neither: they name their discovered attempt as
// `adapterAttempt`, kept apart so it is never taken for a GitHub run.
const adapterIdentity = z.union([z.string(), z.number()]);
const adapterAttemptSchema = z.object({
  runId: adapterIdentity,
  attemptId: adapterIdentity,
  // Another discovered attempt names the same `attemptId` at this revision.
  ambiguous: z.literal(true).optional(),
});
export type BaseCiAdapterAttempt = Readonly<
  z.infer<typeof adapterAttemptSchema>
>;
const runIdentitySchema = z.object({
  runId: z.number().int().positive().optional(),
  runAttempt: z.number().int().positive().optional(),
  adapterAttempt: adapterAttemptSchema.optional(),
});
export const runIdentityShape = runIdentitySchema.shape;
export type BaseCiRunIdentity = Readonly<z.infer<typeof runIdentitySchema>>;

// Historical context beside a running judgment; it never confirms the base.
const completedAncestorSchema = z.object({
  revision: z.string().min(1),
  subject: z.string().min(1),
  state: z.enum(["pass", "failed"]),
  runUrl: z.url().optional(),
  runBranch: runBranchSchema,
  ...runIdentityShape,
});
export type BaseCiCompletedAncestor = z.infer<typeof completedAncestorSchema>;

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
  runBranch: runBranchSchema,
  completedAncestor: completedAncestorSchema.optional(),
});

export type BaseCiFound = z.infer<typeof baseCiFoundSchema>;
