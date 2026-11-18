import { z } from "zod";

export const sessionBranchRun = "branch-result";
export const sessionDeliveryRun = "delivered";
export const sessionComparisonKeySchema = z.union([
  z.literal(sessionBranchRun),
  z.literal(sessionDeliveryRun),
  z.string().regex(/^\d+$/),
]);
export type SessionComparisonKey = z.infer<typeof sessionComparisonKeySchema>;

export const branchResultName = "Branch at Done";
export const deliveredChangesName = "Delivered to trunk";
