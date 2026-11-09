// This machine's landed CI history (`./landedCiHistoryStore.ts`) as Intent's
// CI status reads it (`./intentCiHistoryRead.ts`): one list, oldest first, of
// each measured build once as a point (`./landedCiMeasuredBuilds.ts`) and
// each landing whose resolution is not final yet as a pending gap, with what
// it waits for, at the time the dashboard recorded it. A point stands at its
// build's start. A gap whose CI read named its run or link in a form the page
// does not take is answered without them. Final gaps are kept but not yet
// answered.

import {
  entryDate,
  landedCiGapSchema,
  type LandedCiEntry,
  type LandedCiGap,
} from "../src/landedCiHistory.ts";
import type { ProjectHistory } from "./landedCiHistoryStore.ts";
import { measuredPoints } from "./landedCiMeasuredBuilds.ts";

// Each landing of the history still pending, as a gap.
function pendingGaps(history: ProjectHistory): LandedCiGap[] {
  const gaps: LandedCiGap[] = [];
  for (const { revision, receivedAt, observed } of Object.values(
    history.landings,
  )) {
    if (observed.kind !== "pending") continue;
    const gap = {
      kind: "gap",
      reason: "pending",
      waitsFor: observed.waitsFor,
      revision,
      receivedAt,
    } as const;
    const withRun = landedCiGapSchema.safeParse({ ...gap, ...observed.run });
    const parsed = withRun.success ? withRun : landedCiGapSchema.safeParse(gap);
    if (parsed.success) gaps.push(parsed.data);
  }
  return gaps;
}

// The history's points and pending gaps, oldest first.
export function historyEntries(history: ProjectHistory): LandedCiEntry[] {
  return [...measuredPoints(history), ...pendingGaps(history)].sort(
    (a, b) =>
      Date.parse(entryDate(a)) - Date.parse(entryDate(b)) ||
      a.revision.localeCompare(b.revision),
  );
}
