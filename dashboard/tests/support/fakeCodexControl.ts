// Native rename and targeted interruption replies in the protocol-only substitute.
import type { FakeCodex } from "./fakeCodexTypes.ts";

export function answerCodexControl(
  fixture: FakeCodex,
  method: string,
  params: Record<string, unknown>,
  waiting: Array<() => void>,
  reply: (result: unknown) => void,
  refuse: (error: unknown) => void,
): boolean {
  switch (method) {
    case "thread/name/set":
      if (fixture.renameError !== undefined) refuse(fixture.renameError);
      else {
        fixture.names.set(String(params["threadId"]), String(params["name"]));
        reply({});
      }
      return true;
    case "turn/interrupt": {
      const threadId = String(params["threadId"]);
      const turnId = String(params["turnId"]);
      const interrupt = () => {
        fixture.beforeInterrupt?.(threadId, turnId);
        const observation = fixture.observations.get(threadId);
        const latest = observation?.turns.at(-1);
        if (fixture.interruptError !== undefined)
          refuse(fixture.interruptError);
        else if (latest?.id !== turnId || latest.status !== "inProgress")
          refuse({
            code: -32600,
            message: `expected active turn id ${turnId} but found ${latest?.id ?? "none"}`,
          });
        else {
          latest.status = "interrupted";
          if (observation !== undefined) observation.status = { type: "idle" };
          reply({});
          for (const subscriber of fixture.sockets) {
            if (subscriber.readyState === 1)
              subscriber.send(
                JSON.stringify({
                  method: "turn/completed",
                  params: {
                    threadId,
                    turn: { id: turnId, status: "interrupted" },
                  },
                }),
              );
          }
        }
      };
      if (fixture.hold) waiting.push(interrupt);
      else interrupt();
      return true;
    }
    default:
      return false;
  }
}
