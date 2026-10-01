// Both hosts traverse real installed start, publication and native launch phases.
import { expect, test } from "./support/preparationPage.ts";
import { expectStartProgress } from "./support/startProgressPage.ts";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  keptStarts,
  launch,
  launchRequest,
  runningStarts,
} from "./agentLaunchBoundary.ts";
import { queuedIdentity } from "./support/startOrigin.ts";

const request = {
  ...launchRequest,
  workflow: "execution",
  identity: queuedIdentity,
  title: "Story A",
};

for (const host of ["claude", "codex"] as const) {
  test.describe(host, () => {
    test.use({ preparationHost: host });
    test("initiating and observing pages show the actual host throughout execution progress", async ({
      page,
      dashboard,
      origin,
      codexProtocol,
    }) => {
      await expectStartProgress(
        { page, dashboard, origin, codexProtocol },
        "execution",
        host,
      );
    });
  });
}

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
