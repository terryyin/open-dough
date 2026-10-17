// What any launch spec on the real installed start shares: the queued story's
// slug and launch request, and a dashboard reading the origin's project
// folder: the built preview for a page journey, the boundary server for a
// boundary spec.

import type { SessionPolicy } from "../../src/agentLaunch.ts";
import { launchRequest } from "../agentLaunchBoundary.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./dashboardServer.ts";
import type { FakeCodex } from "./fakeCodex.ts";
import {
  queuedIdentity,
  queuedTitle,
  type StartOrigin,
} from "./startOrigin.ts";

export const slug = "prepare-the-queued-start";

export type Workflow = "execution" | "refinement";

// The queued story's launch request for one workflow, with a session policy
// when the launch chooses one.
export const requestFor = (workflow: Workflow, policy?: SessionPolicy) => ({
  ...launchRequest,
  workflow,
  identity: queuedIdentity,
  title: queuedTitle,
  instruction: "Keep it small.",
  ...(policy === undefined ? {} : { policy }),
});

type Mode = "preview" | "boundary";

const serverOf = (origin: StartOrigin, mode: Mode) => ({
  mode,
  ...(mode === "preview" ? { prebuilt: builtDashboardDir } : {}),
  machine: origin.machine,
  projectFolders: ["open-dough"],
  launchTimeoutMs: 30_000,
});

// A dashboard on the origin's machine, reading its project folder.
function start(
  origin: StartOrigin,
  mode: Mode,
  codexProtocol?: FakeCodex,
): Promise<DashboardServer> {
  return startDashboardServer({
    ...serverOf(origin, mode),
    ...(codexProtocol === undefined ? {} : { codexProtocol }),
  });
}

// That dashboard again, on the address a closed one served.
function restart(
  origin: StartOrigin,
  mode: Mode,
  address: string,
): Promise<DashboardServer> {
  return startDashboardServer({
    ...serverOf(origin, mode),
    port: Number(new URL(address).port),
  });
}

// The built preview a page journey opens.
export const startPreview = (origin: StartOrigin, codexProtocol?: FakeCodex) =>
  start(origin, "preview", codexProtocol);
export const restartPreview = (origin: StartOrigin, address: string) =>
  restart(origin, "preview", address);

// The boundary server a boundary spec drives over HTTP.
export const startBoundary = (origin: StartOrigin, codexProtocol?: FakeCodex) =>
  start(origin, "boundary", codexProtocol);
export const restartBoundary = (origin: StartOrigin, address: string) =>
  restart(origin, "boundary", address);
