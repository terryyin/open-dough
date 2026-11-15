// An accepted launch attempt as the machine's sessions read answers it for a
// frontend-only journey (./frontendLaunchSubstitutes.ts answers the acceptance,
// ./frontendServiceState.ts the read): the boundary accepts the page's
// request as an attempt this server owns and still runs, and the case then
// settles it, as the real start and launch would.
// Nothing is started; only the answers change.

import type {
  Acceptance,
  AgentLaunchRequest,
  AttemptObservation,
  MachineAnswer,
} from "../../src/agentLaunch.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  putFrontendMachine,
  type FrontendServiceState,
} from "./frontendServiceState.ts";

type Outcome = Exclude<
  NonNullable<AttemptObservation["outcome"]>,
  { kind: "launched" }
>;

export type FrontendAttempt = {
  // Answers the page's acceptance: the attempt, kept in the machine's read.
  readonly accept: (request: AgentLaunchRequest) => Acceptance;
  // The attempt settled with this outcome; this server no longer runs it.
  readonly settle: (outcome: Outcome) => void;
};

// `machine` adds what else the machine's read says, such as the projects
// whose installed skill establishes a start, to each answer.
export function frontendAttempt(
  services: FrontendServiceState,
  machine: (
    answer: typeof makeMe.aMachineAnswer,
  ) => typeof makeMe.aMachineAnswer = (answer) => answer,
): FrontendAttempt {
  let request: AgentLaunchRequest | undefined;
  let changes = 0;
  // Still running without an outcome; settled with one.
  const put = (outcome?: Outcome): AttemptObservation => {
    if (request === undefined) throw new Error("nothing was accepted yet");
    changes += 1;
    const accepted = makeMe.anAcceptedAttempt.requesting(request);
    const attempt = makeMe.anAttemptObservation
      .of(
        (outcome === undefined
          ? accepted
          : accepted.ended(outcome).settledAt("2026-01-01T00:00:05.000Z")
        ).please(),
      )
      .owned(true)
      .running(outcome === undefined)
      .afterChanges(changes)
      .please();
    const answer: MachineAnswer = machine(
      makeMe.aMachineAnswer.answeringAttempts(attempt),
    ).please();
    putFrontendMachine(services, answer);
    return attempt;
  };
  return {
    accept: (asked) => {
      request = asked;
      return { kind: "accepted", attempt: put() };
    },
    settle: (outcome) => {
      put(outcome);
    },
  };
}
