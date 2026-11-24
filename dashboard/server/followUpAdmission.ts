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
import type { AttachedStoryNote, FollowUp } from "../src/followUpRequest.ts";
import { retainedFollowUpReference } from "../src/followUpSessions.ts";
import { storyNotesContext } from "../src/followUpStoryNotes.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { sessionKey } from "../src/sessionReference.ts";
import { storyNoteVersion } from "../src/storyNote.ts";
import { admitFollowUpFile } from "./followUpFileAdmission.ts";
import { doneStorySessions, publishedDoneStory } from "./followUpStory.ts";
import { keptSession, pendingInputOf } from "./launchRecordStore.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { storyFollowUpMessage } from "./storyFollowUpMessage.ts";
import { waitingStoryNotes } from "./storyNotes.ts";

async function resolveStoryFollowUp(
  followUp: Extract<FollowUp, { story: unknown }>["story"],
  source: PublishedSource,
): Promise<{
  context: StoryFollowUpContext;
  notes?: AttachedStoryNote[];
}> {
  const story = await publishedDoneStory(source, followUp);
  const sessions = await doneStorySessions(source, followUp.identity);
  const selected = new Set(followUp.sessions?.map(sessionKey));
  const file =
    followUp.file === undefined
      ? undefined
      : await admitFollowUpFile(source, followUp.identity, followUp.file);
  const base = storyContext(
    story,
    sessions.filter((record) =>
      selected.has(sessionKey(retainedFollowUpReference(record))),
    ),
    file,
    sessions.length > 0,
  );
  if (followUp.notes !== true) return { context: base };
  const waiting = await waitingStoryNotes(source.id, followUp.identity);
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
