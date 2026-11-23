// The story evidence a retained launch carries, independent of its placement
// on a particular Board or the catalog that has answered so far.
import { isWithinDoneWindow } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import type { LaunchRecord } from "./launchRecord.ts";
import { storyOf } from "./launchWorkflow.ts";

export function retainedStoryOf(record: LaunchRecord) {
  const { request, doneStory } = record;
  const identity = storyOf(request);
  if (identity !== undefined)
    return { kind: "story-launch", identity } as const;
  const followUp = request.workflow === "ad-hoc" ? request.followUp : undefined;
  if (followUp !== undefined && "story" in followUp)
    return { kind: "follow-up", identity: followUp.story.identity } as const;
  return doneStory;
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
