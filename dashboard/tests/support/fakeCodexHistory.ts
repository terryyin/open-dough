import type { WebSocket } from "ws";
import type { FakeCodex } from "./fakeCodexTypes.ts";

export function answerCodexHistory(
  fixture: FakeCodex,
  method: string,
  params: Record<string, unknown>,
  reply: (result: unknown) => void,
  refuse: (error: unknown) => void,
  client: WebSocket,
): void {
  fixture.beforeRead?.(params["includeTurns"] === true);
  if (fixture.readError)
    refuse({ code: -32000, message: "Native thread not found." });
  else if (fixture.blankHistoryError && params["includeTurns"])
    refuse(fixture.blankHistoryError);
  else if (fixture.failRead) client.close();
  else {
    if (method === "thread/resume" && fixture.completeOnResume)
      client.send(
        JSON.stringify({
          method: "turn/completed",
          params: {
            threadId: fixture.threadId,
            turn: { id: "native-turn-id", status: "completed" },
          },
        }),
      );
    const turns =
      method === "thread/resume" && fixture.resumeStatus !== undefined
        ? fixture.history.map((turn) => ({
            ...turn,
            status: fixture.resumeStatus,
          }))
        : fixture.history;
    reply({
      thread: {
        id: fixture.threadId,
        cwd: fixture.cwd,
        turns,
        status: { type: "active", activeFlags: [] },
      },
      ...(method === "thread/resume"
        ? {
            cwd: fixture.cwd,
            model:
              fixture.effectiveModel ??
              fixture.configuredModel ??
              "native-default",
            reasoningEffort: fixture.effectiveEffort ?? "medium",
            approvalPolicy: "on-request",
            sandbox: { type: "workspaceWrite" },
            runtimeWorkspaceRoots: [fixture.cwd],
          }
        : {}),
    });
  }
}
