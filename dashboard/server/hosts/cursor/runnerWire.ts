// Low-level HTTP to an accepting Cursor runner port. Kept separate from
// ./runnerClient.ts so post-settle revival can keep/hangup/read without
// importing the current-runner ensure path (which would cycle through
// ./runnerCurrent.ts).
import http from "node:http";
import { homedir } from "node:os";
import type { CursorRunnerStatus } from "../../../src/cursorRunnerSessions.ts";
import type { CursorSession } from "../../../src/hostSession.ts";
import {
  cursorRunnerKeepResult,
  cursorRunnerSessionsResult,
  type CursorRunnerKeepRequest,
  type CursorRunnerKeepResult,
  type CursorRunnerSessionsResult,
} from "./runnerProtocol.ts";
import { acceptingCursorRunnerPort } from "./runnerProcess.ts";

export type CursorKeepRequest = Omit<CursorRunnerKeepRequest, "session"> & {
  readonly session: CursorSession;
};

export type CursorKeepResult =
  CursorRunnerKeepResult | { readonly kind: "unreachable" };

export type CursorRunnerSessionsRead =
  | {
      readonly kind: "running";
      readonly sessions: CursorRunnerSessionsResult["sessions"];
    }
  | { readonly kind: Exclude<CursorRunnerStatus, "running"> };

export function postJson(
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

// Posts keep to a runner already known to accept on `port`. Used by
// post-settle revival so resume does not re-enter ensureCurrentCursorRunner
// (nested keep during an in-flight ensure waits on the same promise).
export async function keepCursorClientAtPort(
  port: number,
  request: CursorKeepRequest,
): Promise<CursorKeepResult> {
  try {
    const parsed = cursorRunnerKeepResult.safeParse(
      await postJson(port, "/keep", request),
    );
    return parsed.success ? parsed.data : { kind: "unreachable" };
  } catch {
    return { kind: "unreachable" };
  }
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
    return false;
  }
}
