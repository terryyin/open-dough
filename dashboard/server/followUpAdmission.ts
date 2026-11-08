// A follow-up's context, resolved at admission from the records the server
// keeps (`../src/followUpContext.ts`): a retained session's record, or a done
// story's published done record at the revision the page showed with the
// sessions its card holds (`./followUpStory.ts`). A request carrying context
// text a page composed is malformed. The resolved text stays on the request,
// so the attempt, its record, a retry, a recovery and a rebuilt first input
// all carry it without reading again, even after the source record is gone.

import type { AgentLaunchRequest } from "../src/agentLaunch.ts";
import {
  followUpContextText,
  sessionContext,
  storyContext,
  type FollowUpContext,
} from "../src/followUpContext.ts";
import type { FollowUpSource } from "../src/followUpRequest.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { doneStorySessions, publishedDoneStory } from "./followUpStory.ts";
import { keptSession } from "./launchRecordStore.ts";
import { RefusedRequest } from "./localOrigin.ts";

async function contextOf(
  followUp: FollowUpSource,
  source: PublishedSource,
): Promise<FollowUpContext> {
  if ("story" in followUp) {
    const story = await publishedDoneStory(source, followUp.story);
    return storyContext(
      story,
      await doneStorySessions(source, followUp.story.identity),
    );
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
  if (request.followUp.context !== undefined)
    throw new RefusedRequest(400, "The launch request is malformed.");
  return {
    ...request,
    followUp: {
      ...request.followUp,
      context: followUpContextText(await contextOf(request.followUp, source)),
    },
  };
}
