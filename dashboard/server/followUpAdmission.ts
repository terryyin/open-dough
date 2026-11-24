// A new follow-up's context comes from a retained session, or a story's
// published done record at the shown revision and the sessions its card holds
// (`./followUpStory.ts`), with an optional file anchor checked against that
// story's comparison (`./followUpFileAdmission.ts`). When a story asks for
// notes, waiting notes are read from the machine store (`./storyNotes.ts`),
// never from the page, and their versions are kept beside the context. A
// retry of a pending conversation keeps its original context and notes even
// after the source expires. Repeating a retained attempt uses its saved
// request directly (`./agentLaunchAccept.ts`).

import type { AgentLaunchRequest } from "../src/agentLaunch.ts";
import {
  followUpContextText,
  sessionContext,
  storyContext,
  type StoryFollowUpContext,
} from "../src/followUpContext.ts";
import {
  followUpSessionKey,
  type AttachedStoryNote,
  type FollowUp,
} from "../src/followUpRequest.ts";
import {
  followUpSessionContext,
  followUpSessionSelected,
} from "../src/followUpSessions.ts";
import { storyNotesContext } from "../src/followUpStoryNotes.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { storyNoteVersion } from "../src/storyNote.ts";
import { admitFollowUpFile } from "./followUpFileAdmission.ts";
import { followUpStorySessions, publishedDoneStory } from "./followUpStory.ts";
import { keptSession, pendingInputOf } from "./launchRecordStore.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { storyFollowUpMessage } from "./storyFollowUpMessage.ts";
import { admitPublishedStoryComparison } from "./storyReviewHistoricalFileAdmission.ts";
import { waitingStoryNotes } from "./storyNotes.ts";

async function resolveStoryFollowUp(
  followUp: Extract<FollowUp, { story: unknown }>["story"],
  source: PublishedSource,
): Promise<{
  context: StoryFollowUpContext;
  notes?: AttachedStoryNote[];
}> {
  const story = await publishedDoneStory(source, followUp);
  const { file, comparison } = followUp;
  if (file !== undefined)
    await admitFollowUpFile(source, followUp.identity, file);
  if (comparison !== undefined)
    await admitPublishedStoryComparison(source, followUp.identity, comparison);
  const sessions = await followUpStorySessions(
    source,
    followUp.identity,
    followUp.sessions ?? [],
  );
  const selected = new Set(followUp.sessions?.map(followUpSessionKey));
  const base = storyContext(
    story,
    sessions
      .filter((session) => followUpSessionSelected(session, selected))
      .map(followUpSessionContext),
    file ?? comparison,
    sessions.some(({ retained }) => retained !== undefined),
  );
  if (followUp.notes !== true) return { context: base };
  const waiting = await waitingStoryNotes(source.id, followUp.identity);
  if (waiting === "unreadable" || waiting.length === 0)
    return { context: base };
  return {
    context: { ...base, notes: storyNotesContext(waiting) },
    notes: waiting.map((note) => ({
      id: note.id,
      version: storyNoteVersion(note),
    })),
  };
}

async function resolveSessionFollowUp(
  followUp: Extract<FollowUp, { session: unknown }>,
  source: PublishedSource,
): Promise<FollowUp> {
  const record = await keptSession(source.id, followUp.session);
  if (record === undefined)
    throw new RefusedRequest(
      404,
      "The session this follows up is no longer kept on this machine.",
    );
  return { ...followUp, context: followUpContextText(sessionContext(record)) };
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
  if ("session" in request.followUp)
    return {
      ...request,
      followUp: await resolveSessionFollowUp(request.followUp, source),
    };
  const resolved = await resolveStoryFollowUp(request.followUp.story, source);
  return {
    ...request,
    followUp: {
      ...request.followUp,
      context: {
        message: storyFollowUpMessage(resolved.context, request.instruction),
      },
      ...(resolved.notes === undefined ? {} : { notes: resolved.notes }),
    },
  };
}
