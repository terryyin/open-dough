// A retained host not configured at startup is restored only when re-added.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../../dashboard/tests/support/pageTest.ts";
import { projectAddMachine } from "../../dashboard/tests/support/projectAddMachine.ts";
import { addProjectOnPage } from "../../dashboard/tests/support/projectAddPage.ts";
import { installFakeCodex } from "../../dashboard/tests/support/fakeCodex.ts";
import {
  observationRecord,
  observed,
  passive,
  daemonStarts,
} from "../../dashboard/tests/support/codexObservation.ts";
import { machineHome } from "../../dashboard/tests/machineLaunchRecords.ts";
import {
  keepLaunchStore,
  launchStoreFile,
} from "../../dashboard/tests/support/launchStore.ts";
import { machineSessions } from "../../dashboard/tests/agentLaunchBoundary.ts";
import { reloadUntilRead } from "../../dashboard/tests/pageRequestNotes.ts";

test("adding an initially unconfigured retained Codex project prepares its passive service once without starting a conversation", async ({
  page,
}) => {
  const fixture = projectAddMachine();
  const native = await installFakeCodex(
    fixture.machine,
    process.env["PATH"] ?? "",
    "on-start",
  );
  try {
    const home = path.join(fixture.machine, "home");
    const record = observationRecord({ home }, native, "retained-sample", {
      source: "sample-app",
      workspace: fixture.checkout,
    });
    keepLaunchStore(machineHome(fixture.machine), { "sample-app": [record] });
    const bytes = readFileSync(
      launchStoreFile(machineHome(fixture.machine)),
      "utf8",
    );
    observed(native, "retained-sample", { type: "notLoaded" }, "completed");
    const server = await fixture.start("preview", undefined, native);
    await page.goto(server.baseURL);
    expect(await machineSessions(server)).toEqual([]);
    expect(existsSync(native.env["FAKE_CODEX_DAEMON_LOG"] ?? "")).toBe(false);
    await addProjectOnPage(page);
    const recent = page.getByRole("region", { name: "Taken", exact: true });
    await expect(recent).toContainText("Ready for review", { timeout: 5_000 });
    await expect(recent).toContainText("retained-sample");
    expect((await machineSessions(server))[0]).toMatchObject({
      sessionState: {
        kind: "available",
        availability: "retained",
        activity: "review",
      },
    });
    await page.getByRole("button", { name: "Sessions", exact: true }).click();
    await expect(
      page.getByRole("complementary", {
        name: "Sessions sidebar",
        exact: true,
      }),
    ).toContainText("Ready for review");
    await expect(page).toHaveURL(/project=sample-app/);
    await reloadUntilRead(page);
    await expect(recent).toContainText("Ready for review", { timeout: 5_000 });
    expect(daemonStarts(native)).toHaveLength(1);
    passive(native.calls);
    expect(
      readFileSync(launchStoreFile(machineHome(fixture.machine)), "utf8"),
    ).toBe(bytes);
  } finally {
    await fixture.close();
    await native.close();
  }
});
