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
  type FollowUpContext,
} from "../src/followUpContext.ts";
import type {
  AttachedStoryNote,
  FollowUpSource,
} from "../src/followUpRequest.ts";
import { storyNotesContext } from "../src/followUpStoryNotes.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { storyNoteVersion } from "../src/storyNote.ts";
import { admitFollowUpFile } from "./followUpFileAdmission.ts";
import { doneStorySessions, publishedDoneStory } from "./followUpStory.ts";
import { keptSession, pendingInputOf } from "./launchRecordStore.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { waitingStoryNotes } from "./storyNotes.ts";

async function resolveFollowUp(
  followUp: FollowUpSource,
  source: PublishedSource,
): Promise<{
  context: FollowUpContext;
  notes?: AttachedStoryNote[];
}> {
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
    const base = storyContext(story, sessions, file);
    if (followUp.story.notes !== true) return { context: base };
    const waiting = await waitingStoryNotes(source.id, followUp.story.identity);
    if (waiting === "unreadable")
      throw new RefusedRequest(502, "The notes could not be read.");
    return {
      context: { ...base, notes: storyNotesContext(waiting) },
      notes: waiting.map((note) => ({
        id: note.id,
        version: storyNoteVersion(note),
      })),
    };
  }
  const record = await keptSession(source.id, followUp.session);
  if (record === undefined)
    throw new RefusedRequest(
      404,
      "The session this follows up is no longer kept on this machine.",
    );
  return { context: { sessions: [sessionContext(record)] } };
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
  const resolved = await resolveFollowUp(request.followUp, source);
  return {
    ...request,
    followUp: {
      ...request.followUp,
      context: followUpContextText(resolved.context),
      ...(resolved.notes === undefined ? {} : { notes: resolved.notes }),
    },
  };
}
