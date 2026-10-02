// Native initial-input acceptance fixture; production owns launch evidence.
import type { WebSocket } from "ws";
import type { FakeCodex } from "./fakeCodexTypes.ts";

export function answerCodexInput(
  fixture: FakeCodex,
  params: Record<string, unknown>,
  waiting: Array<() => void>,
  reply: (result: unknown) => void,
  refuse: (error: unknown) => void,
  client: WebSocket,
): void {
  if (fixture.refuseInput) {
    refuse({ code: -32000, message: "Native input refused." });
    return;
  }
  fixture.history.push({
    id: "native-turn-id",
    items: [
      {
        type: "userMessage",
        id: "user-input",
        content: params["input"],
      },
      {
        type: "reasoning",
        id: "reasoning-item",
        summary: [],
        content: ["protocol fixture reasoning"],
      },
      {
        type: "commandExecution",
        id: "command-item",
        command: "native fixture",
        status: "completed",
      },
    ],
  });
  fixture.beforeInput?.();
  const accepted = () => {
    if (client.readyState !== 1) return;
    reply({ turn: { id: "native-turn-id", status: "inProgress" } });
    if (fixture.afterAcceptance === "complete")
      client.send(
        JSON.stringify({
          method: "turn/completed",
          params: {
            threadId: fixture.threadId,
            turn: { id: "native-turn-id", status: "completed" },
          },
        }),
      );
    if (fixture.afterAcceptance === "disconnect") client.close();
  };
  if (fixture.hold) waiting.push(accepted);
  else accepted();
}
