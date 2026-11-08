// Pre-admission answers for a launch request: matching live work, recoverable
// ad hoc continuation, follow-up context resolution, and writer/pre-acceptance
// checks. Deferred starts and refused context reads abandon attachment claims.

import {
  laterAttempt,
  needsReconciliation,
  type Acceptance,
  type AgentLaunchRequest,
  type AttemptObservation,
} from "../src/agentLaunch.ts";
import { sameLaunch } from "../src/launchRequest.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { withFollowUpContext } from "./followUpAdmission.ts";
import {
  abandonAttachmentClaims,
  answerWithoutAttachmentClaims,
  withClaimAttachmentDigests,
} from "./launchAttachmentClaims.ts";
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
  // Digests from claim bytes identify images before claims are consumed, so
  // sameLaunch matches a wire Start to a retained attempt by content.
  const identified = withClaimAttachmentDigests(request);
  const claims = identified.attachmentClaims;
  // A matching live launch is answered before its evidence can be mistaken
  // for a retry. Settled recoverable session starts reuse locked continuation.
  const submitted = owner.submitted(identified);
  if (submitted !== undefined)
    return answerWithoutAttachmentClaims(claims, () => submitted);
  if (identified.workflow === "ad-hoc") {
    const { attempts } = await owner.attempts();
    const retained = attempts
      .filter((attempt) => sameLaunch(attempt.request, identified))
      .reduce<AttemptObservation | undefined>(laterAttempt, undefined);
    if (
      retained !== undefined &&
      (needsReconciliation(retained) ||
        (identified.followUp !== undefined && retained.running))
    ) {
      return answerWithoutAttachmentClaims(claims, () =>
        continueRequest(retained.id),
      );
    }
  }
  // A matching attempt already keeps its context. Resolve only the request
  // that would otherwise be accepted as a new attempt.
  let resolved: AgentLaunchRequest;
  try {
    resolved = await withFollowUpContext(identified, source);
  } catch (error) {
    abandonAttachmentClaims(claims);
    throw error;
  }
  const blocked = await replacementWriterBlock(source, resolved);
  if (blocked !== undefined)
    return answerWithoutAttachmentClaims(claims, () => blocked);
  const answer = await preAcceptanceAnswer(source, resolved);
  if (answer !== undefined)
    return answerWithoutAttachmentClaims(claims, () => answer);
  return owner.accept(resolved, run, reportingOrigin);
}
