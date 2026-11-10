// A displayed attempt links to that observation, never a mutable latest run.
import type { BaseCiRunIdentity } from "./baseCiConfirmation.ts";
import type { CiAdapterProofAttempt } from "./ciProof.ts";
import { runUrlSchema } from "./landedCiHistory.ts";

// A provider run's mutable latest URL never stands for a retained attempt.
export function exactAttemptUrl(
  repository: string,
  runId: number | undefined,
  attempt: number | undefined,
  url: string | undefined,
): string | undefined {
  if (runId === undefined || attempt === undefined || url === undefined)
    return undefined;
  if (!runUrlSchema.safeParse(url).success) return undefined;
  const parsed = new URL(url);
  const base = `/${repository}/actions/runs/${runId}`;
  if (
    parsed.protocol !== "https:" ||
    parsed.hostname !== "github.com" ||
    (parsed.pathname !== base &&
      parsed.pathname !== `${base}/attempts/${attempt}`)
  )
    return undefined;
  return `https://github.com${base}/attempts/${attempt}`;
}

// Numeric GitHub subjects use the same safe canonical link as retained pairs.
// Adapter and other provider URLs retain their existing read contract.
export function observedAttemptUrl(
  run: (BaseCiRunIdentity | CiAdapterProofAttempt) & {
    readonly runUrl?: string | undefined;
  },
): string | undefined {
  const url = run.runUrl;
  if (url === undefined) return undefined;
  if ("attemptId" in run) return url;
  if (
    run.adapterAttempt !== undefined ||
    run.runId === undefined ||
    run.runAttempt === undefined
  )
    return url;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  if (parsed.hostname !== "github.com") return url;
  const repository =
    /^\/([^/]+\/[^/]+)\/actions\/runs\/\d+(?:\/attempts\/\d+)?$/.exec(
      parsed.pathname,
    )?.[1];
  return repository === undefined
    ? undefined
    : exactAttemptUrl(repository, run.runId, run.runAttempt, url);
}
