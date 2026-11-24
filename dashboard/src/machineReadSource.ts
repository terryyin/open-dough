// The page's machine-side reads for launch ownership (`./agentLaunches.ts`):
// sessions since a held revision (`./machineSessionsReads.ts`), agent
// acceptance (`./agentLaunchClient.ts`), and which published Done story a
// retained ad hoc session completed (`./completedStoryAssociation.ts`). The
// authenticated implementation binds the local launch boundary; cases supply
// typed replies through `PageReads.machine`.

import {
  requestAgentAcceptance,
  type AcceptanceAnswer,
} from "./agentLaunchClient.ts";
import type { AgentLaunchRequest } from "./agentLaunch.ts";
import { readCompletedStoryAssociation } from "./completedStoryAssociation.ts";
import {
  readMachineSessionsSince,
  type MachineSessionsReadOptions,
} from "./machineSessionsReads.ts";
import type { MachineSessionsRead } from "./machineSessionsRevision.ts";

export type MachineReadSource = {
  readonly readSessionsSince: (
    held: string | undefined,
    signal?: AbortSignal,
    options?: MachineSessionsReadOptions,
  ) => Promise<MachineSessionsRead | undefined>;
  readonly requestAcceptance: (
    request: AgentLaunchRequest,
    attachTerminal?: boolean,
  ) => Promise<AcceptanceAnswer>;
  readonly readCompletedStoryAssociation: typeof readCompletedStoryAssociation;
};

export const authenticatedMachineReads: MachineReadSource = {
  readSessionsSince: readMachineSessionsSince,
  requestAcceptance: requestAgentAcceptance,
  readCompletedStoryAssociation,
};
