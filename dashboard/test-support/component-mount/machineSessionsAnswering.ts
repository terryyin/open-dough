// The page's launches (`../../src/agentLaunches.ts`) as a machine that
// answered ANSWER: its records are listed and shown on cards, its workspaces
// and host operations known, nothing is starting, kept or offered, and every
// session action stays unresolved, so a case that reaches one waits instead
// of reaching the machine. `machineSessionsRefusing` is the machine of a case
// that must not operate a session: every session action throws its REFUSAL.
import type { MachineSessions } from "../../src/agentLaunches.ts";
import type { MachineAnswer } from "../../src/agentLaunch.ts";
import { unanswered } from "../support/waitUntil.ts";

export const machineSessionsAnswering = ({
  answer,
}: {
  readonly answer: MachineAnswer;
}): MachineSessions => sessionsOf(answer, unanswered, () => undefined);

export const machineSessionsRefusing = ({
  answer,
  refusal,
}: {
  readonly answer: MachineAnswer;
  readonly refusal: string;
}): MachineSessions => {
  const refused = () => {
    throw new Error(refusal);
  };
  return sessionsOf(answer, refused, refused);
};

const sessionsOf = (
  answer: MachineAnswer,
  sessionAction: () => never | Promise<never>,
  startupAction: () => undefined,
): MachineSessions => {
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
