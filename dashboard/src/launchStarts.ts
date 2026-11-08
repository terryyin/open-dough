// What this page's launch actions ask for (`./launchAttempts.ts`): a story's
// workflow, kept under its work item's key, or an ad hoc session, kept under
// the project's key or, for a follow-up, its source's (`./pageAttempt.ts`).
// Asking itself, and following the answer, is `./askedLaunches.ts`.

import { useCallback } from "react";
import {
  requestedChoices,
  requestedSettings,
  type AgentLaunchRequest,
  type LaunchChoices,
  type LaunchWorkflow,
  type StoryLaunchRequest,
} from "./agentLaunch.ts";
import type { FollowUpSource } from "./followUpRequest.ts";
import { adHocKey, attemptKey, type OnLaunched } from "./pageAttempt.ts";
import type { StartAnswer } from "./useLaunchConfirmation.tsx";

// The work item a launch is for, as its request names it.
export type LaunchWorkItem = Pick<StoryLaunchRequest, "identity" | "title">;

// Asks the local service to accept `request`, kept under `key`
// (`useAskedLaunches`).
type Launch = (
  key: string,
  request: AgentLaunchRequest,
  onLaunched: OnLaunched,
  attachTerminal: boolean,
  images: readonly File[] | undefined,
) => Promise<StartAnswer>;

export function useLaunchStarts(launch: Launch) {
  const start = useCallback(
    (
      sourceId: string,
      work: LaunchWorkItem,
      workflow: LaunchWorkflow,
      choices: LaunchChoices,
      onLaunched: OnLaunched,
    ) =>
      launch(
        attemptKey(sourceId, work.identity, workflow),
        {
          source: sourceId,
          identity: work.identity,
          title: work.title,
          workflow,
          ...requestedChoices(choices),
        },
        onLaunched,
        false,
        choices.images,
      ),
    [launch],
  );

  // An ad hoc session carries no story policy, only its own unattached one
  // when chosen, and the source it follows up, if any.
  const startAdHoc = useCallback(
    (
      sourceId: string,
      choices: LaunchChoices,
      onLaunched: OnLaunched,
      followUp?: FollowUpSource,
    ) =>
      launch(
        adHocKey(sourceId, followUp),
        {
          source: sourceId,
          workflow: "ad-hoc",
          ...requestedSettings(choices),
          ...(choices.unattached === undefined
            ? {}
            : { policy: choices.unattached }),
          ...(followUp === undefined ? {} : { followUp }),
        },
        onLaunched,
        choices.host === "cursor",
        choices.images,
      ),
    [launch],
  );

  return { start, startAdHoc };
}
