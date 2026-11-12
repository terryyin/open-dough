// Only background production collection may spend an admitted receipt.
import { spendRepeat } from "./ciFollowUpAdmission.ts";
import { updateRepeat, retainRepeatAssessment } from "./ciFollowUpRetention.ts";
import { landingCompletesStory } from "./completedStoryCapture.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { ciConfiguration } from "./baseCiJudgment.ts";
import { projectFolder } from "./projectFolders.ts";
import { projectEnvironment } from "./projectConfiguration.ts";
import type { ProjectHistory } from "./landedCiHistoryStore.ts";
import { keptLandingReferences } from "./landedCiHistoryStore.ts";
import { repeatDecisionOf } from "./ciFollowUpDecision.ts";
import {
  configuredRepeatProvider,
  retainedRepeatProvider,
} from "./ciFollowUpProvider.ts";
import { followUpKey, readFollowUps } from "./ciFollowUpStore.ts";

export async function collectCiFollowUps(
  source: PublishedSource,
  history: ProjectHistory,
  signal: AbortSignal,
): Promise<void> {
  if (projectEnvironment() !== "production") return;
  const ended = () => signal.aborted;
  const held = await readFollowUps();
  if (held.kind !== "document") return;
  // Already spent requests stay observable after chart pruning.
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
    const outcome = await retainedRepeatProvider(source, request).observe(
      request,
      signal,
    );
    if (ended()) return;
    await updateRepeat(key, (current) =>
      current.outcome.settled === true ||
      ["slow", "recovered"].includes(current.outcome.kind)
        ? current
        : { ...current, outcome },
    );
  }
  const configuration = ciConfiguration(projectFolder(source).path);
  const provider = configuredRepeatProvider(source, configuration);
  if (provider === undefined) return;
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
    try {
      const request = await provider.prepare(decision, signal);
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
      const submission = await provider.submit(request, signal);
      const { explanation } = submission;
      await updateRepeat(key, (saved) => ({
        ...saved,
        submission,
        outcome: { kind: "unverified", explanation },
      }));
    } catch {
      // Failed reads admit nothing. A spent intent can only be observed later.
      if (!ended())
        await retainRepeatAssessment(key, {
          ...decision,
          explanation: provider.preparationFailure,
        });
    }
  }
}
