// The watcher refuses an unusable start before it prepares any deployment
// (../../server/productionWatcherStart.mjs, read first by
// ../../../scripts/watch-dashboard.mjs). An origin without published main is
// refused by production-deployment.spec.ts.
import { createServer, type AddressInfo } from "node:net";
import { expect, test } from "vitest";
import {
  expectUsablePort,
  loopbackPortOccupied,
  watcherOptions,
} from "../../server/productionWatcherStart.mjs";

test("watcher options default to port 4173 checked every 30 seconds", () => {
  expect(watcherOptions([])).toEqual({ port: 4173, checkInterval: 30_000 });
});

test("watcher options take a supplied port and check interval", () => {
  expect(watcherOptions(["--port", "0", "--check-interval", "5"])).toEqual({
    port: 0,
    checkInterval: 5,
  });
});

test.each([
  [["--port", "43127"], "distinct from development's 43127"],
  [["--port", "65536"], "Production port must be 0–65535"],
  [["--port", "41.5"], "Production port must be 0–65535"],
  [["--check-interval", "0"], "Check interval must be a positive number"],
  [["--check-interval", "2147483648"], "Check interval must be a positive"],
])("watcher options %j are refused", (args, refusal) => {
  expect(() => watcherOptions(args)).toThrow(refusal);
});

test("a loopback listener's port reads as occupied until it closes", async () => {
  const listener = createServer();
  await new Promise<void>((resolve) => {
    listener.listen(0, "127.0.0.1", resolve);
  });
  const { port } = listener.address() as AddressInfo;
  expect(await loopbackPortOccupied(port)).toBe(true);
  await new Promise((resolve) => listener.close(resolve));
  expect(await loopbackPortOccupied(port)).toBe(false);
});

test("an occupied named production port is refused rather than moved", () => {
  expect(() => {
    expectUsablePort(4173, true);
  }).toThrow("Port 4173 is already in use.");
});

test("an any-free-port start is never refused for occupancy", () => {
  expect(() => {
    expectUsablePort(0, true);
  }).not.toThrow();
});
