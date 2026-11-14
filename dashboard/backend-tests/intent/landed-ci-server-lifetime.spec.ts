// A case owns a boundary server from the moment it asks it to start, even
// when the case ends before startup resolves. Fixture teardown closes that
// server before its origin is removed.
import {
  expect,
  queuedClaudeBoundaryTest as test,
} from "../../tests/support/landedCiHistoryTest.ts";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
import { processRunning } from "../../tests/support/processGroup.ts";

test.use({ serverMode: "boundary" });

let started: Promise<
  { readonly server: DashboardServer } | { readonly error: unknown }
>;

test("a boundary server start stays owned when its case ends before startup resolves", ({
  startServer,
}) => {
  started = startServer().then(
    (server) => ({ server }),
    (error: unknown) => ({ error }),
  );
});

test.afterAll(async () => {
  const result = await started;
  expect(result, "startup finishes before origin cleanup").toHaveProperty(
    "server",
  );
  if ("server" in result) {
    try {
      expect(
        { pid: result.server.pid, running: processRunning(result.server.pid) },
        "the late server exited before fixture teardown finished",
      ).toMatchObject({ running: false });
    } finally {
      await result.server.close();
    }
  }
});
