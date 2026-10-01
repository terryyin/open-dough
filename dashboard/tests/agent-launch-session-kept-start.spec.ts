// A kept one-shot start is continued as it was, over raw HTTP against the
// project's real installed start and a real bare origin, with the synthetic
// `claude` boundary: a later Start, whatever it asks, goes on with the kept
// start's own policy and workspace rather than changing or duplicating it.

import { execFileSync } from "node:child_process";
import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { keptStarts, launch, recordsOf } from "./agentLaunchBoundary.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import {
  oneShot,
  originState,
  requestFor,
  slug,
  startPreview,
} from "./support/oneShotLaunch.ts";
import {
  queuedIdentity,
  startOrigin,
  type StartOrigin,
} from "./support/startOrigin.ts";

test.describe("a kept one-shot start", () => {
  let origin: StartOrigin;
  let server: DashboardServer;

  test.beforeEach(async () => {
    origin = await startOrigin();
    server = await startPreview(origin);
  });

  test.afterEach(async () => {
    await server.close();
    origin.cleanup();
  });

  for (const workflow of ["execution", "refinement"] as const) {
    test(`${workflow}: is continued with its own policy and workspace, not changed or duplicated`, async () => {
      const before = await originState(origin);
      const policy = oneShot("isolated", "review");
      server.claudeScenario("refused");
      const refused = JSON.parse(
        (await launch(server, requestFor(workflow, policy))).body,
      ) as { kind: string; explanation: string };
      expect(refused.kind).toBe("failed");
      expect(refused.explanation).toContain(
        "No session started; nothing was published.",
      );
      expect(refused.explanation).not.toMatch(/Taken|Preparing/);
      expect(await keptStarts(server)).toEqual([
        {
          workflow,
          host: "claude",
          source: "open-dough",
          identity: queuedIdentity,
          workspace: `~/git/open-dough/.worktrees/${slug}`,
          policy,
        },
      ]);
      const startsFile = path.join(
        server.home,
        `.open-dough/dashboard/${workflow}-starts.json`,
      );
      const keptRecord = (
        JSON.parse(readFileSync(startsFile, "utf8")) as Record<
          string,
          Record<string, Record<string, unknown>>
        >
      )["open-dough"]?.[queuedIdentity];
      expect(keptRecord?.["policy"]).toEqual(policy);
      const established =
        keptRecord?.[workflow === "execution" ? "start" : "preparation"];
      expect(established).toMatchObject({ tracking: "one-shot" });

      // A later Start asking for standard tracking continues the kept
      // one-shot start as it was: no Take, no second workspace.
      server.claudeScenario("launched");
      const response = await launch(server, requestFor(workflow));
      expect(JSON.parse(response.body), response.body).toMatchObject({
        kind: "launched",
      });
      const calls = server.claudeLaunchCalls();
      const last = calls.at(-1);
      expect(last?.cwd).toBe(
        realpathSync(path.join(origin.project, ".worktrees", slug)),
      );
      expect(last?.argv.at(-1)).toContain("- tracking: one-shot");
      expect(await originState(origin)).toEqual(before);
      // One owned worktree beside the default checkout, as before.
      const worktrees = execFileSync(
        "git",
        ["-C", origin.project, "worktree", "list", "--porcelain"],
        { encoding: "utf8" },
      )
        .split("\n")
        .filter((line) => line.startsWith("worktree "));
      expect(worktrees).toHaveLength(2);
      const [record] = (await recordsOf(server, "open-dough")) as Record<
        string,
        unknown
      >[];
      expect(
        (record?.["request"] as Record<string, unknown>)["policy"],
      ).toEqual(policy);
      expect(
        record?.[workflow === "execution" ? "start" : "preparation"],
      ).toEqual(established);
      expect(await keptStarts(server)).toEqual([]);
    });
  }
});
