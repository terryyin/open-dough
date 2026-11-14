// Keep an ordinary PTY through the actual runner wire protocol. The shell
// identifies its own process and answers terminal input throughout the journey.
import { randomUUID } from "node:crypto";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { keepCursorClientAtPort } from "../../dashboard/server/hosts/cursor/runnerClient.ts";
import type { CursorTerminal } from "../../dashboard/tests/support/cursorTerminal.ts";
import { keepLaunchRecords } from "../../dashboard/tests/support/launchStore.ts";

export async function keepWatcherClient(
  home: string,
  workspace: string,
  port: number,
) {
  const command = "/bin/sh";
  const args = [
    "-c",
    'printf "WATCHER CLIENT %s\\n" "$$"; while IFS= read -r line; do printf "WATCHER INPUT <%s>\\n" "$line"; done',
  ];
  const sessionId = randomUUID();
  const record = makeMe.aLaunchRecord
    .adHoc({ title: "A client kept by the watcher runner" })
    .inCursorSession({
      sessionId,
      continuation: { workspace, args: [command, ...args] },
    })
    .please();
  const { session } = record;
  if (session.host !== "cursor") throw new Error("Missing Cursor session");
  keepLaunchRecords(home, [record]);

  const kept = await keepCursorClientAtPort(port, {
    session,
    command,
    args,
    cwd: workspace,
    cols: 80,
    rows: 24,
    sourceId: record.request.source,
  });
  const pid =
    kept.kind === "kept"
      ? /WATCHER CLIENT (\d+)/.exec(kept.screen ?? "")?.[1]
      : undefined;
  if (pid === undefined)
    throw new Error(
      `The watcher runner did not keep the shell: ${JSON.stringify(kept)}`,
    );
  return { pid: Number(pid), sessionId };
}

export function waitForWatcherTerminal(
  terminal: CursorTerminal,
  text: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const { socket } = terminal;
    function clean() {
      socket.off("message", received);
      socket.off("close", closed);
      socket.off("error", failed);
    }
    function received() {
      if (!terminal.output().includes(text)) return;
      clean();
      resolve();
    }
    function failed(error: Error) {
      clean();
      reject(error);
    }
    function closed() {
      failed(
        new Error(
          `Terminal closed before receiving ${text}: ${terminal.output()}`,
        ),
      );
    }
    socket.on("message", received);
    socket.once("close", closed);
    socket.once("error", failed);
    received();
    if (socket.readyState === socket.CLOSED) closed();
  });
}
