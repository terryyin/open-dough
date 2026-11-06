// An execution start the native host refuses stays kept in the store and is
// never reported running, over raw HTTP against the real installed start and a
// real bare origin. The page phase journeys: ../agent-launch-start-phases.spec.ts.
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../tests/support/preparationPage.ts";
import {
  keptStarts,
  launch,
  launchRequest,
  runningStarts,
} from "../tests/agentLaunchBoundary.ts";
import { queuedIdentity } from "../tests/support/startOrigin.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

const request = {
  ...launchRequest,
  workflow: "execution",
  identity: queuedIdentity,
  title: "Story A",
};

test("a start kept in the store with no running process is kept, never running", async ({
  dashboard,
  origin,
}) => {
  dashboard.claudeScenario("refused");
  const failed = JSON.parse((await launch(dashboard, request)).body) as {
    kind: string;
  };
  expect(failed.kind).toBe("failed");
  const stored = JSON.parse(
    readFileSync(
      path.join(
        origin.machine,
        "home/.open-dough/dashboard/execution-starts.json",
      ),
      "utf8",
    ),
  ) as Record<string, Record<string, unknown>>;
  expect(Object.keys(stored["open-dough"] ?? {})).toEqual([queuedIdentity]);
  expect(await runningStarts(dashboard)).toEqual([]);
  expect(await keptStarts(dashboard)).toEqual([
    expect.objectContaining({ identity: queuedIdentity }),
  ]);
});
