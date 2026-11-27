// A new follow-up's context comes from a retained session or a published
// story and the sessions its card holds (`./followUpStory.ts`). An optional
// file anchor is checked against its comparison. When a story asks for
// notes, waiting notes are read from the machine store (`./storyNotes.ts`),
// never from the page, and their versions are kept beside the context. A
// retry of a pending conversation keeps its original context and notes even
// after the source expires. Repeating a retained attempt uses its saved
// request directly (`./agentLaunchAccept.ts`).

import { storyOf, type AgentLaunchRequest } from "../src/agentLaunch.ts";
import {
  followUpContextText,
  sessionContext,
  storyContext,
  takenStoryContext,
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
import {
  publishedFollowUpCardStory,
  followUpStorySessions,
  publishedDoneStory,
  requirePublishedFollowUpSessionStory,
} from "./followUpStory.ts";
import { keptSession, pendingInputOf } from "./launchRecordStore.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { storyFollowUpMessage } from "./storyFollowUpMessage.ts";
import { admitStoryComparison } from "./storyReviewHistoricalFileAdmission.ts";
import { machineStoryNotesFile, waitingStoryNotes } from "./storyNotes.ts";

export interface FollowUpContextInput {
  readonly notesFile: string;
  readonly publishedDoneStory: typeof publishedDoneStory;
  readonly followUpStorySessions: typeof followUpStorySessions;
  readonly pendingInputOf: typeof pendingInputOf;
  readonly keptSession: typeof keptSession;
  readonly requirePublishedFollowUpSessionStory: typeof requirePublishedFollowUpSessionStory;
}

// Accept and a retained start resolve a follow-up's context from these reads.
export function followUpContextInput(): FollowUpContextInput {
  return {
    notesFile: machineStoryNotesFile(),
    publishedDoneStory,
    followUpStorySessions,
    pendingInputOf,
    keptSession,
    requirePublishedFollowUpSessionStory,
  };
}

async function resolveStoryFollowUp(
  followUp: Extract<FollowUp, { story: unknown }>["story"],
  source: PublishedSource,
  input: FollowUpContextInput,
): Promise<{
  context: StoryFollowUpContext;
  notes?: AttachedStoryNote[];
}> {
  const story = await publishedFollowUpCardStory(
    source,
    followUp,
    input.publishedDoneStory,
  );
  const { file, comparison } = followUp;
  if (file !== undefined)
    await admitFollowUpFile(source, followUp.identity, file);
  if (comparison !== undefined)
    await admitStoryComparison(source, followUp.identity, comparison);
  const sessions = await input.followUpStorySessions(
    source,
    followUp.identity,
    followUp.sessions ?? [],
  );
  const selected = new Set(followUp.sessions?.map(followUpSessionKey));
  const attached = sessions
    .filter((session) => followUpSessionSelected(session, selected))
    .map(followUpSessionContext);
  const base =
    story.status === "done"
      ? storyContext(
          story,
          attached,
          file ?? comparison,
          sessions.some(({ retained }) => retained !== undefined),
        )
      : takenStoryContext(story, attached);
  if (followUp.notes !== true) return { context: base };
  const waiting = await waitingStoryNotes(
    input.notesFile,
    source.id,
    followUp.identity,
  );
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
  input: FollowUpContextInput,
): Promise<FollowUp> {
  const record = await input.keptSession(source.id, followUp.session);
  if (record === undefined)
    throw new RefusedRequest(
      404,
      "The session this follows up is no longer kept on this machine.",
    );
  const identity = storyOf(record.request);
  if (identity === undefined)
    throw new RefusedRequest(
      404,
      "The session this follows up has no published story binding.",
    );
  await input.requirePublishedFollowUpSessionStory(source, identity);
  return {
    ...followUp,
    storyIdentity: identity,
    context: followUpContextText(sessionContext(record)),
  };
}

export async function withFollowUpContext(
  request: AgentLaunchRequest,
  source: PublishedSource,
  input: FollowUpContextInput,
): Promise<AgentLaunchRequest> {
  if (request.workflow !== "ad-hoc" || request.followUp === undefined)
    return request;
  const pending = (await input.pendingInputOf(source.id, request))?.request;
  if (
    pending?.workflow === "ad-hoc" &&
    pending.followUp?.context !== undefined &&
    pending.storyIdentity !== undefined
  )
    return {
      ...request,
      followUp: { ...pending.followUp, storyIdentity: pending.storyIdentity },
    };
  if ("session" in request.followUp)
    return {
      ...request,
      followUp: await resolveSessionFollowUp(request.followUp, source, input),
    };
  const resolved = await resolveStoryFollowUp(
    request.followUp.story,
    source,
    input,
  );
  return {
    ...request,
    followUp: {
      ...request.followUp,
      storyIdentity: request.followUp.story.identity,
      context: {
        message: storyFollowUpMessage(resolved.context, request.instruction),
      },
      ...(resolved.notes === undefined ? {} : { notes: resolved.notes }),
    },
  };
}

// Older continuations kept the original context before its story binding was
// stored separately. Recover only the published source and keep that input.
export async function retainedFollowUpWithStory(
  request: AgentLaunchRequest,
  source: PublishedSource,
  input: FollowUpContextInput,
): Promise<AgentLaunchRequest | undefined> {
  if (
    request.workflow !== "ad-hoc" ||
    request.followUp === undefined ||
    request.followUp.storyIdentity !== undefined
  )
    return request;
  const { followUp } = request;
  if (followUp.context === undefined) return undefined;
  const record =
    "session" in followUp
      ? await input.keptSession(source.id, followUp.session)
      : undefined;
  const storyIdentity =
    "story" in followUp
      ? followUp.story.identity
      : record === undefined
        ? undefined
        : storyOf(record.request);
  if (storyIdentity === undefined) return undefined;
  try {
    await input.requirePublishedFollowUpSessionStory(source, storyIdentity);
  } catch (error) {
    if (error instanceof RefusedRequest) return undefined;
    throw error;
  }
  return { ...request, followUp: { ...followUp, storyIdentity } };
}
