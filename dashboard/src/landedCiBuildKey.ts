// The retained attempt identity shared by collection and local reading.
import type { BaseCiRunIdentity } from "./baseCiConfirmation.ts";
import type { LandedCiEntry } from "./landedCiHistory.ts";
export function buildKeyOf(
  build: BaseCiRunIdentity & { readonly revision: string },
) {
  if (build.adapterAttempt !== undefined)
    return `adapter/${JSON.stringify([String(build.adapterAttempt.runId), String(build.adapterAttempt.attemptId), build.revision])}`;
  if (build.runId !== undefined && build.runAttempt !== undefined)
    return `run/${String(build.runId)}/${String(build.runAttempt)}`;
  return `revision/${build.revision}`;
}

export function runAttemptOfBuildKey(key: string) {
  const match = /^run\/(\d+)\/(\d+)$/.exec(key);
  if (match?.[1] === undefined || match[2] === undefined) return undefined;
  return { runId: Number(match[1]), runAttempt: Number(match[2]) };
}

// The reference sample a history entry stands for, by its key: its measured
// attempt, or a gap's landing or the build named for it.
export function evidenceOfEntry<Sample extends { readonly key: string }>(
  entry: LandedCiEntry,
  samples: readonly Sample[],
): Sample | undefined {
  const keys =
    entry.kind === "point"
      ? [buildKeyOf(entry)]
      : [
          `landing/${entry.revision}`,
          ...(entry.reason !== "pending" && entry.build !== undefined
            ? [buildKeyOf(entry.build)]
            : []),
        ];
  return samples.find((sample) => keys.includes(sample.key));
}
