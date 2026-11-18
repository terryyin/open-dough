// A landed-CI boundary case starts its own server on the queued origin, so
// the outer proof (runtime/test-preparation-boundary.spec.ts) observes what
// that custom start prepares.
import { expect, test } from "../../support/landedCiHistoryTest.ts";

test.use({ serverMode: "boundary" });

test("a landed-CI case starts its own boundary server", async ({
  startServer,
}) => {
  const server = await startServer();
  expect(server.serverBundle).toBeDefined();
});
