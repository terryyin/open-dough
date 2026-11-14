// Arrival is a release boundary: a real native gate must already observe
// its hold file when the caller receives either kind of arrival.
import { rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "../../tests/support/pageTest.ts";
import {
  buildGateChanges,
  holdBuildPath,
  holdCompletedBuildPath,
  waitForBuild,
  waitForCompletedBuild,
} from "../../tests/support/productionBuildGate.ts";
import { localPublishedMainFixture } from "../../tests/support/publishedMainFixture.ts";
import { processRunning } from "../../tests/support/processGroup.ts";
import { startProductionWatcher } from "../../tests/support/productionWatcher.ts";

for (const mode of ["starting", "completed"] as const) {
  test(`the native ${mode} gate accepts release immediately after arrival`, async () => {
    const fixture = await localPublishedMainFixture();
    let command: ReturnType<typeof startProductionWatcher> | undefined;
    try {
      // These exact commands are the contract being exercised, not an app
      // or a prebuilt deployment standing in for a watcher journey.
      await fixture.commit(
        {
          "package.json": JSON.stringify({
            scripts: {
              "build:dashboard": "node --eval ''",
              "watch:dashboard": `node build-gate.mjs${mode === "completed" ? " completed" : ""}`,
            },
          }),
        },
        "Native build gate command",
      );
      await fixture.commit(
        await buildGateChanges(fixture.development, fixture.home),
        "Published build gate",
      );
      const hold =
        mode === "starting"
          ? holdBuildPath(fixture.home, 1)
          : holdCompletedBuildPath(fixture.home);
      await writeFile(hold, "");
      command = startProductionWatcher(fixture.development, fixture.env);
      let exited = false;
      void command.exited.then(() => {
        exited = true;
      });
      const arrival =
        mode === "starting"
          ? await waitForBuild(command, fixture.home, 1)
          : await waitForCompletedBuild(command, fixture.home);
      expect(exited).toBe(false);
      await rm(hold);
      expect((await command.exited).code).toBe(0);
      const checkout = path.basename(fixture.development);
      if (typeof arrival === "string") expect(arrival).toBe(checkout);
      else {
        expect(arrival.checkout).toBe(checkout);
        expect(arrival.pid).toBeGreaterThan(0);
        expect(processRunning(arrival.pid)).toBe(false);
      }
    } finally {
      await command?.stop();
      await fixture.cleanup();
    }
  });
}
