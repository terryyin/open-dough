// Wall-time eligibility and projection use the same retained snapshot as the
// existing points/gaps. Published declared proof, not cumulative test timing,
// establishes completeness. No persistence or acquisition belongs here.
import { z } from "zod";
import {
  priorBuildReferenceOf,
  type PriorBuildSample,
} from "../src/ciPriorBuildReference.ts";
import { historyWallTimeMs } from "../src/landedCiHistory.ts";
import { gapReasonWords } from "../src/ciHistoryGapWords.ts";
import { historyEntries } from "./landedCiHistoryEntries.ts";
import type { KeptBuild, ProjectHistory } from "./landedCiHistoryStore.ts";

const measuredDateSchema = z.iso.datetime({ offset: true });

export function wallTimeReadingOf(build: KeptBuild | undefined): {
  readonly ms?: number;
  readonly reason?: string;
} {
  if (build === undefined) return { reason: "Measured build is not retained" };
  if (build.state !== "pass") return { reason: "Failed build" };
  const ms = historyWallTimeMs(build.startedAt, build.completedAt);
  if (ms === undefined)
    return { reason: "CI wall time bounds are not recorded or invalid" };
  const proof = build.proof;
  if (proof === undefined)
    return {
      reason: build.proofPending
        ? "CI proof is pending"
        : "Validated CI proof summary is not retained",
    };
  if (proof.kind !== "summary")
    return { reason: `CI proof unavailable: ${proof.reason}` };
  if (proof.summary.entries.length === 0)
    return { reason: "Declared CI proof summary is empty" };
  if (
    proof.summary.entries.some(
      (entry) =>
        entry.evidence.length === 0 ||
        entry.evidence.some((unit) => unit.parts.length === 0),
    )
  )
    return { reason: "Declared CI proof part is missing" };
  const parts = proof.summary.entries.flatMap((entry) =>
    entry.evidence.flatMap((unit) => unit.parts),
  );
  if (parts.some((part) => part.status === "ambiguous"))
    return { reason: "Declared CI proof part is ambiguous" };
  if (parts.length === 0 || parts.some((part) => part.status === "missing"))
    return { reason: "Declared CI proof part is missing" };
  return { ms };
}

// An exact published endpoint can be supplied by Done/scoped consumers. The
// default is the latest represented landing in the retained trunk order.
export function wallTimeReferenceOf(
  history: ProjectHistory,
  endpoint?: string,
  order: readonly string[] | undefined = history.trunkOrder,
) {
  const landings = Object.values(history.landings);
  const resolvedEndpoint =
    endpoint ??
    order?.findLast((revision) =>
      landings.some((landing) => landing.revision === revision),
    );
  if (resolvedEndpoint === undefined) return undefined;
  const selected = landings.find(
    (landing) => landing.revision === resolvedEndpoint,
  );
  const selectedKey =
    selected?.observed.kind === "build"
      ? selected.observed.build
      : selected === undefined
        ? undefined
        : `landing/${resolvedEndpoint}`;
  const byBuild = new Map<string, PriorBuildSample>();
  const gaps = historyEntries(history).filter((entry) => entry.kind === "gap");
  for (const landing of landings) {
    const observed = landing.observed;
    if (observed.kind !== "build") {
      const gap = gaps.find((entry) => entry.revision === landing.revision);
      byBuild.set(`landing/${landing.revision}`, {
        key: `landing/${landing.revision}`,
        date: landing.receivedAt,
        landings: [landing.revision],
        reason:
          gap === undefined
            ? "Landing measurement unavailable"
            : gapReasonWords(gap),
      });
      continue;
    }
    const build = history.builds[observed.build];
    const existing = byBuild.get(observed.build);
    const measuredDate = measuredDateSchema.safeParse(build?.startedAt);
    byBuild.set(observed.build, {
      key: observed.build,
      date: measuredDate.success ? measuredDate.data : landing.receivedAt,
      landings: [...(existing?.landings ?? []), landing.revision],
      ...(build === undefined ? {} : { revision: build.revision }),
      ...(observed.selection === "ancestor"
        ? { reason: "Unsupported ancestor build selection" }
        : wallTimeReadingOf(build)),
    });
  }
  return priorBuildReferenceOf({
    endpoint: resolvedEndpoint,
    order,
    ...(selectedKey === undefined ? {} : { selectedKey }),
    samples: [...byBuild.values()],
  });
}
