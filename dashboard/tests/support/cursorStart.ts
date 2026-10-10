// Real Git origin and installed execution-start. Only cursor-agent is a fixture.
// A spec sets `cursorScreen` to choose the attach screen the fixture paints,
// `cursorSplitPaintMs` to deliver each screen in two writes that far apart,
// `cursorSubmitPaintMs` to keep a submitted paste chip on screen that long,
// and `cursorPaintDelayMs` to delay the first paint.
// `keptRecord` reads the one session the dashboard kept for the project.
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { test as base } from "../dashboardTest.ts";
import {
  installFakeCursor,
  type CursorScreen,
  type FakeCursor,
} from "./fakeCursor.ts";
import {
  deploymentLikeStart,
  type DeploymentLikeStart,
} from "./launchEnvironment.ts";
import { launchWaitMs } from "./launchWait.ts";
import { startOrigin, type StartOrigin } from "./startOrigin.ts";
export { expect } from "../dashboardTest.ts";

export const test = base.extend<{
  origin: StartOrigin;
  cursorScreen: CursorScreen | undefined;
  cursorSplitPaintMs: number | undefined;
  cursorSubmitPaintMs: number | undefined;
  cursorPaintDelayMs: number | undefined;
  cursor: FakeCursor;
}>({
  cursorScreen: [undefined, { option: true }],
  cursorSplitPaintMs: [undefined, { option: true }],
  cursorSubmitPaintMs: [undefined, { option: true }],
  cursorPaintDelayMs: [undefined, { option: true }],
  // eslint-disable-next-line no-empty-pattern
  origin: async ({}, use) => {
    const origin = await startOrigin(
      "terryyin/open-dough",
      "open-dough",
      "cursor",
    );
    await use(origin);
    origin.cleanup();
  },
  machine: async ({ origin }, use) => {
    await use(origin.machine);
  },
  cursor: async (
    {
      cursorScreen,
      cursorSplitPaintMs,
      cursorSubmitPaintMs,
      cursorPaintDelayMs,
    },
    use,
  ) => {
    const cursor = installFakeCursor({
      ...(cursorScreen === undefined ? {} : { screen: cursorScreen }),
      ...(cursorSplitPaintMs === undefined
        ? {}
        : { splitPaintMs: cursorSplitPaintMs }),
      ...(cursorSubmitPaintMs === undefined
        ? {}
        : { submitPaintMs: cursorSubmitPaintMs }),
      ...(cursorPaintDelayMs === undefined
        ? {}
        : { paintDelayMs: cursorPaintDelayMs }),
    });
    await use(cursor);
    cursor.cleanup();
  },
  extraEnv: async ({ cursor }, use) => {
    await use({ ...cursor.env });
  },
  pathPrefix: async ({ cursor }, use) => {
    await use([cursor.binDir]);
  },
});
test.use({ projectFolders: ["open-dough"], launchTimeoutMs: launchWaitMs });

// Cursor keeps working after its launch instruction, so the launch client is
// not hung up as idle before the page's terminal joins it.
export const workingCursorTest = test.extend({
  cursorScreen: "working",
});

// The same, from a server started as a deployment's is
// (./launchEnvironment.ts): its PATH directories come before `cursor-agent`'s.
export const deploymentCursorTest = workingCursorTest.extend<{
  deployment: DeploymentLikeStart;
}>({
  // eslint-disable-next-line no-empty-pattern
  deployment: async ({}, use) => {
    const start = deploymentLikeStart(
      mkdtempSync(path.join(tmpdir(), "dough-deployment-")),
    );
    start.create();
    await use(start);
    start.remove();
  },
  extraEnv: async ({ cursor, deployment }, use) => {
    await use({ ...cursor.env, ...deployment.extraEnv });
  },
  pathPrefix: async ({ cursor, deployment }, use) => {
    await use([...deployment.pathPrefix, cursor.binDir]);
  },
});

export function keptRecord(home: string): LaunchRecord {
  const kept = JSON.parse(
    readFileSync(
      path.join(home, ".open-dough", "dashboard", "agent-launches.json"),
      "utf8",
    ),
  ) as Record<string, LaunchRecord[]>;
  const [record] = kept["open-dough"] ?? [];
  if (record === undefined) throw new Error("No Cursor session was recorded.");
  return record;
}
