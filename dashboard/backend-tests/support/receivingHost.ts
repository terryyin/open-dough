// A host collaborator for Start's acceptance that launches every attempt it
// receives as a working Claude session of `source`, recording each attempt's
// recorded request and the first input the session would receive.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { recordedRequest } from "../../server/hostLaunch.ts";
import type { AttemptRun } from "../../server/launchAttemptSettlement.ts";
import { unattachedInput } from "../../server/unattachedInput.ts";
import type { RecordedLaunchRequest } from "../../src/agentLaunch.ts";

export type ReceivedAttempt = {
  readonly id: string;
  readonly request: RecordedLaunchRequest;
  readonly input: string | undefined;
};

export function receivingHost(source: string) {
  const received: ReceivedAttempt[] = [];
  const run: AttemptRun = ({ attempt, request: receiving }) => {
    const request = recordedRequest(receiving, new Date(attempt.acceptedAt));
    received.push({
      id: attempt.id,
      request,
      input: unattachedInput(request, undefined),
    });
    return Promise.resolve({
      kind: "launched",
      record: {
        ...makeMe.aLaunchRecord
          .adHoc({ title: request.title, source })
          .inClaudeSession({ sessionId: attempt.id })
          .please(),
        request,
        sessionState: makeMe.aSessionState.loaded("working").please(),
      },
    });
  };
  return { run, received };
}
