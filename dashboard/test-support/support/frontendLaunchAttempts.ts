// An accepted launch attempt as the machine's sessions read answers it for a
// frontend-only journey (./frontendLaunchSubstitutes.ts answers the acceptance,
// ./frontendServiceState.ts the read): the boundary accepts the page's
// request as an attempt this server owns and still runs, and the case then
// supplies its launched session to the machine's read.

import type {
  Acceptance,
  AgentLaunchRequest,
  AttemptObservation,
  LaunchRecord,
  LaunchWithState,
  MachineAnswer,
} from "../../src/agentLaunch.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { FrontendServiceState } from "./frontendServiceState.ts";

export type FrontendAttempt = {
  // Answers the page's acceptance: the attempt, kept in the machine's read.
  readonly accept: (request: AgentLaunchRequest) => Acceptance;
  // The attempt launched `record`'s session, which the machine's read now
  // observes at work; this server no longer runs it.
  readonly launch: (record: LaunchRecord) => void;
};

export function frontendAttempt(
  services: FrontendServiceState,
  kept: readonly LaunchWithState[] = [],
): FrontendAttempt {
  let request: AgentLaunchRequest | undefined;
  let changes = 0;
  const put = (launched?: LaunchRecord): AttemptObservation => {
    if (request === undefined) throw new Error("nothing was accepted yet");
    const accepted = makeMe.anAcceptedAttempt.requesting(request);
    if (launched !== undefined) {
      accepted.launched(launched.session);
      accepted.settledAt("2026-01-01T00:00:05.000Z");
    }
    const attempt = makeMe.anAttemptObservation
      .of(accepted.please())
      .owned(true)
      .running(launched === undefined)
      .afterChanges(++changes)
      .please();
    const answer = makeMe.aMachineAnswer.answeringAttempts(attempt);
    if (launched !== undefined) answer.observingOpen(launched);
    const read: MachineAnswer = answer.please();
    services.answerMachine({ ...read, records: [...kept, ...read.records] });
    return attempt;
  };
  return {
    accept: (sent) => {
      request = sent;
      return { kind: "accepted", attempt: put() };
    },
    launch: (record) => {
      put(record);
    },
  };
}
