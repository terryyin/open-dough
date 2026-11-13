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

// The brief status of the retained history at the Done endpoint, when it is
// not simply retained there.
export function doneWallTimeAvailabilityWords(
  availability: DoneWallTimeHistory["availability"],
) {
  switch (availability) {
    case "empty":
      return "No collected history";
    case "outside-retention":
      return "Outside retained history";
    case "uncollected":
      return "Selected landing not collected";
    case "order-unavailable":
      return "Landing order unverified";
    case "retained":
      return undefined;
  }
}

// How another trunk build stands for the Done endpoint when it supplies the
// selected measurement: a reused equivalent or a later build.
export function doneStandInOf(
  history: DoneWallTimeHistory,
  endpoint: string,
): "equivalent" | "later" | undefined {
  for (const entry of history.entries) {
    const provenance =
      entry.kind === "point"
        ? entry.landings.find((landing) => landing.revision === endpoint)
            ?.provenance
        : entry.revision === endpoint && entry.reason !== "pending"
          ? entry.build?.provenance
          : undefined;
    if (provenance === "equivalent" || provenance === "later")
      return provenance;
  }
  return undefined;
}
