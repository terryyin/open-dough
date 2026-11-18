// An accepted launch attempt as the machine's sessions read answers it for a
// frontend-only journey (./frontendLaunchSubstitutes.ts answers the acceptance,
// ./frontendServiceState.ts the read): the boundary accepts the page's
// request as an attempt this server owns and still runs, and the case then
// publishes its Take, launches its session or settles it otherwise, as the
// real start and launch would. Nothing is started; only the answers change.

import type {
  Acceptance,
  AgentLaunchRequest,
  AttemptObservation,
  LaunchRecord,
  MachineAnswer,
} from "../../src/agentLaunch.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  putFrontendStories,
  type FrontendServiceState,
} from "./frontendServiceState.ts";

type Outcome = Exclude<
  NonNullable<AttemptObservation["outcome"]>,
  { kind: "launched" }
>;

export type FrontendAttempt = {
  // Answers the page's acceptance: the attempt, kept in the machine's read.
  readonly accept: (request: AgentLaunchRequest) => Acceptance;
  // The start published its story's Take at `revision`, which the project
  // now lists the story Taken at; the attempt still runs.
  readonly publish: (revision: string) => void;
  // The attempt launched `record`'s session, which the machine's read now
  // observes at work; this server no longer runs it.
  readonly launch: (record: LaunchRecord) => void;
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
  let published: string | undefined;
  let changes = 0;
  const asked = () => {
    if (request === undefined) throw new Error("nothing was accepted yet");
    return request;
  };
  // Still running without an outcome; settled with one.
  const put = (
    settled?: { outcome: Outcome } | { launched: LaunchRecord },
  ): AttemptObservation => {
    changes += 1;
    const accepted = makeMe.anAcceptedAttempt.requesting(asked());
    if (published !== undefined) accepted.published(published);
    if (settled !== undefined) {
      if ("outcome" in settled) accepted.ended(settled.outcome);
      else accepted.launched(settled.launched.session);
      accepted.settledAt("2026-01-01T00:00:05.000Z");
    }
    const attempt = makeMe.anAttemptObservation
      .of(accepted.please())
      .owned(true)
      .running(settled === undefined)
      .afterChanges(changes)
      .please();
    const answer = machine(makeMe.aMachineAnswer.answeringAttempts(attempt));
    if (settled !== undefined && "launched" in settled)
      answer.observingOpen(settled.launched);
    const read: MachineAnswer = answer.please();
    services.answerMachine(read);
    return attempt;
  };
  return {
    accept: (sent) => {
      request = sent;
      return { kind: "accepted", attempt: put() };
    },
    publish: (revision) => {
      const sent = asked();
      if (sent.workflow === "ad-hoc")
        throw new Error("only a story's start publishes a Take");
      published = revision;
      putFrontendStories(services, { taken: [sent.title] }, revision);
      put();
    },
    launch: (record) => {
      put({ launched: record });
    },
    settle: (outcome) => {
      put({ outcome });
    },
  };
}
