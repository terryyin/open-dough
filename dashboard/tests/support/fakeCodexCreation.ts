// Native creation replies expose effective settings without constructing records.
import type { WebSocket } from "ws";
import type { FakeCodex } from "./fakeCodexTypes.ts";

export function answerCodexCreation(
  native: FakeCodex,
  params: Record<string, unknown>,
  waiting: Array<() => void>,
  reply: (result: unknown) => void,
  refuse: (error: unknown) => void,
  client: WebSocket,
): void {
  const fixture = native;
  fixture.cwd = String(params["cwd"]);
  fixture.afterCreation?.();
  if (fixture.loseCreation) {
    client.close();
    return;
  }
  if (fixture.refuseCreation) refuse(fixture.creationError);
  else {
    const threadId = fixture.threadId;
    const created = () => {
      reply({
        thread: { id: threadId },
        model: fixture.effectiveModel ?? params["model"] ?? "configured-native",
        reasoningEffort: "medium",
      });
    };
    if (fixture.holdCreation) waiting.push(created);
    else created();
  }
}
