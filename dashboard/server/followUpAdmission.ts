// A new follow-up's context comes from a retained session, or a story's
// published done record at the shown revision and the sessions its card holds
// (`./followUpStory.ts`), with an optional file anchor checked against that
// story's comparison (`./followUpFileAdmission.ts`). A retry of a pending
// conversation keeps its original context even after the source expires.
// Repeating a retained attempt uses its saved request directly
// (`./agentLaunchAccept.ts`).

import type { AgentLaunchRequest } from "../src/agentLaunch.ts";
import {
  followUpContextText,
  sessionContext,
  storyContext,
  type FollowUpContext,
} from "../src/followUpContext.ts";
import type { FollowUpSource } from "../src/followUpRequest.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { admitFollowUpFile } from "./followUpFileAdmission.ts";
import { doneStorySessions, publishedDoneStory } from "./followUpStory.ts";
import { keptSession, pendingInputOf } from "./launchRecordStore.ts";
import { RefusedRequest } from "./localOrigin.ts";

async function contextOf(
  followUp: FollowUpSource,
  source: PublishedSource,
): Promise<FollowUpContext> {
  if ("story" in followUp) {
    const story = await publishedDoneStory(source, followUp.story);
    const sessions = await doneStorySessions(source, followUp.story.identity);
    const file =
      followUp.story.file === undefined
        ? undefined
        : await admitFollowUpFile(
            source,
            followUp.story.identity,
            followUp.story.file,
          );
    return storyContext(story, sessions, file);
  }
  const record = await keptSession(source.id, followUp.session);
  if (record === undefined)
    throw new RefusedRequest(
      404,
      "The session this follows up is no longer kept on this machine.",
    );
  return { sessions: [sessionContext(record)] };
}

export async function withFollowUpContext(
  request: AgentLaunchRequest,
  source: PublishedSource,
): Promise<AgentLaunchRequest> {
  if (request.workflow !== "ad-hoc" || request.followUp === undefined)
    return request;
  const pending = (await pendingInputOf(source.id, request))?.request;
  const saved = pending?.workflow === "ad-hoc" ? pending.followUp : undefined;
  if (saved?.context !== undefined) return { ...request, followUp: saved };
  return {
    ...request,
    followUp: {
      ...request.followUp,
      context: followUpContextText(await contextOf(request.followUp, source)),
    },
  };
}
