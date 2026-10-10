// What any launch spec on the real installed start shares: the queued story's
// slug and launch request, and a preview dashboard reading the origin's
// project folder.

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

// A preview dashboard on the origin's machine, reading its project folder.
export function startPreview(
  origin: StartOrigin,
  codexProtocol?: FakeCodex,
): Promise<DashboardServer> {
  return startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    machine: origin.machine,
    projectFolders: ["open-dough"],
    launchTimeoutMs: 30_000,
    ...(codexProtocol === undefined ? {} : { codexProtocol }),
  });
}
