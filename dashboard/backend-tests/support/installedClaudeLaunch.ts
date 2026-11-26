import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { storyA } from "../../../Distribution/tests/support/queued-repository.mjs";
import type { StoryLaunchRequest } from "../../src/launchRequest.ts";

export const queuedExecution = makeMe.aLaunchRequest
  .executing(storyA)
  .please() as StoryLaunchRequest;
