// Which requests the project configuration boundary
// (../../server/projectConfigurationBoundary.ts) answers over raw HTTP: list
// and remove admit only same-origin requests with the method and content type
// they take, refuse unknown or malformed removals without writing, and never
// project checkout paths.
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, expect, test } from "vitest";
import { installProjectConfigurationMiddleware } from "../../server/projectConfigurationBoundary.ts";
import { projectConfigurationFile } from "../../server/projectConfiguration.ts";
import {
  projectListEndpoint,
  projectRemoveEndpoint,
} from "../../src/projectConfiguration.ts";
import {
  privateSettingsMachine,
  type PrivateSettingsMachine,
} from "../support/privateSettingsMachine.ts";
import {
  startInProcessBoundaryHttp,
  type InProcessBoundaryHttp,
} from "../../test-support/support/inProcessBoundaryHttp.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";

const publishedFields = ["backlogPath", "id", "label", "ref", "repository"];

let machine: PrivateSettingsMachine;
let server: InProcessBoundaryHttp;
beforeEach(async () => {
  machine = privateSettingsMachine();
  server = await startInProcessBoundaryHttp(
    {
      name: "dough-project-configuration",
      install: installProjectConfigurationMiddleware,
    },
    "production",
  );
});
afterEach(async () => {
  try {
    await server.closeBoundary();
    await server.closeHttp();
  } finally {
    machine.close();
  }
});

const foreignHeaders = () => [
  { Origin: "http://other.example" },
  { "Sec-Fetch-Site": "cross-site" },
  { Origin: server.origin, Host: "other.example" },
  {},
];

test("project list stays local and omits checkout paths", async () => {
  const url = `${server.origin}${projectListEndpoint}`;
  const response = await rawRequest({
    url,
    headers: { "Sec-Fetch-Site": "same-origin" },
  });
  expect(response.status).toBe(200);
  expect(response.headers["cache-control"]).toBe("no-store");
  const projects = JSON.parse(response.body) as Record<string, unknown>[];
  expect(projects.map((project) => project["id"])).toEqual([
    "open-dough",
    "doughnut",
    "pygardon",
    "terry-talks",
  ]);
  for (const project of projects)
    expect(Object.keys(project).sort()).toEqual(publishedFields);
  for (const headers of foreignHeaders())
    expect((await rawRequest({ url, headers })).status).toBe(403);
  expect(
    (
      await rawRequest({
        url,
        method: "POST",
        headers: { Origin: server.origin },
      })
    ).status,
  ).toBe(405);
  expect(machine.commandCalls()).toBe("");
});

test("remove protects the local boundary, writes only configuration and projects no local paths", async () => {
  const file = projectConfigurationFile("production");
  const before = readFileSync(file, "utf8");
  const url = `${server.origin}${projectRemoveEndpoint}`;
  const body = JSON.stringify({ id: "open-dough" });
  for (const headers of foreignHeaders())
    expect(
      (await rawRequest({ url, method: "POST", headers, body })).status,
    ).toBe(403);
  const headers = {
    Origin: server.origin,
    "Content-Type": "application/json",
  };
  for (const method of ["GET", "PUT", "DELETE"])
    expect((await rawRequest({ url, method, headers })).status).toBe(405);
  expect(
    (
      await rawRequest({
        url,
        method: "POST",
        headers,
        body: JSON.stringify({ id: "absent" }),
      })
    ).status,
  ).toBe(404);
  expect(
    (await rawRequest({ url, method: "POST", headers, body: "{}" })).status,
  ).toBe(400);
  expect(
    (
      await rawRequest({
        url,
        method: "POST",
        headers: { Origin: server.origin },
        body,
      })
    ).status,
  ).toBe(415);
  expect(readFileSync(file, "utf8")).toBe(before);
  const removed = await rawRequest({ url, method: "POST", headers, body });
  expect(removed.status).toBe(200);
  expect(removed.headers["cache-control"]).toBe("no-store");
  const answer = JSON.parse(removed.body) as {
    projects: Record<string, unknown>[];
  };
  expect(answer.projects.map((project) => project["id"])).toEqual([
    "doughnut",
    "pygardon",
    "terry-talks",
  ]);
  for (const project of answer.projects)
    expect(Object.keys(project).sort()).toEqual(publishedFields);
  expect(
    (JSON.parse(readFileSync(file, "utf8")) as { id: string }[]).map(
      ({ id }) => id,
    ),
  ).toEqual(["doughnut", "pygardon", "terry-talks"]);
  expect(machine.commandCalls()).toBe("");
});
