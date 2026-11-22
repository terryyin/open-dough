// The page's launches (`../../src/agentLaunches.ts`) as a machine that
// answered ANSWER: its records are listed and shown on cards, its workspaces
// and host operations known, nothing is starting, kept or offered, and every
// session action stays unresolved, so a case that reaches one waits instead
// of reaching the machine.
import type { MachineSessions } from "../../src/agentLaunches.ts";
import type { MachineAnswer } from "../../src/agentLaunch.ts";

const never = <T>() => new Promise<T>(() => undefined);

export const machineSessionsAnswering = (
  answer: MachineAnswer,
): MachineSessions => ({
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
  continueStartup: () => undefined,
  updateWorktreeAndRetry: () => undefined,
  recheckStartups: () => undefined,
  attemptOf: () => undefined,
  storyStartupOf: () => undefined,
  storyStartupsOf: () => [],
  start: never,
  startAdHoc: never,
  adHocAttemptOf: () => undefined,
  markDone: never,
  markRead: never,
  deleteRecord: never,
  recoverSession: never,
  stopSession: never,
  readSession: never,
});
