import { shortSha } from "../src/baseCiWording.ts";
import type {
  CiComparisonRange,
  SelectedCiComparisonAnswer,
} from "../src/selectedCiComparison.ts";
import type { StoryCiComparisonSlot } from "../src/storyCiComparison.ts";
import { judgeAttempt } from "./baseCiRevisionAttempt.ts";
import { nearestRevisionBuild } from "./baseCiRevisionNearest.ts";
import { newestRunFor } from "./baseCiNearest.ts";
import type { ComparisonBuildSource } from "./comparisonBuildSource.ts";
import { asComparisonSlot, gapFromUnread } from "./intentCiComparisonSlots.ts";
import { requestedRevisionCiStatus } from "./requestedRevisionCiStatus.ts";
import { asSlot } from "./revisionBuildSlot.ts";
import type { StoryCiComparisonSource } from "./storyCiComparisonSource.ts";

const missingBaseline =
  "No completed CI build was found at or before the selected start.";
const missingSelection = "No completed CI build includes the selected changes.";

export async function performSelectedComparison(
  source: StoryCiComparisonSource,
  projectId: string,
  identity: string,
  range: CiComparisonRange,
  checkedAt: string,
): Promise<SelectedCiComparisonAnswer> {
  const reading = { source: projectId, identity, range, checkedAt };
  const published = await source.publishedEndpoints(identity);
  const phase = published.kind === "absent" ? "taken" : "done";
  const endpoints =
    published.kind === "absent"
      ? await source.takenEndpoints(identity)
      : published;
  if (endpoints.kind !== "facts")
    return {
      ...reading,
      kind: "unavailable",
      explanation:
        endpoints.kind === "unavailable"
          ? endpoints.explanation
          : `${identity} has no published completion record or Taken claim.`,
    };

  const context = await source.buildsFor(endpoints.facts.branch);
  if ("unavailable" in context)
    return {
      ...reading,
      kind: "unavailable",
      explanation: context.unavailable,
    };
  if ("judgment" in context) {
    const gap = gapFromUnread(context.judgment);
    return {
      ...reading,
      kind: "selection",
      phase,
      baseline: gap,
      selection: gap,
    };
  }
  const { builds } = context;
  const [baseline, selection] = await Promise.all([
    selectedSlot(range.start, builds, missingBaseline),
    selectedSlot(range.end, builds, missingSelection, range.start),
  ]);
  return { ...reading, kind: "selection", phase, baseline, selection };
}

async function selectedSlot(
  requested: string,
  source: ComparisonBuildSource,
  missing: string,
  exclusiveStart?: string,
): Promise<StoryCiComparisonSlot> {
  try {
    // Read the complete available chain to establish the boundary before
    // listing builds. A shallow or unrelated chain cannot admit an end build.
    const history = await source.history.firstParents(requested, Infinity);
    if (history[0] !== requested) {
      return {
        kind: "unavailable",
        explanation: `The selected revision ${shortSha(requested)} could not be read as a commit.`,
      };
    }
    const startIndex =
      exclusiveStart === undefined
        ? history.length
        : history.indexOf(exclusiveStart);
    if (startIndex < 0)
      return {
        kind: "unavailable",
        explanation:
          "The selected start could not be found in the end's first-parent history.",
      };
    if (startIndex === 0) return { kind: "none", explanation: missing };

    const build = await nearestRevisionBuild(
      history,
      source.lookup,
      exclusiveStart,
      {
        preferCompletedAncestor: true,
        preferCompletedAtRevision: true,
      },
    );
    const requestedRuns =
      build?.revision === requested
        ? undefined
        : await source.lookup.listRunsAt(requested);
    const newest = requestedRuns && newestRunFor(requestedRuns, requested);
    const status =
      requestedRuns === undefined ||
      judgeAttempt(newest?.status, newest?.conclusion) === "running"
        ? undefined
        : await requestedRevisionCiStatus(
            requested,
            requestedRuns,
            build?.state === "running" ? undefined : build?.revision,
            source.history,
            source.workflow,
          );
    return await asComparisonSlot(
      asSlot(build, missing, status),
      source.lookup,
    );
  } catch (error) {
    return {
      kind: "unavailable",
      explanation:
        error instanceof Error
          ? error.message
          : `CI for selected revision ${shortSha(requested)} could not be read.`,
    };
  }
}
