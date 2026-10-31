// Pre-admission answers for a launch request: matching live work, recoverable
// ad hoc continuation, and writer/pre-acceptance refusals abandon attachment
// claims so a deferred Start leaves no claim files.

import {
  laterAttempt,
  needsReconciliation,
  type Acceptance,
  type AgentLaunchRequest,
  type AttemptObservation,
} from "../src/agentLaunch.ts";
import { sameLaunch } from "../src/launchRequest.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { answerWithoutAttachmentClaims } from "./launchAttachmentClaims.ts";
import type { LaunchAttemptOwner } from "./launchAttemptOwner.ts";
import {
  preAcceptanceAnswer,
  replacementWriterBlock,
} from "./launchPreAcceptance.ts";
import type { AttemptRun } from "./launchAttemptSettlement.ts";

export async function acceptLaunchRequest(
  owner: LaunchAttemptOwner,
  source: PublishedSource,
  request: AgentLaunchRequest,
  run: AttemptRun,
  continueRequest: (id: string) => Promise<Acceptance>,
  reportingOrigin?: string,
): Promise<Acceptance> {
  const claims = request.attachmentClaims;
  // A matching live launch is answered before its evidence can be mistaken
  // for a retry. Settled recoverable session starts reuse locked continuation.
  const submitted = owner.submitted(request);
  if (submitted !== undefined)
    return answerWithoutAttachmentClaims(claims, () => submitted);
  if (request.workflow === "ad-hoc") {
    const { attempts } = await owner.attempts();
    const retained = attempts
      .filter((attempt) => sameLaunch(attempt.request, request))
      .reduce<AttemptObservation | undefined>(laterAttempt, undefined);
    if (retained !== undefined && needsReconciliation(retained)) {
      return answerWithoutAttachmentClaims(claims, () =>
        continueRequest(retained.id),
      );
    }
  }
  const blocked = await replacementWriterBlock(source, request);
  if (blocked !== undefined)
    return answerWithoutAttachmentClaims(claims, () => blocked);
  const answer = await preAcceptanceAnswer(source, request);
  if (answer !== undefined)
    return answerWithoutAttachmentClaims(claims, () => answer);
  return owner.accept(request, run, reportingOrigin);
}
