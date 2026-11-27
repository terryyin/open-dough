// The worker's mounted dashboard server: which boundaries it mounts and how
// the worker owns it. Its runner stand-in is proven with the private HTTP
// fixture (../observation/private-http-stand-in-runner.spec.ts).
import { expect, test, vi } from "vitest";
import { localBoundaries } from "../../server/localBoundaries.ts";
import {
  mountedBoundaries,
  withMountedDashboard,
} from "../../test-support/support/mountedDashboardServer.ts";

// These cases exercise boundary selection and ownership without recording incidents.
vi.mock(import("../../server/incidentRecord.ts"), () => ({}));

const aDashboard = () => ({ close: () => Promise.resolve() });

test("the mounted server mounts every local boundary but the incident record lifecycle", () => {
  expect(mountedBoundaries(localBoundaries).map(({ name }) => name)).toEqual(
    localBoundaries
      .map(({ name }) => name)
      .filter((name) => name !== "dough-incident-record"),
  );
});

test("a second mounted start is refused even while the first starts", async () => {
  let started: (dashboard: { close(): Promise<void> }) => void = () => {};
  const pending = withMountedDashboard(
    () =>
      new Promise<{ close(): Promise<void> }>((resolve) => {
        started = resolve;
      }),
  );
  await expect(
    withMountedDashboard(() => Promise.resolve(aDashboard())),
  ).rejects.toThrow(/already has a mounted dashboard server.*liveServer/);
  started(aDashboard());
  await (await pending).close();
});

test("a start refused at its port releases the worker", async () => {
  await expect(
    withMountedDashboard(() =>
      Promise.reject(new Error("listen EADDRINUSE: address already in use")),
    ),
  ).rejects.toThrow(/EADDRINUSE/);
  const next = await withMountedDashboard(() => Promise.resolve(aDashboard()));
  await next.close();
});
