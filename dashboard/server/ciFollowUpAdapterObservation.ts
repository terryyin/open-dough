// Only the accepted opaque attempt may supply the custom repeat measurement.
import type { PublishedSource } from "../src/publishedSource.ts";
import { attemptTimingBasis } from "../src/ciAttemptTiming.ts";
import { discoverAdapterAttempts } from "./baseCiAdapterAttempts.ts";
import { collectedProofOf } from "./landedCiCollectedProof.ts";
import { repeatTimingVerdict } from "./ciFollowUpVerdict.ts";
import type { AdapterRepeatRequest } from "./ciFollowUpStore.ts";
import type { KeptBuild } from "./landedCiObservation.ts";

const unverified = (
  explanation: string,
  settled = true,
): AdapterRepeatRequest["outcome"] => ({
  kind: "unverified",
  explanation,
  settled,
});
const declaredParts = (build: KeptBuild): string[] =>
  build.proof?.kind !== "summary"
    ? []
    : build.proof.summary.entries
        .flatMap((entry) =>
          entry.evidence.flatMap((unit) =>
            unit.parts.map((part) =>
              JSON.stringify([entry.path, unit.unit, part.part]),
            ),
          ),
        )
        .sort();

export async function observeAdapterRepeat(
  source: PublishedSource,
  folder: string,
  adapter: readonly string[] | undefined,
  request: AdapterRepeatRequest,
  signal: AbortSignal,
): Promise<AdapterRepeatRequest["outcome"]> {
  if (
    request.submission.kind !== "accepted" ||
    request.submission.attempt === undefined
  )
    return unverified(
      request.submission.explanation ??
        "Request intent was saved; submission acceptance is unverified and will not be resent",
    );
  if (adapter === undefined)
    return unverified(
      "The requested repeat could not be observed; the project's ciAdapter is unavailable",
      false,
    );
  const accepted = request.submission.attempt;
  const original = request.original.adapterAttempt;
  if (
    original === undefined ||
    String(accepted.attemptId) === String(original.attemptId) ||
    accepted.sha !== request.original.revision
  )
    return unverified(
      "The accepted attempt does not identify a distinct repeat of the original revision",
    );
  try {
    const runs = await discoverAdapterAttempts(
      source,
      request.branch,
      folder,
      adapter,
      signal,
      { comparison: true },
    );
    const matches = runs.filter(
      (run) =>
        run.adapterAttempt?.runId === accepted.runId &&
        run.adapterAttempt.attemptId === accepted.attemptId,
    );
    const [run] = matches;
    if (matches.length === 0)
      return unverified(
        "The accepted repeat attempt has not been observed",
        false,
      );
    if (
      matches.length !== 1 ||
      run === undefined ||
      run.adapterAttempt?.ambiguous ||
      run.headSha !== accepted.sha ||
      run.check !== request.check ||
      run.context !== request.context
    )
      return unverified(
        "The observed attempt does not match the original check, context or revision",
      );
    const observed = {
      adapterAttempt: { runId: accepted.runId, attemptId: accepted.attemptId },
      revision: run.headSha,
      ...(run.check === undefined ? {} : { check: run.check }),
      ...(run.context === undefined ? {} : { context: run.context }),
      ...(run.status === undefined ? {} : { status: run.status }),
      ...(run.conclusion === undefined ? {} : { conclusion: run.conclusion }),
      ...(run.url === undefined ? {} : { runUrl: run.url }),
      ...(run.startedAt === undefined ? {} : { startedAt: run.startedAt }),
      ...(run.completedAt === undefined
        ? {}
        : { completedAt: run.completedAt }),
    };
    if (run.status !== "completed")
      return {
        observed,
        kind: "progress",
        explanation: "CI rerun in progress",
      };
    if (run.conclusion !== "success")
      return {
        observed,
        ...unverified(
          `The observed repeat ${run.conclusion === "cancelled" ? "was cancelled" : "failed"}${run.conclusion ? ` (${run.conclusion})` : ""}; timing is unverified`,
        ),
      };
    const start = Date.parse(run.startedAt ?? ""),
      end = Date.parse(run.completedAt ?? "");
    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      end < start ||
      !(start > Date.parse(request.original.completedAt ?? ""))
    )
      return {
        observed,
        ...unverified(
          "Full comparable repeat is unverified: missing or inconsistent attempt timing bounds",
        ),
      };
    const repeat: KeptBuild = {
      revision: accepted.sha,
      state: "pass",
      adapterAttempt: observed.adapterAttempt,
      runBranch: request.branch,
      timingBasis: attemptTimingBasis,
      ...("runUrl" in observed ? { runUrl: observed.runUrl } : {}),
      startedAt: run.startedAt,
      completedAt: run.completedAt,
    };
    const collected = await collectedProofOf(source, repeat, signal);
    const measured = {
      ...repeat,
      proof: collected.proof,
      proofPending: collected.pending,
    };
    const verdict = repeatTimingVerdict(request, measured);
    const repeatedParts = new Set(declaredParts(measured));
    if (
      verdict === undefined ||
      !declaredParts(request.original).every((part) => repeatedParts.has(part))
    )
      return {
        observed,
        repeat: measured,
        ...unverified(
          "Repeat measurement or comparable CI proof is incomplete",
          !collected.pending,
        ),
      };
    return { observed, repeat: measured, settled: true, ...verdict };
  } catch {
    return unverified(
      "The requested repeat could not be observed; timing is unverified",
      false,
    );
  }
}
