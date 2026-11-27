// The local boundaries' own rules, as every server that mounts them keeps
// them. The bundled boundary server entry starts and serves under every
// boundary-mode backend spec (e.g. ../observation/host-status.spec.ts).
import path from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { expect, test } from "vitest";
import { boundaryMiddlewareChain } from "../../server/localBoundary.ts";
import { runnerArguments } from "../../server/hosts/cursor/runnerProcess.ts";
import {
  projectConfigurationFile,
  seededProjects,
} from "../../server/projectConfiguration.ts";

test("a request no boundary answers is not found, so no page is served", () => {
  const answered: { status?: number } = {};
  const response = {
    writeHead(status: number) {
      answered.status = status;
      return this;
    },
    end() {
      return this;
    },
  };
  boundaryMiddlewareChain().handle(
    { method: "GET", url: "/" } as IncomingMessage,
    response as unknown as ServerResponse,
  );
  expect(answered.status).toBe(404);
});

test("Node runs a bundled runner entry as it is and the source entry through its transform", () => {
  expect(runnerArguments("/bundle/runnerMain.mjs")).toEqual([
    "/bundle/runnerMain.mjs",
  ]);
  expect(runnerArguments("/src/runnerMain.ts")).toEqual([
    "--experimental-transform-types",
    "--no-warnings",
    "/src/runnerMain.ts",
  ]);
});

// Each project environment keeps its list in its own file under the
// server's machine directory; only production starts from a seeded list.
test("each project environment keeps its own configuration file and starting list", () => {
  const environments = ["development", "production"] as const;
  expect(
    environments.map((environment) => ({
      file: path.basename(projectConfigurationFile(environment)),
      seeded: seededProjects(environment).map(({ id }) => id),
    })),
  ).toEqual([
    { file: "projects-development.json", seeded: [] },
    {
      file: "projects-production.json",
      seeded: ["open-dough", "doughnut", "pygardon", "terry-talks"],
    },
  ]);
});
