// The page's launches (`../../src/agentLaunches.ts`) as a machine that
// answered ANSWER: its records are listed and shown on cards, its workspaces
// and host operations known, nothing is starting, kept or offered, and every
// session action stays unresolved, so a case that reaches one waits instead
// of reaching the machine. A case that must not operate a session names its
// REFUSAL instead, and every session action throws it.
import type { MachineSessions } from "../../src/agentLaunches.ts";
import type { MachineAnswer } from "../../src/agentLaunch.ts";
import { unanswered } from "../support/waitUntil.ts";

export const machineSessionsAnswering = (
  answer: MachineAnswer,
  refusal?: string,
): MachineSessions => {
  const refused = () => {
    throw new Error(refusal);
  };
  const sessionAction = refusal === undefined ? unanswered : refused;
  const startupAction = refusal === undefined ? () => undefined : refused;
  return {
    rereadOffers: () => undefined,
    rereadSessions: () => undefined,
    creations: answer.creations,
    hostOperations: answer.hostOperations,
    readHistory: () => undefined,
    records: answer.records,
    workspaces: answer.workspaces,
    sessionsSettled: true,
    alerts: answer.alerts,
    feedbackMaintenance: answer.feedbackMaintenance,
    keptStartOf: () => undefined,
    runningStartOf: () => undefined,
    launched: answer.records,
    establishesStart: () => false,
    sessionPolicyOffer: () => "reading",
    optionsOffer: () => undefined,
    recoveriesOf: () => [],
    attemptEvidence: "read",
    continueStartup: startupAction,
    updateWorktreeAndRetry: startupAction,
    recheckStartups: startupAction,
    attemptOf: () => undefined,
    storyStartupOf: () => undefined,
    storyStartupsOf: () => [],
    start: sessionAction,
    startAdHoc: sessionAction,
    adHocAttemptOf: () => undefined,
    markDone: sessionAction,
    markRead: sessionAction,
    deleteRecord: sessionAction,
    recoverSession: sessionAction,
    stopSession: sessionAction,
    readSession: sessionAction,
  };
};
