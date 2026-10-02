// A result-store failure is beyond the page's control: the real installed
// script publishes, then a bare-origin hook denies machine-directory writes.
// Shared started() must preserve its result, including after its wait expires.
import { chmodSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { started } from "../server/launchStart.ts";
import { StartProgress } from "../server/startProgress.ts";
import { keptStart } from "../server/startStore.ts";
import { productionSeedProjects } from "../server/projectConfigurationSeed.ts";
const defaultSource = productionSeedProjects[0];
if (defaultSource === undefined)
  throw new Error("The test requires the seeded first project.");
import {
  queuedIdentity,
  queuedTitle,
  startOrigin,
} from "./support/startOrigin.ts";

for (const expired of [false, true]) {
  test(`post-publication recording failure preserves preparation (${expired ? "expired wait" : "ordinary wait"})`, async () => {
    const origin = await startOrigin(
      "terryyin/open-dough",
      "open-dough",
      "codex",
    );
    const previousHome = process.env["HOME"];
    const previousWait = process.env["DOUGH_START_TIMEOUT_MS"];
    process.env["HOME"] = path.join(origin.machine, "home");
    process.env["DOUGH_START_TIMEOUT_MS"] = expired ? "1" : "60000";
    const directory = path.join(origin.machine, "home/.open-dough/dashboard");
    const hook = path.join(origin.origin, "hooks", "post-receive");
    writeFileSync(hook, `#!/bin/sh\nsleep 0.2\nchmod 0555 '${directory}'\n`);
    chmodSync(hook, 0o755);
    const unhandled: unknown[] = [];
    const rejected = (reason: unknown) => {
      unhandled.push(reason);
    };
    process.on("unhandledRejection", rejected);
    const request = {
      source: defaultSource.id,
      identity: queuedIdentity,
      title: queuedTitle,
      workflow: "refinement" as const,
      host: "codex" as const,
    };
    const project = { path: origin.project, shown: "~/git/open-dough" };
    const progress = new StartProgress();
    try {
      const outcome = await started(defaultSource, request, project, progress);
      if (expired) {
        expect(outcome).toMatchObject({
          kind: "stopped",
          result: { kind: "uncertain", reason: "timed-out" },
        });
        await expect
          .poll(() => progress.all(), { timeout: 20_000 })
          .toEqual([]);
      } else {
        expect(outcome).toMatchObject({ kind: "established" });
        if (outcome.kind !== "established")
          throw new Error("Published handoff missing.");
        expect(outcome.handoff.established).toMatchObject({
          preparation: { identity: queuedIdentity },
        });
        expect(outcome.handoff.formatted).toContain("Established preparation:");
        progress.for("refinement").clear(defaultSource.id, queuedIdentity);
      }
      expect(statSync(directory).mode & 0o777).toBe(0o555);
      const retained = await keptStart(
        defaultSource.id,
        queuedIdentity,
        "refinement",
      );
      expect(retained).toMatchObject({
        host: "codex",
        workspace: path.join(
          origin.project,
          ".worktrees",
          "prepare-the-queued-start",
        ),
        branch: "codex/prepare-the-queued-start",
      });
      // The write-ahead record remains readable, but the post-publication
      // result could not be written. Origin and the returned handoff still win.
      expect(retained?.preparation).toBeUndefined();
      expect(
        readFileSync(path.join(directory, "refinement-starts.json"), "utf8"),
      ).not.toContain('"preparation"');
      const published = (await origin.originGit("rev-parse", "main")).trim();
      const profiles = await origin.takenProfiles();
      expect(profiles).toHaveLength(1);
      expect(profiles[0]).toMatchObject({
        activity: "preparation",
        host: "codex",
        identity: queuedIdentity,
      });
      if (outcome.kind === "established") {
        expect(outcome.handoff.established).toMatchObject({
          preparation: { publishedSha: published },
        });
        expect(outcome.handoff.formatted).toContain(
          `- publishedSha: ${published}`,
        );
      }
      await new Promise<void>((resolve) => setImmediate(resolve));
      expect(unhandled).toEqual([]);
      chmodSync(directory, 0o755);
      chmodSync(hook, 0o644);
      process.env["DOUGH_START_TIMEOUT_MS"] = "60000";
      const resumed = await started(defaultSource, request, project, progress);
      expect(resumed).toMatchObject({ kind: "established" });
      expect(await origin.takenProfiles()).toEqual(profiles);
      expect((await origin.originGit("rev-parse", "main")).trim()).toBe(
        published,
      );
    } finally {
      process.removeListener("unhandledRejection", rejected);
      try {
        chmodSync(directory, 0o755);
      } catch {
        /* No store yet on an early failure. */
      }
      if (previousHome === undefined) delete process.env["HOME"];
      else process.env["HOME"] = previousHome;
      if (previousWait === undefined)
        delete process.env["DOUGH_START_TIMEOUT_MS"];
      else process.env["DOUGH_START_TIMEOUT_MS"] = previousWait;
      origin.cleanup();
    }
  });
}
