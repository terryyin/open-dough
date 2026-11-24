// Concurrent Review changes opens for one project share one fetch into its
// Review repository.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import {
  getReview as get,
  completedReviewQuery as completed,
} from "../../test-support/support/completedReviewRequests.ts";
import { ordinaryTrunkModeCompletedHistory } from "../../test-support/support/completedStoryHistory.ts";
import { startDashboardServer } from "../../test-support/support/dashboardServer.ts";
import { fixtureReviewRepository } from "../../test-support/support/reviewRepositoryFixture.ts";
import { storyReviewEndpoint } from "../../src/storyReviewContract.ts";

test.use({
  serverMode: "boundary",
  originRepository: ordinaryTrunkModeCompletedHistory(),
});

// Records the physical directory of every `git fetch` before running Git;
// callers name directories physically too.
function fetchRecordingGit(machine: string) {
  const bin = path.join(machine, "fetch-recording-bin");
  const log = path.join(machine, "fetches.log");
  const git = execFileSync("sh", ["-c", "command -v git"], {
    encoding: "utf8",
  }).trim();
  mkdirSync(bin, { recursive: true });
  writeFileSync(
    path.join(bin, "git"),
    `#!/bin/sh\ncase " $* " in *" fetch "*) pwd -P >> '${log}';; esac\nexec '${git}' "$@"\n`,
    { mode: 0o755 },
  );
  return {
    bin,
    fetchesIn: (directory: string) =>
      readFileSync(log, "utf8")
        .split("\n")
        .filter((line) => line === directory).length,
  };
}

test("two concurrent opens of a Done story's review share one fetch", async ({
  request,
  dashboard,
  origin,
}) => {
  await dashboard.close();
  const recording = fetchRecordingGit(origin.machine);
  const server = await startDashboardServer({
    mode: "boundary",
    liveServer: "separate process",
    machine: origin.machine,
    projectFolders: ["open-dough"],
    pathPrefix: [recording.bin],
  });
  try {
    const reviews = await Promise.all([
      get(request, server, storyReviewEndpoint, completed),
      get(request, server, storyReviewEndpoint, completed),
    ]);
    for (const review of reviews)
      expect(await review.json()).toMatchObject({ kind: "published" });
    expect(
      recording.fetchesIn(
        fixtureReviewRepository(realpathSync(origin.machine)),
      ),
    ).toBe(1);
  } finally {
    await server.close();
  }
});
