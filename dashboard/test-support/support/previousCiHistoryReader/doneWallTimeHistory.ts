// Frozen previous deployed Done wall-time reader from Open Dough 92574ccd3:
// it asked `intent=ci-history&gap-reasons=timing-basis&revision&through` and
// accepted the answer only as this rich shape, with the selected endpoint and
// the reference's membership. Only supporting imports are relocated to the
// unchanged shared validators in dashboard/src.
import { z } from "zod";
import { runIdentityShape } from "../../../src/baseCiConfirmation.ts";
import { commitIdSchema } from "../../../src/launchLanding.ts";
import { priorBuildReferenceSchema } from "./priorBuildReference.ts";

const instantSchema = z.iso.datetime({ offset: true });
const provenance = z.enum(["exact", "equivalent", "later"]);
const runShape = {
  runUrl: z.url({ protocol: /^https?$/ }).optional(),
  ...runIdentityShape,
};
const landingShape = {
  revision: commitIdSchema,
  receivedAt: instantSchema,
  identity: z.string().min(1).optional(),
};

const entrySchema = z.union([
  z.object({
    kind: z.literal("point"),
    revision: commitIdSchema,
    ...runShape,
    startedAt: instantSchema,
    completedAt: instantSchema,
    landings: z.array(z.object({ ...landingShape, provenance })).min(1),
  }),
  z.object({
    kind: z.literal("gap"),
    reason: z.literal("pending"),
    waitsFor: z.enum(["run", "build", "later-build", "proof", "read", "order"]),
    ...landingShape,
    ...runShape,
  }),
  z.object({
    kind: z.literal("gap"),
    reason: z.enum([
      "failed",
      "cancelled",
      "no-build",
      "no-equivalent",
      "no-proof",
      "expired",
      "unreadable",
      "not-recorded",
      "timing-basis",
      "unclassified",
      "identity",
    ]),
    explanation: z.string().min(1).optional(),
    ...landingShape,
    build: z
      .object({ revision: commitIdSchema, provenance, ...runShape })
      .optional(),
  }),
]);

export const doneWallTimeHistorySchema = z.object({
  reference: priorBuildReferenceSchema.optional(),
  entries: z.array(entrySchema),
  selectedRevision: commitIdSchema,
  availability: z.enum([
    "retained",
    "empty",
    "outside-retention",
    "uncollected",
    "order-unavailable",
  ]),
});

export type PreviousDoneWallTimeHistory = z.infer<
  typeof doneWallTimeHistorySchema
>;

// What the previous Done reader accepted for `revision`, undefined when it
// reported an answer it did not understand.
export function previousDoneWallTimeHistoryOf(
  body: unknown,
  revision: string,
): PreviousDoneWallTimeHistory | undefined {
  const parsed = doneWallTimeHistorySchema.safeParse(body);
  if (
    !parsed.success ||
    parsed.data.selectedRevision !== revision ||
    parsed.data.reference?.endpoint !== revision ||
    parsed.data.entries.some(
      (entry) =>
        entry.kind === "point" &&
        Date.parse(entry.completedAt) < Date.parse(entry.startedAt),
    )
  )
    return undefined;
  return parsed.data;
}
