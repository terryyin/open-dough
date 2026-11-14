// GitHub owns the exact-attempt reads and its full workflow rerun request.
import { repeatGitHubWorkflow } from "../../Distribution/src/skills/dough-execute-plan/scripts/ci-github-actions.mjs";
import type { PublishedSource } from "../src/publishedSource.ts";
import { observeRepeat } from "./ciFollowUpObservation.ts";
import { prepareCiRepeat } from "./ciFollowUpRequest.ts";
import type { RepeatProvider } from "./ciFollowUpProvider.ts";

export function githubRepeatProvider(
  source: PublishedSource,
  workflow: string,
): RepeatProvider {
  return {
    preparationFailure:
      "Original workflow or attempt evidence could not be read; automatic repeat is unverified",
    prepare: (decision, signal) =>
      prepareCiRepeat(source, workflow, decision, signal),
    async submit(request, signal) {
      if (request.provider !== "github")
        throw new Error("Expected a GitHub repeat request");
      const runId = request.original.runId;
      if (runId === undefined)
        throw new Error("The original run identity is incomplete");
      const submission = await repeatGitHubWorkflow(
        { repository: request.repository, runId },
        signal,
      );
      const explanation =
        submission.kind === "accepted"
          ? "Full repeat accepted; no later CI attempt has been observed"
          : `${submission.kind === "refused" ? "CI repeat request refused" : "Request acceptance is uncertain"}: ${submission.reason}${submission.status === undefined ? "" : ` (HTTP ${submission.status})`}`;
      return { kind: submission.kind, explanation };
    },
    observe: (request, signal) => {
      if (request.provider !== "github")
        throw new Error("Expected a GitHub repeat request");
      return observeRepeat(source, request, signal);
    },
  };
}
