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
        model:
          fixture.effectiveModel ??
          params["model"] ??
          fixture.configuredModels?.[fixture.cwd] ??
          fixture.configuredModel ??
          "native-sol",
        reasoningEffort:
          fixture.effectiveEffort ??
          (params["config"] as Record<string, unknown> | undefined)?.[
            "model_reasoning_effort"
          ] ??
          "medium",
      });
    };
    if (fixture.holdCreation) waiting.push(created);
    else created();
  }
}
