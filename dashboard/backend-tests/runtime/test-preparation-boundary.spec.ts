// What a server start requests from the run's shared artifacts. A landed-CI
// case's custom boundary start (../../test-support/support/landedCiHistoryTest.ts)
// waits for its worker's boundary inputs and starts an unmounted boundary
// server.
import { expect, test } from "vitest";
import { servedArtifacts } from "../../test-support/support/dashboardServerOptions.ts";
import { serverBundleArtifactKey } from "../../test-support/support/serverBundle.ts";
import { serverInputKeys } from "../../test-support/support/serverInputWorkerFixtures.ts";

test("a custom boundary start has its bundle prepared and requests no app", async () => {
  expect(await serverInputKeys([], "boundary")).toEqual([
    serverBundleArtifactKey,
  ]);
  expect(servedArtifacts("boundary", false)).toEqual({
    app: false,
    bundle: true,
  });
});
