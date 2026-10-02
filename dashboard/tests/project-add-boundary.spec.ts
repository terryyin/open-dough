import http from "node:http";
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import {
  projectAddMachine,
  addedRepository,
  addedLocalPath,
} from "./support/projectAddMachine.ts";
import { rawRequest, abandonedRequest } from "./support/rawHttp.ts";
import { hangs } from "./support/fakeGitHub.ts";

let fixture: ReturnType<typeof projectAddMachine>;
test.beforeEach(() => {
  fixture = projectAddMachine();
});
test.afterEach(async () => fixture.close());
const body = JSON.stringify({
  githubUrl: `https://github.com/${addedRepository}`,
  localPath: addedLocalPath,
});

for (const mode of ["dev", "preview"] as const) {
  test(`Add admits only same-origin POST and returns published facts without checkout paths (${mode})`, async () => {
    const server = await fixture.start(mode);
    const url = `${server.baseURL}/__project-configuration/add`;
    const before = readFileSync(fixture.configurationFile(mode), "utf8");
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
    expect(readFileSync(fixture.configurationFile(mode), "utf8")).toBe(before);
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
}

for (const abandonment of ["disconnect", "deadline"] as const) {
  test(`Add validation ends gh on ${abandonment} and leaves the saved list untouched`, async () => {
    const server = await fixture.start(
      "preview",
      abandonment === "deadline" ? 500 : 30_000,
    );
    server.github.serve(addedRepository, hangs);
    const before = readFileSync(fixture.configurationFile("preview"), "utf8");
    const options = {
      url: `${server.baseURL}/__project-configuration/add`,
      method: "POST",
      headers: { Origin: server.origin, "Content-Type": "application/json" },
      body,
    };
    if (abandonment === "disconnect") {
      const request = abandonedRequest(options);
      await expect.poll(() => server.ghPid()).toBeGreaterThan(0);
      request.cutAfter(1);
    } else {
      const response = rawRequest(options);
      await expect.poll(() => server.ghPid()).toBeGreaterThan(0);
      expect((await response).status).toBe(503);
    }
    await expect.poll(() => server.ghExitedBy()).toBe("SIGTERM");
    expect(readFileSync(fixture.configurationFile("preview"), "utf8")).toBe(
      before,
    );
  });
}

test("server shutdown ends pending Add validation without writing configuration", async () => {
  const server = await fixture.start("preview");
  server.github.serve(addedRepository, hangs);
  const before = readFileSync(fixture.configurationFile("preview"), "utf8");
  abandonedRequest({
    url: `${server.baseURL}/__project-configuration/add`,
    method: "POST",
    headers: { Origin: server.origin, "Content-Type": "application/json" },
    body,
  });
  await expect.poll(() => server.ghPid()).toBeGreaterThan(0);
  const pid = server.ghPid();
  if (pid === undefined) throw new Error("The fake gh did not record its pid.");
  await fixture.stop(server);
  expect(() => process.kill(pid, 0)).toThrow();
  expect(readFileSync(fixture.configurationFile("preview"), "utf8")).toBe(
    before,
  );
});

test("an unfinished Add request body ends at the boundary deadline without validation or writes", async () => {
  const server = await fixture.start("preview", 100);
  const before = readFileSync(fixture.configurationFile("preview"), "utf8");
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
  expect(readFileSync(fixture.configurationFile("preview"), "utf8")).toBe(
    before,
  );
});
