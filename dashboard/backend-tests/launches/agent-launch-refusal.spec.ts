import { mkdtempSync, rmSync } from "node:fs";
import {
  IncomingMessage,
  ServerResponse,
  type IncomingHttpHeaders,
} from "node:http";
import { Socket } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { AgentLaunches } from "../../server/agentLaunches.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { answer } from "../../server/launchBoundaryAnswer.ts";
import { machineFolder } from "../../server/localFolder.ts";
import { MachineSessionObservation } from "../../server/machineSessionObservation.ts";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import { ReviewInitialSync } from "../../server/reviewInitialSync.ts";
import {
  agentAcceptEndpoint,
  agentChangedEndpoint,
  agentContinueEndpoint,
  agentLaunchEndpoint,
} from "../../src/agentLaunch.ts";

const host = "127.0.0.1:4173";
const origin = `http://${host}`;
const fromDashboard: IncomingHttpHeaders = { host, origin };
const source = makeMe.aPublishedSource.openDough.please();
const identity = "SEED-052#launch-claude-planned-execution";
const title = "Launch execution in a Claude Code background session";
const launch = makeMe.aLaunchRequest
  .executing({ source: source.id, identity, title })
  .please();
const unknownAttempt = "00000000-0000-4000-8000-000000000000";

type RequestInput = {
  readonly method?: string;
  readonly headers?: IncomingHttpHeaders;
  readonly body?: string;
};

// Exercise the production answer on a request stream without starting a server.
function launchBoundary() {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-launch-refusal-"));
  vi.stubEnv("HOME", machine);
  if (process.platform === "win32") vi.stubEnv("USERPROFILE", machine);
  onTestFinished(() => {
    vi.unstubAllEnvs();
    rmSync(machine, { recursive: true, force: true });
  });
  onTestFinished(mountProjectConfiguration("development"));
  appendConfiguredProject(
    makeMe.aConfiguredProject.with({ ...source, localPath: machine }).please(),
  );

  const doneMarks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => undefined,
    reportingFolder: machineFolder,
  });
  const launches = new AgentLaunches(doneMarks);
  const start = vi.spyOn(launches, "accept").mockImplementation(() => {
    throw new Error("Unexpected Start dispatch.");
  });
  const continueAttempt = vi
    .spyOn(launches, "continueAttempt")
    .mockImplementation(() => {
      throw new Error("Unexpected Continue dispatch.");
    });
  const readSessions = vi.fn(() => {
    throw new Error("Unexpected machine session read.");
  });
  const sessions = new MachineSessionObservation(
    readSessions,
    () => Promise.resolve([]),
    { waitMs: 1, reuseMs: 0 },
  );
  const initialSync = new ReviewInitialSync();

  async function send(
    route: string,
    { method = "GET", headers = fromDashboard, body }: RequestInput = {},
  ) {
    const socket = new Socket();
    Object.defineProperty(socket, "remoteAddress", { value: "127.0.0.1" });
    const request = new IncomingMessage(socket);
    request.method = method;
    request.url = route;
    request.headers = headers;
    if (body !== undefined) request.push(Buffer.from(body));
    request.push(null);
    try {
      return await answer(
        request,
        new URL(route, origin),
        new ServerResponse(request),
        launches,
        doneMarks,
        sessions,
        { nudge: vi.fn() },
        initialSync,
      );
    } finally {
      socket.destroy();
    }
  }

  async function expectRefusal(
    route: string,
    status: number,
    request?: RequestInput,
  ) {
    const response = await send(route, request);
    expect(response.status).toBe(status);
    expect(response).toHaveProperty("body.error", expect.any(String));
    expect(start).not.toHaveBeenCalled();
    expect(continueAttempt).not.toHaveBeenCalled();
  }

  return { send, expectRefusal, readSessions };
}

function jsonPost(body: unknown, headers = fromDashboard) {
  return {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  };
}

const foreignRequests = [
  { name: "from another site", headers: { host, origin: "http://other.test" } },
  { name: "with no Origin", headers: { host } },
  {
    name: "marked cross-site",
    headers: { host, "sec-fetch-site": "cross-site" },
  },
];

test.each([
  ...foreignRequests,
  {
    name: "naming a foreign Host",
    headers: { host: "other.test", origin: "http://other.test" },
  },
])("refuses a Start $name before dispatch", async ({ headers }) => {
  await launchBoundary().expectRefusal(
    agentAcceptEndpoint,
    403,
    jsonPost(launch, headers),
  );
});

for (const [name, invalid] of [
  ["naming an activity as its workflow", { workflow: "preparation" }],
  ["with an unknown workflow", { workflow: "review" }],
  ["with an empty identity", { identity: "" }],
  ["with a multi-line identity", { identity: `${identity}\n--help` }],
  ["with an oversized title", { title: "x".repeat(201) }],
  ["with a multi-line title", { title: `${title}\rmore` }],
  ["with an empty title", { title: "" }],
  ["with an oversized instruction", { instruction: "x".repeat(4_001) }],
] as const) {
  test(`refuses a Start ${name} before dispatch`, async () => {
    await launchBoundary().expectRefusal(
      agentAcceptEndpoint,
      400,
      jsonPost({ ...launch, ...invalid }),
    );
  });
}

test("refuses a Start for an unknown project before dispatch", async () => {
  await launchBoundary().expectRefusal(
    agentAcceptEndpoint,
    404,
    jsonPost({ ...launch, source: "not-a-real-project" }),
  );
});

test("refuses a Start whose JSON body is an array before dispatch", async () => {
  await launchBoundary().expectRefusal(agentAcceptEndpoint, 400, jsonPost([]));
});

test.each([
  { contentType: "text/plain", body: JSON.stringify(launch), status: 415 },
  { contentType: "application/json", body: "{not json", status: 400 },
])(
  "refuses a non-JSON Start with $contentType before dispatch",
  async ({ contentType, body, status }) => {
    await launchBoundary().expectRefusal(agentAcceptEndpoint, status, {
      method: "POST",
      headers: { ...fromDashboard, "content-type": contentType },
      body,
    });
  },
);

test("refuses a Continue with a malformed attempt before dispatch", async () => {
  await launchBoundary().expectRefusal(
    agentContinueEndpoint,
    400,
    jsonPost({ source: source.id, attempt: "not-an-attempt" }),
  );
});

test.each(foreignRequests)(
  "refuses a machine session read $name",
  async ({ headers }) => {
    const boundary = launchBoundary();
    await boundary.expectRefusal(agentLaunchEndpoint, 403, { headers });
    expect(boundary.readSessions).not.toHaveBeenCalled();
  },
);

test.each(["POST", "PUT", "DELETE", "PATCH"])(
  "refuses %s on the machine sessions read route before dispatch",
  async (method) => {
    await launchBoundary().expectRefusal(agentLaunchEndpoint, 405, { method });
  },
);

test("refuses an attempt change read from another site", async () => {
  await launchBoundary().expectRefusal(
    `${agentChangedEndpoint}?attempt=${unknownAttempt}`,
    403,
    { headers: { host, origin: "http://other.test" } },
  );
});

test.each([
  "attempt=not-an-attempt",
  `attempt=${unknownAttempt}&seen=-1`,
  `attempt=${unknownAttempt}&seen=1.5`,
  `attempt=${unknownAttempt}&seen=some`,
])("refuses an attempt change read with %s", async (query) => {
  await launchBoundary().expectRefusal(`${agentChangedEndpoint}?${query}`, 400);
});

test("answers the change read for an attempt no server runs", async () => {
  const response = await launchBoundary().send(
    `${agentChangedEndpoint}?attempt=${unknownAttempt}`,
  );
  expect(response).toEqual({ status: 200, body: { changed: true } });
});
