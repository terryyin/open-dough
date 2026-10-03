// Real Git origin and installed execution-start. Only cursor-agent is a fixture.
import { test as base } from "../dashboardTest.ts";
import { installFakeCursor, type FakeCursor } from "./fakeCursor.ts";
import { startOrigin, type StartOrigin } from "./startOrigin.ts";
export { expect } from "../dashboardTest.ts";

export const test = base.extend<{
  origin: StartOrigin;
  cursor: FakeCursor;
}>({
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
  // eslint-disable-next-line no-empty-pattern
  cursor: async ({}, use) => {
    const cursor = installFakeCursor();
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
test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 30_000 });

// Cursor keeps working after its launch instruction, so the launch client is
// not hung up as idle before the page's terminal joins it.
export const workingCursorTest = test.extend<{ cursor: FakeCursor }>({
  // eslint-disable-next-line no-empty-pattern
  cursor: async ({}, use) => {
    const cursor = installFakeCursor({ screen: "working" });
    await use(cursor);
    cursor.cleanup();
  },
});
