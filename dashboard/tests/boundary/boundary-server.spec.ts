// What every boundary spec here starts: the local boundaries alone, run by
// Node from the run's bundle of ../../server/boundaryServer.ts, without Vite
// or an app build, in the
// project environment the spec names.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { test, expect } from "../support/pageTest.ts";
import { startDashboardServer } from "../support/dashboardServer.ts";
import {
  otherProjectEnvironment,
  projectConfigurationFile,
} from "../support/projectConfiguration.ts";
import { boundaryServerCommand } from "../support/serverAddress.ts";
import { serverBundleVariable } from "../support/serverBundle.ts";
import { rawRequest } from "../support/rawHttp.ts";

test("a boundary-mode server is the Node entry alone, naming no Vite and serving no page", async () => {
  const bundle = process.env[serverBundleVariable];
  expect(bundle).toBeDefined();
  expect(boundaryServerCommand.args).toEqual([
    path.join(bundle ?? "", "boundaryServer.mjs"),
  ]);
  const server = await startDashboardServer({ mode: "boundary" });
  try {
    const command = execFileSync(
      "ps",
      ["-o", "command=", "-p", String(server.pid)],
      {
        encoding: "utf8",
      },
    ).trim();
    expect(command).toBe(
      [
        boundaryServerCommand.command,
        ...boundaryServerCommand.args,
        "--port",
        "0",
        "--environment",
        "production",
      ].join(" "),
    );
    expect(server.output()).not.toMatch(/vite/i);
    expect(server.outDir).toBeUndefined();
    expect(
      (await rawRequest({ url: `${server.baseURL}/`, method: "GET" })).status,
    ).toBe(404);
  } finally {
    await server.close();
  }
});

// The project list each environment answers comes from that environment's own
// file under the server's HOME, as the dev and preview servers keep theirs.
test("each project environment answers the project list from its own configuration file", async () => {
  const listed = async (environment: "development" | "production") => {
    const server = await startDashboardServer({
      mode: "boundary",
      environment,
      configureDevelopmentProjects: false,
    });
    try {
      const response = await rawRequest({
        url: `${server.baseURL}/__project-configuration`,
        headers: { "Sec-Fetch-Site": "same-origin" },
      });
      expect(response.status).toBe(200);
      const file = (named: "development" | "production") =>
        projectConfigurationFile(server.home, named);
      expect(existsSync(file(otherProjectEnvironment(environment)))).toBe(
        false,
      );
      const kept = JSON.parse(readFileSync(file(environment), "utf8")) as {
        id: string;
      }[];
      return {
        answered: (JSON.parse(response.body) as { id: string }[]).map(
          ({ id }) => id,
        ),
        kept: kept.map(({ id }) => id),
      };
    } finally {
      await server.close();
    }
  };
  const production = await listed("production");
  expect(production.answered).toEqual([
    "open-dough",
    "doughnut",
    "pygardon",
    "terry-talks",
  ]);
  expect(production.kept).toEqual(production.answered);
  const development = await listed("development");
  expect(development.answered).toEqual([]);
  expect(development.kept).toEqual([]);
});
