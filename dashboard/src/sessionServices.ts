// The page's calls for a shown session: its final report, this machine's host
// status, the Cursor runner's sessions and its terminal's socket. The composition root supplies the
// authenticated implementations through `./pageReads.tsx`.

import { readRunningCursorSessions } from "./agentLaunchClient.ts";
import type { LaunchRecord } from "./agentLaunch.ts";
import {
  agentTerminalEndpoint,
  terminalSessionQuery,
} from "./agentTerminal.ts";
import {
  finalReportEndpoint,
  finalReportSchema,
  type FinalReportRead,
} from "./finalReportContract.ts";
import { readHostStatus, type HostStatus } from "./hostStatus.ts";

// Which session's final report a read asks for.
export type FinalReportSubject = {
  readonly source: string;
  readonly host: LaunchRecord["session"]["host"];
  readonly session: string;
};

// What a terminal attachment uses of its socket, opened for binary frames.
export type TerminalSocket = {
  readonly binaryType: BinaryType;
  readonly readyState: number;
  send(data: string): void;
  close(): void;
  addEventListener<K extends "open" | "message" | "close">(
    type: K,
    listener: (event: WebSocketEventMap[K]) => void,
  ): void;
};

export type SessionServices = {
  readonly readFinalReport: (
    subject: FinalReportSubject,
    signal: AbortSignal,
  ) => Promise<FinalReportRead>;
  readonly readHostStatus: (signal: AbortSignal) => Promise<HostStatus>;
  readonly readRunningCursorSessions: typeof readRunningCursorSessions;
  readonly openTerminal: (record: LaunchRecord) => TerminalSocket;
};

async function readFinalReport(
  subject: FinalReportSubject,
  signal: AbortSignal,
): Promise<FinalReportRead> {
  const query = new URLSearchParams(subject);
  const response = await fetch(`${finalReportEndpoint}?${query}`, {
    signal,
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Final report read refused");
  return finalReportSchema.parse(await response.json());
}

function openTerminal(record: LaunchRecord): TerminalSocket {
  const scheme = window.location.protocol === "https:" ? "wss:" : "ws:";
  const socket = new WebSocket(
    `${scheme}//${window.location.host}${agentTerminalEndpoint}?${terminalSessionQuery(record).toString()}`,
  );
  socket.binaryType = "arraybuffer";
  return socket;
}

export const authenticatedSessionServices: SessionServices = {
  readFinalReport,
  readHostStatus,
  readRunningCursorSessions,
  openTerminal,
};
