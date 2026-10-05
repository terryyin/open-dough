// Real Git origin and installed execution-start. Only cursor-agent is a fixture.
// A spec sets `cursorScreen` to choose the attach screen the fixture paints,
// and `cursorSplitPaintMs` to deliver each screen in two writes that far apart.
// `keptRecord` reads the one session the dashboard kept for the project.
import { readFileSync } from "node:fs";
import path from "node:path";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { test as base } from "../dashboardTest.ts";
import {
  installFakeCursor,
  type CursorScreen,
  type FakeCursor,
} from "./fakeCursor.ts";
import { launchWaitMs } from "./launchWait.ts";
import { startOrigin, type StartOrigin } from "./startOrigin.ts";
export { expect } from "../dashboardTest.ts";

export const test = base.extend<{
  origin: StartOrigin;
  cursorScreen: CursorScreen | undefined;
  cursorSplitPaintMs: number | undefined;
  cursor: FakeCursor;
}>({
  cursorScreen: [undefined, { option: true }],
  cursorSplitPaintMs: [undefined, { option: true }],
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
  cursor: async ({ cursorScreen, cursorSplitPaintMs }, use) => {
    const cursor = installFakeCursor({
      ...(cursorScreen === undefined ? {} : { screen: cursorScreen }),
      ...(cursorSplitPaintMs === undefined
        ? {}
        : { splitPaintMs: cursorSplitPaintMs }),
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
