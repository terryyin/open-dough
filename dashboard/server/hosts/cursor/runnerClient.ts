// Dashboard calls into the Cursor runner: exec, keep, hangup, handoff
// release, and a sessions read that starts nothing (see runnerProcess.ts).
// Bridging a terminal to a held client lives in `./terminalBridge.ts`.
import http from "node:http";
import { homedir } from "node:os";
import type { CursorRunnerStatus } from "../../../src/cursorRunnerSessions.ts";
import type { CursorSession } from "../../../src/hostSession.ts";
import {
  cursorRunnerExecResult,
  cursorRunnerKeepResult,
  cursorRunnerSessionsResult,
  type CursorRunnerExec,
  type CursorRunnerKeepRequest,
  type CursorRunnerKeepResult,
  type CursorRunnerSessionsResult,
} from "./runnerProtocol.ts";
import {
  acceptingCursorRunnerPort,
  cursorRunnerPort,
  ensureCursorRunner,
  stopCursorRunner,
} from "./runnerProcess.ts";
export type { CursorRunnerExec };
export { ensureCursorRunner, stopCursorRunner };

// Drops launch handoffs on this server's way out without starting a runner.
export async function releaseCursorHandoffs(home = homedir()): Promise<void> {
  const port = await acceptingCursorRunnerPort(home);
  if (port === undefined) return;
  try {
    await postJson(port, "/release-handoffs", {});
  } catch {
    // The runner is already gone.
  }
}

// Wire keep request narrowed to a Cursor session.
export type CursorKeepRequest = Omit<CursorRunnerKeepRequest, "session"> & {
  readonly session: CursorSession;
};

export type CursorKeepResult =
  CursorRunnerKeepResult | { readonly kind: "unreachable" };

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

// Sessions a running runner holds. Missing or silent runners start nothing.
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

// Hangs up one kept client when recovery must leave none. Answers whether
// the hangup reached the runner; existing callers may ignore that, while
// stop must know delivery alone from confirmed cessation.
export async function hangupCursorClient(
  session: CursorSession,
  home = homedir(),
  signal?: AbortSignal,
): Promise<boolean> {
  const port = await acceptingCursorRunnerPort(home);
  if (port === undefined) return false;
  try {
    await postJson(port, "/hangup", { session }, signal);
    return true;
  } catch {
    // The runner is already gone.
    return false;
  }
}
