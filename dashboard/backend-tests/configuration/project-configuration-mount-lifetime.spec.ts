import { expect, test } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { ProjectEnvironment } from "../../server/projectConfiguration.ts";
import { installProjectConfigurationMiddleware } from "../../server/projectConfigurationBoundary.ts";
import { projectListEndpoint } from "../../src/projectConfiguration.ts";
import { startInProcessBoundaryHttp } from "../../test-support/support/inProcessBoundaryHttp.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";
import { withRestoredEnv } from "../../test-support/support/testEnv.ts";

async function mountProjectList(environment: ProjectEnvironment) {
  const home = mkdtempSync(path.join(tmpdir(), "dough-mounted-projects-"));
  const restore = withRestoredEnv({ HOME: home });
  const releaseHome = () => {
    restore();
    rmSync(home, { recursive: true, force: true });
  };
  try {
    const server = await startInProcessBoundaryHttp(
      {
        name: "dough-project-configuration",
        install: installProjectConfigurationMiddleware,
      },
      environment,
    );
    return {
      async projectIds() {
        const response = await rawRequest({
          url: `${server.origin}${projectListEndpoint}`,
          headers: { Origin: server.origin },
        });
        expect(response.status).toBe(200);
        const projects = JSON.parse(response.body) as { id: string }[];
        return projects.map(({ id }) => id);
      },
      async close() {
        try {
          await server.closeBoundary();
        } finally {
          try {
            await server.closeHttp();
          } finally {
            releaseHome();
          }
        }
      },
    };
  } catch (error) {
    releaseHome();
    throw error;
  }
}

test("a production mount reads the seeded projects after the development mount closes", async () => {
  const development = await mountProjectList("development");
  try {
    expect(await development.projectIds()).toEqual([]);
  } finally {
    await development.close();
  }

  const production = await mountProjectList("production");
  try {
    expect(await production.projectIds()).toEqual([
      "open-dough",
      "doughnut",
      "pygardon",
      "terry-talks",
    ]);
  } finally {
    await production.close();
  }
});

test("a running development mount refuses a second project environment", async () => {
  const development = await mountProjectList("development");
  try {
    await expect(
      mountProjectList("production").then((production) => production.close()),
    ).rejects.toThrow(
      "A dashboard server cannot use both project environments.",
    );
  } finally {
    await development.close();
  }
});
