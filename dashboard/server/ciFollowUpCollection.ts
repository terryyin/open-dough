// Only background production collection may spend an admitted receipt.
import { spendRepeat } from "./ciFollowUpAdmission.ts";
import { updateRepeat, retainRepeatAssessment } from "./ciFollowUpRetention.ts";
import { landingCompletesStory } from "./completedStoryCapture.ts";
import { repeatGitHubWorkflow } from "../../src/skills/dough-execute-plan/scripts/ci-github-actions.mjs";
import type { PublishedSource } from "../src/publishedSource.ts";
import { ciConfiguration } from "./baseCiJudgment.ts";
import { projectFolder } from "./projectFolders.ts";
import { projectEnvironment } from "./projectConfiguration.ts";
import type { ProjectHistory } from "./landedCiHistoryStore.ts";
import { keptLandingReferences } from "./landedCiHistoryStore.ts";
import { repeatDecisionOf } from "./ciFollowUpDecision.ts";
import { observeRepeat } from "./ciFollowUpObservation.ts";
import { prepareCiRepeat } from "./ciFollowUpRequest.ts";
import {
  followUpKey,
  hasRepeatAuthority,
  readFollowUps,
} from "./ciFollowUpStore.ts";

export async function collectCiFollowUps(
  source: PublishedSource,
  history: ProjectHistory,
  signal: AbortSignal,
): Promise<void> {
  if (projectEnvironment() !== "production") return;
  const ended = () => signal.aborted;
  const held = await readFollowUps();
  if (held.kind !== "document") return;
  // Already spent requests stay observable after disablement and chart pruning.
  for (const [key, landing] of Object.entries(held.document.landings)) {
    const request = landing.request;
    if (
      landing.project !== source.id ||
      request === undefined ||
      request.outcome.settled === true ||
      ["slow", "recovered"].includes(request.outcome.kind) ||
      request.submission.kind === "refused"
    )
      continue;
    const outcome = await observeRepeat(source, request, signal);
    if (ended()) return;
    await updateRepeat(key, (current) =>
      current.outcome.settled === true ||
      ["slow", "recovered"].includes(current.outcome.kind)
        ? current
        : { ...current, outcome },
    );
  }
  if (!hasRepeatAuthority(held.document, source.id)) return;
  const configuration = ciConfiguration(projectFolder(source).path);
  if (configuration.adapter !== undefined) return;
  for (const landing of keptLandingReferences(history)) {
    if (ended()) return;
    if (landing.target !== `refs/heads/${source.ref}`) continue;
    const key = followUpKey(source.id, landing);
    const admitted = held.document.landings[key];
    if (
      admitted?.eligible !== true ||
      admitted.request !== undefined ||
      !admitted.receipts.includes(landing.receipt)
    )
      continue;
    const decision = repeatDecisionOf(history, landing.receipt);
    if (
      decision === undefined ||
      admitted.capture === undefined ||
      landing.identity === undefined
    )
      continue;
    if (
      (await landingCompletesStory(
        source,
        landing.identity,
        admitted.capture,
        { remote: admitted.capture.remote, target: source.ref },
        signal,
      )) !== "matched"
    )
      continue;
    const { original } = decision;
    const runId = original.runId,
      attempt = original.runAttempt;
    if (runId === undefined || attempt === undefined) continue;
    try {
      const request = await prepareCiRepeat(
        source,
        configuration.workflow,
        decision,
        signal,
      );
      if (typeof request === "string") {
        await retainRepeatAssessment(key, {
          ...decision,
          explanation: request,
        });
        continue;
      }
      if (!(await spendRepeat(source.id, landing, request))) continue;
      // An interruption here deliberately spends the allowance without sending.
      if (ended()) return;
      const submission = await repeatGitHubWorkflow(
        { repository: request.repository, runId },
        signal,
      );
      const explanation =
        submission.kind === "accepted"
          ? "Full repeat accepted; no later CI attempt has been observed"
          : `${submission.kind === "refused" ? "CI repeat request refused" : "Request acceptance is uncertain"}: ${submission.reason}${submission.status === undefined ? "" : ` (HTTP ${submission.status})`}`;
      await updateRepeat(key, (saved) => ({
        ...saved,
        submission: { kind: submission.kind, explanation },
        outcome: { kind: "unverified", explanation },
      }));
    } catch {
      // Failed reads admit nothing. A spent intent can only be observed later.
      if (!ended())
        await retainRepeatAssessment(key, {
          ...decision,
          explanation:
            "Original workflow or attempt evidence could not be read; automatic repeat is unverified",
        });
    }
  }
}
