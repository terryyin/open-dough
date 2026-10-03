// The dashboard's calls into the Cursor runner: a finished cursor-agent run,
// a kept terminal client, one browser socket bridged to that client, a launch
// hold that joins that client until the page attaches, and a read of the
// sessions that runner holds. The read does not start a runner or an agent.
// Starting and stopping the runner process lives in runnerProcess.ts. The
// launch hold lives in launchHold.ts. Callers outside this host still reach
// those operations here.
import http from "node:http";
import { homedir } from "node:os";
import { WebSocket, type RawData } from "ws";
import { terminalAttachFailedCode } from "../../../src/agentTerminal.ts";
import type { CursorRunnerStatus } from "../../../src/cursorRunnerSessions.ts";
import type { CursorSession } from "../../../src/hostSession.ts";
import type { TerminalSession } from "../../agentTerminals.ts";
import {
  cursorRunnerExecResult,
  cursorRunnerKeepResult,
  cursorRunnerSessionsResult,
  type CursorRunnerExec,
  type CursorRunnerKeepRequest,
  type CursorRunnerSessionsResult,
} from "./runnerProtocol.ts";
import {
  acceptingCursorRunnerPort,
  cursorRunnerPort,
  ensureCursorRunner,
  stopCursorRunner,
} from "./runnerProcess.ts";
import {
  closeCursorHolds,
  cursorRunnerAttachUrl,
  holdCursorClient,
  releaseCursorHold,
} from "./launchHold.ts";

export type { CursorRunnerExec };
export { ensureCursorRunner, stopCursorRunner };
export { closeCursorHolds, holdCursorClient, releaseCursorHold };

// The wire request, narrowed to a Cursor session. The runner rejects any
// other host.
export type CursorKeepRequest = Omit<CursorRunnerKeepRequest, "session"> & {
  readonly session: CursorSession;
};

export type CursorKeepResult =
  | { readonly kind: "kept" }
  | { readonly kind: "unreachable" }
  | { readonly kind: "missing" }
  | { readonly kind: "failed" };

function postJson(
  port: number,
  pathname: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<unknown> {
  const payload = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: "127.0.0.1",
        port,
        path: pathname,
        method: "POST",
        signal,
        headers: {
          "content-type": "application/json",
          "content-length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
          } catch (error) {
            reject(error instanceof Error ? error : new Error("Unreadable."));
          }
        });
      },
    );
    req.on("error", reject);
    req.end(payload);
  });
}

// One finished `cursor-agent` run inside the runner. Undefined when the
// runner cannot be reached, so the caller starts no local agent.
export async function execOnRunner(
  args: readonly string[],
  cwd: string | undefined,
  signal: AbortSignal,
  home = homedir(),
): Promise<CursorRunnerExec | undefined> {
  const port = await cursorRunnerPort(home);
  if (port === undefined) return undefined;
  try {
    const parsed = cursorRunnerExecResult.safeParse(
      await postJson(port, "/exec", { args, cwd }, signal),
    );
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

export type CursorRunnerSessionsRead =
  | {
      readonly kind: "running";
      readonly sessions: CursorRunnerSessionsResult["sessions"];
    }
  | { readonly kind: Exclude<CursorRunnerStatus, "running"> };

function getJson(port: number, pathname: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: "127.0.0.1",
        port,
        path: pathname,
        method: "GET",
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
          } catch (error) {
            reject(error instanceof Error ? error : new Error("Unreadable."));
          }
        });
      },
    );
    req.setTimeout(2_000, () => {
      req.destroy(new Error("The Cursor runner did not answer."));
    });
    req.on("error", reject);
    req.end();
  });
}

// The sessions a runner that is already up is holding. A missing runner is
// not running. A runner that accepts a connection and does not answer this
// read cannot be reached. Neither case starts a runner or an agent.
export async function readCursorRunnerSessions(
  home = homedir(),
): Promise<CursorRunnerSessionsRead> {
  const port = await acceptingCursorRunnerPort(home);
  if (port === undefined) return { kind: "not-running" };
  try {
    const parsed = cursorRunnerSessionsResult.safeParse(
      await getJson(port, "/sessions"),
    );
    return parsed.success
      ? { kind: "running", sessions: parsed.data.sessions }
      : { kind: "unreachable" };
  } catch {
    return { kind: "unreachable" };
  }
}

export async function keepCursorClient(
  request: CursorKeepRequest,
  home = homedir(),
): Promise<CursorKeepResult> {
  const port = await cursorRunnerPort(home);
  if (port === undefined) return { kind: "unreachable" };
  try {
    const parsed = cursorRunnerKeepResult.safeParse(
      await postJson(port, "/keep", request),
    );
    return parsed.success ? parsed.data : { kind: "unreachable" };
  } catch {
    return { kind: "unreachable" };
  }
}

// Forwards one admitted browser socket to the runner. The runner's own
// terminal registry owns the client. Closing this socket drops the join and
// does not hang the client up.
export async function bridgeCursorTerminal(
  browser: WebSocket,
  session: TerminalSession,
  home = homedir(),
): Promise<void> {
  const fail = () => {
    if (browser.readyState === WebSocket.OPEN) {
      browser.close(
        terminalAttachFailedCode,
        "The Cursor runner could not be reached.",
      );
    }
  };
  const port = await cursorRunnerPort(home);
  if (port === undefined || browser.readyState !== WebSocket.OPEN) {
    fail();
    return;
  }
  const runner = new WebSocket(cursorRunnerAttachUrl(port, session), {
    perMessageDeflate: false,
  });
  const pending: { data: RawData; binary: boolean }[] = [];
  let opened = false;
  browser.on("message", (data, binary) => {
    if (!opened) {
      pending.push({ data, binary });
      return;
    }
    if (runner.readyState === WebSocket.OPEN) runner.send(data, { binary });
  });
  browser.on("close", () => {
    if (runner.readyState === WebSocket.CONNECTING) runner.terminate();
    else if (runner.readyState === WebSocket.OPEN) runner.close();
  });
  runner.on("open", () => {
    opened = true;
    releaseCursorHold(session.session);
    for (const message of pending) {
      runner.send(message.data, { binary: message.binary });
    }
  });
  runner.on("message", (data, binary) => {
    if (browser.readyState === WebSocket.OPEN) browser.send(data, { binary });
  });
  runner.on("close", (code, reason) => {
    if (
      browser.readyState === WebSocket.OPEN ||
      browser.readyState === WebSocket.CLOSING
    ) {
      const usable = code === 1005 || code === 1006 ? 1000 : code;
      try {
        browser.close(usable, reason);
      } catch {
        browser.terminate();
      }
    }
  });
  runner.on("error", () => {
    if (!opened) fail();
  });
}
