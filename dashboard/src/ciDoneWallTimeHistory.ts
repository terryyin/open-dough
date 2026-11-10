// Collected wall time through the exact represented Done publication, separate
// from the measured attempt and the project's latest represented endpoint.
import { z } from "zod";
import { ciScopeHistorySchema } from "./ciScopeHistory.ts";
import {
  landedCiHistorySchema,
  type MeasuredHistory,
} from "./landedCiHistory.ts";
import { commitIdSchema } from "./launchLanding.ts";

export const ciDoneWallTimeHistorySchema = landedCiHistorySchema.extend({
  selectedRevision: commitIdSchema,
  availability: ciScopeHistorySchema.shape.availability,
});
export type DoneWallTimeHistory = MeasuredHistory &
  Pick<
    z.infer<typeof ciDoneWallTimeHistorySchema>,
    "selectedRevision" | "availability"
  >;

export function doneWallTimeAvailabilityWords(
  availability: DoneWallTimeHistory["availability"],
) {
  switch (availability) {
    case "empty":
      return "No dashboard-recorded landing history has been collected.";
    case "outside-retention":
      return "The selected landing is outside the retained history. Its historical comparison is unavailable.";
    case "uncollected":
      return "The selected landing has no matching collected observation; independently verified earlier retained evidence is shown.";
    case "order-unavailable":
      return "Some retained landing positions could not be verified from local Git evidence. Only independently verified preceding builds can supply the reference.";
    case "retained":
      return undefined;
  }
}
