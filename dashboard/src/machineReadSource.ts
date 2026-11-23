// The page's machine-side reads for launch ownership (`./agentLaunches.ts`):
// sessions since a held revision, agent acceptance, and actions which update
// the page's records. The authenticated implementation binds the local launch
// boundary; cases supply typed replies through `PageReads.machine`.

import {
  requestAgentAcceptance,
  type AcceptanceAnswer,
} from "./agentLaunchClient.ts";
import type { AgentLaunchRequest } from "./agentLaunch.ts";
import {
  readMachineSessionsSince,
  type MachineSessionsReadOptions,
} from "./machineSessionsReads.ts";
import type { MachineSessionsRead } from "./machineSessionsRevision.ts";
import {
  requestDeleteRecord,
  requestMarkDone,
} from "./sessionRecordRequests.ts";

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
  readonly deleteRecord: typeof requestDeleteRecord;
  readonly markDone: typeof requestMarkDone;
};

export const authenticatedMachineReads: MachineReadSource = {
  readSessionsSince: readMachineSessionsSince,
  requestAcceptance: requestAgentAcceptance,
  deleteRecord: requestDeleteRecord,
  markDone: requestMarkDone,
};
