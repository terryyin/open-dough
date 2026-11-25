import http from "node:http";
import { once } from "node:events";
import { readFileSync } from "node:fs";
import type { AddressInfo } from "node:net";
import { expect, test } from "../../test-support/support/pageTest.ts";
import { machineHome } from "../../test-support/machineLaunchRecords.ts";
import { routeOriginThroughHome } from "../../test-support/support/fixtureOriginRoute.ts";
import {
  projectAddMachine,
  addedRepository,
  addedLocalPath,
} from "../../test-support/support/projectAddMachine.ts";
import {
  rawRequest,
  abandonedRequest,
} from "../../test-support/support/rawHttp.ts";

let fixture: ReturnType<typeof projectAddMachine>;
test.beforeEach(() => {
  fixture = projectAddMachine();
});
test.afterEach(async () => fixture.close());
const body = JSON.stringify({
  githubUrl: `https://github.com/${addedRepository}`,
  localPath: addedLocalPath,
});

test("Add admits only same-origin POST and returns published facts without checkout paths", async () => {
  const server = await fixture.start("boundary");
  const url = `${server.baseURL}/__project-configuration/add`;
  const before = readFileSync(fixture.configurationFile("boundary"), "utf8");
  for (const headers of [
    {},
    { Origin: "http://other.example" },
    { Origin: server.origin, Host: "other.example" },
  ]) {
    const response = await rawRequest({
      url,
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body,
    });
    expect(response.status).toBe(403);
  }
  expect(
    (await rawRequest({ url, headers: { Origin: server.origin } })).status,
  ).toBe(405);
  expect(server.ghCalls()).toEqual([]);
  expect(readFileSync(fixture.configurationFile("boundary"), "utf8")).toBe(
    before,
  );
  const response = await rawRequest({
    url,
    method: "POST",
    headers: { Origin: server.origin, "Content-Type": "application/json" },
    body,
  });
  expect(response.status).toBe(200);
  expect(response.headers["cache-control"]).toBe("no-store");
  const answer = JSON.parse(response.body) as {
    project: Record<string, unknown>;
    projects: Record<string, unknown>[];
  };
  expect(Object.keys(answer.project).sort()).toEqual([
    "backlogPath",
    "id",
    "label",
    "ref",
    "repository",
  ]);
  expect(answer.projects.at(-1)).toEqual(answer.project);
  expect(response.body).not.toContain(addedLocalPath);
  expect(server.claudeCalls()).toEqual([]);
});

test.describe("Add validation with a pending Git request", () => {
  let origin: http.Server | undefined;
  let requested: (string | undefined)[];
  let closed: number;

  test.beforeEach(async () => {
    requested = [];
    closed = 0;
    origin = http.createServer((req, res) => {
      requested.push(req.url);
      res.once("close", () => {
        closed += 1;
      });
    });
    await once(origin.listen(0, "127.0.0.1"), "listening");
    const { port } = origin.address() as AddressInfo;
    routeOriginThroughHome(
      machineHome(fixture.machine),
      `http://127.0.0.1:${String(port)}/sample-app.git`,
      addedRepository,
    );
  });

  test.afterEach(async () => {
    const pendingOrigin = origin;
    origin = undefined;
    if (pendingOrigin === undefined) return;
    pendingOrigin.closeAllConnections();
    await new Promise<void>((resolve) => {
      pendingOrigin.close(() => {
        resolve();
      });
    });
  });

  async function prepareAdd(readTimeoutMs = 30_000) {
    const server = await fixture.start("boundary", readTimeoutMs);
    const configuration = fixture.configurationFile("boundary");
    return {
      server,
      configuration,
      before: readFileSync(configuration, "utf8"),
      options: {
        url: `${server.baseURL}/__project-configuration/add`,
        method: "POST",
        headers: { Origin: server.origin, "Content-Type": "application/json" },
        body,
      },
    };
  }

  async function expectTransportReached() {
    await expect
      .poll(() => requested)
      .toEqual(["/sample-app.git/info/refs?service=git-upload-pack"]);
  }

  async function expectAddEnded(configuration: string, before: string) {
    await expect.poll(() => closed).toBe(1);
    expect(readFileSync(configuration, "utf8")).toBe(before);
  }

  test("disconnect ends the transport without writing configuration", async () => {
    const { configuration, before, options } = await prepareAdd();
    const request = abandonedRequest(options);
    await expectTransportReached();
    request.cutAfter(1);
    await expectAddEnded(configuration, before);
  });

  test("the deadline ends the transport without writing configuration", async () => {
    // Allow the request to reach the transport under CI load.
    const { configuration, before, options } = await prepareAdd(3_000);
    expect((await rawRequest(options)).status).toBe(503);
    await expectTransportReached();
    await expectAddEnded(configuration, before);
  });

  test("shutdown ends the transport without writing configuration", async () => {
    const { server, configuration, before, options } = await prepareAdd();
    abandonedRequest(options);
    await expectTransportReached();
    await fixture.stop(server);
    await expectAddEnded(configuration, before);
  });
});

test("an unfinished Add request body ends at the boundary deadline without validation or writes", async () => {
  const server = await fixture.start("boundary", 100);
  const before = readFileSync(fixture.configurationFile("boundary"), "utf8");
  let request: http.ClientRequest | undefined;
  const status = await new Promise<number>((resolve, reject) => {
    request = http.request(
      `${server.baseURL}/__project-configuration/add`,
      {
        method: "POST",
        headers: { Origin: server.origin, "Content-Type": "application/json" },
      },
      (response) => {
        response.resume();
        response.on("end", () => {
          resolve(response.statusCode ?? 0);
        });
      },
    );
    request.on("error", reject);
    request.write('{"githubUrl":');
  });
  request?.destroy();
  expect(status).toBe(503);
  expect(server.ghCalls()).toEqual([]);
  expect(readFileSync(fixture.configurationFile("boundary"), "utf8")).toBe(
    before,
  );
});
