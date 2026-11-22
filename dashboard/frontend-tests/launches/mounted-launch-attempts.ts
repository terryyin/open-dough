import type { MachineAnswer } from "../../src/agentLaunch.ts";
import {
  useLaunchAttempts,
  type LaunchAttemptSource,
} from "../../src/launchAttempts.ts";
import type { AttemptEvidence } from "../../src/startupRecoveries.ts";

const nothing = () => undefined;
const readingPublished = {
  shown: undefined,
  reading: true,
  readAfresh: nothing,
};

export function useMountedLaunchAttempts(
  machine: MachineAnswer,
  source: LaunchAttemptSource,
  answeredAsk: number,
  {
    evidence = "read",
    reread = nothing,
  }: {
    evidence?: AttemptEvidence;
    reread?: () => void;
  } = {},
) {
  return useLaunchAttempts({
    source,
    observed: machine.attempts,
    resolved: [],
    readHistory: nothing,
    keptStarts: machine.keptStarts,
    hostOperations: machine.hostOperations,
    attemptEvidence: evidence,
    answeredAsk,
    asksSoFar: () => answeredAsk,
    records: machine.records,
    reads: answeredAsk,
    reread,
    published: readingPublished,
  });
}
