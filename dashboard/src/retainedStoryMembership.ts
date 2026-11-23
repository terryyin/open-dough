// The story evidence a retained launch carries, independent of its placement
// on a particular Board or the catalog that has answered so far.
import { isWithinDoneWindow } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { followUpStoryIdentity } from "./followUpRequest.ts";
import type { LaunchRecord } from "./launchRecord.ts";
import { storyOf } from "./launchWorkflow.ts";

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
  membership: ReturnType<typeof retainedStoryOf>,
  now: Date,
) {
  return membership?.kind === "originating" &&
    isWithinDoneWindow(membership.completedAt, now)
    ? membership
    : undefined;
}
