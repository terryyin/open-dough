// A forwarding stand-in for the Cursor runner's address that can hold
// `GET /sessions` reads, and keeping the kept record's session through
// the runner again while such a read is held.
import http from "node:http";
import net from "node:net";
import type { Duplex } from "node:stream";
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  cursorRunnerAddressFile,
  readCursorRunnerAddress,
} from "../../server/hosts/cursor/runnerPaths.ts";
import { computeRunnerBuildId } from "../../server/hosts/cursor/runnerBuild.ts";
import {
  ensureCursorRunner,
  type CursorKeepResult,
} from "../../server/hosts/cursor/runnerClient.ts";
import { acceptingCursorRunnerPort } from "../../server/hosts/cursor/runnerProcess.ts";
import { cursorRunnerKeepResult } from "../../server/hosts/cursor/runnerProtocol.ts";
import { serverBundleVariable } from "./serverBundle.ts";
import { rawRequest } from "./rawHttp.ts";
import { cursorTerminalSize } from "../../server/hosts/cursor/terminal.ts";
import { keptRecord } from "./cursorStart.ts";

export type HeldRunnerReads = {
  // Holds every `GET /sessions` read from now on, unanswered.
  hold: () => void;
  // Forwards the sessions reads held so far, and every later one.
  release: () => void;
  // How many `GET /sessions` reads have reached the stand-in, held or not.
  sessionsReads: () => number;
  // Restores the runner's own address and closes the stand-in.
  close: () => Promise<void>;
};

// Installed before the journey's first runner traffic so every dashboard
// read of the runner passes through it (an address swapped in later cannot
// intercept reads on connections the dashboard already holds open to the
// real runner). It forwards each request to the real runner — terminal
// upgrades by raw socket — until `hold`, from when `GET /sessions` reads
// are held (unanswered, not refused) until `release`. A journey uses the
// hold to act while a stop's confirmation read is still on its way — for
// example to have the runner hold a session again before that read is
// answered — without a sleep: the held read itself is the synchronization.
// The hold must stay well under the reading client's own answer timeout.
// The build proof the dashboard serving this journey checks new work
// against: the bundled runner's identity when this run bundles the server
// (preview/boundary journeys), the source runner's otherwise. The real
// runner below is started from source by this worker, so its own proof
// names the source build; the stand-in forwards for that runner and must
// present the proof the dashboard expects of a current runner, or new
// work rightly replaces what it stands in for — by the address pid,
// which here is this worker.
function dashboardRunnerBuildId(): string {
  const bundle = process.env[serverBundleVariable];
  const bundled = bundle && path.join(bundle, "runnerMain.mjs");
  return bundled && existsSync(bundled)
    ? computeRunnerBuildId(bundled)
    : computeRunnerBuildId();
}

function isSessionsRead(request: http.IncomingMessage): boolean {
  return (
    request.method === "GET" &&
    (request.url ?? "").split("?")[0] === "/sessions"
  );
}

export async function holdRunnerSessionsReads(
  home: string,
): Promise<HeldRunnerReads> {
  if (!(await ensureCursorRunner(home))) {
    throw new Error("This home's Cursor runner could not start.");
  }
  const real = readCursorRunnerAddress(home);
  if (real === undefined) {
    throw new Error("This home has no Cursor runner to stand in for.");
  }
  const buildId = dashboardRunnerBuildId();
  let holding = false;
  let sessionsReads = 0;
  const held: {
    request: http.IncomingMessage;
    response: http.ServerResponse;
  }[] = [];
  const forward = (
    request: http.IncomingMessage,
    response: http.ServerResponse,
  ) => {
    const upstream = http.request(
      {
        host: "127.0.0.1",
        port: real.port,
        path: request.url,
        method: request.method,
        headers: request.headers,
      },
      (answer) => {
        // A sessions answer carries the real (source) runner's proof;
        // restate it as the current proof above, as the address does.
        if (isSessionsRead(request)) {
          const chunks: Buffer[] = [];
          answer.on("data", (chunk: Buffer) => chunks.push(chunk));
          answer.on("end", () => {
            try {
              const body = JSON.stringify({
                ...(JSON.parse(
                  Buffer.concat(chunks).toString("utf8"),
                ) as Record<string, unknown>),
                buildId,
              });
              response.writeHead(answer.statusCode ?? 502, {
                ...answer.headers,
                "content-length": Buffer.byteLength(body),
              });
              response.end(body);
            } catch {
              response.writeHead(answer.statusCode ?? 502, answer.headers);
              response.end(Buffer.concat(chunks));
            }
          });
          return;
        }
        response.writeHead(answer.statusCode ?? 502, answer.headers);
        answer.pipe(response);
      },
    );
    upstream.on("error", () => {
      if (!response.headersSent) response.writeHead(502);
      response.end();
    });
    response.on("error", () => upstream.destroy());
    request.pipe(upstream);
  };
  const standIn = http.createServer((request, response) => {
    if (isSessionsRead(request)) sessionsReads += 1;
    if (holding && isSessionsRead(request)) {
      request.pause();
      held.push({ request, response });
      return;
    }
    forward(request, response);
  });
  const upgraded = new Set<Duplex>();
  standIn.on("upgrade", (request, socket, head) => {
    upgraded.add(socket);
    socket.on("close", () => upgraded.delete(socket));
    const upstream = net.connect(real.port, "127.0.0.1", () => {
      const headerLines: string[] = [];
      for (let index = 0; index < request.rawHeaders.length; index += 2) {
        headerLines.push(
          `${request.rawHeaders[index] ?? ""}: ${request.rawHeaders[index + 1] ?? ""}`,
        );
      }
      const raw = [
        `${request.method ?? "GET"} ${request.url ?? "/"} HTTP/${request.httpVersion}`,
        ...headerLines,
        "",
        "",
      ].join("\r\n");
      upstream.write(raw);
      if (head.length > 0) upstream.write(head);
      socket.pipe(upstream);
      upstream.pipe(socket);
    });
    upstream.on("error", () => socket.destroy());
    socket.on("error", () => upstream.destroy());
  });
  await new Promise<void>((resolve) => {
    standIn.listen(0, "127.0.0.1", () => {
      resolve();
    });
  });
  const address = standIn.address();
  if (address === null || typeof address === "string") {
    throw new Error("The stand-in runner did not bind a port.");
  }
  writeFileSync(
    cursorRunnerAddressFile(home),
    JSON.stringify({ ...real, port: address.port, pid: process.pid, buildId }),
  );
  return {
    hold() {
      holding = true;
    },
    release() {
      holding = false;
      for (const { request, response } of held.splice(0)) {
        forward(request, response);
        request.resume();
      }
    },
    sessionsReads: () => sessionsReads,
    close: () =>
      new Promise((resolve) => {
        writeFileSync(cursorRunnerAddressFile(home), JSON.stringify(real));
        for (const socket of upgraded) socket.destroy();
        standIn.closeAllConnections();
        standIn.close(() => {
          resolve();
        });
      }),
  };
}

// Keeps the kept record's own session through the runner again, as
// recovery asks for, so the runner holds that same session once more.
export async function rekeepKeptCursorSession(
  home: string,
): Promise<CursorKeepResult> {
  const record = keptRecord(home);
  if (record.session.host !== "cursor") {
    throw new Error("The kept record is not a Cursor session.");
  }
  const [command, ...args] = record.session.continuation.args;
  // This keep must land while sessions reads are held, and new work's
  // current-runner proof is itself a sessions read, so it would be held
  // too. Post the keep straight to the accepting runner (the stand-in,
  // which forwards it) whose current proof the gate already presents.
  const port = await acceptingCursorRunnerPort(home);
  if (port === undefined) return { kind: "unreachable" };
  const payload = JSON.stringify({
    command: command ?? "cursor-agent",
    args,
    cwd: record.session.continuation.workspace,
    cols: cursorTerminalSize.cols,
    rows: cursorTerminalSize.rows,
    sourceId: "open-dough",
    session: record.session,
  });
  try {
    const { body } = await rawRequest({
      url: `http://127.0.0.1:${port}/keep`,
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": String(Buffer.byteLength(payload)),
      },
      body: payload,
    });
    const parsed = cursorRunnerKeepResult.safeParse(JSON.parse(body));
    return parsed.success ? parsed.data : { kind: "unreachable" };
  } catch {
    return { kind: "unreachable" };
  }
}
