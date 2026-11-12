// A project's trigger admits work; discover and proof provide its evidence.
import { requestCommandRebuild } from "../../src/skills/dough-execute-plan/scripts/ci-command-attempt.mjs";
import type { PublishedSource } from "../src/publishedSource.ts";
import { ciConfiguration } from "./baseCiJudgment.ts";
import { discoverAdapterAttempts } from "./baseCiAdapterAttempts.ts";
import { ciAdapterTimeoutMs } from "./ciAdapterTimeout.ts";
import { wallTimeReadingOf } from "./ciWallTimeReference.ts";
import { followUpRule } from "./ciFollowUpStore.ts";
import type { RepeatProvider } from "./ciFollowUpProvider.ts";
import { observeAdapterRepeat } from "./ciFollowUpAdapterObservation.ts";

export function adapterRepeatProvider(
  source: PublishedSource,
  folder: string,
  adapter?: readonly string[],
  rebuild?: readonly string[],
): RepeatProvider {
  return {
    preparationFailure:
      "Original CI attempt evidence could not be read; automatic repeat is unverified",
    async prepare(decision, signal) {
      const { original, reference } = decision;
      const identity = original.adapterAttempt;
      if (
        identity === undefined ||
        identity.ambiguous ||
        adapter === undefined ||
        wallTimeReadingOf(original).ms === undefined
      )
        return "The original exact adapter attempt or complete proof is unavailable";
      const runs = await discoverAdapterAttempts(
        source,
        source.ref,
        folder,
        adapter,
        signal,
        { comparison: true },
      );
      const matches = runs.filter(
        (run) =>
          run.adapterAttempt?.runId === identity.runId &&
          run.adapterAttempt.attemptId === identity.attemptId,
      );
      const [run] = matches;
      if (
        matches.length !== 1 ||
        run === undefined ||
        run.adapterAttempt?.ambiguous ||
        run.headSha !== original.revision ||
        run.status !== "completed" ||
        run.conclusion !== "success" ||
        Date.parse(run.startedAt ?? "") !==
          Date.parse(original.startedAt ?? "") ||
        Date.parse(run.completedAt ?? "") !==
          Date.parse(original.completedAt ?? "")
      )
        return "Exact original attempt identity or timing bounds are inconsistent; automatic repeat is unverified";
      return {
        provider: "adapter",
        repository: source.repository,
        branch: source.ref,
        ...(run.check === undefined ? {} : { check: run.check }),
        ...(run.context === undefined ? {} : { context: run.context }),
        original,
        reference,
        rule: followUpRule,
        requestedAt: new Date().toISOString(),
        submission: { kind: "intent" },
        outcome: {
          kind: "unverified",
          explanation:
            "Request intent was saved; submission acceptance is unverified and will not be resent",
        },
      };
    },
    async submit(request, signal) {
      if (
        request.provider !== "adapter" ||
        request.original.adapterAttempt === undefined ||
        rebuild === undefined
      )
        throw new Error("The custom CI rebuild request is unavailable");
      const submission = await requestCommandRebuild(
        rebuild,
        { repo: request.repository, branch: request.branch },
        { ...request.original.adapterAttempt, sha: request.original.revision },
        { signal, cwd: folder, timeoutMs: ciAdapterTimeoutMs() },
      );
      const explanation =
        submission.result === "accepted"
          ? "Full repeat accepted; no later CI attempt has been observed"
          : `${submission.result === "refused" ? "CI repeat request refused" : "Request acceptance is uncertain"}: ${submission.reason}; it will not be resent`;
      return {
        kind: submission.result,
        explanation,
        ...(submission.result === "accepted"
          ? { attempt: submission.attempt }
          : {}),
      };
    },
    async observe(request, signal) {
      if (request.provider !== "adapter")
        throw new Error("Expected a custom CI repeat request");
      return observeAdapterRepeat(
        source,
        folder,
        ciConfiguration(folder).adapter,
        request,
        signal,
      );
    },
  };
}
