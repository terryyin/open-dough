// Two dashboard servers and the installed CI diagnostic entry
// (ci-github-diagnostic.mjs) as separate processes of one user on one
// machine: one HOME, one synthetic `gh` and one fake GitHub, so all three ask
// GitHub through one request owner (github-request-owner.mjs) at an endpoint
// of this fixture's own.

import { execFile } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ownerRecords } from "../../../src/skills/dough-execute-plan/scripts/github-request-owner-test-fixtures.mjs";
import {
  developmentBoundary,
  startDashboardServer,
  type DashboardServer,
} from "./dashboardServer.ts";
import { endFakeGh, fakeGhEnv, installFakeGh } from "./fakeGh.ts";
import {
  everyRepository,
  startFakeGitHub,
  type GhCall,
  type RepositoryAnswerer,
} from "./fakeGitHub.ts";
import { refusedMarker } from "./sharedReads.ts";

const diagnosticEntry = fileURLToPath(
  new URL(
    "../../../src/skills/dough-execute-plan/scripts/ci-github-diagnostic.mjs",
    import.meta.url,
  ),
);

export const isWorkflowRead = ({ argv }: GhCall) =>
  argv.some((argument) => argument.includes("/actions/workflows/"));

// Answers the CI engine's workflow read as GitHub does, and every other
// request as `published` does.
export function withWorkflow(
  published: RepositoryAnswerer,
): RepositoryAnswerer {
  return (call) =>
    isWorkflowRead(call)
      ? Promise.resolve({
          status: 200,
          contentType: "application/json; charset=utf-8",
          body: JSON.stringify({ id: 7001, name: "CI", state: "active" }),
        })
      : published(call);
}

export type CiRead = {
  readonly exitCode: number;
  readonly stdout: string;
  readonly stderr: string;
};

export async function dashboardsOnOneOwner() {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-one-owner-"));
  const github = await startFakeGitHub();
  const gh = installFakeGh(machine);
  const start = () =>
    startDashboardServer({
      ...developmentBoundary,
      github,
      machine,
      pathPrefix: [gh.binDir],
      requestOwnerRoot: gh.requestOwnerRoot,
    });
  const first = await start();
  const second = await start();
  const open = new Set<DashboardServer>([first, second]);
  const close = async (server: DashboardServer) => {
    if (open.delete(server)) await server.close();
  };
  return {
    github,
    first,
    second,
    serve: (answerer: RepositoryAnswerer) => {
      github.serve(everyRepository, answerer);
    },
    // Resolves once both servers' earlier requests wait on their `gh` calls.
    async reached() {
      for (const server of open) await refusedMarker(server);
    },
    // The installed diagnostic entry reading the selected workflow, as a
    // process of its own with the dashboards' HOME and `gh`.
    ciWorkflowRead: () =>
      new Promise<CiRead>((resolve) => {
        execFile(
          process.execPath,
          [diagnosticEntry, "workflow", "example/sample-app"],
          {
            env: {
              ...process.env,
              ...fakeGhEnv(gh, github.url),
              HOME: first.home,
            },
          },
          (error, stdout, stderr) => {
            const code = error === null ? 0 : error.code;
            resolve({
              exitCode: typeof code === "number" ? code : -1,
              stdout,
              stderr,
            });
          },
        );
      }),
    // Every owner that ever stood at the endpoint the three share.
    owners: () => ownerRecords(gh.requestOwnerRoot) as { pid: number }[],
    close,
    async closeAll() {
      for (const server of [...open]) await close(server);
      await endFakeGh(gh);
      await github.close();
      rmSync(machine, { recursive: true, force: true });
    },
  };
}
