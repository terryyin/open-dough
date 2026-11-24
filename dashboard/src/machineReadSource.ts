// The page's machine-side reads for launch ownership (`./agentLaunches.ts`):
// sessions since a held revision, agent acceptance, which published Done
// story a retained ad hoc session completed (`./completedStoryAssociation.ts`),
// and actions which update the page's records. The authenticated
// implementation binds the local launch boundary; cases supply typed replies
// through `PageReads.machine`.

import {
  requestAgentAcceptance,
  type AcceptanceAnswer,
} from "./agentLaunchClient.ts";
import { awaitAttemptChange } from "./attemptChangeWaits.ts";
import type { AgentLaunchRequest } from "./agentLaunch.ts";
import { readCompletedStoryAssociation } from "./completedStoryAssociation.ts";
import {
  readMachineSessionsSince,
  readSessionsHistorySince,
  type MachineSessionsReadOptions,
} from "./machineSessionsReads.ts";
import type { MachineSessionsRead } from "./machineSessionsRevision.ts";
import {
  requestDeleteRecord,
  requestMarkDone,
  requestMarkRead,
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
  readonly readCompletedStoryAssociation: typeof readCompletedStoryAssociation;
  readonly readHistorySince: typeof readSessionsHistorySince;
  readonly waitForAttemptChange: typeof awaitAttemptChange;
  readonly deleteRecord: typeof requestDeleteRecord;
  readonly markDone: typeof requestMarkDone;
  readonly markRead: typeof requestMarkRead;
};

export const authenticatedMachineReads: MachineReadSource = {
  readSessionsSince: readMachineSessionsSince,
  requestAcceptance: requestAgentAcceptance,
  readCompletedStoryAssociation,
  readHistorySince: readSessionsHistorySince,
  waitForAttemptChange: awaitAttemptChange,
  deleteRecord: requestDeleteRecord,
  markDone: requestMarkDone,
  markRead: requestMarkRead,
};
