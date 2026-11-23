// The story evidence a retained launch carries, independent of its placement
// on a particular Board or the catalog that has answered so far.
import { isWithinDoneWindow } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { followUpStoryIdentity } from "./followUpRequest.ts";
import type { LaunchRecord } from "./launchRecord.ts";
import { storyOf } from "./launchWorkflow.ts";
import type { PublishedSessionRecord } from "./publishedSessionRecord.ts";
import { reportingReferenceOf } from "./sessionListing.ts";

export function retainedStoryOf(record: LaunchRecord) {
  const { request, doneStory } = record;
  const identity = storyOf(request);
  if (identity !== undefined)
    return { kind: "story-launch", identity } as const;
  const parent = followUpStoryIdentity(request);
  if (parent !== undefined)
    return { kind: "follow-up", identity: parent } as const;
  return doneStory;
}

// The published lookup belongs to the launch's project.
export function publishedCloseFor(
  record: LaunchRecord,
  published: ReadonlyMap<string, PublishedSessionRecord>,
) {
  const reference = reportingReferenceOf(record);
  return reference === undefined ? undefined : published.get(reference);
}

// A close's UUID is the reporting reference, independent of the native
// host's conversation ID. Keep both candidates when their stories disagree.
export function sessionStoryAssociation(
  record: LaunchRecord,
  published: PublishedSessionRecord | undefined,
) {
  const retained = retainedStoryOf(record);
  const identity =
    published?.sessionId === reportingReferenceOf(record)
      ? published?.story
      : undefined;
  if (identity === undefined) return retained;
  if (retained === undefined) return { kind: "linked", identity } as const;
  if (retained.identity === identity) return retained;
  return {
    kind: "conflict",
    retained: retained.identity,
    published: identity,
  } as const;
}

export const publishedSessionsById = (
  sessions: readonly PublishedSessionRecord[],
) => new Map(sessions.map((session) => [session.sessionId, session]));

export function ownDoneStorySessions<Session extends LaunchRecord>(
  records: readonly Session[] | undefined,
  source: string,
  identity: string,
): readonly Session[] {
  return (records ?? []).filter((record) => {
    const membership = retainedStoryOf(record);
    return (
      record.doneAt !== undefined &&
      record.request.source === source &&
      membership?.identity === identity &&
      membership.kind !== "follow-up"
    );
  });
}

export function recentLocalDoneStory(
  membership: ReturnType<typeof sessionStoryAssociation>,
  now: Date,
) {
  return membership?.kind === "originating" &&
    isWithinDoneWindow(membership.completedAt, now)
    ? membership
    : undefined;
}
